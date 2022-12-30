/**
 * ==========================================================================
 * created by cbl-147
 * @description used for performing an dashboard related action from admin panel
 * ==========================================================================
 */
var mysql = require('mysql');
var async = require('async');
var constant=require('../../routes/constant')
var connectionCntr=require('../../routes/connection')
var sendResponse = require('../../routes/sendResponse');
var uploadMgr=require('../../lib/UploadMgr')
var confg=require('../../config/const');
const Universal=require('../../util/Universal')
var _ = require('underscore'); 
var chunk = require('chunk');
var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = config.get('server.debug_level');
const common=require('../../common/agent');
let ExecuteQ=require('../../lib/Execute')
const AgentCommon = require('../../common/agent')

var crypto = require('crypto'),
    algorithm = confg.SERVER.CYPTO.ALGO,
    password =  confg.SERVER.CYPTO.PWD

/**
 * @desc used for adding an brand in category
 * @param {*Object} req 
 * @param {*Object} res 
 */
const Dashboard=async (req,res)=>{
    try{
        let is_single_vendor = req.is_single_vendor
        var dataToSend;
        if(req.query.supplier_id){
            var supplier_order_data = await SupplierTotalOrderAccDate(req.dbName, req.query.start_date, req.query.end_date, req.query.supplier_id);
            var supplier_reveneu_data = await SupplierTotalOrderRevenueAccDate(req.dbName, req.query.start_date, req.query.end_date, req.query.supplier_id);
            var total_supplier_order_data = await SupplierTotalOrder(req.dbName,req.query.supplier_id)
            var total_supplier_reveneu_data = await SupplierTotalOrderRevenue(req.dbName, req.query.supplier_id)

            var total_revenue_order = {
                total_order : total_supplier_order_data,
                total_revenue : total_supplier_reveneu_data
            }


            var supplier_orders_count = await Supplier_get_orders_count(req.dbName, req.query.supplier_id);
            var supplier_total_category = await Supplier_get_total_categories(req.dbName, req.query.supplier_id);
            var supplier_total_product = await Supplier_get_total_product(req.dbName, req.query.supplier_id);
            dataToSend = {
                total_order : supplier_order_data,
                total_revenue : supplier_reveneu_data,
                pending_order_count : supplier_orders_count[0].pending_order_count,
                active_order_count : supplier_orders_count[0].active_order_count,
                completed_order_count : supplier_orders_count[0].completed_order_count,
                cancel_order_count : supplier_orders_count[0].cancel_order_count,
                category_count : supplier_total_category,
                product_count : supplier_total_product,
                total_revenue_order : total_revenue_order
            }
        }else{
            var order_data=await TotalOrderAccDate(req.query.start_date,req.query.end_date,req.dbName);

            var reveneu_data=await TotalOrderRevenueAccDate(req.query.start_date,req.query.end_date,req.dbName,is_single_vendor);

            var order_total_data = await TotalOrder(req.dbName)
            var order_total_revenue = await TotalOrderRevenue(req.dbName,is_single_vendor)
            var total_revenue_order = {
                total_order : order_total_data,
                total_revenue : order_total_revenue
            }
            var total_user= await TotalRegisterUser(req.query.start_date,req.query.end_date,req.dbName);     
            var orders_count = await get_orders_count(req.dbName);
            var register_supplier_count = await get_register_supplier(req.dbName);
            var total_category = await get_total_categories(req.dbName);
            var total_product = await get_total_product(req.dbName);
            var active_offers = await get_active_offers(req.dbName);
            var data = {}
    

            var pending_orders = await latestPendingOrders(req.dbName,6)

            var active_orders  = await latestActiveOrders(req.dbName,6);

            var get_active_products_orders = await getProducts(active_orders,req.dbName)
            var get_active_categories_orders = await getCategories(get_active_products_orders,req.dbName)
            var get_products_orders   = await getProducts(pending_orders,req.dbName)
            var get_categories_orders = await getCategories(get_products_orders,req.dbName)
            data.orders = get_categories_orders;
            data.activeOrders = get_active_categories_orders
            dataToSend = {
                pending_order_count : orders_count[0].pending_order_count,
                active_order_count : orders_count[0].active_order_count,
                completed_order_count : orders_count[0].completed_order_count,
                cancel_order_count : orders_count[0].cancel_order_count,
                register_supplier_count : register_supplier_count[0].supplier_count,
                category_count : total_category[0].category_count,
                product_count : total_product[0].product_count,
                offers_count : active_offers,
                total_order : order_data,
                total_revenue : reveneu_data,
                total_revenue_order : total_revenue_order,
                total_user : total_user,                        
                latestPendingOrders : data.orders,
                latestActiveOrders : data.activeOrders
            }
        }
                sendResponse.sendSuccessData(dataToSend,constant.responseMessage.SUCCESS, res, 200);
    }
    catch(Err){
        logger.error(Err);
        sendResponse.somethingWentWrongError(res);
    }
}










/**
 * @desc used for adding an brand in category
 * @param {*Object} req 
 * @param {*Object} res 
 */
const DashboardV2=async (req,res)=>{
    try{
        let is_single_vendor = req.is_single_vendor;
        var dataToSend;
        logger.debug("==========month filter=======++",req.body.month_filter)
        let month_filter = req.query.month_filter!==undefined ? req.query.month_filter : "";
        logger.debug("==========month filter=======++",month_filter)
        
        let updationRequestCheck = await ExecuteQ.Query(req.dbName,
            "select `key`, value from tbl_setting where `key`='enable_updation_vendor_approval' and value=1",
            []);

        if(req.query.supplier_id){
            
            var supplier_order_data = await SupplierTotalOrderAccDate(req.dbName, req.query.start_date, req.query.end_date, req.query.supplier_id);
            var supplier_reveneu_data = await SupplierTotalOrderRevenueAccDate(req.dbName, req.query.start_date, req.query.end_date, req.query.supplier_id);

            var total_supplier_order_data = await SupplierTotalOrder(req.dbName,req.query.supplier_id)
            var total_supplier_reveneu_data = await SupplierTotalOrderRevenue(req.dbName, req.query.supplier_id)
            let total_supplier_order_data_date = await SupplierTotalOrderByDate(req.dbName,req.query.start_date, req.query.end_date,req.query.supplier_id)
            let total_supplier_reveneu_data_date = await SupplierTotalOrderRevenueByDate(req.dbName,req.query.start_date, req.query.end_date, req.query.supplier_id)

            var total_revenue_order = {
                total_order : total_supplier_order_data,
                total_revenue : total_supplier_reveneu_data,
                total_order_by_date : total_supplier_order_data_date,
                total_revenue_by_date:total_supplier_reveneu_data_date
            }


            var supplier_orders_count = await Supplier_get_orders_count(req.dbName, req.query.supplier_id);
            var supplier_total_category = await Supplier_get_total_categories(req.dbName, req.query.supplier_id);
            var supplier_total_product = await Supplier_get_total_product(req.dbName, req.query.supplier_id);

            let daily_sales_record_count = await getDailySalesRecordCount(req.dbName,req.query.supplier_id);
            let table_booking_count = await getTableBookingCount(req.dbName,req.query.supplier_id);
            dataToSend = {
                total_order : supplier_order_data,
                total_revenue : supplier_reveneu_data,
                pending_order_count : supplier_orders_count[0].pending_order_count,
                active_order_count : supplier_orders_count[0].active_order_count,
                completed_order_count : supplier_orders_count[0].completed_order_count,
                cancel_order_count : supplier_orders_count[0].cancel_order_count,
                category_count : supplier_total_category,
                product_count : supplier_total_product,
                total_revenue_order : total_revenue_order,
                daily_sales_record_count:daily_sales_record_count,
                table_booking_count:table_booking_count
            }
        }else{
            var order_data=await TotalOrderAccDate(req.query.start_date,
                req.query.end_date,req.dbName);

            var reveneu_data=await TotalOrderRevenueAccDate(req.query.start_date,
                req.query.end_date,req.dbName,is_single_vendor);

            var order_total_data = await TotalOrder(req.dbName)
            var order_total_revenue = await TotalOrderRevenue(req.dbName,is_single_vendor);

            var order_total_data_by_date = await TotalOrderByDate(req.dbName,req.query.start_date,req.query.end_date)
            var order_total_revenue_by_date = await TotalOrderRevenueByDate(req.dbName,is_single_vendor,req.query.start_date,req.query.end_date);
            let active_agents = await getTotalActiveAgents(req.dbName)
            let active_orders_agents = await getTotalActiveOrdersAgents(req.dbName)
          
            var total_revenue_order = {
                total_order : order_total_data,
                total_revenue : order_total_revenue,
                total_order_by_date:order_total_data_by_date,
                total_revenue_by_date:order_total_revenue_by_date
            }
            var total_user= await TotalRegisterUser(req.query.start_date,req.query.end_date,req.dbName);     
            var orders_count = await get_orders_count(req.dbName);
            var register_supplier_count = await get_register_supplier(req.dbName);
            var total_category = await get_total_categories(req.dbName);
            var total_product = await get_total_product(req.dbName);
            var active_offers = await get_active_offers(req.dbName);
            var data = {}
    
            var pending_orders = await latestPendingOrdersV2(req.dbName,6)

            var active_orders  = await latestActiveOrdersV2(req.dbName,6);

            var get_active_products_orders = await getProducts(active_orders,req.dbName)
            var get_active_categories_orders = await getCategories(get_active_products_orders,req.dbName)
            var get_products_orders   = await getProducts(pending_orders,req.dbName)
            var get_categories_orders = await getCategories(get_products_orders,req.dbName)
            data.orders = get_categories_orders;
            data.activeOrders = get_active_categories_orders

            let total_active_subuscriptions_count = await getTotalActiveSubscriptionsCount(req.dbName);
            let total_expired_subuscriptions_count = await getTotalExpiredSubscriptionsCount(req.dbName);
            logger.debug("==========month_filter==",month_filter)
            let subscriptionRevenueGraph = await getMonthlyRevenueSubscriptionGraph(req.dbName,
                month_filter);
            let monthlySubscriptionCountGraph = await getMonthlySubscriptionCountGraph(req.dbName,month_filter);
             let daily_sales_record_count = await getDailySalesRecordCount(req.dbName,0);
             let table_booking_count = await getTableBookingCount(req.dbName,0);
                console.log("orders_count>>>>>>>>>",orders_count)
            dataToSend = {
                pending_order_count : orders_count[0].pending_order_count,
                active_order_count : orders_count[0].active_order_count,
                completed_order_count : orders_count[0].completed_order_count,
                cancel_order_count : orders_count[0].cancel_order_count,
                register_supplier_count : register_supplier_count[0].supplier_count,
                category_count : total_category[0].category_count,
                product_count : total_product[0].product_count,
                offers_count : active_offers,
                total_order : order_data,
                total_revenue : reveneu_data,
                total_revenue_order : total_revenue_order,
                total_user : total_user,                        
                latestPendingOrders : data.orders,
                latestActiveOrders : data.activeOrders,
                active_agents:active_agents,
                total_active_subuscriptions_count:total_active_subuscriptions_count,
                total_expired_subuscriptions_count:total_expired_subuscriptions_count,
                subscriptionRevenueGraph:subscriptionRevenueGraph,
                monthlySubscriptionCountGraph:monthlySubscriptionCountGraph,
                active_orders_agents:active_orders_agents,
                daily_sales_record_count:daily_sales_record_count,
                table_booking_count:table_booking_count
            }

            if( updationRequestCheck && updationRequestCheck.length>0 ) {

                let product_price_updation_count    = await getProductPricingUpdationRequestsCount(req.dbName);
                let product_updation_count          = await getProductUpdationRequestsCount(req.dbName);
                let supplier_profile_updation_count = await getSupplierUpdationRequests(req.dbName);

                dataToSend["product_price_updation_count"]    = product_price_updation_count;
                dataToSend["product_updation_count"]          = product_updation_count;
                dataToSend["supplier_profile_updation_count"] = supplier_profile_updation_count;

            }


        }
                sendResponse.sendSuccessData(dataToSend,constant.responseMessage.SUCCESS, res, 200);
    }
    catch(Err){
        logger.error(Err);
        sendResponse.somethingWentWrongError(res);
    }
}


function getProductPricingUpdationRequestsCount(dbName){
    return new Promise(async(resolve,reject)=>{
       
            let query = "select id from product_pricing_updation_request  ";
            let data = await ExecuteQ.Query(dbName,query,[]);
            if(data && data.length>0){
                resolve(data.length);

            }else{
                resolve(0);
            }
        
    })
}

function getProductUpdationRequestsCount(dbName){
    return new Promise(async(resolve,reject)=>{
        let query = "select id from supplier_product_updation_request ";
        let data = await ExecuteQ.Query(dbName,query,[]);
        if(data && data.length>0){
            resolve(data.length);

        }else{
            resolve(0);
        }
    })
}

function getSupplierUpdationRequests(dbName){
    return new Promise(async(resolve,reject)=>{
       
            let query = "select id from supplier_updation_requests  ";
            let data = await ExecuteQ.Query(dbName,query,[]);
            if(data && data.length>0){
                resolve(data.length);

            }else{
                resolve(0);
            }
        
    })
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


const getDailySalesRecordCount = (dbName,supplier_id)=>{
    return new Promise(async(resolve,reject)=>{
        if(parseInt(supplier_id)!==0){
            let query = `select count(orders.id) as total   
            from 
            orders join user on orders.user_id = user.id 
            join supplier_branch sb on sb.id = orders.supplier_branch_id join supplier s on s.id = sb.supplier_id 
            where  DATE(orders.created_on) = CURDATE() and (orders.status=5 or orders.status=8 or orders.status = 2) and s.id=${supplier_id} `
            
            let data = await ExecuteQ.Query(dbName,query,[]);
        
            if(data && data.length>0){
                resolve(data[0].total)
            }else{
                resolve(0)
            }
        }else{
            let query = `select count(orders.id) as total 
            from orders join user on orders.user_id = user.id where  DATE(orders.created_on) = CURDATE() and (orders.status=5 or orders.status=8 or orders.status = 2) `
            
            let data = await ExecuteQ.Query(dbName,query,[]);
        
            if(data && data.length>0){
                resolve(data[0].total)
            }else{
                resolve(0)
            }
        }
    })
    
}

function getTotalActiveAgents(dbName,supplier_id){
    return new Promise(async(resolve,reject)=>{
        try{
            var agent_db_data    = await AgentCommon.GetAgentDbInformation(dbName);
            
            logger.debug("==agent_db_data==",agent_db_data);
    
            var agent_connection  = await AgentCommon.RunTimeAgentConnection(agent_db_data);
    
            var sql = `select count(id) as total_active_agents 
            from  cbl_user where deleted_by=0  and is_available=1 and is_active=1`;
            let agentcount = await ExecuteQ.QueryAgent(agent_connection,sql,[])
            resolve(agentcount[0].total_active_agents);
        }catch(err){
            logger.debug("===========",err);
            resolve([])
        }
   
    })
}

const getTotalActiveOrdersAgents =  (dbName)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            var agent_db_data    = await AgentCommon.GetAgentDbInformation(dbName);
            
            logger.debug("==agent_db_data=",agent_db_data);
    
            var agent_connection  = await AgentCommon.RunTimeAgentConnection(agent_db_data);
    
            var sql = `select count(cbl_user.id) as total_active_orders_agents 
            from  cbl_user join cbl_user_orders o on o.user_id = cbl_user.id join ${dbName}.orders ors on ors.id=o.order_id where deleted_by=0  and is_available=1 and is_active=1
            and o.status=3 or o.status=1 or o.status=7 or o.status=9 or o.status=10 or o.status=11`;
            
            let agentcount = await ExecuteQ.QueryAgent(agent_connection,sql,[])
            resolve(agentcount[0].total_active_orders_agents);
        }catch(err){
            logger.debug("===========",err);
            resolve([])
        }
   
    })
}

function getTotalActiveSubscriptionsCount(dbName){
    return new Promise(async(resolve,reject)=>{
        try{

            let sql = `select count(id) as total_active_subuscriptions
            from  supplier_subscription where status="active" `;

            let subscriptioncount = await ExecuteQ.Query(dbName,sql,[])
            resolve(subscriptioncount[0].total_active_subuscriptions);
        }catch(err){
            logger.debug("===========",err);
            resolve([])
        }
   
    })
}

function getTotalExpiredSubscriptionsCount(dbName){
    return new Promise(async(resolve,reject)=>{
        try{

            let sql = `select count(id) as total_active_subuscriptions
            from  supplier_subscription where status="expired" `;

            let subscriptioncount = await ExecuteQ.Query(dbName,sql,[])
            resolve(subscriptioncount[0].total_active_subuscriptions);
        }catch(err){
            logger.debug("===========",err);
            resolve([])
        }
   
    })
}


function getMonthlyRevenueSubscriptionGraph(dbName,month_filter){
    return new Promise(async(resolve,reject)=>{
        try{

            let monthSearchQuery = "";
            logger.debug("==getMonthlyRevenueSubscriptionGraph=========month_filter=============",month_filter)
            if(month_filter!==""){
                monthSearchQuery = " and MONTH(created_at)='"+month_filter+"' ";
            }
            logger.debug("==monthSearchQuery=============",monthSearchQuery)

            let sql3 = "SELECT MONTHNAME(sp.created_at) `month`, YEAR(sp.created_at) `year`, sp.created_at, SUM((sp.price * (SELECT count(id) from supplier_subscription where sp.id=plan_id))) total_revenue FROM `subscription_plans` sp WHERE sp.is_deleted='0' "+monthSearchQuery+" and sp.is_block='0' GROUP BY YEAR(sp.created_at), MONTH(sp.created_at)";
            let dataMonthly=await ExecuteQ.Query(dbName,sql3,[]);
            
            resolve(dataMonthly);
        }catch(err){
            logger.debug("===========",err);
            resolve([])
        }
   
    })
}

function getMonthlySubscriptionCountGraph(dbName,month_filter){
    return new Promise(async(resolve,reject)=>{
        try{

            let monthSearchQuery = "";
            if(month_filter!=""){
                monthSearchQuery = " where MONTH(created_at)='"+month_filter+"' ";
            }
            
            let sql = "select count(id) as mounthly_subuscriptions_count ";
            sql+= " from  supplier_subscription "+monthSearchQuery+" ";
            
            let dataMonthly=await ExecuteQ.Query(dbName,sql,[]);
            
            resolve(dataMonthly);
            
        }catch(err){
            logger.debug("===========",err);
            resolve([])
        }
   
    })
}



function SupplierTotalOrderAccDate(dbName, start_date, end_date, supplierId) {
    return new Promise((resolve, reject) => {
        var final_result = [],final_result1=[]
        let temp;
        var q = " select id from supplier_branch where supplier_id = ? ";
        var count = 0;
        multiConnection[dbName].query(q, [supplierId], function (err, result1) {
            var q1 = "SELECT IFNULL(DAYOFWEEK(`created_on`),0) as week_day,IFNULL(DATE(`created_on`),0) as created_at,COUNT(id) as total_order FROM orders  where DATE(created_on) >='" + start_date + "' and DATE(created_on) <= '" + end_date + "' and supplier_branch_id = ? group by created_at";
            if (result1.length) {
                for (var i = 0; i < result1.length; i++) {
                    (async function (i) {
                        try{
                        let temp;
                        // var stmt = multiConnection[dbName].query(q1, [result1[i].id], function (err, result) {
                            let result=await ExecuteQ.Query(dbName,q1,[result1[i].id]);
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
                            logger.debug("======ERR!==",Err)
                            resolve([])
                        }
                        // });
                    })(i);
                }
            }
            else {
                resolve(count);
            }
        });
    })
}

function SupplierTotalOrder(dbName,supplierId) {
    return new Promise((resolve, reject) => {
        var final_result = 0
        let temp;
        var q = " select id from supplier_branch where supplier_id = ? ";
        var count = 0;
        multiConnection[dbName].query(q, [supplierId], function (err, result1) {
            var q1 = "SELECT COUNT(id) as total_order FROM orders where  supplier_branch_id = ? ";
            if (result1.length) {
                for (var i = 0; i < result1.length; i++) {
                    (async function (i) {
                        try{
                        let result=await ExecuteQ.Query(dbName,q1,[result1[i].id])
                        // var stmt = multiConnection[dbName].query(q1, [result1[i].id], function (err, result) {
                            if(result && result.length ){
                                final_result += result[0].total_order
                            }
                            if (i == result1.length - 1) {
                                resolve(final_result);
                            }
                        }catch(Err){
                            logger.debug("=======ERR!==")
                            resolve([])
                        }
                        // });
                    })(i);
                }
            }
            else {
                resolve(count);
            }
        });
    })
}
function SupplierTotalOrderByDate(dbName,startDate,endDate,supplierId) {
    // DATE(created_on) >='"+start_date+"'"+
    //                  " and DATE(co.created_on) <= '"+end_date+"'
    return new Promise((resolve, reject) => {
        var final_result = 0
        let temp;
        var q = " select id from supplier_branch where supplier_id = ? ";
        var count = 0;
        multiConnection[dbName].query(q, [supplierId], function (err, result1) {
            var q1 = "SELECT COUNT(id) as total_order FROM orders where  supplier_branch_id = ? and DATE(created_on)>='"+startDate+"' and DATE(created_on) <='"+endDate+"'";
            if (result1.length) {
                for (var i = 0; i < result1.length; i++) {
                    (async function (i) {
                        try{
                        let result=await ExecuteQ.Query(dbName,q1,[result1[i].id])
                        // var stmt = multiConnection[dbName].query(q1, [result1[i].id], function (err, result) {
                            if(result && result.length ){
                                final_result += result[0].total_order
                            }
                            if (i == result1.length - 1) {
                                resolve(final_result);
                            }
                        }catch(Err){
                            logger.debug("=======ERR!==")
                            resolve([])
                        }
                        // });
                    })(i);
                }
            }
            else {
                resolve(count);
            }
        });
    })
}

/*
 *This function is used to get data of total revenue today
 *
 */
function SupplierTotalOrderRevenueAccDate(dbName, start_date, end_date, supplierId) {
    return new Promise(async (resolve, reject) => {
        let final_result=[],result=[],count = 0,temp;
        var sql1 = " select id from supplier_branch where supplier_id = ? "
        let get_branch = await ExecuteQ.Query(dbName,sql1,[supplierId])
        let total=0,commision_given_to_admin=0,order_ids,order_data,reveneu_data,agentConnection={},ary,agent_order_data;

            for(const [index1,j] of get_branch.entries()){
                order_data=await supplierProfitAfterTaxCommissionAccDate(dbName,j.id,start_date,end_date);
                order_ids=order_data.order_ids;
                reveneu_data=order_data.revenue_data
                logger.debug("=====order==Data==>>",reveneu_data)
                if(order_ids && order_ids.length>0){
                    let getAgentDbData=await common.GetAgentDbInformation(dbName);        
                    // logger.debug("===AGENT==CONNECTION==>>==2=",Object.entries(agentConnection).length);
                    if(Object.entries(agentConnection).length===0){
                        agentConnection=await common.RunTimeAgentConnection(getAgentDbData);
                    }
                    let a_sql="select IFNULL(DAYOFWEEK(`co`.`created_on`),0) as week_day,IFNULL(DATE(`co`.`created_on`),0) as created_at,"+
                    " IFNULL(sum(co.commission_ammount),0) AS total_revenue"+
                     " from cbl_user_orders co join cbl_user cu on cu.id=co.user_id where  DATE(created_on) >='"+start_date+"'"+
                     " and DATE(co.created_on) <= '"+end_date+"' and co.order_id IN("+order_ids+") and cu.supplier_id=0 group by DATE(co.created_on) "
                     agent_order_data=await ExecuteQ.QueryAgent(agentConnection,a_sql,[]);
                     logger.debug("======AGENT==ORDER==>>",agent_order_data)
                    if(reveneu_data && reveneu_data.length>0){
                        for(const [rindex,j] of reveneu_data.entries()){
                            temp = {
                                    week_day : j.week_day,
                                    created_at : j.created_at,
                                    total_revenue : j.total_revenue
                                }
                            if(agent_order_data && agent_order_data.length>0){
                                for(const [aindex,k] of agent_order_data.entries()){
                                    if(k.created_at==j.created_at){
                                        // logger.debug("====MATCH===",k.total_revenue)
                                        temp.total_revenue= temp.total_revenue-k.total_revenue
                                    }
                                }
                            }
                            final_result.push(temp)
                        }
                    }
                }
                      
            }   
            resolve(final_result)
            
            
      

    })
}

const supplierProfitAfterTaxCommissionAccDate=(dbName,supplierBranchId,start_date,end_date)=>{

    return new Promise(async (resolve,reject)=>{
        logger.debug("============ENTEr")
        try{
        let order_ids=[],total_supplier_profit=0;
        let sql ="SELECT IFNULL(DAYOFWEEK(`created_on`),0) as week_day,IFNULL(DATE(`created_on`),0) as created_at,IFNULL((SUM(net_amount)-SUM(handling_supplier)-SUM(supplier_commision)),0) as total_revenue from orders where created_on >='" + start_date + "' and created_on <= '" + end_date + "' and supplier_branch_id = ? and status = 5 group by created_at"
        let bQuey="SELECT `id` from orders where DATE(created_on) >='" + start_date + "' and DATE(created_on) <= '" + end_date + "' and supplier_branch_id = ? and (status = 5 or status = 6) "
        let revenueData= await ExecuteQ.Query(dbName,sql,[supplierBranchId]);
        let orderData=await ExecuteQ.Query(dbName,bQuey,[supplierBranchId]);

         
       
            if(orderData && orderData.length>0){

                for(const [index3,k] of orderData.entries())
                {
                    order_ids.push(k.id)
                }
                resolve({revenue_data:revenueData,order_ids:order_ids})
            }
            else{
                resolve({revenue_data:revenueData,order_ids:order_ids})
            }

        }
        catch(Err){
            logger.debug("=========Err>>",Err)
                reject(Err)

        }

    })
}

async function SupplierTotalOrderRevenue(dbName,supplierId) {
    return new Promise(async (resolve, reject) => {
        var final_result=0,agentConnection={};
        var sql1 = " select id from supplier_branch where supplier_id = ? "
        var count = 0;
        let get_branch = await ExecuteQ.Query(dbName,sql1,[supplierId])
        // let stmt = multiConnection[dbName].query(q, [supplierId],async function (err, result1) {
            // logger.debug("============sql query for get supplir brand ids======",stmt.q)
            let total=0,commision_given_to_admin=0,order_ids=[];
            for(const [index1,j] of get_branch.entries()){
                supplierProfitData=await supplierProfitAfterTaxCommission(dbName,j.id);
                logger.debug("=supplierProfitData=",supplierProfitData)
                total=total+supplierProfitData.total_supplier_profit;
                order_ids=order_ids.concat(supplierProfitData.order_ids);
                // total = total + get_revenue[0].total_revenue
            }
            logger.debug("=======final_order_ids==",order_ids)
            if(order_ids && order_ids.length>0){
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
            let deliveryChargeAmount=0;
            let promoBearAmount=0;
            let deliveryAmountData=await ExecuteQ.Query(dbName,"select IFNULL(SUM(delivery_amount),0) as deliveryAmount from  additional_admin_revenue_amount where supplier_id=?",[supplierId]);
            deliveryChargeAmount=parseFloat(deliveryAmountData[0].deliveryAmount)
            let promoBearData=await ExecuteQ.Query(dbName,"select IFNULL(SUM(promo_bear_amount),0) as bearAmount from  additional_admin_revenue_amount where supplier_id=?",[supplierId])
            promoBearAmount=parseFloat(promoBearData[0].bearAmount);
            total=(total+deliveryChargeAmount)-promoBearAmount;
            resolve(total)

            // var sql = "SELECT IFNULL(SUM(supplier_commision),0) as total_revenue from orders where supplier_branch_id = ? and status = 5 "
            // if (result1.length) {
            //     for (var i = 0; i < result1.length; i++) {
            //         (function (i) {
            //             let st2 = multiConnection[dbName].query(sql, [result1[i].id], function (err, result) {
            //                 logger.debug("=====query of st2=====",st2.sql)
            //                 if (err) {
            //                     logger.debug("----------eerr11=======",err)
            //                     reject(err)
            //                 }
                            
            //                 final_result = final_result + result[0].total_revenue
            //                 if (i == result1.length - 1) {
            //                     resolve(final_result);
            //                 }
            //             });
            //         })(i);
            //     }


            // }
            // else {
            //     resolve(final_result)
            // }


        // });

    })
}
async function SupplierTotalOrderRevenueByDate(dbName,startDate,endDate,supplierId) {
    return new Promise(async (resolve, reject) => {
        var final_result=0,agentConnection={};
        var sql1 = " select id from supplier_branch where supplier_id = ? "
        var count = 0;
        let get_branch = await ExecuteQ.Query(dbName,sql1,[supplierId])
        // let stmt = multiConnection[dbName].query(q, [supplierId],async function (err, result1) {
            // logger.debug("============sql query for get supplir brand ids======",stmt.q)
            let total=0,commision_given_to_admin=0,order_ids=[];
            for(const [index1,j] of get_branch.entries()){
                supplierProfitData=await supplierProfitAfterTaxCommissionV1(dbName,startDate,endDate,j.id);
                logger.debug("=supplierProfitData=",supplierProfitData)
                total=total+supplierProfitData.total_supplier_profit;
                order_ids=order_ids.concat(supplierProfitData.order_ids);
                // total = total + get_revenue[0].total_revenue
            }
            logger.debug("=======final_order_ids==",order_ids)
            if(order_ids && order_ids.length>0){
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
            // total=total-commision_given_to_admin;
            // logger.debug("==After==>",total);


            total=total-commision_given_to_admin;
            logger.debug("==After==>",total);
            let deliveryChargeAmount=0;
            let promoBearAmount=0;
            let deliveryAmountData=await ExecuteQ.Query(dbName,"select IFNULL(SUM(delivery_amount),0) as deliveryAmount from  additional_admin_revenue_amount where supplier_id=?",[supplierId]);
            deliveryChargeAmount=parseFloat(deliveryAmountData[0].deliveryAmount)
            let promoBearData=await ExecuteQ.Query(dbName,"select IFNULL(SUM(promo_bear_amount),0) as bearAmount from  additional_admin_revenue_amount where supplier_id=?",[supplierId])
            promoBearAmount=parseFloat(promoBearData[0].bearAmount);
            total=(total+deliveryChargeAmount)-promoBearAmount;
            resolve(total)


            resolve(total)

            // var sql = "SELECT IFNULL(SUM(supplier_commision),0) as total_revenue from orders where supplier_branch_id = ? and status = 5 "
            // if (result1.length) {
            //     for (var i = 0; i < result1.length; i++) {
            //         (function (i) {
            //             let st2 = multiConnection[dbName].query(sql, [result1[i].id], function (err, result) {
            //                 logger.debug("=====query of st2=====",st2.sql)
            //                 if (err) {
            //                     logger.debug("----------eerr11=======",err)
            //                     reject(err)
            //                 }
                            
            //                 final_result = final_result + result[0].total_revenue
            //                 if (i == result1.length - 1) {
            //                     resolve(final_result);
            //                 }
            //             });
            //         })(i);
            //     }


            // }
            // else {
            //     resolve(final_result)
            // }


        // });

    })
}

const supplierProfitAfterTaxCommission=(dbName,supplierBranchId)=>{

    return new Promise(async (resolve,reject)=>{
        logger.debug("============ENTEr")
        try{
        let order_ids=[],total_supplier_profit=0;
        let sql ="SELECT `id`,`handling_admin`,`handling_supplier`,`delivery_charges`,`net_amount`,`supplier_commision` from orders where supplier_branch_id = ? and status = 5 "
        let orderData= await ExecuteQ.Query(dbName,sql,[supplierBranchId])

            if(orderData && orderData.length>0){
                for(const [index3,k] of orderData.entries())
                {
                    total_supplier_profit=total_supplier_profit+(parseFloat(k.net_amount)-(parseFloat(k.handling_admin)+parseFloat(k.supplier_commision)))
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

const supplierProfitAfterTaxCommissionV1=(dbName,startDate,endDate,supplierBranchId)=>{

    return new Promise(async (resolve,reject)=>{
        logger.debug("============ENTEr")
        try{
        let order_ids=[],total_supplier_profit=0;
        let sql ="SELECT `id`,`created_on`,`handling_admin`,`handling_supplier`,`delivery_charges`,`net_amount`,`supplier_commision` from orders where supplier_branch_id = ? and (status = 5 or status = 6) and DATE(created_on)>='"+startDate+"' and DATE(created_on)<='"+endDate+"' "
        let orderData= await ExecuteQ.Query(dbName,sql,[supplierBranchId])

            if(orderData && orderData.length>0){
                for(const [index3,k] of orderData.entries())
                {
                    total_supplier_profit=total_supplier_profit+(parseFloat(k.net_amount)-(parseFloat(k.handling_admin)+parseFloat(k.supplier_commision)))
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
const Supplier_get_orders_count = (db_name, supplierId) => {
    // 1,3,7,9,10,11
    return new Promise((resolve, reject) => {
        var sqlQuery = "select count(IF(o.status=0,1,NULL))  as pending_order_count, ";
        sqlQuery += "count(IF(o.status=1 or o.status=9 or o.status=3 or o.status=7 or o.status=11 or o.status=10,1,NULL)) as active_order_count, ";
        sqlQuery += "count(IF(o.status=5 or o.status=6,1,NULL)) as completed_order_count, ";
        sqlQuery += "count(IF(o.status=8,1,NULL)) as cancel_order_count from orders o "
        sqlQuery += "join supplier_branch sb on o.supplier_branch_id=sb.id join supplier s on sb.supplier_id = s.id where s.id=? and s.is_deleted=0"
        var st = multiConnection[db_name].query(sqlQuery, [supplierId], (err, data) => {
            if (err) {
                reject("Something Went Wrong")
            } else {
                resolve(data)
            }
        })
    })
}


const Supplier_get_total_categories = (db_name, supplierId) => {
    return new Promise((resolve, reject) => {
        var sqlQuery = "select count(*) as category_count from categories c join supplier_category sc on c.id = sc.category_id where sc.supplier_id=?";
        var stmt = multiConnection[db_name].query(sqlQuery, [supplierId], (err, data) => {
            logger.debug(stmt.sqlQuery, err)
            if (err) {
                reject("something went wrong");
            } else {
                resolve(data[0].category_count)
            }
        })
    })
}

const Supplier_get_total_product = (db_name, supplierId) => {
    return new Promise((resolve, reject) => {
        var sqlQuery = "select count(*) as product_count from product p join supplier_product sp on sp.original_product_id = p.id where sp.supplier_id=?";
        var stmt = multiConnection[db_name].query(sqlQuery, [supplierId], (err, data) => {
            logger.debug(stmt.sqlQuery, err)
            if (err) {
                reject("something went wrong");
            } else {
                resolve(data[0].product_count)
            }
        })
    })
}


const TotalOrderAccDate=(start_date,end_date,db_name)=>{    
    return new Promise((resolve,reject)=>{
        var sqlQuery="SELECT DAYOFWEEK(`created_on`) as week_day,DATE(`created_on`) as created_at,COUNT(*) as total_order FROM orders"+        
        " where DATE(created_on) >= ? and DATE(created_on)<=?  GROUP BY created_at ORDER BY DATE(created_on) ASC"
       var st= multiConnection[db_name].query(sqlQuery,[start_date,end_date],(err,data)=>{
        logger.debug(st.sql)    
        if(err){
            console.log("============here=======",err)
                reject("Something Went Wrong")
            }
            else{
                logger.debug("===DATA!==",data)
                resolve(data)
            }   
        })
    })

}
const TotalOrder = (dbName)=>{
    return new Promise((resolve,reject)=>{
        var sqlQuery="SELECT COUNT(*) as total_order FROM orders"+        
        "  ORDER BY DATE(created_on) ASC"
       var st= multiConnection[dbName].query(sqlQuery,(err,data)=>{
        logger.debug(st.sql)    
        if(err){
            console.log("============here=======",err)
                reject("Something Went Wrong")
            }
            else{
                logger.debug("===DATA!==",data)
                resolve(data[0].total_order)
            }   
        })
    })

}
const TotalOrderByDate = (dbName,startDate,endDate)=>{
    return new Promise((resolve,reject)=>{
        var sqlQuery="SELECT COUNT(*) as total_order FROM orders where DATE(created_on)>='"+startDate+"' and DATE(created_on)<='"+endDate+"'"+        
        "  ORDER BY DATE(created_on) ASC"
       var st= multiConnection[dbName].query(sqlQuery,(err,data)=>{
        logger.debug(st.sql)    
        if(err){
            console.log("============here=======",err)
                reject("Something Went Wrong")
            }
            else{
                logger.debug("===DATA!==",data)
                resolve(data[0].total_order)
            }   
        })
    })

}
const TotalOrderRevenueAccDate=(start_date,end_date,db_name,is_single_vendor)=>{    
    return new Promise((resolve,reject)=>{
        if(is_single_vendor==1){
               
        }else{

        }

        if(db_name == "yunofood_0906"){
            var sqlQuery="SELECT DAYOFWEEK(`created_on`) as week_day,DATE(`created_on`) as created_at,SUM(admin_commission) as total_revenue FROM orders"+        
            " where DATE(created_on) >= ? and DATE(created_on)<=? AND status IN (5,6) GROUP BY created_at ORDER BY DATE(created_on) ASC"
        } else{
            var sqlQuery="SELECT DAYOFWEEK(`created_on`) as week_day,DATE(`created_on`) as created_at,SUM(supplier_commision) as total_revenue FROM orders"+        
            " where DATE(created_on) >= ? and DATE(created_on)<=? AND status IN (5,6) GROUP BY created_at ORDER BY DATE(created_on) ASC"
        }
 
       var st= multiConnection[db_name].query(sqlQuery,[start_date,end_date],(err,data)=>{
        logger.debug(st.sql)    
        if(err){
                reject("Something Went Wrong")
            }
            else{
                logger.debug("===DATA!==",data)
                resolve(data)
            }   
        })
    })

}
const TotalOrderRevenue = (db_name,is_single_vendor)=>{
    return new Promise(async (resolve,reject)=>{
            try{
                let totalRevenue=0;
                let cancelationDeductionAmount=0;
                let deliveryChargeAmount=0;
                let promoBearAmount=0;

                if(db_name == "yunofood_0906"){
                    var sqlQuery="SELECT SUM(admin_commission) as total_revenue FROM orders"+        
                    " where status IN (5,6) ORDER BY DATE(created_on) ASC"
                    let data=await ExecuteQ.Query(db_name,sqlQuery,[]);
                    totalRevenue = data[0].total_revenue;
                }else{
                    var sqlQuery="SELECT SUM(supplier_commision) as total_revenue FROM orders"+        
                    " where status IN (5,6) ORDER BY DATE(created_on) ASC"
                    let data=await ExecuteQ.Query(db_name,sqlQuery,[]);
                    let cancelOrderDeductionData=await ExecuteQ.Query(db_name,"select IFNULL(SUM(order_cancel_amount),0) as deductionAmount from  additional_admin_revenue_amount",[])
                    cancelationDeductionAmount=parseFloat(cancelOrderDeductionData[0].deductionAmount)
    
                    let deliveryAmountData=await ExecuteQ.Query(db_name,"select IFNULL(SUM(delivery_amount),0) as deliveryAmount from  additional_admin_revenue_amount where supplier_id=?",[0]);
                    deliveryChargeAmount=parseFloat(deliveryAmountData[0].deliveryAmount)
    
                    let promoBearData=await ExecuteQ.Query(db_name,"select IFNULL(SUM(promo_bear_amount),0) as bearAmount from  additional_admin_revenue_amount where supplier_id=?",[0])
                    promoBearAmount=parseFloat(promoBearData[0].bearAmount)
    
                    totalRevenue=(data[0].total_revenue+deliveryChargeAmount+cancelationDeductionAmount)-promoBearAmount
                }
                
                
                resolve(totalRevenue)
            }
            catch(Err){
                reject("Something Went Wrong")
            }
      
    })
}
const TotalOrderRevenueByDate = (db_name,is_single_vendor,startDate,endDate)=>{
    return new Promise(async (resolve,reject)=>{
        let total_revenue=0
        if(is_single_vendor==1){
            
        }else{
            
        }
        var sqlQuery="SELECT IFNULL(SUM(supplier_commision), 0) as total_revenue FROM orders"+        
        " where status IN (5,6) and DATE(created_on)>='"+startDate+"' and DATE(created_on)<='"+endDate+"' ORDER BY DATE(created_on) ASC"
        let data=await ExecuteQ.Query(db_name,sqlQuery,[]);
        let cancelationDeductionAmount=0;
        let deliveryChargeAmount=0;
        let promoBearAmount=0;
        
       
        let cancelOrderDeductionData=await ExecuteQ.Query(db_name,"select IFNULL(SUM(order_cancel_amount),0) as deductionAmount from  additional_admin_revenue_amount where  DATE(created_at)>='"+startDate+"' and DATE(created_at)<='"+endDate+"' ORDER BY DATE(created_at) ASC",[])
        cancelationDeductionAmount=parseFloat(cancelOrderDeductionData[0].deductionAmount)

        let deliveryAmountData=await ExecuteQ.Query(db_name,"select IFNULL(SUM(delivery_amount),0) as deliveryAmount from  additional_admin_revenue_amount where supplier_id=? and DATE(created_at)>='"+startDate+"' and DATE(created_at)<='"+endDate+"' ORDER BY DATE(created_at) ASC",[0]);
        deliveryChargeAmount=parseFloat(deliveryAmountData[0].deliveryAmount)

        let promoBearData=await ExecuteQ.Query(db_name,"select IFNULL(SUM(promo_bear_amount),0) as bearAmount from  additional_admin_revenue_amount where supplier_id=? and DATE(created_at)>='"+startDate+"' and DATE(created_at)<='"+endDate+"' ORDER BY DATE(created_at) ASC" ,[0])
        promoBearAmount=parseFloat(promoBearData[0].bearAmount);

        total_revenue=(data[0].total_revenue+deliveryChargeAmount+cancelationDeductionAmount)-promoBearAmount
        resolve(total_revenue)

    //    var st= multiConnection[db_name].query(sqlQuery,(err,data)=>{
    //     logger.debug(st.sql)    
    //     if(err){
    //             reject("Something Went Wrong")
    //         }
    //         else{
    //             logger.debug("===DATA!==",data)
    //             resolve(data[0].total_revenue)
    //         }   
    //     })

    })
}
const TotalRegisterUser=(start_date,end_date,db_name)=>{    
    return new Promise((resolve,reject)=>{
        var sqlQuery="SELECT DAYOFWEEK(`created_on`) as week_day,DATE(`created_on`) as created_at,COUNT(*) as total_user FROM user"+        
        " where DATE(created_on) >= ? and DATE(created_on)<=? and is_deleted=0 GROUP BY created_at ORDER BY DATE(created_on) ASC"
       var st= multiConnection[db_name].query(sqlQuery,[start_date,end_date],(err,data)=>{
        logger.debug(st.sql)    
        if(err){
                reject("Something Went Wrong")
            }
            else{
                logger.debug("===DATA!==",data)
                resolve(data)
            }   
        })
    })

}
const get_orders_count = (db_name)=>{
    return new Promise((resolve,reject)=>{
        
        var sqlQuery = "select count(IF(status=0,1,NULL))  as pending_order_count, ";
        sqlQuery += "count(IF(status=1 or status=9 or status=3 or status=7 or status=11 or status=10,1,NULL)) as active_order_count, ";
        sqlQuery += "count(IF(status=5,1,NULL)) as completed_order_count, ";
        sqlQuery += "count(IF(status=8,1,NULL)) as cancel_order_count from orders JOIN ( SELECT order_id FROM order_prices GROUP BY order_id ) t on t.order_id=orders.id join user u on u.id = orders.user_id " 
        
        var st = multiConnection[db_name].query(sqlQuery,[],(err,data)=>{
            console.log(st.sql,err)
            if(err){
                reject("Something Went Wrong")
            }else{
                console.log("======data???=======",data)
                resolve(data)
            }
        })
    })
}
const get_register_supplier = (db_name)=>{
    return new Promise((resolve,reject)=>{
        var sqlQuery = "select count(*) as supplier_count from supplier where is_deleted=0 and is_active=1";
        var stmt = multiConnection[db_name].query(sqlQuery,[],(err,data)=>{
            logger.debug(stmt.sqlQuery,err)
            if(err){
                reject("something went wrong");
            }else{
                resolve(data)
            }
        })
    })
}
const get_total_categories = (db_name)=>{
    return new Promise((resolve,reject)=>{
        var sqlQuery = "select count(*) as category_count from categories where is_deleted=0 and is_live=1 and parent_id=0 and id!=1";
        var stmt = multiConnection[db_name].query(sqlQuery,[],(err,data)=>{
            logger.debug(stmt.sqlQuery,err)
            if(err){
                reject("something went wrong");
            }else{
                resolve(data)
            }
        })
    })
}

const get_total_product = (db_name)=>{
    return new Promise((resolve,reject)=>{
        var sqlQuery = "select count(*) as product_count from product where is_deleted=0 and is_live=1";
        var stmt = multiConnection[db_name].query(sqlQuery,[],(err,data)=>{
            logger.debug(stmt.sqlQuery,err)
            if(err){
                reject("something went wrong");
            }else{
                resolve(data)
            }
        })
    })
}

const get_active_offers = (db_name)=>{
    var length;
    return new Promise((resolve,reject)=>{
        var sqlQuery = "select distinct name from promoCode where isDeleted=0";
        var stmt = multiConnection[db_name].query(sqlQuery,[],(err,data)=>{
            logger.debug(stmt.sqlQuery,err)
            if(err){
                reject("something went wrong");
            }else{
                if(data && data.length){
                    resolve(data.length)
                }else{
                     length = 0
                    resolve(length)
                }
            }
        })
    })
}



const latestPendingOrders = async function(db_name,limit){
    var results=[];
    return new Promise((resolve,reject)=>{
                   
        var sql="select ct.terminology,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,o.self_pickup,o.payment_type,o.tip_agent,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,o.payment_source,o.zelle_receipt_url,o.net_amount,crt.area_id,sb.supplier_id,o.is_agent,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,u.mobile_no " +
        "from orders o join order_prices ors on ors.order_id=o.id join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id  join cart crt on crt.id=o.cart_id join product p on p.id=ors.product_id join categories ct on ct.id=p.category_id"+
        " join user u on o.user_id=u.id left join order_promo odp on odp.orderId = o.id where o.status != 9 and o.status=0 group by id order by o.created_on DESC LIMIT ?";

  
   var st= multiConnection[db_name].query(sql,[limit],async function (err,orders) {
        console.log(st.sql);
        if(err)
        {
            reject(err);

        }
        else if(orders.length) {
            results = orders;
            for(const [index,i] of results.entries()){
               i.net_amount =  await totalOrderPrice(db_name,i.id)
            }
            resolve(results)
        }
        else {
            var data = [];
            resolve(data);
        }
    })
    })
}

const latestActiveOrders = async function(db_name,limit){
    var results=[];
    // 1,3,7,9,10,11
    return new Promise((resolve,reject)=>{
                   
        var sql="select ct.terminology,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,o.self_pickup,o.payment_type,o.tip_agent,IFNULL(odp.discountAmount,0) as discountAmount,o.referral_amount,o.payment_source,o.zelle_receipt_url,o.net_amount,crt.area_id,sb.supplier_id,o.is_agent,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,u.mobile_no,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2 " +
        "from orders o join order_prices ors on ors.order_id=o.id join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id  join cart crt on crt.id=o.cart_id join product p on p.id=ors.product_id join categories ct on ct.id=p.category_id"+
        " join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_addres left join order_promo odp on odp.orderId = o.id where o.status=3 or o.status=1 or o.status=7 or o.status=9 or o.status=10 or o.status=11 group by id order by o.created_on DESC LIMIT ?";

  
   var st= multiConnection[db_name].query(sql,[limit],async function (err,orders) {
        console.log(st.sql);
        if(err)
        {
            reject(err);

        }
        else if(orders.length) {
            results = orders;
            for(const [index,i] of results.entries()){
                i.net_amount =  await totalOrderPrice(db_name,i.id)
             }
            resolve(results)
        }
        else {
            var data = [];
            resolve(data);
        }
    })
    })
}








const latestPendingOrdersV2 = async function(db_name,limit){
    var results=[];
    return new Promise((resolve,reject)=>{
                   
        var sql="select o.is_dine_in,ct.terminology,o.referral_amount,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,o.self_pickup,o.payment_type,o.tip_agent,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,o.payment_source,o.zelle_receipt_url,o.net_amount,crt.area_id,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,sb.address as branch_address,sb.supplier_id,o.is_agent,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,u.mobile_no " +
        "from orders o join order_prices ors on ors.order_id=o.id join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id  join cart crt on crt.id=o.cart_id join product p on p.id=ors.product_id join categories ct on ct.id=p.category_id"+
        " join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id where o.status != 9 and o.status=0 group by id order by o.created_on DESC LIMIT ?";

  
   var st= multiConnection[db_name].query(sql,[limit],async function (err,orders) {
        console.log(st.sql);
        if(err)
        {
            reject(err);

        }
        else if(orders.length) {
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
    })
    })
}
const totalOrderPrice  = (dbName,orderId)=>{
    return new Promise(async(resolve,reject)=>{
        let temp_price = 0
        let is_decimal_quantity_allowed_val=await Universal.is_decimal_quantity_allowed(dbName)
        var is_decimal_quantity_allowed = "0";
        if(is_decimal_quantity_allowed_val[0] && is_decimal_quantity_allowed_val[0].value){
            is_decimal_quantity_allowed = is_decimal_quantity_allowed_val[0].value
        }
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
                    if(is_decimal_quantity_allowed == "1"){
                        temp_price = Number(product1[j].price) *
                     product1[j].quantity + temp_price
                    }else{
                        temp_price = Number(product1[j].price) *
                     Number(product1[j].quantity) + temp_price
                    }
                    // logger.debug("==============temppriee======1===",temp_price)
                }
            }
            logger.debug("========temp_price========",temp_price);
        resolve(temp_price);     
    })
}


const latestActiveOrdersV2 = async function(db_name,limit){
    var results=[];
    // 1,3,7,9,10,11
    return new Promise((resolve,reject)=>{
                   
        var sql="select o.is_dine_in,ct.terminology,o.user_service_charge,o.referral_amount,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,o.self_pickup,o.payment_type,o.tip_agent,IFNULL(odp.discountAmount,0) as discountAmount,o.referral_amount,o.payment_source,o.zelle_receipt_url,o.net_amount,crt.area_id,sb.address as branch_address,sb.supplier_id,o.is_agent,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,u.mobile_no,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2 " +
        "from orders o join order_prices ors on ors.order_id=o.id join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id  join cart crt on crt.id=o.cart_id join product p on p.id=ors.product_id join categories ct on ct.id=p.category_id"+
        " join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id where o.status=3 or o.status=1 or o.status=7 or o.status=9 or o.status=10 or o.status=11 group by id order by o.created_on DESC LIMIT ?";

  
   var st= multiConnection[db_name].query(sql,[limit],async function (err,orders) {
        console.log(st.sql);
        if(err)
        {
            reject(err);

        }
        else if(orders.length) {
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
    })
    })
}

const getProducts = function(results,db_name){
    var product=[];
    return new Promise((resolve,reject)=>{
        var sql2='select op.order_id,op.product_name,op.quantity,op.price,op.image_path from order_prices op';
        multiConnection[db_name].query(sql2,function (err,product1) {
            if (err) {
                console.log('error------', err);
                reject(err);
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
                                let productObj = {
                                    product_name : product1[j].product_name,
                                    quantity : product1[j].quantity,
                                    price : product1[j].price,
                                    image_path : product1[j].image_path
                                }
                                product.push(productObj)
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
            }(i))

            }
                resolve(results)
            }
        })
    })
}

const getCategories = function(results,db_name){
    var category = [];
    return new Promise((resolve,reject)=>{
        var sql3='select c.name,c.id,op.order_id from order_prices op join product p on p.id=op.product_id join categories c on c.id=p.category_id';
        multiConnection[db_name].query(sql3,function (err,cat) {
            if (err) {
                console.log('error------', err);
                reject(err);
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
                            resolve(results)
                        }
                    }(i))
                }
                resolve(results);
            }
        })
    })
}


module.exports={
    Dashboard:Dashboard,
    DashboardV2:DashboardV2
}