const readFileLine = require('./readFileLine');
const async = require('async');
const request = require('request');

/*readFileLine.listFile('db', function (err, files) {
    if (err) {
        console.error(err);
    } else {
        console.log(files);
    }
});*/

(function () {
    start();

    // 任务具体执行内容
    const handler = function (task, callback) {
        var orderId = task.orderId;
        // resetTask(orderId, callback);

        setTimeout(function () {
            console.log(queue.length());
            callback();
        }, 1);
    };

    // 添加到任务队列
    const pushItem = function (line) {
        if (queue.length() > 2000) {
            setTimeout(function () {
                pushItem(line);
            }, 1000)
        } else {
            queue.push({orderId: line}, function (err) {
                if (err) {
                    console.error(err);
                }
            });
        }
    };
    // 初始化队列
    const queue = initQueue(handler, 2);

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
        console.log('all items have been processed');
    };

    return q;
}

// 二清 - 重置任务
function resetTask(orderId, callback) {
    var url = 'http://fm-bill.jd.com/service/accountTools/resetTask';

    // 发送单参数且application/json的实践
    request({
        url: url,
        method: 'POST',
        json: true,
        body: {
            orderId: orderId,
            mode: 0
        }
        // headers: {
        //     'Content-Type': 'application/json;charset=UTF-8'
        // }
        // proxy
        // proxy: 'http://127.0.0.1:8888'
    }, function (err, res, body) {
        console.log(orderId + '_' + body);
        callback();
    })
}

// 查询台账
function getOrderBank(orderId, callback) {
    var url = 'http://orderbank.soa.jd.local/service/orderQuery/getOrderBank';

    request({
        url: url,
        method: 'POST',
        json: true,
        body: {
            orderId: orderId,
            appId: 'appId',
            appToken: '123456'
        }
    }, function (err, res, body) {
        var orderBank = body;
        if (orderBank && orderBank.result && orderBank.result.isSuccess) {
            if (orderBank.orderBankStatus === 5 && orderBank.paidIn > 0) {
                // console.log(orderId);
            }
        } else {
            console.error(orderId);
        }
        callback();
    })
}