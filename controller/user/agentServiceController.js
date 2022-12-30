var async = require('async');
var sendResponse = require('../../routes/sendResponse');
var constant = require('../../routes/constant');
var func = require('../../routes/commonfunction');
var consts=require('./../../config/const')
const lib=require('../../lib/NotificationMgr')
var _ = require('underscore');
var something = "Something went wrong";
var client = require('twilio')("AC4b6d9ecd84afd6db7cf9ac5f055d7784","782e67bf1f26170706acd639d757ae08");
var moment = require('moment');
var pushNotifications = require('../../routes/pushNotifications');
var orderFunction = require('../../routes/orderFunction');
var AdminMail = "ops@royo.com";
var log4js = require('log4js');
var logger = log4js.getLogger();
var chunk = require('chunk');
logger.level = config.get('server.debug_level');
var crypto = require('crypto')
    algorithm = consts.SERVER.CYPTO.ALGO,
    crypto_password =  consts.SERVER.CYPTO.PWD
var chunk = require('chunk');
const runTimeDbConnection=require('../../routes/runTimeDbConnection')

const KeyList=async (req,res)=>{
    try{
        var service_data;
        var get_agent_db_data=await getAgentDbInformation(req.dbName);
        var agent_connection=await RunTimeAgentConnection(get_agent_db_data);
        var key_data=await KeyData(agent_connection);
        // var data=await getAgentList(key_data);
        sendResponse.sendSuccessData(key_data, constant.responseMessage.SUCCESS, res, 200);
    }
    catch(Err){
        logger.debug(Err);
        sendResponse.somethingWentWrongError(res);
    }

}
// var agentConnection=await RunTimeAgentConnection(GetAgentDbData);

function KeyData(agent_connection){
    return new Promise((resolve,reject)=>{
        var assignQuery="select `key`,`value` from cbl_keys where `key` IN (?)"
        var st2=agent_connection.query(assignQuery,[[config.get("agent.api_key"),config.get("agent.db_secret_key")]],function(err, data) {
        //    logger.debug(st2.sql);
            if(err){
                reject(err)
            }
            else{
                    resolve(data)            
                }
    })
})

}

function RunTimeAgentConnection(data){
    var decipher = crypto.createDecipher(algorithm,crypto_password)
    var password = decipher.update(data.password,'hex','utf8')
    password += decipher.final('utf8');
    // logger.debug("=====password===",password);
    return new Promise((resolve,reject)=>{
        resolve(
            runTimeDbConnection.runTimeDbConnections(
                data.name,
                data.host,
                data.user,
                password
            )
        )
    })
}

function getAgentDbInformation(dbName){
    logger.debug("===dbName=========3",dbName);
    return new Promise((resolve,reject)=>{
     var sql ="select name,user,password,host from agent_db"
     multiConnection[dbName].query(sql,[],function(err,data){
            if(err){
                reject(err)
            }
            else{
                logger.debug("====DATA===",data);
                if(data && data.length>0){
                    resolve(data[0])
                }
                else{
                    reject()
                }
            }
    })
    })
    }
// function getAgentList(key_data){

//     logger.debug("===keyData==",key_data);

//     return new Promise((resolve,reject)=>{
//         // logger.debug(file,file.file.path);
     
//         request.post({
//           headers: {
//                 // 'Content-Length': contentLength,
//                 // 'Content-Type': 'multipart/form-data',
//                 'api_key':api_key,
//                 'secret_key':secret_key
//                 },
//           url: config.get("agent.api_link")+config.get("agent.agent_service_list"),
//           method: "POST",
//           body: {
//                   serviceIds:[]
//           }
//         }, function(error, response, body) {
//             var data=body && body!=undefined?JSON.parse(body):body
//             logger.debug("===Body!==",body,"=====MES=",data);
//             if (!error && data.statusCode == 200) {
//                 resolve()
//               } else {
//                 logger.debug("===Else Body!==");
//                 reject(data.message);
//               } 
//         })
//     })



// }

module.exports={
    KeyList:KeyList
}