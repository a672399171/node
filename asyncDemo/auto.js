var async = require('async');

// 自动化流程，函数之间可以存在依赖关系
async.autoInject({
    get_data: function(callback) {
        // async code to get some data
        callback(null, 'data', 'converted to array');
    },
    make_folder: function(callback) {
        // async code to create a directory to store a file in
        // this is run at the same time as getting the data
        setTimeout(function () {
            callback(null, 'folder');
        },1000);
    },
    write_file: function(get_data, make_folder, callback) {
        // get_data, make_folder  是前两个函数回调的值
        // once there is some data and the directory exists,
        // write the data to a file in the directory
        callback(null, 'filename');
    },
    email_link: function(write_file, callback) {
        // once the file is written let's email a link to it...
        // write_file contains the filename returned by write_file.
        callback(null, {'file':write_file, 'email':'user@example.com'});
    }
}, function(err, results) {
    console.log('err = ', err);
    console.log(results);
});