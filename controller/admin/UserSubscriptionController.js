/**
 * ==============================================================================
 * created by cbl-147
 * @description used for performing an user-subscription related action from admin
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
const Universal = require('../../util/Universal')

const createUserSubscriptionPlan = async (req,res)=>{
    try{
        let title = req.body.title
        let description = req.body.description
        let price = req.body.price
        let type = req.body.type
        var image = req.files!=undefined?req.files.image:undefined;
        let _gatewayUniqueId=req.body.gateway_unique_id!=undefined?(req.body.gateway_unique_id).toLowerCase():"";
        let stripe_plan_id="";
        let imageUrl = ""
        let min_order_amount = req.body.min_order_amount==undefined?0:req.body.min_order_amount;
        if(image){
            imageUrl = await uploadMgr.uploadImageFileToS3BucketNew(image)
        }
        var stripe_sub_type = "week"
         stripe_sub_type=(type=="2")?"month":(type=="3")?"year":stripe_sub_type;
        if(_gatewayUniqueId=="paymaya"){
            stripe_plan_id=_gatewayUniqueId;
        }
        else{
            stripe_plan_id = await createStripeUserSubscriptionName(req.dbName,title,stripe_sub_type,price,res);
        }
        //var data = await saveUserSubscriptionName(req.dbName,title,description,price,type,imageUrl,stripe_plan_id);
        var data = await saveUserSubscriptionName(req.dbName,title,description,price,type,imageUrl,stripe_plan_id,min_order_amount);
        sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch(err){
        console.log(err);
        sendResponse.somethingWentWrongError(res);
    }
}

const saveUserSubscriptionName = (dbName,title,description,price,type,imageUrl,stripe_plan_id,min_order_amount)=>{
    return new Promise(async(resolve,reject)=>{
        let query = "insert into user_subscription_plans(title,description,price,type,image,stripe_plan_id,min_order_amount) "+"values(?,?,?,?,?,?,?)"
        let params = [title,description,price,type,imageUrl,stripe_plan_id,min_order_amount];
        let data = await ExecuteQ.Query(dbName,query,params);
        resolve(data.insertId);
    })
}
const createStripeUserSubscriptionName=(dbName,name,type,price,res)=>{
    logger.debug("===PLAN==TYPE==>>",type.toLowerCase())
    return new Promise(async(resolve,reject)=>{
        let strip_secret_key_data=await Universal.getStripSecretKey(dbName);
        if(strip_secret_key_data && strip_secret_key_data.length>0){
            const stripe = require('stripe')(strip_secret_key_data[0].value);
            stripe.plans.create({
                amount: parseFloat(price)*100,
                interval: type.toLowerCase(),
                product: {
                  name:name
                },
                currency: "USD",
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

const updateUserSubscriptionPlan = async (req,res)=>{
    try{

        let id = req.body.id
        let title = req.body.title
        let description = req.body.description
        let price = req.body.price
        let type = req.body.type
        let is_blocked = req.body.is_blocked // incase of is_blocked one, frontend requires to send stripe_plan_id
        let stripe_plan_id = req.body.stripe_plan_id
        let imageUrl = req.body.image
        let min_order_amount = req.body.min_order_amount==undefined?0:req.body.min_order_amount;
        
        var image = req.files!=undefined?req.files.image:undefined;
        if(image){
            imageUrl = await uploadMgr.uploadImageFileToS3BucketNew(image)
        }
        await updatePlanDetails(req.dbName,id, title,description,price,type,is_blocked,imageUrl,min_order_amount);
        if(is_blocked=="1"){
            await deletePlan(req.dbName,stripe_plan_id,res);
        }
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch(err){
        console.log(err);
        sendResponse.somethingWentWrongError(res);
    }
}

const updatePlanDetails = (dbName,id,title,description,
    price,type,is_blocked,imageUrl,min_order_amount)=>{
    return new Promise(async(resolve,reject)=>{
        let params = [title,description,price,type,imageUrl,min_order_amount,id];
        let query = "update user_subscription_plans set title=?,description=?,price=?,type=?,is_blocked='"+is_blocked+"' ,image=?,min_order_amount=? where id=?"
        let data = await ExecuteQ.Query(dbName,query,params);
        resolve(data.insertId);
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
            sendResponse.sendErrorMessage("stripe gateway not found",res,400)
        }
    })

}


const createUserSubscriptionBenefits = async (req,res)=>{
    try{
        let title = req.body.title
        let description = req.body.description
        var bid = (new Date().getTime()).toString(36) + new Date().getUTCMilliseconds();
        var benefit_id = "benefit_"+bid
        await saveUserSubscriptionBenefits(req.dbName,title,benefit_id,description);        
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch(err){
        console.log(err);
        sendResponse.somethingWentWrongError(res);
    }
}

const saveUserSubscriptionBenefits = (dbName,title,benefit_id,description)=>{
    return new Promise(async(resolve,reject)=>{
        let query = "insert into user_subscription_benefits(title,benefit_id,description) "+"values(?,?,?)"
        let params = [title,benefit_id,description];
        let data = await ExecuteQ.Query(dbName,query,params);
        resolve(data.insertId);
    })
}

const assignBenefitsToPlan = async (req,res)=>{
    try{
        let plan_id = req.body.plan_id
        let benefit_ids = req.body.benefit_ids
        await assignBenefits(req.dbName,plan_id,benefit_ids);        
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch(err){
        console.log(err);
        sendResponse.somethingWentWrongError(res);
    }
}


const assignBenefits = (dbName,plan_id,benefit_id)=>{
    return new Promise(async(resolve,reject)=>{
        if(benefit_id!=""){
            var benefit_id_ar = benefit_id.split(',');
            console.log("benefit_id_ar ==== ",benefit_id_ar)
            for(var i=0; i < benefit_id_ar.length; i++){
                var sql="select count(id) cnt from user_subscription_plan_benefits where plan_id='"+plan_id+"' and benefit_id='"+benefit_id_ar[i]+"'"
                console.log("sql ------- ",sql)
                let getData = await ExecuteQ.Query(dbName,sql,[])    
                console.log("getData ==== ",getData)
                if(getData[0].cnt == "0"){
                    var sql1="insert into user_subscription_plan_benefits(plan_id,benefit_id) values ('"+plan_id+"','"+benefit_id_ar[i]+"')"
                    console.log("sql1 ------- ",sql1)
                    let data = await ExecuteQ.Query(dbName,sql1,[])
                }
                if((benefit_id_ar.length-1) == i){
                    resolve();
                }
            }
            console.log("11111111111111111111111111")


            // var values = benefit_id_ar.map(benefit => [plan_id, benefit])
            // var sql="select count(id) cnt from user_subscription_plan_benefits plan_id='"+plan_id+"' and benefit_id='"+benefit_id+"'"
            // let getData = await ExecuteQ.Query(dbName,sql,[])
            // if(getData[0].cnt == "0"){
            //     var sql="insert into user_subscription_plan_benefits(plan_id,benefit_id) values ?"
            //     let data = await ExecuteQ.Query(dbName,sql,[values])
            // }
        }else{
            reject();
        }
    })
}


const removeBenefitsFromPlan = async (req,res)=>{
    try{
        let plan_id = req.body.plan_id
        let benefit_id = req.body.benefit_id
        await removeBenefit(req.dbName,plan_id,benefit_id);        
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch(err){
        console.log(err);
        sendResponse.somethingWentWrongError(res);
    }
}

const removeBenefit = (dbName,plan_id,benefit_id)=>{
    return new Promise(async(resolve,reject)=>{
        let query = "delete from user_subscription_plan_benefits where plan_id=? and benefit_id=?"
        let data = await ExecuteQ.Query(dbName,query, [plan_id,benefit_id]);
        // let params = [title,description];
        // let data = await ExecuteQ.Query(dbName,query,params);
        resolve(data.insertId);
    })
}



const listUserSubscriptionPlan = async (req,res)=>{
    try{
        let limit = req.query.limit==undefined?1000:req.query.limit
        let offset = req.query.offset==undefined?0:req.query.offset
        let query = "select (SELECT count(id) FROM `user_subscription` where usp.id=subscription_plan_id) total_purchased,(SELECT count(id) FROM `user_subscription` where usp.id=subscription_plan_id and is_deleted='0' and is_cancelled='0' and status='1') total_active, (SELECT SUM(price) FROM `user_subscription` where usp.id=subscription_plan_id) total_revenue, usp.* from user_subscription_plans usp where  usp.is_blocked='0' limit ?,?"
        let params = [offset,limit]
        let plans_data = await ExecuteQ.Query(req.dbName,query,params)
        let query1 = "select count(id) as cnt from user_subscription_plans where  is_blocked='0' "
        let plans_data1 = await ExecuteQ.Query(req.dbName,query1)
        let benefits_data, benefits_data1;
        if(plans_data && plans_data.length > 0){
            for(var i=0; i < plans_data.length; i++){
                q = "select usb.* from user_subscription_benefits usb join user_subscription_plan_benefits uspb on usb.id=uspb.benefit_id where uspb.plan_id='"+plans_data[i].id+"'";
                q1 = "select count(usb.id) as cnt from user_subscription_benefits usb join user_subscription_plan_benefits uspb on usb.id=uspb.benefit_id where uspb.plan_id='"+plans_data[i].id+"'";
                benefits_data = await ExecuteQ.Query(req.dbName,q)
                benefits_data1 = await ExecuteQ.Query(req.dbName,q1)
                let final_benefits_res = {
                    plans : benefits_data,
                    count : benefits_data1[0].cnt
                }
                plans_data[i].benefits = final_benefits_res;
            }
        }

        let final_res = {
            plans : plans_data,
            count : plans_data1[0].cnt
        }
        sendResponse.sendSuccessData(final_res, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch(err){
        console.log(err);
        sendResponse.somethingWentWrongError(res);
    }
}



const listUserSubscriptionBenefits = async (req,res)=>{
    try{
        let limit = req.query.limit==undefined?1000:req.query.limit
        let offset = req.query.offset==undefined?0:req.query.offset
        let id = req.query.id==undefined? '' : req.query.id;
        let query,query1,params
        if(id==''){
            query = "select * from user_subscription_benefits  limit ?,?"
            query1 = "select count(id) as cnt from user_subscription_benefits"
            params = [offset,limit]
        }else{
            query = "select usb.* from user_subscription_benefits usb join user_subscription_plan_benefits uspb on usb.id=uspb.benefit_id where uspb.plan_id=? limit ?,?"
            query1 = "select count(usb.id) as cnt from user_subscription_benefits usb join user_subscription_plan_benefits uspb on usb.id=uspb.benefit_id where uspb.plan_id='"+id+"'";
            params = [id,offset,limit]
        }

        let plans_data = await ExecuteQ.Query(req.dbName,query,params)
        let plans_data1 = await ExecuteQ.Query(req.dbName,query1)
        
        let final_res = {
            plans : plans_data,
            count : plans_data1[0].cnt
        }
        sendResponse.sendSuccessData(final_res, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch(err){
        console.log(err);
        sendResponse.somethingWentWrongError(res);
    }
}


























module.exports = {
    createUserSubscriptionPlan:createUserSubscriptionPlan,
    updateUserSubscriptionPlan:updateUserSubscriptionPlan,
    createUserSubscriptionBenefits:createUserSubscriptionBenefits,
    assignBenefitsToPlan:assignBenefitsToPlan,
    removeBenefitsFromPlan:removeBenefitsFromPlan,
    listUserSubscriptionPlan:listUserSubscriptionPlan,
    listUserSubscriptionBenefits:listUserSubscriptionBenefits
}