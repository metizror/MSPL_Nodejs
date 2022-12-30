'use strict';

// var Config = require('../Config');
var async = require('async');
var universal = require('../util/Universal')
var Path = require('path');
var Mailer;
var FCM = require('fcm-node');
var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = config.get('server.debug_level');
/*
 ==============================================
 Send the notification by the firebase
 =============================================
 */
 function sendFcmPushNotification(deviceTokens,notificationData,dbName) {
    return new Promise(async (resolve,reject)=>{
        let sound=await universal.getSound(dbName);
        logger.debug("=deviceTokens====notificationData=>>=",deviceTokens,notificationData,dbName)
        // var serverKey=Config.fcmPushSettings.serverKey;
        // var notificationData = {
        //     title: "Nassarius",
        //     type: APP_CONSTANTS.NOTIFY_MODEL_TYPE.FEED_LIKE_UNLIKE,
        //     message: message,
        //     pictureUrl: feedData[0].fileURL.thumbnail,
        // }
        var fcm = "";
                                         console.log('dbName',dbName);
                                            notificationData.sound=sound            
        let fcm_server_key = await universal.getFcmServerKey(dbName);
        console.log("===fcm_server_key======",fcm_server_key);
        if(fcm_server_key!=""){
            fcm = new FCM(fcm_server_key)
        }else{
            fcm = new FCM(config.get('server.fcm_server_key'));
        }
        console.log("===fcm_server_key======",fcm_server_key);
        var message = { 
            collapse_key: 'green',
            registration_ids: deviceTokens,        
            notification: {
                title: notificationData.title, 
                body: notificationData.message,
                android_channel_id: "cnid",
                tag:notificationData.tag,
                url:"https://admin.littlecaesarsbahrain.com",
                sound: sound,
                badge:0
            },
            data:notificationData
        };
    
        console.log("==========message===========",message);
    
        fcm.send(message, function(err, response){
            if (err) {
                console.log("Something has gone wrong!",err);
                resolve()
            } else {
                console.log("Successfully sent with response: ", response);
                resolve()
            }
        });
    
    })
}


module.exports = {
    sendFcmPushNotification:sendFcmPushNotification
};