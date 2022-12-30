
var async = require('async');
var sendResponse = require('../../routes/sendResponse');
var constant = require('../../routes/constant');
var func = require('../../routes/commonfunction');
var consts=require('./../../config/const');
const lib=require('../../lib/NotificationMgr')
var _ = require('underscore');
var something = "Something went wrong";
var client = require('twilio')("AC4b6d9ecd84afd6db7cf9ac5f055d7784","782e67bf1f26170706acd639d757ae08");
var moment = require('moment');
var pushNotifications = require('../../routes/pushNotifications');
var orderFunction = require('../../routes/orderFunction');
var AdminMail = "ops@royo.com";
var crypto = require('crypto')
    algorithm = consts.SERVER.CYPTO.ALGO,
    crypto_password =  consts.SERVER.CYPTO.PWD
var chunk = require('chunk');
var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = config.get('server.debug_level');
const ExecuteQ=require('../../lib/Execute')
const Universal=require('../../util/Universal')
const common=require('../../common/agent')

const SupplierSearch=async (req,res)=>{
    try{       
        logger.debug("===",req.dbName);
        var s_data=await SupplierSearchByName(req,req.dbName);  
        var s_ids=await SupplierIds(s_data);
        var p_data=await GetSProduct(req,s_ids,req.dbName); 
        var m_json=
        {
            
            "fulfillmentText": "choose the item from list",
            // "fulfillmentMessages": [
            //     {
            //     "card": {
            //         "title": "card title",
            //         "subtitle": "card text",
            //         "imageUri": "https://assistant.google.com/static/images/molecule/Molecule-Formation-stop.png",
            //         "buttons": [
            //         {
            //             "text": "button text",
            //             "postback": "https://assistant.google.com/"
            //         }
            //         ]
            //     }
            //     }
            // ],
            "payload": {
            //   "google": {
                "expectUserResponse": true,
                "richResponse": {
                  "items":p_data
                }
            //   }
            }
          }
        // var json_format={
        //     "speech": "this text is spoken out loud if the platform supports voice interactions",
        //     "displayText": "this text is displayed visually",
        //     "messages": {
        //       "type": 1,
        //       "title": "card title",
        //       "subtitle": "card text",
        //       "imageUrl": "https://assistant.google.com/static/images/molecule/Molecule-Formation-stop.png"
        //     },
        //     "data": {
        //       "product":p_data,
        //       "google": {
        //         "expectUserResponse": true,
        //         "richResponse": {
        //           "items": [
        //             {
        //               "simpleResponse": {
        //                 "textToSpeech": "this is a simple response"
        //               }
        //             }
        //           ]
        //         }
        //       },
        //       "facebook": {
        //         "text": "Hello, Facebook!"
        //       },
        //       "slack": {
        //         "text": "This is a text response for Slack."
        //       }
        //     },
        //     "contextOut": [
        //       {
        //         "name": "context name",
        //         "lifespan": 5,
        //         "parameters": {
        //           "param": "param value"
        //         }
        //       }
        //     ],
        //     "source": "example.com",
        //     "followupEvent": {
        //       "name": "event name",
        //       "parameters": {
        //         "param": "param value"
        //       }
        //     }
        // }      
        return res.json(m_json);
        // return res.json(response)
        // return sendResponse.sendSuccessData(p_data, constant.responseMessage.SUCCESS, res, 200);
    }
    catch(err){
        logger.error("==ERRR==",err)
        return sendResponse.sendErrorMessage(err,res,400);
    }
}
/**
 * @desc used for listing an supplier according to delivery area`s
 * @param {*Int} areaId 
 */
const SupplierSearchByName=(req,dbName)=>{

    var day = moment().isoWeekday();
    day=day-1;

    var supplier_name=req.body!=undefined && req.body.queryResult!=undefined && req.body.queryResult.queryText!=undefined?req.body.queryResult.parameters.supplier:"";
    
    logger.debug("== req.body.result && req.body.result.parameters && req.body.result.parameters.team==",dbName,req.body,supplier_name);
    
    return new Promise((resolve,reject)=>{
                logger.debug("===ENTE==")
                var sql
                if(supplier_name && supplier_name.length>0){
                    sql = "select s.self_pickup,si.image_path as supplier_image,sc.onOffComm,s.delivery_prior_total_time as delivery_prior_time,s.delivery_min_time,s.delivery_max_time,s.urgent_delivery_time,s.total_reviews,s.rating,sb.id as supplier_branch_id, ";
                    sql += " sml.name,sml.description,sml.uniqueness,sml.terms_and_conditions,sml.address,s.logo,s.id,st.is_open as status,st.start_time,st.end_time,s.total_reviews," +
                        " s.rating,s.payment_method,sc.commission_package from supplier_category sc join supplier s on s.id = " +
                        " sc.supplier_id join supplier_timings st on st.supplier_id = s.id join supplier_branch sb on ";
                    sql += " s.id = sb.supplier_id  join supplier_ml " +
                        " sml on s.id = sml.supplier_id left join supplier_image si on si.supplier_id=s.id  where ";
                    sql += "   s.is_live = ? and s.is_active = ? and s.is_deleted =0  and sb.is_live = ? " +
                        "and sb.is_deleted = ? and st.week_id =? and sml.name like '%"+supplier_name[0]+"%' GROUP BY s.id order by s.rating DESC";
                }
                else{
                    sql = "select s.self_pickup,si.image_path as supplier_image,sc.onOffComm,s.delivery_prior_total_time as delivery_prior_time,s.delivery_min_time,s.delivery_max_time,s.urgent_delivery_time,s.total_reviews,s.rating,sb.id as supplier_branch_id, ";
                    sql += " sml.name,sml.description,sml.uniqueness,sml.terms_and_conditions,sml.address,s.logo,s.id,st.is_open as status,st.start_time,st.end_time,s.total_reviews," +
                        " s.rating,s.payment_method,sc.commission_package from supplier_category sc join supplier s on s.id = " +
                        " sc.supplier_id join supplier_timings st on st.supplier_id = s.id join supplier_branch sb on ";
                    sql += " s.id = sb.supplier_id  join supplier_ml " +
                        " sml on s.id = sml.supplier_id left join supplier_image si on si.supplier_id=s.id  where ";
                    sql += "   s.is_live = ? and s.is_active = ? and s.is_deleted =0  and sb.is_live = ? " +
                        "and sb.is_deleted = ? and st.week_id =?  GROUP BY s.id order by s.rating DESC";
                }
       

                       logger.debug("=====ERR!==",sql);                        
                    var sql_stmt=multiConnection[dbName].query(sql, [1,1,1,0,day], function (err, result) {                        
                        logger.debug("=====ERR!==",err,sql_stmt.sql);   
                        if(err){
                                reject(err)                           
                        }
                        else{   
                            resolve(result);
                            // logger.debug("==ELSE==")
                        }
                    })
            })
}
const SupplierIds=(supplier_data)=>{
    // logger.debug("===supplier_data==",supplier_data)
   var sup_ids=[]
    return new Promise((resolve,reject)=>{
        if(supplier_data && supplier_data.length>0){
            for(const i of supplier_data){
                sup_ids.push(i.id)
            }
            logger.debug("==sup_ids==",sup_ids);
            resolve(sup_ids)

        }
        else{
            resolve(0)
        }


    })


}
const GetSProduct=(req,supplier_ids,dbName)=>{     
    return new Promise((resolve,reject)=>{
          var product_name_arr=req.body!=undefined && req.body.queryResult!=undefined && req.body.queryResult.queryText!=undefined?req.body.queryResult.parameters.product:"";
          logger.debug("=product_name_arr=",product_name_arr) 
          var sup_ids=supplier_ids && supplier_ids.length>0?supplier_ids:[0]
          if(product_name_arr && product_name_arr.length>0){
                var product_name=product_name_arr[0];
                var sql ="select p.avg_rating,IF((select count(*) from product where product.parent_id=p.id)>0,1,0) as is_variant,p.id as product_id,IF((select count(*) from product_favourite where product_favourite.product_id=p.id and product_favourite.user_id=0 and product_favourite.status=1 )>0,1,0) as is_favourite,( select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"type_name\": \"', pdt.name, '\", ','\"name\": \"', pr.name,'\", ','\"type_id\": \"', pdt.id,'\",','\"is_multiple\": \"', pr.is_multiple,'\",','\"min_adds_on\": \"', pr.min_adds_on,'\",','\"max_adds_on\": \"', pr.max_adds_on,'\",','\"id\": \"', pr.id, '\",','\"price\": \"', price, '\",','\"is_default\": \"', pdt.is_default, '\"','}') SEPARATOR ','),''),']') AS bData from product_adds_on pr left join product_adds_on_type pdt on pdt.adds_on_id=pr.id and pdt.is_deleted=0 where pr.product_id=p.id and pr.is_deleted=0      ) as adds_on,IF((select count(*)  from product_adds_on  where  product_adds_on.product_id = p.id  and product_adds_on.is_deleted = 0 ) > 0, 1, 0) as is_product_adds_on,p.is_product,p.duration,"+
                " price.display_price,s.id as supplier_id,s.logo as supplier_logo,"+
                " quantity,purchased_quantity,"+
                " c.is_quantity,c.is_agent,c.agent_list,"+
                " c.id as category_id,c.category_flow,if(price.display_price=price.price,0,1) AS discount,s.name as supplier_name"+
                " ,price.price as hourly_price,price.pricing_type,price.urgent_type,price.urgent_value,price.can_urgent,sbb.id as supplier_branch_id,"+
                " if(p.purchased_quantity>=p.quantity,0,1) AS availability,price.handling as handling_admin,price.handling_supplier,price.house_cleaning_price,"+                            
                " price.beauty_saloon_price,"+
                " bp.detailed_sub_category_id,"+
                " bar_code,sku,cml.name as detailed_name,pml.name,pml.product_desc"+
                " ,price.price,pimage.image_path,"+
                " pml.measuring_unit,price.price_type ,"+
                " price.price as fixed_price,price.price_type as price1 "+
                " from "+
                " supplier_branch_product bp join categories c on  bp.category_id = c.id join categories_ml cml on cml.category_id = c.id join product p"+
                " on bp.product_id = p.id join product_ml pml  on bp.product_id = pml.product_id join product_image pimage on bp.product_id = "+
                " pimage.product_id join   product_pricing price on bp.product_id = price.product_id and price.price_type = IF ( (SELECT COUNT(*) as counter  FROM product_pricing pc where  pc.product_id=bp.product_id and pc.is_deleted=0 having counter>1) , 1, 0) "+
                " join supplier_branch sbb on sbb.id = bp.supplier_branch_id join supplier s on s.id = sbb.supplier_id"+ 
                " where s.id IN("+sup_ids.join(",")+") and bp.detailed_sub_category_id != 0 and p.is_live = 1"+
                " and p.parent_id=0  and p.is_deleted = 0 and bp.is_deleted=0 and price.is_deleted = 0  "+    
                " and pml.language_id = 14 and sbb.is_deleted=0  and sbb.is_live=1 and s.is_deleted =0 and s.is_active=1 and cml.language_id= 14 and (pimage.default_image = 1"+ 
                " or pimage.imageOrder =1)  and ((price.price_type = '1' and DATE(price.start_date) <=  CURDATE() "+
                " and DATE(price.end_date) >= CURDATE()) or (price.price_type = 0)) and ((price.pricing_type=1) or(price.pricing_type=0 and "+
                "  price.price !=0))  GROUP BY product_id,sku having  name like '%"+product_name+"%' "  
            }
            else{
                var sql ="select p.avg_rating,IF((select count(*) from product where product.parent_id=p.id)>0,1,0) as is_variant,p.id as product_id,IF((select count(*) from product_favourite where product_favourite.product_id=p.id and product_favourite.user_id=0 and product_favourite.status=1 )>0,1,0) as is_favourite,( select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"type_name\": \"', pdt.name, '\", ','\"name\": \"', pr.name,'\", ','\"type_id\": \"', pdt.id,'\",','\"is_multiple\": \"', pr.is_multiple,'\",','\"min_adds_on\": \"', pr.min_adds_on,'\",','\"max_adds_on\": \"', pr.max_adds_on,'\",','\"id\": \"', pr.id, '\",','\"price\": \"', price, '\",','\"is_default\": \"', pdt.is_default, '\"','}') SEPARATOR ','),''),']') AS bData from product_adds_on pr left join product_adds_on_type pdt on pdt.adds_on_id=pr.id and pdt.is_deleted=0 where pr.product_id=p.id and pr.is_deleted=0      ) as adds_on,IF((select count(*)  from product_adds_on  where  product_adds_on.product_id = p.id  and product_adds_on.is_deleted = 0 ) > 0, 1, 0) as is_product_adds_on,p.is_product,p.duration,"+
                " price.display_price,s.id as supplier_id,s.logo as supplier_logo,"+
                " quantity,purchased_quantity,"+
                " c.is_quantity,c.is_agent,c.agent_list,"+
                " c.id as category_id,c.category_flow,if(price.display_price=price.price,0,1) AS discount,s.name as supplier_name"+
                " ,price.price as hourly_price,price.pricing_type,price.urgent_type,price.urgent_value,price.can_urgent,sbb.id as supplier_branch_id,"+
                " if(p.purchased_quantity>=p.quantity,0,1) AS availability,price.handling as handling_admin,price.handling_supplier,price.house_cleaning_price,"+                            
                " price.beauty_saloon_price,"+
                " bp.detailed_sub_category_id,"+
                " bar_code,sku,cml.name as detailed_name,pml.name,pml.product_desc"+
                " ,price.price,pimage.image_path,"+
                " pml.measuring_unit,price.price_type ,"+
                " price.price as fixed_price,price.price_type as price1 "+
                " from "+
                " supplier_branch_product bp join categories c on  bp.category_id = c.id join categories_ml cml on cml.category_id = c.id join product p"+
                " on bp.product_id = p.id join product_ml pml  on bp.product_id = pml.product_id join product_image pimage on bp.product_id = "+
                " pimage.product_id join   product_pricing price on bp.product_id = price.product_id and price.price_type = IF ( (SELECT COUNT(*) as counter  FROM product_pricing pc where  pc.product_id=bp.product_id and pc.is_deleted=0 having counter>1) , 1, 0) "+
                " join supplier_branch sbb on sbb.id = bp.supplier_branch_id join supplier s on s.id = sbb.supplier_id"+ 
                " where s.id IN("+sup_ids.join(",")+") and bp.detailed_sub_category_id != 0 and p.is_live = 1"+
                " and p.parent_id=0  and p.is_deleted = 0 and bp.is_deleted=0 and price.is_deleted = 0  "+    
                " and pml.language_id = 14 and sbb.is_deleted=0  and sbb.is_live=1 and s.is_deleted =0 and s.is_active=1 and cml.language_id= 14 and (pimage.default_image = 1"+ 
                " or pimage.imageOrder =1)  and ((price.price_type = '1' and DATE(price.start_date) <=  CURDATE() "+
                " and DATE(price.end_date) >= CURDATE()) or (price.price_type = 0)) and ((price.pricing_type=1) or(price.pricing_type=0 and "+
                "  price.price !=0))  GROUP BY product_id,sku "  
            }
            logger.debug(sql);
            var stmt=multiConnection[dbName].query(sql,async (err,data)=>{
               logger.debug(stmt.sql);               
                 if(err){
                    reject(err)
                }
                else{
                    var afterModifResult=await modifyResult(data,0,0,0);
                    logger.debug("===DATA!")
                    resolve(afterModifResult)
                }
            })  
        })
}

/**
 * @description used for modify the result of products
 * @param {*Array} result 
 * @param {*Int} required_day 
 * @param {*Int} required_hour 
 * @param {*Int} screen_flow 
 */
const modifyResult=(result,required_day,required_hour,screen_flow)=>{
    logger.debug("===ScreenFlow:=>",screen_flow);
    return new Promise((resolve,reject)=>{
        var adds_on_ar=[],adds_on,final_json={},price_varies,available_flag=false,not_available_id=[];
        if(result && result.length>0){

            for(var i = 0; i< result.length;i++){
                    logger.debug("=====result[i].adds_on==",result[i].adds_on)
                    if(result[i].adds_on){
                    adds_on=_.groupBy(JSON.parse(result[i].adds_on),"name");

                    _.each(adds_on,function(value,key,object){
                            final_json.name=key
                            final_json.value=value
                            adds_on_ar.push(final_json);
                            final_json={}                                
                    })
                }
                    result[i].adds_on=adds_on_ar;
                    result[i].required_day=required_day;
                    result[i].required_hour=required_hour;
                    logger.debug("= result[i].adds_on=adds_on_ar=IsArray=AdsOnArray", result[i].adds_on,adds_on_ar,Array.isArray(result[i].adds_on),Array.isArray(adds_on_ar))                    
                    adds_on_ar=[];
                    if(result[i].pricing_type == 1){
                        result[i].hourly_price =JSON.parse(result[i].price);
                        // if(screen_flow && screen_flow.length>0 && screen_flow[0].app_type==5)
                        // {
                            result[i].price_type=1;
                            price_varies = result[i].hourly_price
                            // logger.debug("======PRICE_VARIES==",price_varies);
                            if(price_varies && price_varies.length>0){
                                // [{"min_hour":"1","max_hour":"1","price_per_hour":"300"},
                                // {"min_hour":"2","max_hour":"2","price_per_hour":"300"}
                                // {"min_hour":"3","max_hour":"180","price_per_hour":"300"}]
                                _.each(price_varies,function(j){
                                    logger.debug("==:required_hour=:required_day:=min_hour:=:max_hour=",required_hour,required_day,j.min_hour,j.max_hour);
                                  if(required_day>=1){
                                        if(required_day==j.min_hour && required_day==j.max_hour){
                                            available_flag=true
                                        }
                                    }
                                    else{
                                        if(required_hour==j.min_hour/60 && required_hour==j.max_hour/60){
                                            available_flag=true
                                        }
                                    }
                                })
                                if(available_flag==false){
                                    not_available_id.push(result[i].product_id)
                                    // result.splice(i,1)
                                }
                                available_flag=false;
                            }                                          
                        // }

                        
                        
                    }else{
                        result[i].price_type=0;                           
                        delete result[i].hourly_price;
                    } 
                 
                    if(i==result.length-1 || result.length<=0){
                        resolve(result);
                    }                    
        }
    }
    else{
        resolve([])
    }
})
}

const SupplierList = async (req, res) => {

    try {
        


        let min_preparation_time = 
        req.query.min_preparation_time !==undefined && req.query.min_preparation_time !=="" 
         && req.query.min_preparation_time !== null ?req.query.min_preparation_time:"0"

         let max_preparation_time = 
         req.query.max_preparation_time !==undefined && req.query.max_preparation_time !=="" 
          && req.query.max_preparation_time !== null ?req.query.max_preparation_time:"15"
 
        logger.debug(req.query);
        let is_dine_in = req.query.is_dine_in == undefined ? 0 : req.query.is_dine_in
        let search = req.query.search == undefined || req.query.search == 'undefined' ? "" : req.query.search
        search=search.replace(/[^a-zA-Z ]/g, '');
        let categoryId = req.query.categoryId != undefined && req.query.categoryId != "" ? req.query.categoryId : 0
        let tags = req.query.tags != undefined && req.query.tags != "" ? req.query.tags : 0
        let skipLatAndLngDistance = req.query.skipLatAndLngDistance;
        let offset = req.query.offset || "+05:30";
        let self_pickup = req.query.self_pickup != undefined ? req.query.self_pickup : 0
        let limit = req.query.limit != undefined ? parseInt(req.query.limit) : 1000
        let skip = req.query.skip != undefined ? parseInt(req.query.skip) : 0
        var service_type = await ExecuteQ.Query(req.dbName, "select app_type from screen_flow", []);
        let user_id=await Universal.getUserId(req.headers.authorization,req.dbName)
        offset = offset.replace(" ", "+")

        let supplier_data;
        // 1-for distance wise 2- for rating wise 3-for A->Z 4-For Z->A
        let sort_by = req.query.sort_by == undefined || req.query.sort_by == "" || req.query.sort_by == 0 ? 0 : req.query.sort_by
        /**sort by 5 for open and 6 for closed */

        // let is_open = req.query.is_open==undefined?0:req.query.is_open
        if (skipLatAndLngDistance === true) {
            supplier_data = await SupAccToAreaWithOutLatAndLng(req, tags, search, service_type[0].app_type
                , self_pickup, req.query.languageId, categoryId, req.dbName);
               
                sendResponse.sendSuccessData(supplier_data, constant.responseMessage.SUCCESS, res, 200);
            } else {
            logger.debug("=========path v1 ==path v1=path v1===+", req.path)
            if (req.path == "/home/supplier_list/V1") {
                logger.debug("=========path v1 ======+", req.path)
                supplier_data = await SupAccToAreaV1(req, tags, search, service_type[0].app_type,
                    self_pickup, req.query.latitude, req.query.longitude, req.query.languageId,
                    categoryId, req.dbName, sort_by, is_dine_in, offset,user_id,min_preparation_time,
                    max_preparation_time);

                let final_supplier_data = await SupplierWithTiming(req.dbName, supplier_data);
                if (final_supplier_data && final_supplier_data.length > 0) {
                    final_supplier_data = await SupplierWithTags(req.dbName, final_supplier_data)
                }

                if(parseInt(sort_by)==2){
                    final_supplier_data = _.sortBy(final_supplier_data,"rating").reverse();
                }

                sendResponse.sendSuccessData(final_supplier_data, constant.responseMessage.SUCCESS, res, 200);

            } else if (req.path == "/home/supplier_list/V2") {

                let format=/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
                if(format.test(search)){
                    supplier_data={
                        list:[],
                        count:0
                    }
                  } else {
                    supplier_data = await SupAccToAreaV2(req, tags,
                         search, service_type[0].app_type,
                        self_pickup, req.query.latitude,
                         req.query.longitude, req.query.languageId,
                        categoryId, req.dbName,
                         sort_by, is_dine_in, offset,
                         limit,skip,min_preparation_time,
                         max_preparation_time);
                  }
                let final = {
                    list : supplier_data.list,
                    count:supplier_data.count
                }
                sendResponse.sendSuccessData(final, constant.responseMessage.SUCCESS, res, 200);
            } else if (req.path == "/home/supplier_list/V3") {
                supplier_data = await SupAccToAreaV3(req, tags, search, service_type[0].app_type,
                    self_pickup, req.query.latitude, req.query.longitude, req.query.languageId,
                    categoryId, req.dbName,
                     sort_by, is_dine_in, offset,
                     limit,skip,min_preparation_time,
                     max_preparation_time);
                     let final = {
                        list : supplier_data.list,
                        count:supplier_data.count
                    }
                    sendResponse.sendSuccessData(final, constant.responseMessage.SUCCESS, res, 200);
            }
            else {
                
                supplier_data = await SupAccToArea(req,
                    tags, search, service_type[0].app_type,
                    self_pickup, req.query.latitude, req.query.longitude, req.query.languageId,
                    categoryId, req.dbName, sort_by, is_dine_in, 
                    offset,min_preparation_time,
                    max_preparation_time );
                    console.log("here we check result second.......",supplier_data) 
                sendResponse.sendSuccessData(supplier_data, constant.responseMessage.SUCCESS, res, 200);
            }
        }
    }
    catch (err) {
        console.log("=SupplierList==Err!=",err)
        return sendResponse.sendErrorMessage(err, res, 400);
    }
}

const SupplierListWithFastestDelivery=async (req,res)=>{

    try{

        logger.debug(req.query);
        let offset = req.query.offset || "+05:30";
        var service_type =await ExecuteQ.Query(req.dbName,"select app_type from screen_flow",[]);
        offset = offset.replace(" ","+")
        let order_by = req.query.order_by!==undefined?req.query.order_by:0

        let supplier_data;
        // 1-for distance wise 2- for rating wise 3-for A->Z 4-For Z->A
        /**sort by 5 for open and 6 for closed */
        
        // let is_open = req.query.is_open==undefined?0:req.query.is_open

        supplier_data=await fastestDeliverySuppliers(req.query.latitude,
            req.query.longitude,req.query.languageId,
                req.dbName,offset,order_by);  
           

        
        let final_supplier_data=await SupplierWithTiming(req.dbName,supplier_data);
        
        if(final_supplier_data && final_supplier_data.length>0){
             final_supplier_data = await SupplierWithTags(req.dbName,final_supplier_data)
        }
        sendResponse.sendSuccessData(final_supplier_data, constant.responseMessage.SUCCESS, res, 200);
    }
    catch(err){
        logger.error(err)
        return sendResponse.sendErrorMessage(err,res,400);
    }
}
const SupplierWithTiming=(dbName,data)=>{
    let final_data=[]
    return new Promise(async (resolve,reject)=>{
        for(const [index,i] of data.entries()){
            i.timing=await getSupTiming(dbName,i.id)
            final_data.push(i)
        }
        resolve(final_data)
    })
}

const SupplierWithTimingV1 = (dbName,data)=>{
    let final_data=[]
    return new Promise(async (resolve,reject)=>{
        for(const [index,i] of data.entries()){
            i.timing=await getSupTiming(dbName,i);
            final_data.push(i)
        }
        resolve(final_data)
    })
}

const SupplierWithTags=(dbName,suppliersList)=>{
    let final_data=[]
    return new Promise(async (resolve,reject)=>{
        for(const [index,i] of suppliersList.entries()){
            i.supplier_tags=await getSupTags(dbName,i.id)
            final_data.push(i)
        }
        resolve(final_data)
    })
}
const getSupTiming=(dbName,supId)=>{
    return new Promise(async (resolve,reject)=>{
        let sql = "select week_id,start_time,end_time,is_open, close_week_id from supplier_timings where supplier_id = ?";
        let data=await ExecuteQ.Query(dbName,sql,[supId])
        resolve(data);
    })
}

const getSupTags=(dbName,supId)=>{
    return new Promise(async (resolve,reject)=>{
        let sql = "SELECT st.name,st.tag_image,st.id,st.created_at from supplier_assigned_tags "
        sql+= " sat join supplier_tags st on st.id = sat.tag_id where sat.supplier_id=?"
        let data=await ExecuteQ.Query(dbName,sql,[supId])
        resolve(data);
    })
}

const SubCategoryWithOffer=async (req,res)=>{
    try{
        logger.debug("===INPUT====",req.query);
        let latitude = req.query.latitude==undefined?0:req.query.latitude
        let longitude = req.query.longitude==undefined?0:req.query.longitude
        let supplier_with_subcategory= []
        var day = moment().isoWeekday();
        day=day-1;
        var brands=await BrandList(req.query.category_id,req.dbName,req.query.languageId);
        var user_id=await UserId(req.headers.authorization,req.dbName);
        
        var discount_offer=await DiscountOffer(user_id,req.query.languageId,req.query.category_id,req.query.latitude,req.query.longitude,req.dbName)
        logger.debug("=======discount offer=======",discount_offer);
        var sub_category_data=await getSubCategoryDetails(req.query.languageId,
            req.query.category_id,req.dbName)
        logger.debug("=======sub_category_data=======",sub_category_data);

        if(req.query.supplier_id!=undefined && req.query.supplier_id!=""){

            sub_category_data=await getSupplierSubcategory(req.query.supplier_id,req.query.languageId,req.query.category_id,req.dbName)
        }

        if(sub_category_data && sub_category_data.length>0){
            let radius_check_query="";
                radius_check_query="having distance<=delivery_radius order by s.id desc"
            
            for(const [index,i] of sub_category_data.entries()){
                 let mUnit=await Universal.getMeausringUnit(req.dbName)

            let sql = " select s.is_scheduled,s.mobile_number_1 as supplierPhoneNumber,s.country_code as supplier_country_code,ct.type,ct.menu_type,s.delivery_radius,si.image_path as supplier_image,s.id,sbb.id as supplier_branch_id,s.logo,s.status,s.payment_method,s.rating,s.total_reviews, " +
            "sml.name,sml.description,sml.uniqueness,sml.terms_and_conditions,sml.address,"+
            "("+mUnit+" * acos (cos (radians("+latitude+"))* cos(radians(s.latitude))* cos(radians(s.longitude) - radians("+longitude+")) + sin (radians("+latitude+")) * sin(radians(s.latitude)))) AS distance  from supplier s " +
            " join supplier_ml sml on sml.supplier_id = s.id join supplier_branch sbb on sbb.supplier_id = " +
            " s.id join supplier_timings st " +
            " on st.supplier_id = s.id  left join supplier_image si on si.supplier_id=s.id left join supplier_category sc on s.id = sc.supplier_id join categories ct on ct.id=sc.category_id where " +
            " sml.language_id = ? and sc.sub_category_id="+i.sub_category_id+" and s.is_deleted = ? and s.is_live = ? and s.is_active = ? and " +
            " sbb.is_live = 1 and sbb.is_deleted = 0 and st.week_id =? and s.is_recommended = ? GROUP BY s.id "+radius_check_query+"";

            let data = await ExecuteQ.Query(req.dbName,sql,[req.query.languageId,
            0,1,1,day,1]);
            supplier_with_subcategory.push({
                sub_category_name : i.name,
                suppliers : data
            })

            }
        }
        sendResponse.sendSuccessData({"supplier_with_subcategory":supplier_with_subcategory,"brand":brands,"offer":discount_offer,"sub_category_data":sub_category_data}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch(Err){
        logger.debug(Err);
        return sendResponse.sendErrorMessage(Err,res,400)
    }
}

// let mUnit=await Universal.getMeausringUnit(dbName)
// if(parseInt(categoryId)>0){
//     var sql = " select s.is_scheduled,s.mobile_number_1 as supplierPhoneNumber,s.country_code as supplier_country_code,ct.type,ct.menu_type,s.delivery_radius,si.image_path as supplier_image,s.id,sbb.id as supplier_branch_id,s.logo,s.status,s.payment_method,s.rating,s.total_reviews, " +
//     "sml.name,sml.description,sml.uniqueness,sml.terms_and_conditions,sml.address,"+
//     "("+mUnit+" * acos (cos (radians("+latitude+"))* cos(radians(s.latitude))* cos(radians(s.longitude) - radians("+longitude+")) + sin (radians("+latitude+")) * sin(radians(s.latitude)))) AS distance  from supplier s " +
//     " join supplier_ml sml on sml.supplier_id = s.id join supplier_branch sbb on sbb.supplier_id = " +
//     " s.id join supplier_timings st " +
//     " on st.supplier_id = s.id  left join supplier_image si on si.supplier_id=s.id left join supplier_category sc on s.id = sc.supplier_id join categories ct on ct.id=sc.category_id where " +
//     " sml.language_id = ? and sc.category_id="+categoryId+" and s.is_deleted = ? and s.is_live = ? and s.is_active = ? and " +
//     " sbb.is_live = 1 and sbb.is_deleted = 0 and st.week_id =? and s.is_recommended = ? GROUP BY s.id "+radius_check_query+"";

const UserId=(token,dbName)=>{    
    return new Promise((resolve,reject)=>{
        var sqlQuery="select `id` from user where `access_token`=?"
        if(token!=undefined && token!=""){
            multiConnection[dbName].query(sqlQuery,[token],(err,data)=>{
                if(err){
                    resolve(0)
                }
                else{
                    if(data && data.length>0){
                        resolve(data[0].id)
                    }
                    else{
                        resolve(0)
                    }
                }
            })
        }
        else{
            resolve(0)
        }

    })

}
function getSupplierSubcategory(supplierId,languageId,categoryId,dbName){

    return new Promise(async (resolve,reject)=>{
        let cateIds=[];
        let subCateData=await ExecuteQ.Query(dbName,`select id,parent_id from categories where parent_id!=? and is_deleted=?`,[0,0])
        if(subCateData && subCateData.length>0){
            let subIds=Universal.getNestedChildrenIds(subCateData,categoryId);
            logger.debug("=====subIds==>>",subIds);
            if(subIds && subIds.length>0){
                cateIds=subIds;
            }
            else{
                cateIds.push(categoryId)
            }
        }
        else{
            cateIds.push(categoryId)
        }  
    // var sql = "select IF((select count(*)  from questions  where questions.category_id=c.id) > 0, 1, 0) as is_question,ml.category_id as sub_category_id,c.menu_type,c.image ,ml.description,c.icon,ml.name,c.id,IF ((select count(*) from categories cts where cts.parent_id=ml.category_id and cts.is_deleted=0)>0, 1, 0) as is_cub_category from supplier_category " +
    //     " sc join categories c on  sc.sub_category_id = c.id ";
    // sql += "join categories_ml ml on sc.sub_category_id = ml.category_id where ml.language_id = ? and c.is_live = ? ";
    // sql += " and sc.supplier_id = ? and sc.category_id = ? and c.is_deleted = ? and c.id !="+parseInt(categoryId)+" and c.parent_id="+parseInt(categoryId)+" UNION " ;
    // var sql = "select IF((select count(*)  from questions  where questions.category_id=c.id) > 0, 1, 0) as is_question,ml.category_id as sub_category_id,c.menu_type,c.image ,ml.description,c.icon,ml.name,c.id,IF ((select count(*) from categories cts where cts.parent_id=ml.category_id and cts.is_deleted=0)>0, 1, 0) as is_cub_category from supplier_category " +
    // " sc join categories c on  sc.sub_category_id = c.id ";
    // sql += "join categories_ml ml on sc.sub_category_id = ml.category_id where ml.language_id = ? and c.is_live = ? ";
    // sql += " and sc.supplier_id = ? and c.is_deleted = ? and c.id !="+parseInt(categoryId)+" and c.parent_id="+parseInt(categoryId)+" UNION " ;
   
    var sql = "select * from ( select IF((select count(*)  from questions  where questions.category_id=c.id and isDelete=0 ) > 0, 1, 0) as is_question,ml.category_id as sub_category_id,c.menu_type,c.image ,ml.description,c.icon,ml.name,c.id,IF ((select count(*) from categories cts where cts.parent_id=ml.category_id and cts.is_deleted=0)>0, 1, 0) as is_cub_category from supplier_category " +
    " sc join categories c on  sc.sub_category_id = c.id ";
    sql += "join categories_ml ml on sc.sub_category_id = ml.category_id where ml.language_id = ? and c.is_live = ? ";
    sql += " and sc.supplier_id = ? and c.is_deleted = ? and sc.sub_category_id IN ("+cateIds+") UNION " ;

    sql += " select IF((select count(*)  from questions  where questions.category_id=c.id) > 0, 1, 0) as is_question,ml.category_id as sub_category_id,c.menu_type,c.image ,ml.description,c.icon,ml.name,c.id,IF ((select count(*) from categories cts where cts.parent_id=ml.category_id and cts.is_deleted=0)>0, 1, 0) as is_cub_category from supplier_category " +
    " sc join categories c on  sc.detailed_sub_category_id	 = c.id ";
    sql += "join categories_ml ml on sc.detailed_sub_category_id = ml.category_id where ml.language_id = ? and c.is_live = ? ";
    sql += " and sc.supplier_id = ? and sc.detailed_sub_category_id IN ("+cateIds+") and c.is_deleted = ? and not exists (select IF((select count(*)  from questions  where questions.category_id=c.id) > 0, 1, 0) as is_question,ml.category_id as sub_category_id,c.menu_type,c.image ,ml.description,c.icon,ml.name,c.id,IF ((select count(*) from categories cts where cts.parent_id=ml.category_id and cts.is_deleted=0)>0, 1, 0) as is_cub_category from supplier_category sc join categories c on  sc.sub_category_id = c.id join categories_ml ml on sc.sub_category_id = ml.category_id where ml.language_id = ? and c.is_live = ? and sc.supplier_id = ? and c.is_deleted = ? and sc.sub_category_id IN ("+cateIds+") )) as t GROUP by name ";

    // sql += " select IF((select count(*)  from questions  where questions.category_id=c.id) > 0, 1, 0) as is_question,ml.category_id as sub_category_id,c.menu_type,c.image ,ml.description,c.icon,ml.name,c.id,IF ((select count(*) from categories cts where cts.parent_id=ml.category_id and cts.is_deleted=0)>0, 1, 0) as is_cub_category from supplier_category " +
    //     " sc join categories c on  sc.detailed_sub_category_id	 = c.id ";
    // sql += "join categories_ml ml on sc.detailed_sub_category_id = ml.category_id where ml.language_id = ? and c.is_live = ? ";
    // sql += " and sc.supplier_id = ? and sc.detailed_sub_category_id IN ("+cateIds+") and c.is_deleted = ? and c.id !="+parseInt(categoryId)+" and c.parent_id="+parseInt(categoryId)+"";

    // sql += "select IF((select count(*)  from questions  where questions.category_id=c.id) > 0, 1, 0) as is_question,ml.category_id as sub_category_id,c.menu_type,c.image ,ml.description,c.icon,ml.name,c.id,IF ((select count(*) from categories cts where cts.parent_id=ml.category_id and cts.is_deleted=0)>0, 1, 0) as is_cub_category from supplier_category " +
    // " sc join categories c on  sc.detailed_sub_category_id = c.id ";
    // sql += "join categories_ml ml on sc.detailed_sub_category_id = ml.category_id where ml.language_id = ? and c.is_live = ? ";
    // sql += " and sc.supplier_id = ? and sc.sub_category_id = "+categoryId+" and c.is_deleted = ? and c.id !="+parseInt(categoryId)+" and c.parent_id="+parseInt(categoryId) ;
    
    var st=multiConnection[dbName].query(sql, [languageId,1,supplierId,0,languageId,1,supplierId,0,languageId,1,supplierId,0], function (err,result) {
        console.log("==supplierSubcategory====STMT==Query==>>",st.sql);
        if (err) {
                var msg = "something went wrong";
                reject(msg)
        } else {
            resolve(result);
        }
    })
})
}

function DiscountOffer(user_id,lanuageId,catId,latitude,longitude,dbName){

    return new Promise( async (resolve,reject)=>{
            try{
                let mUnit=await Universal.getMeausringUnit(dbName);
        var sql = "select is_favourite,supplier_branch_id, avg_rating,delivery_radius, is_quantity, is_product, price_type, offer_id, fixed_price, handling_supplier, handling_admin, can_urgent, urgent_type,"
        sql += "category_id, sub_category_id, supplier_id, price, offer_name, display_price, measuring_unit, product_desc, name, image_path, product_id, supplier_name," 
        sql += "supplier_image,("+mUnit+" * acos (cos (radians("+latitude+"))* cos(radians(latitude))* cos(radians(longitude) - radians("+longitude+")) + sin (radians("+latitude+")"
        sql += ")* sin(radians(latitude)))) AS distance from (select IF((select count(*) from product_favourite where product_favourite.product_id = p.id "
        sql += "and product_favourite.user_id = "+user_id+" and product_favourite.status = 1)> 0, 1, 0) as is_favourite, p.avg_rating as avg_rating, ct.is_quantity as is_quantity," 
        sql += "p.is_product as is_product, pp.pricing_type as price_type, pp.id as offer_id, pp.handling as handling_admin, pp.handling_supplier, pp.can_urgent, pp.urgent_type,"
        sql += "p.category_id, p.sub_category_id, sb.supplier_id,sb.id as supplier_branch_id, pp.price as fixed_price, pp.price, pp.offer_name, pp.display_price, pml.measuring_unit, pml.product_desc,"
        sql += "pml.name, pi.image_path, p.id as product_id, s.name as supplier_name,s.delivery_radius, s.logo as supplier_image,s.latitude,s.longitude from supplier_product sp "
        sql += "join product p on p.id = sp.product_id join product_image pi on pi.product_id = p.id join product_ml pml on pml.product_id = p.id "
        sql += "join product_pricing pp on pp.product_id = p.id join supplier_branch sb on sb.supplier_id = sp.supplier_id join supplier s on s.id = sb.supplier_id "
        sql += "join categories ct on ct.id = p.category_id left join supplier_image si on si.supplier_id = sb.supplier_id where pp.is_deleted = 0 and p.is_live = 1 "
        sql += "and sb.is_live = 1 and sb.is_deleted = 0 and p.is_deleted = ? and pml.language_id = ? and s.is_live = 1 and s.is_deleted = 0 and pp.price_type = ? "
        sql += "and p.category_id = ? and DATE(pp.start_date) <= CURDATE() and DATE(pp.end_date) >= CURDATE() ORDER BY pp.price_type DESC) selection GROUP BY "
        sql += "product_id having distance<delivery_radius order by offer_id DESC"
        let result=await ExecuteQ.Query(dbName,sql,[0,lanuageId,1,catId])
        resolve(result)
            }
            catch(Err){
                logger.debug("=======",Err)
                reject(Err)
            }
        // console.log(".............sql......................",sql);
        // var statemtnt=multiConnection[dbName].query(sql, [0,lanuageId,1,catId], function (err, result) {
        //     logger.debug("===",err,statemtnt.sql)
        //     if (err) {
        //         reject(err)
        //     }
        //     else {               
        //         resolve(result)
        //     }
        // })

    })
}
function getSubCategoryDetails(languageId,categoryId,dbName){
    return new Promise((resolve,reject)=>{
    var sql = "select IF((select count(*)  from questions  where questions.category_id=c.id and isDelete=0 ) > 0, 1, 0) as is_question,c.id sub_category_id,c.menu_type,c.image,c.icon,ml.name,ml.description,IF ((select count(*) from categories cts where cts.parent_id=c.id and cts.is_deleted=0)>0, 1, 0) as is_cub_category from categories c join categories_ml ml ";
    sql += " on c.id = ml.category_id ";
    sql += " where c.parent_id = ? and ml.language_id = ? and c.is_deleted  = 0 and c.is_live = ?";
    var statement=multiConnection[dbName].query(sql, [categoryId,languageId,1], function (err, result) {
        logger.debug("==STATEMENT==",err);
        if (err) {
            var msg = "something went wrong";
            reject(msg)
        }
        else {
            resolve(result);
        }
    })
})
}

function BrandList(catIds,dbName,languageId){
    var final=[];
    return new Promise(async (resolve,reject)=>{
        var brandQuery="select br.id,ml.name,br.description,br.image from cat_brands cb inner join brands br on br.id=cb.brand_id inner join brands_ml ml on ml.brand_id=br.id  where cb.cat_id=? and br.deleted_by=? and cb.deleted_by=? and ml.language_id=?"
        multiConnection[dbName].query(brandQuery,[parseInt(catIds),0,0,languageId],async function(err,data){
            // logger.debug("====ERR!=",err);
            if(err){
                reject(err)
            }
            else{
                logger.debug("===DATA!===",data)
                if(data && data.length>0){                    
                    // var names;
                    // for (const i of data) {
                    //     names=await brandMl(i.id,dbName);
                    //     final.push({
                    //         id:i.id,
                    //         description:i.description,
                    //         image:i.image,
                    //         names:names,
                    //         name:i.name
                    //     })
                    // }
                    resolve(data)
                }   
                else{
                    resolve(final)
                }             
              
            }
        });
    });
}

function brandMl (id,dbName){
    return new Promise((resolve,reject)=>{
    var sql="select name,language_id from brands_ml where brand_id=?"
    var st=multiConnection[dbName].query(sql,[id],function(err,data){
        logger.debug(st.sql)
        if(err){
            reject(err)
        }
        else{
            logger.debug("=DATA=!=",data)
            resolve(data)
        }
    })
})

} 


/**
 * @desc used for listing an supplier according to delivery area`s
 * @param {*Int} areaId 
 */
const SupAccToAreaWithOutLatAndLng=(req,tags,search,service_type,self_pickup,languageId,categoryId,dbName)=>{
    var day = moment().isoWeekday();
    day=day-1;
    return new Promise(async (resolve,reject)=>{
    let paginationQuery="";
    let limit=req.query.limit!=undefined?req.query.limit:0;
    let skip=req.query.skip!=undefined?req.query.skip:0;
    let isPagination=(parseInt(limit))>0?1:0;
    paginationQuery=(isPagination==1)?"limit "+limit+" offset "+skip+"":""
    

        console.log("=====self_pickup==before query======day==",self_pickup,day)
        if(tags==0){
                if(parseInt(categoryId)==0){

                    var sql="select temp.*,(select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"image\": \"', c.image, '\", ','\"supplier_placement_level\": \"', c.supplier_placement_level,'\", ','\"category_id\": \"', c.id,'\",','\"category_name\": \"',REPLACE(cml.name,'\"','\\''),'\",','\"description\": \"', REPLACE(cml.name,'\"','\\''),'\",','\"order\": \"', c.order, '\"','}') SEPARATOR ','),''),']') AS bData from categories c  JOIN categories_ml cml on cml.category_id=c.id where c.id IN (select supplier_category.category_id from supplier_category WHERE supplier_category.supplier_id=temp.id ) and cml.language_id=14 and c.is_live=1 and c.is_deleted=0 )  as categories,( select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"is_open\": \"', st.is_open, '\", ','\"week_id\": \"', st.week_id,'\", ','\"start_time\": \"', st.start_time,'\",','\"end_time\": \"', st.end_time, '\"','}') SEPARATOR ','),''),']') AS bData from  supplier_timings  st where st.supplier_id = temp.id  )  as timings,( select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"tag_image\": \"', st.tag_image, '\", ','\"id\": \"', st.id,'\", ','\"created_at\": \"', st.created_at,  '\",','\"name\": \"', st.name, '\"','}') SEPARATOR ','),''),']') AS tData   from supplier_assigned_tags sa join supplier_tags st on st.id = sa.tag_id  where sa.supplier_id = temp.id )  as supplier_tags "
                    sql+= "from (select "
                    sql+="ct.id as category_id,ct.type,s.is_scheduled,IF(EXISTS(select id from user_favourite where supplier_id = s.id and user_id = "+user_id+" and is_delete = 0 ),1,0) as Favourite,s.is_sponser as is_multi_branch,s.self_pickup, si.image_path as supplier_image, sc.onOffComm,s.delivery_prior_total_time as delivery_prior_time, s.delivery_min_time, "
                    sql += "s.delivery_max_time,s.urgent_delivery_time, s.rating,sb.id as supplier_branch_id,sml.name,sml.description, "
                    sql += "s.delivery_radius,sml.uniqueness,sml.terms_and_conditions,sml.address, s.logo, s.id,st.is_open as status, st.start_time,st.end_time, "
                    sql += "s.total_reviews, s.payment_method, sc.commission_package "
                    sql += "from supplier_category sc join categories ct on ct.id=sc.category_id join supplier s on s.id = sc.supplier_id join supplier_timings st on st.supplier_id = s.id join supplier_branch sb on s.id = sb.supplier_id "
                    sql += "join supplier_ml sml on s.id = sml.supplier_id left join supplier_image si on si.supplier_id = s.id "
                    sql += "where sml.name like '%"+search+"%' and s.is_live = 1 and(s.self_pickup="+self_pickup+" or s.self_pickup=2) and s.is_active = 1 and s.is_deleted = 0 and sb.is_live = 1  and s.is_active = 1 and s.is_deleted = 0 and sb.is_live = 1 and sml.language_id = 14 and sb.is_deleted = 0 and st.week_id = ? "
                    sql += "GROUP BY s.id  order by s.id DESC "+paginationQuery+") as temp"
                }
                else{
                    var sql="select temp.*,(select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"image\": \"', c.image, '\", ','\"supplier_placement_level\": \"', c.supplier_placement_level,'\", ','\"category_id\": \"', c.id,'\",','\"category_name\": \"',REPLACE(cml.name,'\"','\\''),'\",','\"description\": \"', REPLACE(cml.name,'\"','\\''),'\",','\"order\": \"', c.order, '\"','}') SEPARATOR ','),''),']') AS bData from categories c  JOIN categories_ml cml on cml.category_id=c.id where c.id IN (select supplier_category.category_id from supplier_category WHERE supplier_category.supplier_id=temp.id ) and cml.language_id=14 and c.is_live=1 and c.is_deleted=0 )  as categories,( select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"is_open\": \"', st.is_open, '\", ','\"week_id\": \"', st.week_id,'\", ','\"start_time\": \"', st.start_time,'\",','\"end_time\": \"', st.end_time, '\"','}') SEPARATOR ','),''),']') AS bData from  supplier_timings  st where st.supplier_id = temp.id  )  as timings,( select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"tag_image\": \"', st.tag_image, '\", ','\"id\": \"', st.id,'\", ','\"created_at\": \"', st.created_at,  '\",','\"name\": \"', st.name, '\"','}') SEPARATOR ','),''),']') AS tData   from supplier_assigned_tags sa join supplier_tags st on st.id = sa.tag_id  where sa.supplier_id = temp.id )  as supplier_tags "
                    sql+= "from (select "
                    sql+="ct.id as category_id,ct.type,s.is_scheduled,IF(EXISTS(select id from user_favourite where supplier_id = s.id and user_id = "+user_id+" and is_delete = 0 ),1,0) as Favourite,s.is_sponser as is_multi_branch,s.self_pickup, si.image_path as supplier_image, sc.onOffComm,s.delivery_prior_total_time as delivery_prior_time, s.delivery_min_time, "
                    sql += "s.delivery_max_time,s.urgent_delivery_time, s.rating,sb.id as supplier_branch_id,sml.name,sml.description, "
                    sql += "s.delivery_radius,sml.uniqueness,sml.terms_and_conditions,sml.address, s.logo, s.id,st.is_open as status, st.start_time,st.end_time, "
                    sql += "s.total_reviews, s.payment_method, sc.commission_package "
                    sql += "from supplier_category sc join categories ct on ct.id=sc.category_id join supplier s on s.id = sc.supplier_id join supplier_timings st on st.supplier_id = s.id join supplier_branch sb on s.id = sb.supplier_id "
                    sql += "join supplier_ml sml on s.id = sml.supplier_id left join supplier_image si on si.supplier_id = s.id "
                    sql += "where sml.name like '%"+search+"%' and ct.id="+categoryId+" and s.is_live = 1 and(s.self_pickup="+self_pickup+" or s.self_pickup=2) and s.is_active = 1 and s.is_deleted = 0 and sb.is_live = 1  and s.is_active = 1 and s.is_deleted = 0 and sb.is_live = 1 and sml.language_id = 14 and sb.is_deleted = 0 and st.week_id = ? "
                    sql += "GROUP BY s.id  order by s.id DESC "+paginationQuery+") as temp"
                }
    }
    else{
        if(parseInt(categoryId)==0){
            var sql="select temp.*,(select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"image\": \"', c.image, '\", ','\"supplier_placement_level\": \"', c.supplier_placement_level,'\", ','\"category_id\": \"', c.id,'\",','\"category_name\": \"',REPLACE(cml.name,'\"','\\''),'\",','\"description\": \"', REPLACE(cml.name,'\"','\\''),'\",','\"order\": \"', c.order, '\"','}') SEPARATOR ','),''),']') AS bData from categories c  JOIN categories_ml cml on cml.category_id=c.id where c.id IN (select supplier_category.category_id from supplier_category WHERE supplier_category.supplier_id=temp.id ) and cml.language_id=14 and c.is_live=1 and c.is_deleted=0 )  as categories,( select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"is_open\": \"', st.is_open, '\", ','\"week_id\": \"', st.week_id,'\", ','\"start_time\": \"', st.start_time,'\",','\"end_time\": \"', st.end_time, '\"','}') SEPARATOR ','),''),']') AS bData from  supplier_timings  st where st.supplier_id = temp.id  )  as timings,( select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"tag_image\": \"', st.tag_image, '\", ','\"id\": \"', st.id,'\", ','\"created_at\": \"', st.created_at,  '\",','\"name\": \"', st.name, '\"','}') SEPARATOR ','),''),']') AS tData   from supplier_assigned_tags sa join supplier_tags st on st.id = sa.tag_id  where sa.supplier_id = temp.id )  as supplier_tags "
            sql+= "from (select "
            sql+="ct.id as category_id,ct.type,s.is_scheduled,s.self_pickup, si.image_path as supplier_image, sc.onOffComm,s.delivery_prior_total_time as delivery_prior_time, s.delivery_min_time, "
            sql += "s.delivery_max_time,IF(EXISTS(select id from user_favourite where supplier_id = s.id and user_id = "+user_id+" and is_delete = 0 ),1,0) as Favourite,s.is_sponser as is_multi_branch,s.urgent_delivery_time, s.rating,sb.id as supplier_branch_id,sml.name,sml.description, "
            sql += "s.delivery_radius,sml.uniqueness,sml.terms_and_conditions,sml.address, s.logo, s.id,st.is_open as status, st.start_time,st.end_time, "
            sql += "s.total_reviews, s.payment_method, sc.commission_package "
            sql += "from supplier_category sc join categories ct on ct.id=sc.category_id join supplier s on s.id = sc.supplier_id join supplier_timings st on st.supplier_id = s.id join supplier_branch sb on s.id = sb.supplier_id "
            sql += "join supplier_ml sml on s.id = sml.supplier_id left join supplier_image si on si.supplier_id = s.id "
            sql += "where sml.name like '%"+search+"%' and s.is_live = 1 and(s.self_pickup="+self_pickup+" or s.self_pickup=2)  and sml.language_id = 14 and sb.is_deleted = 0 and st.week_id = ? "
            sql += "GROUP BY s.id  order by s.id DESC "+paginationQuery+") as temp"
        }
        else{
            var sql="select temp.*,(select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"image\": \"', c.image, '\", ','\"supplier_placement_level\": \"', c.supplier_placement_level,'\", ','\"category_id\": \"', c.id,'\",','\"category_name\": \"',REPLACE(cml.name,'\"','\\''),'\",','\"description\": \"', REPLACE(cml.name,'\"','\\''),'\",','\"order\": \"', c.order, '\"','}') SEPARATOR ','),''),']') AS bData from categories c  JOIN categories_ml cml on cml.category_id=c.id where c.id IN (select supplier_category.category_id from supplier_category WHERE supplier_category.supplier_id=temp.id ) and cml.language_id=14 and c.is_live=1 and c.is_deleted=0 )  as categories,( select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"is_open\": \"', st.is_open, '\", ','\"week_id\": \"', st.week_id,'\", ','\"start_time\": \"', st.start_time,'\",','\"end_time\": \"', st.end_time, '\"','}') SEPARATOR ','),''),']') AS bData from  supplier_timings  st where st.supplier_id = temp.id  )  as timings,( select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"tag_image\": \"', st.tag_image, '\", ','\"id\": \"', st.id,'\", ','\"created_at\": \"', st.created_at,  '\",','\"name\": \"', st.name, '\"','}') SEPARATOR ','),''),']') AS tData   from supplier_assigned_tags sa join supplier_tags st on st.id = sa.tag_id  where sa.supplier_id = temp.id )  as supplier_tags "
            sql+= "from (select "
            sql+="ct.id as category_id,ct.type,s.is_scheduled,IF(EXISTS(select id from user_favourite where supplier_id = s.id and user_id = "+user_id+" and is_delete = 0 ),1,0) as Favourite,s.is_sponser as is_multi_branch,s.self_pickup, si.image_path as supplier_image, sc.onOffComm,s.delivery_prior_total_time as delivery_prior_time, s.delivery_min_time, "
            sql += "s.delivery_max_time,s.urgent_delivery_time,sb.id as supplier_branch_id,sml.name,sml.description, "
            sql += "s.delivery_radius,sml.uniqueness,sml.terms_and_conditions,sml.address, s.logo, s.id,st.is_open as status, st.start_time,st.end_time, "
            sql += "s.total_reviews, s.rating, s.payment_method, sc.commission_package "
            sql += "from supplier_category sc join categories ct on ct.id=sc.category_id join supplier s on s.id = sc.supplier_id join supplier_timings st on st.supplier_id = s.id join supplier_branch sb on s.id = sb.supplier_id "
            sql += "join supplier_ml sml on s.id = sml.supplier_id left join supplier_image si on si.supplier_id = s.id "
            sql += "where sml.name like '%"+search+"%' and ct.id="+categoryId+" and s.is_live = 1 and(s.self_pickup="+self_pickup+" or s.self_pickup=2)  and sml.language_id = 14 and sb.is_deleted = 0 and st.week_id = ? "
            sql += "GROUP BY s.id  order by s.id DESC "+paginationQuery+""
        }
    }

       
        // logger.debug("=====ERR!=============1234556=",sql);
        let result=await ExecuteQ.QueryV1(req,dbName,sql,[day]);
               
                            var data_length=result.length
                            if(data_length>0){
                                for(var i =0;i<data_length;i++){
                                    (function(i){ 
                                        logger.debug("=====",result[i].categories)
                                        result[i].category =result[i] && result[i].categories?JSON.parse(result[i].categories):[];
                                        result[i].timing =result[i] && result[i].timings?JSON.parse(result[i].timings):[];
                                        result[i].supplier_tags=result[i] && result[i].supplier_tags?JSON.parse(result[i].supplier_tags):[]
                                        
                                        if(i == (data_length -1)){                                               
                                            resolve(result)
                                        } 
                                    }(i));
                                }
                        }
                        else{
                            resolve(result)
                        }
                    // }et
                    // })
            })
}


const supplierResponseSameResponse=(sIds,languageId,dbName)=>{
    return new Promise((resolve,reject)=>{

        let supplierIds;
        if(Array.isArray(sIds)){
            supplierIds= sIds;
        }else{
            supplierIds=  [sIds];
        }

        

                  var sql = "select s.self_pickup, si.image_path as supplier_image, sc.onOffComm,s.delivery_prior_total_time as delivery_prior_time, s.delivery_min_time, "
                    sql += "s.delivery_max_time,s.urgent_delivery_time,s.total_reviews, s.rating,sb.id as supplier_branch_id,sml.name,sml.description, "
                    sql += "s.delivery_radius,sml.uniqueness,sml.terms_and_conditions,sml.address, s.logo, s.id,st.is_open as status, st.start_time,st.end_time, "
                    sql += "s.total_reviews, s.rating, s.payment_method, sc.commission_package "
                    sql += "from supplier_category sc join supplier s on s.id = sc.supplier_id join supplier_timings st on st.supplier_id = s.id join supplier_branch sb on s.id = sb.supplier_id "
                    sql += "join supplier_ml sml on s.id = sml.supplier_id left join supplier_image si on si.supplier_id = s.id "
                    sql += "where s.is_live = 1 and s.is_active = 1 and s.is_deleted = 0 and sb.is_live = 1  and s.is_active = 1 and s.is_deleted = 0 and sb.is_live = 1 and sml.language_id = 14 and s.id in (?)"
                    sql += "GROUP BY s.id  order by s.id DESC"
        
                   var st=multiConnection[dbName].query(sql, [supplierIds], function (err, result) {
                      logger.debug("=====ERR!=============1234556=",st.sql);
                        if(err) {
                                reject(err)                           
                        }
                        else{
                            var data_length=result.length
                            if(data_length>0){
                            for(var i =0;i<data_length;i++){
                                (function(i){        
                                    supplierCategory(result[i].id,languageId,dbName,function(err,catData){
                                        if(err){
                                            callback(err);
                                        }else{
                                            result[i].category = [];
                                            var leng = catData.length;
                                            for(var j = 0;j < leng;j++){
                                                (function(j){
                                                    result[i].category.push(catData[j]);
                                                }(j));
                                            }
                                            //temp.push({supplier:supplierList[i],category:result});
                                            if(i == (data_length -1)){                                               
                                                resolve(result)
                                            }
                                        }
                                    })
                                }(i));
                            }

                           
                        }
                        else{
                            resolve(result)
                        }
                    }
                    })
            })
}

/**
 * @desc used for listing an supplier according to delivery area`s
 * @param {*Int} areaId 
 */
 const SupAccToArea = async (
    req,tags,search,service_type,
    self_pickup,latitude,
    longitude,languageId,categoryId,dbName,
    sort_by,is_dine_in,offset,
    min_preparation_time,
    max_preparation_time)=>{
    let dinecheck = ""
    let keyData=await Universal.getKeysValue(["is_subscription_plan","is_table_booking","is_opening_on_top"],req.dbName);
    let subScriptionData=keyData.filter(item => item.key.indexOf('is_subscription_plan') !== -1);
    let dineInCheck =keyData.filter(item => item.key.indexOf('is_table_booking') !== -1);
    let onTopTiming=keyData.filter(item => item.key.indexOf('is_opening_on_top') !== -1);
    let planQuery=subScriptionData && subScriptionData.length>0?" and ss.status='active' and ss.is_approved=1 ":" "
    
    
    logger.debug("=======subScriptionData==>>",subScriptionData,dineInCheck);


    let user_id=await Universal.getUserId(req.headers.authorization,req.dbName);
   
        
    let filter_by = req.query.filter_by!==undefined?req.query.filter_by:0
    // 3-for A->Z 4-For Z->A
    // let dineInCheck = await ExecuteQ.Query(dbName,"select key,value from ")
   
    let sequenceWiseCheck = await ExecuteQ.Query(req.dbName,
        "select `key`,value from tbl_setting where `key`=? and value='1' ",["enable_sequence_wise_supplier"])

        let active_inactiveCheck =  await ExecuteQ.Query(req.dbName,
            "select `key`,value from tbl_setting where `key`=? and value='1' ",["active_inactive"])
    
    var day = moment().isoWeekday();
    day=day-1;
    logger.debug("=======is_dine_in=====",is_dine_in)
    let paginationQuery="";
    let limit=req.query.limit!=undefined?req.query.limit:0;
    let skip=req.query.skip!=undefined?req.query.skip:0;
    let isPagination=(parseInt(limit))>0?1:0;
    paginationQuery=(isPagination==1)?"limit "+limit+" offset "+skip+"":""
    
    let open_close_filter = "";

   
    logger.debug("========offset======+",offset,paginationQuery)
    let currentDate = moment().utcOffset(offset.toString());
    let currentTime = moment().utcOffset(offset.toString());
    // logger.debug("========currentTime======+",currentTime)
    currentTime = moment(currentTime).format('HH:mm:ss');
    // logger.debug("========currentTime=====222=+",currentTime)
    const date = moment(currentDate).format("YYYY-MM-DD"); //
    let convertedDate=moment(date)
    const dayId = convertedDate.day()-1;
    logger.debug("==DayId==",dayId);


    // req.query.active_inactive =1;
    let  active_inactive_filter ="and s.is_live = 1 ";
    if(active_inactiveCheck && active_inactiveCheck.length>0)
        active_inactive_filter = "and s.is_live = 1"; //"and s.is_live = 0 or  s.is_live = 1";
    


    if(parseInt(sort_by)==5){
        open_close_filter = "and st.is_open=1 and st.start_time<='"+currentTime+"' and st.end_time>='"+currentTime+"' "
    }else if(parseInt(sort_by)==6){
        let currentTime = moment().utcOffset(offset.toString());
        // logger.debug("========currentTime======+",currentTime)

        currentTime = moment(currentTime).format('HH:mm:ss');
        // logger.debug("========currentTime=====222=+",currentTime)
        open_close_filter = "and st.week_id="+dayId+" and ((st.start_time>'"+currentTime+"' and st.end_time>'"+currentTime+"') or (st.start_time<'"+currentTime+"' and st.end_time<'"+currentTime+"')) "
    }
    
    let selfPickupSql="s.self_pickup="+self_pickup+""
    let is_free_delivery = req.query.is_free_delivery!==undefined?req.query.is_free_delivery:0;

    let preparationTimeFilter = "";
    let FreeDeliveryFilter = "";
    
    if(parseInt(is_free_delivery)==1){
    
        preparationTimeFilter = " and s.is_free_delivery=1 ";
    
    }
    
    if(parseInt(min_preparation_time)!==0 && parseInt(max_preparation_time)!==0){
        FreeDeliveryFilter = " and MINUTE(s.preparation_time) >= '"+min_preparation_time+"' and MINUTE(s.preparation_time) <= '"+max_preparation_time+"'";
    }

    
    console.log('==========openclosefilter======',open_close_filter)
    return new Promise(async (resolve,reject)=>{ 
       
        
        if(dineInCheck && dineInCheck.length>0){

            console.log("=======dinecheck=====",dineInCheck,is_dine_in)

            if(parseInt(dineInCheck[0].value)===1 && parseInt(is_dine_in)==1){
                dinecheck = "and s.is_dine_in = "+is_dine_in+""
                selfPickupSql="s.self_pickup=0 or s.self_pickup=1 or s.self_pickup=4"
            }
        }
        console.log("======dinein check=======",dinecheck)
        console.log("=====self_pickup==before query======day==",self_pickup,day)

        let mUnit=await Universal.getMeausringUnit(dbName)
      
        
        if(tags==0){
            // let order_by_query = "order by  id desc"
            let order_by_query = "order by distance asc"
            if(parseInt(sort_by)==1){
                order_by_query = "order by distance asc"
            }else if(parseInt(sort_by)==2){
                order_by_query = "order by rating desc"
            }else if(parseInt(sort_by)==3){
                order_by_query = "order by name asc"
            }else if(parseInt(sort_by)==4){
                order_by_query = "order by name desc"
            }
            else{
                if(onTopTiming && onTopTiming.length>0){
                        order_by_query = "order by timing_flag desc"
                }
                else{
                    order_by_query = "order by id desc"
                }
               
            }
            if(sequenceWiseCheck && sequenceWiseCheck.length>0){
                order_by_query = " order by sequence_no desc"
            }
                if(parseInt(categoryId)==0){
                    
                    var sql="select temp.*,(select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"image\": \"', c.image, '\", ','\"supplier_placement_level\": \"', c.supplier_placement_level,'\", ','\"category_id\": \"', c.id,'\",','\"category_name\": \"',REPLACE(cml.name,'\"','\\''),'\",','\"description\": \"', REPLACE(cml.name,'\"','\\''),'\",','\"order\": \"', c.order, '\"','}') SEPARATOR ','),''),']') AS bData from categories c  JOIN categories_ml cml on cml.category_id=c.id where c.id IN (select supplier_category.category_id from supplier_category WHERE supplier_category.supplier_id=temp.id ) and cml.language_id="+languageId+" and c.is_live=1 and c.is_deleted=0 )  as categories,( select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"is_open\": \"', st.is_open, '\", ','\"week_id\": \"', st.week_id,'\", ','\"close_week_id\": \"', IFNULL(st.close_week_id,0),'\",','\"start_time\": \"', st.start_time,'\",','\"end_time\": \"', st.end_time, '\"','}') SEPARATOR ','),''),']') AS bData from  supplier_timings  st where st.supplier_id = temp.id  )  as timings,( select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"tag_image\": \"', st.tag_image, '\", ','\"id\": \"', st.id,'\", ','\"created_at\": \"', st.created_at, '\",','\"name\": \"', st.name, '\"','}') SEPARATOR ','),''),']') AS tData   from supplier_assigned_tags sa join supplier_tags st on st.id = sa.tag_id  where sa.supplier_id = temp.id )  as supplier_tags "
                    sql+= "from (select * from ( select "
                    sql+=" cc.id as category_id,(select COUNT(id) from supplier_timings stp where  stp.is_open=1 and stp.start_time<='"+currentTime+"' and st.end_time>='"+currentTime+"' and stp.supplier_id=s.id and stp.week_id="+dayId+") as timing_flag,IF(EXISTS(select id from user_favourite where supplier_id = s.id and user_id = "+user_id+" and is_delete = 0 ),1,0) as Favourite,cc.type,s.self_pickup, si.image_path as supplier_image, sc.onOffComm,s.delivery_prior_total_time as delivery_prior_time,s.is_sponser as is_multi_branch, s.delivery_min_time, "
                    sql += " sb.min_order, sb.latitude,sb.longitude,s.is_out_network,s.is_dine_in,s.delivery_max_time,s.is_scheduled,s.urgent_delivery_time,s.total_reviews, s.rating,sb.id as supplier_branch_id,sml.name,sml.description, "
                    sql += "s.offerValue,s.preparation_time,s.delivery_radius,sml.uniqueness,sml.terms_and_conditions,sml.address, s.logo, s.id,st.is_open as status, st.start_time,st.end_time, "
                    sql += " s.payment_method, sc.commission_package, "
                    sql += "("+mUnit+" * acos (cos (radians("+latitude+"))* cos(radians(sb.latitude))* cos(radians(sb.longitude) - radians("+longitude+")) + sin (radians("+latitude+"))* sin(radians(sb.latitude)))) AS distance "
                    sql += "from supplier_category sc join supplier s on s.id = sc.supplier_id join supplier_timings st on st.supplier_id = s.id join supplier_branch sb on s.id = sb.supplier_id "
                    sql += "  left join categories cc on cc.id = sc.category_id join supplier_ml sml on s.id = sml.supplier_id left join supplier_image si on si.supplier_id = s.id left join supplier_subscription ss on ss.supplier_id=s.id "
                    sql += "where sml.name like '%"+search+"%' "+active_inactive_filter+"  "+dinecheck+" and("+selfPickupSql+" or s.self_pickup=2 )  and s.is_active = 1 "+open_close_filter+" and s.is_deleted = 0 and sb.is_live = 1  and s.is_active = 1 and s.is_deleted = 0 and sb.is_live = 1 and sml.language_id = "+languageId+" and sb.is_deleted = 0 and st.week_id = ? "+planQuery+" "+preparationTimeFilter+" "+FreeDeliveryFilter+" "
                    // sql += "GROUP BY s.id having distance<=s.delivery_radius "+order_by_query+"  ) as sub"
                    sql += "GROUP BY s.id,sb.id having distance<=s.delivery_radius ) as sub group by id "+order_by_query+"  "+paginationQuery+") as temp"
                }
                else{

                    var sql="select temp.*,(select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"image\": \"', c.image, '\", ','\"supplier_placement_level\": \"', c.supplier_placement_level,'\", ','\"category_id\": \"', c.id,'\",','\"category_name\": \"',REPLACE(cml.name,'\"','\\''),'\",','\"description\": \"', REPLACE(cml.name,'\"','\\''),'\",','\"order\": \"', c.order, '\"','}') SEPARATOR ','),''),']') AS bData from categories c  JOIN categories_ml cml on cml.category_id=c.id where c.id IN (select supplier_category.category_id from supplier_category WHERE supplier_category.supplier_id=temp.id ) and cml.language_id="+languageId+" and c.is_live=1 and c.is_deleted=0 )  as categories,( select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"is_open\": \"', st.is_open, '\", ','\"week_id\": \"', st.week_id,'\", ','\"close_week_id\": \"', IFNULL(st.close_week_id,0),'\",','\"start_time\": \"', st.start_time,'\",','\"end_time\": \"', st.end_time, '\"','}') SEPARATOR ','),''),']') AS bData from  supplier_timings  st where st.supplier_id = temp.id  )  as timings,( select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"tag_image\": \"', st.tag_image, '\", ','\"id\": \"', st.id,'\", ','\"created_at\": \"', st.created_at,  '\",','\"name\": \"', st.name, '\"','}') SEPARATOR ','),''),']') AS tData   from supplier_assigned_tags sa join supplier_tags st on st.id = sa.tag_id  where sa.supplier_id = temp.id )  as supplier_tags "
                    sql+= "from (select * from ( select ct.id as category_id,ct.type,s.self_pickup,(select COUNT(id) from supplier_timings stp where  stp.is_open=1 and stp.start_time<='"+currentTime+"' and st.end_time>='"+currentTime+"' and stp.supplier_id=s.id and stp.week_id="+dayId+") as timing_flag,si.image_path as supplier_image, sc.onOffComm,IF(EXISTS(select id from user_favourite where supplier_id = s.id and user_id = "+user_id+" and is_delete = 0 ),1,0) as Favourite,s.delivery_prior_total_time as delivery_prior_time, s.delivery_min_time, "
                    sql += " sb.min_order, sb.latitude,sb.longitude,s.is_out_network,s.is_sponser as is_multi_branch,s.is_dine_in,s.delivery_max_time,s.is_scheduled,s.urgent_delivery_time,s.total_reviews, s.rating,sb.id as supplier_branch_id,sml.name,sml.description, "
                    sql += "s.offerValue,s.preparation_time,s.delivery_radius,sml.uniqueness,sml.terms_and_conditions,sml.address, s.logo, s.id,st.is_open as status, st.start_time,st.end_time, "
                    sql += " s.payment_method, sc.commission_package, "
                    sql += "("+mUnit+" * acos (cos (radians("+latitude+"))* cos(radians(sb.latitude))* cos(radians(sb.longitude) - radians("+longitude+")) + sin (radians("+latitude+"))* sin(radians(sb.latitude)))) AS distance "
                    sql += "from supplier_category sc join categories ct on ct.id=sc.category_id join supplier s on s.id = sc.supplier_id join supplier_timings st on st.supplier_id = s.id join supplier_branch sb on s.id = sb.supplier_id "
                    sql += "join supplier_ml sml on s.id = sml.supplier_id left join supplier_image si on si.supplier_id = s.id left join supplier_subscription ss on ss.supplier_id=s.id "
                    sql += "where sml.name like '%"+search+"%' and sc.category_id="+categoryId+"  "+active_inactive_filter+"  "+dinecheck+" and("+selfPickupSql+" or s.self_pickup=2 ) and  s.is_active = 1 "+open_close_filter+"  and s.is_deleted = 0 and sb.is_live = 1  and s.is_active = 1 and s.is_deleted = 0 and sb.is_live = 1 and sml.language_id = "+languageId+" and sb.is_deleted = 0 and st.week_id = ? "+planQuery+" "+preparationTimeFilter+" "+FreeDeliveryFilter+" "
                    sql += "GROUP BY s.id,sb.id having distance<=s.delivery_radius order by s.id DESC ) as sub group by id "+order_by_query+" "+paginationQuery+") as temp"
                }
        }
        else{
            if(parseInt(categoryId)==0){
                let order_by_query = ""
                if(parseInt(sort_by)==1){
                    order_by_query = "order by distance asc"
                }else if(parseInt(sort_by)==2){
                    order_by_query = "order by rating desc"
                }else if(parseInt(sort_by)==3){
                    order_by_query = "order by name asc"
                }else if(parseInt(sort_by)==4){
                    order_by_query = "order by name desc"
                }
                else{
                    order_by_query = "order by s.id desc"
                    // order_by_query = "order by distance asc"
                }

                if(sequenceWiseCheck && sequenceWiseCheck.length>0){
                    order_by_query = " order by sequence_no desc"
                }
                var sql="select temp.*,(select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"image\": \"', c.image, '\", ','\"supplier_placement_level\": \"', c.supplier_placement_level,'\", ','\"category_id\": \"', c.id,'\",','\"category_name\": \"',REPLACE(cml.name,'\"','\\''),'\",','\"description\": \"', REPLACE(cml.name,'\"','\\''),'\",','\"order\": \"', c.order, '\"','}') SEPARATOR ','),''),']') AS bData from categories c  JOIN categories_ml cml on cml.category_id=c.id where c.id IN (select supplier_category.category_id from supplier_category WHERE supplier_category.supplier_id=temp.id ) and cml.language_id=14 and c.is_live=1 and c.is_deleted=0 )  as categories,( select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"is_open\": \"', st.is_open, '\", ','\"week_id\": \"', st.week_id,'\", ','\"close_week_id\": \"', IFNULL(st.close_week_id,0),'\",','\"start_time\": \"', st.start_time,'\",','\"end_time\": \"', st.end_time, '\"','}') SEPARATOR ','),''),']') AS bData from  supplier_timings  st where st.supplier_id = temp.id  )  as timings,( select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"tag_image\": \"', st.tag_image, '\", ','\"id\": \"', st.id,'\", ','\"created_at\": \"', st.created_at,  '\",','\"name\": \"', st.name, '\"','}') SEPARATOR ','),''),']') AS tData   from supplier_assigned_tags sa join supplier_tags st on st.id = sa.tag_id  where sa.supplier_id = temp.id )  as supplier_tags "

                sql+= "from (select * from ( select ct.id as category_id,ct.type,s.self_pickup,(select COUNT(id) from supplier_timings stp where  stp.is_open=1 and stp.start_time<='"+currentTime+"' and st.end_time>='"+currentTime+"' and stp.supplier_id=s.id and stp.week_id="+dayId+") as timing_flag,s.is_sponser as is_multi_branch,si.image_path as supplier_image, sc.onOffComm,s.delivery_prior_total_time as delivery_prior_time, s.delivery_min_time, "
                sql += " sb.min_order, sb.latitude,sb.longitude,s.is_out_network,s.is_dine_in,s.delivery_max_time,s.is_scheduled,s.urgent_delivery_time,s.total_reviews, s.rating,sb.id as supplier_branch_id,sml.name,sml.description, "
                sql += "s.offerValue,s.preparation_time,s.delivery_radius,sml.uniqueness,sml.terms_and_conditions,sml.address, s.logo, s.id,st.is_open as status, st.start_time,st.end_time, "
                sql += " s.payment_method, sc.commission_package, "
                sql += "("+mUnit+" * acos (cos (radians("+latitude+"))* cos(radians(sb.latitude))* cos(radians(sb.longitude) - radians("+longitude+")) + sin (radians("+latitude+"))* sin(radians(sb.latitude)))) AS distance "
                sql += "from supplier_category sc join categories ct on ct.id=sc.category_id join supplier s on s.id = sc.supplier_id join supplier_timings st on st.supplier_id = s.id join supplier_branch sb on s.id = sb.supplier_id "
                sql += "join supplier_ml sml on s.id = sml.supplier_id left join supplier_image si on si.supplier_id = s.id left join supplier_subscription ss on ss.supplier_id=s.id "
                sql += "where sml.name like '%"+search+"%' "+active_inactive_filter+"  "+dinecheck+" and (s.self_pickup="+self_pickup+" or s.self_pickup=2 or s.self_pickup=1 or s.is_dine_in="+is_dine_in+")  "+open_close_filter+"  and sml.language_id = "+languageId+" and sb.is_deleted = 0 and st.week_id = ? "+preparationTimeFilter+" "+FreeDeliveryFilter+" "
                sql += "GROUP BY s.id having distance<=sb.delivery_radius "+order_by_query+"  "+paginationQuery+") as temp"
            }
            else{
                var sql="select temp.*,(select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"image\": \"', c.image, '\", ','\"supplier_placement_level\": \"', c.supplier_placement_level,'\", ','\"category_id\": \"', c.id,'\",','\"category_name\": \"',REPLACE(cml.name,'\"','\\''),'\",','\"description\": \"', REPLACE(cml.name,'\"','\\''),'\",','\"order\": \"', c.order, '\"','}') SEPARATOR ','),''),']') AS bData from categories c  JOIN categories_ml cml on cml.category_id=c.id where c.id IN (select supplier_category.category_id from supplier_category WHERE supplier_category.supplier_id=temp.id ) and cml.language_id="+languageId+" and c.is_live=1 and c.is_deleted=0 )  as categories,( select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"is_open\": \"', st.is_open, '\", ','\"week_id\": \"', st.week_id,'\", ','\"close_week_id\": \"', IFNULL(st.close_week_id,0),'\",','\"start_time\": \"', st.start_time,'\",','\"end_time\": \"', st.end_time, '\"','}') SEPARATOR ','),''),']') AS bData from  supplier_timings  st where st.supplier_id = temp.id  )  as timings,( select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"tag_image\": \"', st.tag_image, '\", ','\"id\": \"', st.id,'\", ','\"created_at\": \"', st.created_at,  '\",','\"name\": \"', st.name, '\"','}') SEPARATOR ','),''),']') AS tData   from supplier_assigned_tags sa join supplier_tags st on st.id = sa.tag_id  where sa.supplier_id = temp.id )  as supplier_tags "
                sql+= "from (select * from ( select ct.id as category_id,ct.type,s.self_pickup,(select COUNT(id) from supplier_timings stp where  stp.is_open=1 and stp.start_time<='"+currentTime+"' and st.end_time>='"+currentTime+"' and stp.supplier_id=s.id and stp.week_id="+dayId+") as timing_flag,s.is_sponser as is_multi_branch,si.image_path as supplier_image, sc.onOffComm,s.delivery_prior_total_time as delivery_prior_time, s.delivery_min_time, "
                sql += " sb.min_order, sb.latitude,sb.longitude,s.is_out_network,s.delivery_max_time,s.urgent_delivery_time,s.is_scheduled,s.total_reviews, s.rating,sb.id as supplier_branch_id,sml.name,sml.description, "
                sql += " cc.type, s.is_dine_in,s.preparation_time,s.delivery_radius,sml.uniqueness,sml.terms_and_conditions,sml.address, s.logo, s.id,st.is_open as status, st.start_time,st.end_time, "
                sql += " s.offerValue, s.payment_method, sc.commission_package, "
                sql += "("+mUnit+" * acos (cos (radians("+latitude+"))* cos(radians(sb.latitude))* cos(radians(sb.longitude) - radians("+longitude+")) + sin (radians("+latitude+"))* sin(radians(sb.latitude)))) AS distance "
                sql += "from supplier_category sc join supplier s on s.id = sc.supplier_id join categories ct on ct.id=sc.category_id join supplier_timings st on st.supplier_id = s.id join supplier_branch sb on s.id = sb.supplier_id "
                sql += "  left join categories cc on cc.id = sc.category_id join supplier_ml sml on s.id = sml.supplier_id left join supplier_image si on si.supplier_id = s.id left join supplier_subscription ss on ss.supplier_id=s.id "
                sql += "where sml.name like '%"+search+"%' and sc.category_id="+categoryId+" "+active_inactive_filter+"   "+dinecheck+"  and  (s.self_pickup="+self_pickup+" or s.self_pickup=2 or s.self_pickup=1 or s.is_dine_in="+is_dine_in+") "+open_close_filter+"  and sml.language_id = "+languageId+" and sb.is_deleted = 0 and st.week_id = ? "+preparationTimeFilter+" "+FreeDeliveryFilter+" "
                sql += "GROUP BY s.id having distance<=sb.delivery_radius "+order_by_query+"  "+paginationQuery+") as temp "
            }
        }
        try{
       
                    // logger.debug("=========sql===",sql);
                    let result=await ExecuteQ.QueryV1(req,dbName,sql,[day])
               
                            var data_length=result.length
                            if(data_length>0){
                                let catData;
                                for(var i =0;i<data_length;i++){
                                    (function(i){ 
                                            logger.debug("=====",result[i].categories)
                                            catData=result[i].categories
                                            result[i].category =result[i] && result[i].categories?JSON.parse(catData):[];
                                            result[i].timing =result[i] && result[i].timings?JSON.parse(result[i].timings):[];
                                            result[i].supplier_tags=result[i] && result[i].supplier_tags?JSON.parse(result[i].supplier_tags):[]
                                            if(i == (data_length -1)){ 
                                                console.log("here we check result.......",result)                    
                                                resolve(result)
                                            }
                                    }(i));
                                }
                        }
                        else{
                            resolve(result)
                        }
                 
    }
    catch(Err){
        logger.debug("==Err!==",Err)
        reject(Err)
    }
            })
}
/**
 * @desc used for listing an supplier according to delivery area`s
 * @param {*Int} areaId 
 */
const SupAccToAreaV1 = async (req,tags,search,service_type,self_pickup,latitude,
    longitude,languageId,categoryId,dbName,sort_by,is_dine_in,offset,user_id,min_preparation_time,
    max_preparation_time)=>{
        // 3-for A->Z 4-For Z->A
        // let dineInCheck = await ExecuteQ.Query(dbName,"select key,value from ")
    var day = moment().isoWeekday();
    day=day-1;
    logger.debug("=======is_dine_in=====",is_dine_in)
    // let user_id=await Universal.getUserId(req.headers.authorization,req.dbName)

    let is_free_delivery = req.query.is_free_delivery!==undefined?req.query.is_free_delivery:0;

    let dinecheck = ""
    let keyData=await Universal.getKeysValue(["is_subscription_plan","is_table_booking","is_opening_on_top"],req.dbName);
    let subScriptionData=keyData.filter(item => item.key.indexOf('is_subscription_plan') !== -1);
    let dineInCheck =keyData.filter(item => item.key.indexOf('is_table_booking') !== -1);
    let onTopTiming=keyData.filter(item => item.key.indexOf('is_opening_on_top') !== -1);
    let planQuery=subScriptionData && subScriptionData.length>0?" and ss.status='active' and ss.is_approved=1 ":" "



    let preparationTimeFilter = "";
    let FreeDeliveryFilter = "";
    
    if(parseInt(is_free_delivery)==1){
    
        preparationTimeFilter = " and s.is_free_delivery=1 ";
    
    }
    
    if(parseInt(min_preparation_time)!==0 && parseInt(max_preparation_time)!==0){
        FreeDeliveryFilter = " and MINUTE(s.preparation_time) >= '"+min_preparation_time+"' and MINUTE(s.preparation_time) <= '"+max_preparation_time+"'";
    }

    let open_close_filter = ""
    logger.debug("========offset======+",offset)
    let currentTime = moment().utcOffset(offset.toString());
    logger.debug("========currentTime======+",currentTime)
    currentTime = moment(currentTime).format('HH:mm:ss');
    logger.debug("========currentTime=====222=+",currentTime)

    if(parseInt(sort_by)==5){
        open_close_filter = "and st.is_open=1 and st.start_time<='"+currentTime+"' and st.end_time>='"+currentTime+"' "
    }else if(parseInt(sort_by)==6){
        let currentTime = moment().utcOffset(offset.toString());
        logger.debug("========currentTime======+",currentTime)

        currentTime = moment(currentTime).format('HH:mm:ss');
        logger.debug("========currentTime=====222=+",currentTime)
        open_close_filter = "and st.is_open=0 and st.start_time<='"+currentTime+"' and st.end_time>='"+currentTime+"' "
    }
    
    console.log('==========openclosefilter======',open_close_filter)
    return new Promise(async (resolve,reject)=>{
     
        if(dineInCheck && dineInCheck.length>0){
            logger.debug("=======dinecheck=====",dineInCheck,is_dine_in)
            if(parseInt(dineInCheck[0].value)===1 && parseInt(is_dine_in)==1){
                dinecheck = "and s.is_dine_in = "+is_dine_in+""
            }
        }
        logger.debug("======dinein check=======",dinecheck)
        console.log("=====self_pickup==before query======day==",self_pickup,day)

        let mUnit=await Universal.getMeausringUnit(dbName)
        let sqlForSubscribeSuppliers = ""
        if(tags==0){
            // let order_by_query = "order by  id desc"
            let order_by_query = "order by distance asc"
            if(parseInt(sort_by)==1){
                order_by_query = "order by distance asc"
            }else if(parseInt(sort_by)==2){
                order_by_query = "order by rating desc"
            }else if(parseInt(sort_by)==3){
                order_by_query = "order by name asc"
            }else if(parseInt(sort_by)==4){
                order_by_query = "order by name desc"
            }
            else{
                order_by_query = "order by id desc"
            }
                if(parseInt(categoryId)==0){
                    var sql = "select * from ( select s.self_pickup, si.image_path as supplier_image, sc.onOffComm,s.delivery_prior_total_time as delivery_prior_time, s.delivery_min_time, "
                    sql += " sb.latitude,sb.longitude,s.is_dine_in,s.delivery_max_time,s.is_scheduled,s.urgent_delivery_time,s.total_reviews, s.rating,sb.id as supplier_branch_id,sml.name,sml.description, "
                    sql += "s.preparation_time,IF(EXISTS(select id from user_favourite where supplier_id = s.id and user_id = "+user_id+" and is_delete = 0 ),1,0) as Favourite,s.is_sponser as is_multi_branch,s.delivery_radius,sml.uniqueness,sml.terms_and_conditions,sml.address, s.logo, s.id,st.is_open as status, st.start_time,st.end_time, "
                    sql += " s.payment_method, sc.commission_package, "
                    sql += "("+mUnit+" * acos (cos (radians("+latitude+"))* cos(radians(sb.latitude))* cos(radians(sb.longitude) - radians("+longitude+")) + sin (radians("+latitude+"))* sin(radians(sb.latitude)))) AS distance "
                    sql += "from supplier_category sc join supplier s on s.id = sc.supplier_id join supplier_timings st on st.supplier_id = s.id join supplier_branch sb on s.id = sb.supplier_id "
                    sql += "join supplier_ml sml on s.id = sml.supplier_id left join supplier_image si on si.supplier_id = s.id "
                    sql += "where sml.name like '%"+search+"%' "+preparationTimeFilter+" "+FreeDeliveryFilter+" and s.is_live = 1 "+dinecheck+" and(s.self_pickup="+self_pickup+" or s.self_pickup=2 or s.self_pickup=1 ) and s.is_active = 1 "+open_close_filter+" and s.is_deleted = 0 and sb.is_live = 1  and s.is_active = 1 and s.is_deleted = 0 and sb.is_live = 1 and sml.language_id = 14 and sb.is_deleted = 0 and st.week_id = ? "
                    // sql += "GROUP BY s.id having distance<=s.delivery_radius "+order_by_query+"  ) as sub"
                    sql += "GROUP BY s.id,sb.id having distance<=s.delivery_radius ) as sub group by id "+order_by_query+""
                
                    sqlForSubscribeSuppliers = "select * from ( select s.self_pickup, si.image_path as supplier_image, sc.onOffComm,s.delivery_prior_total_time as delivery_prior_time, s.delivery_min_time, "
                    sqlForSubscribeSuppliers += " sb.latitude,sb.longitude,s.is_dine_in,s.delivery_max_time,s.is_scheduled,s.urgent_delivery_time,s.total_reviews,IF(EXISTS(select id from user_favourite where supplier_id = s.id and user_id = "+user_id+" and is_delete = 0 ),1,0) as Favourite,s.is_sponser as is_multi_branch,s.rating,sb.id as supplier_branch_id,sml.name,sml.description, "
                    sqlForSubscribeSuppliers += "s.preparation_time,s.delivery_radius,sml.uniqueness,sml.terms_and_conditions,sml.address, s.logo, s.id,st.is_open as status, st.start_time,st.end_time, "
                    sqlForSubscribeSuppliers += " s.payment_method, sc.commission_package, "
                    sqlForSubscribeSuppliers += "("+mUnit+" * acos (cos (radians("+latitude+"))* cos(radians(sb.latitude))* cos(radians(sb.longitude) - radians("+longitude+")) + sin (radians("+latitude+"))* sin(radians(sb.latitude)))) AS distance "
                    sqlForSubscribeSuppliers += "from supplier_category sc join supplier s on s.id = sc.supplier_id join supplier_timings st on st.supplier_id = s.id join supplier_branch sb on s.id = sb.supplier_id "
                    sqlForSubscribeSuppliers += "join supplier_ml sml on s.id = sml.supplier_id left join supplier_image si on si.supplier_id = s.id join supplier_subscription ssn on ssn.supplier_id =s.id join subscription_plans sps on sps.id = ssn.plan_id "
                    // sqlForSubscribeSuppliers += "  join supplier_subscription ssb on ssb.supplier_id = s.id join subscription_plans sps on sps.id = ssb.plan_id "
                    sqlForSubscribeSuppliers += "where sml.name like '%"+search+"%' "+preparationTimeFilter+" "+FreeDeliveryFilter+"   and ssn.status = 'active' and sps.is_on_top_priority = 1 and s.is_live = 1 "+dinecheck+" and(s.self_pickup="+self_pickup+" or s.self_pickup=2 or s.self_pickup=1 ) and s.is_active = 1 "+open_close_filter+" and s.is_deleted = 0 and sb.is_live = 1  and s.is_active = 1 and s.is_deleted = 0 and sb.is_live = 1 and sml.language_id = 14 and sb.is_deleted = 0 and st.week_id = ? "
                    // sql += "GROUP BY s.id having distance<=s.delivery_radius "+order_by_query+"  ) as sub"
                    sqlForSubscribeSuppliers += "GROUP BY s.id,sb.id having distance<=s.delivery_radius ) as sub group by id  order by rand() limit 5"
                
                }
                else{
                    var sql = "select * from ( select s.self_pickup, si.image_path as supplier_image, sc.onOffComm,s.delivery_prior_total_time as delivery_prior_time, s.delivery_min_time, "
                    sql += " sb.latitude,sb.longitude,s.is_dine_in,s.delivery_max_time,s.is_scheduled,s.urgent_delivery_time,s.total_reviews, s.rating,sb.id as supplier_branch_id,sml.name,sml.description, "
                    sql += "s.preparation_time,IF(EXISTS(select id from user_favourite where supplier_id = s.id and user_id = "+user_id+" and is_delete = 0 ),1,0) as Favourite,s.is_sponser as is_multi_branch,s.delivery_radius,sml.uniqueness,sml.terms_and_conditions,sml.address, s.logo, s.id,st.is_open as status, st.start_time,st.end_time, "
                    sql += " s.payment_method, sc.commission_package, "
                    sql += "("+mUnit+" * acos (cos (radians("+latitude+"))* cos(radians(sb.latitude))* cos(radians(sb.longitude) - radians("+longitude+")) + sin (radians("+latitude+"))* sin(radians(sb.latitude)))) AS distance "
                    sql += "from supplier_category sc join supplier s on s.id = sc.supplier_id join categories ct on ct.id=sc.category_id join supplier_timings st on st.supplier_id = s.id join supplier_branch sb on s.id = sb.supplier_id "
                    sql += "join supplier_ml sml on s.id = sml.supplier_id left join supplier_image si on si.supplier_id = s.id "
                    sql += "where sml.name like '%"+search+"%' "+preparationTimeFilter+" "+FreeDeliveryFilter+"  and ct.id="+categoryId+" and s.is_live = 1 "+dinecheck+" and(s.self_pickup="+self_pickup+" or s.self_pickup=2 or s.self_pickup=1 ) and  s.is_active = 1 "+open_close_filter+"  and s.is_deleted = 0 and sb.is_live = 1  and s.is_active = 1 and s.is_deleted = 0 and sb.is_live = 1 and sml.language_id = 14 and sb.is_deleted = 0 and st.week_id = ? "
                    sql += "GROUP BY s.id,sb.id having distance<=s.delivery_radius order by s.id DESC ) as sub group by id "+order_by_query+""
                   
                    sqlForSubscribeSuppliers = "select *,if( count(*)>1,1,0) as is_multi_branch from ( select s.self_pickup, si.image_path as supplier_image, sc.onOffComm,s.delivery_prior_total_time as delivery_prior_time, s.delivery_min_time, "
                    sqlForSubscribeSuppliers += " sb.latitude,sb.longitude,s.is_dine_in,s.delivery_max_time,s.is_scheduled,s.urgent_delivery_time,s.total_reviews, s.rating,sb.id as supplier_branch_id,sml.name,sml.description, "
                    sqlForSubscribeSuppliers += "s.preparation_time,s.delivery_radius,sml.uniqueness,sml.terms_and_conditions,sml.address, s.logo, s.id,st.is_open as status, st.start_time,st.end_time, "
                    sqlForSubscribeSuppliers += " s.payment_method, sc.commission_package, "
                    sqlForSubscribeSuppliers += "("+mUnit+" * acos (cos (radians("+latitude+"))* cos(radians(sb.latitude))* cos(radians(sb.longitude) - radians("+longitude+")) + sin (radians("+latitude+"))* sin(radians(sb.latitude)))) AS distance "
                    sqlForSubscribeSuppliers += "from supplier_category sc join supplier s on s.id = sc.supplier_id join categories ct on ct.id=sc.category_id join supplier_timings st on st.supplier_id = s.id join supplier_branch sb on s.id = sb.supplier_id "
                    sqlForSubscribeSuppliers += "join supplier_ml sml on s.id = sml.supplier_id left join supplier_image si on si.supplier_id = s.id join supplier_subscription ssn on ssn.supplier_id =s.id join subscription_plans sps on sps.id = ssn.plan_id "
                    // sqlForSubscribeSuppliers += "  join supplier_subscription ssb on ssb.supplier_id = s.id join subscription_plans sps on sps.id = ssb.plan_id "
                    sqlForSubscribeSuppliers += "where sml.name like '%"+search+"%'  "+preparationTimeFilter+" "+FreeDeliveryFilter+"     and ssn.status = 'active' and sps.is_on_top_priority = 1 and ct.id="+categoryId+" and s.is_live = 1 "+dinecheck+" and(s.self_pickup="+self_pickup+" or s.self_pickup=2 or s.self_pickup=1 ) and  s.is_active = 1 "+open_close_filter+"  and s.is_deleted = 0 and sb.is_live = 1  and s.is_active = 1 and s.is_deleted = 0 and sb.is_live = 1 and sml.language_id = 14 and sb.is_deleted = 0 and st.week_id = ? "
                    sqlForSubscribeSuppliers += "GROUP BY s.id,sb.id having distance<=s.delivery_radius order by s.id DESC ) as sub group by id  order by rand() limit 5"
                
                }
    }
    else{
        if(parseInt(categoryId)==0){
            let order_by_query = ""
            if(parseInt(sort_by)==1){
                order_by_query = "order by distance asc"
            }else if(parseInt(sort_by)==2){
                order_by_query = "order by rating desc"
            }else if(parseInt(sort_by)==3){
                 order_by_query = "order by name asc"
            }else if(parseInt(sort_by)==4){
                order_by_query = "order by name desc"
            }
            else{
                order_by_query = "order by s.id desc"
                // order_by_query = "order by distance asc"
            }
            var sql = "select * from ( select s.self_pickup, si.image_path as supplier_image, sc.onOffComm,s.delivery_prior_total_time as delivery_prior_time, s.delivery_min_time, "
            sql += " sb.latitude,sb.longitude,IF(EXISTS(select id from user_favourite where supplier_id = s.id and user_id = "+user_id+" and is_delete = 0 ),1,0) as Favourite,s.is_sponser as is_multi_branch,s.is_dine_in,s.delivery_max_time,s.is_scheduled,s.urgent_delivery_time,s.total_reviews, s.rating,sb.id as supplier_branch_id,sml.name,sml.description, "
            sql += "s.preparation_time,s.delivery_radius,sml.uniqueness,sml.terms_and_conditions,sml.address, s.logo, s.id,st.is_open as status, st.start_time,st.end_time, "
            sql += " s.payment_method, sc.commission_package, "
            sql += "("+mUnit+" * acos (cos (radians("+latitude+"))* cos(radians(sb.latitude))* cos(radians(sb.longitude) - radians("+longitude+")) + sin (radians("+latitude+"))* sin(radians(sb.latitude)))) AS distance "
            sql += "from supplier_category sc join supplier s on s.id = sc.supplier_id join supplier_timings st on st.supplier_id = s.id join supplier_branch sb on s.id = sb.supplier_id "
            sql += "join supplier_ml sml on s.id = sml.supplier_id left join supplier_image si on si.supplier_id = s.id "
            sql += "where sml.name like '%"+search+"%' "+preparationTimeFilter+" "+FreeDeliveryFilter+" and s.is_live = 1 "+dinecheck+" and (s.self_pickup="+self_pickup+" or s.self_pickup=2 or s.self_pickup=1 or s.is_dine_in="+is_dine_in+")  "+open_close_filter+"  and sml.language_id = 14 and sb.is_deleted = 0 and st.week_id = ? "
            sql += "GROUP BY s.id having distance<=sb.delivery_radius "+order_by_query+" "
        
            sqlForSubscribeSuppliers = "select *,if( count(*)>1,1,0) as is_multi_branch from ( select s.self_pickup, si.image_path as supplier_image, sc.onOffComm,s.delivery_prior_total_time as delivery_prior_time, s.delivery_min_time, "
            sqlForSubscribeSuppliers += " sb.latitude,sb.longitude,s.is_dine_in,s.delivery_max_time,s.is_scheduled,s.urgent_delivery_time,s.total_reviews, s.rating,sb.id as supplier_branch_id,sml.name,sml.description, "
            sqlForSubscribeSuppliers += "s.preparation_time,s.delivery_radius,sml.uniqueness,sml.terms_and_conditions,sml.address, s.logo, s.id,st.is_open as status, st.start_time,st.end_time, "
            sqlForSubscribeSuppliers += " s.payment_method, sc.commission_package, "
            sqlForSubscribeSuppliers += "("+mUnit+" * acos (cos (radians("+latitude+"))* cos(radians(sb.latitude))* cos(radians(sb.longitude) - radians("+longitude+")) + sin (radians("+latitude+"))* sin(radians(sb.latitude)))) AS distance "
            sqlForSubscribeSuppliers += "from supplier_category sc join supplier s on s.id = sc.supplier_id join supplier_timings st on st.supplier_id = s.id join supplier_branch sb on s.id = sb.supplier_id "
            sqlForSubscribeSuppliers += "join supplier_ml sml on s.id = sml.supplier_id left join supplier_image si on si.supplier_id = s.id "
            sqlForSubscribeSuppliers += "  join supplier_subscription ssb on ssb.supplier_id = s.id join subscription_plans sps on sps.id = ssb.plan_id "
            sqlForSubscribeSuppliers += "where sml.name like '%"+search+"%'  "+preparationTimeFilter+" "+FreeDeliveryFilter+"     and ssb.status = 'active'  and sps.is_on_top_priority=1 and s.is_live = 1 "+dinecheck+" and (s.self_pickup="+self_pickup+" or s.self_pickup=2 or s.self_pickup=1 or s.is_dine_in="+is_dine_in+")  "+open_close_filter+"  and sml.language_id = 14 and sb.is_deleted = 0 and st.week_id = ? "
            sqlForSubscribeSuppliers += "GROUP BY s.id having distance<=sb.delivery_radius order by rand() limit 5 "
        
        }
        else{
            var sql = "select * from ( select s.self_pickup, si.image_path as supplier_image, sc.onOffComm,s.delivery_prior_total_time as delivery_prior_time, s.delivery_min_time, "
            sql += " sb.latitude,sb.longitude,s.delivery_max_time,s.urgent_delivery_time,s.is_scheduled,s.total_reviews, s.rating,sb.id as supplier_branch_id,sml.name,sml.description, "
            sql += "s.is_dine_in,s.preparation_time,s.delivery_radius,sml.uniqueness,sml.terms_and_conditions,sml.address,IF(EXISTS(select id from user_favourite where supplier_id = s.id and user_id = "+user_id+" and is_delete = 0 ),1,0) as Favourite,s.is_sponser as is_multi_branch,s.logo, s.id,st.is_open as status, st.start_time,st.end_time, "
            sql += " s.payment_method, sc.commission_package, "
            sql += "("+mUnit+" * acos (cos (radians("+latitude+"))* cos(radians(sb.latitude))* cos(radians(sb.longitude) - radians("+longitude+")) + sin (radians("+latitude+"))* sin(radians(sb.latitude)))) AS distance "
            sql += "from supplier_category sc join supplier s on s.id = sc.supplier_id join categories ct on ct.id=sc.category_id join supplier_timings st on st.supplier_id = s.id join supplier_branch sb on s.id = sb.supplier_id "
            sql += "join supplier_ml sml on s.id = sml.supplier_id left join supplier_image si on si.supplier_id = s.id "
            sql += "where sml.name like '%"+search+"%' "+preparationTimeFilter+" "+FreeDeliveryFilter+" and ct.id="+categoryId+" and s.is_live = 1 "+dinecheck+"  and  (s.self_pickup="+self_pickup+" or s.self_pickup=2 or s.self_pickup=1 or s.is_dine_in="+is_dine_in+") "+open_close_filter+"  and sml.language_id = 14 and sb.is_deleted = 0 and st.week_id = ? "
            sql += "GROUP BY s.id having distance<=sb.delivery_radius "+order_by_query+" "
       
            sqlForSubscribeSuppliers = "select *,if( count(*)>1,1,0) as is_multi_branch from ( select s.self_pickup, si.image_path as supplier_image, sc.onOffComm,s.delivery_prior_total_time as delivery_prior_time, s.delivery_min_time, "
            sqlForSubscribeSuppliers += " sb.latitude,sb.longitude,s.delivery_max_time,s.urgent_delivery_time,s.is_scheduled,s.total_reviews, s.rating,sb.id as supplier_branch_id,sml.name,sml.description, "
            sqlForSubscribeSuppliers += "s.is_dine_in,s.preparation_time,s.delivery_radius,sml.uniqueness,sml.terms_and_conditions,sml.address, s.logo, s.id,st.is_open as status, st.start_time,st.end_time, "
            sqlForSubscribeSuppliers += " s.payment_method, sc.commission_package, "
            sqlForSubscribeSuppliers += "("+mUnit+" * acos (cos (radians("+latitude+"))* cos(radians(sb.latitude))* cos(radians(sb.longitude) - radians("+longitude+")) + sin (radians("+latitude+"))* sin(radians(sb.latitude)))) AS distance "
            sqlForSubscribeSuppliers += "from supplier_category sc join supplier s on s.id = sc.supplier_id join categories ct on ct.id=sc.category_id join supplier_timings st on st.supplier_id = s.id join supplier_branch sb on s.id = sb.supplier_id "
            sqlForSubscribeSuppliers += "join supplier_ml sml on s.id = sml.supplier_id left join supplier_image si on si.supplier_id = s.id "
            sqlForSubscribeSuppliers += "  join supplier_subscription ssb on ssb.supplier_id = s.id join subscription_plans sps on sps.id = ssb.plan_id "
            sqlForSubscribeSuppliers += "where sml.name like '%"+search+"%'   "+preparationTimeFilter+" "+FreeDeliveryFilter+"    and ssb.status = 'active'  and sps.is_on_top_priority=1 and ct.id="+categoryId+" and s.is_live = 1 "+dinecheck+"  and  (s.self_pickup="+self_pickup+" or s.self_pickup=2 or s.self_pickup=1 or s.is_dine_in="+is_dine_in+") "+open_close_filter+"  and sml.language_id = 14 and sb.is_deleted = 0 and st.week_id = ? "
            sqlForSubscribeSuppliers += "GROUP BY s.id having distance<=sb.delivery_radius order by rand() limit 5 "
       
        }
    }
        try{
       
        logger.debug("=====ERR!=============1234556=",sql);
        let subscribedSupplierData = await ExecuteQ.Query(dbName,sqlForSubscribeSuppliers,[day]);
        
        let commonSuppliers = await ExecuteQ.Query(dbName,sql,[day]);
        
        let result = []

        if(subscribedSupplierData && subscribedSupplierData.length>0){
            logger.debug("=======subscribedSupplierData========",subscribedSupplierData)
            for(const [index,i] of subscribedSupplierData.entries()){
                i.is_subscribed = 1;
                result.push(i);
            }
        }

        if(commonSuppliers && commonSuppliers.length>0){
            logger.debug("=======commonSuppliers========",commonSuppliers)

            for(const [index,i] of commonSuppliers.entries()){
                if(subscribedSupplierData && subscribedSupplierData.length>0){
                    
                    let isSupplierAlreadyExist = subscribedSupplierData.find(x => x.id === parseInt(i.id))
                    if(isSupplierAlreadyExist==undefined){
                        i.is_subscribed = 0;
                        result.push(i)
                    }
                }else{
                    result.push(i);
                }
            }
        }
        
        // let result=await ExecuteQ.Query(dbName,sql,[day])

                //    var st=multiConnection[dbName].query(sql, [day], function (err, result) {
                //       logger.debug("=====ERR!=============1234556=",st.sql);
                //         if(err) {
                //                 reject(err)                           
                //         }
                //         else{
                            var data_length=result.length
                            if(data_length>0){

                            for(var i =0;i<data_length;i++){
                                (function(i){        
                                    supplierCategory(result[i].id,languageId,dbName,async function(err,catData){
                                        if(err){
                                            callback(err);
                                        }else{
                                            result[i].category = [];
                                            var leng = catData.length;
                                            for(var j = 0;j < leng;j++){
                                                (async function(j){
                                                    result[i].category.push(catData[j]);
                                                }(j));
                                            }
                                            //temp.push({supplier:supplierList[i],category:result});
                                            if(i == (data_length -1)){ 
                                                // let GOOGLE_API_KEY = await common.getGoogleApiKey(dbName);
                                                // let estimatedTimeInMinutes = 0;
                                                // for(const [index,i] of result.entries()){
                                                //     if (GOOGLE_API_KEY && GOOGLE_API_KEY.length > 0) {
                                                //         logger.debug("=====1==========")
                                                //         estimatedTimeInMinutes = await common.getEstimatedTime(dbName, GOOGLE_API_KEY,i.latitude,i.longitude,latitude, longitude);
                                                //     } else {
                                                //         logger.debug("=====2==========")
                                                //         let default_api_key = config.get("google_keys.google_map_key");
                                                //         estimatedTimeInMinutes = await common.getEstimatedTime(dbName,default_api_key,i.latitude,i.longitude,latitude, longitude)
                                                //     }
                                                //     i.travel_time = estimatedTimeInMinutes;
                                                // }                                              
                                                resolve(result)
                                            }
                                        }
                                    })
                                }(i));
                            }


                           
                        }
                        else{
                            resolve(result)
                        }
                    // }
                    // })
    }
    catch(Err){
        logger.debug("==Err!==",Err)
        reject(Err)
    }
            })
}


/**
 * @desc used for listing an supplier according to delivery area`s
 * @param {*Int} areaId 
 */
const SupAccToAreaV2 = async (req,tags,search,service_type,self_pickup,latitude,
    longitude,languageId,
    categoryId,dbName,sort_by,is_dine_in,offset,limit,skip,min_preparation_time,
    max_preparation_time)=>{
        // 3-for A->Z 4-For Z->A
        // let dineInCheck = await ExecuteQ.Query(dbName,"select key,value from ")



    let dinecheck = ""
    let keyData=await Universal.getKeysValue(["is_subscription_plan","is_table_booking","is_opening_on_top"],req.dbName);
    let subScriptionData=keyData.filter(item => item.key.indexOf('is_subscription_plan') !== -1);
    let dineInCheck =keyData.filter(item => item.key.indexOf('is_table_booking') !== -1);
    let onTopTiming=keyData.filter(item => item.key.indexOf('is_opening_on_top') !== -1);
    let planQuery=subScriptionData && subScriptionData.length>0?" and ss.status='active' and ss.is_approved=1 ":" "

    var day = moment().isoWeekday();
    day=day-1;
    logger.debug("=======is_dine_in=====",is_dine_in)

    let filter = req.query.filter!==undefined?req.query.filter:0;

    let open_close_filter = ""
    logger.debug("========offset======+",offset)
    let currentTime = moment().utcOffset(offset.toString());
    logger.debug("========currentTime======+",currentTime)
    currentTime = moment(currentTime).format('HH:mm:ss');
    logger.debug("========currentTime=====222=+",currentTime)
    let currentDate = moment().utcOffset(offset.toString());
    let currentUtcTime = moment().utcOffset(offset.toString());
    // logger.debug("========currentTime======+",currentTime)
    currentUtcTime = moment(currentUtcTime).format('HH:mm:ss');
    // logger.debug("========currentTime=====222=+",currentTime)
    const date = moment(currentDate).format("YYYY-MM-DD"); //
    let convertedDate=moment(date)
    const dayId = convertedDate.day()-1;
    logger.debug("==DayId==",dayId);
    
    

    let active_inactiveCheck =  await ExecuteQ.Query(req.dbName,
        "select `key`,value from tbl_setting where `key`=? and value='1' ",["active_inactive"])




    // req.query.active_inactive =1;
    let  active_inactive_filter ="and s.is_live = 1 ";
    if(active_inactiveCheck && active_inactiveCheck.length>0)
        active_inactive_filter = "and(s.is_live = 0 or  s.is_live = 1) ";
    


    
    if(parseInt(sort_by)==5){
        open_close_filter = "and st.is_open=1 and st.start_time<='"+currentTime+"' and st.end_time>='"+currentTime+"' "
    }else if(parseInt(sort_by)==6){
        let currentTime = moment().utcOffset(offset.toString());
        currentTime = moment(currentTime).format('HH:mm:ss');
        // logger.debug("========currentTime=====222=+",currentTime)
        open_close_filter = "and st.week_id="+dayId+" and ((st.start_time>'"+currentTime+"' and st.end_time>'"+currentTime+"') or (st.start_time<'"+currentTime+"' and st.end_time<'"+currentTime+"')) "


        // let currentTime = moment().utcOffset(offset.toString());
        // logger.debug("========currentTime======+",currentTime)

        // currentTime = moment(currentTime).format('HH:mm:ss');
        // logger.debug("========currentTime=====222=+",currentTime)
        // open_close_filter = "and st.is_open=0 and st.start_time<='"+currentTime+"' and st.end_time>='"+currentTime+"' "
    } 
    
    
    let is_free_delivery = req.query.is_free_delivery!==undefined?req.query.is_free_delivery:0;

    let preparationTimeFilter = "";
    let FreeDeliveryFilter = "";
    if(parseInt(is_free_delivery)==1){
    
        preparationTimeFilter = " and s.is_free_delivery=1 ";
    
    }
    
    if(parseInt(min_preparation_time)!==0 && parseInt(max_preparation_time)!==0){
        FreeDeliveryFilter = " and MINUTE(s.preparation_time) >= '"+min_preparation_time+"' and MINUTE(s.preparation_time) <= '"+max_preparation_time+"'";
    }

    console.log('==========openclosefilter======',open_close_filter)

    return new Promise(async (resolve,reject)=>{
        let user_id=await Universal.getUserId(req.headers.authorization,dbName);
        
        if(dineInCheck && dineInCheck.length>0){
            logger.debug("=======dinecheck=====",dineInCheck,is_dine_in)
            if(parseInt(dineInCheck[0].value)===1 && parseInt(is_dine_in)==1){
                dinecheck = "and s.is_dine_in = "+is_dine_in+""
            }
        }
        logger.debug("======dinein check=======",dinecheck)
        console.log("=====self_pickup==before query======day==",self_pickup,day)
        let selfPickupSql="s.self_pickup="+self_pickup+""
        let mUnit=await Universal.getMeausringUnit(dbName)
     
        let check_for_pagination = " limit ?,? ";
        
        if(tags==0){
            // let order_by_query = "order by  id desc"
            let order_by_query = "order by distance asc"
            if(parseInt(sort_by)==1){
                order_by_query = "order by distance asc"
            }else if(parseInt(sort_by)==2){
                order_by_query = "order by rating desc"
            }else if(parseInt(sort_by)==3){
                order_by_query = "order by name asc"
            }else if(parseInt(sort_by)==4){
                order_by_query = "order by name desc"
            }
            else{
                if(onTopTiming && onTopTiming.length>0){
                    order_by_query = "order by timing_flag desc"
                }
                else{
                    order_by_query = "order by id desc"
                }
            }
            
                if(parseInt(categoryId)==0){
                    
                    var sql="select temp.*,(select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"image\": \"', c.image, '\", ','\"supplier_placement_level\": \"', c.supplier_placement_level,'\", ','\"category_id\": \"', c.id,'\",','\"category_name\": \"',REPLACE(cml.name,'\"','\\''),'\",','\"description\": \"', REPLACE(cml.name,'\"','\\''),'\",','\"order\": \"', c.order, '\"','}') SEPARATOR ','),''),']') AS bData from categories c  JOIN categories_ml cml on cml.category_id=c.id where c.id IN (select supplier_category.category_id from supplier_category WHERE supplier_category.supplier_id=temp.id ) and cml.language_id="+languageId+" and c.is_live=1 and c.is_deleted=0 )  as categories,( select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"is_open\": \"', st.is_open, '\", ','\"week_id\": \"', st.week_id,'\", ','\"close_week_id\": \"', IFNULL(st.close_week_id,0),'\",','\"start_time\": \"', st.start_time,'\",','\"end_time\": \"', st.end_time, '\"','}') SEPARATOR ','),''),']') AS bData from  supplier_timings  st where st.supplier_id = temp.id  )  as timings,( select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"tag_image\": \"', st.tag_image, '\", ','\"id\": \"', st.id,'\", ','\"created_at\": \"', st.created_at, '\",','\"name\": \"', st.name, '\"','}') SEPARATOR ','),''),']') AS tData   from supplier_assigned_tags sa join supplier_tags st on st.id = sa.tag_id  where sa.supplier_id = temp.id )  as supplier_tags "
                    sql+= "from (select * from ( select "
                    sql+=" cc.id as category_id,cc.type,s.self_pickup,(select COUNT(id) from supplier_timings stp where  stp.is_open=1 and stp.start_time<='"+currentTime+"' and st.end_time>='"+currentTime+"' and stp.supplier_id=s.id and stp.week_id="+dayId+") as timing_flag,si.image_path as supplier_image, sc.onOffComm,s.delivery_prior_total_time as delivery_prior_time, s.delivery_min_time, "
                    sql += "s.preparation_time, sb.latitude,sb.longitude,s.is_dine_in,s.delivery_max_time,s.is_scheduled,s.urgent_delivery_time,IF(EXISTS(select id from user_favourite where supplier_id = s.id and user_id = "+user_id+" and is_delete = 0 ),1,0) as Favourite,s.is_sponser as is_multi_branch,s.total_reviews, s.rating,sb.id as supplier_branch_id,sml.name,sml.description, "
                    sql += "s.delivery_radius,sml.uniqueness,sml.terms_and_conditions,sml.address, s.logo, s.id,st.is_open as status, st.start_time,st.end_time, "
                    sql += " s.payment_method, sc.commission_package, "
                    sql += "("+mUnit+" * acos (cos (radians("+latitude+"))* cos(radians(sb.latitude))* cos(radians(sb.longitude) - radians("+longitude+")) + sin (radians("+latitude+"))* sin(radians(sb.latitude)))) AS distance "
                    sql += "from supplier_category sc join supplier s on s.id = sc.supplier_id join supplier_timings st on st.supplier_id = s.id join supplier_branch sb on s.id = sb.supplier_id "
                    sql += "  left join categories cc on cc.id = sc.category_id join supplier_ml sml on s.id = sml.supplier_id left join supplier_image si on si.supplier_id = s.id left join supplier_subscription ss on ss.supplier_id=s.id "
                    sql += "where sml.name like '%"+search+"%'  "+active_inactive_filter+" "+dinecheck+" and(s.self_pickup="+self_pickup+" or s.self_pickup=2 or s.self_pickup=4 or s.self_pickup=1) and s.is_active = 1 "+open_close_filter+" and s.is_deleted = 0 and sb.is_live = 1  and s.is_active = 1 and s.is_deleted = 0 and sb.is_live = 1 and sml.language_id = "+languageId+" and sb.is_deleted = 0 and st.week_id = ? "+planQuery+" "
                    // sql += "GROUP BY s.id having distance<=s.delivery_radius "+order_by_query+"  ) as sub"
                    sql += "GROUP BY s.id,sb.id having distance<=s.delivery_radius ) as sub group by id "+order_by_query+" "+check_for_pagination+") as temp"
                }
                else{

                    var sql="select temp.*,(select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"image\": \"', c.image, '\", ','\"supplier_placement_level\": \"', c.supplier_placement_level,'\", ','\"category_id\": \"', c.id,'\",','\"category_name\": \"',REPLACE(cml.name,'\"','\\''),'\",','\"description\": \"', REPLACE(cml.name,'\"','\\''),'\",','\"order\": \"', c.order, '\"','}') SEPARATOR ','),''),']') AS bData from categories c  JOIN categories_ml cml on cml.category_id=c.id where c.id IN (select supplier_category.category_id from supplier_category WHERE supplier_category.supplier_id=temp.id ) and cml.language_id="+languageId+" and c.is_live=1 and c.is_deleted=0 )  as categories,( select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"is_open\": \"', st.is_open, '\", ','\"week_id\": \"', st.week_id,'\", ','\"close_week_id\": \"', IFNULL(st.close_week_id,0),'\",','\"start_time\": \"', st.start_time,'\",','\"end_time\": \"', st.end_time, '\"','}') SEPARATOR ','),''),']') AS bData from  supplier_timings  st where st.supplier_id = temp.id  )  as timings,( select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"tag_image\": \"', st.tag_image, '\", ','\"id\": \"', st.id,'\", ','\"created_at\": \"', st.created_at,  '\",','\"name\": \"', st.name, '\"','}') SEPARATOR ','),''),']') AS tData   from supplier_assigned_tags sa join supplier_tags st on st.id = sa.tag_id  where sa.supplier_id = temp.id )  as supplier_tags "
                    sql+= "from (select * from ( select ct.id as category_id,ct.type,s.self_pickup, si.image_path as supplier_image,(select COUNT(id) from supplier_timings stp where  stp.is_open=1 and stp.start_time<='"+currentTime+"' and st.end_time>='"+currentTime+"' and stp.supplier_id=s.id and stp.week_id="+dayId+") as timing_flag, sc.onOffComm,s.delivery_prior_total_time as delivery_prior_time, s.delivery_min_time, "
                    sql += "s.preparation_time, sb.latitude,sb.longitude,s.is_dine_in,s.delivery_max_time,s.is_scheduled,s.urgent_delivery_time,IF(EXISTS(select id from user_favourite where supplier_id = s.id and user_id = "+user_id+" and is_delete = 0 ),1,0) as Favourite,s.is_sponser as is_multi_branch,s.total_reviews, s.rating,sb.id as supplier_branch_id,sml.name,sml.description, "
                    sql += "s.delivery_radius,sml.uniqueness,sml.terms_and_conditions,sml.address, s.logo, s.id,st.is_open as status, st.start_time,st.end_time, "
                    sql += " s.payment_method, sc.commission_package, "
                    sql += "("+mUnit+" * acos (cos (radians("+latitude+"))* cos(radians(sb.latitude))* cos(radians(sb.longitude) - radians("+longitude+")) + sin (radians("+latitude+"))* sin(radians(sb.latitude)))) AS distance "
                    sql += "from supplier_category sc join categories ct on ct.id=sc.category_id join supplier s on s.id = sc.supplier_id join supplier_timings st on st.supplier_id = s.id join supplier_branch sb on s.id = sb.supplier_id "
                    sql += "join supplier_ml sml on s.id = sml.supplier_id left join supplier_image si on si.supplier_id = s.id left join supplier_subscription ss on ss.supplier_id=s.id "
                    sql += "where sml.name like '%"+search+"%' "+active_inactive_filter+" and ct.id="+categoryId+"  "+dinecheck+" and(s.self_pickup="+self_pickup+" or s.self_pickup=2 or s.self_pickup=1 or s.self_pickup=4 ) and  s.is_active = 1 "+open_close_filter+"  and s.is_deleted = 0 and sb.is_live = 1  and s.is_active = 1 and s.is_deleted = 0 and sb.is_live = 1 and sml.language_id = "+languageId+" and sb.is_deleted = 0 and st.week_id = ? "+planQuery+" "
                    sql += "GROUP BY s.id,sb.id having distance<=s.delivery_radius order by s.id DESC ) as sub group by id "+order_by_query+" "+check_for_pagination+") as temp"
                }
    }
    else{
        if(parseInt(categoryId)==0){
            let order_by_query = ""
            if(parseInt(sort_by)==1){
                order_by_query = "order by distance asc"
            }else if(parseInt(sort_by)==2){
                order_by_query = "order by rating desc"
            }else if(parseInt(sort_by)==3){
                 order_by_query = "order by name asc"
            }else if(parseInt(sort_by)==4){
                order_by_query = "order by name desc"
            }
            else{
                if(onTopTiming && onTopTiming.length>0){
                    order_by_query = "order by timing_flag desc"
                }
                else{
                    order_by_query = "order by id desc"
                }
                // order_by_query = "order by distance asc"
            }

            var sql="select temp.*,(select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"image\": \"', c.image, '\", ','\"supplier_placement_level\": \"', c.supplier_placement_level,'\", ','\"category_id\": \"', c.id,'\",','\"category_name\": \"',REPLACE(cml.name,'\"','\\''),'\",','\"description\": \"', REPLACE(cml.name,'\"','\\''),'\",','\"order\": \"', c.order, '\"','}') SEPARATOR ','),''),']') AS bData from categories c  JOIN categories_ml cml on cml.category_id=c.id where c.id IN (select supplier_category.category_id from supplier_category WHERE supplier_category.supplier_id=temp.id ) and cml.language_id="+languageId+" and c.is_live=1 and c.is_deleted=0 )  as categories,( select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"is_open\": \"', st.is_open, '\", ','\"week_id\": \"', st.week_id,'\", ','\"close_week_id\": \"', IFNULL(st.close_week_id,0),'\",','\"start_time\": \"', st.start_time,'\",','\"end_time\": \"', st.end_time, '\"','}') SEPARATOR ','),''),']') AS bData from  supplier_timings  st where st.supplier_id = temp.id  )  as timings,( select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"tag_image\": \"', st.tag_image, '\", ','\"id\": \"', st.id,'\", ','\"created_at\": \"', st.created_at,  '\",','\"name\": \"', st.name, '\"','}') SEPARATOR ','),''),']') AS tData   from supplier_assigned_tags sa join supplier_tags st on st.id = sa.tag_id  where sa.supplier_id = temp.id )  as supplier_tags "

            sql+= "from (select * from ( select ct.id as category_id,ct.type,s.self_pickup, si.image_path as supplier_image,(select COUNT(id) from supplier_timings stp where  stp.is_open=1 and stp.start_time<='"+currentTime+"' and st.end_time>='"+currentTime+"' and stp.supplier_id=s.id and stp.week_id="+dayId+") as timing_flag,sc.onOffComm,s.delivery_prior_total_time as delivery_prior_time, s.delivery_min_time, "
            sql += "s.preparation_time, sb.latitude,sb.longitude,s.is_dine_in,s.delivery_max_time,s.is_scheduled,s.urgent_delivery_time,IF(EXISTS(select id from user_favourite where supplier_id = s.id and user_id = "+user_id+" and is_delete = 0 ),1,0) as Favourite,s.is_sponser as is_multi_branch,s.total_reviews, s.rating,sb.id as supplier_branch_id,sml.name,sml.description, "
            sql += "s.delivery_radius,sml.uniqueness,sml.terms_and_conditions,sml.address, s.logo, s.id,st.is_open as status, st.start_time,st.end_time, "
            sql += " s.payment_method, sc.commission_package, "
            sql += "("+mUnit+" * acos (cos (radians("+latitude+"))* cos(radians(sb.latitude))* cos(radians(sb.longitude) - radians("+longitude+")) + sin (radians("+latitude+"))* sin(radians(sb.latitude)))) AS distance "
            sql += "from supplier_category sc join categories ct on ct.id=sc.category_id join supplier s on s.id = sc.supplier_id join supplier_timings st on st.supplier_id = s.id join supplier_branch sb on s.id = sb.supplier_id "
            sql += "join supplier_ml sml on s.id = sml.supplier_id left join supplier_image si on si.supplier_id = s.id left join supplier_subscription ss on ss.supplier_id=s.id "
            sql += "where sml.name like '%"+search+"%' "+active_inactive_filter+" "+dinecheck+" and (s.self_pickup="+self_pickup+" or s.self_pickup=1 or s.self_pickup=2 or s.self_pickup=4 or s.is_dine_in="+is_dine_in+")  "+open_close_filter+"  and sml.language_id = "+languageId+" and sb.is_deleted = 0 and st.week_id = ? "+planQuery+" "
            sql += "GROUP BY s.id having distance<=sb.delivery_radius "+order_by_query+" "+check_for_pagination+") as temp"
        }
        else{
            var sql="select temp.*,(select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"image\": \"', c.image, '\", ','\"supplier_placement_level\": \"', c.supplier_placement_level,'\", ','\"category_id\": \"', c.id,'\",','\"category_name\": \"',REPLACE(cml.name,'\"','\\''),'\",','\"description\": \"', REPLACE(cml.name,'\"','\\''),'\",','\"order\": \"', c.order, '\"','}') SEPARATOR ','),''),']') AS bData from categories c  JOIN categories_ml cml on cml.category_id=c.id where c.id IN (select supplier_category.category_id from supplier_category WHERE supplier_category.supplier_id=temp.id ) and cml.language_id="+languageId+" and c.is_live=1 and c.is_deleted=0 )  as categories,( select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"is_open\": \"', st.is_open, '\", ','\"week_id\": \"', st.week_id,'\", ','\"close_week_id\": \"', IFNULL(st.close_week_id,0),'\",','\"start_time\": \"', st.start_time,'\",','\"end_time\": \"', st.end_time, '\"','}') SEPARATOR ','),''),']') AS bData from  supplier_timings  st where st.supplier_id = temp.id  )  as timings,( select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"tag_image\": \"', st.tag_image, '\", ','\"id\": \"', st.id,'\", ','\"created_at\": \"', st.created_at,  '\",','\"name\": \"', st.name, '\"','}') SEPARATOR ','),''),']') AS tData   from supplier_assigned_tags sa join supplier_tags st on st.id = sa.tag_id  where sa.supplier_id = temp.id )  as supplier_tags "
            sql+= "from (select * from ( select ct.id as category_id,ct.type,s.self_pickup, si.image_path as supplier_image,(select COUNT(id) from supplier_timings stp where  stp.is_open=1 and stp.start_time<='"+currentTime+"' and st.end_time>='"+currentTime+"' and stp.supplier_id=s.id and stp.week_id="+dayId+") as timing_flag,sc.onOffComm,s.delivery_prior_total_time as delivery_prior_time, s.delivery_min_time, "
            sql += "s.preparation_time, sb.latitude,sb.longitude,s.delivery_max_time,s.urgent_delivery_time,s.is_scheduled,s.total_reviews,IF(EXISTS(select id from user_favourite where supplier_id = s.id and user_id = "+user_id+" and is_delete = 0 ),1,0) as Favourite,s.is_sponser as is_multi_branch,s.rating,sb.id as supplier_branch_id,sml.name,sml.description, "
            sql += " cc.type, s.is_dine_in,s.delivery_radius,sml.uniqueness,sml.terms_and_conditions,sml.address, s.logo, s.id,st.is_open as status, st.start_time,st.end_time, "
            sql += " s.payment_method, sc.commission_package, "
            sql += "("+mUnit+" * acos (cos (radians("+latitude+"))* cos(radians(sb.latitude))* cos(radians(sb.longitude) - radians("+longitude+")) + sin (radians("+latitude+"))* sin(radians(sb.latitude)))) AS distance "
            sql += "from supplier_category sc join supplier s on s.id = sc.supplier_id join categories ct on ct.id=sc.category_id join supplier_timings st on st.supplier_id = s.id join supplier_branch sb on s.id = sb.supplier_id "
            sql += "  left join categories cc on cc.id = sc.category_id join supplier_ml sml on s.id = sml.supplier_id left join supplier_image si on si.supplier_id = s.id left join supplier_subscription ss on ss.supplier_id=s.id "
            sql += "where sml.name like '%"+search+"%' and ct.id="+categoryId+"  "+active_inactive_filter+" "+dinecheck+"  and  (s.self_pickup=1 or s.self_pickup="+self_pickup+" or s.self_pickup=2  or or s.self_pickup=4 s.is_dine_in="+is_dine_in+") "+open_close_filter+"  and sml.language_id = "+languageId+" and sb.is_deleted = 0 and st.week_id = ? "+planQuery+" "
            sql += "GROUP BY s.id having distance<=sb.delivery_radius "+order_by_query+" "+check_for_pagination+") as temp "
        }
    }
        try{
       
                    // logger.debug("=========sql===",sql);
                    let result=await ExecuteQ.Query(dbName,sql,[day,skip,limit])
                    let total_count_query = sql.replace("limit ?,?"," ")
                    let result_count=await ExecuteQ.Query(dbName,total_count_query,[day])
                    logger.debug("====result==result===result===",result);

                            var data_length=result.length
                            if(data_length>0){
                                let catData = [];
                            for(var i =0;i<data_length;i++){
                                (function(i){ 
                                        logger.debug("=====",result[i].categories)
                                        catData=result[i].categories
                                        result[i].category =result[i] && result[i].categories?JSON.parse(catData):[];
                                        result[i].timing =result[i] && result[i].timings?JSON.parse(result[i].timings):[];
                                        result[i].supplier_tags=result[i] && result[i].supplier_tags?JSON.parse(result[i].supplier_tags):[]
                                        if(i == (data_length -1)){    
                                            let final = {
                                                list : result,
                                                count : result_count && result_count.length>0?result_count.length:0
                                            }                 
                                            resolve(final)
                                        }
                                }(i));
                                catData = [];
                            }
                        }
                        else{
                            let final = {
                                list : result,
                                count:0
                            }
                            resolve(final)
                        }
                 
    }
    catch(Err){
        logger.debug("==Err!==",Err)
        reject(Err)
    }
            })

        }



/**
 * @desc used for listing an supplier according to zones
 * @param {*Int} areaId 
 */

const SupAccToAreaV3 = (req,tags,search,service_type,self_pickup,latitude,
    longitude,languageId,categoryId,dbName,
    sort_by,is_dine_in,offset,limit,skip,user_id)=>{
        // 3-for A->Z 4-For Z->A
        // let dineInCheck = await ExecuteQ.Query(dbName,"select key,value from ")

    var day = moment().isoWeekday();
    day=day-1;
    logger.debug("=======is_dine_in=====",is_dine_in)


    let open_close_filter = ""
    logger.debug("========offset======+",offset)
    let currentTime = moment().utcOffset(offset.toString());
    logger.debug("========currentTime======+",currentTime)
    currentTime = moment(currentTime).format('HH:mm:ss');
    logger.debug("========currentTime=====222=+",currentTime)
    let currentDate = moment().utcOffset(offset.toString());
    let currentUtcTime = moment().utcOffset(offset.toString());
    // logger.debug("========currentTime======+",currentTime)
    currentUtcTime = moment(currentUtcTime).format('HH:mm:ss');
    // logger.debug("========currentTime=====222=+",currentTime)
    const date = moment(currentDate).format("YYYY-MM-DD"); //
    let convertedDate=moment(date)
    const dayId = convertedDate.day()-1;
    logger.debug("==DayId==",dayId);
    

    if(parseInt(sort_by)==5){
        open_close_filter = "and st.is_open=1 and st.start_time<='"+currentTime+"' and st.end_time>='"+currentTime+"' "
    }else if(parseInt(sort_by)==6){
        let currentTime = moment().utcOffset(offset.toString());
        logger.debug("========currentTime======+",currentTime)

        currentTime = moment(currentTime).format('HH:mm:ss');
        logger.debug("========currentTime=====222=+",currentTime)
        open_close_filter = "and st.is_open=0 and st.start_time<='"+currentTime+"' and st.end_time>='"+currentTime+"' "
    }
    console.log('==========openclosefilter======',open_close_filter)

    return new Promise(async (resolve,reject)=>{
        let dinecheck = ""
        let dineInCheck = await ExecuteQ.Query(dbName,"select `key`,value from tbl_setting where `key`=? ",["is_table_booking"]);
        
        if(dineInCheck && dineInCheck.length>0){
            logger.debug("=======dinecheck=====",dineInCheck,is_dine_in)
            if(parseInt(dineInCheck[0].value)===1 && parseInt(is_dine_in)==1){
                dinecheck = "and s.is_dine_in = "+is_dine_in+""
            }
        }
        logger.debug("======dinein check=======",dinecheck)
        console.log("=====self_pickup==before query======day==",self_pickup,day)

        let mUnit=await Universal.getMeausringUnit(dbName)
        let onTopTiming=await ExecuteQ.Query(dbName,"select `key`,value from tbl_setting where `key`=? and `value`=? ",["is_opening_on_top","1"]);

        let check_for_pagination = " limit ?,? ";

        let zone_condition = " and ";
        
        if(tags==0){
            // let order_by_query = "order by  id desc"
            let order_by_query = "order by distance asc"
            if(parseInt(sort_by)==1){
                order_by_query = "order by distance asc"
            }else if(parseInt(sort_by)==2){
                order_by_query = "order by rating desc"
            }else if(parseInt(sort_by)==3){
                order_by_query = "order by name asc"
            }else if(parseInt(sort_by)==4){
                order_by_query = "order by name desc"
            }
            else{
                if(onTopTiming && onTopTiming.length>0){
                    order_by_query = "order by timing_flag desc"
                }
                else{
                    order_by_query = "order by sequence_no desc"
                }
            }
                 order_by_query = "order by sequence_no desc"
                if(parseInt(categoryId)==0){
                    
                    var sql="select temp.*,(select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"image\": \"', c.image, '\", ','\"supplier_placement_level\": \"', c.supplier_placement_level,'\", ','\"category_id\": \"', c.id,'\",','\"category_name\": \"',REPLACE(cml.name,'\"','\\''),'\",','\"description\": \"', REPLACE(cml.name,'\"','\\''),'\",','\"order\": \"', c.order, '\"','}') SEPARATOR ','),''),']') AS bData from categories c  JOIN categories_ml cml on cml.category_id=c.id where c.id IN (select supplier_category.category_id from supplier_category WHERE supplier_category.supplier_id=temp.id ) and cml.language_id=14 and c.is_live=1 and c.is_deleted=0 )  as categories,( select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"is_open\": \"', st.is_open, '\", ','\"week_id\": \"', st.week_id,'\", ','\"close_week_id\": \"', IFNULL(st.close_week_id,0),'\",','\"start_time\": \"', st.start_time,'\",','\"end_time\": \"', st.end_time, '\"','}') SEPARATOR ','),''),']') AS bData from  supplier_timings  st where st.supplier_id = temp.id  )  as timings,( select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"tag_image\": \"', st.tag_image, '\", ','\"id\": \"', st.id,'\", ','\"created_at\": \"', st.created_at, '\",','\"name\": \"', st.name, '\"','}') SEPARATOR ','),''),']') AS tData   from supplier_assigned_tags sa join supplier_tags st on st.id = sa.tag_id  where sa.supplier_id = temp.id )  as supplier_tags "
                    sql+= "from (select * from ( select "
                    sql+=" cc.id as category_id,cc.type,s.self_pickup,(select COUNT(id) from supplier_timings stp where  stp.is_open=1 and stp.start_time<='"+currentTime+"' and st.end_time>='"+currentTime+"' and stp.supplier_id=s.id and stp.week_id="+dayId+") as timing_flag,si.image_path as supplier_image, sc.onOffComm,s.delivery_prior_total_time as delivery_prior_time, s.delivery_min_time, "
                    sql += " s.sequence_no,s.preparation_time, sb.latitude,sb.longitude,s.is_dine_in,s.delivery_max_time,s.is_scheduled,s.urgent_delivery_time,IF(EXISTS(select id from user_favourite where supplier_id = s.id and user_id = "+user_id+" and is_delete = 0 ),1,0) as Favourite,s.is_sponser as is_multi_branch,s.total_reviews, s.rating,sb.id as supplier_branch_id,sml.name,sml.description, "
                    
                    sql += "IF((select st_contains(coordinates,point("+latitude+","+longitude+")) as is_under from 	admin_geofence_areas aga join supplier_assigned_geofence_areas saga on saga.admin_geofence_id=aga.id where aga.is_live=1 and saga.supplier_id = s.id having is_under>0 limit 1)>0,1,0) as is_under_zone,"
                    
                    sql += "s.delivery_radius,sml.uniqueness,sml.terms_and_conditions,sml.address, s.logo, s.id,st.is_open as status, st.start_time,st.end_time, "
                    sql += " s.payment_method, sc.commission_package, "
                    sql += "("+mUnit+" * acos (cos (radians("+latitude+"))* cos(radians(sb.latitude))* cos(radians(sb.longitude) - radians("+longitude+")) + sin (radians("+latitude+"))* sin(radians(sb.latitude)))) AS distance "
                    sql += "from supplier_category sc join supplier s on s.id = sc.supplier_id join supplier_timings st on st.supplier_id = s.id join supplier_branch sb on s.id = sb.supplier_id "
                    sql += "  left join categories cc on cc.id = sc.category_id join supplier_ml sml on s.id = sml.supplier_id left join supplier_image si on si.supplier_id = s.id "
                    sql += "where sml.name like '%"+search+"%' and s.is_live = 1 "+dinecheck+" and(s.self_pickup="+self_pickup+" or s.self_pickup=2  ) and s.is_active = 1 "+open_close_filter+" and s.is_deleted = 0 and sb.is_live = 1  and s.is_active = 1 and s.is_deleted = 0 and sb.is_live = 1 and sml.language_id = 14 and sb.is_deleted = 0 and st.week_id = ? "
                    // sql += "GROUP BY s.id having distance<=s.delivery_radius "+order_by_query+"  ) as sub"
                    sql += "GROUP BY s.id,sb.id having is_under_zone>0 ) as sub group by id "+order_by_query+" "+check_for_pagination+") as temp"
                }
                else{

                    var sql="select temp.*,(select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"image\": \"', c.image, '\", ','\"supplier_placement_level\": \"', c.supplier_placement_level,'\", ','\"category_id\": \"', c.id,'\",','\"category_name\": \"',REPLACE(cml.name,'\"','\\''),'\",','\"description\": \"', REPLACE(cml.name,'\"','\\''),'\",','\"order\": \"', c.order, '\"','}') SEPARATOR ','),''),']') AS bData from categories c  JOIN categories_ml cml on cml.category_id=c.id where c.id IN (select supplier_category.category_id from supplier_category WHERE supplier_category.supplier_id=temp.id ) and cml.language_id=14 and c.is_live=1 and c.is_deleted=0 )  as categories,( select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"is_open\": \"', st.is_open, '\", ','\"week_id\": \"', st.week_id,'\", ','\"close_week_id\": \"', IFNULL(st.close_week_id,0),'\",','\"start_time\": \"', st.start_time,'\",','\"end_time\": \"', st.end_time, '\"','}') SEPARATOR ','),''),']') AS bData from  supplier_timings  st where st.supplier_id = temp.id  )  as timings,( select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"tag_image\": \"', st.tag_image, '\", ','\"id\": \"', st.id,'\", ','\"created_at\": \"', st.created_at,  '\",','\"name\": \"', st.name, '\"','}') SEPARATOR ','),''),']') AS tData   from supplier_assigned_tags sa join supplier_tags st on st.id = sa.tag_id  where sa.supplier_id = temp.id )  as supplier_tags "
                    sql+= "from (select * from ( select ct.id as category_id,ct.type,s.self_pickup, si.image_path as supplier_image,(select COUNT(id) from supplier_timings stp where  stp.is_open=1 and stp.start_time<='"+currentTime+"' and st.end_time>='"+currentTime+"' and stp.supplier_id=s.id and stp.week_id="+dayId+") as timing_flag, sc.onOffComm,s.delivery_prior_total_time as delivery_prior_time, s.delivery_min_time, "
                    sql += "s.sequence_no,s.preparation_time, sb.latitude,sb.longitude,s.is_dine_in,s.delivery_max_time,s.is_scheduled,s.urgent_delivery_time,IF(EXISTS(select id from user_favourite where supplier_id = s.id and user_id = "+user_id+" and is_delete = 0 ),1,0) as Favourite,s.is_sponser as is_multi_branch,s.total_reviews, s.rating,sb.id as supplier_branch_id,sml.name,sml.description, "
                    sql += "s.delivery_radius,sml.uniqueness,sml.terms_and_conditions,sml.address, s.logo, s.id,st.is_open as status, st.start_time,st.end_time, "
                    sql += "IF((select st_contains(coordinates,point("+latitude+","+longitude+")) as is_under from 	admin_geofence_areas aga join supplier_assigned_geofence_areas saga on saga.admin_geofence_id=aga.id where aga.is_live=1 and saga.supplier_id = s.id having is_under>0 limit 1)>0,1,0) as is_under_zone,"

                    sql += " s.payment_method, sc.commission_package, "
                    sql += "("+mUnit+" * acos (cos (radians("+latitude+"))* cos(radians(sb.latitude))* cos(radians(sb.longitude) - radians("+longitude+")) + sin (radians("+latitude+"))* sin(radians(sb.latitude)))) AS distance "
                    sql += "from supplier_category sc join categories ct on ct.id=sc.category_id join supplier s on s.id = sc.supplier_id join supplier_timings st on st.supplier_id = s.id join supplier_branch sb on s.id = sb.supplier_id "
                    sql += "join supplier_ml sml on s.id = sml.supplier_id left join supplier_image si on si.supplier_id = s.id "
                    sql += "where sml.name like '%"+search+"%' and ct.id="+categoryId+" and s.is_live = 1 "+dinecheck+" and(s.self_pickup="+self_pickup+" or s.self_pickup=2  ) and  s.is_active = 1 "+open_close_filter+"  and s.is_deleted = 0 and sb.is_live = 1  and s.is_active = 1 and s.is_deleted = 0 and sb.is_live = 1 and sml.language_id = 14 and sb.is_deleted = 0 and st.week_id = ? "
                    sql += "GROUP BY s.id,sb.id having is_under_zone>0  order by s.id DESC ) as sub group by id "+order_by_query+" "+check_for_pagination+") as temp"
                }
    }
    else{
        if(parseInt(categoryId)==0){
            let order_by_query = ""
            if(parseInt(sort_by)==1){
                order_by_query = "order by distance asc"
            }else if(parseInt(sort_by)==2){
                order_by_query = "order by rating desc"
            }else if(parseInt(sort_by)==3){
                 order_by_query = "order by name asc"
            }else if(parseInt(sort_by)==4){
                order_by_query = "order by name desc"
            }
            else{
                if(onTopTiming && onTopTiming.length>0){
                    order_by_query = "order by timing_flag desc"
                }
                else{
                    order_by_query = "order by sequence_no desc"
                }
                // order_by_query = "order by distance asc"
            }
            order_by_query = "order by sequence_no desc";
            var sql="select temp.*,(select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"image\": \"', c.image, '\", ','\"supplier_placement_level\": \"', c.supplier_placement_level,'\", ','\"category_id\": \"', c.id,'\",','\"category_name\": \"',REPLACE(cml.name,'\"','\\''),'\",','\"description\": \"', REPLACE(cml.name,'\"','\\''),'\",','\"order\": \"', c.order, '\"','}') SEPARATOR ','),''),']') AS bData from categories c  JOIN categories_ml cml on cml.category_id=c.id where c.id IN (select supplier_category.category_id from supplier_category WHERE supplier_category.supplier_id=temp.id ) and cml.language_id=14 and c.is_live=1 and c.is_deleted=0 )  as categories,( select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"is_open\": \"', st.is_open, '\", ','\"week_id\": \"', st.week_id,'\", ','\"close_week_id\": \"', IFNULL(st.close_week_id,0),'\",','\"start_time\": \"', st.start_time,'\",','\"end_time\": \"', st.end_time, '\"','}') SEPARATOR ','),''),']') AS bData from  supplier_timings  st where st.supplier_id = temp.id  )  as timings,( select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"tag_image\": \"', st.tag_image, '\", ','\"id\": \"', st.id,'\", ','\"created_at\": \"', st.created_at,  '\",','\"name\": \"', st.name, '\"','}') SEPARATOR ','),''),']') AS tData   from supplier_assigned_tags sa join supplier_tags st on st.id = sa.tag_id  where sa.supplier_id = temp.id )  as supplier_tags "

            sql+= "from (select * from ( select ct.id as category_id,ct.type,s.self_pickup, si.image_path as supplier_image,(select COUNT(id) from supplier_timings stp where  stp.is_open=1 and stp.start_time<='"+currentTime+"' and st.end_time>='"+currentTime+"' and stp.supplier_id=s.id and stp.week_id="+dayId+") as timing_flag,sc.onOffComm,s.delivery_prior_total_time as delivery_prior_time, s.delivery_min_time, "
            sql += "s.sequence_no,s.preparation_time, sb.latitude,sb.longitude,s.is_dine_in,s.delivery_max_time,s.is_scheduled,s.urgent_delivery_time,IF(EXISTS(select id from user_favourite where supplier_id = s.id and user_id = "+user_id+" and is_delete = 0 ),1,0) as Favourite,s.is_sponser as is_multi_branch,s.total_reviews, s.rating,sb.id as supplier_branch_id,sml.name,sml.description, "
            sql += "s.delivery_radius,sml.uniqueness,sml.terms_and_conditions,sml.address, s.logo, s.id,st.is_open as status, st.start_time,st.end_time, "
            sql += "IF((select st_contains(coordinates,point("+latitude+","+longitude+")) as is_under from 	admin_geofence_areas aga join supplier_assigned_geofence_areas saga on saga.admin_geofence_id=aga.id where aga.is_live=1 and saga.supplier_id = s.id having is_under>0 limit 1)>0,1,0) as is_under_zone,"

            sql += " s.payment_method, sc.commission_package, "
            sql += "("+mUnit+" * acos (cos (radians("+latitude+"))* cos(radians(sb.latitude))* cos(radians(sb.longitude) - radians("+longitude+")) + sin (radians("+latitude+"))* sin(radians(sb.latitude)))) AS distance "
            sql += "from supplier_category sc join categories ct on ct.id=sc.category_id join supplier s on s.id = sc.supplier_id join supplier_timings st on st.supplier_id = s.id join supplier_branch sb on s.id = sb.supplier_id "
            sql += "join supplier_ml sml on s.id = sml.supplier_id left join supplier_image si on si.supplier_id = s.id "
            sql += "where sml.name like '%"+search+"%' and s.is_live = 1 "+dinecheck+" and (s.self_pickup="+self_pickup+" or s.self_pickup=2  or s.is_dine_in="+is_dine_in+")  "+open_close_filter+"  and sml.language_id = 14 and sb.is_deleted = 0 and st.week_id = ? "
            sql += "GROUP BY s.id having is_under_zone>0  "+order_by_query+" "+check_for_pagination+") as temp"
        }
        else{
            var sql="select temp.*,(select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"image\": \"', c.image, '\", ','\"supplier_placement_level\": \"', c.supplier_placement_level,'\", ','\"category_id\": \"', c.id,'\",','\"category_name\": \"',REPLACE(cml.name,'\"','\\''),'\",','\"description\": \"', REPLACE(cml.name,'\"','\\''),'\",','\"order\": \"', c.order, '\"','}') SEPARATOR ','),''),']') AS bData from categories c  JOIN categories_ml cml on cml.category_id=c.id where c.id IN (select supplier_category.category_id from supplier_category WHERE supplier_category.supplier_id=temp.id ) and cml.language_id=14 and c.is_live=1 and c.is_deleted=0 )  as categories,( select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"is_open\": \"', st.is_open, '\", ','\"week_id\": \"', st.week_id,'\", ','\"close_week_id\": \"', IFNULL(st.close_week_id,0),'\",','\"start_time\": \"', st.start_time,'\",','\"end_time\": \"', st.end_time, '\"','}') SEPARATOR ','),''),']') AS bData from  supplier_timings  st where st.supplier_id = temp.id  )  as timings,( select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"tag_image\": \"', st.tag_image, '\", ','\"id\": \"', st.id,'\", ','\"created_at\": \"', st.created_at,  '\",','\"name\": \"', st.name, '\"','}') SEPARATOR ','),''),']') AS tData   from supplier_assigned_tags sa join supplier_tags st on st.id = sa.tag_id  where sa.supplier_id = temp.id )  as supplier_tags "
            sql+= "from (select * from ( select ct.id as category_id,ct.type,s.self_pickup, si.image_path as supplier_image,(select COUNT(id) from supplier_timings stp where  stp.is_open=1 and stp.start_time<='"+currentTime+"' and st.end_time>='"+currentTime+"' and stp.supplier_id=s.id and stp.week_id="+dayId+") as timing_flag,sc.onOffComm,s.delivery_prior_total_time as delivery_prior_time, s.delivery_min_time, "
            sql += "s.sequence_no,s.preparation_time, sb.latitude,sb.longitude,s.delivery_max_time,s.urgent_delivery_time,s.is_scheduled,s.total_reviews,IF(EXISTS(select id from user_favourite where supplier_id = s.id and user_id = "+user_id+" and is_delete = 0 ),1,0) as Favourite,s.is_sponser as is_multi_branch,s.rating,sb.id as supplier_branch_id,sml.name,sml.description, "
            sql += " cc.type, s.is_dine_in,s.delivery_radius,sml.uniqueness,sml.terms_and_conditions,sml.address, s.logo, s.id,st.is_open as status, st.start_time,st.end_time, "
            sql += "IF((select st_contains(coordinates,point("+latitude+","+longitude+")) as is_under from 	admin_geofence_areas aga join supplier_assigned_geofence_areas saga on saga.admin_geofence_id=aga.id where aga.is_live=1 and saga.supplier_id = s.id having is_under>0 limit 1)>0,1,0) as is_under_zone,"

            sql += " s.payment_method, sc.commission_package, "
            sql += "("+mUnit+" * acos (cos (radians("+latitude+"))* cos(radians(sb.latitude))* cos(radians(sb.longitude) - radians("+longitude+")) + sin (radians("+latitude+"))* sin(radians(sb.latitude)))) AS distance "
            sql += "from supplier_category sc join supplier s on s.id = sc.supplier_id join categories ct on ct.id=sc.category_id join supplier_timings st on st.supplier_id = s.id join supplier_branch sb on s.id = sb.supplier_id "
            sql += "  left join categories cc on cc.id = sc.category_id join supplier_ml sml on s.id = sml.supplier_id left join supplier_image si on si.supplier_id = s.id "
            sql += "where sml.name like '%"+search+"%' and ct.id="+categoryId+" and s.is_live = 1 "+dinecheck+"  and  (s.self_pickup="+self_pickup+" or s.self_pickup=2  or s.is_dine_in="+is_dine_in+") "+open_close_filter+"  and sml.language_id = 14 and sb.is_deleted = 0 and st.week_id = ? "
            sql += "GROUP BY s.id having is_under_zone>0  "+order_by_query+" "+check_for_pagination+") as temp "
        }
    }
        try{
       
                    // logger.debug("=========sql===",sql);
                    let result=await ExecuteQ.Query(dbName,sql,[day,skip,limit])
                    let total_count_query = sql.replace("limit ?,?"," ")
                    let result_count=await ExecuteQ.Query(dbName,total_count_query,[day])
                    logger.debug("====result==result===result===",result);

                            var data_length=result.length
                            if(data_length>0){
                                let catData = [];
                            for(var i =0;i<data_length;i++){
                                (function(i){ 
                                        logger.debug("=====",result[i].categories)
                                        catData=result[i].categories
                                        result[i].category =result[i] && result[i].categories?JSON.parse(catData):[];
                                        result[i].timing =result[i] && result[i].timings?JSON.parse(result[i].timings):[];
                                        result[i].supplier_tags=result[i] && result[i].supplier_tags?JSON.parse(result[i].supplier_tags):[]
                                        if(i == (data_length -1)){    
                                            let final = {
                                                list : result,
                                                count : result_count && result_count.length>0?result_count.length:0
                                            }                 
                                            resolve(final)
                                        }
                                }(i));
                                catData = [];
                            }
                        }
                        else{
                            let final = {
                                list : result,
                                count:0
                            }
                            resolve(final)
                        }
                 
    }
    catch(Err){
        logger.debug("==Err!==",Err)
        reject(Err)
    }
            })

}





/**
 * @desc used for listing an supplier according to delivery area`s
 * @param {*Int} areaId 
 */
const fastestDeliverySuppliers = (latitude,
    longitude, languageId, dbName, offset, order_by) => {
    // 3-for A->Z 4-For Z->A
    // let dineInCheck = await ExecuteQ.Query(dbName,"select key,value from ")
    var day = moment().isoWeekday();
    day = day - 1;
    logger.debug("======day=====", day)

    let order_by_rating_check = " order by distance  ";

    if(parseInt(order_by)==1){
        order_by_rating_check = " order_by s.rating desc "
    }

    let open_close_filter = ""
    logger.debug("========offset======+", offset)
    let currentTime = moment().utcOffset(offset.toString());
    logger.debug("========currentTime======+", currentTime)
    currentTime = moment(currentTime).format('HH:mm:ss');
    logger.debug("========currentTime=====222=+", currentTime)

    console.log('==========openclosefilter======', open_close_filter)
    open_close_filter = "and st.is_open=1 and st.start_time<='" + currentTime + "' and st.end_time>='" + currentTime + "' "
    return new Promise(async (resolve, reject) => {

        let mUnit = await Universal.getMeausringUnit(dbName);

        var sql = "select *,if( count(*)>1,1,0) as is_multi_branch , s.self_pickup, si.image_path as supplier_image, sc.onOffComm,s.delivery_prior_total_time as delivery_prior_time, s.delivery_min_time, "
        sql += " s.delivery_type,sb.latitude,sb.longitude,s.delivery_max_time,s.urgent_delivery_time,s.is_scheduled,s.total_reviews, s.rating,sb.id as supplier_branch_id,sml.name,sml.description, "
        sql += "s.is_dine_in,s.delivery_radius,sml.uniqueness,sml.terms_and_conditions,sml.address, s.logo, s.id,st.is_open as status, st.start_time,st.end_time, "
        sql += " s.payment_method, sc.commission_package, "
        sql += "(" + mUnit + " * acos (cos (radians(" + latitude + "))* cos(radians(sb.latitude))* cos(radians(sb.longitude) - radians(" + longitude + ")) + sin (radians(" + latitude + "))* sin(radians(sb.latitude)))) AS distance "
        sql += "from supplier_category sc join supplier s on s.id = sc.supplier_id join categories ct on ct.id=sc.category_id join supplier_timings st on st.supplier_id = s.id join supplier_branch sb on s.id = sb.supplier_id "
        sql += " join supplier_delivery_types sdt on sdt.supplier_id = s.id join supplier_ml sml on s.id = sml.supplier_id left join supplier_image si on si.supplier_id = s.id "
        sql += "where sdt.type = 1 and s.is_live = 1      " + open_close_filter + "  and sml.language_id = 14 and sb.is_deleted = 0 and st.week_id = ? "
        sql += "GROUP BY s.id having distance<=sb.delivery_radius "+order_by_rating_check+" "


        try {

            logger.debug("=====ERR!=============1234556=", sql);
            let result = await ExecuteQ.Query(dbName, sql, [day])
            //    var st=multiConnection[dbName].query(sql, [day], function (err, result) {
            //       logger.debug("=====ERR!=============1234556=",st.sql);
            //         if(err) {
            //                 reject(err)                           
            //         }
            //         else{
            var data_length = result.length
            if (data_length > 0) {

                for (var i = 0; i < data_length; i++) {
                    (function (i) {
                        supplierCategory(result[i].id, languageId, dbName, async function (err, catData) {
                            if (err) {
                                callback(err);
                            } else {
                                result[i].category = [];
                                var leng = catData.length;
                                for (var j = 0; j < leng; j++) {
                                    (async function (j) {
                                        result[i].category.push(catData[j]);
                                    }(j));
                                }
                                //temp.push({supplier:supplierList[i],category:result});
                                if (i == (data_length - 1)) {
                                    // let GOOGLE_API_KEY = await common.getGoogleApiKey(dbName);
                                    // let estimatedTimeInMinutes = 0;
                                    // for(const [index,i] of result.entries()){
                                    //     if (GOOGLE_API_KEY && GOOGLE_API_KEY.length > 0) {
                                    //         logger.debug("=====1==========")
                                    //         estimatedTimeInMinutes = await common.getEstimatedTime(dbName, GOOGLE_API_KEY,i.latitude,i.longitude,latitude, longitude);
                                    //     } else {
                                    //         logger.debug("=====2==========")
                                    //         let default_api_key = config.get("google_keys.google_map_key");
                                    //         estimatedTimeInMinutes = await common.getEstimatedTime(dbName,default_api_key,i.latitude,i.longitude,latitude, longitude)
                                    //     }
                                    //     i.travel_time = estimatedTimeInMinutes;
                                    // }                                              
                                    resolve(result)
                                }
                            }
                        })
                    }(i));
                }



            }
            else {
                resolve(result)
            }
            // }
            // })
        }
        catch (Err) {
            logger.debug("==Err!==", Err)
            reject(Err)
        }
    })
}
var supplierCategory = async function(supplierId,languageId, dbName,callback){
    try{
        
    var sql = "select c.image,c.supplier_placement_level,sc.category_id,cml.name as category_name,cml.description,c.order,c.category_flow from supplier_category sc join categories_ml cml on sc.category_id = cml.category_id " +
        " join categories c on c.id = sc.category_id " +
        " where sc.supplier_id = ? and cml.language_id=? and c.is_live=1 and c.is_deleted=0  GROUP BY c.id";
        let stmt = multiConnection[dbName].query(sql, [supplierId,languageId], function (err, result) {
        logger.debug("=============stmtsql=================",stmt.sql,result)
        if (err) {
            var msg = "db error";
            callback(err)
        } else {
            callback(null,result);
        }
    })
}
catch(Err){
    var msg = "db error";
    callback(err)
}
}
/**
 * @description used for gettina an device token and other info of user
 * @param {*Object} req 
 * @param {*Object} res 
 */
const DeviceToken=async (req,res)=>{
    try{
        logger.debug("===INPUT====",req.query);
        let id=req.query.customer_id;
        let data=await ExecuteQ.Query(req.dbName,"select `device_token`,`notification_language` from `user` where `id`=?",[id]);
        let languageId=data && data.length>0?data[0].notification_language:14;
        let deviceToken=data && data.length>0?data[0].device_token:"";
        let languageData=await ExecuteQ.Query(req.dbName,'select language_code,language_name from language where id=?',[parseInt(languageId)]);
        sendResponse.sendSuccessData({"device_token":deviceToken,"language_id":languageId,"language_code":languageData[0].language_code}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch(Err){
        logger.debug(Err);
        return sendResponse.sendErrorMessage(Err,res,400)
    }
}

const emailTemp = require('../../routes/email')

const UpdateOrderStatusbyAgent=async (req,res)=>{
    try{

        logger.debug("===INPUT====",req.body);
        let offset = req.body.offset || "+5:30"
        let sql;
        var date2 = moment().utcOffset(offset);
        var date = moment(date2).format("YYYYY-MM-DD HH:mm:ss");

        // var date1=date.toISOString().slice(0,10);
        logger.debug("+==========date1date1date1date1date1date1============",date.slice(0,11),typeof date)



        logger.debug("========DATE>>",date);
        let id=req.body.user_id;
        let order_id=req.body.order_id;
        let status=req.body.status;
        let return_id=req.body.return_id || 0;
        let delivery_latitude=req.body.delivery_latitude || 0.00;
        let delivery_longitude=req.body.delivery_longitude || 0.00;
        let delivery_notes=req.body.delivery_notes !=undefined ? req.body.delivery_notes :"";

        let cartId=0
        logger.debug("+===============o90898========",date,offset)
        if(status==5){
                sql="update `orders` set  `delivery_notes` ="+delivery_notes+"  `delivery_longitude`="+delivery_longitude+",`delivery_latitude`="+delivery_latitude+",`status`="+status+",delivered_on='"+date+"' where `id`="+order_id+" and `status`!="+status+"";
                await updateAccounts(req.dbName,order_id,status,date);
        }
        if(status==3){
            sql="update `orders` set `status`="+status+",shipped_on='"+date+"' where `id`="+order_id+" and `status`!="+status+"";
        }
        if(status==11){
            sql="update `orders` set `status`="+status+",progress_on='"+date+"' where `id`="+order_id+" and `status`!="+status+"";
        }
        if(status==10){
            sql="update `orders` set `status`="+status+",near_on='"+date+"' where `id`="+order_id+" and `status`!="+status+"";
        }
        if(parseInt(status)==13){
            sql="update `order_return_request` set `status`=1,shipped_on='"+date+"' where id="+return_id+"";
        }
        if(parseInt(status)==15){
            sql="update `order_return_request` set `status`=3,delivered_on='"+date+"' where id="+return_id+"";
        }
        if(parseInt(status)==14){
            sql="update `order_return_request` set `status`=2,picked_on='"+date+"' where id="+return_id+"";
        }
        let data=await ExecuteQ.Query(req.dbName,sql,[])
        // let device_token=data && data.length>0?data[0].device_token:""
        let sql1 = `select ors.*,o.cart_id,o.user_delivery_address,s.address as supplier_address,sbp.category_id,o.self_pickup,o.payment_type,o.schedule_date,o.created_on,o.net_amount,
        s.supplier_id as supplier_id,s.name as supplier_name,u.email,u.id as user_id,u.device_token,u.device_type,u.notification_status,u.notification_language,
        CONCAT(u.firstname,' ',u.lastname) as userName from orders o join user u on o.user_id = u.id 
        join order_prices ors on ors.order_id=o.id join product pr on pr.id=ors.product_id join
        supplier_branch sb on sb.id=o.supplier_branch_id join supplier_ml s on s.supplier_id = sb.supplier_id left join supplier_branch_product sbp on sbp.product_id=ors.product_id
        and s.language_id=u.notification_language where o.id = ?`
        let result=await ExecuteQ.Query(req.dbName,sql1,[order_id]);
        cartId=result && result.length>0?result[0].cart_id:0;
        let payment_method = "cash";
        if(parseInt(result[0].payment_type)>0){
            payment_method = 'Online Transaction';
        }

        if(parseInt(status)==5){
            
            let isMultipleOrderAssingedOnce=await ExecuteQ.Query(req.dbName,"select `key`,`value` from tbl_setting where `key`=? and `value`=?",["assigned_multiple_order_once_after_confimation","1"]);
            if(isMultipleOrderAssingedOnce && isMultipleOrderAssingedOnce.length>0){
    
                let _orderData=[];
    
                let totalOrderInCart=await ExecuteQ.Query(req.dbName,"select ors.id from orders ors join supplier_branch sb on sb.id=ors.supplier_branch_id join supplier s on s.id=sb.supplier_id where ors.cart_id=? ",[cartId]);
    
                let totalOrderInCartWithStatusChange=await ExecuteQ.Query(req.dbName,"select ors.id from orders ors join supplier_branch sb on sb.id=ors.supplier_branch_id join supplier s on s.id=sb.supplier_id where ors.cart_id=? and (ors.status=5 or ors.status=2 or ors.status=8)",[cartId]);
    
                let SupplierNameOrderNumber=await ExecuteQ.Query(req.dbName,"select GROUP_CONCAT(s.name) as supplierName,GROUP_CONCAT(ors.id) as order_ids from orders ors join supplier_branch sb on sb.id=ors.supplier_branch_id join supplier s on s.id=sb.supplier_id where ors.cart_id=?",[cartId]);
    
                console.log("====totalOrderInCart===totalOrderInCartWithStatusChange=",totalOrderInCart,totalOrderInCartWithStatusChange)
                if(totalOrderInCart.length==totalOrderInCartWithStatusChange.length){
    
                    let orderSql="select IFNULL(ors.agent_verification_code,0) as agent_verification_code,ors.wallet_discount_amount,ors.supplier_branch_id, usr.email as customer_email,IFNULL(CONCAT(usr.firstname,usr.lastname),'') AS customer_name,IFNULL(ors.pres_description,'') AS pres_description,ors.have_coin_change,ors.buffer_time, "+
                        "ors.no_touch_delivery,ors.drop_off_date_utc,ors.drop_off_date,sp.id as supplier_id,sp.latitude as supplier_latitude,sp.longitude as supplier_longitude,ors.user_service_charge,sp.name as supplier_name,ors.created_on,ors.schedule_date as delivery_date,ors.schedule_date as delivered_on,usr.mobile_no as customer_phone_number,usr.user_image as customer_image ,CAST(usr.id as CHAR(50)) as customer_id,"+
                        " spb.name as supplier_branch_name,spb.address as supplier_branch_address,spb.latitude as supplier_branch_latitude,spb.longitude as supplier_branch_longitude,ors.promo_discount,ors.promo_code,ors.payment_type,IFNULL(ors.comment, '') as comment,ors.remarks,ors.urgent_price,"+
                        " ors.urgent,ors.tip_agent,ors.net_amount,ors.delivery_charges,ors.handling_supplier,"+
                        " ors.handling_admin,CAST(ors.id AS CHAR) as order_id "+
                        " from orders ors join order_prices op on op.order_id=ors.id join supplier inner join"+
                        " supplier_branch spb on spb.id=op.supplier_branch_id inner join supplier sp "+
                        " on sp.id=spb.supplier_id inner join user usr on usr.id=ors.user_id where ors.id IN ("+SupplierNameOrderNumber[0].order_ids+") group by ors.id";
                       let _oData=await ExecuteQ.Query(req.dbName,orderSql,[]);
    
                       let  orderItemSql="select spb.name as supplier_branch_name,spb.address as supplier_branch_address,spb.latitude,spb.longitude,op.handling_admin,op.id as order_price_id,op.order_id,op.quantity,op.price,op.product_id as item_id,op.product_name as item_name, "+
                       " op.product_reference_id,op.product_dimensions,op.product_upload_reciept,op.product_owner_name,op.product_desc as item_desc,op.product_name as item_name,op.image_path from order_prices op left join supplier_branch spb on spb.id=op.supplier_branch_id where op.order_id IN("+SupplierNameOrderNumber[0].order_ids+")"
                       let orderItemData=await ExecuteQ.Query(req.dbName,orderItemSql,[]);
    
                       if(_oData && _oData.length>0){
    
                            let accountOrderObj={
                                "netAmount":0,
                                "subTotal":0,
                                "deliveryCharges":0,
                                "agentTip":0,
                                "tax":0,
                                "cartProcessingFee":0
                            }
                            let subTotal=0,subTotalOfAllOrders=0;
                            let tax=0,deliveryCharge=0,agentTip=0,cartProcessingFee=0
                            let orderItem=[];
                           for(const [index,i] of _oData.entries()){
                                    subTotal=0;
                                    orderItem=[]
                                    let ordObj={
                                        tax:i.handling_admin,
                                        supplierName:i.supplier_name
                                    }
                                for(const [inex_1,j] of orderItemData.entries()){
    
                                    if(parseInt(j.order_id)==parseInt(i.order_id)){
                                        orderItem.push(j)
                                        subTotal=subTotal+(parseFloat(j.price)*parseInt(j.quantity));
                                    }
                                }
                                ordObj["items"]=orderItem;
                                subTotalOfAllOrders=subTotalOfAllOrders+subTotal;
                                tax=tax+i.handling_admin
                                agentTip=agentTip+i.tip_agent;
                                deliveryCharge=deliveryCharge+i.delivery_charges;
                                cartProcessingFee=cartProcessingFee+i.user_service_charge;
                                ordObj["subTotal"]=subTotal;
                                _orderData.push(ordObj);
    
                                if(index==(_oData.length-1)){
                                        accountOrderObj["subTotal"]=subTotalOfAllOrders;
                                        accountOrderObj["agentTip"]=agentTip;
                                        accountOrderObj["tax"]=tax;
                                        accountOrderObj["deliveryCharges"]=deliveryCharge;
                                        accountOrderObj["cartProcessingFee"]=cartProcessingFee;
                                        accountOrderObj["netAmount"]=accountOrderObj["subTotal"]+accountOrderObj["agentTip"]+ accountOrderObj["tax"]+accountOrderObj["deliveryCharges"]+accountOrderObj["cartProcessingFee"];
                                        console.log("===accountOrderObj==_orderData==>",accountOrderObj,_orderData)
                                        emailTemp.deliverOrderV1(result[0].self_pickup,req,req.dbName,res,'',
                                        result[0].userName,result[0].net_amount,moment(result[0].created_on).format('DD/MM/YYYY HH:mm'),moment(result[0].schedule_date).format('DD/MM/YYYY HH:mm'),
                                        order_id,result[0].supplier_name,result[0].supplier_name,payment_method,
                                        result[0].email,result[0].notification_language,_orderData,accountOrderObj,function(err,result){
                                             if(err){
                                                 console.log("..****fb register email*****....",err);
                                             }else{
                                                sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
                                             }
                                         })
                                }   
                               
                                
                           }
                          
    
                       }
    
    
    
    
                }
                else{
                    sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
                }
            }
            else{
                emailTemp.deliverOrder(result[0].self_pickup,req,req.dbName,res,'',
                result[0].userName,result[0].net_amount,moment(result[0].created_on).format('DD/MM/YYYY HH:mm'),moment(result[0].schedule_date).format('DD/MM/YYYY HH:mm'),
                order_id,result[0].supplier_name,result[0].supplier_name,payment_method,
                result[0].email,result[0].notification_language,function(err,result){
                        console.log("..****fb register email*****....",err);
                   
                        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
                    
                })
        }
        }else{
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);

        }

    }
    catch(Err){
        logger.debug(Err);
        return sendResponse.sendErrorMessage(Err,res,400)
    }

}

const UpdateOrderStatusbyAgentByGroup=async (req,res)=>{
    try{

        logger.debug("===INPUT====",req.body);
        let offset = req.body.offset || "+5:30"
        let sql;
        var date2 = moment().utcOffset(offset);
        var date = moment(date2).format("YYYYY-MM-DD HH:mm:ss");

        // var date1=date.toISOString().slice(0,10);
        logger.debug("+==========date1date1date1date1date1date1============",date.slice(0,11),typeof date)



        logger.debug("========DATE>>",date);
        let id=req.body.user_id;
        let order_id=req.body.order_id;
        let grouping_id=req.body.grouping_id;
        let status=req.body.status;
        let return_id=req.body.return_id || 0;
        let delivery_latitude=req.body.delivery_latitude || 0.00;
        let delivery_longitude=req.body.delivery_longitude || 0.00;
        let delivery_notes=req.body.delivery_notes !=undefined ? req.body.delivery_notes : "";
        let cartId=0
        logger.debug("+===============o90898========",date,offset)
        if(status==5){
                sql="update `orders` set   `delivery_notes` = '"+delivery_notes+"',  `delivery_longitude`="+delivery_longitude+",`delivery_latitude`="+delivery_latitude+",`status`="+status+",delivered_on='"+date+"' where `grouping_id`="+grouping_id+" and `status`!="+status+"";
                await updateAccounts(req.dbName,order_id,status,date);
        }
        if(status==3){
            sql="update `orders` set `status`="+status+",shipped_on='"+date+"' where `grouping_id`="+grouping_id+" and `status`!="+status+"";
        }
        if(status==11){
            sql="update `orders` set `status`="+status+",progress_on='"+date+"' where `grouping_id`="+grouping_id+" and `status`!="+status+"";
        }
        if(status==10){
            sql="update `orders` set `status`="+status+",near_on='"+date+"' where `grouping_id`="+grouping_id+" and `status`!="+status+"";
        }
        if(parseInt(status)==13){
            sql="update `order_return_request` set `status`=1,shipped_on='"+date+"' where id="+return_id+"";
        }
        if(parseInt(status)==15){
            sql="update `order_return_request` set `status`=3,delivered_on='"+date+"' where id="+return_id+"";
        }
        if(parseInt(status)==14){
            sql="update `order_return_request` set `status`=2,picked_on='"+date+"' where id="+return_id+"";
        }
        let data=await ExecuteQ.Query(req.dbName,sql,[])
        // let device_token=data && data.length>0?data[0].device_token:""
        let sql1 = `select ors.*,o.cart_id,o.user_delivery_address,s.address as supplier_address,sbp.category_id,o.self_pickup,o.payment_type,o.schedule_date,o.created_on,o.net_amount,
        s.supplier_id as supplier_id,s.name as supplier_name,u.email,u.id as user_id,u.device_token,u.device_type,u.notification_status,u.notification_language,
        CONCAT(u.firstname,' ',u.lastname) as userName from orders o join user u on o.user_id = u.id 
        join order_prices ors on ors.order_id=o.id join product pr on pr.id=ors.product_id join
        supplier_branch sb on sb.id=o.supplier_branch_id join supplier_ml s on s.supplier_id = sb.supplier_id left join supplier_branch_product sbp on sbp.product_id=ors.product_id
        and s.language_id=u.notification_language where o.id = ?`
        let result=await ExecuteQ.Query(req.dbName,sql1,[order_id]);
        cartId=result && result.length>0?result[0].cart_id:0;
        let payment_method = "cash";
        if(parseInt(result[0].payment_type)>0){
            payment_method = 'Online Transaction';
        }

        if(parseInt(status)==5){
            
            let isMultipleOrderAssingedOnce=await ExecuteQ.Query(req.dbName,"select `key`,`value` from tbl_setting where `key`=? and `value`=?",["assigned_multiple_order_once_after_confimation","1"]);
            if(isMultipleOrderAssingedOnce && isMultipleOrderAssingedOnce.length>0){
    
                let _orderData=[];
    
                let totalOrderInCart=await ExecuteQ.Query(req.dbName,"select ors.id from orders ors join supplier_branch sb on sb.id=ors.supplier_branch_id join supplier s on s.id=sb.supplier_id where ors.cart_id=? ",[cartId]);
    
                let totalOrderInCartWithStatusChange=await ExecuteQ.Query(req.dbName,"select ors.id from orders ors join supplier_branch sb on sb.id=ors.supplier_branch_id join supplier s on s.id=sb.supplier_id where ors.cart_id=? and (ors.status=5 or ors.status=2 or ors.status=8)",[cartId]);
    
                let SupplierNameOrderNumber=await ExecuteQ.Query(req.dbName,"select GROUP_CONCAT(s.name) as supplierName,GROUP_CONCAT(ors.id) as order_ids from orders ors join supplier_branch sb on sb.id=ors.supplier_branch_id join supplier s on s.id=sb.supplier_id where ors.cart_id=?",[cartId]);
    
                console.log("====totalOrderInCart===totalOrderInCartWithStatusChange=",totalOrderInCart,totalOrderInCartWithStatusChange)
                if(totalOrderInCart.length==totalOrderInCartWithStatusChange.length){
    
                    let orderSql="select IFNULL(ors.agent_verification_code,0) as agent_verification_code,ors.wallet_discount_amount,ors.supplier_branch_id, usr.email as customer_email,IFNULL(CONCAT(usr.firstname,usr.lastname),'') AS customer_name,IFNULL(ors.pres_description,'') AS pres_description,ors.have_coin_change,ors.buffer_time, "+
                        "ors.no_touch_delivery,ors.drop_off_date_utc,ors.drop_off_date,sp.id as supplier_id,sp.latitude as supplier_latitude,sp.longitude as supplier_longitude,ors.user_service_charge,sp.name as supplier_name,ors.created_on,ors.schedule_date as delivery_date,ors.schedule_date as delivered_on,usr.mobile_no as customer_phone_number,usr.user_image as customer_image ,CAST(usr.id as CHAR(50)) as customer_id,"+
                        " spb.name as supplier_branch_name,spb.address as supplier_branch_address,spb.latitude as supplier_branch_latitude,spb.longitude as supplier_branch_longitude,ors.promo_discount,ors.promo_code,ors.payment_type,IFNULL(ors.comment, '') as comment,ors.remarks,ors.urgent_price,"+
                        " ors.urgent,ors.tip_agent,ors.net_amount,ors.delivery_charges,ors.handling_supplier,"+
                        " ors.handling_admin,CAST(ors.id AS CHAR) as order_id "+
                        " from orders ors join order_prices op on op.order_id=ors.id join supplier inner join"+
                        " supplier_branch spb on spb.id=op.supplier_branch_id inner join supplier sp "+
                        " on sp.id=spb.supplier_id inner join user usr on usr.id=ors.user_id where ors.id IN ("+SupplierNameOrderNumber[0].order_ids+") group by ors.id";
                       let _oData=await ExecuteQ.Query(req.dbName,orderSql,[]);
    
                       let  orderItemSql="select spb.name as supplier_branch_name,spb.address as supplier_branch_address,spb.latitude,spb.longitude,op.handling_admin,op.id as order_price_id,op.order_id,op.quantity,op.price,op.product_id as item_id,op.product_name as item_name, "+
                       " op.product_reference_id,op.product_dimensions,op.product_upload_reciept,op.product_owner_name,op.product_desc as item_desc,op.product_name as item_name,op.image_path from order_prices op left join supplier_branch spb on spb.id=op.supplier_branch_id where op.order_id IN("+SupplierNameOrderNumber[0].order_ids+")"
                       let orderItemData=await ExecuteQ.Query(req.dbName,orderItemSql,[]);
    
                       if(_oData && _oData.length>0){
    
                            let accountOrderObj={
                                "netAmount":0,
                                "subTotal":0,
                                "deliveryCharges":0,
                                "agentTip":0,
                                "tax":0,
                                "cartProcessingFee":0
                            }
                            let subTotal=0,subTotalOfAllOrders=0;
                            let tax=0,deliveryCharge=0,agentTip=0,cartProcessingFee=0;
                            let orderItem=[];
                           for(const [index,i] of _oData.entries()){
                                    subTotal=0;
                                    orderItem=[];
                                    let ordObj={
                                        tax:i.handling_admin,
                                        supplierName:i.supplier_name
                                    }
                                for(const [inex_1,j] of orderItemData.entries()){
    
                                    if(parseInt(j.order_id)==parseInt(i.order_id)){
                                        orderItem.push(j)
                                        subTotal=subTotal+(parseFloat(j.price)*parseInt(j.quantity));
                                    }
                                }
                                ordObj["items"]=orderItem;
                                subTotalOfAllOrders=subTotalOfAllOrders+subTotal;
                                tax=tax+i.handling_admin
                                agentTip=agentTip+i.tip_agent;
                                deliveryCharge=deliveryCharge+i.delivery_charges;
                                cartProcessingFee=cartProcessingFee+i.user_service_charge;
                                ordObj["subTotal"]=subTotal;
                                _orderData.push(ordObj);
    
                                if(index==(_oData.length-1)){
                                        accountOrderObj["subTotal"]=subTotalOfAllOrders;
                                        accountOrderObj["agentTip"]=agentTip;
                                        accountOrderObj["tax"]=tax;
                                        accountOrderObj["deliveryCharges"]=deliveryCharge;
                                        accountOrderObj["cartProcessingFee"]=cartProcessingFee;
                                        accountOrderObj["netAmount"]=accountOrderObj["subTotal"]+accountOrderObj["agentTip"]+ accountOrderObj["tax"]+accountOrderObj["deliveryCharges"]+accountOrderObj["cartProcessingFee"];
                                        console.log("===accountOrderObj==_orderData==>",accountOrderObj,_orderData)
                                        emailTemp.deliverOrderV1(result[0].self_pickup,req,req.dbName,res,'',
                                        result[0].userName,result[0].net_amount,moment(result[0].created_on).format('DD/MM/YYYY HH:mm'),moment(result[0].schedule_date).format('DD/MM/YYYY HH:mm'),
                                        order_id,result[0].supplier_name,result[0].supplier_name,payment_method,
                                        result[0].email,result[0].notification_language,_orderData,accountOrderObj,function(err,result){
                                             if(err){
                                                 console.log("..****fb register email*****....",err);
                                             }else{
                                                sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
                                             }
                                         })
                                }   
                               
                                
                           }
                          
    
                       }
    
    
    
    
                }
                else{
                    sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
                }
            }
            else{
                emailTemp.deliverOrder(result[0].self_pickup,req,req.dbName,res,'',
                result[0].userName,result[0].net_amount,moment(result[0].created_on).format('DD/MM/YYYY HH:mm'),moment(result[0].schedule_date).format('DD/MM/YYYY HH:mm'),
                order_id,result[0].supplier_name,result[0].supplier_name,payment_method,
                result[0].email,result[0].notification_language,function(err,result){
                    if(err){
                        console.log("..****fb register email*****....",err);
                    }else{
                        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
                    }
                })
        }
        }else{
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);

        }

    }
    catch(Err){
        logger.debug(Err);
        return sendResponse.sendErrorMessage(Err,res,400)
    }

}

async function updateAccounts(dbName,orderId,status,date){
    return new Promise(async(resolve,reject)=>{
        try{

            let orderDetails = await getOrderDetails(dbName,orderId,status);
            let accountData = await getAccountData(dbName,orderDetails,date);
            let agentData=await agentCommision(dbName,orderId);
            let discountData=await discountAmountCommision(dbName,orderId)
            await updateOrInsertInAccounts(dbName,agentData,discountData,orderDetails,accountData,date,orderId)
                resolve()
        }catch(err){
            reject(err)
        }
    })
}
const agentCommision=(dbName,orderId)=>{
    return new Promise(async (resolve,reject)=>{
        let is_agent_of_supplier=0;
        try{
           let agent_commision=0
            let getAgentDbData=await common.GetAgentDbInformation(dbName);        
            let agentConnection=await common.RunTimeAgentConnection(getAgentDbData);  
            let agent_order_data=await ExecuteQ.QueryAgent(agentConnection,"select cu.*,commission_ammount,net_amount from cbl_user_orders co join cbl_user cu on cu.id=co.user_id where co.order_id=?",[orderId]);
            if(agent_order_data && agent_order_data.length>0){
                is_agent_of_supplier=agent_order_data[0].supplier_id;
                agent_commision=await calculateTotalCommission(agentConnection,agent_order_data[0].net_amount,agent_order_data[0].id);
                
                console.log("=agent_commision======>",agent_commision)
            }      
            await ExecuteQ.QueryAgent(agentConnection,"update cbl_user_orders set commission_ammount=? where order_id=?",[agent_commision,orderId])
           resolve({is_agent_of_supplier:is_agent_of_supplier,agent_commision:agent_commision})
        }
        catch(Err){
            console.log("==agentCommision====Err!===",Err)
            resolve({is_agent_of_supplier:0,agent_commision:0})
        }   
    })

}
async function calculateTotalCommission(agentConnection,net_amount,user_id){
    var sql = "select commission,agent_commission_type from cbl_user where id = ?"
    return new Promise(async (resolve,reject)=>{
        try{
            var res_data = await ExecuteQ.QueryAgent(agentConnection,sql,[user_id]);

        
            logger.debug("=============agent_commission_type=====")
            let commission = res_data[0].commission
            let totalAmmount = 0;
           

            if(res_data[0].agent_commission_type!==0){
                totalAmmount = commission
            }else{

                totalAmmount = (commission/100)*net_amount
            }
            logger.debug("----------net ammount -------------",totalAmmount)
            resolve(totalAmmount);
        }catch(err){
            logger.debug("=====eerr!!=====calculateTotalCommission=====",err)
            reject(err)
        }
    })
}

const discountAmountCommision=(dbName,orderid)=>{
    return new Promise(async (resolve,reject)=>{
        let promo_data=await ExecuteQ.Query(dbName,"select IFNULL(SUM(orp.price*orp.quantity),0) as tota_product_amount,pc.discountPrice,pc.discountType,IFNULL(pc.bear_by,0) as bear_by,pc.commission_on,IFNULL(op.totalAmount,0) as totalAmount,IFNULL(op.discountAmount,0) as discountAmount from order_promo op join promoCode pc on pc.id=op.promoId join order_prices orp on orp.order_id=op.orderId where op.orderId=?",[orderid])
        let original_amount=0,original_discount_amount=0,bear_by_supplier=0,commission_on=0,discount_amount=0;
        if(promo_data && promo_data.length>0){
            // bear_by_supplier=0 for admin,commision_on_original_amount=0 for original price;
           
            if(parseInt(promo_data[0].tota_product_amount)>0){
                logger.debug("======promo_data",promo_data);
                discount_amount=promo_data[0].discountAmount
                original_amount=promo_data[0].tota_product_amount
                bear_by_supplier=promo_data[0].bear_by
                commission_on=promo_data[0].commission_on
                logger.debug("=====discount_amount==original_amount===bear_by_supplier==commission_on==>>",discount_amount,
                original_amount,bear_by_supplier,commission_on)
                if(commission_on!=0){
                    if(promo_data[0].discountType!=0){
                            original_discount_amount=(original_amount)-(original_amount*promo_data[0].discountPrice)/100
                            logger.debug("===discountPrice=====",promo_data[0].discountPrice)
                            discount_amount=original_discount_amount*promo_data[0].discountPrice/100
                            logger.debug("===original_discount_amount=====discount_amount",original_discount_amount,discount_amount)
                        }
                }
            }
        }
        resolve({bear_by_supplier:bear_by_supplier,discount_amount:discount_amount})

    })

}


async function updateOrInsertInAccounts(dbName,agentData,discountData,orderDetails,accountData,date,orderId){
    
    let amount = orderDetails.amount
    let handling_supplier = orderDetails.handling_admin
    let handling_admin = orderDetails.handling_admin
    let agentTip=parseFloat(orderDetails.tip_agent)
    let supplier_commision = orderDetails.supplier_commision
    let cardId = orderDetails.cardId!=""?orderDetails.cardId:0
    let adminId = orderDetails.adminId
    let supplierId = orderDetails.supplierId
    let payAmount = 0
    let length = 0
    if(accountData && accountData.length>0){
        length = accountData.length
    }
    logger.debug("============== if(length && length>0){======================",length)
    let method = orderDetails.method
    let status1;
    let id;
    let com = supplier_commision
    logger.debug("=========account ddata=====",accountData)
return new Promise(async(resolve,reject)=>{
    try{
        let isAdminDeliveryCharges=await ExecuteQ.Query(dbName,"select `key`,`value` from tbl_setting where `key`=? and `value`=?",["is_delivery_charge_to_admin","1"]);
        agentData.agent_commision=isAdminDeliveryCharges && isAdminDeliveryCharges.length>0?orderDetails.delivery:agentData.agent_commision;
        console.log("===amount==handling_admin=supplier_commision=tipAgent==discountData.discount_amount=>>",amount,handling_admin,supplier_commision,(parseInt(agentData.is_agent_of_supplier)==0?parseFloat(agentTip):0),discountData.discount_amount)

        let adminDeliveryCharges=0;
        let supplierDeliveryCharges=0
        let adminPromoBearAmount=0;
        let supplierPromoBearAmount=0;



        if(method == 1||method == 4){
           
            payAmount=parseFloat(amount)-(handling_admin+supplier_commision+(parseInt(agentData.is_agent_of_supplier)==0?agentData.agent_commision:0)+(parseInt(agentData.is_agent_of_supplier)==0?parseFloat(agentTip):0));
            payAmount=payAmount-(discountData.bear_by_supplier!=0?parseFloat(discountData.discount_amount):0);

            logger.debug("============== if(length && length>0){========22222222==============",length);
            

            if(length && length>0){
                logger.debug("============== if(length && length>0){========3333333=============",length)
                 status1 = accountData[0].status1
                 id = accountData[0].id
                 logger.debug("=========id = accountData[0].id===========",id)
                if(status1==1){
                    let sql3 = "update account_payable set total_amount = total_amount + ?,amount_left = amount_left + ?,status = ? ,updated_date = ? where id = ?";
                    let params = [payAmount,payAmount,2,date,id]
                    await ExecuteQ.Query(dbName,sql3,params)
                }
                else{
                    let sql3 = "update account_payable set total_amount = total_amount + ?,amount_left  = amount_left + ?,updated_date = ? where id = ? ";
                    let params = [payAmount,payAmount,date,id]
                    await ExecuteQ.Query(dbName,sql3,params)
                }
            }
            else {
                let sql3='insert into account_payable(admin_id,supplier_id,total_amount,amount_paid,amount_left,status,created_date)values(?,?,?,?,?,?,?)';
                let params = [adminId,supplierId,payAmount,0,payAmount,0,date]
                let data =   await ExecuteQ.Query(dbName,sql3,params)
                id = data.insertId
            }

            if((parseInt(agentData.is_agent_of_supplier)==0) && (parseFloat(orderDetails.delivery)>=parseFloat(agentData.agent_commision))){
                adminDeliveryCharges=(parseFloat(orderDetails.delivery)==parseFloat(agentData.agent_commision))?agentData.agent_commision:parseFloat(orderDetails.delivery)-parseFloat(agentData.agent_commision)
                    let dupData=await ExecuteQ.Query(dbName,`select id from additional_admin_revenue_amount where supplier_id=? and order_id=? and delivery_amount=?`,[0,orderId,adminDeliveryCharges])
                    console.log("===dupData=1==>>",dupData)
                    if(Array.isArray(dupData) && !dupData.length){
                    await ExecuteQ.Query(dbName,'insert into additional_admin_revenue_amount(promo_bear_amount,delivery_amount,order_cancel_amount,supplier_id,order_id) values(?,?,?,?,?)',[0,adminDeliveryCharges,0,0,orderId])
                    }
            }
            if((parseInt(agentData.is_agent_of_supplier)!=0) && (parseFloat(orderDetails.delivery)>=parseFloat(agentData.agent_commision))){
                    supplierDeliveryCharges=(parseFloat(orderDetails.delivery)==parseFloat(agentData.agent_commision))?agentData.agent_commision:parseFloat(orderDetails.delivery)-parseFloat(agentData.agent_commision)
                    let dupData=await ExecuteQ.Query(dbName,`select id from additional_admin_revenue_amount where supplier_id=? and order_id=? and delivery_amount=?`,[supplierId,orderId,supplierDeliveryCharges])
                    console.log("===dupData=2==>>",dupData)
                    if(Array.isArray(dupData) && !dupData.length){
                    await ExecuteQ.Query(dbName,'insert into additional_admin_revenue_amount(promo_bear_amount,delivery_amount,order_cancel_amount,supplier_id,order_id) values(?,?,?,?,?)',[0,supplierDeliveryCharges,0,supplierId,orderId])
                    }
            }
            if(discountData.bear_by_supplier!=0 && discountData.discount_amount>0){
                let dupData=await ExecuteQ.Query(dbName,`select id from additional_admin_revenue_amount where supplier_id=? and order_id=? and promo_bear_amount=?`,[supplierId,orderId,discountData.discount_amount])
                console.log("===dupData=3==>>",dupData)
                if(Array.isArray(dupData) && !dupData.length){
                await ExecuteQ.Query(dbName,'insert into additional_admin_revenue_amount(promo_bear_amount,delivery_amount,order_cancel_amount,supplier_id,order_id) values(?,?,?,?,?)',[discountData.discount_amount,0,0,supplierId,orderId])
                }
            }
            if(discountData.bear_by_supplier==0 && discountData.discount_amount>0){
                let dupData=await ExecuteQ.Query(dbName,`select id from additional_admin_revenue_amount where supplier_id=? and order_id=? and promo_bear_amount=?`,[0,orderId,discountData.discount_amount])
                console.log("===dupData=4==>>",dupData)
                if(Array.isArray(dupData) && !dupData.length){
                    await ExecuteQ.Query(dbName,'insert into additional_admin_revenue_amount(promo_bear_amount,delivery_amount,order_cancel_amount,supplier_id,order_id) values(?,?,?,?,?)',[discountData.discount_amount,0,0,0,orderId])
                }
            }

            resolve();
        }
          else{
            
            // payAmount=handling_admin+supplier_commision+(parseInt(agentData.is_agent_of_supplier)==0?agentData.agent_commision:0);
            // logger.debug("=payAmount===",discountData.bear_by_supplier,discountData.discount_amount)
            // payAmount=payAmount-(discountData.bear_by_supplier==0?discountData.discount_amount:0);
            payAmount=amount-(handling_admin+supplier_commision+(parseInt(agentData.is_agent_of_supplier)==0?agentData.agent_commision:0)+(parseInt(agentData.is_agent_of_supplier)==0?parseFloat(agentTip):0));
            payAmount=payAmount-(discountData.bear_by_supplier!=0?discountData.discount_amount:0);

            if(length && length>0){
                status1 = accountData[0].status1
                id = accountData[0].id
                if(status1==1){
                    var sql3 = "update account_receivable set total_amount = total_amount + ?,amount_left = amount_left + ?,status = ?,updated_at=? where id = ?";
                    let params = [payAmount,payAmount,2,date,id]
                    await ExecuteQ.Query(dbName,sql3,params)
                }
                else{
                    //console.log('values-----',id);
                    var sql3 = "update account_receivable set total_amount = total_amount + ?,amount_left  = amount_left + ?,updated_at=? where id = ? ";
                    let params = [payAmount,payAmount,date,id]
                    await ExecuteQ.Query(dbName,sql3,params)
                }
            }
            else {
                var sql3='insert into account_receivable(admin_id,supplier_id,total_amount,amount_paid,amount_left,status,created_date)values(?,?,?,?,?,?,?)';
                let params = [adminId,supplierId,payAmount,0,payAmount,0,date]
                let data =   await ExecuteQ.Query(dbName,sql3,params)
                id = data.insertId
            }
        }

        if(method==1||method == 4){
            var sql4='insert into account_payable_order(account_payable_id,order_id,order_transaction_id,total_amount,total_left,commission)values(?,?,?,?,?,?)';
            let params = [id, orderId,cardId,payAmount,payAmount,com]
            await ExecuteQ.Query(dbName,sql4,params)

        }
        else{
            var sql4='insert into account_receivable_order(account_receivable_id,order_id,order_transaction_id,total_amount,total_left,commission)values(?,?,?,?,?,?)';
            let params = [id, orderId,cardId,payAmount,payAmount,com]
            await ExecuteQ.Query(dbName,sql4,params)
        }

        resolve();
    }catch(err){
        console.log("===========updateOrInsertInAccounts=====Err====+",err)
        resolve();
    }
})
}

async function getOrderDetails(dbName,orderId,status){
    return new Promise(async(resolve,reject)=>{
        try{
            let query='select o.tip_agent,o.user_id,supplier_commision,o.payment_type,o.net_amount,o.handling_admin,o.handling_supplier,s.id as supplier,a.id as admin, ' +
            ' o.delivery_charges,o.card_payment_id from orders o join supplier_branch sb on sb.id=o.supplier_branch_id ' +
            'left join supplier s on s.id=sb.supplier_id left join admin a on a.id=s.created_by where o.id=? ';
            let params = [orderId]
            let reply = await ExecuteQ.Query(dbName,query,params)
            let orderDetails = {}
            orderDetails.amount=parseInt(reply[0].net_amount);
            orderDetails.handling_admin=parseInt(reply[0].handling_admin);
            orderDetails.handling_supplier=parseInt(reply[0].handling_supplier);
            orderDetails.supplier_commision = parseFloat(reply[0].supplier_commision)
            orderDetails.delivery=parseInt(reply[0].delivery_charges);
           // payAmount=parseInt(reply[0].net_amount)-parseInt(reply[0].handling_admin);
            orderDetails.method=parseInt(reply[0].payment_type);
            orderDetails.supplierId=reply[0].supplier!=null?reply[0].supplier:0;
            orderDetails.adminId=reply[0].admin!=null?reply[0].admin:0;
            orderDetails.cardId=reply[0].card_payment_id;
            orderDetails.userId = reply[0].user_id;
            orderDetails.tip_agent=reply[0].tip_agent
            resolve(orderDetails)
        }catch(err){
            logger.debug("=========getOrderDetails=============")
            reject(err)
        }
    })
}

async function getAccountData(dbName,orderDetails,date){
    date = date.slice(0,11)
    return new Promise(async(resolve,reject)=>{
        try{
        let method = orderDetails.method
        let supplierId = orderDetails.supplierId
        let accountDetails = {}
        let data = []
        if(method == 1||method == 4) {
            var query = 'select id,status from account_payable where supplier_id = ? AND  DATE(updated_date) = ? ';
            let params = [supplierId,date]
            let check = await ExecuteQ.Query(dbName,query,params)
            if(check && check.length){
                accountDetails.status1 = check[0].status
                accountDetails.id = check[0].id
                data.push(accountDetails)
            }
        }
        else  {
              var sql2 = 'select  id,status from account_receivable where supplier_id = ? AND  DATE(updated_at) = ? ';
              let params = [supplierId,date]
              logger.debug("=========params params params check=====",params)
              let check = await ExecuteQ.Query(dbName,sql2,params)
              if(check && check.length){
                accountDetails.status1 = check[0].status
                accountDetails.id = check[0].id
                data.push(accountDetails)
            }
        }
        resolve(data)
    }
        catch(err){
            logger.debug("=============getAccountData========err======",err)
            reject()
        }
    })
}

const getOrderStatus=async (req,res)=>{
    try{

        logger.debug("======",req.query);
        let data=await ExecuteQ.Query(req.dbName,"select u.country_code as customer_country_code,s.iso,s.country_code,s.mobile_number_1,o.status,o.type from orders o join supplier_branch sb on sb.id = o.supplier_branch_id join supplier s on s.id = sb.supplier_id join user u on u.id=o.user_id where o.id=?",[req.query.order_id]);

        let order_price_data=await ExecuteQ.Query(req.dbName,"select `product_id` from order_prices where order_id=?",[req.query.order_id]);
        console.log("==============orderpricedata======",order_price_data)
        let category_data=await ExecuteQ.Query(req.dbName,`select ct.terminology,sbp.category_id from product p  join supplier_branch_product sbp on sbp.product_id=p.id join categories ct on ct.id=sbp.category_id where sbp.product_id=?`,[order_price_data[0].product_id])
      
        // let device_token=data && data.length>0?data[0].device_token:""
        logger.debug("===DATa!==CateDaAT=",data,category_data)
        sendResponse.sendSuccessData({orderDetails:data,cateData:category_data}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch(Err){
        logger.debug(Err);
        return sendResponse.sendErrorMessage(Err,res,400)
    }
}

const getUserDetails=async (req,res)=>{
    try{
        logger.debug("======",req.query);
        let user_id = req.users.id
        let data=await ExecuteQ.Query(req.dbName,"select * from user where id=?",[user_id]);
        logger.debug("===DATa!==user=",data)
        sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, 200);
    }
    catch(Err){
        logger.debug(Err);
        return sendResponse.sendErrorMessage(Err,res,400)
    }
}

const updateDeviceToken=async (req,res)=>{
    try{
        logger.debug("=====",req.users)
        var user_id=req.users.id;
        await ExecuteQ.Query(req.dbName,`update user set device_token=? where id=?`,[req.body.fcmToken,user_id])
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);

    }catch(Err){
        logger.debug(Err);
        return sendResponse.sendErrorMessage(Err,res,400)
    }
}
const updateAccessToken=async (req,res)=>{
    try{
        var user_id=req.users.id;
        let userData= await ExecuteQ.Query(req.dbName,`select email,access_token from user where id=?`,[user_id])
        logger.debug("===user=",userData)
        let newToken=func.encrypt(userData[0].email+new Date())
        let login_datas={
            "language_id": 1,
            "old_token": userData && userData.length>0?userData[0].access_token:"",
            "email":userData[0].email,
            "latitude":30.7333,
            "longitude":76.7794,
            "new_token": newToken
          }
          let rideRegistrationEnable=await ExecuteQ.Query(req.dbName,"select `key`,`value` from tbl_setting where `key`=?",['ride_registeration']);
          logger.debug("====rideRegistrationEnable=",rideRegistrationEnable);
          if(rideRegistrationEnable && rideRegistrationEnable.length>0){
            let baseUrlRideData=await ExecuteQ.Query(req.dbName,"select `key`,`value` from tbl_setting where `key`=?",['ride_base_url'])
            let baseUrl=baseUrlRideData && baseUrlRideData.length>0?baseUrlRideData[0].value:config.get("server.rides.api_link");
            let dbSecretKeyData=await ExecuteQ.Query(req.dbName,"select `key`,`value` from tbl_setting where `key`=?",['ride_db_secret_key']);
            let dbSecretKey=dbSecretKeyData && dbSecretKeyData.length>0?dbSecretKeyData[0].value:"";
            logger.debug("======baseUrlRideData==baseUrl==dbSecretKey=>>",baseUrlRideData,baseUrl,dbSecretKey);
            
            if(parseInt(rideRegistrationEnable[0].value)==1){
                    await common.updateRidesOldToken(baseUrl,login_datas,dbSecretKey);
            }
          }
        await ExecuteQ.Query(req.dbName,`update user set access_token=? where id=?`,[newToken,user_id])
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);

    }catch(Err){
        logger.debug(Err);
        return sendResponse.sendErrorMessage(Err,res,400)
    }
}
const getGiftCard=async (req,res)=>{
    try{
        let languageId=req.query.languageId;
        var zoneOffset=req.body.zoneOffset || "+05:30";
        var currentDate =moment().utcOffset(zoneOffset).format("YYYY-MM-DD HH:mm:ss");
        let giftData=await ExecuteQ.Query(req.dbName,`select gc.id,gcm.name,gc.description,gc.image,gc.thumb_nail,gc.price,
        gc.price_type,gc.from_date,gc.to_date,gc.percentage_value from gift_card gc join gift_card_ml gcm on gcm.gift_card_id=gc.id where gc.deleted_by=? and gcm.language_id=? order by gc.id DESC`,[0,languageId]);
        sendResponse.sendSuccessData({gift:giftData}, constant.responseMessage.SUCCESS, res, 200);
    }catch(Err){
        logger.debug("===",Err);
        return sendResponse.sendErrorMessage(Err,res,400)
    }
}
/**
 * @desc used for getting an getting an user Loyality Data
 * @param {*Object} req 
 * @param {*Object} res 
 */
const getGoogleMatrixData = async (req,res)=>{
    try{   

        let sourceLatitude=req.query.source_latitude;
        let sourceLongitude=req.query.source_longitude;
        let destLongitude=req.query.dest_longitude;
        let destLatitude=req.query.dest_latitude;
        let mUnit=await Universal.getMeausringUnit(req.dbName);
        logger.debug("===mUnit=====>>",mUnit,req.query);
        let apiKey=await Universal.getGoogleApiKey(req.dbName);
        let matrixData=await Universal.getDistanceMatrix(sourceLatitude,
            sourceLongitude,destLatitude,destLongitude,apiKey);
        let distance=(matrixData.distanceValue)/1000;
        let duration = matrixData.duration
        // distance=parseInt(mUnit)==3959?distance*0.621371:distance
        sendResponse.sendSuccessData({distance:distance,duration:duration}, constant.responseMessage.SUCCESS, res,200);
    }catch(err){
        logger.debug("==ER!==",err)
        return sendResponse.sendErrorMessage("Something went wrong!",res,400);
    }
}


/**
 * @desc used for getting an getting user distance
 * @param {*Object} req 
 * @param {*Object} res 
 */
const getGoogleMatrixDataV1 = async (req,res)=>{
    try{    
        // let sourceLatitude=req.query.source_latitude;
        // let sourceLongitude=req.query.source_longitude;
        // let destLongitude=req.query.dest_longitude;
        // let destLatitude=req.query.dest_latitude;
        logger.debug("========req.body======  ====",    req.body)
        logger.debug("========req.body==========",req.body.supplierUserLatLongs)
        logger.debug("========req.body==========",typeof req.body.supplierUserLatLongs)

        let supplierUserLatLongs = req.body.supplierUserLatLongs && req.body.supplierUserLatLongs.length>0?req.body.supplierUserLatLongs :[]
      
        let mUnit=await Universal.getMeausringUnit(req.dbName);
        logger.debug("===mUnit=====>>",mUnit,req.query);
        let apiKey=await Universal.getGoogleApiKey(req.dbName);
        let result = []
        for(const [index,i] of supplierUserLatLongs.entries()){

            let matrixData=await Universal.getDistanceMatrix(i.source_latitude,
                i.source_longitude,i.dest_latitude,i.dest_longitude,apiKey);
                logger.debug("=========matrix data==========",matrixData)
            let distance=(matrixData.distanceValue)/1000;
            let duration = matrixData.durationValue
            distance=parseInt(mUnit)==3959?distance*0.621371:distance
            result.push({distance:distance,duration:duration,supplierId:i.supplierId})
    
        }
        sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res,200);
    }catch(err){
        logger.debug("==ER!==",err)
        return sendResponse.sendErrorMessage("Something went wrong!",res,400);
    }
}







/**
 * @desc used for getting an getting an supplier list with tag wise
 * @param {*Object} req 
 * @param {*Object} res 
 */
const getSupplierListWithTagId = async (req,res)=>{
    try{    
        var day = moment().isoWeekday();
        day=day-1;
        let mUnit=await Universal.getMeausringUnit(req.dbName);
        var day = moment().isoWeekday();
        day=day-1;
        let tag_id = req.query.tag_id
        let latitude = req.query.latitude
        let longitude = req.query.longitude
        let languageId = req.query.languageId

        var sql = "select *,if( count(*)>1,1,0) as is_multi_branch from ( select s.id,s.delivery_radius,si.image_path as supplier_image,sc.onOffComm,s.delivery_prior_total_time as delivery_prior_time,s.delivery_min_time,s.delivery_max_time,s.urgent_delivery_time,s.total_reviews,s.rating,sb.id as supplier_branch_id, ";
        sql += " sml.address,sml.name,s.logo,st.is_open as status,st.start_time,st.end_time," +
            " ( select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"is_open\": \"', st.is_open, '\", ','\"week_id\": \"', st.week_id,'\", ','\"start_time\": \"', st.start_time,'\",','\"end_time\": \"', st.end_time, '\"','}') SEPARATOR ','),''),']') AS bData from  supplier_timings  st where st.supplier_id = s.id  )  as timings,s.payment_method,sc.commission_package,("+mUnit+" * acos (cos ( radians(" + latitude + ") )* cos( radians( s.latitude ) )* cos( radians( s.longitude ) - radians(" + longitude + ") )+ sin ( radians(" + latitude + ") )* sin( radians( s.latitude ) ))) AS distance from supplier_category sc join supplier s on s.id = " +
            " sc.supplier_id join supplier_timings st on st.supplier_id = s.id join supplier_branch sb on ";
        sql += " s.id = sb.supplier_id join supplier_ml " +
            " sml on s.id = sml.supplier_id left join supplier_assigned_tags stg on stg.supplier_id = s.id left join supplier_image si on si.supplier_id=s.id where ";
        sql += " s.is_live = ? and s.is_active = ? and s.is_deleted =0 and sb.is_live = ? and sml.language_id = ? " +
            " and stg.tag_id=? and sb.is_deleted = ?  and st.week_id =? GROUP BY s.id,sb.id having distance<s.delivery_radius ) as sub group by id";
        let result=await ExecuteQ.Query(req.dbName,sql,[1,1,1,languageId,tag_id,0,day])
        if(result && result.length>0){
            for(var i =0;i<result.length;i++){
                result[i].timing =result[i] && result[i].timings?JSON.parse(result[i].timings):[];
    
            }
        }
        let data = {
            "supplierList":result
        }
        sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,200);
    }catch(err){
        logger.debug("==ER!==",err)
        return sendResponse.sendErrorMessage("Something went wrong!",res,400);
    }
}

/**
 * @desc used for getting an getting an supplier list with tag wise
 * @param {*Object} req 
 * @param {*Object} res 
 */
const getSupplierListWithTagIdV1 = async (req,res)=>{
    try{    
        var day = moment().isoWeekday();
        day=day-1;
        let mUnit=await Universal.getMeausringUnit(req.dbName);
        var day = moment().isoWeekday();
        day=day-1;
        let tag_id = req.query.tag_id
        let latitude = req.query.latitude
        let longitude = req.query.longitude
        let languageId = req.query.languageId

        var sql = "select *,if( count(*)>1,1,0) as is_multi_branch from ( select s.id,s.delivery_radius,si.image_path as supplier_image,sc.onOffComm,s.delivery_prior_total_time as delivery_prior_time,s.delivery_min_time,s.delivery_max_time,s.urgent_delivery_time,s.total_reviews,s.rating,sb.id as supplier_branch_id, ";
        sql += " sml.address,sml.name,s.logo,st.is_open as status,st.start_time,st.end_time," +
        " IF((select st_contains(coordinates,point("+latitude+","+longitude+")) as is_under from 	admin_geofence_areas aga join supplier_assigned_geofence_areas saga on saga.admin_geofence_id=aga.id where aga.is_live=1 and saga.supplier_id = s.id having is_under>0 limit 1)>0,1,0) as is_under_zone,"+
        " ( select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"is_open\": \"', st.is_open, '\", ','\"week_id\": \"', st.week_id,'\", ','\"start_time\": \"', st.start_time,'\",','\"end_time\": \"', st.end_time, '\"','}') SEPARATOR ','),''),']') AS bData from  supplier_timings  st where st.supplier_id = s.id  )  as timings,s.payment_method,sc.commission_package,("+mUnit+" * acos (cos ( radians(" + latitude + ") )* cos( radians( s.latitude ) )* cos( radians( s.longitude ) - radians(" + longitude + ") )+ sin ( radians(" + latitude + ") )* sin( radians( s.latitude ) ))) AS distance from supplier_category sc join supplier s on s.id = " +
            " sc.supplier_id join supplier_timings st on st.supplier_id = s.id join supplier_branch sb on ";
        sql += " s.id = sb.supplier_id join supplier_ml " +
            " sml on s.id = sml.supplier_id left join supplier_assigned_tags stg on stg.supplier_id = s.id left join supplier_image si on si.supplier_id=s.id where ";
        sql += " s.is_live = ? and s.is_active = ? and s.is_deleted =0 and sb.is_live = ? and sml.language_id = ? " +
            " and stg.tag_id=? and sb.is_deleted = ?  and st.week_id =? GROUP BY s.id,sb.id having is_under_zone>0 ) as sub group by id";
        let result=await ExecuteQ.Query(req.dbName,sql,[1,1,1,languageId,tag_id,0,day])
        if(result && result.length>0){
            for(var i =0;i<result.length;i++){
                result[i].timing =result[i] && result[i].timings?JSON.parse(result[i].timings):[];
    
            }
        }
        let data = {
            "supplierList":result
        }
        sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,200);
    }catch(err){
        return sendResponse.sendErrorMessage("Something went wrong!",res,400);
    }
}

module.exports={
    UpdateOrderStatusbyAgentByGroup:UpdateOrderStatusbyAgentByGroup,
    getSupplierListWithTagId:getSupplierListWithTagId,
    updateAccessToken:updateAccessToken,
    getGoogleMatrixData:getGoogleMatrixData,
    updateDeviceToken:updateDeviceToken,
    UpdateOrderStatusbyAgent:UpdateOrderStatusbyAgent,
    DeviceToken:DeviceToken,
    SupplierList:SupplierList,
    SubCategoryWithOffer:SubCategoryWithOffer,
    SupplierSearch:SupplierSearch,
    getOrderStatus:getOrderStatus,
    getUserDetails:getUserDetails,
    getGiftCard:getGiftCard,
    supplierResponseSameResponse:supplierResponseSameResponse,
    SupplierWithTiming:SupplierWithTiming,
    getGoogleMatrixDataV1:getGoogleMatrixDataV1,
    SupplierListWithFastestDelivery:SupplierListWithFastestDelivery,
    getSupplierListWithTagIdV1:getSupplierListWithTagIdV1,
    SupplierWithTimingV1:SupplierWithTimingV1
}
