const readFileLine = require('./readFileLine');
const async = require('async');
const request = require('request');
const business = require('./business');

/*readFileLine.listFile('db', function (err, files) {
    if (err) {
        console.error(err);
    } else {
        console.log(files);
    }
});*/

var finished = 0;
(function () {
    start();

    // 任务具体执行内容
    const handler = function (task, callback) {
        var orderId = task.orderId;
        business.searchBillDetail(orderId, "sso.jd.com=e361ecd291be428a8a8990ed0b06943e", searchBillDetailCallback, callback);
    };

    // 添加到任务队列
    const pushItem = function (line) {
        if (queue.length() > 2000) {
            setTimeout(function () {
                pushItem(line);
            }, 1000);
        } else {
            queue.push({orderId: line}, function (err) {
                if (err) {
                    console.error(err);
                }
                finished++;
                if (finished % 100 === 0) {
                    console.log('============== finished:' + finished + ' ==============');
                }
            });
        }
    };
    // 初始化队列
    const queue = initQueue(handler, 5);

    const fileArr = ['orderId'];
    fileArr.forEach(function (file) {
        // orderId
        readFileLine.readLine(file, function (line) {
            pushItem(line);
        });
    });
})();

// 统计程序运行时间
function start() {
    console.time("test");
    process.on('exit', function () {
        console.timeEnd("test");
    });
}

function initQueue(handler, count) {
    var q = async.queue(handler, count && count > 0 ? count : 1);

    // assign a callback
    q.drain = function () {
        console.log('处理完毕');
    };

    return q;
}

// 台账 - 查询实收明细 - 处理结果
function findAllPayDetailCallback(err, res, body, orderId) {
    if (body && body.result && body.result.isSuccess) {
        if (body.payDetails && body.payDetails.length > 0) {
            for (var i = 0; i < body.payDetails.length; i++) {
                if (body.payDetails[i].systemNo === 4) {
                    readFileLine.appendFile('jb.txt', orderId + '\n');
                    break;
                }
            }
        }
    } else {
        console.error(orderId);
    }
}

// 台账 - 对账 - 回调
function orderConfirmCallback(err, res, body, orderId) {
    if (body && body.result && body.result.isSuccess) {
        // console.log(orderId, body);
    } else {
        console.error(orderId);
    }
}

// 二清 - 重置任务 - 回调
function resetTaskCallback(err, res, body, orderId) {
    console.log(orderId + '_' + body);
}

// 查询台账 - 回调
function getOrderBankCallback(err, res, body, orderId) {
    var orderBank = body;
    if (orderBank && orderBank.result && orderBank.result.isSuccess) {
        if (orderBank.confirmStatus !== 3) {
            readFileLine.appendFile('jb.txt', orderId + '\n');
            // console.log(orderId);
        }
    } else {
        console.error(orderId);
    }
}

// erp查询 - 回调
function searchOrderBankDetailCallback(err, res, body, orderId) {
    if (body && body.result && body.result.isSuccess) {
        for (var i = 0; i < body.dueDetaiList.length; i++) {
            if (body.dueDetaiList[i].receivableType === 6) {
                readFileLine.appendFile('jb.txt', orderId + '\n');
            }
        }
    } else {
        console.error(orderId);
    }
}

// 查询分账明细 - 回调
function searchBillDetailCallback(err, res, body, orderId, cookie) {
    if (body && body.isSuccess) {
        for (var i = 0; i < body.list.length; i++) {
            if (body.list[i].status === 3) {
                genTask(orderId, body.list[i].id, cookie);
            }
        }
    } else {
        console.error(orderId);
    }
}

// 生成任务
function genTask(orderId, id, cookie) {
    var url = 'http://billerp.jd.com/genBillTask?id=' + id + '&orderid=' + orderId;

    request({
        url: url,
        method: 'POST',
        json: true,
        headers: {
            "Cookie": cookie,
            'Content-Type': 'application/json;charset=UTF-8'
        }
    }, function (err, res, body) {
        console.log(orderId, body);
    })
}
