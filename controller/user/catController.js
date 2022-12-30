

var async = require('async');
var sendResponse = require('../../routes/sendResponse');
var constant = require('../../routes/constant');
var func = require('../../routes/commonfunction');
var consts=require('./../../config/const')
const lib=require('../../lib/NotificationMgr')
var _ = require('underscore');
var something = "Something went wrong";
var client = require('twilio')("AC4b6d9ecd84afd6db7cf9ac5f055d7784","782e67bf1f26170706acd639d757ae08");
var moment = require('moment');
var pushNotifications = require('../../routes/pushNotifications');
var orderFunction = require('../../routes/orderFunction');
const UniversalFunction=require('../../util/Universal')
const Execute = require('../../lib/Execute')
var AdminMail = "ops@royo.com";
var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = config.get('server.debug_level');
var crypto = require('crypto')
    algorithm = consts.SERVER.CYPTO.ALGO,
    crypto_password =  consts.SERVER.CYPTO.PWD
/**
 * @desc used for listing an subcategory listing
 * @param {*Object} req 
 * @param {*Object} res 
 */
const subCateList=async (req,res)=>{

    try{
        var subCatId=req.query.subCatId;
        var supplierId=req.query.supplierId,data;
        var level=req.query.level
        if(supplierId!=undefined && supplierId!="" && supplierId!=null){
            data=await getSupplierCategoryV1(req.dbName,subCatId,supplierId,level)
        }   
        else{
            data=await getSubCatList(req.dbName,subCatId)
        }
        // if()
        sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, 200);
    }
    catch(err){
        console.log(err);
        sendResponse.somethingWentWrongError(res);
    }
}
function getSubCatList(dbName,id){
    return new Promise(async (resolve,reject)=>{
                try{
                    var sql = "select IF((select count(*) from categories cts join cat_variants ctv on ctv.cat_id="+parseInt(id)+")>0,1,0) as is_variant,id,name,is_live,icon,image,illustration,parent_id from categories where is_deleted=? and parent_id=?"
                    let data=await Execute.Query(dbName,sql,[0, parseInt(id)]);
                    resolve(data);
                }
                catch(Err){
                    logger.debug("=====Err!==",Err)
                    sendResponse.somethingWentWrongError(res);
                }
        //   var sql = "select IF((select count(*) from categories cts join cat_variants ctv on ctv.cat_id="+parseInt(id)+")>0,1,0) as is_variant,id,name,is_live,icon,image,illustration,parent_id from categories where is_deleted=? and parent_id=?"
        //   var statment=multiConnection[dbName].query(sql, [0, parseInt(id)], function (err1, data) {
        //     // console.log(statment.sql);
        //     if (err1) {
        //             sendResponse.somethingWentWrongError(res);
        //         } else {
        //             resolve(data);
        //         }
        //     });
    })

}
function getSupplierCategoryV1(dbName,cat_id,supplier_id,level){
    var sql="",catData=[];
    return new Promise(async (resolve,reject)=>{
        try{
        if(level==1){   
            sql="select ct.id,IF((select count(*) from categories cts join cat_variants ctv on ctv.cat_id="+cat_id+")>0,1,0) as is_variant,ct.is_live,ct.icon,ct.illustration,ct.image,ct.parent_id,ct.name,sc.sub_category_id from supplier_category sc inner join categories ct on"+
                " (ct.id=sc.sub_category_id or ct.id = sc.detailed_sub_category_id ) where sc.category_id=? and sc.supplier_id=? and ct.is_deleted=? and ct.parent_id="+cat_id+"  group by name"
                catData=await Execute.Query(dbName,sql,[cat_id,supplier_id,0])
                resolve(catData)
            }
        else{
            let subIds=[];
            let subCateData=await Execute.Query(dbName,`select id,parent_id from categories where parent_id=? and is_deleted=0`,[cat_id]);
            if(subCateData && subCateData.length>0){
                for(const [index,i] of subCateData.entries()){
                    subIds.push(i.id)
                }
            }
            let supplierCateData=[],isMatchFirstIf=false;
            for(const [index,i] of subIds.entries()){
                let subCategoryData=await Execute.Query(dbName,`select sub_category_id,detailed_sub_category_id 
                from supplier_category sc where  sc.sub_category_id=? and supplier_id=? and detailed_sub_category_id=?`,[i,supplier_id,0]);

                let isUptoSubCate=await Execute.Query(dbName,`select sub_category_id,detailed_sub_category_id 
                from supplier_category sc where  sc.sub_category_id=? and supplier_id=?`,[cat_id,supplier_id]);
                if(isUptoSubCate && isUptoSubCate.length>0){
                        console.log("===isUptoSubCate[index]==sub_category_id===>>",i,isUptoSubCate[index])
                    // if(isUptoSubCate[index] && isUptoSubCate[index].detailed_sub_category_id && isUptoSubCate[index].detailed_sub_category_id!=undefined && parseInt(isUptoSubCate[index].detailed_sub_category_id)==0){
                    //  if(isUptoSubCate[index] && isUptoSubCate[index].detailed_sub_category_id!=undefined && parseInt(isUptoSubCate[index].detailed_sub_category_id)==0 && parseInt(i)==parseInt(isUptoSubCate[index].sub_category_id)){
                        isMatchFirstIf= (isUptoSubCate[index] && parseInt(isUptoSubCate[index].detailed_sub_category_id)==0) || (isUptoSubCate[index] && isUptoSubCate[index].detailed_sub_category_id!=undefined && parseInt(isUptoSubCate[index].detailed_sub_category_id)==0 && parseInt(i)==parseInt(isUptoSubCate[index].sub_category_id))?true:false

                    if((isUptoSubCate[index] && parseInt(isUptoSubCate[index].detailed_sub_category_id)==0) || (isUptoSubCate[index] && isUptoSubCate[index].detailed_sub_category_id!=undefined && parseInt(isUptoSubCate[index].detailed_sub_category_id)==0 && parseInt(i)==parseInt(isUptoSubCate[index].sub_category_id))){

                        sql="select ct.id,IF((select count(*) from categories cts join cat_variants ctv on ctv.cat_id="+cat_id+")>0,1,0) as is_variant,ct.is_live,ct.icon,ct.illustration,ct.image,ct.parent_id,ct.name,sc.sub_category_id from supplier_category sc inner join categories ct on"+
                        " ct.id=sc.sub_category_id where sc.sub_category_id=?   and  sc.supplier_id=? and ct.is_deleted=? group by name"
                        supplierCateData=await Execute.Query(dbName,sql,[i,supplier_id,0]);
                        if(supplierCateData && supplierCateData.length>0){
                            catData.push(supplierCateData[0])
                        }
                        else{
                            sql="select ct.id,IF((select count(*) from categories cts join cat_variants ctv on ctv.cat_id="+cat_id+")>0,1,0) as is_variant,ct.is_live,ct.icon,ct.illustration,ct.image,ct.parent_id,ct.name,sc.sub_category_id from supplier_category sc inner join categories ct on"+
                            " ct.id=sc.detailed_sub_category_id where sc.detailed_sub_category_id=?  and  sc.supplier_id=? and ct.is_deleted=? group by name"
                            supplierCateData=await Execute.Query(dbName,sql,[i,supplier_id,0]);
                            if(supplierCateData && supplierCateData.length>0){
                                catData.push(supplierCateData[0])
                            }
                        }
                       
                        console.log("====catData=>>",catData)
                    }
                    else if(subCategoryData && subCategoryData.length>0 && isMatchFirstIf==false){
                    // else if(subCategoryData && subCategoryData.length>0){
                        sql="select ct.id,IF((select count(*) from categories cts join cat_variants ctv on ctv.cat_id="+cat_id+")>0,1,0) as is_variant,ct.is_live,ct.icon,ct.illustration,ct.image,ct.parent_id,ct.name,sc.sub_category_id from supplier_category sc inner join categories ct on"+
                        " ct.id=sc.sub_category_id where sc.sub_category_id=?   and  sc.supplier_id=? and ct.is_deleted=? group by name"
                        supplierCateData=await Execute.Query(dbName,sql,[i,supplier_id,0]);
                        if(supplierCateData && supplierCateData.length>0){
                            catData.push(supplierCateData[0])
                        }
                    }
                    else if(isMatchFirstIf==false){
                        // else if(subCategoryData && subCategoryData.length>0){
                            sql="select ct.id,IF((select count(*) from categories cts join cat_variants ctv on ctv.cat_id="+cat_id+")>0,1,0) as is_variant,ct.is_live,ct.icon,ct.illustration,ct.image,ct.parent_id,ct.name,sc.sub_category_id from supplier_category sc inner join categories ct on"+
                            " ct.id=sc.sub_category_id where sc.sub_category_id=?   and  sc.supplier_id=? and ct.is_deleted=? group by name"
                            supplierCateData=await Execute.Query(dbName,sql,[i,supplier_id,0]);
                            if(supplierCateData && supplierCateData.length>0){
                                catData.push(supplierCateData[0])
                            }
                            else{
                                sql="select ct.id,IF((select count(*) from categories cts join cat_variants ctv on ctv.cat_id="+cat_id+")>0,1,0) as is_variant,ct.is_live,ct.icon,ct.illustration,ct.image,ct.parent_id,ct.name,sc.sub_category_id from supplier_category sc inner join categories ct on"+
                                " ct.id=sc.detailed_sub_category_id where sc.detailed_sub_category_id=?   and  sc.supplier_id=? and ct.is_deleted=? group by name"
                                supplierCateData=await Execute.Query(dbName,sql,[i,supplier_id,0]);
                                if(supplierCateData && supplierCateData.length>0){
                                    catData.push(supplierCateData[0])
                                }
                            }
                        }
                   
                    else{
                        sql="select ct.id,IF((select count(*) from categories cts join cat_variants ctv on ctv.cat_id="+cat_id+")>0,1,0) as is_variant,ct.is_live,ct.icon,ct.illustration,ct.image,ct.parent_id,ct.name,sc.sub_category_id from supplier_category sc inner join categories ct on"+
                        " ct.id=sc.detailed_sub_category_id where sc.detailed_sub_category_id=?   and  sc.supplier_id=? and ct.is_deleted=? group by name"
                        supplierCateData=await Execute.Query(dbName,sql,[i,supplier_id,0]);
                        if(supplierCateData && supplierCateData.length>0){
                            catData.push(supplierCateData[0])
                        }
                       
                    }
                }
                console.log("===isMatchFirstIf=catData=>>",isMatchFirstIf,catData)
            }
            console.log("====catData=>>",catData)
                resolve(catData)
        }
    }
        catch(Err){
            console.log("====ERR!==",Err)
            resolve([])
        }
        // var st=multiConnection[dbName].query(sql,[supplier_id,0],function(err,data){
        //     console.log("=-========getsuppliercategory sql=================",st.sql); 
        //     if(err){
        //             reject(err)
        //         }
        //         else{
        //                 resolve(data)
        //             }
        //     })
        })
 
}
function getSupplierCategory(dbName,cat_id,supplier_id,level){
        var sql=""
        if(level==1){
            sql="select ct.id,IF((select count(*) from categories cts join cat_variants ctv on ctv.cat_id="+cat_id+")>0,1,0) as is_variant,ct.is_live,ct.icon,ct.illustration,ct.image,ct.parent_id,ct.name,sc.sub_category_id from supplier_category sc inner join categories ct on"+
                " ct.id=sc.sub_category_id where sc.category_id=?  and  sc.supplier_id=? and ct.is_deleted=? and ct.parent_id!=0  group by name"
        }
        else{
            sql="select ct.id,IF((select count(*) from categories cts join cat_variants ctv on ctv.cat_id="+cat_id+")>0,1,0) as is_variant,ct.is_live,ct.icon,ct.illustration,ct.image,ct.parent_id,ct.name,sc.sub_category_id from supplier_category sc inner join categories ct on"+
            " ct.id=sc.detailed_sub_category_id where sc.sub_category_id=? and  sc.supplier_id=? and ct.is_deleted=?"
        }
    return new Promise((resolve,reject)=>{
        var st=multiConnection[dbName].query(sql,[cat_id,supplier_id,0],function(err,data){
            console.log("=-========getsuppliercategory sql=================",st.sql); 
            if(err){
                    reject(err)
                }
                else{
                        resolve(data)
                    }
            })
        })
 
}
const supplierSubCat=async (req,res)=>{
    try{
        var subCatId=req.query.subCatId;
        var supplierId=req.supplier.supplier_id;
        console.log("===supplier==",req.supplier);
        var level=req.query.level;
        
        var data=await getSupplierCategoryV1(req.dbName,subCatId,supplierId,level);        
        // if()
        sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, 200);
    }
    catch(err){
        console.log(err);
        sendResponse.somethingWentWrongError(res);
    }
}
const categoryList=async (req,res)=>{
    try{
        var suppier_id=req.query.supplier_id!=undefined && req.query.supplier_id!=""?req.query.supplier_id:0
        var cat_data=await UniversalFunction.AllParentCat(req.dbName,req.query.language_id,req.query.access_type,suppier_id);
        // var supplier_cat_data=await AllSuppParentCat(req.dbName,req.query.language_id,suppier_id);
        var all_sub_cat=await UniversalFunction.AllSubCat(req.dbName,req.query.language_id,suppier_id,req.query.access_type);        
        
        var final_data=await UniversalFunction.finalCatData(cat_data,all_sub_cat);
        sendResponse.sendSuccessData(final_data, constant.responseMessage.SUCCESS, res, 200);
    }
    catch(err){
        logger.error(err);
        sendResponse.somethingWentWrongError(res);
    }

}
const getMainCategoryList = async (req,res)=>{
    try{

        logger.debug("===============req.path======",req.path,typeof req.path)
        let params = req.query
        let search = params.search!="" && params.search!=undefined?params.search:""
        let isListBlockList=await Execute.Query(req.dbName,"select `key`,`value` from tbl_setting where `key`=? and `value`='1'",["list_block_category_on_admin"]);
        let blockSql=isListBlockList && isListBlockList.length>0?"":"";
        // logger.debug("=============query----------",params)
        // logger.debug("===========params.search========",params.search)
        let sql = ""
        let condition;
        let count_condition;
        
        if(req.supplier && req.supplier.supplier_id){
            logger.debug("===========enterrrrrrr=====")
            // and product.sub_category_id=c.id and product.detailed_sub_category_id=c.id
            sql = "select IF((select count(*)  from questions  where questions.category_id=c.id) > 0, 1, 0) as is_question,IF((select count(*)  from product  where  product.category_id=c.id and product.is_deleted='0') > 0, 1, 0) as is_product,IF((select COUNT(*) from categories cts where cts.parent_id=c.id )>0,1,0) as is_sub_category,c.payment_after_confirmation,c.terminology,c.category_flow,c.is_agent,c.agent_list,c.order_instructions,c.is_quantity,c.is_liquor,c.type,c.is_variant,c.commission,c.age_limit,c.id,c.image,c.icon,c.illustration,c.is_live,c.start_time,c.end_time,c.tax,c.is_dine, c.menu_type  from categories c join supplier_category sc on sc.category_id =c.id where c.parent_id=? and c.is_live=1 "+blockSql+" and sc.supplier_id =? and c.name LIKE '%" + search + "%' group by c.name  LIMIT ? OFFSET ?"
            if(params.limit==0){
                sql = sql.replace("LIMIT ? OFFSET ?","")
                condition = [0,req.supplier.supplier_id]
            }else{
                condition = [0,req.supplier.supplier_id,params.limit,params.offset]
            }            
                count_condition = [0,req.supplier.supplier_id]
        }else{
            // and product.sub_category_id=c.id and product.detailed_sub_category_id=c.id
            sql = "select IF((select count(*)  from questions  where questions.category_id=c.id) > 0, 1, 0) as is_question,IF((select count(*)  from product  where  product.category_id=c.id ) > 0, 1, 0) as is_product,IF((select COUNT(*) from categories cts where cts.parent_id=c.id )>0,1,0) as is_sub_category,c.terminology,c.order_instructions,c.is_liquor,c.category_flow,c.payment_after_confirmation,c.is_agent,c.agent_list,c.is_quantity,c.type,c.is_variant,c.commission,c.age_limit,c.id,c.image,c.icon,c.illustration,c.is_live,c.start_time,c.end_time,c.tax,c.is_dine, c.menu_type from categories c where c.parent_id=? "+blockSql+" and c.is_deleted= 0 and c.name LIKE '%" + search + "%'  LIMIT ? OFFSET ?"
            if(params.limit==0){
                sql = sql.replace("LIMIT ? OFFSET ?","")
                condition = [0]
            }else{
                condition = [0,params.limit,params.offset]    
            }
                count_condition = [0]        
        }


        var sql2 = "select cm.language_id,cm.name,cm.description,cm.category_id,cm.id,l.language_name from categories_ml cm join language l on l.id = cm.language_id  "

        let categories = await Execute.Query(req.dbName,sql,condition);

        let totalCategories = await Execute.Query(req.dbName,sql.replace('LIMIT ? OFFSET ?', ''),count_condition)

        logger.debug("======getMainCategoryList===1====",categories.length);
        // logger.debug("======================",sql2)
        let categoryMl = await Execute.Query(req.dbName,sql2,[]);
        // logger.debug("======getMainCategoryList===2====",categoryMl.length);

        let clubData = [];

        if(categories && categories.length>0){
             clubData = await getFinalList(categories,categoryMl);
            // logger.debug("======getMainCategoryList===3====",clubData.length);
        }

        let finalRes = {
            count : totalCategories.length,
            categories : clubData
        }
        sendResponse.sendSuccessData(finalRes, constant.responseMessage.SUCCESS, res, 200);
    }catch(err){
        logger.debug(err);
        sendResponse.somethingWentWrongError(res)
    }
}
function getFinalList(categories,categoryMl){
    return new Promise((resolve,reject)=>{
        var category = [];
        var categoryLength = categories.length;
        var categoryMllength = categoryMl.length;
    
        for (var i = 0; i < categoryLength; i++) {
            (function (i) {
                var categoriesMl = [];
                for (var j = 0; j < categoryMllength; j++) {
                    (function (j) {
                        if (categories[i].id == categoryMl[j].category_id) {
                            categoriesMl.push({
                                "id": categoryMl[j].id,
                                "name": categoryMl[j].name,
                                "language_id": categoryMl[j].language_id,
                                "language_name": categoryMl[j].language_name,
                                "description": categoryMl[j].description
                            });
                            if (j == categoryMllength - 1 ) {
                                category.push({
                                    "category_id": categories[i].id,
                                    "is_sub_category": categories[i].is_sub_category,
                                    "image": categories[i].image,
                                    "is_product":categories[i].is_product,
                                    "is_question":categories[i].is_question,
                                    "is_liquor":categories[i].is_liquor,
                                    "icon": categories[i].icon,
                                    "illustration": categories[i].illustration,
                                    "is_live": categories[i].is_live,
                                    "is_variant": categories[i].is_variant,
                                    "age_limit": categories[i].age_limit,
                                    "commission" : categories[i].commission,
                                    "category_flow": categories[i].category_flow,
                                    "is_dine": categories[i].is_dine,
                                    "is_agent": categories[i].is_agent,
                                    "agent_list": categories[i].agent_list,
                                    "payment_after_confirmation": categories[i].payment_after_confirmation,
                                    "is_quantity": categories[i].is_quantity,
                                    "order_instructions":categories[i].order_instructions,
                                    "type": categories[i].type,
                                    "start_time":categories[i].start_time,
                                    "end_time":categories[i].end_time,
                                    "tax":categories[i].tax,
                                    "terminology":categories[i].terminology,
                                    "menu_type":categories[i].menu_type,
                                    "category_name": categoriesMl
                                });
                                if (i == categoryLength - 1) {
                                    // logger.debug("=============categorycategorycategory====1===",category.length)
                                    resolve(category);
                                }
                            }
    
                        }
                        else {
                            // console.log("=============",categoriesMl.length)
                            if (j == categoryMllength - 1 ) {
                                category.push({
                                    "category_id": categories[i].id,
                                    "is_sub_category": categories[i].is_sub_category,
                                    "image": categories[i].image,
                                    "is_product":categories[i].is_product,
                                    "is_question":categories[i].is_question,
                                    "icon": categories[i].icon,
                                    "illustration": categories[i].illustration,
                                    "is_liquor":categories[i].is_liquor,
                                    "is_live": categories[i].is_live,
                                    "category_name": categoriesMl,
                                    "is_variant": categories[i].is_variant,
                                    "age_limit": categories[i].age_limit,
                                    "commission" : categories[i].commission,
                                    "category_flow": categories[i].category_flow,
                                    "is_dine": categories[i].is_dine,
                                    "is_agent": categories[i].is_agent,
                                    "agent_list": categories[i].agent_list,
                                    "is_quantity": categories[i].is_quantity,
                                    "start_time":categories[i].start_time,
                                    "end_time":categories[i].end_time,
                                    "payment_after_confirmation": categories[i].payment_after_confirmation,
                                    "tax":categories[i].tax,
                                    "order_instructions":categories[i].order_instructions,
                                    "terminology":categories[i].terminology,
                                    "menu_type":categories[i].menu_type,
                                    "type": categories[i].type
                                });
                                if (i == categoryLength - 1) {
                                    // logger.debug("=============categorycategorycategory====2===",category.length)
                                    resolve(category);
                                }
                            }
                        }
    
                    }(j))
                }
    
    
            }(i))
    
        }
    })
}
const AllSuppParentCat=(dbName,language_id,supplierId)=>{
    return new Promise((resolve,reject)=>{
        var sql;
        // if(type==undefined){
        //     sql="select categories.image,categories.icon,categories.category_flow,categories.parent_id,categories.id,categories_ml.name from categories inner join categories_ml on categories_ml.category_id=categories.id where categories.parent_id=? and categories.is_deleted=? and categories_ml.language_id=? and is_default=0"
        // }
        // else{
            sql="select sp.category_id,categories.image,categories.icon,categories.category_flow,categories.parent_id,categories.id,categories_ml.name from categories inner join categories_ml on categories_ml.category_id=categories.id join supplier_category sp on sp.category_id=categories.id where categories.parent_id=? and categories.is_deleted=? and categories_ml.language_id=? and sp.supplier_id=? group by sp.category_id order by is_default desc;"
        // }       
       var st= multiConnection[dbName].query(sql,[0,0,parseInt(language_id),parseInt(supplierId)],function(err,data){
           logger.debug(st.sql);
            if(err){
                reject(err)
            }
            else{
                resolve(data)
            }
        })
})

}
const finalCatData=(cat_data,all_sub_cat)=>{
    var final_data=[],supplier_data=[],flow
    return new Promise((resolve,reject)=>{
        for (const i of cat_data) {
            logger.debug("===!!")
            // i.type=0;
            flow=i.category_flow.split(">", 2).pop();
            // if(flow=="Suppliers" || flow=="PickUpTime"){                   
            //     i.sub_category=_.filter(suppler_data,function(s){
            //         s.type=1
            //         return s.id==i.id
            //     })
            //     for(const j of  i.sub_category){
            //         j.sub_category=getNestedChildren(all_sub_cat,j.id);
            //     }
            // }
            // else{
                i.sub_category= getNestedChildren(all_sub_cat,i.id);    
            // }
            final_data.push(i)
          
        }
        logger.debug("=====>>>")
        resolve(final_data)

    })

}
const finalSupCatData=(cat_data,all_sub_cat)=>{
    var final_data=[],supplier_data=[],flow
    return new Promise((resolve,reject)=>{
        for (const i of cat_data) {
            logger.debug("===!!")
            // i.type=0;
            // flow=i.category_flow.split(">", 2).pop();
            // if(flow=="Suppliers" || flow=="PickUpTime"){                   
            //     i.sub_category=_.filter(suppler_data,function(s){
            //         s.type=1
            //         return s.id==i.id
            //     })
            //     for(const j of  i.sub_category){
            //         j.sub_category=getNestedChildren(all_sub_cat,j.id);
            //     }
            // }
            // else{
                i.sub_category= getNestedChildren(all_sub_cat,i.id);    
            // }
            final_data.push(i)
          
        }
        logger.debug("=====>>>",final_data)
        resolve(final_data)

    })

}
/**function to block/unblock the category and send the response or error*/
var blockUnblockCategory = async (req,res)=>{
    try{
        var category_id = req.body.category_id;
        var is_live = req.body.is_live
        var blockUnblock = await blockUnblockCat(category_id,is_live,req.dbName);
        var final_data = {}
        sendResponse.sendSuccessData(final_data, constant.responseMessage.SUCCESS, res, 200);
    }
    catch(err){
        logger.error(err);
        sendResponse.somethingWentWrongError(res);
    }

}

/**function to block or unblock the category */
function blockUnblockCat(category_id,is_live,dbName){
    return new Promise((resolve,reject)=>{
        var sql = "update categories c1,categories c2 set c1.is_live=?,c2.is_live=? where c1.id=? and (c1.id=c2.parent_id or c2.id=?)"
        var stmt = multiConnection[dbName].query(sql,[is_live,is_live,category_id,category_id],function(err,data){
            logger.debug("============",stmt.sql)
            if(err){
                reject(err)
            }else{
                logger.debug("=======-------======",data)
                resolve(data)
            }
        })
    })
}



// function filterSuppliu
function getSuppliers(dbName){
    return new Promise((resolve,reject)=>{
        var sql="select categories.parent_id,supplier.is_deleted,supplier.name as name,categories.id as id from supplier_category inner join categories on categories.id=supplier_category.category_id inner join supplier on supplier.id=supplier_category.supplier_id group by supplier_category.supplier_id having supplier.is_deleted=? and categories.parent_id=?"
        var st=  multiConnection[dbName].query(sql,[0,0],function(err,data){
        logger.debug(st.sql);
            if(err){
                reject(err)
            }   
            else{
                  logger.debug("=======+++DATA!===",data)
                  resolve(data);
            }
        })
    })
}
// function getNestedChildren(arr, parent) {
//     var out = [];
//     for(var i in arr) {
//         if(arr[i].parent_id == parent) {
//             var sub_category = getNestedChildren(arr, arr[i].id);

//             if(sub_category.length) {
//                 arr[i].sub_category = sub_category
//             }
//             out.push(arr[i])
//         }
//     }
//     // logger.debug("=========OUT==",out);
//     return out;
// }
// function AllSubCat(dbName,language_id,supplier_id,type){
//     return new Promise((resolve,reject)=>{
//         if(supplier_id!=0 && supplier_id!=undefined && type=="supplier"){
//             var sql = "select IF( ( select count(*) from supplier_category where supplier_category.supplier_id = "+supplier_id+" and "+
//                       "( supplier_category.sub_category_id = categories.id OR supplier_category.detailed_sub_category_id = categories.id ) ) > 0, 1, 0 ) as is_assign, "+
//                       "sc.sub_category_id, categories.image, categories.icon, categories.parent_id, categories.id, categories_ml.name from categories inner join categories_ml "+
//                       "on categories_ml.category_id = categories.id join supplier_category sc on sc.sub_category_id = categories.id or sc.detailed_sub_category_id=categories.id "+
//                       "where categories.parent_id != ? and categories.is_deleted = ? and categories_ml.language_id = ? and sc.supplier_id="+supplier_id+" group by name"
//         }else{
//             var sql="select IF((select  count(*)  from  supplier_category where supplier_category.supplier_id="+parseInt(supplier_id)+" and (supplier_category.sub_category_id = categories.id OR supplier_category.detailed_sub_category_id = categories.id)) > 0, 1, 0) as is_assign,categories.image,categories.icon,categories.parent_id,categories.id,categories_ml.name from categories inner join categories_ml on categories_ml.category_id=categories.id where categories.parent_id!=? and categories.is_deleted=? and categories_ml.language_id=?"
//         }
//         var st= multiConnection[dbName].query(sql,[0,0,parseInt(language_id)],function(err,data){
//            logger.debug("===STMT==",st.sql)
//             if(err){
//                 reject(err)
//             }
//             else{
//                 resolve(data)
//             }
//         })

//     })
// }
// function AllParentCat(dbName,language_id,type,supplier_id){
//     // var GetAgentDbData=await getAgentDbInformation(req.dbName);
//     // var agentConnection=await RunTimeAgentConnection(GetAgentDbData);
//     return new Promise((resolve,reject)=>{
//         var sql;
//         if(type==undefined){
//             logger.debug("=======here================1===========")
//             sql="select IF((select  count(*)  from  supplier_category where supplier_category.category_id = categories.id and supplier_category.supplier_id="+parseInt(supplier_id)+") > 0, 1, 0) as is_assign,categories.image,categories.icon,categories.category_flow,categories.parent_id,categories.id,categories_ml.name from categories inner join categories_ml on categories_ml.category_id=categories.id where categories.is_live=1 and categories.parent_id=? and categories.is_deleted=? and categories_ml.language_id=? and is_default=0"
//         }
//         else{
//             logger.debug("=======here================2===========")
//             // if(supplier_id!=undefined && supplier_id!=0){
//             //     logger.debug("=======here================3===========",supplier_id)
//             //     sql="select IF((select  count(*)  from  supplier_category where supplier_category.category_id = categories.id and supplier_category.supplier_id="+parseInt(supplier_id)+") > 0, 1, 0) as is_assign,categories.image,categories.icon,categories.category_flow,categories.parent_id,categories.id,categories_ml.name from categories inner join categories_ml on categories_ml.category_id=categories.id join supplier_category sc on sc.category_id = categories.id where categories.parent_id=? and categories.is_deleted=? and categories_ml.language_id=? and sc.supplier_id = "+supplier_id+" group by name order by is_default desc;"
//             // }else{
//                 logger.debug("=======here================4===========")
//                 sql="select IF((select  count(*)  from  supplier_category where supplier_category.category_id = categories.id and supplier_category.supplier_id="+parseInt(supplier_id)+") > 0, 1, 0) as is_assign,categories.image,categories.icon,categories.category_flow,categories.parent_id,categories.id,categories_ml.name from categories inner join categories_ml on categories_ml.category_id=categories.id where categories.is_live=1 and categories.parent_id=? and categories.is_deleted=? and categories_ml.language_id=? order by is_default desc;"
//             // }
//         }       
//        var st= multiConnection[dbName].query(sql,[0,0,parseInt(language_id)],function(err,data){
//            logger.debug(st.sql);

//             if(err){
//                 reject(err)
//             }
//             else{
//                 resolve(data)
//             }
//         })

//     })
// }


module.exports={
    subCateList:subCateList,
    supplierSubCat:supplierSubCat,
    categoryList:categoryList,
    blockUnblockCategory:blockUnblockCategory,
    getMainCategoryList : getMainCategoryList
}
