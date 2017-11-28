var async = require('async');
var request = require('request'), // http
    fs = require('fs');

// 类似于任务队列并发执行worker
var q = async.queue(function(task, callback) {
    var orderId=task.orderId;
    getOrderBank(orderId, callback);
}, 2);

// assign a callback
q.drain = function() {
    console.log('all items have been processed');
};

fs.readFile('../orderId', {
    encoding: 'utf-8'
},function (err, data) {
    console.log(data.length);
});

// var arr = getFileContent('../orderId');
/*arr.forEach(function (orderId) {
    q.push({orderId: orderId}, function(err) {
        if(err) {
            console.error(err);
        }
    });
});*/

// 获取文件内容
function getFileContent(filePath) {
    var returnArr = [];
    var text = fs.readFileSync(filePath, {
        encoding: 'utf-8'
    });
    var arr = text.split('\r\n');
    arr.forEach(function (e, index) {
        if (e.length > 1) {
            if (returnArr.indexOf(e) < 0) {
                returnArr.push(e);
            }
        }
    });
    return returnArr;
}

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
                console.log(orderId);
            }
        } else {
            console.error(orderId);
        }
        callback();
    })
}