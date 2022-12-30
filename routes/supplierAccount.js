/**
 * Created by cbl98 on 24/5/16.
 */
const ExecuteQ = require('../lib/Execute')
var func = require('./commonfunction');
var async = require('async');
var sendResponse = require('./sendResponse');
var constant = require('./constant');
var supplierAccount = require('./supplierAccount');
var moment = require('moment')
const common=require('../common/agent')
var Universal=require('../util/Universal');
var log4js=require("log4js")
var logger = log4js.getLogger();
logger.level = 'debug';
const uploadMgr = require('../lib/UploadMgr')

exports.accountPayablelist = function (req,res) {


    var accessToken=0;
    var sectionId=0;
    var search = req.body.search;
    var limit = req.body.limit;
    var offset = req.body.offset
    var supplier_id=0;
    var supplierId=0;
    var data=[];
  var startDate= req.body.startDate!=undefined && req.body.startDate!=""?req.body.startDate:'1990-01-01',
        // endDate='2100-01-01',
        endDate=req.body.endDate!=undefined && req.body.endDate!=""?req.body.endDate:'2100-01-01',
        status='';
        status='';
console.log("req body",req.body);
    async.auto({
        blankField:function(cb) {
            if(req.body && req.body.accessToken && req.body.authSectionId)
            {
                accessToken=req.body.accessToken;
                sectionId=req.body.authSectionId;
                if(req.body.startDate){
                    startDate= req.body.startDate
                }
                if(req.body.endDate){
                    endDate= req.body.endDate
                }
                if(req.body.status){
                    status= req.body.status
                }
                cb(null);
            }
            else
            {
                sendResponse.parameterMissingError(res);
            }
        },
        authenticate:['blankField',function (cb) {
            func.authenticateSupplierAccessToken(req.dbName,accessToken, res,function(err,result){
                if(err)
                {
                    sendResponse .somethingWentWrongError(res);
                }
                else
                {
                    supplier_id=result;
                    //console.log("supplierId:  ",supplier_id);
                    cb(null);
                }

            },1)
        }],
        // checkauthority:['authenticate',function(cb) {
        //     func.checkforAuthorityofThisSupplier(req.dbName,supplier_id,sectionId, res,function (err,result) {
        //         if(err)
        //         {
        //             sendResponse.somethingWentWrongError(res);
        //         }
        //         else
        //         {
        //             //console.log("checkauthority complete");
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
        payableListing:['supplierId',function(cb){

            
            supplierAccount.accountPayableListing(req,req.dbName,res,supplierId,startDate,endDate,status,search,limit,offset,function (err,result) {
                if(err) {
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
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,constant.responseStatus.SUCCESS);
        }
    })

};

exports.payableDescription = function (req,res) {
    var accessToken=0;
    var sectionId=0;
    var accountPayableId=0;
    var supplier_id;
    var data=[];
    async.auto({
        blankField:function(cb)
        {
            if(req.body && req.body.accessToken && req.body.authSectionId && req.body.id)
            {
                accessToken=req.body.accessToken;
                sectionId=req.body.authSectionId;
                accountPayableId=req.body.id;
                cb(null);
            }
            else
            {
                sendResponse.parameterMissingError(res);
            }
        },  authenticate:['blankField',function (cb)
        {
            func.authenticateSupplierAccessToken(req.dbName,accessToken,res,function(err,result){
                if(err)
                {
                    sendResponse .somethingWentWrongError(res);
                }
                else
                {
                    supplier_id=result;
                    //console.log("supplierId:  ",supplier_id);
                    cb(null);
                }

            },1)
        }],
        // checkauthority:['authenticate',function(cb)
        // {
        //     func.checkforAuthorityofThisSupplier(req.dbName,supplier_id,sectionId, res,function (err,result) {
        //         if(err)
        //         {
        //             sendResponse.somethingWentWrongError(res);
        //         }
        //         else
        //         {
        //             //console.log("checkauthority complete");
        //             cb(null);
        //         }
        //     });

        // }],
        payableDescription:['authenticate',function(cb){
            accountPayableDescription(req.dbName,res,accountPayableId,function (err,result) {
                if(err) {
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
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,constant.responseStatus.SUCCESS);
        }
    })

};

exports.payment = function (req,res) {
    var accessToken=0;
    var sectionId=0;
    var orderId=0;
    var subsId=0;
    var paymentAmount=0;
    var supplier_id;
    var paymentMethod=-1;
    var payid=0;
    var subPayId=0
    var data=[];
    var supplierId=0;
    var subsAmount=0;
    var accountType;
    var transactionData;
    async.auto({
        blankField:function(cb)
        {
            // if(req.body && req.body.accessToken && req.body.authSectionId && ((req.body.amount  && req.body.paymethod && req.body.payId && req.body.id) ||( req.body.subId && req.body.subAmount && req.body.subPayId)))
            if(req.body && req.body.accessToken && req.body.authSectionId && req.body.transactionData)

            {
                accessToken=req.body.accessToken;
                sectionId=req.body.authSectionId;
                transactionData=req.body.transactionData;
                accountType=req.body.accountType;
                cb(null);


            //     if(req.body.id && req.body.subId){
            //         accessToken=req.body.accessToken;
            //         sectionId=req.body.authSectionId;
            //         orderId=req.body.id;
            //         paymentAmount=req.body.amount;
            //         paymentMethod=req.body.paymethod;
            //         payid=req.body.payId;
            //         subPayId=req.body.subPayId;
            //         subsId=req.body.subId;
            //         subsAmount=req.body.subAmount;
            //         cb(null);
            //     }   
            //     if(req.body.id){
            //         if(!req.body.subId){
            //             accessToken=req.body.accessToken;
            //             sectionId=req.body.authSectionId;
            //             orderId=req.body.id;
            //             paymentAmount=req.body.amount;
            //             paymentMethod=req.body.paymethod;
            //             payid=req.body.payId;
            //         }
            //         cb(null);
            //     }
            //     if(req.body.subId){
            //         if(!req.body.id){
            //             accessToken=req.body.accessToken;
            //             sectionId=req.body.authSectionId;
            //             subsId=req.body.subId;
            //             subsAmount=req.body.subAmount;
            //             subPayId=req.body.subPayId;
            //         }
            //         cb(null);
            //     }
              

            }
            else
            {
                sendResponse.parameterMissingError(res);
            }
        }, 
        authenticate:['blankField',function (cb)
        {
            //console.log("acc",accessToken);
            func.authenticateSupplierAccessToken(req.dbName,accessToken, res,function(err,result){
                if(err)
                {
                    sendResponse.somethingWentWrongError(res);
                }
                else
                {
                    supplier_id=result;
                    //console.log("supplierId:  ",supplier_id);
                    cb(null);
                }

            },1)
        }],
        // checkauthority:['authenticate',function(cb)
        // {
        //     func.checkforAuthorityofThisSupplier(req.dbName,supplier_id,sectionId, res,function (err,result) {
        //         if(err)
        //         {
        //             sendResponse.somethingWentWrongError(res);
        //         }
        //         else
        //         {
        //             //console.log("checkauthority complete");
        //             cb(null);
        //         }
        //     });

        // }],
        supplier:['authenticate',function (cb) {
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
        payment:['supplier',function(cb){
            // payment(req.dbName,res,supplierId,orderId,paymentAmount,paymentMethod,payid,subsId,subsAmount,subPayId,function (err,result) {
            //     if(err) {
            //         sendResponse.somethingWentWrongError(res);
            //     }
            //     else{
            //         data=result;
            //         cb(null);
            //     }
            // })
            if(accountType == 1){
                receivablePayment(req.dbName,res,transactionData,function (err,result) {
                    if(err) {
                        sendResponse.somethingWentWrongError(res);
                    }
                    else {
                        data=[];
                        cb(null);
                    }
                })
            }
            else
            if(accountType == 2){
                subscriptionPayment(req.dbName,res,transactionData,function (err,result) {
                    if(err) {
                        sendResponse.somethingWentWrongError(res);
                    }
                    else {
                        data=[];
                        cb(null);
                    }
                })
            }
              else {
                payablePayment(req.dbName,res,transactionData,function (err,result) {
                    if(err) {
                        sendResponse.somethingWentWrongError(res);
                    }
                    else {
                        data=[];
                        cb(null);
                    }
                })
            }
        }]
    },function(err,result){
        if(err) {
            sendResponse.somethingWentWrongError(res);
        }else{
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,constant.responseStatus.SUCCESS);
        }
    })

};

function receivablePayment(dbName,res,data,callback) {
    var id=0;
        console.log(".nfds",data.length);
        async.auto({
            update:function (cb) {
                for(var i=0;i<data.length;i++){
                    (function (i) {
                        var amount=parseFloat(data[i].amount);
                        var orderId=parseInt(data[i].orderId);
                        var sql = "update account_receivable_order aro join account_receivable ar on aro.account_receivable_id = ar.id set " +
                            "aro.total_left = aro.total_left - "+amount+",aro.total_paid = aro.total_paid  + "+amount+",aro.status = 1," +
                            "ar.amount_paid = ar.amount_paid + "+amount+",ar.amount_left = ar.amount_left - "+amount+" where aro.order_id = "+orderId;
                        let stmt = multiConnection[dbName].query(sql, function (err, result) {
                            logger.debug("dfsnfdskfds",err,result)
                            logger.debug("==========statement in  receivablePayment supplier=======",stmt.sql)

                            if (err) {
                                console.log('errr1----', err);
                                sendResponse.somethingWentWrongError(res);
                            }
                            else {
                                console.log("dfd",i)
                                if(i==(data.length-1)){
                                    cb(null);
                                }
                            }
                        });
                    }(i))
                }
            },
            setStatement:['update',function (cb) {
                var date1 = moment().utcOffset(4);
                var date=date1._d;
                for(var i=0;i<data.length;i++){
                    (function (i) {
                        var amount=parseInt(data[i].amount);
                        var orderId=data[i].orderId
                        var supplierId=data[i].supplierId
                        var sql ='insert into account_statement(supplier_id,order_id,transaction_date,credit)values(?,?,?,?)';
                        multiConnection[dbName].query(sql,[supplierId,orderId,date,amount], function (err, result) {
                            console.log("dfsnfdskfds",err,result)
                            if (err) {
                                console.log('errr1----', err);
                                sendResponse.somethingWentWrongError(res);
                            }
                            else {
                                console.log("ddd",i)
                                if(i==(data.length-1)){
                                    cb(null);
                                }
                            }
                        });
                    }(i))
                }
            }]
        },function (err,result) {
            if(err){
                console.log('errr3----', err);
                sendResponse.somethingWentWrongError(res);
            }
            else {
                callback(null);
            }
        });
}
    


function subscriptionPayment(dbName,res,data,callback) {
    var id=0;
        async.auto({
            update:function (cb) {
                for(var i=0;i<data.length;i++){
                    (function (i) {
                        var amount=parseInt(data[i].amount);
                        var orderId=parseInt(data[i].orderId);
                        var sql = "update account_receivable_subscriptions aro join account_receivable ar on aro.account_receivable_id = ar.id set " +
                            "aro.transaction_status = 1,ar.amount_paid = ar.amount_paid + "+amount+",ar.amount_left = ar.amount_left - "+amount+" where aro.id = "+orderId;
                        multiConnection[dbName].query(sql, function (err, result) {
                            console.log(".....",err,result);
                            if (err) {
                                console.log('errr1----', err);
                                sendResponse.somethingWentWrongError(res);
                            }
                            else {
                                if(i==(data.length-1)){
                                    cb(null);
                                }
                            }
                        });
                    }(i))
                }
            },
            setStatement:['update',function (cb) {
                var date1 = moment().utcOffset(4);
                var date=date1._d
                for(var i=0;i<data.length;i++){
                    (function (i) {
                        var amount=parseInt(data[i].amount);
                        var orderId=data[i].orderId;
                        var supplierId=data[i].supplierId;
                        var sql ='insert into account_statement(supplier_id,subscription_id,transaction_date,credit)values(?,?,?,?)';
                        multiConnection[dbName].query(sql,[supplierId,orderId,moment(date).format('YYYY-MM-DD'),amount], function (err, result) {
                            if (err) {
                                console.log('errr1----', err);
                                sendResponse.somethingWentWrongError(res);
                            }
                            else {
                                if(i==(data.length-1)){
                                    cb(null);
                                }
                            }
                        });
                    }(i))
                }
            }]
        },function (err,result) {
            if(err){
                console.log('errr3----', err);
                sendResponse.somethingWentWrongError(res);
            }
            else {
                callback(null);
            }
        });
}



function payablePayment(dbName,res,data,callback) {
    var id=0;
        async.auto({
            update:function (cb) {
                for(var i=0;i<data.length;i++){
                    (function (i) {
                        var amount=parseInt(data[i].amount);
                        var orderId=parseInt(data[i].orderId);
                        var sql = "update account_payable_order aro join account_payable ar on aro.account_payable_id = ar.id set " +
                            "aro.total_left = aro.total_left - "+amount+",aro.total_paid = aro.total_paid  + "+amount+",aro.status = 1," +
                            "ar.amount_paid = ar.amount_paid + "+amount+",ar.amount_left = ar.amount_left - "+amount+" where aro.order_id = "+orderId;
                        multiConnection[dbName].query(sql, function (err, result) {
                            console.log(".....",err,result);
                            if (err) {
                                console.log('errr1----', err);
                                sendResponse.somethingWentWrongError(res);
                            }
                            else {
                                if(i==(data.length-1)){
                                    cb(null);
                                }
                            }
                        });
                    }(i))
                }
            },
            setStatement:['update',function (cb) {
                var date1 = moment().utcOffset(4);
                var date=date1._d
                for(var i=0;i<data.length;i++){
                    (function (i) {
                        var amount=parseInt(data[i].amount);
                        var orderId=data[i].orderId;
                        var supplierId=data[i].supplierId;
                        var sql ='insert into account_statement(supplier_id,order_id,transaction_date,debit)values(?,?,?,?)';
                        multiConnection[dbName].query(sql,[supplierId,orderId,date,amount], function (err, result) {
                            if (err) {
                                console.log('errr1----', err);
                                sendResponse.somethingWentWrongError(res);
                            }
                            else {
                                if(i==(data.length-1)){
                                    cb(null);
                                }
                            }
                        });
                    }(i))
                }
            }]
        },function (err,result) {
            if(err){
                console.log('errr3----', err);
                sendResponse.somethingWentWrongError(res);
            }
            else {
                callback(null);
            }
        });
}
    


exports.accountReceivablelist = function (req,res) {

    var accessToken=0;
    var sectionId=0;
    var search = req.body.search
    var limit = req.body.limit
    var offset = req.body.offset
    var supplierId=0;
    var supplier_id=0;
    var data=[];
    var startDate= req.body.startDate!=undefined && req.body.startDate!=""?req.body.startDate:'1990-01-01',
        // endDate='2100-01-01',
        endDate=req.body.endDate!=undefined && req.body.endDate!=""?req.body.endDate:'2100-01-01',
        status='';
    async.auto({
        blankField:function(cb)
        {
            if(req.body && req.body.accessToken && req.body.authSectionId)
            {
                accessToken=req.body.accessToken;
                sectionId=req.body.authSectionId;
                cb(null);
            }
            else
            {
                sendResponse.parameterMissingError(res);
            }
        }, authenticate:['blankField',function (cb)
        {
            func.authenticateSupplierAccessToken(req.dbName,accessToken, res,function(err,result){
                if(err)
                {
                    sendResponse .somethingWentWrongError(res);
                }
                else
                {
                    supplier_id=result;
                    //console.log("supplierId:  ",supplier_id);
                    cb(null);
                }

            },1)
        }],
        // checkauthority:['authenticate',function(cb)
        // {
        //     func.checkforAuthorityofThisSupplier(req.dbName,supplier_id,sectionId, res,function (err,result) {
        //         if(err)
        //         {
        //             sendResponse.somethingWentWrongError(res);
        //         }
        //         else
        //         {
        //             //console.log("checkauthority complete");
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
        receivableListing:['supplierId',function(cb){
            supplierAccount.accountReceivableListing(req,req.dbName,res,supplierId,startDate,endDate,status,search,limit,offset,function (err,result) {
                if(err) {
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
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,constant.responseStatus.SUCCESS);
        }
    })

};
/**
 * @description used for detail an recieved amount from account section
 */
exports.receivableDescription = function (req,res) {
    var accessToken=0;
    var sectionId=0;
    var accountPayableId=0;
    var supplier_id;
    var data=[];
    async.auto({
        blankField:function(cb)
        {
            if(req.body && req.body.accessToken && req.body.authSectionId && req.body.id)
            {
                accessToken=req.body.accessToken;
                sectionId=req.body.authSectionId;
                accountPayableId=req.body.id;
                cb(null);
            }
            else
            {
                sendResponse.parameterMissingError(res);
            }
        }, authenticate:['blankField',function (cb)
        {
            func.authenticateSupplierAccessToken(req.dbName,accessToken,res,function(err,result){
                if(err)
                {
                    sendResponse .somethingWentWrongError(res);
                }
                else
                {
                    supplier_id=result;
                    //console.log("supplierId:  ",supplier_id);
                    cb(null);
                }

            },1)
        }],
        // checkauthority:['authenticate',function(cb)
        // {
        //     func.checkforAuthorityofThisSupplier(req.dbName,supplier_id,sectionId, res,function (err,result) {
        //         if(err)
        //         {
        //             sendResponse.somethingWentWrongError(res);
        //         }
        //         else
        //         {
        //             //console.log("checkauthority complete");
        //             cb(null);
        //         }
        //     });

        // }],
        receivableDescription:['authenticate',function(cb){
            accountReceivableDescription(req.dbName,res,accountPayableId,function (err,result) {
                if(err) {
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
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,constant.responseStatus.SUCCESS);        }
    })

};
/**
 * @description used for listing an receive amount of account section
 */
exports.statement = function (req,res) {
    var accessToken=0;
    var sectionId=0;
    var supplier_id;
    var search = req.body.search;
    var limit = req.body.limit;
    var offset = req.body.offset;
    var supplierId=0;
    var startDate= '1990-01-01',
        endDate='2100-01-01';
    var data=[];
    async.auto({
        blankField:function(cb) {
            if(req.body && req.body.accessToken && req.body.authSectionId)
            {
                accessToken=req.body.accessToken;
                sectionId=req.body.authSectionId;
                if(req.body.startDate){
                    startDate= req.body.startDate
                }
                if(req.body.endDate){
                    endDate= req.body.endDate
                }
                cb(null);
            }
            else
            {
                sendResponse.parameterMissingError(res);
            }
        },
        authenticate:['blankField',function (cb) {
            func.authenticateSupplierAccessToken(req.dbName,accessToken,res,function(err,result){
                if(err)
                {
                    sendResponse .somethingWentWrongError(res);
                }
                else
                {
                    supplier_id=result;
                    //console.log("supplierId:  ",supplier_id);
                    cb(null);
                }

            },1)
        }],
        // checkauthority:['authenticate',function(cb) {
        //     func.checkforAuthorityofThisSupplier(req.dbName,supplier_id,sectionId, res,function (err,result) {
        //         if(err)
        //         {
        //             sendResponse.somethingWentWrongError(res);
        //         }
        //         else
        //         {
        //             //console.log("checkauthority complete");
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
        getStatement:['supplierId',function(cb){
            
            getStatement(req,req.dbName,res,supplierId,startDate,endDate,search,limit,offset,function (err,result) {
                if(err) {
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
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,constant.responseStatus.SUCCESS);        }
    })

};

// function getId(dbName,res,id,cb){
//     var sql='select supplier_id from supplier_admin where id=?';
//     multiConnection[dbName].query(sql,[id],function (err,id) {
//         if(err)
//         {
//             console.log('error------',err);
//             sendResponse.somethingWentWrongError(res);

//         }
//         else {
//             console.log('result-----',id);
//             cb(null,id);
//         }
//     })}
async function getId(dbName, res, id, cb) {
    try{
        var sql = 'select supplier_id from supplier_admin where id=?';
        let result=await ExecuteQ.Query(dbName,sql,[id]);
        if (result && result.length) {
            cb(null,result);
        }
        else{
            var sql1 = 'select supplier_id from supplier_branch where id=?';
            let result1=await ExecuteQ.Query(dbName,sql1,[id])
            if (result1.length){
                cb(null, result1);
            }else{
                sendResponse.somethingWentWrongError(res);
            }
        }
    }
    catch(Err){
        logger.debug("=getId=Err!==",Err)
        sendResponse.somethingWentWrongError(res);
    }
    // var sql = 'select supplier_id from supplier_admin where id=?';
    // multiConnection[dbName].query(sql, [id], function (err, result) {
    //     if (err) {
    //         console.log('error------', err);
    //         sendResponse.somethingWentWrongError(res);

    //     }
    //     else {
    //         //console.log('result-----',id);
    //         if (result.length) {
    //             cb(null,result);
    //         } else {
    //             var sql = 'select supplier_id from supplier_branch where id=?';
    //             multiConnection[dbName].query(sql, [id], function (err, result) {
    //                 if (err) {
    //                     console.log('error------', err);
    //                     sendResponse.somethingWentWrongError(res);

    //                 }
    //                 else {
    //                     //console.log('result-----',id);
    //                     if (result.length){
    //                         cb(null, result);
    //                     }else{
    //                         sendResponse.somethingWentWrongError(res);
    //                     }
    //                 }
    //             })
    //         }

    //     }
    // })
}
exports.accountPayableListing=function(req,dbName,res,supplier,startDate,endDate,status,search,limit,offset,callback) {
logger.debug("===============in accountpayableListing function==========",search)
    var sum=0;
    var data1={};
    var orders=[];
    var totalAdmin=0;
    var totalSupplier=0;
    /*  var id=0;*/
    console.log("....ss",supplier,startDate,endDate,status)
    var sql1;
    async.auto({
        ordersPart:async function (cb) {
            try{
                
             sql1="select o.admin_commission, cr.id as cart_id,op.product_id, op.quantity, aro.status,aro.commission,IFNULL(odp.discountAmount,0) as discountAmount,aro.order_id,o.net_amount as total_order_price,s.id,s.name,u.firstname,o.payment_source, o.user_service_charge,o.supplier_vat_value,o.card_payment_id as payment_id,o.self_pickup, o.transaction_id as payment_reference_number,o.delivered_on,o.handling_admin,o.handling_supplier,o.delivery_charges,o.urgent_price,(o.net_amount-IFNULL(odp.discountAmount,0)) as net_amount,aro.total_amount from account_receivable ar join account_receivable_order aro " +
                "on aro.account_receivable_id=ar.id join orders o on o.id=aro.order_id join order_prices op on op.order_id = o.id left join order_promo odp on odp.orderId = o.id join supplier_branch sb on sb.id =o.supplier_branch_id join " +
                " supplier s on s.id =sb.supplier_id join user u on u.id = o.user_id left join cart cr on cr.id=o.cart_id " +
                "where s.id LIKE '%"+supplier+"%' AND  DATE( o.delivered_on ) >= '"+startDate+"' " +
                "AND DATE( o.delivered_on ) <=  '"+endDate+"' AND aro.status LIKE '%"+status+"%' AND (u.firstname LIKE '%"+search+"%' OR aro.order_id LIKE '%"+search+"%') group by aro.order_id order by aro.order_id desc LIMIT "+offset+","+limit+""
            let receivable=await ExecuteQ.Query(dbName,sql1,[]);
       


            // let stmt = multiConnection[dbName].query(sql1, function (err, receivable) {
            //     logger.debug("=============stmt in order part========",stmt.sql)
            //     if (err) {
            //         console.log('error------', err);
            //         sendResponse.somethingWentWrongError(res);

            //     }
            //     else {
                    if(receivable.length){
                        for (const [key, value] of receivable.entries()) {
                            
                            let Product_cost = await totalOrderPrice(dbName,value.order_id);
                            let adds_on=await getOrderAddsOn(dbName,value.cart_id,value.product_id);
                            if(adds_on && adds_on.length>0){
                                let addonprice = await addonTotalPrice(adds_on,value.quantity)
                                Product_cost = Product_cost + addonprice;
                            }
                            value.Product_cost=Product_cost;
                        }

                        data1.orders=receivable
                        if(parseInt(req.body.is_download)==1){
                            let sql2 = sql1.split('LIMIT')[0];
                            let receivable = await ExecuteQ.Query(dbName,sql2,[]);
                            let header = [ 
                                {id: 'ORDER NO', title: 'ORDER NO'},
                                {id: 'RESTAURANT ID', title: 'RESTAURANT ID'},   
                                {id: 'RESTAURANT NAME', title: 'RESTAURANT NAME'}, 
                                {id: 'CUSTOMER NAME', title: 'CUSTOMER NAME '},
                                {id: 'ORDER DELIVERY DATE', title: 'ORDER DELIVERY DATE'},
                                {id: 'TAX', title: 'TAX'},
                                {id: 'COMMISSION', title: 'COMMISSION'},
                                {id: 'DELIVERY CHARGES', title: 'DELIVERY CHARGES'},
                                {id: 'ORDERS AMOUNT', title: 'ORDERS AMOUNT'},
                                {id: 'BALANCE AMOUNT', title: 'BALANCE AMOUNT'},
                                {id: 'PAYMENT STATUS', title: 'PAYMENT STATUS'}
                              ]
                              let data = receivable.map((element)=>{
                                  let temp = {}
                                  temp["ORDER NO"] = element.order_id
                                  temp["RESTAURANT ID"] = element.id
                                  temp["RESTAURANT NAME"] = element.name 
                                  temp["CUSTOMER NAME"] = element.firstname
                                  temp["ORDER DELIVERY DATE"] = moment(element.delivered_on).format('MMMM Do YYYY, h:mm:ss a')
                                  temp.TAX = element.handling_admin
                                  temp.COMMISSION = element.commission
                                  temp["DELIVERY CHARGES"] = element.delivery_charges
                                  temp["ORDERS AMOUNT"] = element.net_amount
                                  temp["BALANCE AMOUNT"] = element.total_amount
                                  temp["PAYMENT STATUS"] = element.status==1?"Received":"Pending" //0-unpaid,1-fully_paid,2-partially_paid
                                  return temp;
                              })
                              let csvLink = await uploadMgr.uploadCsvFileNew(data,header,"cash_orders_list_")
                              logger.debug("+==========csvLingk=========",csvLink)
                              data1.csvFileLink = csvLink
                              cb(null)
                        }
                    }
                    else {
                        data1.orders={}
                    }
                    cb(null)
            //     }
            // })
        }
        catch(Err){
            logger.debug("==ordersPart=Err",Err);
            sendResponse.somethingWentWrongError(res);
        }
        },
        orderPart1:async function(cb){
            try{
            let sql2 = sql1.split('LIMIT')[0];
            let receivable=await ExecuteQ.Query(dbName,sql2,[]);
            // let stmt = multiConnection[dbName].query(sql2, function (err, receivable) {
            //     logger.debug("========orderpart1===========sql2====>>>><<<<>>>",stmt.sql)
            //     if (err) {
            //         console.log('error------', err);
            //         sendResponse.somethingWentWrongError(res);

            //     }
            //     else {
                    if(receivable.length){
                        data1.count=receivable.length
                        
                    }
                    else {
                        data1.count=0
                    }
                        cb(null)
            //     }
            // })
                }
                catch(Err){
                    logger.debug("==orderPart1=>",Err)
                    sendResponse.somethingWentWrongError(res);
                }
        },
        ordersPart2:async function (cb) {
            try{
            var sql="select sum(aro.commission) as total_commission,sum(o.handling_admin) as total_handling_admin,sum(o.handling_supplier) as total_handling_supplier," +
                "sum(o.delivery_charges) as total_delivery_charges,sum(o.urgent_price) as total_urgent_charges,sum(o.net_amount) as total_net_amount," +
                "sum(aro.total_amount) as total_payable_amount from account_receivable ar join account_receivable_order aro " +
                "on aro.account_receivable_id=ar.id join orders o on o.id=aro.order_id join supplier_branch sb on sb.id =o.supplier_branch_id join " +
                "supplier s on s.id =sb.supplier_id join user u on u.id = o.user_id " +
                "where s.id LIKE '%"+supplier+"%' AND  DATE( o.delivered_on ) >= '"+startDate+"' AND " +
                "DATE( o.delivered_on ) <=  '"+endDate+"' AND aro.status LIKE '%"+status+"%'";
                let result=await ExecuteQ.Query(dbName,sql,[]);
            // multiConnection[dbName].query(sql, function (err, result) {
            //     if (err) {
            //         console.log('error------', err);
            //         sendResponse.somethingWentWrongError(res);

            //     }
            //     else {
                    if(result.length){
                        data1.totals=result
                    }
                    else {
                        data1.totals={}
                    }
                    cb(null)
            //     }
            // })
                }
                catch(Err){
                    logger.debug("==ordersPart2=",Err);
                    sendResponse.somethingWentWrongError(res);
                }
        },
        subscriptionsPart1:async function (cb) {
            try{
            var sql="select ars.id as transaction_id,ars.supplier_id,s.id,s.name,ars.service_type,ars.amount,ars.created_date,ars.transaction_status,ars.transaction_date,ars.starting_date,ars.ending_date,ars.ads_type " +
                "from account_receivable_subscriptions ars join supplier s on ars.supplier_id=s.id "+
                "where s.id LIKE'%"+supplier+"%' AND  DATE(ars.starting_date) >= '"+moment(startDate).format('YYYY-MM-DD')+"' AND " +
                "DATE( ars.ending_date ) <=  '"+moment(endDate).format('YYYY-MM-DD')+"' AND ars.transaction_status LIKE '%"+status+"%'";
                let sub=await ExecuteQ.Query(dbName,sql,[]);
            // multiConnection[dbName].query(sql,function (err,sub) {
            //     if(err)
            //     {
            //         console.log('err185-----',err);
            //         sendResponse.somethingWentWrongError(res);
            //     }
                if(sub.length>0){
                    data1.subscriptions=sub;
                    cb(null)
                }
                else {
                    data1.subscriptions={};
                    cb(null);
                }
            // })
            }
            catch(Err){
                logger.debug("=====subscriptionsPart1=Err!==",Err);
                sendResponse.somethingWentWrongError(res);
            }
        },
        subscriptionsPart2:async function (cb) {
            try{
            var sql="select sum(ars.amount) as subTotal from account_receivable_subscriptions ars join supplier s on ars.supplier_id=s.id "+
                "where s.id LIKE'%"+supplier+"%' AND  DATE( ars.starting_date ) >= '"+moment(startDate).format('YYYY-MM-DD')+"' AND " +
                "DATE(ars.ending_date ) <=  '"+moment(endDate).format('YYYY-MM-DD')+"' AND ars.transaction_status LIKE '%"+status+"%'";
           
            let reply=await ExecuteQ.Query(dbName,sql,[]);
            // multiConnection[dbName].query(sql,function (err,reply) {
            //     if(err)
            //     {
            //         console.log('err185-----',err);
            //         sendResponse.somethingWentWrongError(res);
            //     }
                 if(reply.length>0){
                    data1.subsTotal=reply;
                    cb(null)
                }
                else {
                    data1.subsTotal={
                        "subTotal":0
                    };
                    cb(null);
                }
            // })
            }
            catch(Err){
                logger.debug("==subscriptionsPart2=Err!==",Err);
                sendResponse.somethingWentWrongError(res);
            }
        }
    },function (err,result) {
        if(err)
        {
            console.log('err12-----',err);
            sendResponse.somethingWentWrongError(res);
        }
        else{
            callback(null,data1);
        }
    });

}

function accountPayableDescription(dbName,res,id,callback){     

    var data1 = {};

    var details=[];
    var supplier_id=0;
    async.auto({
        orderDetails1:function (cb) {
            var sql = "select op.price,op.quantity,p.id as product_id,p.category_id,op.product_name,(op.price-(op.handling_admin+op.handling_supplier))" +
                "AS Amount,op.handling_admin,op.handling_supplier," +
                "(op.price-(op.handling_admin+op.handling_supplier)) AS Supplier_Costprice,op.price AS user_paid " +
                "from orders o join order_prices op on o.id=op.order_id join product p on p.id=op.product_id where o.id = ?";
            multiConnection[dbName].query(sql, [id], function (err, receivabledesc) {
                if (err) {
                    console.log('error------', err);
                    sendResponse.somethingWentWrongError(res);

                }
                else {
                    data1.order_description = receivabledesc;
                    details=receivabledesc;
                    cb(null)
                }
            })
        },
        orderDetails2:function (cb) {
            var sql1 = 'select o.id,sb.supplier_id,o.delivery_charges,o.net_amount ,aro.total_amount as adminTotal,(o.net_amount-aro.total_amount) as supplierTotal ' +
                ' from orders o join account_receivable_order aro on aro.order_id=o.id join supplier_branch sb on sb.id=o.supplier_branch_id  where o.id= ?';
            multiConnection[dbName].query(sql1, [id], function (err, delivery) {
                if (err) {
                    console.log('error------', err);
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    data1.delivery_charge = delivery[0].delivery_charges;
                    data1.Net_userpaid = delivery[0].net_amount;
                    data1.Admin_Total = delivery[0].adminTotal;
                    data1.supplier_Total = delivery[0].supplierTotal;
                    data1.orderId = delivery[0].id;
                    supplier_id=delivery[0].supplier_id;
                    console.log('sss--', data1);
                    cb(null, data1);
                }
            });

        },
        orderDetails3:['orderDetails1','orderDetails2',function (cb) {
            if(details.length){
                for(var i=0;i<details.length;i++){
                    (function (i) {
                        var sql='select commission_type,commission from supplier_category where supplier_id =? and category_id = ? group by category_id'
                        multiConnection[dbName].query(sql,[supplier_id,details[i].category_id],function (err,result) {
                            if(err){
                                console.log('err14-----',err);
                                sendResponse.somethingWentWrongError(res);
                            }
                            else {
                                if(result[0].commission_type == 0) {
                                    details[i].commission_admin=result[0].commission;
                                    details[i].commission=result[0].commission;
                                    details[i].commission_type=result[0].commission_type;
                                    details[i].Supplier_Costprice=details[i].Supplier_Costprice - details[i].commission_admin;
                                    if(i==(details.length-1)){
                                        cb(null)
                                    }
                                }
                                else {
                                    details[i].commission_admin=(result[0].commission * (details[i].price*details[i].quantity)) / 100;
                                    details[i].commission=details[i].commission_admin;
                                    details[i].commission_type=result[0].commission_type;
                                    details[i].Supplier_Costprice=details[i].Supplier_Costprice - details[i].commission_admin;
                                    if(i==(details.length-1)){
                                        cb(null)
                                    }
                                }
                            }
                        })

                    }(i))
                }
            }
            else {
                cb(null)
            }
        }]

    },function (err,result) {
        if(err){
            console.log('err12-----',err);
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null,data1);
        }
    })
 /*   var sql="select op.product_name,(op.price-(op.handling_admin+op.handling_supplier)) AS Amount,op.handling_admin,p.commission_type,p.commission,op.handling_supplier,(op.price-(op.handling_admin+op.handling_supplier)) AS Supplier_Costprice,op.price AS user_paid " +
        "from orders o join order_prices op on o.id=op.order_id join product p on p.id=op.product_id where o.id = ?";
    multiConnection[dbName].query(sql,[id],function (err,receivabledesc) {
        if(err) {
            console.log('error------',err);
            sendResponse.somethingWentWrongError(res);
            
        }
        else if(receivabledesc.length) {
            //console.log('pay111-----',receivabledesc);
            //console.log('id---',id);
            for(var i=0;i<receivabledesc.length;i++){
                (function (i) {
                    if(receivabledesc[i].commission_type==0)
                    {
                        receivabledesc[i].commission_admin=receivabledesc[i].commission;
                        receivabledesc[i].Supplier_Costprice=receivabledesc[i].Supplier_Costprice-receivabledesc[i].commission_admin;
                        sum=sum+receivabledesc[i].handling_admin+receivabledesc[i].commission_admin;
                        sum1=sum1+receivabledesc[i].handling_supplier+receivabledesc[i].Supplier_Costprice;
                    }
                    else{
                        receivabledesc[i].commission_admin=((receivabledesc[i].commission/100)* receivabledesc[i].Amount);
                        receivabledesc[i].Supplier_Costprice=receivabledesc[i].Supplier_Costprice-receivabledesc[i].commission_admin;
                        sum=sum+receivabledesc[i].handling_admin+receivabledesc[i].commission_admin;
                        sum1=sum1+receivabledesc[i].handling_supplier+receivabledesc[i].Supplier_Costprice;
                    }
                    
                    if(i==receivabledesc.length-1)
                    {  data.orderdescription=receivabledesc;
                        data.Admin_Total=sum;
                        data.supplier_Total=sum1;
                            }
                        }(i))
                    }

                    var sql1='select o.delivery_charges,o.net_amount from orders o where o.id= ?';
                    multiConnection[dbName].query(sql1,[id],function (err,delivery) {
                        if(err)
                        {
                            console.log('error------',err);
                            sendResponse.somethingWentWrongError(res);
                        }
                        else {
                            console.log('del==',delivery);
                            data.delivery_charge=delivery[0].delivery_charges;
                            data.Net_userpaid=delivery[0].net_amount;
                            console.log('sss--',data);
                            callback(null,data);
                        }
                    });

                }
        else
        {
            var data1=[];
            sendResponse.sendSuccessData(data1, constant.responseMessage.SUCCESS, res,constant.responseStatus.SUCCESS);
        }
            })
    */
}

function payment(dbName,res,supplier,id1,amount,method,payId,subsId,subsAmount,subPayId,callback) {
    var date=new Date();
    var paid=0;
    var left=0;
    var status=-1;
    var id=0;
    var accId=0;
      async.auto({
          update:function (cb) {
            multiConnection[dbName].beginTransaction(function (err) {
                  if (err) {
                      console.log('error------', err);
                      sendResponse.somethingWentWrongError(res);
                  }
                  else {
                   if(id1){
                       var sql = "update account_receivable_order set total_paid = total_paid + ?,total_left=total_left - ?,transaction_mode=?,payment_transaction_id = ? where order_id = ? AND status!=1";
                       multiConnection[dbName].query(sql, [amount, amount, method, payId, id1], function (err, result) {
                           if (err) {
                               multiConnection[dbName].rollback(function () {
                                   console.log('errr1----', err);
                                   sendResponse.somethingWentWrongError(res);
                               });
                           }
                           else if (result.affectedRows) {
                               cb(null);
                           }
                           else {
                               var data=[];
                               sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,constant.responseStatus.SUCCESS);
                           }
                       });
                   }
                    if(subsId){
                        var sql = "update account_receivable_subscriptions set transaction_status=?,transaction_date=?,transaction_id=? where id = ? AND transaction_status = 0";
                        multiConnection[dbName].query(sql, [1,moment(date).format('YYYY-MM-DD'),subPayId,subsId], function (err, result) {
                            if (err) {
                                multiConnection[dbName].rollback(function () {
                                    console.log('errr1----', err);
                                    sendResponse.somethingWentWrongError(res);
                                });
                            }
                            else if (result.affectedRows) {
                                cb(null);
                            }
                            else {
                                var data=[];
                                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,constant.responseStatus.SUCCESS);
                            }
                        });
                    }

                  }
              });
          },
          status:['update',function(cb)
          {
             if(id1){
                 var sql1='select account_receivable_id,total_amount,total_paid from account_receivable_order where order_id=?';
                 var sql2='update account_receivable_order set status = ? where order_id = ?';
                 multiConnection[dbName].query(sql1,[id1],function (err,result) {
                     if(err)
                     {
                         multiConnection[dbName].rollback(function () {
                             console.log('errr2----', err);
                             sendResponse.somethingWentWrongError(res);
                         });
                     }
                     else {
                         id=result[0].account_receivable_id;
                         if(result[0].total_amount == result[0].total_paid)
                         {
                             multiConnection[dbName].query(sql2,[1,id1],function (err,result1) {
                                 if(err)
                                 {
                                     multiConnection[dbName].rollback(function () {
                                         console.log('errr3----', err);
                                         sendResponse.somethingWentWrongError(res);
                                     });
                                 }
                                 else {
                                     cb(null)
                                 }
                             });
                         }
                         else {
                             multiConnection[dbName].query(sql2,[2,id1],function (err,result1) {
                                 if(err)
                                 {
                                     multiConnection[dbName].rollback(function () {
                                         console.log('errr4----', err);
                                         sendResponse.somethingWentWrongError(res);
                                     });
                                 }
                                 else {
                                     cb(null);
                                 }
                             });
                         }
                     }
                 })
             }
              if(subsId) {
                  var sql1='select account_receivable_id from account_receivable_subscriptions where id=?';
                  multiConnection[dbName].query(sql1,[subsId],function (err,result) {
                     if(err){
                         multiConnection[dbName].rollback(function () {
                             console.log('errr5----', err);
                             sendResponse.somethingWentWrongError(res);
                         });
                     }
                      else{
                         accId=result[0].account_receivable_id;
                         cb(null);
                     }
                  });
             }
          }],
          updateAccountreceivable:['status',function (cb)
          {
              if(id1){
                  var sql3="update account_receivable set amount_paid = amount_paid + ?,amount_left=amount_left - ? where id = ? AND status!=1";
                  multiConnection[dbName].query(sql3,[amount,amount,id],function (err,result2) {
                      if(err){
                          multiConnection[dbName].rollback(function () {
                              console.log('errr5----', err);
                              sendResponse.somethingWentWrongError(res);
                          });
                      }
                      else {
                          cb(null);
                      }
                  })
              }
              if(subsId){
                  var sql3="update account_receivable set amount_paid = amount_paid + ?,amount_left=amount_left - ? where id = ? AND status!=1";
                  multiConnection[dbName].query(sql3,[subsAmount,subsAmount,accId],function (err,result2) {
                      if(err){
                          multiConnection[dbName].rollback(function () {
                              console.log('errr5----', err);
                              sendResponse.somethingWentWrongError(res);
                          });
                      }
                      else {
                          cb(null);
                      }
                  })
              }

          }],
          updateAccountPayablStatus:['updateAccountreceivable',function(cb)
          {
              if(id1){
                  var sql4='select admin_id,total_amount,amount_paid from account_receivable where id=?';
                  var sql5='update account_receivable set status = ? where id = ?';
                  multiConnection[dbName].query(sql4,[id],function (err,result) {
                      if(err)
                      {
                          multiConnection[dbName].rollback(function () {
                              console.log('errr6----', err);
                              sendResponse.somethingWentWrongError(res);
                          });
                      }
                      else {
                          if(result[0].total_amount == result[0].amount_paid)
                          {
                              multiConnection[dbName].query(sql5,[1,id],function (err,result1) {
                                  if(err)
                                  {
                                      multiConnection[dbName].rollback(function () {
                                          console.log('errr1----', err);
                                          sendResponse.somethingWentWrongError(res);
                                      });
                                  }
                                  else {
                                      cb(null)
                                  }
                              });
                          }
                          else {
                              multiConnection[dbName].query(sql5,[2,id],function (err,result1) {
                                  if(err)
                                  {
                                      multiConnection[dbName].rollback(function () {
                                          console.log('errr7----', err);
                                          sendResponse.somethingWentWrongError(res);
                                      });
                                  }
                                  else {
                                      cb(null);
                                  }
                              });
                          }
                      }
                  })
              }
              if(subsId){
                  var sql9='select admin_id,total_amount,amount_paid from account_receivable where id=?';
                  var sql10='update account_receivable set status = ? where id = ?';
                  multiConnection[dbName].query(sql9,[accId],function (err,result) {
                      if(err)
                      {
                          multiConnection[dbName].rollback(function () {
                              console.log('errr6----', err);
                              sendResponse.somethingWentWrongError(res);
                          });
                      }
                      else {
                          if(result[0].total_amount == result[0].amount_paid)
                          {
                              multiConnection[dbName].query(sql10,[1,subsId],function (err,result1) {
                                  if(err)
                                  {
                                      multiConnection[dbName].rollback(function () {
                                          console.log('errr1----', err);
                                          sendResponse.somethingWentWrongError(res);
                                      });
                                  }
                                  else {
                                      cb(null)
                                  }
                              });
                          }
                          else {
                              multiConnection[dbName].query(sql10,[2,subsId],function (err,result1) {
                                  if(err)
                                  {
                                      multiConnection[dbName].rollback(function () {
                                          console.log('errr7----', err);
                                          sendResponse.somethingWentWrongError(res);
                                      });
                                  }
                                  else {
                                      cb(null);
                                  }
                              });
                          }
                      }
                  })
              }

          }],
          updateStatement:['updateAccountPayablStatus',function (cb)
          {
            if(id1){
                var sql9='insert into account_statement(transaction_id,supplier_id,order_id,transaction_date,payment_method,credit)values(?,?,?,?,?,?)';
                multiConnection[dbName].query(sql9,[payId,supplier,id1,date,method,amount],function (err,result) {
                    if(err)
                    {
                        multiConnection[dbName].rollback(function () {
                            console.log('err143-----',err);
                            sendResponse.somethingWentWrongError(res);
                        });
                    }
                    else {
                        cb(null);
                    }
                })
            }
            if(subsId){
                var sql12='insert into account_statement(transaction_id,supplier_id,subscription_id,transaction_date,credit)values(?,?,?,?,?)';
                multiConnection[dbName].query(sql12,[subPayId,supplier,subsId,date,subsAmount],function (err,result) {
                    if(err)
                    {
                        multiConnection[dbName].rollback(function () {
                            console.log('err143-----',err);
                            sendResponse.somethingWentWrongError(res);
                        });
                    }
                    else {
                        cb(null);
                    }
                })
            }

          }]
      }, function(err,result){
          if(err) {
              sendResponse.somethingWentWrongError(res);
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
                      //console.log('Transaction Complete----');
                      callback(null);
                  }
              });
          }
      })
}
/**
 * @description used for listing an recievable Amount 
 */
exports.accountReceivableListing=function   (req,dbName,res,supplier,startDate,endDate,status,search,limit,offset,callback) {
    //console.log('id----',id);
    var sum=0;
    var id=0;
    var data1={};
    var sql1;
    async.auto({
        ordersPart:async function (cb) {
            try{
                
             sql1="select (SELECT request_status from agent_supplier_payouts where order_id=o.id limit 1) as withdraw_request_status,o.net_amount as total_order_price, cr.id as cart_id,op.product_id, op.quantity, o.self_pickup,o.supplier_vat_value,o.user_service_charge, s.id,aro.status,aro.commission,aro.order_id,IFNULL(odp.discountAmount,0) as discountAmount,s.name,u.firstname,o.delivered_on,o.handling_admin,o.handling_supplier,o.delivery_charges,o.urgent_price,(o.net_amount-IFNULL(odp.discountAmount,0)) as net_amount,aro.total_amount from account_payable ar join account_payable_order aro " +
                "on aro.account_payable_id=ar.id join orders o on o.id=aro.order_id join order_prices op on op.order_id = o.id  left join order_promo odp on odp.orderId = o.id join supplier_branch sb on sb.id =o.supplier_branch_id join " +
                " supplier s on s.id =sb.supplier_id join user u on u.id = o.user_id left join cart cr on cr.id=o.cart_id " +
                "where s.id LIKE'%"+supplier+"%' AND  DATE( o.delivered_on ) >= '"+startDate+"' " +
                "AND DATE( o.delivered_on ) <=  '"+endDate+"' AND aro.status LIKE '%"+status+"%' AND (u.firstname LIKE '%"+search+"%' OR aro.order_id LIKE '%"+search+"%') group by aro.order_id order by aro.order_id desc LIMIT "+offset+","+limit+""
            let payable=await ExecuteQ.Query(dbName,sql1,[]);

        //  let stmt =  multiConnection[dbName].query(sql1, function (err, payable) {
        //      logger.debug("==================order part ======sql======",stmt.sql)
        //         if (err) {
        //             console.log('error2------', err);
        //             sendResponse.somethingWentWrongError(res);

        //         }
        //         else {
                    if(payable.length){
                        for (const [key, value] of payable.entries()) {
                            
                            let Product_cost = await totalOrderPrice(dbName,value.order_id);
                            let adds_on=await getOrderAddsOn(dbName,value.cart_id,value.product_id);
                            if(adds_on && adds_on.length>0){
                                let addonprice = await addonTotalPrice(adds_on,value.quantity)
                                Product_cost = Product_cost + addonprice;
                            }
                            value.Product_cost=Product_cost;
                        }

                        data1.orders=payable
                        if(parseInt(req.body.is_download)){
                            let sql2 = sql1.split('LIMIT')[0];
                            let receivable = await ExecuteQ.Query(dbName,sql2,[]);
                            let header = [ 
                                {id: 'ORDER NO', title: 'ORDER NO'},
                                {id: 'RESTAURANT ID', title: 'RESTAURANT ID'},   
                                {id: 'RESTAURANT NAME', title: 'RESTAURANT NAME'}, 
                                {id: 'CUSTOMER NAME', title: 'CUSTOMER NAME '},
                                {id: 'ORDER DELIVERY DATE', title: 'ORDER DELIVERY DATE'},
                                {id: 'TAX', title: 'TAX'},
                                {id: 'COMMISSION', title: 'COMMISSION'},
                                {id: 'DELIVERY CHARGES', title: 'DELIVERY CHARGES'},
                                {id: 'ORDERS AMOUNT', title: 'ORDERS AMOUNT'},
                                {id: 'BALANCE AMOUNT', title: 'BALANCE AMOUNT'},
                                {id: 'PAYMENT STATUS', title: 'PAYMENT STATUS'}
                              ]
                              let data = receivable.map((element)=>{
                                  let temp = {}
                                  temp["ORDER NO"] = element.order_id
                                  temp["RESTAURANT ID"] = element.id
                                  temp["RESTAURANT NAME"] = element.name 
                                  temp["CUSTOMER NAME"] = element.firstname
                                  temp["ORDER DELIVERY DATE"] = moment(element.delivered_on).format('MMMM Do YYYY, h:mm:ss a')
                                  temp.TAX = element.handling_admin
                                  temp.COMMISSION = element.commission
                                  temp["DELIVERY CHARGES"] = element.delivery_charges
                                  temp["ORDERS AMOUNT"] = element.net_amount
                                  temp["BALANCE AMOUNT"] = element.total_amount
                                  temp["PAYMENT STATUS"] = element.status==1?"Received":"Pending" //0-unpaid,1-fully_paid,2-partially_paid
                                  return temp;
                              })
                    
                              let csvLink = await uploadMgr.uploadCsvFileNew(data,header,"cash_orders_list_")
                              logger.debug("+==========csvLingk=========",csvLink)
                              data1.csvFileLink = csvLink
                              cb(null)
                        }
                    }
                    else {
                        data1.orders=[]
                    }
                    cb(null)
            //     }
            // })
                }
                catch(Err){
                    logger.debug("====ordersPart=Err!==>",Err);
                    sendResponse.somethingWentWrongError(res);
                }
        },
        orderPart1:async function(cb){
            try{
            let sql2 = sql1.split('LIMIT')[0];
            let payable=await ExecuteQ.Query(dbName,sql2,[]);
            // let stmt = multiConnection[dbName].query(sql2, function (err, payable) {
                // logger.debug("========orderpart1===========sql2====>>>><<<<>>>",stmt.sql)
                // if (err) {
                //     console.log('error------', err);
                //     sendResponse.somethingWentWrongError(res);

                // }
                // else {
                    if(payable.length){
                        data1.count=payable.length
                        
                    }
                    else {
                        data1.count=0
                    }
                    cb(null)
            //     }
            // })
        }
        catch(Err){
            logger.debug("=orderPart1=Err=",Err);
            sendResponse.somethingWentWrongError(res);
        }
        },
        ordersPart2:async function (cb) {
            try{
            var sql="select sum(aro.commission) as total_commission,sum(o.handling_admin) as total_handling_admin,sum(o.handling_supplier) as total_handling_supplier," +
                "sum(o.delivery_charges) as total_delivery_charges,sum(o.urgent_price) as total_urgent_charges,sum(o.net_amount) as total_net_amount," +
                "sum(aro.total_amount) as total_receivable_amount from account_payable ar join account_payable_order aro " +
                "on aro.account_payable_id=ar.id join orders o on o.id=aro.order_id join supplier_branch sb on sb.id =o.supplier_branch_id join " +
                "supplier s on s.id =sb.supplier_id join user u on u.id = o.user_id " +
                "where s.id LIKE '%"+supplier+"%' AND  DATE( o.delivered_on ) >= '"+startDate+"' " +
                "AND DATE( o.delivered_on ) <=  '"+endDate+"' AND aro.status LIKE '%"+status+"%'";
                let result=await ExecuteQ.Query(dbName,sql,[]);
            // multiConnection[dbName].query(sql, function (err, result) {
            //     if (err) {
            //         console.log('error1------', err);
            //         sendResponse.somethingWentWrongError(res);

            //     }
            //     else {
                    if(result.length){
                        if(result[0].total_commission==null){
                            data1.totals={
                                "total_commission":0,
                                "total_handling_admin":0,
                                "total_handling_supplier":0,
                                "total_delivery_charges":0,
                                "total_urgent_charges":0,
                                "total_net_amount":0,
                                "total_receivable_amount":0
                            }
                        }
                        else {
                            data1.totals=result
                        }

                    }
                    else {
                        data1.totals={
                            "total_commission":0,
                            "total_handling_admin":0,
                            "total_handling_supplier":0,
                            "total_delivery_charges":0,
                            "total_urgent_charges":0,
                            "total_net_amount":0,
                            "total_receivable_amount":0
                        }
                    }
                    cb(null)
            //     }
            // })
                }
                catch(Err){
                    logger.debug("==ordersPart2=Er",Err);
                    sendResponse.somethingWentWrongError(res);
                }
        },
    },function (err,result) {
        if(err)
        {
            console.log('err12-----',err);
            sendResponse.somethingWentWrongError(res);
        }
        else{
            callback(null,data1);
        }
    });


    /*    var sum=0;
              var sql="select ap.id,apo.order_id,apo.order_transaction_id,o.handling_admin,o.handling_supplier,o.delivery_charges,(o.net_amount-(o.handling_supplier+o.handling_admin+o.delivery_charges)) as cost_price," +
                  "o.handling_admin AS Admin_Total,apo.total_amount AS Supplier_Total,apo.total_left,apo.status,apo.total_paid AS Transferred,apo.transaction_mode,apo.payment_date,apo.payment_transaction_id from account_payable ap join account_payable_order apo " +
                  "on apo.account_payable_id=ap.id join orders o on o.id=apo.order_id where ap.supplier_id=?";
              multiConnection[dbName].query(sql,[id],function (err,payable) {
                  if(err)
                  {
                      console.log('error------',err);
                      sendResponse.somethingWentWrongError(res);

                  }
                  else if(payable.length > 0) {
                      //console.log('result-----',payable);
                      var sql1='select apo.order_id,o.net_amount,p.commission_type,p.commission from account_payable_order apo ' +
                          'join orders o on o.id=apo.order_id join order_prices op on o.id=op.order_id join product p on op.product_id=p.id';
                      multiConnection[dbName].query(sql1,function (err,comm) {
                          if(err)
                          {
                              console.log('error------',err);
                              sendResponse.somethingWentWrongError(res);
                          }
                          else{
                              //console.log('com---',comm);
                              for(var j=0;j<payable.length;j++)
                              {
                                  (function (j) {
                                      sum=0;
                                      for(var i=0;i<comm.length;i++)
                                      {(function (i)
                                      {
                                          //console.log('order----',comm[i].order_id,payable[j].order_id);
                                          if(comm[i].order_id == payable[j].order_id)
                                          {
                                              //console.log('commtype---',comm[i].commission_type)
                                              if(comm[i].commission_type==0)
                                              {
                                                  //console.log('comm1---',comm[i].commission)

                                                  sum=sum+comm[i].commission;
                                                  //console.log('sum',sum);
                                              }
                                              else {
                                                  //console.log('comm2---',comm[i].commission)
                                                  sum = sum + ((comm[i].commission * comm[i].net_amount) / 100);
                                                  //console.log('sum',sum);
                                              }
                                          }
                                          if(i==comm.length-1){
                                              payable[j].commission=sum;
                                              payable[j].cost_price= payable[j].cost_price - sum;
                                              payable[j].Admin_Total= payable[j].Admin_Total + sum;


                                          }
                                      }(i));
                                      }
                                      if(j==payable.length-1)
                                      {
                                          callback(null,payable);
                                      }
                                  }(j));
                              }
                          }
                      });

                  }
                  else {
                     var data=[];
                      sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,constant.responseStatus.SUCCESS);
                  }
              })*/
}

function accountReceivableDescription(dbName,res,id,callback){


    var data1 ={};
    var details=[]
    var supplier_id=0;
    async.auto({
        orderDetails1:async function (cb) {
            try{
            var sql = "select op.price,op.quantity,p.id as product_id,p.category_id,op.product_name,(op.price-(op.handling_admin+op.handling_supplier))" +
                "AS Amount,op.handling_admin,op.handling_supplier," +
                "(op.price-(op.handling_admin+op.handling_supplier)) AS Supplier_Costprice,op.price AS user_paid " +
                "from orders o join order_prices op on o.id=op.order_id join product p on p.id=op.product_id where o.id = ?";
            let receivabledesc=await ExecuteQ.Query(dbName,sql,[id]);
                // multiConnection[dbName].query(sql, [id], function (err, receivabledesc) {
            //     if (err) {
            //         console.log('error------', err);
            //         sendResponse.somethingWentWrongError(res);

            //     }
            //     else {
                    data1.order_description = receivabledesc;
                    details=receivabledesc;
                    cb(null)
            //     }
            // })
            }
            catch(Err){
                logger.debug("==Er!",Err);
                sendResponse.somethingWentWrongError(res);
            }
        },
        orderDetails2:async function (cb) {
            try{
            var sql1 = 'select o.id,sb.supplier_id,o.delivery_charges,o.net_amount ,aro.total_amount as adminTotal,(o.net_amount-aro.total_amount) as supplierTotal ' +
                ' from orders o join account_payable_order aro on aro.order_id=o.id join supplier_branch sb on sb.id=o.supplier_branch_id  where o.id= ?';
            let delivery=await ExecuteQ.Query(dbName,sql1,[id]);
                // multiConnection[dbName].query(sql1, [id], function (err, delivery) {
            //     if (err) {
            //         console.log('error------', err);
            //         sendResponse.somethingWentWrongError(res);
            //     }
            //     else {
                    data1.delivery_charge = delivery[0].delivery_charges;
                    data1.Net_userpaid = delivery[0].net_amount;
                    data1.Admin_Total = delivery[0].adminTotal;
                    data1.orderId = delivery[0].id;
                    data1.supplier_Total = delivery[0].supplierTotal;
                    supplier_id=delivery[0].supplier_id;
                    console.log('sss--', data1);
                    cb(null, data1);
            //     }
            // });
        }
        catch(Err){
            logger.debug("==Err!==",Err)
            sendResponse.somethingWentWrongError(res);
        }

        },
        orderDetails3:['orderDetails1','orderDetails2',async function (cb) {
            if(details.length){
                for(var i=0;i<details.length;i++){
                    (async function (i) {
                        try{
                        var sql='select commission_type,commission from supplier_category where supplier_id =? and category_id = ? group by category_id'
                        let result=await ExecuteQ.Query(dbName,sql,[supplier_id,details[i].category_id])
                        // multiConnection[dbName].query(sql,[supplier_id,details[i].category_id],function (err,result) {
                        //     if(err){
                        //         console.log('err14-----',err);
                        //         sendResponse.somethingWentWrongError(res);
                        //     }
                        //     else {
                                if(result[0].commission_type == 0) {
                                    details[i].commission_admin=result[0].commission;
                                    details[i].commission=result[0].commission;
                                    details[i].commission_type=result[0].commission_type;
                                    details[i].Supplier_Costprice=details[i].Supplier_Costprice - details[i].commission_admin;
                                    if(i==(details.length-1)){
                                        cb(null)
                                    }
                                }
                                else {
                                    details[i].commission_admin=(result[0].commission * (details[i].price*details[i].quantity)) / 100;
                                    details[i].commission=details[i].commission_admin;
                                    details[i].commission_type=result[0].commission_type;
                                    details[i].Supplier_Costprice=details[i].Supplier_Costprice - details[i].commission_admin;
                                    if(i==(details.length-1)){
                                        cb(null)
                                    }
                                }
                        //     }
                        // })
                            }
                            catch(Err){
                                logger.debug("==Err",Err);
                                sendResponse.somethingWentWrongError(res);
                            }

                    }(i))
                }
            }
            else {
                cb(null)
            }
        }]

    },function (err,result) {
        if(err){
            console.log('err12-----',err);
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null,data1);
        }
    })

}

function getStatement(req,dbName,res,supplier,startDate,endDate,search,limit,offset,callback) {

    var data={};
    console.log(".....",supplier);
  /*  var sql1="select sum(debit) as total_debit,sum(credit) as total_credit from account_statement where supplier_id=?";
    multiConnection[dbName].query(sql1,[id],function (err,reply) {
        if(err){
            console.log('error------',err);
            sendResponse.somethingWentWrongError(res);
        }
        else{
            totalBalance=parseInt(reply[0].total_credit)-parseInt(reply[0].total_debit);
            var sql="select transaction_date,a.transaction_id,a.order_id,a.subscription_id,s.name,a.credit,a.debit from account_statement a join supplier s on s.id=a.supplier_id " +
                "where year(transaction_date)=? and month(transaction_date)=? and supplier_id=?";
            multiConnection[dbName].query(sql,[year,month,id],function (err,result) {
                if(err)
                {
                    console.log('error------',err);
                    sendResponse.somethingWentWrongError(res);

                }
                else if(result.length){
                    for(var k=0;k<result.length;k++){
                        (function (k) {
                            data1.push(result[k]);
                            credit=credit + parseInt(result[k].credit);
                            debit=debit + parseInt(result[k].debit);
                            if(k == result.length-1)
                            {
                                balance=(credit-debit);
                                data.push({
                                    'year':year,
                                    'month':month,
                                    'data':data1,
                                    'total_debit':debit,
                                    'total_credit':credit,
                                    'total_month_balance':balance,
                                    'total_balance':totalBalance
                                });
                                callback(null,data);
                            }
                        }(k))

                    }

                }
                else {
                    callback(null,result);

                }
            })
        }
    })*/
    var sql1;
    async.auto({
        supplierdetails:async function (cb) {
            try{
            var sql='select name,address from supplier where id = ?';
            let result=await ExecuteQ.Query(dbName,sql,[supplier])
            data.supplier=result;
            cb(null);
            }
            catch(Err){
                logger.debug("===Err!==",Err)
                sendResponse.somethingWentWrongError(res);
            }
            // multiConnection[dbName].query(sql,[supplier],function (err,result) {
            //     console.log("...err",err,result)
            //     if(err)
            //     {
            //         console.log('err12-----',err);
            //         sendResponse.somethingWentWrongError(res);
            //     }
            //     else{
                    // data.supplier=result;
                    // cb(null);
            //     }
            // })
        },
        statementDetails:async function (cb) {
            try{
                sql1 ='SELECT o.admin_commission,o.delivery_charges,o.payment_source, o.card_payment_id as payment_id, o.transaction_id as payment_reference_number,o.id,u.firstname ,  cr.id as cart_id, op.quantity,op.product_id,  o.delivered_on,o.net_amount,o.handling_admin,o.handling_supplier,o.urgent_price,' +
                'aro.commission,aro.total_amount,1 as accountType FROM account_statement acs join account_receivable_order aro on ' +
                'aro.order_id =acs.order_id   join orders o on o.id = acs.order_id   join order_prices op on op.order_id = o.id join cart cr on cr.id = o.cart_id join user u on u.id =o.user_id  ' +
                'where acs.supplier_id = ? AND  DATE( acs.transaction_date ) >= "'+startDate+'" AND ' +
                'DATE(acs.transaction_date ) <=  "'+endDate+'" AND (o.id LIKE "%'+search+'%" OR u.firstname LIKE "%'+search+'%") '+
                ' UNION ALL ' +
                'SELECT o.admin_commission,o.delivery_charges,o.payment_source, o.card_payment_id as payment_id, o.transaction_id as payment_reference_number,o.id,u.firstname ,  cr.id as cart_id, op.quantity,op.product_id,    o.delivered_on,o.net_amount,o.handling_admin,o.handling_supplier,o.urgent_price,' +
                'aro.commission,aro.total_amount,0 as accountType FROM account_statement acs join account_payable_order aro on ' +
                'aro.order_id =acs.order_id join orders o on o.id = acs.order_id  join order_prices op on op.order_id = o.id join cart cr on cr.id = o.cart_id   join user u on u.id =o.user_id ' +
                ' where acs.supplier_id = ? AND  DATE( acs.transaction_date ) >= "'+startDate+'" AND ' +
                'DATE(acs.transaction_date ) <=  "'+endDate+'" AND (o.id LIKE "%'+search+'%" OR u.firstname LIKE "%'+search+'%")  order by id desc LIMIT '+offset+','+limit+''
            let result=await ExecuteQ.Query(dbName,sql1,[supplier,supplier])

            if(parseInt(req.body.is_download)==1){

               // let sql3 = sql1.split('LIMIT')[0];
                let result = await ExecuteQ.Query(dbName,sql1,[supplier,supplier])
                let header = [ 
                    {id: 'USER ID', title: 'USER ID'},
                    {id: 'CUSTOMER NAME', title: 'CUSTOMER NAME'},   
                    {id: 'ORDER DELIVERY DATE', title: 'ORDER DELIVERY DATE'}, 
                    {id: 'TAX', title: 'TAX'},
                    {id: 'COMMISSION', title: 'COMMISSION'},
                    {id: 'ORDER SUB-TOTAL', title: 'ORDER SUB-TOTAL'},
                    {id: 'DELIVERY CHARGES', title: 'DELIVERY CHARGES'},
                    {id: 'ORDER AMOUNT', title: 'ORDER AMOUNT'},
                    {id: 'BALANCE AMOUNT', title: 'BALANCE AMOUNT'},
                    {id: 'TRANSACTION STATUS', title: 'TRANSACTION STATUS'}
                ]
                let body=[]
                for(const [index,element] of result.entries()){
                  let temp = {}
             
                  let Product_cost =await totalOrderPrice(dbName,element.id)
                  let adds_on=await getOrderAddsOn(dbName,element.cart_id,element.product_id);
                  if(adds_on && adds_on.length>0){
                      let addonprice = await addonTotalPrice(adds_on,element.quantity)
                      Product_cost = Product_cost + addonprice;
                  }
                  element.Product_cost=Product_cost;



                  temp["USER ID"] = element.id
                  temp["CUSTOMER NAME"] = element.firstname
                  temp["ORDER DELIVERY DATE"] = moment(element.delivered_on).format('MMMM Do YYYY, h:mm:ss a')
                  temp.TAX = element.handling_admin
                  temp.COMMISSION = element.commission
                  temp["ORDER SUB-TOTAL"] = element.Product_cost

                  temp["DELIVERY CHARGES"] = element.delivery_charges
                  temp["ORDER AMOUNT"] = element.net_amount
                  temp["BALANCE AMOUNT"] = element.total_amount
                  temp["TRANSACTION STATUS"] = "Received" //0-unpaid,1-fully_paid,2-partially_paid
                  body.push(temp);
                  }
    
              let csvLink = await uploadMgr.uploadCsvFileNew(body,header,"account_statement")
              logger.debug("+==========csvLingk=========",csvLink)
              data.csvFileLink = csvLink
              cb(null);

            }
            else{

                let result = await ExecuteQ.Query(dbName,sql1,[supplier,supplier])

                for (const [key, value] of result.entries()) {
                    console.log("=====key.cart_id==>>",value.cart_id)
                    let Product_cost = await totalOrderPrice(dbName,value.id);
                    let adds_on=await getOrderAddsOn(dbName,value.cart_id,value.product_id);
                    if(adds_on && adds_on.length>0){
                        let addonprice = await addonTotalPrice(adds_on,value.quantity)
                        Product_cost = Product_cost + addonprice;
                    }
                    value.Product_cost=Product_cost;
                }

                // multiConnection[dbName].query(sql1,[supplier,supplier],function (err,result) {
                //     if(err)
                //     {
                //         console.log('err12-----',err);
                //         sendResponse.somethingWentWrongError(res);
                //     }
                //     else{
                        data.statement=result;
                        cb(null);
                //     }
                // })
            }
        }
        catch(Err){
            logger.debug("==Err!==",Err)
            sendResponse.somethingWentWrongError(res);
        }
        },
        statementDetailsCount:async function(cb){
            try{
            let sql2 = sql1.split('LIMIT')[0];
            let result=await ExecuteQ.Query(dbName,sql2,[supplier,supplier]);
            // let stmt = multiConnection[dbName].query(sql2,[supplier,supplier],function (err,result) {
            //     logger.debug("===========statementDetails----count---===query=>>>>>",stmt.sql)
            //     if(err)
            //     {
            //         console.log('err12-----',err);
            //         sendResponse.somethingWentWrongError(res);
            //     }
            //     else{
                    data.count=result.length;
                    cb(null);
            //     }
            // })
            }
            catch(Err){
                logger.debug("===Err!==",Err);
                sendResponse.somethingWentWrongError(res);
            }
           },
        subscriptionDetails:async function (cb) {
            try{
            var sql='select ars.id,ars.ads_type,ars.service_type,ars.starting_date,ars.ending_date,ars.amount,acs.transaction_date ' +
                'from account_receivable_subscriptions ars join account_statement acs on acs.subscription_id = ars.id ' +
                ' where acs.supplier_id = ? AND  DATE( acs.transaction_date ) >= "'+moment(startDate).format('YYYY-MM-DD')+'" AND ' +
                'DATE(acs.transaction_date ) <=  "'+moment(endDate).format('YYYY-MM-DD')+'"';
            let result=await ExecuteQ.Query(dbName,sql,[supplier])
                // multiConnection[dbName].query(sql,[supplier],function (err,result) {
            //     if(err)
            //     {
            //         console.log('err12-----',err);
            //         sendResponse.somethingWentWrongError(res);
            //     }
            //     else{
                    data.subscription=result;
                    cb(null);
            //     }
            // })
        }
        catch(Err){
            logger.debug("===Err!==",Err);
            sendResponse.somethingWentWrongError(res);
        }
        }
    },function (err,result) {
        if(err)
        {
            console.log('err12-----',err);
            sendResponse.somethingWentWrongError(res);
        }
        else{
            callback(null,data);
        }
    });
}

exports.supplierDriverAccountPayablelist = function (req,res) {

        var accessToken=0;
        var sectionId=0;
        var search = req.body.search;
        var limit = req.body.limit;
        var offset = req.body.offset
        var supplier_id=0;
        var supplierId=0;
        const is_download = req.body.is_download
        var data=[];
        var startDate= '1990-01-01',
            endDate='2100-01-01',
            status='';
    console.log("req body",req.body);
        async.auto({
            blankField:function(cb) {
                if(req.body && req.body.accessToken && req.body.authSectionId)
                {
                    accessToken=req.body.accessToken;
                    sectionId=req.body.authSectionId;
                    if(req.body.startDate){
                        startDate= req.body.startDate
                    }
                    if(req.body.endDate){
                        endDate= req.body.endDate
                    }
                    if(req.body.status){
                        status= req.body.status
                    }
                    cb(null);
                }
                else
                {
                    sendResponse.parameterMissingError(res);
                }
            },
            authenticate:['blankField',function (cb) {
                func.authenticateSupplierAccessToken(req.dbName,accessToken, res,function(err,result){
                    if(err)
                    {
                        sendResponse .somethingWentWrongError(res);
                    }
                    else
                    {
                        supplier_id=result;
                        //console.log("supplierId:  ",supplier_id);
                        cb(null);
                    }
    
                },1)
            }],
            // checkauthority:['authenticate',function(cb) {
            //     func.checkforAuthorityofThisSupplier(req.dbName,supplier_id,sectionId, res,function (err,result) {
            //         if(err)
            //         {
            //             sendResponse.somethingWentWrongError(res);
            //         }
            //         else
            //         {
            //             //console.log("checkauthority complete");
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
            payableListing:['supplierId',function(cb){
                supplierAccount.supplierDriverAccountPayableListing(req.dbName,res,/*supplierId,*/startDate,endDate,status,search,limit,offset,is_download,function (err,result) {
                    if(err) {
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
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,constant.responseStatus.SUCCESS);
            }
        })
    
}

exports.supplierDriverAccountPayableListing = async function(db_name,res,/*supplier,*/startDate,endDate,status,search,limit,offset,is_download,callback) {
var sum=0;
var id=0;
var status_check = "";
if(status && status == "1"){
    //status_check = "AND capo.status LIKE '%"+status+"%'";
    status_check = "AND cuo.order_id IN (SELECT order_id from cbl_account_payable_order)";
}else if(status && status == "0"){
    status_check = "AND cuo.order_id NOT IN (SELECT order_id from cbl_account_payable_order)";
}
    var data1={};
    var sql;
    let mUnit=await Universal.getMeausringUnit(db_name);
    let getAgentDbData=await common.GetAgentDbInformation(db_name);        
    let agentConnection=await common.RunTimeAgentConnection(getAgentDbData);  
    async.auto({
        ordersPart:async function (cb) {
             sql="SELECT  (SELECT request_status from "+db_name+".agent_supplier_payouts where order_id=user_orders.id limit 1) as withdraw_request_status ,round(("+mUnit+" * acos( cos( radians( supplierinfo.latitude) ) * cos( radians( user_address.latitude ) ) * cos( radians( user_address.longitude ) - radians(supplierinfo.longitude) ) + sin( radians(supplierinfo.latitude) ) * sin( radians( user_address.latitude ) ) ) )) as distance, IF( capo.status ='2', 'Partially Paid', IF( capo.status = '1', 'Paid', 'Not Paid' ) ) payment_status,capo.transaction_mode, cuo.`order_id`, cuo.`commission_ammount`, cuo.agent_base_price, cuo.agent_delivery_charge_share, cuo.`user_id`, cu.supplier_id, cu.name, cu.email, cu.phone_number,cu.id as agent_id,cu.country,cu.city,cu.state, IF( cu.agent_commission_type=0, 'Percentage', 'Flat' ) agent_commission_type, cuo.`net_amount`, cuo.`delivery_charges`, cuo.`waiting_charges`, cuo.`tip_agent`, cuo.`status`, cuo.delivered_on delivery_date, cuo.`card_payment_id`, cuo.`payment_type`,IF( TIMESTAMPDIFF(MINUTE,cuo.shipped_on,cuo.delivered_on) > 0, TIMESTAMPDIFF(MINUTE,cuo.shipped_on,cuo.delivered_on), '0' ) as duration, (cuo.`commission_ammount` + cuo.`tip_agent` + cuo.agent_base_price + cuo.agent_delivery_charge_share) as total_amount FROM `cbl_user_orders` cuo join cbl_user cu on cuo.user_id=cu.id left join cbl_account_payable_order capo on cuo.order_id=capo.order_id left join "+db_name+".orders as user_orders on cuo.order_id=user_orders.id  left join "+db_name+".user_address user_address on user_orders.user_delivery_address=user_address.id left join "+db_name+".supplier supplierinfo on cuo.supplier_id=supplierinfo.id WHERE cu.supplier_id!='0' AND DATE( cuo.delivered_on ) >= '"+startDate+"' AND DATE( cuo.delivered_on ) <=  '"+endDate+"' "+status_check+" AND (cuo.customer_name LIKE '%"+search+"%' OR cuo.order_id LIKE '%"+search+"%') order by cuo.order_id + 0 desc LIMIT "+offset+","+limit


                if(parseInt(is_download)){
                    let sql1 = sql.split('LIMIT')[0];
                    //let receivable = await ExecuteQ.Query(db_name,sql1,[]);
                    let receivable=await ExecuteQ.QueryAgent(agentConnection,sql1,[]);
                    let header = [ 
                        {id: 'ORDER_NO', title: 'ORDER_NO'},
                        {id: 'DISTANCE', title: 'DISTANCE'},
                        {id: 'COMMISSION_AMOUNT', title: 'COMMISSION_AMOUNT'},
                        {id: 'AGENT_ID', title: 'AGENT_ID'},
                        {id: 'AGENT_NAME', title: 'AGENT_NAME'},
                        {id: 'AGENT_EMAIL', title: 'AGENT_EMAIL'},
                        {id: 'AGENT_PHONE_NUMBER', title: 'AGENT_PHONE_NUMBER'},
                        {id: 'AGENT_CITY', title: 'AGENT_CITY'},
                        {id: 'AGENT_STATE', title: 'AGENT_STATE'},
                        {id: 'AGENT_COUNTRY', title: 'AGENT_COUNTRY'},
                        {id: 'AGENT_COMMISSION_TYPE', title: 'AGENT_COMMISSION_TYPE'},
                        {id: 'NET_AMOUNT', title: 'NET_AMOUNT'},
                        {id: 'TOTAL_AMOUNT', title: 'TOTAL_AMOUNT'},
                        {id: 'DELIVERY_CHARGES', title: 'DELIVERY_CHARGES'},
                        {id: 'WAITING_CHARGES', title: 'WAITING_CHARGES'},
                        {id: 'TIP_AGENT', title: 'TIP_AGENT'},
                        {id: 'STATUS', title: 'STATUS'},
                        {id: 'DURATION', title: 'DURATION'},
                        {id: 'PAYMENT_TYPE', title: 'PAYMENT_TYPE'},
                        {id: 'ORDER_DELIVERY_DATE', title: 'ORDER_DELIVERY_DATE'}
                      ]
                      let data = receivable.map((element)=>{
                          let temp = {}
                          temp["ORDER_NO"] = element.order_id
                          temp["DISTANCE"] = element.distance
                          temp["COMMISSION_AMOUNT"] = element.commission_ammount
                          temp["AGENT_ID"] = element.agent_id
                          temp["AGENT_NAME"] = element.name
                          temp["AGENT_EMAIL"] = element.email
                          temp["AGENT_PHONE_NUMBER"] = element.phone_number
                          temp["AGENT_CITY"] = element.city
                          temp["AGENT_STATE"] = element.state
                          temp["AGENT_COUNTRY"] = element.country
                          temp["AGENT_COMMISSION_TYPE"] = element.agent_commission_type
                          temp["NET_AMOUNT"] = element.net_amount
                          temp["TOTAL_AMOUNT"] = element.total_amount
                          temp["DELIVERY_CHARGES"] = element.delivery_charges
                          temp["WAITING_CHARGES"] = element.waiting_charges
                          temp["TIP_AGENT"] = element.tip_agent
                          temp["DURATION"] = element.duration
                          temp["PAYMENT_TYPE"] = element.payment_type
                          temp["ORDER_DELIVERY_DATE"] = moment(element.delivery_date).format('YYYY-MM-DD HH:mm:ss')
                          temp["STATUS"] = element.status==5?"delivered":"Pending" //0-unpaid,1-fully_paid,2-partially_paid
                          //0 :pending,1:confirm,2:reject, 3: shipped, 4:nearby,5:delivered,6:rating_by_user,7:tracked,8:customer_cancel,9:schedule,10 reached 11=In-progress
                          return temp;
                      })
            
                      let csvLink = await uploadMgr.uploadCsvFileNew(data,header,"cash_orders_list_")
                      logger.debug("+==========csvLingk=========",csvLink)
                      data1.csvFileLink = csvLink
                      cb(null)
                }else{

                    let payable=await ExecuteQ.QueryAgent(agentConnection,sql,[]);
                    if(payable.length){
                        data1.data=payable
                    }
                    else {
                        data1.data=[]
                    }
                    cb(null)
                }
        },
        orderPart1:async function(cb){
            let sql3 = sql.split('LIMIT')[0];
            let payable = await ExecuteQ.QueryAgent(agentConnection,sql3,[]);
            if(payable.length){
                data1.count=payable.length                
            }
            else {
                data1.count=0
            }
            cb(null)
        },
        ordersPart2:async function (cb) {
            var sql="SELECT sum(cuo.`commission_ammount`) as total_commission_ammount, sum(cuo.`net_amount`) as total_net_amount, sum(cuo.`delivery_charges`) as total_delivery_charges, sum(cuo.`waiting_charges`) as total_waiting_charges, sum(cuo.`tip_agent`) as total_tip_agent, (sum(cuo.`commission_ammount`) + sum(cuo.`delivery_charges`) + sum(cuo.`waiting_charges`) + sum(cuo.`tip_agent`) + sum(cuo.`agent_base_price`) + sum(cuo.`agent_delivery_charge_share`)) as total_amount FROM `cbl_user_orders` cuo join cbl_user cu on cuo.user_id=cu.id WHERE cu.supplier_id!='0' AND DATE( cuo.delivered_on ) >= '"+startDate+"' AND DATE( cuo.delivered_on ) <=  '"+endDate+"' "+status_check;

            let result = await ExecuteQ.QueryAgent(agentConnection,sql,[]);
            if(result.length){
                if(result[0].total_amount==null){
                    data1.totals={
                        "total_commission_ammount":0,
                        "total_net_amount":0,
                        "total_delivery_charges":0,
                        "total_waiting_charges":0,
                        "total_tip_agent":0,
                        "total_amount":0,
                    }
                }
                else {
                    data1.totals=result
                }
                
            }
            else {
                data1.totals={
                    "total_commission_ammount":0,
                    "total_net_amount":0,
                    "total_delivery_charges":0,
                    "total_waiting_charges":0,
                    "total_tip_agent":0,
                    "total_amount":0,
                }
            }
            cb(null)
        },
    },function (err,result) {
        if(err)
        {
            console.log('err12-----',err);
            sendResponse.somethingWentWrongError(res);
        }
        else{
            callback(null,data1);
        }
    });
}


exports.supplierDriverPayment = function (req,res) {
    // var accessToken=0;
    // var sectionId=0;
    // var orderId=0;
    // var transactionData=2;
    // //var accountType=2;
    // var adminId;
    // var data=[];
    // async.auto({
    //     blankField:function(cb) {
    //         console.log(req.body.transactionData);
    //         if(req.body && req.body.accessToken && req.body.authSectionId && req.body.transactionData)
    //         {
    //             accessToken=req.body.accessToken;
    //             sectionId=req.body.authSectionId;
    //             transactionData=req.body.transactionData;
    //             //accountType=req.body.accountType;
    //             cb(null);
    //         } else {
    //             sendResponse.parameterMissingError(res);
    //         }
    //     },
    //     authenticate:['blankField',function (cb) {
    //         func.authenticateAccessToken(req.dbName,accessToken, res,function(err,result){
    //             if(err) {
    //                 sendResponse .somethingWentWrongError(res);
    //             }
    //             else {
    //                 adminId=result;
    //                 console.log("adminId:  ",adminId);
    //                 cb(null);
    //             }
    //         })
    //     }],
    //     checkauthority:['authenticate',function(cb) {
    //         func.checkforAuthorityofThisAdmin(req.dbName,adminId,sectionId, res,function (err,result) {
    //             if(err) {
    //                 sendResponse.somethingWentWrongError(res);
    //             } else {
    //                 console.log("checkauthority complete");
    //                 cb(null);
    //             }
    //         });

    //     }],
    var accessToken=0;
    var sectionId=0;
    var orderId=0;
    var subsId=0;
    var paymentAmount=0;
    var supplier_id;
    var paymentMethod=-1;
    var payid=0;
    var subPayId=0
    var data=[];
    var supplierId=0;
    var subsAmount=0;
    var accountType;
    var transactionData;
    async.auto({
        blankField:function(cb)
        {
            // if(req.body && req.body.accessToken && req.body.authSectionId && ((req.body.amount  && req.body.paymethod && req.body.payId && req.body.id) ||( req.body.subId && req.body.subAmount && req.body.subPayId)))
            if(req.body && req.body.accessToken && req.body.authSectionId && req.body.transactionData)

            {
                accessToken=req.body.accessToken;
                sectionId=req.body.authSectionId;
                transactionData=req.body.transactionData;
                accountType=req.body.accountType;
                cb(null);


            //     if(req.body.id && req.body.subId){
            //         accessToken=req.body.accessToken;
            //         sectionId=req.body.authSectionId;
            //         orderId=req.body.id;
            //         paymentAmount=req.body.amount;
            //         paymentMethod=req.body.paymethod;
            //         payid=req.body.payId;
            //         subPayId=req.body.subPayId;
            //         subsId=req.body.subId;
            //         subsAmount=req.body.subAmount;
            //         cb(null);
            //     }   
            //     if(req.body.id){
            //         if(!req.body.subId){
            //             accessToken=req.body.accessToken;
            //             sectionId=req.body.authSectionId;
            //             orderId=req.body.id;
            //             paymentAmount=req.body.amount;
            //             paymentMethod=req.body.paymethod;
            //             payid=req.body.payId;
            //         }
            //         cb(null);
            //     }
            //     if(req.body.subId){
            //         if(!req.body.id){
            //             accessToken=req.body.accessToken;
            //             sectionId=req.body.authSectionId;
            //             subsId=req.body.subId;
            //             subsAmount=req.body.subAmount;
            //             subPayId=req.body.subPayId;
            //         }
            //         cb(null);
            //     }
              

            }
            else
            {
                sendResponse.parameterMissingError(res);
            }
        }, 
        authenticate:['blankField',function (cb)
        {
            //console.log("acc",accessToken);
            func.authenticateSupplierAccessToken(req.dbName,accessToken, res,function(err,result){
                if(err)
                {
                    sendResponse.somethingWentWrongError(res);
                }
                else
                {
                    supplier_id=result;
                    //console.log("supplierId:  ",supplier_id);
                    cb(null);
                }

            },1)
        }],
        // checkauthority:['authenticate',function(cb)
        // {
        //     func.checkforAuthorityofThisSupplier(req.dbName,supplier_id,sectionId, res,function (err,result) {
        //         if(err)
        //         {
        //             sendResponse.somethingWentWrongError(res);
        //         }
        //         else
        //         {
        //             //console.log("checkauthority complete");
        //             cb(null);
        //         }
        //     });

        // }],
        supplier:['authenticate',function (cb) {
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
        payment:['supplier',function(cb){
            console.log("1111111111111")
            supplierDriverPayablePayment(req.dbName,res,transactionData,function (err,result) {
                console.log("2222222222222")
                if(err) {
                    console.log("3333333333333")
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    console.log("4444444444444")
                    data=[];
                    cb(null);
                }
            })

        }]
    },function(err,result){
        if(err) {
            sendResponse.somethingWentWrongError(res);
        }else{
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,constant.responseStatus.SUCCESS);
        }
    })

};

function supplierDriverPayablePayment(dbName,res,data,callback) {
    console.log("555555555555555555555555")
    var id=0; 
        async.auto({
            update: async function (cb) {
                let getAgentDbData=await common.GetAgentDbInformation(dbName);        
                let agentConnection=await common.RunTimeAgentConnection(getAgentDbData); 
                for(var i=0;i<data.length;i++){
                    (async function (i) {
                        var amount=parseFloat(data[i].amount);
                        var orderId=parseInt(data[i].orderId);
                        var user_id=parseInt(data[i].user_id);
                        var transaction_mode=parseInt(data[i].transaction_mode);
                        var selSql="select tip_agent, total_amount, total_paid, total_left, status, transaction_mode, waiting_charges, payment_date, commission_ammount, delivery_charges, agent_base_price, agent_delivery_charge_share from cbl_account_payable_order where user_id = '"+user_id+"' and order_id = '"+orderId+"'";
                        let orderDetails = await ExecuteQ.QueryAgent(agentConnection,selSql,[]);
                        var sql="";
                        if(orderDetails.length){
                            var total_paid = orderDetails[0].total_paid + amount
                            var total_left = orderDetails[0].total_left - amount
                            if(total_paid == orderDetails[0].total_amount){
                                total_left = "0";
                            }
                            sql = "update cbl_account_payable_order set total_left = "+total_left+", total_paid = "+total_paid+", status = 1 where user_id = '"+user_id+"' and order_id = '"+orderId+"'";
                        }else{
                            var selSql="select tip_agent, (`commission_ammount` + `tip_agent` + agent_base_price + agent_delivery_charge_share) as total_amount ,  waiting_charges, commission_ammount, delivery_charges, agent_base_price, agent_delivery_charge_share from cbl_user_orders where user_id = '"+user_id+"' and order_id = '"+orderId+"'";
                            let orderExistingDetails = await ExecuteQ.QueryAgent(agentConnection,selSql,[]);
                            var tip_agent = orderExistingDetails[0].tip_agent;
                            var total_amount = orderExistingDetails[0].total_amount;
                            var total_paid = amount;
                            var total_left = orderExistingDetails[0].total_amount - amount;
                            var waiting_charges = orderExistingDetails[0].waiting_charges;
                            var delivery_charges = orderExistingDetails[0].delivery_charges;
                            var commission_ammount = orderExistingDetails[0].commission_ammount;
                            var agent_base_price = orderExistingDetails[0].agent_base_price;
                            var agent_delivery_charge_share = orderExistingDetails[0].agent_delivery_charge_share;
                            var status = (total_amount == total_paid) ? 1 : 2;
                            sql ="INSERT INTO `cbl_account_payable_order` (`user_id`, `tip_agent`, `order_id`, `total_amount`, `total_paid`, `total_left`, `status`, `transaction_mode`, `waiting_charges`,`commission_ammount`, `delivery_charges`, `agent_base_price`, `agent_delivery_charge_share`) VALUES ('"+user_id+"', '"+tip_agent+"', '"+orderId+"', '"+total_amount+"', '"+total_paid+"', '"+total_left+"', '"+status+"', '"+transaction_mode+"', '"+waiting_charges+"', '"+commission_ammount+"', '"+delivery_charges+"', '"+agent_base_price+"', '"+agent_delivery_charge_share+"')";
                        }

                        await ExecuteQ.QueryAgent(agentConnection,sql,[]);
                        if(i==(data.length-1)){
                            cb(null);
                        }

                        // multiConnection[dbName].query(sql, function (err, result) {
                        //     console.log(".....",err,result);
                        //     if (err) {
                        //         console.log('errr1----', err);
                        //         sendResponse.somethingWentWrongError(res);
                        //     }
                        //     else {
                        //         if(i==(data.length-1)){
                        //             cb(null);
                        //         }
                        //     }
                        // });
                    }(i))
                }
            }
        },function (err,result) {
            if(err){
                console.log('errr3----', err);
                sendResponse.somethingWentWrongError(res);
            }
            else {
                callback(null);
            }
        });
    
}



exports.driverStatement = function (req,res) {

    var accessToken=0;
    var sectionId=0;
    var search = req.body.search;
    var limit = req.body.limit;
    var offset = req.body.offset
    var supplier_id=0;
    var supplierId=0;
    const is_download = req.body.is_download
    var data=[];
    var startDate= '1990-01-01',
        endDate='2100-01-01',
        status='';
console.log("req body",req.body);
    async.auto({
        blankField:function(cb) {
            if(req.body && req.body.accessToken && req.body.authSectionId)
            {
                accessToken=req.body.accessToken;
                sectionId=req.body.authSectionId;
                if(req.body.startDate){
                    startDate= req.body.startDate
                }
                if(req.body.endDate){
                    endDate= req.body.endDate
                }
                if(req.body.status){
                    status= req.body.status
                }
                cb(null);
            }
            else
            {
                sendResponse.parameterMissingError(res);
            }
        },
        authenticate:['blankField',function (cb) {
            func.authenticateSupplierAccessToken(req.dbName,accessToken, res,function(err,result){
                if(err)
                {
                    sendResponse .somethingWentWrongError(res);
                }
                else
                {
                    supplier_id=result;
                    //console.log("supplierId:  ",supplier_id);
                    cb(null);
                }

            },1)
        }],
        // checkauthority:['authenticate',function(cb) {
        //     func.checkforAuthorityofThisSupplier(req.dbName,supplier_id,sectionId, res,function (err,result) {
        //         if(err)
        //         {
        //             sendResponse.somethingWentWrongError(res);
        //         }
        //         else
        //         {
        //             //console.log("checkauthority complete");
        //             cb(null);
        //         }
        //     });

        // }],
        payableListing:['authenticate',function(cb){
            supplierAccount.getDriverStatement(req.dbName,res,supplierId,startDate,endDate,status,search,limit,offset,is_download,function (err,result) {
                if(err) {
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
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,constant.responseStatus.SUCCESS);
        }
    })

}

exports.getDriverStatement = async function(db_name,res,supplier,startDate,endDate,status,search,limit,offset,is_download,callback) {
var sum=0;
var id=0;
var data1={};
var sql;
var status_check = "";
if(status && status == "1"){
    //status_check = "AND capo.status LIKE '%"+status+"%'";
    status_check = "AND cuo.order_id IN (SELECT order_id from cbl_account_payable_order)";
}else if(status && status == "0"){
    status_check = "AND cuo.order_id NOT IN (SELECT order_id from cbl_account_payable_order)";
}
let mUnit=await Universal.getMeausringUnit(db_name);
let getAgentDbData=await common.GetAgentDbInformation(db_name);        
let agentConnection=await common.RunTimeAgentConnection(getAgentDbData);  
async.auto({
    ordersPart:async function (cb) {
        sql="SELECT round(("+mUnit+" * acos( cos( radians( supplierinfo.latitude) ) * cos( radians( user_address.latitude ) ) * cos( radians( user_address.longitude ) - radians(supplierinfo.longitude) ) + sin( radians(supplierinfo.latitude) ) * sin( radians( user_address.latitude ) ) ) )) as distance,  IF( capo.status=1, 'Fully Paid', 'Partially Paid' ) as payment_status,capo.transaction_mode, cuo.`order_id`, cuo.customer_name, cuo.customer_phone_number, cuo.customer_email, cuo.customer_id, cuo.`commission_ammount`, cuo.agent_base_price, cuo.agent_delivery_charge_share, cuo.`user_id`, cuo.supplier_id, cuo.supplier_name, cu.name, cu.email, cu.phone_number,cu.id as agent_id,cu.country,cu.city,cu.state, IF( cu.agent_commission_type=0, 'Percentage', 'Flat' ) agent_commission_type, cuo.`net_amount`, cuo.`delivery_charges`, cuo.`waiting_charges`, cuo.`tip_agent`, cuo.`status`, cuo.delivered_on delivery_date, cuo.`card_payment_id`, cuo.`payment_type`,IF( TIMESTAMPDIFF(MINUTE,cuo.shipped_on,cuo.delivered_on) > 0, TIMESTAMPDIFF(MINUTE,cuo.shipped_on,cuo.delivered_on), '0' ) as duration, (cuo.`commission_ammount` + cuo.`tip_agent` + cuo.agent_base_price + cuo.agent_delivery_charge_share) as total_amount FROM `cbl_account_payable_order` capo join cbl_user_orders cuo on capo.order_id = cuo.order_id join cbl_user cu on capo.user_id=cu.id left join "+db_name+".orders as user_orders on cuo.order_id=user_orders.id  left join "+db_name+".user_address user_address on user_orders.user_delivery_address=user_address.id left join "+db_name+".supplier supplierinfo on cuo.supplier_id=supplierinfo.id  WHERE cu.supplier_id!='0' AND DATE( cuo.delivered_on ) >= '"+startDate+"' AND DATE( cuo.delivered_on ) <=  '"+endDate+"' "+status_check+" AND (cu.name LIKE '%"+search+"%' OR cuo.order_id LIKE '%"+search+"%') order by cuo.order_id + 0 desc LIMIT "+offset+","+limit;


            if(parseInt(is_download)){
                let sql1 = sql.split('LIMIT')[0];
                //let receivable = await ExecuteQ.Query(db_name,sql1,[]);
                let receivable=await ExecuteQ.QueryAgent(agentConnection,sql1,[]);
                let header = [ 
                    {id: 'ORDER_NO', title: 'ORDER_NO'},
                    {id: 'DISTANCE', title: 'DISTANCE'},
                    {id: 'COMMISSION_AMOUNT', title: 'COMMISSION_AMOUNT'},
                    {id: 'AGENT_ID', title: 'AGENT_ID'},
                    {id: 'AGENT_NAME', title: 'AGENT_NAME'},
                    {id: 'AGENT_EMAIL', title: 'AGENT_EMAIL'},
                    {id: 'AGENT_PHONE_NUMBER', title: 'AGENT_PHONE_NUMBER'},
                    {id: 'AGENT_CITY', title: 'AGENT_CITY'},
                    {id: 'AGENT_STATE', title: 'AGENT_STATE'},
                    {id: 'AGENT_COUNTRY', title: 'AGENT_COUNTRY'},
                    {id: 'AGENT_COMMISSION_TYPE', title: 'AGENT_COMMISSION_TYPE'},
                    {id: 'NET_AMOUNT', title: 'NET_AMOUNT'},
                    {id: 'TOTAL_AMOUNT', title: 'TOTAL_AMOUNT'},
                    {id: 'DELIVERY_CHARGES', title: 'DELIVERY_CHARGES'},
                    {id: 'WAITING_CHARGES', title: 'WAITING_CHARGES'},
                    {id: 'TIP_AGENT', title: 'TIP_AGENT'},
                    {id: 'STATUS', title: 'STATUS'},
                    {id: 'DURATION', title: 'DURATION'},
                    {id: 'PAYMENT_TYPE', title: 'PAYMENT_TYPE'},
                    {id: 'ORDER_DELIVERY_DATE', title: 'ORDER_DELIVERY_DATE'},
                    {id: 'ORDER_AMOUNT', title: 'ORDER_AMOUNT'},
                    //{id: 'BALANCE_AMOUNT', title: 'BALANCE_AMOUNT'},
                    {id: 'TRANSACTION_STATUS', title: 'TRANSACTION_STATUS'}
                  ]
                  let data = receivable.map((element)=>{
                      let temp = {}
                      temp["ORDER_NO"] = element.order_id
                      temp["DISTANCE"] = element.distance
                      temp["COMMISSION_AMOUNT"] = element.commission_ammount
                      temp["AGENT_ID"] = element.agent_id
                      temp["AGENT_NAME"] = element.name
                      temp["AGENT_EMAIL"] = element.email
                      temp["AGENT_PHONE_NUMBER"] = element.phone_number
                      temp["AGENT_CITY"] = element.city
                      temp["AGENT_STATE"] = element.state
                      temp["AGENT_COUNTRY"] = element.country
                      temp["AGENT_COMMISSION_TYPE"] = element.agent_commission_type
                      temp["NET_AMOUNT"] = element.net_amount
                      temp["TOTAL_AMOUNT"] = element.total_amount
                      temp["DELIVERY_CHARGES"] = element.delivery_charges
                      temp["WAITING_CHARGES"] = element.waiting_charges
                      temp["TIP_AGENT"] = element.tip_agent
                      temp["DURATION"] = element.duration
                      temp["PAYMENT_TYPE"] = element.payment_type
                      temp["ORDER_DELIVERY_DATE"] = moment(element.delivery_date).format('YYYY-MM-DD HH:mm:ss')
                      temp["STATUS"] = element.status==5?"delivered":"Pending" //0-unpaid,1-fully_paid,2-partially_paid
                      //0 :pending,1:confirm,2:reject, 3: shipped, 4:nearby,5:delivered,6:rating_by_user,7:tracked,8:customer_cancel,9:schedule,10 reached 11=In-progress
                      temp["ORDER_AMOUNT"] = element.net_amount
                      //temp["BALANCE_AMOUNT"] = element.total_amount
                      temp["TRANSACTION_STATUS"] = element.payment_status //0-unpaid,1-fully_paid,2-partially_paid
                      return temp;
                  })
        
                  let csvLink = await uploadMgr.uploadCsvFileNew(data,header,"cash_orders_list_")
                  logger.debug("+==========csvLingk=========",csvLink)
                  data1.csvFileLink = csvLink
                  cb(null)
            }else{

                let payable=await ExecuteQ.QueryAgent(agentConnection,sql,[]);
                if(payable.length){
                    data1.data=payable
                }
                else {
                    data1.data=[]
                }
                cb(null)
            }
    },
    orderPart1:async function(cb){
        let sql3 = sql.split('LIMIT')[0];
        let payable = await ExecuteQ.QueryAgent(agentConnection,sql3,[]);
        if(payable.length){
            data1.count=payable.length                
        }
        else {
            data1.count=0
        }
        cb(null)
    },
    ordersPart2:async function (cb) {
        var sql="SELECT sum(capo.`total_amount`) as total_amount FROM `cbl_account_payable_order` capo join cbl_user cu on capo.user_id=cu.id left join cbl_user_orders cuo on capo.order_id = cuo.order_id WHERE cu.supplier_id!='0' "+status_check;

        let result = await ExecuteQ.QueryAgent(agentConnection,sql,[]);
        if(result.length){
            if(result[0].total_amount==null){
                data1.totals={
                    "total_amount":0,
                }
            }
            else {
                data1.totals=result
            }
            
        }
        else {
            data1.totals={
                "total_amount":0,
            }
        }
        cb(null)
    },
},function (err,result) {
    if(err)
    {
        console.log('err12-----',err);
        sendResponse.somethingWentWrongError(res);
    }
    else{
        callback(null,data1);
    }
});
}

exports.supplierConnectWithStripe = async function (req,res) {
    console.log("11111111111111111111111111111111111")
    let strip_secret_key_data=await Universal.getStripSecretKey(req.dbName);
    let keyData=await Universal.getValue(["website_urls"],req.dbName);
    let website_url=keyData && keyData.length>0?keyData[0].value:"";
    console.log("strip_secret_key_data -------------- ",strip_secret_key_data)
    const stripe = require('stripe')(strip_secret_key_data[0].value);
    console.log("req.body -------------- ",req.body)
    var accessToken=0;
    var sectionId=0;
    var stripe_account_code
    var data=[];
    async.auto({
        blankField:function(cb) {
            if(req.body && req.body.id && req.body.stripe_account_code)
            {   
                stripe_account_code = req.body.stripe_account_code;
                supplier_id = req.body.id;
                cb(null);
            }
            else
            {   
                sendResponse.parameterMissingError(res);
            }
        },
        ConnectWithStripe:['blankField',function(cb){
            console.log(stripe_account_code,"  5555555555555555555555555555   ",strip_secret_key_data[0].value);
            stripe.oauth.token({
                client_secret: strip_secret_key_data[0].value,//"ca_HHt1pxTRXUvMFgsdtB2aOvgkYC1yl2AX",//stripeToken,
                grant_type: "authorization_code",
                code: stripe_account_code,
            }, async (err, response) => {
                console.log("=====stripe==Err=>>",err)
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                } else {
                    var sql = "update supplier set stripe_account = ? where id = ?";
                    multiConnection[req.dbName].query(sql, [response.stripe_user_id, supplier_id], function (err, result) {
                        if (err) {
                            sendResponse.somethingWentWrongError(res);
                        } else {
                            data=result;
                            cb(null);
                        }
                    })
                }
            })
        }]
    },function(err,result){
      console.log("=========>>",err)
        if(err) {
            sendResponse.somethingWentWrongError(res);
        }else{
            sendResponse.sendSuccessData({"website_urls":website_url}, constant.responseMessage.SUCCESS, res,constant.responseStatus.SUCCESS);
        }
    })

}


exports.getSupplierChatList = function (req,res) {
    
    var accessToken=0;
    var limit = req.query.limit ? req.query.limit : "50";
    var offset = req.query.offset ? req.query.offset : "0"
    var type = req.query.type ? req.query.type : "1"
    var data=[];
    async.auto({
        blankField:function(cb) {
            if(req.query && req.query.accessToken)
            {
                accessToken=req.query.accessToken;
                cb(null);
            }
            else
            {
                sendResponse.parameterMissingError(res);
            }
        },
        authenticate:['blankField',function (cb) {
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
        payableListing:['authenticate',async function(cb){            
            console.log("55555555555555555555555555555")
         
            var _userCreatedData = await ExecuteQ.Query(req.dbName,`select s.user_created_id from supplier s join supplier_admin sa on sa.supplier_id=s.id where sa.id=?`,[supplier_id])
            let _userCreatedId=_userCreatedData && _userCreatedData.length>0?_userCreatedData[0].user_created_id:""
            var agent_db = req.dbName+"_agent"
            var sql ="select CASE WHEN send_to_type = 'SUPPLIER' THEN send_by ELSE send_to END AS uid, CASE WHEN send_to_type = 'SUPPLIER' THEN send_by_type ELSE send_to_type END AS utype, max(`c_id`) as last_id,(select message_id from chats where c_id=max(c.c_id) and (c.send_by='"+_userCreatedId+"' or c.send_to='"+_userCreatedId+"') ) message_id, (select text from chats where c_id=max(c.c_id) and (c.send_by='"+_userCreatedId+"' or c.send_to='"+_userCreatedId+"')) last_text, sent_at, u.id, concat(u.firstname, ' ',u.lastname) as name, u.user_image as image, u.user_created_id from chats c left join user u on (CASE WHEN send_to_type = 'SUPPLIER' THEN send_by ELSE send_to END)=u.user_created_id where (send_to_type='SUPPLIER' or send_by_type='SUPPLIER') AND send_to!='' AND send_by!='' group by least(`send_by`, `send_to`), greatest(`send_by`, `send_to`) having utype='USER' order by last_id desc LIMIT "+offset+","+limit;

            if(type=="2"){ //agent
                sql ="select CASE WHEN send_to_type = 'SUPPLIER' THEN send_by_type ELSE send_to_type END AS utype, max(`c_id`) as last_id, (select text from chats where c_id=max(c.c_id)) last_text,(select message_id from chats where c_id=max(c.c_id)) message_id, sent_at, u.email, u.id, u.name,u.image, u.agent_created_id from chats c left join "+agent_db+".cbl_user u on (CASE WHEN send_to_type = 'SUPPLIER' THEN send_by ELSE send_to END)=u.agent_created_id where (send_to_type='SUPPLIER' or send_by_type='SUPPLIER') AND send_to!='' AND send_by!='' group by least(`send_by`, `send_to`), greatest(`send_by`, `send_to`) having utype='AGENT' order by last_id desc LIMIT "+offset+","+limit
            }

            if(type=="3"){ //admin
                sql = "select CASE WHEN send_to_type = 'SUPPLIER' THEN send_by_type ELSE send_to_type END AS utype, max(`c_id`) as last_id, (select text from chats where c_id=max(c.c_id) and (c.send_by='"+_userCreatedId+"' or c.send_to='"+_userCreatedId+"')) last_text,(select message_id from chats where c_id=max(c.c_id) and (c.send_by='"+_userCreatedId+"' or c.send_to='"+_userCreatedId+"')) message_id, sent_at, u.email, u.id, 'Admin' as name,'' as image, u.user_created_id from chats c left join admin u on (CASE WHEN send_to_type = 'SUPPLIER' THEN send_by ELSE send_to END)=u.user_created_id where (send_to_type='SUPPLIER' or send_by_type='SUPPLIER') AND send_to!='' AND send_by!='' group by least(`send_by`, `send_to`), greatest(`send_by`, `send_to`) having utype='ADMIN' order by last_id desc LIMIT "+offset+","+limit
            }



            var result = await ExecuteQ.Query(req.dbName,sql,[])
            console.log("result =====================",result)
            data=result
            cb(null);
        }]
    },function(err,result){
        if(err) {
            sendResponse.somethingWentWrongError(res);
        }else{
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,constant.responseStatus.SUCCESS);
        }
    })

}

const totalOrderPrice  = (dbName,order_id)=>{
    return new Promise(async(resolve,reject)=>{
        let temp_price = 0
        logger.debug("=================result=======",order_id);
        let query = 'select op.price,op.order_id,op.freeQuantity,op.product_name,op.quantity,op.image_path as product_image from order_prices op';
        let params = []
        let product1 = await ExecuteQ.Query(dbName,query,params);
        let is_decimal_quantity_allowed_val=await Universal.is_decimal_quantity_allowed(dbName)
        var is_decimal_quantity_allowed = "0";
        if(is_decimal_quantity_allowed_val[0] && is_decimal_quantity_allowed_val[0].value){
            is_decimal_quantity_allowed = is_decimal_quantity_allowed_val[0].value
        }
        logger.debug("========product1.len======",product1.length)
            for(var j=0;j<product1.length;j++){
                // logger.debug("=========product1[j].order_id == result.id==============",order_id,product1[j].order_id,product1[j].order_id == order_id);
                let id1 = parseInt(product1[j].order_id)
                let id2 = order_id
                // logger.debug("=============id1=====id2 ======",id1,id2)
                if(id1==id2){
                    if(is_decimal_quantity_allowed == "1"){
                        temp_price = Number(product1[j].price) * parseFloat(product1[j].quantity) + temp_price
                    }else{
                        temp_price = Number(product1[j].price) * Number(product1[j].quantity) + temp_price
                    }
                    // logger.debug("==============temppriee======1===",temp_price)
                }
            }
            logger.debug("========temp_price========",temp_price);
        resolve(temp_price);     
    })
}

const getOrderAddsOn=(dbName,cartId,productId)=>{
    return new Promise(async (resolve,reject)=>{
            try{
                var data=await ExecuteQ.Query(dbName,"select "+
                "cart_adds_on.*"+
                " from cart_adds_on join product_adds_on padds on padds.id=cart_adds_on.adds_on_id where cart_id=?",[parseInt(cartId)])
                resolve(data)
            }
            catch(Err){
                reject(Err)
            }
    })
}

const addonTotalPrice=(addOns,quantity)=>{
    return new Promise(async (resolve,reject)=>{
        try{
            let addonprice = 0
            if(addOns && addOns.length>0){
                for(const [index,i] of addOns.entries()){
                    addonprice = addonprice + (i.price*parseInt(i.quantity))
                    // addonprice = addonprice + (i.price*i.quantity)
                }
            }
            resolve(addonprice)
        }
        catch(Err){
            reject(Err)
        }
    })
}