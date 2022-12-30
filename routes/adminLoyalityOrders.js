/**
 * Created by cbl98 on 14/6/16.
 */

var func = require('./commonfunction');
var async = require('async');
var sendResponse = require('./sendResponse');
var constant = require('./constant');
var pushNotifications = require('./pushNotifications');

var log4js=require("log4js")
var logger = log4js.getLogger();
logger.level = 'debug';


exports.orderListing = function (req, res) {
    var accessToken = 0;
    var sectionId = 0;
    var adminId;
    var data;
    async.auto({
        blankField: function (cb) {
            if (req.body && req.body.accessToken && req.body.authSectionId) {
                accessToken = req.body.accessToken;
                sectionId = req.body.authSectionId;
                cb(null);
            }
            else {
                sendResponse.parameterMissingError(res);
            }
        },
        authenticate: ['blankField', function (cb) {
            func.authenticateAccessToken(req.dbName,accessToken, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    adminId = result;
                 //   console.log("adminId:  ", adminId);
                    cb(null);
                }

            }, 1)
        }],
        checkauthority: ['authenticate', function (cb) {
            func.checkforAuthorityofThisAdmin(req.dbName,adminId, sectionId, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    console.log("checkauthority complete");
                    cb(null);
                }
            });

        }],
        orderlist: ['blankField', 'authenticate', 'checkauthority', function (cb) {
            loyalityOrderListing(req.dbName,res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    data = result;
                    // console.log('data----', result);
                    cb(null);
                }
            })

        }]
    }, function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        } else {

            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

        }
    })
}

exports.orderDescription = function (req, res) {
    var accessToken = 0;
    var sectionId = 0
    var orderId = 0;
    var adminId;
    var data;
    async.auto({
        blankField: function (cb) {
            if (req.body && req.body.accessToken && req.body.authSectionId && req.body.orderId) {
                accessToken = req.body.accessToken;
                sectionId = req.body.authSectionId;
                orderId = req.body.orderId;
                cb(null);
            }
            else {
                sendResponse.parameterMissingError(res);
            }
        },
        authenticate: ['blankField', function (cb) {
            func.authenticateAccessToken(req.dbName,accessToken, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    adminId = result;
           //         console.log("adminId:  ", adminId);
                    cb(null);
                }

            }, 1)
        }],
        checkauthority: ['authenticate', function (cb) {
            func.checkforAuthorityofThisAdmin(req.dbName,adminId, sectionId, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
              //      console.log("checkauthority complete");
                    cb(null);
                }
            });

        }],
        orderdescription: ['blankField', 'authenticate', 'checkauthority', function (cb) {
            orderDescription(req.dbName,res, orderId, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    data = result;
              //      console.log('data----', result);
                    cb(null);
                }
            })

        }]
    }, function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        } else {
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })

}

exports.confirmPendingOrder = function (req, res) {
    var accessToken = 0;
    var sectionId = 0;
    var orderId = 0;
    var status = 0;
    var adminId = 0;
    var data =[];
    var deviceToken = 0;
    var userId = 0;
    var deviceType = 0;
    var supplierId = 0;
    var supplierName = 0;
    var notificationStatus;
    var notificationLanguage;
    var message;
    var flag=0;
    console.log("........req......",req.body)
    
    
    console.log(".********************************res****************",req.body);
    
    
    async.auto({
            blankField: function (cb) {
                if (req.body && req.body.accessToken && req.body.authSectionId && req.body.orderId && req.body.status) {
                    accessToken = req.body.accessToken;
                    sectionId = req.body.authSectionId;
                    orderId = req.body.orderId;
                    status = req.body.status;
                    cb(null);
                }
                else {
                    sendResponse.parameterMissingError(res);
                }
            },
            authenticate: ['blankField', function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, function (err, result) {
                    if (err) {
                        sendResponse.somethingWentWrongError(res);
                    }
                    else {
                        adminId = result;
                        cb(null);
                    }

                }, 1)
            }],
            checkauthority: ['authenticate', function (cb) {
                func.checkforAuthorityofThisAdmin(req.dbName,adminId, sectionId, res, function (err, result) {
                    if (err) {
                        sendResponse.somethingWentWrongError(res);
                    }
                    else {
                        cb(null);
                    }
                });

            }],
            pendingOrder: ['checkauthority', function (cb) {

                confirmPendingOrder(req.dbName,res, orderId, status, function (err, result) {
                    
                    if (err) {
                        sendResponse.somethingWentWrongError(res);
                    }
                    else {
                        flag=result;
                        cb(null);
                    }
                })

            }],
            notificationData: ['pendingOrder', function (cb) {
               var sql='select s.name,u.notification_status,u.notification_language,u.device_token,u.device_type,u.id from loyalty_order lo join user u on u.id = lo.user_id join ' +
                'supplier_branch sb on sb.id=lo.supplier_branch_id join supplier_ml s on s.supplier_id = sb.supplier_id and s.language_id=u.notification_language where lo.id =? '
                multiConnection[req.dbName].query(sql,[orderId],function (err,result) {
                        if (err) {
                            sendResponse.somethingWentWrongError(res);
                        }
                    else {
                            console.log(".....",result);
                            deviceToken=result[0].device_token;
                            deviceType=result[0].device_type;
                            notificationStatus=result[0].notification_status;
                            notificationLanguage=result[0].notification_language;
                            supplierName=result[0].name;
                            cb(null)
                        }
                    
                })
            }],
            sendPushNotification: ['notificationData', function (cb) {
                if (status == 1) {
                    if (notificationStatus == 0) {
                        return cb(null);
                    }
                    else {
                        if (deviceType == 0) {
                            if (notificationLanguage == 14) {
                                var data = {
                                    "status": 0,
                                    "message":" Your Loyalty Order Has been Confirmed",

                                }
                            }
                            else {
                                var data = {
                                    "status": 0,
                                    "message": "وقد أكد لنا الولاء ترتيب",

                                }
                            }
                            /*      message = data.message;
                             console.log("......",message);*/
                            pushNotifications.sendAndroidPushNotification(deviceToken,data,function (err, result) {
                                console.log(".........errrrrrr.......",err,result);
                                if (err) {
                                    console.log("err2",err);
                                    cb(null)
                                }
                                else {
                                    //console.log("push sent");
                                    cb(null);
                                }
                            });
                        }
                        else {
                            if (notificationLanguage == 14) {
                                var data = {
                                    "status": 0,
                                    "message":"our Loyalty Order Has been Confirmed",

                                    //  "data": {"supplier_name": supplierName}
                                }
                            }
                            else {
                                var data = {
                                    "status": 0,
                                    "message":"وقد أكد لنا الولاء ترتيب",
                                }
                            }

                            var path ="user";
                            var sound = "ping.aiff";
                            pushNotifications.sendIosPushNotification(deviceToken,data,path,sound,function (err, result) {
                                console.log(".........errrrrrr.......",err,result);
                                if (err) {
                                    console.log("err2",err);
                                    cb(null)
                                }
                                else {
                                    //console.log("push sent");
                                    cb(null);
                                }
                            });
                        }
                    }
                }
                else {
                    if (notificationStatus == 0) {
                        return  cb(null);
                    }
                    else {
                        if (deviceType == 0) {
                            if (notificationLanguage == 14) {
                                var data = {
                                    "status":1,
                                    "message": "Regret Your Order Has Been Rejected From "+supplierName,

                                    //   "data": {"supplier_name": supplierName}
                                }
                            }
                            else {
                                var data = {
                                    "status":1,
                                    "message": "مع الاسف تم رفض طلبك من قبل "+supplierName,

                                    //   "data": {"supplier_name": supplierName}
                                }
                            }
                            message = data.message;
                            pushNotifications.sendAndroidPushNotification(deviceToken, data, cb);
                        }
                        else {
                            if (notificationLanguage == 14) {
                                var data = {
                                    "status":1,
                                    "message": "Regret Your Order Has Been Rejected From "+supplierName,


                                    //  "data": {"supplier_name": supplierName}
                                }
                            }
                            else {
                                var data = {
                                    "status": 1,
                                    "message": "مع الاسف تم رفض طلبك من قبل "+supplierName,


                                    //  "data": {"supplier_name": supplierName}
                                }
                            }
                            var path ="user";
                            var sound = "ping.aiff";
                            pushNotifications.sendIosPushNotification(deviceToken,data,path,sound,function (err, result) {
                                console.log(".........errrrrrr.......",err,result);
                                if (err) {
                                    console.log("err2",err);
                                    cb(null)
                                }
                                else {
                                    //console.log("push sent");
                                    cb(null);
                                }
                            });
                        }
                    }
                }
            }],
       /*     notificationData: ['pendingOrder', function (cb) {
                getValue(res, orderId, function (err, values) {
                    if (err) {
                        sendResponse.somethingWentWrongError(res);
                    }
                    else {
                        deviceToken = values.device_token;
                        userId = values.user_id;
                        deviceType = values.device_type;
                        supplierId = values.supplier_id;
                        supplierName = values.supplier_name;
                        notificationLanguage = values.notification_language;
                        notificationStatus = values.notification_status;
                        cb(null);
                    }
                });
            }],*/
        /*    sendPushNotification: ['notificationData', function (cb)
            {
                if (status == 1) 
                {
                    if(flag==1){
                        if (notificationStatus == 0) {
                            cb(null);
                        }
                        else {
                            if (deviceType == 0) {

                                if (notificationLanguage == 14) {
                                    var data = {
                                        "status": constant.pushNotificationStatus.ORDER_ACCEPTED,
                                        "message": constant.pushNotificationMessage.ORDER_ACCEPTED_ENGLISH,
                                        "data": {"supplier_name": supplierName}
                                    }
                                }
                                else {
                                    var data = {
                                        "status": constant.pushNotificationStatus.ORDER_ACCEPTED,
                                        "message": constant.pushNotificationMessage.ORDER_ACCEPTED_ARABIC,
                                        "data": {"supplier_name": supplierName}
                                    }
                                }
                                message = data.message;

                                pushNotifications.sendAndroidPushNotification(deviceToken, data, function (err, result) {
                                    if (err) {
                                        var msg = "something went wrong";
                                        return sendResponse.sendErrorMessage(msg, res, 500);
                                    }
                                    else {
                                        cb(null);
                                    }

                                });
                            }
                            else {
                                if (notificationLanguage == 14) {
                                    var data = {
                                        "status": constant.pushNotificationStatus.ORDER_ACCEPTED,
                                        "message": constant.pushNotificationMessage.ORDER_ACCEPTED_ENGLISH,
                                        "data": {"supplier_name": supplierName}
                                    }
                                }
                                else {
                                    var data = {
                                        "status": constant.pushNotificationStatus.ORDER_ACCEPTED,
                                        "message": constant.pushNotificationMessage.ORDER_ACCEPTED_ARABIC,
                                        "data": {"supplier_name": supplierName}
                                    }
                                }

                                message = data.message;

                                pushNotifications.sendIosPushNotification(deviceToken, data, message, function (err, result) {
                                    if (err) {
                                        var msg = "something went wrong";
                                        return sendResponse.sendErrorMessage(msg, res, 500);
                                    }
                                    else {
                                        cb(null);
                                    }
                                });
                            }
                        }
                    }
                    else{
                        if (notificationStatus == 0) {
                            cb(null);
                        }
                        else {
                            if (deviceType == 0) {

                                if (notificationLanguage == 14) {
                                    var data = {
                                        "status": constant.pushNotificationStatus.LOYALITY_ORDER_REJECTED,
                                        "message": constant.pushNotificationMessage.LOYALITY_ORDER_REJECTED_ENGLISH,
                                        "data": {"supplier_name": supplierName,"orderId":orderId}
                                    }
                                }
                                else {
                                    var data = {
                                        "status": constant.pushNotificationStatus.LOYALITY_ORDER_REJECTED,
                                        "message": constant.pushNotificationMessage.LOYALITY_ORDER_REJECTED_ARABIC,
                                        "data": {"supplier_name": supplierName,"orderId":orderId}
                                    }
                                }
                                message = data.message;

                                pushNotifications.sendAndroidPushNotification(deviceToken, data, function (err, result) {
                                    if (err) {
                                        var msg = "something went wrong";
                                        return sendResponse.sendErrorMessage(msg, res, 500);
                                    }
                                    else {
                                        cb(null);
                                    }

                                });
                            }
                            else {
                                if (notificationLanguage == 14) {
                                    var data = {
                                        "status": constant.pushNotificationStatus.LOYALITY_ORDER_REJECTED,
                                        "message": constant.pushNotificationMessage.LOYALITY_ORDER_REJECTED_ENGLISH,
                                        "data": {"supplier_name": supplierName,"orderId":orderId}
                                    }
                                }
                                else {
                                    var data = {
                                        "status": constant.pushNotificationStatus.LOYALITY_ORDER_REJECTED,
                                        "message": constant.pushNotificationMessage.LOYALITY_ORDER_REJECTED_ARABIC,
                                        "data": {"supplier_name": supplierName,"orderId":orderId}
                                    }
                                }

                                message = data.message;

                                pushNotifications.sendIosPushNotification(deviceToken, data, message, function (err, result) {
                                    if (err) {
                                        var msg = "something went wrong";
                                        return sendResponse.sendErrorMessage(msg, res, 500);
                                    }
                                    else {
                                        cb(null);
                                    }
                                });
                            }
                        }
                    }
                }
                else {

                    if (notificationStatus == 0) {
                        cb(null);
                    }
                    else {
                        if (deviceType == 0) {

                            if (notificationLanguage == 14) {
                                var data = {
                                    "status": constant.pushNotificationStatus.ORDER_REJECTED,
                                    "message": constant.pushNotificationMessage.ORDER_REJECTED_ENGLISH,
                                    "data": {"supplier_name": supplierName}
                                }
                            }
                            else {
                                var data = {
                                    "status": constant.pushNotificationStatus.ORDER_REJECTED,
                                    "message": constant.pushNotificationMessage.ORDER_REJECTED_ARABIC,
                                    "data": {"supplier_name": supplierName}
                                }
                            }
                            message = data.message;
                            pushNotifications.sendAndroidPushNotification(deviceToken, data, cb);
                        }
                        else {
                            if (notificationLanguage == 14) {
                                var data = {
                                    "status": constant.pushNotificationStatus.ORDER_REJECTED,
                                    "message": constant.pushNotificationMessage.ORDER_REJECTED_ENGLISH,
                                    "data": {"supplier_name": supplierName}
                                }
                            }
                            else {
                                var data = {
                                    "status": constant.pushNotificationStatus.ORDER_REJECTED,
                                    "message": constant.pushNotificationMessage.ORDER_REJECTED_ARABIC,
                                    "data": {"supplier_name": supplierName}
                                }
                            }
                            message = data.message;

                            pushNotifications.sendIosPushNotification(deviceToken, data, message, cb);
                        }
                    }
                }
            }],*/
          /*  savePushNotification: ['sendPushNotification', function (cb) {
                if (notificationStatus == 0) {
                    cb(null);
                }
                else {
                    if (status == 1) {
                        if(flag==1){
                            saveNoticationData(res, userId, supplierId, orderId, constant.pushNotificationStatus.ORDER_ACCEPTED, message, cb)
                        }
                        else{
                            saveNoticationData(res, userId, supplierId, orderId, constant.pushNotificationStatus.LOYALITY_ORDER_REJECTED, message, cb)
                        }
                    }
                    else {
                        saveNoticationData(res, userId, supplierId, orderId, constant.pushNotificationStatus.ORDER_REJECTED, message, cb)
                    }
                }

            }]*/
        },
        function (err, result) {
            if (err) {
                sendResponse.somethingWentWrongError(res);
            } else {
                data = [];
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        })
}

exports.orderShipped = function (req, res) {
    var accessToken = 0;
    var sectionId = 0;
    var orderId = 0;
    var status = 0;
    var adminId = 0;
    var data;
    async.auto({
        blankField: function (cb) {
            if (req.body && req.body.accessToken && req.body.authSectionId && req.body.orderId && req.body.status) {
                accessToken = req.body.accessToken;
                sectionId = req.body.authSectionId;
                orderId = req.body.orderId;
                status = req.body.status;
                cb(null);
            }
            else {
                sendResponse.parameterMissingError(res);
            }
        },
        authenticate: function (cb) {
            func.authenticateAccessToken(req.dbName,accessToken, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                } else {
                    adminId = result;
                    cb(null);
                }
            }, 1)
        },
        checkauthority: ['authenticate', function (cb) {
            func.checkforAuthorityofThisAdmin(req.dbName,adminId, sectionId, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    cb(null);
                }
            });

        }],
        ShippedOrder: ['blankField', 'authenticate', 'checkauthority', function (cb) {
            orderShipped(req.dbName,res, orderId, status, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    data = [];
                    cb(null);
                }
            })

        }]
    }, function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);

        } else {
            data = [];
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

        }
    })
}

exports.orderNearby = function (req, res) {
    var accessToken = 0;
    var sectionId = 0;
    var orderId = 0;
    var status = 0;
    var adminId = 0;
    var data;
    async.auto({
        blankField: function (cb) {
            if (req.body && req.body.accessToken && req.body.authSectionId && req.body.orderId && req.body.status) {
                accessToken = req.body.accessToken;
                sectionId = req.body.authSectionId;
                orderId = req.body.orderId;
                status = req.body.status;
                cb(null);
            }
            else {
                sendResponse.parameterMissingError(res);
            }
        },
        authenticate: ['blankField', function (cb) {
            func.authenticateAccessToken(req.dbName,accessToken, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    adminId = result;
                    cb(null);
                }

            }, 1)
        }],
        checkauthority: ['authenticate', function (cb) {
            func.checkforAuthorityofThisAdmin(req.dbName,adminId, sectionId, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    cb(null);
                }
            });

        }],
        OrderNearby: ['blankField', 'authenticate', 'checkauthority', function (cb) {
            orderNearby(req.dbName,res, orderId, status, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    data = [];
                    cb(null);
                }
            })

        }]
    }, function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);

        } else {
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })
}

exports.deliveredOrder = function (req, res) {
    var accessToken = 0;
    var sectionId = 0;
    var orderId = 0;
    var status = 0;
    var adminId = 0;
    var data;
    var deviceToken = 0;
    var userId = 0;
    var deviceType = 0;
    var supplierId = 0;
    var supplierName = 0;
    var notificationStatus;
    var notificationLanguage;
    var message;
    async.auto({
        blankField: function (cb) {
            if (req.body && req.body.accessToken && req.body.authSectionId && req.body.orderId && req.body.status) {
                accessToken = req.body.accessToken;
                sectionId = req.body.authSectionId;
                orderId = req.body.orderId;
                status = req.body.status;
                cb(null);
            }
            else {
                sendResponse.parameterMissingError(res);
            }
        },
        authenticate: ['blankField', function (cb) {
            func.authenticateAccessToken(req.dbName,accessToken, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    adminId = result;
                    cb(null);
                }

            }, 1)
        }],
        checkauthority: ['authenticate', function (cb) {
            func.checkforAuthorityofThisAdmin(req.dbName,adminId, sectionId, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    cb(null);
                }
            });

        }],
        deliveredOrder: ['blankField', 'authenticate', 'checkauthority', function (cb) {
            deliveredOrder(req.dbName,res, orderId, status, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    cb(null);
                }
            })

        }],
    }, function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);

        } else {
            data = [];
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })
}

exports.ordersTracked = function (req, res) {
    var accessToken = 0;
    var sectionId = 0;
    var adminId = 0;
    var data;
    async.auto({
        blankField: function (cb) {
            if (req.body && req.body.accessToken && req.body.authSectionId) {
                accessToken = req.body.accessToken;
                sectionId = req.body.authSectionId;
                cb(null);
            }
            else {
                sendResponse.parameterMissingError(res);
            }
        },
        authenticate: ['blankField', function (cb) {
            func.authenticateAccessToken(req.dbName,accessToken, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    adminId = result;
                    cb(null);
                }

            }, 1)
        }],
        checkauthority: ['authenticate', function (cb) {
            func.checkforAuthorityofThisAdmin(req.dbName,adminId, sectionId, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    cb(null);
                }
            });

        }],
        trackedOrders: ['blankField', 'authenticate', 'checkauthority', function (cb) {
            trackedOrders(req.dbName,res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    data = result;
                    cb(null);
                }
            })

        }]
    }, function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);

        } else {
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })
}

exports.updateTrackedOrder = function (req, res) {
    var accessToken = 0;
    var sectionId = 0;
    var adminId = 0;
    var orderId = 0;
    var date = 0;
    var status = 0;
    var data;
    var deviceToken = 0;
    var userId = 0;
    var deviceType = 0;
    var supplierId = 0;
    var supplierName = 0;
    var notificationStatus;
    var notificationLanguage;
    var message;
    async.auto({
        blankField: function (cb) {
            if (req.body && req.body.accessToken && req.body.authSectionId && req.body.orderId && req.body.date && req.body.status) {
                accessToken = req.body.accessToken;
                sectionId = req.body.authSectionId;
                orderId = req.body.orderId;
                date = req.body.date;
                status = req.body.status;
                cb(null);
            }
            else {
                sendResponse.parameterMissingError(res);
            }
        },
        authenticate: ['blankField', function (cb) {
            func.authenticateAccessToken(req.dbName,accessToken, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    adminId = result;
                    cb(null);
                }

            }, 1)
        }],
        checkauthority: ['authenticate', function (cb) {
            func.checkforAuthorityofThisAdmin(req.dbName,adminId, sectionId, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    cb(null);
                }
            });

        }],
        updateTrackedOrder: ['blankField', 'authenticate', 'checkauthority', function (cb) {
            updateOrder(req.dbName,res, status, orderId, date, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    data = [];
                    cb(null);
                }
            })

        }],
        notificationData: ['updateTrackedOrder', function (cb) {
            getValue(req.dbName,res, orderId, function (err, values) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    deviceToken = values.device_token;
                    userId = values.user_id;
                    deviceType = values.device_type;
                    supplierId = values.supplier_id;
                    supplierName = values.supplier_name;
                    notificationLanguage = values.notification_language;
                    notificationStatus = values.notification_status;
                    cb(null);
                }
            });
        }],
        sendPushNotification: ['notificationData', function (cb) {

            if (notificationStatus == 0) {
                cb(null);
            }
            else {
                if (deviceType == 0) {
                    if (notificationLanguage == 14) {
                        var data = {
                            "status": constant.pushNotificationStatus.ORDER_TRACKED,
                            "message": constant.pushNotificationMessage.ORDER_TRACKED_ENGLISH,
                            "data": {"supplier_name": supplierName}
                        }
                    }
                    else {
                        var data = {
                            "status": constant.pushNotificationStatus.ORDER_TRACKED,
                            "message": constant.pushNotificationMessage.ORDER_TRACKED_ARABIC,
                            "data": {"supplier_name": supplierName}
                        }
                    }

                    message = data.message;

                    pushNotifications.sendAndroidPushNotification(deviceToken, data, function (err, result) {
                        if (err) {
                            var msg = "something went wrong";
                            return sendResponse.sendErrorMessage(msg, res, 500);
                        }
                        else {
                            cb(null);
                        }

                    });
                }
                else {
                    if (notificationLanguage == 14) {
                        var data = {
                            "status": constant.pushNotificationStatus.ORDER_TRACKED,
                            "message": constant.pushNotificationMessage.ORDER_TRACKED_ENGLISH,
                            "data": {"supplier_name": supplierName}
                        }
                    }
                    else {
                        var data = {
                            "status": constant.pushNotificationStatus.ORDER_TRACKED,
                            "message": constant.pushNotificationMessage.ORDER_TRACKED_ARABIC,
                            "data": {"supplier_name": supplierName}
                        }
                    }
                    message = data.message;
                    pushNotifications.sendIosPushNotification(deviceToken, data, message, function (err, result) {
                        if (err) {
                            var msg = "something went wrong";
                            return sendResponse.sendErrorMessage(msg, res, 500);
                        }
                        else {
                            cb(null);
                        }
                    });
                }
            }


        }],
        savePushNotification: ['sendPushNotification', function (cb) {

            if (notificationStatus == 0) {
                cb(null);
            }
            else {
                saveNoticationData(req.dbName,res, userId, supplierId, orderId, constant.pushNotificationStatus.ORDER_TRACKED, message, cb)
            }

        }]

    }, function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);

        } else {
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })
}

function saveNoticationData (dbName,res, userId, supplierId, orderId, status, message, callback) {
    var sql = "insert into push_notifications(user_id,supplier_id,order_id,notification_message,notification_status) values(?,?,?,?,?) ";
    multiConnection[dbName].query(sql, [userId, supplierId, orderId, message, status], function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null);
        }

    })

}

function getValue(dbName,res, orderId, callback) {
    var sql = "select s.id as supplier_id,s.name,u.id,u.device_token,u.device_type,u.notification_status,u.notification_language from loyalty_order o join user u on o.user_id = u.id join " +
        "supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on s.id = sb.supplier_id where o.id = ? limit 1"
    multiConnection[dbName].query(sql, [orderId], function (err, result) {
        if (err) {
            var msg = "db error :";
            sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            var data = {
                "user_id": result[0].id,
                "device_token": result[0].device_token,
                "device_type": result[0].device_type,
                "supplier_id": result[0].supplier_id,
                "supplier_name": result[0].name,
                "notification_status": result[0].notification_status,
                "notification_language": result[0].notification_language
            }
            callback(null, data);
        }
    })

}

function loyalityOrderListing(dbName,res,callback) {
    var product=[];
    var results=[];
    var cate=[];
    async.auto({
        orders:function (cb) {
            var sql='select sb.supplier_id,lo.id,lo.created_on,s.name as supplier,lo.status,u.email As User_Name,u.mobile_no,lo.service_date as schedule_date ' +
                'from loyalty_order lo join supplier_branch sb on sb.id=lo.supplier_branch_id join supplier s on sb.supplier_id=s.id '+
                'join user u on lo.user_id=u.id  ';
            multiConnection[dbName].query(sql,function (err,orders) {
                if(err)
                {
                    console.log('error------',err);
                    sendResponse.somethingWentWrongError(res);

                }
                else if(orders.length) {
                    results = orders;
                    // console.log('asdf------',results);
                    cb(null);
                }
                else {
                    var data = [];
                    sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,constant.responseStatus.SUCCESS);

                }
            })
        },
        product:['orders',function(cb){
            var sql2='select lop.loyalty_order_id,lop.product_name from loyalty_order_product lop';
            multiConnection[dbName].query(sql2,function (err,product1) {
                if (err) {
                    console.log('error------', err);
                    sendResponse.somethingWentWrongError(res);

                }
                else {
                    for(var i=0;i<results.length;i++) {

                        (function (i) {
                            product=[];
                            for(var j=0;j<product1.length;j++)
                            {

                                (function(j){
                                    if(product1[j].loyalty_order_id == results[i].id)
                                    {
                                        product.push(product1[j].product_name)
                                        if(j==product1.length-1) {
                                            results[i].product=product;
                                        }
                                    }
                                    else {
                                        if(j==product1.length-1)
                                        {
                                            results[i].product=product;
                                        }
                                    }
                                }(j));

                            }
                            if(i==results.length-1)
                            {
                                cb(null);
                            }
                        }(i))

                    }

                }
            })
        }],
        category:['product',function(cb){
            var sql3='select c.name,c.id,lop.loyalty_order_id from loyalty_order_product lop join product p on p.id=lop.product_id join categories c on c.id=p.category_id';
            multiConnection[dbName].query(sql3,function (err,cat) {
                if (err) {
                    console.log('error------', err);
                    sendResponse.somethingWentWrongError(res);

                }
                else {
                    for(var i=0;i<results.length;i++) {

                        (function (i) {
                            cate=[];
                            for(var j=0;j<cat.length;j++)
                            {
                                (function(j){
                                    if(cat[j].loyalty_order_id == results[i].id)
                                    {
                                        cate.push(cat[j].name);
                                        if(j==cat.length-1) {
                                            results[i].category=cate;
                                        }
                                    }
                                    else {
                                        if(j==cat.length-1)
                                        {
                                            results[i].category=cate;
                                        }
                                    }
                                }(j));
                            }
                            if(i==results.length-1)
                            {
                                cb(null);
                            }
                        }(i))
                    }

                }
            })
        }]
    },function(err,data){
        if(err) {
            sendResponse.somethingWentWrongError(res);
        }else{
          //  data=results;
            data=results.sort(func.sort_by('id', true, parseInt));
        //    console.log('final1====',data);
            callback(null,data)
        }
    })
}

function orderDescription(dbName,res,orderId,cb) {
    var sql="select lo.id,lo.created_on,lop.product_name as product,lop.points,s.name as supplier,CONCAT(u.firstname,' ',u.lastname) As User_Name,u.mobile_no," +
        "CONCAT(ua.address_line_1,' ',ua.address_line_2) as Address,lo.status " +
        "from loyalty_order lo join loyalty_order_product lop on lop.loyalty_order_id=lo.id join supplier_branch sb on sb.id=lo.supplier_branch_id " +
        "join supplier s on sb.supplier_id=s.id join product p on p.id=lop.product_id " +
        "join user u on lo.user_id=u.id join user_address ua on ua.id=lo.delivery_address_id where lo.id=?";
    multiConnection[dbName].query(sql,[orderId],function (err,desc) {
        if(err)
        {
            console.log('error------',err);
            sendResponse.somethingWentWrongError(res);

        }
        else {
         //   console.log('desc');
            cb(null,desc);

        }
    })
}

function    confirmPendingOrder(dbName,res,orderid,status,callback) {
    logger.debug("================confirmPendingOrder=========function called===============",status)
    if(status==1)
    {
        var sql= 'update loyalty_order set status= ? where id =? ';
        var stmt = multiConnection[dbName].query(sql,[status,orderid],function(err,result)
        {
            logger.debug("=================after query 1=============",stmt.sql,err)
            if(err)
            {
                    console.log('errr2----', err);
                    sendResponse.somethingWentWrongError(res);
            }
            else
            {
                callback(null,1);
            }
        });
     /*   async.auto({
            getpoints:function (cb) {
                connection.beginTransaction(function (err) {
                    if (err) {
                        console.log('error------', err);
                        sendResponse.somethingWentWrongError(res);
                    }
                    else {
                        var sql = 'select u.id,u.loyalty_points as user_points,lo.total_points as order_points from user u join loyalty_order lo on lo.user_id=u.id where lo.id = ? '
                        multiConnection[dbName].query(sql, [orderid], function (err, result) {
                            if (err) {
                                multiConnection[dbName].rollback(function () {
                                    console.log('errr1----', err);
                                    sendResponse.somethingWentWrongError(res);
                                });
                            }
                            else{
                                userId=result[0].id;
                                userPoints=result[0].user_points;
                                orderPoints=result[0].order_points;
                                cb(null);
                            }
                        })
                    }
                });
            },
            checkPoints:['getpoints',function (cb) {
                console.log("user order",userPoints,orderPoints);
                if(userPoints>=orderPoints){
                    var sql= 'update loyalty_order set status=? where id =? AND status=0';
                    multiConnection[dbName].query(sql,[status,orderid],function(err,result)
                    {
                        if(err)
                        {
                            multiConnection[dbName].rollback(function () {
                                console.log('errr2----', err);
                                sendResponse.somethingWentWrongError(res);
                            });
                        }
                        else
                        {
                            flag=1;
                            cb(null);
                        }
                    });
                }
                else{
                    var sql= 'update loyalty_order set status=? where id =? AND status=0';
                    multiConnection[dbName].query(sql,[2,orderid],function(err,result)
                    {
                        if(err)
                        {
                            multiConnection[dbName].rollback(function () {
                                console.log('errr2----', err);
                                sendResponse.somethingWentWrongError(res);
                            });
                        }
                        else
                        {
                            flag=0;
                            cb(null);
                        }
                    });             
                }
            }],
            updatePoints:['checkPoints',function (cb) {
                if(flag==1){
                    var sql='update user set loyalty_points = loyalty_points - ? where id=?';
                    multiConnection[dbName].query(sql,[orderPoints,userId],function (err,result) {
                        if(err){
                            multiConnection[dbName].rollback(function () {
                                console.log('errr3----', err);
                                sendResponse.somethingWentWrongError(res);
                            })
                        }
                        else{
                            cb(null);
                        }
                    })
                }
                else{
                    cb(null)
                }
            }]
        },function(err,data){
            if(err) {
                multiConnection[dbName].rollback(function () {
                    console.log('errr4----', err);
                    sendResponse.somethingWentWrongError(res);
                })
            }else{
                multiConnection[dbName].commit(function (err) {
                    if(err)
                    {
                        multiConnection[dbName].rollback(function () {
                            console.log('err12-----',err);
                            sendResponse.somethingWentWrongError(res);
                        });
                    }
                    else{
                        console.log('Transaction Complete----');
                        callback(null,flag);
                    }
                });
            }
        })*/

    }
    else
    {
        async.auto({
           updateStatus:function (cb) {
               var sql= 'update loyalty_order set status=? where id=?';
               stmt = multiConnection[dbName].query(sql,[status,orderid],function(err,result)
               {
                   logger.debug("=============after query 2============",err,stmt.sql)
                   if(err)
                   {
                       sendResponse.somethingWentWrongError(res);

                   }
                   else
                   {
                       cb(null);
                   }
               });
           },
           updatePoints:['updateStatus',function (cb) {

               var sql='update user u join loyalty_order lo on u.id=lo.user_id set u.loyalty_points=u.loyalty_points + lo.total_points where lo.id =?'
                stmt = multiConnection[dbName].query(sql,[orderid],function (err,result) {
                    if(err)
                    {
                        logger.debug("=============after query 3===============",stmt.sql,err)
                        sendResponse.somethingWentWrongError(res);

                    }
                    else
                    {
                        cb(null);
                    } 
                })
           }]
        },function (err,result) {
            if(err)
            {
                    console.log('err12-----',err);
                    sendResponse.somethingWentWrongError(res);
            }
            else{
                callback(null,0);
            }
        });
    }

}

function orderShipped (dbName,res,orderid,status,callback) {
    var date = new Date();
    var sql= 'update loyalty_order set status=?,shipped_on=? where id=?';
    multiConnection[dbName].query(sql,[status,date,orderid],function(err,result)
    {
        if(err)
        {
            sendResponse.somethingWentWrongError(res);

        }
        else
        {
            callback(null);
        }
    });
}

function orderNearby (dbName,res,orderid,status,callback) {
    var date = new Date();
    var sql= 'update loyalty_order set status=?,near_on=? where id=?';
    multiConnection[dbName].query(sql,[status,date,orderid],async function(err,result)
    {
        if(err)
        {
            sendResponse.somethingWentWrongError(res);

        }
        else
        {
            let query1 = "select id from orders where id=? and progress_on='0000-00-00 00:00:00'";
            let result1 = await ExecuteQ.Query(dbName,query1,[orderId]);
            if(result1 && result1.length){
                var sql1= 'update orders set progress_on=? where id=? ';
                await ExecuteQ.Query(dbName,sql1,[date,orderid]);
            }
            callback(null);
        }
    });
}

function deliveredOrder (dbName,res,orderid,status,callback) {
    var date = new Date();
    var sql= 'update loyalty_order set status=?,delivered_on=? where id=?';
    multiConnection[dbName].query(sql,[status,date,orderid],function(err,result)
    {
        if(err)
        {
            sendResponse.somethingWentWrongError(res);

        }
        else
        {
            callback(null);
        }
    });
}

function trackedOrders  (dbName,res, callback) {
    var product = [];
    var results = [];
    var cate = [];
    async.auto({
        orders: function (cb) {
            var sql='select lo.id,lo.created_on,s.name as supplier,lo.status,u.email As User_Name,u.mobile_no ' +
                'from loyalty_order lo join supplier_branch sb on sb.id=lo.supplier_branch_id join supplier s on sb.supplier_id=s.id '+
                'join user u on lo.user_id=u.id where lo.status=?';
            multiConnection[dbName].query(sql, [7], function (err, orders) {
                if (err) {
                    console.log('error------', err);
                    sendResponse.somethingWentWrongError(res);

                }
                else if (orders.length) {
                    results = orders;
                  //  console.log('asdf------', results);
                    cb(null);
                }
                else {
                    var data = [];
                    sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

                }
            })
        },
        product: ['orders', function (cb) {
            var sql2='select lop.loyalty_order_id,lop.product_name from loyalty_order_product lop';
            multiConnection[dbName].query(sql2, function (err, product1) {
                if (err) {
                    console.log('error------', err);
                    sendResponse.somethingWentWrongError(res);

                }
                else {
                    for (var i = 0; i < results.length; i++) {

                        (function (i) {
                            product = [];
                            for (var j = 0; j < product1.length; j++) {

                                (function (j) {
                                    if (product1[j].order_id == results[i].id) {
                                        product.push(product1[j].product_name)
                                        if (j == product1.length - 1) {
                                            results[i].product = product;
                                        }
                                    }
                                    else {
                                        if (j == product1.length - 1) {
                                            results[i].product = product;
                                        }
                                    }
                                }(j));

                            }
                            if (i == results.length - 1) {
                                cb(null);
                            }
                        }(i))

                    }

                }
            })
        }],
        category: ['product', function (cb) {
            var sql3='select c.name,c.id,lop.loyalty_order_id from loyalty_order_product lop join product p on p.id=lop.product_id join categories c on c.id=p.category_id';
            multiConnection[dbName].query(sql3, function (err, cat) {
                if (err) {
                    console.log('error------', err);
                    sendResponse.somethingWentWrongError(res);

                }
                else {
                    for (var i = 0; i < results.length; i++) {

                        (function (i) {
                            cate = [];
                            for (var j = 0; j < cat.length; j++) {
                                (function (j) {
                                    if (cat[j].order_id == results[i].id) {
                                        cate.push(cat[j].name);
                                        if (j == cat.length - 1) {
                                            results[i].category = cate;
                                        }
                                    }
                                    else {
                                        if (j == cat.length - 1) {
                                            results[i].category = cate;
                                        }
                                    }
                                }(j));
                            }
                            if (i == results.length - 1) {
                                cb(null);
                            }
                        }(i))
                    }

                }
            })
        }]
    }, function (err, data) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        } else {
            data = results;
           // console.log('final1====', data);
            callback(null, data)
        }
    })

}

function updateOrder (dbName,res,status,orderId,date,callback) {

    var sql= 'update loyalty_order set status=?,service_date =? where id=? AND status =7';
    multiConnection[dbName].query(sql,[status,date,orderId],function(err,result)
    {
        if(err)
        {
            console.log('error------',err);
            sendResponse.somethingWentWrongError(res);

        }
        else
        {
            callback(null);
        }
    });
}
