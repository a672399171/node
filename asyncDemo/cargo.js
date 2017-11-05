var async = require('async');

// 类似于任务队列并发执行worker
// create a cargo object with payload 2
var cargo = async.cargo(function(tasks, callback) {
    for (var i=0; i<tasks.length; i++) {
        console.log('hello ' + tasks[i].name);
    }
    setTimeout(function () {
        callback();
    }, 1000);
}, 2);

// add some items
cargo.push({name: 'foo'}, function(err) {
    console.log('finished processing foo');
});
cargo.push({name: 'bar'}, function(err) {
    console.log('finished processing bar');
});
cargo.push({name: 'baz'}, function(err) {
    console.log('finished processing baz');
});

