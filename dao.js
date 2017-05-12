const mysql = require('mysql');
const pool = mysql.createPool({
	connectionLimit: 1000,
	connectTimeout: 1000,
	aquireTimeout: 1000,
	timeout: 1000,
	host: '139.129.10.226',
	user: 'admin',
	password: 'admin',
	insecureAuth: true,
	database: 'spider'
});

module.exports = {
	insert: function (obj) {
		pool.getConnection(function (err, connection) {
			if (err) {
				throw err;
			} else {
				connection.query('insert into item(id, articleId ,articleUrl, articleTitle, md5) values(null,?,?,?,?) on duplicate key update articleId=values(articleId),articleTitle=values(articleTitle),articleUrl=values(articleUrl)',
					[obj.articleId, obj.articleUrl, obj.articleTitle, obj.md5], function (error, results, fields) {
						connection.release();

						if (error) throw error;
					});
			}
		});
	}
};
