var cheerio = require('cheerio'),
	request = require('request'),
	fs = require('fs'),
	async = require('async');

var arr = getFileContent('orderId');
console.log(arr.length);
arr.forEach(function (orderId) {
	getOrderBank(orderId);
});

var q = async.queue(function (obj, cb) {
	jb(obj.orderId, obj.jbNo, obj.amount, cb);
}, 1);

// 获取文件内容
function getFileContent(filePath) {
	var returnArr = [];
	var text = fs.readFileSync(filePath, {
		encoding: 'utf-8'
	});
	var arr = text.split('\r\n');
	arr.forEach(function (e, index) {
		if (e.length > 1) {
			if (returnArr.indexOf(e) < 0) {
				returnArr.push(e);
			}
		}
	});
	return returnArr;
}

function getBizSign(orderId, dueDetails, amount) {
	var url = "http://orderbank.360buy.com/paysettle/ajax_queryDb_queryOrderBizInfo.action?orderId=" + orderId;
	var details = [];
	dueDetails.forEach(function (e) {
		details.push({
			receivableId: e.receivableId,
			amount: e.amount
		});
	});

	request({
		url: url,
		method: 'POST',
		headers: {
			Cookie: "sso.jd.com=8058afc14d9649a89c9ed78d029afdb3"
		}
	}, function (err, res, body) {
		body = JSON.parse(body);
		body = JSON.parse(body);
		if (body.isSuccess) {
			var data = JSON.parse(body.info);
			var uuidArr = [];
			data.forEach(function (e) {
				uuidArr.push(e.uuid);
			});
			details.forEach(function (e) {
				if (uuidArr.indexOf('jb_' + orderId + '_' + e.receivableId) < 0 && Math.abs(amount) >= Math.abs(e.amount)) {
					q.push({orderId: orderId, jbNo: e.receivableId, amount: -e.amount}, function (err) {
						if(err) {
							console.error(err);
						}
					});
				}
			});
		} else {
			console.error(orderId);
		}
	})
}

// form http
function getOrderBank(orderId) {
	var url = 'http://orderbank.soa.jd.local/service/orderbanksearch/getOrderBankDetail';

	request({
		url: url,
		method: 'POST',
		json: true,
		body: {
			orderId: orderId,
			appId: 'appId',
			appToken: '123456'
		}
	}, function (err, res, body) {
		var orderBank = body;
		var dueDetails = [];
		if (orderBank && orderBank.result && orderBank.result.isSuccess) {
			var amount = orderBank.orderBankVo.realPayPrice - orderBank.orderBankVo.realDuePrice;
			if (amount > 0) {
				orderBank.dueDetaiList.forEach(function (e) {
					if (e.receivableType === 6) {
						dueDetails.push(e);
					}
				});
				getBizSign(orderId, dueDetails, amount);
			}
		} else {
			console.error(orderId);
		}
	})
}

function jb(orderId, jbNo, amount, cb) {
	var flag = orderId && jbNo && amount && jbNo.length > 0 && amount > 0;
	if (!flag) {
		console.error('error:' + orderId + jbNo + amount);
		return;
	}
	var url = 'http://orderbank.qsoa.jd.local/service/order/orderConfirm';

	request({
		url: url,
		method: 'POST',
		json: true,
		body: {
			orderId: orderId,
			confirmType: "priceInsurance",
			refundUuid: jbNo,
			jbOrPfPrice: amount
		}
	}, function (err, res, body) {
		if (body && body.result && body.result.isSuccess) {
			console.info('jb_' + orderId + '_' + jbNo + '   ' + amount);
		} else {
			console.error('e:' + orderId + '_' + jbNo + '   ' + amount);
		}
		cb();
	})
}