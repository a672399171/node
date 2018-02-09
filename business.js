const request = require('request');

module.exports = {
    // 台账 - 查询实收明细
    findAllPayDetail: function (orderId, next, callback) {
        request({
            url: 'http://orderbank.qsoa.jd.local/service/orderQuery/findAllPayDetail',
            method: 'POST',
            json: true,
            body: {
                orderId: orderId,
                appId: 'appId',
                appToken: '123456'
            }
        }, function (err, res, body) {
            next(err, res, body, orderId);
            callback();
        });
    },
    // 台账 - 对账
    orderConfirm: function (orderId, confirmType, next, callback) {
        request({
            url: 'http://orderbank.soa.jd.local/service/order/orderConfirm',
            method: 'POST',
            json: true,
            body: {
                orderId: orderId,
                confirmType: confirmType
            }
        }, function (err, res, body) {
            next(err, res, body, orderId);
            callback();
        })
    },
    // 二清 - 重置任务
    resetTask: function (orderId, next, callback) {
        // 发送单参数且application/json
        request({
            url: 'http://fm-bill.jd.com/service/accountTools/resetTask',
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
            next(err, res, body, orderId);
            callback();
        })
    },
    // 查询台账
    getOrderBank: function (orderId, next, callback) {
        request({
            url: 'http://orderbank.soa.jd.local/service/orderQuery/getOrderBank',
            method: 'POST',
            json: true,
            body: {
                orderId: orderId,
                appId: 'appId',
                appToken: '123456'
            }
        }, function (err, res, body) {
            next(err, res, body, orderId);
            callback();
        })
    },
    // erp查询
    searchOrderBankDetail: function (orderId, next, callback) {
        request({
            url: 'http://orderbank.qsoa.jd.local/service/orderbanksearch/getOrderBankDetail',
            method: 'POST',
            json: true,
            body: {
                orderId: orderId
            }
        }, function (err, res, body) {
            next(err, res, body, orderId);
            callback();
        })
    },
    // 查询分账明细
    searchBillDetail: function (orderId, cookie, next, callback) {
        request({
            url: 'http://billerp.jd.com/billDetails?orderId=' + orderId,
            method: 'GET',
            json: true,
            headers: {
                "Cookie": cookie
            }
        }, function (err, res, body) {
            next(err, res, body, orderId, cookie);
            callback();
        })
    }
};