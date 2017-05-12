var axios = require('axios'), // axios
	cheerio = require('cheerio');// cheerio

// requestWithCookie(orderId);
// requestWithForm();
// requestWithJson();
getBody('http://qibao.gyyx.cn/Buy/GetItemDetail?r=' + Math.random() + '&ItemCode=33439591');
// createOrder('33439591');
// getDate('/Date(1492861170905)/');

// 获取网页内容
function getBody(url) {
	axios.get(url)
		.then(function (res) {
			var data = res.data;
			if (data.IsSuccess) {
				var current = getDate(data.Data.CurrentTime);
				var start = getDate(data.Data.BusinessStartDate);
				console.info(data.Data.CurrentStateName,
					',开始时间:' + new Date(start),
					',当前时间:' + new Date(current)
				);

				// 小于500ms开始
				if (Math.abs(current - start) < 500) {
					// createOrder(data.Data.ItemCode);
				}
				createOrder(data.Data.ItemCode);
			} else {
				console.error(data);
			}
		});
}

// 获取时间
function getDate(s) {
	var result = s.match(/.*\((\d+)\)\//);
	return parseInt(result[1]);
}

// 下单
function createOrder(itemCode) {
	axios({
		method: 'post',
		url: 'http://qibao.gyyx.cn/Buy/PlaceAnOrder',
		data: {
			r: Math.random(),
			operate: 'buy',
			itemId: itemCode
		},
		headers: {
			Cookie: 'Cookie:Hm_lvt_c112d6915349a26b3bbd87424a332a4f=1492863222; Hm_lpvt_c112d6915349a26b3bbd87424a332a4f=1492863607; PageVisitGuid=727106d5-b7fc-408f-9088-1cb93f5c0ccb; GY-Log-ID=IbIRJr-830ed386e7d7a-01c-f2eYvu-2929a; QiBaoCookie=fa3a0d76-49e4-4427-8686-e83b2acc5dd7|W|20|389079553; RecentServerCookie=N3zlj4znur/kuozljLp8MjB85Y2O5bGx6K665YmR GYYX_QRCODE_Qbz_V1=79868075cc5c1f5e0e9d45e; GYYX_CHECKCODE_STAGE_QIBAO=5d1a6d16131f4b169bae75c09e609cb9'
		}
	}).then(function (res) {
		if (res.data.IsSuccess) {
			console.log(res.data);
		} else {
			console.error(res.data.Message);
		}
	});
}

// 携带cookie
function requestWithCookie(orderId) {
	var url = 'http://om.jd.com/ajax_showSplitInfo?roid=0.1822394475479826&orderId=' + orderId;

	request({
		url: url,
		headers: {
			method: 'GET',
			Cookie: 'sso.jd.com=4d4f1614821a4b88becd3069640a4bc1'
		}
	}, function (err, res, body) {
		console.log(body);
		parseHtml(body);
	})
}

// form http
function requestWithForm() {
	var url = 'http://xblog.zzuzl.cn/user/login';

	request({
		url: url,
		method: 'POST',
		form: {
			email: '672399171@qq.com',
			password: 'didiaozuoren132'
		}
	}, function (err, res, body) {
		console.log(body);
	})
}

// 解析html
function parseHtml(html) {
	var $ = cheerio.load(html);
	var arr = $('font');
	$('font').each(function (i, item) {
		// console.log($(this));
		if ($(this).text().indexOf('子') > -1) {
			console.log($(this).next('a').text());
		}
	});
}