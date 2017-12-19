const readline = require('readline');
const fs = require('fs');

module.exports = {
    readLine: function (filePath, lineCallBack) {
        const exists = fs.existsSync(filePath);
        if(!exists) {
            return;
        }
        var input = fs.createReadStream(filePath);
        const rl = readline.createInterface({
            input: input
        });

        rl.on('line', lineCallBack);

        rl.on('close', function() {
            console.log("读取完毕！" + filePath);
        });
    }
};