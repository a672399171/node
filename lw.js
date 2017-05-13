const axios = require('axios'), // axios
	cheerio = require('cheerio'), // cheerio
	utils = require('./utils.js'), // utils
	data = require('./data.js'), // data
	async = require('async'), // async
	log4js = require('log4js'), // log4js
	config = require('./config.js'), // config
	dao = require('./dao.js'); // dao

// log config
log4js.configure({
	appenders: [
		{type: 'file', filename: 'app.log', category: 'app'},
		{type: 'stdout', category: 'out'}
	]
});
const logger = log4js.getLogger('out');
logger.setLevel('DEBUG');

const domain = 'http://d.wanfangdata.com.cn';

const itemQueue = async.queue(function (task, callback) {
	var item = task.item;
	callback(item);
	// 生成md5防重
	item.md5 = utils.md5(item.articleTitle);
	getBody(domain + '/CiteRelation/Ref?id=' + item.articleId, item);
}, config.itemConcurrency);

// 创建一个任务队列
const pageQueue = async.queue(function (task, callback) {
	data.getData(config.keyword, function (pageSize, totalPage, arr, err) {
		callback(task);

		if (err) {
			if (err.message.indexOf('timeout') > -1) {
				logger.error(err.config.url + ' timeout:' + err.config.timeout);
			} else {
				logger.error('error:' + err.error);
			}
		} else {
			// logger.debug('pageSize:' + pageSize + ',totalPage:' + totalPage);
			arr.forEach(function (e) {
				itemQueue.push({item: e}, function (task, err) {
				});
			});
		}
	}, task.page);
}, config.pageConcurrency);

// 获取网页内容
function getBody(url, o) {
	axios.get(url, {timeout: config.timeout})
		.then(function (res) {
			var obj = parseHtml(res.data);
			if (obj.strArr.length > 0) {
				o.text = obj.strArr;
				logger.info(o);
				// dao.insert(o);
			}
			// 有分页
			var index = url.indexOf('&page=');
			if (!isNaN(obj.totalPage) && index < 0) {
				for (var page = 2; page <= obj.totalPage; page++) {
					getBody(url + '&page=' + page, o);
				}
			}
		})
		.catch(function (error) {
			if (error.message.indexOf('timeout') > -1) {
				logger.error(error.config.url + ' timeout:' + error.config.timeout);
			}
		});
}

// 解析html
function parseHtml(html) {
	var $ = cheerio.load(html);
	var totalPage = parseInt(utils.getTotalPage($('.pager .current').text()));
	var arr = $('.paper-list .item');
	var strArr = [];

	// logger.debug('url:' + url + ',length:' + arr.length + ',pageSize:' + totalPage);
	arr.each(function (i, item) {
		var childrens = item.children;
		if (childrens && childrens.length > 0) {
			childrens.forEach(function (e) {
				if (e.type === 'text' && utils.isEBOL(e.data)) {
					strArr.push(getText(childrens));
				}
			});
		}
	});

	return {
		totalPage: totalPage,
		strArr: strArr
	};
}

function getText(childrens) {
	var returnStr = '';
	for (var i = 0; i < childrens.length; i++) {
		if (childrens[i].type === 'tag' && childrens[i].name === 'a') {
			childrens[i].children.forEach(function (e) {
				if (e.type === 'text') {
					returnStr += e.data;
				}
			});
		}
	}
	return returnStr;
}

// 开始
function start() {
	if (config.keyword.length > 0) {
		logger.info('keyword:' + config.keyword);
		if (config.pageConcurrency < 1 || config.pageConcurrency > 10) {
			throw new Error('pageConcurrency should >=1 and <=10!');
		} else if (config.itemConcurrency < 1 || config.itemConcurrency > 10) {
			throw new Error('itemConcurrency should >=1 and <=10!');
		} else if (config.startPage < 1) {
			throw new Error('startPage should >=1!');
		} else if (config.pageCount < 1) {
			throw new Error('pageCount should >=1!');
		} else if (config.timeout < 0) {
			throw new Error('timeout should >0!');
		}
	} else {
		throw new Error('keyword is null!');
	}

	// 添加任务队列
	for (var i = 0; i < config.pageCount; i++) {
		pageQueue.push({page: config.startPage + i}, function (task, err) {
			logger.info('finish page:' + task.page);
		});
	}
}

/********************** start *****************************/

try {
	var t = process.uptime();
	start();
	process.on('exit', function (code) {
		if (code === 0) {
			logger.debug('run time:' + (process.uptime() - t).toFixed(2) + 's.');
		} else {
			logger.error('error exit code:' + code);
		}
	});
} catch (e) {
	logger.error(e.message);
}

// getBody(domain + '/CiteRelation/Ref?id=jsjyy200509001', {articleTitle: 'articleTitle'});
