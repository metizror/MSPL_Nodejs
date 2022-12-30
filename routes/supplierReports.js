/**
 * Created by cbl102 on 9/9/16.
 */


var func = require('./commonfunction');
var async = require('async');
var sendResponse = require('./sendResponse');
var constant = require('./constant');
var loginFunctions = require('./loginFunctions');
var common = require('../common/agent')
var moment = require('moment');
var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = config.get('server.debug_level');
const uploadMgr = require('../lib/UploadMgr')
let ExecuteQ=require('../lib/Execute')

exports.orderReport = function (req, res) {
    var order_by = req.body.order_by;
    var is_desc = req.body.is_desc;
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var startLimit = req.body.offset;
    var noOfRecords = req.body.limit;
    var id = req.body.id|| "";
    var status = req.body.status|| "";
    var email = req.body.email|| "";
    var supplier = req.body.supplier|| "";
    var city = req.body.city|| "";
    var zone = req.body.zone|| "";
    var source = req.body.source|| "";
    var schedule = req.body.schedule|| "";
    var startDate=req.body.startDate|| '1990-01-01';
    var endDate=req.body.endDate|| '2100-01-01';
    var manValues = [accessToken, sectionId, startLimit, noOfRecords];
    let is_download=req.body.is_download;
    var final={},supplier_id,supplierId;
    async.auto({
        checkBlank:function (cb) {
            func.checkBlank(res, manValues, cb);
        },
        authenticate:['checkBlank',function (cb)
        {
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
        // checkAuthority:['authenticate',function(cb)
        // {
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
        orderReports:['supplierId',function (cb) {

            
            orderListing(req.dbName,res,supplierId,startLimit, noOfRecords,id,status,email,supplier,city,zone,source,schedule,startDate,endDate,order_by,is_desc,is_download, function (err,result) {
                if(err){
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    final=result;
                    cb(null)
                }
            });
        }],
        orderCount:['orderReports',function (cb) {
            cb(null)
            // var sql = " select o.created_on,o.id,o.status,u.email user_email,s.name supplier_name,  ";
            // sql += "  o.order_source,o.schedule_order from orders o join supplier_branch b on  ";
            // sql += "  o.supplier_branch_id = b.id join supplier s on s.id = b.supplier_id join user u on u.id = o.user_id  ";
            // sql += " ";
            // sql += "  where s.id =?  and DATE( o.created_on ) >= '" + startDate + "' AND DATE( o.created_on ) <=  '" + endDate + "' " +
            //     "  AND o.id LIKE '%" + id + "%' AND o.status LIKE'%" + status + "%' AND u.email LIKE'%" + email + "%' AND s.name LIKE'%" + supplier + "%'" +
            //     "  AND o.order_source LIKE'%" + source + "%'AND o.schedule_order LIKE'%" + schedule + "%' ";
            // sql += " order by o.id DESC "
            // multiConnection[req.dbName].query(sql, [supplierId], function (err, result) {
            //     if (err) {
            //         console.log("errror", err);
            //         sendResponse.somethingWentWrongError(res)
            //     }
            //     else {
            //         final.count=result.length;
            //         cb(null)
            //     }
            // })
        }]
    },function (err,result) {
        if (err) {
            console.log("ee",err)
            sendResponse.somethingWentWrongError(res);
        }
        else {
            sendResponse.sendSuccessData(final, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })

};

exports.agentReport = function (req, res) {
    var search = req.body.search
    var order_by = req.body.order_by;
    var is_desc = req.body.is_desc;
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var offset = req.body.offset;
    var limit = req.body.limit;
    var startDate=req.body.startDate|| '1990-01-01';
    var endDate=req.body.endDate|| '2100-01-01';
    var manValues = [accessToken, sectionId, offset, limit];
    var final={},supplier_id,supplierId;
    let is_download=req.body.is_download;
    var agentConnection
    async.auto({
        checkBlank:function (cb) {
            func.checkBlank(res, manValues, cb);
        },
        authenticate:['checkBlank',function (cb)
        {
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
        // checkAuthority:['authenticate',function(cb)
        // {
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
        agentReport:['supplierId',async function (cb) {
            var getAgentDbData=await common.GetAgentDbInformation(req.dbName);  
            logger.debug("========getAgentDbData===============",getAgentDbData)
             agentConnection=await common.RunTimeAgentConnection(getAgentDbData);
            // logger.debug("========agentConnection===============",agentConnection)


            agentListing(agentConnection,is_download,res,offset,limit,supplierId,startDate,endDate,order_by,is_desc,search, function (err,result) {
                if(err){
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    final=result;
                    cb(null)
                }
            });
        }],
        agentCount:['agentReport',function (cb) {
            cb(null);
            // var sql = "select cu.name,cu.email,cu.id as user_id,count(cuo.user_id) as total_orders,IFNULL(sum(commission_ammount),0) as revenue "
            // sql += "from cbl_user cu left join cbl_user_orders cuo on cuo.user_id = cu.id and cuo.status=5 and DATE(cuo.created_on) >='"+startDate+"' "
            // sql += "and DATE(cuo.created_on) <='"+endDate+"' where cu.supplier_id = "+supplierId+" group by cu.id "
            // agentConnection.query(sql, [], function (err, result) {
            //     if (err) {
            //         console.log("errror", err);
            //         sendResponse.somethingWentWrongError(res)
            //     }
            //     else {
            //         final.count=result.length;
            //         cb(null)
            //     }
            // })
        }]
    },function (err,result) {
        if (err) {
            console.log("ee",err)
            sendResponse.somethingWentWrongError(res);
        }
        else {
            sendResponse.sendSuccessData(final, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })

};


var agentListing = async function(agentConnection,is_download,res,offset,limit,supplierId,startDate,endDate,order_by,is_desc,search,callback) {
    limit = parseInt(limit)
    offset = parseInt(offset)
    var final = {}
    var count = 0
    var orderId = [];

    var order = ""
    order_by = parseInt(order_by)
    if(order_by==1){
        if(is_desc && is_desc>0){
            order = "order by cu.name DESC"
        }else{
            order = "order by cu.name ASC"
        }
    }else if(order_by==2){
        if(is_desc && is_desc>0){
            order = "order by cu.email DESC"
        }else{
            order = "order by cu.email ASC"
        }
    }else if(order_by==3){
        if(is_desc && is_desc>0){
            order = "order by total_orders DESC"
        }else{
            order = "order by total_orders ASC"
        }
    }else if(order_by==4){
        if(is_desc && is_desc>0){
            order = "order by revenue DESC"
        }else{
            order = "order by revenue ASC"
        }
    }
    else{
        order = "order by user_id desc"
    }
    var sql = "select cu.name,cu.email,cu.id as user_id,count(cuo.user_id) as total_orders,IFNULL(sum(commission_ammount),0) as revenue "
    sql += "from cbl_user cu left join cbl_user_orders cuo on cuo.user_id = cu.id and cuo.status=5 and DATE(cuo.created_on) >='"+startDate+"' "
    sql += "and DATE(cuo.created_on) <='"+endDate+"' where cu.supplier_id = ? AND (cu.id LIKE '%"+search+"%' OR cu.name LIKE '%"+search+"%' OR cu.email LIKE '%"+search+"%') group by cu.id "+order+ " LIMIT ?,? "

    if(parseInt(is_download)){
        let sql1 = sql.split('LIMIT')[0];
        let result = await ExecuteQ.QueryAgent(agentConnection,sql1,[supplierId]);
        let header = [ 
            {id: 'ID', title: 'ID'},
            {id: 'NAME', title: 'NAME'},   
            {id: 'EMAIL', title: 'EMAIL'}, 
            {id: 'RESTAURANT', title: 'RESTAURANT'},
            {id: 'TOTAL ORDERS', title: 'TOTAL ORDERS'},
            {id: 'REVENUE', title: 'REVENUE'}
          ]
         
             let data = result.map((element)=>{
                let temp = {}
                temp.ID = element.user_id
                temp.NAME = element.name
                temp.EMAIL = element.email
                temp.RESTAURANT = element.supplier_id!=0?element.supplier_name:"admin level agent"
                temp["TOTAL ORDERS"] = element.total_orders
                temp.REVENUE = element.revenue
                return temp;
            })
        

          let csvLink = await uploadMgr.uploadCsvFileNew(data,header,"agent_report_")
          logger.debug("+==========csvLingk=========",csvLink)
          callback(null,{"csvFileLink":csvLink})
    }
    else{
            count = await getListCountOfAgents(sql,agentConnection,supplierId);
            let result=await ExecuteQ.QueryAgent(agentConnection,sql,[supplierId,offset,limit]);
            // let stmt = agentConnection.query(sql, [supplierId,offset,limit], function (err, result) {
            //     logger.debug("===========stmt.sql==========agnet list supplier=====",stmt.sql)
            //     if (err) {
            //         console.log("errror", err);
            //         sendResponse.somethingWentWrongError(res)
            //     }
            //     else {
                    final.count = count
                    final.agents = result
                    callback(null,final);
            //     }
            // })
    }
};

function getListCountOfAgents(sql,agentConnection,supplierId,offset,limit){
    logger.debug("============getListCountOfAgents count funciton=====",sql)
    let len;
    let sql1 = sql.split('LIMIT')[0];
    logger.debug("============getListCountOfAgents count funciton== =========after split===",sql1)
  return new Promise((resolve,reject)=>{
    let stmt =agentConnection.query(sql1,[supplierId],function(err,result){
        logger.debug("======with out limit offset getListCountOfAgents======",stmt.sql)
        if(err){
            reject(err)
        }else{
            if(result && result.length){
                len = result.length
                resolve(len)
            }else{
                len = 0
                resolve(len)
            }
        }
    })
  })
}
exports.areaReport = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var startLimit = req.body.startLimit;
    var noOfRecords = req.body.noOfRecords;
    var zoneId  =   req.body.zoneId;
    var name= req.body.name||"";
    var noOfSupplier=req.body.noOfSupplier||0;
    var manValues = [accessToken, sectionId, startLimit, noOfRecords];
    var final={},supplier_id,supplierId;
    
    async.auto({
        checkBlank:function (cb) {
            func.checkBlank(res, manValues, cb);
        },
        authenticate:['checkBlank',function (cb)
        {
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
        // checkAuthority:['authenticate',function(cb)
        // {
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
        areaReports:['supplierId',function (cb) {
            areaListing(req.dbName,res,supplierId,startLimit, noOfRecords,zoneId, function (err,result) {
                

                if(err){
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    final.orders=result;
                    cb(null)
                }
            });
        }],
        orderCount:['areaReports',function (cb) {
            var sql = "select a.id,a.name from area a left join supplier_delivery_areas sd on ";
            sql +=" a.id = sd.area_id where a.zone_id = ? and sd.supplier_id = ? and a.is_deleted = 0 group by sd.area_id";
            multiConnection[req.dbName].query(sql,[zoneId,supplierId],function(err,result)
            {
                

                //  console.log("result",result);
                if(err){
                    console.log("rrrr",err);
                    sendResponse.somethingWentWrongError(res);
                }
                else{
                    cb(null,result);
                }

            })
        }]
    },function (err,result) {
        if (err) {
            console.log("ee",err)
            sendResponse.somethingWentWrongError(res);
        }
        else {
            sendResponse.sendSuccessData(final, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })


}

var orderListing = function(dbName,res,supplierId,startLimit, noOfRecords,id,status,email,supplier,city,zone,source,schedule,startDate,endDate,order_by,is_desc,is_download,callback) {
    var orderId = [];
    var final = {}
    var count = 0
    var data = [];
    var order = ""
    order_by = parseInt(order_by)
    if(order_by==1){
        if(is_desc && is_desc>0){
            order = "order by supplier_name DESC"
        }else{
            order = "order by supplier_name ASC"
        }
    }else if(order_by==2){
        if(is_desc && is_desc>0){
            order = "order by user_email DESC"
        }else{
            order = "order by user_email ASC"
        }
    }else if(order_by==3){
        if(is_desc && is_desc>0){
            order = "order by o.created_on DESC"
        }else{
            order = "order by o.created_on ASC"
        }
    }
    else{
        order = "order by o.id desc"
    }
    var sql;
    async.auto({
        orderReport: async function (cb) {
            try{
    
                sql = " select o.created_on,o.id,o.status,u.id as user_id,u.firstname,u.email user_email,s.name supplier_name,  ";
                sql += "  o.order_source,o.schedule_order from orders o join supplier_branch b on  ";
                sql += "  o.supplier_branch_id = b.id join supplier s on s.id = b.supplier_id join user u on u.id = o.user_id  ";
                sql += " ";
                sql += "  where s.id =?  and DATE( o.created_on ) >= '" + startDate + "' AND DATE( o.created_on ) <=  '" + endDate + "' " +
                    "    AND (o.id LIKE '%"+id+"%' OR u.firstname LIKE '%"+id+"%' OR s.name LIKE '%"+id+"%' ) AND o.status LIKE'%" + status + "%' AND u.email LIKE'%" + email + "%' AND s.name LIKE'%" + supplier + "%'" +
                    "  AND o.order_source LIKE'%" + source + "%' AND o.schedule_order LIKE'%" + schedule + "%' ";
                sql += " "+order+"  LIMIT " + startLimit + "," + noOfRecords;

                if(parseInt(is_download)==1){
                    let sql1 = sql.split('LIMIT')[0];
                    let result=await ExecuteQ.Query(dbName,sql1,[supplierId])
                    // let stmt = multiConnection[db_name].query(sql1,function (err, result) {
                    //     console.log("============sql in order listing========",stmt.sql)
                    //     if (err) {
                    //         console.log("errror", err);
                    //         sendResponse.somethingWentWrongError(res)
                    //     }
                    //     else {
                            var sql2 = "select ct.terminology,order_prices.product_name,order_prices.price,order_prices.order_id,order_prices.quantity from order_prices join product p on p.id=order_prices.product_id join categories ct on ct.id=p.category_id";
                            let products=await ExecuteQ.Query(dbName,sql2,[]);
            
                            // multiConnection[db_name].query(sql2,async function (err, products) {
                            //     if (err) {
                            //         console.log("errror", err)
                            //         sendResponse.somethingWentWrongError(res)
                            //     }
                            //     else {////////////
                                    var orderLength = result.length;
                                    if (!orderLength) {
                                        callback(null, [])
                                    }
                                    else {
                                        var productLength = products.length;
                                        for (var i = 0; i < orderLength; i++) {
                                            (async function (i) {
                                                var productArray = [];
                                                for (var j = 0; j < productLength; j++) {
                                                    (async function (j) {
                                                        if (result[i].id == products[j].order_id) {
                                                            productArray.push(products[j]);
                                                            result[i].terminology=products[j].terminology;
                                                            if (j == productLength - 1) {
                                                                result[i].products = productArray;
                                                                if (i == orderLength - 1) {
                                                                    final.orders = result
                                                                    final.count = count
                                                                    logger.debug("=========final in ordre repots==1===",final)
                                                                    
                                                                    let header = [ 
                                                                        {id: 'ID', title: 'ID'},
                                                                        {id: 'USER NAME', title: 'USER NAME'},
                                                                        {id: 'SUPPLIER', title: 'SUPPLIER'},    
                                                                        {id: 'USER EMAIL', title: 'USER EMAIL'},
                                                                        {id: 'CREATED ON', title: 'CREATED ON'},
                                                                        {id: 'PRODUCTS', title: 'PRODUCTS'},
                                                                        {id: 'STATUS', title: 'STATUS'}
                                                                      ]
                                                                      let data = result.map((element)=>{
                                                                          let temp = {}
                                                                          temp.ID = element.id
                                                                          temp["USER NAME"] = element.firstname    
                                                                          temp.SUPPLIER = element.supplier_name
                                                                          temp["USER EMAIL"] =element.user_email
                                                                          temp["CREATED ON"] = moment(element.created_on).format('YYYY-MM-DD HH:mm:ss')
                                                                          let key = [];
            
            
                                                                          let prodArr = element.products.map((list)=>{
                                                                            logger.debug("==========list====1===",list.product_name)
                                                                            key.push(list.product_name+"*"+list.quantity)
                                                                            })
                                                                            logger.debug("========produarr-==11=======",key)
                                                                          temp.PRODUCTS = key.join(",")
            
            
            
                                                                          temp.STATUS = element.status
            
                                                                          return temp;
                                                                      })
                                                            
                                                                      let csvLink = await uploadMgr.uploadCsvFileNew(data,header,"order_list_")
                                                                      logger.debug("+==========csvLingk=========",csvLink)
                                                                      callback(null,{"csvFileLink":csvLink})
                                                                }
                                                            }
                                                        }
                                                        else {
                                                            if (j == productLength - 1) {
                                                                result[i].products = productArray;
                                                                if (i == orderLength - 1) {
                                                                    final.orders = result
                                                                    final.count = count
                                                                    logger.debug("=========final in ordre repots==1===",final)
                                                                    
                                                                    let header = [ 
                                                                        {id: 'ID', title: 'ID'},
                                                                        {id: 'USER NAME', title: 'USER NAME'},
                                                                        {id: 'SUPPLIER', title: 'SUPPLIER'},    
                                                                        {id: 'USER EMAIL', title: 'USER EMAIL'},
                                                                        {id: 'CREATED ON', title: 'CREATED ON'},
                                                                        {id: 'PRODUCTS', title: 'PRODUCTS'},
                                                                        {id: 'STATUS', title: 'STATUS'}
                                                                      ]
                                                                      let data = result.map((element)=>{
                                                                          let temp = {}
                                                                          temp.ID = element.id
                                                                          temp["USER NAME"] = element.firstname    
                                                                          temp.SUPPLIER = element.supplier_name
                                                                          temp["USER EMAIL"] =element.user_email
                                                                          temp["CREATED ON"] = moment(element.created_on).format('YYYY-MM-DD HH:mm:ss')
                                                                          let key = [];
                                                                          element.products.forEach((list)=>{
                                                                              logger.debug("==========list====2===",list.product_name+"*"+list.quantity)
                                                                            key.push(list.product_name+"*"+list.quantity)
                                                                            })
                                                                          logger.debug("========produarr-==22=======",key)
                                                                          temp.PRODUCTS = key.join(",")
                                                                          temp.STATUS = element.status
                                                                          return temp;
                                                                      })
                                                            
                                                                      let csvLink = await uploadMgr.uploadCsvFileNew(data,header,"order_list_")
                                                                      logger.debug("+==========csvLingk=========",csvLink)
                                                                      callback(null,{"csvFileLink":csvLink})
                                                                }
                                                            }
                                                        }
                
                                                    }(j))
                
                                                }
                
                                            }(i))
                
                                        }
                                    }
                
                            //     }
                
                            // })
                    //     }
                
                    // })
                    
                    }
                    else{
            let result=await ExecuteQ.Query(dbName,sql,[supplierId])
            // let stmt = multiConnection[dbName].query(sql, [supplierId], function (err, result) {
            //    console.log("###################31",stmt.sql);
                // if (err) {
                //     console.log("errror", err);
                //     sendResponse.somethingWentWrongError(res)
                // }
                // else {
                    if (result.length) {
                        var length = result.length;
                        for (var i = 0; i < length; i++) {
                            (function (i) {
                                orderId.push(result[i].id)
                                if (i == (length - 1)) {
                                    data = result;
                                    cb(null)
                                }
                            }(i))
                        }
                    }
                    else {
                        cb(null);
                    }
                }
                // }
            // })
                }
            catch(Err){
                console.log("errror", Err);
                    sendResponse.somethingWentWrongError(res)
            }
        },
        orderReportCount: async function(cb){
            try{
            let sql2 = sql.split('LIMIT')[0];
            let result=await ExecuteQ.Query(dbName,sql2,[supplierId]);
            // let stmt = multiConnection[dbName].query(sql2,[supplierId],function (err,result) {
            //     logger.debug("###################32",stmt.sql)
                // if(err)
                // {
                //     console.log('err12-----',err);
                //     sendResponse.somethingWentWrongError(res);
                // }
                // else{
                    count=result.length;
                    cb(null);
                // }
            // })
        }
        catch(Err){
            sendResponse.somethingWentWrongError(res);
        }
        },
        orderProduct: ['orderReport', async function (cb) {
            try{
            if(data.length){
                var sql2 = "select product_name,price,order_id,quantity from order_prices where order_id IN(" + orderId + ")";
                    let products=await ExecuteQ.Query(dbName,sql2,[]);
                //   multiConnection[dbName].query(sql2, function (err, products) {
                    console.log("***********************83",products);
                    //   if (err) {
                    //       console.log("errror", err)
                    //       sendResponse.somethingWentWrongError(res)
                    //   }
                    //   else {
                        var orderLength = data.length;
                        var productLength = products.length;
                            for (var i = 0; i < orderLength; i++) {
                                (function (i) {
                                    var productArray = [];
                                    for (var j = 0; j < productLength; j++) {
                                        (function (j) {
                                            if (data[i].id == products[j].order_id) {
                                                productArray.push(products[j]);
                                                if (j == productLength - 1) {
                                                    data[i].products = productArray;
                                                    if (i == orderLength - 1) {
                                                        cb(null)
                                                    }
                                                }
                                            }
                                            else {
                                                if (j == productLength - 1) {
                                                    data[i].products = productArray;
                                                    if (i == orderLength - 1) {
                                                        cb(null)
                                                    }
                                                }
                                            }
                                        }(j))
                                    }
                                }(i))
                            }
                    //   }
                //   })
            }
            else {
              cb(null);
          }
        }catch(Err){
            logger.debug("======Err!==>",Err);
            sendResponse.somethingWentWrongError(res)
        }

        }]
    },function (err,result) {
        if (err) {
            console.log("errror", err);
            sendResponse.somethingWentWrongError(res)
        }
        else {
            final.orders = data;
            final.count = count;
            callback(null,final)
        }
    })
};

var areaListing = function(dbName,res,supplierId, startLimit, noOfRecords,zoneId, callback) {
    var areas;
    var orders;
    
    async.auto({
        areas:function(cb){
            listAreas(dbName,res,supplierId,startLimit,noOfRecords,zoneId,function(err,result)
            {
                if(err){
                    sendResponse.somethingWentWrongError(res);
                }
                else{
                    areas = result;
                    cb(null);
                }

            });
        },
        totalOrdersAndRevenue:function(cb){
            listOrderNoAndRevenue(dbName,res,supplierId,function(err,result)
            {
                if(err){
                    sendResponse.somethingWentWrongError(res);
                }
                else{
                    orders = result;
                    cb(null);
                }
            });
        },
        clubData:['areas','totalOrdersAndRevenue',function(cb)
        {
            clubAreaData(res,areas,orders,cb);

        }],

    },function(err,response)
    {
        if(err){
            sendResponse.somethingWentWrongError(res);
        }
        else{
            callback(null,response.clubData);
        }

    })

}

function listAreas(dbName,res,supplierId,startLimit,noOfRecords,zoneId,callback){

    var sql = "select a.id,a.name from area a left join supplier_delivery_areas sd on ";
    sql +=" a.id = sd.area_id where a.zone_id=? and a.is_deleted = 0 and sd.supplier_id =?  group by sd.area_id limit "+startLimit+","+noOfRecords;
    multiConnection[dbName].query(sql,[zoneId,supplierId],function(err,result)
    {
        //  console.log("result",result);
        if(err){
            console.log("rrrr",err);
            sendResponse.somethingWentWrongError(res);
        }
        else{
            callback(null,result);
        }

    })
}

function listOrderNoAndRevenue(dbName,res,supplierId,callback) {
    var sql = "select COUNT(o.id) no_of_orders, SUM(o.net_amount) total_revenue,a.id from orders o join user u ";
    sql +=" on o.user_id = u.id join area a on u.area_id = a.id join supplier_branch sb on sb.id = o.supplier_branch_id " +
        " where sb.supplier_id = ? group by a.id ";
    multiConnection[dbName].query(sql,[supplierId],function(err,result)
    {
        if(err){
            console.log("aaaaa",err);
            sendResponse.somethingWentWrongError(res);
        }
        else{
            callback(null,result);
        }

    })

}

function clubAreaData(res,areas,orders,callback) {
    //  console.log("aaa",areas,orders)
    var areasLength = areas.length;
    var ordersLength = orders.length;

    if(!areasLength){
        callback(null,[]);
    }
    else{

        for(var i = 0 ; i < areasLength ; i++)
        {
            (function(i)
            {
                var orderNo = 0 ;
                var revenue = 0;
                for( var j = 0 ; j < ordersLength ; j++)
                {
                    (function(j)
                    {
                        if(areas[i].id == orders[j].id)
                        {
                            orderNo = orders[j].no_of_orders;
                            revenue = orders[j].total_revenue;
                            if(j == ordersLength - 1)
                            {
                                areas[i].no_of_orders = orderNo;
                                areas[i].total_revenue = revenue;
                                if(i == areasLength - 1)
                                {
                                    callback(null,areas);

                                }
                            }
                        }
                        else{
                            if(j == ordersLength - 1)
                            {
                                areas[i].no_of_orders = orderNo;
                                areas[i].total_revenue = revenue;
                                if(i == areasLength - 1)
                                {
                                    callback(null,areas);

                                }
                            }
                        }

                    }(j))

                }

            }(i))

        }

    }

}

// function getId(dbName,res,id,cb){
    
//     var sql='select supplier_id from supplier_admin where id=?';
//     var sts = multiConnection[dbName].query(sql,[id],function (err,id) {
        
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
