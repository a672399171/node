const readFileLine = require('./readFileLine');
const async = require('async');
const request = require('request');

var q = async.queue(function(task, callback) {
    var orderId = task.orderId;
    resetTask(orderId, callback);
}, 3);

// assign a callback
q.drain = function() {
    console.log('all items have been processed');
};

readFileLine.readLine('orderId', function (line) {
    q.push({orderId: line}, function(err) {
        if(err) {
            console.error(err);
        }
    });
});

// 二清 - 重置任务
function resetTask(orderId, callback) {
    var url = 'http://fm-bill.jd.com/service/accountTools/resetTask';

    // 发送单参数且application/json的实践
    request({
        url: url,
        method: 'POST',
        body: orderId,
        headers: {
            'Content-Type':'application/json;charset=UTF-8'
        },
        // proxy
        proxy: 'http://127.0.0.1:8888'
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
            if(orderBank.orderBankStatus === 5 && orderBank.paidIn > 0) {
                // console.log(orderId);
            }
        } else {
            console.error(orderId);
        }
        callback();
    })
}