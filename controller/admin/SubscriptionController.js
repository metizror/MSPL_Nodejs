/**
 * =================================================================================
 * created by cbl-147
 * @description used for performing an subscription of supplier related action from admin
 * ===============================================================================
 */
var async = require('async');
var sendResponse = require('../../routes/sendResponse');
var constant = require('../../routes/constant');
var consts=require('./../../config/const')
var _ = require('underscore');
var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = config.get('server.debug_level');
const ExecuteQ=require('../../lib/Execute')
var uploadMgr=require('../../lib/UploadMgr')
const Universal = require('../../util/Universal');
const { payment } = require('../../routes/adminAccounts');
let moment = require('moment');
const Execute = require('../../lib/Execute');
const createSubscriptionPlan = async (req,res)=>{
    try{
        let name = req.body.name
        let price = req.body.price
        let type = req.body.type
        let description = req.body.description
        let permission_ids = req.body.permission_ids
        let admin_commission =  req.body.admin_commission==undefined?0:req.body.admin_commission
        let banner_limit = req.body.banner_limit==undefined?0:req.body.banner_limit
        let is_on_top_priority = req.body.is_on_top_priority==undefined?0:req.body.is_on_top_priority;
        let plan_id =""
        let _gatewayUniqueId=req.body.gateway_unique_id!=undefined?(req.body.gateway_unique_id).toLowerCase():"";
        if(_gatewayUniqueId=="paymaya"){
            plan_id=_gatewayUniqueId;
        }
        else{
            plan_id=await createPlan(req.dbName,name,type,price,res);
        }
        
        let saved_plan_id = await savePlanDetails(req.dbName,name,plan_id,
            type,price,description,admin_commission,banner_limit,is_on_top_priority);
        if(permission_ids && permission_ids.length>0){
            await savePlanPermissions(req.dbName,permission_ids,saved_plan_id);
        }
        
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch(err){
        console.log(err);
        sendResponse.somethingWentWrongError(res);
    }
}


const updateSubscriptionPlan = async (req,res)=>{
    try{
        let is_block = req.body.is_block
        let permission_ids = req.body.permission_ids
        let id = req.body.id
        let banner_limit = req.body.banner_limit==undefined?0:req.body.banner_limit
        let is_on_top_priority = req.body.is_on_top_priority==undefined?0:req.body.is_on_top_priority
        let admin_commission =  req.body.admin_commission==undefined || req.body.admin_commission==null ?0:req.body.admin_commission
        let name = req.body.name==undefined?"":req.body.name
        let description =  req.body.description==undefined || req.body.description==null ?"":req.body.description
        let query = `update  subscription_plans set is_block=?,
        banner_limit=?,is_on_top_priority=?,admin_commission=?,name=?,description=? where id=?`;
        let params = [is_block,banner_limit,is_on_top_priority,admin_commission,name,description,id]
        await ExecuteQ.Query(req.dbName,query,params)
        await deletePlanPermissions(req.dbName,id);
        await savePlanPermissions(req.dbName,permission_ids,id);
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch(err){
        console.log(err);
        sendResponse.somethingWentWrongError(res);
    }
}

const deletePlanPermissions = async(dbName,plan_id)=>{
    return new Promise(async(resolve,reject)=>{
        let query = "delete from plan_permissions where plan_id=?"
        let params = [plan_id]
        await ExecuteQ.Query(dbName,query,params);
        resolve();
    })
}


const deleteSubscriptionPlan = async (req,res)=>{
    try{
        let plan_id = req.body.plan_id
        await deletePlan(req.dbName,plan_id,res);
        await deletePlanFromDb(req.dbName,plan_id);
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch(err){
        console.log(err);
        sendResponse.somethingWentWrongError(res);
    }
}

const listSubscriptionPlan = async (req,res)=>{
    try{
        let limit = req.query.limit==undefined?1000:req.query.limit
        let offset = req.query.offset==undefined?0:req.query.offset
        let count = 0
        let data = await getAllPlansFromDb(req.dbName,limit,offset)
        let query = "select * from subscription_plans where is_deleted=0"
        let params = []
        let plans_data = await ExecuteQ.Query(req.dbName,query,params)
        if(plans_data && plans_data.length>0){
            count = plans_data.length
        }
        let final_res = {
            plans : data,
            count : count
        }
        sendResponse.sendSuccessData(final_res, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch(err){
        console.log(err);
        sendResponse.somethingWentWrongError(res);
    }
}

const supplierListPlans = async (req,res)=>{
    try{
        let is_active = 0
        let supplier_id = req.query.supplier_id

        // let query = "SELECT sp.*  "+
        // "from subscription_plans sp "+
        // "left join supplier_subscription ss on sp.id = ss.plan_id where sp.is_deleted=0 "+
        // " GROUP by sp.id"
        // let query = "SELECT * from subscription_plans where is_deleted=0 "
        // let params = []
        // let plans_data = await ExecuteQ.Query(req.dbName,query,params)

        
        let plans_data = await getAllPlansFromDbForSupplier(req.dbName,1000,0)


        let query2 = "select * from supplier_subscription where supplier_id=? and status = ? order by id desc"
        let params2 = [supplier_id,"active"]
        let subscriptionDetails = await ExecuteQ.Query(req.dbName,query2,params2);

        if(plans_data && plans_data.length>0){
            for(const [index,i] of plans_data.entries()){
                    i.is_active = is_active
                    
                if(subscriptionDetails && subscriptionDetails.length>0){
                    for(const [index1,j] of subscriptionDetails.entries()){
                    if(j.plan_id==i.id){
                        if(j.payment_source=="oxxo"){
                            if(i.type=="WEEK"){
                                let startTime= moment.unix(j.current_period_start.toString()).utc().format("YYYY-MM-DD HH:mm:ss");
                                let endTime=moment(startTime).add(7,"days").format("YYYY-MM-DD HH:mm:ss");
                                let currentTime=moment.utc().format("YYYY-MM-DD HH:mm:ss");
                                logger.debug("==startTime,endTime,currentTime======",startTime,endTime,currentTime)
                                if(endTime>currentTime){
                                    i.is_active=1
                                    i.subscription_id = j.subscription_id
                                    i.payment_source = j.payment_source
                                    i.reciept_url = j.reciept_url
                                    i.is_approved = j.is_approved
                                }

                            }
                            if(i.type=="MONTH"){
                                let startTime= moment.unix(j.current_period_start.toString()).utc().format("YYYY-MM-DD HH:mm:ss");
                                let endTime=moment(startTime).add(30,"days").format("YYYY-MM-DD HH:mm:ss");
                                let currentTime=moment.utc().format("YYYY-MM-DD HH:mm:ss");
                                logger.debug("==startTime,endTime,currentTime======",startTime,endTime,currentTime)
                                if(endTime>currentTime){
                                    i.is_active=1
                                    i.subscription_id = j.subscription_id
                                    i.payment_source = j.payment_source
                                    i.reciept_url = j.reciept_url
                                    i.is_approved = j.is_approved
                                }
                            }
                         
                            
                        }
                        else{
                                i.is_active=1
                                i.subscription_id = j.subscription_id
                                i.payment_source = j.payment_source
                                i.reciept_url = j.reciept_url
                                i.is_approved = j.is_approved
                        }
                    }
                }
            }

            }
        }
        sendResponse.sendSuccessData(plans_data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch(err){
        console.log(err);
        sendResponse.somethingWentWrongError(res);
    }
}

const stripeSessionDetails = async (req,res)=>{
    try{
        let dbName = req.dbName
        let plan_id = req.query.plan_id
        let stripe_plan_id = req.query.stripe_plan_id
        let supplier_id = req.query.supplier_id
        let type  = req.query.type
        let failureUrl = req.query.failureUrl
        let successUrl = req.query.successUrl
        let sessionData = await getSessionData(stripe_plan_id,type,plan_id,
            dbName,supplier_id,failureUrl,successUrl,res)
        sendResponse.sendSuccessData(sessionData, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch(err){
        console.log(err);
        sendResponse.somethingWentWrongError(res);
    }
}

const stripeUserSessionDetails = async (req,res)=>{
    try{
        let dbName = req.dbName
        let plan_id = req.query.plan_id
        let stripe_plan_id = req.query.stripe_plan_id
        let user_id = req.query.user_id
        let type  = req.query.type
        let benefit_type  = req.query.benefit_type
        let price  = req.query.price
        let sub_type = req.query.sub_type
        let failureUrl = req.query.failureUrl
        let successUrl = req.query.successUrl
        let sessionData = await getUserSessionData(stripe_plan_id,type,plan_id,
            dbName,user_id,benefit_type,price,sub_type,failureUrl,successUrl,res)
        sendResponse.sendSuccessData(sessionData, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch(err){
        console.log(err);
        sendResponse.somethingWentWrongError(res);
    }
}
const deletePlanFromDb = async(dbName,plan_id)=>{
    return new Promise(async(resolve,reject)=>{
        let query = "update subscription_plans set is_deleted=1 where plan_id=?"
        await ExecuteQ.Query(dbName,query,[plan_id]);
        resolve();
    })

}

const savePlanPermissions = async(dbName,plan_type_ids,plan_id)=>{
    return new Promise(async(resolve,reject)=>{
        let query = "insert into plan_permissions(plan_type_id,plan_id) "+
                    "values(?,?)";
                    logger.debug("+========================",plan_type_ids)
        for(const [index,i] of plan_type_ids.entries()){
            logger.debug("++++================",i)
            await ExecuteQ.Query(dbName,query,[i,plan_id]);
        }
        resolve();
    })

}

const savePlanDetails = (dbName,name,plan_id,plan_type,price,
    description,admin_commission,banner_limit,is_on_top_priority)=>{
    return new Promise(async(resolve,reject)=>{
        let query = "insert into subscription_plans(name,plan_id,plan_type,price,description,admin_commission,banner_limit,is_on_top_priority) "+
                    "values(?,?,?,?,?,?,?,?)"         
        let params = [name,plan_id,plan_type,price,description,admin_commission,banner_limit,is_on_top_priority];
        let plan = await ExecuteQ.Query(dbName,query,params);
        resolve(plan.insertId);
    })
}

const createPlan=(dbName,name,type,price,res)=>{
    logger.debug("===PLAN==TYPE==>>",type.toLowerCase())
    return new Promise(async(resolve,reject)=>{
        let strip_secret_key_data=await Universal.getStripSecretKey(dbName);
        let currencyName=await Universal.getCurrency(dbName)
        if(strip_secret_key_data && strip_secret_key_data.length>0){
            const stripe = require('stripe')(strip_secret_key_data[0].value);
            stripe.plans.create({
                amount: parseFloat(price)*100,
                interval: type.toLowerCase(),
                product: {
                  name:name
                },
                currency: currencyName,
              }, function(err, plan) {
                  logger.debug("========ERR!==",err,plan);
                  if(err){
                      reject(err)
                  }
                  else{
                      resolve(plan.id)
                  }
              });
        }else{
            sendResponse.sendErrorMessage("stripe gateway not found",res,400)
        }
    })

}


const cancelSubscription = async (req,res)=>{
    try{
        let dbName = req.dbName
        let sub_id = req.body.sub_id
        let payment_source = req.body.payment_source || "";

        if(payment_source!=="oxxo"){
            await cancelSubscriptionFromStripe(dbName,sub_id,res);

        }
        let query = "update supplier_subscription set status= ?,is_deleted=? where subscription_id=?"
        let params = ["cancelled",1,sub_id]
        await ExecuteQ.Query(dbName,query,params);

        await ExecuteQ.Query(dbName,
            `update supplier set commission = default_commission where id = ( select supplier_id from supplier_subscription where subscription_id="${sub_id}" )`,[])

            
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch(err){
        console.log(err);
        sendResponse.somethingWentWrongError(res);
    }
}


const approveSupplierSubscription = async (req,res)=>{
    try{
        let dbName = req.dbName
        let id = req.body.id

        let query = "update supplier_subscription set is_approved= ? where id=?"
        let params = [1,id]
        await ExecuteQ.Query(dbName,query,params);
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch(err){
        console.log(err);
        sendResponse.somethingWentWrongError(res);
    }
}

const cancelSubscriptionFromStripe=(dbName,subscriptionId,res)=>{
    logger.debug("================",dbName,subscriptionId)
    return new Promise(async(resolve,reject)=>{
        let strip_secret_key_data=await Universal.getStripSecretKey(dbName);
        if(strip_secret_key_data && strip_secret_key_data.length>0){
            const stripe = require('stripe')(strip_secret_key_data[0].value);
            stripe.subscriptions.del(subscriptionId, function(err, subscription) {
                  logger.debug("========ERR!==",err,subscription);
                  if(err){
                      reject(err)
                  }
                  else{
                      resolve(subscription)
                  }
              });
        }else{
            sendResponse.sendErrorMessage("stripe gateway not found",res,400)
        }
    })

}

const deletePlan=(dbName,plan_id,res)=>{
    return new Promise(async(resolve,reject)=>{
        let strip_secret_key_data=await Universal.getStripSecretKey(dbName);
        if(strip_secret_key_data && strip_secret_key_data.length>0){
            const stripe = require('stripe')(strip_secret_key_data[0].value);
            stripe.plans.del(plan_id,
                function(err, confirmation) {
                  logger.debug("========ERR!==",err,confirmation);
                  if(err){
                      reject(err)
                  }
                  else{
                      resolve(confirmation)
                  }
              });
        }else{
            resolve()
        }
    })

}
const listPlans=(dbName,res)=>{
    return new Promise(async(resolve,reject)=>{
        let strip_secret_key_data=await Universal.getStripSecretKey(dbName);
        if(strip_secret_key_data && strip_secret_key_data.length>0){
            const stripe = require('stripe')(strip_secret_key_data[0].value);
            stripe.plans.list(
                function(err, plans) {
                  logger.debug("========ERR!==",err,plans);
                  if(err){
                      reject(err)
                  }
                  else{
                      resolve(plans)
                  }
              });
        }else{
            sendResponse.sendErrorMessage("stripe gateway not found",res,400)
        }
    })

}


const getAllPlansFromDb = async (dbName,limit,offset)=>{
    return new Promise(async(resolve,reject)=>{
        try{

            let query = "select * from subscription_plans where is_deleted=0 order by id desc  limit ?,?"
            let params = [offset,limit]
            let plans_data = await ExecuteQ.Query(dbName,query,params)
            let plans = []
            if(plans_data && plans_data.length>0){
                for(const [index,i] of plans_data.entries()){
                    let temp = {
                        name : i.name,
                        id:i.id,
                        plan_id:i.plan_id,
                        type:i.plan_type,
                        price:i.price,
                        is_block:i.is_block,
                        description : i.description,
                        created_at:i.created_at,
                        admin_commission:i.admin_commission,
                        banner_limit:i.banner_limit,
                        is_on_top_priority:i.is_on_top_priority,
                        permissions:await getPermissionCategories(dbName,i)
                    }
                    plans.push(temp)
                } 
                resolve(plans)
            }else{
                    resolve(plans)
            }
        }catch(err){
            logger.debug("========err===========",err);
            reject(err)
        }

    })
}

const getAllPlansFromDbForSupplier = async (dbName,limit,offset)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            
            let query = "select * from subscription_plans where is_deleted=0 and is_block=0 order by id desc limit ?,?"
            let params = [offset,limit]
            let plans_data = await ExecuteQ.Query(dbName,query,params)
            let plans = []
            if(plans_data && plans_data.length>0){
                for(const [index,i] of plans_data.entries()){
                    let temp = {
                        name : i.name,
                        id:i.id,
                        plan_id:i.plan_id,
                        type:i.plan_type,
                        price:i.price,
                        is_block:i.is_block,
                        description : i.description,
                        created_at:i.created_at,
                        admin_commission:i.admin_commission,
                        banner_limit:i.banner_limit,
                        is_on_top_priority:i.is_on_top_priority,
                        permissions:await getPermissionCategories(dbName,i)
                    }
                    plans.push(temp)
                } 
                resolve(plans)
            }else{
                    resolve(plans)
            }
        }catch(err){
            logger.debug("========err===========",err);
            reject(err)
        }

    })
}
const getAllPlansFromForSupplier = async (dbName)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let query = "select * from subscription_plans where is_deleted=0"
            let params = []
            let plans_data = await ExecuteQ.Query(dbName,query,params)
            
            resolve(plans_data)
        }catch(err){
            logger.debug("========err===========",err);
            reject(err)
        }

    })
}

const getSupplierPlanFromDb = async (dbName,plan_id)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let query = "select * from subscription_plans where is_deleted=0 and id=?"
            let params = [plan_id]
            let plans_data = await ExecuteQ.Query(dbName,query,params)
            let plans = []
            if(plans_data && plans_data.length>0){
                for(const [index,i] of plans_data.entries()){
                    let temp = {
                        name : i.name,
                        id:i.id,
                        plan_id:i.plan_id,
                        type:i.plan_type,
                        price:i.price,
                        is_block:i.is_block,
                        created_at:i.created_at,
                        banner_limit:i.banner_limit,
                        permissions:await getPermissionCategories(dbName,i)
                    }
                    plans.push(temp)
                    resolve(plans)
                } 
            }else{
                    resolve(plans)
            }
        }catch(err){
            logger.debug("========err===========",err);
            reject(err)
        }

    })
}


// const getAllPermissionsForSupplierLogin = async (dbName)=>{

//         return new Promise((resolve,reject)=>{
//             try{
//             // await listPlans(dbName,res);
//             let data = await listPermissionCategories(dbName)
//             let permissions = []
//             for(const [index,i] of data.entries()){
//                 let temp = {
//                     permission_name:i.name,
//                     id:i.id,
//                     permissionTypes:await listPermissionTypes(dbName,i.id)
//                 }
//                 permissions.push(temp)
//             }
//             resolve(permissions)
//         }catch(error){
//             logger.debug("=======er==+++",error);
//             resolve([])
//         }
//         })

// }

const getPermissionCategories = async(dbName,planData)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let permission_categories = []
            let query = "select * from plan_categories"
            let permissionsCategoryData = await ExecuteQ.Query(dbName,query,[])
            for(const [index,i] of permissionsCategoryData.entries()){
                let temp = {
                    permission_name:i.name,
                    id:i.id,
                    permissionTypes: await getPermissionTypes(dbName,planData,i.id)
                }
                permission_categories.push(temp)
            }
            resolve(permission_categories)
        }catch(err){
            logger.debug("========err===========",err);
            reject(err)
        }
        
    })
}

const getPermissionTypes = async(dbName,plansData,permission_category_id)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let permission_types = []
            let query = "select * from plan_categories_types where plan_category_id=?"
            let permissionsTypesData = await ExecuteQ.Query(dbName,query,[permission_category_id])
            if(permissionsTypesData && permissionsTypesData.length>0){
                for(const [index,i] of permissionsTypesData.entries()){
                    let is_active = await checkpermissionTypes(dbName,plansData,i.id)
                    let temp = {
                        permission_type_name : i.name,
                        id : i.id,
                        is_active : is_active
                    }
                    permission_types.push(temp);
                }   
                resolve(permission_types)         
            }else{
                resolve(permission_types)
            }
        }catch(err){
            logger.debug("========err===========",err);
            reject(err)
        }
    })
}

const checkpermissionTypes = async(dbName,plansData,plan_type_id)=>{
    return new Promise(async(resolve,reject)=>{
        try{
        let query = "select * from  plan_permissions where plan_id=? and plan_type_id=?"
        let params = [plansData.id,plan_type_id]
        let data = await ExecuteQ.Query(dbName,query,params);
        if(data && data.length>0){
            resolve(1)
        }else{
            resolve(0)
        }
        }catch(err){
            logger.debug("========err===========",err);
            reject(err)
        }       
    })
}


const getAllPermissions = async (req,res)=>{
    try{

        await listPlans(req.dbName,res);
        let data = await listPermissionCategories(req.dbName)
        let permissions = []
        for(const [index,i] of data.entries()){
            let temp = {
                permission_name:i.name,
                id:i.id,
                permissionTypes:await listPermissionTypes(req.dbName,i.id)
            }
            permissions.push(temp)
        }
        sendResponse.sendSuccessData(permissions, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch(err){
        console.log(err);
        sendResponse.somethingWentWrongError(res);
    }
}
const listPermissionCategories = async(dbName)=>{
    return new Promise(async(resolve,reject)=>{
        try{
        let query = "select * from  plan_categories"
        let params = []
        let data = await ExecuteQ.Query(dbName,query,params);
        resolve(data)
        }catch(err){
            logger.debug("========err===========",err);
            reject(err)
        }       
    })
}
const listPermissionTypes = async(dbName,permissionCategoryId)=>{
    return new Promise(async(resolve,reject)=>{
        try{
        let query = "select * from  plan_categories_types where plan_category_id=?"
        let params = [permissionCategoryId]
        let data = await ExecuteQ.Query(dbName,query,params);
        resolve(data)
        }catch(err){
            logger.debug("========err===========",err);
            reject(err)
        }       
    })
}

const subscriptionCreateWebhook = async(req,res)=>{
    try{
        var sub_data=req.body.data;
        var m_data=sub_data.object;
        logger.debug("==========sub_data===m_data==>>",sub_data,m_data);
        let status =m_data.status=="paid"?"active":"inactive";
        let lines_data=m_data.lines.data;
        let dbName = lines_data[0].metadata.dbName
        let plan_id = lines_data[0].metadata.plan_id;
        let subscription_id =  lines_data[0].subscription
        // let customer_id = m_data.metadata.customer_id
        let current_period_start = lines_data[0].period.start;
        let current_period_end = lines_data[0].period.end
        let created = m_data.created
      
        let supplierId = lines_data[0].metadata.supplier_id
       
        let data = await saveSupplierSubscriptionData(dbName,status,subscription_id,
            current_period_end,
            current_period_start,created,plan_id,supplierId)
        // let cbl_customer_sub_plan_id = m_data.metadata.plan_id
        sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch(err){
        console.log(err);
        sendResponse.somethingWentWrongError(res);
    }
}

//reusable
const saveSupplierSubscriptionData = (dbName,status,subscription_id,current_period_end,
    current_period_start,created,plan_id,supplier_id)=>{
    return new Promise(async(resolve,reject)=>{
        let query = "insert into supplier_subscription(supplier_id,status,subscription_id,plan_id,"+
        "current_period_start,current_period_end,created,is_approved) values"+
        "(?,?,?,?,?,?,?,?)";
        let params = [supplier_id,status,subscription_id,plan_id,current_period_start,
            current_period_end,
        created,1]
        await ExecuteQ.Query(dbName,query,params);
        resolve();
    })
}

//reusable
const updateSupplierSubscriptionDetails = (dbName,subscription_id,current_period_start,
    current_period_end,status)=>{
    return new Promise(async(resolve,reject)=>{
        let query = "update supplier_subscription set current_period_start=?,current_period_end=?,status=? where id =?";
        let params = [current_period_start,current_period_end,status,subscription_id]
        let result = await ExecuteQ.Query(dbName,query,params);
        resolve(result);
    })
}




const buySupplierSubscription = async(req,res)=>{
    try{

        let status =req.body.status;
        
        // let current_period_end = req.body.current_period_end
        // let current_period_start = req.body.current_period_start






        let dbName = req.dbName
        let supplierId = req.body.supplier_id
        let plan_id = req.body.plan_id
        let  payment_source = req.body.payment_source
        let subscription_id = "sub_"+Math.random().toString(36).slice(2)
        let reciept_url = req.body.reciept_url
        let is_approved = 0;

        if(payment_source=="knet" || payment_source=="KNET" ||
           payment_source=="paymaya" ) {
            is_approved = 1;
        } 
        

        let planDetails = await ExecuteQ.Query(req.dbName,` select * from 	subscription_plans where id = ${plan_id}`)


        
        let current_period_end = moment().add(1, planDetails[0].plan_type).utc().unix();
        let current_period_start = moment().utc().unix();


        let query = `insert into supplier_subscription
        (supplier_id,status,subscription_id,plan_id,
        current_period_start,current_period_end,payment_source,reciept_url,is_approved)
        values(?,?,?,?,?,?,?,?,?)`

        let params = [supplierId,"active",subscription_id,
            plan_id,current_period_start,
            current_period_end,payment_source,reciept_url,is_approved]

        await ExecuteQ.Query(dbName,query,params);

        await ExecuteQ.Query(dbName,
            `UPDATE supplier set commission = 
            (select admin_commission from subscription_plans where id=${plan_id}) 
            where id=${supplierId}`,
            [])

        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch(err){
        console.log(err);
        sendResponse.somethingWentWrongError(res);
    }
}

//async function saveSupplierSubscriptionData(dbName,res,data,callback){
const saveUserSubscriptionData = async (dbName,status,subscription_id,
    current_period_end,current_period_start,created,subscription_plan_id,user_id,benefit_type,price,sub_type)=>{ //sub_type-weekly/monthly/yearly
    var sub_status = "0"

    if(status=="active"){payment_status = "1"}else
    if(status=="incomplete_expired"){payment_status = "2"}else
    if(status=="canceled"){payment_status = "3"}
    
    var result2 = await ExecuteQ.Query(dbName,"select id from user_subscription_plans where user_id=? and subscription_plan_id=? and is_deleted='0' limit 1",[user_id,subscription_plan_id])

    var sql = "insert into user_subscription (user_id,subscription_plan_id,benefit_type,start_date,end_date,status,subscription_id,payment_source,payment_id,transaction_id,payment_status,price,type) values (?,?,?,?,?,?,?,?,?,?,?,?,?)";
    var params = [user_id,subscription_plan_id,benefit_type,current_period_start,current_period_end,sub_status,subscription_id,"stripe","","","1",price,sub_type]

    if(data.action && data.action=="2"){
        sql = "update user_subscription set subscription_id='"+subscription_id+"', end_date='"+current_period_end+"', status='"+sub_status+"', payment_source='stripe', payment_id='', payment_status='1' where user_id='"+user_id+"' and subscription_plan_id='"+subscription_plan_id+"'  and is_deleted='0'"
        params = []
    }
    await ExecuteQ.Query(dbName,sql,params);

    var result1 = await ExecuteQ.Query(dbName,"select id,benefit_type from  user_subscription where user_id=? and subscription_plan_id=? and is_deleted='0' limit 1",[user_id,subscription_plan_id])

    if(result1[0]){
        await ExecuteQ.Query(dbName,"insert into user_subscription_logs (user_subscription_id,start_date,end_date,user_id,subscription_plan_id,benefit_type,payment_source,payment_id,payment_status) values (?,?,?,?,?,?,?,?,?)",[result1[0].id,current_period_start,current_period_end,user_id,subscription_plan_id,result1[0].benefit_type,"stripe","","1" ])
    }
}

const updateSubscription = async(req,res)=>{
    try{
        let sub_data=req.body.data;
        let object_data=sub_data.object;
        let lines_data=object_data.lines.data;
        let dbName = lines_data[0].metadata.dbName
        let user_type = lines_data[0].metadata.user_type ? lines_data[0].metadata.user_type : ""        
        let plan_id = lines_data[0].metadata.plan_id
        logger.debug("==========lines_data===object_data==>>",lines_data)
        if(lines_data && lines_data.length>0) {
            if(user_type=="user"){
                    let user_id = lines_data[0].metadata.user_id
                    let benefit_type = lines_data[0].metadata.benefit_type
                    let price = lines_data[0].metadata.price
                    let sub_type = lines_data[0].metadata.sub_type
                    let invoiceStatus = object_data.status == "paid" ? "active" : object_data.status
                    //let current_period_end = lines_data[0].period.end
                    //let current_period_start = lines_data[0].period.start

                    let current_period_start = moment.unix(lines_data[0].period.start).format("YYYY-MM-DD HH:mm:ss");
                    let current_period_end = moment.unix(lines_data[0].period.end).format("YYYY-MM-DD HH:mm:ss");

                    let subscription_details = await  getUserSubscriptionDetails(dbName,lines_data[0].subscription)
                    if(subscription_details && subscription_details.length>0){

                        var sub_status = "0"
                        if(status=="active"){invoiceStatus = "1"}else
                        if(status=="incomplete_expired"){invoiceStatus = "2"}else
                        if(status=="canceled"){invoiceStatus = "3"}
                        await  updateUserSubscriptionDetails(dbName,subscription_details[0].id,
                            current_period_start,current_period_end,sub_status)  
                    }else{
                        await saveUserSubscriptionData(dbName,
                            invoiceStatus,
                            lines_data[0].subscription,
                            current_period_end,
                            current_period_start,
                            0,plan_id,
                            user_id,
                            benefit_type,
                            price,sub_type)
                    }

            }else{
                    let supplier_id = lines_data[0].metadata.supplier_id
                    let invoiceStatus = object_data.status == "paid" ? "active" : object_data.status
                    let current_period_end = lines_data[0].period.end
                    let current_period_start = lines_data[0].period.start

                    let subscription_details = await  getSupplierSubscriptionDetails(dbName,lines_data[0].subscription)
                    if(subscription_details && subscription_details.length>0){
                        await  updateSupplierSubscriptionDetails(dbName,subscription_details[0].id,
                            current_period_start,current_period_end,invoiceStatus)  
                    }else{
                        let data = await saveSupplierSubscriptionData(dbName,
                            invoiceStatus,lines_data[0].subscription,
                            current_period_end,
                            current_period_start,0,plan_id,supplier_id)
                    }

                    // let subscription_details = await  getSupplierSubscriptionDetails(dbName,lines_data[0].subscription)
                    // if(subscription_details && subscription_details.length>0){
                    //     await  updateSupplierSubscriptionDetails(dbName,subscription_details[0].id,
                    //         current_period_start,current_period_end,invoiceStatus)      
                    // }
                    if(invoiceStatus=="active"){
                        let query = "select * from subscription_plans where id = ?"
                        let params = [plan_id]
                        let plan_details = await ExecuteQ.Query(dbName,query,params);
                        let query2 = "update supplier set commission = ? where id=?"
                        let params2 = [plan_details[0].admin_commission,supplier_id]
                        await ExecuteQ.Query(dbName,query2,params2)
                    }
                    
                    logger.debug("=========customerData==>.");
            }
        }
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch(err){
        console.log(err);
        sendResponse.somethingWentWrongError(res);
    }
}

const cancelSubscriptionWebhook = async(req,res)=>{
    try{
        var sub_data=req.body.data;
        var m_data=sub_data.object
        logger.debug("===sub_data===m_data===>=",sub_data,m_data);
        let dbName = m_data.metadata.dbName
        let user_type = m_data.metadata.user_type ? m_data.metadata.user_type : "";

            let invoiceStatus = m_data.status
            if(user_type=="user"){
                let subscription_details = await  getUserSubscriptionDetails(dbName,sub_data.object.id)
                if(subscription_details && subscription_details.length>0){
                    var sub_status = "0"
                    if(status=="active"){invoiceStatus = "1"}else
                    if(status=="incomplete_expired"){invoiceStatus = "2"}else
                    if(status=="canceled"){invoiceStatus = "3"}
                    let query =   "update user_subscription set status = ? where id=?"
                    let params = [sub_status,subscription_details[0].id]
                    await ExecuteQ.Query(dbName,query,params);
                }
            }else{
                let subscription_details = await  getSupplierSubscriptionDetails(dbName,sub_data.object.id)
                if(subscription_details && subscription_details.length>0){
                    let query =   "update supplier_subscription set status = ? where id=?"
                    let params = [invoiceStatus,subscription_details[0].id]
                    await ExecuteQ.Query(dbName,query,params);
                }
            }
            logger.debug("=========customerData==>.");
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch(err){
        console.log(err);
        sendResponse.somethingWentWrongError(res);
    }
}

const getSupplierSubscriptionDetails = (dbName,subscription_id)=>{
    return new Promise(async(resolve,reject)=>{
        let query = "select id from supplier_subscription where subscription_id=?";
        let params = [subscription_id]
        let result = await ExecuteQ.Query(dbName,query,params);
        resolve(result);
    })
}

const getUserSubscriptionDetails = (dbName,subscription_id)=>{
    return new Promise(async(resolve,reject)=>{
        let query = "select id from user_subscription where subscription_id=?";
        let params = [subscription_id]
        let result = await ExecuteQ.Query(dbName,query,params);
        resolve(result);
    })
}



const updateUserSubscriptionDetails = (dbName,subscription_id,current_period_start,current_period_end,status)=>{
    return new Promise(async(resolve,reject)=>{
        let query = "update user_subscription set start_date=?,end_date=?,status=? where id =?";
        let params = [current_period_start,current_period_end,status,subscription_id]
        let result = await ExecuteQ.Query(dbName,query,params);
        resolve(result);
    })
}


const subscriptionCreation = async(req,res)=>{
    try{
        let status = "active"
        let dbName = req.dbName
        let supplierId = req.body.supplier_id
        let plan_id = req.body.plan_id
        let data = await saveSupplierSubscription(dbName,status,
            plan_id,supplierId)
        // let cbl_customer_sub_plan_id = m_data.metadata.plan_id
        sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch(err){
        console.log(err);
        sendResponse.somethingWentWrongError(res);
    }
}

const saveSupplierSubscription = (dbName,status,plan_id,supplier_id)=>{
    return new Promise(async(resolve,reject)=>{
        let query = "insert into supplier_subscription(supplier_id,status,plan_id) values(?,?,?)";
        let params = [supplier_id,status,plan_id]
        await ExecuteQ.Query(dbName,query,params);
        resolve();
    })
}



const getSessionData= (stripe_plan_id,type,plan_id,dbName,supplier_id,failureUrl,successUrl,res)=>{
    return new Promise(async (resolve,reject)=>{
        logger.debug("===========queryData!==",type,plan_id,dbName,supplier_id)
        try{
            let strip_secret_key_data=await Universal.getStripSecretKey(dbName);
            if(strip_secret_key_data && strip_secret_key_data.length>0){
                const stripe = require('stripe')(strip_secret_key_data[0].value);
                const session = await stripe.checkout.sessions.create({
                    payment_method_types: [type],
                    subscription_data: {
                            items: [{
                                plan: stripe_plan_id,
                            }],
                            metadata:{
                                "dbName":dbName,
                                "supplier_id":supplier_id,
                                "plan_id":plan_id
                            }
                    },
                    success_url: successUrl,
                    cancel_url: failureUrl
                });
    
                logger.debug("===",session)
                resolve(session)
            }else{
                sendResponse.sendErrorMessage("stripe gateway not found",res,400)
            }
            }
            catch(Err){
                logger.debug("==>ER!==",Err);
                reject(Err)
            }
    })

}
const getUserSessionData= (stripe_plan_id,type,plan_id,dbName,user_id,benefit_type,price,sub_type,failureUrl,successUrl,res)=>{
    return new Promise(async (resolve,reject)=>{
        logger.debug("===========queryData!==",type,plan_id,dbName,user_id)
        try{
            let strip_secret_key_data=await Universal.getStripSecretKey(dbName);
            if(strip_secret_key_data && strip_secret_key_data.length>0){
                const stripe = require('stripe')(strip_secret_key_data[0].value);
                const session = await stripe.checkout.sessions.create({
                    payment_method_types: [type],
                    subscription_data: {
                            items: [{
                                plan: stripe_plan_id,
                            }],
                            metadata:{
                                "dbName":dbName,
                                "user_id":user_id,
                                "user_type":"user",
                                "plan_id":plan_id,
                                "benefit_type":benefit_type,
                                "price":price,
                                "sub_type":sub_type
                            }
                    },
                    success_url: successUrl,
                    cancel_url: failureUrl
                });
    
                logger.debug("===",session)
                resolve(session)
            }else{
                sendResponse.sendErrorMessage("stripe gateway not found",res,400)
            }
            }
            catch(Err){
                logger.debug("==>ER!==",Err);
                reject(Err)
            }
    })

}

const suppliersSubscriptionDetails = async(req,res)=>{
    try{
        let limit = req.query.limit
        let offset = req.query.offset
        let period = req.query.period==undefined || req.query.period==""?"":req.query.period
        let fromDate = req.query.fromDate==undefined || req.query.fromDate==""?"":req.query.fromDate

        let toDate = req.query.toDate==undefined || req.query.toDate==""?"":req.query.toDate
        let is_download = req.query.is_download!==undefined && 
        req.query.is_download!==null?1:0

        let data = await suppliersSubscriptions(req.dbName,limit,
            offset,period,req.query,fromDate,toDate,is_download);
        // let cbl_customer_sub_plan_id = m_data.metadata.plan_id
        sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch(err){
        console.log(err);
        sendResponse.somethingWentWrongError(res);
    }
}
/*
select s.name as supplier_name,ss.*,sp.name as plan_name,
sp.description,sp.plan_type,sp.price
 from supplier_subscription ss 
join supplier s on s.id = ss.supplier_id
join subscription_plans sp on sp.id = ss.plan_id
*/
function suppliersSubscriptions(dbName,limit,offset,period,input,
    fromDate,toDate,is_download){
    return new Promise(async(resolve,reject)=>{
        let filterSql="";
        let dateFilter = "";
        if(input.status!=undefined && input.status!=""){
            filterSql=" and ss.status='"+input.status+"'"
        }

        if(fromDate!=="" && toDate!==""){
            filterSql += " and DATE( ss.created_at ) >= '"+fromDate+"' AND DATE( ss.created_at ) <=  '"+toDate+"' "
        }

        let query = "select s.name as supplier_name,ss.supplier_id,ss.status, "
        query += "ss.is_approved,ss.payment_source,ss.reciept_url,ss.id,ss.plan_id,FROM_UNIXTIME(current_period_start) as current_period_start, "
        query += "FROM_UNIXTIME(current_period_end) as current_period_end,sp.name as plan_name, "
        query += "sp.description,sp.plan_type,sp.price "
        query += "from supplier_subscription ss "
        query += "join supplier s on s.id = ss.supplier_id "
        query += "join subscription_plans sp on sp.id = ss.plan_id "
        query += "where sp.plan_type like '%"+period+"%' "+filterSql+" group by ss.id order by ss.id desc limit ?,?"     
       
        let params = [offset,limit]
        let result = await ExecuteQ.Query(dbName,query,params)

        if(parseInt(is_download)>0 && result && result.length>0){
            let header = [ 
                {id: 'RESTAURANT ID', title: 'RESTAURANT ID'},
                {id: 'RESTAURANT NAME', title: 'RESTAURANT NAME'},
                {id: 'PLAN ID', title: 'PLAN ID'},    
                {id: 'PLAN NAME', title: 'PLAN NAME'},
                {id: 'PLAN TYPE', title: 'PLAN TYPE'},
                {id: 'PLAN PRICE', title: 'PLAN PRICE'},
                {id: 'DESCRIPTION', title: 'DESCRIPTION'},
                {id: 'STATUS', title: 'STATUS'}
              ]
              let data=[]
              for(const [index,element] of result.entries()){
            //   let data = totalUsers.map((element)=>{
                  let temp = {}
                  temp['RESTAURANT ID'] = element.id
                  temp['RESTAURANT NAME'] = element.supplier_name
                  temp['PLAN ID'] = element.plan_id
                  temp["PLAN NAME"] = element.plan_name
                  temp["PLAN TYPE"] = element.plan_type
                  temp['PLAN PRICE'] = element.price
                  temp["DESCRIPTION"] = element.description
                  temp["STATUS"] = element.status

                //   return temp;
                   data.push(temp)
              }
            //   })
    
              let csvLink = await uploadMgr.uploadCsvFileNew(data,header,"supplier_subscription_report_")
              logger.debug("+==========csvLingk=========",csvLink)
              resolve(csvLink)

        }else{
            let query1 = "select s.name as supplier_name,ss.supplier_id,ss.status, "
            query1 += "ss.is_approved,ss.payment_source,ss.reciept_url,ss.id,ss.plan_id,FROM_UNIXTIME(current_period_start) as current_period_start, "
            query1 += "FROM_UNIXTIME(current_period_end) as current_period_end,sp.name as plan_name, "
            query1 += "sp.description,sp.plan_type,sp.price "
            query1 += "from supplier_subscription ss "
            query1 += "join supplier s on s.id = ss.supplier_id "
            query1 += "join subscription_plans sp on sp.id = ss.plan_id "
            query1 += "where sp.plan_type like '%"+period+"%' "+filterSql+" group by ss.id"     
            let params1 = []
            let result1 = await ExecuteQ.Query(dbName,query1,params1)
            let count = 0;
            if(result1 && result1.length>0){
                count = result1.length
            }
    
            resolve({list:result,count:count})
        }


    })
}
// let query = "select s.name as supplier_name,ss.* from supplier_subscription ss "
// query +=  "join supplier s on s.id = ss.supplier_id"
/*
select ss.id,DAYOFWEEK( FROM_UNIXTIME(ss.current_period_start)),
FROM_UNIXTIME(ss.current_period_start),
ss.plan_id,
SUM(sp.price) as total_revenue
 from
 supplier_subscription ss
join subscription_plans sp on ss.plan_id = sp.id
group by ss.current_period_start
*/
module.exports = {
    createSubscriptionPlan:createSubscriptionPlan,
    updateSubscriptionPlan:updateSubscriptionPlan,
    deleteSubscriptionPlan:deleteSubscriptionPlan,
    listSubscriptionPlan:listSubscriptionPlan,
    getAllPermissions:getAllPermissions,
    subscriptionCreateWebhook:subscriptionCreateWebhook,
    updateSubscription:updateSubscription,
    getSupplierPlanFromDb:getSupplierPlanFromDb,
    subscriptionCreation:subscriptionCreation,
    supplierListPlans:supplierListPlans,
    stripeSessionDetails:stripeSessionDetails,
    stripeUserSessionDetails:stripeUserSessionDetails,
    cancelSubscriptionWebhook:cancelSubscriptionWebhook,
    cancelSubscription:cancelSubscription,
    suppliersSubscriptionDetails:suppliersSubscriptionDetails,
    // getAllPermissionsForSupplierLogin:getAllPermissionsForSupplierLogin
    buySupplierSubscription:buySupplierSubscription,
    approveSupplierSubscription:approveSupplierSubscription

}