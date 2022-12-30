/**
 * ==============================================================================
 * created by cbl-146
 * @description used for performing an setting related action like listing/adding
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
const queryModel=require('../../Model')
var uploadMgr=require('../../lib/UploadMgr')
const common=require('../../common/agent');
/**
 * @desc used for adding an new keys in settings
 * @param {Object} req
 * @param {Object} res
 */

const addColorPalleteCodes = async (req,res)=>{

    try{
         let sql = 'insert into `tbl_setting`(`key`,`value`) values(?,?)';
         let values = [`color_pallete_code`,req.body.color_pallete_codes ];
         await ExecuteQ.Query(req.dbName,sql,values);
        
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch(err){
        console.log(err);
        sendResponse.somethingWentWrongError(res);
    }
}

const addSettings = async (req,res)=>{

    try{
        let logo_url;
        let favicon_url;
        let brandImage_url;
        let card_gateway="";
        let singleFoodBottomBanner2;
        let singleFoodBottomBanner1;
        let singleFoodStoryBackground;
        let agentConnection={};
        if(req.body.card_gateway!==""){
            card_gateway= req.body.card_gateway
        }else{
            card_gateway = ""
        }
        if(req.files && req.files.logo_url){
            logo_url = await uploadMgr.uploadImageFileToS3BucketNew(req.files.logo_url)
            req.body["logo_url"]=logo_url;
            // logo_url = await uploadImage(req.files.logo_url);
        }else{  
            logo_url = req.body.logo_url
        }
        if(req.files && req.files.favicon_url){
            favicon_url = await uploadMgr.uploadImageFileToS3BucketNew(req.files.favicon_url);
            req.body["favicon_url"]=favicon_url;
        }else{  
            favicon_url = req.body.favicon_url
        }
        
        if(req.files && req.files.brandImage_url){
            brandImage_url = await uploadMgr.uploadImageFileToS3BucketNew(req.files.brandImage_url);
            req.body["brandImage_url"]=brandImage_url;
        }else{
            brandImage_url = req.body.brandImage_url
        }

        

        if(req.files && req.files.singleFoodBottomBanner1){
            singleFoodBottomBanner1 = await uploadMgr.uploadImageFileToS3BucketNew(req.files.singleFoodBottomBanner1)
            req.body["singleFoodBottomBanner1"]=singleFoodBottomBanner1;
        }else{
            singleFoodBottomBanner1 = req.body.singleFoodBottomBanner1
        }

        if(req.files && req.files.singleFoodStoryBackground){
            singleFoodStoryBackground = await uploadMgr.uploadImageFileToS3BucketNew(req.files.singleFoodStoryBackground)
            req.body["singleFoodStoryBackground"]=singleFoodStoryBackground;
        }else{
            singleFoodStoryBackground = req.body.singleFoodStoryBackground
        }

        if(req.files && req.files.singleFoodBottomBanner2){
            singleFoodBottomBanner2 = await uploadMgr.uploadImageFileToS3BucketNew(req.files.singleFoodBottomBanner2)
            req.body["singleFoodBottomBanner2"]=singleFoodBottomBanner2;
        }else{
            singleFoodBottomBanner2 = req.body.singleFoodBottomBanner2
        }

        // req.body["brandImage_url"]=brandImage_url;
        // req.body["singleFoodBottomBanner1"]=singleFoodBottomBanner1;
        // req.body["singleFoodBottomBanner2"]=singleFoodBottomBanner2;
        // req.body["singleFoodStoryBackground"]=singleFoodStoryBackground;
        // req.body["favicon_url"]=favicon_url;
        // req.body["logo_url"]=logo_url;
        req.body["card_gateway"]=card_gateway!=undefined?card_gateway:""
        logger.debug("-=============bdoy==========>>===",req.body);
        for (let [key, value] of Object.entries(req.body)) {
            logger.debug("==key==val==loop======>>"+`${key}: ${value}`);
            let getAgentDbData=await common.GetAgentDbInformation(req.dbName);        
            logger.debug("===AGENT==CONNECTION==>>==2=",Object.entries(agentConnection).length)
            if(Object.entries(agentConnection).length===0){
                agentConnection=await common.RunTimeAgentConnection(getAgentDbData);
            }
            let agentkeyData=await ExecuteQ.QueryAgent(agentConnection,"select `key`,`value` from cbl_keys where `key`=?",[key]);
            if(agentkeyData && agentkeyData.length>0){
                await ExecuteQ.QueryAgent(agentConnection,"update cbl_keys set `value`=? where `key`=?",[value,key])
            }
            else{
                await ExecuteQ.QueryAgent(agentConnection,"insert into cbl_keys (`key`,`value`) values(?,?)",[key,value])
            }
            await updateInsertSetting(res,req.dbName,key,value);
        }
        let savedData = {
            logo_url : logo_url,
            favicon_url : favicon_url,
            brandImage_url : brandImage_url,
            card_gateway:card_gateway,
            singleFoodBottomBanner2:singleFoodBottomBanner2,
            singleFoodBottomBanner1:singleFoodBottomBanner1
        }
        sendResponse.sendSuccessData(savedData, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch(err){
        console.log(err);
        sendResponse.somethingWentWrongError(res);
    }
}

const addSectionsDescriptions = async(req,res)=>{
    try{
        let sections = req.body.sections
        let image1 = ""
        let image2 = ""
        let image3 = ""
        let image4 = ""
        if(req.files.image1){
            image1 = await uploadMgr.uploadImageFileToS3BucketNew(req.files.image1)
        }else{
            image1 = req.body.image1
        }

        if(req.files.image2){
            image2 = await uploadMgr.uploadImageFileToS3BucketNew(req.files.image2)
        }else{
            image2 = req.body.image2
        }

        if(req.files.image3){
            image3 = await uploadMgr.uploadImageFileToS3BucketNew(req.files.image3)
        }else{
            image3 = req.body.image3            
        }


        if(req.files.image4){
            image4 = await uploadMgr.uploadImageFileToS3BucketNew(req.files.image4)
        }else{
            image4 = req.body.image4            
        }
        let temp = [image1,image2,image3,image4]
        logger.debug("========sections===1===",sections);
        sections = JSON.parse(sections)
        if(sections && sections.length>0){
            sections.forEach((section,index)=>{
                section["image"]=temp[index]
            })
        }else{

        }
        logger.debug("========sections==2====",sections);
        sections = JSON.stringify(sections)
         await updateInsertSetting(res,req.dbName,"description_sections",sections);
         sendResponse.sendSuccessData(sections, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

    }catch(err){
        logger.debug("======err==",err)
        sendResponse.somethingWentWrongError(res);
    }
}


const addPickUpDeliveryBanners = async(req,res)=>{
    try{
        let pickup_url_one = ""
        let pickup_url_two = ""
        let pickup_url_three = ""
        let delivery_url_one = ""
        let delivery_url_two = ""
        let delivery_url_three = ""
        if(req.files.pickup_url_one){
            pickup_url_one = await uploadMgr.uploadImageFileToS3BucketNew(req.files.pickup_url_one)
        }else{
            pickup_url_one = req.body.pickup_url_one
        }

        if(req.files.pickup_url_two){
            pickup_url_two = await uploadMgr.uploadImageFileToS3BucketNew(req.files.pickup_url_two)
        }else{
            pickup_url_two = req.body.pickup_url_two
        }

        if(req.files.pickup_url_three){
            pickup_url_three = await uploadMgr.uploadImageFileToS3BucketNew(req.files.pickup_url_three)
        }else{
            pickup_url_three = req.body.pickup_url_three
        }


        if(req.files.delivery_url_one){
            delivery_url_one = await uploadMgr.uploadImageFileToS3BucketNew(req.files.delivery_url_one)
        }else{
            delivery_url_one = req.body.delivery_url_one
        }

        if(req.files.delivery_url_two){
            delivery_url_two = await uploadMgr.uploadImageFileToS3BucketNew(req.files.delivery_url_two)
        }else{
            delivery_url_two = req.body.delivery_url_two
        }
        
        if(req.files.delivery_url_three){
            delivery_url_three = await uploadMgr.uploadImageFileToS3BucketNew(req.files.delivery_url_three)
        }else{
            delivery_url_three = req.body.delivery_url_three
        }

        req.body["pickup_url_one"]=pickup_url_one;
        req.body["pickup_url_two"]=pickup_url_two;
        req.body["pickup_url_three"]=pickup_url_three;
        req.body["delivery_url_one"]=delivery_url_one
        req.body["delivery_url_two"]=delivery_url_two;
        req.body["delivery_url_three"]=delivery_url_three
        logger.debug("-=============bdoy==========>>===",req.body);
        for (let [key, value] of Object.entries(req.body)) {
            logger.debug("==key==val==loop======>>"+`${key}: ${value}`);
            await updateInsertSetting(res,req.dbName,key,value);
        }
         sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

    }catch(err){
        logger.debug("======err==",err)
        sendResponse.somethingWentWrongError(res);
    }
}

const updateInsertSetting=(res,dbName,key,value)=>{
    return new Promise(async (resolve,reject)=>{
            try{

                let data=await ExecuteQ.Query(dbName,"select `key`,`value` from tbl_setting where `key`=?",[key])
                logger.debug("=========DAT!==>>",data)
                if(data && data.length>0){
                    await updateSettings(res,dbName,key,value);
                    resolve()
                }
                else{
                     await ExecuteQ.Query(dbName,"insert into tbl_setting (`key`,`value`) values(?,?)",[key,value])
                     resolve()
                }
            }
            catch (e) {
                logger.debug("=====E==>>",e)
                resolve()
            }
    })

}

const settingsList = async (req,res)=>{
    try{
        let getList = await getSettingsList(res,req.dbName)
        logger.debug("==========getList--==============",getList)
        sendResponse.sendSuccessData(getList, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch(err){
        console.log(err);
        sendResponse.somethingWentWrongError(res);
    }
}

async function getSettingsList(res,dbName){
    try{
        let query = "select id,`key`,value from tbl_setting";
        let settingsList = await ExecuteQ.Query(dbName,query,[])
        return settingsList;
    }catch(Err){
        logger.debug(Err)
        sendResponse.somethingWentWrongError(res);
    }
}

/**
 * @desc used for update the settings
 * @param {*String} dbname 
 * @param {*Array} dataToSave 
 */

async function updateSettings(res,dbName,key,value){
    console.log("===========value======",value)
    try{
        let query2 = "update tbl_setting set value = ? where `key` = ?"
        await ExecuteQ.Query(dbName,query2,[value,key])
    }catch(Err){
        logger.debug(Err)
        sendResponse.somethingWentWrongError(res);
    }
}


async function deleteSettings(res,dbName){
    try{
        let query1 = "delete from tbl_setting"
        await ExecuteQ.Query(dbName,query1,[])
    }catch(Err){
        logger.debug(Err)
        sendResponse.somethingWentWrongError(res);
    }
}

/**
 * @desc used for upload the image
 */

function uploadImage(file){

    return new Promise(async (resolve,reject)=>{
        image=await uploadMgr.uploadImage(file)
        resolve(image);
    })
}

const updateDefaultAddrss=async (req,res)=>{
    try{
        let input_data=req.body;
        let sql="update default_address set `address`=?,`latitude`=?,`longitude`=? where id=?"
        await ExecuteQ.Query(req.dbName,sql,[input_data.address,input_data.latitude,input_data.longitude,input_data.id])  
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch(err){
        logger.debug(err);
        sendResponse.somethingWentWrongError(res);
    }
}

const addDefaultAddress=async (req,res)=>{
    let input_data=req.body;
    logger.debug("===>",input_data.address);
        try{
        let sql="insert into default_address (`address`,`latitude`,`longitude`) values(?,?,?)"
        await ExecuteQ.Query(req.dbName,sql,[input_data.address,input_data.latitude,input_data.longitude]);
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch(Err){
        logger.debug("======Err!==>>",Err);
        sendResponse.somethingWentWrongError(res);
    }
    
}
const listDefaultAddrs=async (req,res)=>{
    try{
        let data=await ExecuteQ.Query(req.dbName,"select `id`,`address`,`latitude`,`longitude` from default_address");
        sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch(Err){
        sendResponse.somethingWentWrongError(res)
    }
}

const addUserTypes = async(req,res)=>{
    try{
        let params = req.body
        let type_name = params.type_name
        let payment_gateways = params.payment_gateways==undefined?"":params.payment_gateways.join("#")
        await checkTypeName(req.dbName,type_name);
        let user_type_id =  await addTypeName(req.dbName,type_name,payment_gateways);
        let query = "select id from user_types where is_default=1 limit 1"
        let default_type = await ExecuteQ.Query(req.dbName,query,[]);
        await assignUserTypeToPricing(req.dbName,user_type_id,default_type[0].id);
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch(err){
        sendResponse.sendErrorMessage(err,res,500);
    }
}

function checkTypeName(dbName,type_name){
    return new Promise(async(resolve,reject)=>{
        let query = "select id from user_types where type_name=?";
        let params = [type_name];
        let result = await ExecuteQ.Query(dbName,query,params);
        if(result && result.length>0){
            reject("user type with this name already exist");
        }else{
            resolve()
        }

    })
}
function addTypeName(dbName,type_name,payment_gateways){
    return new Promise(async(resolve,reject)=>{
        try{
            let query = "insert into user_types(type_name,payment_gateways) values(?,?)";
            let params = [type_name,payment_gateways];
            let result = await ExecuteQ.Query(dbName,query,params);
            resolve(result.insertId);
        }catch(e){
            logger.debug("============e=========",e);
            reject(e)
        }
    })
}

function assignUserTypeToPricing(dbName,user_type_id,default_type_id){
    return new Promise(async(resolve,reject)=>{
        try{
            let query = "INSERT INTO product_pricing (product_id,start_date,end_date,offer_name,"
            query += "price,display_price,handling,handling_supplier,can_urgent,urgent_price,"
            query += "house_cleaning_price,beauty_saloon_price,commission,delivery_charges,is_deleted,"
            query += "price_type,commission_type,urgent_type,min_hour,max_hour,per_hour_price,"
            query += "urgent_value,pricing_type,gst_price,user_type_id) "
            query += "SELECT product_id,start_date,end_date,offer_name,"
            query += "price,display_price,handling,handling_supplier,can_urgent,urgent_price,"
            query += "house_cleaning_price,beauty_saloon_price,commission,delivery_charges,is_deleted,"
            query += "price_type,commission_type,urgent_type,min_hour,max_hour,per_hour_price,"
            query += "urgent_value,pricing_type,gst_price,? "
            query += "FROM product_pricing WHERE user_type_id=?"
            let params = [user_type_id,default_type_id]
            await ExecuteQ.Query(dbName,query,params);
            resolve();
        }catch(e){
            logger.debug("+++++++++++++++++++e============",e);
            reject(e)
        }
    })
}



const updateUserTypes = async(req,res)=>{
    try{
        let params = req.body
        let type_name =  params.type_name
        let id = params.id
        let payment_gateways = params.payment_gateways==undefined?"":params.payment_gateways.join("#");

        await updateTypeName(req.dbName,type_name,payment_gateways,id)
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch(err){
        sendResponse.sendErrorMessage(err,res,500);
    }
}

function updateTypeName(dbName,type_name,payment_gateways,id){
    return new Promise(async(resolve,reject)=>{
        let query = "update user_types set type_name = ?,payment_gateways=? where id = ?";
        let params = [type_name,payment_gateways,id];
        let result = await ExecuteQ.Query(dbName,query,params);
        resolve();
    })
}

const deleteUserTypes = async(req,res)=>{
    try{
        let params = req.body
        let user_type_id =  params.id
        logger.debug("+========params=====+",params)
        let query = "select id from user_types where is_default=1 limit 1"
        let default_type = await ExecuteQ.Query(req.dbName,query,[]);
        logger.debug("===default type=======",default_type)
        await assignDefaultUserTypeToUsers(req.dbName,default_type[0].id,user_type_id)
        await removeUserTypeFromProductPricing(req.dbName,user_type_id);
        await deleteTypeName(req.dbName,user_type_id);

        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch(err){
        sendResponse.sendErrorMessage(err,res,500);
    }
}

function assignDefaultUserTypeToUsers(dbName,defaul_type_id,user_type_id){
    return new Promise(async(resolve,reject)=>{
        try{
            let query = "update user set user_type_id=? where user_type_id=?"
            let params = [defaul_type_id,user_type_id];
            await ExecuteQ.Query(dbName,query,params);
            resolve();   
        }catch(e){
            logger.debug("=========er=======",er);
            reject(e)
        }
    })
}

function removeUserTypeFromProductPricing(dbName,user_type_id){
    return new Promise(async(resolve,reject)=>{
        try{
            let query = "delete from product_pricing where user_type_id=?";
            let params = [user_type_id]
            await ExecuteQ.Query(dbName,query,params);
            resolve();
        }catch(e){
            logger.debug("+=================er===",e)
            reject(e)
        }
    })
}

function deleteTypeName(dbName,user_type_id){
    return new Promise(async(resolve,reject)=>{
        let query = "delete from user_types where id=?";
        let params = [user_type_id];
        let result = await ExecuteQ.Query(dbName,query,params);
        resolve();
    })
}

const listUserTypes = async(req,res)=>{
    try{
        let params = req.query
        let result = await listTypeNames(req.dbName);
        sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch(err){
        sendResponse.sendErrorMessage(err,res,500);
    }
}

function listTypeNames(dbName){
    return new Promise(async(resolve,reject)=>{
        let query = "select * from user_types";
        let params = [];
        let result = await ExecuteQ.Query(dbName,query,params);
        resolve(result);
    })
}



// function addTypeName(dbName,type_name,is_active){
//     return new Promise(async(resolve,reject)=>{
//         let query = "insert into user_types (type_name,is_active) values(?,?)";
//         let params = [type_name,is_active];
//         let result = await ExecuteQ.Query(dbName,query,params);
//         resolve();
//     })
// }


const Universal = require('../../util/Universal')
var func = require('../../routes/commonfunction');

const editUserDetails = async(req,res)=>{
    let input_data=req.body;
    let user_type_id = req.body.user_type_id==undefined?0:req.body.user_type_id;

    let enable_manual_full_user_update = await ExecuteQ.Query(req.dbName,"select `key`,`value` from tbl_setting where `key`=?",["enable_manual_full_user_update"]);
    console.log(enable_manual_full_user_update,"kkkkkkkkkkkkkkk");

        try{
            let sql,params;
            if(enable_manual_full_user_update && enable_manual_full_user_update.length>0 && enable_manual_full_user_update[0].value==1){

                sql = "update user set otp_verified=?,mobile_no=?,country_code=?,iso=?,user_type_id=?, firstname=?, lastname = ?, email = ?, loyalty_points = ? where id=?";

                params = [input_data.otp_verified,input_data.phone_number,input_data.country_code,input_data.iso,user_type_id, input_data.firstname, input_data.lastname, input_data.email, input_data.loyalty_points, input_data.user_id ];

            }
            else if(input_data.email!=undefined){
                sql = "update user set otp_verified=?,mobile_no=?,country_code=?,iso=?,user_type_id=?,email=? where id=?"
                params = [input_data.otp_verified,input_data.phone_number,input_data.country_code,input_data.iso,user_type_id,input_data.email,input_data.user_id]
               
            } 
            else{
                if (req.body.loyalty_points) {
                    sql = "update user set otp_verified=?,mobile_no=?,country_code=?,iso=?,user_type_id=?, loyalty_points=? where id=?"
                    params = [input_data.otp_verified,input_data.phone_number,input_data.country_code,input_data.iso,user_type_id,req.body.loyalty_points,input_data.user_id]
                } else {
                    sql = "update user set otp_verified=?,mobile_no=?,country_code=?,iso=?,user_type_id=? where id=?"
                    params = [input_data.otp_verified,input_data.phone_number,input_data.country_code,input_data.iso,user_type_id,input_data.user_id]
                }
            }
            
            await ExecuteQ.Query(req.dbName,sql,params);
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch(Err){
        logger.debug("======Err!==>>",Err);
        sendResponse.somethingWentWrongError(res);
    }
}

const updateUserPassword = async(req,res)=>{
    let input_data=req.body;
        try{
            let password = md5(input_data.password)
            let new_password = input_data.password
            let sql = "update user set password=? where id=?"
            let params = [password,input_data.user_id]
            await ExecuteQ.Query(req.dbName,sql,params);
            let userDetailsQuery = "select * from user where id = ?"
            let paramUserDetails =  [input_data.user_id]
            let userDetails = await ExecuteQ.Query(req.dbName,userDetailsQuery,paramUserDetails);

            let extraValueInMail=await ExecuteQ.Query(req.dbName,"select `key`,`value` from tbl_setting where `key`=?",["mail_enhancement"]);
            console.log(extraValueInMail,"kkkkkkkkkkkkkkk")

            let smtpSqlSata=await Universal.smtpData(req.dbName);

            let subject = "Password changed";

            let content = "Hi, your password reset by the admin. Your new login password is "+new_password

            if(extraValueInMail && extraValueInMail.length>0 && extraValueInMail[0].value==1){

                let colorThemeData = await ExecuteQ.Query(req.dbName, "select `key`,`value` from tbl_setting where `key`=?", ["theme_color"]);

                let colorTheme = colorThemeData && colorThemeData.length > 0 ? colorThemeData[0].value : "#e84b58";

                content = Universal.getUserResetPasswordTemplate(req.dbName,req,new_password,colorTheme);

            }


             sendEmail(smtpSqlSata,res,subject,userDetails[0].email,content)
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch(Err){
        logger.debug("======Err!==>>",Err);
        sendResponse.somethingWentWrongError(res);
    }
}

function sendEmail (smtpSqlSata,reply,subject,userEmail,content){
    return new Promise((resolve,reject)=>{
        func.sendMailthroughSMTP(smtpSqlSata,reply,subject,userEmail,content,0,function(err,result){
            if(err){
                console.log("error sending mail",err)
               resolve();
            }else{
                console.log('======success send mail=====',result)
                resolve();
            }
        });
    })
}

const activateUserType = async(req,res)=>{
    let input_data=req.body;
        try{
            let query = "select id from user_types where is_default =1 limit 1"
            let default_user_type = await ExecuteQ.Query(req.dbName,query,[])
            await assignUserTypes(req.dbName,default_user_type[0].id)
            await updateOrInsertUserTypeCheck(req.dbName,"user_type_check",1);
            
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch(Err){
        logger.debug("======Err!==>>",Err);
        sendResponse.somethingWentWrongError(res);
    }
}

function updateOrInsertUserTypeCheck(dbName,key,value){
    return new Promise(async(resolve,reject)=>{
        let selectQuery = "select id from tbl_setting where `key`=?"
        let result = await ExecuteQ.Query(dbName,selectQuery,[key])
        if(result && result.length>0){
            let updateQuery = "update tbl_setting set value=? where `key`=?"
            await ExecuteQ.Query(dbName,updateQuery,[value,key])
            resolve();
        }else{
            let insertQuery = "insert into tbl_setting(`key`,value) values(?,?) "
            await ExecuteQ.Query(dbName,insertQuery,[key,value])
            resolve();
        }
    })
}

function assignUserTypes(dbName,defaultId){
    return new Promise(async(resolve,reject)=>{
        try{
            let query = " update product_pricing set user_type_id=? "
            await ExecuteQ.Query(dbName,query,[defaultId]);
            resolve();
        }catch(err){
            logger.debug("=========err==============",err);
            reject(err)
        }
    })
}


const deactivateUserType = async(req,res)=>{
    let input_data=req.body;
        try{
            let query = "select id from user_types where is_default =1 limit 1"
            let default_user_type = await ExecuteQ.Query(req.dbName,query,[])
            await updateAndDeleteUserTypes(req.dbName,default_user_type[0].id)
            let query2 = "update product_pricing set user_type_id=0"
            let params = []
            await ExecuteQ.Query(req.dbName,query2,params)
            let query3 = "delete from user_types where is_default<>1"
            await ExecuteQ.Query(req.dbName,query3,[])
            let query4 = "update user set user_type_id=0"
            await ExecuteQ.Query(req.dbName,query4,[])
            await updateOrInsertUserTypeCheck(req.dbName,"user_type_check",0);
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch(Err){
        logger.debug("======Err!==>>",Err);
        sendResponse.somethingWentWrongError(res);
    }
}

function updateAndDeleteUserTypes(dbName,defaultId){
    return new Promise(async(resolve,reject)=>{
        try{
            let query = "delete from product_pricing where user_type_id<>? "
            await ExecuteQ.Query(dbName,query,[defaultId]);
            resolve();
        }catch(err){
            logger.debug("=========err==============",err);
            reject(err)
        }
    })
}
const updateCurrencyValue=async (req,res)=>{
    try{
        let input_data=req.body;
        let sql="update currency_conversion set `currency_name`=?,`currency_symbol`=?,`conversion_rate`=?,`currency_description`=?,`country_name`=? where id=?"
        await ExecuteQ.Query(req.dbName,sql,[input_data.currencyName,input_data.currencySymbol,
            input_data.conversion_rate,
            input_data.currency_description,
            input_data.country_name,
            input_data.id])  
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch(err){
        logger.debug(err);
        sendResponse.somethingWentWrongError(res);
    }
}

const deleteCurrencyValue=async (req,res)=>{
    try{
        let input_data=req.body;
        let sql="delete from currency_conversion  where id=?"

        await ExecuteQ.Query(req.dbName,sql,[
            input_data.id])  

        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch(err){
        logger.debug(err);
        sendResponse.somethingWentWrongError(res);
    }
}

const addCurrencyValue = async (req,res)=>{
    try{
        let input_data=req.body;
        let sql="insert into currency_conversion (currency_name,currency_symbol,conversion_rate,currency_description,country_name) values(?,?,?,?,?)"
        await ExecuteQ.Query(req.dbName,sql,[input_data.currencyName,input_data.currencySymbol,
            input_data.conversion_rate,input_data.currency_description,input_data.country_name])  
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch(err){
        logger.debug(err);
        sendResponse.somethingWentWrongError(res);
    }
}
/**
 * @description used for listing an currency
 * @param {*Object} req 
 * @param {*Object} res 
 */
const currencyList = async(req,res)=>{
    try{
        let result = await ExecuteQ.Query(req.dbName,`select * from currency_conversion`,[]);
        sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch(err){
        sendResponse.sendErrorMessage(err,res,500);
    }
}  
const changePickupStatus=async(req,res)=>{
    try{
        let is_pickup_order=req.body.is_pickup_order;
        await queryModel.bookingCarFlow.updateStatus(req.dbName,[is_pickup_order,1])
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch(Err){
        sendResponse.sendErrorMessage(err,res,500);
    }
}


const activeDeactiveAllSuppilerScheduling = async (req,res)=>{
    try{
        let status = req.body.status

        let query = "update supplier set is_scheduled=? ";

        await ExecuteQ.Query(req.dbName,query,[status]);

        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch(err){
        console.log(err);
        sendResponse.somethingWentWrongError(res);
    }
}

const blockUnblockAllSuppliers = async (req,res)=>{
    try{
        let is_block = req.body.is_block
        let query = "update supplier s join supplier_admin sa on s.id = sa.supplier_id set s.is_live=?,s.is_active = ?,sa.is_active = ?  ";

        await ExecuteQ.Query(req.dbName,query,[is_block,is_block,is_block]);

        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch(err){
        console.log(err);
        sendResponse.somethingWentWrongError(res);
    }
}


module.exports = {

    activeDeactiveAllSuppilerScheduling:activeDeactiveAllSuppilerScheduling,
    blockUnblockAllSuppliers:blockUnblockAllSuppliers,
    changePickupStatus:changePickupStatus,
    currencyList:currencyList,
    updateCurrencyValue:updateCurrencyValue,
    addSettings : addSettings,
    addDefaultAddress:addDefaultAddress,
    updateDefaultAddrss:updateDefaultAddrss,
    settingsList : settingsList,
    listDefaultAddrs:listDefaultAddrs,
    addUserTypes:addUserTypes,
    updateUserTypes:updateUserTypes,
    deleteUserTypes:deleteUserTypes,
    listUserTypes:listUserTypes,
    addSectionsDescriptions:addSectionsDescriptions,
    addPickUpDeliveryBanners:addPickUpDeliveryBanners,
    editUserDetails:editUserDetails,
    updateUserPassword:updateUserPassword,
    activateUserType:activateUserType,
    deactivateUserType:deactivateUserType,
    addCurrencyValue:addCurrencyValue,
    deleteCurrencyValue:deleteCurrencyValue,
    addColorPalleteCodes : addColorPalleteCodes

}