const axios = require('axios'), // axios
	cheerio = require('cheerio'), // cheerio
	utils = require('./utils.js'), // utils
	config = require('./config.js'); // config

const domain = 'http://s.wanfangdata.com.cn';

module.exports = {
	getData: function (keyword, handler, page) {
		axios.get(encodeURI(domain + '/Paper.aspx?q=' + keyword + '&f=top&p=' + page), {timeout: config.timeout})
			.then(function (res) {
				parseHtml(res.data, handler);
			})
			.catch(function (error) {
				handler(0, 0, null, error);
			});
	}
};

// 解析html
function parseHtml(html, handler) {
	var $ = cheerio.load(html);
	var pageTotal = parseInt(utils.getTotalPage($('.pager span').text()));
	if (isNaN(pageTotal)) {
		handler && handler(0, 0, null, {error: '无数据'});
		return;
	}
	var arr = $('.left-record .record-title .title');
	var returnArr = [];

	arr.each(function (i, item) {
		var articleTitle = $(this).text();
		var articleUrl = $(this).attr('href');
		var articleId = utils.getArticleId(articleUrl);
		returnArr[i] = {
			articleTitle: articleTitle,
			articleUrl: articleUrl,
			articleId: articleId
		};
	});
	handler && handler(arr.length, pageTotal, returnArr);
}