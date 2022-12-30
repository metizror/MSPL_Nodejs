/**
 * =================================================================================
 * created by cbl-147
 * @description used for performing an variants of product related action from admin
 * =================================================================================
 */

var async = require('async');
var sendResponse = require('../../routes/sendResponse');
var constant = require('../../routes/constant');
var func = require('../../routes/commonfunction');
var consts=require('./../../config/const')
let fs = require('fs');
const lib=require('../../lib/NotificationMgr')
var _ = require('underscore');
var something = "Something went wrong";
var client = require('twilio')("AC4b6d9ecd84afd6db7cf9ac5f055d7784","782e67bf1f26170706acd639d757ae08");
var moment = require('moment');
var pushNotifications = require('../../routes/pushNotifications');
var orderFunction = require('../../routes/orderFunction');
var loginFunctions = require('../../routes/loginFunctions');
var AdminMail = "ops@royo.com";
var crypto = require('crypto')
var chunk = require('chunk');
const ExecuteQ=require('../../lib/Execute');
const Universal=require('../../util/Universal');
const csv = require('fast-csv');
var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = config.get('server.debug_level');


    algorithm = consts.SERVER.CYPTO.ALGO,
    crypto_password =  consts.SERVER.CYPTO.PWD
/**
 * @description used for listing an variant product from admin panel
 * @param {Object} req 
 * @param {*Object} res 
 */
const variantList=async (req,res)=>{
    try{
        var accessToken = req.body.accessToken;
        var authSectionId = req.body.sectionId;
        var category_id=req.body.category_id,finalVariantArray=[];
        var manValues = [category_id];
        // var sql = "select cat_variants.name,cat_variants.id,CONCAT('[',GROUP_CONCAT(CONCAT('{\"name\":\"',cat_variants_ml.name,'\",\"languageId\":\"',cat_variants_ml.language_id,'\"}')),']') as names"+ 
        // " from cat_variants inner join cat_variants_ml on cat_variants_ml.cat_variant_id=cat_variants.id where cat_variants.cat_id=? and cat_variants.deleted_by=?;"; 
        var sql = "select cat_variants_ml.id as ml_id,cat_variants_ml.name,cat_variants.id,cat_variants.variant_type,cat_variants_ml.language_id from cat_variants inner join cat_variants_ml on cat_variants_ml.cat_variant_id=cat_variants.id where cat_variants.cat_id=? and cat_variants.deleted_by=? GROUP by cat_variants.name"
        let catVariants=await ExecuteQ.Query(req.dbName,sql,[parseInt(category_id),0])
        //    var st= multiConnection[req.dbName].query(sql, [parseInt(category_id),0], function (err, catVariants) {
    //     console.log(st.sql);    
    //     if (err) {
    //         logger.debug("============error some where in variant list========",st.sql,err)
    //             sendResponse.somethingWentWrongError(res);
    //         }
    //         else {
                var variant = [];
                if (variantLength == 0) {
                    sendResponse.sendSuccessData(variant, constant.responseMessage.SUCCESS, res, 200);
                }
                else{
                    // con
                    var after_group=_.groupBy(catVariants,"id"),json_variant={};
                    _.mapObject(after_group,function(val,key){
                        json_variant.id=key,
                        json_variant.name=val                       
                        finalVariantArray.push(json_variant)
                        json_variant={}
                    })            
                    // logger.debug("_==========finalvarint array======",finalVariantArray[0].name[0].variant_type)        
                    var variantLength = finalVariantArray.length;
                    // var variantID=catVariants && catVariants[0].id;
                    console.log("=finalVariantArray=",finalVariantArray);

                    var sql2 = "select value,vr.id,vr.cat_variant_id from variants vr inner join cat_variants cvt on cvt.id=vr.cat_variant_id and vr.deleted_by=? and cvt.deleted_by=0"; 
                    let variants=await ExecuteQ.Query(req.dbName,sql2,[0])
                    // multiConnection[req.dbName].query(sql2,[0],function (err, variants) {
                    //     console.log(err,variant)
                    //     if (err) {
                    //         logger.debug("========error in between in the variant list==========",err)
                    //         sendResponse.somethingWentWrongError(res);
                    //     }
                    //     else{
                            console.log(varianValueLength)
                            var varianValueLength = variants.length;                 
                            for (var i = 0; i < variantLength; i++) {
                                (function (i) {
                                    var variantData=[];

                                    if(varianValueLength==0){
                                        variant.push({
                                            "variant_name":finalVariantArray[i].name,
                                            "id":finalVariantArray[i].id,
                                            "variant_type": finalVariantArray[i].name[0].variant_type,
                                            "variant_values":[]
                                            })
                                    }

                                    else{

                                    for(var j=0;j<varianValueLength;j++){
    
                                        (function(j){
    
                                            if(finalVariantArray[i].id==variants[j].cat_variant_id){
    
                                                console.log("====",i,variantLength)
    
                                                variantData.push({
                                                        "value":variants[j].value,
                                                        "id":variants[j].id
                                                })
    
                                                if(j==varianValueLength-1){                                                
                                                    variant.push({
                                                            "variant_name":finalVariantArray[i].name,
                                                            "id":finalVariantArray[i].id,
                                                            "variant_type": finalVariantArray[i].name[0].variant_type,
                                                            "variant_values":variantData
                                                    })
                                                }
    
                                            }
                                            else{
                                                if(j==varianValueLength-1){
                                                    variant.push({
                                                            "variant_name":finalVariantArray[i].name,
                                                            "id":finalVariantArray[i].id,
                                                            "variant_type": finalVariantArray[i].name[0].variant_type,
                                                            "variant_values":variantData
                                                    })
                                                }
                                            }
    
                                        }(j))
                                    }
                                }
                                }(i))
                            
                        }
                        sendResponse.sendSuccessData(variant, constant.responseMessage.SUCCESS, res, 200);
                    // }
                    
                    // })
             
        }
    //         }
    // })
    }
    catch(err){
        console.log("===ERRR!==",err)
        sendResponse.somethingWentWrongError(res);
    }

}

const importCategoryVariantsv1 = async (req, res) => {
    try {
        let categoryId = req.body.catId || 0;
        let fileRows = [];
        let fileName = req.files.file.name
        let fileExtension = fileName.substring(fileName.lastIndexOf(".") + 1);
        logger.debug("=======fileExtension======>>", fileExtension);

        let keyQuery = "select `value` from tbl_setting where `key` = ?";
        let importkeyData = await ExecuteQ.Query(req.dbName, keyQuery, ["enable_category_variant_import"]);
        console.log(importkeyData[0].value)
        if (importkeyData[0] && importkeyData[0].value!=0) {
            await updateCatVarient(req.dbName, categoryId);
            if (fileExtension == "csv") {
                if (req.files.file) {
                    csv.parseFile(req.files.file.path)
                        .on("data", function (data) {
                            //logger.debug("=====DATA!==>>",data);
                            fileRows.push(data); // push each row
                            // logger.log("====================<<<<<<<<<<>>>>>>>>>>>>",fileRows[0])
                        })
                        .on("end", async function () {
                            await fs.unlinkSync(req.files.file.path); // remove temp file

                            let validHeader = await Universal.validationHeaderCategoryVariantColumnsv1(fileRows[0], 2);

                            if (validHeader.isValid) {
                                console.log("valid", validHeader.row[0])
                                const dataRows = fileRows.slice(1, fileRows.length);
                                let definedNameOfValue = await Universal.getModifiedCategoryVariantDatav1(dataRows);

                                
                                let afterGroupByyear = _.groupBy(definedNameOfValue, "Year");
                                let yearQuery= await ExecuteQ.Query(req.dbName,"SELECT *  FROM `cat_variants` WHERE name=? and cat_id=?",["Year",categoryId]);

                                console.log(yearQuery)
                                if(yearQuery && yearQuery.length>0)
                                {
                                     
                                    for await (let [key, cvalues] of Object.entries(afterGroupByyear)) {
                                       logger.debug("=================================<<<<<<<>>>>>>>>>==========================",key)

                                        // let valueQuery=await ExecuteQ.Query(req.dbName,"select value from variants where value=?",[key])
                                
                                        // if(valueQuery && valueQuery.length>0){

                                        //  //nothing to dooooooooo
                                          
                                        // }
                                        // else{
                                            let variantQuery = "insert into variants (`cat_variant_id`,`value`,`created_by`) values (?,?,?)";
                                             await ExecuteQ.Query(req.dbName, variantQuery, [yearQuery[0].id, key, 0]);
 
                                      //  }

                                    }

                                }
                                else{
                                    console.log("innnnnnnnnnnnnnnnnnnnnnn elseeeeeeeeeeeeeeeeeeeeeeee")
                                  //  let afterGroupByyear = _.groupBy(definedNameOfValue, "Year");
                                    let catVariantQuery =
                                    "insert into cat_variants (`name`,`cat_id`,`variant_type`,`created_by`) values(?,?,?,?)";
                                let catVariantResult = await ExecuteQ.Query(req.dbName, catVariantQuery, [validHeader.row[0], categoryId, 0, 0]);


                                if (catVariantResult.insertId) {
                                    console.log("<<<<<<<<<<<<<<<<<<<<iN>>>>>>>>>>>>>>>>>>>>>>>>>>>")
                                    let variant_ml_values = [];
                                    variant_ml_values.push(validHeader.row[0], 14, catVariantResult.insertId);
                                    variant_ml_values.push(validHeader.row[0], 15, catVariantResult.insertId);
                                    final_ml_value = chunk(variant_ml_values, 3);
                                    console.log("========================>>>>>>>>>>>>>>>>>>>>>>", final_ml_value)
                                    let mlQuery = "insert into cat_variants_ml (`name`,`language_id`,`cat_variant_id`) values ?"
                                    await ExecuteQ.Query(req.dbName, mlQuery, [final_ml_value])


                                    for await (let [key, cvalues] of Object.entries(afterGroupByyear)) {
                                        // logger.debug("=================================<<<<<<<>>>>>>>>>==========================",key)

                                        let variantQuery = "insert into variants (`cat_variant_id`,`value`,`created_by`) values (?,?,?)"
                                        await ExecuteQ.Query(req.dbName, variantQuery, [catVariantResult.insertId, key, 0]);
                                    }
                                }


                                }


                                let afterGroupBymake = _.groupBy(definedNameOfValue, "Make");
                         
                                let makeQuery=await ExecuteQ.Query(req.dbName,"SELECT *  FROM `cat_variants` WHERE name=? and cat_id=?",["Make",categoryId]);

                                if(makeQuery && makeQuery.length>0)
                                {
                                    
                                    for await (let [key, cvalues] of Object.entries(afterGroupBymake)) {
                                       // logger.debug("=================================<<<<<<<>>>>>>>>>==========================",key)
                                    //    let valueQuery=await ExecuteQ.Query(req.dbName,"select value from variants where value=?",[key]);

                                    //     if(valueQuery && valueQuery.length>0){

                                    //   // do nothingg
                                    //     }
                                    //     else{
                                            let variantQuery = "insert into variants (`cat_variant_id`,`value`,`created_by`) values (?,?,?)"
                                            await ExecuteQ.Query(req.dbName, variantQuery, [makeQuery[0].id, key, 0]);
                                      //  }
                                    }

                                }
                                else{
                                   // let afterGroupBymake = _.groupBy(definedNameOfValue, "Make");
                                    let catVariantQuerybymake = "insert into cat_variants (`name`,`cat_id`,`variant_type`,`created_by`) values(?,?,?,?)";
                                    let catVariantResultofMake = await ExecuteQ.Query(req.dbName, catVariantQuerybymake, [validHeader.row[1], categoryId, 0, 0]);
    
    
                                    if (catVariantResultofMake.insertId) {
                                        console.log("<<<<<<<<<<<<<<<<<<<<iN>>>>>>>>>>>>>>>>>>>>>>>>>>>")
                                        let variant_ml_values = [];
                                        variant_ml_values.push(validHeader.row[1], 14, catVariantResultofMake.insertId);
                                        variant_ml_values.push(validHeader.row[1], 15, catVariantResultofMake.insertId);
                                        final_ml_value = chunk(variant_ml_values, 3);
                                        console.log("========================>>>>>>>>>>>>>>>>>>>>>>", final_ml_value)
                                        let mlQuery = "insert into cat_variants_ml (`name`,`language_id`,`cat_variant_id`) values ?"
                                        await ExecuteQ.Query(req.dbName, mlQuery, [final_ml_value])
    
    
                                        for await (let [key, cvalues] of Object.entries(afterGroupBymake)) {
                                            // logger.debug("=================================<<<<<<<>>>>>>>>>==========================",key)
    
                                            let variantQuery = "insert into variants (`cat_variant_id`,`value`,`created_by`) values (?,?,?)"
                                            await ExecuteQ.Query(req.dbName, variantQuery, [catVariantResultofMake.insertId, key, 0]);
                                        }
                                    }

                                }
                         

                                let afterGroupBymodel = _.groupBy(definedNameOfValue, "Model");
                                let modelQuery=await ExecuteQ.Query(req.dbName,"SELECT *  FROM `cat_variants` WHERE name=? and cat_id=?",["Model",categoryId]);

                                if(modelQuery && modelQuery.length>0)
                                {
                                    

                                    for await (let [key, cvalues] of Object.entries(afterGroupBymodel)) {
                                        //logger.debug("=================================<<<<<<<>>>>>>>>>==========================",key)

                                //         let valueQuery=await ExecuteQ.Query(req.dbName,"select value from variants where value=?",[key])
                                //         if(valueQuery && valueQuery.length>0)
                                //         {

                                //   //do nothing
                                //         }
                                //         else{

                                            let variantQuery = "insert into variants (`cat_variant_id`,`value`,`created_by`) values (?,?,?)"
                                            await ExecuteQ.Query(req.dbName, variantQuery, [modelQuery[0].id, key, 0]);
                                      //  }
                                    }

                                }
                                else{
                                    // let afterGroupBymodel = _.groupBy(definedNameOfValue, "Model");
                                    let catVariantQuerybymodel = "insert into cat_variants (`name`,`cat_id`,`variant_type`,`created_by`) values(?,?,?,?)";
                                    let catVariantResultofModel = await ExecuteQ.Query(req.dbName, catVariantQuerybymodel, [validHeader.row[2], categoryId, 0, 0]);
    
    
                                    if (catVariantResultofModel.insertId) {
                                        console.log("<<<<<<<<<<<<<<<<<<<<iN>>>>>>>>>>>>>>>>>>>>>>>>>>>")
                                        let variant_ml_values = [];
                                        variant_ml_values.push(validHeader.row[2], 14, catVariantResultofModel.insertId);
                                        variant_ml_values.push(validHeader.row[2], 15, catVariantResultofModel.insertId);
                                        final_ml_value = chunk(variant_ml_values, 3);
                                        console.log("========================>>>>>>>>>>>>>>>>>>>>>>", final_ml_value)
                                        let mlQuery = "insert into cat_variants_ml (`name`,`language_id`,`cat_variant_id`) values ?"
                                        await ExecuteQ.Query(req.dbName, mlQuery, [final_ml_value])
    
    
                                        for await (let [key, cvalues] of Object.entries(afterGroupBymodel)) {
                                            //logger.debug("=================================<<<<<<<>>>>>>>>>==========================",key)
    
                                            let variantQuery = "insert into variants (`cat_variant_id`,`value`,`created_by`) values (?,?,?)"
                                            await ExecuteQ.Query(req.dbName, variantQuery, [catVariantResultofModel.insertId, key, 0]);
                                        }
                                    }

                                }
                            
                                let afterGroupByTrim = _.groupBy(definedNameOfValue, "Trim");
                                let trimQuery=await ExecuteQ.Query(req.dbName,"SELECT *  FROM `cat_variants` WHERE name=? and cat_id=?",["Trim",categoryId]);

                                if(trimQuery && trimQuery.length>0)
                                {
                                    for await (let [key, cvalues] of Object.entries(afterGroupByTrim)) {
                                        // logger.debug("=================================<<<<<<<>>>>>>>>>==========================",key)

                                    //     let valueQuery=await ExecuteQ.Query(req.dbName,"select value from variants where value=?",[key])
                                    //     if(valueQuery && valueQuery>0){
                                    //    //do nothing
                                    //     }
                                    //     else{

                                            let variantQuery = "insert into variants (`cat_variant_id`,`value`,`created_by`) values (?,?,?)"
                                            await ExecuteQ.Query(req.dbName, variantQuery, [trimQuery[0].id, key, 0]);
                                      //  }
                                    }

                                }
                                else{
                                    // let afterGroupByTrim = _.groupBy(definedNameOfValue, "Trim");
                                    let catVariantQuerybytrim = "insert into cat_variants (`name`,`cat_id`,`variant_type`,`created_by`) values(?,?,?,?)";
                                    let catVariantResultoftrim = await ExecuteQ.Query(req.dbName, catVariantQuerybytrim, [validHeader.row[3], categoryId, 0, 0]);
    
    
                                    if (catVariantResultoftrim.insertId) {
                                        console.log("<<<<<<<<<<<<<<<<<<<<iN>>>>>>>>>>>>>>>>>>>>>>>>>>>")
                                        let variant_ml_values = [];
                                        variant_ml_values.push(validHeader.row[3], 14, catVariantResultoftrim.insertId);
                                        variant_ml_values.push(validHeader.row[3], 15, catVariantResultoftrim.insertId);
                                        final_ml_value = chunk(variant_ml_values, 3);
                                        console.log("========================>>>>>>>>>>>>>>>>>>>>>>", final_ml_value)
                                        let mlQuery = "insert into cat_variants_ml (`name`,`language_id`,`cat_variant_id`) values ?"
                                        await ExecuteQ.Query(req.dbName, mlQuery, [final_ml_value])
    
    
                                        for await (let [key, cvalues] of Object.entries(afterGroupByTrim)) {
                                            // logger.debug("=================================<<<<<<<>>>>>>>>>==========================",key)
    
                                            let variantQuery = "insert into variants (`cat_variant_id`,`value`,`created_by`) values (?,?,?)"
                                            await ExecuteQ.Query(req.dbName, variantQuery, [catVariantResultoftrim.insertId, key, 0]);
                                        }
                                    }

                                }

                  
                                sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

                            } else {
                                sendResponse.sendErrorMessage(constant.ProductRating.INVALID_FILE, res, 400);
                            }

                        })
                } else {
                    sendResponse.sendErrorMessage(constant.ProductRating.INVALID_FILE, res, 400);
                }


            } else {
                sendResponse.sendErrorMessage(constant.fileMessage.INVALID_FILE, res, 400);
            }
        }
        else{
            sendResponse.somethingWentWrongError(res);
        }


    } catch (Err) {
        logger.debug("======Err!===>>", Err);
        sendResponse.somethingWentWrongError(res);
    }
}

const updateCatVarient = async (dbName, category_id) => {
    return new Promise((resolve, reject) => {
        var sql = "update categories set is_variant=? where id = ?"
        multiConnection[dbName].query(sql, [1, category_id], function (err, data) {
            if (err) {
                reject();
            } else {
                resolve()
            }
        })
    })
}

module.exports={
    variantList:variantList,
    importCategoryVariantsv1:importCategoryVariantsv1
}