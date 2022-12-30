var mysql = require('mysql');


var db_config = {
    host: config.get('databaseSettings.host'),
    user: config.get('databaseSettings.user'),
    password: config.get('databaseSettings.password'),
    database: config.get('databaseSettings.database'),
    //port : config.get('databaseSettings.mysqlPORT'),
    multipleStatements: true
    //config.get('databaseSettings.connectionLimit')
};




function handleDisconnect() {
        connection = mysql.createConnection(db_config); // Recreate the connection, since
                                                    // the old one cannot be reused.

    // console.log("in the handleDisconnect",db_config);
    connection.connect(function(err) {              // The server is either down
        if(err) {                                     // or restarting (takes a while sometimes).
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000);
        }
        else {
            console.log("connection variable created ");
            connection.end();
            //console.log(connection);
        }
    });                                     // process asynchronous requests in the meantime.
                                            // If you're also serving http, display a 503 error.
    connection.on('error', function(err) {
        console.log('!!!!!db error!!!!!!!!!!!', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
            handleDisconnect();                         // lost due to either server restart, or a
        }
        else {                                      // connnection idle timeout (the wait_timeout
            throw err;                                  // server variable configures this)
        }
    });
}

handleDisconnect();


