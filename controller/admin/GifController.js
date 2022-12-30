/**
 * ==========================================================================
 * created by cbl-147
 * @description used for performing an gift related action from admin panel
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
var moment = require('moment');
var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = config.get('server.debug_level');
let ExecuteQ=require('../../lib/Execute');
var crypto = require('crypto'),
    algorithm = confg.SERVER.CYPTO.ALGO,
    password =  confg.SERVER.CYPTO.PWD

/**
 * @desc used for adding an gift
 * @param {*Object} req 
 * @param {*Object} res 
 */
const Add=async (req,res)=>{
    logger.debug("===========>>")
    var brand_desc=req.body.description || "";
    let createdBy=req.user.id;
    logger.debug(req.body.names)
    var namesArray=JSON.parse(req.body.names);
    logger.debug("====brand_name=user=",namesArray[0].name,req.files.file,req.user,req.body);
    try{
        if(req.files.file){
            var fileName=req.files.file.name
            var fileExtension=fileName.substring(fileName.lastIndexOf(".")+1);
            logger.debug("==fileExtension=",fileExtension,namesArray);
            if(fileExtension=="jpg" || fileExtension=="jpeg" || fileExtension=="png" || fileExtension=="gif")
            {
                    var cardId=await SaveGift(req.dbName,req.body,namesArray,createdBy);
                    var image=await uploadImage(req.files.file);
                    await updateImage(req.dbName,cardId.insertId,image);
                    sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200); 
            }
            else{
                sendResponse.sendErrorMessage(constant.fileMessage.INVALID_FILE, res, 400);      
            }
        }
        else{
            var cardId=await SaveGift(req.dbName,req.body,namesArray,createdBy);
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);      
        }
         
    }
    catch(Err){
        console.log(Err)
        sendResponse.somethingWentWrongError(res);
    }
}

/**
 * @description used for listing an gift listing
 * @param {Object} req 
 * @param {*Object} res 
 */
const List=async (req,res)=>{
    try
    {
        logger.debug("===================brandlist======req.dbName===========",req.dbName)
        var data=await GiftList(req.dbName,req.user);
        let countData=await ExecuteQ.Query(req.dbName,"select COUNT(*) as total from gift_card where deleted_by=?",[0])

        sendResponse.sendSuccessData({gift:data,count:countData[0].total}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch(err){
        sendResponse.somethingWentWrongError(err)
    }
}
/**
 * @desc used for update an gift value
 * @param {*Object} req 
 * @param {*Object} res 
 */
const Update=async (req,res)=>{
    logger.debug("===========entered in update===================")
    var names=JSON.parse(req.body.names);
  
    try{ 
        if(req.files.file){
            var fileName=req.files.file.name
            var fileExtension=fileName.substring(fileName.lastIndexOf(".")+1);
            logger.debug("==fileExtension=",fileExtension);
            if(fileExtension=="jpg" || fileExtension=="jpeg" || fileExtension=="png" || fileExtension=="gif")
            {
                logger.debug("===============before update name====================")

                    await updateName(req.dbName,req.body,names);
                    logger.debug("===============before uploade image====================")

                    var image=await uploadImage(req.files.file)
                    logger.debug("===============before update image====================")

                    await updateImage(req.dbName,req.body.id,image);
                    logger.debug("===============after update image====================")
                    sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200); 
            }
            else{
                sendResponse.sendErrorMessage(constant.fileMessage.INVALID_FILE, res, 400);      
            }
        }
        else{
            await updateName(req.dbName,req.body,names);
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);      
        }
        
    }
    catch(Err){
        logger.debug("==============errrrrrrr========",Err)
        sendResponse.somethingWentWrongError(res);
    }
}
/**
 * @desc used for delete an gift card
 * @param {*Object} req 
 * @param {*Object} res 
 */
const Delete=async (req,res)=>{
    console.log("===REQ=BODY=",req.body);
    try{
        var id=parseInt(req.body.id)
        var user_id=parseInt(req.user.id)
        var data=await DelGift(id,user_id,req.dbName);
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch(Err){
        console.log(Err)
        sendResponse.somethingWentWrongError(res);
    }
}
function updateImage(dbName,id,image){
    return new Promise(async (resolve,reject)=>{
        try{
            var updateQuery="update gift_card set image=? where id=?"
            await ExecuteQ.Query(dbName,updateQuery,[image,id]);
            resolve()
        }
        catch(Err){
            reject(Err)
        }
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

function DelGift(id,user_id,dbName){
    return new Promise(async (resolve,reject)=>{
        try{
        var delQuery="update gift_card set deleted_by=? where id=?"
        await ExecuteQ.Query(dbName,delQuery,[user_id,id]);
        resolve()
        }
        catch(Err){
            reject(Err)
        }
    })
}
function updateName(dbName,inputData,names){
       logger.debug("==,names==",names);
        var dataToUpdate=[];
        logger.debug("=====name,userData==",names);
        // let name=inputData.names;
        var zone_offset=inputData.offset || "+05:30";
        let fromDate=moment(inputData.from_date).utcOffset(zone_offset).format('YYYY-MM-DD HH:mm:ss');
        let toDate=moment(inputData.to_date).utcOffset(zone_offset).format('YYYY-MM-DD HH:mm:ss');
        logger.debug("=====toDate======",fromDate,toDate)
        return new Promise( async (resolve,reject)=>{
            try{
            var giftQuery=`update gift_card set quantity=?,percentage_value=?,price_type=?,price=?,name=?,description=?,from_date=?,to_date=? where id=?`;
            let inserCard=await ExecuteQ.Query(dbName,giftQuery,[
                inputData.quantity,
                inputData.percentage_value,
                inputData.price_type,
                inputData.price,
                names[0].name,
                inputData.description,
                fromDate,
                toDate,
                inputData.id
            ])
              if(names && names.length>0){
                  for(const [index,i] of names.entries()){
                      await ExecuteQ.Query(dbName,`update gift_card_ml set name=?,language_id=? where gift_card_id=?`,[i.name,i.language_id,inputData.id]);
                  }
              }
              resolve()
            }
            catch(Err){
                logger.debug("========ERR!==>",Err);
                reject(Err)
            }
            });
    
}

function GiftList(dbName,userData){
    var final=[];
    return new Promise(async (resolve,reject)=>{
        try{
        var brandQuery="select percentage_value,quantity,id,name,description,image,thumb_nail,price,price_type,from_date,to_date from gift_card where deleted_by=?"
        let data=await ExecuteQ.Query(dbName,brandQuery,[0])
        // multiConnection[dbName].query(brandQuery,[0],async function(err,data){
        //     if(err){
        //         reject(err)
        //     }
        //     else{
                logger.debug("===DATA!===",data)
                if(data && data.length>0){
                    var names;
                    for (const i of data) {
                        names=await giftMl(dbName,i.id)
                        final.push({
                            id:i.id,
                            description:i.description,
                            image:i.image,
                            names:names,
                            name:i.name,
                            thumb_nail:i.thumb_nail,
                            description:i.description,
                            price:i.price,
                            price_type:i.price_type,
                            from_date:i.from_date,
                            to_date:i.to_date,
                            percentage_value:i.percentage_value,
                            quantity:i.quantity

                        })
                    }
                    resolve(final)
                }   
                else{
                    resolve(final)
                }             
              
        //     }
        // });
    }
    catch(Err){
        reject(Err)
    }
    });
}
function giftMl (dbName,id){
    return new Promise(async (resolve,reject)=>{
        try{
            var sql="select name,language_id from gift_card_ml where gift_card_id=?"
            let data=await ExecuteQ.Query(dbName,sql,[id]);
            logger.debug("=DATA=!=",data)
            resolve(data)
        }
        catch(Err){
            reject(Err)
        }
   
})

} 

/**
 * @desc used for saving an gift 
 * @param {*Array} name 
 * @param {*Array} variant_values 
 */
function SaveGift(dbName,inputData,names,createdBy) {
    logger.debug("=====name,userData==",names);
    // let name=inputData.names;
    var zone_offset=inputData.offset || "+05:30";
    let fromDate=moment(inputData.from_date).utcOffset(zone_offset).format('YYYY-MM-DD HH:mm:ss');
    let toDate=moment(inputData.to_date).utcOffset(zone_offset).format('YYYY-MM-DD HH:mm:ss');
    logger.debug("=====toDate======",fromDate,toDate)
    var final_value,ml_values=[],final_ml_value;

    return new Promise( async(resolve,reject)=>{
        try{
        var giftQuery=`insert into gift_card (quantity,percentage_value,price_type,price,name,description,created_by,from_date,to_date) 
        values(?,?,?,?,?,?,?,?,?)`;
        let inserCard=await ExecuteQ.Query(dbName,giftQuery,[
            inputData.query,
            inputData.percentage_value,
            inputData.price_type,
            inputData.price,
            names[0].name,
            inputData.description,
            createdBy,
            fromDate,
            toDate
        ])
          if(names && names.length>0){
              _.each(names,function(i){
                       ml_values.push(i.name,i.language_id,inserCard.insertId);
                })
          }
          final_ml_value=chunk(ml_values,3);
          logger.debug(final_ml_value)
          var mlQuery="insert into gift_card_ml (`name`,`language_id`,`gift_card_id`) values ?"
          await ExecuteQ.Query(dbName,mlQuery,[final_ml_value]);
          resolve(inserCard);
        }
        catch(Err){
            logger.debug("========ERR!==>",Err);
            reject(Err)
        }
        });
}

module.exports={
    Add:Add,
    List:List,
    Update:Update,
    Delete:Delete
}

