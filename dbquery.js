const async = require('async');
const request = require('request');

const url = "http://dbquery.jd.com/home/ajaxQueryData";
const tableIndexArr = [0, 1];
var idArr = [29351, 29352, 29353, 29354, 29355, 29356, 29357, 29358, 29359, 29360, 29361, 29362, 29363, 29364, 29365, 29366, 29367, 29368, 29369, 29370, 29371, 29372, 29373, 29374];
var result = '', dbCount = [];

var q = async.queue(function (task, callback) {
    var initCount = 0;
    query(idArr[task.dbIndex], getBaseSql(task.tableIndex), '', initCount, callback);
}, 1);

// assign a callback
q.drain = function () {
    console.log('all items have been processed');
    console.log(dbCount);
};

idArr.forEach(function (db, i) {
    var tableCountArr = [];
    dbCount[i] = tableCountArr;
    tableIndexArr.forEach(function (table) {
        q.push({dbIndex: i, tableIndex: table}, function (err, total) {
            if (err) {
                console.error(err);
            } else {
                tableCountArr[table] = total;
            }
        });
    });
});

// 查询sql
function query(id, sql, sqlAfter, count, callback) {
    request({
        url: url,
        method: 'POST',
        json: true,
        form: {id: id, sql: sql + sqlAfter},
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Cookie': 'PHPSESSID=pakm0e3ju60v6annndsduki3i6; erp1.jd.com=116678EF4E44612CFB10D4DB3D2761B0020511E668D4AE745CF589E4DB4242251CBF597D0E7D445AF9F4EA2B06B3C35843596D64162C81DF71D3A835A2F6DF2653BBB1A8AA4D2257390F16E832CE39EC; sso.jd.com=9588e37c652e4a56ada8e3c53317c902; 3AB9D23F7A4B3C9B=772EXKGCRAYV4VL2AIJLNMHI274HHZBYBY6OEE43TD5WVZSHWPH62PG6KIO6ALDNA2WCUQMW6HAC3ZWIQQO7LA6XQY'
        }
        // proxy
        // proxy: 'http://127.0.0.1:8888'
    }, function (err, res, body) {
        var maxId = -1;
        count += body.total;
        body.rows.forEach(function (e) {
            maxId = e.id > maxId ? e.id : maxId;
            result += (e.orderid + '\n');
        });
        if (body.total >= 100) {
            query(id, sql, ' and id>' + maxId, callback);
        } else {
            callback(null, count);
        }
    })
}

function getBaseSql(index) {
    if (tableIndexArr.indexOf(index) < 0) {
        throw "index not found";
    }
    return "select id,orderid from billtask_" + index + " where status=3 and updatetime<'2017-12-1 00:00:00'";
}