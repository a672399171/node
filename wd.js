var moment = require('moment'),
    request = require('request'),
    fs = require('fs'),
    async = require('async');

var cookie = getFileContent('cookie');
var pageCount = 0;
var serverObj = {
    "ws": 248,
    "2013": 278,
    "2014": 305,
    "2015": 333
};

var currentList = [];
var intervalArr = [];
var started = true;



var serverName = "ws";
start(serverName);



function start(serverName) {
    currentList = getCurrentCodeList(serverName + '/collect');
    getList(1, serverObj[serverName]);
}

function getCurrentCodeList(filePath) {
    var s = fs.readFileSync(filePath, {
        encoding: 'utf-8'
    });
    var rows = s.split("\r\n");
    var arr = [];
    rows.forEach(function (e) {
        if (e.length > 1) {
            arr.push(e.split('\t')[0]);
        }
    });
    return arr;
}
// FreeShow%2CPublicity%2C
function getList(pageIndex, serverCode) {
    request({
        url: 'http://qibao.gyyx.cn/AdvancedSearch/RoleItemList?sex=%E4%B8%8D%E9%99%90&mainPoint=0&level=&minTao=&maxTao=&minCon=&maxCon=&minWiz=&maxWiz=&minStr=&maxStr=&minDex=&maxDex=&minImmortal=&maxImmortal=&minMagic=&maxMagic=&minPrice=&maxPrice=&serverId=' + serverCode + '&r=' + Math.random() + '&time=&orderState=&readed=&itemTypeID=0&state=FreeShow%2CPublicity%2C&order=0&pageIndex=' + pageIndex + '&pageSize=15&itemState=&keyWord=',
        method: 'GET',
        headers: {
            Cookie: cookie
        }
    }, function (err, res, body) {
        var itemArr = [];
        try {
            body = JSON.parse(body);
            if (body.IsSuccess) {
                body.Data.forEach(function (e) {
                    itemArr.push(e.ItemInfoCode);
                });

                if (pageCount <= 0) {
                    pageCount = body.PageCount;
                }
            }
        } catch (e) {
            console.error(body);
        }

        console.log("页数进度：" + pageIndex + "/" + pageCount);
        if (pageIndex <= pageCount) {
            startPageCollect(pageIndex, itemArr);
            setTimeout(function () {
                getList(pageIndex + 1, serverCode);
            }, 15000);
        }
    });
}

function startPageCollect(index, itemArr) {
    intervalArr[index] = setInterval(function () {
        if (itemArr.length > 0) {
            var item = itemArr.pop();
            if (currentList.indexOf(item + '') < 0 && started) {
                getCollectCount(item);
            }
        } else {
            clearInterval(intervalArr[index]);
            console.log(index + '  end');
        }
    }, 1000);
}

function getCollectCount(code) {
    console.log('getCollectCount:' + code);
    request({
        url: 'http://qibao.gyyx.cn/ItemSellOperate/CollectCount?ItemCode=' + code + '&r=' + Math.random(),
        method: 'GET',
        headers: {
            Cookie: cookie
        }
    }, function (err, res, text) {
        var body = undefined;
        body = JSON.parse(text);
        if (body.IsSuccess) {
            if (body.Count > 5) {
                fs.appendFileSync(serverName + '/collect', code + '\t' + body.Count + '\t' + moment().format() + '\r\n');
            }
        } else {
            if (body.Data && body.Data === 'unauthorized') {
                console.log('unauthorized re login!' + body);
                started = false;
            }
        }
    });
}

// 获取文件内容
function getFileContent(filePath) {
    return fs.readFileSync(filePath, {
        encoding: 'utf-8'
    });
}