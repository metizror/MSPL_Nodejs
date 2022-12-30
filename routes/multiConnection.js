var mysql = require('mysql');
var async = require('async');
var constant=require('./../config/const')
multiConnection={};
var consts=require('./../config/const')
var crypto = require('crypto'),
    algorithm = consts.SERVER.CYPTO.ALGO,
    password =  consts.SERVER.CYPTO.PWD
var log4js = require('log4js');
var logger = log4js.getLogger();
// var chunk = require('chunk');
logger.level = config.get('server.debug_level');
let dbConfig=  {
    connectionLimit: 4000,
    host     : config.get('databaseSettings.host'),
    user     : config.get('databaseSettings.user'),
    password : config.get('databaseSettings.password'),
    database : config.get('databaseSettings.database'),
    // keepAliveInitialDelay: 10000, // 0 by default.
    enableKeepAlive: true
}
function multiConnectionHandler() {
    console.log("===dbConfig=====>>",  dbConfig)
    multiConnection[config.get('databaseSettings.database')] =  mysql.createPool(
        dbConfig
    );
    multiConnection[config.get('databaseSettings.database')].getConnection((err, connectionm) => {
        // logger.debug("===",multiConnection)
        if (err) {
            if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                console.error('Database connection was closed.')
            }
            if (err.code === 'ER_CON_COUNT_ERROR') {
                console.error('Database has too many connections.')
            }
            if (err.code === 'ECONNREFUSED') {
                console.error('Database connection was refused.')
            }
            // setTimeout(multiConnections, 2000);
        }
        if (connectionm) connectionm.destroy();
        // resolve()
        return
    })
                        
}
multiConnectionHandler();