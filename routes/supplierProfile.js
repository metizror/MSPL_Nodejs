var async = require('async');
var sendResponse = require('./sendResponse');
var constant = require('./constant');
var func = require('./commonfunction');
var _ = require('underscore');
var validator = require("email-validator");
var supplierProfile = require('./supplierProfile');
var moment = require('moment');
const uploadMgr = require('../lib/UploadMgr')
var consts = require('../config/const')
var universalFunctions = require('../util/Universal')
var log4js=require("log4js")
var logger = log4js.getLogger();
logger.level = 'debug';
let Execute=require('../lib/Execute')
let Universal=require('../util/Universal')
let common=require('../common/agent')

exports.listSupplierAddedCategoryData = function(req,res)
{
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var supplierId = req.body.supplierId;
    var manValues = [accessToken, sectionId,supplierId];
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
            function (cb) {
                var sql = "select d.id,d.supplier_id,d.category_id,d.sub_category_id,d.detailed_sub_category_id,c.name category_name,";
                sql += " sc.name sub_cat_name, if(dsc.name IS NULL,'',dsc.name) detailed_sub_cat_name from  supplier_category d left join categories c on ";
                sql += " d.category_id = c.id  left join categories sc on d.sub_category_id = sc.id left join categories dsc ";
                sql += " on d.detailed_sub_category_id = dsc.id where d.supplier_id = ? order by d.id DESC";
                multiConnection[req.dbName].query(sql, [supplierId], function (err, categories) {
                    if (err) {
                        console.log(err);
                        sendResponse.somethingWentWrongError(res);
                    }
                    else {
                        cb(null,categories);
                    }

                })
            }
        ], function (error, result) {

        if (error) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    }
    );
}

exports.deleteSupplierCategory = function(req,res)
{
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var id = req.body.id;
    var supplier_id =req.body.suplierId;

    
    
/*    if(!(req.body.deleteValue)){
        var msg = "deleteValue id not found";
        return sendResponse.sendErrorMessage(msg,res,400);
    }*/

    
    var deleteValue = 0;
    deleteValue = req.body.deleteValue;

    var manValues = [accessToken, sectionId,id,supplier_id];
    var count =0;
    var tempDate;
    var category = 0;
    var subCategory = 0;
    var detailsDubCategory = 0 ;
    var flag = false;
    var ids=[];
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function(cb){
                var sql = "select id,category_id,sub_category_id,detailed_sub_category_id from supplier_category where (category_id = ? or sub_category_id=? or detailed_sub_category_id=?) and (supplier_id = ?) ";
                multiConnection[req.dbName].query(sql,[id,id,id,supplier_id],function(err,result)
                {
                    console.log(result,"resultresultresultresult",err)
                    if(err){
                        sendResponse.somethingWentWrongError(res);
                    }
                    else{

                        if(result.length){
                            _.each(result,(i)=>{
                                ids.push(i.id)
                            })
                            flag = true;
                            category = result[0].category_id;
                            subCategory = result[0].sub_category_id;
                            detailsDubCategory = result[0].detailsDubCategory;
                        }
                        cb(null);
                    }
                })
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
            function(cb){
                var sql = "select COUNT(*) as left_assigned_cat from supplier_category where (category_id = ?) and (supplier_id = ?) ";
                multiConnection[req.dbName].query(sql,[category,supplier_id],async function(err,result)
                {

                    console.log(result,"resultresultresultresulterr",err)
                    if(err){
                        sendResponse.somethingWentWrongError(res);
                    }
                    else{
                        if(result && result.length>0){
                            logger.debug("=====result[0].left_assigned_cat===",result[0].left_assigned_cat)
                            try{
                                //logic in case of upto third level
                                if(result[0].left_assigned_cat==2){
                                    await Execute.Query(req.dbName,"delete from supplier_category where category_id=? and supplier_id=? limit 1",[category,supplier_id])
                                    cb(null)
                                 }
                                else{
                                    cb(null)
                                }
                              }
                            catch(Err){
                                sendResponse.somethingWentWrongError(res);
                            }
                        }
                        else{
                            cb(null)
                        }
                    }
                })
            },
            function (cb) {
                var sql ='SELECT count(detailed_sub_category_id) as count from supplier_category where supplier_id = ? ';
                multiConnection[req.dbName].query(sql,[supplier_id],function(err,result)
                {

                    console.log(result,"resultresultresultresulterr1",err)
                    if(err){
                        sendResponse.somethingWentWrongError(res)
                    }
                    else {
                        if (result.length) {
                            count = result[0].count;
                            logger.debug("bkhds", result, count);
                            cb(null);
                        }
                        else {
                            cb(null)
                        }
                    }
                })
            },
            function (cb) {
                if(count > 1){
                    if(ids.length>0){
                    var sql = "delete from supplier_category where id IN (?) limit 1";
                    multiConnection[req.dbName].query(sql,[ids],function(err,result)
                    {

                        console.log(result,"resultresultresultresulterr2",err)
                        if(err){
                            sendResponse.somethingWentWrongError(res)
                        }
                        else{
                            cb(null);
                        }
                    })
                }else{
                    cb(null);
                }
                }
                else{
                    // var msg = "You have only one detailed SubCategory";
                    var msg = "Restaurant should have atleast one category"
                    // sendResponse.sendSuccessData(msg, constant.responseStatus.SOME_ERROR, res);

                    sendResponse.sendErrorMessage(msg,res,constant.responseStatus.SOME_ERROR);
                }
            },

        function(cb){
          if(count > 1){
              var sql = "select id from supplier_branch where supplier_id = ? ";
              multiConnection[req.dbName].query(sql,[supplier_id],function(err,result)
              {
                  if(err){
                      sendResponse.somethingWentWrongError(res);
                  }
                  else{
                      tempDate = result;
                      logger.debug("...........................err.....................",tempDate);
                      cb(null);
                  }
              })
          } else{
              cb(null);
          }
        },
        function(cb){
            if(count > 1 && flag == true){
                var length = tempDate.length;
                if(length && length>0){
                    for(var i =0;i < length;i++){
                        (function(i){
    
    
                            if(deleteValue == 1){
                                var sql = "update supplier_branch_product set is_deleted = ? where supplier_branch_id = ? and detailed_sub_category_id = ?";
                                multiConnection[req.dbName].query(sql,[1,tempDate[i].id,detailsDubCategory],function(err,result)
                                {
                                    if(err){
                                        sendResponse.somethingWentWrongError(res);
                                    }
                                    else{
                                        cb(null);
                                    }
    
                                })
                            }else{
                                var sql = "update supplier_branch_product set is_deleted = ? where supplier_branch_id = ? and sub_category_id = ?";
                                multiConnection[req.dbName].query(sql,[1,tempDate[i].id,subCategory],function(err,result)
                                {
                                    logger.debug(".,.................................................................................err",err,result);
                                    if(err){
                                        sendResponse.somethingWentWrongError(res);
                                    }
                                    else{
                                        cb(null);
                                    }
    
                                })
                            }
                        }(i));
                    }

                }else{
                    cb(null)
                }             
            }else{
                cb(null);
            }
        },
        async function (cb) {
            var sqlCheck = "select id,parent_id from categories where id=?"
            var checkIsParent = await Execute.Query(req.dbName, sqlCheck, [id]);
            if (checkIsParent.length && checkIsParent[0].parent_id) {
                var parent_id = checkIsParent[0].parent_id;
                var sqlChild= `select Count(*) as total from supplier_category where 
                supplier_id=${supplier_id} and category_id=${parent_id} and sub_category_id!=0`
                
                var childCount = await Execute.Query(req.dbName, sqlChild, []);
                if(childCount.length &&  !childCount[0].total){
                    await Execute.Query(req.dbName,"delete from supplier_category where category_id=? and supplier_id=?",[parent_id,supplier_id])
                }
                cb(null);
            } else {
                cb(null);
            }
        },
        ], function (error, result) {

            if (error) {
                logger.debug("==========eerror finals==er=========",error)
                sendResponse.somethingWentWrongError(res);
            }
            else {
                sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );
}

// exports.deleteSupplierCategory = function(req,res)
// {
//     var accessToken = req.body.accessToken;
//     var sectionId = req.body.sectionId;
//     var id = req.body.id;
//     var supplier_id =req.body.suplierId;

    
    
// /*    if(!(req.body.deleteValue)){
//         var msg = "deleteValue id not found";
//         return sendResponse.sendErrorMessage(msg,res,400);
//     }*/

    
//     var deleteValue = 0;
//     deleteValue = req.body.deleteValue;

//     var manValues = [accessToken, sectionId,id,supplier_id];
//     var count =0;
//     var tempDate;
//     var category = 0;
//     var subCategory = 0;
//     var detailsDubCategory = 0 ;
//     var flag = false;
//     var ids=[];
//     async.waterfall([
//             function (cb) {
//                 func.checkBlank(res, manValues, cb);
//             },
//             function(cb){
//                 var sql = "select id,category_id,sub_category_id,detailed_sub_category_id from supplier_category where (category_id = ? or sub_category_id=? or detailed_sub_category_id=?) and (supplier_id = ?) ";
//                 multiConnection[req.dbName].query(sql,[id,id,id,supplier_id],function(err,result)
//                 {
//                     if(err){
//                         sendResponse.somethingWentWrongError(res);
//                     }
//                     else{

//                         if(result.length){
//                             _.each(result,(i)=>{
//                                 ids.push(i.id)
//                             })
//                             flag = true;
//                             category = result[0].category_id;
//                             subCategory = result[0].sub_category_id;
//                             detailsDubCategory = result[0].detailsDubCategory;
//                         }
//                         cb(null);
//                     }
//                 })
//             },
//             function (cb) {
//                 func.authenticateAccessToken(req.dbName,accessToken, res, cb);
//             },
//             function (id, cb) {
//                 func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
//             },
//             function(cb){
//                 var sql = "select COUNT(*) as left_assigned_cat from supplier_category where (category_id = ?) and (supplier_id = ?) ";
//                 multiConnection[req.dbName].query(sql,[category,supplier_id],async function(err,result)
//                 {
//                     if(err){
//                         sendResponse.somethingWentWrongError(res);
//                     }
//                     else{
//                         if(result && result.length>0){
//                             logger.debug("=====result[0].left_assigned_cat===",result[0].left_assigned_cat)
//                             try{
//                                 //logic in case of upto third level
//                                 if(result[0].left_assigned_cat==2){
//                                     await Execute.Query(req.dbName,"delete from supplier_category where category_id=? and supplier_id=? limit 1",[category,supplier_id])
//                                     cb(null)
//                                  }
//                                 else{
//                                     cb(null)
//                                 }
//                               }
//                             catch(Err){
//                                 sendResponse.somethingWentWrongError(res);
//                             }
//                         }
//                         else{
//                             cb(null)
//                         }
//                     }
//                 })
//             },
//             function (cb) {
//                 var sql ='SELECT count(detailed_sub_category_id) as count from supplier_category where supplier_id = ? ';
//                 multiConnection[req.dbName].query(sql,[supplier_id],function(err,result)
//                 {
//                     if(err){
//                         sendResponse.somethingWentWrongError(res)
//                     }
//                     else {
//                         if (result.length) {
//                             count = result[0].count;
//                             logger.debug("bkhds", result, count);
//                             cb(null);
//                         }
//                         else {
//                             cb(null)
//                         }
//                     }
//                 })
//             },
//             function (cb) {
//                 if(count > 1){
//                     var sql = "delete from supplier_category where id IN (?) limit 1";
//                     multiConnection[req.dbName].query(sql,[ids],function(err,result)
//                     {
//                         if(err){
//                             sendResponse.somethingWentWrongError(res)
//                         }
//                         else{
//                             cb(null);
//                         }
//                     })
//                 }
//                 else{
//                     // var msg = "You have only one detailed SubCategory";
//                     var msg = "Restaurant should have atleast one category"
//                     // sendResponse.sendSuccessData(msg, constant.responseStatus.SOME_ERROR, res);

//                     sendResponse.sendErrorMessage(msg,res,constant.responseStatus.SOME_ERROR);
//                 }
//             },

//         function(cb){
//           if(count > 1){
//               var sql = "select id from supplier_branch where supplier_id = ? ";
//               multiConnection[req.dbName].query(sql,[supplier_id],function(err,result)
//               {
//                   if(err){
//                       sendResponse.somethingWentWrongError(res);
//                   }
//                   else{
//                       tempDate = result;
//                       logger.debug("...........................err.....................",tempDate);
//                       cb(null);
//                   }
//               })
//           } else{
//               cb(null);
//           }
//         },
//         function(cb){
//             if(count > 1 && flag == true){
//                 var length = tempDate.length;
//                 if(length && length>0){
//                     for(var i =0;i < length;i++){
//                         (function(i){
    
    
//                             if(deleteValue == 1){
//                                 var sql = "update supplier_branch_product set is_deleted = ? where supplier_branch_id = ? and detailed_sub_category_id = ?";
//                                 multiConnection[req.dbName].query(sql,[1,tempDate[i].id,detailsDubCategory],function(err,result)
//                                 {
//                                     if(err){
//                                         sendResponse.somethingWentWrongError(res);
//                                     }
//                                     else{
//                                         cb(null);
//                                     }
    
//                                 })
//                             }else{
//                                 var sql = "update supplier_branch_product set is_deleted = ? where supplier_branch_id = ? and sub_category_id = ?";
//                                 multiConnection[req.dbName].query(sql,[1,tempDate[i].id,subCategory],function(err,result)
//                                 {
//                                     logger.debug(".,.................................................................................err",err,result);
//                                     if(err){
//                                         sendResponse.somethingWentWrongError(res);
//                                     }
//                                     else{
//                                         cb(null);
//                                     }
    
//                                 })
//                             }
//                         }(i));
//                     }

//                 }else{
//                     cb(null)
//                 }             
//             }else{
//                 cb(null);
//             }
//         }

//         ], function (error, result) {

//             if (error) {
//                 logger.debug("==========eerror finals==er=========",error)
//                 sendResponse.somethingWentWrongError(res);
//             }
//             else {
//                 sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
//             }
//         }
//     );
// }

/*
 * ------------------------------------------------------
 * Get tab 1 information of supplier profile (basic info like names, catgeories and all)
 * Output: supplier tab 1 information
 * ------------------------------------------------------
 */

exports.getRegSupplierInfoTab1 = function (req, res) {

    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var supplierId = req.body.supplierId;
    var values = [accessToken, sectionId, supplierId];
    async.waterfall([
            function (cb) {
                func.checkBlank(res, values, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
            function (cb) {
                supplierProfile.getSupplierData(req.dbName,supplierId, res, cb);
            }
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }

        }
    );
}


exports.supplier_getRegSupplierInfoTab1 = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var supplierId = req.body.supplierId;
    var values = [accessToken, sectionId, supplierId];
    async.waterfall([
            function (cb) {
                func.checkBlank(res, values, cb);
            },
        
          
            function (cb) {


                supplierProfile.getSupplierData(req.dbName,supplierId, res, cb);
            }
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }

        }
    );
}







/*
 * ------------------------------------------------------
 * Save/Edit tab 1 information of supplier profile (basic info like names, catgeories and all)
 * Output: success/error
 * ------------------------------------------------------
 */

exports.updateSupplierStatusSave = function(req,res){
    var isPostponed = req.body.isPostponed;
    var isUrgent = req.body.isUrgent;
    var startDate = req.body.startDate;
    var endDate = req.body.endDate;
    var currentStatus = req.body.currentStatus;
    var paymentMethod = req.body.paymentMethod;
    var monthPrice = req.body.monthPrice;
    var subscriptionId = req.body.subscriptionId;
    var day = moment().isoWeekday();
    var supplierId = req.body.supplierId;
    var accessToken = req.body.accessToken;
    day=day-1;
    var adminId;
    async.auto({
        adminId:function(cb){
            func.authenticateAccessToken(req.dbName,accessToken, res,function(err,result){
                if(err){
                    cb(err);
                }else{
                    adminId = result;
                    cb(null);
                }
            });
        },
        updateInfo:['adminId',function(cb){
            supplierProfile.updateSupplierData(req.dbName,res, supplierId, startDate, endDate, monthPrice, adminId, subscriptionId,function(err,result){
                if(err){
                    cb(err);
                }else{
                    cb(null);
                }
            });
        }],
        
        updateEmail:['adminId',function(cb){
            var sql='update supplier_timings st join supplier s on s.id= st.supplier_id set st.is_open = ?,s.status = ? where st.supplier_id = ? and st.week_id =?';
            multiConnection[req.dbName].query(sql,[currentStatus,currentStatus,supplierId,day],function (err,result) {
                if(err){
                    console.log("err",err);
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    cb(null);
                }
            })
        }],
        updatePaymentMethos:['adminId',function(cb){
            var sql='update supplier set payment_method = ?,is_postpone=?,is_urgent=? where id = ? '
            multiConnection[req.dbName].query(sql,[paymentMethod,isPostponed,isUrgent,supplierId],function (err,result) {
                if(err){
                    console.log("err",err);
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    cb(null);
                }
            })
        }]
        
        
    },function(err,result){
        if(err){
            sendResponse.somethingWentWrongError(res);
        }else{
            var data = [];
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

        }
    })
    
}



exports.saveSupplierProfileTab1 = function (req, res) {
    var urgentType  = -1;
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var supplierId = req.body.supplierId;
   //
     var supplierEmail = req.body.supplierEmail;
  //  var supplierName = req.body.supplierName;
  //  var languageId = req.body.languageId;
//    var isRecommended = req.body.isRecommended;
    var pricingLevel = req.body.pricingLevel;
    var handlingAdmin = req.body.handlingAdmin;
    var handlingSupplier = req.body.handlingSupplier;
/*    var isUrgent = req.body.isUrgent;
    var isPostponed = req.body.isPostponed;*/
/*    var currentStatus = req.body.currentStatus;*/
   // var address = req.body.address;
  //  var telephone = req.body.telephone;
   // var fax = req.body.fax;
 //   var primaryMobile = req.body.primaryMobile;
 //   var secondaryMobile = req.body.secondaryMobile;
    var categoryString = req.body.categoryString;
 //   var tradeLicenseNo = req.body.tradeLicenseNo;
    var commissionType = req.body.commissionType;  // separated with #
    var commission = req.body.commission;          // separated with #
    var commissionPackage = req.body.commissionPackage; // separated with #
    urgentType = req.body.urgentType;
    var urgentPrice = req.body.urgentPrice;
/*    var startDate = req.body.startDate;
    var endDate = req.body.endDate;*/
    
/*    console.log("..****************startDate*****************.......",startDate);
    console.log("..****************endDate*****************.......",endDate);*/

   /* var monthPrice = req.body.monthPrice;*/
//    var multilanguageId = req.body.multilanguageId;  //separated by #
    /*var subscriptionId = req.body.subscriptionId; */// separated by #
    var folder = "abc";
 //   var photoStatus = req.body.photoStatus;
   // var logoUrl = req.body.logoUrl;
  //  var supplierphotoStatus =req.body.supplierphotoStatus;
   // var businessStartDate = req.body.businessStartDate;
/*    var paymentMethod = req.body.paymentMethod;*/
    var urgentButton = req.body.urgentButton;
    var commisionButton = req.body.commisionButton;
    var adminId;
  //  var values = [accessToken, supplierEmail, sectionId, supplierId, supplierName, languageId, isRecommended, pricingLevel, handlingAdmin, handlingSupplier, isUrgent, isPostponed, currentStatus, address, telephone, fax, primaryMobile, secondaryMobile, categoryString, tradeLicenseNo, photoStatus, commissionType, commission, urgentType, urgentPrice, startDate, endDate, monthPrice, commissionPackage,supplierphotoStatus,businessStartDate,paymentMethod];
/*    var day = moment().isoWeekday();
     day=day-1;*/





    async.auto({
        getAdminId:function(cb){

            func.authenticateAccessToken(req.dbName,accessToken, res,function(err,result){
                if(err){
                    cb(err)
                }else{
                    adminId = result;
                    cb(null)
                }
            });
        },
        checkAuth:['getAdminId',function(cb){
            func.checkforAuthorityofThisAdmin(req.dbName,adminId, sectionId, res, function(err,result){
                if(err){
                    cb(err);
                }else{
                    cb(null)
                }
            });
        }],
        urgentType:['getAdminId',function(cb){
            if(urgentButton){
                var temp_data  = JSON.parse(urgentType);
                var len = temp_data.length;
                for(var i = 0;i < len;i++){
                    (function(i){
                        updateUrgentType(req.dbName,res,temp_data[i],supplierId,function(err,result){
                            if(err){
                                cb(null);
                            }else{
                                if(i == (len-1)){
                                    cb(null);
                                }
                            }
                        })
                    }(i));
                }
            }else{
                cb(null)
            }
        }],
        comissionUpdate:['getAdminId',function(cb){
            var sql = "update supplier SET 	commisionButton = ?, urgentButton = ? where id = ? ";
            if(commisionButton == 1 || commisionButton == true){
                commisionButton =1
            }else{
                commisionButton = 0;
            }
            if(urgentButton == 1 || urgentButton == true){
                urgentButton = 1
            }else{
                urgentButton = 0;
            }
            multiConnection[req.dbName].query(sql,[commisionButton,urgentButton,supplierId],function (err,result) {
                if(err){
                    console.log("err",err);
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    cb(null);
                }
            })
        }],
        commissionUpdateCode:['comissionUpdate',function(cb){
            if(commisionButton == 1){
                var temp_data  = JSON.parse(urgentType);
                var len = temp_data.length;
                for(var i = 0;i < len;i++){
                    (function(i){
                        updateCommissionType(req.dbName,temp_data[i],supplierId,supplierEmail,function(err,result){
                            if(err){
                                cb(null);
                            }else{
                                if(i == (len-1)){
                                    cb(null);
                                }
                            }
                        })
                    }(i));
                }
            }else{
                cb(null)
            }
        }],
        lastCommsionUpdate:['comissionUpdate',function(cb){
            if(commisionButton == 0){
                var temp_dataa  = JSON.parse(urgentType);
                var len = temp_dataa.length;
                for(var i =0;i<len;i++){
                    (function(i){
                        var sql = "update supplier_category SET onOffComm = ? where supplier_id = ? and category_id  = ?";
                        multiConnection[req.dbName].query(sql,[temp_dataa[i].onOff,supplierId,temp_dataa[i].categoryId],function(err,result)
                        {
                            if(err){
                                cb(null);
                            } else{
                                if(i == (len - 1)){
                                    cb(null);
                                }
                            }
                        })
                    }(i));
                }
            }else{
                cb(null);
            }
        }]
        
        
    },function(err,result){
        if(err){
            sendResponse.somethingWentWrongError(res); 
        }else{
            var data = [];
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

        }
    })
}


exports.saveSupplierImage_2 = function (req,res) {
    var logo_path;
    var accessToken;
    var sectionId;
    var supplierId;
    var adminId;
    var logo;
    var folder = "abc";
    var supplierImageUrl = [];
    var deleteImage = [];
    var image_id;

    console.log("*****f*dgbv*admin data*******",req.body);
    console.log(".......................image1.........",req.files);

    async.auto({
        checkValues:function (cb) {
            if(req.body.accessToken){
                accessToken = req.body.accessToken;
            }
            else {
                var msg = "accessToken id not found";
                return sendResponse.sendErrorMessage(msg,res,400);
            }
            if(req.body.sectionId){
                sectionId = req.body.sectionId;
            }
            else {
                var msg = "sectionId id not found";
                return sendResponse.sendErrorMessage(msg,res,400);
            }
            if(req.body.supplierId){
                supplierId = req.body.supplierId;
            }
            else {
                var msg = "supplierId  not found";
                return sendResponse.sendErrorMessage(msg,res,400);
            }
            
            
            if(req.body.deleteImage){
                 deleteImage = req.body.deleteImage;
                // temp = temp+","
                // deleteImage=temp.split(',')
                // deleteImage.pop();
                console.log(".,*************deleteImage********************...",deleteImage);
            }
            cb(null);
        },
        checkAccessToken:['checkValues',function (cb) {
            func.authenticateAccessToken(req.dbName,accessToken, res, function (err,result) {
                if(err){
                    console.log("err",err);
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    adminId=result;
                    cb(null);
                }
            });
        }],
        uploadLogo:['checkAccessToken',async function(cb){
            if(req.files.logo){
                    let result = await uploadMgr.uploadImageFileToS3BucketNew(req.files.logo)
                    logo_path = result;
                    cb(null);
                // func.uploadImageFileToS3BucketSupplier(res,req.files.logo,folder,function(err,result){
                //     if(err){
                //         cb(err);
                //     }else{
                //         logo_path = result;
                //         cb(null);
                //     }
                // })
            }else{
                cb(null);
            }
        }],
        updateLogo:['uploadLogo',function(cb){
            if(req.files.logo){
                var sql = "update supplier set logo=? where id=? "
                multiConnection[req.dbName].query(sql,[logo_path,req.body.supplierId],function(err,result){
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
        deleteImage:['updateLogo',function(cb){
            if(deleteImage && deleteImage.length>0){
               var lenss = deleteImage.length;
               for(var j = 0;j <lenss;j++){
                   var sql = "delete from supplier_image where orderImage = ? and supplier_id = ?";
                   multiConnection[req.dbName].query(sql,[deleteImage[j],supplierId],function(err,result){
                        if(err){
                           cb(err);
                       }else{
                          if(j == (lenss)){
                              cb(null,result);
                           }
                       }
                   })
               }
           } else{
               cb(null)
           }
        }],
        imageOne:['deleteImage',async function (cb) {
            if(req.files.image1){
                let result = await uploadMgr.uploadImageFileToS3BucketNew(req.files.image1);
                supplierImageUrl.push({image:result,order:1});
                cb(null);
                // func.uploadImageFileToS3BucketSupplier(res,req.files.image1, folder,function(err,result){
                //         if(err){
                //             cb(err);
                //         }else{
                //             supplierImageUrl.push({image:result,order:1});
                //             cb(null);
                //         }
                //     });
                }else{
                    cb(null);
                }
        }],
        imageTwo:['imageOne',async function (cb) {
            if(req.files.image2){
                    console.log(".......................image1.........");
                    let result = await uploadMgr.uploadImageFileToS3BucketNew(req.files.image2);
                    supplierImageUrl.push({image:result,order:2});
                    cb(null);
                    // func.uploadImageFileToS3BucketSupplier(res,req.files.image2, folder,function(err,result){
                    //     if(err){
                    //         cb(err);
                    //     }else{
                    //         supplierImageUrl.push({image:result,order:2});
                    //         cb(null);
                    //     }
                    // });
                }else{
                    cb(null);
                }
        }],
        imageThree:['imageTwo',async function (cb) {
            if(req.files.image3){
                let result = await uploadMgr.uploadImageFileToS3BucketNew(req.files.image3);
                supplierImageUrl.push({image:result,order:3});
                cb(null);
                    // func.uploadImageFileToS3BucketSupplier(res,req.files.image3, folder,function(err,result){
                    //     if(err){
                    //         cb(err);
                    //     }else{
                    //         supplierImageUrl.push({image:result,order:3});
                    //         cb(null);
                    //     }
                    // });
                }else{
                    cb(null);
                }

        }],
        imageFour:['imageThree',async function (cb) {
            if(req.files.image4){
                let result = await uploadMgr.uploadImageFileToS3BucketNew(req.files.image4);
                supplierImageUrl.push({image:result,order:4});
                cb(null);
                    // func.uploadImageFileToS3BucketSupplier(res,req.files.image4, folder,function(err,result){
                    //     if(err){
                    //         cb(err);
                    //     }else{
                    //         supplierImageUrl.push({image:result,order:4});
                    //         cb(null);
                    //     }
                    // });
                }else{
                    cb(null);
                }

        }],
        saveImage:['imageOne','imageTwo','imageThree','imageFour',function (cb) {
            
            console.log(".********supplierImageUrl*****",supplierImageUrl);
            
            
            updateSupplierImage(req.dbName,res,supplierId,supplierImageUrl,cb);
        }]
    },function (err,result) {
        if(err){
            console.log("-----------------------",err)
            sendResponse.somethingWentWrongError(res);
        }
        else {
            var data = [];
            sendResponse.sendSuccessData(supplierImageUrl, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })
}



exports.saveSeeupplierProfileSubTab1 = async function (req,res) {
    // logger.debug("=============request.service_type=========",req.service_type[0].app_type)

    console.log("req.body===========================",JSON.stringify(req.body));

    let home_address = req.body.home_address!==undefined?req.body.home_address:"";
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var supplierId = req.body.supplierId;
    var supplierEmail = req.body.supplierEmail;
    var addressEn = req.body.addressEn;
    var addressAb = req.body.addressAb;
    var telephone = req.body.telephone;
    var primaryMobile = req.body.primaryMobile;
    var secondaryMobile = req.body.secondaryMobile;
    var pickupCommision = req.body.pickupCommision!=undefined && req.body.pickupCommision!=''?req.body.pickupCommision:0;;
    // var folder = "abc";
    // var logoUrl = req.body.logoUrl;
    var businessStartDate = req.body.businessStartDate!=undefined?req.body.businessStartDate:"";
    var tradeLicenseNo = req.body.tradeLicenseNo!=undefined?req.body.tradeLicenseNo:"";
    // var photoStatus = req.body.photoStatus;
    var supplierNameEn = req.body.supplierNameEn;
    var supplierNameAb = req.body.supplierNameAb;
    var isRecommended  = req.body.isRecommended;
    var adminId;
    var latitude = req.body.latitude!=undefined && req.body.latitude!=''?req.body.latitude:0;
    var longitude = req.body.longitude!=undefined && req.body.longitude!=''?req.body.longitude:0;
    var delivery_radius = req.body.delivery_radius!=undefined && req.body.delivery_radius!=''?req.body.delivery_radius:0;
    var distance_value = req.body.distance_value!=undefined && req.body.distance_value!=''?req.body.distance_value:1;
    var is_area_restricted = req.body.is_area_restricted
    var radius_price = req.body.radius_price!=undefined && req.body.radius_price!=''?req.body.radius_price:20;
    var delivery_type = req.body.delivery_type

    var commission = req.body.commission!=undefined && req.body.commission!=''?req.body.commission:0;
    var getApiVersion = universalFunctions.getVersioning(req.path)
    var self_pickup=req.body.self_pickup!=undefined?parseInt(req.body.self_pickup):0
    let delivery_charge_tax=req.body.delivery_charge_tax || 0;
    let delivery_charge_tax_type=req.body.delivery_charge_tax_type || 0;
    var head_branch = 0;
    var supplierBranchId=0,isMultiBranch=1;
    let iso=req.body.iso!=undefined?req.body.iso:null;
    let is_multibranch = req.body.is_multibranch!=null && req.body.is_multibranch!=undefined?req.body.is_multibranch:0
    let country_code=req.body.country_code!=undefined?req.body.country_code:null
    let license_number = req.body.license_number==undefined?0:req.body.license_number
    let user_service_charge = req.body.user_service_charge==undefined?0:req.body.user_service_charge;
    let user_request_flag=req.body.user_request_flag==undefined?0:req.body.user_request_flag;
    let base_delivery_charges = req.body.base_delivery_charges==undefined?0:req.body.base_delivery_charges
    let base_delivery_charges_array = req.body.base_delivery_charges_array==undefined? [] :req.body.base_delivery_charges_array
    let min_order = req.body.min_order==undefined?0:req.body.min_order
    let speciality=req.body.speciality || "";
    let nationality=req.body.nationality || "";
    let facebook_link=req.body.facebook_link || "";
    let linkedin_link=req.body.linkedin_link || "";
    let brand=req.body.brand || "";
    let description=req.body.description || "";
    let is_dine_in = req.body.is_dine_in || 0
    let is_scheduled=req.body.is_scheduled || 0
    let country_of_origin=req.body.country_of_origin || "";
    let currency_exchange_rate = req.body.currency_exchange_rate==undefined?0:req.body.currency_exchange_rate
    let is_own_delivery =  req.body.is_own_delivery==undefined?0:req.body.is_own_delivery
    let local_currency = req.body.local_currency==undefined?"":req.body.local_currency
    let is_user_service_charge_flat = req.body.is_user_service_charge_flat==undefined?0:req.body.is_user_service_charge_flat
    let is_free_delivery = req.body.is_free_delivery==undefined?0:req.body.is_free_delivery
    let vat_value = req.body.vat_value!==undefined?req.body.vat_value:0;
    console.log("============vat value======++",vat_value,req.body.vat_value,req.body)
    let slogan_ol = req.body.slogan_ol || "";
    let slogan_en = req.body.slogan_en || "";
    let documents=req.body.documents || "";

    let zip_code=req.body.zip_code || 000000;
    var values = [
        accessToken, 
        supplierEmail, 
        sectionId, 
        supplierId, 
        telephone
        // fax, 
        // primaryMobile, 
        // secondaryMobile, 
        // tradeLicenseNo,
        // businessStartDate,
        // photoStatus
    ];
    let supplier_delivery_types = req.body.supplier_delivery_types!==undefined
     && req.body.supplier_delivery_types!=="" && req.body.supplier_delivery_types!==null
     ?req.body.supplier_delivery_types:'[]'
     supplier_delivery_types = JSON.parse(supplier_delivery_types)
    
    let is_out_network = req.body.is_out_network!==undefined && req.body.is_out_network!==null ? req.body.is_out_network:0
    let table_booking_price = req.body.table_booking_price!==undefined && req.body.table_booking_price!==null ? req.body.table_booking_price:0
    let table_booking_discount = req.body.table_booking_discount!==undefined && req.body.table_booking_discount!==null ? req.body.table_booking_discount:0
    let supplier_tap_token = req.body.supplier_tap_token!==undefined && req.body.supplier_tap_token !==null?req.body.supplier_tap_token : "";
    let checkInOutEnabled = await Execute.Query(req.dbName,
        "select `key`,value from tbl_setting where `key`=? and value=1",["enable_in_out_network"]);
    let isDocumntUploadEnable=await Execute.Query(req.dbName,
        "select `key`,value from tbl_setting where `key`=? and value=1",["add_supplier_documents"]);

        let enable_zipcode=await Execute.Query(req.dbName,"select `key` , value from tbl_setting where `key`=? and value=1",["enable_zipcode"])


    let default_commission = req.body.commission || 0;

    let is_vat_applicable = req.body.is_vat_applicable || 0;
    let allow_agent_section_in_supplier = req.body.allow_agent_section_in_supplier || 0;
    let allow_geofence_section_in_supplier = req.body.allow_geofence_section_in_supplier || 0;

    
    async.auto({
        checkValues:function (cb) {
            func.checkBlank(res, values, cb);
        },
        checkAccessToken:function (cb) {
            func.authenticateAccessToken(req.dbName,accessToken, res, function (err,result) {
                console.log(".......authenticateAccessToken..........",err,result);
                if(err){
                    console.log("err",err);
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    adminId=result;
                    cb(null);
                }
            });
        },
        checkDupEmail:async function (cb) {
            try{
            var sql='select id from supplier where email=? and id != ?'
            let result=await Execute.Query(req.dbName,sql,[supplierEmail,supplierId]);
                    if(result && result.length>0){
                        sendResponse.sendErrorMessage(constant.responseMessage.EMAIL_EXISTS, res, constant.responseStatus.SOME_ERROR);
                    }
                    else{
                     cb(null);
                    }
                }
                catch(Err){
                    logger.debug("==getEmail===",Err)
                    sendResponse.somethingWentWrongError(res);
                }
        },
        isMultipleBranch:async function (cb) {
            try{
                var vendor_query="select is_multiple_branch from screen_flow limit 1"
                let data=await Execute.Query(req.dbName,vendor_query,[]);
                if(data && data.length>0){
                    if(parseInt(data[0].is_multiple_branch)==0){
                        await Execute.Query(req.dbName,"update supplier_branch set delivery_radius=? where supplier_id=?",[delivery_radius,supplierId])
                        cb(null)
                    }
                    else{
                        cb(null)
                    }
                }
                else{
                    cb(null)
                }
            }
            catch(Err){
                logger.debug("=====Err!==>>",Err)
                sendResponse.somethingWentWrongError(res);
            }
        },
        updateData:['isMultipleBranch',async function (cb) {
            try{
            if(getApiVersion>0){
                if(isDocumntUploadEnable && isDocumntUploadEnable.length>0){
                    await Execute.Query(req.dbName,`update supplier  set documents=? where id=?`,[documents,supplierId]);
                }

                if(enable_zipcode && enable_zipcode.length>0){
                    await Execute.Query(req.dbName,"update supplier set zip_code=? where id=?",[zip_code,supplierId])
                }
    // is_vat_applicable allow_agent_section_in_supplier allow_geofence_section_in_supplier
                
                // supplier is_sponser is actually used for is_mulit_branch to check supplier with multiple branch or not
                var sql = `update supplier  set home_address=?,delivery_charge_tax_type=?,delivery_charge_tax=?,
                is_scheduled=?,country_of_origin=?,is_dine_in=?,distance_value=?,description=?,brand=?,
                linkedin_link=?,facebook_link=?,nationality=?,speciality=?,user_request_flag=?,
                license_number=?,user_service_charge=?, address=?,is_sponser=?, country_code=?,
                 iso=?, radius_price=?,self_pickup=?,phone = ?,mobile_number_1 = ?,mobile_number_2 = ?, 
                default_commission=?,supplier_tap_token=?, vat_value=?, slogan_ol=?,slogan_en=?,
                 trade_license_no = ? ,business_start_date = ?,is_recommended = ?, email = ?, 
                name = ?,latitude = ?,longitude = ?,delivery_radius = ?,is_area_restricted = ?,
                delivery_type = ?,commission = ?,pickup_commission=?,base_delivery_charges=?,
                currency_exchange_rate=?,local_currency=?,is_own_delivery=?,is_out_network=?,
                is_user_service_charge_flat=?,table_booking_price=?,is_free_delivery=?,
                table_booking_discount=?,is_vat_applicable=?,  allow_agent_section_in_supplier=?, 
                allow_geofence_section_in_supplier = ? where id = ? limit 1`
               
                await Execute.Query(req.dbName,sql,[home_address,delivery_charge_tax_type,delivery_charge_tax,is_scheduled,country_of_origin,is_dine_in,
                    distance_value,description,brand,linkedin_link,facebook_link,nationality,
                    speciality,user_request_flag,license_number,user_service_charge,addressEn,
                    is_multibranch,country_code,iso,radius_price ,self_pickup,telephone,
                    primaryMobile,secondaryMobile,default_commission,supplier_tap_token,vat_value,slogan_ol,slogan_en,
                    tradeLicenseNo,businessStartDate,
                    isRecommended,supplierEmail,supplierNameEn,latitude,longitude,//default_commission,
                    delivery_radius,is_area_restricted,delivery_type,commission,
                    pickupCommision,base_delivery_charges,currency_exchange_rate,
                    local_currency,is_own_delivery,is_out_network,
                    is_user_service_charge_flat,table_booking_price,
                    is_free_delivery,table_booking_discount,is_vat_applicable, allow_agent_section_in_supplier,
                    allow_geofence_section_in_supplier,
                    supplierId])


                await Execute.Query(req.dbName,
                    "delete from supplier_delivery_types where supplier_id=?",[supplierId]);

                if(supplier_delivery_types && supplier_delivery_types.length>0){


                    for(const [index,i] of supplier_delivery_types.entries()){
                        let query = "insert into supplier_delivery_types (supplier_id,type,type_name,price,buffer_time) values(?,?,?,?,?)";
                        let params = [supplierId,i.type,i.type_name,i.price,i.buffer_time]
                        await Execute.Query(req.dbName,query,params);
                    }
                }

                let is_enabled_multiple_base_delivery_charges = await Universal.isEnabledMultipleBaseDeliveryCharges(req.dbName)
                if(is_enabled_multiple_base_delivery_charges[0] && is_enabled_multiple_base_delivery_charges[0].value=="1" && base_delivery_charges_array && base_delivery_charges_array.length > 0){
                    await Execute.Query(req.dbName,"delete from supplier_delivery_charges where supplier_id=?",[supplierId])
                    var finalValue=[];
                    console.log("typeof base_delivery_charges_array ============== ",typeof base_delivery_charges_array)
                    base_delivery_charges_array = (typeof base_delivery_charges_array !== 'string') ? base_delivery_charges_array : JSON.parse(base_delivery_charges_array);
                    _.each(base_delivery_charges_array,async function(i){
                        console.log("=============================i ================= ",i)
                        var a = await Execute.Query(req.dbName,"insert into supplier_delivery_charges(`base_delivery_charges`, `distance_value`, `supplier_id`) values (?,?,?)",[i.base_delivery_charges, i.distance_value, supplierId])
                        console.log("a ================= ",a)
                        //var data_ar = [i.base_delivery_charges, i.distance_value, supplierId]
                        //finalValue.push(i.base_delivery_charges, i.distance_value, supplierId)
                        //finalValue.push(data_ar)
                        //finalValue.push([i.base_delivery_charges, i.distance_value, supplierId]);
                    })
                    // console.log("finalValue ================= ",finalValue)
                    // var a =  await ExecuteQ.Query(dbName,"insert into supplier_delivery_charges(`base_delivery_charges`, `distance_value`, `supplier_id`) values ? ",[finalValue])
                    // console.log("a ================= ",a)
                }
                let totalSupplierProduct=await Execute.Query(req.dbName,`select * from supplier_branch_product sbp join supplier_branch sb on sb.id = sbp.supplier_branch_id join supplier s on s.id = sb.supplier_id  join product p on p.id = sbp.product_id where p.is_deleted=0 and s.id=?`,[supplierId]);
               let totalLengthSuppProduct=totalSupplierProduct && totalSupplierProduct.length>0?(totalSupplierProduct.length-1):0
                if(checkInOutEnabled && checkInOutEnabled.length>0){
                    if(parseInt(is_out_network)>0){
                        let query = `update supplier_branch_product sbp 
                        join supplier_branch sb on sb.id = sbp.supplier_branch_id
                        join supplier s on s.id = sb.supplier_id
                        join product p on p.id = sbp.product_id
                        set p.is_deleted=1 where s.id=?`
                        await Execute.Query(req.dbName,query,[supplierId])

                        var sql =  `SELECT sbp.product_id FROM supplier_branch_product sbp 
                        join supplier_branch sb on sb.id = sbp.supplier_branch_id
                        join supplier s on s.id = sb.supplier_id
                        join product p on p.id = sbp.product_id
                        where s.id = ?`;

                       let products =  await Execute.Query(req.dbName,sql,[supplierId])
                       if (products && products.length) {
                        var productSql = "update product set is_deleted = 0 where id=?";
                         await Execute.Query(req.dbName,productSql,[products[0].product_id])
                       }

                    } else {
                        let query = `update supplier_branch_product sbp 
                        join supplier_branch sb on sb.id = sbp.supplier_branch_id
                        join supplier s on s.id = sb.supplier_id
                        join product p on p.id = sbp.product_id
                        set p.is_deleted=0 where s.id=?`
                        await Execute.Query(req.dbName,query,[supplierId])
                    }
                    // else{
                    //     let query = `update supplier_branch_product sbp 
                    //     join supplier_branch sb on sb.id = sbp.supplier_branch_id
                    //     join supplier s on s.id = sb.supplier_id
                    //     join product p on p.id = sbp.product_id
                    //     set p.is_deleted=0 where s.id=?`
                    //     await Execute.Query(req.dbName,query,[supplierId])
                    // }
                }


                console.log("bbbbbbbbbbbbbbbbbbbbb ================= ")

                cb(null);
                // var stmt = multiConnection[req.dbName].query(sql, [distance_value,description,brand,linkedin_link,facebook_link,nationality,speciality,user_request_flag,license_number,user_service_charge,addressEn,is_multibranch,country_code,iso,radius_price ,self_pickup,telephone,primaryMobile,secondaryMobile,tradeLicenseNo,businessStartDate,isRecommended,supplierEmail,supplierNameEn,latitude,longitude,delivery_radius,is_area_restricted,delivery_type,commission,pickupCommision,base_delivery_charges,supplierId], function (err, result) {
                //     console.log("=============stmt.sq.l=========",stmt.sql,err)
                //      if (err) {
                //          console.log("err.....",err);
                //          sendResponse.somethingWentWrongError(res);
                //     }
                //     else {
                //         cb(null);
                //     }
                // })
            }
            else{
                var sql = "update supplier set home_address=?,delivery_charge_tax=?,is_scheduled=?,default_commission=?,description=?,brand=?,linkedin_link=?,facebook_link=?,nationality=?,speciality=?,user_request_flag=?,license_number=?,user_service_charge=?, address=?,is_live=?,self_pickup=?,phone = ?,mobile_number_1 = ?,mobile_number_2 = ?, "
                sql += "trade_license_no = ? ,business_start_date = ?,is_recommended = ?, email = ?, "
                sql += "name = ?,latitude = ?,longitude = ?,default_commission = ?, delivery_radius = ?,is_area_restricted = ?,delivery_type = ?,base_delivery_charges=?,is_out_network=?,is_user_service_charge_flat=?,table_booking_price=? where id = ? limit 1";
               await Execute.Query(req.dbName,sql,[home_address,delivery_charge_tax_type,is_scheduled,description,brand,linkedin_link,
                facebook_link,nationality,speciality,user_request_flag,license_number,
                user_service_charge, addressEn,1,   self_pickup,telephone,primaryMobile,
                secondaryMobile,tradeLicenseNo,businessStartDate,isRecommended,supplierEmail,
                supplierNameEn,latitude,longitude,default_commission,delivery_radius,is_area_restricted,delivery_type,
                base_delivery_charges,is_out_network,is_user_service_charge_flat,table_booking_price,supplierId]);


                if(enable_zipcode && enable_zipcode.length>0){
                    await Execute.Query(req.dbName,"update supplier set zip_code=? where id=?",[zip_code,supplierId])
                }
                // var stmt = multiConnection[req.dbName].query(sql, [description,brand,linkedin_link,facebook_link,nationality,speciality,user_request_flag,license_number,user_service_charge, addressEn,1,   self_pickup,telephone,primaryMobile,secondaryMobile,tradeLicenseNo,businessStartDate,isRecommended,supplierEmail,supplierNameEn,latitude,longitude,delivery_radius,is_area_restricted,delivery_type,base_delivery_charges,supplierId], function (err, result) {
                //     console.log("=============stmt.sq.l=========",stmt.sql,err)
                //      if (err) {
                //          console.log("err.....",err);
                //          sendResponse.somethingWentWrongError(res);
                //     }
                //     else {
                //         cb(null);
                //     }
                // })
            }
        }
        catch(Err){
            console.log("==============errrr========",Err)
            sendResponse.somethingWentWrongError(res);
        }
        }],
        updateEmail:['updateData',async function (cb) {
            try{
                var sql = "update supplier_admin set email = ? where supplier_id = ? and is_superadmin = 1 ";
                await Execute.Query(req.dbName,sql,[supplierEmail,supplierId]);
                cb(null)

            }
            catch(Err){
                logger.debug("=====ERR!==",Err);
                sendResponse.somethingWentWrongError(res);
            }
            // console.log("=============heeeeeeeeee")
            // var sql = "update supplier_admin set email = ? where supplier_id = ? and is_superadmin = 1 ";
            // multiConnection[req.dbName].query(sql, [supplierEmail,supplierId], function (err, result) {
            //     if (err) {
            //         console.log("err.....",err);
            //         sendResponse.somethingWentWrongError(res);
            //     }
            //     else {
            //         cb(null);
            //     }
            // })
        }],
        updateData2:['updateEmail',async function (cb) {
            logger.debug("=============heeeeeeeeee22")
            try{
                var sql = "update supplier_admin set phone_number = ? where supplier_id = ? limit 1";
                await Execute.Query(req.dbName,sql,[primaryMobile, supplierId]);
                cb(null);
            }
            catch(Err){
                sendResponse.somethingWentWrongError(res);
            }

            // var sql = "update supplier_admin set phone_number = ? where supplier_id = ? limit 1"
            // multiConnection[req.dbName].query(sql, [primaryMobile, supplierId], function (err, result12) {
            //     console.log("............updateData2...........",err,result12);
            //     if (err) {
            //         console.log(err);
            //         sendResponse.somethingWentWrongError(res);
            //     }
            //     else {
            //         cb(null);
            //     }

            // })
        }],
        updateSupplierEnglishName:['updateData2',async function(cb){
            logger.debug("=============heeeeeeeeee3333")
            try{
                let getSupplierMlInfo = await Execute.Query(req.dbName,"select id from supplier_ml where  supplier_id = ? and language_id  = ?",[supplierId,14]);
                if(getSupplierMlInfo && getSupplierMlInfo.length>0){
                    var sql = "update supplier_ml SET  name = ? ,address = ?  where supplier_id = ? and language_id  = ?";
                    await Execute.Query(req.dbName,sql,[supplierNameEn,addressEn,supplierId,14]);
                    cb(null)
                }else{
                    var sql = "insert into supplier_ml (name ,address,supplier_id,language_id ) values(?,?,?,?) ";
                    await Execute.Query(req.dbName,sql,[supplierNameEn,addressEn,supplierId,14]);
                    cb(null)
                }
            }
            catch(Err){
                cb(null)
            }
            // var sql = "update supplier_ml SET  name = ? ,address = ?  where supplier_id = ? and language_id  = ?";
            // var stmt = multiConnection[req.dbName].query(sql,[supplierNameEn,addressEn,supplierId,14],function(err,result)
            // {
            //     logger.debug("====================update supplier Name ============",stmt.sql,err)
            //     console.log("............updateSupplierEnglishName...........",err,result);
            //     if(err){
            //         cb(null);
            //     } else{
            //         cb(null);
            //     }
            // })
        }],
        updateSupplierArabicName:['updateSupplierEnglishName',async function(cb){
            logger.debug("=============heeeeeeeeee4444");
            try{

                let getSupplierMlInfo = await Execute.Query(req.dbName,"select id from supplier_ml where  supplier_id = ? and language_id  = ?",[supplierId,15]);
                if(getSupplierMlInfo && getSupplierMlInfo.length>0){
                    var sql = "update supplier_ml SET  name = ? ,address = ?  where supplier_id = ? and language_id  = ?";
                    await Execute.Query(req.dbName,sql,[supplierNameAb,addressAb,supplierId,15]);
                    cb(null)
                }else{
                    var sql = "insert into supplier_ml (name ,address,supplier_id,language_id ) values(?,?,?,?) ";
                    await Execute.Query(req.dbName,sql,[supplierNameAb,addressAb,supplierId,15]);
                    cb(null)
                }


                // var sql = "update supplier_ml SET  name = ? ,address = ? where supplier_id = ? and language_id  = ?";
                // await Execute.Query(req.dbName,sql,[supplierNameAb,addressAb,supplierId,15])
                // cb(null)
            }
            catch(Err){
                logger.debug("==Err=",Err)
                cb(null)
            }

            // var sql = "update supplier_ml SET  name = ? ,address = ? where supplier_id = ? and language_id  = ?";
            // multiConnection[req.dbName].query(sql,[supplierNameAb,addressAb,supplierId,15],function(err,result)
            // {
            //     if(err){
            //         cb(null);
            //     } else{
            //         cb(null);
            //     }
            // })
        }],
        checkSupplierHeadBranch: ['updateSupplierArabicName', async function (cb) {
          try{
            // service_type
            console.log("======req.service_type===========",req.service_type)
            
                    await Execute.Query(req.dbName,"update supplier_branch set address=?,latitude=?,longitude=?,delivery_radius=?,min_order=?,branch_name=? where supplier_id=? and id <> 0 and is_head_branch=1 ",[addressEn,latitude,longitude,delivery_radius,min_order,supplierNameEn,supplierId])
                    await Execute.Query(req.dbName,"update supplier_branch set min_order=? where supplier_id=? and id <> 0",[min_order,supplierId])
                    cb(null)
                
          }
          catch(Err){
              logger.debug("=========ERR!==",Err)
                sendResponse.somethingWentWrongError(res)
          }
        }],
        // supplierHeadBranch : ['checkSupplierHeadBranch',function(cb){
        //     console.log("=============heeeeeeeeee6666666666666")
        //         addSupplierHeadBranch(req.dbName,res,head_branch,supplierBranchId,supplierId,supplierNameEn,supplierNameEn,telephone,primaryMobile,secondaryMobile,supplierEmail,addressEn,1,latitude,longitude,delivery_radius,is_area_restricted,delivery_type,function(err,result){
        //             if(err){
        //                 sendResponse.somethingWentWrongError(res)
        //             }else{
        //               supplierBranchId = result;
        //               cb(null)
        //             }
        //         })
        // }],
        // supplierHeadBranchMl : ['supplierHeadBranch',function(cb){
        //     console.log("=============heeeeeeeeee77777")
        //         addSupplierHeadBranchMl(req.dbName,res,head_branch,supplierNameEn,supplierNameAb,supplierBranchId,addressEn,addressAb,function(err,result){
        //             if(err){    
        //                 cb(err)
        //             }else{
        //                 cb(null)
        //             }
        //         })
        // }]
    },
    function (err,result) {
        if(err){
            console.log("-------------error got here=====",err)
            sendResponse.somethingWentWrongError(res);
        }
        else {
            var data = [];
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })
}

var addSupplierHeadBranch = function(dbName,res,head_branch,supplierBranchId,supplierId,name,branchName,phone,mobile_1,mobile_2,email,address,is_head_branch,latitude,longitude,delivery_radius,is_area_restricted,delivery_type,callback){
    if(head_branch==0){
        var sql = "insert into supplier_branch(supplier_id,name,branch_name,phone,mobile_1,mobile_2,email,address,is_head_branch,latitude,longitude,delivery_radius,is_area_restricted,delivery_type,is_live) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
        var stmt=multiConnection[dbName].query(sql,[supplierId,name,branchName,phone,mobile_1,mobile_2,email,address,is_head_branch,latitude,longitude,delivery_radius,is_area_restricted,delivery_type,1],function(err,result){
            console.log("============errr============",err,stmt.sql,result)
            if(err){
                callback(err);
            }else{
                callback(null,result.insertId)
            }
        })
    }else{
        var sql = "update supplier_branch set name=?,branch_name=?,phone=?,mobile_1=?,mobile_2=?,email=?,address=?,is_head_branch=?,latitude=?,longitude=?,delivery_radius=?,is_area_restricted=?,delivery_type = ? where id=?"
        var stmt = multiConnection[dbName].query(sql,[name,branchName,phone,mobile_1,mobile_2,email,address,is_head_branch,latitude,longitude,delivery_radius,is_area_restricted,delivery_type,supplierBranchId],function(err,result){
            console.log("============errr============",err,stmt.sql,result)
            if(err){
                callback(err);
            }else{
                callback(null,supplierBranchId)
            }
        })
    }
}

var addSupplierHeadBranchMl = function(dbName,res,head_branch,supplierNameEn,supplierNameAb,supplierBranchId,addressEn,addressAb,callback){
    if(head_branch==0){
        var sql1 = "insert into supplier_branch_ml(name,branch_name,language_id,supplier_branch_id,address) values(?,?,?,?,?)"
        var stmt = multiConnection[dbName].query(sql1,[supplierNameEn,supplierNameEn,14,supplierBranchId,addressEn],function(err,result1){
            console.log("============errr============",err,result1)
            if(err){
                callback(err)
            }else{
                var sql2 = "insert into supplier_branch_ml(name,branch_name,language_id,supplier_branch_id,address) values(?,?,?,?,?)"
                var stmt=multiConnection[dbName].query(sql2,[supplierNameAb,supplierNameAb,15,supplierBranchId,addressAb],function(err,result2){
                    console.log("============qeru==========",stmt.sql2,err)
                    if(err){
                        callback(err)
                    }else{
                        callback(null,result2.insertId)
                    }
                })            
            }
        })
    }else{
        var sql1 = "update supplier_branch_ml set name=?,branch_name=?,address=? where supplier_branch_id=? and language_id=?"
        var stmt = multiConnection[dbName].query(sql1,[supplierNameEn,supplierNameEn,addressEn,supplierBranchId,14],function(err,result1){
            console.log("============errr============",err,result1)
            if(err){
                callback(err)
            }else{
                var sql1 = "update supplier_branch_ml set name=?,branch_name=?,address=? where supplier_branch_id=? and language_id=?"
                var stmt = multiConnection[dbName].query(sql1,[supplierNameAb,supplierNameAb,addressAb,supplierBranchId,15],function(err,result2){
                    console.log("============errr============",err,stmt.sql1,result2)
                    if(err){
                        callback(err)
                    }else{
                        callback(null,result2)
                    }
                })
            }
        })
    }
}

var  deleteImageOrder = function(order,supplierId,callback){
    var sql = "delete from supplier_image where supplier_id = ? and orderImage = ? ";
    multiConnection[dbName].query(sql,[supplierId,order],function(err,result){
        if(err){
            callback(err);
        }else{
            callback(null,result);
        }
    })

}


var updateCommissionType = function(dbName,data,supplierId,supplierEmail,callback)
{
    async.auto({
        updateSuplierDetails:function(cb){
            var sql = "update supplier_category SET  commission = ? , commission_type = ? , onOffComm = ? where supplier_id = ? and category_id  = ?";
            multiConnection[dbName].query(sql,[data.commissionPrice,data.commissionType,data.onOff,supplierId,data.categoryId],function(err,result)
            {
                if(err){
                    cb(null);
                } else{
                    cb(null);
                }
            })
        },
        updateProduct:['updateSuplierDetails',function(cb){
            var sql = "UPDATE supplier s join supplier_branch sb on s.id = sb.supplier_id join supplier_branch_area_product " +
                    " sbap on sbap.supplier_branch_id = sb.id join product p on p.id = sbap.product_id " +
                    "  SET p.commission = ?,p.commission_type = ? where s.id = ? and p.category_id = ?" ;
            multiConnection[dbName].query(sql,[data.commissionPrice,data.commissionType,supplierId,data.categoryId],function (err,result) {
                     if(err){
                        console.log("err");
                        sendResponse.somethingWentWrongError(res);
                    } else{
                        cb(null,data);
                    }
                })
        }],
        updateProductOnSupplierLevel:['updateSuplierDetails',function(cb){
       /*     var sql = "UPDATE supplier s join  sb on s.id = sb.supplier_id join supplier_branch_area_product " +
                " sbap on sbap.supplier_branch_id = sb.id join product p on p.id = sbap.product_id " +
                "  SET p.commission = ?,p.commission_type = ? where s.id = ? and p.category_id = ?" ;

*/
            var sql = "UPDATE supplier s join supplier_product sp on sp.supplier_id = s.id join product p on p.id = sp.product_id " +
                " SET p.commission = ?,p.commission_type = ? where s.id = ? and sp.category_id = ?" ;
            multiConnection[dbName].query(sql,[data.commissionPrice,data.commissionType,supplierId,data.categoryId],function (err,result) {
                  if(err){
                    console.log("err");
                    cb(err);
                } else{
                    cb(null,data);
                }
            })
        }],/*

        sendMail:['updateProductOnSupplierLevel',function(cb){
            var subject = "Update Commission";
            var  content =" chnage commission \n";
            content+="\n\n"
            content+="Team royo \n";
            func.sendMailthroughSMTP(reply,subject,supplierEmail,content,1,function(err,result){
                if(err){
                    callback(err);
                }else{
                    callback(null)
                }
            });
        }]*/



    },function(err,result){
        if(err){
            callback(err);
        }else{
            callback(null);
        }
    })


}



var updateUrgentType  = function(dbName,res,data,supplierId,callback)
{
     async.auto({
        updateSupplierDetails:function(cb){
            var sql = "update supplier_category SET  urgent_type = ? ,urgent_price = ? where supplier_id = ? and category_id  = ?";
            multiConnection[dbName].query(sql,[data.urgent_type,data.urgent_price,supplierId,data.categoryId],function(err,result)
            {
                 if(err){
                    sendResponse.somethingWentWrongError(res);
                } else{
                    cb(null);
                }
            })
        },
        updateProduct:['updateSupplierDetails',function(cb){
   //     console.log("bhvvdhgdsf");
            var sql1 = "UPDATE supplier s join supplier_branch sb on s.id = sb.supplier_id join supplier_branch_area_product " +
                " sbap on sbap.supplier_branch_id = sb.id join product p on p.id = sbap.product_id join product_pricing pp on" +
                " pp.product_id = p.id SET pp.urgent_type = ?,pp.urgent_value = ? where s.id = ? and p.category_id = ?" ;
            multiConnection[dbName].query(sql1,[data.urgent_type,data.urgent_price,supplierId,data.categoryId],function (err,result) {
              //  console.log("..........err2................",err,result);
                if(err){
                    sendResponse.somethingWentWrongError(res);
                } else{
                    cb(null);
                }
            })
        }],
         updateProductOnSupplierLevel:['updateProduct',function(cb){
          //   console.log("jbhdhjbdv");
                 var sql2 = "UPDATE supplier s join supplier_product sp on sp.supplier_id = s.id join product p on p.id = sp.product_id join product_pricing pp on " +
                     " pp.product_id = p.id SET pp.urgent_type = ?,pp.urgent_value = ? where s.id = ? and sp.category_id = ?" ;
                 multiConnection[dbName].query(sql2,[data.urgent_type,data.urgent_price,supplierId,data.categoryId],function (err,result) {
                 //    console.log("..........err3................",err,result);
                     if(err){
                         //console.log("err3",err);
                         sendResponse.somethingWentWrongError(res);
                     } else{
                         cb(null);
                     }
                 })
         }]
    },function(err,result){
        if(err){
            callback(err);
        }else{
            callback(null);
        }
    })


}


exports.addCategoryToSupplier = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var supplierId = req.body.supplierId;
    var categoryString = req.body.categoryString;
    var subCategoryString = req.body.subCategoryString
    var values = [accessToken, sectionId, supplierId, categoryString];
    async.waterfall([
            function (cb) {
                func.checkBlank(res, values, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
            function (cb) {
                

                
                makeQueryStringForSupplierCategories(req.dbName,res,categoryString,supplierId,subCategoryString,cb);
            }
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var data = [];
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }

        }
    );
}


exports.addCategoryToSupplierV1 = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var supplierId = req.body.supplierId;
    var categoryString = req.body.categoryString;
    var subCategoryString = req.body.subCategoryString
    var values = [accessToken, sectionId, supplierId, categoryString];
    async.waterfall([
            function (cb) {
                func.checkBlank(res, values, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
            async function (cb) {
                logger.debug("=====================went wrong 9 =========================");
                let cateArrayData=JSON.parse(categoryString);
                let insertedValue=[];
                var insertLength = "(?,?,?,?),",querystring='';
                if(cateArrayData && cateArrayData.length>0){
                    for (const [index,i] of cateArrayData.entries()){
                                if(i.data && i.data.length>0){
                                let returnJSON=  await universalFunctions.nthLevelCategoryQueryString(req.dbName,i.id,i.data,supplierId);
                                insertedValue.push(returnJSON.insertedValues);
                                querystring+=returnJSON.querystring;
                                // insertedValue=returnJSON.insertedValues;
                                // querystring=returnJSON.querystring;
                                logger.debug("=====returnJSON==>>",returnJSON);
                                }
                                else{
                                    querystring+=insertLength;
                                    insertedValue.push(supplierId,i.id,0,0);
                                    logger.debug("===1St=Level==>>",insertedValue)
                                }
                                if(index==cateArrayData.length-1){
                                    insertedValue=[].concat.apply([], insertedValue)
                                    querystring=querystring.substring(0, querystring.length - 1);
                                    cb(null, insertedValue, querystring);
                                }
                    }
                }
                else{
                    querystring=querystring.substring(0, querystring.length - 1);
                    cb(null, [0,0,0,0], querystring);
                }
                // logger.debug("===========before calling makequerystringforsupplierRegisterApi==================",categoryIds,supplierInsertId)
              
                // makeQueryStringForSupplierRegisterApi(cb, categoryIds, supplierInsertId);
            },
            function (values, querystring, cb) {
                logger.debug("=====================went wrong 10 =========================")
                insertSupplierInSupplierCategory(req.dbName,res, cb, querystring, values, supplierId);
            },
            function (cb) {

                updateOrderNoSupplierCategory(req.dbName,res,supplierId,cb);
            },
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var data = [];
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }

        }
    );
}
function updateOrderNoSupplierCategory(dbName, res, supplierInsertId, callback) {
    var sql = `select id from supplier_category 
    where supplier_id=${supplierInsertId} and order_no=0`;
    multiConnection[dbName].query(sql, [], function (err, results) {
        if (err) {
            cb(err);
        } else {
            async.eachSeries(results, function (item, cb) {
                var sql = `UPDATE supplier_category 
              set order_no = (
                  (
                    SELECT 
                      order_no 
                    FROM 
                      (
                        SELECT 
                          MAX(order_no) AS order_no 
                        FROM 
                          supplier_category WHERE 
               supplier_id=${supplierInsertId}
                      ) AS sub_selected_value
                  ) + 1.1
                ) 
              WHERE 
               id=${item.id}`;
                let stmt=multiConnection[dbName].query(sql, [], function (err, result) {
                    logger.debug("======STMT==>>",stmt.sql)
                    cb(null);
                });
            }, function (err) {
                if (err) {
                    callback(err);
                } else {
                    callback(null)
                }
            })

        }
    })
}
function insertSupplierInSupplierCategory(dbName,res, callback, querystring, values, supplierInsertId) {
    console.log("===========values===values=============",values);
     var sql = "insert into supplier_category(supplier_id,category_id,sub_category_id,detailed_sub_category_id) values" + querystring;
     multiConnection[dbName].query(sql, values, function (err1, reply1) {
         console.log("......................",err1,reply1);
 
         if (err1) {
             console.log("gfdhgfjhfyjfjh",err1);
             sendResponse.somethingWentWrongError(res);
         } else {
             callback(null);
         }
     })
 }
 exports.orderByCategoryToSupplier = function (req, res) {    
    var dbName = req.dbName;
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var supplierId = req.body.supplierId;
    var categoryOrder = req.body.categoryOrder;
    var isSubCat = req.body.isSubCat;
    var values = [accessToken, sectionId,supplierId];
    async.waterfall([
            function (cb) {
                func.checkBlank(res, values, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                 func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
            function (cb) {       
                for(var i=0;i<categoryOrder.length;i++){
                    (function (i) {
                        let item = categoryOrder[i];
                        var sql =`update supplier_category 
                        set order_no=${item.order_no} 
                        where supplier_id=${supplierId} and category_id=${item.categoryId} and sub_category_id=${item.subCategoryId}`;
                        multiConnection[dbName].query(sql,async function (err,result) {
                            if (err) {
                                cb(err);
                            }
                            else {   
                                if(!isSubCat){
                                    var sqlSub =`update
                                    supplier_category s
                                    left join supplier_category sc on (s.supplier_id = sc.supplier_id and s.category_id = sc.category_id and sc.sub_category_id !=0)
                                    set sc.order_no=(MOD(sc.order_no,1) +s.order_no)
                                    where 
                                    s.supplier_id=${supplierId} 
                                    and s.category_id=${item.categoryId}
                                    and s.sub_category_id=0;`;
                                    multiConnection[dbName].query(sqlSub,async function (err,result) {
                                        if (err) {
                                            cb(err);
                                        }                                        
                                    });
                                }
                                if(i==categoryOrder.length-1){
                                    cb(null);
                                }
                            }
                        });
                    }(i))
                }
            }
        ], function (error, result) {
            if (error) {
                console.log(error);                
                return sendResponse.sendErrorMessage(error.message,res,500);
            }
            else {
                var data = [];
                return sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }

        }
    );
}


/*
 * ------------------------------------------------------
 * Get tab 2 information of supplier profile (delivery areas and branches)
 * Output: supplier tab 2 information
 * ------------------------------------------------------
 */

exports.getRegSupplierInfoTab2 = function (req, res) {
    
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var supplierId = req.body.supplierId;
    var values = [accessToken, sectionId, supplierId];
    async.waterfall([
            function (cb) {
                func.checkBlank(res, values, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
            function (cb) {
                console.log("==============after checkforAuthorityofThisAdmin================")
                supplierProfile.getSupplierInfoTab2(req.dbName,res, supplierId, cb);
            }
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
    }
    );
}


exports.changeBranchStatus = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var branchId = req.body.branchId;
    var status = req.body.status;
    var values = [accessToken, sectionId, branchId, status];
    async.waterfall([
            function (cb) {
                func.checkBlank(res, values, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
            function (cb) {
                var branchIds=branchId.split('#').toString();
                supplierProfile.updateBranchStatus(req.dbName,res, branchIds, status, cb);
            }
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }

        }
    );
}


exports.deleteBranch = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var branchId = req.body.branchId;
    var supplier_id = req.body.supplierId;
    var values = [accessToken, sectionId, branchId];
    async.waterfall([
            function (cb) {
                func.checkBlank(res, values, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
            function (cb) {
                var branchIds=branchId.split('#');
                deleteBranch(req.dbName,res, branchIds,supplier_id, cb);
            }
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var data = [];
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }

        }
    );
};


exports.addBranch = function (req, res) {

    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var supplierId = req.body.supplierId;
    var name = req.body.name; // separated by #
    var branchName = req.body.branchName; // separated by #
    var languageId = req.body.languageId; // separated by #
    var email = req.body.email;
    var password = req.body.password || "";
    var country_code = req.body.country_code || "";
    var phone = req.body.phone;
    var primaryMobile = req.body.primaryMobile;
    var secondaryMobile = req.body.secondaryMobile;
    var address = req.body.address; // separated with #
    var areaId = req.body.areaId; //separated with #
    var add_area = req.body.add_areadId||"";
    var remove_area = req.body.remove_areaId||"";
    let businessName=req.body.businessName || "";
    let websiteUrl=req.body.websiteUrl || ""
    let iso=req.body.iso;
    var latitude = req.body.latitude!=undefined && req.body.latitude!=''?req.body.latitude:0;
    var longitude = req.body.longitude!=undefined && req.body.longitude!=''?req.body.longitude:0;
    var delivery_radius = req.body.delivery_radius!=undefined && req.body.delivery_radius!=''?req.body.delivery_radius:0;
    var is_area_restricted = req.body.is_area_restricted!=undefined?req.body.is_area_restricted:0;
    var delivery_type = req.body.delivery_type!=undefined?req.body.delivery_type:0;
    console.log(req.body);
    var values = [accessToken, sectionId, supplierId, name, branchName, languageId, email, phone, primaryMobile, secondaryMobile, address]
    var branchId;
    var logo_path=''
    async.waterfall([
            function (cb) {
                func.checkBlank(res, values, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                adminId = id;
                func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
            function (cb) {
                if (req.body.supplierBranchId) {
                    cb(null);
                }
                else {
                    supplierProfile.checkForSupplierBranchEmail(req.dbName,res, email, cb);
                }
            },
           
            async function (cb) {
                name = name.split("#");
                languageId = languageId.split("#");
                branchName = branchName.split("#");
                address = address.split("#");
                var entered_pwd=password;
                if(req.body.supplierBranchId)
                {
                    let isHeadData = await Execute.Query(req.dbName,"select supplier_id,is_head_branch from supplier_branch where id=? and is_head_branch=?",[req.body.supplierBranchId,1]);
                    // delivery_radius
                    if(isHeadData && isHeadData.length>0){
                        await Execute.Query(req.dbName,`update supplier set delivery_radius=? where id=?`,[delivery_radius,isHeadData[0].supplier_id])
                    }
                    password = md5(password);
                    supplierProfile.updateSupplierBranch(req.dbName,res, name[0], supplierId,
                         branchName[0], email, password, phone, primaryMobile, secondaryMobile, address[0], 
                         req.body.supplierBranchId, 0,latitude,longitude,delivery_radius,is_area_restricted,
                         delivery_type,entered_pwd, cb,country_code,businessName,websiteUrl,iso);

                }
                else{
                    password = md5(password);
                    supplierProfile.updateSupplierBranch(req.dbName,res, name[0], supplierId, branchName[0],
                         email, password, phone, primaryMobile, secondaryMobile, address[0],"", 0,latitude,longitude,delivery_radius,is_area_restricted,delivery_type,entered_pwd, cb,country_code,businessName,websiteUrl,iso);
                }
            },
            function (branchId1, cb) {
                branchId = branchId1;
                if(req.body.multiLanguageId)
                {
                    supplierProfile.updateBranchInMultiLanguage(req.dbName,res, name, languageId, branchName, address, req.body.multiLanguageId, branchId, cb);
                }
                else{
                    supplierProfile.updateBranchInMultiLanguage(req.dbName,res, name, languageId, branchName, address, "", branchId, cb);
                }

            },      
            async function (cb) {
                if (req.files.logo) {
                    let result = await uploadMgr.uploadImageFileToS3BucketNew(req.files.logo)
                    logo_path = result;
                    cb(null);
                } else {
                    cb(null);
                }
            },
            async function (cb) {
                if (req.files.logo) {
                    var sql = "update supplier_branch set logo=? where id=? "
                    multiConnection[req.dbName].query(sql, [logo_path, branchId], function (err, result) {
                        if (err) {
                            cb(err);
                        } else {
                            cb(null);
                        }
                    })
                } else {
                    cb(null);
                }
            },
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var data = [];
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );
}


exports.listUnassignedAreas = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var supplierId = req.body.supplierId;
    var values = [accessToken, sectionId, supplierId];
    async.waterfall([
            function (cb) {
                func.checkBlank(res, values, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
            function (cb) {
                supplierProfile.listAreasOfSupplier(req.dbName,res, supplierId, cb);
            }
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }

        }
    );

}


exports.listCountryIds = function(req,res)
{
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var values = [accessToken, sectionId];
    async.waterfall([
            function (cb) {
                func.checkBlank(res, values, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
            function (cb) {
                supplierProfile.listCountryWithNamesAndId(req.dbName,res,cb);
            }
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }

        }
    );
}


exports.listAreaIds = function(req,res)
{
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var zoneId =  req.body.zoneId;
    var values = [accessToken, sectionId,zoneId];
    async.waterfall([
            function (cb) {
                func.checkBlank(res, values, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
            function (cb) {
                supplierProfile.getAreaByZoneId(req.dbName,res,cb,zoneId);
            }
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }

        }
    );
}


exports.addSupplierDeliveryAreas = function (req, res) {
    logger.debug("=======================second one==========================")
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var supplierId = req.body.supplierId;
    var deliveryAreaIds = req.body.deliveryAreaIds;
    var values = [accessToken, sectionId, supplierId, deliveryAreaIds];
    console.log(req.body);
    async.waterfall([
            function (cb) {
                func.checkBlank(res, values, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
            function (cb) {
              supplierProfile.insertDeliveryAreas(req.dbName,res,cb,deliveryAreaIds,supplierId);
            },
            function (cb) {
                supplierProfile.makeHeadBranch(req.dbName,res, supplierId,deliveryAreaIds, cb);
            }
        ], function (error, result) {

            if (error) {
                logger.debug("===================addSupplierDeliveryAreas===========end-========");
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var data = [];
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }

        }
    );
};


exports.removeSupplierDeliveryAreas = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var id = req.body.id;
    var values = [accessToken, sectionId, id];
    console.log("kbdf",req.body);
    async.waterfall([
            function (cb) {
                func.checkBlank(res, values, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
            function (cb) {
                supplierProfile.removeDeliveryAreas(req.dbName,res, id, cb);
            },
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var data = [];
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }

        }
    );

}


/*
 * ------------------------------------------------------
 * Get tab 3 information of supplier profile(description, uniqueness, terms and conditions)
 * Output: supplier tab 3 information
 * ------------------------------------------------------
 */
exports.getRegSupplierInfoTab3 = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var supplierId = req.body.supplierId;
    var values = [accessToken, sectionId, supplierId];
    async.waterfall([
            function (cb) {
                func.checkBlank(res, values, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
            function (cb) {
                supplierProfile.getSupplierDataTab3(req.dbName,supplierId, res, cb);
            }
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }


        }
    );

}


/*
 * ------------------------------------------------------
 * Save/Edit tab 3 information of supplier profile (description, uniqueness, terms and conditions)
 * Output: success/error
 * ------------------------------------------------------
 */
exports.saveSupplierInfoTab3 = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var supplierId = req.body.supplierId;
    var description = req.body.description;
    var uniqueness = req.body.uniqueness;
    var t_and_c = req.body.t_and_c;
    var languageId = req.body.languageId;
    var descriptionId =req.body.descriptionId;




    logger.debug("================req.body of saveSupplierInfoTab3===============",req.body)
    var values = [accessToken, sectionId, supplierId, description, uniqueness, t_and_c,languageId,descriptionId];
    logger.debug("values in the saveSupplierInfoTab3======================",values)
    async.waterfall([
            function (cb) {
                func.checkBlank(res, values, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                adminId = id;
                func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
            function (cb) {
              //  console.log(description);
                description = description.split("#");
                uniqueness = uniqueness.split("#");
                t_and_c = t_and_c.split("#");
                languageId = languageId.split("#");
                descriptionId = descriptionId.split("#");
                supplierProfile.saveSupplierDescription(req.dbName,res, supplierId, description[0], uniqueness[0], t_and_c[0], cb);
            },
            function(cb){
                supplierProfile.updateDescription(req.dbName,res,description,uniqueness,t_and_c,descriptionId,cb);
            }
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var data = [];
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );

}


exports.listSupplierAdmins = function(req,res)
{
    var accessToken = req.query.accessToken;
    // var sectionId = req.query.sectionId;
    var supplierId = req.query.supplierId;
    let limit  = req.query.limit==undefined?100:req.query.limit;
    let offset = req.query.offset==undefined?0:req.query.offset;
    let search = req.query.search==undefined?"":req.query.search;
    var values = [accessToken, supplierId];
    async.waterfall([
            function (cb) {
                func.checkBlank(res, values, cb);
            },
            // function (cb) {
            //     func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            // },
            // function (id, cb) {
            //     func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            // },
            function (cb) {
                listSupplierSubAdmins(req.dbName,res,supplierId,limit,offset,search,cb);
            }
        ], function (error, result) {

            if (error) {
                logger.debug(error)
                sendResponse.somethingWentWrongError(res);
            }
            else {
                sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }

        }
    );


}


exports.makeSupplierAdminActiveOrInActive = function (req, res) {
    var accessToken = req.body.accessToken;
    var status = req.body.status;
    var sectionId = req.body.sectionId;
    var subAdminId = req.body.subAdminId;
    var adminId;
    var manValue = [accessToken,status,subAdminId];
    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValue, cb);
        },
        // function (cb) {
        //     func.authenticateAccessToken(req.dbName,accessToken, res, cb);
        // },
        // function (id, cb) {
        //     adminId = id;
        //     func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
        // },
        // function (cb) {
        //     checkSupplierAdminRegOrNotById(req.dbName,res, subAdminId, cb);
        // },
        // function (cb) {
        //     checkSupplierAdminAuthority(req.dbName,res,subAdminId, cb);
        // },
        function(cb){
            makeSubAdminActiveOrNotActive(req.dbName,res,status,subAdminId,cb);
        }
    ], function (error, response) {
        if (error) {
            sendResponse.somethingWentWrongError();
        } else {
            var data = {};
            data.subAdminId = subAdminId;
            if (status == '0') {
                sendResponse.sendSuccessData({data}, constant.responseMessage.ADMIN_DEACTIVATED, res, constant.responseStatus.SUCCESS);
            } else {
                sendResponse.sendSuccessData(data, constant.responseMessage.ADMIN_ACTIVATED, res, constant.responseStatus.SUCCESS);
            }

        }
    })
}


exports.addSupplierSubAdmin = function(req,res)
{
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var email = req.body.email;
    var password = req.body.password;
    var phoneNumber = req.body.phoneNumber;
    var supplierId = req.body.supplierId;
    var manValue = [email, password, phoneNumber,accessToken,sectionId,supplierId];
    var adminId;
    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValue, cb);
        },
        function (cb) {
            if (validator.validate(email)) {
                cb(null);
            } else {
                sendResponse.sendErrorMessage(constant.responseMessage.INVALID_EMAIL, res, constant.responseStatus.INVALID_EMAIL);
            }
        },
        function (cb) {
            func.authenticateAccessToken(req.dbName,accessToken, res, cb);
        },
        function (adminId1, cb) {
            adminId = adminId1;
            func.checkforAuthorityofThisAdmin(req.dbName,adminId,sectionId, res, cb);
        },
        function (cb) {
            checkSupplierAdminEmailAvailability(req.dbName,res, email, cb);
        },
        function (cb) {
            createSupplierSubAdmin(req.dbName,res, email, password, phoneNumber,supplierId,adminId,cb);
        }

    ], function (err, response) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        } else {
            var data = {};
            data.isActive = 0;
            sendResponse.sendSuccessData(data, constant.responseMessage.ADMIN_ADDED, res, constant.responseStatus.SUCCESS);
        }

    })

}


exports.assignOrRevokeSupplierSection = function (req, res) {
    var accessToken = req.body.accessToken;
    var subAdminId = req.body.subAdminId;
    var sectionId = req.body.sectionId;
    var assignSectionIds = req.body.assignSectionIds;
    var revokeSectionIds = req.body.revokeSectionIds;
    var superAdminId;
    var manValue = [subAdminId,accessToken,sectionId];
  //  console.log(req.body);
    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValue, cb);
        },
        function (cb) {
            func.authenticateAccessToken(req.dbName,accessToken, res, cb);
        },
        function (superId, cb) {
            superAdminId = superId;
            func.checkforAuthorityofThisAdmin(req.dbName,superId,sectionId, res, cb);
        },
        function (cb) {
            checkSupplierAdminRegOrNotById(req.dbName,res, subAdminId, cb);
        },
        function (cb) {
            var ids = assignSectionIds.trim().split(",");
            if (ids.length && assignSectionIds != '') {
                assignSupplierSections(req.dbName,subAdminId,superAdminId, ids, res, cb);
            } else {
                cb(null);
            }

        },
        function (cb) {
            var revokeIds = revokeSectionIds.trim().split(",");
            if (revokeIds.length && revokeSectionIds != '' && revokeSectionIds != '0') {
                revokeSupplierSection(req.dbName,subAdminId, revokeIds, res, cb);
            } else {
                cb(null);
            }
        }
    ], function (error, response) {
        if (error) {

            sendResponse.somethingWentWrongError(res);
        } else {
            var data = {};
            sendResponse.sendSuccessData(data, constant.responseMessage.SECTION_UPDATED, res, constant.responseStatus.SUCCESS);
        }
    })
}



exports.getSupplierSubAdminDataById = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var subAdminId = req.body.subAdminId;
    var manValue = [accessToken,sectionId, subAdminId];
    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValue, cb);
        },
        function (cb) {
            func.authenticateAccessToken(req.dbName,accessToken, res, cb);
        },
        function (superId, cb) {
            func.checkforAuthorityofThisAdmin(req.dbName,superId,sectionId, res, cb);
        },
        function (cb) {
            checkSupplierAdminRegOrNotById(req.dbName,res, subAdminId, cb);
        },
        function (cb) {
            //console.log("===============getSingleAdminData============");
            getSingleSupplierSUbAdminDataForSuperAdmin(req.dbName,res, subAdminId, cb);
        }
    ], function (error, response) {
        if (error) {
            sendResponse.somethingWentWrongError(res);
        } else {
            sendResponse.sendSuccessData(response, constant.responseMessage.ADMIN_DATA, res, constant.responseStatus.SUCCESS);
        }
    })

}



function getSingleSupplierSUbAdminDataForSuperAdmin(dbName,res,subAdminId, callback) {
    var result1;
    var result2;
    var check;

    async.waterfall([
        function (cb) {
            async.parallel([
                function (cb1) {
                    var sql ="select ad.id,ad.email,ad.is_active,adma.supplier_section_id section_id,adms.section_name sections_name, ";
                    sql +=" adms.section_category_id,admscat.section_category_name from supplier_admin ad join supplier_authority adma ";
                    sql += " on ad.id = adma.supplier_admin_id join supplier_sections adms on adma.supplier_section_id=adms.id join ";
                    sql +=" supplier_section_category admscat on adms.section_category_id=admscat.id where ad.id = ?"
                    multiConnection[dbName].query(sql, [subAdminId], function (err, reply) {
                        if (err) {
                            sendResponse.somethingWentWrongError(res);
                        } else if (reply.length) {
                            result1 = reply;
                            check = 1;
                            cb1(null);
                        } else {
                            var sql = "select id,email,is_active from supplier_admin where id  = ? ";
                            multiConnection[dbName].query(sql, [subAdminId], function (err2, reply2) {
                                if (err2) {
                                    sendResponse.somethingWentWrongError(res);
                                } else {
                                    result1 = reply2;
                                    check = 0;
                                    cb1(null);
                                }
                            })
                        }
                    })
                },
                function (cb1) {
                    var sql = "select ad.id,ad.section_name sections_name,ad.section_category_id,adsc.section_category_name ";
                    sql +=" from supplier_sections ad join supplier_section_category adsc on ad.section_category_id = adsc.id ";
                    multiConnection[dbName].query(sql,function (sqlErr, sqlReply) {
                        if (sqlErr) {
                            sendResponse.somethingWentWrongError(res);
                        } else {
                            result2 = sqlReply;
                            cb1(null);
                        }
                    })
                }
            ], function (error, response) {
                cb(null);
            })
        },
        function (cb) {
            var data = [];
            var home = [];
            var profile = [];
            var production = [];
            var orders = [];
            var account = [];
            var reports = [];
            var settings = [];

            if (check == 1) {
                var count = 0;
                for (var i = 0; i < 6; i++) {
                    (function (i) {
                        switch (i) {
                            case 0 :
                                for (var j = 0; j < 10; j++) {
                                    (function (j) {
                                        var length1 = result1.length;
                                        var assignedCheck = false;
                                        for (var k = 0; k < length1; k++) {
                                            (function (k) {
                                                var section = {};
                                                //console.log("value of k from second==="+k);
                                                if (result2[count].id == result1[k].section_id) {
                                                    section.section_name = result2[count].sections_name;
                                                    section.section_id = result2[count].id;
                                                    section.is_assigned = 1;
                                                    assignedCheck = true;
                                                    home.push(section);
                                                }


                                            }(k))
                                        }
                                        if (!(assignedCheck)) {
                                            var section = {};
                                            section.section_name = result2[count].sections_name;
                                            section.section_id = result2[count].id;
                                            section.is_assigned = 0;
                                            home.push(section);
                                        }

                                        count++;
                                        if (j == 9) {
                                            data[i] = {
                                                "category_id": 1,
                                                "category_name": "HOME",
                                                "category_data": home
                                            };
                                        }
                                    }(j))
                                }
                                break;
                            case 1 :
                                for (var j = 0; j < 5; j++) {
                                    (function (j) {

                                        var length1 = result1.length;

                                        var assignedCheck = false;
                                        for (var k = 0; k < length1; k++) {
                                            (function (k) {
                                                var section = {};
                                                //console.log("value of k from second==="+k);
                                                if (result2[count].id == result1[k].section_id) {
                                                    section.section_name = result2[count].sections_name;
                                                    section.section_id = result2[count].id;
                                                    section.is_assigned = 1;
                                                    assignedCheck = true;
                                                    profile.push(section);
                                                }


                                            }(k))
                                        }
                                        if (!(assignedCheck)) {
                                            var section = {};
                                            section.section_name = result2[count].sections_name;
                                            section.section_id = result2[count].id;
                                            section.is_assigned = 0;
                                            profile.push(section);
                                        }

                                        count++;
                                        if (j == 4) {
                                            data[i] = {
                                                "category_id": 2,
                                                "category_name": "PROFILE",
                                                "category_data": profile
                                            };
                                        }
                                    }(j))
                                }
                                break;
                            case 2 :
                                for (var j = 0; j < 4; j++) {
                                    (function (j) {

                                        var length1 = result1.length;

                                        var assignedCheck = false;
                                        for (var k = 0; k < length1; k++) {
                                            (function (k) {
                                                var section = {};
                                                //console.log("value of k from second==="+k);
                                                if (result2[count].id == result1[k].section_id) {
                                                    section.section_name = result2[count].sections_name;
                                                    section.section_id = result2[count].id;
                                                    section.is_assigned = 1;
                                                    assignedCheck = true;
                                                    production.push(section);
                                                }


                                            }(k))
                                        }
                                        if (!(assignedCheck)) {
                                            var section = {};
                                            section.section_name = result2[count].sections_name;
                                            section.section_id = result2[count].id;
                                            section.is_assigned = 0;
                                            production.push(section);
                                        }

                                        count++;
                                        if (j == 3) {
                                            data[i] = {
                                                "category_id": 3,
                                                "category_name": "PRODUCTION",
                                                "category_data": production
                                            };
                                        }
                                    }(j))
                                }
                                break;
                            case 3 :
                                for (var j = 0; j < 3; j++) {
                                    (function (j) {

                                        var length1 = result1.length;

                                        var assignedCheck = false;
                                        for (var k = 0; k < length1; k++) {
                                            (function (k) {
                                                var section = {};
                                                //console.log("value of k from second==="+k);
                                                if (result2[count].id == result1[k].section_id) {
                                                    section.section_name = result2[count].sections_name;
                                                    section.section_id = result2[count].id;
                                                    section.is_assigned = 1;
                                                    assignedCheck = true;
                                                    orders.push(section);
                                                }


                                            }(k))
                                        }
                                        if (!(assignedCheck)) {
                                            var section = {};
                                            section.section_name = result2[count].sections_name;
                                            section.section_id = result2[count].id;
                                            section.is_assigned = 0;
                                            orders.push(section);
                                        }

                                        count++;
                                        if (j == 2) {
                                            data[i] = {
                                                "category_id": 4,
                                                "category_name": "ORDERS",
                                                "category_data": orders
                                            };
                                        }
                                    }(j))
                                }
                                break;
                            case 4 :
                                for (var j = 0; j < 4; j++) {
                                    (function (j) {

                                        var length1 = result1.length;

                                        var assignedCheck = false;
                                        for (var k = 0; k < length1; k++) {
                                            (function (k) {
                                                var section = {};
                                                //console.log("value of k from second==="+k);
                                                if (result2[count].id == result1[k].section_id) {
                                                    section.section_name = result2[count].sections_name;
                                                    section.section_id = result2[count].id;
                                                    section.is_assigned = 1;
                                                    assignedCheck = true;
                                                    account.push(section);
                                                }


                                            }(k))
                                        }
                                        if (!(assignedCheck)) {
                                            var section = {};
                                            section.section_name = result2[count].sections_name;
                                            section.section_id = result2[count].id;
                                            section.is_assigned = 0;
                                            account.push(section);
                                        }

                                        count++;
                                        if (j == 3) {
                                            data[i] = {
                                                "category_id": 5,
                                                "category_name": "ACCOUNT",
                                                "category_data": account
                                            };
                                        }
                                    }(j))
                                }
                                break;
                            case 5 :
                                for (var j = 0; j < 6; j++) {
                                    (function (j) {

                                        var length1 = result1.length;

                                        var assignedCheck = false;
                                        for (var k = 0; k < length1; k++) {
                                            (function (k) {
                                                var section = {};
                                                //console.log("value of k from second==="+k);
                                                if (result2[count].id == result1[k].section_id) {
                                                    section.section_name = result2[count].sections_name;
                                                    section.section_id = result2[count].id;
                                                    section.is_assigned = 1;
                                                    assignedCheck = true;
                                                    reports.push(section);
                                                }


                                            }(k))
                                        }
                                        if (!(assignedCheck)) {
                                            var section = {};
                                            section.section_name = result2[count].sections_name;
                                            section.section_id = result2[count].id;
                                            section.is_assigned = 0;
                                            reports.push(section);
                                        }

                                        count++;
                                        if (j == 0) {
                                            data[i] = {
                                                "category_id": 6,
                                                "category_name": "REPORTS",
                                                "category_data": reports
                                            };
                                        }
                                    }(j))
                                }
                                break;

                            default :
                                break;
                        }
                        if (i == 5) {
                            cb(null, data);
                        }
                    }(i))
                }

            } else {
                var count = 0;
                for (var i = 0; i < 6; i++) {
                    (function (i) {
                        switch (i) {
                            case 0 :
                                for (var j = 0; j < 10; j++) {
                                    (function (j) {
                                        var section = {};
                                        section.section_name = result2[count].sections_name;
                                        section.section_id = result2[count].id;
                                        section.is_assigned = 0;
                                        home.push(section);
                                        count++;
                                        if (j == 9) {
                                            data[i] = {
                                                "category_id": 1,
                                                "category_name": "HOME",
                                                "category_data": home
                                            };
                                        }
                                    }(j))
                                }
                                break;
                            case 1 :
                                for (var j = 0; j < 5; j++) {
                                    (function (j) {
                                        var section = {};
                                        section.section_name = result2[count].sections_name;
                                        section.section_id = result2[count].id;
                                        section.is_assigned = 0;
                                        profile.push(section);
                                        count++;
                                        if (j == 4) {
                                            data[i] = {
                                                "category_id": 2,
                                                "category_name": "PROFILE",
                                                "category_data": profile
                                            };
                                        }
                                    }(j))
                                }
                                break;
                            case 2 :
                                for (var j = 0; j < 4; j++) {
                                    (function (j) {
                                        var section = {};
                                        section.section_name = result2[count].sections_name;
                                        section.section_id = result2[count].id;
                                        section.is_assigned = 0;
                                        production.push(section);
                                        count++;
                                        if (j == 3) {
                                            data[i] = {
                                                "category_id": 3,
                                                "category_name": "PRODUCTION",
                                                "category_data": production
                                            };
                                        }
                                    }(j))
                                }
                                break;
                            case 3 :
                                for (var j = 0; j < 3; j++) {
                                    (function (j) {


                                        var section = {};
                                        section.section_name = result2[count].sections_name;
                                        section.section_id = result2[count].id;
                                        section.is_assigned = 0;
                                        orders.push(section);

                                        count++;
                                        if (j == 2) {
                                            data[i] = {
                                                "category_id": 4,
                                                "category_name": "ORDERS",
                                                "category_data": orders
                                            };
                                        }
                                    }(j))
                                }
                                break;
                            case 4 :
                                for (var j = 0; j < 4; j++) {
                                    (function (j) {


                                        var section = {};
                                        section.section_name = result2[count].sections_name;
                                        section.section_id = result2[count].id;
                                        section.is_assigned = 0;
                                        account.push(section);
                                        count++;
                                        if (j == 3) {
                                            data[i] = {
                                                "category_id": 5,
                                                "category_name": "ACCOUNT",
                                                "category_data": account
                                            };
                                        }
                                    }(j))
                                }
                                break;
                            case 5 :
                                for (var j = 0; j < 6; j++) {
                                    (function (j) {

                                        var section = {};
                                        section.section_name = result2[count].sections_name;
                                        section.section_id = result2[count].id;
                                        section.is_assigned = 0;
                                        reports.push(section);

                                        count++;
                                        if (j == 0) {
                                            data[i] = {
                                                "category_id": 6,
                                                "category_name": "REPORTS",
                                                "category_data": reports
                                            };
                                        }
                                    }(j))
                                }
                                break;
                            default :
                                break;
                        }
                        if (i == 5) {
                            cb(null, data);
                        }
                    }(i))
                }
            }
        }
    ], function (err1, response1) {
        if (err1) {
            sendResponse.somethingWentWrongError(res);
        } else {
            callback(null, response1);
        }

    })

}


function assignSupplierSections(dbName,adminId, createdById, sectionIds, res, callback) {

    var idLength = sectionIds.length;

    async.waterfall([
        /*
         *---------------------------------------------------------------------------------------------------------------------
         * Here(for this waterfall model) callback will be cb.
         * If we are using callback(main callback of assignSectionsToAdmin function ) from final function of this waterfall,
         * it will take to the last function.
         *---------------------------------------------------------------------------------------------------------------------
         */
        function (cb) {
            var sql = "select supplier_section_id from supplier_authority where supplier_admin_id = ? ";
            multiConnection[dbName].query(sql, [adminId], function (err1, reply1) {
                if (err1) {
                    //console.log("from select section_id");
                    sendResponse.somethingWentWrongError(res);
                } else if (reply1.length) {
                    var result = new Array();
                    var replyLength = reply1.length;
                    for (var i = 0; i < replyLength; i++) {
                        (function (i) {

                            result.push(reply1[i].supplier_section_id);
                            if (i == replyLength - 1) {
                               // console.log("================before getDifference==============");
                                // result = result.split(",");
                                getDifference(sectionIds, result, cb);

                            }

                        }(i))


                    }


                } else {
                    cb(null, sectionIds);
                }
            })
        },
        function (ids, cb) {

      //      console.log("ids to be insert" + ids);

            var values = new Array();
            var insertLength = "(?,?,?,?),";
            var querystring = '';

            async.waterfall([
                /*
                 *--------------------------------------------------------------------------------------------
                 * Here callback will be cb1
                 * Using cb1 we can tranfer control to next in this waterfall model
                 * If we are using cb in this model,it will call to next function of previous waterfall model
                 * If we are using callback in this model , it will go back to the assignSection function.
                 * --------------------------------------------------------------------------------------------
                 */
                function (cb1) {
                    var idLength = ids.length;
              //      console.log(idLength);

                    if (idLength) {
                        for (var i = 0; i < idLength; i++) {
                            (function (i) {

                                values.push(ids[i], adminId, createdById,0);
                                querystring = querystring + insertLength;

                                if (i == idLength - 1) {

                                    querystring = querystring.substring(0, querystring.length - 1);
                                    cb1(null);

                                }

                            }(i))
                        }
                    }
                    else {
                        callback(null);
                    }

                },
                function (cb1) {
                 //   console.log(querystring + "--------------")
                    var sql = "insert into supplier_authority(supplier_section_id,supplier_admin_id,created_by_id,created_by) values " + querystring;
                //    console.log("values============" + values);
                    multiConnection[dbName].query(sql, values, function (err, reply) {
                        if (err) {
                            console.log(err + "error")
                            //console.log("from insert");
                            sendResponse.somethingWentWrongError(res);
                        } else {
                            cb1(null);
                        }
                    })
                }
            ], function (err2, response2) {
                if (err2) {
                    //console.log("from insert final");
                    sendResponse.somethingWentWrongError(res);
                } else {
                    cb(null)
                }
            })


        }
    ], function (error, response) {
        if (error) {
            //console.log("from assignSectionsToAdmin final");
            sendResponse.somethingWentWrongError(res);
        } else {
            callback(null);
        }
    })


}

function getDifference(myArray, toRemove, callback1) {
 //   console.log("myarray" + myArray);
  //  console.log("toremove" + toRemove);
    var result = [];
    for (var j = 0; j < myArray.length; j++) {
        (function (j) {
            if (toRemove.indexOf(parseInt(myArray[j])) === -1) {
                //console.log(toRemove.indexOf(myArray[j]))
                result.push(myArray[j]);
            }
            if (j == myArray.length - 1) {
              //  console.log("result" + result);

                callback1(null, result);
            }
        }(j))
    }
}

function revokeSupplierSection(dbName,adminId, revokeIds, res, callback) {

    async.waterfall([
        function (cbr) {
            var sql = "delete from supplier_authority where supplier_admin_id = ? and supplier_section_id in (" + revokeIds + ") ";
            multiConnection[dbName].query(sql, [adminId], function (err, reply) {
                if (err) {
                    console.log("err" + err);
                } else {
                    cbr(null);
                }
            })
        }
    ], function (error, response) {
        if (error) {
            sendResponse.somethingWentWrongError(res);
        } else {
            callback(null);
        }
    })

}

function  createSupplierSubAdmin(dbName,res, email, password, phoneNumber,supplierId,adminId,callback)
{
    var sql = "insert into supplier_admin(email,password,phone_number,access_token,supplier_id,created_by_clikat) values(?,?,?,?,?,?)";
    var accessToken = func.encrypt(email + new Date());
    async.waterfall([
        function (cb) {
            cb(null,md5(password));
        },
        function (cryptedPass, cb) {
            multiConnection[dbName].query(sql, [email, cryptedPass, phoneNumber, accessToken,supplierId,adminId], function (err1, reply1) {
                if (err1) {
                    sendResponse.somethingWentWrongError(res);
                } else {
                    cb(null, reply1.insertId);
                }
            })
        }
    ], function (err, response) {
        if(err){
            sendResponse.somethingWentWrongError(res);
        }
        else{
            callback(null);
        }

    })

}

function  checkSupplierAdminEmailAvailability(dbName,res, email, callback)
{
    var sql = "select id from supplier_admin where email = ? limit 1"
    multiConnection[dbName].query(sql,[email],function(err,result)
    {
        if(err){
            sendResponse.somethingWentWrongError(res);
        }
        else{
            if(result.length){
                sendResponse.sendErrorMessage(constant.responseMessage.EMAIL_EXISTS, res, constant.responseStatus.SOME_ERROR);
            }
            else{
                callback(null);
            }

        }

    })
}

function makeSubAdminActiveOrNotActive(dbName,res,status,subAdminId,callback)
{
    var sql = "update supplier_admin set is_active = ? where id = ? limit 1";
    multiConnection[dbName].query(sql,[status,subAdminId],function(err,result)
    {
        if(err){
            sendResponse.somethingWentWrongError(res);
        }
        else{
            callback(null);
        }

    })

}

function checkSupplierAdminAuthority(dbName,res,subAdminId, callback)
{
    var sql = "select id from supplier_authority where supplier_admin_id = ? "
    multiConnection[dbName].query(sql,[subAdminId],function(err,result)
    {
        if(err){
            sendResponse.somethingWentWrongError(res);
        }
        else{
            if(result.length){
                callback(null);
            }
            else{
                sendResponse.sendErrorMessage(constant.responseMessage.NO_SECTION_ASSIGNED, res, constant.responseStatus.SOME_ERROR);
            }
        }

    })

}

function  checkSupplierAdminRegOrNotById(dbName,res, subAdminId, callback)
{
    var sql = " select id from supplier_admin where id = ? limit 1"
    multiConnection[dbName].query(sql,[subAdminId],function(err,result)
    {
        if(err){
            sendResponse.somethingWentWrongError(res);
        }
        else{
            if(result.length){
                callback(null)
            }
            else{
                sendResponse.sendErrorMessage(constant.responseMessage.NOT_REG, res, constant.responseStatus.NOT_REG);
            }
        }

    })


}

function listSupplierSubAdmins(dbName,res,supplierId,limit,offset,search,callback)
{
    limit = parseInt(limit);
    offset = parseInt(offset)
    var sql = "select id,email,is_active from supplier_admin where is_superadmin = ? and supplier_id = ? limit ?,?"
    multiConnection[dbName].query(sql,[0,supplierId,offset,limit],async function(err,result)
    {
        if(err){
            logger.debug("===",err)
            sendResponse.somethingWentWrongError(res);
        }
        else{
            var sql2 = "select id,email,is_active from supplier_admin where is_superadmin = ? and supplier_id = ? "
            let params = [0,supplierId]
            let result_count = await Execute.Query(dbName,sql2,params);
            let final = {
                list:result,
                count:result_count && result_count.length>0?result_count.length:0
            }
            callback(null,final);
        }

    })
}


exports.updateDescription=function  (dbName,res,description,uniqueness,t_and_c,descriptionId,callback)
{
    var descriptionLength = descriptionId.length;
    for( var  i = 0 ; i< descriptionLength ; i++)
    {
        (function(i)
        {
            var sql = "update supplier_ml set description = ? , uniqueness = ? ,terms_and_conditions = ? where id = ? limit 1"
            multiConnection[dbName].query(sql,[description[i],uniqueness[i],t_and_c[i],descriptionId[i]],function(err,result)
            {
              //  console.log("updated");
                console.log(err);
                if(i == descriptionLength - 1)
                {
                    //console.log("updated");
                    callback(null);
                }


            })

        }(i))

    }

}

exports.listAreasOfSupplier=function (dbName,res, supplierId, callback) {
    var sql ="select s.area_id,a.name from supplier_delivery_areas s join area a on a.id = s.area_id ";
    sql +=" where s.is_deleted = 0 and s.supplier_id = ? and s.area_id NOT IN(select sb.area_id from ";
    sql +=" supplier_branch_delivery_areas sb where sb.is_deleted = 0 and sb.supplier_branch_id ";
    sql +=" IN(select id from supplier_branch where supplier_id = ? and is_deleted = 0))";
    multiConnection[dbName].query(sql, [supplierId,supplierId], function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null, result);
        }

    })

};


exports.listCountryWithNamesAndId=function (dbName,res, callback) {
    var sql = "select id,name from country where is_deleted =? and is_live = ?"
    multiConnection[dbName].query(sql, [0, 1], function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        } else {
            callback(null, result);
        }

    });

};


exports.getAreaByZoneId=function (dbName,res, callback, zoneId) {
    var sql = "select id,name from area where zone_id = ? and is_deleted = ? and is_live = ?";
    multiConnection[dbName].query(sql, [zoneId, 0,1], function(err, reply) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        } else {
            callback(null, reply);
        }
    })
};


exports.removeDeliveryAreas=function (dbName,res, id, callback) {
    var sql = "select supplier_id,area_id from supplier_delivery_areas where id = ? limit 1"
    multiConnection[dbName].query(sql, [id], function (err, result) {
        if (err) {
            console.log("1---", err)
            sendResponse.somethingWentWrongError(res);
        }
        else {
            var sql1 = "select id from supplier_branch where supplier_id = ? and is_deleted =0 limit 1";
            multiConnection[dbName].query(sql1, [result[0].supplier_id], function (err, result2) {
                if (err) {
                    console.log("2---", err);
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    var x = [];
                    for (var i = 0; i < result2.length; i++) {
                        x.push(result2[i].id);
                    }
                    console.log("x1",x);
                    x=x.toString();
                    console.log("x2",x);
                    var sql3 = "update supplier_branch_delivery_areas set is_deleted = ? where supplier_branch_id IN (" + x + ") and area_id = ?";
                    multiConnection[dbName].query(sql3, [1, result[0].area_id], function (err, result3) {
                        if (err) {
                            console.log("3---", err)
                            sendResponse.somethingWentWrongError(res);
                        }
                        else {
                            var sql2 = "update supplier_branch_area_product set is_deleted = ? where supplier_branch_id IN (" + x + ") and area_id = ?";
                            multiConnection[dbName].query(sql2,[1,result[0].area_id],function(err,response)
                            {
                                if (err) {
                                console.log("4---", err)
                                sendResponse.somethingWentWrongError(res);
                            }
                                else{
                                    var sql4 = "update supplier_delivery_areas set is_deleted = ? where id = ? limit 1"
                                    multiConnection[dbName].query(sql4, [1, id], function (err, result4) {
                                        if (err) {
                                            console.log("5---", err)
                                            sendResponse.somethingWentWrongError(res)
                                        }
                                        else {
                                            callback(null);
                                        }

                                    })
                                }

                            })

                        }

                    })
                }

            })
        }

    })

}


function updateCategories(res, supplierId, categoryString, callback) {
    categoryString = categoryString.split("#");
    var detailedSub = categoryString[2].split("@");
    for (var i = 0; i < detailedSub.length; i++) {
        (function (i) {
            var sql = "select id from supplier_category where supplier_id = ? and category_id = ? and sub_category_id = ? and detailed_sub_category_id = ? limit 1"
            multiConnection[dbName].query(sql, [supplierId, categoryString[0], categoryString[1], detailedSub[i]], function (err, resultCheck) {
                if (resultCheck.length) {
                    //console.log("already added");
                    if (i == detailedSub.length - 1) {
                        callback(null);
                    }
                }
                else {
                    var sql2 = "insert into supplier_category(supplier_id,category_id,sub_category_id,detailed_sub_category_id) values(?,?,?,?)";
                    multiConnection[dbName].query(sql2, [supplierId, categoryString[0], categoryString[1], detailedSub[i]], function (err, resultInsert) {
                        console.log(err);
                        if (i == detailedSub.length - 1) {
                            callback(null);
                        }

                    })
                }

            })

        }(i))

    }

}


function addSupplierDeliveryAreas(res, supplierId, deliveryAreaIds, callback) {
    logger.debug("=======================third one==========================")
    var ids = deliveryAreaIds.split("#");
    var areaIds = ids[3].split("@");
    var idsLength = areaIds.length;
    for(var  i = 0 ; i < idsLength ; i ++)
    {
        (function(i)
        {
            var sql = "select id from supplier_delivery_areas where country_id = ? and city_id = ? and zone_id = ? and area_id = ? and supplier_id = ? and is_deleted = ? limit 1";
            multiConnection[dbName].query(sql,[ids[0],ids[1],ids[2],areaIds[i],supplierId,0],function(err,result)
            {
                console.log(err);
                if(result.length){
                    if(i == idsLength - 1)
                    {
                        callback(null);
                    }
                }
                else{
                    var sql2 = "insert into supplier_delivery_areas(supplier_id,country_id,city_id,zone_id,area_id,is_active) values (?,?,?,?,?,?)";
                    multiConnection[dbName].query(sql2,[supplierId,ids[0],ids[1],ids[2],areaIds[i],1], function (err, result) {

                        if(i ==  idsLength - 1)
                        {
                            callback(null);
                        }

                    })
                }

            })

        }(i))

    }
}


exports.makeHeadBranch=function (dbName,res, supplierId,deliveryAreaIds, callback) {
    var areaId = deliveryAreaIds.split("#");

    var sql = "select id from supplier_branch where supplier_id = ? and is_head_branch = ? and is_deleted = ? limit 1"
    multiConnection[dbName].query(sql, [supplierId, 1,0], function (err, branch) {
        if (err) {
            
            sendResponse.somethingWentWrongError(res);
        }
        else {
            if (branch.length) {
                callback(null);
            }
            else {
                insertSupplierInfoInHeadBranch(dbName,res, supplierId,areaId, callback);
            }
        }

    })

}


function insertSupplierInfoInHeadBranch(dbName,res, supplierId,areaId, callback) {

    var supplierData;
    var supplierCategory;
    var supplierBranchId;
    var supplierProduct;
    
    var newProduct = [];
    async.auto({
    /*    getSupplierData:function(cb){
            var sql = "select d.onOffComm,d.supplier_id,d.urgent_type,d.urgent_price,d.category_id,d.sub_category_id,d.urgent_type,d.urgent_price,d.detailed_sub_category_id,d.commission,d.commission_type,d.commission_package,c.name category_name,";
            sql += " sc.name sub_cat_name, dsc.name detailed_sub_cat_name from  supplier_category d left join categories c on ";
            sql += " d.category_id = c.id  left join categories sc on d.sub_category_id = sc.id left join categories dsc ";
            sql += " on d.detailed_sub_category_id = dsc.id where d.supplier_id = ? order by d.category_id,d.sub_category_id,d.detailed_sub_category_id ";

            multiConnection[dbName].query(sql, [supplierId], function (err, result) {
                if (err) {
                    console.log("err1",err);
                    sendResponse.somethingWentWrongError(res);
                }else{
                    supplierCategory = result;
                    cb(null);
                }
            })
        },*/
        supplierData:function(cb){
            var sql = "select sml.name,sml.language_id,sml.address,s.email,s.phone,s.mobile_number_1,s.mobile_number_2 from supplier s join supplier_ml sml on s.id = sml.supplier_id  where s.id = ?";
            var stmt = multiConnection[dbName].query(sql, [supplierId], function (err, result) {
                logger.debug("============stmt.sql in supplierData========================",stmt.sql,err)
                if (err) {
                    logger.debug("============errrr  in 1===========================",stmt.sql,err)

                    cb(err);
                }else{
                    // logger.debug("===================result==============",result)
                    if(result[1].language_id == 14){
                        result[0].englishName = result[1].name;
                        result[0].arabicName = result[0].name;
                        result[0].englishAddress = result[1].address;
                        result[0].arabicAddress = result[0].address;

                    }else{
                        result[0].englishName = result[0].name;
                        result[0].arabicName = result[1].name;
                        result[0].englishAddress = result[0].address;
                        result[0].arabicAddress = result[1].address;
                    }
                    supplierData = result[0];
                    cb(null);
                }
            });
        },
        Headbranch:['supplierData',function(cb){
            var sql = "insert into supplier_branch(supplier_id,branch_name,phone,mobile_1,email,is_head_branch) values (?,?,?,?,?,?)";
             var stat = multiConnection[dbName].query(sql, [supplierId,supplierData.englishName,supplierData.phone,supplierData.mobile_number_1,supplierData.email,1], function (err, result) {
                 if (err) {
                     logger.debug("===================head 1==========",stat.sql,err)
                    cb(err);
                }else{
                    supplierBranchId =  result.insertId;
                    cb(null);
                }
            })
        }],
        headBranchMl:['Headbranch',function(cb){
           var stat2 = insertDataSupplier(dbName,supplierBranchId,supplierData,supplierId,function(err,result){
                if(err){
                    logger.debug("===================head 2==========",stat2.sql)
                    cb(err);
                }else{
                    cb(null);
                }
            })
        }],
        getInsertArea:['Headbranch',function(cb){
            InsertAreaBranch(dbName,supplierBranchId,areaId,function(err,result){
                if(err){
                    logger.debug("============errrr  in 2===========================")
                    cb(err);
                }else{
                    cb(null);
                }
            })
        }],
        getSupplierProduct:function(cb){
            var sql='select category_id,sub_category_id,detailed_sub_category_id,product_id,delivery_charges,original_product_id from supplier_product where supplier_id = ? and is_deleted = 0';
            var statement = multiConnection[dbName].query(sql,[supplierId],function (err,result) {
                if(err){
                    logger.debug("======errrrr======statement in getSupplierProduct============",statement.sql);
                   cb(err);
                }
                else{
                    logger.debug("======errrrr===not in ===statement in getSupplierProduct============",statement.sql);

                    supplierProduct = result;
                    cb(null);
                }
            })
        },
        insertNewproduct:['getSupplierProduct',function(cb){
            var len = supplierProduct.length;
            if(len == 0){
                cb(null)
            }

            for(var i =0;i < len;i++){
                (function(i){
                    insertNewData(dbName,supplierProduct[i],function(err,result){
                        if(err){
                            logger.debug("================err in insertNewData===============",err)
                            cb(err);
                        }else{
                            supplierProduct[i].newProduct = result;
                           if(i == (len -1)){
                               logger.debug("============out of the loop============================",len,i)
                                cb(null);
                            }
                        }
                    })
                }(i));
            }
            logger.debug("==============end of the loop===================")
        }],
        insertBranchProduct:['insertNewproduct','Headbranch',function(cb){
            logger.debug("======================in the insert Branch product===============")
           console.log("...............insert branch product..........");
            var nameLength = supplierProduct.length;
            //  console.log(nameLength);
            var queryString = "(?,?,?,?,?,?,?),";
            var insertString = "";
            var values = [];
            
            if(nameLength == 0){
                cb(null);
            }
            
            
            for (var i = 0; i < nameLength; i++) {
                (function (i){
                    insertString = insertString + queryString;
                    console.log("........................supplierProduct[i]...............................",supplierProduct[i]);
                    values.push(supplierBranchId,supplierProduct[i].category_id, supplierProduct[i].sub_category_id, supplierProduct[i].detailed_sub_category_id, supplierProduct[i].newProduct, supplierProduct[i].delivery_charges, supplierProduct[i].original_product_id);
                    if (i == (nameLength - 1)){
                        
                        console.log(".......................values......................",values);
                        
                        insertString = insertString.substring(0, insertString.length - 1);
                        var sql = "insert into supplier_branch_product(supplier_branch_id,category_id,sub_category_id,detailed_sub_category_id,product_id,delivery_charges,original_product_id) values " + insertString;
                       var stat = multiConnection[dbName].query(sql, values, function (err, result) {
                             if (err) {
                                logger.debug("============errrr  in 4===========================",err,stat.sql)
                                cb(err);
                            }
                            else {
                                cb(null);
                            }
                        })
                    }
                }(i))
            }
        }],
    /*    insertSupplierBranchAreaProduct:['getSupplierProduct','Headbranch','insertNewproduct',function(cb){
            var productLength = supplierProduct.length;
            console.log("......",areaId);
            var areaLength = areaId.length;
            if(areaLength == 0){
                cb(null);
            }

            if(productLength == 0){
                cb(null);
            }

            for(var i =0;i<areaLength;i++){
                (function(i){
                    supplierBranchData(supplierProduct,areaId[i],supplierBranchId,function(err,result){
                        if(err){
                            cb(err);
                        }else{
                            if(i == (areaLength -1)){
                                cb(null);
                            }
                        }
                    })
                }(i));
            }
        }]*/
    },function(err,result){
        if(err){
            logger.debug("============errrr  in endd===========================")
            callback(err);
        }else{
            console.log("....bdfgb............................................final...");
            callback(null);
        }
    })

/*
    async.auto({
        one: function (cb) {
            getRegSupplierData(supplierId, res, cb);
        },
        two: function (cb) {
            getMultipleNamesOfSupplier(supplierId, res, cb);
        },
        three: function (cb) {
            getSupplierDeliveryAreas(res, supplierId, cb);
        },
        four: function (cb) {
            getSupplierProduct(res,supplierId,cb);
        },
    }, function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            replicateSupplierInHeadBranch(res, supplierId,areaId, result, callback);
        }
    })*/
}




function insertNewData(dbName,productId,callback){
    var newProductId;
    logger.debug("========in the function insertNewData ===============")
    async.auto({
        productEntry:function(cb){
            var sql = "insert into product( name,price_unit,bar_code,product_desc,measuring_unit,sku,category_id,sub_category_id," +
                "detailed_sub_category_id,commission_type,commission,commission_package,recurring_possible,scheduling_possible,is_package," +
                "is_live,is_deleted,is_global,added_by,created_by,approved_by_supplier,approved_by_admin,pricing_type)" +
                " select name,price_unit,bar_code,product_desc,measuring_unit,sku,category_id,sub_category_id," +
                "detailed_sub_category_id,commission_type,commission,commission_package,recurring_possible,scheduling_possible,is_package," +
                "is_live,is_deleted,0,added_by,created_by,approved_by_supplier,approved_by_admin,pricing_type from product where id = ? ";
            multiConnection[dbName].query(sql, [productId.product_id], function (err, result) {
                 
               // console.log("............product entry...................",err,result);
                if(err) {
                    logger.debug("========error in the 1 ===============")

                    cb(err)
                } else{
                    newProductId = result.insertId
                    cb(null);
                }
            })
        },
        PriceEntry:['productEntry',function(cb){
            var sql = "insert into product_pricing( start_date,end_date,offer_name,price,display_price,handling,handling_supplier," +
                "can_urgent,urgent_price,house_cleaning_price,beauty_saloon_price,commission,delivery_charges,is_deleted,price_type," +
                "commission_type,urgent_type,min_hour,max_hour,per_hour_price,urgent_value,pricing_type,product_id) " +
                "select  start_date,end_date,offer_name,price,display_price,handling,handling_supplier," +
                "can_urgent,urgent_price,house_cleaning_price,beauty_saloon_price,commission,delivery_charges,is_deleted,price_type, " +
                "commission_type,urgent_type,min_hour,max_hour,per_hour_price,urgent_value,pricing_type,'?' from product_pricing where product_id = ? ";
            multiConnection[dbName].query(sql, [newProductId,productId.product_id], function (err, result) {
               // console.log("............PriceEntry entry...................",err,result);

                if(err)
                {
                    logger.debug("========error in the 2 ===============")

                    cb(err);
                }
                else{
                   cb(null)
                }

            })

        }],
        ImageUpload:['productEntry',function(cb){
            var sql = "insert into product_image(image_path,product_id,imageOrder)" +
                " select image_path,'?',imageOrder from product_image where product_id = ? ";
            multiConnection[dbName].query(sql, [newProductId,productId.product_id], function (err, result) {
              //  console.log("............ImageUpload entry...................",err,result);

                if(err) {
                    logger.debug("========error in the 3===============")

                    cb(err);
                } else{
                  cb(null)
                }
            })
        }],
        productMl:['productEntry',function(cb){
            var sql = "insert into product_ml( language_id,name,product_desc,measuring_unit,product_id)" +
                " select language_id,name,product_desc,measuring_unit,'?' from product_ml where product_id = ? ";
            multiConnection[dbName].query(sql,[newProductId,productId.product_id], function (err, result) {
              //  console.log("............productMl entry...................",err,result);
                if(err) {
                    logger.debug("========error in the 1 ===============")

                    cb(err);
                } else{
                    cb(null)
                }
            })
        }]
    },function(err,result){
        if(err){
            console.log("7...",err);
            callback(err);
        }else{
            callback(null,newProductId)
        }
    })
}



function supplierBranchData(dbName,supplierProduct,areaId,supplierBranchId,callback){

    var prouductLength = supplierProduct.length;
    var queryString = "(?,?,?),";
    var insertString = "";
    var values = [];
    for (var i = 0; i < prouductLength; i++) {
        (function (i){
            values.push(supplierBranchId,areaId,supplierProduct[i].newProduct);
            insertString = insertString + queryString;
            if (i == (prouductLength - 1)){
                insertString = insertString.substring(0, insertString.length - 1);
                var sql = "insert into supplier_branch_area_product(supplier_branch_id,area_id,product_id) values " + insertString;
                multiConnection[dbName].query(sql, values, function (err, result) {
                    if (err) {
                        callback(err);
                    }
                    else {
                        callback(null);
                    }
                })
            }
        }(i))
    }


}



function InsertAreaBranch(dbName,supplierBranchId,areaId,callback){
   console.log("................area.........",areaId);
   
    var areaLength = areaId.length;
    var queryString = "(?,?,?),";
    var insertString = "";
    var values = [];
    for (var i = 0; i < areaLength; i++) {
        (function (i){
            values.push(supplierBranchId,areaId[i],1);
            insertString = insertString + queryString;
            if (i == (areaLength - 1)){
                insertString = insertString.substring(0, insertString.length - 1);
                var sql = "insert into supplier_branch_delivery_areas(supplier_branch_id,area_id,is_active) values " + insertString;
                multiConnection[dbName].query(sql, values, function (err, result) {
                    if (err) {
                        console.log("....er....",err);
                        callback(err);
                    }
                    else {
                        callback(null);
                    }

                })
            }
        }(i))
    }
}


function insertDataSupplier(dbName,supplierBranchId,supplierData,supplierId,callback){
    async.auto({
        English:function(cb){
            console.log(".........supplierData.........................",supplierData);
            var sql = "insert into supplier_branch_ml(name,branch_name,language_id,supplier_branch_id,address) values (?,?,?,?,?)";
            multiConnection[dbName].query(sql, [supplierData.englishName,supplierData.englishName,14,supplierBranchId,supplierData.englishAddress], function (err, result) {
                console.log(".......err.....111........",err,result);
                if (err) {
                    cb(err);
                }else{
                    cb(null);
                }
            })
        },
        arabic:['English',function(cb){
            var sql = "insert into supplier_branch_ml(name,branch_name,language_id,supplier_branch_id,address) values (?,?,?,?,?)";
            multiConnection[dbName].query(sql, [supplierData.arabicName,supplierData.arabicName,15,supplierBranchId,supplierData.arabicAddress], function (err, result) {
                console.log(".......err.............",err,result);
                if (err) {
                    cb(err);
                }else{
                    cb(null);
                }
            })
        }]
    },function(err,result){
        if(err){
            callback(err);
        }else{
            callback(null);
        }
    })
}


function replicateSupplierInHeadBranch(res, supplierId,areaId, result, callback) {
    var branchId;
    async.waterfall([
        function (cb) {
            supplierProfile.updateSupplierBranch(res, result.one[0].name, supplierId, result.one[0].name, result.one[0].email, result.one[0].password, result.one[0].phone, result.one[0].mobile_number_1, result.one[0].mobile_number_1, result.one[0].address, "", 1, cb);
        },
        function (branchId1, cb) {
            branchId = branchId1;
            insertHeadBranchInMultiLanguage(res, result.two, branchId, cb);
        },
        function (cb) {
            insertHeadBranchDeliveryAreas(res, result.three, branchId, cb);
        },
        function (cb) {
            insertHeadBranchProduct(res,result.four,branchId,cb);
        },
        function(products,cb){
            insertSupplierBranchAreaProduct(res,branchId,products,areaId,supplierId,cb)
        }
    ], function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null);
        }

    })

}


function insertHeadBranchInMultiLanguage(res, result, branchId, callback) {
   // console.log("multilanguage branches/...........", result);
    var nameLength = result.length;
  //  console.log(nameLength);
    var queryString = "(?,?,?,?,?),";
    var insertString = "";
    var values = [];
    for (var i = 0; i < nameLength; i++) {
        (function (i) {
            insertString = insertString + queryString;
            values.push(result[i].supplier_name, result[i].supplier_name, result[i].language_id, branchId, result[i].address);
            if (i == nameLength - 1) {
                insertString = insertString.substring(0, insertString.length - 1);
                var sql = "insert into supplier_branch_ml(name,branch_name,language_id,supplier_branch_id,address) values " + insertString;
                multiConnection[dbName].query(sql, values, function (err, result) {
                    if (err) {
                        sendResponse.somethingWentWrongError(res);
                    }
                    else {
                        callback(null);
                    }
                })
            }

        }(i))

    }

}


function insertHeadBranchDeliveryAreas(res, result, branchId, callback) {
    console.log("areas..............", result);
    var areaLength = result.length;
    var queryString = "(?,?,?),";
    var insertString = "";
    var values = [];
    for (var i = 0; i < areaLength; i++) {
        (function (i) {
            values.push(branchId, result[i].area_id, 1);
            insertString = insertString + queryString;
            if (i == areaLength - 1) {
                insertString = insertString.substring(0, insertString.length - 1);
                var sql = "insert into supplier_branch_delivery_areas(supplier_branch_id,area_id,is_active) values " + insertString;
                multiConnection[dbName].query(sql, values, function (err, result) {
                    if (err) {
                        sendResponse.somethingWentWrongError(res);
                    }
                    else {
                        callback(null);
                    }

                })
            }

        }(i))

    }

}

exports.getSupplierInfoTab2=function (dbName,res, supplierId, callback) {
    var data = {};
    var branches = {};
    async.auto({
        one: function (cb) {
            getSupplierDeliveryAreas(dbName,res, supplierId, cb);
        },
        two: function (cb) {

            listOfBranches(dbName,supplierId, res, function(err,result)
            {
                if(err){
                    console.log(err);
                    sendResponse.somethingWentWrongError(res);
                }
                else{
                    branches = result;
                    console.log("branches........",branches);
                    cb(null);
                }

            });
        },
        three :['two',function(cb)
        {
            if(branches.length){
                //console.log("here");
                branchLocations(dbName,cb,branches,res);
            }
            else{
                cb(null,[]);
            }


        }]
    }, function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        } else {
            data.delivery_areas = result.one;
            data.branches = result.three;
            callback(null, data)
        }

    })

}


function getSupplierDeliveryAreas(dbName,res, supplierId, callback) {
    var sql = "select s.id,s.country_id,s.city_id,s.zone_id,s.area_id,s.is_active,c.name country_name, ct.name city_name , ";
    sql += " z.name zone_name, a.name area_name from supplier_delivery_areas s join country c on s.country_id = c.id join city ct ";
    sql += " on s.city_id = ct.id join zone z on s.zone_id = z.id join area a on s.area_id = a.id where s.supplier_id = ? ";
    sql += " and s.is_deleted = ? ";
    multiConnection[dbName].query(sql, [supplierId, 0], function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
         //   console.log("result delivery areas........",result)
            callback(null, result);
        }

    })
}


function deleteBranch(dbName,res, branchIds,supplier_id, callback) {
var count = 0;
    console.log("nssss",branchIds,branchIds.length,supplier_id);
   async.auto({
       getBranch:function (cb) {
           var sql='select id from supplier_branch where supplier_id = ? and is_deleted = 0'
           multiConnection[dbName].query(sql,[supplier_id],function (err,result) {
               if(err){
                   console.log("errr",err);
                   sendResponse.somethingWentWrongError(res);
               }
               else {
                   console.log("reuslt",result);
                   count=result.length;
                   cb(null);
               }
           })
       },
       deleteBranch:['getBranch',function (cb) {
           console.log("ns",count,branchIds.length)
           if(count <= branchIds.length){
               sendResponse.sendErrorMessage(constant.responseMessage.AT_LEAST_ONE_BRANCH, res, constant.responseStatus.AT_LEAST_ONE_BRANCH);
           }
           else {
               branchIds=branchIds.toString();
               var sql1 = "update supplier_branch set is_deleted = ? where id IN ("+branchIds+")";
               multiConnection[dbName].query(sql1, [1], function (err, result) {
                   if (err) {
                       sendResponse.somethingWentWrongError(res);
                   }
                   else {
                       var sql = "update supplier_branch_delivery_areas set is_deleted = ? where supplier_branch_id IN ("+branchIds+")";
                       multiConnection[dbName].query(sql,[1],function(err,result2)
                       {
                           if(err){
                               sendResponse.somethingWentWrongError(res);
                           }
                           else{
                               cb(null);
                           }

                       })


                   }

               })  
           }
       }],
       makeHeadBranch:['deleteBranch',function (cb) {
           var sql='select sb.id from supplier_branch sb where sb.supplier_id = ? ' +
               ' and sb.is_head_branch = 1 and sb.is_deleted = 0'
            multiConnection[dbName].query(sql,[supplier_id],function (err,result) {
                if(err){
                    console.log("errr",err);
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    if(result.length){
                        cb(null)
                    }
                    else {
                        var sql1 ='update supplier_branch set is_head_branch = 1 where supplier_id = ? and is_deleted = 0 LIMIT 1 '
                    multiConnection[dbName].query(sql1,[supplier_id],function (err,result1) {
                        if(err){
                            console.log("errr",err);
                            sendResponse.somethingWentWrongError(res);
                        }
                        else {
                            cb(null);
                        }
                    })
                    }
                }
            })
       }]
   },function (err,result) {
       if(err){
           console.log("errr",err);
           sendResponse.somethingWentWrongError(res);
       }
       else {
           callback(null)
       }
   })
    

}


exports.updateBranchStatus=function (dbName,res, branchIds, status, callback) {
    var sql = "update supplier_branch set is_live = ? where id IN ("+branchIds+")";
    multiConnection[dbName].query(sql, [status], function (err, result) {

        if (err) {
            sendResponse.somethingWentWrongError(res)
        }
        else {
            callback(null);
        }
    })

}


exports.checkForSupplierBranchEmail=function (dbName,res, email, callback) {
    var sql = " select id from supplier_branch where email = ? limit 1"
    multiConnection[dbName].query(sql, [email], function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res)
        }
        else {
            if (result.length) {
                sendResponse.sendErrorMessage(constant.responseMessage.BRANCH_EMAIL_ALREADY_REGISTERED, res, constant.responseStatus.EMAIL_EXISTS);
            }
            else {
                callback(null);
            }
        }

    })

}


exports.updateSupplierBranch=function (dbName,res, name, supplierId, branchName, email, password, phone, 
    primaryMobile, secondaryMobile, address, supplierBranchId, headBranch,latitude,longitude,delivery_radius,
    is_area_restricted,delivery_type,entered_pwd, callback,country_code="",businessName,websiteUrl,iso) {
    if (supplierBranchId != "") {

        var sql = "update supplier_branch set iso=?,branch_name = ?,email = ?,phone = ?,mobile_1 = ?,mobile_2 = ?,address = ?, latitude = ?, longitude = ?, delivery_radius = ?, is_area_restricted = ?,delivery_type = ?,country_code=? where id = ? limit 1"
        multiConnection[dbName].query(sql, [iso,branchName, email, phone, primaryMobile, secondaryMobile, address,latitude,longitude,delivery_radius,is_area_restricted,delivery_type,country_code, supplierBranchId], function (err, result) {
            if (err) {
                logger.debug("------------1-----",err);
                sendResponse.somethingWentWrongError(res);
            }
            else {
                callback(null, supplierBranchId);
            }

        })
    }
    else {
        var sql = "insert into supplier_branch(is_superadmin,supplier_id,iso,name,email,password,phone,mobile_1,mobile_2,address,branch_name,is_head_branch,latitude,longitude,delivery_radius,is_area_restricted,delivery_type,is_live,country_code) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
        var arr = [1,supplierId,iso, name, email, password, phone, primaryMobile, secondaryMobile, address, branchName, headBranch,latitude,longitude,delivery_radius,is_area_restricted,delivery_type,1,country_code]
        console.log(arr)
        multiConnection[dbName].query(sql, [1,supplierId, iso,name, email, password, phone, primaryMobile, secondaryMobile, address, branchName, headBranch,latitude,longitude,delivery_radius,is_area_restricted,delivery_type,1,country_code], async function (err, result) {
            if (err) {
                console.log(err);
                sendResponse.somethingWentWrongError(res);
            }
            else {
                try{
                    if(businessName!="" && websiteUrl!=""){
                        let xmLpath=config.get("server.xmlPath")+businessName+"_sitemap.xml";
                        let supplierUrlJson=
                            {
                                loc: {
                                    _text: websiteUrl+'/products/listing?supplierId='+j.supplier_id+'&branchId='+result.insertId,
                                },
                                changefreq: {
                                    _text: 'weekly'
                                },
                                }
                        let xmlData=await universalFunctions.getExistingUrlsFromXml(xmLpath,supplierUrlJson);
                        logger.debug("==xmLpath=xmlData!=====",xmLpath,xmlData);
                        if(Object.keys(xmLpath).length>0){
                            await universalFunctions.writeNewUrlsInXml(xmLpath,xmlData);
                        }
                    }
                    await sendEmail(dbName,email,entered_pwd);
                    callback(null, result.insertId);
                }
                catch(Err){
                    logger.debug("===Err!==",Err)
                    callback(null, result.insertId);
                }
            }

        })
    }

}

const sendEmail=(dbName,email,password)=>{
    logger.debug("=========LINK==>>",email,password);
        return new Promise(async (resolve,reject)=>{

        let new_email_template_v12=await Execute.Query(dbName,"select `key`,`value` from tbl_setting where `key`=? and value=1 ",["new_email_template_v12"]);

                let smtpSqlSata=await Universal.smtpData(dbName);
                var subject = "New Registration";
                var content = "New Registration \n";
                content += "Congratulations you have been registered \n\n";
                content += "You can login using the following credentials :\n\n";
                content +="Email: "+email+"\n";
                content +="Password: "+password+"\n\n";
                if(new_email_template_v12.length <=0)
                content += " Wishing your Business Prosperity and Success \n";
                // content += " Code Brew Lab";
                await func.sendEmailToUser(smtpSqlSata,subject, email, content);
                resolve()
        })
}

exports.updateBranchInMultiLanguage=function (dbName,res, name, languageId, branchName, address, multiLanguageId, branchId, callback) {
    if (multiLanguageId != "") {
        //console.log("should be here")
        var multiLanguageIds = multiLanguageId.split("#");
        var languageLength = multiLanguageIds.length;
        for (var i = 0; i < languageLength; i++) {
            (function (i) {
                var sql = "update supplier_branch_ml set name = ?,branch_name = ?,address = ? where id = ? limit 1"
                multiConnection[dbName].query(sql, [name[i], branchName[i], address[i], multiLanguageIds[i]], function (err, result) {
                    console.log(err);
                    if (i == languageLength - 1) {
                        callback(null);
                    }

                })

            }(i))

        }

    }
    else {
        //console.log("should not be here")
        var nameLength = name.length;
        var queryString = "(?,?,?,?,?),";
        var insertString = " ";
        var values = [];
        for (var i = 0; i < nameLength; i++) {
            (function (i) {
                insertString = insertString + queryString;
                values.push(name[i], languageId[i], branchId, address[i], branchName[i]);
                if (i == nameLength - 1) {
                    insertString = insertString.substring(0, insertString.length - 1);
                    var sql = "insert into supplier_branch_ml(name,language_id,supplier_branch_id,address,branch_name) values " + insertString;
                    multiConnection[dbName].query(sql, values, function (err, result) {
                        if (err) {
                            console.log(err);
                            sendResponse.somethingWentWrongError(res);
                        }
                        else {
                            callback(null);
                        }

                    })

                }

            }(i))

        }
    }

}


exports.updateBranchDeliveryAreas=function (dbName,res, areaId, branchId, callback) {
  
    var sql = "delete from supplier_branch_delivery_areas where supplier_branch_id = ? ";
    multiConnection[dbName].query(sql, [branchId], function (err, result) {
        if (err) {
            console.log(err);
            sendResponse.somethingWentWrongError(res);
        }
        else {
            var values = [];
            var queryString = "(?,?,?),";
            var insertString = "";
            var areaIdLength = areaId.length;
            for (var i = 0; i < areaIdLength; i++) {
                (function (i) {
                    values.push(branchId, areaId[i], 1);
                    insertString = insertString + queryString;

                    if (i == areaIdLength - 1) {
                    //    console.log("values",values);
                     //   console.log(insertString);
                        insertString = insertString.substring(0, insertString.length - 1);
                        var sql = "insert into supplier_branch_delivery_areas(supplier_branch_id,area_id,is_active) values " + insertString;
                        multiConnection[dbName].query(sql, values, function (err, result1) {
                            if (err) {
                                console.log(err);
                                sendResponse.somethingWentWrongError(res)
                            }
                            else {
                                callback(null);
                            }

                        })
                    }

                }(i))

            }
        }

    })

}


function getParticularBranchInfo(branchId, res, callback) {
    var sql = "select * from supplier_branch where id = ? limit 1"
    multiConnection[dbName].query(sql, [branchId], function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            var sql2 = "select b.name,b.language_id,l.language_name,b.supplier_branch_id from supplier_branch_ml b join language l ";
            sql2 += "on b.language_id = l.id where b.supplier_branch_id = ? ";
            multiConnection[dbName].query(sql2, [branchId], function (err, result2) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    result[0].names = result2;
                    callback(null, result);
                }
            })

        }

    })
}


function getSupplierBranch(supplierId, res, callback) {
    var sql = "select * from supplier_branch where supplier_id = ?";
    multiConnection[dbName].query(sql, [supplierId], function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            var sql2 = "select b.name,b.language_id,l.language_name,b.supplier_branch_id from supplier_branch_ml b join language l ";
            sql2 += "on b.language_id = l.id";
            multiConnection[dbName].query(sql2, function (err, result2) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    if (result.length) {

                        for (var i = 0; i < result.length; i++) {
                            (function (i) {
                                var names = [];

                                for (var j = 0; j < result2.length; j++) {
                                    (function (j) {
                                        if (result[i].id == result2[j].supplier_branch_id) {
                                            names.push({
                                                "name": result2[j].name,
                                                "language_id": result2[j].language_id,
                                                "language_name": result2[j].language_name
                                            });
                                            if (j == result2.length - 1) {
                                                result[i].names = names;
                                                if (i == result.length - 1) {
                                                    callback(null, result);
                                                }

                                            }
                                        }
                                        else {
                                            if (j == result2.length - 1) {
                                                result[i].names = names;
                                                if (i == result.length - 1) {
                                                    callback(null, result);
                                                }

                                            }
                                        }

                                    }(j))
                                }

                            }(i));


                        }

                    }
                    else {
                        callback(null, [])
                    }

                }

            })

        }

    })
}


// function listOfBranches(dbName,supplierId, res, callback) {
//     var sql = "select * from supplier_branch where supplier_id = ? and is_deleted = ?";
//     multiConnection[dbName].query(sql, [supplierId, 0], function (err, branches) {
//         if (err) {
//             sendResponse.somethingWentWrongError(res);
//         }
//         else {

//             var sqlMl = "select sbm.id,sbm.supplier_branch_id,sbm.name,sbm.branch_name,sbm.address,sbm.language_id,l.language_name from supplier_branch_ml sbm join language l on sbm.language_id = l.id";
//             multiConnection[dbName].query(sqlMl,function(err,resultMl)
//             {
//                 if(err){
//                     console.log(err);
//                     sendResponse.somethingWentWrongError(res);
//                 }
//                 else{
//                     var branchLength = branches.length;
//                     logger.debug("======branchLength==========",branchLength,branches,resultMl)
//                     if (!branchLength) {
//                         callback(null, []);
//                     }
//                     else {
//                         if(branchLength>0){
//                             for(var i = 0 ; i < branchLength ; i++)
//                         {
//                             (function(i)
//                             {
//                                 var multipleNames = [];
//                                 if(resultMl && resultMl.length>0){
//                                     for( var j = 0 ; j < resultMl.length ; j++)
//                                     {
//                                         (function(j)
//                                         {
//                                             if(branches[i].id == resultMl[j].supplier_branch_id)
//                                             {
//                                                 multipleNames.push(resultMl[j]);
//                                                 if(j == resultMl.length - 1)
//                                                 {
//                                                     console.log("======in the multinames========",multipleNames)
//                                                     branches[i].multiple_names = multipleNames;
//                                                     console.log("baranchnames===========",branches[i].multiple_names)
//                                                     if(i == branchLength - 1)
//                                                     {
//                                                         console.log("========branches=====in callback=====<",branches)
//                                                         callback(null,branches);
//                                                     }
//                                                 }
//                                             }
//                                             else
//                                             {
//                                                 if(j == resultMl.length - 1)
//                                                 {
//                                                     branches[i].multiple_names = multipleNames;
//                                                     console.log("===========branches[i].multinames===",branches[i].multiple_names,multipleNames)
//                                                     if(i == branchLength - 1)
//                                                     {
//                                                         callback(null,branches);
//                                                     }
//                                                 }
    
//                                             }
    
//                                         }(j))
    
//                                     }
//                                 }
//                                 else{
//                                     multipleNames.push({
//                                         name:branches[i].name,
//                                         language_id:14
//                                     })
//                                     if(i == branchLength - 1)
//                                     {
//                                         callback(null,branches);
//                                     }
//                                 }

//                             }(i))

//                         }
//                         }else{
//                             callback(null,[])
//                         }
//                     }
//                 }

//             })

//         }

//     })
// }
function listOfBranches(dbName,supplierId, res, callback) {
    var sql = "select * from supplier_branch where supplier_id = ? and is_deleted = ?";
    multiConnection[dbName].query(sql, [supplierId, 0],async function (err, branches) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            for(const [index1,j] of branches.entries()){
                j.branch_revenue = await supplierProfitAfterTaxCommissionV1(dbName,j.id);
                j.branch_revenue = j.branch_revenue.toFixed(2)
                // logger.debug("=supplierProfitData=",supplierProfitData)
                // total=total+supplierProfitData.total_supplier_profit;
                // order_ids=order_ids.concat(supplierProfitData.order_ids);
             
                // total = total + get_revenue[0].total_revenue
            }

            var sqlMl = "select sbm.id,sbm.supplier_branch_id,sbm.name,sbm.branch_name,sbm.address,sbm.language_id,l.language_name from supplier_branch_ml sbm join language l on sbm.language_id = l.id";
            multiConnection[dbName].query(sqlMl,function(err,resultMl)
            {
                if(err){
                    console.log(err);
                    sendResponse.somethingWentWrongError(res);
                }
                else{
                    var branchLength = branches.length;
                    logger.debug("======branchLength==========",branchLength,branches,resultMl)
                    if (!branchLength) {
                        callback(null, []);
                    }
                    else {
                        if(branchLength>0){
                            for(var i = 0 ; i < branchLength ; i++)
                        {
                            (function(i)
                            {
                                var multipleNames = [];
                                if(resultMl && resultMl.length>0){
                                    for( var j = 0 ; j < resultMl.length ; j++)
                                    {
                                        (function(j)
                                        {
                                            if(branches[i].id == resultMl[j].supplier_branch_id)
                                            {
                                                multipleNames.push(resultMl[j]);
                                                if(j == resultMl.length - 1)
                                                {
                                                    console.log("======in the multinames========",multipleNames)
                                                    branches[i].multiple_names = multipleNames;
                                                    console.log("baranchnames===========",branches[i].multiple_names)
                                                    if(i == branchLength - 1)
                                                    {
                                                        console.log("========branches=====in callback=====<",branches)
                                                        callback(null,branches);
                                                    }
                                                }
                                            }
                                            else
                                            {
                                                if(j == resultMl.length - 1)
                                                {
                                                    branches[i].multiple_names = multipleNames;
                                                    console.log("===========branches[i].multinames===",branches[i].multiple_names,multipleNames)
                                                    if(i == branchLength - 1)
                                                    {
                                                        callback(null,branches);
                                                    }
                                                }
    
                                            }
    
                                        }(j))
    
                                    }
                                }
                                else{
                                    multipleNames.push({
                                        name:branches[i].name,
                                        language_id:14
                                    })
                                    if(i == branchLength - 1)
                                    {
                                        callback(null,branches);
                                    }
                                }

                            }(i))

                        }
                        }else{
                            callback(null,[])
                        }
                    }
                }

            })

        }

    })
}

const supplierProfitAfterTaxCommissionV1=(dbName,supplierBranchId)=>{

    return new Promise(async (resolve,reject)=>{
        logger.debug("============ENTEr")
        try{
        let order_ids=[],total_supplier_profit=0;
        let commision_given_to_admin = 0;
        let total = 0;
        let sql ="SELECT `id`,`handling_admin`,`handling_supplier`,`delivery_charges`,`net_amount`,`supplier_commision` from orders where supplier_branch_id = ? and status = 5 "
        let orderData= await Execute.Query(dbName,sql,[supplierBranchId])

            if(orderData && orderData.length>0){
                for(const [index3,k] of orderData.entries())
                {
                    total_supplier_profit=total_supplier_profit+(parseFloat(k.net_amount)-(parseFloat(k.handling_admin)+parseFloat(k.supplier_commision)))
                    order_ids.push(k.id)
                }
                total = total_supplier_profit;
                let getAgentDbData=await common.GetAgentDbInformation(dbName);  
                agentConnection=await common.RunTimeAgentConnection(getAgentDbData); 
                let agent_order_data=await Execute.QueryAgent(agentConnection,
                    "select IFNULL(sum(co.commission_ammount),0) AS agentRevenue  from cbl_user_orders co join cbl_user cu on cu.id=co.user_id where co.order_id IN(?) and cu.supplier_id=?",
                    [order_ids,0]);
                logger.debug("======AGEN=ORDER==DATA!==",agent_order_data);
                commision_given_to_admin=agent_order_data[0].agentRevenue;
                logger.debug("===befor=====>>",total,commision_given_to_admin);
                total=total-commision_given_to_admin;
                logger.debug("========>>",total,commision_given_to_admin);
                let finalRevenue = total || 0
                resolve(finalRevenue)
            }
            else{
                let finalRevenue = total || 0
                resolve(finalRevenue)

            }

        }
        catch(Err){
            logger.debug("=========Err>>",Err)
                reject(Err)

        }

    })
}
/*
 * ------------------------------------------------------
 * This function saves supplier description, its uniqueness
 * and terms and condtions to supplier table
 * Output: success/error
 * ------------------------------------------------------
 */
exports.saveSupplierDescription=function (dbName,res, supplierId, description, uniqueness, t_and_c, callback) {
    var sql = "update supplier set description = ? , uniqueness = ? , terms_and_conditions = ? where id = ? limit 1"
    multiConnection[dbName].query(sql, [description, uniqueness, t_and_c, supplierId], function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            //console.log("updated");
            callback(null);
        }
    })

}

/*
 * ------------------------------------------------------
 * This function selects supplier description, its uniqueness
 * and terms and condtions to supplier table
 * Output: success/error
 * ------------------------------------------------------
 */
exports.getSupplierDataTab3=function (dbName,supplierId, res, callback) {

    var sql = "select s.id,s.description,s.uniqueness,s.terms_and_conditions,s.language_id,l.language_name from ";
    sql += " supplier_ml s join language l on s.language_id = l.id where s.supplier_id = ?";
    multiConnection[dbName].query(sql, [supplierId], function (err, result) {
        if (err) {

            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null, result);
        }

    })
}


/*
 * ------------------------------------------------------
 * This function updates supplier subscription data to supplier
 * subscription table
 * Output: success/error
 * ------------------------------------------------------
 */
function updateSubscriptionData(dbName,res, supplierId, values, queryString, startDate, endDate, monthPrice, subscriptionId, callback) {
    if (subscriptionId == 0) {
        var query2 = "insert into supplier_subscription ( `supplier_id`, `start_date`, `end_date`, `jan_price`, `feb_price`, `march_price`, `april_price`, `may_price`, `june_price`, `july_price`, `aug_price`, `sep_price`, `oct_price`, `nov_price`, `dec_price`, `created_by`) values " + queryString;
        multiConnection[dbName].query(query2, values, function (err, result) {
            if (err) {
                console.log(err);
                sendResponse.somethingWentWrongError(res)
            }
            else {
                return callback(null);
            }

        })
    }

    else {
        var startDates = startDate.split("#");
        var endDates = endDate.split("#");
        var monthPrices = monthPrice.split("@");
     //   console.log(subscriptionId);
        subscriptionId = subscriptionId.toString();
        var subscriptionIds = subscriptionId.split("#");
     //   console.log(subscriptionIds);
        for (var i = 0; i < subscriptionIds.length; i++) {
            (function (i) {
                var monthValues = monthPrices[i].split("#");
                //console.log(monthValues);
                var sql = "UPDATE `supplier_subscription` SET `start_date`= ?,`end_date`= ?, ";
                sql += " `jan_price`=?,`feb_price`=?,`march_price`=?,`april_price`= ?, ";
                sql += " `may_price`= ?,`june_price`=?,`july_price`=?,`aug_price`=?, ";
                sql += " `sep_price`= ?,`oct_price`= ?,`nov_price`= ?,`dec_price`= ? where `id`=? limit 1"
                multiConnection[dbName].query(sql, [startDates[i], endDates[i], monthValues[0], monthValues[1], monthValues[2], monthValues[3], monthValues[4], monthValues[5], monthValues[6], monthValues[7], monthValues[8], monthValues[9], monthValues[10], monthValues[11], subscriptionIds[i]], function (err, result) {
                    console.log(err);
                    if (i == subscriptionIds.length - 1) {
                        //console.log("subscription updated");
                        return callback(null);

                    }

                })

            }(i))

        }

    }

}

/*
 * ------------------------------------------------------
 * This function makes query statement and values to be
 * inserted into supplier subscription table
 * Output: success/error
 * ------------------------------------------------------
 */
function makeQueryData(res, supplierId, startDate, endDate, monthPrice, adminId, callback) {

    var startDates = startDate.split("#");
    var endDates = endDate.split("#");
    var monthPrices = monthPrice.split("@");

    var insertString = "(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?),";
    var queryString = "";
    var values = []
    for (var i = 0; i < startDates.length; i++) {
        (function (i) {

            var monthValues = monthPrices[i].split("#");
            values.push(supplierId, startDates[i], endDates[i], monthValues[0], monthValues[1], monthValues[2], monthValues[3], monthValues[4], monthValues[5], monthValues[6], monthValues[7], monthValues[8], monthValues[9], monthValues[10], monthValues[11], adminId)
            queryString = queryString + insertString;

            if (i == startDates.length - 1) {

                queryString = queryString.substring(0, queryString.length - 1);
                callback(null, {values: values, queryString: queryString});

            }
        }(i))
    }

}


/*
 * ------------------------------------------------------
 * This function selects supplier subscription data
 * from supplier table
 * Output: success/error
 * ------------------------------------------------------
 */
async function getSupplierSubscriptionData(dbName,supplierId, res, callback) {
    try{
        // var sql = "SELECT  `id`,`jan_price`, `feb_price`, `march_price`, `april_price`, `may_price`, `june_price`, `july_price`,";
        // sql += " `aug_price`, `sep_price`, `oct_price`, `nov_price`, `dec_price`,`start_date`,`end_date` FROM `supplier_subscription`";
        // sql += " WHERE `supplier_id`= ? ";
        let sql = ` SELECT ss.*,sp.* FROM supplier_subscription ss
        join subscription_plans sp on sp.id = ss.plan_id
        where ss.supplier_id = ? and ss.status='active' limit 1`

        let result=await Execute.Query(dbName,sql,[supplierId]);
        callback(null, result);

    }
    catch(Err){
        logger.debug("===getSupplierSubscriptionData==Err!===",Err);
        sendResponse.somethingWentWrongError(res);
    }

    // var sql = "SELECT  `id`,`jan_price`, `feb_price`, `march_price`, `april_price`, `may_price`, `june_price`, `july_price`,";
    // sql += " `aug_price`, `sep_price`, `oct_price`, `nov_price`, `dec_price`,`start_date`,`end_date` FROM `supplier_subscription`";
    // sql += " WHERE `supplier_id`= ? ";
    // multiConnection[dbName].query(sql, [supplierId], function (err, result) {
    //     if (err) {
    //         sendResponse.somethingWentWrongError(res);
    //     }
    //     else {
    //         callback(null, result);
    //     }
    // })

}


    exports.updateSupplierData=function (dbName,res, supplierId, startDate, endDate, monthPrice, adminId, subscriptionId, callback) {
    var values;
    var queryString;
    async.auto({
        four: function (cb) {
            makeQueryData(res, supplierId, startDate, endDate, monthPrice, adminId, function (err, result) {
                if (err) {
                    console.log(err);
                    return cb(err);
                }
                else {
                    values = result.values;
                    queryString = result.queryString;
                    cb(null);
                }

            });
        },
        five: ['four', function (cb) {
        //    console.log("here");
            updateSubscriptionData(dbName,res, supplierId, values, queryString, startDate, endDate, monthPrice, subscriptionId, function (err, result) {
              //  console.log("..........................err........................................", err);
                if (err) {
                    cb(err);
                } else {
                    //console.log("in function");
                    cb(null);
                }
            });
        }]
    }, function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null);
        }

    })
}



/*
 * ------------------------------------------------------
 * This function inserts supplier names in mutiple languages
 * in supplier multilanguage table
 * Output: success/error
 * ------------------------------------------------------
 */
function insertSupplierNameInMultipleLanguage(res, names, languageIds, multiLanguageId, addresses, supplierId, callback) {

    if (multiLanguageId != "") {
        var multiLanguageIds = multiLanguageId.split("#");
        for (var i = 0; i < languageIds.length; i++) {
            (function (i) {
                var sql = "update supplier_ml set name = ?,address = ? where id = ? limit 1";
                multiConnection[dbName].query(sql, [names[i], addresses[i], multiLanguageIds[i]], function (err, result) {
                    console.log(err);
                    if (i == languageIds.length - 1) {
                        return callback(null);
                    }

                })

            }(i))

        }

    }

    else {
        var languageLength = languageIds.length;
        var insertString = "(?,?,?,?),";
        var queryString = "";
        var values = [];
        for (var i = 0; i < languageLength; i++) {
            (function (i) {
                queryString = queryString + insertString;
                values.push(supplierId, names[i], languageIds[i], addresses[i]);
                if (i == languageLength - 1) {
                    queryString = queryString.substring(0, queryString.length - 1);
                    var sql = "insert into supplier_ml(supplier_id,name,language_id,address) values " + queryString;
                    multiConnection[dbName].query(sql, values, function (err, result) {
                        if (err) {
                            //console.log("here");
                            console.log(err);
                            sendResponse.somethingWentWrongError(res);
                        }
                        else {
                            // console.log(values);
                            //  console.log(queryString);
                            return callback(null);
                        }
                    });
                }

            }(i))
        }
    }
}


function updateCategoriesOfSupplier(res, categoryString, commission, commissionType, commissionPackage, supplierId, callback) {

    async.waterfall([
        function (cb) {
            deleteCategoriesOfSupplier(res, supplierId, cb);
        },
        function (cb) {
            insertNewCategories(res, supplierId, commission, commissionType, commissionPackage, categoryString, cb);
        }
    ], function (err, result) {
        if (err) {
            console.log(err);
            sendResponse.somethingWentWrongError(res);
        }
        else {
            return callback(null);
        }

    })
}


function deleteCategoriesOfSupplier(res, supplierId, callback) {

    var sql = "delete from supplier_category where supplier_id = ? "
    multiConnection[dbName].query(sql, [supplierId], function (err, result) {
        if (err) {
            //console.log("error in deletion")
            console.log(err);
            sendResponse.somethingWentWrongError(res);
        }
        else {
            //console.log('deleted',result);
            callback(null);
        }
    })
}


function insertNewCategories(res, supplierId, commission, commissionType, commissionPackage, categoryString, callback) {

    var commissions = commission.split("#");
    var commissionTypes = commissionType.split("#");
    var commissionPackages = commissionPackage.split("#");
    var category = categoryString.split("$");
    var categoryLength = category.length;
    var values = new Array();
    var insertLength = "(?,?,?,?,?,?,?),";
    var querystring = '';
    for (var i = 0; i < categoryLength; i++) {
        (function (i) {
            var categorySub = category[i].split("#");
            var categorySubLength = categorySub.length;
            values.push(supplierId, categorySub[0], categorySub[1], categorySub[2], commissions[i], commissionTypes[i], commissionPackages[i]);
            querystring += insertLength;

            if (i == categoryLength - 1) {
                querystring = querystring.substring(0, querystring.length - 1);
                var sql = "insert into supplier_category(supplier_id,category_id,sub_category_id,detailed_sub_category_id,commission,commission_type,commission_package) values " + querystring;
                multiConnection[dbName].query(sql, values, function (err, result) {
                    if (err) {
                        //console.log("error in inserting");
                        console.log(err);
                        sendResponse.somethingWentWrongError(res);
                    }
                    else {
                        return callback(null);
                    }

                })

            }
        }(i))
    }
}




function updateInformationOfRegSupplierTab1(res, updateValues, callback) {
    //  var updateValues= [names[0],isRecommended,pricingLevel,handlingAdmin,handlingSupplier,isUrgent,isPostponed,currentStatus,addresses[0],telephone,fax,primaryMobile,secondaryMobile,tradeLicenseNo,logo,urgentType,urgentPrice,supplierId];

    console.log("uuu",updateValues)
    var sql = "update supplier set name = ? ,is_recommended = ? ,pricing_level = ? ,handling_admin = ?,handling_supplier = ?,is_urgent = ?,is_postpone = ?,status = ?,address = ?,phone = ?";
    sql += ",fax = ? ,mobile_number_1 = ?,mobile_number_2 = ? ,trade_license_no = ?,logo=? ,urgent_type = ?,urgent_price = ?,`step_completed`= ? ,business_start_date = ? ,payment_method = ? where id = ? limit 1";
    multiConnection[dbName].query(sql, updateValues, function (err, result) {
        if(err){
            //console.log("in update query of supplier")
            console.log("fdhfnjmghmgh,gh,hj,k,jk",err);
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null);
        }
    })
}


exports.getSupplierData =function (dbName,supplierId, res, callback) {

    
    var supplierData = {};
    var namesData;
    var dataToBeSent = {};

    var categoryData;
    var subscriptionData;
    let tagsData = []
    var rating_review= {}
    var images;
    var arr = [];
    async.waterfall([
        function (cb){
            getRatingReview(dbName,supplierId,res,cb);
        },
        function (data,cb) {
            rating_review = data;
            getRegSupplierData(dbName,supplierId, res, cb);
        },
        function (data, cb) {
            supplierData = data;
         //   console.log("supplier data/..............", supplierData);
            getMultipleNamesOfSupplier(dbName,supplierId, res, cb);
        },
        function (namesdata, cb) {
            namesData = namesdata;
            getRegSupplierCategoryData(dbName,res, supplierId, cb);
        },
        // function (categories, cb) {
        //     console.log("catgeories data/..............", categories);
        //     clubCategoryData(res, supplierData, categories, cb);
        // },
        
        function (finalData, cb) {
            categoryData = finalData;
         //   console.log(categoryData);
            getSupplierSubscriptionData(dbName,supplierId, res, cb);
        },
        
        function(subscriptionData1,cb){
           subscriptionData = subscriptionData1;
            getSupplierImages(dbName,res,supplierId,function(err,result){
                if(err){
                    cb(err);
                }else{
                    images = result;
                    cb(null)
                }
            });
        },
        function(cb){
            getSupplierTags(dbName,res,supplierId,function(err,result){
                if(err){
                    cb(err);
                }else{
                    tagsData = result;
                    cb(null);
                }
            })
        },
        
        function(cb){

            var len = images.length;
            var flag = true;
            
            if(images.length == 0){
                cb(null)
            }
            
            for(var i = 0;i < len;i++){
              (function(i){
                  if(images[i].orderImage == 0 && flag ==true)
                  {
                      arr.push({image_path:images[i].image_path,imageOrder:images[i].orderImage});
                      flag =false;  
                    }
                  if(images[i].orderImage != 0){
                      arr.push({image_path:images[i].image_path,imageOrder:images[i].orderImage});

                  }
                  
                  if(i == (len -1)){
                      cb(null);
                  }
              }(i));
          }  
        },
        async function (cb) {
         //   console.log(".............imageArray...........",imageArray);
            dataToBeSent = supplierData;
            let base_delivery_charges_data=[];
            let is_enabled_multiple_base_delivery_charges = await Universal.isEnabledMultipleBaseDeliveryCharges(dbName)
            if(is_enabled_multiple_base_delivery_charges[0] && is_enabled_multiple_base_delivery_charges[0].value=="1"){
                 base_delivery_charges_data=await Execute.Query(dbName,"select base_delivery_charges,distance_value from supplier_delivery_charges where supplier_id = ? ",[supplierId])
            //     result[0].base_delivery_charges_array = base_delivery_charges_data;
            }
            dataToBeSent[0].names = namesData;
            dataToBeSent[0].base_delivery_charges_data=base_delivery_charges_data;
            dataToBeSent[0].category_data = categoryData;
            dataToBeSent[0].images = arr;
            dataToBeSent[0].subscription_data = subscriptionData;
            dataToBeSent[0].rating_review = rating_review;
            dataToBeSent[0].tagsData = tagsData
            cb(null);
        }
    ], function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null, dataToBeSent);
        }
    })
}
async function getRatingReview(dbName,supplierId,res,callback){
    try{
        var sql = "select sr.user_id,u.firstname,u.lastname,u.user_image,sr.rating,sr.comment,sr.rated_on from supplier_rating sr join user u on u.id = sr.user_id where sr.supplier_id=?";
        let result=await Execute.Query(dbName,sql,[supplierId]);
        callback(null,result);
    }
    catch(Err){
        logger.debug("==Err>>",Err);
        callback(null,[]);
    }
    // var sql = "select sr.user_id,u.firstname,u.lastname,u.user_image,sr.rating,sr.comment,sr.rated_on from supplier_rating sr join user u on u.id = sr.user_id where sr.supplier_id=?";
    
    // multiConnection[dbName].query(sql,[supplierId],function(err,result){
    //     if(err){
    //         console.log("---------errnwe in review=========",err)
    //     }else{
    //         callback(null,result);
    //     }
    // })    
}

async function getRegSupplierData(dbName,supplierId, res, callback) {
    try{
    var day = moment().isoWeekday();
    day=day-1;
    var sql = "select sb.id as default_branch_id,sb.min_order, s.*, s.is_sponser as is_multibranch from supplier s join supplier_branch sb on s.id = sb.supplier_id where s.id = ? and sb.is_head_branch = 1 limit 1";
    let result=await Execute.Query(dbName,sql,[supplierId]);
    var sql1='select is_open from supplier_timings where supplier_id =? and week_id= ?'
    let response=await Execute.Query(dbName,sql1,[supplierId,day]);
    if(response && response.length){
        result[0].status=response[0].is_open;
        
        var multiple_base_delivery_charges="0";
        let is_enabled_multiple_base_delivery_charges = await Universal.isEnabledMultipleBaseDeliveryCharges(dbName)
        if(is_enabled_multiple_base_delivery_charges[0] && is_enabled_multiple_base_delivery_charges[0].value=="1"){
            multiple_base_delivery_charges="1"
        }
        if(multiple_base_delivery_charges=="1"){
            let base_delivery_charges_data=await Execute.Query(dbName,"select base_delivery_charges,distance_value from supplier_delivery_charges where supplier_id = ? ",[supplierId])
            result[0].base_delivery_charges_array = base_delivery_charges_data;
        }
        let supplier_delivery_types = await Execute.Query(dbName,
            "select * from supplier_delivery_types where supplier_id = ?",
            [supplierId]);
            result[0].supplier_delivery_types = supplier_delivery_types

    }
    callback(null,result);
    }
    catch(Err){
        logger.debug("=getRegSupplierDataErr!==",Err);
        sendResponse.somethingWentWrongError(res);
    }
    // multiConnection[dbName].query(sql, [supplierId], function (err, result) {
    //     if (err) {
    //         console.log("err1",err);
    //         sendResponse.somethingWentWrongError(res);
    //     }
    //     else {
    //         var sql1='select is_open from supplier_timings where supplier_id =? and week_id= ?'
    //         multiConnection[dbName].query(sql1,[supplierId,day],function (errr,response) {
    //             if(err){
    //                 console.log("err2",errr);
    //                 sendResponse.somethingWentWrongError(res);  
    //             }
    //             else {
    //                 if(response.length){
    //                     result[0].status=response[0].is_open;
    //                 }
    //                 callback(null,result);
    //             }
    //         })
    //     }
    // })

}


async function getMultipleNamesOfSupplier(dbName,supplierId, res, callback) {
    try{
        var sql = "select sm.id,sm.name supplier_name,sm.address,sm.language_id,l.language_name from supplier_ml sm join language l ";
        sql += " on sm.language_id = l.id where sm.supplier_id = ?";
        let result=await Execute.Query(dbName,sql,[supplierId]);
        callback(null, result);
    }
    catch(Err){
        logger.debug("====getMultipleNamesOfSupplier=ERR!===",Err)
    }
    // var sql = "select sm.id,sm.name supplier_name,sm.address,sm.language_id,l.language_name from supplier_ml sm join language l ";
    // sql += " on sm.language_id = l.id where sm.supplier_id = ?";
    // multiConnection[dbName].query(sql, [supplierId], function (err, result) {
    //     if (err) {
    //         sendResponse.somethingWentWrongError(res);
    //     }
    //     else {
    //         callback(null, result);
    //     }

    // })
}


async function getRegSupplierCategoryData(dbName,res,supplierId,callback) { 
    try{
        var sql = "select d.onOffComm,d.supplier_id,d.urgent_type,d.urgent_price,d.category_id,d.sub_category_id,d.urgent_type,d.urgent_price,d.detailed_sub_category_id,d.commission,d.commission_type,d.commission_package,c.type,c.name category_name,";
        sql += " sc.name sub_cat_name, dsc.name detailed_sub_cat_name from  supplier_category d left join categories c on ";
        sql += " d.category_id = c.id  left join categories sc on d.sub_category_id = sc.id left join categories dsc ";
        sql += " on d.detailed_sub_category_id = dsc.id where d.supplier_id = ? order by d.category_id,d.sub_category_id,d.detailed_sub_category_id ";
        
        let categories=await Execute.Query(dbName,sql,[supplierId]);
        callback(null, categories);
    }
    catch(Err){
        logger.debug("===getRegSupplierCategoryData==Err!==",Err)
        sendResponse.somethingWentWrongError(res);
    }

    // var sql = "select d.onOffComm,d.supplier_id,d.urgent_type,d.urgent_price,d.category_id,d.sub_category_id,d.urgent_type,d.urgent_price,d.detailed_sub_category_id,d.commission,d.commission_type,d.commission_package,c.type,c.name category_name,";
    // sql += " sc.name sub_cat_name, dsc.name detailed_sub_cat_name from  supplier_category d left join categories c on ";
    // sql += " d.category_id = c.id  left join categories sc on d.sub_category_id = sc.id left join categories dsc ";
    // sql += " on d.detailed_sub_category_id = dsc.id where d.supplier_id = ? order by d.category_id,d.sub_category_id,d.detailed_sub_category_id ";
    
    // multiConnection[dbName].query(sql, [supplierId], function (err,categories){
    //    // console.log("..............err......................",err,categories);
    //     if (err) {
    //         console.log(err);
    //         sendResponse.somethingWentWrongError(res);
    //     }
    //     else {
    //         callback(null, categories);
    //     }
    // })
}


function clubCategoryData(res, supplierData, categories, callback) {
    var suppliers = supplierData;
    var categories = categories;
    var supplier = [];
    var supplierLength = suppliers.length;
    var x = 0;
    var y = 0;
    var z = 0;
    var exception = {};
    if (supplierLength == 0) {
        callback(null, supplier);
    }
    else {

        for (var i = 0; i < supplierLength; i++) {
            (function (i) {
                var categoriesLength = categories.length;
                var category = [];
                var supplierCheck = false;
                try {
                    for (var j = x; j < categoriesLength; j++) {
                        (function (j) {
                            if (suppliers[i].id == categories[j].supplier_id) {
                                x++;
                                supplierCheck = true;
                                var subCategoryLength = categories.length;
                                var subCategories = [];
                                var subCategoryCheck = false;
                                try {

                                    for (var k = y; k < subCategoryLength; k++) {

                                        (function (k) {

                                            if (categories[j].category_id == categories[k].category_id && categories[j].supplier_id == categories[k].supplier_id && suppliers[i].id == categories[j].supplier_id && suppliers[i].id == categories[k].supplier_id) {
                                                y++;
                                                subCategoryCheck = true;
                                                var detailedSubCategoryLength = categories.length;
                                                var detailedSubCategories = [];
                                                var detailedCheck = false;
                                                try {
                                                    for (var l = z; l < detailedSubCategoryLength; l++) {
                                                        (function (l) {

                                                            if (categories[j].category_id == categories[k].category_id && categories[j].supplier_id == categories[k].supplier_id && suppliers[i].id == categories[j].supplier_id && suppliers[i].id == categories[k].supplier_id && categories[k].sub_category_id == categories[l].sub_category_id && categories[k].supplier_id == categories[l].supplier_id && suppliers[i].id == categories[l].supplier_id) {
                                                                z++;
                                                                detailedCheck = true;
                                                                if (categories[l].sub_category_id != 0) {

                                                                    if (categories[l].detailed_sub_category_id != 0) {
                                                                        detailedSubCategories.push({
                                                                            "detailed_sub_cat_id": categories[l].detailed_sub_category_id,
                                                                            "name": categories[l].detailed_sub_cat_name
                                                                        });
                                                                        if (l == detailedSubCategoryLength - 1) {

                                                                            subCategories.push({
                                                                                "sub_category_id": categories[k].sub_category_id,
                                                                                "name": categories[k].sub_cat_name,
                                                                                "category_data": detailedSubCategories
                                                                            });
                                                                            throw exception;
                                                                        }
                                                                    }
                                                                    else {
                                                                        if (l == detailedSubCategoryLength - 1) {

                                                                            subCategories.push({
                                                                                "sub_category_id": categories[k].sub_category_id,
                                                                                "name": categories[k].sub_cat_name,
                                                                                "category_data": detailedSubCategories
                                                                            });
                                                                            throw exception;
                                                                        }
                                                                    }

                                                                }

                                                            }
                                                            else {
                                                                if (detailedCheck && l == detailedSubCategoryLength - 1) {
                                                                    subCategories.push({
                                                                        "sub_category_id": categories[k].sub_category_id,
                                                                        "name": categories[k].sub_cat_name,
                                                                        "category_data": detailedSubCategories
                                                                    });
                                                                    throw exception;
                                                                }


                                                            }

                                                        }(l))

                                                    }
                                                }
                                                catch (e) {
                                                    console.log(e);
                                                }

                                                if (k == subCategoryLength - 1) {
                                                    category.push({
                                                        "category_id": categories[j].category_id,
                                                        "name": categories[j].category_name,
                                                        "commission_type": categories[j].commission_type,
                                                        "commission": categories[j].commission,
                                                        "commission_package": categories[j].commission_package,
                                                        "category_data": subCategories
                                                    });
                                                    throw exception;
                                                }
                                            }
                                            else {
                                                if (subCategoryCheck && k == subCategoryLength - 1) {
                                                    category.push({
                                                        "category_id": categories[j].category_id,
                                                        "name": categories[j].category_name,
                                                        "commission_type": categories[j].commission_type,
                                                        "commission": categories[j].commission,
                                                        "commission_package": categories[j].commission_package,
                                                        "category_data": subCategories
                                                    });
                                                    throw exception;
                                                }
                                            }

                                        }(k))
                                    }

                                }
                                catch (e) {
                                    console.log(e);
                                }
                                if (j == categoriesLength - 1) {
                                    var non_duplicated_data = _.uniq(category, 'category_id');

                                    suppliers[i].category_data = non_duplicated_data;
                                    throw exception;
                                }

                            }
                            else {
                                if (supplierCheck && j == categoriesLength - 1) {
                                    var non_duplicated_data = _.uniq(category, 'category_id');
                                    suppliers[i].category_data = non_duplicated_data;

                                    throw exception;
                                }

                            }

                        }(j))

                    }
                }
                catch (e) {
                    console.log(e);
                }

                if (i == supplierLength - 1) {
                    callback(null, suppliers);
                }

            }(i))

        }
    }
}


function branchLocations(dbName,callback,branches,res)
{
    var branchLength = branches.length;
    var sql2 = "select sb.area_id,sb.is_active,sb.supplier_branch_id,ar.name area_name from supplier_branch_delivery_areas sb join area ar on sb.area_id = ar.id where ar.is_deleted = ? and sb.is_deleted = ? and ar.is_live = ?";
    multiConnection[dbName].query(sql2, [0, 0, 1], function (err, branchLocations) {
        if (err) {
            console.log(err);
            sendResponse.somethingWentWrongError(res);
        }
        else {
            var branchLocationLength = branchLocations.length;
            if (branchLocationLength) {
                for (var i = 0; i < branchLength; i++) {
                    (function (i) {
                        var branchAreas = [];
                        for (var j = 0; j < branchLocationLength; j++) {
                            (function (j) {

                                if (branches[i].id == branchLocations[j].supplier_branch_id) {
                                    branchAreas.push({
                                        "area_id": branchLocations[j].area_id,
                                        "name": branchLocations[j].area_name,
                                        "is_active": branchLocations[j].is_active
                                    });
                                    if (j == branchLocationLength - 1) {
                                        branches[i].deliveryAreas = branchAreas;

                                        if (i == branchLength - 1) {
                                            callback(null, branches);
                                        }
                                    }

                                }
                                else {
                                    if (j == branchLocationLength - 1) {
                                        branches[i].deliveryAreas = branchAreas;
                                        if (i == branchLength - 1) {
                                            callback(null, branches);
                                        }
                                    }
                                }


                            }(j))
                        }
                    }(i))
                }
            }
            else {
                for (var i = 0; i < branchLength; i++) {
                    branches[i].deliveryAreas = [];
                    if (i == branchLength - 1) {
                        callback(null, branches);
                    }
                }
            }
        }
    })

}


async function  getSupplierImages(dbName,res,supplierId,callback)
{
    try{
        var sql = "select image_path,orderImage from supplier_image where supplier_id = ? order by id desc";
        let result=await Execute.Query(dbName,sql,[supplierId])
        callback(null,result);
    }
    catch(Err){
        logger.debug("===getSupplierImages=Err!=",Err)
    }
    // var sql = "select image_path,orderImage from supplier_image where supplier_id = ? ";
    // multiConnection[dbName].query(sql,[supplierId],function(err,result)
    // {
    //     if(err){
    //         sendResponse.somethingWentWrongError(res)
    //     }
    //     else{
    //          callback(null,result);
    //     }
    // })
}


async function  getSupplierTags(dbName,res,supplierId,callback)
{
    try{
        var sql = "select * from supplier_tags";
        let result=await Execute.Query(dbName,sql,[]);

        for(const [index,i] of result.entries()){
            let query = "select id from supplier_assigned_tags where supplier_id=? and tag_id=?";
            let params = [supplierId,i.id]
            let data = await Execute.Query(dbName,query,params);
            if(data && data.length>0){
                i.is_assigned = 1
            }else{
                i.is_assigned = 0
            }
        }

        callback(null,result);
    }
    catch(Err){
        logger.debug("===getSupplierImages=Err!=",Err)
    }
    // var sql = "select image_path,orderImage from supplier_image where supplier_id = ? ";
    // multiConnection[dbName].query(sql,[supplierId],function(err,result)
    // {
    //     if(err){
    //         sendResponse.somethingWentWrongError(res)
    //     }
    //     else{
    //          callback(null,result);
    //     }
    // })
}


function insertDeliveryLocations(res, callback, ids, supplierId) {
    var newValues;
    var newQueryString;
    async.auto({
        one: function(cb) {
            if (ids.length) {
                //console.log("ids.length");
                checkForInsertedAreas(cb, ids, supplierId, 0);
            } else {
                cb(null);
            }
        },
        three: ['one',
            function(cb, response) {
            //    console.log("response.length first")
            //    console.log(response)
                if (response.one) {
                    //console.log("response.length")
                    newValues = response.one[1];
                    if(!newValues.length){
                        cb(null)
                    }
                    else{
                        newQueryString = response['one'][0];
                    //    console.log("new values" + newValues);
                     //   console.log(("new query" + newQueryString))
                        var sql = "insert into supplier_delivery_areas(supplier_id,country_id,city_id,zone_id,area_id) values" + newQueryString;
                        multiConnection[dbName].query(sql, newValues, function(err1, reply1) {
                            if (err1) {
                                console.log(err1);
                                sendResponse.somethingWentWrongError(res);
                            } else {
                                cb(null);
                            }
                        })
                    }

                }
            }
        ]
    }, function(err, reply) {
        if (err) {
            console.log(err1);
            sendResponse.somethingWentWrongError(res);
        } else {
            //console.log("final function")
            callback(null);
        }
    })
}



function checkForInsertedAreas(callback, ids1, supplierId, status) {
    var ids = ids1.split("$");
    var idsLength = ids.length;
    var values = new Array();
    var insertLength = "(?,?,?,?,?),";
    var querystring = '';
    for (var i = 0; i < idsLength; i++) {
        (function(i) {
            var countryCityZone = ids[i].split("#");
            var areaArray = countryCityZone[countryCityZone.length - 1].split("@");
            var areaLength = areaArray.length;

            for (var j = 0; j < areaLength; j++) {
                (function(j) {
                    var sql = "select id from supplier_delivery_areas where country_id = ? and city_id = ? and zone_id = ? and area_id = ? and supplier_id = ? and is_deleted = ? limit 1";
                    multiConnection[dbName].query(sql,[countryCityZone[0],countryCityZone[1],countryCityZone[2],areaArray[j],supplierId,0],function(err,result)
                    {
                        if(result.length){
                       //     console.log("already there");
                            if(j == areaLength - 1){
                                if (i == idsLength - 1) {
                                 //   console.log("idsLength   from querystring")
                                    var idsData = [];
                                    idsData.push(querystring.substring(0, querystring.length - 1));
                                    idsData.push(values);
                                    callback(null, idsData);
                                }
                            }
                        }
                        else{
                            values.push(supplierId, countryCityZone[0], countryCityZone[1], countryCityZone[2], areaArray[j]);
                            querystring += insertLength;
                            if(j == areaLength - 1){
                                if (i == idsLength - 1) {
                                 //   console.log("idsLength   from querystring")
                                    var idsData = [];
                                    idsData.push(querystring.substring(0, querystring.length - 1));
                                    idsData.push(values);
                                    callback(null, idsData);
                                }
                            }
                        }
                    })

                }(j))
            }

        }(i))
    }
}


exports.insertDeliveryAreas= function(dbName,res,callback,deliveryAreaIds,supplierId)
{
    var areaIds = deliveryAreaIds.split("#");
    var values = [];
    var queryString = "(?,?,?,?,?),";
    var insertString = "";
    for(var i = 0 ; i < areaIds.length ; i++)
    {
        (function(i)
        {
            var sql = "select id from supplier_delivery_areas where supplier_id = ? and area_id = ? and is_deleted = ?";
            multiConnection[dbName].query(sql,[supplierId,areaIds[i],0],function(err,check)
            {
                if(check.length){
                 //   console.log("already there");
                    if(i == areaIds.length - 1)
                    {
                        insertString = insertString.substring(0,insertString.length - 1);
                        insertSupplierAreas(dbName,res,values,insertString,callback);
                    }
                }
                else{
                    var sql = "select c.id country_id,ct.id city_id,z.id zone_id from area a join zone z on a.zone_id = z.id ";
                    sql += " join city ct on z.city_id = ct.id join country c on ct.country_id = c.id where a.id = ? and ";
                    sql += " z.is_deleted = 0 and a.is_deleted = 0 and ct.is_deleted = 0 and c.is_deleted = 0 limit 1 ";
                    multiConnection[dbName].query(sql,[areaIds[i]],function(err,result)
                    {
                        if(result.length){
                            values.push(supplierId,result[0].country_id,result[0].city_id,result[0].zone_id,areaIds[i]);
                            insertString = insertString + queryString;
                            if(i == areaIds.length - 1)
                            {
                                insertString = insertString.substring(0,insertString.length - 1);
                                insertSupplierAreas(dbName,res,values,insertString,callback);
                            }
                        }
                        else{
                            if(i == areaIds.length - 1)
                            {
                                insertString = insertString.substring(0,insertString.length - 1);
                                insertSupplierAreas(dbName,res,values,insertString,callback);
                            }
                        }

                    })
                }

            });



        }(i))

    }


}

function  insertSupplierAreas(dbName,res,values,insertString,callback)
{
    if(values.length){
        var sql = "insert into supplier_delivery_areas(supplier_id,country_id,city_id,zone_id,area_id) values "+insertString;
        multiConnection[dbName].query(sql,values,function(err,result)
        {
            if(err){
                console.log("....err",err);
                sendResponse.somethingWentWrongError(res)
            }
            else{
                callback(null);
            }

        })
    }
    else{
        callback(null);
    }

}


function  updateSupplierImage(dbName,res,supplierId,supplierImageUrl,callback)
{
    if(supplierImageUrl.length == 0){
        callback(null)
    }
    
    
    
    for(var i = 0;i< supplierImageUrl.length;i++){
        (function(i){
            var sql2 = " insert into supplier_image (supplier_id,image_path,orderImage) values(?,?,?) ";
            console.log("..val.ues..............",supplierId,supplierImageUrl[i].image,supplierImageUrl[i].order);
            multiConnection[dbName].query(sql2,[supplierId,supplierImageUrl[i].image,supplierImageUrl[i].order],function(err,result)
            {
                console.log("........qyery.................",err);


                if(err){
                    console.log("---------------er-----------",err)
                    sendResponse.somethingWentWrongError(res)
                } else{
                    
                    if(i == (supplierImageUrl.length -1)){
                        callback(null);

                    }   
                }
            })
        }(i));
    }


}



function updateUrgentPricesOfAllProducts(res,supplierId,urgentPrice,isUrgent,urgentType,callback)
{
    async.auto({
        updateSupplierProduct: function(cb)
        {
            updateSupplierProducts(res,supplierId,urgentPrice,isUrgent,urgentType,function (err,result) {
                if(err){
                    sendResponse.somethingWentWrongError(res)
                }
                else{
                    cb(null);
                }
            });
        },
       updateSupplierBranchProduct:function(cb){
           updateSupplierBranchProducts(res,supplierId,urgentPrice,isUrgent,urgentType,function (err,result) {
               if(err){
                   sendResponse.somethingWentWrongError(res)
               }
               else{
                   cb(null)
               }
           });
        }
    },function(err,response)
    {
        if(err){
            sendResponse.somethingWentWrongError(res)
        }
        else{
            callback(null)
        }
        
    })
}


function updateSupplierProducts(res,supplierId,urgentPrice,isUrgent,urgentType,callback)
{

var productId=[];
    async.auto({
        getProductId:function (cb) {
            var sql='select product_id from supplier_product where supplier_id = ? '
            multiConnection[dbName].query(sql,[supplierId],function (err,result) {
                if(err){
                    cb(err);
                }
                else {
                   if(result.length){
                       for(var i=0;i<result.length;i++){
                           (function (i) {
                               productId.push(result[i].product_id);
                               if(i==(result.length-1)){
                                   cb(null);
                               }
                           }(i))
                       }
                   }
                    else {
                       cb(null);
                   }
                }
            })
        },
        updatePricing:['getProductId',function (cb) {
           productId=productId.toString();
            var sql='update product_pricing set can_urgent = ?,urgent_price = ?, urgent_type = ? where product_id IN ('+productId+')'
            multiConnection[dbName].query(sql,[isUrgent,urgentPrice,urgentType],function (err,result) {
                if(err){
                    cb(err);
                }
                else {
                    cb(null);
                }
            })
        }]
    },function(err,response)
    {
        if(err){
            sendResponse.somethingWentWrongError(res)
        }
        else{
            callback(null)
        }

    })
   /* var sql = " update product_pricing set can_urgent = ?,urgent_price = ?, urgent_type = ? where product_id IN (select product_id from supplier_product where supplier_id = ? )";
    multiConnection[dbName].query(sql,[supplierId],function(err,result)
    {
        console.log("err...........................",err,result);
        if(err){
            sendResponse.somethingWentWrongError(res);
        }
        else{
            console.log("5")
            callback(null)
        }
    })*/
}



function updateSupplierBranchProducts(res,supplierId,urgentPrice,isUrgent,urgentType,callback)
{
    var branchId=[];
    var productId=[];
    async.auto({
        getBranch:function (cb) {
            supplierId=parseInt(supplierId);
            var sql1 = "select id from supplier_branch where supplier_id = "+supplierId;
            multiConnection[dbName].query(sql1,function (err,result) {
                if(err){
                    console.log("err1",err);
                    sendResponse.somethingWentWrongError(res)
                }
                else {
                    if(result.length){
                        for(var i=0;i<result.length;i++) {
                            (function (i) {
                                branchId.push(result[i].id);
                                if(i==(result.length-1)){
                                    cb(null);
                                }
                            }(i))
                        }
                    }
                    else {
                        cb(null);
                    }

                }
            })
        },
        getProductId:['getBranch',function (cb) {
            branchId=branchId.toString();
           var sql='select product_id from supplier_branch_product where supplier_branch_id IN('+branchId+')';
            multiConnection[dbName].query(sql,function (err,result) {
              //  console.log("result1",err,result);
                if(err){
                    console.log("err2",err);
                    sendResponse.somethingWentWrongError(res)
                }
                else {
                    if(result.length){
                        for(var i=0;i<result.length;i++){
                            (function (i) {
                                productId.push(result[i].product_id);
                                if(i==(result.length-1)){
                                    cb(null);
                                }
                            }(i))
                        }
                    }
                    else {
                    cb(null)
                    }

                }
            })
        }],
        updatePricing:['getProductId',function (cb) {
            productId=productId.toString();
            var sql='update product_pricing set can_urgent = ?,urgent_value = ?, urgent_type = ? where product_id IN('+productId+')'
            multiConnection[dbName].query(sql,[isUrgent,urgentPrice,urgentType],function (err,result) {
                //console.log("result2",err,result);
                if(err){
                    console.log("err",err);
                    sendResponse.somethingWentWrongError(res)
                }
                else{
                    cb(null)
                }
            })
        }]

    },function (err,response) {
        if(err){
            console.log("err",err);
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null);
        }
    })
}

function findParentCat(dbName, id, data,callback) {
        var sql = 'select id,parent_id from categories where id =? ';
        multiConnection[dbName].query(sql, [id], async function (err, result) {
            if (err) {
                callback(err);
            } else {
                if (result.length) {
                    if (data.isParent) {
                        data.parent = result[0];
                    } else {
                        data = result[0]
                    }
                    if (result[0].parent_id != 0) {
                        data.isParent = true;
                        findParentCat(dbName, result[0].parent_id, data,callback);                        
                    } else {
                        callback(null,data);
                    }
                }
            }
        })
}

var getArrayStingCategory =async function(dbName,res,detSubCategoryJSON,supplierId,subCategoryString,callback) {
    var detSubCategory= detSubCategoryJSON.split('#');
    let data = [];
    async.each(detSubCategory, function (file, cb) {
        findParentCat(dbName, file, {}, function (err, result2) {
            if (err) cb(null);
            if (result2.isParent) {
                data.push([supplierId,result2.parent.id,0,0]);
                data.push([supplierId,result2.parent.id,result2.id,0]);                
            } else {
                data.push([supplierId,result2.id,0,0]);
            }
            cb(null);
        })
    }, function (err) {
        if (err) {
            console.log('A file failed to process', err);
            callback(err);
        } else {
            // console.log('data', data);
            callback(null,data);
        }
    });    
}


var makeQueryStringForSupplierCategories = function(dbName,res,detSubCategoryJSON,supplierId,subCategoryString,callback) {


    var detSubCategory= detSubCategoryJSON.split('#');
    var cat=[];
    var subCat=[];
    var detSubCat=[];
    var insertSupplierCatArray = [];
    console.log("ljdsfiudsf",detSubCategory);
  async.auto({
    //   getArrayCat:function(cb){
    //     getArrayStingCategory(dbName,res,detSubCategoryJSON,supplierId,subCategoryString,function(err,result){
    //         if(err){
    //             cb(err);
    //         }else{
    //             insertSupplierCatArray = result;
    //             console.log('insertSupplierCatArray',insertSupplierCatArray);
    //             cb(null) 
    //         }
    //     })
    //   },
    getSubCategory:function (cb) {
      if(detSubCategory[0] == 0){
          detSubCat.push(detSubCategory[0]);
          subCat=subCategoryString.split("#");
          cb(null);
      }
      else{
          for(var i=0;i<detSubCategory.length;i++){
              (function (i) {
                  detSubCat.push(detSubCategory[i]);
                  var sql ='select id,parent_id from categories where id =? ';
                  let stmt = multiConnection[dbName].query(sql,detSubCategory[i],async function (err,result) {
                      console.log("===========id parent id ==========",stmt.sql)
                      if (err) {
                          console.log("err", err);
                          sendResponse.somethingWentWrongError(res)
                      }
                      else {
                          console.log("bask",result);

                          if(result[0].parent_id==0){
                            subCat.push(result[0].id);
                            // subCat.push(0);
                          }
                          else{
                                // subCat.push(result[0].parent_id);
                                var is_cat_upto_second_level=await HaveSecondLevel(result[0].parent_id,dbName);
                                console.log('is_cat_upto_second_level',is_cat_upto_second_level);                                
                                if(is_cat_upto_second_level==1){
                                    detSubCat[i]=0
                                    subCat.push(result[0].id);
                                }else{
                                    subCat.push(result[0].parent_id);
                                }
                          }                          
                          if(i==detSubCategory.length-1){
                              console.log('cat,subCat,detSubCat',cat,subCat,detSubCat);
                              
                              cb(null);
                          }
                      }
                  });
              }(i))
          }
      }

    },
     getCategory:['getSubCategory',function (cb) {
         console.log("============sub_csataata=========",subCat)
         for(var i=0;i<subCat.length;i++){
             (function (i) {

                var sql ='select id,parent_id from categories where id =?';
                
                let stmt = multiConnection[dbName].query(sql,subCat[i],function (err,result) {

                     console.log('==========hey sql -------------',stmt.sql,err,result)

                     if (err) {
                         console.log("err", err);
                         sendResponse.somethingWentWrongError(res)
                     }
                     else {

                         console.log("baskaa",result);
                        if(result && result.length>0){
                                if(result[0].parent_id==0){                              
                                    cat.push(result[0].id);
                                }
                            
                            else{                              
                                cat.push(result[0].parent_id);
                            }  
                        }
                        //  cat.push(result[0].parent_id);
                         if(i==subCat.length-1){
                             cb(null);
                         }
                     }
                 });
             }(i))
         }
     }], 
    insertCategory:['getCategory',function (cb) {
        console.log("detsub sub cat",insertSupplierCatArray.length);
        
        // for(let i=0;i<insertSupplierCatArray.length;i++){
        //     (function (i) {
                
        //         let insertedString = insertSupplierCatArray[i];
        //         var sql = "select id from supplier_category where supplier_id = ? and category_id = ? and sub_category_id = ? and detailed_sub_category_id = ? ";

                
        //         var stmt = multiConnection[dbName].query(sql,insertedString,function(err,result)
        //         {
        //             console.log("============get cat sql query========",stmt.sql,err,result)
        //            if(err){
        //             //    console.log("err", err);
        //                cb(err);
        //             //    sendResponse.somethingWentWrongError(res);
        //            }
        //             else {
        //                if(result.length){
        //                 //    console.log("already there=======result.length==i==========",result.length,i);
        //                 console.log('i---',i,insertSupplierCatArray.length,(i == insertSupplierCatArray.length -1));

        //                    if( i == insertSupplierCatArray.length - 1)
        //                    {
        //                        cb(null)
        //                    }
        //                }
        //                else{
        //                 var valuesData = `SELECT ${insertedString[0]},${insertedString[1]},${insertedString[2]},${insertedString[3]}, MAX(order_no)+1.1 
        //                 FROM supplier_category 
        //                 where 
        //                 supplier_id=${insertedString[0]} `;

        //                    console.log('order_no---------------',valuesData);                           

        //                    var sql2 = "insert into supplier_category(supplier_id,category_id,sub_category_id,detailed_sub_category_id,order_no) " + valuesData
        //                    multiConnection[dbName].query(sql2,function(err,result2)
        //                    {    
        //                        console.log('err,result2',err,result2);
        //                        console.log('i---',i,insertSupplierCatArray.length,(i == insertSupplierCatArray.length -1));
                               
        //                        if(i == insertSupplierCatArray.length -1)
        //                        {
        //                            cb(null)
        //                        }

        //                    })

        //                }
        //            }


        //         })
        //     }(i))
        // }
        
        for(var i=0;i<subCat.length;i++){
            (function (i) {

                var sql = "select id from supplier_category where category_id = ? and sub_category_id = ? and detailed_sub_category_id = ? and supplier_id = ? ";
                var stmt = multiConnection[dbName].query(sql,[cat[i],subCat[i],detSubCat[i],supplierId],function(err,result)
                {
                    console.log("============get cat sql query========",stmt.sql)
                   if(err){
                       console.log("err", err);
                       sendResponse.somethingWentWrongError(res);
                   }
                    else {
                       if(result.length){
                           console.log("already there=======result.length==i==========",result.length,i);
                           if( i == subCat.length - 1)
                           {
                               cb(null)
                           }
                       }
                       else{
                           var values = `SELECT ${supplierId},${cat[i]},${subCat[i]},${detSubCat[i]}, MAX(order_no)+1 
                           FROM supplier_category 
                           where 
                           supplier_id=${supplierId}`;
                           console.log('order_no---------------',values);
                            
                           var sql2 = "insert into supplier_category(supplier_id,category_id,sub_category_id,detailed_sub_category_id,order_no) " + values
                           multiConnection[dbName].query(sql2,function(err,result2)
                           {    
                               console.log('err,result2',err,result2);
                               
                               if(i == subCat.length -1)
                               {
                                   cb(null)
                               }

                           })

                       }
                   }


                })
            }(i))
        }
    }]
  },function (err,response) {
      if(err){
          console.log("err",err)
      }
      else {
    callback(null);
      }
  })
}
const HaveSecondLevel=(id,dbName)=>{
    return new Promise((resolve,reject)=>{
        var sql_q ='select id,parent_id from categories where id =?';                
        let stmt = multiConnection[dbName].query(sql_q,[id],function (err,result) {
            logger.debug("==ERR!==",err)
            if(result && result.length>0){
                if(result[0].parent_id==0){
                    resolve(1)
                }
                else{
                    resolve(0)
                }               
            }   
            else{
                resolve(0)
            }
        })  
    })
}

function getSupplierProduct(res,supplierId,callback){
    var sql='select category_id,sub_category_id,detailed_sub_category_id,product_id,delivery_charges,original_product_id from supplier_product where supplier_id =? and is_deleted = 0';
    multiConnection[dbName].query(sql,[supplierId],function (err,product) {
        if(err){
            console.log("err",err);
            sendResponse.somethingWentWrongError(res)
        }
        else{
           // console.log("eee",product)
            callback(null,product);
        }
    })
}

function insertHeadBranchProduct(res,result,branchId,callback)
{
    var products=[]
    var nameLength = result.length;
    //  console.log(nameLength);
    var queryString = "(?,?,?,?,?,?,?),";
    var insertString = "";
    var values = [];
    for (var i = 0; i < nameLength; i++) {
        (function (i) {
            insertString = insertString + queryString;
            values.push(branchId,result[i].category_id, result[i].sub_category_id, result[i].detailed_sub_category_id, result[i].product_id, result[i].delivery_charges, result[i].original_product_id);
            products.push(result[i].product_id);
            if (i == nameLength - 1) {
                insertString = insertString.substring(0, insertString.length - 1);
                var sql = "insert into supplier_branch_product(supplier_branch_id,category_id,sub_category_id,detailed_sub_category_id,product_id,delivery_charges,original_product_id) values " + insertString;
                multiConnection[dbName].query(sql, values, function (err, result) {
                    if (err) {
                        console.log("err",err);
                        sendResponse.somethingWentWrongError(res);
                    }
                    else {
                        callback(null,products);
                    }
                })
            }

        }(i))
    }

}

function insertSupplierBranchAreaProduct(res,branchId,products,areaId,supplierId,callback)
{
    var areaId = areaId;
    var dataTobeInserted;
    async.auto({
        two:function (cb) {
            getDeliveryChargesOfBranchAreaWise(res, areaId, supplierId, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res)
                }
                else {
                    dataTobeInserted = result;
                    console.log("delivery charge data", dataTobeInserted)
                    cb(null);
                }
            });
        },
        three: ['two', function (cb) {
            if (dataTobeInserted.length) {
                insertAreaBranchProductCharges(res, dataTobeInserted, products, branchId, cb);
            }
            else {
                cb(null);
            }

        }]
    }, function (err, response) {
        if (err) {
            sendResponse.somethingWentWrongError(res)
        }
        else {
            callback(null)
        }

    })
    
}

function getDeliveryChargesOfBranchAreaWise(res, areaId, supplierId, callback) {
   areaId=areaId.toString();
 console.log("hbsdc",areaId);
    var sql = "select area_id,delivery_charges,min_order,charges_below_min_order from supplier_delivery_areas where area_id IN ("+ areaId + ") and is_deleted = ? and supplier_id = ?"
    multiConnection[dbName].query(sql, [0, supplierId], function (err, result2) {
        if (err) {
            sendResponse.somethingWentWrongError(res)
        }
        else {

            callback(null, result2);
        }
    })
}

function insertAreaBranchProductCharges(res, dataTobeInserted, productId, branchId, callback) {

    var productIds = productId;
    var dataLength = dataTobeInserted.length;
    var queryString = "";
    var insertString = "(?,?,?,?,?,?),";
    var values = [];
    if(productIds.length){
        for (var j = 0; j < productIds.length; j++) {
            (function (j) {
                for (var i = 0; i < dataLength; i++) {
                    (function (i) {
                        values.push(branchId, dataTobeInserted[i].area_id, productIds[j], dataTobeInserted[i].delivery_charges, dataTobeInserted[i].min_order, dataTobeInserted[i].charges_below_min_order);
                        queryString = queryString + insertString;
                        console.log("val",values);
                        if (i == dataLength - 1 && j == productIds.length - 1) {
                            //  console.log("val1111111",values);
                            queryString = queryString.substring(0, queryString.length - 1);
                            var sql = "insert into supplier_branch_area_product(supplier_branch_id,area_id,product_id,delivery_charges,min_order,charges_below_min_order) values " + queryString;
                            multiConnection[dbName].query(sql, values, function (err, result) {
                                if (err) {
                                    sendResponse.somethingWentWrongError(res);
                                }
                                else {
                                    callback(null);
                                }

                            })
                        }

                    }(i))

                }

            }(j))
        }

    }
    else{
        callback(null);
    }


}



 exports.updateBranchAreaProduct= function(dbName,res,areaId,branchId,add_area,remove_area,callback){
  
    var areaIds =areaId.toString();
    var addArea = add_area.split('#');
    var removeArea= remove_area.split('#');
    var productIds = [];
    var id = [];
    var data ;
    async.auto({
        getProduct:function (cb) {
            var sql= 'select distinct(`product_id`) as ids from supplier_branch_area_product where area_id in ('+areaIds+') ' +
                ' and supplier_branch_id = ? and is_deleted = 0';
          //  console.log("huifwd",sql);
             multiConnection[dbName].query(sql,[branchId],function (err,result) {
                // console.log("huifwdsssssss",err,result);
                 if(err){
                    console.log("err",err);
                    sendResponse.somethingWentWrongError(res)
                }
                else{
                     if(result.length){
                         for(var i=0;i<result.length;i++){
                             productIds.push(result[i].ids);
                             if(i==result.length-1){
                                 cb(null);
                             }
                         }
                     }
                     else{
                         cb(null)
                     }
                }
            })
        },
        getProductData:['getProduct',function(cb){
          if(productIds.length){
              if(add_area[0]){
                  console.log("mhksdfkj",productIds);
                  productIds=productIds.toString();
                  var sql1='select * from supplier_branch_area_product where product_id in' +
                      '('+productIds+') and supplier_branch_id = ? and is_deleted  = 0 and area_id IN ('+areaIds+') group by product_id ';
                //  console.log("kasdfkjsdf",sql1)
                  multiConnection[dbName].query(sql1,[branchId],function (err,result) {
                   //   console.log("kasdfkjsdfssss",err,result)
                      if(err){
                          console.log("err",err);
                          sendResponse.somethingWentWrongError(res)
                      }
                      else{
                          data=  result;
                          cb(null);

                      }
                  })
              }
              else{
                  cb(null);
              }
          }
            else{
              cb(null);
          }

        }],
        InsertData:['getProductData',function (cb) {
          if(productIds.length){
              if(add_area[0]){
                  var dataLength = data.length;
           //       console.log("ldsvsd",addArea,data,dataLength);
                  var queryString = "";
                  var insertString = "(?,?,?,?,?,?,?),";
                  var values = [];
                  if(addArea.length){
                      for (var j = 0; j < addArea.length; j++) {
                          (function (j) {
                              for (var i = 0; i < dataLength; i++) {
                                  (function (i) {
                                      values.push(data[i].supplier_branch_id, addArea[j],data[i].product_id,data[i].delivery_charges,data[i].min_order,data[i].charges_below_min_order,data[i].is_deleted);
                                      queryString = queryString + insertString;
                                      // console.log("val",values);
                                      if (i == dataLength - 1 && j == addArea.length - 1) {
                                          console.log("val1111111",values);
                                          queryString = queryString.substring(0, queryString.length - 1);
                                          var sql = "insert into supplier_branch_area_product(supplier_branch_id,area_id,product_id,delivery_charges,min_order,charges_below_min_order,is_deleted) values " + queryString;
                                          multiConnection[dbName].query(sql, values, function (err, result) {
                                              if (err) {
                                                  console.log("err");
                                                  sendResponse.somethingWentWrongError(res);
                                              }
                                              else {
                                                  cb(null);
                                              }

                                          })
                                      }

                                  }(i))

                              }

                          }(j))
                      }

                  }
              }
              else {
                  cb(null);
              }
          }
            else {
              cb(null);
          }


        }],
        DeleteData:['getProductData',function (cb) {
            if(remove_area[0]){
                if(removeArea.length){
                    for(var i=0;i<removeArea.length;i++){
                        (function (i) {
                            var sql3='update supplier_branch_area_product set is_deleted = 1 where area_id = ? and supplier_branch_id =?'
                            multiConnection[dbName].query(sql3,[remove_area[i],branchId],function (err,result) {
                                if(err){
                                    console.log("err22",err);
                                    sendResponse.somethingWentWrongError(res)
                                }
                                else{
                                    if(i==removeArea.length-1){
                                        cb(null);
                                    }
                                }
                            })
                        }(i))
                    }
                }
                else {
                    cb(null)
                }
            }
            else {
                cb(null)
            }

        }]
    },function (err,response) {
        if (err) {
            sendResponse.somethingWentWrongError(res)
        }
        else {
            callback(null)
        }
    })
}

 function updateProduct(res,supplierId,cb) {

     cb(null);
 }

var oldImageUpload = function(oldImageUpload,supplierId,callback){
    async.auto({
        deleteImage:function(cb){
            var sql = "delete from supplier_image where supplier_id = ? and orderImage = ?";
            multiConnection[dbName].query(sql,[supplierId,0],function(err,result){
                if(err){
                    cb(null);
                }else{
                    cb(null);
                }
            })
        },
        insertImage:function(cb){
            var queryString = [];
            queryString.push(supplierId,1);
            var sql = "insert into supplier_image (image_path,orderImage) values " + queryString;
            multiConnection[dbName].query(sql,[supplierId,1],function(err,result){
                if(err){
                    cb(null);
                }else{
                    cb(null);
                }
            })
        }
    },function(err,result){
        if(err){
            callback(err)
        }else{
            callback(null)
        }
    })
}

function setStatus(res,supplierId,day,callback) {
    var sql='select is_open from supplier_timings where supplier_id =? and week_id =?'
    multiConnection[dbName].query(sql,[supplierId,day],function (err,result) {
        if(err){
            console.log("err",err);
            sendResponse.somethingWentWrongError(res);
        }
        else{
            if(result.length){
                status.push({"permanent_status":result[0].is_open,
                              "supplierId":supplierId,
                                "week_id":day
                });
            }
            callback(null);
        }
    })
}

exports.getPackageListing = function(req,res){
   var data;
    var dataTemp = [];
    async.auto({
        getList:function (callback) {
                var sql='select id from categories where parent_id =?';
                multiConnection[req.dbName].query(sql,[0],function(err,result){
                   if(err){
                        callback(err);
                    }else{
                        data = result;
                        callback(null);
                    }
                })
        },
        getHighestPoints:['getList',function(callback){
            var len = data.length;
            var j= 0;
            if(len ==0 ){
                console.log("*-*********************some thing went wrong*******************************");
                callback(null);
            }
      
            for(var i =0;i< len;i++){
                (function(i){
                    
                   
                    
                    getSupplierComm(req.dbName,data[i],function(err,result){
                        if(err){
                            callback(err);
                        }else{
                            if(result.silver == null){
                                result.silver = []; 
                            }
                            if(result.gold == null){
                                result.gold = []
                            }
                            if(result.platinum == null){
                                result.platinum = []
                            }
                            
                            dataTemp.push(result);
                            j++;
                            
                            
                            console.log("**********************",i);

                            console.log("**********************",len);


                            if(j == (len)){
                                console.log("*************************data************",dataTemp)
                                 callback(null);
                            }
                        }
                    })
                }(i));
            }
        }],
        finalData:['getHighestPoints',function(callback){
            callback(null);
        }]
    },function(err,result){
        
        if(err){
            sendResponse.somethingWentWrongError(res);
        }else{
            sendResponse.sendSuccessData(dataTemp, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })
}



exports.supplierBranchRefresh = function(req,res){
    var supplierId;
    var supplierBranchId;
    var area;
    async.auto({
        getValue:function(cb){
            supplierId = req.body.supplierId;
            supplierBranchId = req.body.supplierBranchId;
            
            console.log(".********************supplierId***********************",supplierId);
            console.log(".********************supplierBranchId***********************",supplierBranchId);
            cb(null);
        },
        getAllArea:['getValue',function(cb){
            var sql = "select area_id from supplier_branch_delivery_areas where supplier_branch_id = ?"
            multiConnection[req.dbName].query(sql,supplierBranchId,function(err,result){
               if(err){
                   console.log("1...",err);
                    cb(err);
                }else{
                   area = result;
                   cb(null);
                }
            })
        }],
        deleteBranch:['getAllArea',function(cb){
           deleteBranchProduct(req.dbName,supplierBranchId,function(err,result){
               if(err){
                   console.log("4...",err);
                   cb(err);
               }else{
                   cb(null)
               }
           })
        }],
        assignProduct:['getAllArea',function(cb){
            insertBranchRefresh(req.dbName,res,supplierId,area,supplierBranchId,function(err,result){
                if(err){
                    console.log("9...",err);
                    cb(err);
                }else{
                    cb(null)
                }
            })
        }]
    },function(err,result){
        console.log(".......------------------------err------------------------",err,result);
        if(err){
            sendResponse.somethingWentWrongError(res);
        }else{
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })
}


exports.onOffCache = function(req,res){
    var valueCache;
    var resetCache;
    
    console.log("..........req........",req.body);
    
    async.auto({
        getValue:function(cb){
            valueCache = req.body.onOff;
            resetCache = req.body.resetCache;
            cb(null);
        },
        updateValue:['getValue',function(cb){
            var sql = "update cache set onOff = ? , reset = ?  where 1";
            multiConnection[req.dbName].query(sql,[valueCache,resetCache],function(err,result)
            {
                console.log("......err......result.");
                if(err){
                    cb(err)
                }
                else{
                    cb(null);
                }

            })
        }]
    },function(err,result){
        if(err){
            sendResponse.somethingWentWrongError(res);
        }else{
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })
}



exports.getCache = function(req,res){
    var valueCache;
    var resetCache;
    var data;
    async.auto({
        getValue:function(cb){
           // var sql = "update cache set onOff = ? and reset = ?  ";
            
            var sql = "select onOff,reset from cache "
            multiConnection[req.dbName].query(sql,[],function(err,result)
            {
                if(err){
                    cb(err)
                }
                else{
                    data = result;
                    cb(null);
                }

            })
        }
    },function(err,result){
        if(err){
            sendResponse.somethingWentWrongError(res);
        }else{
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })
}




var deleteBranchProduct =function(dbName,branchId,callback){
    async.auto({
        branchProduct:function(cb){
            var sql = "delete from  supplier_branch_product where supplier_branch_id = ?"
            multiConnection[dbName].query(sql,[branchId],function (err,result) {
                if(err){
                    console.log("2...",err);
                    cb(err);
                }
                else{
                    cb(null);
                }
            })
        },
        branchAreaProduct:function(cb){
            var sql = "delete from  supplier_branch_area_product where supplier_branch_id = ?"
            multiConnection[dbName].query(sql,[branchId],function (err,result) {
                if(err){
                    console.log("3...",err);
                    cb(err);
                }
                else{
                    cb(null);
                }
            })
        }
    },function(err,result){
        if(err){
            callback(err);
        }else{
            callback(null)
        }
    })
}


function insertBranchRefresh(dbName,res, supplierId,areaId, supplierBranchId,callback) {

    var supplierData;
    var supplierCategory;
    var supplierProduct;
    var newProduct = [];
    async.auto({
        getSupplierProduct:function(cb){
            var sql='select category_id,sub_category_id,detailed_sub_category_id,product_id,delivery_charges,original_product_id from supplier_product where supplier_id = ? and is_deleted = 0';
            multiConnection[dbName].query(sql,[supplierId],function (err,result) {
                if(err){
                    console.log("5...",err);
                    cb(err);
                }
                else{
                    supplierProduct = result;
                    cb(null);
                }
            })
        },
        insertNewproduct:['getSupplierProduct',function(cb){
            var len = supplierProduct.length;
            if(len == 0){
                cb(null)
            }

            for(var i =0;i < len;i++){
                (function(i){
                    insertNewData(dbName,supplierProduct[i],function(err,result){
                        console.log("..................err1.........",err,result);
                        if(err){
                            cb(err);
                        }else{
                            supplierProduct[i].newProduct = result;
                            if(i == (len -1)){
                                console.log("===================================================================");
                                cb(null);
                            }
                        }
                    })
                }(i));
            }
        }],
        insertBranchProduct:['insertNewproduct',function(cb){

            console.log("...............insert branch product..........");
            var nameLength = supplierProduct.length;
            //  console.log(nameLength);
            var queryString = "(?,?,?,?,?,?,?),";
            var insertString = "";
            var values = [];

            if(nameLength == 0){
                cb(null);
            }

            for (var i = 0; i < nameLength; i++) {
                (function (i){
                    insertString = insertString + queryString;
                    console.log("........................supplierProduct[i]...............................",supplierProduct[i]);
                    values.push(supplierBranchId,supplierProduct[i].category_id, supplierProduct[i].sub_category_id, supplierProduct[i].detailed_sub_category_id, supplierProduct[i].newProduct, supplierProduct[i].delivery_charges, supplierProduct[i].original_product_id);
                    if (i == (nameLength - 1)){
                        insertString = insertString.substring(0, insertString.length - 1);
                        var sql = "insert into supplier_branch_product(supplier_branch_id,category_id,sub_category_id,detailed_sub_category_id,product_id,delivery_charges,original_product_id) values " + insertString;
                        multiConnection[dbName].query(sql, values, function (err, result) {
                            if (err) {
                                cb(err);
                            }
                            else {
                                cb(null);
                            }
                        })
                    }
                }(i))
            }
        }],
        insertSupplierBranchAreaProduct:['getSupplierProduct','insertNewproduct',function(cb){
            var productLength = supplierProduct.length;
            var areaLength = areaId.length;

            if(areaLength == 0){
                cb(null);
            }
            if(productLength == 0){
                cb(null);
            }
            for(var i =0;i<areaLength;i++){
                (function(i){
                    supplierBranchData(dbName,supplierProduct,areaId[i].area_id,supplierBranchId,function(err,result){
                        if(err){
                            cb(err);
                        }else{
                            if(i == (areaLength -1)){
                                cb(null);
                            }
                        }
                    })
                }(i));
            }
        }]
    },function(err,result){
        if(err){
            callback(err);
        }else{
             callback(null);
        }
    })
}




var getSupplierComm = function(dbName,data,callback){

    var comm;
    var platinum = null;
    var gold = null;
    var silver = null;
    
    async.auto({
        getHighest:function(cb){
            var sql='select distinct(sc.commission)  from supplier_category sc join supplier s on sc.supplier_id = s.id where sc.onOffComm = 1 and sc.category_id = ? and sc.commission_type = 1  and s.commisionButton = 1 order by sc.commission DESC LIMIT 0,3'
            multiConnection[dbName].query(sql,[data.id],function(err,result){
                 if(err){
                    cb(err);
                }else{
                    comm = result;
                    cb(null);
                }
            })
        },
        getplat:['getHighest',function(cb){
            if(comm.length == 0){
                return cb(null)
            }else{
               var sql = "select c.icon as categoryiIcon ,c.image as categoryImage,s.id,s.name,s.logo,cml.name as categoryName ,cml.category_id from supplier_category sc join supplier s on s.id = sc.supplier_id join categories_ml cml on cml.category_id = sc.category_id " +
                   " join categories c on c.id = cml.category_id where sc.commission = ? and sc.category_id = ? GROUP BY s.id";
                multiConnection[dbName].query(sql,[comm[0].commission,data.id],function(err,result){
                    if(err){
                        cb(err);
                    }else{
                        platinum = result;
                        cb(null);
                    }
                }) 
            }
        }],
        getGold:['getHighest',function(cb){
            if(comm.length >= 2){
                var sql = "select c.icon as categoryIcon ,c.image as categoryImage,s.id,s.name,s.logo,cml.name as categoryName ,cml.category_id from supplier_category sc join supplier s on s.id = sc.supplier_id join categories_ml cml on cml.category_id = sc.category_id " +
                    " join categories c on c.id =cml.category_id where sc.commission = ? and sc.category_id = ? GROUP BY s.id";
                multiConnection[dbName].query(sql,[comm[1].commission,data.id],function(err,result){
                  //  console.log(".................gold.........................",err,result);
                    if(err){
                        cb(err);
                    }else{
                        gold = result;
                        cb(null);
                    }
                })
            }else{
                cb(null);
            }
            
        }],
        getSilver:['getHighest',function(cb){
            if(comm.length == 3){
                var sql = "select c.icon as categoryIcon ,c.image as categoryImage,s.id,s.name,s.logo,cml.name as categoryName ,cml.category_id  from supplier_category sc join supplier s on s.id = sc.supplier_id join categories_ml cml on cml.category_id = sc.category_id " +
                    " join categories c on c.id =cml.category_id  where sc.commission = ? and sc.category_id = ? GROUP BY s.id";
                multiConnection[dbName].query(sql,[comm[2].commission,data.id],function(err,result){
                  //  console.log("..........silver,..............................",err,result);
                    if(err){
                        cb(err);
                    }else{
                        silver = result;
                        cb(null);
                    }
                })   
            }else{
                cb(null);
            }
        }]
    },function(err,result){
        if(err){
            callback(err);
        }else{
             callback(null,{silver:silver,gold:gold,platinum:platinum})
        }
    })
    
}


/*exports.supplierRefresh = function(req,res){
    var products;
    async.auto({
        getAllProduct:function(cb){
            var sql = "select p.price_unit,p.bar_code,p.sku,p.category_id,p.sub_category_id,p.detailed_sub_category_id,p.commission_type," +
                " p.commission ,p.commission_package,p.recurring_possible,p.scheduling_possible,p.is_package,p.is_live,p.is_deleted,p.is_global," +
                " p.added_by,p.created_by,p.approved_by_supplier,p.approved_by_admin,p.pricing_type from product p where p.is_global = ?";
            multiConnection[dbName].query(sql,[1],function(err,result){
                if(err){
                    cb(err);
                }else{
                    products = result;
                    cb(null);
                }
            })
        },
        getAllImages:['getAllProduct',function(cb){
            var len = products.length;
            var temp = [];
            if(len == 0){
                cb(null)
            }
            for(var i = 0;i<len;i++){
                (function(i){
                    var sql = "select image_path,imageOrder from product_image where product_id = ?";
                    multiConnection[dbName].query(sql,[products[i].id],function(err,result){
                        if(err){
                            cb(err);
                        }else{
                            var leng = result.length;
                            for(var j = 0;j<leng;j++){
                                (function(j){
                                    temp.push({image:result[j].image_path,imageOrder:result[j].imageOrder})
                                }(j));
                            }
                            if(j == (leng -1)){
                                products[i].images = temp;
                            }
                            
                            if((i == (len -1)) && (j == (leng -1))){
                                cb(null);
                            }
                        }
                    })
                }(i));
            }
        }],
        getName:['getAllProduct',function(cb){
            var len = products.length;
            for(var i =0;i<len;i++){
                (function(i){
                    var sql = "select language_id,name,product_id,product_desc,measuring_unit from product_ml where product_id = ?";
                    multiConnection[dbName].query(sql,[products[i].id],function(err,result){
                        if(err){
                            cb(err)
                        }else{
                            if(result.length){
                                if(result[0].language_id == 14){
                                    products[i].englistName = result[0].name;
                                    products[i].englishproduct_desc = result[0].product_desc;
                                    products[i].englishmeasuring_unit = result[0].measuring_unit;
                                }else{
                                    products[i].arabicName = result[0].name;
                                    products[i].arabicproduct_desc = result[0].product_desc;
                                    products[i].arabicmeasuring_unit = result[0].measuring_unit;

                                }
                                if(result[0].language_id == 15){
                                    products[i].arabicName = result[1].name;
                                    products[i].arabicproduct_desc = result[1].product_desc;
                                    products[i].arabicmeasuring_unit = result[1].measuring_unit;
                                }else{
                                    products[i].englistName = result[1].name;
                                    products[i].englishproduct_desc = result[1].product_desc;
                                    products[i].englishmeasuring_unit = result[1].measuring_unit;

                                }
                            }
                        }
                        if(i == (len -1)){
                            cb(null)
                        }
                    })
                }(i));
            }
        }],
        updateBranch:['getName',function(cb){
            supplierProductAssign(products,req.body.supplierId,function(err,result){
                if(err){
                    cb(err);
                }else{
                    cb(null);
                }
            })
        }]
    },function(err,result){
        if(err){
            sendResponse.somethingWentWrongError(res);
        }else{
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })
}*/

/*
function insertBranchRefresh(res, supplierId,areaId, supplierBranchId,callback) {

    var supplierData;
    var supplierCategory;
    var supplierProduct;



    var newProduct = [];
    async.auto({
        getSupplierProduct:function(cb){
            var sql='select category_id,sub_category_id,detailed_sub_category_id,product_id,delivery_charges,original_product_id from supplier_product where supplier_id = ? and is_deleted = 0';
            multiConnection[dbName].query(sql,[supplierId],function (err,result) {
                if(err){
                    cb(err);
                }
                else{
                    supplierProduct = result;
                    cb(null);
                }
            })
        },
        insertNewproduct:['getSupplierProduct',function(cb){
            var len = supplierProduct.length;
            if(len == 0){
                cb(null)
            }

            for(var i =0;i < len;i++){
                (function(i){
                    insertNewData(supplierProduct[i],function(err,result){
                        if(err){
                            cb(err);
                        }else{
                            supplierProduct[i].newProduct = result;
                            if(i == (len -1)){
                                cb(null);
                            }
                        }
                    })
                }(i));
            }
        }],
        insertBranchProduct:['insertNewproduct',function(cb){

            console.log("...............insert branch product..........");
            var nameLength = supplierProduct.length;
            //  console.log(nameLength);
            var queryString = "(?,?,?,?,?,?,?),";
            var insertString = "";
            var values = [];

            if(nameLength == 0){
                cb(null);
            }


            for (var i = 0; i < nameLength; i++) {
                (function (i){
                    insertString = insertString + queryString;
                    console.log("........................supplierProduct[i]...............................",supplierProduct[i]);
                    values.push(supplierBranchId,supplierProduct[i].category_id, supplierProduct[i].sub_category_id, supplierProduct[i].detailed_sub_category_id, supplierProduct[i].newProduct, supplierProduct[i].delivery_charges, supplierProduct[i].original_product_id);
                    if (i == (nameLength - 1)){

                        console.log(".......................values......................",values);

                        insertString = insertString.substring(0, insertString.length - 1);
                        var sql = "insert into supplier_branch_product(supplier_branch_id,category_id,sub_category_id,detailed_sub_category_id,product_id,delivery_charges,original_product_id) values " + insertString;
                        multiConnection[dbName].query(sql, values, function (err, result) {
                            if (err) {
                                cb(err);
                            }
                            else {
                                cb(null);
                            }
                        })
                    }
                }(i))
            }
        }],
        insertSupplierBranchAreaProduct:['getSupplierProduct',,'insertNewproduct',function(cb){
            var productLength = supplierProduct.length;
            var areaLength = areaId.length;

            if(areaLength == 0){
                cb(null);
            }
            if(productLength == 0){
                cb(null);
            }
            for(var i =0;i<areaLength;i++){
                (function(i){
                    supplierBranchData(supplierProduct,areaId[i],supplierBranchId,function(err,result){
                        if(err){
                            cb(err);
                        }else{
                            if(i == (areaLength -1)){
                                cb(null);
                            }
                        }
                    })
                }(i));
            }
        }]
    },function(err,result){
        if(err){
            callback(err);
        }else{
            console.log("....bdfgb............................................final...");
            callback(null);
        }
    })
}*/
