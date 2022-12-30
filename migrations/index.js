var mysql = require('mysql');
var fs = require('fs');
var readline = require('readline');
config = require('config');

var myCon = mysql.createConnection({
    host: config.get('databaseSettings.host'),
    port: '3306',
    database: config.get('databaseSettings.database'),
    user: config.get('databaseSettings.user'),
    password: config.get('databaseSettings.password')
});

var rl = readline.createInterface({
    input: fs.createReadStream(__dirname + '/queries.sql'),
    terminal: false
});
rl.on('line', function (chunk) {    
    myCon.query(chunk.toString('ascii'), function (err, sets, fields) {
        if (err) console.log(err);        
    });
});
rl.on('close', function () {
    console.log("finished");
    myCon.end();
});