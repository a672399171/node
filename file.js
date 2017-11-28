var request = require('request'), // http
	fs = require('fs');

var arr = getFileContent('orderId');
console.log(arr.length);
arr.forEach(function (orderId) {
	// getOrderBank(orderId);
});
// getOrderBank('60268848185');
// fs.appendFileSync('collect', 'dawd,');


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

function getOrderBank(orderId) {
	var url = 'http://orderbank.soa.jd.local/service/orderQuery/getOrderBank';

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
		if (orderBank && orderBank.result && orderBank.result.isSuccess) {
			if(orderBank.orderBankStatus === 5) {
                console.log(orderId);
                fs.appendFileSync('cancel', orderId + '\r\n');
			}
		} else {
			console.error(orderId);
		}
	})
}
