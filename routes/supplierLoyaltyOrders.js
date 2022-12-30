/**
 * Created by cbl102 on 9/9/16.
 */

var func = require('./commonfunction');
var async = require('async');
var sendResponse = require('./sendResponse');
var constant = require('./constant');
var pushNotifications = require('./pushNotifications');


exports.orderListing = function (req, res) {
    var accessToken = 0;
    var sectionId = 0;
    var supplierId,supplier_id;
    var data={};
    var limit;
    var offset;
    async.auto({
        blankField: function (cb) {
            if (req.body && req.body.accessToken && req.body.authSectionId) {
                accessToken = req.body.accessToken;
                sectionId = req.body.authSectionId;
                if(req.body.limit)
                {
                    limit=parseInt(req.body.limit);
                }
                if(req.body.offset){
                    offset=parseInt(req.body.offset);
                }
                cb(null);
            }
            else {
                sendResponse.parameterMissingError(res);
            }
        },
        authenticate: ['blankField', function (cb) {
            func.authenticateSupplierAccessToken(req.dbName,accessToken, res,function(err,result){
                if(err)
                {
                    sendResponse .somethingWentWrongError(res);
                }
                else
                {
                    supplier_id=result;
                    cb(null);
                }

            },1)
        }],
        // checkauthority: ['authenticate', function (cb) {
        //     func.checkforAuthorityofThisSupplier(req.dbName,supplier_id,sectionId, res,function (err,result) {
        //         if(err)
        //         {
        //             sendResponse.somethingWentWrongError(res);
        //         }
        //         else
        //         {
        //             cb(null);
        //         }
        //     });

        // }],
        supplierId:['authenticate',function (cb) {
            getId(req.dbName,res,supplier_id,function (err,result) {
                if(err)
                {
                    sendResponse.somethingWentWrongError(res);
                }
                else
                {
                    supplierId=result[0].supplier_id;
                    cb(null);
                }
            })
        }],
        orderlist: ['supplierId', function (cb) {
            loyalityOrderListing(req.dbName,res,supplierId,limit,offset,function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    data.orders = result;
                    console.log('data----', result);
                    cb(null);
                }
            })

        }],
        totalOrders:['orderlist',function (cb) {
            var sql='select lo.id,lo.created_on,s.name as supplier,lo.status,u.email As User_Name,u.mobile_no,lo.service_date as schedule_date ' +
                'from loyalty_order lo join supplier_branch sb on sb.id=lo.supplier_branch_id join supplier s on sb.supplier_id=s.id '+
                'join user u on lo.user_id=u.id where s.id =?'

            multiConnection[req.dbName].query(sql,[supplierId],function (err,orders) {
                if(err)
                {
                    console.log('error------',err);
                    sendResponse.somethingWentWrongError(res);

                }
                else {
                    data.total_order=orders.length;
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
    var supplier_id;
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
            func.authenticateSupplierAccessToken(req.dbName,accessToken, res,function(err,result){
                if(err)
                {
                    sendResponse .somethingWentWrongError(res);
                }
                else
                {
                    supplier_id=result;
                    cb(null);
                }

            },1)
        }],
        // checkauthority: ['authenticate', function (cb) {
        //     func.checkforAuthorityofThisSupplier(req.dbName,supplier_id,sectionId, res,function (err,result) {
        //         if(err)
        //         {
        //             sendResponse.somethingWentWrongError(res);
        //         }
        //         else
        //         {
        //             cb(null);
        //         }
        //     });

        // }],
        orderdescription: ['authenticate', function (cb) {
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
    var supplier_id = 0;
    var data =[];
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
                func.authenticateSupplierAccessToken(req.dbName,accessToken, res,function(err,result){
                    if(err)
                    {
                        sendResponse .somethingWentWrongError(res);
                    }
                    else
                    {
                        supplier_id=result;
                        cb(null);
                    }

                },1)
            }],
            // checkauthority: ['authenticate', function (cb) {
            //     func.checkforAuthorityofThisSupplier(req.dbName,supplier_id,sectionId, res,function (err,result) {
            //         if(err)
            //         {
            //             sendResponse.somethingWentWrongError(res);
            //         }
            //         else
            //         {
            //             cb(null);
            //         }
            //     });

            // }],
            pendingOrder: ['authenticate', function (cb) {
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
    var supplier_id = 0;
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
            func.authenticateSupplierAccessToken(req.dbName,accessToken, res,function(err,result){
                if(err)
                {
                    sendResponse .somethingWentWrongError(res);
                }
                else
                {
                    supplier_id=result;
                    cb(null);
                }

            },1)
        }],
        // checkauthority: ['authenticate', function (cb) {
        //     func.checkforAuthorityofThisSupplier(req.dbName,supplier_id,sectionId, res,function (err,result) {
        //         if(err)
        //         {
        //             sendResponse.somethingWentWrongError(res);
        //         }
        //         else
        //         {
        //             cb(null);
        //         }
        //     });

        // }],
        ShippedOrder: ['blankField', 'authenticate', function (cb) {
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
    var supplier_id = 0;
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
            func.authenticateSupplierAccessToken(req.dbName,accessToken, res,function(err,result){
                if(err)
                {
                    sendResponse .somethingWentWrongError(res);
                }
                else
                {
                    supplier_id=result;
                    cb(null);
                }

            },1)
        }],
        // checkauthority: ['authenticate', function (cb) {
        //     func.checkforAuthorityofThisSupplier(req.dbName,supplier_id,sectionId, res,function (err,result) {
        //         if(err)
        //         {
        //             sendResponse.somethingWentWrongError(res);
        //         }
        //         else
        //         {
        //             cb(null);
        //         }
        //     });

        // }],
        OrderNearby: ['blankField', 'authenticate', function (cb) {
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
    var supplier_id = 0;
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
            func.authenticateSupplierAccessToken(req.dbName,accessToken, res,function(err,result){
                if(err)
                {
                    sendResponse .somethingWentWrongError(res);
                }
                else
                {
                    supplier_id=result;
                    cb(null);
                }

            },1)
        }],
        // checkauthority: ['authenticate', function (cb) {
        //     func.checkforAuthorityofThisSupplier(req.dbName,supplier_id,sectionId, res,function (err,result) {
        //         if(err)
        //         {
        //             sendResponse.somethingWentWrongError(res);
        //         }
        //         else
        //         {
        //             cb(null);
        //         }
        //     });

        // }],
        deliveredOrder: ['blankField', 'authenticate', function (cb) {
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

function loyalityOrderListing(dbName,res,supplierId,limit,offset,callback) {
    var product=[];
    var results=[];
    var cate=[];
    var orderId=[];
    async.auto({
        orders:function (cb) {
            var sql='select lo.id,lo.created_on,s.name as supplier,lo.status,u.email As User_Name,u.mobile_no,lo.service_date as schedule_date ' +
                'from loyalty_order lo join supplier_branch sb on sb.id=lo.supplier_branch_id join supplier s on sb.supplier_id=s.id '+
                'join user u on lo.user_id=u.id where s.id =? limit ?,?';
            multiConnection[dbName].query(sql,[supplierId,limit,offset],function (err,orders) {
                if(err)
                {
                    console.log('error------',err);
                    sendResponse.somethingWentWrongError(res);

                }
                else if(orders.length) {
                    for(var i=0;i<orders.length;i++)
                    {
                        (function (i) {
                            orderId.push(orders[i].id);
                            if(i==(orders.length-1)){
                                results = orders;
                                cb(null);
                            }
                        }(i))
                    }
                }
                else {
                    var data = [];
                    sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,constant.responseStatus.SUCCESS);

                }
            })
        },
        product:['orders',function(cb){
            var sql2='select lop.loyalty_order_id,lop.product_name from loyalty_order_product lop where loyalty_order_id IN ('+orderId+')';
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
                                        product.push(product1[j].product_name);
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
            var sql3='select c.name,c.id,lop.loyalty_order_id from loyalty_order_product lop join product p ' +
                'on p.id=lop.product_id join categories c on c.id=p.category_id where loyalty_order_id IN('+orderId+')';
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
            data=results;
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

function confirmPendingOrder(dbName,res,orderid,status,callback) {
    if(status==1)
    {
        var sql= 'update loyalty_order set status= ? where id =? ';
        multiConnection[dbName].query(sql,[status,orderid],function(err,result)
        {
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
    }
    else
    {
        async.auto({
            updateStatus:function (cb) {
                var sql= 'update loyalty_order set status=? where id=?';
                multiConnection[dbName].query(sql,[status,orderid],function(err,result)
                {
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
                multiConnection[dbName].query(sql,[orderid],function (err,result) {
                    if(err)
                    {
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


// function getId(dbName,res,id,cb){
//     var sql='select supplier_id from supplier_admin where id=?';
//     multiConnection[dbName].query(sql,[id],function (err,id) {
//         if(err)
//         {
//             console.log('error------',err);
//             sendResponse.somethingWentWrongError(res);

//         }
//         else {
//             //console.log('result-----',id);
//             cb(null,id);
//         }
//     })}
function getId(dbName, res, id, cb) {
    var sql = 'select supplier_id from supplier_admin where id=?';
    multiConnection[dbName].query(sql, [id], function (err, result) {
        if (err) {
            console.log('error------', err);
            sendResponse.somethingWentWrongError(res);

        }
        else {
            //console.log('result-----',id);
            if (result.length) {
                cb(null,result);
            } else {
                var sql = 'select supplier_id from supplier_branch where id=?';
                multiConnection[dbName].query(sql, [id], function (err, result) {
                    if (err) {
                        console.log('error------', err);
                        sendResponse.somethingWentWrongError(res);

                    }
                    else {
                        //console.log('result-----',id);
                        if (result.length){
                            cb(null, result);
                        }else{
                            sendResponse.somethingWentWrongError(res);
                        }
                    }
                })
            }

        }
    })
}

exports.logoutSupplier = function(req,res){
    var accessToken;
    var type;
    console.log(".......req.body.........",req.body);
    async.auto({
        getParameter:function(cb){
            accessToken = req.body.accessToken;
            type = parseInt(req.body.type);
            cb(null)
        },
        clearToken:['getParameter',function(cb){
            
            if(type == 0){
                
                var sql = "update supplier set device_token = ? where access_token = ? ";
                multiConnection[req.dbName].query(sql, ['',accessToken], function (err, result) {
                   console.log(".......in if");
                    if (err) {
                        cb(err);
                    }
                    else {
                        cb(null);
                    }
                })

            }else{
                var sql = "update supplier_branch set device_token = ? where access_token = ? ";
                multiConnection[req.dbName].query(sql, ['',accessToken], function (err, result) {
                    if (err) {
                        cb(err);
                    }
                    else {
                        cb(null);
                    }
                })
            }
        }]
    },function(err,result){
        if(err){
            sendResponse.somethingWentWrongError(res);
        }else{
            sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, res,200);
        }
    })
}