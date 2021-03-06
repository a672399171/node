var async = require('async');
var request = require('request'), // http
    fs = require('fs');

// 类似于任务队列并发执行worker
var cargo = async.cargo(function(tasks, callback) {
    var count = 0;
    for (var i=0; i<tasks.length; i++) {
        // console.log("getOrderBank:" + tasks[i].orderId);
        var orderId=tasks[i].orderId;
        getOrderBank(orderId, function () {
            count ++;
            if(count >= tasks.length) {
                callback();
            }
        });
    }
}, 10);

var arr = getFileContent('../orderId');
arr.forEach(function (orderId) {
    cargo.push({orderId: orderId}, function(err) {
        if(err) {
            console.error(err);
        }
    });
});

// add some items
/*cargo.push({name: 'foo'}, function(err) {
    console.log('finished processing foo');
});
cargo.push({name: 'bar'}, function(err) {
    console.log('finished processing bar');
});
cargo.push({name: 'baz'}, function(err) {
    console.log('finished processing baz');
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
            if(orderBank.paidIn > 0) {
                console.log(orderId);
            }
        } else {
            console.error(orderId);
        }
        callback();
    })
}