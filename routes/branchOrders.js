/**
 * Created by cbl98 on 20/5/16.
 */

var func = require('./commonfunction');
var async = require('async');
var sendResponse = require('./sendResponse');
var constant = require('./constant');
var loginFunctions = require('./loginfunctionsupplier');
var orderFunction=require('./orderFunction');
var moment = require('moment');
var pushNotifications = require('./pushNotifications');
var supplierExtranet = require('./supplierExtranet');
var orderFunc = require('./orderFunction');
var adminOrders = require('./adminOrders');
var AdminMail = "ops@royo.com"
var emailTemp = require('./email');


exports.branchOrderListing=  function(req,res) {
    var accessToken =0 ;
    var branchId=0;
    var data;
    async.auto({
        blankField:function(cb)
        {
            if(req.body && req.body.accessToken)
            {
                accessToken=req.body.accessToken;
                cb(null);
            }
            else
            {
                sendResponse.parameterMissingError(res);
            }
        },
        authenticate:['blankField',function (cb)
        {
            func.authenticateSupplierAccessToken(req.dbName,accessToken, res,function(err,result){
                if(err)
                {
                    sendResponse .somethingWentWrongError(res);
                }
                else
                {
                    branchId=result;
                    cb(null);
                }

            },0)
        }],
        listBranchOrder:['blankField','authenticate',function(cb){
            loginFunctions.listBranchOrder(req.dbName,res,branchId,function (err,result) {
                if(err)
                {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    data=result;
                 //   console.log('data----',result);
                    cb(null);
                }
            })

        }]
    },function(err,result){
        if(err) {
            sendResponse.somethingWentWrongError(res);
        }else{
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,200);
        }
    })
}

exports.branchOrderDescription = function (req,res) {
    var accessToken =0 ;
    var orderId=0;
    var branchId;
    async.auto({
        blankField:function(cb)
        {
            if(req.body && req.body.accessToken && req.body.orderId)
            {
                accessToken=req.body.accessToken;
                orderId= req.body.orderId;
                cb(null);
            }
            else
            {
                sendResponse.parameterMissingError(res);
            }
        },
        authenticate:['blankField',function (cb)
        {
            func.authenticateSupplierAccessToken(req.dbName,accessToken, res,function(err,result){
                if(err)
                {
                    sendResponse .somethingWentWrongError(res);
                }
                else
                {
                    branchId=result;
                 //   console.log("branchId:  ",branchId);
                    cb(null);
                }

            },0)
        }],
        orderdescription:['blankField','authenticate',function(cb){
            orderFunction.orderDescription(req.dbName,res,orderId,function (err,result) {
                if(err)
                {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    data=result;
                   // console.log('data----',result);
                    cb(null);
                }
            })

        }]
    },function(err,result){
        if(err) {
            sendResponse.somethingWentWrongError(res);
        }else{
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,200);
        }
    })

}

exports.branchPendingOrders = function(req,res) {
    var accessToken=0;
    var branchId=0;
    var data;
    async.auto({
        blankField:function(cb)
        {
            if(req.body && req.body.accessToken)
            {
                accessToken=req.body.accessToken;
                cb(null);
            }
            else
            {
                sendResponse.parameterMissingError(res);
            }
        },
        authenticate:['blankField',function (cb)
        {
            func.authenticateSupplierAccessToken(req.dbName,accessToken, res,function(err,result){
                if(err)
                {
                    sendResponse .somethingWentWrongError(res);
                }
                else
                {
                    branchId=result;
                    cb(null);
                }

            },0)
        }],
        orderList:['blankField','authenticate',function(cb){
            loginFunctions.branchPendingOrdersList(req.dbName,res,branchId,function (err,result) {
                if(err)
                {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    data=result;
                 //   console.log('data----',result);
                    cb(null);
                }
            })

        }]
    },function(err,result){
        if(err) {
            sendResponse.somethingWentWrongError(res);
        }else{
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,200);
        }
    })
}

exports.branchConfirmPendingOrder = function (req,res) {
    var accessToken =0 ;
    var orderId=0;
    var status=0;
    var branchId=0;
    var data;
    var reason=0;
    var email=[];
    async.auto({
            blankField:function(cb)
            {
                if(req.body && req.body.accessToken && req.body.orderId && req.body.status)
                {
                    if(req.body.status==1)
                    {
                        accessToken=req.body.accessToken;
                        orderId= req.body.orderId;
                        status=req.body.status;
                        cb(null);
                    }
                    else
                    {

                        if(req.body.reason)
                        {
                            accessToken=req.body.accessToken;
                            orderId= req.body.orderId;
                            status=req.body.status;
                            reason=req.body.reason;
                            cb(null);
                        }
                        else
                        {
                            var msq='reason required';
                            sendResponse.sendErrorMessage(msq,res,0);
                        }
                    }

                }
                else
                {
                    sendResponse.parameterMissingError(res);
                }
            },
            authenticate:['blankField',function (cb)
            {
                func.authenticateSupplierAccessToken(req.dbName,accessToken, res,function(err,result){
                    if(err)
                    {
                        sendResponse .somethingWentWrongError(res);
                    }
                    else
                    {
                        branchId=result;
                        cb(null);
                    }

                },0)
            }],
            pendingorder:['blankField','authenticate',function(cb){
                orderFunction.confirmPendingOrder(req.dbName,res,orderId,status,reason,function (err,result) {
                    if(err)
                    {
                        sendResponse.somethingWentWrongError(res);
                    }
                    else {
                        cb(null);
                    }
                })

            }],
            getmailaddress:['pendingorder',function(cb)
            {
                adminEmail(req.dbName,res,branchId,function (err,result) {
                    if(err)
                    {
                        sendResponse.somethingWentWrongError(res);
                    }
                    else {
                        for(var i=0;i<result.length;i++) {
                            (function (i) {
                                email.push(result[i].email)
                            }(i))
                        }
                        cb(null);
                    }
                })
            }],
            SendEmail:['getmailaddress',function(cb)
            {
                if(status==2)
                {
                    var msg='branch Confirmed the Order';
                    var sub='Order Confirmed';
                    func.sendMailthroughSMTP(res,function(err,result){
                        if(err)
                        {
                            sendResponse.somethingWentWrongError(res);
                        }
                        else
                        {
                            data=[];
                            cb(null);

                        }
                    },sub,email,msg,0);
                }
                else
                {
                    var msg='branch Reject the Order';
                    var sub='Order Rejected';
                    func.sendMailthroughSMTP(res,function(err,result){
                        if(err)
                        {
                            sendResponse.somethingWentWrongError(res);
                        }
                        else
                        {
                            data=[];
                            cb(null);

                        }
                    },sub,email,msg,0);
                }

            }]
        },
        function(err,result){
            if(err) {
                sendResponse.somethingWentWrongError(res);
            }else{
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,200);
            }
        })
}

exports.branchOrderShipped = function (req,res) {
    var accessToken = 0;
    var orderId=0;
    var status=0;
    var data;
    async.auto({
        blankField:function(cb)
        {
            if(req.body && req.body.accessToken && req.body.orderId && req.body.status)
            {
                accessToken=req.body.accessToken;
                orderId= req.body.orderId;
                status=req.body.status;
                cb(null);
            }
            else
            {
                sendResponse.parameterMissingError(res);
            }
        },
        authenticate:['blankField',function (cb)
        {
            func.authenticateSupplierAccessToken(req.dbName,accessToken, res,function(err,result){
                if(err)
                {
                    sendResponse .somethingWentWrongError(res);
                }
                else
                {
                    cb(null);
                }

            },0)
        }],
        ShippedOrder:['blankField','authenticate',function(cb){
            orderFunction.orderShipped(req.dbName,res,orderId,status,function (err,result) {
                if(err)
                {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    data=[];
                    cb(null);
                }
            })

        }]
    },function(err,result){
        if(err) {
            sendResponse.somethingWentWrongError(res);

        }else{
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,200);
        }
    })
}

exports.branchOrderNearby = function (req,res) {
    var accessToken = 0;
    var orderId=0;
    var status=0;
    var data;
    async.auto({
        blankField:function(cb)
        {
            if(req.body && req.body.accessToken && req.body.orderId && req.body.status)
            {
                accessToken=req.body.accessToken;
                orderId= req.body.orderId;
                status=req.body.status;
                cb(null);
            }
            else
            {
                sendResponse.parameterMissingError(res);
            }
        },
        authenticate:['blankField',function (cb)
        {
            func.authenticateSupplierAccessToken(req.dbName,accessToken, res,function(err,result){
                if(err)
                {
                    sendResponse .somethingWentWrongError(res);
                }
                else
                {
                    cb(null);
                }

            },0)
        }],
        
        OrderNearby:['blankField','authenticate',function(cb){
            orderFunction.orderNearby(req.dbName,res,orderId,status,req.service_type,function (err,result) {
                if(err)
                {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    data=[];
                    cb(null);
                }
            })

        }]
    },function(err,result){
        if(err) {
            sendResponse.somethingWentWrongError(res);

        }else{
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,200);
        }
    })
}

exports.branchDeliveredOrder = function (req,res) {
    var accessToken = 0;
    var orderId=0;
    var status=0;
    var branchId=0;
    var data;
    var email=[];
    async.auto({
        blankField:function(cb)
        {
            if(req.body && req.body.accessToken  && req.body.orderId && req.body.status)
            {
                accessToken=req.body.accessToken;
                orderId= req.body.orderId;
                status=req.body.status;
                cb(null);
            }
            else
            {
                sendResponse.parameterMissingError(res);
            }
        },
        authenticate:['blankField',function (cb)
        {
            func.authenticateSupplierAccessToken(req.dbName,accessToken, res,function(err,result){
                if(err)
                {
                    sendResponse .somethingWentWrongError(res);
                }
                else
                {
                    branchId=result
                    cb(null);
                }

            },0)
        }],
        deliveredOrder:['blankField','authenticate',function(cb){
            orderFunction.deliveredOrder(req.dbName,res,orderId,status,req.service_type,function (err,result) {
                if(err)
                {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    data=[];
                    cb(null);
                }
            })

        }],
        getmailaddress:['deliveredOrder',function(cb)
        {
            adminEmail(req.dbName,res,branchId,function (err,result) {
                if(err)
                {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    for(var i=0;i<result.length;i++) {
                        (function (i) {
                            email.push(result[i].email)
                        }(i))
                    }
                  //  console.log('email11-------',email);
                    cb(null);
                }
            })
        }],
        SendEmail:['getmailaddress',function(cb)
        {
            var msg='Order Deivered to User';
            var sub='Order delivered';
            func.sendMailthroughSMTP(res,function(err,result){
                if(err)
                {
                    sendResponse.somethingWentWrongError(res);
                }
                else
                {
                    data=[];
                    cb(null);

                }
            },sub,email,msg,0);
        }]
    },function(err,result){
        if(err) {
            sendResponse.somethingWentWrongError(res);

        }else{
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,200);
        }
    })
}

exports.branchOrdersTrackedList = function (req,res) {
    var accessToken = 0;
    var branchId=0;
    var data;
    async.auto({
        blankField:function(cb)
        {
            if(req.body && req.body.accessToken )
            {
                accessToken=req.body.accessToken;
               
                cb(null);
            }
            else
            {
                sendResponse.parameterMissingError(res);
            }
        },
        authenticate:['blankField',function (cb)
        {
            func.authenticateSupplierAccessToken(req.dbName,accessToken, res,function(err,result){
                if(err)
                {
                    sendResponse .somethingWentWrongError(res);
                }
                else
                {
                    branchId=result;
                    cb(null);
                }

            },0)
        }],
        trackedOrders:['blankField','authenticate',function(cb){
            trackedOrders(req.dbName,res,branchId,function (err,result) {
                if(err)
                {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    data=result;
                    cb(null);
                }
            })

        }]
    },function(err,result){
        if(err) {
            sendResponse.somethingWentWrongError(res);

        }else{
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,200);
        }
    })
}

exports.updateTrackedOrderbyBranch = function (req,res) {
    var accessToken = 0;
    var supplierId=0;
    var orderId=0;
    var date=0;
    var status=0;
    var data;
    async.auto({
        blankField:function(cb)
        {
            if(req.body && req.body.accessToken  && req.body.orderId && req.body.date && req.body.status)
            {
                accessToken=req.body.accessToken;
                orderId=req.body.orderId;
                date=req.body.date;
                status=req.body.status;
                cb(null);
            }
            else
            {
                sendResponse.parameterMissingError(res);
            }
        },
        authenticate:['blankField',function (cb)
        {
            func.authenticateSupplierAccessToken(req.dbName,accessToken, res,function(err,result){
                if(err)
                {
                    sendResponse .somethingWentWrongError(res);
                }
                else
                {
                    cb(null);
                }

            },0)
        }],
        updateTrackedOrder:['blankField','authenticate',function(cb){
            orderFunction.updateOrder(req.dbName,res,status,orderId,date,function (err,result) {
                if(err)
                {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    data=result;
                    cb(null);
                }
            })

        }]
    },function(err,result){
        if(err) {
            sendResponse.somethingWentWrongError(res);

        }else{
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,200);
        }
    })
}

function adminEmail(dbName,res,id,cb) {
        var sql='select a.email from admin a where is_superadmin = 1 ' +
            ' UNION ' +
            ' SELECT s.email from supplier s join supplier_branch sb on sb.supplier_id=s.id WHERE sb.id=?';
    multiConnection[dbName].query(sql,id,function (err,result) {
        if(err)
        {
            console.log("errrr-----",err);
            sendResponse.somethingWentWrongError(res);

        }
        else
        {
         //   console.log("email----",result);
            cb(null,result);
        }
    })
}

function trackedOrders(dbName,res,id,callback) {
    var product=[];
    var results=[];
    var cate=[];
    async.auto({
        orders:function (cb) {
            var sql='select o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,u.mobile_no ' +
                'from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id '+
                'join user u on o.user_id=u.id where o.supplier_branch_id = ? AND o.status= ?';
            multiConnection[dbName].query(sql,[id,7],function (err,orders) {
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
                    var msg = "No Orders selected";
                    sendResponse.sendErrorMessage(msg,res,500);
                }
            })
        },
        product:['orders',function(cb){
            var sql2='select op.order_id,op.product_name from order_prices op';
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
                                    if(product1[j].order_id == results[i].id)
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
            var sql3='select c.name,c.id,op.order_id from order_prices op join product p on p.id=op.product_id join categories c on c.id=p.category_id';
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
                                    if(cat[j].order_id == results[i].id)
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


exports.branchLogin = function(request,reply){
    var email;
    var password;
    var deviceToken;
    var deviceType;
    var access_token;
    var branchId;
    let branchName = "";
    async.auto({
        getValue:function(cb){
            
            console.log(".............request............................",request.body);
            
            if(!(request.body.email)){
                var msg = "access Token  not found"
                return sendResponse.sendErrorMessage(msg,reply,400);
            }else{
                email = request.body.email;
            }
            if(!(request.body.password)){
                var msg = "password not found"
                return sendResponse.sendErrorMessage(msg,reply,400);
            }else{
                password = request.body.password;
            }
           /* if(!(request.body.deviceToken)){
                var msg = "deviceToken  not found"
                return sendResponse.sendErrorMessage(msg,reply,400);
            }else{
                deviceToken = request.body.deviceToken;
            }
            if(!(request.body.deviceType)){
                var msg = "deviceToken  not found"
                return sendResponse.sendErrorMessage(msg,reply,400);
            }else{
                deviceType = request.body.deviceType;
            }*/
            cb(null);
        },
        checkLogin:['getValue',function(cb){
            password = md5(password);
            var sql = "select id,name from supplier_branch where email = ? and password = ?";
            let stmt = multiConnection[request.dbName].query(sql, [email,password], function (err, result) {
             console.log(".................cehcklogin.................",err,result,stmt.sql);
                if (err) {
                    sendResponse.somethingWentWrongError(reply)
                }
                else {
                    if(result.length){
                        branchId=result[0].id;
                        branchName = result[0].name!==undefined?result[0].name:""
                        cb(null);
                    }else{
                        sendResponse.sendSuccessData({}, constant.responseMessage.INCORRECT_CREDENTIALS, reply, 8);
                    }

                }
            }) 
        }],
        updateDetails:['checkLogin',function(cb){
             access_token = func.encrypt(email+new Date());
            var sql = "update supplier_branch set access_token = ?  where id = ?"; //country code missing
            multiConnection[request.dbName].query(sql, [access_token,branchId], function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(reply)
                }
                else {
                    if(result.length){
                        cb(null);
                    }else{
                        cb(null);
                    }
                }
            })
        }],
    /*    getOrderData: ['updateDetails', function (cb) {
            getOrderManagerPageData(reply, branchId, access_token, cb);
        }]*/
    },function(err,result){
        
        console.log("................send ........err........",err,result);
        
        if(err) {
            sendResponse.somethingWentWrongError(reply);
        }else{
            sendResponse.sendSuccessData({access_token:access_token,branchName:branchName}, constant.responseMessage.SUCCESS, reply,200);
        }
    })
}


exports.branchProductlist = function(request,reply){
  var accessToken;
    var branchId;
    var orderList;
    var arrList = [];
    var flag = 0
    async.auto({
        getValue : function(cb){
            if(!(request.body.accessToken)){
                var msg = "accessToken  not found"
                return sendResponse.sendErrorMessage(msg,reply,400);
            }else{
                accessToken = request.body.accessToken;
            }

            cb(null);
        },
        getBranchId:['getValue',function(cb){
           var sql = "select id from supplier_branch where 	access_token =?";
            multiConnection[req.dbName].query(sql, [accessToken], function (err, result) {
                if (err) {
                    cb(err);
                }
                else {
                    if(result.length){
                        branchId = result[0].id;
                        cb(null);
                    }else{
                        cb("invalid access token")
                    }

                }
            })
        }],
        orderList:['getBranchId',function(cb){
            var sql = "select * from orders where supplier_branch_id = ? ";
            multiConnection[req.dbName].query(sql, [branchId], function (err, result) {
                if (err) {
                    cb(err);
                }
                else {
                    orderList = result;
                    cb(null)
                }
            })
        }],
        orderProductDetails:['orderList',function(cb){
            var order_length  = orderList.length;
            if(order_length ==0){
                flag = 1;
                cb("No Order")
            }
            for(var i =0;i<order_length;i++){
                (function(i){
                    getorderProduct(req.dbName,orderList[i],function(err,result){
                        if(err){
                            cb(err);
                        }else{
                            orderList[i].product = result;
                            if(i == (order_length -1)){
                                cb(null);
                            }

                        }
                    })
                }(i));
            }
        }]
    },function(err,result){
        if(err){
            sendResponse.somethingWentWrongError(reply);
        }else{
            if(flag){
                orderList = {};
            }
            
            
            sendResponse.sendSuccessData(orderList, constant.responseMessage.SUCCESS, reply,200);

        }
    })
}


var getorderProduct = function(dbName,data,callback){
    var sql = "select quantity,product_id,product_name,product_desc,image_path,order_id from order_prices where order_id = ?";
    multiConnection[dbName].query(sql, [data.id], function (err, result) {
        if (err) {
            callback(err);
        }
        else {
            callback(null,result)
        }
    })
}

exports.changeStatusOrder = function(request,reply){

    var orderId;
    var supplierId;
    var status;
    var oldStatus = 0;
    var accessToken;
  
    var message;
    async.auto({
        getValue:function(cb){
            if(!(request.body.accessToken)){
                var msg = "accessToken  not found"
                return sendResponse.sendErrorMessage(msg,reply,400);
            }else{
                accessToken = request.body.accessToken;
            }

            if(!(request.body.orderId)){
                var msg = "order id  not found"
                return sendResponse.sendErrorMessage(msg,reply,400);
            }else{
                orderId = request.body.orderId;
            }
            if(!(request.body.status)){
                var msg = "status  not found"
                return sendResponse.sendErrorMessage(msg,reply,400);
            }else{
                status = request.body.status;
            }
            cb(null);
        },
        checkAccessToken:['getValue',function(cb){
            var sql = "select id from supplier where access_token =?";
            multiConnection[req.dbName].query(sql, [accessToken], function (err, result) {
                if (err) {
                    cb(err);
                }
                else {
                    if(result.length){
                        supplierId = result[0].id;
                        cb(null);
                    }else{
                        cb("invalid access token")
                    }
                }
            })
        }],
        getStatus:['checkAccessToken',function (cb) {
            var sql1='select status from orders where id= ?';
            multiConnection[req.dbName].query(sql1,[orderId],function (err,result) {
                if(err){
                    cb(err);
                }
                else {
                    if(result.length){
                        oldStatus=result[0].status;
                    }
                    cb(null);
                }
            })
        }],
        changeStatus:['getStatus',function(cb){
            var datexvc = new Date();
            if(status == 3) {
                var sql = "update orders set status = ? , shipped_on = ? where id = ? ";
            }
            else if(status == 4){
                if(oldStatus==1){
                    var sql = "update orders set status = ? , near_on = ? ,shipped_on = ? where id = ? ";
                    multiConnection[req.dbName].query(sql, [status,datexvc,datexvc,orderId], function (err, result) {
                        if (err) {
                            cb(err);
                        }
                        else {
                            cb(null);
                        }
                    })
                }
                else {
                    var sql = "update orders set status = ?, near_on = ? where id = ? ";

                }
            }
            else if(status == 5){
                if(oldStatus==1){
                    var sql = "update orders set status = ? , near_on = ? ,shipped_on = ?,delivered_on = ? where id = ? ";
                    multiConnection[req.dbName].query(sql, [status,datexvc,datexvc,datexvc,orderId], function (err, result) {
                        if (err) {
                            cb(err);
                        }
                        else {
                            cb(null);
                        }
                    })
                }
                else if(oldStatus==3){
                    var sql = "update orders set status = ? , shipped_on = ?,delivered_on = ? where id = ? ";
                    multiConnection[req.dbName].query(sql, [status,datexvc,datexvc,orderId], function (err, result) {
                        if (err) {
                            cb(err);
                        }
                        else {
                            cb(null);
                        }
                    })
                }
                else {
                    var sql = "update orders set status = ? , delivered_on = ? where id = ? ";
                }
            }
            else {
                var sql = "update orders set status = ? , updated_on = ? where id = ? ";
            }
            multiConnection[req.dbName].query(sql, [status,datexvc,orderId], function (err, result) {
                if (err) {
                    cb(err);
                }
                else {
                    cb(null);
                }
            })
        }],
        

    },function(err,result){
        if(err){
            sendResponse.somethingWentWrongError(reply);
        }else{
            sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply,200);
        }
    })
    
    
  /*  
    var orderId;
    var branchId;
    var status;
    var accessToken;
    async.auto({
        getValue:function(cb){
            if(!(request.body.accessToken)){
                var msg = "accessToken  not found"
                return sendResponse.sendErrorMessage(msg,reply,400);
            }else{
                accessToken = request.body.accessToken;
            }

            if(!(request.body.orderId)){
                var msg = "order id  not found"
                return sendResponse.sendErrorMessage(msg,reply,400);
            }else{
                orderId = request.body.orderId;
            }
            if(!(request.body.status)){
                var msg = "status  not found"
                return sendResponse.sendErrorMessage(msg,reply,400);
            }else{
                orderId = request.body.status;
            }
            cb(null);
        },
        checkAccessToken:['getValue',function(cb){
            var sql = "select id from supplier_branch where 	access_token =?";
            multiConnection[dbName].query(sql, [accessToken], function (err, result) {
                if (err) {
                    cb(err);
                }
                else {
                    if(result.length){
                        branchId = result[0].id;
                        cb(null);
                    }else{
                        cb("invalid access token")
                    }
                }
            })
        }],
        changeStatus:['checkAccessToken',function(cb){
            var datexvc = new Date();
            if(status == 3){
                var sql = "update orders set status = ? , shipped_on = ? where id = ? ";
            }else if(status == 4){
                var sql = "update orders set status = ? , near_on = ? where id = ? ";
            }else if(status == 5){
                var sql = "update orders set status = ? , delivered_on = ? where id = ? ";
            }else {
                var sql = "update orders set status = ? , updated_on = ? where id = ? ";
            }
            multiConnection[dbName].query(sql, [status,datexvc,orderId], function (err, result) {
                if (err) {
                    cb(err);
                }
                else {
                    cb(null);
                }
            })
        }]
    },function(err,result){
        if(err){
            sendResponse.somethingWentWrongError(reply);
        }else{
            sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply,200);
        }
    })*/
}


exports.bulkImage = function(request,reply){
    
    var images;
    var imageslength;
    var arr = [];
    async.auto({
        getValue:function(cb){
            if(!(request.files.images)){
                var msg = "order id  not found"
                return sendResponse.sendErrorMessage(msg,reply,400);
            }else{
                images = request.files.images;
                imageslength = images.length;
            }
            cb(null);
        },
        uploadImages:['getValue',function(cb){
            for(var i =0;i<imageslength;i++){
                (function(i){
                    imageUpload(images[i],function(err,result){
                        if(err){
                            cb(err);
                        }else{
                            arr.push(result);
                            if(i == (imageslength -1)){
                                cb(null);
                            }
                        }
                    })
                }(i));
            }
        }]
    },function(err,result){
        if(err){
            sendResponse.somethingWentWrongError(reply);
        }else{
            sendResponse.sendSuccessData(arr,constant.responseMessage.SUCCESS, reply,200);
        }
    })
}

var imageUpload = function(image,callback){
    var folder = "abc";
    func.uploadImageFileToS3Bucket(reply, image, folder, function (err, result) {
        if (err) {
            var msg = "db error :";
            return sendResponse.sendErrorMessage(msg, reply, 500);
        } else {
            console.log(".............image.........................................",result);
            image = result;
            callback(null)
        }
    });
}

exports.orderManagementPage = function (req, res) {
    var accessToken;
    var languageId;
    var supplierId,deviceToken,deviceType,branchId;
    console.log("....req.body...order amanagement -**-*------------------------------..",req.body)
    async.auto({
        checkValues: function (cb) {
            if (!req.body.accessToken) {
                var msg = "access token not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (!req.body.languageId) {
                var msg = "language id not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }



            if (req.body.deviceToken) {
                deviceToken = req.body.deviceToken;

            }else{
                deviceToken = "GGG";
            }
            
            
            if (req.body && req.body.accessToken && req.body.languageId) {
                accessToken = req.body.accessToken;
                languageId = req.body.languageId;
                deviceType = req.body.deviceType;
                cb(null);
            }
            else {
                var msg = "something went wrong";
                return sendResponse.sendErrorMessage(msg, res, 500);
            }
        },
        updateToken:['checkValues',function (cb) {
           var sql='update supplier_branch  set device_token=?,device_type=? where access_token =? limit 1';
            multiConnection[req.dbName].query(sql, [deviceToken,deviceType,accessToken], function (err, result) {
                if (err) {
                    cb(err);
                } else {
                    cb(null);
                }
            })
        }],
        validateAccessToken: ['updateToken', function (cb) {
            var sql = " select id,supplier_id from  supplier_branch where access_token = ? limit 1";
            multiConnection[req.dbName].query(sql, [accessToken], function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(reply);
                } else {
                    if (result.length) {
                        supplierId = result[0].supplier_id;
                        branchId = result[0].id;
                        cb(null, result[0].supplier_id);
                    } else {
                        if (req.body.languageId == 14) {
                            var msg = "Invalid access token";
                        } else {
                            var msg = "تصريح الدخول غير صالح";
                        }
                        sendResponse.sendErrorMessage(msg, res, 401);
                    }
                }
            })

        }],
        getOrderData: ['validateAccessToken', function (cb) {
            console.log("branch....",branchId);
            getOrderManagerPageData(req.dbName,res, branchId, accessToken, cb);
        }]
    }, function (err, response) {
        if (err) {
            var msg = "something went wrong";
            return sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            console.log("branch....",response);
            sendResponse.sendSuccessData(response.getOrderData, constant.responseMessage.SUCCESS, res, 200);
        }

    })


 /*   var accessToken;
    var languageId;
    var branchId;
    async.auto({
        checkValues: function (cb) {
            if (!req.body.accessToken) {
                var msg = "access token not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (!req.body.languageId) {
                var msg = "language id not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (req.body && req.body.accessToken && req.body.languageId) {
                accessToken = req.body.accessToken;
                languageId = req.body.languageId;
                cb(null);
            }
            else {
                var msg = "something went wrong";
                return sendResponse.sendErrorMessage(msg, res, 500);
            }
        },
        validateAccessToken: ['checkValues', function (cb) {
            var sql = " select id from supplier_branch where access_token = ? and is_deleted =0 limit 1";
            multiConnection[dbName].query(sql, [accessToken], function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(reply);
                } else {
                    if (result.length) {
                        branchId = result[0].id;
                        cb(null, result[0].id);
                    } else {
                        if (req.body.languageId == 14) {
                            var msg = "Invalid access token";
                        } else {
                            var msg = "تصريح الدخول غير صالح";
                        }
                        sendResponse.sendErrorMessage(msg, res, 401);
                    }
                }
            })

        }],
        getOrderData: ['validateAccessToken', function (cb) {
            getOrderManagerPageData(res, branchId, accessToken, cb);
        }]
    }, function (err, response) {
        if (err) {
            var msg = "something went wrong";
            return sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            sendResponse.sendSuccessData(response.getOrderData, constant.responseMessage.SUCCESS, res, 200);
        }

    })*/
}

function getOrderManagerPageData(dbName,res, supplierId, accessToken, callback) {

    async.parallel([
        function (cb) {
            getTotalOrdersDelivered(dbName,res, supplierId, cb);
        },
        function (cb) {
            getRevenueFiltering(dbName,res,supplierId,cb);
        },
        function (cb) {
            getSupplierPendingUrgentOrders(dbName,res, supplierId, cb);
        },
        function (cb) {
            getSupplierPendingOrders(dbName,res, supplierId, cb);
        },
        function (cb) {
            getSupplierPendingTrackingAlerts(dbName,res, supplierId, cb);
        },
        function (cb) {
            getSupplierOrdersofTomorrow(dbName,res, supplierId, cb);
        },function (cb) {
            getcancelOrdersByUser(dbName,res, supplierId, cb);
        },
    ], function (err, response) {
        if (err) {
            var msg = "something went wrong";
            return sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            //console.log("response", response);
            var filteredData = [];
            filteredData[0]= {
                "name":"Today",
                "total_orders_delivered":response[0].today,
                "total_revenue":response[1].today
            };
            filteredData[1] = {
                "name":"Weekly",
                "total_orders_delivered":response[0].weekly,
                "total_revenue":response[1].weekly
            };
            filteredData[2] = {
                "name":"Monthly",
                "total_orders_delivered":response[0].monthly,
                "total_revenue":response[1].monthly
            };

            var data = {};
            data.access_token = accessToken;
            data.supplier_id = supplierId;
            data.filtered_data = filteredData;
            data.pending_urgent_orders = response[2];
            data.pending_orders = response[3];
            data.pending_tracking = response[4];
            data.scheduled_orders_tomorrow = response[5];
            data.cancel_orders = response[6];
            callback(null, data);

        }

    })


}

function getTotalOrdersDelivered(dbName,res, branchId, callback) {
    async.parallel([
        function(cb){
            var sql = "select COUNT(*) as total_orders_delivered from orders where DATE(`delivered_on`) = curdate() " +
                " and supplier_branch_id = ? and (status =? or status =?) ";
            multiConnection[dbName].query(sql, [branchId, 5, 6], function (error, reply) {
                if (error) {
                    console.log("error from getSupplierTotalOrdersDelivered1 " + error);
                    var msg = "db error :";
                    sendResponse.sendErrorMessage(msg, res, 500);
                } else if (reply.length) {
                    cb(null, reply[0].total_orders_delivered);
                } else {
                    cb(null, 0);
                }
            })
        },
        function(cb){
            var sql = "select COUNT(*) as total_orders_delivered from orders where DATE(`delivered_on`) BETWEEN DATE_SUB(NOW(), INTERVAL 7 DAY) AND NOW() " +
                " and supplier_branch_id =? and (status = ? || status = ?) ";
            multiConnection[dbName].query(sql, [branchId, 5, 6], function (error, reply) {
                if (error) {
                    console.log("error from getSupplierTotalOrdersDelivered2 " + error);
                    var msg = "db error :";
                    sendResponse.sendErrorMessage(msg, res, 500);
                } else if (reply.length) {
                    cb(null, reply[0].total_orders_delivered);
                } else {
                    cb(null, 0);
                }
            })
        },
        function(cb){
            var sql = "select COUNT(*) as total_orders_delivered from orders where DATE(`delivered_on`) BETWEEN DATE_SUB(NOW(), INTERVAL 30 DAY) AND NOW() " +
                " and supplier_branch_id = ? and (status = ? || status = ?) ";
            multiConnection[dbName].query(sql, [branchId, 5, 6], function (error, reply) {
                if (error) {
                    console.log("error from getSupplierTotalOrdersDelivered3 " + error);
                    var msg = "db error :";
                    sendResponse.sendErrorMessage(msg, res, 500);
                } else if (reply.length) {
                    cb(null, reply[0].total_orders_delivered);
                } else {
                    cb(null, 0);
                }
            })
        }
    ],function(err,response)
    {
        if(err){
            var msg = "something went wrong";
            return sendResponse.sendErrorMessage(msg, res, 500);
        }
        else{
            var data = {};
            data.today = response[0];
            data.weekly = response[1];
            data.monthly =  response[2];
            //console.log("dftsy",data);
            callback(null,data);

        }

    })

}

function getRevenueFiltering(dbName,res,branchId,callback) {
    async.parallel([
        function(cb){
            var sql = "select if (sum(`net_amount`) IS NULL,0,sum(net_amount)) as revenue from orders where DATE(`delivered_on`) = curdate() and status = 5 and supplier_branch_id= ? ";
            multiConnection[dbName].query(sql, [branchId], function (error, reply) {
                if (error) {
                    console.log("error from getSupplierTodayRevenue4 " + error);
                    var msg = "db error :";
                    sendResponse.sendErrorMessage(msg, res, 500);
                } else if (reply.length) {
                    cb(null, reply[0].revenue);
                } else {
                    cb(null, 0);
                }
            })
        },
        function(cb){
            var sql = "select if (sum(`net_amount`) IS NULL,0,sum(net_amount)) as revenue from orders where DATE(delivered_on) BETWEEN DATE_SUB(NOW(), INTERVAL 7 DAY) AND NOW() and status = 5 and supplier_branch_id = ? ";
            multiConnection[dbName].query(sql, [branchId], function (error, reply) {
                if (error) {
                    console.log("error from getSupplierTotalOrdersDelivered5 " + error);
                    var msg = "db error :";
                    sendResponse.sendErrorMessage(msg, res, 500);
                } else if (reply.length) {
                    cb(null, reply[0].revenue);
                } else {
                    cb(null, 0);
                }
            })
        },
        function(cb){
            var sql = "select if (sum(`net_amount`) IS NULL,0,sum(net_amount)) as revenue from orders where DATE(delivered_on) BETWEEN DATE_SUB(NOW(), INTERVAL 30 DAY) AND NOW()  and status = 5 and supplier_branch_id = ? ";
            multiConnection[dbName].query(sql, [branchId], function (error, reply) {
                if (error) {
                    console.log("error from getSupplierTotalOrdersDelivered6 " + error);
                    var msg = "db error :";
                    sendResponse.sendErrorMessage(msg, res, 500);
                } else if (reply.length) {
                    cb(null, reply[0].revenue);
                } else {
                    cb(null, 0);
                }
            })
        }
    ],function(err,response)
    {
        if(err){
            var msg = "something went wrong";
            return sendResponse.sendErrorMessage(msg, res, 500);
        }
        else{
            var data = {};
            data.today = response[0];
            data.weekly = response[1];
            data.monthly =  response[2];
            //console.log("dsdsfd",data)
            callback(null,data);
        }

    })
}

function getSupplierPendingUrgentOrders(dbName,res, branchId, callback) {
    var sql = "select COUNT(*) as pending_urgent_orders from orders where supplier_branch_id = ? and status = ? and urgent = ?";
    multiConnection[dbName].query(sql, [branchId, 0, 1], function (error, reply) {
        if (error) {
            console.log("error from getSupplierPendingUrgentOrders" + error);
            var msg = "db error :";
            sendResponse.sendErrorMessage(msg, res, 500);
        } else if (reply.length) {
            callback(null, reply[0].pending_urgent_orders);
        } else {
            callback(null, 0);
        }
    })
}

function getSupplierPendingOrders(dbName,res, branchId, callback) {
    var sql = "select COUNT(*) as pending_orders from orders where supplier_branch_id = ? and status = ? and urgent = ?";
    multiConnection[dbName].query(sql, [branchId, 0, 0], function (error, reply) {
        if (error) {
            console.log("error from getSupplierPendingUrgentOrders" + error);
            var msg = "db error :";
            sendResponse.sendErrorMessage(msg, res, 500);
        } else if (reply.length) {
            callback(null, reply[0].pending_orders);
        } else {
            callback(null, 0);
        }
    })

}

function getSupplierPendingTrackingAlerts(dbName,res, branchId, callback) {
    var sql = "select COUNT(*) as pending_tracking_alerts from orders where supplier_branch_id = ? and status = ?";
    multiConnection[dbName].query(sql, [branchId, 7], function (error, reply) {
        if (error) {
            console.log("error from getSupplierPendingUrgentOrders" + error);
            var msg = "db error :";
            sendResponse.sendErrorMessage(msg, res, 500);
        } else if (reply.length) {
            callback(null, reply[0].pending_tracking_alerts);
        } else {
            callback(null, 0);
        }
    })
}

function getSupplierOrdersofTomorrow(dbName,res, branchId, callback) {
    var sql = "select COUNT(*) as scheduled_orders_for_tommorrow from orders where supplier_branch_id = ? and status IN (?,?,?) ";
    multiConnection[dbName].query(sql, [branchId,1,3,4], function (error, reply) {
        if (error) {
            console.log("error from getSupplierTomorrowOrders" + error);
            var msg = "db error :";
            sendResponse.sendErrorMessage(msg, res, 500);
        } else if (reply.length) {
            callback(null, reply[0].scheduled_orders_for_tommorrow);
        } else {
            callback(null, 0);
        }
    })
}


function getcancelOrdersByUser(dbName,res, supplierId, callback) {
    var sql = "select COUNT(*) as cancel_orders from orders where supplier_branch_id =? and status =? and  is_acknowledged=0";
    multiConnection[dbName].query(sql, [supplierId,8], function (error, reply) {
        if (error) {
            console.log("error from getSupplierTomorrowOrders" + error);
            var msg = "db error :";
            sendResponse.sendErrorMessage(msg, res, 500);
        } else if (reply.length) {
            callback(null, reply[0].cancel_orders);
        } else {
            callback(null, 0);
        }
    })
}

exports.listPendingOrders = function (req, res) {

    var accessToken;
    var languageId;
    var supplierId;
    var branchId;
    var isUrgent;
    var details = {};
    async.auto({
        checkValues: function (cb) {
            if (!req.body.accessToken) {
                var msg = "access token not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (!req.body.languageId) {
                var msg = "language id not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (req.body.isUrgent==undefined || req.body.isUrgent=="") {
                var msg = "urgent field not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (req.body && req.body.accessToken && req.body.languageId && req.body.isUrgent) {
                accessToken = req.body.accessToken;
                languageId = req.body.languageId;
                isUrgent = req.body.isUrgent;
                cb(null);
            }
            else {
                var msg = "something went wrong";
                return sendResponse.sendErrorMessage(msg, res, 500);
            }
        },
        validateAccessToken: ['checkValues', function (cb) {
            var sql = " select id,supplier_id from supplier_branch where access_token = ? limit 1";
            multiConnection[req.dbName].query(sql, [accessToken], function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(reply);
                } else {
                    if (result.length) {
                        supplierId = result[0].supplier_id;
                        branchId = result[0].id;
                        cb(null, result[0].supplier_id);
                    } else {
                        if (req.body.languageId == 14) {
                            var msg = "Invalid access token";
                        } else {
                            var msg = "تصريح الدخول غير صالح";
                        }
                        sendResponse.sendErrorMessage(msg, res, 401);
                    }
                }
            })

        }],
        getPendingOrderDetails: ['validateAccessToken', function (cb) {
            getPendingOrdersPageData(req.dbName,res, branchId, accessToken, languageId, isUrgent, function (err, response) {
                if (err) {
                    var msg = "something went wrong";
                    return sendResponse.sendErrorMessage(msg, res, 500);
                }
                else {
                    details = response;
                    cb(null);
                }

            });
        }]
    }, function (err, response) {
        if (err) {
            var msg = "something went wrong";
            return sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            sendResponse.sendSuccessData(details, constant.responseMessage.SUCCESS, res, 200);
        }

    })

  /*  var accessToken;
    var languageId;
    var branchId;
    var isUrgent;
    var details = {};
    async.auto({
        checkValues: function (cb) {
            if (!req.body.accessToken) {
                var msg = "access token not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (!req.body.languageId) {
                var msg = "language id not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (!req.body.isUrgent) {
                var msg = "urgent field not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (req.body && req.body.accessToken && req.body.languageId && req.body.isUrgent) {
                accessToken = req.body.accessToken;
                languageId = req.body.languageId;
                isUrgent = req.body.isUrgent;
                cb(null);
            }
            else {
                var msg = "something went wrong";
                return sendResponse.sendErrorMessage(msg, res, 500);
            }
        },
        validateAccessToken: ['checkValues', function (cb) {
            var sql = " select id from supplier_branch where access_token = ? and is_deleted =0 limit 1";
            multiConnection[dbName].query(sql, [accessToken], function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(reply);
                } else {
                    if (result.length) {
                        branchId = result[0].id;
                        cb(null, result[0].id);
                    } else {
                        if (req.body.languageId == 14) {
                            var msg = "Invalid access token";
                        } else {
                            var msg = "تصريح الدخول غير صالح";
                        }
                        sendResponse.sendErrorMessage(msg, res, 401);
                    }
                }
            })

        }],
        getPendingOrderDetails: ['validateAccessToken', function (cb) {
            getPendingOrdersPageData(res, branchId, accessToken, languageId, isUrgent, function (err, response) {
                if (err) {
                    var msg = "something went wrong";
                    return sendResponse.sendErrorMessage(msg, res, 500);
                }
                else {
                    details = response;
                    cb(null);
                }

            });
        }]
    }, function (err, response) {
        if (err) {
            var msg = "something went wrong";
            return sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            sendResponse.sendSuccessData(details, constant.responseMessage.SUCCESS, res, 200);
        }

    })*/

}

/*function getPendingOrdersPageData(res, branchId, accessToken, languageId, isUrgent, callback) {
    var orders;
    var orderDetails;
    async.auto({
        getOrders: function (cb) {
            getPendingOrders(res, branchId, languageId, isUrgent, function (err, response) {
                if (err) {
                    var msg = "something went wrong";
                    return sendResponse.sendErrorMessage(msg, res, 500);
                }
                else {
                    orders = response;
                    cb(null);

                }

            });
        },
        getOrderDetails: ['getOrders', function (cb) {
            getOrderDetails(res, languageId, function (err, result) {
                if (err) {
                    var msg = "something went wrong";
                    return sendResponse.sendErrorMessage(msg, res, 500);
                }
                else {
                    orderDetails = result;
                    cb(null);
                }

            });
        }],
        clubOrderData: ['getOrderDetails', function (cb) {
            clubOrderData(res, orders, orderDetails, cb);
        }]
    }, function (err, response) {
        if (err) {
            var msg = "something went wrong";
            return sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            var data = {};
            data.access_token = accessToken;
            data.details = response.clubOrderData;
            callback(null, data)
        }

    })

}*/

var getPendingOrdersPageData = function(dbName,res, branchId, accessToken, languageId, isUrgent, callback) {
    var orders;
    var orderDetails;
    async.auto({
        getOrders: function (cb) {
            getPendingOrders(dbName,res, branchId, languageId, isUrgent, function (err, response) {
                if (err) {
                    var msg = "something went wrong";
                    return sendResponse.sendErrorMessage(msg, res, 500);
                }
                else {
                    orders = response;
                    cb(null);

                }

            });
        },
        getOrderDetails: ['getOrders', function (cb) {
            getOrderDetails(dbName,res, languageId, function (err, result) {
                if (err) {
                    var msg = "something went wrong";
                    return sendResponse.sendErrorMessage(msg, res, 500);
                }
                else {
                    orderDetails = result;
                    cb(null);
                }

            });
        }],
        clubOrderData: ['getOrders', 'getOrderDetails', function (cb) {
            clubOrderData(res, orders, orderDetails, cb);
        }]
    }, function (err, response) {
        if (err) {
            var msg = "something went wrong";
            return sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            var data = {};
            data.access_token = accessToken;
            data.details = response.clubOrderData;
            callback(null, data)
        }

    })

}

function getPendingOrders(dbName,res, branchId, languageId, isUrgent, callback) {

    var sql = "select o.id as order_id,o.created_on,o.delivery_charges,CONCAT(u.firstname, ' ',u.lastname) user_name,o.net_amount,ua.customer_address,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,o.schedule_date as delivery_date,o.handling_admin,o.handling_supplier,u.mobile_no,ua.address_link,o.payment_type,o.pickup_time,o.pickup_date,o.user_pickup_address";
    sql += " from orders o join user u on o.user_id = u.id join user_address ua on o.user_delivery_address = ua.id where o.supplier_branch_id ";
    sql += " = ? and o.status = ? and o.urgent = ? ";
    multiConnection[dbName].query(sql, [branchId, 0, isUrgent], function (err, result) {
        if (err) {
            console.log("error from pending orders" + err);
            var msg = "db error :";
            sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            callback(null, result);
        }

    })

}

function getOrderDetails(dbName,res, languageId, callback) {
    var sql = "select pp.category_id,pp.bar_code,pi.image_path,o.order_id,o.price,o.quantity,p.name,p.measuring_unit from order_prices o join product_ml p ";
    sql += " on o.product_id = p.product_id  join product_image pi on pi.product_id = p.product_id join product pp on pp.id=p.product_id where p.language_id = ? and pi.imageOrder=1";
    multiConnection[dbName].query(sql, [languageId], function (err, result) {
        if (err) {
            console.log("error from order details" + err);
            var msg = "db error :";
            sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            callback(null, result);
        }

    })
}

function clubOrderData(res, orders, orderDetails, callback) {
    var orderLength = orders.length;
    var orderDetailsLength = orderDetails.length;
console.log("..order....",orderDetailsLength,orderLength);
    if (!orderLength) {
        callback(null, []);
    }
    else {
        for (var i = 0; i < orderLength; i++) {
            (function (i) {
                // orders[i].delivery_date = moment(orders[i].delivery_date).format('D MMMM YYYY');
                var details = [];
                var date = orders[i].delivery_date;
                var date1 = orders[i].pickup_date;
                var date2 = orders[i].pickup_time;
                orders[i].delivery_date = moment(date).format('D MMMM YYYY');
                orders[i].pickup_date = moment(date1).format('D MMMM YYYY');
                orders[i].delivery_time = moment(date).format('HH:mm');
                orders[i].ios_delivery_time = moment(date).format('hh:mm A');
                var date3 = moment(date2,'h:mma');
                var date4= date3._d ;
                orders[i].ios_pickup_time = moment(date4).format('hh:mm A');

                for (var j = 0; j < orderDetailsLength; j++) {
                    (function (j) {
                        if (orders[i].order_id == orderDetails[j].order_id) {
                            if(orderDetails[j].category_id ==7 ||orderDetails[j].category_id ==7 ){
                                details.push({

                                    "product_amount":orderDetails[j].price,
                                    "product_name": orderDetails[j].name,
                                    "quantity": orderDetails[j].quantity,
                                    "measuring_unit": orderDetails[j].measuring_unit,
                                    "image":orderDetails[j].image_path,
                                    "bar_code":orderDetails[j].bar_code
                                });
                            }
                            else {
                                details.push({

                                    "product_amount":orderDetails[j].price,
                                    "product_name": orderDetails[j].name,
                                    "quantity": orderDetails[j].quantity,
                                    "measuring_unit": orderDetails[j].measuring_unit,
                                    "image":orderDetails[j].image_path,
                                });
                            }

                            if (j == orderDetailsLength - 1) {
                                orders[i].order_details = details;
                                if (i == orderLength - 1) {
                                    callback(null, orders);
                                }
                            }

                        }
                        else {
                            if (j == orderDetailsLength - 1) {
                                orders[i].order_details = details;
                                if (i == orderLength - 1) {
                                    callback(null, orders);
                                }
                            }
                        }

                    }(j))

                }

            }(i))
        }
    }

}

exports.listPendingTrackingAlerts = function (req, res) {

    var accessToken;
    var languageId;
    var supplierId,branchId;
    var details = {};
    async.auto({
        checkValues: function (cb) {
            if (!req.body.accessToken) {
                var msg = "access token not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (!req.body.languageId) {
                var msg = "language id not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (req.body && req.body.accessToken && req.body.languageId) {
                accessToken = req.body.accessToken;
                languageId = req.body.languageId;
                cb(null);
            }
            else {
                var msg = "something went wrong";
                return sendResponse.sendErrorMessage(msg, res, 500);
            }
        },
        validateAccessToken: ['checkValues', function (cb) {
            var sql = " select id,supplier_id from supplier_branch where access_token = ? limit 1";
            multiConnection[req.dbName].query(sql, [accessToken], function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(reply);
                } else {
                    if (result.length) {
                        supplierId = result[0].supplier_id;
                        branchId = result[0].id;

                        cb(null, result[0].supplier_id);
                    } else {
                        if (req.body.languageId == 14) {
                            var msg = "Invalid access token";
                        } else {
                            var msg = "تصريح الدخول غير صالح";
                        }
                        sendResponse.sendErrorMessage(msg, res, 401);
                    }
                }
            })

        }],
        getPendingTackingDetails: ['validateAccessToken', function (cb) {
            getPendingTackingDetailsPage(req.dbName,res, branchId, accessToken, languageId, function (err, response) {
                if (err) {
                    var msg = "something went wrong";
                    return sendResponse.sendErrorMessage(msg, res, 500);
                }
                else {
                    details = response;
                    cb(null);
                }

            });
        }]
    }, function (err, response) {
        if (err) {
            var msg = "something went wrong";
            return sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            sendResponse.sendSuccessData(details, constant.responseMessage.SUCCESS, res, 200);
        }

    })

/*    var accessToken;
    var languageId;
    var branchId;
    var details = {};
    async.auto({
        checkValues: function (cb) {
            if (!req.body.accessToken) {
                var msg = "access token not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (!req.body.languageId) {
                var msg = "language id not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (req.body && req.body.accessToken && req.body.languageId) {
                accessToken = req.body.accessToken;
                languageId = req.body.languageId;
                cb(null);
            }
            else {
                var msg = "something went wrong";
                return sendResponse.sendErrorMessage(msg, res, 500);
            }
        },
        validateAccessToken: ['checkValues', function (cb) {
            var sql = " select id from supplier_branch where access_token = ? and is_deleted =0 limit 1";
            multiConnection[dbName].query(sql, [accessToken], function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(reply);
                } else {
                    if (result.length) {
                        branchId = result[0].id;
                        cb(null, result[0].id);
                    } else {
                        if (req.body.languageId == 14) {
                            var msg = "Invalid access token";
                        } else {
                            var msg = "تصريح الدخول غير صالح";
                        }
                        sendResponse.sendErrorMessage(msg, res, 401);
                    }
                }
            })

        }],
        getPendingTackingDetails: ['validateAccessToken', function (cb) {
            getPendingTackingDetailsPage(res, branchId, accessToken, languageId, function (err, response) {
                if (err) {
                    var msg = "something went wrong";
                    return sendResponse.sendErrorMessage(msg, res, 500);
                }
                else {
                    details = response;
                    cb(null);
                }

            });
        }]
    }, function (err, response) {
        if (err) {
            var msg = "something went wrong";
            return sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            sendResponse.sendSuccessData(details, constant.responseMessage.SUCCESS, res, 200);
        }

    })*/
}

function getPendingTackingDetailsPage(dbName,res, branchId, accessToken, languageId, callback) {
    var orders;
    var orderDetails;
    async.auto({
        getOrders: function (cb) {
            getPendingTracking(dbName,res, branchId, languageId, function (err, response) {
                if (err) {
                    var msg = "something went wrong";
                    return sendResponse.sendErrorMessage(msg, res, 500);
                }
                else {
                    orders = response;
                    cb(null);

                }

            });
        },
        getOrderDetails: ['getOrders', function (cb) {
            getOrderDetails(dbName,res, languageId, function (err, result) {
                if (err) {
                    var msg = "something went wrong";
                    return sendResponse.sendErrorMessage(msg, res, 500);
                }
                else {
                    orderDetails = result;
                    cb(null);
                }

            });
        }],
        clubOrderData: ['getOrders', 'getOrderDetails', function (cb) {
            clubOrderData(res, orders, orderDetails, cb);
        }]
    }, function (err, response) {
        if (err) {
            var msg = "something went wrong";
            return sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            var data = {};
            data.access_token = accessToken;
            data.details = response.clubOrderData;
            callback(null, data)
        }

    })

}

function getPendingTracking(dbName,res, branchId, languageId, callback) {
   
    var sql = "select o.id order_id,o.created_on,o.delivery_charges,CONCAT(u.firstname, ' ',u.lastname) user_name,o.net_amount,ua.customer_address,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,o.schedule_date delivery_date,o.handling_admin,o.handling_supplier,u.mobile_no,ua.address_link,o.payment_type,o.pickup_time,o.pickup_date,o.user_pickup_address";
    sql += " from orders o join user u on o.user_id = u.id join user_address ua on o.user_delivery_address = ua.id where o.supplier_branch_id = ? and o.status = ? ";
    multiConnection[dbName].query(sql, [branchId, 7], function (err, result) {
        if (err) {
            console.log("error from pending orders" + err);
            var msg = "db error :";
            sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            callback(null, result);
        }

    })

}

exports.listScheduledOrderForTomorrow = function (req, res) {

    var accessToken;
    var languageId;
    var supplierId,branchId;
    var details = {};
    async.auto({
        checkValues: function (cb) {
            if (!req.body.accessToken) {
                var msg = "access token not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (!req.body.languageId) {
                var msg = "language id not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (req.body && req.body.accessToken && req.body.languageId) {
                accessToken = req.body.accessToken;
                languageId = req.body.languageId;
                cb(null);
            }
            else {
                var msg = "something went wrong";
                return sendResponse.sendErrorMessage(msg, res, 500);
            }
        },
        validateAccessToken: ['checkValues', function (cb) {
            var sql = " select id,supplier_id from supplier_branch where access_token = ? limit 1";
            multiConnection[req.dbName].query(sql, [accessToken], function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(reply);
                } else {
                    if (result.length) {
                        supplierId = result[0].supplier_id;
                        branchId = result[0].id;
                        cb(null, result[0].supplier_id);
                    } else {
                        if (req.body.languageId == 14) {
                            var msg = "Invalid access token";
                        } else {
                            var msg = "تصريح الدخول غير صالح";
                        }
                        sendResponse.sendErrorMessage(msg, res, 401);
                    }
                }
            })

        }],
        getScheduledOrders: ['validateAccessToken', function (cb) {
            getScheduledOrdersPage(req.dbName,res, branchId, accessToken, languageId, function (err, response) {
                if (err) {
                    var msg = "something went wrong";
                    return sendResponse.sendErrorMessage(msg, res, 500);
                }
                else {
                    details = response;
                    cb(null);
                }

            });
        }]
    }, function (err, response) {
        if (err) {
            var msg = "something went wrong";
            return sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            sendResponse.sendSuccessData(details, constant.responseMessage.SUCCESS, res, 200);
        }

    })

 /*   var accessToken;
    var languageId;
    var branchId;
    var details = {};
    async.auto({
        checkValues: function (cb) {
            if (!req.body.accessToken) {
                var msg = "access token not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (!req.body.languageId) {
                var msg = "language id not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (req.body && req.body.accessToken && req.body.languageId) {
                accessToken = req.body.accessToken;
                languageId = req.body.languageId;
                cb(null);
            }
            else {
                var msg = "something went wrong";
                return sendResponse.sendErrorMessage(msg, res, 500);
            }
        },
        validateAccessToken: ['checkValues', function (cb) {
            var sql = " select id from supplier_branch where access_token = ? and is_deleted =0 limit 1";
            multiConnection[dbName].query(sql, [accessToken], function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(reply);
                } else {
                    if (result.length) {
                        branchId = result[0].id;
                        cb(null, result[0].id);
                    } else {
                        if (req.body.languageId == 14) {
                            var msg = "Invalid access token";
                        } else {
                            var msg = "تصريح الدخول غير صالح";
                        }
                        sendResponse.sendErrorMessage(msg, res, 401);
                    }
                }
            })

        }],
        getScheduledOrders: ['validateAccessToken', function (cb) {
            getScheduledOrdersPage(res, branchId, accessToken, languageId, function (err, response) {
                if (err) {
                    var msg = "something went wrong";
                    return sendResponse.sendErrorMessage(msg, res, 500);
                }
                else {
                    details = response;
                    cb(null);
                }

            });
        }]
    }, function (err, response) {
        if (err) {
            var msg = "something went wrong";
            return sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            sendResponse.sendSuccessData(details, constant.responseMessage.SUCCESS, res, 200);
        }

    })*/
}

function getScheduledOrdersPage(dbName,res, branchId, accessToken, languageId, callback) {
    var orders;
    var orderDetails;
    async.auto({
        getOrders: function (cb) {
            getScheduledOrders(dbName,res, branchId, languageId, function (err, response) {
                if (err) {
                    var msg = "something went wrong";
                    return sendResponse.sendErrorMessage(msg, res, 500);
                }
                else {
                    orders = response;
                    cb(null);

                }

            });
        },
        getOrderDetails: ['getOrders', function (cb) {
            getOrderDetails(dbName,res, languageId, function (err, result) {
                if (err) {
                    var msg = "something went wrong";
                    return sendResponse.sendErrorMessage(msg, res, 500);
                }
                else {
                    orderDetails = result;
                    cb(null);
                }

            });
        }],
        clubOrderData: ['getOrderDetails', function (cb) {
            clubOrderData(res, orders, orderDetails, cb);
        }]
    }, function (err, response) {
        if (err) {
            var msg = "something went wrong";
            return sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            var data = {};
            data.access_token = accessToken;
            data.details = response.clubOrderData;
            callback(null, data)
        }

    })

}

function getScheduledOrders(dbName,res, branchId, languageId, callback) {
    
    var sql = "select o.status,o.id order_id,o.created_on,o.delivery_charges,CONCAT(u.firstname, ' ',u.lastname) user_name,o.net_amount,ua.customer_address,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,o.schedule_date delivery_date,o.handling_admin,o.handling_supplier,u.mobile_no,ua.address_link,o.payment_type,o.pickup_time,o.pickup_date,o.user_pickup_address ";
    sql += " from orders o join user u on o.user_id = u.id join user_address ua on o.user_delivery_address = ua.id where o.supplier_branch_id =? and o.status IN(?,?,?) ";
    multiConnection[dbName].query(sql, [branchId,1,3,4], function (err, result) {
        if (err) {
            console.log("error from pending orders" + err);
            var msg = "db error :";
            sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            callback(null, result);
        }

    })

}

exports.acceptPendingOrder = function (req, res) {

    var accessToken;
    var orderId;
    var branchId;
    var languageId;
    var userEmail;
    var deviceToken;
    var deviceType;
    var branchName;
    var userId;
    var notificationStatus;
    var notificationLanguage;
    let self_pickup=0;
    var message,userName,amount,placeDate,deliveryDate,paymentMethod,supplierNameArabic,supplierNameEnglish;
    async.auto({
        checkValues: function (cb) {
            if (!req.body.accessToken) {
                var msg = "access token not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (!req.body.orderId) {
                var msg = "order id not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (!req.body.languageId) {
                var msg = "language id not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (req.body && req.body.accessToken && req.body.orderId && req.body.languageId) {
                accessToken = req.body.accessToken;
                orderId = req.body.orderId;
                languageId = req.body.languageId;
                cb(null);
            }
            else {
                var msg = "something went wrong";
                return sendResponse.sendErrorMessage(msg, res, 500);
            }
        },
        validateAccessToken: ['checkValues', function (cb) {
            var sql = " select sb.id,sb.name,s.name as supplier,s.language_id from supplier_branch sb join supplier_ml s on s.supplier_id=sb.supplier_id where sb.access_token = ? and sb.is_deleted =0 order by language_id asc";
            multiConnection[req.dbName].query(sql, [accessToken], function (err, result) {
                if (err) {
                    cb(err);
                } else {
                    if (result.length) {
                        branchId = result[0].id;
                        branchName = result[0].name;
                        supplierNameEnglish = result[0].supplier;
                        supplierNameArabic = result[1].supplier;
                        cb(null, result[0].id);
                    } else {
                        if (req.body.languageId == 14) {
                            var msg = "Invalid access token";
                        } else {
                            var msg = "تصريح الدخول غير صالح";
                        }
                        sendResponse.sendErrorMessage(msg, res, 400);
                    }
                }
            })

        }],
        acceptOrder: ['validateAccessToken', function (cb) {
            acceptOrder(req.dbName,res, orderId, cb);
        }],
        getUserEmail: ['acceptOrder', function (cb) {
            getUserEmail(res, orderId, function (err, result) {
                console.log("........",result)
                if (err) {
                    var msg = "something went wrong";
                    return sendResponse.sendErrorMessage(msg, res, 500);
                }
                else {
                    userName=result.User_Name
                    self_pickup=result.self_pickup
                    userId = result.user_id;
                    userEmail = result.email;
                    deviceToken = result.device_token;
                    deviceType = result.device_type;
                    notificationStatus = result.notification_status;
                    notificationLanguage = result.notification_language;
                    amount = result.net_amount;
                    placeDate = moment(result.created_on).format('YYYY-MM-DD HH:mm');
                    deliveryDate = moment(result.schedule_date).format('YYYY-MM-DD HH:mm');
                    if(result.payment_type==0){
                        paymentMethod = "CASH";
                    }
                    else{
                        paymentMethod = "Card";
                    }
                    cb(null);
                }

            });
        }],
        sendUserEmail:['getUserEmail',function (cb) {


            emailTemp.acceptOrder(self_pickup,req,req.dbName,AdminMail,userName,amount,placeDate,deliveryDate,orderId,supplierNameEnglish,supplierNameArabic,paymentMethod,userEmail,notificationLanguage,function(err,result){
                if(err){
                    console.log("..****fb register email*****....",err);
                }
            })

            cb(null)
        }],
        sendPushNotification: ['sendUserEmail', function (cb) {
            if (notificationStatus == 0) {
                cb(null);
            }
            else {
                if (deviceType == 0) {
                    if (notificationLanguage == 14) {
                        var data = {
                            "status": 0,
                            "message":"Your Order Has been Confirmed",
                            "orderId":orderId

                        }
                    }
                    else {
                        var data = {
                            "status": 0,
                            "message":"تم تاكيد طلبك ",
                            "orderId":orderId

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
                            "status": 0,
                            "message":"Your Order Has been Confirmed",
                            "orderId":orderId

                        }
                    }
                    else {
                        var data = {
                            "status": 0,
                            "message":"تم تاكيد طلبك ",
                            "orderId":orderId

                        }
                    }
              

                    var paths = "user";
                    var sound = "ping.aiff";
                   // var data1={"message":"push Sent"}

                    pushNotifications.sendIosPushNotification(deviceToken, data, paths,sound, function (err, result) {
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
               // saveNoticationData(res, userId, branchId, orderId, constant.pushNotificationStatus.ORDER_ACCEPTED, message, cb)
                if(notificationLanguage == 14){
                    saveNoticationData(req.dbName,res, userId, branchId, orderId, constant.pushNotificationStatus.ORDER_ACCEPTED, constant.pushNotificationMessage.ORDER_ACCEPTED_ENGLISH, cb)
                }
                else {
                    saveNoticationData(req.dbName,res, userId, branchId, orderId, constant.pushNotificationStatus.ORDER_ACCEPTED, constant.pushNotificationMessage.ORDER_ACCEPTED_ARABIC, cb)
                }
                //console.log(message);

            }
        }],

    }, function (err, response) {
        if (err) {
            var msg = "something went wrong";
            return sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            if (languageId == 14) {
                var message = "Order Accepted";
                sendResponse.sendSuccessData({}, message, res, 200);
            }
            else {
                var message = "من اجل قبول";
                sendResponse.sendSuccessData({}, message, res, 200);
            }

        }

    })
}

exports.rejectPendingOrder = function (req, res) {
    var accessToken;
    var orderId;
    var rejectionReason;
    var branchId;
    var languageId;
    var userEmail;
    var deviceToken;
    var deviceType;
    var branchName;
    var userId;
    var notificationStatus;
    var notificationLanguage;
    var message,branchNameEnglish,branchNameArabic;
    let self_pickup;
    var userName,amount,placeDate,deliveryDate,paymentMethod,supplierNameEnglish,supplierNameArabic;
    async.auto({
        checkValues: function (cb) {
            if (!req.body.accessToken) {
                var msg = "access token not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (!req.body.orderId) {
                var msg = "order id not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (!req.body.languageId) {
                var msg = "language id not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (!req.body.rejectionReason) {
                var msg = "rejection reason not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (req.body && req.body.accessToken && req.body.orderId && req.body.languageId && req.body.rejectionReason) {
                accessToken = req.body.accessToken;
                orderId = req.body.orderId;
                rejectionReason = req.body.rejectionReason;
                languageId = req.body.languageId;
                cb(null);
            }
            else {
                var msg = "something went wrong";
                return sendResponse.sendErrorMessage(msg, res, 500);
            }
        },
        validateAccessToken: ['checkValues', function (cb) {
            var sql = "select sb.id,sb.name,s.name as supplier,s.language_id from supplier_branch sb join supplier_ml s on s.supplier_id=sb.supplier_id where sb.access_token = ? and sb.is_deleted =0 order by language_id asc";
            multiConnection[req.dbName].query(sql, [accessToken], function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(reply);
                } else {
                    if (result.length) {
                        branchId = result[0].id;
                        branchNameEnglish = result[0].name;
                        supplierNameEnglish = result[0].supplier;
                        supplierNameArabic = result[1].supplier;
                        cb(null, result[0].id);
                    } else {
                        if (req.body.languageId == 14) {
                            var msg = "Invalid access token";
                        } else {
                            var msg = "تصريح الدخول غير صالح";
                        }
                        sendResponse.sendErrorMessage(msg, res, 401);
                    }
                }
            })

        }],
        rejectOrder: ['validateAccessToken', function (cb) {
            rejectOrder(req.dbName,res, orderId, rejectionReason, cb);
        }],
        getUserEmail: ['rejectOrder', function (cb) {
            getUserEmail(res, orderId, function (err, result) {

                if (err) {
                    var msg = "something went wrong";
                    return sendResponse.sendErrorMessage(msg, res, 500);
                }
                else {
                    userEmail = result.email;
                    userId = result.user_id;
                    self_pickup=result.self_pickup
                    deviceToken = result.device_token;
                    deviceType = result.device_type;
                    notificationStatus = result.notification_status;
                    notificationLanguage = result.notification_language;
                    amount = result.net_amount;
                    placeDate = moment(result.created_on).format('YYYY-MM-DD HH:mm');
                    deliveryDate = moment(result.schedule_date).format('YYYY-MM-DD HH:mm');
                    if(result.payment_type==0){
                        paymentMethod = "CASH";
                    }
                    else{
                        paymentMethod = "Card";
                    }
                    cb(null);
                }

            });
        }],
        sendMail:['getUserEmail',function(cb){
            emailTemp.orderRejections(self_pickup,req,res,AdminMail,userName,amount,placeDate,deliveryDate,orderId,supplierNameEnglish,supplierNameArabic,paymentMethod,userEmail,notificationLanguage,function(err,result){
                if(err){
                    console.log("..****fb register email*****....",err);
                }
            })
            cb(null)

        }],
        sendPushNotification: ['getUserEmail', function (cb) {
            if (notificationStatus == 0) {
                cb(null)
            }
            else {

                if (deviceType == 0) {
                    if (notificationLanguage == 14) {
                        var data = {
                            "status":1,
                            "message": "Regret Your Order Has Been Rejected From "+branchNameEnglish,
                            "orderId":orderId

                            //   "data": {"supplier_name": supplierName}
                        }
                    }
                    else {
                        var data = {
                            "status":1,
                            "message": "مع الاسف تم رفض طلبك من قبل "+branchNameArabic,
                            "orderId":orderId

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
                            "message": "Regret Your Order Has Been Rejected From "+branchNameEnglish,
                            "orderId":orderId

                            //   "data": {"supplier_name": supplierName}
                        }
                    }
                    else {
                        var data = {
                            "status":1,
                            "message": "مع الاسف تم رفض طلبك من قبل "+branchNameArabic,
                            "orderId":orderId

                            //   "data": {"supplier_name": supplierName}
                        }
                    }


                    var paths = "user";
                    var sound = "ping.aiff"
                    pushNotifications.sendIosPushNotification(deviceToken,data,paths,sound, cb);
                }
            }
        }],
        savePushNotification: ['sendPushNotification', function (cb) {
            if (notificationStatus == 0) {
                cb(null);
            }
            else {
                if(notificationLanguage==14){
                    saveNoticationData(req.dbName,res, userId, branchId, orderId, constant.pushNotificationStatus.ORDER_REJECTED,  constant.pushNotificationMessage.ORDER_ACCEPTED_ENGLISH, cb)
                }
                else {
                    saveNoticationData(req.dbName,res, userId, branchId, orderId, constant.pushNotificationStatus.ORDER_REJECTED, message, cb)

                }
            }
        }],
    }, function (err, response) {
        if (err) {
            var msg = "something went wrong";
            return sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            if (languageId == 14) {
                var message = "Order Rejected";
                sendResponse.sendSuccessData({}, message, res, 200);
            }
            else {
                var message = "تم رفض الطلب";
                sendResponse.sendSuccessData({}, message, res, 200);
            }

        }

    })

}

function acceptOrder(dbName,res, orderId, callback) {
    var sql = "update orders set status = ? where id = ? limit 1";
    multiConnection[dbName].query(sql, [1, orderId], function (err, result) {
        if (err) {
            var msg = "db error :";
            sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            callback(null);
        }
    })

}

function rejectOrder(dbName,res, orderId, reason, callback) {
    var sql = "update orders set status = ?,approve_rejection_reason = ? where id = ? limit 1";
    multiConnection[dbName].query(sql, [2, reason, orderId], function (err, result) {
        if (err) {
            var msg = "db error :";
            sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            callback(null);
        }
    })

}

function saveNoticationData(dbName,res, userId, supplierId, orderId, status, message, callback) {
    var sql = "insert into push_notifications(user_id,branchId,order_id,notification_message,notification_status) values(?,?,?,?,?) ";
    multiConnection[dbName].query(sql, [userId, supplierId, orderId, message, status], function (err, result) {
        if (err) {
        /*    var msg = "db error :";
            sendResponse.sendErrorMessage(msg, res, 500);*/
            console.log("****************err*************")
            callback(null)
        }
        else {
            callback(null);
        }

    })

}

exports.changeBranchStatusOrder = function(request,reply){
    var orderId;
    var branchId;
    var status;
    var oldStatus = 0;
    var accessToken;
    var temp_value = 0;
    var deviceToken = 0;
    var userId = 0;
    var deviceType = 0;
    var supplierName;
    var supplierId;
    var notificationStatus;
    var notificationLanguage;
    async.auto({
        getValue:function(cb){
            if(!(request.body.accessToken)){
                var msg = "accessToken  not found"
                return sendResponse.sendErrorMessage(msg,reply,400);
            }else{
                accessToken = request.body.accessToken;
            }

            if(!(request.body.orderId)){
                var msg = "order id  not found"
                return sendResponse.sendErrorMessage(msg,reply,400);
            }else{
                orderId = request.body.orderId;
            }
            if(!(request.body.status)){
                var msg = "status  not found"
                return sendResponse.sendErrorMessage(msg,reply,400);
            }else{
                status = request.body.status;
            }
            cb(null);
        },
        checkAccessToken:['getValue',function(cb){
            var sql = "select id from supplier_branch where access_token =?";
            multiConnection[req.dbName].query(sql, [accessToken], function (err, result) {
                if (err) {
                    cb(err);
                }
                else {
                    if(result.length){
                        branchId = result[0].id;
                        cb(null);
                    }else{
                        cb("invalid access token")
                    }
                }
            })
        }],
        getStatus:['checkAccessToken',function (cb) {
            var sql1='select status from orders where id= ?';
            multiConnection[req.dbName].query(sql1,[orderId],function (err,result) {
                if(err){
                    cb(err);
                }
                else {
                    if(result.length){
                        oldStatus=result[0].status;
                    }
                    cb(null);
                }
            })
        }],
        changeStatus:['getStatus',function(cb){
            var datexvc = new Date();
            if(status == 3) {
                var sql = "update orders set status = ? , shipped_on = ? where id = ? ";
            }
            else if(status == 4){
                if(oldStatus==1){
                    var sql = "update orders set status = ? , near_on = ? ,shipped_on = ? where id = ? ";
                    multiConnection[req.dbName].query(sql, [status,datexvc,datexvc,orderId], function (err, result) {
                        if (err) {
                            cb(err);
                        }
                        else {
                            cb(null);
                        }
                    })
                }
                else {
                    var sql = "update orders set status = ?, near_on = ? where id = ? ";

                }
            }
            else if(status == 5){
                if(oldStatus==1){
                    var sql = "update orders set status = ? , near_on = ? ,shipped_on = ?,delivered_on = ? where id = ? ";
                    multiConnection[req.dbName].query(sql, [status,datexvc,datexvc,datexvc,orderId], function (err, result) {
                        if (err) {
                            cb(err);
                        }
                        else {
                            cb(null);
                        }
                    })
                }
                else if(oldStatus==3){
                    var sql = "update orders set status = ? ,shipped_on = ?,delivered_on = ? where id = ? ";
                    multiConnection[req.dbName].query(sql, [status,datexvc,datexvc,orderId], function (err, result) {
                        if (err) {
                            cb(err);
                        }
                        else {
                            cb(null);
                        }
                    })
                }
                else {
                    var sql = "update orders set status = ? ,delivered_on = ? where id = ? ";
                }
            }
            else {
                var sql = "update orders set status = ? , updated_on = ? where id = ? ";
            }
            multiConnection[req.dbName].query(sql, [status,datexvc,orderId], function (err, result) {
                if (err) {
                    cb(err);
                }
                else {
                    cb(null);
                }
            })
        }],
        orderLoyalityPoints:['getStatus',function(cb){

            console.log("..statsus...........",status,orderId);

            if(status == 5 && temp_value == 0){
                orderFunc.deliveredOrder(req.dbName,reply,orderId,status,function(err,result){
                    console.log("..............result...........csvfbdfvb.........",err,result);
                    if(err){
                        cb(err);
                    }else{
                        cb(null);
                    }
                })
            }else{
                cb(null);
            }
        }],
       /* notificationData: ['orderLoyalityPoints', function (cb) {
            if(status == 5){
                adminOrders.getValue(reply, orderId, function (err, values) {
                    if (err) {
                        sendResponse.somethingWentWrongError(reply);
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
            }
            else {
                cb(null)
            }

        }],
        sendPushNotification: ['notificationData', function (cb) {

            if(status==5){
                if (notificationStatus == 0) {
                    return cb(null);
                }
                else {
                    if (deviceType == 0) {
                        if (notificationLanguage == 14) {
                            var data = {
                                "status": 0,
                                "message":" Your Order Has been Delivered",
                                "orderId":orderId

                            }
                        }
                        else {
                            var data = {
                                "status": 0,
                                "message": "وقد تم تسليم طلبك",
                                "orderId":orderId

                            }
                        }
                        message = data.message;
                        console.log("......",message);
                        pushNotifications.sendAndroidPushNotification(deviceToken,data, function (err, result) {
                            if (err) {
                                var msg = "something went wrong";
                                return sendResponse.sendErrorMessage(msg, reply, 500);
                            }
                            else {
                                cb(null);
                            }
                        });
                    }
                    else {
                        if (notificationLanguage == 14) {
                            var data = {
                                "status": 0,
                                "message":" Your Order Has been Delivered",
                                "orderId":orderId

                            }
                        }
                        else {
                            var data = {
                                "status": 0,
                                "message": "وقد تم تسليم طلبك",
                                "orderId":orderId

                            }
                        }
                        var path = "user";
                        var sound = "ping.aiff";

                        console.log("...............fghjjmghk deleivery ios .........send ios");


                        pushNotifications.sendIosPushNotification(deviceToken, data, path,sound ,function (err, result) {
                            if (err) {
                                var msg = "something went wrong";
                                return sendResponse.sendErrorMessage(msg, reply, 500);
                            }
                            else {
                                cb(null);
                            }
                        });
                    }
                }
            }
            else {
                cb(null)
            }
        }],
        savePushNotification: ['sendPushNotification', function (cb) {
            if(status==5){
                if (notificationStatus == 0) {
                    cb(null);
                }
                else {
                    if(notificationLanguage ==14){
                        adminOrders.saveNoticationData(reply, userId, supplierId, orderId, constant.pushNotificationStatus.ORDER_DELIVERED,constant.pushNotificationMessage.ORDER_DELIVERED_ENGLISH, cb)
                    }
                    else {
                        adminOrders.saveNoticationData(reply, userId, supplierId, orderId, constant.pushNotificationStatus.ORDER_DELIVERED,constant.pushNotificationMessage.ORDER_DELIVERED_ARABIC, cb)
                    }
                }
            }
            else {
                cb(null);
            }

        }]*/
    },function(err,result){
        if(err){
            sendResponse.somethingWentWrongError(reply);
        }else{
            sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply,200);
        }
    })
}

exports.branchCancelOrder = function(req,res){
    var accessToken;
    var languageId;
    var supplierId,branchId;
    var details = {};
    async.auto({
        checkValues: function (cb) {
            if (!req.body.accessToken) {
                var msg = "access token not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (!req.body.languageId) {
                var msg = "language id not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (req.body && req.body.accessToken && req.body.languageId) {
                accessToken = req.body.accessToken;
                languageId = req.body.languageId;
                cb(null);
            }
            else {
                var msg = "something went wrong";
                return sendResponse.sendErrorMessage(msg, res, 500);
            }
        },
        validateAccessToken: ['checkValues', function (cb) {
            var sql = " select id,supplier_id from supplier_branch where access_token = ? limit 1";
            multiConnection[req.dbName].query(sql, [accessToken], function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(reply);
                } else {
                    if (result.length) {
                        supplierId = result[0].supplier_id;
                        branchId = result[0].id;
                        cb(null, result[0].supplier_id);
                    } else {
                        if (req.body.languageId == 14) {
                            var msg = "Invalid access token";
                        } else {
                            var msg = "تصريح الدخول غير صالح";
                        }
                        sendResponse.sendErrorMessage(msg, res, 401);
                    }
                }
            })
        }],
        getPendingOrderDetails: ['validateAccessToken', function (cb) {
            getCancelOrdersPageData(req.dbName,res, branchId, accessToken, languageId, function (err, response) {
                if (err) {
                    var msg = "something went wrong";
                    return sendResponse.sendErrorMessage(msg, res, 500);
                }
                else {
                    details = response;
                    cb(null);
                }

            });
        }]
    }, function (err, response) {
        if (err) {
            var msg = "something went wrong";
            return sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            sendResponse.sendSuccessData(details, constant.responseMessage.SUCCESS, res, 200);
        }

    })
}



exports.branchOrderDetails = function(request,reply){

    var orderId =0;
    var languageId =0;
    var supplierId;
    var accessToken;
    var data=[];
    async.auto({
        getValue:function(cb){
            if(!(request.body.accessToken)){
                var msg = "accessToken  not found"
                return sendResponse.sendErrorMessage(msg,reply,400);
            }else{
                accessToken = request.body.accessToken;
            }
            if(!(request.body.orderId)){
                var msg = "orderId  not found"
                return sendResponse.sendErrorMessage(msg,reply,400);
            }else{
                orderId = request.body.orderId;
            }
            if(!(request.body.languageId)){
                var msg = "languageId  not found"
                return sendResponse.sendErrorMessage(msg,reply,400);
            }else{
                languageId = request.body.languageId;
            }
            cb(null);
        },
        checkAccessToken:['getValue',function(cb){
            var sql = "select supplier_id from supplier_branch where access_token =?";
            multiConnection[request.dbName].query(sql, [accessToken], function (err, result) {
                if (err) {
                    cb(err);
                }
                else {
                    if(result.length){
                        supplierId = result[0].supplier_id;
                        cb(null);
                    }else{
                        cb("invalid access token")
                    }
                }
            })
        }],
        orderDescription:['checkAccessToken',function (cb) {
            supplierExtranet.orderDescription(request.dbName,reply,orderId,languageId,function (err,result) {
                if(err){
                    console.log("er....",err);
                    cb(err);
                }
                else {
                    data=result;
                    cb(null)
                }
            })
        }]
    },function(err,result){

        console.log("err******************************************************",err,data);
        
        if(err){
           
            sendResponse.somethingWentWrongError(reply);
        }else{
            sendResponse.sendSuccessData(data,constant.responseMessage.SUCCESS, reply,200);
        }
    })
}


exports.branchOrderBranchAcknowledgeCancelOrder = function(request,reply){
    var orderId;
    var supplierId;
    var status;
    var accessToken;
    console.log("req.body...",request.body)
    async.auto({
        getValue:function(cb){
            if(!(request.body.accessToken)){
                var msg = "accessToken  not found"
                return sendResponse.sendErrorMessage(msg,reply,400);
            }else{
                accessToken = request.body.accessToken;
            }

            if(!(request.body.orderId)){
                var msg = "order id  not found"
                return sendResponse.sendErrorMessage(msg,reply,400);
            }else{
                orderId = request.body.orderId;
            }
            if(!(request.body.status)){
                var msg = "status  not found"
                return sendResponse.sendErrorMessage(msg,reply,400);
            }else{
                status = request.body.status;
            }
            cb(null);
        },
        checkAccessToken:['getValue',function(cb){
            console.log("access....",accessToken);
            var sql = "select supplier_id from supplier_branch where access_token =?";
            multiConnection[request.dbName].query(sql, [accessToken], function (err, result) {
                if (err) {
                    cb(err);
                }
                else {
                    if(result.length){
                        supplierId = result[0].supplier_id;
                        cb(null);
                    }else{
                        cb("invalid access token")
                    }
                }
            })
        }],
        changeStatus:['checkAccessToken',function(cb){
            console.log("status",status,orderId);
            status=parseInt(status);
            var sql='update orders set is_acknowledged = ? where id = ?';
            multiConnection[request.dbName].query(sql,[status,orderId],function (err,result) {
                if (err) {
                    console.log("er...",err);
                    cb(err);
                }
                else {
                    cb(null);
                }
            })
        }]
    },function(err,result){
        if(err){
            sendResponse.somethingWentWrongError(reply);
        }else{
            sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply,200);
        }
    })
}



function getUserEmail(res, orderId, callback) {
    var sql = "select o.self_pickup,o.payment_type,o.net_amount,CONCAT(u.firstname,' ',u.lastname) As User_Name,u.id,u.email,u.device_token,u.device_type,u.notification_status,u.notification_language,o.created_on,o.schedule_date from orders o join user u on o.user_id = u.id where o.id = ? limit 1"
    multiConnection[dbName].query(sql, [orderId], function (err, result) {
        if (err) {
            var msg = "db error :";
            sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            var data = {
                "user_id": result[0].id,
                "email": result[0].email,
                "device_token": result[0].device_token,
                "device_type": result[0].device_type,
                "notification_status": result[0].notification_status,
                "notification_language": result[0].notification_language,
                "User_Name": result[0].User_Name,
                "net_amount": result[0].net_amount,
                "created_on": result[0].created_on,
                "schedule_date": result[0].schedule_date,
                "payment_type": result[0].payment_type,
                "self_pickup":result[0].self_pickup
            };
            //console.log("data.......", data)
            callback(null, data);
        }
    })

}


var getCancelOrdersPageData =  function (dbName,res, branchId, accessToken, languageId, callback) {
    var orders;
    var orderDetails;
    console.log("bramnh....",branchId)
    async.auto({
        getOrders: function (cb) {
            getcancelOrders(dbName,res, branchId, languageId, function (err, response) {
                if (err) {
                    var msg = "something went wrong";
                    return sendResponse.sendErrorMessage(msg, res, 500);
                }
                else {
                    orders = response;
                    cb(null);

                }

            });
        },
        getOrderDetails: ['getOrders', function (cb) {
            getOrderDetails(dbName,res, languageId, function (err, result) {
                if (err) {
                    var msg = "something went wrong";
                    return sendResponse.sendErrorMessage(msg, res, 500);
                }
                else {
                    orderDetails = result;
                    cb(null);
                }

            });
        }],
        clubOrderData: ['getOrders', 'getOrderDetails', function (cb) {
            clubOrderData(res, orders, orderDetails, cb);
        }]
    }, function (err, response) {
        if (err) {
            var msg = "something went wrong";
            return sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            var data = {};
            data.access_token = accessToken;
            data.details = response.clubOrderData;
            callback(null, data)
        }

    })

}

function getcancelOrders(dbName,res, branchId, languageId, callback) {


    var sql = "select o.id as order_id,o.created_on,o.delivery_charges,CONCAT(u.firstname, ' ',u.lastname) user_name,o.net_amount,ua.customer_address,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,o.schedule_date as delivery_date,o.handling_admin,o.handling_supplier,u.mobile_no,ua.address_link,o.payment_type,o.pickup_time,o.pickup_date,o.user_pickup_address";
    sql += " from orders o join user u on o.user_id = u.id join user_address ua on o.user_delivery_address = ua.id where o.supplier_branch_id = ? ";
    sql += " and o.status = ? and o.is_acknowledged=0 ";
    multiConnection[dbName].query(sql, [branchId, 8], function (err, result) {
        if (err) {
            console.log("error from pending orders" + err);
            var msg = "db error :";
            sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            callback(null, result);
        }

    })

}

exports.testingAndriod = function(req,res){
        var data = {
            "status": 0,
            "message":"تم تاكيد طلبك ",

        }
    pushNotifications.sendAndroidPushNotification("cN2sZs54VKI:APA91bHiqlUO5jo6wEPCytD3tJu9beqg5TCMNvgaR4DG71fdVk9X18ZsH8z6vSmtULBUX7ij9deYgJVw27DBUJ5sRI0alV3PjJokRQBm2t5kHXrd--tPemy33lSBsApdG1bI-2vP-TGf", data, function (err, result) {
        if (err) {
            var msg = "something went wrong";
            return sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
        console.log(",,,,,,,,,,result",result);
        }

    });
}



exports.image_Change = function(req,res){
    var id = req.body.supplierId;
    var supplierImage;
    async.auto({
        getSupplierImage:function(cb){
            var sql = "select image_path,orderImage from supplier_image where supplier_id = ? ";
            multiConnection[dbName].query(sql, [id], function (err, result) {
                if (err) {
                    cb(err);
                } else {
                    console.log("*****************************result****************",result);
                    supplierImage = result;
                    cb(null);
                }
            })
        },
        downloadFiles:['',function(cb){
            var len = supplierImage.length;
            for(var i =0;i<len;i++){
                (function(i){
                    console.log("..............i............................",i);
                    download(supplierImage[i].image_path,'../uploads', function(){
                        console.log('done');

                    });
                }(i));
            }
        }]
    },function(err,result){
        if(err){
            var msg = "something went wrong";
            return sendResponse.sendErrorMessage(msg, res, 500);

        }else{
            sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply,200);
        }
    })
}

var download = function(uri, filename, callback){
    request.head(uri, function(err, res, body){
        console.log('content-type:', res.headers['content-type']);
        console.log('content-length:', res.headers['content-length']);
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);

    });
};



exports.changeBanner = function(request,reply){

    var imageLink;
    var order;
    async.auto({
        getParameter:function(cb){
            
            if(!(request.body.imageLink)){
                var msg = ".imageLink not found"
                return sendResponse.sendErrorMessage(msg,reply,400);
            }else{
                imageLink = request.body.imageLink;
            }
            
            if(!(request.body.order)){
                var msg = "order not found"
                return sendResponse.sendErrorMessage(msg,reply,400);
            }else{
                order = request.body.order;
            }
            
            cb(null);
        },

        banner:['getParameter',function(cb){
            var sql='update advertisements set orders = ? where banner_image = ?';
            multiConnection[request.dbName].query(sql, [order,imageLink], function (err, result) {
                if (err) {
                    cb(err);
                } else {
                    console.log("*****************************result****************",result);
                    cb(null);
                }
            })
        }]
    },function(err,result){
        if(err){
            var msg = "something went wrong";
            return sendResponse.sendErrorMessage(msg, res, 500);
        }else{
            sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply,4);
        }
    })

}


