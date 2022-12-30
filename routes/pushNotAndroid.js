/**
 * Created by cbl97 on 19/5/16.
 */
var gcm = require('node-gcm');
var moment = require('moment');
var async = require('async');
var apns = require('apn');
var funct = require('./commonfunction');

// function androidNotification() {
//     var token =[], userId=[];
//     var dd = moment.utc().format('YYYY-MM-DD HH:mm:ss');
//     var d = dd.toString();
//     console.log(typeof d);

//     async.waterfall([
//         function(callback)
//         {
//             var sql = " select user.id , user.device_token , order_prices.product_name " +
//                 " from orders " +
//                 "  join user on orders.user_id = user.id " +
//                 " join order_prices on order_prices.order_id = orders.id " +
//                 " where orders.status!=4 and user.notification_status!=1 and user.device_type=0 and 1 < DATEDIFF(orders.delivered_on , '"+d+"' ) < 3 ";
            
//             // console.log(sql);
//             multiConnection[dbName].query(sql, function (err, result) {
//                 console.log('...............========',result);
//                 if (err)
//                 {
//                     console.log(" while sending push ", err);
//                     // res.send("error");
//                 }
//                     else if(!result.length)
//                 {
//                     // res.send("error");
//                     console.log("Err");

//                 }

//                 else {
//                     if(result.length)
//                     {
//                         // console.log(result);
//                         for(var i=0;i<result.length;i++)
//                         {
//                             (function(i)
//                             {
//                                 token.push(result[i].device_token);
//                                 userId.push(result[i].id);
//                                 var message = result[i].product_name;
//                                 var deviceToken = result[i].device_token;
//                                 pushNotificationAndroid(message,deviceToken);
//                                 callback(null);
//                             })(i);
//                         }

//                     }
//                     else {
//                         // res.send("error");
//                     }

//                 }
//             });
//         },
//         function(data,callback)
//         {
//             if(data.length)
//                 updatePushFlag(data,function(err,result)
//                 {
//                     if(err)
//                         callback(err);
//                     else
//                         callback(null);
//                 });
//             else
//                 callback(null);

//         }

//     ],function(err,result)
//     {
//         if(err)
//         {
//            console.log("error==---while android pushing")
//         }
//         else
//             console.log("final result");
//     })
// }
/*
* ----------------------------------
* android notification function
* ----------------------------------
* */


function pushNotificationAndroid(message,deviceToken,callback)
{
    console.log(".............sendAndroidPushNotification.......");
    var brandName = "betterButter";

    var gcmSender = "AIzaSyDsqgtXNmV6zCmwe1-vUSz53BrehHN7krk";
    // var deviceTokens = result[i].device_token;


        var message = new gcm.Message({
            collapseKey: 'demo',
            delayWhileIdle: false,
            timeToLive: 2419200,
            data: message
    });
    var sender = new gcm.Sender(gcmSender);

    // console.log("sender", sender)
    // console.log("deviceTokens",deviceToken)
    // console.log("message",message)

    sender.send(message, deviceToken, 4, function (err, result1) {
        if(err)
        {
            console.log("err", err);
            // callback(err);

        }
        else
        {
            console.log("result", result1);
            // callback(null);

        }
    });
}

/*
 ==============================================
 Send the notification to the ios device
 =============================================
 */

function pushNotificationIos(message,deviceToken)
{
    /*
     ==========================================================
     Send the notification to the iOS device for customer
     ==========================================================
     */


    var certificate;
    var gateway;

    if (USER_TYPE === Config.APP_CONSTANTS.DATABASE.USER_ROLES.CUSTOMER || !USER_TYPE) {
        certificate = Path.resolve("") + Config.pushConfig.iOSPushSettings.customer.iosApnCertificate;
        gateway = Config.pushConfig.iOSPushSettings.customer.gateway;
    }

    // logger.info("GATEWAY: ", gateway);
    // logger.info("IOS certi: ", certificate);

    var status = 1;
    var msg = message;
    var snd = 'ping.aiff';
    var token = deviceToken;


    var options = {
        cert: certificate,
        certData: null,
        key: certificate,
        keyData: null,
        passphrase: 'click',
        ca: null,
        pfx: null,
        pfxData: null,
        gateway: gateway,
        port: 2195,
        rejectUnauthorized: true,
        enhanced: true,
        cacheLength: 100,
        autoAdjustCache: true,
        connectionTimeout: 0,
        ssl: true
    };
    var apnsConnection = new apns.Connection(options);
    var note = new apns.Notification();

    console.log("............................msg....",msg);

    note.expiry = Math.floor(Date.now() / 1000) + 3600;
    note.contentAvailable = true; //1;
    note.sound = snd;
    note.alert =  message;
    note.newsstandAvailable = status;
    note.payload = message;// {message: payload};


    if (!token || token == "(null)" || token == "deviceToken" || !token.length || token.length !== 64) {
        {
            console.log("IOS PUSH ERROR with Token: ", token);

        }

    } else {
        var device = new apns.Device(token);
        apnsConnection.pushNotification(note, device);
    }
}
/*

function iosNotification()  {
    var token =[];
    var dd = moment.utc().format('YYYY-MM-DD HH:mm:ss');
    var d = dd.toString();
    console.log(typeof d);

    async.waterfall([
        function(cb)
        {
            var sql = " select  user.device_token , order_prices.product_name " +
                " from orders " +
                "  join user on orders.user_id = user.id " +
                " join order_prices on order_prices.order_id = orders.id " +
                " where orders.status!=4 and user.notification_status!=1 and user.device_type=1 and 1 < DATEDIFF(orders.delivered_on , ' 2016-05-19 09:30:33 ' ) < 3 ";
            console.log(sql);
            multiConnection[dbName].query(sql, function (err, result) {
                if (err)
                {
                    console.log(" while sending push ", err);
                    cb(err);
                }

                else {
                    for(var i=0;i<result.length;i++)
                    {

                        (function(i)
                        {

                            /!*
                             ==========================================================
                             Send the notification to the iOS device for customer
                             ==========================================================
                             *!/

                                logger.debug("IOS PUSH PAYLOAD: ", payload);
                                var certificate;
                                var gateway;

                                if (USER_TYPE === Config.APP_CONSTANTS.DATABASE.USER_ROLES.CUSTOMER || !USER_TYPE) {
                                    certificate = Path.resolve("") + Config.pushConfig.iOSPushSettings.customer.iosApnCertificate;
                                    gateway = Config.pushConfig.iOSPushSettings.customer.gateway;
                                }

                                // logger.info("GATEWAY: ", gateway);
                                // logger.info("IOS certi: ", certificate);

                                var status = 1;
                                var msg = result[i].product_name;
                                var snd = 'ping.aiff';
                                var token = result[i].device_token;


                                var options = {
                                    cert: certificate,
                                    certData: null,
                                    key: certificate,
                                    keyData: null,
                                    passphrase: 'click',
                                    ca: null,
                                    pfx: null,
                                    pfxData: null,
                                    gateway: gateway,
                                    port: 2195,
                                    rejectUnauthorized: true,
                                    enhanced: true,
                                    cacheLength: 100,
                                    autoAdjustCache: true,
                                    connectionTimeout: 0,
                                    ssl: true
                                };
                                var apnsConnection = new apns.Connection(options);
                                var note = new apns.Notification();

                                console.log("............................msg....",msg);

                                note.expiry = Math.floor(Date.now() / 1000) + 3600;
                                note.contentAvailable = true; //1;
                                note.sound = snd;
                                note.alert =  result[i].product_name;
                                note.newsstandAvailable = status;
                                note.payload = result[i].product_name;// {message: payload};


                                    if (!token || token == "(null)" || token == "deviceToken" || !token.length || token.length !== 64) {
                                        {
                                            console.log("IOS PUSH ERROR with Token: ", token);

                                        }

                                    } else {
                                        var device = new apns.Device(token);
                                        apnsConnection.pushNotification(note, device);
                                        if(i==result.length-1)
                                        {
                                            console.log("1======")
                                            cb(null,userId);
                                        }

                                    }


                        })(i);

                    }

                }
            });


        }

    ],function(err,result)
    {
        if(err)
        {
            var msg = "err while sending push notification";
            sendResponse.sendErrorMessage(msg, res, constant.responseMessage.NO_DATA_FOUND);
        }
        else
            console.log("final result");
    })



}
*/

// function updatePushFlag(id ,callback)
// {   console.log("updating push flag");
//     console.log("=========",id)
//     for(var i=0;i<id.length;i++)
//     {
//         (function(i)
//         {
//             var sql = "UPDATE user SET notification_status='1' WHERE id=?";
//             multiConnection[dbName].query(sql , [id[i]] ,function(err,result)
//             {
//                 if(err)
//                 {
//                     console.log("err===",err);
//                     callback(err);
//                 }

//                 else
//                    if(i==id.length-1)
//                         callback(null);
//             })


//         })(i);
//     }

// }

// module.exports =
// {
//     androidNotification : androidNotification ,
//     iosNotification : iosNotification
// }
// 
// 


