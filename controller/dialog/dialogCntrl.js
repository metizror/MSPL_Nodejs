"use strict";
const dialogflow = require('dialogflow');
var log4js = require('log4js');
var logger = log4js.getLogger();
var chunk = require('chunk');
logger.level = "debug";
var sendResponse = require('../../routes/sendResponse');
const googleAuth = require('google-oauth-jwt');
var constant=require('../../routes/constant');
var request=require('request');
let Universal=require('../../util/Universal')
/**
 * @description used for add and update product entity
 * @param {*Object} req 
 * @param {*Object} res 
 */
const ProductEntityUpdate=async (req,res)=>{
    try{
        let dialogKeyData=await Universal.getAnAllDialogKeys(req.dbName);
        const token=await getToken(dialogKeyData);
        var products=await getAllProduct(req.dbName);
        const updateEnity=await updateCreateEntity(token,products,dialogKeyData["product_entities_key"]);
        sendResponse.sendSuccessData({"data":updateEnity}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch(err){
        logger.debug("============ERR!==",err);
        return sendResponse.sendErrorMessage("something went wrong!",res,400);
    }
}
/**
 * @description used for update an supplier entities of dialog-flow
 * @param {*Object} req 
 * @param {*Object} res 
 */
const SupplierEntityUpdate=async (req,res)=>{
    try{
        let dialogKeyData=await Universal.getAnAllDialogKeys(req.dbName);
        const token=await getToken(dialogKeyData);
        var products=await getAllSupplier(req.dbName);
        const updateEnity=await updateCreateEntity(token,products,dialogKeyData["supplier_entities_key"]);
        sendResponse.sendSuccessData({"data":updateEnity}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch(err){
        logger.debug("============ERR!==",err);
        return sendResponse.sendErrorMessage("something went wrong!",res,400);
    }

}
/**
 * @description used for getting an all entities of dialogFlow
 * @param {*Object} req 
 * @param {*Object} res 
 */
const getAllEntity=async (req,res)=>{
    try{
        let dialogKeyData=await Universal.getAnAllDialogKeys(req.dbName);
        const token=await getToken(dialogKeyData);
        const AllEntities=await getAllEntities(token);
        sendResponse.sendSuccessData(AllEntities, constant.responseMessage.SUCCESS, res, 200);
    }
    catch(err){
        logger.debug("============ERR!==",err);
        return sendResponse.sendErrorMessage("something went wrong!",res,400);
    }
}
const AddOrderPhrase=async (req,res)=>{
    try{
        let dialogKeyData=await Universal.getAnAllDialogKeys(req.dbName);
        var token=await getToken(dialogKeyData);       
        var product_entities_data=await getProductEntities(token);
        var supplier_entities_data=await getSupplierEntities(token);
        var p_entities=supplier_entities_data.entities;
        var s_entities=product_entities_data.entities;
        var p_name=p_entities && p_entities.length>0?p_entities[0].value:"";
        var s_name=s_entities && s_entities.length>0?s_entities[0].value:"";
        // logger.debug("===========p_name===s_name",p_name,s_name);
        if(p_name!="" && s_name!=""){
            logger.debug("===========p_name===s_name",p_name,s_name);
            await makeTrainingPhrase(token,p_name,s_name)  
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);        
        }
        
    }
    catch(Err){
        logger.error(Err)
        return sendResponse.sendErrorMessage("something went wrong!",res,400);
    }
}
/**
 * @desc used for making 3 phrase for ordering an product
 * @param {*String} product_name 
 * @param {*String} supplier_name 
 */
const makeTrainingPhrase=(token,product_name,supplier_name)=>{
    
    logger.debug("=======INTENTS===",`${config.get('server.dialog.apis.url')}`+`${config.get("server.dialog.project_id")}`+"/"+`${config.get('server.dialog.apis.intent_agent')}`+`${config.get('server.dialog.intent_id')}`);

    var training_phrase={
        "trainingPhrases": 
        [
          {
            "parts": 
            [
              {
                "text": "order "
              },
              {
                "text": product_name,
                "userDefined": true,
                "entityType": "@product",
                "alias": "product"
              },
              {
                "text": "from "
              },
              {
                "text": supplier_name,
                "userDefined": true,
                "entityType": "@supplier",
                "alias": "supplier"
              }
            ]
          },
          {
            "parts": 
            [
              {
                "text": "order "
              },
              {
                "text": product_name,
                "userDefined": true,
                "entityType": "@product",
                "alias": "product"
              }
            ]
          },
          {
            "parts": 
            [
              {
                "text": "order from"
              },             
              {
                "text": supplier_name,
                "userDefined": true,
                "entityType": "@supplier",
                "alias": "supplier"
              }
            ]
          }
        ],
        "displayName": "ecommerce_phrase",
        "parameters": 
        [
          {
            "isList": true,
            "displayName": "supplier",
            "entityTypeDisplayName": "@supplier"
          },
          {
            "isList": true,
            "displayName": "product",
            "entityTypeDisplayName": "@product"
          }
        ]
      }
      return new Promise((resolve,reject)=>{

        var options = {
            method: 'patch',
            headers: {                       
                        'authorization':"Bearer "+token
                    }, 
            body: training_phrase,
            json: true,
            url:`${config.get('server.dialog.apis.url')}`+`${config.get("server.dialog.project_id")}`+"/"+`${config.get('server.dialog.apis.intent_agent')}`+`${config.get('server.dialog.intent_id')}`
          }          
          request(                       
            options                      
          , function (error, response, body) {
                logger.debug("==ERROR=RESPONSE==",response);
              if(error){
                reject(error)
              }
              else{
                  resolve()
              }

            })        
    })

}
/**
 * @desc used for getting an supplier entities
 * @param {*String} token 
 */
const getSupplierEntities=(token)=>{  

    logger.debug("===TOKEN===",`${config.get('server.dialog.apis.url')}`+`${config.get("server.dialog.project_id")}`+"/"+`${config.get('server.dialog.apis.entity_types')}`+`${config.get('server.dialog.product_entities_key')}`);

    return new Promise((resolve,reject)=>{
        request.get({
            uri: `${config.get('server.dialog.apis.url')}`+`${config.get("server.dialog.project_id")}`+"/"+`${config.get('server.dialog.apis.entity_types')}`+`${config.get('server.dialog.supplier_entities_key')}`,
            headers: {                       
                'authorization':"Bearer "+token
            },                    
            }
        , function (error, response, body) {
            logger.debug("==RESPONSE==",error);
            if(error){
                    reject(error)
            }
            else{
                resolve(JSON.parse(body))
            }
            }
        )
    })
}
/**
 * @desc used for getting an product entities
 * @param {*String} token 
 */
const getProductEntities=(token)=>{    
    logger.debug("===TOKEN===",`${config.get('server.dialog.apis.url')}`+`${config.get("server.dialog.project_id")}`+"/"+`${config.get('server.dialog.apis.entity_types')}`+`${config.get('server.dialog.product_entities_key')}`);

    return new Promise((resolve,reject)=>{
        request.get({
            uri: `${config.get('server.dialog.apis.url')}`+`${config.get("server.dialog.project_id")}`+"/"+`${config.get('server.dialog.apis.entity_types')}`+`${config.get('server.dialog.product_entities_key')}`,
            headers: {                       
                'authorization':"Bearer "+token
            },                    
            }
        , function (error, response, body) {
            logger.debug("==RESPONSE==",error);
            if(error){
                    reject(error)
            }
            else{
                resolve(JSON.parse(body))
            }
            }
        )
    })
}
const getAllProduct=(dbName)=>{
    return new Promise((resolve,reject)=>{
       var st= multiConnection[dbName].query("select `name` from product where is_deleted=? group by name",[0],(err,data)=>{
            logger.debug(st.sql);
            if(err){
                reject(err)
            }
            else{
                var ent_json={};
                var ent_data = {                   
                    "entities": 
                    [                      
                    ]                      
                }
                logger.debug("===DATA==LENGTH==",data.length);
                if(data && data.length>0){
                    for(const i of  data){
                        if(i.name!="" && i.name!=undefined){
                        ent_json.synonyms=[i.name];
                        ent_json.value=i.name
                        ent_data.entities.push(ent_json)
                        ent_json={}
                        }
                    }
                    logger.debug("===",ent_data)
                    resolve(ent_data)
                }
                else{
                    resolve(data)
                }
            }
        })

    })

}
const getAllSupplier=(dbName)=>{
    return new Promise((resolve,reject)=>{
       var st= multiConnection[dbName].query("select `name` from supplier where is_deleted=? group by name",[0],(err,data)=>{
            logger.debug(st.sql);
            if(err){
                reject(err)
            }
            else{
                var ent_json={};
                var ent_data = {                   
                    "entities": 
                    [                      
                    ]                      
                }
                logger.debug("===DATA==LENGTH==",data.length);
                if(data && data.length>0){
                    for(const i of  data){
                        ent_json.synonyms=[i.name];
                        ent_json.value=i.name
                        ent_data.entities.push(ent_json)
                        ent_json={}
                    }
                    logger.debug("===",ent_data)
                    resolve(ent_data)
                }
                else{
                    resolve(data)
                }
            }
        })

    })

}
const updateCreateEntity=(token,products,entityId)=>{
    console.log("=====prjectId,EnitiesId======","DILI?", `${config.get('server.dialog.apis.url')}`+`${config.get("server.dialog.project_id")}`+`${config.get('server.dialog.apis.entity_types')}`+`${config.get('server.dialog.product_entities_key')}`+"/"+`${config.get('server.dialog.apis.entities_batch_update')}`+"?alt=json");
    return new Promise(async (resolve,reject)=>{ 
                try{                  
                    var options = {
                        method: 'post',
                        headers: {                       
                                    'authorization':"Bearer "+token
                                }, 
                        body: products,
                        json: true,
                        url:`${config.get('server.dialog.apis.url')}`+`${config.get("server.dialog.project_id")}`+"/"+`${config.get('server.dialog.apis.entity_types')}`
                        +entityId+"/"+`${config.get('server.dialog.apis.entities_batch_update')}`+"?alt=json",
                      }
                      request(                       
                        options                      
                      , function (error, response, body) {
                        console.log("==ERROR=RESPONSE==",response);
                          if(error){
                            reject(error)
                          }
                          else{
                              resolve()
                          }
                        }
                      )
                }
                catch(Err){
                    // logger.debug("ERR!==",Err)
                    reject(Err)
                }

          })

}
const getAllEntities=(token)=>{
    logger.debug("=====DATA!==",`${config.get('server.dialog.apis.url')}`+`${config.get("server.dialog.project_id")}`+`${config.get('server.dialog.apis.entity_types')}`)   
    try{
        return new Promise((resolve,reject)=>{
            request.get({
                uri: `${config.get('server.dialog.apis.url')}`+`${config.get("server.dialog.project_id")}`+"/"+`${config.get('server.dialog.apis.entity_types')}`,
                headers: {                       
                    'authorization':"Bearer "+token
                },                    
                }
            , function (error, response, body) {
                logger.debug("==RESPONSE==",error);
                if(error){
                        reject(error)
                }
                else{
                    resolve(JSON.parse(body))
                }
                }
            )
        })
    }
    catch(err){
        logger.debug("============ERR!==",err);
        return sendResponse.sendErrorMessage("something went wrong!",res,400);
    }
}
/**
 * @description get an dialog token
 * @param {*String} dbName 
 */
const getToken=(dialogData)=>{    
    return new Promise(async (resolve,reject)=>{
        try{
            logger.debug("===dialogFlow==>>",dialogData["dialog_client_email"]);
            let modifiedPrivateKey= dialogData.dialog_private_key.split("\\n").join("\n");
            if(Object.keys(dialogData).length>0){
                    googleAuth.authenticate(
                                    {
                                        email: dialogData["dialog_client_email"],
                                        key: modifiedPrivateKey,
                                        scopes: ['https://www.googleapis.com/auth/cloud-platform','https://www.googleapis.com/auth/dialogflow']                
                                    },
                                    (err, token) => {
                                        logger.debug("==ERR!==",err,token)
                                        resolve(token);                            
                                    },
                                );
            }
            else{
                resolve("")
            }
            }
        catch(Err){
            logger.debug("ERR!==",Err)
            reject(Err)
        }

  })
}
/**
 * @description used for getting an dialog token
 * @param {*Object} req 
 * @param {*Object} res 
 */
const getDialogToken=async (req,res)=>{
    try{
        let dialogKeyData=await Universal.getAnAllDialogKeys(req.dbName);
        const token=await getToken(dialogKeyData);
        sendResponse.sendSuccessData({token:token}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch(err){
        logger.debug("============ERR!==",err);
        return sendResponse.sendErrorMessage("something went wrong!",res,400);
    }
}
module.exports={
    getDialogToken:getDialogToken,
    ProductEntityUpdate:ProductEntityUpdate,
    getAllEntity:getAllEntity,
    SupplierEntityUpdate:SupplierEntityUpdate,
    AddOrderPhrase:AddOrderPhrase
}

