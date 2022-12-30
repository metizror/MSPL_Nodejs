var async = require('async');
var sendResponse = require('../../routes/sendResponse');
var constant = require('../../routes/constant');
var func = require('../../routes/commonfunction');
var CONSTS = require('./../../config/const')
const lib = require('../../lib/NotificationMgr')
var _ = require('underscore');
var fs = require('fs')
var something = "Something went wrong";
var client = require('twilio')("AC4b6d9ecd84afd6db7cf9ac5f055d7784", "782e67bf1f26170706acd639d757ae08");
var moment = require('moment');
var pushNotifications = require('../../routes/pushNotifications');
var orderFunction = require('../../routes/orderFunction');
var loginFunctions = require('../../routes/loginFunctions');
var Universal = require('../../util/Universal');
var randomstring = require("randomstring");
var log4js = require('log4js');
var logger = log4js.getLogger();
var chunk = require('chunk');
logger.level = config.get('server.debug_level');
var AdminMail = "ops@royo.com";
var crypto = require('crypto');
algorithm = CONSTS.SERVER.CYPTO.ALGO,
    crypto_password = CONSTS.SERVER.CYPTO.PWD
var uploadMgr = require('../../lib/UploadMgr')
var FormData = require('form-data');
var request = require('request');
const numberMasking = require('../../lib/numberMasking')
const runTimeDbConnection = require('../../routes/runTimeDbConnection')
const Agent = require('../../common/agent')
const Execute = require('../../lib/Execute')
let emailTemp=require('../../routes/email')
var schedule = require('node-schedule');

const Add = async (req, res) => {
    
    if(req.user == undefined ){
        req.user={
             id: 1
        }
    }
    var params = req.body, password;
    let employee_id = req.body.employee_id!==undefined && req.body.employee_id!==""?req.body.employee_id:""
    let assigned_id = req.body.assigned_id!==undefined ?req.body.assigned_id:""
    let delivery_company_id = req.body.delivery_company_id!==undefined ? req.body.assigned_id:0
    let drivingLicenseUrl = req.body.drivingLicenseUrl || "";
    let drivingLicenseBackUrl = req.body.drivingLicenseBackUrl || "";
    let vehicleRegisterationUrl = req.body.drivingLicenseUrl || "";
    let vehicleRegisterationBackUrl = req.body.drivingLicenseBackUrl || "";
    let driver_license_number = req.body.driver_license_number||"";
    var supplier_id = params &&  params.supplier_id != undefined && params.supplier_id !== "" ? params.supplier_id : req.supplier.supplier_id;
    var agent_category_id = params.agent_category_id != undefined && params.agent_category_id !== "" ? params.agent_category_id : 0;
    let agent_bio=req.body.agent_bio || "";

    try {
        var DbName = req.dbName;
        var params = req.body, password;
        let agent_commission_type = params.agent_commission_type==undefined?0:params.agent_commission_type;
        logger.debug("=========PARAM=SUPPLIER========", params.supplier_id);
        let GetAgentDbData = await GetAgentDbInformation(req.dbName);
        let AgentConnection = await RunTimeAgentConnection(GetAgentDbData);
        let emailData = await DupEmail(params.email, AgentConnection, undefined);
        let phoneData = await dupPhone(params.phone_number,params.country_code,AgentConnection, undefined);
        // logger.debug("=================",DbName,req);
        let created_by = req.user.id;
        let supplier_id = params.supplier_id != undefined && params.supplier_id !== "" ? params.supplier_id : req.supplier.supplier_id;
        logger.debug("====SUPLIER==ID==", supplier_id);
        if (emailData && emailData.length > 0) {
            sendResponse.sendErrorMessage(constant.AGENT.DUP_EMAIL, res, 400);
        }
        else if(phoneData && phoneData.length>0){
            sendResponse.sendErrorMessage(constant.AGENT.DUP_PHONE, res, 400);
        }
        else {

            const documentsImages= [];

            const settingDataKeys = await func.getSettingDataKeyAndValue(req.dbName, ['addDocumentsInAgent']);
            

            console.log("======settingDataKeys=========settingDataKeys==============",settingDataKeys)

            settingDataKeys.keyAndValue.addDocumentsInAgent = !!settingDataKeys.keyAndValue.addDocumentsInAgent;
            
            console.log("======settingDataKeys.keyAndValue.addDocumentsInAgent==============",
            settingDataKeys.keyAndValue.addDocumentsInAgent)

           if(settingDataKeys.keyAndValue.addDocumentsInAgent === true){
            console.log("======settingDataKeys.keyAndValue.addDocumentsInAgent=======55=======",req.files)
            console.log("======settingDataKeys.keyAndValue.addDocumentsInAgent=== req.files.addAgentDocument====55=======", req.files.addAgentDocument)
            // if (req.files && req.files.documents) {
                if (req.files && req.files.addAgentDocument) {
            
                    for(let i=0; i<req.files.addAgentDocument.length; i++){
                        logger.debug("====EBER==ID==");
                        var fileName = req.files.addAgentDocument[i].name;
                        var fileExtension = fileName.substring(fileName.lastIndexOf(".") + 1);
                        logger.debug("==fileExtension=", fileExtension);
                        // if (fileExtension == "jpg" || fileExtension == "jpeg" || fileExtension == "png" || fileExtension == "gif"
                        // || fileExtension == "doc" || fileExtension == "png" || fileExtension == "docx" || fileExtension == "PNG"
                        // || fileExtension== "JPG") {
                        const documentsArray = req.files.addAgentDocument[i];

                        console.log("=============documentsArray===============",documentsArray);

                        // const documentsArray = req.files.documents;
                        var image = await uploadImage(documentsArray);

                        documentsImages.push(image);

                        
            
                    // }
                    // else {
                    //     sendResponse.sendErrorMessage(constant.fileMessage.INVALID_FILE, res, 400);
                    // }

                    }

                  
                  
               
                } 

           }
           if (req.files && req.files.file) {
                logger.debug("====EBER==ID==");
                var fileName = req.files.file.name;
                var fileExtension = fileName.substring(fileName.lastIndexOf(".") + 1);
                logger.debug("==fileExtension=", fileExtension);
                // if (fileExtension == "jpg" || fileExtension == "jpeg" || fileExtension == "png" || fileExtension == "gif") {
                    var p_data = randomstring.generate({
                        length: 7,
                        charset: 'alphabetic'
                    })
                    password = await GeneratePassWord(p_data);
                    var agentId = await AgentSave(employee_id,agent_commission_type,params.country_code,params.iso,password, 
                        params.offset, params.name, params.phone_number, params.email,
                         params.area_id, supplier_id, params.experience, params.occupation,
                          params.supplier_name, params.commission,
                           AgentConnection,req.user.id,agent_category_id,assigned_id,
                           delivery_company_id,drivingLicenseUrl,drivingLicenseBackUrl,
                           vehicleRegisterationUrl,vehicleRegisterationBackUrl,driver_license_number,agent_bio
    );
                    var image = await uploadImage(req.files.file);
                    await UpdateImage(agentId, image, AgentConnection);
                    var userOb = {
                        id: agentId,
                        email: params.email,
                        fullName: params.name
                    };
                    var a_token = Universal.generateJwtAccessToken(userOb);
                    await UpdateToken(agentId, a_token, AgentConnection);
                    var app_link = await getAgentDeepLink(req.dbName);
                    emailTemp.driverNewRegisteration(req,res,params.email,p_data,function(err,result){
                        if(err){
                            console.log("..****register email*****....",err);
                        }
                    });
                    // await sendEmail(req.dbName,params.email, p_data, app_link);
                    sendResponse.sendSuccessData({ id: agentId }, constant.responseMessage.SUCCESS, res, 200);
                // }
                // else {
                //     sendResponse.sendErrorMessage(constant.fileMessage.INVALID_FILE, res, 400);
                // }
            }
            else {
                var p_data = randomstring.generate({
                    length: 7,
                    charset: 'alphabetic'
                })

                password = await GeneratePassWord(p_data);

                var agentId = await AgentSave(employee_id,agent_commission_type,
                    params.country_code,params.iso,password,
                     params.offset, params.name, params.phone_number, params.email,
                      params.area_id, supplier_id, params.experience, params.occupation,
                       params.supplier_name, params.commission, AgentConnection,req.user.id,
                       agent_category_id,assigned_id,delivery_company_id,drivingLicenseUrl,drivingLicenseBackUrl,
                       vehicleRegisterationUrl,vehicleRegisterationBackUrl,driver_license_number,agent_bio
);
                var userOb = {
                    id: agentId,
                    email: params.email,
                    fullName: params.name
                };
                var a_token = Universal.generateJwtAccessToken(userOb);
                await UpdateToken(agentId, a_token, AgentConnection);
                var app_link = await getAgentDeepLink(req.dbName);
                logger.debug("===APP=LINK==>>", app_link);
                emailTemp.driverNewRegisteration(req,res,params.email,p_data,function(err,result){
                    if(err){
                        console.log("..****register email*****....",err);
                    }
                });
                // await sendEmail(req.dbName,params.email, p_data, app_link);
                // await SetAvailblty(JSON.parse(params.weeks_data),DbName,agentId);
                sendResponse.sendSuccessData({ id: agentId }, constant.responseMessage.SUCCESS, res, 200);
            }

            console.log("+===================",settingDataKeys.keyAndValue.addDocumentsInAgent,documentsImages)

           if(settingDataKeys.keyAndValue.addDocumentsInAgent === true){
            if (documentsImages && documentsImages.length) {
                    await AddExtraDocsInAgent(agentId, documentsImages, AgentConnection);
            } 
            }
        }
    }
    catch (err) {
        logger.error(err);
        sendResponse.somethingWentWrongError(res);
    }
}

const AddAgentsByDeliveryCompany = async (req, res) => {
    var params = req.body, password;

    let employee_id = req.body.employee_id!==undefined && req.body.employee_id!==""?req.body.employee_id:""
    let assigned_id = req.body.assigned_id!==undefined ?req.body.assigned_id:""
    let delivery_company_id = req.body.delivery_company_id!==undefined ? req.body.delivery_company_id:0

    let drivingLicenseUrl = req.body.drivingLicenseUrl || "";
    let drivingLicenseBackUrl = req.body.drivingLicenseBackUrl || "";
    let vehicleRegisterationUrl = req.body.drivingLicenseUrl || "";
    let vehicleRegisterationBackUrl = req.body.drivingLicenseBackUrl || "";
    let driver_license_number = req.body.driver_license_number || 0;
    logger.debug("=======PRAMS=====", req.params,"========params------",params);
    let supplier_id=0;
    // var supplier_id = params &&  params.supplier_id != undefined && params.supplier_id !== "" ? params.supplier_id : req.supplier.supplier_id;

    var agent_category_id = params.agent_category_id != undefined && params.agent_category_id !== "" ? params.agent_category_id : 0;
    // try{
    //     var data=await AgentRegisteration(params,req.files,req.headers.agent_db_secret_key);
    //     sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200); 
    // }
    // catch(err){
    //         logger.error(err);
    //         sendResponse.sendErrorMessage(err,res,400);
    // }
    try {
        var DbName = req.dbName;
        var params = req.body, password;
        let agent_commission_type = params.agent_commission_type==undefined?0:params.agent_commission_type
        // logger.debug("=========PARAM=SUPPLIER========", params .supplier_id);
        var GetAgentDbData = await GetAgentDbInformation(req.dbName);
        var AgentConnection = await RunTimeAgentConnection(GetAgentDbData);
        var AgentData = await DupEmail(params.email, AgentConnection, undefined);
        // logger.debug("=================",DbName,req);
        // var created_by = req.user.id;
        // var supplier_id = params.supplier_id != undefined && params.supplier_id !== "" ? params.supplier_id : req.supplier.supplier_id;
        logger.debug("====SUPLIER==ID==", supplier_id);
        if (AgentData && AgentData.length > 0) {
            sendResponse.sendErrorMessage(constant.AGENT.DUP_EMAIL, res, 400);
        }
        else {
            const documentsImages= [];
            const settingDataKeys = await func.getSettingDataKeyAndValue(req.dbName, ['addDocumentsInAgent']);
            settingDataKeys.keyAndValue.addDocumentsInAgent = !!settingDataKeys.keyAndValue.addDocumentsInAgent;

           if(settingDataKeys.keyAndValue.addDocumentsInAgent === true){
     
            // if (req.files && req.files.documents) {
                if (req.files && req.files.addAgentDocument && req.files.addAgentDocument.length) {
            
                    for(let i=0; i<req.files.addAgentDocument.length; i++){
                        logger.debug("====EBER==ID==");
                        var fileName = req.files.addAgentDocument[i].name;
                        var fileExtension = fileName.substring(fileName.lastIndexOf(".") + 1);
                        logger.debug("==fileExtension=", fileExtension);
                        if (fileExtension == "jpg" || fileExtension == "jpeg" || fileExtension == "png" || fileExtension == "gif"
                        || fileExtension == "doc" || fileExtension == "png" || fileExtension == "docx"
                        ) {
                        const documentsArray = req.files.addAgentDocument[i];

                        // const documentsArray = req.files.documents;
                        var image = await uploadImage(documentsArray);
                        documentsImages.push(image);

                        
            
                    }
                    else {
                        sendResponse.sendErrorMessage(constant.fileMessage.INVALID_FILE, res, 400);
                    }

                    }

                  
                  
               
            } 
           }

        //    process.exit();

           
      



            if (req.files && req.files.file) {
                logger.debug("====EBER==ID==");
                var fileName = req.files.file.name;
                var fileExtension = fileName.substring(fileName.lastIndexOf(".") + 1);
                logger.debug("==fileExtension=", fileExtension);
                if (fileExtension == "jpg" || fileExtension == "jpeg" || fileExtension == "png" || fileExtension == "gif") {
                    var p_data = randomstring.generate({
                        length: 7,
                        charset: 'alphabetic'
                    })
                    password = await GeneratePassWord(p_data);
                    var agentId = await AgentSave(employee_id,agent_commission_type,
                        params.country_code,params.iso,password, 
                        params.offset, params.name, params.phone_number, params.email,
                         params.area_id, supplier_id, params.experience, params.occupation,
                          params.supplier_name, params.commission,
                           AgentConnection,req.user.id,agent_category_id,assigned_id,
                           delivery_company_id,drivingLicenseUrl,drivingLicenseBackUrl,
                           vehicleRegisterationUrl,vehicleRegisterationBackUrl,driver_license_number
                        );
                    var image = await uploadImage(req.files.file);
                    await UpdateImage(agentId, image, AgentConnection);
                    var userOb = {
                        id: agentId,
                        email: params.email,
                        fullName: params.name
                    };
                    var a_token = Universal.generateJwtAccessToken(userOb);
                    await UpdateToken(agentId, a_token, AgentConnection);
                    var app_link = await getAgentDeepLink(req.dbName);

                    emailTemp.driverNewRegisteration(req,res,params.email,p_data,function(err,result){
                        if(err){
                            console.log("..****register email*****....",err);
                        }
                    });
                    // await sendEmail(req.dbName,params.email, p_data, app_link);
                    sendResponse.sendSuccessData({ id: agentId }, constant.responseMessage.SUCCESS, res, 200);
                }
                else {
                    sendResponse.sendErrorMessage(constant.fileMessage.INVALID_FILE, res, 400);
                }
            }
            else {
                var p_data = randomstring.generate({
                    length: 7,
                    charset: 'alphabetic'
                })
                password = await GeneratePassWord(p_data);
                var agentId = await AgentSave(employee_id,agent_commission_type,
                    params.country_code,params.iso,password,
                     params.offset, params.name, params.phone_number, params.email,
                      params.area_id, supplier_id, params.experience, params.occupation,
                       params.supplier_name, params.commission, AgentConnection,0,
                       agent_category_id,assigned_id,delivery_company_id,drivingLicenseUrl,drivingLicenseBackUrl,
                       vehicleRegisterationUrl,vehicleRegisterationBackUrl,driver_license_number
);
                var userOb = {
                    id: agentId,
                    email: params.email,
                    fullName: params.name
                };
                var a_token = Universal.generateJwtAccessToken(userOb);
                await UpdateToken(agentId, a_token, AgentConnection);
                var app_link = await getAgentDeepLink(req.dbName);
                logger.debug("===APP=LINK==>>", app_link);
                emailTemp.driverNewRegisteration(req,res,params.email,p_data,function(err,result){
                    if(err){
                        console.log("..****register email*****....",err);
                    }
                });
                // await sendEmail(req.dbName,params.email, p_data, app_link);
                // await SetAvailblty(JSON.parse(params.weeks_data),DbName,agentId);
                sendResponse.sendSuccessData({ id: agentId }, constant.responseMessage.SUCCESS, res, 200);
            }

           if(settingDataKeys.keyAndValue.addDocumentsInAgent === true){
            if (documentsImages && documentsImages.length) {
                await AddExtraDocsInAgent(agentId, documentsImages, AgentConnection);
           } 
           }

            
      




        }
    }
    catch (err) {
        logger.error(err);
        sendResponse.somethingWentWrongError(res);
    }
}
const getAgentDeepLink = (dbName) => {
    return new Promise(async (resolve, reject) => {
        try {
            var agent_andr = await Execute.Query(dbName, "select `value` from tbl_setting where `key`=?", ["agent_android_app_url"])
            var agent_ios = await Execute.Query(dbName, "select `value` from tbl_setting where `key`=?", ["agent_ios_app_url"])
            resolve({
                android_linlk: agent_andr && agent_andr.length > 0 ? agent_andr[0].value : "",
                ios_link: agent_ios && agent_ios.length > 0 ? agent_ios[0].value : ""
            })
        }
        catch (Err) {
            reject(Err)
        }
    })
}
const setAgentPassword = async (req,res)=>{
        var agentId = req.body.agentId
        var password = req.body.password
        var GetAgentDbData = await GetAgentDbInformation(req.dbName);
        var AgentConnection = await RunTimeAgentConnection(GetAgentDbData);
        let sql="select email from cbl_user where id =?"
        let agentData=await Execute.QueryAgent(AgentConnection,sql,[agentId])
        let email =agentData && agentData.length>0?agentData[0].email:"";
        emailTemp.userResetpassword(req,res,email,password,function(err,result){
            // if(err){
                console.log("..****register email*****....",err);
            // }
        });
        logger.debug("========password orignal========",password)
        hashed_password = await GeneratePassWord(password);
        logger.debug("========password hashed========",password)
        var query = "update cbl_user set password = ? where id=?"
        var statement = AgentConnection.query(query,[hashed_password,agentId],function(err,data){
            logger.debug("==================query in set agent password========",statement.sql,err,data)
            if(err){
                sendResponse.somethingWentWrongError(res);
            }else{
                sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
            }
        })
}


// const setAgentPasswordByAgent = async (req,res)=>{
//     var agentId = req.body.agentId
//     var password = req.body.password
//     var oldPassword = req.body.oldPassword
//     var GetAgentDbData = await GetAgentDbInformation(req.dbName);
//     var AgentConnection = await RunTimeAgentConnection(GetAgentDbData);
//     logger.debug("========password orignal========",password)
//     hashed_password = await GeneratePassWord(password);
//     // oldPassword = await GeneratePassWord(oldPassword)
//     logger.debug("========password hashed========",hashed_password,oldPassword)

//     let checkAgent = await Execute.QueryAgent(AgentConnection,"select * from cbl_user where id=?",[agentId]);
//     let com = await  Universal.compareCryptedData(oldPassword, checkAgent[0].password)
//     console.log("=====com=====",com)
//     if (!com) {
//         return  sendResponse.sendErrorMessage("incorrect old password",res,400)

//     }else{
//         var query = "update cbl_user set password = ? where id=? "
//         var statement = AgentConnection.query(query,[hashed_password,agentId],function(err,data){
//             logger.debug("==================query in set agent password========",statement.sql,err,data)
//             if(err){
//                 sendResponse.somethingWentWrongError(res);
//             }else{
//                 sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
//             }
//         })
//     }


// }

const sendEmail = (dbName,email, password, link) => {
    logger.debug("=========LINK==>>", link);
    return new Promise(async (resolve, reject) => {
        let new_email_template_v12=await Execute.Query(dbName,"select `key`,`value` from tbl_setting where `key`=? and value=1 ",["new_email_template_v12"]);

        let smtpSqlSata=await Universal.smtpData(dbName);
        var subject = "New Registration";

        if(new_email_template_v12.length  >0)
         subject = "New Driver";

        var content = "New Registration \n";
        content += "Congratulations you have been registered \n\n";
        content += "You can login using the following credentials :\n\n";
        content += "Email: " + email + "\n";
        content += "Password: " + password + "\n\n";
        content += "Click here to download android app " + link.android_linlk + "\n"
        content += "Click here to download ios app " + link.ios_link + "\n\n"

        if(new_email_template_v12.length <=0)
        content += " Wishing your Business Prosperity and Success \n";
        // content += " Code Brew Lab";
        await func.sendEmailToUser(smtpSqlSata,subject, email, content);
        // emailTemp.driverNewRegisteration()
        resolve()
    })
}

function UpdateToken(id, token, AgentConnection) {
    return new Promise((resolve, reject) => {
        var updateQuery = "update cbl_user set access_token=? where id=?"
        var st = AgentConnection.query(updateQuery, [token, id], function (err, data) {
            resolve()
        })
    })
}
function GeneratePassWord(data) {
    return new Promise(async (resolve, reject) => {
        // var hashPwd=await Universal.CryptData(data);
        var hashPwd = await Universal.CryptData(data);
        //    logger.debug("=====data=+ENYCYPRED==PWD==",data,hashPwd);
        resolve(hashPwd);
    })
}
function AgentSave(employee_id,agent_commission_type,country_code,iso,password,
    offset, name, phone_number, email, area_id, supplier_id,
     experience, occupation, supplier_name, commission, AgentConnection,
     adminId,agent_category_id,assigned_id,delivery_company_id,drivingLicenseUrl,drivingLicenseBackUrl,
     vehicleRegisterationUrl,vehicleRegisterationBackUrl,driver_license_number,agent_bio) {
       console.log(`======employee_id,agent_commission_type,country_code,iso,password,
       offset, name, phone_number, email, area_id, supplier_id,
        experience, occupation, supplier_name, commission, AgentConnection,
        adminId,agent_category_id,assigned_id,delivery_company_id,drivingLicenseUrl,drivingLicenseBackUrl,
        vehicleRegisterationUrl,vehicleRegisterationBackUrl,driver_license_number,agent_bio`,employee_id,
        agent_commission_type,country_code,iso,password,
       offset, name, phone_number, email, area_id, supplier_id,
        experience, occupation, supplier_name, commission, AgentConnection,
        adminId,agent_category_id,assigned_id,delivery_company_id,
        drivingLicenseUrl,drivingLicenseBackUrl,
        vehicleRegisterationUrl,vehicleRegisterationBackUrl,driver_license_number,agent_bio)

   // logger.debug("======DbName==",password)
   let country_code_v=country_code!=undefined?country_code:null
   let iso_v=iso!=undefined?iso:null
   name = name==null || name==undefined?"":name

   var randomize = require('randomatic');
   let  agent_created_id =  randomize('A0', 30);
   console.log("======agent_created_id ==",agent_created_id)

   return new Promise((resolve, reject) => {
       var agentQuery = `insert into cbl_user
        (
        employee_id,
        country_code,
        iso,
        password,
        offset,
        name,
        phone_number,
        email,
        area_id,
        supplier_id,
        experience,
        occupation,
        access_token,
        supplier_name,
        commission,
        created_by,
        agent_created_id,
        agent_commission_type,
        agent_category_id,
        assigned_id,
        delivery_company_id,
        drivingLicenseUrl,
        drivingLicenseBackUrl,
        vehicleRegisterationUrl,
        vehicleRegisterationBackUrl,driver_license_number,agent_bio
        ) values (?,?,?,?,?,    ?,?,?,?,?,  ?,?,?,?,?,  ?,?,?,?,?,  ?,?,?,?,?,?,?)`
       let query = AgentConnection.query(agentQuery, [

            employee_id,country_code_v,iso_v,password,offset,
            name, phone_number, email, area_id, supplier_id,
            experience, occupation, password, supplier_name, commission,
            adminId, agent_created_id,agent_commission_type,agent_category_id,assigned_id,
            delivery_company_id,drivingLicenseUrl,drivingLicenseBackUrl,vehicleRegisterationUrl,vehicleRegisterationBackUrl,
            driver_license_number,agent_bio
            ], 

            function (err, result) {
                console.log("========query==========",query);
           logger.error(err)
           if (err) {
               reject(err)
           }
           else {
               resolve(result.insertId);
           }
       })
   })
}

const List = async (req, res) => {
    try {
        let order = ""
        var supplierId = req.query.supplierId != null && req.query.supplierId != undefined && req.query.supplierId != 0 ? req.query.supplierId : ""
        var startDate = req.query.startDate || '1990-01-01';
        var endDate = req.query.endDate || '2100-01-01';
        var is_admin = req.query.is_admin==undefined?0:req.query.is_admin;
        var is_stripe_connected = req.query.is_stripe_connected==undefined?0:req.query.is_stripe_connected;
        var country_code = req.query.country_code ? req.query.country_code : '';
        var country_code_type = req.query.country_code_type ? req.query.country_code_type : '';
        is_admin = parseInt(is_admin)
        let order_by = parseInt(req.query.order_by);
        let is_desc = parseInt(req.query.is_desc);
        if (order_by == 1) {
            if (is_desc && is_desc > 0) {
                order = "order by cbu.commission desc"
            } else {
                order = "order by cbu.commission asc"
            }
        } else if (order_by == 2) {
            if (is_desc && is_desc > 0) {
                order = "order by revenue desc"
            } else {
                order = "order by revenue asc"
            }
        } else {
            order = "order by cbu.id desc"
        }
        let search = req.query.search == undefined ? "" : req.query.search
        let limit = req.query.limit == undefined ? 10 : parseInt(req.query.limit)
        let offset = req.query.offset == undefined ? 0 : parseInt(req.query.offset)
        var GetAgentDbData = await GetAgentDbInformation(req.dbName);
        let finalResult=[];
        var AgentConnection = await RunTimeAgentConnection(GetAgentDbData);
        var AgentData = await AgentList(AgentConnection, search, limit,
             offset, order, supplierId, startDate, endDate, is_admin,
             req.dbName,country_code,country_code_type,is_stripe_connected);

       if(AgentData && AgentData.length>0){
           for(const [index,i] of AgentData.entries()){
               if(i.supplier_id!="0" && i.supplier_id!=null && i.supplier_id!=""){
                   let ids=i.supplier_id.split(",")
                   let names=await Execute.Query(req.dbName,"select CAST(GROUP_CONCAT(name SEPARATOR ',') AS CHAR) as name from supplier where id IN (?)",[ids]);
                    i.supplier_name=names[0].name
                    finalResult.push(i)
               }
               else{
                     finalResult.push(i)
               }
           }
       }
        var AgentListTotalCount = await AgentListWithoutPagination(AgentConnection, 
            search,order, supplierId, startDate, endDate, is_admin,country_code,country_code_type,is_stripe_connected)


        var dataToSend = {
            AgentList: finalResult,
            count: AgentListTotalCount
        }
         sendResponse.sendSuccessData(dataToSend, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        logger.error(err);
        sendResponse.somethingWentWrongError(res);
    }
}
const ListSupplierAgent = async (req, res) => {
    try {
        logger.debug("=============enter=========supplier side========");
        let order = ""
        var startDate = req.query.startDate || '1990-01-01';
        var supplierId = req.query.supplierId != null && req.query.supplierId != undefined && req.query.supplierId != 0 ? req.query.supplierId : ""

        var endDate = req.query.endDate || '2100-01-01';
        let order_by = parseInt(req.query.order_by);
        let is_desc = parseInt(req.query.is_desc);
        var is_admin = req.query.is_admin==undefined?0:req.query.is_admin;
        var is_stripe_connected = req.query.is_stripe_connected==undefined?0:req.query.is_stripe_connected;

        var country_code = req.query.country_code ? req.query.country_code : ''
        var country_code_type = req.query.country_code_type ? req.query.country_code_type : ''

        if (order_by == 1) {
            if (is_desc && is_desc > 0) {
                order = "order by cbu.commission desc"
            } else {
                order = "order by cbu.commission asc"
            }
        } else if (order_by == 2) {
            if (is_desc && is_desc > 0) {
                order = "order by revenue desc"
            } else {
                order = "order by revenue asc"
            }
        } else {
            order = "order by cbu.id"
        }
        let search = req.query.search == undefined ? "" : req.query.search
        let limit = req.query.limit == undefined ? 10 : parseInt(req.query.limit)
        let offset = req.query.offset == undefined ? 0 : parseInt(req.query.offset)
        var GetAgentDbData = await GetAgentDbInformation(req.dbName);
        logger.debug("=============DATABASE=================", GetAgentDbData);
        var AgentConnection = await RunTimeAgentConnection(GetAgentDbData);

        var AgentData = await AgentList(AgentConnection, search, limit,
            offset, order, supplierId, startDate, endDate, is_admin,
            req.dbName,country_code,country_code_type,is_stripe_connected)
        var AgentListTotalCount = await AgentListWithoutPaginationForSupplier(AgentConnection,
             req.supplier.supplier_id, search, startDate, endDate)
        
        var dataToSend = {
            AgentList: AgentData,
            count: AgentListTotalCount
        }
        //  logger.debug("==============Agent Connection====================",AgentConnection);
        // var AvailTime=await AvailTimeList(DbName);
        // var FinalData=await SynchAgentWithAvailTime(AgentData,AvailTime)
        sendResponse.sendSuccessData(dataToSend, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        logger.error(err);
        sendResponse.somethingWentWrongError(res);
    }
}
const Update = async (req, res) => {
    try {
        var GetAgentDbData = await GetAgentDbInformation(req.dbName);
        var AgentConnection = await RunTimeAgentConnection(GetAgentDbData);
        var DbName = req.dbName;
        var params = req.body, password;
        let employee_id = req.body.employee_id==undefined && req.body.employee_id==""?"":req.body.employee_id
        let assigned_id = req.body.assigned_id!==undefined ?req.body.assigned_id:"";
        let drivingLicenseUrl = req.body.drivingLicenseUrl || "";
        let drivingLicenseBackUrl = req.body.drivingLicenseBackUrl || "";
        let vehicleRegisterationUrl = req.body.vehicleRegisterationUrl || "";
        let vehicleRegisterationBackUrl = req.body.vehicleRegisterationBackUrl || "";
        let agent_bio=req.body.agent_bio || "";
        
        let driver_license_number = req.body.driver_license_number || 0;
        // var user_id = parseInt(req.user.id)
        let agent_commission_type = req.body.agent_commission_type==undefined?0:req.body.agent_commission_type
        var agent_category_id = params.agent_category_id != undefined && params.agent_category_id !== "" ? params.agent_category_id : 0;
        let phoneData = await dupPhone(params.phone_number,params.country_code,AgentConnection, params.id);
        var AgentData = await DupEmail(params.email, AgentConnection, params.id);
        if (AgentData && AgentData.length > 0) {
            sendResponse.sendErrorMessage(constant.AGENT.DUP_EMAIL, res, 400);
        }
        else if(phoneData && phoneData.length>0){
            sendResponse.sendErrorMessage(constant.AGENT.DUP_EMAIL, res, 400);
        }
        else {


            if(req.dbName =="hungrycanadian_07101"){
            const documentsImages= [];

            const settingDataKeys = await func.getSettingDataKeyAndValue(req.dbName, ['addDocumentsInAgent']);
            

            console.log("======settingDataKeys=========settingDataKeys==============",settingDataKeys)

            settingDataKeys.keyAndValue.addDocumentsInAgent = !!settingDataKeys.keyAndValue.addDocumentsInAgent;
            
            console.log("======settingDataKeys.keyAndValue.addDocumentsInAgent==============",
            settingDataKeys.keyAndValue.addDocumentsInAgent)

           if(settingDataKeys.keyAndValue.addDocumentsInAgent === true){
            console.log("======settingDataKeys.keyAndValue.addDocumentsInAgent=======55=======",req.files)
            console.log("======settingDataKeys.keyAndValue.addDocumentsInAgent=== req.files.addAgentDocument====55=======", req.files.addAgentDocument)
            // if (req.files && req.files.documents) {
                if (req.files && req.files.addAgentDocument) {
            
                    for(let i=0; i<req.files.addAgentDocument.length; i++){
                        logger.debug("====EBER==ID==");
                        var fileName = req.files.addAgentDocument[i].name;
                        var fileExtension = fileName.substring(fileName.lastIndexOf(".") + 1);
                        logger.debug("==fileExtension=", fileExtension);
                        // if (fileExtension == "jpg" || fileExtension == "jpeg" || fileExtension == "png" || fileExtension == "gif"
                        // || fileExtension == "doc" || fileExtension == "png" || fileExtension == "docx" || fileExtension == "PNG"
                        // || fileExtension== "JPG") {
                        const documentsArray = req.files.addAgentDocument[i];

                        console.log("=============documentsArray===============",documentsArray);

                        // const documentsArray = req.files.documents;
                        var image = await uploadImage(documentsArray);

                        documentsImages.push(image);

                        
            
                    // }
                    // else {
                    //     sendResponse.sendErrorMessage(constant.fileMessage.INVALID_FILE, res, 400);
                    // }

                    }

                  
                  
               
                } 

           }

        }

            if (req.files.file) {
                var fileName = req.files.file.name
                var fileExtension = fileName.substring(fileName.lastIndexOf(".") + 1);
                logger.debug("==fileExtension=", fileExtension);
                if (fileExtension == "jpg" || fileExtension == "jpeg" || fileExtension == "png" || fileExtension == "gif") {
                    

                    var agentId = await AgentUpdate(employee_id,agent_commission_type,params.country_code,params.iso,
                        params.name, params.phone_number, params.email, params.area_id,
                         params.supplier_id, params.experience, params.occupation,
                          params.supplier_name, params.id, params.commission,
                           params.base_price, params.delivery_charge_share,
                            AgentConnection,agent_category_id,assigned_id,drivingLicenseUrl,drivingLicenseBackUrl,
                            vehicleRegisterationUrl,vehicleRegisterationBackUrl,driver_license_number,agent_bio
     )
                    var image = await uploadImage(req.files.file)
                    await UpdateImage(params.id, image, AgentConnection);
                    sendResponse.sendSuccessData({ id: params.id }, constant.responseMessage.SUCCESS, res, 200);
                }
                else {
                    sendResponse.sendErrorMessage(constant.fileMessage.INVALID_FILE, res, 400);
                }
            }
            else {
                await AgentUpdate(employee_id, agent_commission_type,params.country_code,
                    params.iso,params.name,
                     params.phone_number, params.email, params.area_id, params.supplier_id,
                      params.experience, params.occupation, params.supplier_name, params.id,
                       params.commission, params.base_price, params.delivery_charge_share,
                        AgentConnection,agent_category_id,assigned_id,drivingLicenseUrl,drivingLicenseBackUrl,
                        vehicleRegisterationUrl,vehicleRegisterationBackUrl,driver_license_number,agent_bio
 )
                sendResponse.sendSuccessData({ id: params.id }, constant.responseMessage.SUCCESS, res, 200);
            }
        }
    }
    catch (err) {
        console.log("===ERRs!==", err);
        sendResponse.somethingWentWrongError(res)
    }
}
function uploadImage(file) {
    var imageArray = [];
    return new Promise(async (resolve, reject) => {
        // image = await uploadMgr.uploadImage(file)
        image = await uploadMgr.uploadImageFileToS3BucketNew(file)
        resolve(image);
    })
}
function UpdateImage(id, image, AgentConnection) {
    return new Promise((resolve, reject) => {
        var updateQuery = "update cbl_user set image=? where id=?"
        var st = AgentConnection.query(updateQuery, [image, id], function (err, data) {
            resolve()
        })
    })
}

function AddExtraDocsInAgent(id, image, AgentConnection) {
    return new Promise((resolve, reject) => {

        const bulkInsert = [];
        image.map(rec=>{
            bulkInsert.push([id,rec]);
        });
        const buildInsertComma = image.map(()=>"(?)").join()

        console.log(bulkInsert);
        console.log(buildInsertComma);
        

        var updateQuery = `insert into cbl_user_documents(cbl_user_id, docUrl) VALUES ${buildInsertComma}`
        var st = AgentConnection.query(updateQuery, bulkInsert, function (err, data) {
            resolve()
        })
    })
}


function AgentUpdate(employee_id,agent_commission_type,
    country_code,iso,name, phone_number, email, area_id, 
    supplier_id, experience, occupation, supplier_name, 
    id, commission, base_price, delivery_charge_share,
     AgentConnection,agent_category_id,assigned_id,drivingLicenseUrl,drivingLicenseBackUrl,
     vehicleRegisterationUrl,vehicleRegisterationBackUrl,driver_license_number,agent_bio) {
    return new Promise((resolve, reject) => {

        name = name==null || name==undefined?"":name

        var updateQuery = `update cbl_user set agent_bio=?,employee_id=?,country_code=?,iso=?,supplier_name=?,name=?,
        phone_number=?,email=?,area_id=?,supplier_id=?,experience=?,occupation=?,commission=?,agent_commission_type=?,
        base_price=?,delivery_charge_share=?,agent_category_id=?,assigned_id=?,
        drivingLicenseUrl=?,drivingLicenseBackUrl=?,
        vehicleRegisterationUrl=?,vehicleRegisterationBackUrl=?,driver_license_number=? where id=?`
        var st = AgentConnection.query(updateQuery, [agent_bio,employee_id,country_code,iso,supplier_name,
             name, phone_number, email, area_id, supplier_id, experience, occupation,
              commission,agent_commission_type,base_price, delivery_charge_share,agent_category_id,
              assigned_id,drivingLicenseUrl,drivingLicenseBackUrl,
              vehicleRegisterationUrl,vehicleRegisterationBackUrl,driver_license_number,id], function (err, data) {
            logger.debug("==ST=>>>>", st.sql);
            if (err) {
                reject(err)
            }
            else {
                resolve()
            }
        })
    })
}
function DupEmail(email, AgentConnection, id) {
    // logger.debug(multiConnection[dbName]);
    var sql;
    return new Promise(async (resolve, reject) => {
        try{
            if (id == undefined) {
                sql = "select id from cbl_user where email=? and deleted_by=?"
            }
            else {
                sql = "select id from cbl_user where email=? and deleted_by=? and id!=" + parseInt(id) + ""
            }
            let data =await Execute.QueryAgent(AgentConnection,sql,[email,0]);
            resolve(data)
        }
        catch(Err){
            logger.debug("==DupEmail==Err!=>>",Err);
            console.log("==DupEmail==Err!=>>",Err);
            reject(Err)
        }
        // var st = AgentConnection.query(sql, [email, 0], function (err, data) {
        //     // logger.debug(st.sql)
        //     if (err) {
        //         reject(err)
        //     }
        //     else {
        //         // logger.debug("=========+++DAGA!==",data);
        //         resolve(data)
        //     }
        // })
    })
}

function dupPhone(mobileNo,countryCode, AgentConnection, id) {
    var sql;
    return new Promise(async (resolve, reject) => {
        try{
            if (id == undefined) {
                sql = "select id from cbl_user where country_code=? and phone_number=? and deleted_by=?"
            }
            else {
                sql = "select id from cbl_user where  country_code=? and phone_number=? and deleted_by=? and id!=" + parseInt(id) + ""
            }
            let data =await Execute.QueryAgent(AgentConnection,sql,[countryCode,mobileNo,0]);
            resolve(data)
        }
        catch(Err){
            logger.debug("==DupEmail==Err!=>>",Err)
            logger.debug("==DupEmail==Err!=phoen>>",Err)
            reject(Err)
        }
       
    })
}
function AgentList(AgentConnection, search, limit, offset,
     order, supplierId, startDate, endDate, is_admin,dbName,
      country_code,country_code_type,is_stripe_connected) {
    return new Promise(async (resolve, reject) => {
        let finaData=[]
        var country_code_query = ""
        if(country_code!='' && country_code_type!=''){
            if(country_code_type=='1'){
                var cc_array = country_code.split(",");
                for (var i = 0; i < cc_array.length; i++) {
                    country_code_query += " AND (cbu.country_code LIKE '"+cc_array[i]+"' or cbu.country_code LIKE '+"+cc_array[i]+"') "
                }
            }else{
                var cc_array = country_code.split(",");
                for (var i = 0; i < cc_array.length; i++) {
                    country_code_query += " AND (cbu.country_code NOT LIKE '"+cc_array[i]+"' and cbu.country_code NOT LIKE '+"+cc_array[i]+"') "
                }
            }
        }

        let isHidePrivateData = await Execute.Query(dbName,
            "select `key`,`value` from tbl_setting where `key`=? and `value`=?",
            ["hide_private_data","1"]);
        
        var sql;
        if(isHidePrivateData && isHidePrivateData.length > 0){
            sql = "select (SELECT message_id FROM "+dbName+".`chats` WHERE (`send_to_type`='ADMIN' or `send_by_type`='ADMIN') and (send_by=cbu.agent_created_id or send_to=cbu.agent_created_id ) and (`send_to_type`='AGENT' or `send_by_type`='AGENT') order by c_id desc limit 1) as message_id,cbu.avg_rating,cbu.total_rating,cbu.total_review,cbu.base_price, cbu.delivery_charge_share, cbu.order_accepted_count,cbu.order_rejected_count,cbu.employee_id,cbu.agent_commission_type,IFNULL(sum(cbo.commission_ammount),0) AS revenue,cbu.supplier_name,cbu.id,cbu.iso,cbu.country_code, concat(SUBSTRING(cbu.email,1,1),'**********') as email, cbu.experience,cbu.occupation,concat(SUBSTRING(cbu.name,1,1),'**********') as name, cbu.area_id,concat(SUBSTRING(cbu.phone_number,1,1),'**********') as phone_number, ";
        }else{
            sql = "select (SELECT message_id FROM "+dbName+".`chats` WHERE (`send_to_type`='ADMIN' or `send_by_type`='ADMIN') and (send_by=cbu.agent_created_id or send_to=cbu.agent_created_id ) and (`send_to_type`='AGENT' or `send_by_type`='AGENT') order by c_id desc limit 1) as message_id,cbu.avg_rating,cbu.total_rating,cbu.total_review,cbu.base_price, cbu.delivery_charge_share, cbu.order_accepted_count,cbu.order_rejected_count,cbu.employee_id,cbu.agent_commission_type,IFNULL(sum(cbo.commission_ammount),0) AS revenue,cbu.supplier_name,cbu.id,cbu.iso,cbu.country_code,cbu.email,cbu.experience,cbu.occupation,cbu.name,cbu.area_id, cbu.phone_number, ";
        }   
       

        sql += "cbu.stripe_account, cbu.assigned_id, cbu.agent_category_id, (select count(id)  from cbl_user_orders where user_id=cbu.id and status IN(1,3,10,11)) as active_orders, cbu.driver_license_number,cbu.car_model,cbu.car_color,cbu.is_car_insured,cbu.latitude,cbu.longitude,cbu.is_available, cbu.image, cbu.supplier_id,cbu.access_token,cbu.device_type,cbu.device_token, "
        sql += "cbu.commission,cbu.last_login,cbu.agent_bio,cbu.is_active,cbu.drivingLicenseUrl,cbu.drivingLicenseBackUrl,cbu.vehicleRegisterationUrl,cbu.agent_created_id,cbu.vehicleRegisterationBackUrl, cbu.thumb_nail,cbu.country,cbu.city,cbu.state,cbu.ip_address, "
        sql += "cbu.offset,cbu.created_by from cbl_user cbu left join cbl_user_orders cbo on cbu.id = cbo.user_id and DATE(cbo.created_on) >='"+startDate+"' and DATE(cbo.created_on) <='"+endDate+"'   left join cbl_user_categories cuc on cuc.id = cbu.agent_category_id "
        sql += "where "
        logger.debug("==========checkisadmin=========",is_admin)
        if (is_admin == 0) {
            if (supplierId != "") {
                sql += " CONCAT(',',cbu.supplier_id, ',') REGEXP ',("+supplierId+"),' AND "
            }
            else {
                // sql += " cbu.supplier_id != 0 AND "
            }
        } else {
            sql += " cbu.supplier_id = 0 AND "
        }
        sql += "cbu.deleted_by=? AND (cbu.id LIKE '%" + search + "%' OR cbu.name LIKE '%" + search + "%' OR cbu.email LIKE '%" + search + "%') "+country_code_query+" group by cbu.id " + order + " limit ?,?"
        // logger.debug("============AgentConnection in agent list===========",AgentConnection)

         let data = await Execute.QueryAgent(AgentConnection,sql,[0, offset, limit]);
        if(data && data.length>0){
                    const settingDataKeys = await func.getSettingDataKeyAndValue(dbName, ['addDocumentsInAgent']);
                    settingDataKeys.keyAndValue.addDocumentsInAgent = !!settingDataKeys.keyAndValue.addDocumentsInAgent;
                    if(settingDataKeys.keyAndValue.addDocumentsInAgent === true){

                        // const userIds = data.map((rec)=>rec.id);
                        const userIds=_.pluck(data, 'id')
                        // const sqlUser = `SELECT id, cbl_user_id, docUrl FROM cbl_user_documents WHERE cbl_user_id IN (${new Array(userIds.length).fill('?').join()});`;
                        const sqlUser = `SELECT id, cbl_user_id, docUrl FROM cbl_user_documents WHERE cbl_user_id IN (${userIds.join()})`
                        const dataSql = await Execute.QueryAgent(AgentConnection,sqlUser,userIds);
            
                                    if(dataSql && dataSql.length>0){
                                const clbUser={};
                                dataSql.map((rec)=>{
                                        if(clbUser[rec.cbl_user_id]){
                                        clbUser[rec.cbl_user_id].push({id:rec.id, cbl_user_id:rec.cbl_user_id, docUrl: rec.docUrl});
                                        }else{
                                        clbUser[rec.cbl_user_id] = [];
                                        clbUser[rec.cbl_user_id].push({id:rec.id, cbl_user_id:rec.cbl_user_id, docUrl: rec.docUrl});
                                        }
                                });
            
                                data.map(rec=>{
                                    if(clbUser[rec.id]){
                                        rec.documents = clbUser[rec.id];
                                    }else{
                                        rec.documents = [];
                                    }
                                    
                                });
            
                            }else{
            
                                data.map(rec=>{
                                    rec.documents = [];
                                });
            
                            }
                    }
                    for(const [index,j] of data.entries()){
                        j.reviewList=await Execute.QueryAgent(AgentConnection,"select order_id,user_id,status,rating,reveiw from cbl_user_rating where user_id=?",[j.id])
                        finaData.push(j)
                    }
                    if(parseInt(is_stripe_connected)>0){
                        if(parseInt(is_stripe_connected)==1){
                            let final = [];
                            for(const [index,i] of finaData.entries()){
                                logger.debug("===================i------------",i)
                                if(i.stripe_account.length){
                                    final.push(i);
                                }
                            }
                            resolve(final);
                        }else{
                            resolve(finaData);
                        }
                
                    }else{
                        resolve(finaData)
                    }
              }
              else{
                resolve(finaData)
              }
        //  resolve(data)

        // var st = AgentConnection.query(sql, [0, offset, limit], function (err, data) {
        //     logger.debug("============query in agent list==========", st.sql);
        //     if (err) {
        //         reject(err)
        //     }
        //     else {
        //         logger.debug("===DATA!=====AgentList====", data)

        //         // new changes ===
        //         const userIds = data.map((rec)=>rec.id);

        //          const sqlUser = `SELECT id, cbl_user_id, docUrl FROM cbl_user_documents WHERE cbl_user_id IN (${new Array(userIds.length).fill('?').join()});`;
        //         // const sqlUser = `SELECT id, cbl_user_id, docUrl FROM cbl_user_documents WHERE cbl_user_id IN (${userIds.join()})`
        //         // let dataSql = await Execute.QueryAgent(AgentConnection,sqlUser,userIds);

        //         // var st = AgentConnection.query(sqlUser, userIds, function (err1, data1) {
        //         //     logger.debug(st.sql);
        //         //     if (err1) {
        //         //         reject(err)
        //         //     }
        //         //     else {
        //         //         logger.debug("===DATA!=======AgentListWithoutPagination======", data)
        //         //         if(data1 && data1.length>0){
        //         //             console.log(data1);
        //         //             process.exit();
        //         //             // resolve(data1)
        //         //         }else{
        //         //             console.log(data1);
        //         //             process.exit();
        //         //             // let len = 0;
        //         //             // resolve(len)
        //         //         }
        //         //     }
        //         // })

        //         // if(dataSql && dataSql.length>0){
        //         //     const clbUser={};
        //         //     dataSql.map((rec)=>{
        //         //           if(clbUser[rec.cbl_user_id]){
        //         //             clbUser[rec.cbl_user_id].push({id:rec.id, cbl_user_id:rec.cbl_user_id, docUrl: rec.docUrl});
        //         //           }else{
        //         //             clbUser[rec.cbl_user_id] = [];
        //         //             clbUser[rec.cbl_user_id].push({id:rec.id, cbl_user_id:rec.cbl_user_id, docUrl: rec.docUrl});
        //         //           }
        //         //     });

        //         //     data.map(rec=>{
        //         //         if(clbUser[rec.id]){
        //         //             rec.documents = clbUser[rec.id];
        //         //         }else{
        //         //             rec.documents = [];
        //         //             rec.q = sqlUser;
        //         //         }
                        
        //         //     });

        //         // }else{

        //         //     data.map(rec=>{
        //         //         rec.documents = [];
        //         //         rec.q = sqlUser;
        //         //         rec.d = userIds;
        //         //     });

        //         // }

        //              data.map(rec=>{
        //                 rec.documents = [];
        //                 rec.q = sqlUser;
        //                 rec.d = userIds;
        //                 rec.a = dataSql;
        //             });  


        //         // new changes ===



        //         resolve(data)
        //     }
        // })
    })
}
function AgentListWithoutPagination(AgentConnection,
     search,order, supplierId, startDate, endDate,
      is_admin,country_code,country_code_type,is_stripe_connected) {
    return new Promise((resolve, reject) => {
        

        var country_code_query = ""
        if(country_code!='' && country_code_type!=''){
            if(country_code_type=='1'){
                var cc_array = country_code.split(",");
                for (var i = 0; i < cc_array.length; i++) {
                    country_code_query += " AND (cbu.country_code LIKE '"+cc_array[i]+"' or cbu.country_code LIKE '+"+cc_array[i]+"') "
                }
            }else{
                var cc_array = country_code.split(",");
                for (var i = 0; i < cc_array.length; i++) {
                    country_code_query += " AND (cbu.country_code NOT LIKE '"+cc_array[i]+"' and cbu.country_code NOT LIKE '+"+cc_array[i]+"') "
                }
            }
        }
        var sql = "select  IFNULL(sum(cbo.commission_ammount),0) AS revenue,cbu.supplier_name,cbu.id,cbu.email,cbu.experience,cbu.occupation,cbu.name,cbu.base_price, cbu.delivery_charge_share,cbu.area_id, "
        sql += "cbu.stripe_account,cbu.latitude,cbu.longitude,cbu.is_available, cbu.image, cbu.supplier_id,cbu.access_token,cbu.device_type,cbu.device_token, "
        sql += "cbu.commission,cbu.last_login,cbu.is_active, cbu.thumb_nail,cbu.country,cbu.city,cbu.state,cbu.phone_number,cbu.ip_address, "
        sql += "cbu.offset,cbu.created_by from cbl_user cbu left join cbl_user_orders cbo on cbu.id = cbo.user_id and DATE(cbo.created_on) >='"+startDate+"' and DATE(cbo.created_on) <='"+endDate+"' where "
        if (is_admin == 0) {
            if (supplierId != "") {
                sql += " CONCAT(',',cbu.supplier_id, ',') REGEXP ',("+supplierId+"),' AND "
            }
            else {
                // sql += " cbu.supplier_id != 0 AND "
            }
        } else {
            sql += " cbu.supplier_id = 0 AND "
        }
        sql += "cbu.deleted_by=? AND (cbu.id LIKE '%" + search + "%' OR cbu.name LIKE '%" + search + "%' OR cbu.email LIKE '%" + search + "%') "+country_code_query+" group by cbu.id " + order + " "
        var st = AgentConnection.query(sql, [0], function (err, data) {
            logger.debug(st.sql);
            if (err) {
                reject(err)
            }
            else {
                logger.debug("===DATA!=======AgentListWithoutPagination======", data)
                if(data && data.length>0){
                    if(parseInt(is_stripe_connected)>0){
                        if(parseInt(is_stripe_connected)==1){
                            let final = [];
                            for(const [index,i] of data.entries()){
                                logger.debug("===================i------------",i)
                                if(i.stripe_account.length){
                                    final.push(i);
                                }
                            }
                            resolve(final.length);
                        }else{
                            resolve(data.length);
                        }
                   
                    }else{
                        resolve(data.length)
            
                    }
                }else{
                    let len = 0;
                    resolve(len)
                }
            }
        })
    })
}
function AgentListWithoutPaginationForSupplier(AgentConnection, supplier_id, search, startDate, endDate) {
    return new Promise((resolve, reject) => {
        var sql = "select IFNULL(sum(cbo.commission_ammount),0) AS revenue,cbu.supplier_name,cbu.id,cbu.email,cbu.experience,cbu.occupation,cbu.name,cbu.area_id,cbu.latitude,cbu.longitude,cbu.is_available,cbu.image," +
            " cbu.supplier_id,cbu.access_token,cbu.device_type,cbu.device_token,cbu.commission,cbu.last_login,cbu.is_active," +
            " cbu.thumb_nail,cbu.country,cbu.city,cbu.state,cbu.phone_number,cbu.ip_address,cbu.offset,cbu.created_by from cbl_user cbu left join cbl_user_orders cbo on cbu.id = cbo.user_id and DATE(cbo.created_on) >='"+startDate+"' and DATE(cbo.created_on) <='"+endDate+"' where deleted_by=? AND (cbu.id LIKE '%" + search + "%' OR cbu.name LIKE '%" + search + "%' OR cbu.email LIKE '%" + search + "%') and cbu.supplier_id=? group by cbu.id"
        var st = AgentConnection.query(sql, [0, supplier_id], function (err, data) {
            logger.debug(st.sql);
            if (err) {
                reject(err)
            }
            else {
                logger.debug("===DATA!==", data)
                if(data && data.length>0){
                    resolve(data.length)
                }else{
                    let len = 0;
                    resolve(len)
                }
            }
        })
    })
}
function AgentListForSupplier(AgentConnection, supplier_id, search, limit, offset, order, startDate, endDate) {
    return new Promise((resolve, reject) => {
        var sql = "select IFNULL(sum(cbo.commission_ammount),0) AS revenue,cbu.supplier_name,cbu.id,cbu.email,cbu.experience,cbu.occupation,cbu.name,cbu.area_id,cbu.latitude,cbu.longitude,cbu.is_available,cbu.image," +
            " cbu.supplier_id,cbu.access_token,cbu.device_type,cbu.iso,cbu.agent_commission_type,cbu.device_token,cbu.commission,cbu.last_login,cbu.is_active," +
            " cbu.thumb_nail,cbu.country,cbu.city,cbu.state,cbu.phone_number,cbu.ip_address,cbu.offset,cbu.created_by from cbl_user cbu left join cbl_user_orders cbo on cbu.id = cbo.user_id and DATE(cbo.created_on) >='"+startDate+"' and DATE(cbo.created_on) <='"+endDate+"'  where deleted_by=? AND (cbu.id LIKE '%" + search + "%' OR cbu.name LIKE '%" + search + "%' OR cbu.email LIKE '%" + search + "%') and cbu.supplier_id=? group by cbu.id " + order + " " +
            " LIMIT ?,?"
        var st = AgentConnection.query(sql, [0, supplier_id, offset, limit], function (err, data) {
            logger.debug(st.sql);
            if (err) {
                reject(err)
            }
            else {
                logger.debug("===DATA!==", data)
                resolve(data)
            }
        })
    })
}
function GetAgentDbInformation(dbName) {
    logger.debug("===dbName============2", dbName);
    return new Promise((resolve, reject) => {
        var sql = "select name,user,password,host from agent_db"
        multiConnection[dbName].query(sql, [], function (err, data) {
            if (err) {
                reject(err)
            }
            else {
                logger.debug("====DATA===", data);
                if (data && data.length > 0) {
                    resolve(data[0])
                }
                else {
                    reject()
                }
            }
        })
    })
}
function RunTimeAgentConnection(data) {
    var decipher = crypto.createDecipher(algorithm, crypto_password)
    var password = decipher.update(data.password, 'hex', 'utf8')
    password += decipher.final('utf8');
    // logger.debug("=====password===",password);
    return new Promise((resolve, reject) => {
        resolve(
            runTimeDbConnection.runTimeDbConnections(
                data.name,
                data.host,
                data.user,
                password
            )
        )
    })
}
// function SynchAgentWithAvailTime(AgentData,AvailTimeList){
//     var avail_time=[],final_data=[]
//     return new Promise((resolve,reject)=>{
//         _.each(AgentData,function(i){
//             _.each(AvailTimeList,function(j){
//                 if(i.id==j.agent_id){
//                     avail_time.push(j)
//                 }
//             })
//             final_data.push({
//                 id:i.id,
//                 name:i.name,
//                 email:i.email,
//                 image:i.image,
//                 area_id:i.area_id,
//                 avail_time:avail_time
//             })
//             avail_time=[]
//         })
//         resolve(final_data)
//     })
// }
const Deletes = async (req, res) => {
    try {
        var dbName = req.dbName;
        var user_id = parseInt(req.user.id)
        // await AgentDelete(id,dbName,user_id);
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        sendResponse.somethingWentWrongError(res)
    }
}
const AssignService = async (req, res) => {
    try {
        logger.debug("===ENTING==", req.body, req.dbName);
        var service_data;
        let agentId = req.body.agentId
        var GetAgentDbData = await GetAgentDbInformation(req.dbName);
        var AgentConnection = await RunTimeAgentConnection(GetAgentDbData);

        let check_freelancer_flow = await Execute.Query(req.dbName,
            "select `key`, value from tbl_setting where `key`=? and value=1",
            ["enable_freelancer_flow"]);

        for (const service of req.body.serviceData) {
            service_data = await serviceExist(AgentConnection, service);
            // insertUpdateAgentServicePricing
            if(check_freelancer_flow && check_freelancer_flow.length>0){

                // await insertUpdateAgentServicePricing(req.dbName,agentId,
                //     service.agentBufferPrice,service.agentBufferPrice,
                //     0,0,service.service_id)

            }
            logger.debug("==========SERVCE==DATA!====", service_data);
            if (service_data && service_data.length > 0) {
                await assignData(AgentConnection, service_data, req.body.agentId,
                     req.user,service.priceArray);
            }
            else {
                await saveAllAssignData(AgentConnection, service, req.body.agentId, req.user);
            }
        }
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        logger.debug("===ERR!===", err);
        sendResponse.somethingWentWrongError(res)
    }
}
function assignData(AgentConnection, service_data,
     agent_id, user, priceArray) {
    return new Promise((resolve, reject) => {
        let price_ml_value;
        let price_values = [];
        var assignQuery = "insert into cbl_user_assigned_service (`user_service_id`,`service_id`,`user_id`) values (?,?,?)"
        var st2 = AgentConnection.query(assignQuery, [service_data[0].id, service_data[0].service_id, parseInt(agent_id)], function (err, results1) {
            if (err) {
                reject(err)
            }
            else {
                if (priceArray && priceArray.length > 0) {
                    _.each(priceArray, function (i) {
                        //   logger.debug("====I==",i)
                        price_values.push(i.start_date, i.end_date,
                             i.price, i.display_price, i.handling, 
                             i.handling_supplier, i.price_type, 
                             i.delivery_charges, i.pricing_type,
                             service_data[0].service_id, service_data[0].id,
                             i.agentBufferPrice!==undefined?i.agentBufferPrice:0,
                             i.description !==undefined?i.description:"", 
                              agent_id
                              );
                    })
                }
                price_ml_value = chunk(price_values, 14);
                logger.debug("======PRICING==VALUES==", price_ml_value);

                var mlQuery = "insert into cbl_user_service_pricing (`start_date`,`end_date`,`price`,`display_price`,`handling`,`handling_supplier`,`price_type`,`delivery_charges`,`pricing_type`,`service_id`,`user_service_id`,`agentBufferPrice`,`description`,`user_id`) values ?"
               
                var st1 = AgentConnection.query(mlQuery, [price_ml_value], function (err1, results) {
                    if(err1){
                        reject(err1)
                    }else{
                        resolve();
                    }
                })
            }
        })
    })
}
function serviceExist(AgentConnection, service_data) {
    return new Promise((resolve, reject) => {
        var Query = "select `service_id`,`id` from  cbl_user_service where service_id=? and is_deleted=?";
        var statememt = AgentConnection.query(Query, [parseInt(service_data.service_id), 0], function (err, result) {
            if (err) {
                reject(err)
            }
            else {
                resolve(result)
            }
        })
    })
}

const insertUpdateAgentServicePricing = (dbName,
    agentId,price,display_price,handlingFeeAdmin,handlingFeeSupplier,
    productId)=>{
    return new Promise(async(resolve,reject)=>{
        let checkProductPriceExist = await Execute.Query(dbName,
            "select id from product_pricing where product_id=?");
        if(checkProductPriceExist && checkProductPriceExist.length>0){
            let checkAgentPriceExist = await Execute.Query(dbName,
                "select id from agent_service_pricing where agent_id=? and service_id=?");
                if(checkAgentPriceExist && checkAgentPriceExist.length>0){
        
                let sql = "update agent_service_pricing set agentBufferPrice = ?"
                    sql += "  where id = ? limit 1";

                await ExecuteQ.Query(dbName,sql,[price,checkAgentPriceExist[0].id])
                resolve();
                } else{
                let sql1 = `insert into agent_service_pricing(service_id,agentBufferPrice,agent_id)
                            values(?,?,?) `;
                        await ExecuteQ.Query(dbName,sql1,[productId,price,agentId])
                        resolve();
                }
        }else{

            // let checkAgentPriceExist = await Execute.Query(dbName,
            //     "select id from product_pricing where agent_id=? and product_id=?");
        
                // let sql = "update product_pricing set price = ?,display_price=?,handling = ?, ";
                //     sql += "  handling_supplier = ? ,";
                //     sql += "  where id = ? limit 1";
                //     await ExecuteQ.Query(dbName,sql,[price,display_price,
                //     handlingFeeAdmin,handlingFeeSupplier,
                //     checkAgentPriceExist[0].id])

            let sql1 = `insert into product_pricing(product_id,
                        price,display_price,handling,handling_supplier,agent_id)
                         values(?,?,?,?,?,?) `;
                        await ExecuteQ.Query(dbName,sql1,[productId,
                          price, display_price,handlingFeeAdmin, handlingFeeSupplier,
                          agentId]);
            
            // let checkAgentPriceExist = await Execute.Query(dbName,
            //     "select id from product_pricing where agent_id=? and product_id=?");  

            let sql2 = `insert into agent_service_pricing(service_id,agentBufferPrice,agent_id)
                            values(?,?,?) `;
                        await ExecuteQ.Query(dbName,sql2,[productId,price,agentId])
                        resolve();
        }
    })
}


function saveAllAssignData(AgentConnection, params, agentId, user) {
    logger.debug("===PARAMS=USERS=", params);
    var priceArray = params.priceArray;
    var agentIds = agentId;
    var name = params.name;
    var image = params.image;
    var service_id = params.service_id;
    var description = params.description, price_values = [], assigned_values = [], price_ml_value, assigned_ml_values
    return new Promise((resolve, reject) => {
        AgentConnection.beginTransaction(function (err) {
            if (err) { reject(err) }
            var Query = "insert into cbl_user_service (`service_image`,`service_id`,`service_name`,`service_description`) values(?,?,?,?)";
            var statememt = AgentConnection.query(Query, [image, parseInt(service_id), name, description], function (err, result) {
                // logger.debug(statememt.sql)
                // logger.debug(err);
                if (err) {
                    AgentConnection.rollback(function () {
                        reject(err);
                    });
                    return reject(err)
                }
                if (priceArray && priceArray.length > 0) {
                    _.each(priceArray, function (i) {
                        //   logger.debug("====I==",i)
                        price_values.push(i.start_date, i.end_date,
                             i.price, i.display_price, i.handling, 
                             i.handling_supplier, i.price_type, 
                             i.delivery_charges, i.pricing_type,
                              service_id, result.insertId,
                              i.agentBufferPrice!==undefined?i.agentBufferPrice:0,
                              i.description !==undefined?i.description:"",
                              agentId
                              );
                    })
                }
                price_ml_value = chunk(price_values, 14);
                logger.debug("======PRICING==VALUES==", price_ml_value);

                var mlQuery = "insert into cbl_user_service_pricing (`start_date`,`end_date`,`price`,`display_price`,`handling`,`handling_supplier`,`price_type`,`delivery_charges`,`pricing_type`,`service_id`,`user_service_id`,`agentBufferPrice`,`description`,`user_id`) values ?"
               
                var st1 = AgentConnection.query(mlQuery, [price_ml_value], function (err1, results) {
                    logger.debug(err1)
                    if (err1) {
                        AgentConnection.rollback(function () {
                            reject(err1);
                        });
                        return reject(err1)
                    }
                    else {
                        // if(agentIds && agentIds.length>0){
                        // _.each(agentIds,function(i){
                        assigned_values.push(result.insertId, service_id, agentId);
                        // })
                        //   }
                        assigned_ml_values = chunk(assigned_values, 3);
                        //   logger.debug(price_ml_value,assigned_ml_values);
                        var assignQuery = "insert into cbl_user_assigned_service (`user_service_id`,`service_id`,`user_id`) values (?,?,?)"
                        var st2 = AgentConnection.query(assignQuery, [result.insertId, service_id, agentId], function (err2, results1) {
                            logger.debug(err2)
                            if (err2) {
                                AgentConnection.rollback(function () {
                                    reject(err2);
                                });
                                return reject(err2)
                            }
                            else {
                                AgentConnection.commit(function (err3) {
                                    if (err3) {
                                        console.log(err3)
                                        AgentConnection.rollback(function () {
                                            reject(err3)
                                        });
                                        return reject(err3)
                                    } else {
                                        // logger.debug("==========++FINALD==TRANSACTION==")
                                        resolve()
                                    }
                                });
                            }
                        })
                    }
                })
            })
        })
    })
}
// function AgentDelete(id,dbName,user_id){
//     return new Promise((resolve,reject)=>{
//         var deleteQuery="update agent set deleted_by=? where id=?"
//         multiConnection[dbName].query(deleteQuery,[parseInt(user_id),parseInt(id)],function(err,data){
//             if(err){
//                 reject(err)
//             }
//             else{
//                 resolve()
//             }
//         })
//     })
// }
// function AgentList(dbName,limit,offset,search){
// logger.debug("=====+++DBNAME==",dbName);
// return new Promise((resolve,reject)=>{
//     var selectQuery="select id,name,email,image,area_id from agent where deleted_by=? limit ? offset ?"
//      multiConnection[dbName].query(selectQuery,[0,limit,offset],function(err,data){
//             if(err){
//                 reject(err)
//             }
//             else{
//                 resolve(data)
//             }
//     })
// })
// }
// function AvailTimeList(dbName){
//     return new Promise((resolve,reject)=>{
//         var selectQuery="select `week_day_id`,`agent_id`,`start_time`,`end_time`,`venue_status`,`status` from agent_time where `is_deleted`=? "
//         multiConnection[dbName].query(selectQuery,[0],function(err,data){
//                if(err){
//                    reject(err)
//                }
//                else{
//                    resolve(data)
//                }
//        })
//     })
// }
const AssignServiceList = async (req, res) => {
    try {
        logger.debug("===ENTING==", req.body, req.dbName);
        var GetAgentDbData = await GetAgentDbInformation(req.dbName);
        var AgentConnection = await RunTimeAgentConnection(GetAgentDbData);
        var serviceData = await ServiceList(AgentConnection, req.query);
        sendResponse.sendSuccessData(serviceData, constant.responseMessage.SUCCESS, res, 200);
    } catch (err) {
        logger.debug("===ERR!===", err);
        sendResponse.somethingWentWrongError(res)
    }
}

const getAgentInOutTimings = async (req, res) => {
    try {
        let GetAgentDbData = await GetAgentDbInformation(req.dbName);
        let AgentConnection = await RunTimeAgentConnection(GetAgentDbData);
        let agentId = req.query.agentId;
        let limit = req.query.limit;
        let skip = req.query.skip;

        let query = `select * from cbl_user_in_out_timings 
        where user_id=${agentId} limit ?,?`;
        let inOutData = await Execute.QueryAgent(AgentConnection,query,[skip,limit])
        
        let query2 = `select * from cbl_user_in_out_timings 
        where user_id=${agentId}`;

        let inOutData2 = await Execute.QueryAgent(AgentConnection,query2,[])
        
        let finalData = {
            list : inOutData,
            count : inOutData2 && inOutData2.length>0?inOutData2.length:0
        }
        
        
       
        sendResponse.sendSuccessData(finalData, constant.responseMessage.SUCCESS, res, 200);
    } catch (err) {
        logger.debug("===ERR!===", err);
        sendResponse.somethingWentWrongError(res)
    }
}

const AssignServiceListForAgent = async (req, res) => {
    try {
        // logger.debug("===ENTING==", req.body, req.dbName);
        var GetAgentDbData = await GetAgentDbInformation(req.dbName);
        var AgentConnection = await RunTimeAgentConnection(GetAgentDbData);
        var serviceData = await agentServiceList(AgentConnection, req.query);
        let serviceIds = []
        let latitude = req.query.latitude || 30.7333
        let longitude = req.query.longitude || 76.7794
        for(const [index,i] of serviceData.entries()){
                serviceIds.push(i.service_id)
        }
        logger.debug("================serviceIds========",serviceIds)
        var zone_offset=req.query.zone_offset!=undefined && req.query.zone_offset!=="" && req.query.zone_offset!=null?req.query.zone_offset:"+05:30"
        var current_date =moment().utcOffset(zone_offset).format("YYYY-MM-DD")
        let serviceList = await getAgentServieList(serviceIds,req.dbName,latitude,longitude,current_date);
        
        let finalData = {
            product : []
        }
        
        for(const [index,i] of serviceData.entries()){
         let servicePricing = await getPriceOfServices(i.service_id,AgentConnection)  
         i.priceData = servicePricing 
         finalData.product.push(i)
        }
        sendResponse.sendSuccessData(finalData, constant.responseMessage.SUCCESS, res, 200);
    } catch (err) {
        logger.debug("===ERR!===", err);
        sendResponse.somethingWentWrongError(res)
    }
}
function getPriceOfServices(service_id,AgentConnection){
    return new Promise((resolve,reject)=>{
        let sql = "select start_date,end_date,price,display_price,handling,handling_supplier, "
        sql += "price_type,pricing_type from cbl_user_service_pricing "
        sql += " where service_id = ? "        
        let params = [service_id]
        let data = Execute.QueryAgent(AgentConnection,sql,params)
        resolve(data);
    })
}
/*
let sql = "select start_date,end_date,price,display_price,handling,handling_supplier, "
sql += "price_type,pricing_type from cbl_user_service_pricing "
" where service_id = ? "
*/

function getAgentServieList(service_ids,dbName,latitude,longitude,current_date){
    return new Promise(async(resolve,reject)=>{
        let mUnit=await Universal.getMeausringUnit(dbName);
    //     sql = "select latitude,if(display_price=price,0,1) AS discount,IF((select count(*)  from questions where questions.category_id =sub_category_id) > 0,1,0 ) as is_question,longitude,parent_id,radius_price,delivery_radius,type,is_agent,agent_list,adds_on,duration, pricing_type,is_variant, avg_rating, is_quantity, is_product, price_type, offer_id, fixed_price,delivery_charges,handling_supplier, handling_admin,";
    //    sql += "can_urgent, urgent_type, category_id,detailed_sub_category_id,sub_category_id, supplier_id, price, offer_name, display_price, measuring_unit, product_desc, name, image_path,";
    //    sql += "product_id, supplier_id,supplier_branch_id,self_pickup,supplier_name, supplier_image,cart_image_upload,order_instructions,quantity, purchased_quantity,(6371 * acos (cos ( radians("+latitude+") )* cos( radians( latitude ) )*";
    //    sql += "cos( radians( longitude ) - radians("+longitude+") )+ sin ( radians("+latitude+") )* sin( radians( latitude ) ))) AS distance ";
    //    sql += "from (select ( select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"type_name\": \"', pdt.name, '\", ','\"name\": \"', pr.name,'\", ','\"addon_limit\": \"', pr.addon_limit,'\",  ','\"is_mandatory\": \"', pr.is_mandatory,'\", ','\"type_id\": \"', pdt.id,'\",','\"is_multiple\": \"', pr.is_multiple,'\",','\"min_adds_on\": \"', pr.min_adds_on,'\",','\"max_adds_on\": \"', pr.max_adds_on,'\",','\"id\": \"', pr.id, '\",','\"price\": \"', price, '\",','\"is_default\": \"', pdt.is_default, '\"','}') SEPARATOR ','),''),']') AS bData from product_adds_on pr left join product_adds_on_type pdt on pdt.adds_on_id=pr.id and pdt.is_deleted=0 where pr.product_id=p.id and pr.is_deleted=0      ) as adds_on,IF( (select count(*) from product where product.parent_id = p.id)> 0, 1, 0) as is_variant,";
    //    sql += "";
    //    sql += "p.quantity as quantity,p.parent_id, p.purchased_quantity as purchased_quantity, p.avg_rating as avg_rating,ct.type,ct.agent_list,ct.order_instructions,ct.cart_image_upload,ct.is_quantity as is_quantity, p.duration as duration,";
    //    sql += "p.is_product as is_product,ct.is_agent,  pp.pricing_type as price_type, pp.id as offer_id,pp.delivery_charges as delivery_charges, pp.handling as handling_admin, pp.handling_supplier, pp.can_urgent,";
    //    sql += "pp.urgent_type, p.category_id, p.detailed_sub_category_id,p.sub_category_id, sb.supplier_id,sb.id as supplier_branch_id,pp.pricing_type, pp.price as fixed_price, pp.price, pp.offer_name, pp.display_price, pml.measuring_unit,";
    //    sql += "pml.product_desc, pml.name, pi.image_path, p.id as product_id,s.self_pickup as self_pickup, s.name as supplier_name,sb.latitude,sb.longitude,s.radius_price,sb.delivery_radius as delivery_radius, s.logo as supplier_image from "
   
    //    sql += "supplier_branch sb join supplier_branch_product sbp on sb.id = sbp.supplier_branch_id join supplier s on s.id = sb.supplier_id "
    //    sql += "join product p on p.id = sbp.product_id join product_image pi on pi.product_id = p.id join product_ml pml on pml.product_id = p.id "
    //    sql += "join product_pricing pp on pp.product_id = p.id join categories ct on ct.id = p.category_id left join supplier_image si on si.supplier_id = sb.supplier_id "
   
   
   
   
    //    sql += "where p.id IN("+service_ids+") and pp.is_deleted = ? and  ct.is_live=1 and ct.is_deleted=0 and sbp.is_deleted = 0 and p.is_live = 1 and sb.is_live = 1 and (pi.imageOrder =1) and sb.is_deleted = 0 and p.is_deleted = 0 and pml.language_id = ? ";
    //    sql += "and s.is_live = 1 and s.is_deleted = 0 and pp.price_type = ? and DATE(pp.start_date) <= CURDATE() and DATE(pp.end_date) >= CURDATE() ORDER BY ";
    //    sql += "pp.price_type DESC) selection GROUP BY product_id  order by offer_id DESC";       
    sql ="select temp.*,IF(EXISTS(select product.id from product where product.parent_id = temp.product_id and product.is_deleted = 0 limit 1),1,0) as is_variant from (select  p.category_id as categories_id,p.sub_category_id,IF(EXISTS(select questions.id  from questions where questions.category_id =p.sub_category_id limit 1),1,0 ) as is_question,p.id as product_id,p.avg_rating,(select count(*) from order_prices join product prd on prd.id=order_prices.product_id where  order_prices.product_id=p.id) as total_orders, ( select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"type_name\": \"', pdt.name, '\", ','\"name\": \"', pr.name,'\", ','\"type_id\": \"', pdt.id,'\",','\"is_multiple\": \"', pr.is_multiple,'\",','\"min_adds_on\": \"', pr.min_adds_on,'\",','\"max_adds_on\": \"', pr.max_adds_on,'\",','\"id\": \"', pr.id, '\",','\"price\": \"', price, '\",','\"is_default\": \"', pdt.is_default, '\"','}') SEPARATOR ','),''),']') AS bData from product_adds_on pr left join product_adds_on_type pdt on pdt.adds_on_id=pr.id and pdt.is_deleted=0 where pr.product_id=p.id and pr.is_deleted=0      ) as adds_on,IF(EXISTS(select product_adds_on.id  from product_adds_on  where  product_adds_on.product_id = p.id  and product_adds_on.is_deleted = 0 limit 1), 1, 0) as is_product_adds_on,("+mUnit+" * acos (cos (radians("+latitude+"))* cos(radians(s.latitude))* cos(radians(s.longitude) - radians("+longitude+")) + sin (radians("+latitude+"))* sin(radians(s.latitude)))) AS distance,p.is_product,p.duration,"+
    " price.display_price,s.id as supplier_id,s.delivery_max_time,s.delivery_min_time,s.logo as supplier_logo,"+
    " p.quantity,p.purchased_quantity,"+
    " c.payment_after_confirmation,c.is_quantity,c.is_agent,c.agent_list,c.id as category_id,c.category_flow,if(price.display_price=price.price,0,1) AS discount,s.name as supplier_name"+
    " ,price.price as hourly_price,price.pricing_type,price.urgent_type,price.urgent_value,price.can_urgent, sbb.id as supplier_branch_id,"+
    " if(p.purchased_quantity>=p.quantity,0,1) AS availability,price.delivery_charges,price.handling as handling_admin,price.handling_supplier,price.house_cleaning_price,"+                            
    " price.beauty_saloon_price,"+
    " bp.detailed_sub_category_id,"+
    " bar_code,sku,cml.name as detailed_name,pml.name,pml.product_desc"+
    " ,price.price,pimage.image_path,"+
    " pml.measuring_unit,s.delivery_radius,price.price_type  ,"+
    " price.price as fixed_price,price.price_type as price1"+
    " from"+
    " supplier_branch_product bp join categories c on  bp.category_id = c.id join categories_ml cml on cml.category_id = c.id join product p"+
    " on bp.product_id = p.id left join order_prices ors on ors.product_id=p.id join product_ml pml  on bp.product_id = pml.product_id join product_image pimage on bp.product_id = "+
    " pimage.product_id join   product_pricing price on bp.product_id = price.product_id and price.price_type = IF ( (SELECT COUNT(*) as counter  FROM product_pricing pc where  pc.product_id=bp.product_id and pc.is_deleted=0 having counter>1) , 1, 0) "+
    "   join supplier_branch sbb on sbb.id = bp.supplier_branch_id join supplier s on s.id = sbb.supplier_id"+ 
    " where p.id IN ("+service_ids+") and  c.is_live=1 and c.is_deleted=0 and bp.detailed_sub_category_id != 0 and p.is_live = 1"+
    " and p.parent_id=0 and p.is_deleted = 0 and bp.is_deleted=0 and price.is_deleted = 0  "+    
    " and pml.language_id = 14 and sbb.is_deleted=0 and sbb.is_live=1 and s.is_deleted =0 and s.is_active=1 and cml.language_id= 14 and ("+
    " pimage.imageOrder =1)  and ((price.price_type = '1' and DATE(price.start_date) <=  '"+current_date+"' "+
    " and DATE(price.end_date) >= '"+current_date+"') or (price.price_type = 0)) and ((price.pricing_type=1) or(price.pricing_type=0 and "+
    "  price.price !=0)) GROUP BY product_id,sku order by total_orders DESC) as temp  "

        let params = [0,14,1]
        let result = await Execute.Query(dbName,sql,params)
        var adds_on_ar=[],adds_on,final_json={};
        if(result && result.length>0){
            // logger.debug("=======================eber=========",result)
            for(var i=0;i<result.length;i++){
                 adds_on=_.groupBy(JSON.parse(result[i].adds_on),"name");
                _.each(adds_on,function(value,key,object){
                        final_json.name=key
                        final_json.value=value
                        final_json.addon_limit= value[0].addon_limit
                        final_json.is_mandatory = value[0].is_mandatory
                        adds_on_ar.push(final_json);
                        final_json={}
                })
                result[i].adds_on=adds_on_ar
                adds_on_ar=[]
                logger.debug("=====================reslt.price====1===+",result[i].pricing_type,result[i])

                if(result[i].pricing_type == 1){
                    result[i].hourly_price =JSON.parse(result[i].price);
                    logger.debug("=====================reslt.price=======+",result[i].hourly_price,result)
                    result[i].price_type=1;

                }else{
                    result[i].price_type=0;
                    delete result[i].hourly_price;
                }
                if(i==result.length-1){
                    resolve(result);
                }
            }
        }
        else{
            logger.debug("==============end'=============",result)
            resolve(result);
        }
    })
}



const RemoveAssignedService = async (req, res) => {
    try {
        var GetAgentDbData = await GetAgentDbInformation(req.dbName);
        var AgentConnection = await RunTimeAgentConnection(GetAgentDbData);
        logger.debug("==req.body.serviceIds", req.body.serviceIds);
        for (const i of req.body.serviceIds) {
            logger.debug("===I==", i);
            await UnassignService(AgentConnection, i, req.body.agentId)
        }
        // const removeServicePricing=await UnassignService(AgentConnection,req.body)
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        logger.debug("===================", err);
        sendResponse.somethingWentWrongError(res)
    }
}
function UnassignService(AgentConnection, service_id, agentId) {
    logger.debug("======PARAMS==", service_id);
    return new Promise((resolve, reject) => {
        // AgentConnection.beginTransaction(function(err) {
        // if (err) { reject(err)}
        var DQuery = " delete from cbl_user_assigned_service where service_id=? and user_id=?";
        var statememt = AgentConnection.query(DQuery, [parseInt(service_id), parseInt(agentId)], function (err, result) {
            if (err) {
                // logger.error(err)
                // AgentConnection.rollback(function() {
                //         reject(err);
                //     });
                return reject(err)
            }
            else {
                resolve()
            }
        })
        //   else{
        //     var DSQuery=" delete from cbl_user_service_pricing where service_id=?";
        //     var st=AgentConnection.query(DSQuery,[parseInt(service_id)], function(err1, result) {
        //         if(err1){
        //             logger.error(err1)
        //             AgentConnection.rollback(function() {
        //                 reject(err1);
        //             });
        //             return reject(err1)
        //         }
        //         else{
        //             var DSUQuery=" delete from cbl_user_service where service_id=? and user_id=?";
        //             var st2=AgentConnection.query(DSUQuery,[parseInt(service_id),parseInt(agentId)], function(err2, result) {
        //                 if(err2){
        //                     logger.error(err2)
        //                     AgentConnection.rollback(function() {
        //                         reject(err2);
        //                     });
        //                     return reject(err)
        //                 }
        //                 else{
        //                     AgentConnection.commit(function(err3) {
        //                         if (err3) { 
        //                             logger.error(err3)
        //                             AgentConnection.rollback(function() {
        //                                     reject(err3)
        //                                 });
        //                                 return reject(err3)
        //                         }else{
        //                             logger.debug("==========++FINALD==TRANSACTION==")
        //                             resolve()
        //                         }   
        //                     });
        //                 }
        //             })
        //         }
        //     })        
        //   }
        // })
    })
    // })
}

function ServiceList(AgentConnection, params) {
    return new Promise((resolve, reject) => {
        var sql = "select `service_id` from cbl_user_assigned_service where status=? and user_id=? group by service_id"
        var st = AgentConnection.query(sql, [1, parseInt(params.agent_id)], function (err, data) {
            //    logger.debug(st.sql);
            if (err) {
                reject(err)
            }
            else {
                resolve(data)
            }
        })
    })
}

function agentServiceList(AgentConnection, params) {
    return new Promise((resolve, reject) => {
        let sql = "select cuas.service_id, cus.service_name, cus.service_description, "
        sql += "cus.service_image, cus.status from cbl_user_assigned_service cuas join "
        sql += "cbl_user_service cus on cus.service_id = cuas.service_id join cbl_user_service_pricing cusp "
        sql += "on cusp.service_id = cus.service_id where cuas.status = ? and cuas.user_id = ? group by service_id "       
         var st = AgentConnection.query(sql, [1, parseInt(params.agent_id)], function (err, data) {
            //    logger.debug(st.sql);
            if (err) {
                reject(err)
            }
            else {
                if(data && data.length>0){
                    resolve(data)
                }
                else{
                    resolve([{"service_id":0}])
                }
                
            }
        })
    })
}
/**
 * @description used for assign booking to agent from admin/supplier
 * @param {*Object} req 
 * @param {*Object} res 
 */
const BookingAssignmnt = async (req, res) => {
    try {

        var params = req.body,adds_on_arr=[];
        var GetAgentDbData = await GetAgentDbInformation(req.dbName);
        var AgentConnection = await RunTimeAgentConnection(GetAgentDbData);
        var API_KEY = await Agent.KeyData(AgentConnection, config.get("agent.api_key"));
        var SECRET_KEY = await Agent.KeyData(AgentConnection, config.get("agent.db_secret_key"));
        const allow_agentwallet_to_pay_for_cashorder_val = await func.getSettingDataKeyAndValue(req.dbName, ['allow_agentwallet_to_pay_for_cashorder']);
        console.log("1111111111111111111111",allow_agentwallet_to_pay_for_cashorder_val);


        
        let query = "select `key`,value from tbl_setting where `key` =? ";
        let laundary_check = await Execute.Query(req.dbName,query,["is_laundry_theme"]);

        let check_for_number_masking = await Universal.checkNumberMasking(req.dbName);
        
        if(allow_agentwallet_to_pay_for_cashorder_val.keyAndValue.allow_agentwallet_to_pay_for_cashorder == 1){
            console.log("222222222222222222222222",allow_agentwallet_to_pay_for_cashorder_val)
            var agentOrderDetails = await Execute.QueryAgent(AgentConnection,"SELECT (select wallet_amount from cbl_user where id=?) as agent_wallet_balance, `tip_agent`, `commission_ammount`, agent_base_price, agent_delivery_charge_share,`net_amount`,`payment_type`,(net_amount - (tip_agent + commission_ammount + agent_base_price + agent_delivery_charge_share)) amount_payable FROM `cbl_user_orders` WHERE order_id=?",[params.agentIds[0],params.orderId]);
            console.log("3333333333333333333333333333333",agentOrderDetails)
            if(agentOrderDetails && agentOrderDetails.length>0){
                console.log("44444444444444444444444444",agentOrderDetails)
                if(agentOrderDetails[0].payment_type =='0' && agentOrderDetails[0].agent_wallet_balance < agentOrderDetails[0].amount_payable){
                    console.log("555555555555555555555555555555",agentOrderDetails)
                    var message = "Not enough balance in wallet";
                    return sendResponse.sendErrorMessage(message, res, 400)
                }
            }
        }

        await UnassignOrder(req.body, req.dbName);
        await Execute.QueryAgent(AgentConnection,`update cbl_user_orders set user_id=? where order_id=?`,[0,params.orderId]);
        await AddOrderInAgent(req.user, req.body, req.dbName);
        await UpdateOrderAgent(req.user, req.body, req.dbName);
        var OrderDetails = await Agent.OrderDetail(req.dbName, params.orderId)
        let customer_id = OrderDetails.customer_id;
        var OrderItems = await Agent.OrderItems(req.dbName, params.orderId);
        var DeliverAddress = await Agent.DeliveryAddress(req.dbName, params.orderId);
        let cartData=await Execute.Query(req.dbName,"select cart_id from orders where id=?",[params.orderId]);
        if(cartData && cartData.length>0){
            let ads_on_query="select product_adds_on.product_id,cart_adds_on.*,cart.delivery_charges,cart.handling_admin,cart.handling_supplier from "+
            " cart_adds_on join cart on cart.id=cart_adds_on.cart_id join product_adds_on on product_adds_on.id=cart_adds_on.adds_on_id where cart_adds_on.cart_id=? ";
            let ads_on_data=await Execute.Query(req.dbName,ads_on_query,[cartData[0].cart_id]);
            for(const [index,i] of ads_on_data.entries()){
                adds_on_arr.push({
                    product_id:i.product_id,
                    adds_on_name:i.adds_on_name,
                    adds_on_type_name:i.adds_on_type_name,
                    quantity:i.quantity,
                    price:i.price,
                    serial_number:i.serial_number
                })
            }
        }
        OrderDetails.items = OrderItems
        let branchData=await Execute.Query(req.dbName,`SELECT COUNT(DISTINCT(supplier_branch_id)) as branchCount 
        FROM order_prices where order_id=?`,
        [params.orderId]);
        OrderDetails.have_multiple_branch=branchData && branchData.length>0?branchData[0].branchCount:0
        OrderDetails.address = DeliverAddress;
        OrderDetails.adds_on=adds_on_arr;
        OrderDetails.user_id = params.agentIds[0]
        logger.debug("========OrdeDetails===", OrderDetails);
        
        await Agent.AssignOrderToAgent(OrderDetails, API_KEY, SECRET_KEY);

        if(laundary_check && laundary_check.length>0){
            if(laundary_check[0].value==1){
                schedule.scheduleJob(OrderDetails.drop_off_date,async function(){
                    let agentDetails = await Execute.QueryAgent(AgentConnection,"select id,device_token from cbl_user where id=?",[params.agentIds[0]])
                    let message="Hi there, you have a dropoff today for booking number"+params.orderId;
                    var noteData = {
                        "status": 0,
                        "message":message,
                        "orderId":params.orderId
                    }
                    await lib.sendFcmPushNotification([agentDetails.device_token], noteData,req.dbName);
                    await saveNoticationData(req.dbName,res,1,0,0,0,message);
                    });

            }
        }

        if(check_for_number_masking && check_for_number_masking.length>0){
                let proxyPhoneNumbers = await numberMasking.getTwilioMaskedPhoneNumber(
                    OrderDetails.user_id,
                    customer_id,
                    params.orderId,
                    res,
                    req.dbName)
                await Execute.Query(req.dbName,
                    "update orders set proxy_phone_number=? where id=?",
                    [proxyPhoneNumbers.participantUser.proxyIdentifier,OrderDetails.order_id])
                
                await Execute.QueryAgent(AgentConnection,
                        "update cbl_user_orders  set proxy_phone_number=? where order_id=?",
                        [proxyPhoneNumbers.participantUser.proxyIdentifier,OrderDetails.order_id])
        }

        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        logger.debug("===================", err);
        var message = err != undefined ? err.MSG : "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
    }
}
function UpdateOrderAgent(user, params, db_name) {
    var final_data, data_array = [];
    if (params.agentIds && params.agentIds.length > 0) {
        var update_query = "update `orders` set is_agent=1 where id=?";
        logger.debug("----FINAL--DATA!--");
        return new Promise((resolve, reject) => {
            multiConnection[db_name].query(update_query, [parseInt(params.orderId)], function (err, data) {
                if (err) {
                    reject(err)
                }
                else {
                    resolve()
                }
            })
        })
    }
    else {
        resolve()
    }
}
function AddOrderInAgent(user, params, db_name) {
    var final_data, data_array = [];
    if (params.agentIds && params.agentIds.length > 0) {
        _.each(params.agentIds, function (i) {
            data_array.push(parseInt(i), parseInt(params.orderId), parseInt(user.id))
        })
        final_data = _.chunk(data_array, 3);
        var insert_query = "insert into  agent_orders(`agent_id`,`order_id`,`assigned_by`) values ?";
        logger.debug("----FINAL--DATA!--");
        return new Promise((resolve, reject) => {
            multiConnection[db_name].query(insert_query, [final_data], function (err, data) {
                if (err) {
                    reject(err)
                }
                else {
                    resolve()
                }
            })
        })
    }
    else {
        resolve()
    }
}
/**
 * @description used for update an order assingmnt in client side db
 * @param {*Object} params 
 * @param {*String} db_name 
 */
function UnassignOrder(params, db_name) {
    return new Promise(async (resolve, reject) => {
        try{
          
            await Execute.Query(db_name,`delete from agent_orders where order_id=? and agent_id=?`,[parseInt(params.orderId),params.agentIds[0]])
            resolve()
        }
        catch(Err){
            reject(Err)
        }
    })
}
const ListAccToArea = async (req, res) => {
    try {
        let agent_category_id = req.query.agent_category_id

        var AgentData = "";

        var GetAgentDbData = await GetAgentDbInformation(req.dbName);
        // logger.debug("==DATABASE==",GetAgentDbData);
        var AgentConnection = await RunTimeAgentConnection(GetAgentDbData);

        if(req.dbName == "hungrycanadian_0710"){
            AgentData = await AgentListAccToAreaV1(AgentConnection, req.query.areaId,
                req.query.supplierId,agent_category_id);
        }else{
            AgentData = await AgentListAccToArea(AgentConnection, req.query.areaId,
                req.query.supplierId,agent_category_id);
        }
        
        sendResponse.sendSuccessData(AgentData, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        logger.error(err);
        sendResponse.somethingWentWrongError(res);
    }
}
function AgentListAccToArea(AgentConnection, area_id, supplier_id,agent_category_id) {
    return new Promise(async(resolve, reject) => {
            let agent_category_check = ""
        if(agent_category_id!==undefined && agent_category_id!=="" && agent_category_id!==0){
            agent_category_check = " and agent_category_id="+agent_category_id+""
        }
        var sql = "select `id`,`email`,`experience`,`occupation`,`name`,`area_id`,`latitude`,`longitude`,`is_available`,`image`," +
            " `supplier_id`,`access_token`,`device_type`,`device_token`,`last_login`,`is_active`," +
            " `assigned_id`,`thumb_nail`,`country`,`city`,`state`,`phone_number`,`ip_address`,`offset`,`created_by` from `cbl_user` where `deleted_by`=? "+agent_category_check+" and is_available=1 and is_active=1  and CONCAT(',',`supplier_id`, ',') REGEXP ',(" + supplier_id + "|0),'"
       
 
            var st = AgentConnection.query(sql, [0],async function (err, data) {
            logger.debug(st.sql);
            if (err) {
                reject(err)
            }
            else {
                logger.debug("===DATA!==", data)
                if(data && data.length>0){
                    for(const [index,i] of data.entries()){
                        let query = "select count(id) as active_orders from cbl_user_orders where user_id=? and status IN(1,3,10,11)"
                        let params = [i.id];
                        let result = await Execute.QueryAgent(AgentConnection,query,params);
                        i.active_orders = result[0].active_orders
                    }
                }
                resolve(data)
            }
        })
    })
}


function AgentListAccToAreaV1(AgentConnection, area_id, supplier_id,agent_category_id) {
    return new Promise(async(resolve, reject) => {
            let agent_category_check = ""
        if(agent_category_id!==undefined && agent_category_id!=="" && agent_category_id!==0){
            agent_category_check = " and agent_category_id="+agent_category_id+""
        }
        
        var sql = "select `id`,`email`,`experience`,`occupation`,`name`,`area_id`,`latitude`,`longitude`,`is_available`,`image`," +
        " `supplier_id`,`access_token`,`device_type`,`device_token`,`last_login`,`is_active`," +
        " `assigned_id`,`thumb_nail`,`country`,`city`,`state`,`phone_number`,`ip_address`,`offset`,`created_by` from `cbl_user` where `deleted_by`=? "+agent_category_check+" and is_available=1 and is_active=1  and CONCAT(',',`supplier_id`, ',') REGEXP ',(" + supplier_id + "|0),'"
   
            var st = AgentConnection.query(sql, [0],async function (err, data) {
            logger.debug(st.sql);
            if (err) {
                reject(err)
            }
            else {
                logger.debug("===DATA!==", data)
                if(data && data.length>0){
                    for(const [index,i] of data.entries()){
                        let query = "select count(id) as active_orders from cbl_user_orders where user_id=? and status IN(1,3,10,11)"
                        let params = [i.id];
                        let result = await Execute.QueryAgent(AgentConnection,query,params);
                        i.active_orders = result[0].active_orders
                    }
                }
                resolve(data)
            }
        })
    })
}

const GetAvailability = async () => {
    var API_KEY = await Agent.KeyData(AgentConnection, config.get("agent.api_key"));
    var SECRET_KEY = await Agent.KeyData(AgentConnection, config.get("agent.db_secret_key"));
}
const GetAgentToken = async (req, res) => {
    try {
        var GetAgentDbData = await GetAgentDbInformation(req.dbName);
        var AgentConnection = await RunTimeAgentConnection(GetAgentDbData);
        var TokenData = await AgentToken(AgentConnection, req.query.agentId);
        sendResponse.sendSuccessData(TokenData, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        logger.error(err);
        sendResponse.somethingWentWrongError(res);
    }
}
const AddAgentAvailability = async (req, res) => {
    try {
        var input_data = req.body;
        logger.debug("===INPUT_DATA!===", input_data);
        var GetAgentDbData = await GetAgentDbInformation(req.dbName);
        var AgentConnection = await RunTimeAgentConnection(GetAgentDbData);
        var API_KEY = await Agent.KeyData(AgentConnection, config.get("agent.api_key"));
        var SECRET_KEY = await Agent.KeyData(AgentConnection, config.get("agent.db_secret_key"));
        var data = {
            "offset": input_data.offset,
            // "agent_token":input_data.agent_token,
            "weeks_data": input_data.weeks_data,
            "user_time": input_data.user_time,
            "user_avail_date": input_data.user_avail_date
        }
        await Agent.AddAgentAvailability(data, API_KEY, SECRET_KEY, input_data.agent_token);
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        logger.debug("===========TERRIFY========", err);
        var message = err != undefined ? err : "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
        // sendResponse.somethingWentWrongError(res);
    }
}

const setAgentsBlockTime = async (req, res) => {
    try {
        let input_data = req.body;
        logger.debug("===INPUT_DATA!===", input_data);
        let GetAgentDbData = await GetAgentDbInformation(req.dbName);
        let AgentConnection = await RunTimeAgentConnection(GetAgentDbData);
        let API_KEY = await Agent.KeyData(AgentConnection, config.get("agent.api_key"));
        let SECRET_KEY = await Agent.KeyData(AgentConnection, config.get("agent.db_secret_key"));
        

        if(input_data.id!==undefined ){
            let query = "update cbl_user_block_times set blockDate=?,blockTime=?,name=?,description=?,block_time_commission=?,blockEndDate=?,blockEndTime=? where id=? ";
            let params = [input_data.blockDate,
                input_data.blockTime,
                input_data.name,input_data.description,
                input_data.block_time_commission,
                input_data.blockEndDate,
                input_data.blockEndTime,
                input_data.id];
            let result = await Execute.QueryAgent(AgentConnection,query,params);
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);

        }else{
            let query = "insert into cbl_user_block_times (blockDate,blockTime,name,description,block_time_commission,blockEndDate,blockEndTime) values(?,?,?,?,?,?,?)";
            let params = [input_data.blockDate,
                input_data.blockTime,
                input_data.name,input_data.description,
                input_data.block_time_commission,
                input_data.blockEndDate,
                input_data.blockEndTime];
            let result = await Execute.QueryAgent(AgentConnection,query,params);
    
            let data = {
                "offset": input_data.offset,
                "blockDate": input_data.blockDate,
                "blockTime": input_data.blockTime,
                "blockEndDate": input_data.blockEndDate,
                "block_time_id":result.insertId,
                "blockEndTime":input_data.blockEndTime
            }
    
    
    
             await Agent.addAgentsBlockTime(data, API_KEY, SECRET_KEY, input_data.agent_token);
    
            let notif_data = {
                type: "blockTimeRequest",
                message:"Hi there,you got an block time request.",
                sound:"default",
                data : {
                    // current_date_time:payload.offset!=undefined && payload.offset!=""?moment().utcOffset(payload.offset).format("YYYY-MM-DD HH:mm:ss"):moment().utcOffset("+05:30").format("YYYY-MM-DD HH:mm:ss"),
                    blockTime:input_data.blockTime ,
                    blockDate:input_data.blockDate,        
                    blockEndDate:input_data.blockEndDate ,
                    block_time_id:result.insertId,
                    blockEndTime:input_data.blockEndTime    
                }
            };
    
    
            var sql = "select device_type,device_token from cbl_user ";
            let result2 = await Execute.QueryAgent(AgentConnection,sql,[]);
            let userData = [];
            let tokens = [];
            if(result2 && result2.length>0){
                let fcm_server_key = await Universal.getFcmServerKey(req.dbName);
                if(fcm_server_key!=""){
                    fcm_server_key=fcm_server_key
                }else{
                    fcm_server_key = config.get('server.fcm_server_key')
                }
    
                for(const [index,i] of result2.entries()){
                    tokens.push(i.device_token);
                    userData.push(i)
                }
                await pushNotifications.sendFcmPushNotificationInBulk(userData,
                    req.dbName,fcm_server_key,tokens,notif_data);
            }
    
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
        }

        
    }
    catch (err) {
        logger.debug("===========TERRIFY========", err);
        var message = err != undefined ? err : "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
        // sendResponse.somethingWentWrongError(res);
    }
  }

function AgentToken(AgentConnection, Id) {
    return new Promise((resolve, reject) => {
        var sql = "select `id`,`email`,`experience`,`occupation`,`name`,`area_id`,`latitude`,`longitude`,`is_available`,`image`," +
            " `supplier_id`,`access_token`,`device_type`,`device_token`,`last_login`,`is_active`," +
            " `thumb_nail`,`country`,`city`,`state`,`phone_number`,`ip_address`,`offset`,`created_by` from `cbl_user` where `deleted_by`=? and `id`=?"
        var st = AgentConnection.query(sql, [0, Id], function (err, data) {
            logger.debug(st.sql);
            if (err) {
                reject(err)
            }
            else {
                logger.debug("====TOKEN==DATA!==", data);
                if (data && data.length > 0) {
                    resolve("Bearer " + data[0].access_token)
                }
                else {
                    resolve("")
                }
            }
        })
    })
}
const UpdateAgentAvailability = async (req, res) => {
    try {
        var input_data = req.body;
        logger.debug("===INPUT_DATA!===", input_data);
        var GetAgentDbData = await GetAgentDbInformation(req.dbName);
        var AgentConnection = await RunTimeAgentConnection(GetAgentDbData);
        var API_KEY = await Agent.KeyData(AgentConnection, config.get("agent.api_key"));
        var SECRET_KEY = await Agent.KeyData(AgentConnection, config.get("agent.db_secret_key"));
        var data = {
            "offset": input_data.offset,
            // "agent_token":input_data.agent_token,
            "weeks_data": input_data.weeks_data,
            "user_time": input_data.user_time,
            "user_avail_date": input_data.user_avail_date
        }
        await Agent.UpdateAgentAvailability(data, API_KEY, SECRET_KEY, input_data.agent_token);
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        logger.debug("===========TERRIFY========", err);
        var message = err != undefined ? err : "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
        // sendResponse.somethingWentWrongError(res);
    }
}
const GetAgentAvailability = async (req, res) => {
    try {
        var input_data = req.query;
        let agent_id = input_data.agent_id || 0;
        logger.debug("===INPUT_DATA!===", input_data);
        console.log("GetAgentAvailability1>>>>>>>>>>>>>>>>>>>>>>input_data,req.dbname",input_data,req.dbName)
        var GetAgentDbData = await GetAgentDbInformation(req.dbName);
        var AgentConnection = await RunTimeAgentConnection(GetAgentDbData);
        var API_KEY = await Agent.KeyData(AgentConnection, config.get("agent.api_key"));
        var SECRET_KEY = await Agent.KeyData(AgentConnection, config.get("agent.db_secret_key"));
        console.log("GetAgentAvailability2>>>>>>>>>>>>>>>>>>>>>>secret_key",SECRET_KEY)
        var data = await Agent.GetAgentAvailability(SECRET_KEY, input_data.agent_token,agent_id);
        console.log("GetAgentAvailability3>>>>>>>>>>>>>>>>>>>>>>data",data)
        logger.debug("===DATA!==", data)
        sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        console.log("===========TERRIFY========", err);
        var message = err != undefined ? err : "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
        // sendResponse.somethingWentWrongError(res);
    }
}

const GetAgentAvailabilityV1 = async (req, res) => {
    try {
        var input_data = req.query;
        let agent_id = input_data.agent_id || 0;
        let agent_token = input_data.agent_token || "";
        logger.debug("===INPUT_DATA!===", input_data);
        var GetAgentDbData = await GetAgentDbInformation(req.dbName);
        var AgentConnection = await RunTimeAgentConnection(GetAgentDbData);
        var API_KEY = await Agent.KeyData(AgentConnection, config.get("agent.api_key"));
        var SECRET_KEY = await Agent.KeyData(AgentConnection, config.get("agent.db_secret_key"));
        var data = await Agent.GetAgentAvailabilityV1(SECRET_KEY, agent_token,agent_id);
        logger.debug("===DATA!==", data)
        sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        console.log("===========TERRIFY========", err);
        var message = err != undefined ? err : "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
        // sendResponse.somethingWentWrongError(res);
    }
}

const GetAgentBlockTimes = async (req, res) => {
    try {
        var input_data = req.query;
        logger.debug("===INPUT_DATA!===", input_data);
        var GetAgentDbData = await GetAgentDbInformation(req.dbName);
        var AgentConnection = await RunTimeAgentConnection(GetAgentDbData);
        let query = "select * from cbl_user_block_times limit ?,?";
        let params = [input_data.skip,input_data.limit];
        let result = await Execute.QueryAgent(AgentConnection,query,params);

        let query1 = "select * from cbl_user_block_times ";
        let params1 = [];
        let result1 = await Execute.QueryAgent(AgentConnection,query1,params1);
        
        let data = {
            list : result,
            count : result1.length
        }


        sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        logger.debug("===========TERRIFY========", err);
        var message = err != undefined ? err : "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
        // sendResponse.somethingWentWrongError(res);
    }
}


const GetAcceptedAgentBlockTimes = async (req, res) => {
    try {
        var input_data = req.query;
        logger.debug("===INPUT_DATA!===", input_data);
        var GetAgentDbData = await GetAgentDbInformation(req.dbName);
        var AgentConnection = await RunTimeAgentConnection(GetAgentDbData);
        let query = `select 
        abt.block_time_id,u.id as agent_id,u.email,
        u.name
        from cbl_user_accepted_block_times abt 
        
        join cbl_user_block_times bt on bt.id = abt.block_time_id
        
        join cbl_user  u on u.id = abt.cbl_user_id
        
        where abt.block_time_id=? limit ?,?`;
        let params = [input_data.block_time_id,input_data.skip,input_data.limit];

        let result = await Execute.QueryAgent(AgentConnection,query,params);

        let query1 = `select 
        abt.block_time_id,u.id as agent_id,u.email,
        u.name
        from cbl_user_accepted_block_times abt 
        
        join cbl_user_block_times bt on bt.id = abt.block_time_id
        
        join cbl_user  u on u.id = abt.cbl_user_id
        
        where abt.block_time_id=?`;
        let params1 = [input_data.block_time_id];
        let result1 = await Execute.QueryAgent(AgentConnection,query1,params1);
        
        let data = {
            list : result,
            count : result1.length
        }


        sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        logger.debug("===========TERRIFY========", err);
        var message = err != undefined ? err : "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
        // sendResponse.somethingWentWrongError(res);
    }
}

const deleteAgentBlockTime = async (req, res) => {
    try {
        var input_data = req.body;
        logger.debug("===INPUT_DATA!===", input_data);
        var GetAgentDbData = await GetAgentDbInformation(req.dbName);
        var AgentConnection = await RunTimeAgentConnection(GetAgentDbData);

        let query = "delete  from cbl_user_block_times where id=?";
        let params = [input_data.id];
         await Execute.QueryAgent(AgentConnection,query,params);

       

        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        logger.debug("===========TERRIFY========", err);
        var message = err != undefined ? err : "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
        // sendResponse.somethingWentWrongError(res);
    }
}

const DeleteTimsSlots = async (req, res) => {
    try {
        var input_data = req.body;
        var params = req.body;
        logger.debug("===INPUT_DATA!===", params, input_data);
        var GetAgentDbData = await GetAgentDbInformation(req.dbName);
        var AgentConnection = await RunTimeAgentConnection(GetAgentDbData);
        var API_KEY = await Agent.KeyData(AgentConnection, config.get("agent.api_key"));
        var SECRET_KEY = await Agent.KeyData(AgentConnection, config.get("agent.db_secret_key"));
        var data = await Agent.DeleteAgentTime(SECRET_KEY, input_data.agent_token, params);
        logger.debug("===DATA!==", data);
        sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        logger.debug("===========TERRIFY========", err);
        var message = err != undefined ? err : "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
        // sendResponse.somethingWentWrongError(res);
    }
}
const blockUnblock = async (req, res) => {
    try {
        var params = req.body;

        logger.debug("===INPUT_DATA!===", params);

        var GetAgentDbData = await GetAgentDbInformation(req.dbName);
        var AgentConnection = await RunTimeAgentConnection(GetAgentDbData);

        await Execute.QueryAgent(AgentConnection, "update `cbl_user` set `is_active`=? where `id`=?", [params.status, params.id]);

        if (parseInt(params.status) > 0) {

            let driverEmail = await Execute.QueryAgent(AgentConnection, "SELECT email from cbl_user where id = ?", [params.id]);


            let email = driverEmail[0].email;
            console.log(email, "emailemailemail");
            let urlsecondlogo = 'https://i.ibb.co/P5MTW3K/ic-launcher-playstore-4.png'
            var content;





            let colorThemeData = await Execute.Query(req.dbName, "select `key`,`value` from tbl_setting where `key`=?", ["theme_color"]);
            let extraValueInMail = await Execute.Query(req.dbName, "select `key`,`value` from tbl_setting where `key`=?", ["mail_enhancement"]);




            let colorTheme = colorThemeData && colorThemeData.length > 0 ? colorThemeData[0].value : "#e84b58"



            var subject = "Your Driver Account has been Approved"



            if (extraValueInMail && extraValueInMail.length > 0 && extraValueInMail[0].value == 1) {
                content = "<!doctype html> " +
                    '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">' +

                    '<head>' +
                    '<meta charset="utf-8">' +
                    '<meta name="viewport" content="width=device-width">' +
                    '<meta http-equiv="X-UA-Compatible" content="IE=edge">' +
                    '<meta name="x-apple-disable-message-reformatting">' +
                    '<link href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">' +

                    '<title>' +
                    'New Registeration' +
                    '</title>' +
                    '<style>' +
                    'html,' +
                    'body {' +
                    'margin: 0 auto !important;' +
                    'letter-spacing: 0.5px;' +
                    'padding: 0 !important;' +
                    'height: 100% !important;' +
                    'width: 100% !important;' +
                    'font-family: "Montserrat",' +
                    'sans-serif;' +
                    '}' +

                    '* {' +
                    '-ms-text-size-adjust: 100%;' +
                    '-webkit-text-size-adjust: 100%;' +
                    '}' +

                    'div[style*="margin: 16px 0"] {' +
                    'margin: 0 !important;' +
                    '}' +

                    'table,' +
                    'td {' +
                    'mso-table-lspace: 0pt !important;' +
                    'mso-table-rspace: 0pt !important;' +
                    '}' +


                    'table table table {' +
                    'table-layout: auto;' +
                    '}' +

                    'img {' +
                    '-ms-interpolation-mode: bicubic;' +
                    '}' +

                    '[x-apple-data-detectors],' +
                    '.x-gmail-data-detectors,' +
                    '.x-gmail-data-detectors *,' +
                    '.aBn {' +
                    'border-bottom: 0 !important;' +
                    'cursor: default !important;' +
                    'color: inherit !important;' +
                    'text-decoration: none !important;' +
                    'font-size: inherit !important;' +
                    'font-family: inherit !important;' +
                    'font-weight: inherit !important;' +
                    'line-height: inherit !important;' +
                    '}' +
                    '</style>' +
                    '</head>' +

                    '<body width="100%" style="margin: 0;">' +
                    '<center style="width: 100%; background: #edf2f740; text-align: left;">' +
                    '<div style="max-width: 600px; margin: auto; background: #fff; color: #000; padding-bottom: 70px;"' +
                    'class="email-container">' +
                    '<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%"' +
                    'style="border: 1px solid #ddd; padding-bottom: 50px;">' +
                    '<tbody>' +
                    '<tr>' +
                    '<td>' +
                    '<div style="padding:20px;text-align: center;">' +
                    '<div style="width:20%;margin: 0 auto;">' +
                    '<img style="max-width: 100%;" src="' + req.logo_url + '" class="g-img">' +
                    '</div>' +
                    '</div>' +
                    '</td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td>' +
                    '<div ' +
                    ' style="background-color: "' + colorTheme + '";padding: 20px 25px; line-height: 23px; margin-bottom: 30px;">' +
                    '<h2 style="font-size: 20px;font-weight: 600;color: #fff;margin: 0px;">Welcome To ' + req.business_name + '' +
                    ' </h2>' +
                    '</div>' +
                    '</td>' +
                    '</tr>' +

                    '<tr>' +
                    '<td>' +
                    '<div style="background-color: #88b1a90d; padding: 20px 20px;margin: 0px 25px 20px;">' +
                    '<table style="width: 100%;font-size: 14px;font-weight: 300;">' +
                    '<tbody>' +
                    '<tr>' +
                    '<td style="padding-bottom: 10px;line-height: 20px;">Congratulations your profile has been approved:.</td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td style="padding-bottom: 10px;">Please find below your Access Details</td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td style="font-weight: 400;padding-bottom: 10px">Email: ' + email + '</td>' +
                    '</tr>' +


                    '<tr>' +
                    '<td style="font-weight: 400;padding-bottom: 10px">' + req.business_name + ' Australia Pty Ltd.</td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td><img src="' + urlsecondlogo + '" alt="tuber logo" width="100" height="100">' +

                    '</td>' +
                    '</tr>' +


                    '</tbody>' +
                    '</table>' +
                    '</div>' +
                    '</td>' +
                    '</tr>' +

                    '<tr>' +
                    '<td><img src="https://cdn-assets.royoapps.com/line.jpg" style="' +
                    'margin: 0px 25px;' +
                    'max-width: 92%;' +
                    '"></td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td><img src="https://cdn-assets.royoapps.com/line.jpg" style="' +
                    'margin: 0px 25px;' +
                    'max-width: 92%;' +
                    '"></td>' +
                    '</tr>' +
                    '<!-- <tr>' +
                    '<td><hr style="background-color: #e84b58;">' +
                    '</td>' +
                    '</tr> -->' +
                    '</tbody>' +
                    '</table>' +
                    '</div>' +
                    '</center>' +
                    '</body>' +

                    '</html>'
            } else {


                content = "<!doctype html> " +
                    '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">' +

                    '<head>' +
                    '<meta charset="utf-8">' +
                    '<meta name="viewport" content="width=device-width">' +
                    '<meta http-equiv="X-UA-Compatible" content="IE=edge">' +
                    '<meta name="x-apple-disable-message-reformatting">' +
                    '<link href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">' +

                    '<title>' +
                    'New Registeration' +
                    '</title>' +
                    '<style>' +
                    'html,' +
                    'body {' +
                    'margin: 0 auto !important;' +
                    'letter-spacing: 0.5px;' +
                    'padding: 0 !important;' +
                    'height: 100% !important;' +
                    'width: 100% !important;' +
                    'font-family: "Montserrat",' +
                    'sans-serif;' +
                    '}' +

                    '* {' +
                    '-ms-text-size-adjust: 100%;' +
                    '-webkit-text-size-adjust: 100%;' +
                    '}' +

                    'div[style*="margin: 16px 0"] {' +
                    'margin: 0 !important;' +
                    '}' +

                    'table,' +
                    'td {' +
                    'mso-table-lspace: 0pt !important;' +
                    'mso-table-rspace: 0pt !important;' +
                    '}' +


                    'table table table {' +
                    'table-layout: auto;' +
                    '}' +

                    'img {' +
                    '-ms-interpolation-mode: bicubic;' +
                    '}' +

                    '[x-apple-data-detectors],' +
                    '.x-gmail-data-detectors,' +
                    '.x-gmail-data-detectors *,' +
                    '.aBn {' +
                    'border-bottom: 0 !important;' +
                    'cursor: default !important;' +
                    'color: inherit !important;' +
                    'text-decoration: none !important;' +
                    'font-size: inherit !important;' +
                    'font-family: inherit !important;' +
                    'font-weight: inherit !important;' +
                    'line-height: inherit !important;' +
                    '}' +
                    '</style>' +
                    '</head>' +

                    '<body width="100%" style="margin: 0;">' +
                    '<center style="width: 100%; background: #edf2f740; text-align: left;">' +
                    '<div style="max-width: 600px; margin: auto; background: #fff; color: #000; padding-bottom: 70px;"' +
                    'class="email-container">' +
                    '<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%"' +
                    'style="border: 1px solid #ddd; padding-bottom: 50px;">' +
                    '<tbody>' +
                    '<tr>' +
                    '<td>' +
                    '<div style="padding:20px;text-align: center;">' +
                    '<div style="width:20%;margin: 0 auto;">' +
                    '<img style="max-width: 100%;" src="' + req.logo_url + '" class="g-img">' +
                    '</div>' +
                    '</div>' +
                    '</td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td>' +
                    '<div ' +
                    ' style="background-color: "' + colorTheme + '";padding: 20px 25px; line-height: 23px; margin-bottom: 30px;">' +
                    '<h2 style="font-size: 20px;font-weight: 600;color: #fff;margin: 0px;">Welcome To ' + req.business_name + '' +
                    ' </h2>' +
                    '</div>' +
                    '</td>' +
                    '</tr>' +

                    '<tr>' +
                    '<td>' +
                    '<div style="background-color: #88b1a90d; padding: 20px 20px;margin: 0px 25px 20px;">' +
                    '<table style="width: 100%;font-size: 14px;font-weight: 300;">' +
                    '<tbody>' +
                    '<tr>' +
                    '<td style="padding-bottom: 10px;line-height: 20px;">Congratulations you have been registered.</td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td style="padding-bottom: 10px;">Please find below your Access Details</td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td style="font-weight: 400;padding-bottom: 10px">Email: ' + email + '</td>' +
                    '</tr>' +

                    '<tr>' +
                    '<td style="font-weight: 400;padding-bottom: 10px">Wishing your Business Prosperity and Success.</td>' +
                    '</tr>' +



                    '</tbody>' +
                    '</table>' +
                    '</div>' +
                    '</td>' +
                    '</tr>' +

                    '<tr>' +
                    '<td><img src="https://cdn-assets.royoapps.com/line.jpg" style="' +
                    'margin: 0px 25px;' +
                    'max-width: 92%;' +
                    '"></td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td><img src="https://cdn-assets.royoapps.com/line.jpg" style="' +
                    'margin: 0px 25px;' +
                    'max-width: 92%;' +
                    '"></td>' +
                    '</tr>' +
                    '<!-- <tr>' +
                    '<td><hr style="background-color: #e84b58;">' +
                    '</td>' +
                    '</tr> -->' +
                    '</tbody>' +
                    '</table>' +
                    '</div>' +
                    '</center>' +
                    '</body>' +

                    '</html>'

            }

            console.log(content, "contentssssssssssssssssssss")
            const func = require('../../routes/commonfunction');
            let smtpSqlSata = await Universal.smtpData(req.dbName);
            func.sendMailthroughSMTP(smtpSqlSata, res, subject, email, content, 0, function (err, result) {
                if (err) {

                    sendResponse.somethingWentWrongError(res);
                } else {
                    sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
                }
            });


        } else {

            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);

        }

    }
    catch (err) {
        logger.debug("===========TERRIFY========", err);
        var message = err != undefined ? err : "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400);
    }
}
const deleteAgent = async (req, res) => {
    try {
        var params = req.body;
        logger.debug("===INPUT_DATA!===", params);
        if(req.path=="/delivery_company/delete_agent"){
            var GetAgentDbData = await GetAgentDbInformation(req.dbName);
            var AgentConnection = await RunTimeAgentConnection(GetAgentDbData);
            await Execute.QueryAgent(AgentConnection, "update `cbl_user` set `deleted_by`=1 where `id`=?", [ params.id]);
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
        }else{
            var GetAgentDbData = await GetAgentDbInformation(req.dbName);
            var AgentConnection = await RunTimeAgentConnection(GetAgentDbData);
            await Execute.QueryAgent(AgentConnection, "update `cbl_user` set `deleted_by`=? where `id`=?", [req.user.id, params.id]);
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
        }
    }
    catch (err) {
        logger.debug("===========TERRIFY========", err);
        var message = err != undefined ? err : "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400);
    }
}

const addagentTips = async (req,res)=>{
    try{
        let tips = req.body.tips
        let sql = "insert into agent_tips (price) values (?)"
        
        /******delete tips*****/
        let sql2 = "delete from agent_tips"
        await Execute.Query(req.dbName,sql2,[])


        /******bulk insert tips*** */
        for(const [index,i] of tips.entries()){
            await Execute.Query(req.dbName,sql,[i.price])
        }
        sendResponse.sendSuccessData(tips, constant.responseMessage.SUCCESS, res, 200);

    }catch(err){
        logger.debug("===========TERRIFY========", err);
        var message = err != undefined ? err : "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400);
    }
}

const listAgentTips = async (req,res)=>{
    try{
        let sql = "select * from agent_tips";
        let result = await Execute.Query(req.dbName,sql,[]);
        sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, 200);
    }catch(err){
        logger.debug("===========TERRIFY========", err);
        var message = err != undefined ? err : "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400);
    }
}
const returnOrderAssignment=async (req,res)=>{
            try{
                var getAgentDbData = await GetAgentDbInformation(req.dbName);
                var agentConnection = await RunTimeAgentConnection(getAgentDbData);
                let orderPriceId=req.body.orderPriceId;
                let agentId=req.body.agentId;
                let returnData=await Execute.Query(req.dbName,`select id from order_return_request where order_price_id=?`,[orderPriceId]);
                var API_KEY = await Agent.KeyData(agentConnection, config.get("agent.api_key"));
                var SECRET_KEY = await Agent.KeyData(agentConnection, config.get("agent.db_secret_key"));
                let orderData=await Execute.Query(req.dbName,`select ors.* from orders ors join  order_prices op on op.order_id=ors.id where op.id=?`,[orderPriceId]);

                let  selectQuery="select  usr.email as customer_email,IFNULL(CONCAT(usr.firstname,usr.lastname),'') AS customer_name,ors.buffer_time, "+
                " sp.id as supplier_id,ors.user_service_charge,sp.name as supplier_name,ors.created_on,ors.schedule_date as delivery_date,usr.mobile_no as customer_phone_number,usr.user_image as customer_image ,CAST(usr.id as CHAR(50)) as customer_id,"+
                " spb.name as supplier_branch_name,spb.address as supplier_branch_address,ors.promo_discount,ors.promo_code,ors.payment_type,IFNULL(ors.comment, '') as comment,ors.remarks,ors.urgent_price,"+
                " ors.urgent,ors.tip_agent,ors.agent_base_price,ors.agent_delivery_charge_share,ors.net_amount,ors.delivery_charges,ors.handling_supplier,"+
                " ors.handling_admin,CAST(ors.id AS CHAR) as order_id "+
                " from orders ors inner join supplier inner join"+
                " supplier_branch spb on spb.id=ors.supplier_branch_id inner join supplier sp "+
                " on sp.id=spb.supplier_id inner join user usr on usr.id=ors.user_id where ors.id=?"
                
                let agentOrderData=await Execute.Query(req.dbName,selectQuery,[orderData[0].id]);
                logger.debug("===agentOrderData==>>",agentOrderData);

                let OrderDetails= agentOrderData[0];
                var  addressQuery="select us.type,ors.id as order_id,usr.latitude,usr.longitude,usr.address_line_1,usr.address_line_2,usr.pincode,usr.city,usr.landmark, "+
                "usr.directions_for_delivery,usr.address_link,usr.customer_address from orders ors left join user_address usr on usr.id=ors.user_delivery_address join user us on us.id=usr.user_id where ors.id IN(?)"
                
                let addressData=await Execute.Query(req.dbName,addressQuery,[[orderData[0].id]]);
                logger.debug("=======addressData",addressData)
                let orderItemsQuery="select order_id,quantity,price,product_id as item_id,product_name as item_name, "+
                "product_desc as item_desc,product_name as item_name,image_path from order_prices where id IN(?)"

                let orderItemData=await Execute.Query(req.dbName,orderItemsQuery,[[orderPriceId]]);
                logger.debug("=======orderItemData",orderItemData);

                OrderDetails.items = orderItemData;
                OrderDetails.address = addressData && addressData.length>0?addressData[0]:{};
                OrderDetails.is_return=returnData && returnData.length>0?returnData[0].id:1
                OrderDetails.adds_on=[];
                OrderDetails.user_id = agentId;
                await Agent.AssignReturnOrderToAgent(OrderDetails, API_KEY, SECRET_KEY);

                // logger.debug("====AgentOrderData!!==>>",agentOrderData);
                // await QueryAgent.Query(agentConnection,
                // `insert into cbl_user_orders(
                //     customer_email,
                //     customer_name,
                //     buffer_time,
                //     supplier_id,
                //     user_service_charge,
                //     supplier_name,
                //     created_on,
                //     delivery_date,
                //     customer_phone_number,
                //     customer_image,
                //     customer_id,
                //     supplier_branch_name,
                //     supplier_branch_address,
                //     promo_discount,
                //     promo_code,
                //     payment_type,
                //     comment,
                //     remarks,
                //     urgent_price,
                //     urgent,
                //     tip_agent,
                //     net_amount,
                //     delivery_charges,
                //     handling_supplier,
                //     handling_admin,
                //     order_id,
                //     is_return,
                //     user_id
                //     ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,[agentOrderData[0]])
                // let userAddressData=await Execute.Query(req.dbName,selectQuery,[orderData[0].id]);
                // 26
                sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
            }
            catch (err) {
                logger.debug("===========TERRIFY========", err);
                var message = err != undefined ? err : "Something went wrong";
                sendResponse.sendErrorMessage(message, res, 400);
            }
}
/**
 * @description used for avaialable/unavaialble of agent from admin
 * @param {*Object} req 
 * @param {*Object} res 
 */
const availableStatus = async (req, res) => {
    try {
        var params = req.body;
        logger.debug("===INPUT_DATA!===", params);
        var GetAgentDbData = await GetAgentDbInformation(req.dbName);
        var AgentConnection = await RunTimeAgentConnection(GetAgentDbData);
        await Execute.QueryAgent(AgentConnection, "update `cbl_user` set `is_available`=? where `id`=?", [params.status, params.id]);
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        logger.debug("===========TERRIFY========", err);
        var message = err != undefined ? err : "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400);
    }
}

const setAgentPasswordByAgent = async (req,res)=>{
    var agentId = req.body.agentId
    var password = req.body.password
    var oldPassword = req.body.oldPassword
    var GetAgentDbData = await GetAgentDbInformation(req.dbName);
    var AgentConnection = await RunTimeAgentConnection(GetAgentDbData);
    logger.debug("========password orignal========",password)
    hashed_password = await GeneratePassWord(password);
    // oldPassword = await GeneratePassWord(oldPassword)
    logger.debug("========password hashed========",hashed_password,oldPassword)

    let checkAgent = await Execute.QueryAgent(AgentConnection,"select * from cbl_user where id=?",[agentId]);
    let com = await  Universal.compareCryptedData(oldPassword, checkAgent[0].password)
    console.log("=====com=====",com)
    if (!com) {
        return  sendResponse.sendErrorMessage("incorrect old password",res,400)

    }else{
        var query = "update cbl_user set password = ? where id=? "
        var statement = AgentConnection.query(query,[hashed_password,agentId],function(err,data){
            logger.debug("==================query in set agent password========",statement.sql,err,data)
            if(err){
                sendResponse.somethingWentWrongError(res);
            }else{
                sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
            }
        })
    }


}


/**
 * @description used for adding categories for agent
 * @param {*Object} req 
 * @param {*Object} res 
 */
const addCategoriesForAgent = async (req, res) => {
    try {
        var param = req.body;
        var GetAgentDbData = await GetAgentDbInformation(req.dbName);
        var AgentConnection = await RunTimeAgentConnection(GetAgentDbData);
        // type 0 for small vehicle 1 for medium 2 for large
        let query = "insert into cbl_user_categories (name,type,base_delivery_charge,delivery_charge_per_km) values(?,?,?,?)";
        let params = [param.name,param.type,param.base_delivery_charge,param.delivery_charge_per_km]
        await Execute.QueryAgent(AgentConnection,query,params);
        
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        logger.debug("===========TERRIFY========", err);
        var message = err != undefined ? err : "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400);
    }
}

/**
 * @description used for listing categories for agent
 * @param {*Object} req 
 * @param {*Object} res 
 */
const listCategoriesForAgent = async (req, res) => {
    try {
        var param = req.query;
        var GetAgentDbData = await GetAgentDbInformation(req.dbName);
        var AgentConnection = await RunTimeAgentConnection(GetAgentDbData);
        // type 0 for small vehicle 1 for medium 2 for large
        let query = "select * from  cbl_user_categories";
        let params = []
        let result = await Execute.QueryAgent(AgentConnection,query,params);
        
        sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        logger.debug("===========TERRIFY========", err);
        var message = err != undefined ? err : "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400);
    }
}

/**
 * @description used for deleting categories for agent
 * @param {*Object} req 
 * @param {*Object} res 
 */
const deleteCategoriesForAgent = async (req, res) => {
    try {
        var param = req.body;
        var GetAgentDbData = await GetAgentDbInformation(req.dbName);
        var AgentConnection = await RunTimeAgentConnection(GetAgentDbData);
        // type 0 for small vehicle 1 for medium 2 for large
        let query = "delete from  cbl_user_categories where id = ?";
        let params = [param.id]

        await Execute.QueryAgent(AgentConnection,query,params);
        
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        logger.debug("===========TERRIFY========", err);
        var message = err != undefined ? err : "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400);
    }
}


/**
 * @description used for listing agent active orders
 * @param {*Object} req 
 * @param {*Object} res 
 */
const listAgentActiveOrders = async (req, res) => {
    try {
        var params = req.query;
        let agent_id = params.agent_id;
        let limit = params.limit;
        let skip = params.skip

        let order_sql="select o.is_dine_in,o.wallet_discount_amount,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,crt.area_id,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,u.mobile_no " +
        "from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id left join cart crt on crt.id=o.cart_id "+
        " join agent_orders ao on ao.order_id = o.id join user u on o.user_id=u.id left join order_promo odp on odp.orderId = o.id where  (o.status=1 or o.status=3 or o.status=10 or o.status=11 or o.status=4) and ao.agent_id=? group by o.id order by o.id DESC LIMIT ?,?";
        let order_list = await Execute.Query(req.dbName,order_sql,[agent_id,skip,limit]);
        let final = {
            list : order_list,
            count : order_list && order_list.length>0?order_list.length:0
        }

        sendResponse.sendSuccessData(final, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        logger.debug("===========TERRIFY========", err);
        var message = err != undefined ? err : "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400);
    }
}


module.exports = {
    getAgentInOutTimings:getAgentInOutTimings,
    listAgentActiveOrders:listAgentActiveOrders,
    addCategoriesForAgent:addCategoriesForAgent,
    listCategoriesForAgent:listCategoriesForAgent,
    deleteCategoriesForAgent:deleteCategoriesForAgent,
    availableStatus:availableStatus,
    returnOrderAssignment:returnOrderAssignment,
    listAgentTips : listAgentTips,
    addagentTips:addagentTips,
    deleteAgent: deleteAgent,
    blockUnblock: blockUnblock,
    DeleteTimsSlots: DeleteTimsSlots,
    Add: Add,
    List: List,
    ListSupplierAgent: ListSupplierAgent,
    Update: Update,
    Deletes: Deletes,
    AssignService: AssignService,
    // ListAccToSupplier:ListAccToSupplier,
    AssignServiceList: AssignServiceList,
    AssignServiceListForAgent :AssignServiceListForAgent,
    BookingAssignmnt: BookingAssignmnt,
    RemoveAssignedService: RemoveAssignedService,
    ListAccToArea: ListAccToArea,
    GetAgentToken: GetAgentToken,
    AddAgentAvailability: AddAgentAvailability,
    UpdateAgentAvailability: UpdateAgentAvailability,
    GetAgentAvailability: GetAgentAvailability,
    setAgentPassword:setAgentPassword,
    AddExtraDocsInAgent,
    setAgentPasswordByAgent:setAgentPasswordByAgent,
    AddAgentsByDeliveryCompany:AddAgentsByDeliveryCompany,
    setAgentsBlockTime:setAgentsBlockTime,
    GetAgentBlockTimes:GetAgentBlockTimes,
    deleteAgentBlockTime:deleteAgentBlockTime,
    GetAcceptedAgentBlockTimes:GetAcceptedAgentBlockTimes,
    GetAgentAvailabilityV1: GetAgentAvailabilityV1,
}