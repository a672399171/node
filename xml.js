var moment = require('moment'),
    request = require('request'),
    fs = require('fs'),
    async = require('async'),
    parseString = require('xml2js').parseString;

var cookie = '';
var serverName = process.argv[2];
var pageCount =  0;
var serverObj = {
    "ws": 248,
    "2012": 249,
    "2013": 278,
    "2014": 305,
    "2015": 333
};

var xmlList = [];
var intervalArr = [];
var started = true;

// getRoleXml('39448558');
if(serverObj[serverName]) {
    console.log('serverName:' + serverName);
    cookie = getFileContent(serverName + '/cookie');
    start(serverName);
} else {
    console.error('server name not found!');
}



function start(serverName) {
    xmlList = getCurrentCodeList(serverName + '/xml');
    getList(parseInt(process.argv[3]) || 1, serverObj[serverName]);
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
            }, 12000);
        }
    });
}

function startPageCollect(index, itemArr) {
    intervalArr[index] = setInterval(function () {
        if (itemArr.length > 0) {
            var item = itemArr.pop();
            if (xmlList.indexOf(item + '') < 0 && started) {
				getRoleXml(item);
            }
        } else {
            clearInterval(intervalArr[index]);
            console.log(index + '  end');
        }
    }, 800);
}

function getRoleXml(code) {
    console.log('getRoleXml:' + code);
    request({
        url: 'http://qibao.gyyx.cn/Buy/GetItemInfoXMLByItemId/' + code + '?=' + Math.random(),
        method: 'GET',
        headers: {
            Cookie: cookie
        }
    }, function (err, res, text) {
        // console.log(text);
		parseString(text, function (err, result) {
		    if(err) {
		        console.error(code + '--' + text);
            }
            try {
		        if(result.RoleInfo.role[0].wudao) {
					var wudao = result.RoleInfo.role[0].wudao[0].wudao_stage[0];
					if(wudao.indexOf('七层') > -1 || wudao.indexOf('八层') > -1 || wudao.indexOf('九层') > -1) {
						fs.appendFileSync(serverName + '/xml', code + '\t' + wudao + '\t' + moment().format() + '\r\n');
					}
                }
            } catch (e) {
				console.error(code + '--' + text);
            }
		});
    });
}

// 获取文件内容
function getFileContent(filePath) {
    return fs.readFileSync(filePath, {
        encoding: 'utf-8'
    });
}