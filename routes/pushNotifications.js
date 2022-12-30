var gcm = require('node-gcm');
var moment = require('moment');
var async = require('async');
var apns = require('apn');
const constant = require('../routes/constant')
var universal = require('../util/Universal')
var FCM = require('fcm-push');
var NODE_FCM = require('fcm-node');
var log4js=require("log4js")
var logger = log4js.getLogger();
logger.level = 'debug';
const _=require('underscore');
const schedule = require('node-schedule')
const Execute=require('../lib/Execute')
/*
 ==========================================================
 Send the notification to the iOS device for customer
 ==========================================================
 */
exports.sendIosPushNotification = function(iosDeviceToken,message,paths,sound,callback) {
    
    console.log("...............message................",message);
    console.log("...............message................",message);

    var debugging_enabled=1;
    console.log("iosDeviceToken==================",iosDeviceToken);
    var path = paths;
    console.log("...........path...................",paths);
    

    // console.log("........Sen*****************ssssss**************************************",iosDeviceToken.length)

        if(iosDeviceToken &&  iosDeviceToken.length > 15){
            var gateway;
            console.log("........Sen*******************************************************")


            if(paths == "branch"){
                 var path = __dirname+'/../clikatSupplierProduction.pem';
                gateway = 'gateway.push.apple.com';
                // gateway='gateway.sandbox.push.apple.com'
            }
            else if(paths == "user"){
                var path = __dirname+'/../clikatProduction.pem';
               // var path = "/home/royo/royo-backend/clikatProduction.pem";
                gateway = 'gateway.push.apple.com';
                //gateway='gateway.sandbox.push.apple.com'
            }
            else{
                var path = __dirname+'/../clikatSupplierProduction.pem';
                gateway = 'gateway.push.apple.com';
                //gateway='gateway.sandbox.push.apple.com'
            }

            //  var path ="/home/royo/testing_branch/royo-backend/SupplierProduction.pem";

        

            console.log("gateway............................................................",gateway);
            //path = "/home/royo/testing_branch/royo-backend/SupplierProduction.pem"


            var DEBUG=apns;
            var status = 1;
            var msg = message;
            var snd = 'ping.aiff';
            var options = {
                cert: path ,
                certData: null,
                key:path,
                keyData: null,
                passphrase: '12345',
                ca: null,
                pfx: null,
                pfxData: null,
                gateway:gateway ,  //
                port: 2195,
                rejectUnauthorized: true,
                enhanced: true,
                cacheLength: 100,
                autoAdjustCache: true,
                connectionTimeout: 0,
                ssl: false,
                production:false
            };


            var apnConnection = new apns.Connection(options);

            var deviceToken = new apns.Device(iosDeviceToken);

            var note = new apns.Notification();
            note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
            note.badge = 1;
            note.sound = sound;
            note.alert = message.message;
            note.payload = message;
            note.badge = 0;
            // note.device =deviceToken
            //console.log(note)
            apnConnection.pushNotification(note,deviceToken);


            function log(type) {
                return function () {
                    if (DEBUG)
                        console.log("iOS PUSH NOTIFICATION RESULT: " + type);
                }
            }
            callback(null);
            apnConnection.on('error', log('error'));
            apnConnection.on('transmitted', log('transmitted'));
            apnConnection.on('timeout', log('timeout'));
            apnConnection.on('connected', log('connected'));
            apnConnection.on('socketError', log('socketError'));
            apnConnection.on('cacheTooSmall', log('cacheTooSmall'));
        }
        else{
            console.log(".......nort.Sen*******************************************************")
            callback(null);
        }
    
}

exports.sendIosPushNotificationInSettings = function(iosDeviceToken,message,paths,sound,callback) {

    console.log("...............message................",message);
    console.log("...............message................",message);

    var debugging_enabled=1;
    console.log("iosDeviceToken==================",iosDeviceToken);
    var path = paths;
    console.log("...........path...................",paths);


    console.log("........Sen*****************ssssss**************************************",iosDeviceToken.length)
        console.log("array")
        for(var i=0;i<iosDeviceToken.length;i++){
            (function (i) {
                var token=iosDeviceToken[i];
                console.log("....token....",token);
                if(token.length > 15){
                    var gateway;

                    console.log("........Sen*******************************************************")


                    if(paths == "branch"){
                        var path = __dirname+'/../clikatSupplierProduction.pem';
                        gateway = 'gateway.push.apple.com';
                        // gateway='gateway.sandbox.push.apple.com'
                    }
                    else if(paths == "user"){
                        var path = __dirname+'/../clikatProduction.pem';
                        // var path = "/home/royo/royo-backend/clikatProduction.pem";
                        gateway = 'gateway.push.apple.com';
                        //gateway='gateway.sandbox.push.apple.com'
                    }
                    else{
                        var path = __dirname+'/../clikatSupplierProduction.pem';
                        gateway = 'gateway.push.apple.com';
                        //gateway='gateway.sandbox.push.apple.com'
                    }

                    //  var path ="/home/royo/testing_branch/royo-backend/SupplierProduction.pem";

                    console.log("path............................................................",path);

                    console.log("gateway............................................................",gateway);
                    //path = "/home/royo/testing_branch/royo-backend/SupplierProduction.pem"


                    var DEBUG=apns;
                    var status = 1;
                    var msg = message;
                    var snd = 'ping.aiff';
                    var options = {
                        cert: path ,
                        certData: null,
                        key:path,
                        keyData: null,
                        passphrase: '12345',
                        ca: null,
                        pfx: null,
                        pfxData: null,
                        gateway:gateway ,  //
                        port: 2195,
                        rejectUnauthorized: true,
                        enhanced: true,
                        cacheLength: 100,
                        autoAdjustCache: true,
                        connectionTimeout: 0,
                        ssl: false,
                        production:false
                    };


                    var apnConnection = new apns.Connection(options);
                    console.log("........token..",token);
                    var deviceToken = new apns.Device(token);

                    var note = new apns.Notification();
                    note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
                    note.badge = 1;
                    note.sound = sound;
                    note.alert = message.message;
                    note.payload = message;
                    note.badge = 0;
                    // note.device =deviceToken
                    console.log("........note..",note);
                    console.log("........devicetokedmkl..",deviceToken);
                    apnConnection.pushNotification(note,deviceToken);


                    function log(type) {
                        return function () {
                            if (DEBUG)
                                console.log("iOS PUSH NOTIFICATION RESULT: " + type);
                        }

                    }
                    apnConnection.on('error', log('error'));
                    apnConnection.on('transmitted', log('transmitted'));
                    apnConnection.on('timeout', log('timeout'));
                    apnConnection.on('connected', log('connected'));
                    apnConnection.on('socketError', log('socketError'));
                    apnConnection.on('cacheTooSmall', log('cacheTooSmall'));
                    if(i==(iosDeviceToken.length-1)){
                        console.log("....",iosDeviceToken.length)
                        callback(null)
                    }

                }else{
                    console.log(".......nort.Sen*******************************************************")
                    if(i==(iosDeviceToken.length-1)){
                        console.log("....",iosDeviceToken.length)
                        callback(null)
                    }
                }
            }(i))
        }

}

/*
 ==============================================
 Send the notification to the android device
 =============================================
 */

exports.sendAndroidPushNotification = function(deviceToken, message2,callback) {

    console.log("message",message2.message);
    console.log("deviceToken",deviceToken);

    var message = new gcm.Message({
        collapseKey: 'demo',
        delayWhileIdle: false,
        timeToLive: 2419200,
        data: message2,
        extra:message2, 
        priority: "high"

    });
    var sender = new gcm.Sender(config.PushNotificationSettings.GCMkey);

if(Array.isArray(deviceToken)){
    var registrationIds=deviceToken;
    //console.log("array")
}
    else{
    var registrationIds = [];
    registrationIds.push(deviceToken);
    //console.log("not array");
}

    sender.send(message, registrationIds, 4, function (err, result) {
        console.log("error111",err,result);
        callback(null);
    });
}

exports.sendAndroidPushNotificationToSupplier = function(deviceToken, message2,type,callback) {
    console.log(".....pushNotification......",message2);
   
   if(deviceToken.length > 15){
       if(type==0){
           var fcm = new FCM(config.PushNotificationSettings.FCMkeySupplier);
       }
       else {
           var fcm = new FCM(config.PushNotificationSettings.FCMkeyBranch);
       }
       var message = {
           to: deviceToken, // required
           collapse_key: 'demo',
           notification: {
               title: message2.title,
               body: message2.message,
               tag:message2.status,
               sound:message2.sound,
               extra:message2.message
           },
           data : {
               "orderId" : message2.data,
               "sound":sound
           }
       }
       fcm.send(message, function (err, result) {
           console.log("error111",err,result);
           callback(null);
       });
   }else{
       callback(null)
   }
   
  
}
exports.sendFcmPushNotification = async function(deviceToken,notificationData,dbName,callback) {

    console.log("=deviceTokens=",deviceToken)

    var fcm = "";
    let sound=await universal.getSound(dbName);
    let fcm_server_key = await universal.getFcmServerKey(dbName);
    if(fcm_server_key!=""){
        fcm = new FCM(fcm_server_key);
    }else{
        fcm = new FCM(config.get('server.fcm_server_key'));
    }
    console.log("====fcm_server_key====",fcm_server_key);
    var message = { 
        //  registration_ids: deviceToken,        
        registration_ids: [deviceToken],
        priority: 'high',
        notification: {
            title: notificationData.title, 
            android_channel_id: "cnid",
            body: notificationData.message,
            type : notificationData.status,
            badge:0,
            sound:sound
        },
         data: {  //you can send only notification or only data(or include both)
            orderId: notificationData.orderId,
            status: notificationData.status,
            self_pickup:notificationData.self_pickup!=undefined?notificationData.self_pickup:0,
            sound:sound
        }
    };

    logger.debug("==========SERVER===========",message);

    fcm.send(message, function(err, response){
        console.log("==========notification errror===========",err,response);
        // if (err) {
        //     console.log("Something has gone wrong!",err);
        //     callback(err,[]);
        // } else {
        //     console.log("Successfully sent with response: ", response);
        //     callback(null);
            
        // }
        callback(null);
    });

}


exports.sendFcmPushNotificationAdmin = async function(deviceToken,notificationData,dbName,callback) {

    console.log("=deviceTokens=",deviceToken)

    var fcm = "";
    let sound=await universal.getSound(dbName);
    let fcm_server_key = await universal.getFcmServerKey(dbName);
    if(fcm_server_key!=""){
        fcm = new FCM(fcm_server_key);
    }else{
        fcm = new FCM(config.get('server.fcm_server_key'));
    }
    console.log("====fcm_server_key====",fcm_server_key);
    var message = { 
        //  registration_ids: deviceToken,        
        registration_ids: deviceToken,
        priority: 'high',
        notification: {
            title: notificationData.title, 
            android_channel_id: "cnid",
            body: notificationData.message,
            type : notificationData.status,
            badge:0,
            sound:sound
        },
         data: {  //you can send only notification or only data(or include both)
            orderId: notificationData.orderId,
            status: notificationData.status,
            self_pickup:notificationData.self_pickup!=undefined?notificationData.self_pickup:0,
            sound:sound
        }
    };

    logger.debug("==========SERVER===========",message);

    fcm.send(message, function(err, response){
        console.log("==========notification errror===========",err,response);
        // if (err) {
        //     console.log("Something has gone wrong!",err);
        //     callback(err,[]);
        // } else {
        //     console.log("Successfully sent with response: ", response);
        //     callback(null);
            
        // }
        callback(null);
    });

}


exports.sendFcmPushNotificationInBulk = function(userData,dbName
    ,fcm_server_key,deviceToken,notificationData) {


    return new Promise(async (resolve,reject)=>{
        let sound=await universal.getSound(dbName);
    // console.log("=deviceTokens=",deviceToken)
    var fcm = "";
    // let fcm_server_key = await universal.getFcmServerKey(dbName);
    // if(fcm_server_key!=""){
        fcm = new FCM(fcm_server_key);
    // }else{
    //     fcm = new FCM(config.get('server.fcm_server_key'));
    // }
    // var message = { 
    //     //  registration_ids: deviceToken,        
    //     to: deviceToken,
    //     priority: 'high',
    //     notification: {
    //         title: notificationData.title, 
    //         body: notificationData.message,
    //         type : notificationData.status,
    //         badge:0
    //     },
    //      data: {  //you can send only notification or only data(or include both)
    //         orderId: notificationData.orderId
    //     }
    // };
    var message = { 
        registration_ids:deviceToken,        
       // to: deviceToken,
       priority: 'high',
       notification: {
           title: notificationData.title, 
           body: notificationData.message,
           android_channel_id: "cnid",
           type : notificationData.status,
           badge:0,
           sound:sound
       },
        data: {  //you can send only notification or only data(or include both)
           orderId: 0,
           status: 0,
           self_pickup:0
       }
   };

    let deviceTokenData=deviceToken;
    if(deviceTokenData && deviceTokenData.length>300){
        deviceTokenData=_.chunk(deviceTokenData, 300);
        let timdiff=5;
        // function sayHi() {
        //     alert('Hello');
        //   }
          
        //   setTimeout(sayHi, 1000);
       
        const promises = _.map(deviceTokenData, async(e) => {
            // logger.debug("==========>>",e[0]);
            
            logger.debug("======",timdiff)
            if(timdiff==5){
                timdiff=timdiff+10
                await sendFcm(fcm,e, notificationData,userData,dbName);
                
                // var data = JSON.stringify(data)
            }
            else{
                timdiff=timdiff+10
                var pushTime = moment(new Date()).add(timdiff, 'seconds');
                // console.log(moment(new Date()),"============moment(new Date())===============",pushTime)
                var pushHour = pushTime.format("HH");
                var pushMin = pushTime.format("mm");/*momentTimezone(time, ["h:mm A"])*/
                var pushSec = pushTime.format("ss");
                let data=JSON.stringify({
                    notificationData:notificationData,
                    dbName:dbName,
                    deviceToken:e,
                    fcm:fcm,
                    usersData:userData
                }) 
                var pushRule = { hour: pushHour, minute: pushMin,second:pushSec}
                // logger.debug("====pushRule=====>>>",pushRule)
                await schedule.scheduleJob(data, pushRule, async function () {
                    // logger.debug("=====pushRule====>>",data)
                    let mData=JSON.parse(data);
                    await sendFcm(mData.fcm,mData.deviceToken,mData.notificationData,mData.usersData,mData.dbName);
                })

            }
        });
        //  Promise.all(promises); setInterval(async () => {await sendFcm(fcm,e, notificationData)}, 10);

        resolve()
    }
   
   else{
         await sendFcm(fcm,deviceToken, notificationData,userData,dbName);
         resolve()
    // fcm.send(message, function(err, response){
    //     logger.debug("==========notification errror===========",err);
    //     // if (err) {
    //     //     console.log("Something has gone wrong!",err);
    //     //     callback(err,[]);
    //     // } else {
    //     //     console.log("Successfully sent with response: ", response);
    //     //     callback(null);
            
    //     // }
    //     // callback(null);
    //     resolve()
    // });
   
   }

    // logger.debug("==========SERVER===========",message);

    
});


}


const sendFcm=async (fcm,e,notificationData,users,dbName)=>{
    // logger.debug("=====FCM====>>",fcm,e,notificationData,users,dbName)
    logger.debug("=========User==>>",fcm)
    let sound=await universal.getSound(dbName);

    let usersData=[],user;
    let fcm_server_key = await universal.getFcmServerKey(dbName);
    if(fcm_server_key!=""){
        // fcm = new FCM(fcm_server_key);
        fcm=new NODE_FCM(fcm_server_key)
    }else{
        // fcm = new FCM(config.get('server.fcm_server_key'));
        fcm=new NODE_FCM(config.get('server.fcm_server_key'))
    }
    
    var message = { 
        registration_ids:e,        
       // to: deviceToken,
       priority: 'high',
       notification: {
           title: notificationData.title, 
           body: notificationData.message,
           android_channel_id: "cnid",
           type : notificationData.status,
           badge:0,
           sound:sound
       },
        data: {  //you can send only notification or only data(or include both)
           orderId: 0,
           status: 0,
           self_pickup:0
       }
   };
    return new Promise((resolve,reject)=>{

        fcm.send(message, function(err, response){
            var values = new Array();
            var insertLength = "(?,?,?),";
            var querystring = '';
            if(users.length){
                logger.debug("====Entr====>>")
                for(var i=0;i<users.length;i++){
                    (async function (i) {

                        for(const[index,j] of e.entries()){

                            if(j==users[i].device_token){
                                values.push(users[i].id,notificationData.message,notificationData.status);
                                querystring = querystring + insertLength;
                            }

                            // user=_.find(users,function(obj) { return obj.device_token == i })
                            // usersData.push(user)
                        }

                       
                                if (i == users.length - 1) {
                                
                                        querystring = querystring.substring(0, querystring.length - 1);
                                        // logger.debug("====LOOP==END===querystring=>>",values)
                                        // var sql="insert into push_notifications(user_id,notification_message,notification_status) values"+querystring;
                                        // await Execute.Query(dbName,sql,values);
                                    
                                        resolve()
                                 }
                    }(i))
                }
            }
            else{
                resolve()
            }

            logger.debug("==========notification errror===========",err);
            // if (err) {
            //     console.log("Something has gone wrong!",err);
            //     callback(err,[]);
            // } else {
            //     console.log("Successfully sent with response: ", response);
            //     callback(null);
                
            // }
            // callback(null);
         
        });
    })
}
exports.sendFcmPushNotificationToAgent=(dbName,deviceTokens,notificationData)=>{
    return new Promise(async (resolve,reject)=>{
        logger.debug("=deviceTokens=",deviceTokens)
        var fcm =''
        let fcm_server_key = await universal.getFcmServerKey(dbName);
        let sound=await universal.getSound(dbName);
        notificationData["sound"]=sound
        if(fcm_server_key!=""){
            fcm = new FCM(fcm_server_key);
        }else{
            fcm = new FCM(config.get('server.fcm_server_key'));
        }
        logger.debug("=====fcm_server_keyf",fcm_server_key)
        var message = {
            to: deviceTokens,
            priority: 'high',
            notification: {
                title: notificationData.title, 
                body: notificationData.message,
                android_channel_id: "cnid",
                type : notificationData.type,
                badge:0,
                sound:sound
            },
             data: notificationData
        };
        logger.debug("==========SERVER===========",message);
        fcm.send(message, function(err, response){
            if (err) {
                console.log("Something has gone wrong!",err);
            } else {
                console.log("Successfully sent with response: ", response);
            }
            resolve()
        });
    })
}


exports.chatmessagePushNotification = async(dbName,payload ,receieverDetails,receiver_created_id,senderDetails,sender_created_id)=>{
    return new Promise(async (resolve,reject)=>{
        let sound=await universal.getSound(dbName);
        let userChatSave=await Execute.Query(dbName,"select `key`,`value` from tbl_setting where `key`=?",["save_user_chat"]);
        let senderIds=senderDetails && senderDetails.length>0?senderDetails[0].id:0
        if(userChatSave && userChatSave.length>0){
            let _isAdmin=0;
            if(payload.is_admin){
                _isAdmin=1
            }
            await Execute.Query(dbName,`insert into push_notifications(user_id,supplier_id,branchId,notification_message,notification_status,is_read,order_id,is_admin,notification_type) values(?,?,?,?,?,?,?,?,?)`,[receieverDetails.id,senderIds,0,payload.text,0,0,0,_isAdmin,"chat"])
        }
        var fcm = "";
        let fcm_server_key = await universal.getFcmServerKey(dbName);
        
        
        if(fcm_server_key!=""){
            fcm = new FCM(fcm_server_key);
        }else{
            fcm = new FCM(config.get('server.fcm_server_key'));
        }
        let senderId=senderDetails && senderDetails.length>0?senderDetails[0].id:0
        // var fcm = new FCM(config.get('server.fcm_server_key'));
        let firstname,notificationData ={
          firstname: firstname, 
          id : receieverDetails.id ,
          user_image : receieverDetails.user_image,
          chat_type  : payload.chat_type, 
          device_token:receieverDetails.device_token,
          text: payload.text,
          type: "chat",
          date:Date.now().toString(),
          order_id : payload.order_id,
          sender_name : senderDetails[0].firstname || senderDetails[0].name,
          sender_image : senderDetails[0].user_image,
          sender_info_id:senderId,
          sender_type:payload.sender_type,
          message_id:payload.message_id,
          send_by_type:payload.sender_type,
          sound:sound,
          user_id:payload.user_id!=undefined?payload.user_id:0
        }; 
        let chat_title = ""
        if(payload.is_admin){
            notificationData.is_admin=1
        }

        if(payload.type==1){
            chat_title = notificationData.sender_name
            // chat_title = "Agent App"
            // notificationData.user_id = payload.sent_by
            notificationData.user_id = sender_created_id
        }else{
            chat_title = notificationData.sender_name
            // chat_title = "Customer App"
            notificationData.agent_created_id = sender_created_id


        }
        console.log("================notificationData===========",notificationData,            notificationData.agent_created_id )
      if(receieverDetails.type == constant.TYPE.USER)
          firstname  =  receieverDetails.firstname + receieverDetails.lastname;
         
          
      else if(receieverDetails.type == constant.TYPE.AGENT)
          firstname  =  receieverDetails.name;
           let  message = { 
               to : receieverDetails.device_token,  
                notification: {
                  title: chat_title,
                  body: payload.text,
                  type : "chat",
                  sound:sound,
                  badge:0
              },
              data:notificationData,
              priority: 'high'	   
          };
         console.log("==message==>>",message)
          fcm.send(message, function(err, response){
              if (err){
                logger.debug("Something has gone wrong!",err);
                resolve();
              }
               else {
                logger.debug("Successfully sent with response: ",message,  response);
                resolve();
               }
              
          });
    })
}  

exports.sendAndroidPushNotificationToSupplierV1 = async function(dbName,deviceToken, message2,type,callback) {
    console.log(".....pushNotification......",message2);
    let sound=await universal.getSound(dbName);
    let fcm_server_key = await universal.getFcmServerKey(dbName);
    if(fcm_server_key!=""){
        fcm = new FCM(fcm_server_key);
    }else{
        fcm = new FCM(config.get('server.fcm_server_key'));
    }
    console.log("====fcm_server_key====",fcm_server_key);
    var message = {
        to: deviceToken, // required
        collapse_key: 'demo',
        notification: {
            title: message2.title,
            body: message2.message,
            tag:message2.status,
            sound:sound,
            extra:message2.message
        },
        data : {
            "orderId" : message2.data,
            "sound":sound
        }
    }

    logger.debug("==========SERVER===========",message);

    fcm.send(message, function(err, response){
        logger.debug("==========notification errror===========",err,response);
        // if (err) {
        //     console.log("Something has gone wrong!",err);
        //     callback(err,[]);
        // } else {
        //     console.log("Successfully sent with response: ", response);
        //     callback(null);
            
        // }
        callback(null);
    });
}