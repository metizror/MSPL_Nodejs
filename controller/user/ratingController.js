var mysql = require('mysql');
var async = require('async');
var constant=require('../../routes/constant')
var connectionCntr=require('../../routes/connection')
var sendResponse = require('../../routes/sendResponse');
var conf=require('../../config/const');
const ExecuteQ=require('../../lib/Execute')
const Universal = require("../../util/Universal");
var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = config.get('server.debug_level');
var crypto = require('crypto'),
    algorithm = conf.SERVER.CYPTO.ALGO,
    password =  conf.SERVER.CYPTO.PWD
/**
 * @desc used fofr encrypt an string
 * @param {*Object} req 
 * @param {*Object} res 
 */
const AddRating=async (req,res)=>{
    try{
        logger.debug(req.body)
        var dbName=req.dbName;
        let orderId=req.body.order_id || 0
        // logger.debug("===DB-NAME===",dbName,multiConnection)
        var data =await checkProductBooking(req.users.id,req.body.product_id,dbName);
        if(data && data.length>0){
            var RatingData=await AlreadyRated(req.users.id,req.body.product_id,orderId,dbName);
            logger.debug("===RatingData===",RatingData)
            if(RatingData && RatingData.length>0){
                
                let msg = await Universal.getErrMsgText(constant.errorCategory.RATING_ERROR,
                    constant.ProductRating.ALREADY_RATE,req.dbName,req.service_type,14)
                sendResponse.sendErrorMessage(msg,res,400);
            }
            else{
                logger.error("===succe==")
                await Rating(req.users.id,req.body.product_id,req.body.reviews,req.body.value,req.body.title,orderId,dbName);
                var avgRating= await AvgRating(req.body.product_id,dbName);
                await UpdateAvgRating(avgRating,req.body.product_id,dbName);
                sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
            }
        }
        else{
            logger.error("===sd")
            let msg = await Universal.getErrMsgText(constant.errorCategory.RATING_ERROR,
                constant.ProductRating.RATING_ERROR ,req.dbName,req.service_type,14)
            sendResponse.sendErrorMessage(msg,res,400);
        }
    }
    catch(Err){
        logger.error(Err)
        sendResponse.somethingWentWrongError(res);
    }
}
const ProductRatingReview=async (req,res)=>{
    try{
        // logger.debug()
        var DAta=await RatingList(req.dbName,req.query.product_id);
        sendResponse.sendSuccessData(DAta, constant.responseMessage.SUCCESS, res, 200);

    }
    catch(err){
        logger.error(err);
        sendResponse.somethingWentWrongError(res);
    }
}

function RatingList(dbName,id){
    return new Promise((resolve,reject)=>{
        var sql="select ors.id,pr.created_on,usr.user_image,pr.reviews,pr.value,pr.title from orders ors join order_prices orp on ors.id=orp.order_id join user usr on usr.id=ors.user_id join product_rating pr on orp.product_id=pr.product_id where pr.product_id=? group by pr.id order by pr.created_on desc"
        multiConnection[dbName].query(sql,[parseInt(id)],function(err,data){
            if(err){
                reject(err)
            }
            else{
                resolve(data)
            }

        })


    })

}

function UpdateAvgRating(avgRating,product_id,dbName){
    return new Promise((resolve,reject)=>{
        var sql="update product set avg_rating=? where id=?"
        multiConnection[dbName].query(sql,[parseFloat(avgRating),parseInt(product_id)],function(err,data){
            if(err){
                reject(err)
            }
            else{
                resolve(data)
            }
        })
    })

}
function AvgRating(product_id,dbName){
    return new Promise((resolve,reject)=>{
        // var sql="select AVG(value) as avg from product_rating where product_id=?"
        var sql="select AVG(value) as avg from product_rating where product_id=? and is_approved=?"
        multiConnection[dbName].query(sql,[parseInt(product_id),0],function(err,data){
            if(err){
                reject(err)
            }
            else{
                logger.debug("=========+AVGD==",data)
                resolve(data[0].avg)
            }
        })
    })


}
function AlreadyRated(user_id,product_id,order_id,dbName){
    // logger.debug(multiConnection[dbName]);
    return new Promise((resolve,reject)=>{
        var sql="select id from product_rating where user_id=? and product_id=? and order_id=?"
        multiConnection[dbName].query(sql,[parseInt(user_id),parseInt(product_id),order_id],function(err,data){
            if(err){
                reject(err)
            }
            else{
                resolve(data)
            }
        })
    })
}
function Rating(user_id,product_id,reviews,value,title,orderId,dbName){
    return new Promise((resolve,reject)=>{
            var sql="insert into product_rating (`product_id`,`value`,`user_id`,`reviews`,`title`,`order_id`) values (?,?,?,?,?,?)"
            var st=multiConnection[dbName].query(sql,[parseInt(product_id),parseInt(value),parseInt(user_id),reviews,title,orderId],function(err,data){
             logger.debug(st.sql);
                if(err){
                    reject(err)
                }
                else{
                    resolve()
                }
            })
        })

}

function checkProductBooking(user_id,product_id,dbName){
    return new Promise((resolve,reject)=>{
        var query="select ors.id from orders ors join order_prices orp on ors.id=orp.order_id where ors.user_id=?  and ors.status=? and orp.product_id=? "
        multiConnection[dbName].query(query,[parseInt(user_id),5,parseInt(product_id)],function(err,data){
            if(err){
                reject(err)
            }
            else{
               resolve(data)
            }
        })
    })
}

/**
 * @description api for skip the order rating
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
 async function _skipByRating(req,res){
    try {
       logger.info("+++++++++++++++welcome to skip_rating function++++++++++++++++========");
       let order_id=req.body.order_id;
       let user_id=req.users.id;
        let query="UPDATE orders SET `is_rating_skip` = 1 WHERE `id` =? and `user_id` =?"
        let data=await ExecuteQ.Query(req.dbName,query,[order_id,user_id]);
        sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,200);
    } catch (err) {
       var msg = "something went wrong ";
       return sendResponse.sendErrorMessage(msg,res,500);
    }
}


module.exports={
    AddRating:AddRating,
    ProductRatingReview:ProductRatingReview,
    _skipByRating:_skipByRating
}

