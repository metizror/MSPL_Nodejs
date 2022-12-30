/**
 * ==========================================================================
 * created by cbl-147
 * @description used for performing an brand related action from admin panel
 * ==========================================================================
 */
var mysql = require('mysql');
var async = require('async');
var constant=require('../../routes/constant')
var connectionCntr=require('../../routes/connection')
var sendResponse = require('../../routes/sendResponse');
var uploadMgr=require('../../lib/UploadMgr')
var confg=require('../../config/const');
var _ = require('underscore'); 
var chunk = require('chunk');
var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = config.get('server.debug_level');

var crypto = require('crypto'),
    algorithm = confg.SERVER.CYPTO.ALGO,
    password =  confg.SERVER.CYPTO.PWD

/**
 * @desc used for adding an brand
 * @param {*Object} req 
 * @param {*Object} res 
 */
const Add=async (req,res)=>{
    logger.debug("===========+++++++DD")
    var brand_desc=req.body.description || "";
    var image =req.body.file;
    logger.debug(req.body)
    var namesArray=JSON.parse(req.body.name);
    logger.debug("====brand_name=user=",req.files.file,req.user,req.body);
    try{
      
        if(req.files.file){
            var fileName=req.files.file.name
            var fileExtension=fileName.substring(fileName.lastIndexOf(".")+1);
            logger.debug("==fileExtension=",fileExtension);
            if(fileExtension=="jpg" || fileExtension=="jpeg" || fileExtension=="png" || fileExtension=="gif")
            {
                    var brandId=await SaveBrand(req.dbName,namesArray,brand_desc,req.user);
                    var image=await uploadImage(req.files.file)
                    await updateImage(req.dbName,brandId,image);
                    sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200); 
            }
            else{
                sendResponse.sendErrorMessage(constant.fileMessage.INVALID_FILE, res, 400);      
            }
        }
        else{
            var brandId=await SaveBrand(req.dbName,namesArray,brand_desc,req.user);
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);      
        }

         
    }
    catch(Err){
        console.log(Err)
        sendResponse.somethingWentWrongError(res);
    }
}

/**
 * 
 * @param {Object} req 
 * @param {*Object} res 
 */
const List=async (req,res)=>{
    try
    {
        logger.debug("===================brandlist======req.dbName===========",req.dbName)
        var data=await BrandList(req.dbName,req.user);

        sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, 200);
    }
    catch(err){
        sendResponse.somethingWentWrongError(err)
    }
}
/**
 * @desc used for Update an variant value
 * @param {*Object} req 
 * @param {*Object} res 
 */
const Update=async (req,res)=>{
    logger.debug("===========entered in update===================")
    var names=JSON.parse(req.body.name);
    var brand_id=req.body.id;
    try{ 
        if(req.files.file){
            var fileName=req.files.file.name
            var fileExtension=fileName.substring(fileName.lastIndexOf(".")+1);
            logger.debug("==fileExtension=",fileExtension);
            if(fileExtension=="jpg" || fileExtension=="jpeg" || fileExtension=="png" || fileExtension=="gif")
            {
                logger.debug("===============before update name====================")

                    await updateName(req.dbName,brand_id,names);
                    logger.debug("===============before uploade image====================")

                    var image=await uploadImage(req.files.file)
                    logger.debug("===============before update image====================")

                    await updateImage(req.dbName,brand_id,image);
                    logger.debug("===============after update image====================")
                    sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200); 
            }
            else{
                sendResponse.sendErrorMessage(constant.fileMessage.INVALID_FILE, res, 400);      
            }
        }
        else{
            await updateName(req.dbName,brand_id,names);
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);      
        }
        
    }
    catch(Err){
        // con
            console.log("==============errrrrrrr========",Err)
        sendResponse.somethingWentWrongError(res);
    }
}
const Delete=async (req,res)=>{
    console.log("===REQ=BODY=",req.body);
    try{
        var id=parseInt(req.body.id)
        var user_id=parseInt(req.user.id)
        var data=await DelBrand(id,user_id,req.dbName);
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch(Err){
        console.log(Err)
        sendResponse.somethingWentWrongError(res);
    }
}
function updateImage(dbName,id,image){
    return new Promise((resolve,reject)=>{
        var updateQuery="update brands set image=? where id=?"
        multiConnection[dbName].query(updateQuery,[image,id],function(err,data){
            if(err){
                reject(err)
            }
            else{
                resolve()
            }
        })

    })
}
function uploadImage(file){
    var imageArray=[],image;
    return new Promise(async (resolve,reject)=>{
           // for (const i of data)
        // image=await uploadMgr.uploadImage(file)
        image=await uploadMgr.uploadImageFileToS3BucketNew(file)
        imageArray.push(image);
        logger.debug("===image==imageArray=",imageArray);
        resolve(image);
        // async.each(file,function(i,cb){
        //     await uploadMgr.uploadImage()
        // },function(err){
        //     if(err){
        //     }
        //     else{
        //     }
        // })
        
    })
}

function DelBrand(id,user_id,dbName){
    return new Promise((resolve,reject)=>{
        var delQuery="update brands set deleted_by=? where id=?"
        multiConnection[dbName].query(delQuery,[user_id,id],function(err,data){
            if(err){
                reject(err)
            }
            else{
                resolve()
            }
        })

    })
}
function updateName(dbName,brand_id,names){
    logger.debug("==brand_id,names==",brand_id,names);
    
    return new Promise((resolve,reject)=>{
        var dataToUpdate=[];
        // var queries="";
        // console.log("==============",names)
        // _.each(names,function(i){
        //     queries+="update brands_ml set name='"+i.name+"' where brand_id="+brand_id+" and language_id="+i.language_id+" "
        // });

        var query1 = "update brands_ml set name = '"+names[0].name+"'  where brand_id="+brand_id+" and language_id=14 "
        var query2 = "update brands_ml set name = '"+names[1].name+"'  where brand_id="+brand_id+" and language_id=15 "
        console.log("==queries==",query1,query2);
        
        var st=multiConnection[dbName].query(query1,async function(err,data){
            logger.debug("===============in updatename end==================",st.sql)
            logger.debug("===================== error ====================",err)
            if(err){
                logger.debug("================caught an error==========================",err)
                return reject(err)
            }
            else{
                var st2 = multiConnection[dbName].query(query2,async function(err,data){
                    if(err){
                        logger.debug("=======err second==========",err,st2.query2)
                        return reject(err)
                    }else{

                        return resolve(null)

                    }
                })
            }
        })
    })
}

function BrandList(dbName,userData){
    var final=[];
    return new Promise(async (resolve,reject)=>{
        var brandQuery="select id,name,description,image from brands where deleted_by=?"
        multiConnection[dbName].query(brandQuery,[0],async function(err,data){
            if(err){
                reject(err)
            }
            else{
                logger.debug("===DATA!===",data)
                if(data && data.length>0){
                    var names;
                    for (const i of data) {
                        names=await brandMl(dbName,i.id)
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
function brandMl (dbName,id){
    return new Promise((resolve,reject)=>{
    var sql="select name,language_id from brands_ml where brand_id=?"
    logger.debug("===================brand mi ==============",dbName)
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
 * @desc used for saving an brands 
 * @param {*Array} name 
 * @param {*Array} variant_values 
 */
function SaveBrand(dbName,name,brand_desc,userData) {
    logger.debug("=====name,userData==",name,name.length,userData,name[0].name);
    var final_value,ml_values=[],final_ml_value;
    return new Promise((resolve,reject)=>{
        var brandQuery="insert into brands (`name`,`description`,`created_by`) values(?,?,?)";
        var statememt=multiConnection[dbName].query(brandQuery,[name[0].name,brand_desc,parseInt(userData.id)], function(err, result) {
          if (err) { 
                    reject(err)
                    // reject(err);
                return reject(err)
          }
          if(name && name.length>0){
              _.each(name,function(i){
                       ml_values.push(i.name,i.language_id,result.insertId);
                })
          }
          final_ml_value=chunk(ml_values,3);
          logger.debug(final_ml_value)
          var mlQuery="insert into brands_ml (`name`,`language_id`,`brand_id`) values ?"
          var st1=multiConnection[dbName].query(mlQuery,[final_ml_value],function(err, results) {
                    logger.debug(st1.sql)  
                    if (err) { 
                        console.log(err)
                            reject(err)
                        return reject(err)
                    }  
                    else{
                                if (err) { 
                                    console.log(err)
                                            reject(err)
                                        return reject(err)
                                }else{
                                    console.log("===END CONNECTION===");
                                    resolve(result.insertId);
                                }   
                    }

        });
        });
        });

}

module.exports={
    Add:Add,
    List:List,
    Update:Update,
    Delete:Delete
}

