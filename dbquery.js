const async = require('async');
const request = require('request');
const fs = require('fs');

const url = "http://dbquery.jd.com/home/ajaxQueryData";
// 0, 1, 2, 3, 4, 5, 6, 7, 8, 9
const tableIndexArr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
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
                console.log(task.dbIndex, task.tableIndex, 'end');
                if (task.orderIds && task.orderIds.length > 0) {
                    fs.appendFileSync('db/' + task.dbIndex + '_' + task.tableIndex, task.orderIds.join('\r\n'));
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
            'Cookie': 'sso.jd.com=e8b1c416b6f54122b418a8d2c2d772c5'
        }
        // proxy
        // proxy: 'http://127.0.0.1:8888'
    }, function (err, res, body) {
        try {
            if(!body) {
                throw 'body为空';
            }
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
            console.error(sql + sqlAfter + sqlOrder, body, e);
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