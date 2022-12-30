var mysql = require('mysql');
var async = require('async');
var constant = require('../../routes/constant')
var connectionCntr = require('../../routes/connection')
var sendResponse = require('../../routes/sendResponse');
var uploadMgr = require('../../lib/UploadMgr')
var confg = require('../../config/const');
var _ = require('underscore');
var chunk = require('chunk');
var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = config.get('server.debug_level');
let ExecuteQ=require('../../lib/Execute')
const common=require('../../common/agent');

const Dashboard = async (req, res) => {
    try {
        var data = {}
        var order_data = await TotalOrder(req.dbName, req.query.start_date, req.query.end_date, req.query.supplier_id);
        var reveneu_data = await TotalOrderRevenue(req.dbName, req.query.start_date, req.query.end_date, req.query.supplier_id);
        var orders_count = await get_orders_count(req.dbName, req.query.supplier_id);
        var total_category = await get_total_categories(req.dbName, req.query.supplier_id);
        var total_product = await get_total_product(req.dbName, req.query.supplier_id);

        var pending_orders = await latestPendingOrders(req.dbName, req.query.supplier_id, 6);
        var active_orders  = await latestActiveOrders(req.dbName,req.query.supplier_id,6);


        var get_active_products_orders = await getProducts(active_orders,req.dbName)
        var get_active_categories_orders = await getCategories(get_active_products_orders,req.dbName)
        var get_products_orders = await getProducts(pending_orders, req.dbName)
        var get_categories_orders = await getCategories(get_products_orders, req.dbName)
        var total_supplier_order_data = await SupplierTotalOrder(req.dbName,req.query.supplier_id)
        var total_supplier_reveneu_data = await SupplierTotalOrderRevenue(req.dbName,req.query.supplier_id)
        var total_revenue_order = {
            total_order : total_supplier_order_data,
            total_revenue : total_supplier_reveneu_data
        }

        data.total_order = order_data
        data.total_revenue = reveneu_data
        data.pending_order_count = orders_count[0].pending_order_count,
        data.active_order_count = orders_count[0].active_order_count,
        data.completed_order_count = orders_count[0].completed_order_count,
        data.cancel_order_count = orders_count[0].cancel_order_count,
        data.category_count = total_category
        data.product_count = total_product
        data.latestPendingOrders = get_categories_orders
        data.total_revenue_order = total_revenue_order
        data.latestActiveOrders  = get_active_categories_orders

        sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (Err) {
        logger.error(Err);
        sendResponse.somethingWentWrongError(res);
    }
}

const DashboardV2 = async (req, res) => {
    try {

        var data = {}
        var supplierBranchId =req.supplier.supplierBranchId?req.supplier.supplierBranchId:0;
        var order_data = await TotalOrder(req.dbName, req.query.start_date, req.query.end_date, req.query.supplier_id,supplierBranchId);


        var reveneu_data = await TotalOrderRevenue(req.dbName, req.query.start_date, req.query.end_date, req.query.supplier_id,supplierBranchId);
        

        var orders_count = await get_orders_count(req.dbName, req.query.supplier_id,supplierBranchId);
        var total_category = await get_total_categories(req.dbName, req.query.supplier_id,supplierBranchId);

        var total_product = await get_total_product(req.dbName, req.query.supplier_id,supplierBranchId);

        var pending_orders = await latestPendingOrdersV2(req.dbName, req.query.supplier_id, 6,supplierBranchId);
        var active_orders  = await latestActiveOrdersV2(req.dbName,req.query.supplier_id,6,supplierBranchId);
        let table_booking_count = await getTableBookingCount(req.dbName,req.query.supplier_id)

        var get_active_products_orders = await getProducts(active_orders,req.dbName)
        var get_active_categories_orders = await getCategories(get_active_products_orders,req.dbName)
        var get_products_orders = await getProducts(pending_orders, req.dbName)
        var get_categories_orders = await getCategories(get_products_orders, req.dbName)

        var total_supplier_order_data = await SupplierTotalOrder(req.dbName,req.query.supplier_id)
        let supplier_open_status = await getSupplierOpenStatus(req.dbName,req.query.supplier_id);

        var total_supplier_reveneu_data = await SupplierTotalOrderRevenue(req.dbName,req.query.supplier_id)
        var total_revenue_order = {
            total_order : total_supplier_order_data,
            total_revenue : total_supplier_reveneu_data
        }

        data.total_order = order_data
        data.total_revenue = reveneu_data
        
        data.pending_order_count = orders_count[0].pending_order_count,
        data.active_order_count = orders_count[0].active_order_count,
        data.completed_order_count = orders_count[0].completed_order_count,
        data.cancel_order_count = orders_count[0].cancel_order_count,
        data.category_count = total_category
        data.product_count = total_product
        data.latestPendingOrders = get_categories_orders
        data.total_revenue_order = total_revenue_order
        data.latestActiveOrders  = get_active_categories_orders
        data.supplier_open_status = supplier_open_status
        data.table_booking_count = table_booking_count

        sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (Err) {
        logger.error(Err);
        sendResponse.somethingWentWrongError(res);
    }
}


const getTableBookingCount = (dbName,supplier_id)=>{
    return new Promise(async(resolve,reject)=>{
        if(parseInt(supplier_id)!==0){
            let query1 = "select utb.order_id,utb.id,st.id as table_id,st.table_name,st.table_number,st.seating_capacity as table_seating_capacity, "
            query1+="utb.seating_capacity,s.delivery_max_time,sb.branch_name,u.firstname as user_name,u.email as user_email,utb.status "
            query1+="from user_table_booked utb join user u on u.id = utb.user_id "
            query1+="left join supplier_tables st on st.id = utb.table_id join supplier s on s.id = utb.supplier_id "
            query1+="join supplier_branch sb on sb.id = utb.branch_id where s.id="+supplier_id+"  order by utb.id desc " ;
        
            let data = await ExecuteQ.Query(dbName,query1,[]);
        
            if(data && data.length>0){
                resolve(data.length)
            }else{
                resolve(0)
            }
        }else{
            let query1 = "select utb.order_id,utb.id,st.id as table_id,st.table_name,st.table_number,st.seating_capacity as table_seating_capacity, "
            query1+="utb.seating_capacity,s.delivery_max_time,sb.branch_name,u.firstname as user_name,u.email as user_email,utb.status "
            query1+="from user_table_booked utb join user u on u.id = utb.user_id "
            query1+="left join supplier_tables st on st.id = utb.table_id join supplier s on s.id = utb.supplier_id "
            query1+="join supplier_branch sb on sb.id = utb.branch_id order by utb.id desc " ;
        
            let data = await ExecuteQ.Query(dbName,query1,[]);
        
            if(data && data.length>0){
                resolve(data.length)
            }else{
                resolve(0)
            }
        }
    })
    
}


function TotalOrder(dbName, start_date, end_date, supplierId,supplierBranchId=0) {
    return new Promise(async (resolve, reject) => {
        // try{
        var final_result = []
        var q = " select id from supplier_branch where supplier_id = ? ";

        if(supplierBranchId){
            q = " select id from supplier_branch where supplier_id = ? and id="+supplierBranchId;
        }
        var count = 0;
        let result1=await ExecuteQ.Query(dbName,q,[supplierId]);

        // multiConnection[dbName].query(q, [supplierId], function (err, result1) {
            var q1 = "SELECT IFNULL(DAYOFWEEK(`created_on`),0) as week_day,IFNULL(DATE(`created_on`),0) as created_at,COUNT(id) as total_order FROM orders  where DATE(created_on) >='" + start_date + "' and DATE(created_on) <= '" + end_date + "' and supplier_branch_id = ? group by created_at";
            
            if (result1.length) {
                for (var i = 0; i < result1.length; i++) {
                    (async function (i) {
                        try{
                            let temp;
                            let result=await ExecuteQ.Query(dbName,q1,[result1[i].id])
                            // var stmt = multiConnection[dbName].query(q1, [result1[i].id], function (err, result) {
                                // logger.debug("==========stmt =========",stmt.sql)
                                // if (err) {
                                //     reject(err)
                                // }
                                if(result && result.length ){
                                    for(const [index,j] of result.entries()){
                                        final_result.push({
                                            week_day : j.week_day,
                                            created_at : j.created_at,
                                            total_order : j.total_order
                                        })
                                    }
                                }
                                if (i == result1.length - 1) {
                                    final_result1 = [];
                                    final_result.forEach(function (a) {
                                        if (!this[a.created_at]) {
                                            this[a.created_at] = { week_day:a.week_day,created_at: a.created_at, total_order: 0 };
                                            final_result1.push(this[a.created_at]);
                                        }
                                        this[a.created_at].total_order += a.total_order;
                                    }, Object.create(null));
                                    resolve(final_result1);
                                }
                        }
                        catch(Err){
                            reject(Err)
                        }
                        // });
                    })(i);
                }
            }
            else {
                resolve(count);
            }
        // });
    
    })
    
}

/*
 *This function is used to get data of total revenue today
 *
 */
function TotalOrderRevenue(dbName, start_date, end_date, supplierId,supplierBranchId=0) {
    return new Promise(async (resolve, reject) => {
        var final_result=[]
        var q = " select id from supplier_branch where supplier_id = ? "
        if(supplierBranchId){
            q = " select id from supplier_branch where supplier_id = ? and id="+supplierBranchId
        }
        var count = 0;
        var sql = "SELECT IFNULL(DAYOFWEEK(`created_on`),0) as week_day,IFNULL(DATE(`created_on`),0) as created_at,IFNULL(SUM(net_amount-admin_commission),0) as total_revenue from orders where DATE(created_on) >=? and DATE(created_on) <=? and supplier_branch_id = ? and (status = 5 or status = 6) "
        let result1=await ExecuteQ.Query(dbName,q,[supplierId]);
        // multiConnection[dbName].query(q, [supplierId], function (err, result1) {
            var sql = "SELECT IFNULL(DAYOFWEEK(`created_on`),0) as week_day,IFNULL(DATE(`created_on`),0) as created_at,IFNULL(SUM(net_amount-admin_commission),0) as total_revenue from orders where DATE(created_on) >=? and DATE(created_on) <=? and supplier_branch_id = ? and (status = 5 or status = 6)  group by DATE(created_on)"
            if (result1.length) {
                for (var i = 0; i < result1.length; i++) {
                    (async function (i) {
                        try{
                            let result=await ExecuteQ.Query(dbName,sql,[start_date,end_date,result1[i].id]);
                        // multiConnection[dbName].query(sql, [start_date,end_date,result1[i].id], function (err, result) {
                        //    logger.debug("=====ERR!")
                        //     if (err) {
                        //         reject(err)
                        //     }
                            let temp;
                            if(result && result.length>0){
                                for(const [ind,j] of result.entries()){
                                    temp = {
                                        week_day : j.week_day,
                                        created_at : j.created_at,
                                        total_revenue : j.total_revenue
                                    }
                                    final_result.push(temp)
                                }
                            }
                            // if(result[0].total_revenue){
                            //     logger.debug("=========finalresult 1===",final_result)
                            //      temp = {
                            //         week_day : result[0].week_day,
                            //         created_at : result[0].created_at,
                            //         total_revenue : result[0].total_revenue
                            //     }
                            //     final_result.push(temp)
                            //     logger.debug("=========finalresult 2======",final_result)
                            // }
                            logger.debug("=======findal result=========",final_result)
                            if (i == result1.length - 1) {
                                resolve(final_result);
                            }
                        // });
                    }
                    catch(Err){
                        reject(Err)
                    }
                    })(i);
                }
            }
            else {
                resolve(final_result)
            }
        // });

    })
}

const get_orders_count = (db_name, supplierId,supplierBranchId=0) => {
    // 1,3,7,9,10,11
    return new Promise(async (resolve, reject) => {
        try{
            var sqlQuery = "select count(IF(o.status=0,1,NULL))  as pending_order_count, ";
            sqlQuery += "count(IF(o.status=1 or o.status=9 or o.status=3 or o.status=7 or o.status=11 or o.status=10,1,NULL)) as active_order_count, ";
            sqlQuery += "count(IF(o.status=5 or o.status=6,1,NULL)) as completed_order_count, ";
            sqlQuery += "count(IF(o.status=8,1,NULL)) as cancel_order_count from orders o "
            sqlQuery += "join supplier_branch sb on o.supplier_branch_id=sb.id join supplier s on sb.supplier_id = s.id where s.id=? and s.is_deleted=0"

            if(supplierBranchId){            
                sqlQuery += " and sb.id="+ supplierBranchId
            }
            let sResult=await ExecuteQ.Query(db_name,sqlQuery,[supplierId]);
            resolve(sResult);
            }
            catch(Err){
                reject("Something Went Wrong!")
            }
        
        // var st = multiConnection[db_name].query(sqlQuery, [supplierId], (err, data) => {
        //   logger.debug("===ER!==",err);
        //     if (err) {
        //         reject("Something Went Wrong")
        //     } else {
        //         resolve(data)
        //     }
        // })
    })
}

const get_total_categories = (db_name, supplierId) => {
    return new Promise(async (resolve, reject) => {
        try{
            var sqlQuery = "select count(*) as category_count from categories c join supplier_category sc on c.id = sc.category_id where sc.supplier_id=?";
            let cResult=await ExecuteQ.Query(db_name,sqlQuery,[supplierId]);
            resolve(cResult[0].category_count)
        }
        catch(Err){
            reject("something went wrong")
        }
        // var sqlQuery = "select count(*) as category_count from categories c join supplier_category sc on c.id = sc.category_id where sc.supplier_id=?";
       
        // var stmt = multiConnection[db_name].query(sqlQuery, [supplierId], (err, data) => {
        //     logger.debug(stmt.sqlQuery, err)
        //     if (err) {
        //         reject("something went wrong");
        //     } else {
        //         resolve(data[0].category_count)
        //     }
        // })
    })
}

const get_total_product = (db_name, supplierId) => {
    return new Promise(async (resolve, reject) => {

        var sqlQuery = "select count(*) as product_count from product p join supplier_product sp on sp.original_product_id = p.id where sp.supplier_id=?";
        try{
            let pData=await ExecuteQ.Query(db_name,sqlQuery,[supplierId]);
            resolve(pData[0].product_count)
        }
        catch(Err){
            reject("something went wrong")
        }
        // var stmt = multiConnection[db_name].query(sqlQuery, [supplierId], (err, data) => {
        //     logger.debug(stmt.sqlQuery, err)
        //     if (err) {
        //         reject("something went wrong");
        //     } else {
        //         resolve(data[0].product_count)
        //     }
        // })
    })
}

const latestPendingOrders = async function (db_name, supplierId, limit) {
    var results = [];
    return new Promise(async (resolve, reject) => {
        var sql = "select o.self_pickup,o.net_amount,crt.area_id,sb.supplier_id,o.is_agent,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,u.mobile_no " +
            "from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id join cart crt on crt.id=o.cart_id " +
            "join user u on o.user_id=u.id where  o.status=0 and s.id=? group by id order by o.created_on DESC LIMIT ?";
        try{
            let orders=await ExecuteQ.Query(db_name,sql,[supplierId, limit])
            if (orders.length) {
                results = orders;
                resolve(results)
            }
            else {
                var data = [];
                resolve(data);
            }
        }
        catch(Err){
            reject(Err)
        }
        // var st = multiConnection[db_name].query(sql, [supplierId, limit], function (err, orders) {
        //     console.log(st.sql);
        //     if (err) {
        //         reject(err);
        //     }
        //     else if (orders.length) {
        //         results = orders;
        //         resolve(results)
        //     }
        //     else {
        //         var data = [];
        //         resolve(data);
        //     }
        // })
    })
}

const latestActiveOrders = async function(db_name,supplierId,limit){
    var results=[];
    return new Promise(async (resolve,reject)=>{
        try{
            var sql="select o.self_pickup,crt.area_id,sb.supplier_id,o.net_amount,o.is_agent,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,u.mobile_no " +
        "from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id  join cart crt on crt.id=o.cart_id "+
        "join user u on o.user_id=u.id where (o.status=3 or o.status=1 or o.status=7 or o.status=9 or o.status=10 or o.status=11) and s.id=? group by id order by o.created_on DESC LIMIT ?";
        let orders=await ExecuteQ.Query(db_name,supplierId,limit);
            if(orders.length) {
            results = orders;
            resolve(results)
            }
            else {
                var data = [];
                resolve(data);
            }
        }
        catch(Err){
            reject(Err);
        }
        // 1,3,7,9,10,11
        //    var st= multiConnection[db_name].query(sql,[supplierId,limit],function (err,orders) {
        //         console.log(st.sql);
        //         if(err)
        //         {
        //             reject(err);

        //         }
        //         else if(orders.length) {
        //             results = orders;
        //             resolve(results)
        //         }
        //         else {
        //             var data = [];
        //             resolve(data);
        //         }
        //     })
    })
}


const latestPendingOrdersV2 = async function (db_name, supplierId, limit,supplierBranchId=0) {
    var results = [];
    return new Promise(async (resolve, reject) => {
        var sql = "select o.admin_commission,o.self_pickup,IFNULL(odp.discountAmount,0) as discountAmount,o.net_amount,o.payment_type, o.referral_amount,crt.area_id,sb.supplier_id,o.is_agent,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,u.mobile_no " +
            "from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id join cart crt on crt.id=o.cart_id " +
            "join user u on o.user_id=u.id left join order_promo odp on odp.orderId=o.id where  o.status=0 and s.id=?";

            if(supplierBranchId){
                sql +=" and sb.id="+supplierBranchId
            }

            sql +=" group by id order by o.created_on DESC LIMIT ?";
            let orders=await ExecuteQ.Query(db_name,sql,[supplierId, limit])
            if (orders.length) {
                results = orders;
                for(const [index,i] of results.entries()){
                    i.net_amount =  i.net_amount-(i.discountAmount)-(i.referral_amount)
                 }
                resolve(results)
            }
            else {
                var data = [];
                resolve(data);
            }
        // var st = multiConnection[db_name].query(sql, [supplierId, limit],async  function (err, orders) {
        //     console.log(st.sql);
        //     if (err) {
        //         reject(err);
        //     }
        //     else if (orders.length) {
        //         results = orders;
        //         for(const [index,i] of results.entries()){
        //             i.net_amount =  i.net_amount-(i.discountAmount)-(i.referral_amount)
        //          }
        //         resolve(results)
        //     }
        //     else {
        //         var data = [];
        //         resolve(data);
        //     }
        // })
    })
}

const latestActiveOrdersV2 = async function(db_name,supplierId,limit,supplierBranchId){
    var results=[];
    return new Promise(async (resolve,reject)=>{
        try{
        var sql="select o.admin_commission,o.type, o.self_pickup,crt.area_id,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.supplier_id,o.net_amount,o.is_agent,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,u.mobile_no " +
        "from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id  join cart crt on crt.id=o.cart_id "+
        "join user u on o.user_id=u.id left join order_promo odp on odp.orderId=o.id where (o.status=3 or o.status=1 or o.status=7 or o.status=9 or o.status=10 or o.status=11) and s.id=? "
        if(supplierBranchId){
            sql +=" and sb.id="+supplierBranchId
        }
        sql +=" group by id order by o.created_on DESC LIMIT ?";
        let orders=await ExecuteQ.Query(db_name,sql,[supplierId,limit]);
        if(orders.length) {
            results = orders;
            for(const [index,i] of results.entries()){
                i.net_amount =  i.net_amount-(i.discountAmount)-(i.referral_amount)
             }
            resolve(results)
        }
        else {
            var data = [];
            resolve(data);
        }

    }
    catch(Err){
        reject(Err)
    }
        // 1,3,7,9,10,11
//    var st= multiConnection[db_name].query(sql,[supplierId,limit],async function (err,orders) {
//         console.log(st.sql);
//         if(err)
//         {
//             reject(err);

//         }
//         else if(orders.length) {
//             results = orders;
//             for(const [index,i] of results.entries()){
//                 i.net_amount =  i.net_amount-(i.discountAmount)-(i.referral_amount)
//              }
//             resolve(results)
//         }
//         else {
//             var data = [];
//             resolve(data);
//         }
//     })
    })
}



const totalOrderPrice  = (dbName,orderId)=>{
    return new Promise(async(resolve,reject)=>{
        let temp_price = 0
        logger.debug("=================orderId=======",orderId);
        let query = 'select op.price,op.order_id,op.product_name,op.quantity,op.image_path as product_image from order_prices op';
        let params = []
        let product1 = await ExecuteQ.Query(dbName,query,params);
        logger.debug("========product1.len======",product1.length)
            for(var j=0;j<product1.length;j++){
                // logger.debug("=========product1[j].order_id == result.id==============",orderId,product1[j].order_id,product1[j].order_id == orderId);
                let id1 = parseInt(product1[j].order_id)
                let id2 = orderId
                // logger.debug("=============id1=====id2 ======",id1,id2)
                if(id1==id2){
                    temp_price = Number(product1[j].price) *
                     Number(product1[j].quantity) + temp_price
                    // logger.debug("==============temppriee======1===",temp_price)
                }
            }
            // logger.debug("========temp_price========",temp_price);
        resolve(temp_price);     
    })
}


const getProducts = function (results, db_name) {
    var product = [];
    return new Promise(async (resolve, reject) => {
        try{
        var sql2 = 'select op.order_id,op.product_name,op.quantity,op.price,op.image_path from order_prices op';
        let product1=await ExecuteQ.Query(db_name,sql2,[]);
            for (var i = 0; i < results.length; i++) {

                (function (i) {
                    product = [];
                    for (var j = 0; j < product1.length; j++) {

                        (function (j) {
                            if (product1[j].order_id == results[i].id) {
                                let productObj = {
                                    product_name: product1[j].product_name,
                                    quantity: product1[j].quantity,
                                    price: product1[j].price,
                                    image_path: product1[j].image_path
                                }
                                product.push(productObj)
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
                }(i))

            }
            resolve(results)
        
        }
        catch(Err){
            reject(Err)
        }
        // multiConnection[db_name].query(sql2, function (err, product1) {
        //     if (err) {
        //         console.log('error------', err);
        //         reject(err);
        //     }
            // else {
            //     for (var i = 0; i < results.length; i++) {

            //         (function (i) {
            //             product = [];
            //             for (var j = 0; j < product1.length; j++) {

            //                 (function (j) {
            //                     if (product1[j].order_id == results[i].id) {
            //                         let productObj = {
            //                             product_name: product1[j].product_name,
            //                             quantity: product1[j].quantity,
            //                             price: product1[j].price,
            //                             image_path: product1[j].image_path
            //                         }
            //                         product.push(productObj)
            //                         if (j == product1.length - 1) {
            //                             results[i].product = product;
            //                         }
            //                     }
            //                     else {
            //                         if (j == product1.length - 1) {
            //                             results[i].product = product;
            //                         }
            //                     }
            //                 }(j));

            //             }
            //         }(i))

            //     }
            //     resolve(results)
            // }
        // })
    })
}

const getCategories = function (results, db_name) {
    var category = [];
    return new Promise(async (resolve, reject) => {
        var sql3 = 'select c.name,c.id,op.order_id from order_prices op join product p on p.id=op.product_id join categories c on c.id=p.category_id';
        let cat=await ExecuteQ.Query(db_name,sql3,[]);
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
                    resolve(results)
                }
            }(i))
        }
        resolve(results);
        // multiConnection[db_name].query(sql3, function (err, cat) {
        //     if (err) {
        //         console.log('error------', err);
        //         reject(err);
        //     }
        //     else {
        //         for (var i = 0; i < results.length; i++) {

        //             (function (i) {
        //                 cate = [];
        //                 for (var j = 0; j < cat.length; j++) {
        //                     (function (j) {
        //                         if (cat[j].order_id == results[i].id) {
        //                             cate.push(cat[j].name);
        //                             if (j == cat.length - 1) {
        //                                 results[i].category = cate;
        //                             }
        //                         }
        //                         else {
        //                             if (j == cat.length - 1) {
        //                                 results[i].category = cate;
        //                             }
        //                         }
        //                     }(j));
        //                 }
        //                 if (i == results.length - 1) {
        //                     resolve(results)
        //                 }
        //             }(i))
        //         }
        //         resolve(results);
        //     }
        // })
    })
}

function SupplierTotalOrder(dbName,supplierId) {
    return new Promise(async (resolve, reject) => {
        try{
            var final_result = 0
            let temp;
            var q = " select id from supplier_branch where supplier_id = ? ";
            var count = 0;
            let result1=await ExecuteQ.Query(dbName,q,[supplierId]);
            var q1 = "SELECT COUNT(id) as total_order FROM orders where  supplier_branch_id = ? ";
            if (result1.length) {
                for (var i = 0; i < result1.length; i++) {
                    (async function (i) {
                        try{
                        let result=await ExecuteQ.Query(dbName,q1,[result1[i].id])
                        // var stmt = multiConnection[dbName].query(q1, [result1[i].id], function (err, result) {
                            // logger.debug("==========stmt =========",stmt.sql)
                            // if (err) {
                            //     logger.debug("----------eerr222 =======",err)
                            //     reject(err)
                            // }
                            if(result && result.length ){
                                final_result += result[0].total_order
                            }
                            if (i == result1.length - 1) {
                                resolve(final_result);
                            }
                        }catch(Err1){
                            logger.debug("----------Err1 =======",Err1)
                            reject(Err1)
                        }
                        // });
                    })(i);
                }
            }
        }
        catch(Err){
            reject(Err)
        }
       
        // multiConnection[dbName].query(q, [supplierId], function (err, result1) {

        //     var q1 = "SELECT COUNT(id) as total_order FROM orders where  supplier_branch_id = ? ";
        //     if (result1.length) {
        //         for (var i = 0; i < result1.length; i++) {
        //             (function (i) {
        //                 var stmt = multiConnection[dbName].query(q1, [result1[i].id], function (err, result) {
        //                     logger.debug("==========stmt =========",stmt.sql)
        //                     if (err) {
        //                         logger.debug("----------eerr222 =======",err)
        //                         reject(err)
        //                     }
        //                     if(result && result.length ){
        //                         final_result += result[0].total_order
        //                     }
        //                     if (i == result1.length - 1) {
        //                         resolve(final_result);
        //                     }
        //                 });
        //             })(i);
        //         }
        //     }
        //     else {
        //         resolve(count);
        //     }
        // });
    })
}

function getSupplierOpenStatus(dbName, supplierId) {
    return new Promise(async (resolve, reject) => {
        try {
            var query = " select id,is_open from supplier_timings where supplier_id = ? ";
            let data = await ExecuteQ.Query(dbName, query, [supplierId]);

            if (data && data.length > 0) {
                resolve(data[0].is_open)
            } else {
                resolve(0)
            }

        }
        catch (Err) {
            reject(Err)
        }
    })
}

async function    SupplierTotalOrderRevenue(dbName,supplierId) {
    return new Promise(async(resolve, reject) => {
        let deliveryChargeToAdmin=await ExecuteQ.Query(dbName,"select `key`,`value` from tbl_setting where `key`=?",["delivery_charge_to_admin"])
        var final_result=0,agentConnection={};
        var sql1 = " select id from supplier_branch where supplier_id = ? "
        var count = 0;
        let get_branch = await ExecuteQ.Query(dbName,sql1,[supplierId])
        // let stmt = multiConnection[dbName].query(q, [supplierId],async function (err, result1) {
            // logger.debug("============sql query for get supplir brand ids======",stmt.q)
            let total=0,commision_given_to_admin=0,order_ids=[];
            for(const [index1,j] of get_branch.entries()){
                supplierProfitData=await supplierProfitAfterTaxCommission(dbName,j.id,deliveryChargeToAdmin);
                logger.debug("=supplierProfitData=",supplierProfitData)
                total=total+supplierProfitData.total_supplier_profit;
                order_ids=order_ids.concat(supplierProfitData.order_ids);
                // total = total + get_revenue[0].total_revenue
            }
            logger.debug("=======final_order_ids==",order_ids)
            if(order_ids && order_ids.length>0 && deliveryChargeToAdmin.length==0){
                logger.debug("===AGENT==CON==")
                let is_agent_of_supplier=0;
                let getAgentDbData=await common.GetAgentDbInformation(dbName);        
                logger.debug("===AGENT==CONNECTION==>>==2=",Object.entries(agentConnection).length)
                if(Object.entries(agentConnection).length===0){
                    agentConnection=await common.RunTimeAgentConnection(getAgentDbData);
                }
                let agent_order_data=await ExecuteQ.QueryAgent(agentConnection,
                    "select IFNULL(sum(co.commission_ammount),0) AS agentRevenue  from cbl_user_orders co join cbl_user cu on cu.id=co.user_id where co.order_id IN(?) and cu.supplier_id=?",
                    [order_ids,0]);
                logger.debug("======AGEN=ORDER==DATA!==",agent_order_data);
                commision_given_to_admin=agent_order_data[0].agentRevenue;
            }
            logger.debug("===befor=====>>",total,commision_given_to_admin);
            total=total-commision_given_to_admin;
            logger.debug("==After==>",total);

            resolve(total)



        // var final_result= 0
        // var q = " select id from supplier_branch where supplier_id = ? "
        // var count = 0;
        // multiConnection[dbName].query(q, [supplierId], function (err, result1) {
        //     var sql = "SELECT IFNULL(SUM(supplier_commision),0) as total_revenue from orders where supplier_branch_id = ? and status = 5 "
        //     if (result1.length) {
        //         for (var i = 0; i < result1.length; i++) {
        //             (function (i) {
        //                 let stmt = multiConnection[dbName].query(sql, [result1[i].id], function (err, result) {
        //                     logger.debug("============SupplierTotalOrderRevenue============",stmt.sql)
        //                     if (err) {
        //                         logger.debug("----------eerr11=======",err)
        //                         reject(err)
        //                     }
                            
        //                     final_result = final_result + result[0].total_revenue
        //                     if (i == result1.length - 1) {
        //                         resolve(final_result);
        //                     }
        //                 });
        //             })(i);
        //         }
        //     }
        //     else {
        //         resolve(final_result)
        //     }
        // });

    })
}

const supplierProfitAfterTaxCommission=(dbName,supplierBranchId,deliveryChargeToAdmin)=>{

    return new Promise(async (resolve,reject)=>{
        logger.debug("============ENTEr")
        try{
        let order_ids=[],total_supplier_profit=0;
        let sql ="SELECT `id`,`handling_admin`,`handling_supplier`,`delivery_charges`,`net_amount`,`supplier_commision`,`admin_commission` from orders where supplier_branch_id = ? and (status = 5 or status =6) "
        let orderData= await ExecuteQ.Query(dbName,sql,[supplierBranchId])

            if(orderData && orderData.length>0){
                for(const [index3,k] of orderData.entries())
                {
                    let delivery_charge=deliveryChargeToAdmin && deliveryChargeToAdmin.length>0?parseFloat(k.delivery_charges):0

                    if(dbName == "yunofood_0906"){
                        total_supplier_profit = total_supplier_profit + parseFloat(k.net_amount) - parseFloat(k.admin_commission);
                    } else {
                        total_supplier_profit=total_supplier_profit+(parseFloat(k.net_amount)-(parseFloat(k.handling_admin)+parseFloat(k.supplier_commision)+delivery_charge));
                    }
                    
                    order_ids.push(k.id)
                }
                resolve({total_supplier_profit:total_supplier_profit,order_ids:order_ids})
            }
            else{

                resolve({total_supplier_profit:total_supplier_profit,order_ids:order_ids})

            }

        }
        catch(Err){
            logger.debug("=========Err>>",Err)
                reject(Err)

        }

    })
}



const salesRecord = async (req, res) => {
    try {

        let payload = req.query
        let date = payload.date || "0000-00-00"
        let limit = parseInt(payload.limit) || 100;
        let skip = parseInt(payload.skip) || 0;
        let is_download = payload.is_download || 0;

        let supplier_id = req.query.supplier_id || 0;

        if (parseInt(supplier_id)==0) {
            let query = `select user.id as user_id, user.firstname as userName, orders.status,orders.net_amount,
        orders.id as order_id,(select ROUND(SUM(net_amount), 2) from orders where status = 5 or status =8
        and  DATE(orders.created_on) = ?) as cancelledOrdersAmount ,
         (SELECT count(id) from orders where status = 5 or status =8 or status = 2 and   DATE(orders.created_on)=? ) as totalCancelOrder from 
        orders join user on orders.user_id = user.id where  DATE(orders.created_on) =? and (orders.status=5 or orders.status=8 ) limit ?,?`

            let queryCount = `select user.id as user_id, user.firstname as userName,orders.status, orders.net_amount,
        orders.id as order_id,(select ROUND(SUM(net_amount),2) from orders where status = 5 or status =8
        and  DATE(orders.created_on) = ? ) as cancelledOrdersAmount , 
        (SELECT count(id) from orders where status = 5 or status =8 or status = 2 and   DATE(orders.created_on)=? ) as totalCancelOrder 
        from orders join user on orders.user_id = user.id where  DATE(orders.created_on) = ? and (orders.status=5 or orders.status=8) `


            if (parseInt(is_download)) {
                let levelData = await ExecuteQ.Query(req.dbName, queryCount, [date, date, date]);

                let header = [
                    { id: 'USER ID', title: 'USER ID' },
                    { id: 'USER NAME', title: 'USER NAME' },
                    { id: 'ORDER ID', title: 'ORDER ID' },
                    { id: 'STATUS', title: 'STATUS' },
                    { id: 'ORDER AMOUNT', title: 'ORDER AMOUNT' },
                    // { id: 'TOTAL CANCELLED ORDERS' }
                ]
                let data = levelData.map((element) => {
                    let temp = {}
                    temp["USER ID"] = element.user_id
                    temp["USER NAME"] = element.userName
                    temp["ORDER ID"] = element.order_id
                    temp["STATUS"] = parseInt(element.status)==8?"Cancelled":parseInt(element.status)==5?"Delivered":"Rejected"
                    temp["ORDER AMOUNT"] = element.net_amount
                    return temp;
                })
                // data.push(
                //     {
                //         'USER ID': 'TOTAL CANCELLED ORDERS', "USER NAME": 66,

                //         "ORDER ID": "ORDER CANCELLED AMOUNT", "TOTAL CANCELLED ORDERS": 948
                //     }
                // )

                let csvLink = await uploadMgr.uploadCsvFileNew(data, header, "sales-order_")
                logger.debug("+==========csvLingk=========", csvLink)
                let finalRes = {
                    list: csvLink,
                    count: 0,

                }
                sendResponse.sendSuccessData(finalRes, constant.responseMessage.SUCCESS, res, 200);

            }
            else {

                let levelData = await ExecuteQ.Query(req.dbName, query, [date, date, date, skip, limit]);
                let levelDataCount = await ExecuteQ.Query(req.dbName, queryCount, [date, date, date]);

                let total_receivable_amount = 0;
                let total_refundable_amount = 0;
                let balance_amount = 0;





                if(levelDataCount && levelDataCount.length>0){

                    for(const [index,i] of levelDataCount.entries()){
                        console.log("=================i==========",i.status)
                        if(parseInt(i.status)==5){
                            total_receivable_amount = total_receivable_amount + parseFloat(i.net_amount)
                        }else if(parseInt(i.status)==8){
                            total_receivable_amount = total_receivable_amount - parseFloat(i.net_amount)
                            total_refundable_amount = parseFloat(i.net_amount)
                        }else if(parseInt(i.status)==2){
                            total_receivable_amount = total_receivable_amount - parseFloat(i.net_amount)
                            total_refundable_amount = parseFloat(i.net_amount)
                        }

                    }
                    balance_amount = total_receivable_amount - total_refundable_amount
                }

                console.log(date)

                let finalRes = {
                    list: levelData,
                    balance_amount : balance_amount,
                    total_receivable_amount : total_receivable_amount,
                    total_refundable_amount : total_refundable_amount,
                    count: levelDataCount && levelDataCount.length > 0 ? levelDataCount.length : 0
                }


                sendResponse.sendSuccessData(finalRes, constant.responseMessage.SUCCESS, res, 200);

            }
        }else{
            {
                let query = `select user.id as user_id, user.firstname as userName, orders.status,orders.net_amount,
            orders.id as order_id,(select ROUND(SUM(net_amount), 2) from orders where status = 5 or status =8
            and  DATE(orders.created_on) = ?) as cancelledOrdersAmount ,
             (SELECT count(id) from orders where status = 5 or status =8 or status = 2 and   DATE(orders.created_on)=? ) as totalCancelOrder from 
            orders join user on orders.user_id = user.id 
            join supplier_branch sb on sb.id = orders.supplier_branch_id join supplier s on s.id = sb.supplier_id
             where  DATE(orders.created_on) =? and (orders.status=5 or orders.status=8 ) and s.id=${supplier_id} limit ?,?`
    
                let queryCount = `select user.id as user_id, user.firstname as userName,orders.status, orders.net_amount,
            orders.id as order_id,(select ROUND(SUM(net_amount),2) from orders where status = 5 or status =8
            and  DATE(orders.created_on) = ? ) as cancelledOrdersAmount , 
            (SELECT count(id) from orders where status = 5 or status =8 or status = 2 and   DATE(orders.created_on)=? ) as totalCancelOrder 
            from orders join user on orders.user_id = user.id
            join supplier_branch sb on sb.id = orders.supplier_branch_id join supplier s on s.id = sb.supplier_id
             where  DATE(orders.created_on) = ? and (orders.status=5 or orders.status=8)  and s.id=${supplier_id} `
    
    
                if (parseInt(is_download)) {
                    let levelData = await ExecuteQ.Query(req.dbName, queryCount, [date, date, date]);
    
                    let header = [
                        { id: 'USER ID', title: 'USER ID' },
                        { id: 'USER NAME', title: 'USER NAME' },
                        { id: 'ORDER ID', title: 'ORDER ID' },
                        { id: 'STATUS', title: 'STATUS' },
                        { id: 'ORDER AMOUNT', title: 'ORDER AMOUNT' },
                        // { id: 'TOTAL CANCELLED ORDERS' }
                    ]
                    let data = levelData.map((element) => {
                        let temp = {}
                        temp["USER ID"] = element.user_id
                        temp["USER NAME"] = element.userName
                        temp["ORDER ID"] = element.order_id
                        temp["STATUS"] = parseInt(element.status)==8?"Cancelled":parseInt(element.status)==5?"Delivered":"Rejected"
                        temp["ORDER AMOUNT"] = element.net_amount
                        return temp;
                    })
                    // data.push(
                    //     {
                    //         'USER ID': 'TOTAL CANCELLED ORDERS', "USER NAME": 66,
    
                    //         "ORDER ID": "ORDER CANCELLED AMOUNT", "TOTAL CANCELLED ORDERS": 948
                    //     }
                    // )
    
                    let csvLink = await uploadMgr.uploadCsvFileNew(data, header, "sales-order_")
                    logger.debug("+==========csvLingk=========", csvLink)
                    let finalRes = {
                        list: csvLink,
                        count: 0,
    
                    }
                    sendResponse.sendSuccessData(finalRes, constant.responseMessage.SUCCESS, res, 200);
    
                }
                else {
    
                    let levelData = await ExecuteQ.Query(req.dbName, query, [date, date, date, skip, limit]);

                    let total_receivable_amount = 0;
                    let total_refundable_amount = 0;
                    let balance_amount = 0;




                    let levelDataCount = await ExecuteQ.Query(req.dbName, queryCount, [date, date, date]);

                    if(levelDataCount && levelDataCount.length>0){

                        for(const [index,i] of levelDataCount.entries()){
                            if(parseInt(i.status)==5){
                                total_receivable_amount = total_receivable_amount + parseFloat(i.net_amount)
                            }else if(parseInt(i.status)==8){
                                total_receivable_amount = total_receivable_amount - parseFloat(i.net_amount)
                                total_refundable_amount = parseFloat(i.net_amount)
                            }else if(parseInt(i.status)==2){
                                total_receivable_amount = total_receivable_amount - parseFloat(i.net_amount)
                                total_refundable_amount = parseFloat(i.net_amount)
                            }
                        }
                        balance_amount = total_receivable_amount - total_refundable_amount
                    }

                    console.log(date)

                    let finalRes = {
                        list: levelData,
                        balance_amount : balance_amount,
                        total_receivable_amount : total_receivable_amount,
                        total_refundable_amount : total_refundable_amount,
                        count: levelDataCount && levelDataCount.length > 0 ? levelDataCount.length : 0
                    }
                    sendResponse.sendSuccessData(finalRes, constant.responseMessage.SUCCESS, res, 200);
    
                }
            }
        }


    }


    catch (Err) {
        logger.error("======ERR!==", Err);
        sendResponse.somethingWentWrongError(res);
    }
}


module.exports = {
    salesRecord: salesRecord,
    Dashboard: Dashboard,
    DashboardV2:DashboardV2
}