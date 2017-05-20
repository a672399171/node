const crypto = require('crypto');

module.exports = {
	/**
	 * 返回总页数
	 * @param str
	 * @returns {Array|{index: number, input: string}}
	 */
	getTotalPage: function (str) {
		var matcher = str.match(/^\d+\/(\d+)$/);
		return matcher && matcher[1] ? matcher[1] : matcher;
	},
	/**
	 * 返回articleId
	 * @param str
	 * @returns {string}
	 */
	getArticleId: function (str) {
		var index = str.lastIndexOf('/');
		return str.substring(index + 1, str.length);
	},
	/**
	 * 返回字符串中的url
	 * @param str
	 * @returns {Array|{index: number, input: string}}
	 */
	getURL: function (str) {
		var matcher = str.match(/.*(http[s]{0,1}:\/{2}.*)/);
		return matcher && matcher[1] ? matcher[1] : matcher;
	},
	/**
	 * 返回字符串中的数字
	 * @param str
	 * @returns {Array|{index: number, input: string}}
	 */
	getNum: function (str) {
		var matcher = str.match(/^\d+$/);
		return matcher && matcher[0] ? matcher[0] : matcher;
	},
	/**
	 * 是否含有EB/OL
	 * @param str
	 * @returns {Array|{index: number, input: string}}
	 */
	isEBOL: function (str) {
		return /.*OL].*/.test(str);
	},
	/**
	 * md5
	 * @param str
	 */
	md5: function (str) {
		const hash = crypto.createHash('md5');
		hash.update(str, 'utf8');
		return hash.digest('hex');
	}
};
