var constant=require('../../routes/constant')
var connectionCntr=require('../../routes/connection')
var sendResponse = require('../../routes/sendResponse');
var uploadMgr=require('../../lib/UploadMgr')
var confg=require('../../config/const');
var _ = require('underscore'); 
var chunk = require('chunk');
var log4js = require('log4js');
var logger = log4js.getLogger();
let moment=require("moment")
const Execute=require('../../lib/Execute')
logger.level = config.get('server.debug_level');
/**
 * @desc used for Update an PromoCode Info
 * @param {*Object} req 
 * @param {*Object} res 
 */
const Update=async (req,res)=>{

    try{
    let id=req.body.id;
    let detailsTemp = req.body;
    let category_ids= null, product_ids= null ,region_ids=null;
    let discount_percentage_by_admin =  req.body.discount_percentage_by_admin != undefined || null || ""?req.body.discount_percentage_by_admin : 0;
    let discount_percentage_by_supplier =  req.body.discount_percentage_by_supplier != undefined || null || ""?req.body.discount_percentage_by_supplier : 0;
    req.body.discountPrice   = req.body.discountPrice != undefined || null ||""? req.body.discountPrice : 0.0;
    let promo_buy_x_quantity =req.body.promo_buy_x_quantity != undefined || null ||""? req.body.promo_buy_x_quantity : 0;
    let promo_get_x_quantity = req.body.promo_get_x_quantity != undefined || null ||""? req.body.promo_get_x_quantity : 0;
    let buy_x_get_x_arr =  req.body.buy_x_get_x_arr != undefined || null ||""? req.body.buy_x_get_x_arr : "";
    let max_discount_value  = req.body.max_discount_value != undefined || null || ""?req.body.max_discount_value :"";
    let max_buy_x_get  = req.body.max_buy_x_get != undefined || null || ""?req.body.max_buy_x_get :"";
    // let max_discount_value = detailsTemp.max_discount_value!==undefined?detailsTemp.max_discount_value:0;
    
    if(req.body.category_ids !=null && req.body.category_ids !=  undefined && req.body.category_ids !="" ){ 
   
        category_ids = req.body.category_ids.toString().replace('[','');
        category_ids = category_ids.toString().replace(']','');
      }
      if(req.body.product_ids !=null  &&  req.body.product_ids !=undefined  && req.body.product_ids !="" ){  
        product_ids = req.body.product_ids.toString().replace('[','');
       product_ids = product_ids.toString().replace(']','');
     }
     if(req.body.region_ids !=null  &&  req.body.region_ids !=undefined  && req.body.region_ids !="" ){ 
        region_ids = req.body.region_ids.toString().replace('[','');
        region_ids = region_ids.toString().replace(']','');
      }
      


    let saveData=JSON.stringify(req.body.details);
    let supplierData=req.body.details;
    let promoData=await Execute.Query(req.dbName,`select name from promoCode where id=?`,[id]);
    let promoName=promoData && promoData.length>0?promoData[0].name:"";
    logger.debug("=======INPUT==>>",detailsTemp,promoName)
    
       var update_sql="update promoCode set promo_level =?,max_discount_value=?, product_ids=?,category_ids=?, region_ids=?, name=?,promoCode=?,maxUsers=?,minPrice=?,perUserCount=?,endDate=?,"+
       " discountPrice=?,discountType=?,promoType=?,startDate=?,detailsJson=?,promoDesc=?,firstTime=?,bear_by=?,commission_on=?, promo_buy_x_quantity=?, promo_get_x_quantity=?, buy_x_get_x_arr=?, max_buy_x_get=? where id=?"
        var params = [
            detailsTemp.promo_level,max_discount_value,  product_ids, category_ids,region_ids,detailsTemp.name,detailsTemp.promoCode,detailsTemp.maxUser,detailsTemp.minPrice,detailsTemp.perUserCount,
            moment(detailsTemp.endDate).format('YYYY-MM-DD'),detailsTemp.discountPrice,
            detailsTemp.discountType,detailsTemp.promoType,
            moment(detailsTemp.startDate).format('YYYY-MM-DD'),saveData,
            detailsTemp.desc,
            detailsTemp.firstTime,detailsTemp.bear_by,detailsTemp.commission_on, detailsTemp.promo_buy_x_quantity, detailsTemp.promo_get_x_quantity, detailsTemp.buy_x_get_x_arr, detailsTemp.max_buy_x_get, id];

        if(supplierData && supplierData.length>0){

            for(const [index,i] of supplierData.entries()){
              let dataExist=await Execute.Query(req.dbName,`select id from promoCode where supplierId=? and name=?`,[i.supplierId,promoName]);
              if(dataExist && dataExist.length>0){
                  let updateSql="update promoCode set max_discount_value=?,promo_level =?, product_ids=?,category_ids=?, region_ids=?, name=?,promoCode=?,maxUsers=?,minPrice=?,perUserCount=?,endDate=?,"+
                    " discountPrice=?,discountType=?,promoType=?,startDate=?,detailsJson=?,promoDesc=?,firstTime=?,bear_by=?,commission_on=?, promo_buy_x_quantity=?, promo_get_x_quantity=?, buy_x_get_x_arr=?, max_buy_x_get=? where supplierId=? and name=?"
                    await Execute.Query(req.dbName,updateSql,[
                      detailsTemp.max_discount_value,
                      detailsTemp.promo_level,  product_ids, category_ids,region_ids,detailsTemp.name,detailsTemp.promoCode,detailsTemp.maxUser,detailsTemp.minPrice,detailsTemp.perUserCount,
                      moment(detailsTemp.endDate).format('YYYY-MM-DD'),detailsTemp.discountPrice,
                      detailsTemp.discountType,detailsTemp.promoType,
                      moment(detailsTemp.startDate).format('YYYY-MM-DD'),saveData,
                      detailsTemp.desc,
                      detailsTemp.firstTime,detailsTemp.bear_by,detailsTemp.commission_on, detailsTemp.promo_buy_x_quantity, detailsTemp.promo_get_x_quantity, detailsTemp.buy_x_get_x_arr, detailsTemp.max_buy_x_get, i.supplierId,promoName]);
              }
              else{

                var sql = "insert into promoCode (max_discount_value,max_buy_x_get, buy_x_get_x_arr,  promo_buy_x_quantity, promo_get_x_quantity,  product_ids, promo_level, discount_percentage_by_admin, discount_percentage_by_supplier,name,promoCode,maxUsers,minPrice,perUserCount,endDate,discountPrice,discountType,category,supplierId,promoType,startDate,detailsJson,promoDesc,firstTime,bear_by,commission_on, region_ids,category_ids )values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
                await Execute.Query(req.dbName,sql,[detailsTemp.max_discount_value,max_buy_x_get, buy_x_get_x_arr,  promo_buy_x_quantity, promo_get_x_quantity, product_ids, req.body.promo_level, discount_percentage_by_admin, discount_percentage_by_supplier,  detailsTemp.name,detailsTemp.promoCode,detailsTemp.maxUser,detailsTemp.minPrice,detailsTemp.perUserCount,moment(detailsTemp.endDate).format('YYYY-MM-DD'),detailsTemp.discountPrice,detailsTemp.discountType,i.categoryId,i.supplierId,detailsTemp.promoType,moment(detailsTemp.startDate).format('YYYY-MM-DD'),saveData,detailsTemp.desc,req.body.firstTime,detailsTemp.bear_by,detailsTemp.commission_on,region_ids,category_ids]);

              }


            }
        }


        await Execute.Query(req.dbName,update_sql,params);


        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch(Err){
        console.log("==============errrrrrrr========",Err);
        sendResponse.somethingWentWrongError(res);
    }
}


module.exports={
    Update:Update
}

