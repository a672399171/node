const readFileLine = require('./readFileLine');
const async = require('async');
const request = require('request');
const fileArr = [
    'db/0_0',
    'db/0_1',
    'db/0_2',
    'db/0_3',
    'db/0_4',
    'db/1_0',
    'db/1_1',
    'db/1_2',
    'db/1_3',
    'db/1_4',
    'db/2_0',
    'db/2_1',
    'db/2_2',
    'db/2_3',
    'db/2_4',
    'db/3_0',
    'db/3_1',
    'db/3_2',
    'db/3_3',
    'db/3_4',
    'db/4_0',
    'db/4_1',
    'db/4_2',
    'db/4_3',
    'db/4_4',
    'db/5_0',
    'db/5_1',
    'db/5_2',
    'db/5_3',
    'db/5_4',
    'db/6_0',
    'db/6_1',
    'db/6_2',
    'db/6_3',
    'db/6_4',
    'db/7_0',
    'db/7_1',
    'db/7_2',
    'db/7_3',
    'db/7_4',
    'db/8_0',
    'db/8_1',
    'db/8_2',
    'db/8_3',
    'db/8_4',
    'db/9_0',
    'db/9_1',
    'db/9_2',
    'db/9_3',
    'db/9_4',
    'db/10_0',
    'db/10_1',
    'db/10_2',
    'db/10_3',
    'db/10_4',
    'db/11_0',
    'db/11_1',
    'db/11_2',
    'db/11_3',
    'db/11_4',
    'db/12_0',
    'db/12_1',
    'db/12_2',
    'db/12_3',
    'db/12_4',
    'db/13_0',
    'db/13_1',
    'db/13_2',
    'db/13_3',
    'db/13_4',
    'db/14_0',
    'db/14_1',
    'db/14_2',
    'db/14_3',
    'db/14_4',
    'db/15_0',
    'db/15_1',
    'db/15_2',
    'db/15_3',
    'db/15_4',
    'db/16_0',
    'db/16_1',
    'db/16_2',
    'db/16_3',
    'db/16_4',
    'db/17_0',
    'db/17_1',
    'db/17_2',
    'db/17_3',
    'db/17_4',
    'db/18_0',
    'db/18_1',
    'db/18_2',
    'db/18_3',
    'db/18_4'
];

var q = async.queue(function (task, callback) {
    var orderId = task.orderId;
    resetTask(orderId, callback);
}, 5);

console.time("test");
process.on('exit', function () {
    console.timeEnd("test");
});

// assign a callback
q.drain = function () {
    console.log('all items have been processed');
};

fileArr.forEach(function (file) {
    // orderId
    readFileLine.readLine(file, function (line) {
        q.push({orderId: line}, function (err) {
            if (err) {
                console.error(err);
            }
        });
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
            'Content-Type': 'application/json;charset=UTF-8'
        }
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