var async = require('async'),
    axios = require('axios');

var startTime = "2017-11-01 09:00:00",
    endTime = "2017-11-01 09:30:00";
var keys = [
    "orderbank.monitor.payInsert",
    "orderbank.monitor.cancelDelete",
    "orderbank.monitor.confirmUpdatePart",
    "orderbank.monitor.confirmUpdateFull",
    "orderbank.monitor.confirmUpdateFullParent"
];

function getUmpData(startTime, endTime, key, callback) {
    axios({
        url: 'http://ump.jd.com/performanceReport/queryData.action',
        method: 'POST',

        headers: {
            "Cookie": "erp1.jd.com=E52D57E2F9E5E3596E4C0E551347F4ED6B40B8018B96CF7B832C493C06380E57B458EB8EA47682DA7AE4D90A0F52EE31AAE2D8B38F5BE0B45FC51492589403811FE727A1FDE09E323CA8D721F1038FA5; sso.jd.com=2f5ca289ff544cd8bbc9816496265348;"
        },
        params: {
            "queryMap.dType": "oneMinute",
            "queryMap.startTime": startTime,
            "queryMap.endTime": endTime,
            "queryMap.appId": 21464,
            "queryMap.key": key,
            "queryMap.shortcut": "NON-SHORTCUT-SEARCH",
            "queryMap.type": "1,2,3,1,1,oneMinute,0,0,TP99",
            "queryMap.tpValue": "tp99",
            "queryMap.hostName": ""
        },
        // default json   'arraybuffer', 'blob', 'document', 'json', 'text', 'stream'
        responseType: 'json'
    }).then(function (res) {
        var data = res.data.perReportData;
        var arr = [];
        data.forEach(function (e) {
            arr.push(e.successCount);
        });
        // callback
        callback(null, arr);
    });
}

async.parallel([
        function (callback) {
            getUmpData(startTime, endTime, keys[0], callback);
        },
        function (callback) {
            getUmpData(startTime, endTime, keys[1], callback);
        },
        function (callback) {
            getUmpData(startTime, endTime, keys[2], callback);
        },
        function (callback) {
            getUmpData(startTime, endTime, keys[3], callback);
        },
        function (callback) {
            getUmpData(startTime, endTime, keys[4], callback);
        }
    ],
    function (err, results) {
        if (err) {
            console.error(err);
        }
        if (results) {
            printGap(results[0]);
            printGap(results[2]);
            printGap(results[3]);

            var len = Math.min(results[0].length, results[2].length, results[3].length);
            var arr = [];

            for (var i = 0; i < len; i++) {
                var r = results[0][i] - results[2][i] - results[3][i];
                arr.push(r);
            }
            printGap(arr);
        }
    });

function printGap(arr) {
    var s = "";
    for (var i = 0; i < arr.length; i++) {
        s += arr[i] + " ";
    }
    console.log(s);
}
