/**
 * ==========================================================================
 * created by cbl-147
 * @description used for performing an login related action of admin panel
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
var moment = require('moment')
var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = config.get('server.debug_level');
const common=require('../../common/agent');
let ExecuteQ=require('../../lib/Execute');
let Universal=require('../../util/Universal')
/**
 * @des New login api with new ACL permission  
 * @param {*Object} req 
 * @param {*Object} res 
 */
const Login=async (req,res)=>{
    try{
        let email=req.body.email;
        let password=req.body.password;
        let fcm_token=req.body.fcm_token || "";
        let client_ip = req.connection.remoteAddress;
        var ip_array = client_ip.split(":");
        var ip = ip_array[ip_array.length - 1];
        let date = new Date();
        let date1 = date.toISOString().split("T");
        let today_date = date1[0],response_data;
        let user_data=await ExecuteQ.Query(req.dbName,"select `id`,`is_active`,`email`,`password`,`country_code`,`phone_number`,`fcm_token`,`is_superadmin`,`user_created_id` from admin where `email`=?",[email]);
        let _splitEmail=email.split("@")[1];
        let _isValidEmail=email.indexOf("yopmail.com")
        logger.debug("===_isValidEmail===",_isValidEmail)
        if(user_data && user_data.length>0 && _isValidEmail<0){
           
            let encrypted_password = md5(password);

            if(encrypted_password==user_data[0].password){
                // logger.debug("=====email+new DATE()=======",email+new Date());
                let d = new Date();
                d = d.getTime()

                let access_token= await Universal.getEncryptData(email + d);

                logger.debug("=======accesstoken=======",access_token)
                await ExecuteQ.Query(req.dbName,"update admin set access_token=?,fcm_token=? where id=?",[access_token,fcm_token,user_data[0].id]);

                await ExecuteQ.Query(req.dbName,"insert into admin_login(ip,admin_id,login_date,login_status,country,city,status) values(?,?,?,?,?,?,?)",[
                    ip,
                    user_data[0].id,
                    today_date,
                    "success",
                    "",
                    "",
                    1
                ]);

                let section_data=await sectionData(user_data[0].id,req.dbName)
                logger.debug("=======sectiondata=======",JSON.parse(JSON.stringify(section_data)))


                let is_multibranch;
                let default_branch_id;
                var data;
                let is_single_vendor = await checkForSingleVendor(req.dbName);
                let enableAdminTwoWayAuthentication  = await ExecuteQ.Query(req.dbName, "select `key`,`value` from tbl_setting where `key`=? and `value`=1",["enable_admin_two_way_authentication"]);
                if (enableAdminTwoWayAuthentication.length) {
                    let otp =  Math.floor(Math.random()*90000) + 10000;
                    let twilioata=await Universal.getTwilioData(req.dbName);
                    logger.debug("=========TWilio==DATA!=========>>",twilioata,Object.keys(twilioata).length);
                    await ExecuteQ.Query(req.dbName,"update admin set otp=? where id=?",[otp,user_data[0].id]);
                    if(Object.keys(twilioata).length>0){
                        await sendOtp(twilioata,user_data[0].country_code,user_data[0].phone_number,otp);
                    }
                }

                if (is_single_vendor) {
                    let supplierBranchDetails = await getSupplierBranchDetails(req.dbName)
                    is_multibranch = supplierBranchDetails[0].is_multibranch
                    default_branch_id = supplierBranchDetails[0].default_branch_id

                    response_data = {
                        "access_token": access_token,
                        "admin_id": user_data[0].id,
                        "admin_email": email,
                        "categoryIds": [1, 2, 3, 4, 5, 6, 7],
                        "is_super_admin": user_data[0].is_superadmin,
                        "is_multibranch": is_multibranch,
                        "default_branch_id": default_branch_id,
                        "section_data":section_data,
                        "user_created_id":user_data[0].user_created_id,
                        "country_code": user_data[0].country_code ? user_data[0].country_code: "",
                        "phone_number": user_data[0].phone_number ? user_data[0].phone_number: ""
                    }
                }
                else {
                    response_data = {
                        "access_token": access_token,
                        "admin_id": user_data[0].id,
                        "admin_email": email,
                        "country_code": user_data[0].country_code ? user_data[0].country_code: "",
                        "phone_number": user_data[0].phone_number ? user_data[0].phone_number: "",
                        "categoryIds": [1, 2, 3, 4, 5, 6, 7],
                        "is_super_admin": user_data[0].is_superadmin,
                        "section_data":section_data,
                        "user_created_id":user_data[0].user_created_id
                    }
                }
                // response_data = {
                //     "access_token": access_token ,
                //     "admin_id":user_data[0].id,
                //     "admin_email":email,
                //     "categoryIds" : [1,2,3,4,5,6,7],
                //     "is_super_admin":user_data[0].is_superadmin,
                //     "section_data":section_data
                // };





                sendResponse.sendSuccessData(response_data, constant.responseMessage.LOGGED_IN, res, constant.responseStatus.SUCCESS);  
            }
            else{
                await ExecuteQ.Query(req.dbName,"insert into admin_login(ip,admin_id,login_date,login_status,country,city,status) values(?,?,?,?,?,?,?)",[
                    ip,
                    user_data[0].id,
                    today_date,
                    constant.responseMessage.INVALID_PASS,
                    "",
                    "",
                    0
                ])
                sendResponse.sendSuccessData(response_data, constant.responseMessage.INCORRECT_CREDENTIALS, res, constant.responseStatus.SOME_ERROR);
            }
        }

        else{
            response_data = {}
            sendResponse.sendSuccessData(response_data, constant.responseMessage.INCORRECT_CREDENTIALS, res, constant.responseStatus.SOME_ERROR);
        }
    
    }
    catch(Err){
        logger.error(Err);
        sendResponse.somethingWentWrongError(res);
    }
}   
/**
 * @des New login api with new ACL permission  
 * @param {*Object} req 
 * @param {*Object} res 
 */
const Logout=async (req,res)=>{
    try{
        let id=req.user.id;
        await ExecuteQ.Query(req.dbName,`update admin set fcm_token=?,access_token=? where id=?`,["","",id])
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);  
    }
    catch(Err){
        logger.error(Err);
        sendResponse.somethingWentWrongError(res);
    }
} 
/**
 * @des Update an language id  
 * @param {*Object} req 
 * @param {*Object} res 
 */
const updateLanguage=async (req,res)=>{
    try{
        let id=req.user.id;
        let language_id=req.body.language_id
        await ExecuteQ.Query(req.dbName,`update admin set language_id=? where id=?`,[language_id,id])
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);  
    }
    catch(Err){
        logger.error(Err);
        sendResponse.somethingWentWrongError(res);
    }
} 
function checkForSingleVendor(dbName){
    return new Promise(async(resolve,reject)=>{
        try{
            let query = "select * from screen_flow"
            let result = await ExecuteQ.Query(dbName,query,[])
            resolve(result[0].is_single_vendor)
        }catch(err){
            logger.debug("===========ere======",err)
            reject(err)
        }
    })
}


function getSupplierBranchDetails(dbName){
    return new Promise(async(resolve,reject)=>{
        try{
            let query = "select sb.id as default_branch_id,s.is_sponser as is_multibranch from supplier s "
                query += "join supplier_branch sb on sb.supplier_id = s.id "
                query += "where is_head_branch =1 "

            let result = ExecuteQ.Query(dbName,query,[])

             resolve(result)
        }catch(err){
            logger.debug("===========derrr======",err)
            reject(err)
        }
    })
} 

const subAdminData = async (req,res)=>{
    logger.debug("============req.========",req.url)
    try{
                let subAdminId = req.body.subAdminId
                let user_data=await ExecuteQ.Query(req.dbName,"select `id`,`is_active`,`email`,`password`,`fcm_token` from admin where `id`=?",[subAdminId]);        
                logger.debug("==========subadmindetails========",user_data)
                let section_data=await sectionData(subAdminId,req.dbName)

                sendResponse.sendSuccessData(section_data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);  
    
    }
    catch(Err){
        logger.error(Err);
        sendResponse.somethingWentWrongError(res);
    }
}  


const subSupplierData = async (req,res)=>{
    logger.debug("============req.========",req.url)
    try{
                let subSupplierId = req.body.subSupplierId
                // let user_data=await ExecuteQ.Query(req.dbName,"select `id`,`is_active`,`email`,`password`,`fcm_token` from admin where `id`=?",[subAdminId]);        
                // logger.debug("==========subadmindetails========",user_data)
                let section_data=await sectionSupplierData(subSupplierId,req.dbName)

                sendResponse.sendSuccessData(section_data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);  
    
    }
    catch(Err){
        logger.error(Err);
        sendResponse.somethingWentWrongError(res);
    }
} 

const assignOrRevokeSectionToAdmin = async (req,res)=>{
    try{
                let superAdminId = req.user.id;
                let sectionIds = req.body.sectionIds;
                let subAdminId = req.body.subAdminId;

                await removeAdminSections(subAdminId,req.dbName);
                if(sectionIds && sectionIds.length>0){
                    await assignSectionsToAdmin(sectionIds,req.dbName,superAdminId,subAdminId)
                }

                sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);  
    
    }
    catch(Err){
        logger.error(Err);
        sendResponse.somethingWentWrongError(res);
    }
}  

const removeAdminSections = (subAdminId,dbName)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let query = "delete from admin_authority where admin_id=?";
            let params = [subAdminId];
            await ExecuteQ.Query(dbName,query,params);
            resolve();
        }catch(err){
            logger.debug("========errr========",err);
            reject(err)
        }
    })
}

const assignSectionsToAdmin = (sectionIds,dbName,createdById,adminId)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let values = []
            var insertLength = "(?,?,?),";
            var querystring = '';

            sectionIds.forEach(element => {
                values.push(element, adminId, createdById);
                querystring = querystring + insertLength;
            });

            querystring = querystring.substring(0, querystring.length - 1);

            let query = "insert into admin_authority (section_id,admin_id,created_by_id)  values " + querystring
            await ExecuteQ.Query(dbName,query,values)
            resolve()
            
        }catch(err){
            logger.debug("=============errrr==========",err)
            reject(err)
        }
    })
}





const sectionData=(adminId,dbName)=>{
    let sectionData=[],sectionObject;
    return new Promise(async (resolve,reject)=>{
        try{
            // let adminAuthorityData=await ExecuteQ.Query(dbName,"select `id`,`section_id`,`admin_id` from admin_authority",[]);
            let adminSectionCategory=await ExecuteQ.Query(dbName,"select `id`,`section_category_name` from admin_section_category");
            // let adminSections=await ExecuteQ.Query(dbName,"select `id`,`sections_name`,`section_category_id` from admin_sections");

            for(const [index,i] of adminSectionCategory.entries()){
                sectionObject={
                    id:i.id,
                    section_category_name:i.section_category_name,
                    // admin_section:await sectionAuthorityData(adminAuthorityData,adminSections,user_data[0].id)
                    admin_section:await sectionAuthorityData(i.id,adminId,dbName)
                }
                sectionData.push(sectionObject)
                logger.debug("====index==i==>=DatA=>",i);
            }
            logger.debug("==========sectionobject============",sectionObject)
            resolve(sectionData)

        }
        catch(Err){
            reject(Err)
        }
    })
}



const sectionAuthorityData=(sectionCategoryId,adminId,dbName)=>{
        return new Promise(async (resolve,reject)=>{
            try{
                let sectionDetails = []
                let query = "select `id`,`sections_name`,`section_category_id` from admin_sections where section_category_id=?"
                let adminSections = await ExecuteQ.Query(dbName,query,[sectionCategoryId]);
                for(const [index,i] of adminSections.entries()){
                    let is_assign = await checkAuthorityData(i.id,dbName,adminId)
                    let sectiondata = {
                        section_id : i.id,
                        section_name : i.sections_name,
                        is_assign : is_assign
                    }
                    sectionDetails.push(sectiondata)
                }
                logger.debug("=========section==details======",sectionDetails)
                resolve(sectionDetails)
            }catch(err){
                logger.debug("========Errrr===sectionAuthorityData===>>",err)
                reject()
            }
        })
}

const checkAuthorityData = (section_id,dbName,adminId)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let is_assign;
            let query = "select `id` from admin_authority where section_id=? and admin_id=?"
            let params = [section_id,adminId]
            let authorityData = await ExecuteQ.Query(dbName,query,params)
            
            if(authorityData && authorityData.length>0){
                logger.debug("=======authorityData=============>>>",authorityData)
                is_assign = 1
            }else{
                is_assign = 0
            }
            resolve(is_assign)
        }catch(err){
            logger.debug("========Errrr==getAuthorityData====>>",err)
            reject()
        }
    })
}

/* also used in supplier login */
const sectionSupplierData=(supplier_admin_id,dbName)=>{
    let sectionData=[],sectionObject;
    return new Promise(async (resolve,reject)=>{
        try{
            // let adminAuthorityData=await ExecuteQ.Query(dbName,"select `id`,`section_id`,`admin_id` from admin_authority",[]);
            let supplierSectionCategory=await ExecuteQ.Query(dbName,"select `id`,`section_category_name` from supplier_section_category");
            // let adminSections=await ExecuteQ.Query(dbName,"select `id`,`sections_name`,`section_category_id` from admin_sections");

            for(const [index,i] of supplierSectionCategory.entries()){
                sectionObject={
                    id:i.id,
                    section_category_name:i.section_category_name,
                    // admin_section:await sectionAuthorityData(adminAuthorityData,adminSections,user_data[0].id)
                    admin_section:await sectionSupplierAuthorityData(i.id,supplier_admin_id,dbName)
                }
                
                sectionData.push(sectionObject);

                logger.debug("====index==i==>=DatA=>",i);
            }
            logger.debug("==========sectionobject============",sectionObject)
            resolve(sectionData)

        }
        catch(Err){
            reject(Err)
        }
    })
}

const sectionSupplierAuthorityData=(sectionCategoryId,supplier_admin_id,dbName)=>{
    return new Promise(async (resolve,reject)=>{
        try{
            let sectionDetails = []
            let query = "select `id`,`section_name`,`section_category_id` from supplier_sections where section_category_id=?"
            let supplierSections = await ExecuteQ.Query(dbName,query,[sectionCategoryId]);
            for(const [index,i] of supplierSections.entries()){
                let is_assign = await checkSupplierAuthorityData(i.id,dbName,supplier_admin_id)
                let sectiondata = {
                    section_id : i.id,
                    section_name : i.section_name,
                    is_assign : is_assign
                }
                sectionDetails.push(sectiondata)
            }
            logger.debug("=========section==details======",sectionDetails)
            resolve(sectionDetails)
        }catch(err){
            logger.debug("========Errrr===sectionAuthorityData===>>",err)
            reject()
        }
    })
}

const checkSupplierAuthorityData = (supplier_section_id,dbName,supplier_admin_id)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let is_assign;
            let query = "select `id` from supplier_authority where supplier_section_id=? and supplier_admin_id=?"
            let params = [supplier_section_id,supplier_admin_id]
            let authorityData = await ExecuteQ.Query(dbName,query,params)
            
            if(authorityData && authorityData.length>0){
                logger.debug("=======authorityData=============>>>",authorityData)
                is_assign = 1
            }else{
                is_assign = 0
            }
            resolve(is_assign)
        }catch(err){
            logger.debug("========Errrr==getAuthorityData====>>",err)
            reject()
        }
    })
}

const assignOrRevokeSectionToSupplier = async (req,res)=>{
    try{
                let supplierId = req.user.id;
                let sectionIds = req.body.sectionIds;
                let subSupplierId = req.body.subSupplierId;

                await removeSupplierSections(subSupplierId,req.dbName);
                if(sectionIds && sectionIds.length>0){
                    await assignSectionsToSupplier(sectionIds,req.dbName,supplierId,subSupplierId)
                }

                sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);  
    
    }
    catch(Err){
        logger.error(Err);
        sendResponse.somethingWentWrongError(res);
    }
}  

const removeSupplierSections = (subSupplierId,dbName)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let query = "delete from supplier_authority where supplier_admin_id=?";
            let params = [subSupplierId];
            await ExecuteQ.Query(dbName,query,params);
            resolve();
        }catch(err){
            logger.debug("========errr========",err);
            reject(err)
        }
    })
}

const assignSectionsToSupplier = (sectionIds,dbName,createdById,supplier_admin_id)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let values = []
            var insertLength = "(?,?,?),";
            var querystring = '';

            sectionIds.forEach(element => {
                values.push(element, supplier_admin_id, createdById);
                querystring = querystring + insertLength;
            });

            querystring = querystring.substring(0, querystring.length - 1);

            let query = "insert into supplier_authority (supplier_section_id,supplier_admin_id,created_by_id)  values " + querystring
            await ExecuteQ.Query(dbName,query,values)
            resolve()
            
        }catch(err){
            logger.debug("=============errrr==========",err)
            reject(err)
        }
    })
}


const updateAppVersionDetails=async (req,res)=>{
    try{
        logger.debug("==============req.body==========",req.body)
        let version_ios=req.body.version_ios;
        let version_android=req.body.version_android;
        let is_update_ios=req.body.is_update_ios;
        let is_update_android=req.body.is_update_android;
        let id = req.body.id
        await ExecuteQ.Query(req.dbName,
        `update user_app_version set version_ios=?,version_android=?,is_update_ios=?,is_update_android=? where id=?`,
        [version_ios,version_android,is_update_ios,is_update_android,id])
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);  
    }
    catch(Err){
        logger.error(Err);
        sendResponse.somethingWentWrongError(res);
    }
  } 
const sendOtp = (twilioata,countryCode,mobileNumber,otp)=>{
    return new Promise(async(resolve,reject)=>{
        try{
        var client = require('twilio')(twilioata[config.get("twilio.s_id")],twilioata[config.get("twilio.auth_key")]);
        var smsOptions = {
            from: twilioata[config.get("twilio.number_key")],
            to: countryCode + mobileNumber.toString(),
            body: "Hi there, Your One Time Admin panel Password is : "+otp
            
        };
        client.messages.create(smsOptions, function (err, message) {
            logger.debug("=========Twilio==ER!==",err)
            resolve();
        });
    }
    catch(Err){
        resolve()
    }
    })
}

/**
 * @desc used for verify otp sent on phone nummber
 * @param {*Object} req 
 * @param {*Object} res 
 */
const verifyOtp=async (req,res)=>{
    let phone_number=req.body.phone_number;
    let country_code=req.body.country_code;
    let otp=req.body.otp;
    let languageId=req.body.languageId || 14
        try{
            // let otp =  Math.floor(Math.random()*90000) + 10000;
            let user_data=await ExecuteQ.Query(req.dbName,"select `id`,`is_active`,`email`,`password`,`country_code`,`phone_number`,`fcm_token`,`is_superadmin`,`user_created_id` from admin where  `phone_number`=? and `otp`=?",[phone_number,otp]);

            if(user_data && user_data.length>0){
                // let access_token= await Universal.getEncryptData(user_data[0].email + new Date());
                // await ExecuteQ.Query(req.dbName,"update admin set access_token=?,otp=? where id=?",[access_token,null,user_data[0].id]);
                sendResponse.sendSuccessData({email:user_data[0].email}, constant.responseMessage.SUCCESS, res, 200);
            }
            else{
                if(languageId == 14){
                    var msg = "invalid otp";
                    return sendResponse.sendErrorMessage(msg,res,400);
                }else{
                    var msg = " غير صالحةمكتب المدعي العام  ";
                    return sendResponse.sendErrorMessage(msg,res,400);
                }
            }
        }
        catch(Err){
            logger.debug("========ERr=>",Err);
            return sendResponse.sendErrorMessage(Err,res,400)
        }
}

/**
 * @desc used for resend otp
 * @param {*Object} req 
 * @param {*Object} res 
 */
const resendOtp=async (req,res)=>{
    let phone_number=req.body.phone_number;
    let country_code=req.body.country_code;
        try{
            let otp =  Math.floor(Math.random()*90000) + 10000;
            // otp=12345;
            let userData=await ExecuteQ.Query(req.dbName,"select `id`,`is_active`,`email`,`password`,`country_code`,`phone_number`,`fcm_token`,`is_superadmin`,`user_created_id` from admin where `phone_number`=?",[phone_number]);

            if(userData && userData.length>0){
                let mobileNumber=userData[0].phone_number;
                let countryCode=userData[0].country_code;
                let fullNumber=countryCode+mobileNumber;
                await ExecuteQ.Query(req.dbName,"update `admin` set otp=? where id=?",[otp,userData[0].id])
                logger.debug("==WhatsOtpData==fullNumber==>>",fullNumber.replace(/\D/g,""));
                let twilioata=await Universal.getTwilioData(req.dbName);
                logger.debug("=========TWilio==DATA!==At==Phone==REg===>>",twilioata,Object.keys(twilioata).length);
                if(Object.keys(twilioata).length>0 ){
                    var client = require('twilio')(twilioata[config.get("twilio.s_id")],twilioata[config.get("twilio.auth_key")]);
                    var smsOptions = {
                        from: twilioata[config.get("twilio.number_key")],
                        to: countryCode + mobileNumber.toString(),
                        body: "Hi there, Your One Time Admin Password is : "+otp
                    };
                    client.messages.create(smsOptions, function (err, message) {
                        logger.debug("=========Twilio==ER!==",err,message)
                    });
                }

                sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
            } else {
                var msg = "Admin does not exsist!";
                return sendResponse.sendErrorMessage(msg,res,400);
            }           
        }
        catch(Err){
            logger.debug("========ERr=>",Err);
            return sendResponse.sendErrorMessage(Err,res,400)
        }
}

module.exports={
    updateAppVersionDetails:updateAppVersionDetails,
    Logout:Logout,
    Login : Login,
    subAdminData : subAdminData,
    assignOrRevokeSectionToAdmin : assignOrRevokeSectionToAdmin,
    subSupplierData:subSupplierData,
    assignOrRevokeSectionToSupplier:assignOrRevokeSectionToSupplier,
    sectionSupplierData:sectionSupplierData, // also used in supplier login
    verifyOtp : verifyOtp,
    resendOtp: resendOtp,
    updateLanguage:updateLanguage
}