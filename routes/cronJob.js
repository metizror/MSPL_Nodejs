var mysql = require('mysql');
var async = require('async');
var constant=require('../config/const')
multiConnection={};
var consts=require('../config/const')
var schedule = require('node-schedule');
const common = require('../common/agent');
const lib = require('../lib/NotificationMgr')
var crypto = require('crypto'),
    algorithm = consts.SERVER.CYPTO.ALGO,
    password =  consts.SERVER.CYPTO.PWD
    var log4js = require('log4js');
const Execute = require('../lib/Execute');
const moment = require('moment');
const { resolve } = require('path');
    var logger = log4js.getLogger();
    // var chunk = require('chunk');
    logger.level = config.get('server.debug_level');

function restartCronForDropOffNotification() {
    let sql = "select cc.name,cc.email,ccd.name as dbName ";
        sql += "from cbl_customer cc join cbl_customer_dbs ccd on cc.id =";
        sql += "ccd.customer_id where cc.is_dropoff_notification=1";

        var stmt = cblConnection.query(sql,async function(err,data){
            if(err){
                logger.debug("========cron err =====",err);
            }else{
                try{
                    if(data && data.length>0){
                        for(const [index,i] of data.entries()){
                            var GetAgentDbData = await common.GetAgentDbInformation(i.dbName);
                            var AgentConnection = await common.RunTimeAgentConnection(GetAgentDbData);
                            let agentOrderQuery = "select cuo.order_id,cu.device_token,cuo.drop_off_date,cuo.drop_off_date_utc  from cbl_user_orders cuo ";
                            agentOrderQuery += " join cbl_user cu on cuo.user_id = cu.id where cuo.is_drop_notification_sent=0"
                           
                            let agentOrders = await Execute.QueryAgent(AgentConnection,agentOrderQuery,[]);
                           
                            if(agentOrders && agentOrders.length>0){
                                for(const [index,j] of agentOrders.entries()){
                                    let dropOffDateTime = j.drop_off_date_utc;
                                    // i.drop_off_date = (j.drop_off_date).toISOString().replace("T"," ");
                                    // i.drop_off_date = (j.drop_off_date).toISOString().replace(".000Z","");
                                    // dropOffDateTime =  dropOffDateTime.replace("T"," ")
                                    // dropOffDateTime =  dropOffDateTime.replace(".000Z","");
                                    // console.log("======== i.drop_off_date=========", dropOffDateTime,typeof dropOffDateTime);
                                    
                                    schedule.scheduleJob(dropOffDateTime,async function(){
                                        logger.debug("=====scheduleJob======")
                                        let message="Hi there, you have a dropoff today for booking number"+j.orderId;
                                        var noteData = {
                                            "status": 0,
                                            "message":message,
                                            "orderId":j.order_id
                                        }
                                        let orderData = await Execute.Query(i.dbName,"select user_id from orders where id=?",[j.order_id])
                                        await lib.sendFcmPushNotification(j.device_token, noteData,i.dbName);
                                        await saveNoticationData(i.dbName,orderData[0].user_id,0,j.order_id,0,message);
                                        // let agentOrderQuery = "update cbl_user
                                        // let agentOrders = await Execute.QueryAgent(AgentConnection,agentOrderQuery,[]);
                                       
                                    });
                                }
                            }
                        }
                    }
                }catch(err){
                    logger.debug("===========err=========",err);
                }

            }
        })
}


restartCronForDropOffNotification();

const saveNoticationData =async  function (dbName,
     userId, supplierId, orderId, status, message) {
    try{
        return new Promise(async(resolve,reject)=>{
            var sql = "insert into push_notifications(user_id,supplier_id,order_id,notification_message,notification_status) values(?,?,?,?,?) ";
            await Execute.Query(dbName,sql,[userId, supplierId, orderId, message, status]);
            resolve();
        })
    }
    catch(Err){
        logger.debug("===Err!==",Err);
    }
}