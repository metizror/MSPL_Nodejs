
var async = require('async');
var sendResponse = require('./sendResponse');
var constant = require('./constant');
var func = require('./commonfunction');
var _ = require('underscore');
var something = "Something went wrong";
var client = require('twilio')("AC4b6d9ecd84afd6db7cf9ac5f055d7784","782e67bf1f26170706acd639d757ae08");
var moment = require('moment');
var pushNotifications = require('./pushNotifications');
var orderFunction = require('./orderFunction');
var AdminMail = "ops@royo.com";
const Execute = require('../lib/Execute');

//var AdminMail = "mohit.codebrew@gmail.com"
//var AdminMail = "pargat@code-brew.com"

var emailTemp = require('./email');
var log4js=require("log4js")
var logger = log4js.getLogger();
logger.level = 'debug';
const Universal = require('../util/Universal');

exports.createNewPromo = async (req,res)=> {

    var matchFind = true;
    let discount_percentage_by_admin =  req.body.discount_percentage_by_admin != undefined || null || ""?req.body.discount_percentage_by_admin : 0;
    let discount_percentage_by_supplier =  req.body.discount_percentage_by_supplier != undefined || null || ""?req.body.discount_percentage_by_supplier : 0;
    req.body.discountPrice   = req.body.discountPrice != undefined || null ||""? req.body.discountPrice : 0.0;
    let promo_buy_x_quantity =req.body.promo_buy_x_quantity != undefined || null ||""? req.body.promo_buy_x_quantity : 0;
    let promo_get_x_quantity = req.body.promo_get_x_quantity != undefined || null ||""? req.body.promo_get_x_quantity : 0;
    
    let max_discount_value = req.body.max_discount_value != undefined || null ||""? req.body.max_discount_value : 0;

    let created_by = req.body.created_by != undefined || null ||""? req.body.created_by : "";

    let buy_x_get_x_arr =  req.body.buy_x_get_x_arr != undefined || null ||""? req.body.buy_x_get_x_arr : "";
    let max_buy_x_get  = req.body.max_buy_x_get != undefined || null || ""?req.body.max_buy_x_get :"";
    // let max_discount_value = req.body.max_discount_value!==undefined?req.body.max_discount_value:0;
    var details  = [];
    var region_ids= null, category_ids= null, product_ids=null;
    let is_voucher = req.body.is_voucher!==undefined?req.body.is_voucher:0
    if(req.body.region_ids != null|| undefined||""){
     region_ids  = req.body.region_ids;   
    for(let id  of region_ids ){
        let result = [];
        var sql='select id , name  from supplier where region_id= ? '
        result = await Execute.Query(req.dbName,sql,id);
        if(result && result.length > 0){
            for(let i=0; i<result.length; i++)
            details.push(result[i]);
        }
      
         
    };

     details = details.map(({id, ...rest}) => ({...rest, supplierId: id}));

     req.body.details  = details;
      region_ids =  region_ids.toString().replace('[', '');
      region_ids =  region_ids.toString().replace(']', '');
   
   }
   if(req.body.category_ids !=null|| undefined||"" ){  
     category_ids = req.body.category_ids.toString().replace('[','');
     category_ids = category_ids.toString().replace(']','');
   }
   if(req.body.product_ids !=null|| undefined||"" ){  
    product_ids = req.body.product_ids.toString().replace('[','');
    product_ids = product_ids.toString().replace(']','');
  }
  
   
    async.auto({
        checkData:function(cb){
            // if (!(req.body.promoType)) {
            //     var msg = "promoType not found";
            //     return sendResponse.sendErrorMessage(msg, res, 400);
            // }

            if (!(req.body.name)) {
                var msg = "name not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }

            if (!(req.body.desc)) {
                var msg = "desc not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }

            if (!(req.body.promoCode)) {
                var msg = "promoCode not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }

            if (!(req.body.maxUser)) {
                var msg = "maxUser not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (!(req.body.minPrice)) {
                var msg = "minPrice not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }

            if (!(req.body.perUserCount)) {
                var msg = "perUserCount not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }


            if (!(req.body.endDate)) {
                var msg = "endDate not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }

            if (!(req.body.startDate)) {
                var msg = "startDate not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }

            // if (!(req.body.discountPrice)) {
            //     var msg = "discountPrice not found";
            //     return sendResponse.sendErrorMessage(msg, res, 400);
            // }

            // if (!(req.body.promo_level)) {
            //     var msg = "promo_level not found";
            //     return sendResponse.sendErrorMessage(msg, res, 400);
            // }

            if (req.body.discountType==null && req.body.discountType==undefined) {
                var msg = "discountType not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }

            // if (!(req.body.discountType)) {
            //     var msg = "discountType not found";
            //     return sendResponse.sendErrorMessage(msg, res, 400);
            // }

            if (!(req.body.firstTime)) {
                var msg = "firstTime not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }

            if (!(req.body.bear_by) && (req.body.bear_by==undefined) && (req.body.bear_by==null)) {
                var msg = "bear_by not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            
            if (!(req.body.commission_on) && (req.body.commission_on==undefined) && (req.body.commission_on==null)) {
                var msg = "commission_on not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
           cb(null)

        },
        checkName:['checkData',function(cb){
            logger.debug("=============in the checkName ======================");
            var sql='select * from promoCode where promoCode = ? and isDeleted=? '
            var statement = multiConnection[req.dbName].query(sql, [req.body.promoCode,0], function (err, result) {
                if (err) {
                    logger.debug("==========errrrrr==============",statement.sql,err);
                    var msg = "db error"
                    sendResponse.sendErrorMessage(msg,res,500);
                }
                else {
                    logger.debug("==============else of checkName===========");
                    if(result.length){
                        logger.debug("==============else ==if=======of checkName===========");

                        matchFind = true;
                        cb(null);
                    }else{
                        logger.debug("==============else ==if===else====of checkName===========");

                        matchFind = false;
                        cb(null);
                    }
                }
            })
        }],
        createPromo:['checkName',function(cb){
            logger.debug("===========in the create promo =============")
            if(matchFind == true){
                cb(null)
            }else{
                logger.debug("=========req.body.details===============", req.body.details)

               
               if(req.body.details.length > 0 && req.body.details != undefined || null||""){

                     let tempData = req.body.details;    
                     let len = tempData.length;
                     logger.debug("==========else of createPromo==len=)))))))))))))))))))))==", len);
     
                     let detailsTemp = req.body;
                     let saveData = JSON.stringify(tempData);
                     for(var i =0;i<len;i++){
                         (function(i){

                        logger.debug("===========in the loop====details========  ", details);
                        var sql = `insert into promoCode (is_voucher,max_discount_value,
                            max_buy_x_get, buy_x_get_x_arr,  promo_buy_x_quantity,
                             promo_get_x_quantity,  product_ids, promo_level,
                              discount_percentage_by_admin, discount_percentage_by_supplier,
                                name,promoCode,maxUsers,minPrice,perUserCount,endDate,
                                discountPrice,discountType,category,supplierId,promoType,
                                startDate,detailsJson,promoDesc,firstTime,bear_by,commission_on,
                                 region_ids,category_ids,created_by )
                                 values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
                       var statement = multiConnection[req.dbName].query(sql,
                         [is_voucher,max_discount_value,max_buy_x_get, buy_x_get_x_arr, 
                             promo_buy_x_quantity, promo_get_x_quantity, product_ids, 
                             req.body.promo_level, discount_percentage_by_admin, 
                             discount_percentage_by_supplier,  detailsTemp.name,
                             detailsTemp.promoCode,detailsTemp.maxUser,
                             detailsTemp.minPrice,detailsTemp.perUserCount,
                             moment(detailsTemp.endDate).format('YYYY-MM-DD'),
                             detailsTemp.discountPrice,detailsTemp.discountType,
                             detailsTemp.details[i].categoryId,
                             detailsTemp.details[i].supplierId,
                             detailsTemp.promoType,
                             moment(detailsTemp.startDate).format('YYYY-MM-DD'),
                             saveData,detailsTemp.desc,req.body.firstTime,
                             detailsTemp.bear_by,detailsTemp.commission_on,
                              region_ids,category_ids,created_by], function (err, result) {
                        logger.debug("===========in the error of createPromo=========  ",statement.sql, err); 
                        if (err) {
                               console.log("=========db err=========",err)
                                  var msg = "db error"
                                  sendResponse.sendErrorMessage(msg,res,500);
                              }
                              else {
                                  logger.debug("===============in the else part of createPromo ==========")
                                  if(i == (len -1)){
                                    logger.debug("===============in the if* part of createPromo ==========")

                                      cb(null)
                                  }
                              }
                        })
                         }(i));
                     }

                } 
               else if(req.body.category_ids && req.body.category_ids != undefined|| null||""){
                      let tempData = req.body.category_ids;    
                      let len = tempData.length;
                      logger.debug("==========else of createPromo==len===", len)
      
                      let detailsTemp = req.body;
                      let saveData = JSON.stringify(tempData);
                      for(var i =0;i<len;i++){
                                (function(i){
                                    logger.debug("===========in the loop============  ",i);
                                    var sql = "insert into promoCode (is_voucher,max_discount_value,max_buy_x_get, buy_x_get_x_arr, promo_buy_x_quantity, promo_get_x_quantity,  product_ids, region_ids, promo_level, discount_percentage_by_admin, discount_percentage_by_supplier,   category_ids,  name,promoCode,maxUsers,minPrice,perUserCount,endDate,discountPrice,discountType,category,supplierId,promoType,startDate,detailsJson,promoDesc,firstTime,bear_by,commission_on)values(?,?,?,?,?,?,?,?,?,?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
                                    var statement = multiConnection[req.dbName].query(sql, [is_voucher,max_discount_value,max_buy_x_get, buy_x_get_x_arr,  promo_buy_x_quantity, promo_get_x_quantity, product_ids, region_ids, req.body.promo_level, discount_percentage_by_admin, discount_percentage_by_supplier,  category_ids, detailsTemp.name,detailsTemp.promoCode,detailsTemp.maxUser,detailsTemp.minPrice,detailsTemp.perUserCount,moment(detailsTemp.endDate).format('YYYY-MM-DD'),detailsTemp.discountPrice,detailsTemp.discountType,0, 0,detailsTemp.promoType,moment(detailsTemp.startDate).format('YYYY-MM-DD'),saveData,detailsTemp.desc,req.body.firstTime,detailsTemp.bear_by,detailsTemp.commission_on], function (err, result) {
                                        if (err) {
                                            logger.debug("===========in the error of createPromo=========  ",statement.sql,err);
                                                var msg = "db error"
                                                sendResponse.sendErrorMessage(msg,res,500);
                                            }
                                            else {
                                                logger.debug("===============in the else part of createPromo ==========")
                                                if(i == (len -1)){
                                                logger.debug("===============in the if* part of createPromo ==========")

                                                    cb(null)
                                                }
                                            }
                                    })
                    }(i));
                      }
               } 
            }
           
        }],
        sendPushNotification:['createPromo',async(cb)=>{
            let sendPushToAllUserOnPromoAdd = await Execute.Query(req.dbName,
                "select `key`, value from tbl_setting where `key`=? and value=1",["sendPushToAllUserOnPromoAdd"]);
        if(sendPushToAllUserOnPromoAdd && sendPushToAllUserOnPromoAdd.length>0){
            let fcm_server_key = await Universal.getFcmServerKey(req.dbName);
            if(fcm_server_key!=""){
                fcm_server_key=fcm_server_key
            }else{
                fcm_server_key = config.get('server.fcm_server_key')
            }
            let  sql = "select id,device_type,device_token from user";
            let result = await Execute.Query(req.dbName,sql,[]);

            let android = [];
            let userData = [];
            let data = {
                "title":req.bussinessName,
                "status": constant.pushNotificationStatus.SYSTEM_PUSH,
                "message":"A New PromoCode has been added to our platform ",
                "orderId":0
            }
            for(var i=0;i<result.length;i++){
                 
                    android.push(result[i].device_token);
                    userData.push(result[i]);
                }
            await pushNotifications.sendFcmPushNotificationInBulk(userData,
                req.dbName,fcm_server_key,android,data);
                cb(null);
        }   else {
            cb(null);
        }             
           
        }]
    },function(err,result){
        console.log("&&&&&&&&&&& ERr", err);
        
        if(err) {
            var msg = err;
            sendResponse.sendErrorMessage(msg,res,500);
        }else{
            if(matchFind == true){
                var msg = "already exists" +req.body.promoCode + "code";
                sendResponse.sendErrorMessage(msg,res,2);
            }else{
                sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res,4); 
            }
        }
    })

};
exports.listPromo = function(req,res) {
    var data;
    var count;
    var is_all = req.body.is_all;
    var limit = parseInt(req.body.limit);
    var offset = parseInt(req.body.offset)
    var search = req.body.search;
    var startDate=req.body.startDate||'1990-01-01';
    var endDate=req.body.endDate||'2100-01-01';
    var order_by = req.body.order_by;
    let region_ids = req.body.region_ids;
    let category_ids =  req.body.category_ids;
    let product_ids =  req.body.product_ids;

    let region_ids_condition = '';
    let category_ids_condition = '';
    let product_ids_condition = '';

    if(category_ids != undefined && category_ids != null  && category_ids != "")
        category_ids_condition = "AND category_ids  LIKE '%"+category_ids+"%' ";
    
   if(region_ids != undefined && region_ids != null  && region_ids !="")
    region_ids_condition = "AND region_ids  LIKE '%"+region_ids+"%' ";

    if(product_ids != undefined &&  product_ids !=  null  && product_ids != "")
    product_ids_condition = "AND product_ids  LIKE '%"+product_ids+"%' ";
    
    if(search != undefined   && search != null &&   search != ""){
        logger.debug("===============in t========", search)
     search  = " AND name LIKE %"+search+"% AND promoCode LIKE %"+search+"% ";
      
    }

    var order;
 
    if (order_by == 1) {
            order = "order by perUserCount desc"
    } else if (order_by == 2) {
            order = "order by maxUsers desc"
    } else {
            order = "order by  id desc"
    }
    async.auto({
        checkParameter:function(cb){
            if(!(req.body.limit)) {
                var msg = "limit not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }else{
                cb(null);
            }
        },
        findPromo:['checkParameter',function(cb){
            if(is_all==1){
                var sql = "select * from promoCode where isDeleted = 0  "+product_ids_condition+"  "+region_ids_condition+"   "+category_ids_condition+"  "+search+"   AND   DATE(startDate)>='"+startDate+"' AND DATE(endDate)<='"+endDate+"'  group by promoCode limit ?,? ";
            }else if(is_all==2){
                var sql ="select * from promoCode where firstTime = 0   "+product_ids_condition+"  "+region_ids_condition+"  "+category_ids_condition+"  AND   isDeleted = 0    "+search+"  AND DATE(startDate)>="+startDate+" AND DATE(endDate)<="+endDate+"  group by promoCode "+order+" limit ?,?";
            }else if(is_all==3){
                var sql ="select * from promoCode where firstTime = 1  "+product_ids_condition+" "+region_ids_condition+"   "+category_ids_condition+"  AND   isDeleted = 0  "+search+"  AND DATE(startDate)>="+startDate+" AND DATE(endDate)<="+endDate+"  group by promoCode limit ?,?" 
            }
            let stmt = multiConnection[req.dbName].query(sql, [offset,limit], function (err, result) {
                logger.debug("===========sql in findPromo=========",stmt.sql)
                if (err) {
                    logger.debug("+============daberr------------",err)
                     var msg = " db error"
                    sendResponse.sendErrorMessage(msg,res,500);
                } else {
                    data = result;
                    cb(null)
                }
            })
        }],
        countPromo:['findPromo',function(cb){
            var sql ="SELECT DISTINCT(promoCode) FROM promoCode where isDeleted = 0 "+product_ids_condition+"  "+region_ids_condition+"   "+category_ids_condition+" ";
            multiConnection[req.dbName].query(sql,function (err, result) {
                if (err) {
                    logger.debug("+============daberr--------2----",err)
                    var msg = "db error"
                    sendResponse.sendErrorMessage(msg,res,500);
                } else {
                    if(result.length){
                        count =result.length
                        cb(null)
                    } else {
                        count = 0
                        cb(null)
                    }
                }
            })
        }]
    },function(err,result){
        if(err){
            var msg = err;
            sendResponse.sendErrorMessage(msg,res,500);
        }else{
              sendResponse.sendSuccessData({data:data,count:count}, constant.responseMessage.SUCCESS, res,4);
        }
    })
}


exports.serachPromo = function(req,res){

    var data;
    var count;
    async.auto({
        checkParameter:function(cb){
            if (!(req.body.skip)){
                var msg = "skip not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }else{
                cb(null);
            }

            if (!(req.body.searchText)) {
                var msg = "searchText not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }else{
                cb(null);
            }
        },
        serachPromo:['checkParameter',function(cb){
            var sql ='select * from promoCode where promoCode  IN((SELECT DISTINCT(promoCode) FROM promoCode where promoCode LIKE '+req.body.searchText+'))';
            multiConnection[req.dbName].query(sql, [req.body.skip], function (err, result) {
                if (err) {
                    var msg = "db error"
                    sendResponse.sendErrorMessage(msg,res,500);
                }
                else {
                    data = result;
                    cb(null)
                }
            }) 
        }]
    },function(err,result){
        if(err){
            var msg = err;
            sendResponse.sendErrorMessage(msg,res,400);
        }else{
            sendResponse.sendSuccessData({data:data}, constant.responseMessage.SUCCESS, res,4);

        }
    })
}


exports.startPromo = function(req,res){
    async.auto({
        startDate:function(cb){
            var sql = "update promoCode set startDate = ?  where id = ?";
            multiConnection[req.dbName].query(sql,[req.body.startDate,req.body.id],function (err, result) {
                if (err) {
                    var msg = "db error"
                    sendResponse.sendErrorMessage(msg,res,500);
                }
                else {
                    cb(null)
                }
            })
        }
    },function(err,result){
        if(err){
            var msg = err;
            sendResponse.sendErrorMessage(msg,res,500);
        }else{
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res,4);
        }
    })
}

exports.checkPromo = function(req,res){
    var count = 0;
    var promoUserUsed ;
    var promoDetails;
    var matchPromo = false;
    var promoType = 0;
    var userId;
    var categoryMatch = false;
    var supplierMatch = false;
    var totalUserUsed = 0;
    var discountAmount = 0;
    var crossTotalLimit = false;
    var lessPrice = false;
    var perUserLimit = false;
    var supplierIndex = 0;
    var validUser = 0;
    var categoryIndex;
    
    async.auto({
        checkParameter:function(cb){
            if(!(req.body.promoCode)) {
                var msg = "promoCode not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }else{
                count++
            }
            if (!(req.body.totalBill)) {
                var msg = "totalBill not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }else{
                count++;
            }

            if (!(req.body.supplierId)) {
                var msg = "supplierId not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }else{
                count++
            }


            if (!(req.body.categoryId)) {
                var msg = "categoryId not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }else{
                count++;
            }

            if (!(req.body.accessToken)) {
                var msg = "accessToken not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }else{
                count++;
            }
            if (!(req.body.langId)) {
                var msg = "langId not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }else{
                count++;
            }

         cb(null)
        },
        getUserId:['checkParameter',function(cb){
            var sql ='select id from user where access_token = ? ';
            multiConnection[req.dbName].query(sql, [req.body.accessToken], function (err, result) {

                if (err) {
                    var msg = "db error"
                    sendResponse.sendErrorMessage(msg,res,500);
                }
                else {
                    if(result && result.length){
                        userId = result[0].id
                        cb(null)
                    } else {
                        var msg = "Invalid user id"
                        cb(msg)
                    }
                }
            })
        }],
        checkUserOrder:['getUserId',function(cb){
            var sql ='select id from orders where user_id = ?';
            multiConnection[req.dbName].query(sql, [userId], function (err, result) {
               console.log("...........................userdid............",err,result);
                if (err) {
                    var msg = "db error"
                    sendResponse.sendErrorMessage(msg,res,500);
                }
                else {
                    if(result && result.length){
                        validUser = result.length
                        cb(null)
                    }else{
                        validUser = 0;
                        cb(null)
                    }
                }
            })
        }],
        checkUserLimit:['getUserId',function(cb){
            var sql ='select userId from order_promo where promoCode = ? and userId = ? and redeemPromo = 1';
            multiConnection[req.dbName].query(sql, [req.body.promoCode,userId], function (err, result) {
                 if (err) {
                    var msg = "db error"
                     cb(msg)
                     //sendResponse.sendErrorMessage(msg,res,500);
                }
                else {
                     if(result && result.length){
                        promoUserUsed = result.length
                        cb(null)
                    }else{
                        promoUserUsed = 0;
                        cb(null)
                    }
                }
            })
        }],
        totalUserUsed:['getUserId',function(cb){
            var sql ='select userId from order_promo where promoCode = ? and redeemPromo = 1';
            multiConnection[req.dbName].query(sql, [req.body.promoCode], function (err, result) {
                if (err) {
                    var msg = "db error"
                    cb(msg)
                    //  sendResponse.sendErrorMessage(msg,res,500);
                }
                else {
                    if(result && result.length){
                        totalUserUsed = result.length
                        cb(null)
                    } else {
                        totalUserUsed = 0;
                        cb(null)
                    }
                }
            })
        }],
        checkPromo:['checkUserLimit',function(cb){
            var sql ='select * from promoCode where promoCode = ? and isActive = 0 and isDeleted = 0 and (DATE(startDate) <= CURDATE() and DATE(endDate) >= CURDATE())';
          
            multiConnection[req.dbName].query(sql, [req.body.promoCode], function (err, result) {
                console.log("...........................checkPromo............",err,result);

                if (err) {
                    var msg = "db error"
                    cb(msg)
                    // sendResponse.sendErrorMessage(msg,res,500);
                }
                else {
                    if(result && result.length){
                        promoDetails = result;
                        promoType = promoDetails[0].promoType
                         cb(null)
                    }else{
                        if(req.body.langId == 14){
                            var msg = "Promo Code is not Valid "
                            cb(msg)
                            //sendResponse.sendErrorMessage(msg,res,400);
                        }else{
                            var msg = "قسيمة الخصم غير صحيحة"
                            cb(msg)
                            //sendResponse.sendErrorMessage(msg,res,400);
                        }
                    }
                }
            })
        }],
        // checkCategory:['checkPromo',function(cb){
        //     var len = promoDetails.length;
        //     var catData=[];
        //     if(Array.isArray(catData)){
        //         catData=req.body.categoryId;
        //         // catData.push(req.body.categoryId)
        //     }
        //     else{
        //         catData.push(req.body.categoryId)
        //     }

        //     var sql = 'select * from promoCode where promoCode = ? and isActive = 0 and isDeleted = 0  and category IN(?)';
            
        //     multiConnection[dbName].query(sql, [req.body.promoCode,catData], function (err, results) {

        //         console.log("...........................checkSupplier............",err,results);

        //         if (err) {
        //             var msg = "db error"
        //             cb(msg)
        //             //sendResponse.sendErrorMessage(msg,res,500);
        //         }
        //         else{
        //             if(results && results.length>0){
        //                 if(results.length==catData.length){
        //                     cb(null)
        //                 }
        //                 else{
        //                     if(req.body.langId == 14){
        //                         var msg = "Voucher Code is not Valid "
        //                         cb(msg)
        //                          //sendResponse.sendErrorMessage(msg,res,400);
        //                      } else{
        //                         var msg = "قسيمة الخصم غير صحيحة"
        //                          cb(msg)
        //                          //sendResponse.sendErrorMessage(msg,res,400);
        //                      }
        //                 }
        //             }
        //             else{
        //                 if(req.body.langId == 14){
        //                     var msg = "Voucher Code is not Valid "
        //                     cb(msg)
        //                      //sendResponse.sendErrorMessage(msg,res,400);
        //                  } else{
        //                     var msg = "قسيمة الخصم غير صحيحة"
        //                      cb(msg)
        //                      //sendResponse.sendErrorMessage(msg,res,400);
        //                  }
        //             }
        //         }
           
           
        //     })
        //     // for(var i =0 ;i < len;i++){
        //     //     (function(i){
        //     //         if(promoDetails[i].category == req.body.categoryId){
        //     //            categoryIndex = i ;
        //     //             supplierIndex = promoDetails[i].id;
        //     //             categoryMatch = true;
        //     //         }
        //     //         if(i == (len -1)){
        //     //             if(categoryMatch == false){
        //     //                 if(req.body.langId == 14){
        //     //                     var msg = "Voucher Code is not Valid "
        //     //                     cb(msg)
        //     //                     //sendResponse.sendErrorMessage(msg,res,400);
        //     //                 }else{
        //     //                     var msg = "قسيمة الخصم غير صحيحة"
        //     //                     cb(msg)
        //     //                     // sendResponse.sendErrorMessage(msg,res,400);
        //     //                 }
        //     //             }else{
        //     //                 cb(null)
        //     //             }
        //     //         }
        //     //     }(i));
        //     // }
        // }],
        checkSupplier:['checkPromo',function(cb){
             cb(null)
            // if(promoType == 0){
            //         var supplierData=[];
            //         if(Array.isArray(catData)){
            //             supplierData=req.body.supplierId;
            //         }                    
            //         if(categoryMatch == false){
            //             if(req.body.langId == 14){
            //                 var msg = "Voucher Code is not Valid "
            //                 cb(msg)
            //                 //sendResponse.sendErrorMessage(msg,res,400);
            //             }else{
            //                 var msg = "قسيمة الخصم غير صحيحة"
            //                 cb(msg)
            //                 // sendResponse.sendErrorMessage(msg,res,400);
            //             }
            //         }else{
            //             cb(null)
            //         }                                    
            // }
        }],
        checkSupplier:['checkPromo',function(cb){
            if(promoType == 0){
                var sql = 'select * from promoCode where promoCode = ? and isActive = 0 and isDeleted = 0  and category = ? and supplierId = ?';
                multiConnection[req.dbName].query(sql, [req.body.promoCode,req.body.categoryId,req.body.supplierId], function (err, result) {
                    console.log("...........................checkSupplier............",err,result);

                    if (err) {
                        var msg = "db error"
                        cb(msg)
                        //sendResponse.sendErrorMessage(msg,res,500);
                    }
                    else {
                        if(result && result.length){
                            supplierIndex = result[0].id;
                            supplierMatch = true;
                            cb(null)
                       }else{
                            if(req.body.langId == 14){
                               var msg = "Promo Code is not Valid "
                               cb(msg)
                                //sendResponse.sendErrorMessage(msg,res,400);
                            } else{
                               var msg = "قسيمة الخصم غير صحيحة"
                                cb(msg)
                                //sendResponse.sendErrorMessage(msg,res,400);
                            }
                        }
                    }
                })
            }else{
                cb(null)
            }
        }],
        checkData:['checkSupplier','checkCategory','totalUserUsed',function(cb){
            var count = 0;
            console.log(".....validUser != 0.........",validUser);
            console.log("..... promoDetails[0].firstTime .........",promoDetails[0].firstTime);


            if(validUser == 0 && promoDetails[0].firstTime == 1){
                if((promoDetails[0].minPrice != 0) && (promoDetails[0].minPrice >=  req.body.totalBill)){
                    lessPrice  = true
                        cb(null)
                }else{
                        cb(null)
                }
            }else if(promoDetails[0].firstTime == 0 || promoDetails[0].firstTime == null){
                
                if((promoDetails[0].maxUsers != 0) && (promoDetails[0].maxUsers <=  totalUserUsed)){
                    crossTotalLimit = true;
                    count++
                    if(count == 2){
                        cb(null)
                    }
                } else{
                    count++;
                    if(count == 2){
                        cb(null)
                    }
                }

                if((promoDetails[0].perUserCount != 0) && (promoDetails[0].perUserCount <=  promoUserUsed)){
                    perUserLimit = true
                    count++
                    if(count == 2){
                        cb(null)
                    }
                }else{
                    count++
                    if(count == 2){
                        cb(null)
                    }
                }
                if((promoDetails[0].minPrice != 0) && (promoDetails[0].minPrice >=  req.body.totalBill)){
                    lessPrice  = true
                    count++
                    if(count == 2){
                        cb(null)
                    }
                }else{
                    count++
                    if(count == 2){
                        cb(null)
                    }
                }

            }else{
                if(req.body.langId == 14){
                    var msg = "Promo Code is not Valid "
                    cb(msg)
                    //sendResponse.sendErrorMessage(msg,res,400);
                }else{
                    var msg = "قسيمة الخصم غير صحيحة"
                    cb(msg)
                    //sendResponse.sendErrorMessage(msg,res,400);
                }
            }
        }],
        calculatePrice:['checkData',function(cb){
            if(lessPrice == true || perUserLimit == true || crossTotalLimit == true){
                cb(null)
            }else{
                if(promoDetails[0].discountType == 1){
                    discountAmount =  (req.body.totalBill * promoDetails[0].discountPrice) / 100;
                    cb(null)
                }else{
                    discountAmount = promoDetails[0].discountPrice
                    cb(null)
                }
            }
        }]
    },function(err,result){
        console.log(".................err................",err);
        if(err){
            var msg = err;
            sendResponse.sendErrorMessage(msg,res,500);
        }else{
            if(crossTotalLimit == true || perUserLimit == true){
                console.log("...limit.........cross........................");
                if (req.body.langId == 14){
                    var msg = "Promo Code is already used"
                    sendResponse.sendErrorMessage(msg,res,400);
                } else{
                    var msg = " لقد تم استخدام قسيمة الخصم مسبقا"
                    sendResponse.sendErrorMessage(msg,res,400);
                }
            }else if(lessPrice == true){
                if (req.body.langId == 14){
                    var msg = "The Min order to Redeem the Discount voucher is AED " +promoDetails[0].minPrice
                    sendResponse.sendErrorMessage(msg,res,400);
                } else{
                    var msg =  "الحد الادنى للطلب لأستخدام الخصم هو - -"+promoDetails[0].minPrice+" درهم"
                    sendResponse.sendErrorMessage(msg,res,400);
                }

            }else if (promoType == 0){
                sendResponse.sendSuccessData({discountAmount:discountAmount,id:supplierIndex}, constant.responseMessage.SUCCESS, res,4);
            }else{
                sendResponse.sendSuccessData({discountAmount:discountAmount,id:supplierIndex}, constant.responseMessage.SUCCESS, res,4);
            } 
        }
    })
}

exports.listPromoUser = function(req,res){
    var promoDetails = [];
    async.auto({
        checkParameter:function(cb){
            if(!(req.body.promoCode)) {
                var msg = "promoCode not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }else{
                cb(null)
            }
        },
        getDetails:['checkParameter',function(cb){
            var sql ='select s.name,u.email,u.lastname,u.firstname,op.userId' +
                ' ,op.supplierId,op.orderId,op.promoId,op.promoCode,' +
                'op.totalAmount,op.discountAmount from order_promo op join user u on u.id = op.userId   ' +
                ' join supplier s on s.id = op.supplierId where op.promoCode = ?';
            multiConnection[req.dbName].query(sql, [req.body.promoCode], function (err, result) {
               
               console.log(".......req.body.promoCode.......",result);
                if (err) {
                    var msg = "db error"
                    sendResponse.sendErrorMessage(msg,res,500);
                }
                else {
                    if(result.length){
                        promoDetails = result;
                        cb(null)
                    }else{
                     cb(null)
                    }
                }
            })
        }]
    },function(err,result){
        if(err){
            var msg = err;
            sendResponse.sendErrorMessage(msg,res,500);
        }else{
            sendResponse.sendSuccessData({promoDetails:promoDetails}, constant.responseMessage.SUCCESS, res,4);
        }
    })
}

exports.deletePromo = function(req,res){
    async.auto({
        checkParameter:function(cb){
            if(!(req.body.id)) {
                var msg = "id not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }else{
                cb(null)
            }
        },
        deletePromo:['checkParameter',function(cb){
            var sql = "update promoCode set isDeleted = ?  where promoCode = ?";
            multiConnection[req.dbName].query(sql,[1,req.body.id],function (err, result) {
                if (err) {
                    var msg = "db error"
                    sendResponse.sendErrorMessage(msg,res,500);
                }
                else {
                    cb(null)
                }
            })
        }]
    },function(err,result){
        if(err){
            var msg = err;
            sendResponse.sendErrorMessage(msg,res,500);
        }else{
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res,4);

        }
    })
}



exports.deactivePromo = function(req,res){
    async.auto({
        checkParameter:function(cb){
            if(!(req.body.id)) {
                var msg = "id not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }else{
                cb(null)
            }
        },
        deletePromo:['checkParameter',function(cb){
            var sql = "update promoCode set isActive = ?  where promoCode = ?";
            multiConnection[req.dbName].query(sql,[req.body.status,req.body.id],function (err, result) {
                if (err) {
                    var msg = "db error"
                    sendResponse.sendErrorMessage(msg,res,500);
                }
                else {
                    cb(null)
                }
            })
        }]
    },function(err,result){
        if(err){
            var msg = err;
            sendResponse.sendErrorMessage(msg,res,500);
        }else{
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res,4);

        }
    })
}
exports.checkPromoV1 = function(req,res){
    var count = 0;
    var promoUserUsed ;
    var promoDetails;
    var matchPromo = false;
    var promoType = 0;
    var userId;
   var crossTotalLimit;
    var categoryMatch = false;
    var supplierMatch = false;
    var totalUserUsed = 0;
    var discountAmount = 0;
    var talLimit = false;
    var lessPrice = false;
    var perUserLimit = false;
    var max_buy_x_get ;
    var supplierIndex = 0;
    var validUser = 0;
    var categoryIndex;
    var categoryIds=[];
    var supplierIds=[];
    var discountType,minOrder=0,max_discount_value=0, category_ids,region_ids,product_ids,promo_level, promo_buy_x_quantity, promo_get_x_quantity, 	buy_x_get_x_arr;
    var detailsJson = [];
    async.auto({
        checkParameter:function(cb){
            if(!(req.body.promoCode)) {
                var msg = "promoCode not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }else{
                count++
            }
            if (!(req.body.totalBill)) {
                var msg = "totalBill not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }else{
                count++;
            }

            if (!(req.body.supplierId)) {
                var msg = "supplierId not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }else{
                count++
            }


            if (!(req.body.categoryId)) {
                var msg = "categoryId not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }else{
                count++;
            }

            if (!(req.body.accessToken)) {
                var msg = "accessToken not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }else{
                count++;
            }
            if (!(req.body.langId)) {
                var msg = "langId not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }else{
                count++;
            }

         cb(null)
        },
        getUserId:['checkParameter',function(cb){
            var sql ='select id from user where access_token = ? ';
            multiConnection[req.dbName].query(sql, [req.body.accessToken], function (err, result) {

                if (err) {
                    var msg = "db error"
                    sendResponse.sendErrorMessage(msg,res,500);
                }
                else {
                    if(result && result.length){
                        userId = result[0].id
                        cb(null)
                    } else {
                        var msg = "Invalid user id"
                        cb(msg)
                    }
                }
            })
        }],
        checkUserOrder:['getUserId',function(cb){
            console.log("==checkUserOrder===============")
            var sql ='select id from orders where user_id = ?';
            multiConnection[req.dbName].query(sql, [userId], function (err, result) {
               console.log("...........................userdid............",err,result);
                if (err) {
                    var msg = "db error"
                    sendResponse.sendErrorMessage(msg,res,500);
                }
                else {
                    if(result && result.length){
                        validUser = result.length
                        cb(null)
                    }else{
                        validUser = 0;
                        cb(null)
                    }
                }
            })
        }],
        checkUserLimit:['checkUserOrder',function(cb){
            console.log("==checkUserLimit===============")

            var sql ='select userId from order_promo where promoCode = ? and userId = ? and redeemPromo = 1';
            multiConnection[req.dbName].query(sql, [req.body.promoCode,userId], function (err, result) {
                 if (err) {
                    var msg = "db error"
                     cb(msg)
                     //sendResponse.sendErrorMessage(msg,res,500);
                }
                else {
                     if(result && result.length){
                        promoUserUsed = result.length
                        cb(null)
                    }else{
                        promoUserUsed = 0;
                        cb(null)
                    }
                }
            })
        }],
        totalUserUsed:['checkUserLimit',function(cb){
            console.log("==totalUserUsed===============")

            var sql ='select userId from order_promo where promoCode = ? and redeemPromo = 1';
            multiConnection[req.dbName].query(sql, [req.body.promoCode], function (err, result) {
                if (err) {
                    var msg = "db error"
                    cb(msg)
                    //  sendResponse.sendErrorMessage(msg,res,500);
                }
                else {
                    if(result && result.length){
                        totalUserUsed = result.length
                        cb(null)
                    } else {
                        totalUserUsed = 0;
                        cb(null)
                    }
                }
            })
        }],
        checkPromo:['totalUserUsed',function(cb){
            console.log("==checkPromo===============")

            var sql ='select * from promoCode where promoCode = ? and isActive = 0 and isDeleted = 0 and (DATE(startDate) <= CURDATE() and DATE(endDate) >= CURDATE())';
           
            let stmt = multiConnection[req.dbName].query(sql, [req.body.promoCode], function (err, result) {
                
                console.log("===========checkPromo=================query======",stmt.sql)
                console.log("...........................checkPromo............",err,result);

                if (err) {
                    var msg = "db error"
                    cb(msg)
                    // sendResponse.sendErrorMessage(msg,res,500);
                }
                else {

                    if(result && result.length){
                        promoDetails = result;
                        promoType = promoDetails[0].promoType
                        minOrder = promoDetails[0].minPrice
                        discountType=promoDetails[0].discountType
                        supplierIndex = result[0].id;
                        category_ids=result[0].category_ids;
                        region_ids=result[0].region_ids;
                        product_ids=result[0].product_ids;
                        promo_level=result[0].promo_level;
                        promo_buy_x_quantity=result[0].promo_buy_x_quantity;
                        promo_get_x_quantity=result[0].promo_get_x_quantity;
                        buy_x_get_x_arr	=result[0].buy_x_get_x_arr	;
                        max_buy_x_get =  result[0].max_buy_x_get;
                        max_discount_value = result[0].max_discount_value

                        detailsJson = JSON.parse(result[0].detailsJson)
                         cb(null)
                    }else{
                        var msg = "Promo Code is not Valid"
                        return sendResponse.sendErrorMessageWithTranslation(req,msg,res,400);
                        // if(req.body.langId == 14){
                        //     var msg = "Promo Code is not Valid "
                        //     cb(msg)
                        //     //sendResponse.sendErrorMessage(msg,res,400);
                        // }else{
                        //     var msg = "قسيمة الخصم غير صحيحة"
                        //     cb(msg)
                        //     //sendResponse.sendErrorMessage(msg,res,400);
                        // }
                    }
                }
            })
        }],     

        supplierOrCategoryPromo:['checkPromo',function(cb){
            console.log("==supplierOrCategoryPromo===============")

            if(promoType==1)
            {
                _.each(detailsJson,function(i){
                    categoryIds.push(i.categoryId)
                })
                cb(null)
            }
            else
            {
                _.each(detailsJson,function(i){
                    supplierIds.push(i.supplierId)
                })

                cb(null)
            }


        }],  
        checkData:['checkPromo','totalUserUsed',function(cb){
            console.log("==checkData===============")

            var count = 0;
            console.log(".....validUser != 0.........",validUser);
            console.log("..... promoDetails[0].firstTime .........",promoDetails[0].firstTime);

            if(validUser == 0 && promoDetails[0].firstTime == 1){
                    if((promoDetails[0].minPrice != 0)){
                        lessPrice  = true
                            cb(null)
                    }else{
                            cb(null)
                    }
            }
            
            else if(promoDetails[0].firstTime == 0 || promoDetails[0].firstTime == null){

                if((promoDetails[0].maxUsers != 0) && (promoDetails[0].maxUsers <=  totalUserUsed)){
                    crossTotalLimit = true;
                    count++
                    if(count == 2){
                        cb(null)
                    }
                } 
                
                else{

                    count++;
                    if(count == 2){
                        cb(null)
                    }

                }

                if((promoDetails[0].perUserCount != 0) && (promoDetails[0].perUserCount <=  promoUserUsed)){
                    perUserLimit = true
                    count++;

                    if(count == 2){
                        cb(null)
                    }

                }
                
                else{

                    count++
                    if(count == 2){
                        cb(null)
                    }


                }


                if((promoDetails[0].minPrice != 0) && (promoDetails[0].minPrice >=  req.body.totalBill))
                {
                    lessPrice  = true
                    count++
                    if(count == 2){
                        cb(null)
                    }
                }else{
                    count++
                    if(count == 2){
                        cb(null)
                    }
                }


            }else{
                var msg = "Promo Code is not Valid"
                return sendResponse.sendErrorMessageWithTranslation(req,msg,res,400);
                // if(req.body.langId == 14){
                //     var msg = "Promo Code is not Valid "
                //     cb(msg)
                //     //sendResponse.sendErrorMessage(msg,res,400);
                // }else{
                //     var msg = "قسيمة الخصم غير صحيحة"
                //     cb(msg)
                //     //sendResponse.sendErrorMessage(msg,res,400);
                // }
            }
        }],
        calculatePrice:['checkData',function(cb){
            console.log("==calculatePrice===============")

            if(lessPrice == true || perUserLimit == true){
                cb(null)
            }else{
                if(promoDetails[0].discountType == 1){
                    discountAmount = promoDetails[0].discountPrice
                    cb(null)
                }else{
                    discountAmount = promoDetails[0].discountPrice
                    cb(null)
                }
            }
        }]
    },function(err,result){
        console.log("...............discountAmount..err................",discountAmount,err);
        if(err){
            var msg = err;
            // var msg = "Promo Code is already used";
            // sendResponse.sendErrorMessage(msg,res,400);
            return sendResponse.sendErrorMessageWithTranslation(req,msg,res,500);
        }else{

            if(crossTotalLimit == true || perUserLimit == true)
            {
                console.log("...limit.........cross........................");
            
                    var msg = "Promo Code is already used";
                    sendResponse.sendErrorMessage(msg,res,400);
                    return sendResponse.sendErrorMessageWithTranslation(req,msg,res,400);
            }            
            else if (promoType == 0){
                sendResponse.sendSuccessData({max_discount_value:max_discount_value,minOrder:minOrder,discountType:discountType,discountPrice:promoDetails[0].discountPrice,categoryIds:categoryIds,supplierIds:supplierIds,id:supplierIndex,category_ids: category_ids, region_ids: region_ids, product_ids: product_ids, promo_level: promo_level , promo_buy_x_quantity: promo_buy_x_quantity, promo_get_x_quantity: promo_get_x_quantity,	buy_x_get_x_arr: buy_x_get_x_arr,max_buy_x_get: max_buy_x_get}, constant.responseMessage.SUCCESS, res,200);
            }else{
                sendResponse.sendSuccessData({max_discount_value:max_discount_value,minOrder:minOrder,discountType:discountType,discountPrice:promoDetails[0].discountPrice,categoryIds:categoryIds,supplierIds:supplierIds,id:supplierIndex, category_ids: category_ids, region_ids: region_ids, product_ids:product_ids, promo_level: promo_level, promo_buy_x_quantity: promo_buy_x_quantity, promo_get_x_quantity: promo_get_x_quantity,	buy_x_get_x_arr: buy_x_get_x_arr,max_buy_x_get:max_buy_x_get }, constant.responseMessage.SUCCESS, res,200);
            } 
        }
    })
}
