var request = require('request'), // http
	fs = require('fs'), // fs
	cheerio = require('cheerio');// cheerio

// getFileContent('E:/1.txt');
// var orderIds = getOrderId('D:/orderId.txt');
// var orderId = orderIds[0];
// requestWithCookie(orderId);
// requestWithForm();
// requestWithJson();

var index = 1, l1 = 0;
for (var i = 0; i < 100; i++) {
	l1 = new Date().getTime();
	// getBody('http://localhost/article/page/1?cate=0');
}
console.log(new Date().getTime() - l1);

// 获取网页内容
function getBody(url) {
	request({
		url: url,
		method: 'GET',
		headers: {}
	}, function (error, res, body) {
		if (index === 100) {
			console.log(new Date().getTime() - l1);
		}
		index++;
		// console.log(index++);
	});
}

// 获取文件内容
function getFileContent(filePath) {
	var text = fs.readFileSync(filePath, {
		encoding: 'utf-8'
	});
	var arr = text.split(';\r\n');
	arr.forEach(function (e, index) {
		console.log(index, JSON.parse(e).orderId);
	});
}

// 分行显示
function getOrderId(filePath) {
	var text = fs.readFileSync(filePath, {
		encoding: 'utf-8'
	});

	return text.split('\r\n');
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

// json http
function requestWithJson() {
	var url = 'http://orderbankmjq.jd.local/service/orderQuery/getOrderBank';

	request({
		url: url,
		method: 'POST',
		body: {
			orderId: '50744179200',
			appId: 'carinsTrade',
			appToken: 'a0e47e84281f80a080744f3abfe04318'
		},
		json: true
	}, function (err, res, body) {
		console.log(body.orderId);
	});
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