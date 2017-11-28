const readFileLine = require('./readFileLine');
const async = require('async');
const request = require('request');

var q = async.queue(function(task, callback) {
    var orderId=task.orderId;
    getOrderBank(orderId, callback);
}, 1);

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