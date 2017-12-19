const async = require('async');
const request = require('request');
const fs = require('fs');

const url = "http://dbquery.jd.com/home/ajaxQueryData";
// 0, 1, 2, 3, 4, 5, 6, 7, 8, 9
const tableIndexArr = [0, 1, 2, 3];
// 29351, 29352, 29353, 29354, 29355, 29356, 29357, 29358, 29359, 29360, 29361, 29362, 29363, 29364, 29365, 29366, 29367, 29368, 29369, 29370, 29371, 29372, 29373, 29374
var idArr = [29351, 29352, 29353, 29354, 29355, 29356, 29357, 29358, 29359, 29360, 29361, 29362, 29363, 29364, 29365, 29366, 29367, 29368, 29369, 29370, 29371, 29372, 29373, 29374];
var dbCount = [];

var q = async.queue(function (task, callback) {
    task.count = 0;
    task.orderIds = [];
    query(task, '', ' order by id', callback);
}, 2);

// assign a callback
q.drain = function () {
    console.log('all items have been processed');
    console.log(dbCount);
};

idArr.forEach(function (db, i) {
    var tableCountArr = [];
    dbCount[i] = tableCountArr;
    tableIndexArr.forEach(function (table) {
        q.push({dbIndex: i, tableIndex: table}, function (err, task) {
            if (err) {
                console.error(err);
            } else {
                tableCountArr[table] = task.count;
                if(task.orderIds && task.orderIds.length > 0) {
                    // fs.appendFileSync('db/' + task.dbIndex + '_' + task.tableIndex, task.orderIds.join('\r\n'));
                }
            }
        });
    });
});

// 查询sql
function query(task, sqlAfter, sqlOrder, callback) {
    var id = idArr[task.dbIndex], sql = getBaseSql(task.tableIndex);

    request({
        url: url,
        method: 'POST',
        json: true,
        form: {id: id, sql: sql + sqlAfter + sqlOrder},
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Cookie': 'PHPSESSID=uaav1a6n45c23fdlpdv2q8qlp5; erp1.jd.com=418B6CC9DD4DD582CB928438B817886211FD2E6C26F91E65C660EEDF3DC628A079F6329AE9F54F9976835779E85BA6C178415C22A809AE7F894E78F89EBDE081B2D794FEB55E0C511771BEE65D19AA43; sso.jd.com=235d4fc9b79b477796f39e4e4cf3b46c; 3AB9D23F7A4B3C9B=772EXKGCRAYV4VL2AIJLNMHI274HHZBYBY6OEE43TD5WVZSHWPH62PG6KIO6ALDNA2WCUQMW6HAC3ZWIQQO7LA6XQY'
        }
        // proxy
        // proxy: 'http://127.0.0.1:8888'
    }, function (err, res, body) {
        try {
            var maxId = -1;
            task.count += body.total;
            body.rows.forEach(function (e) {
                maxId = e.id > maxId ? e.id : maxId;
                task.orderIds.push(e.orderid);
            });
            if (body.total >= 100) {
                query(task, ' and id>' + maxId, sqlOrder, callback);
            } else {
                callback(null, task);
            }
        } catch (e) {
            console.error(e);
            callback(null, task);
        }
    })
}

function getBaseSql(index) {
    if (tableIndexArr.indexOf(index) < 0) {
        throw "index not found";
    }
    return "select id,orderid from billtask_" + index + " where status=3";
}