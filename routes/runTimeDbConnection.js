var mysql = require('mysql');
var runTimeDbConnections;
var log4js = require('log4js');
var logger = log4js.getLogger();
var chunk = require('chunk');
logger.level = config.get('server.debug_level');

module.exports.runTimeDbConnections=(name,host,username,password)=> {
      // logger.debug("=name,host,username,password=",name,host,username,password);
      runTimeDbConnections=mysql.createConnection({
                                host     : host,
                                user     : username,
                                password : password,
                                database:name
            });
      return runTimeDbConnections;

}