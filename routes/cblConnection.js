var mysql = require('mysql');
var constant=require('./../config/const')

var db_config = {
    host: process.env.MYSQL_HOST?process.env.MYSQL_HOST:config.get('databaseSettings.cbl_host'),
    user: process.env.MYSQL_USER?process.env.MYSQL_USER:config.get('databaseSettings.cbl_user'),
    password: process.env.MYSQL_PWD?process.env.MYSQL_PWD:config.get('databaseSettings.cbl_password'),
    database: process.env.MYSQL_DB_NAME?process.env.MYSQL_DB_NAME:config.get('databaseSettings.cbl_database'),
    //port : config.get('databaseSettings.mysqlPORT'),
    multipleStatements: true
    //config.get('databaseSettings.connectionLimit')
};
// function handleCblDisconnect() {
//     if(constant.SERVER.WHITE_LABLE.STATUS==0){
//             cblConnection = mysql.createConnection(db_config); // Recreate the connection, since
//             console.log("in the handleDisconnect");
//             cblConnection.connect(); 
//             cblConnection.end();
//         }
// }

function handleCblDisconnect() {
    cblConnection = mysql.createConnection(db_config); // Recreate the connection, since
                                                // the old one cannot be reused.

// console.log("in the handleDisconnect",db_config);
cblConnection.connect(function(err) {     
    console.log("!!!cbl connection!!!!!!!!!!==>",err)         // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
        console.log('error when connecting to db:', err);
        setTimeout(handleCblDisconnect, 2000);
    }
    else {
        console.log("connection variable created ");
        cblConnection.end();
        //console.log(connection);
    }
});                                     // process asynchronous requests in the meantime.
                                        // If you're also serving http, display a 503 error.
cblConnection.on('error', function(err) {
    console.log('!!!!cbl db error!!!!=', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
        handleCblDisconnect();                         // lost due to either server restart, or a
    }
    else {                                      // connnection idle timeout (the wait_timeout
        throw err;                                  // server variable configures this)
    }
});
}

// handleDisconnect();
handleCblDisconnect();


