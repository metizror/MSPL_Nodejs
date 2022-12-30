var mysql = require('mysql');
var async = require('async');
var constant=require('../../routes/constant')
var connectionCntr=require('../../routes/connection')
var sendResponse = require('../../routes/sendResponse');
var confg=require('../../config/const');
var _ = require('underscore'); 
var chunk = require('chunk')
var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = config.get('server.debug_level');
const ExecuteQ=require('../../lib/Execute')
var crypto = require('crypto'),
    algorithm = confg.SERVER.CYPTO.ALGO,
    password =  confg.SERVER.CYPTO.PWD

/**
 * @desc used fofr encrypt an string
 * @param {*Object} req 
 * @param {*Object} res 
 */
const addVariant=async (req,res)=>{
    var variant=req.body.variant;
    var category_id=req.body.category_id;
    // console.log("====BODY==PARAMS==",req.body);
    try{
        var update = await updateCatVarient(req.dbName,req.body.category_id)
        for (const i of variant) {
            await saveVariants(req.dbName,1,category_id,i.variant_name,i.variant_type,i.variant_values,req.user)
        }
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);

        // async.every(variant,function(i,callback){
        //     // console.log("==i==",i)
        //      saveVariants(category_id,i.variant_name,i.variant_values,req.user,callback)
        // },function(err){
        //     // console.log("====ERRR!===",err)
        //     if(err){
        //         sendResponse.somethingWentWrongError(res);
        //     }
        //     else{
        //         sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
        //     }
        // })
    }
    catch(Err){
        console.log(Err)
        sendResponse.somethingWentWrongError(res);
    }
}

const updateCatVarient = async(dbName,category_id)=>{
    return new Promise((resolve,reject)=>{
        var sql = "update categories set is_variant=? where id = ?"
        multiConnection[dbName].query(sql,[1,category_id],function(err,data){
            if(err){
                reject();
            }else{
                resolve()
            }
        })
    })
}


const variantList=async (req,res)=>{
    try{
        var accessToken = req.body.accessToken;
        var authSectionId = req.body.sectionId;
        var category_id=req.body.category_id
        var languageId=req.body.languageId!=undefined?req.body.languageId:14
        var manValues = [category_id];
        logger.debug("=========request in varientList api=========",req.body,req.dbName)
        var variantData=await VariantData(req.dbName,category_id,languageId);
        var brandData=await BrandList(req.dbName,category_id,languageId);
        sendResponse.sendSuccessDataWithVariant(variantData,brandData, constant.responseMessage.SUCCESS, res, 200);
    }
    catch(err){
        logger.debug("===============errr in variantList api==================")
        console.log("===ERRR!==",err)
        sendResponse.somethingWentWrongError(res);
    }

}
function BrandList(dbName,cat_id,languageId){
    var final=[];
    return new Promise(async (resolve,reject)=>{
        var brandQuery="select brands.id,brands.name,brands.description,brands.image from cat_brands join brands on brands.id=cat_brands.brand_id where cat_brands.cat_id=? and cat_brands.deleted_by=? and brands.deleted_by=?"
        var st=multiConnection[dbName].query(brandQuery,[parseInt(cat_id),0,0],async function(err,data){
            logger.debug(st.sql);
            if(err){
                reject(err)
            }
            else{
                logger.debug("===DATA!===",data)
                if(data && data.length>0){
                    var names;
                    for (const i of data) {
                        names=await brandMl(dbName,i.id,languageId)
                        final.push({
                            id:i.id,
                            description:i.description,
                            image:i.image,
                            name:names
                        })
                    }
                    resolve(final)
                }   
                else{
                    resolve(final)
                }             
              
            }
        });
    });
}
function brandMl (dbName,id,languageId){
    return new Promise((resolve,reject)=>{
    var sql="select name,language_id from brands_ml where brand_id=? and language_id=?"
    var st=multiConnection[dbName].query(sql,[id,languageId],function(err,data){
        logger.debug(st.sql)
        if(err){
            reject(err)
        }
        else{
            // logger.debug("=DATA=!=",data)
            if(data && data.length>0){
                resolve(data[0].name)
            }
            else{
                resolve("")
            }
            
        }
    })
})

} 

function VariantData(dbName,category_id,languageId){

    return new Promise((resolve,reject)=>{
        logger.debug("=======dbname in variant list ==========",dbName)

    var sql = "select cat_variants_ml.name,cat_variants.id,cat_variants.variant_type from cat_variants inner join cat_variants_ml on cat_variants_ml.cat_variant_id=cat_variants.id where cat_variants.cat_id=? and deleted_by=? and cat_variants_ml.language_id=?"
    var sts=multiConnection[dbName].query(sql, [parseInt(category_id),0,languageId], function (err, catVariants) {
        logger.debug("===========error in variant list api=====================",sts.sql,err)
        if (err) {            
                reject(err)
            // sendResponse.somethingWentWrongError(res);
        }
        else {
            var variant = [];
            var variantLength = catVariants.length;
            if (variantLength == 0) {
                resolve(variant)
                // sendResponse.sendSuccessData(variant, constant.responseMessage.SUCCESS, res, 200);
            }
            else {
                var sql2 = "select value,vr.id,vr.cat_variant_id from variants vr inner join cat_variants cvt on cvt.id=vr.cat_variant_id and vr.deleted_by=?"; 
                var st=multiConnection[dbName].query(sql2,[0],function (err, variants) {
                    console.log("==ERR==SQL=>",st.sql,err)
                    if (err) {
                        reject(err)
                        // sendResponse.somethingWentWrongError(res);
                    }
                    else{
                        console.log(varianValueLength);

                        var varianValueLength = variants.length;    

                        for (var i = 0; i < variantLength; i++) {
                            (function (i) {
                                var variantData=[];
                                if(varianValueLength==0){
                                    variant.push({
                                        "variant_name":catVariants[i].name,
                                        "id":catVariants[i].id,
                                        "variant_type":catVariants[i].variant_type,
                                        "variant_values":[]
                                        })
                                }
                                else{
                                for(var j=0;j<varianValueLength;j++){

                                    (function(j){

                                        if(catVariants[i].id==variants[j].cat_variant_id){

                                            console.log("====",i,variantLength)

                                            variantData.push({
                                                    "value":variants[j].value,
                                                    "id":variants[j].id
                                            })

                                            if(j==varianValueLength-1){                                                
                                                variant.push({
                                                        "variant_name":catVariants[i].name,
                                                        "id":catVariants[i].id,
                                                        "variant_type":catVariants[i].variant_type,
                                                        "variant_values":variantData
                                                })
                                            }

                                        }
                                        else{
                                            if(j==varianValueLength-1){
                                                variant.push({
                                                        "variant_name":catVariants[i].name,
                                                        "id":catVariants[i].id,
                                                        "variant_type":catVariants[i].variant_type,
                                                        "variant_values":variantData
                                                })
                                            }
                                        }

                                    }(j))
                                }
                            }
                            }(i))
                        
                    }
                    resolve(variant)
                    // sendResponse.sendSuccessData(variant, constant.responseMessage.SUCCESS, res, 200);
                }
                
                })
            }
        }
     })
    })


}


/**
 * @desc used for saving an categories variants
 * @param {*Object} res 
 * @param {*function} callback 
 * @param {*Int} cat_id 
 * @param {*String} name 
 * @param {*Array} variant_values 
 */
function saveVariants(dbName,flag,cat_id,name,variant_type,variant_values,userData) {
    
    console.log("==cat_id,name,variant_values==",cat_id,name,variant_values,userData);

    var variant_values_array=[],final_value,variant_ml_values=[],final_ml_value;

    return new Promise((resolve,reject)=>{  

        var catVariantQuery="insert into cat_variants (`name`,`cat_id`,`variant_type`,`created_by`) values(?,?,?,?)";
        var statememt=multiConnection[dbName].query(catVariantQuery,[name[0].name,cat_id,variant_type,userData.id], function(err, result) {
         
            if (err) { 
                    reject(err)
                    // reject(err);
                return reject(err)
          }
          
          if(name && name.length>0){
              _.each(name,function(i){
                    variant_ml_values.push(i.name,i.language_id,result.insertId);
                })
          }

          if(variant_values && variant_values.length>0){
                         var values="";
                        _.each(variant_values,function(i){
                            if(flag==1){
                                values=i;
                            }
                            else{
                                values=i.value
                            }
                            variant_values_array.push(
                                result.insertId,
                                values,
                                parseInt(userData.id)
                            )
                        })
          }
          final_value=chunk(variant_values_array,3);
          final_ml_value=chunk(variant_ml_values,3);

          console.log("==variant_ml_values=final_ml_value=",variant_ml_values,final_ml_value,final_value);

          var variantQuery="insert into variants (`cat_variant_id`,`value`,`created_by`) values ?"
         var st= multiConnection[dbName].query(variantQuery,[final_value],function(err, result) {
            // console.log(st.sql)    
            if (err) { 
                            // console.log(err)
                            return reject(err)
                        }  
                        else{
                            var mlQuery="insert into cat_variants_ml (`name`,`language_id`,`cat_variant_id`) values ?"
                          
                            var st1=multiConnection[dbName].query(mlQuery,[final_ml_value],function(err, result) {
                                console.log(st1.sql)  
                                if (err) { 
                                    console.log(err)
                                    return reject(err)
                                }  
                                else{
                                                // connection.end();
                                                resolve()
                                                // resolve()
                            }

                            })
                       
                    }
          });
        });
    })

}
/**
 * @desc used for update an variant value
 * @param {*Object} req 
 * @param {*Object} res 
 */

const updateVariantValue=async (req,res)=>{
    try{    
        let variant_type = await getVariantType(req.dbName,req.body.id);
        logger.debug("========variant_type======req.body.variant[0].variant_type=====",variant_type,req.body.variant[0].variant_type)
        if(variant_type !== req.body.variant[0].variant_type){
            
            await removeVariantValues(req.dbName,req.body.id);
        }
        // if(req.body.is_new==1){
        //     if(req.body.id!=undefined && req.body.id!==""){
        //         await add(req.body.variant_value,req.body.id);
        //     }

        //     else{

                // async.every(req.body.variant_value,async function(i,callback){
                for (const i of req.body.variant) {
                    if(req.body.id!=undefined && req.body.id!=="" && req.body.id!=null){
                       await UpdateVariantName(req.dbName,i.variant_name,i.variant_type,req.body.category_id,req.body.id)
                       await UpdateInsertVariantValues(req.dbName,i.variant_values,req.body.id,req.user.id)
                    }   
                    else{
                        await saveVariants(req.dbName,0,req.body.category_id,i.variant_name,i.variant_type,i.variant_values,req.user)
                    }   
                }
                // console.log("=DONE==")                        
                
                //   },function(err){
                //     console.log("====ERRR!===",err)
                //     if(err){
                //         sendResponse.somethingWentWrongError(res);
                //     }
                //     else{
                //         sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
                //     }
                // })
            // }
        // }
        // else{

        //     await update(req.body.variant_value,req.body.id)

        // }
        // const updateVariant=await update(req.body.value,req.body.id)
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch(Err){
        console.log(Err)
        sendResponse.somethingWentWrongError(res);
    }
}


function getVariantType(dbName,cat_variant_id){
    return new Promise(async(resolve,reject)=>{
        let query = "select variant_type from cat_variants where id=?";
        let params = [cat_variant_id];
        let result  = await ExecuteQ.Query(dbName,query,params);
        if(result && result.length>0){
            resolve(result[0].variant_type)
        }else{
            resolve([]);
        }
    })
}

function removeVariantValues(dbName,cat_variant_id){
    return new Promise(async(resolve,reject)=>{
        let query = "update variants set deleted_by=? where cat_variant_id IN(?)"
        let params = [1,cat_variant_id];
        await ExecuteQ.Query(dbName,query,params);
        resolve();
    })
}

function UpdateVariantName(dbName,names,variant_type,cat_id,variant_id){
    console.log("==names,cat_id,variant_id=======",names,cat_id,variant_id)
    return new Promise(async (resolve,reject)=>{
        var dataToUpdate=[];
        var queries;
        await updateVariantType(dbName,variant_type,variant_id);
        for(const [index,i] of names.entries()){
        // _.each(names,function(i){
        queries=" update cat_variants_ml set `name`='"+i.name+"' where cat_variant_id="+variant_id+" and language_id="+i.language_id+";"
        queries2=" update cat_variants set `name`='"+i.name+"' where id="+variant_id+""

           try{
            await ExecuteQ.Query(dbName,queries,[]);
            await ExecuteQ.Query(dbName,queries2,[]);
            queries2 = "";
            queries="";             
            if(index==names.length-1)
            {
                return resolve(null)
            }
           }
           catch(Err){
                logger.debug("==Err!=",Err)
                reject()
           }
            
        }   
    })
}

function updateVariantType(dbName,variant_type,variant_id){
    return new Promise(async(resolve,reject)=>{
        let sql = "update cat_variants set variant_type=? where id = ?"
        await ExecuteQ.Query(dbName,sql,[variant_type,variant_id])
        resolve()
    })
}
function UpdateInsertVariantValues(dbName,valuesArray,cat_variant_id,user_id){
    console.log("======valuesArray====",valuesArray)
    return new Promise((resolve,reject)=> {
        var updateInertQuery="";
        async.every(valuesArray,function(i,callback){
            if(i.id!=undefined && i.id!==""){
                updateInertQuery="update variants set value='"+i.value+"' where id="+i.id+"";
            }
            else{
                updateInertQuery="insert into variants (`value`,`cat_variant_id`,`created_by`) values ('"+i.value+"',"+cat_variant_id+","+user_id+")";
            }
            console.log(updateInertQuery)
            multiConnection[dbName].query(updateInertQuery,function(err,data){
                console.log(err)
               if(err){
                   callback(err)
               }
               else{
                   callback(null)
               }
           })
          },function(err){
              console.log("===ERR!==",err);

                if(err){
                    return reject(err)
                }
                else{
                     return  resolve()
                }
        })
        
    })



}


const DeleteVariant=async (req,res)=>{
    console.log("===REQ=BODY=",req.body);

    try{
        var id=parseInt(req.param.id)
        var user_id=parseInt(req.user.id)
        var data=await DelVariant(id,user_id);
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch(Err){
        console.log(Err)
        sendResponse.somethingWentWrongError(res);
    }
}

const DelVariant=(dbName,id,user_id)=>{
    return new Promise((resolve,reject)=>{
        var updateQuery="update cat_variants set deleted_by=? where id=?";
        multiConnection[dbName].query(updateQuery,[parseInt(user_id),id],function(err,data){
            if(err){
                reject(err)
            }
            else{
                resolve()
            }
        })
    })

}
function update(dbName,value,id){
    return new Promise((resolve,reject)=> {
        var updateQuery="update variants set value=? where id=?";
         multiConnection[dbName].query(updateQuery,[value,id],function(err,data){
            if(err){
                reject(err)
            }
            else{
                resolve()
            }
        })
    })
}
function add(dbName,value,id){
    return new Promise((resolve,reject)=> {
        var insertQuery="insert into variants (cat_variant_id,value) values(?,?) ";
        multiConnection[dbName].query(insertQuery,[id,value],function(err,data){
            if(err){
                reject(err)
            }
            else{
                resolve()
            }
        })
    })
}
const deleteVariants=async (req,res)=>{
    try{     
        var body_params=req.body
        console.log("===body_param====",body_params);
        await deleteVariant(req.dbName,req.user.id,req.body.id);
        // const updateVariant=await update(req.body.value,req.body.id)
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch(Err){
        console.log(Err)
        sendResponse.somethingWentWrongError(res);
    }
}

const deleteVariantValue=async (req,res)=>{
    try{     
        var body_params=req.body
        console.log("===body_param====",body_params);
        
        await deleteVariantVal(req.dbName,req.user.id,req.body.ids);
        // const updateVariant=await update(req.body.value,req.body.id)
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch(Err){
        console.log(Err)
        sendResponse.somethingWentWrongError(res);
    }
}
function deleteVariantVal(dbName,userId,ids){
    return new Promise((resolve,reject)=>{
        var deleteQuery="update variants set deleted_by=? where id IN(?)"
       var statememt=multiConnection[dbName].query(deleteQuery,[userId,ids],function(err,data){
           console.log(statememt.sql)
            if(err){
                reject(err)
            }
            else{
                resolve()
            }
        })
    })
}
function deleteVariant(dbName,userId,id){
    return new Promise((resolve,reject)=>{
        var deleteQuery="update cat_variants set deleted_by=? where id=?"
       var statememt=multiConnection[dbName].query(deleteQuery,[userId,id],function(err,data){
           console.log(statememt.sql)
            if(err){
                reject(err)
            }
            else{
                resolve()
            }
        })
    })

}
module.exports={
    addVariant:addVariant,
    variantList:variantList,
    updateVariantValue:updateVariantValue,
    deleteVariantValue:deleteVariantValue,
    deleteVariants:deleteVariants
}

