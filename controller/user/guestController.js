var mysql = require('mysql');
var async = require('async');
var constant=require('../../routes/constant')
var connectionCntr=require('../../routes/connection')
var sendResponse = require('../../routes/sendResponse');
const commonFunctions = require('../../routes/commonfunction')
var nodemailer = require('nodemailer');
const AgentCommon = require('../../common/agent')
var confi=require('../../config/const')
var randomString = require("randomstring");
var log4js = require('log4js');
var logger = log4js.getLogger();
const _=require("underscore");
const Models = require('../../Model/');
var emailTemp = require('../../routes/email');
logger.level = config.get('server.debug_level');
let Universal=require('../../util/Universal')
let ExecuteQ=require('../../lib/Execute')
const numberMasking = require('../../lib/numberMasking')
var crypto = require('crypto'),
    algorithm = confi.SERVER.CYPTO.ALGO,
    password =  confi.SERVER.CYPTO.PWD
/**
 * @desc Used for getting an all setting data
 * @param {*Object} req 
 * @param {*Object} res 
 */
const settingData=async (req,res)=>{
    try{
        logger.debug("====REFERS==>>",req)
        var latitude = 0
        let self_pickup=0;
        var longitude = 0
        var supplierName = " "
        let version=Universal.getVersioning(req.path);
        const screen=await screenFlow(req.dbName);
        var supplier_id = 0,supplier_branch_id=0;
        if(screen && screen.length>0 && parseInt(screen[0].is_single_vendor)==1){
            supplier_id = await getSupplierId(req.dbName);
            latitude = supplier_id[0].latitude;
            self_pickup=supplier_id[0].self_pickup;
            longitude = supplier_id[0].longitude;
            supplierName = supplier_id[0].name;
            supplier_id = supplier_id[0].supplier_id;
            supplier_branch_id=await getSupplierBranchId(req.dbName,supplier_id);
        }
        const booking=await bookingFlow(req.dbName);
        const adminDetails = await getDefaultAdminDetails(req.dbName);
        const setting=await gettSetting(req.dbName);

        const keys_value=await keyData(req.dbName);

        const default_category=await defaultCategory(req.dbName);
        const default_address=await defaultAddress(req.dbName)
        var terms_and_conditions = await getTermsConditions(req.dbName);
        let user_app_version = await userAppVersion(req.dbName);
        let slot_intervals = await getSlotsInterval(req.dbName)
        let countryCodes = await getCountryCodes(req.dbName);
        const white_label_data=await ExecuteQ.Query(req.dbName,"select is_white_label from check_cbl_authority limit 1",[])

        
        sendResponse.sendSuccessData({"key_value":keys_value,"default_category":default_category,
        "supplier_branch_id":supplier_branch_id,"supplier_id":supplier_id,"screenFlow":screen,"self_pickup":self_pickup,
         "latitude":latitude,"longitude":longitude,"supplierName":supplierName,
        "bookingFlow":booking,"settingData":setting,"default_address":default_address,
        "slot_intervals":slot_intervals,
        "termsAndConditions":terms_and_conditions,"whitelabel":white_label_data,
        "adminDetails":adminDetails,"user_app_version":user_app_version,"countryCodes":countryCodes
    }, constant.responseMessage.SUCCESS, res, 200);
    }
    catch(Err){
        console.log("=ERR=",Err)
        sendResponse.somethingWentWrongError(res);
        throw new Error(Err)
    }
}

/**
 * @desc Used for getting an all setting data
 * @param {*Object} req 
 * @param {*Object} res 
 */
const settingDataV1=async (req,res)=>{
    try{
        logger.debug("====REFERS==>>",req.headers.referer)
        var latitude = 0
        let self_pickup=0;
        var longitude = 0
        var supplierName = " "
        let version=Universal.getVersioning(req.path);
        const screen=await screenFlow(req.dbName);
        var supplier_id = 0,supplier_branch_id=0;
        if(screen && screen.length>0 && parseInt(screen[0].is_single_vendor)==1){
            supplier_id = await getSupplierId(req.dbName);
            latitude = supplier_id[0].latitude;
            self_pickup=supplier_id[0].self_pickup;
            longitude = supplier_id[0].longitude;
            supplierName = supplier_id[0].name;
            supplier_id = supplier_id[0].supplier_id;
            supplier_branch_id=await getSupplierBranchId(req.dbName,supplier_id);
        }
        const booking=await bookingFlow(req.dbName);
        const adminDetails = await getDefaultAdminDetails(req.dbName);
        const setting=await gettSetting(req.dbName);

        const keys_value=await keyDataV1(req.dbName);

        const default_category=await defaultCategory(req.dbName);
        const default_address=await defaultAddress(req.dbName)
        var terms_and_conditions = await getTermsConditions(req.dbName);
        let user_app_version = await userAppVersion(req.dbName);
        let slot_intervals = await getSlotsInterval(req.dbName)
        let countryCodes = await getCountryCodes(req.dbName);
        const white_label_data=await ExecuteQ.Query(req.dbName,"select is_white_label from check_cbl_authority limit 1",[])

        sendResponse.sendSuccessData({"key_value":keys_value,"default_category":default_category,
        "supplier_branch_id":supplier_branch_id,"supplier_id":supplier_id,"screenFlow":screen,"self_pickup":self_pickup,
         "latitude":latitude,"longitude":longitude,"supplierName":supplierName,
        "bookingFlow":booking,"settingData":setting,"default_address":default_address,
        "slot_intervals":slot_intervals,
        "termsAndConditions":terms_and_conditions,"whitelabel":white_label_data,
        "adminDetails":adminDetails,"user_app_version":user_app_version,"countryCodes":countryCodes
    }, constant.responseMessage.SUCCESS, res, 200);
    }
    catch(Err){
        console.log("=ERR==",Err)
        sendResponse.somethingWentWrongError(res);
        throw new Error(Err)
    }
}

const getSlotsInterval = (dbName)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let sql = "select * from supplier_slots_interval";
            let params = []
            let result = await ExecuteQ.Query(dbName,sql,params);
            resolve(result);

        }catch(e){
            logger.debug("+===============e=======",e);
            resolve([])
        }
    })

}

const getCountryCodes = (dbName)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let sql = "select * from country_codes";
            let params = []
            let result = await ExecuteQ.Query(dbName,sql,params);
            resolve(result);

        }catch(e){
            logger.debug("+===============e=======",e);
            resolve([])
        }
    })

}

const getDefaultAdminDetails = (dbName)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let sql = "select email,phone_number,iso,country_code from admin order by id asc limit 1";
            let params = []
            let result = await ExecuteQ.Query(dbName,sql,params);
            resolve(result);

        }catch(e){
            logger.debug("+===============e=======",e);
            resolve([])
        }
    })

}

const userAppVersion = (dbName)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let sql = "select * from user_app_version";
            let params = []
            let result = await ExecuteQ.Query(dbName,sql,params);
            resolve(result);

        }catch(e){
            logger.debug("+===============e=======",e);
            resolve([])
        }
    })

}



const getTermsConditions = (dbName) => {
    return new Promise((resolve, reject) => {
        multiConnection[dbName].query("select * from terms_and_conditions", [], (err, data) => {
            if (err) {
                resolve([])
            } else {
                let termsArr = []
                if (data && data.length > 0) {

                    for(let i=0;i<data.length;i++){
                        termsArr.push(
                            {
                                termsAndConditions: (data[i].terms_and_conditions).length!=undefined && (data[i].terms_and_conditions).length>0?1:0 ,
                                privacyPolicy: (data[i].faq).length!=undefined && (data[i].faq).length>0?1:0,
                                aboutUs: (data[i].about_us).length!=undefined && (data[i].about_us).length>0?1:0,
                                faqs: data[i].faqs && data[i].faqs.length>0?1:0,
                                language_id : data[i].language_id
                            },
                        )
                    }
                    resolve(termsArr)
                } else {
                    resolve([])
                }
            }
        })
    })
}


const defaultAddress=(dbName)=>{
    return new Promise(async (resolve,reject)=>{
        try{
            let data=await ExecuteQ.Query(dbName,"select address,latitude,longitude from default_address",[])
            resolve(data)
        
    }
    catch(Err){
        resolve([])
    }
    })
}

const keyData=(dbName)=>{
    return new Promise(async (resolve,reject)=>{
        try{
            let data=await ExecuteQ.Query(dbName,"select `key`,`value` from tbl_setting where for_front_end=1",[]);
            let k_arry={};
            for(const [index,i] of data.entries()){
                logger.debug("==",i)
                if(i.key == "create_stripe_connect_account"){
                    i.value = "https://dashboard.stripe.com/express/oauth/authorize?response_type=code&scope=read_write&client_id="+i.value
                }
                /**please keep this code commented */
                // if(i.key=="is_table_booking" ){
                //     if(i.value==0 || i.value=="0"){
                //         let d = data.find(j=>j.key=="dynamic_order_type_client_wise_dinein");
                //         if(d!==undefined){
                //             d.value="0"
            
                //         }
            
                //     }
            
                // }
                k_arry[i.key]=i.value
            }
            resolve(k_arry)
            
        }
        catch(Err){
            reject(Err)
        }
        })
}


const keyDataV1=(dbName)=>{
    return new Promise(async (resolve,reject)=>{
        try{
            let data=await ExecuteQ.Query(dbName,"select `key`,`value`,key_group from tbl_setting where for_front_end=1",[]);
            let k_arry={};

            let newData = _.groupBy(data,"key_group");

            let response = [{
                "key":{}
            }];

            for await (let [key, Values] of Object.entries(newData)) {

                let obj = {}

                for(const [index,i] of Values.entries()){
                    obj[i.key]=i.value
                }

                // let newObj = 

                // logger.debug("========key======key===key=======",key)
                response.push({key:obj})
            }
            // logger.debug("============newData=============",newData);

            // for(const [index,i] of data.entries()){
            //     logger.debug("==",i)
            //     if(i.key == "create_stripe_connect_account"){
            //         i.value = "https://dashboard.stripe.com/express/oauth/authorize?response_type=code&scope=read_write&client_id="+i.value
            //     }
            //     /**please keep this code commented */
            //     // if(i.key=="is_table_booking" ){
            //     //     if(i.value==0 || i.value=="0"){
            //     //         let d = data.find(j=>j.key=="dynamic_order_type_client_wise_dinein");
            //     //         if(d!==undefined){
            //     //             d.value="0"
            
            //     //         }
            
            //     //     }
            
            //     // }
            //     k_arry[i.key]=i.value
            // }

            
            resolve(response)
            
        }
        catch(Err){
            reject(Err)
        }
        })
}


const defaultCategory=async (dbName)=>{
   return new Promise(async (resolve,reject)=>{
       try{
           let data=await ExecuteQ.Query(dbName,"select `id`,`name`,`image`,`icon` from categories where is_default=?",[1]);
            resolve(data);
        }
        catch(Err){
            logger.debug("=Err=",Err)
            reject(Err)
        }
    })

}
const getSecreteDbKey=async (req,res)=>{
    var domain=req.body.domain
    try{
        var data=await getSecret(domain);
        sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, 200);
    }
    catch(err){
        logger.error(err)
        sendResponse.somethingWentWrongError(res)
    }
}
function getSecret(domain){
    return new Promise((resolve,reject)=>{
        var sqlSt="select cblsdb.`name` from cbl_customer cbls join cbl_customer_dbs cblsdb on cbls.id=cblsdb.customer_id where cbls.sub_domain=?" 
        cblConnection.query(sqlSt,[domain],function(err,data){
            if(err){
                reject(err)
            }
            else{
                if(data && data.length>0){
                    logger.debug("===DATA!===",data,algorithm,);
                    var cipher = crypto.createCipher(algorithm,password)
                    var crypted = cipher.update(data[0].name,'utf8','hex')
                    crypted += cipher.final('hex');
                    resolve(crypted)
                }
                else{
                    resolve("")
                }
            }

        })

    })


}

//used for getting an setting Data for whole app
function gettSetting(dbName){

 return new Promise(async (resolve,reject)=>{
    try{
        let data=await ExecuteQ.Query(dbName,"select `key`,`value` from tbl_setting where for_front_end=1",[]);
        var mapped_data = data.map(item => ({ [item.key]: item.key == "create_stripe_connect_account" ? "https://dashboard.stripe.com/express/oauth/authorize?response_type=code&scope=read_write&client_id="+item.value : item.value }) );
                resolve(mapped_data)
        resolve(mapped_data);
    }
    catch(Err){
        reject(Er)
    }
    })

}
//used for getting an booking flow through app
function bookingFlow(dbName){
    return new Promise(async (resolve,reject)=>{
        try{
            let sql="select `interval`,`booking_track_status`,`vendor_status`,`cart_flow`,`is_scheduled`,`schedule_time`,`admin_order_priority`,`is_pickup_order`,`branch_flow` from booking_cart_flow limit 1"
            let orderData=await ExecuteQ.Query(dbName,sql,[])
             resolve(orderData)
         
    }
    catch(Err){
        reject(Err)
    }
    })
}
//used for getting screen flow 
function screenFlow(dbName){
    return new Promise(async (resolve,reject)=>{
        try{
            let screenData=await ExecuteQ.Query(dbName,"select `is_multiple_branch`,`app_type`,`type`,`is_single_vendor` from screen_flow limit 1",[])
            resolve(screenData)
        }
        catch(Err){
            reject(Err)
        }
    })
}

 //used for getting supplier_id
 function getSupplierId(dbName){
    return new Promise(async (resolve,reject)=>{
        try{
            let sql="select id as supplier_id,latitude,longitude,name,self_pickup from supplier limit 1"
            let result=await ExecuteQ.Query(dbName,sql,[]);
            resolve(result)
        }
        catch(Err){
            reject(Err)
        }
    })
}
function getSupplierBranchId(dbName,supId){
    return new Promise(async (resolve,reject)=>{
        try{
            let sql="select id as supplier_branch_id from supplier_branch where supplier_id=?"
            let result=await ExecuteQ.Query(dbName,sql,[parseInt(supId)])
            if(result && result.length>0){
                resolve(result[0].supplier_branch_id)
            }
            else{
                resolve(0)
            }
            }
            catch(Err){
                reject(Err)
            }
              
          
    })
}
/**
 * @desc used for encrypt an String
 * @param {*Object} req 
 * @param {*Object} res 
 */
const encrypt=(req,res)=>{
    var cipher = crypto.createCipher(algorithm,password)
    var crypted = cipher.update(req.body.dbName,'utf8','hex')
    crypted += cipher.final('hex');
    sendResponse.sendSuccessData({enryptedDb:crypted}, constant.responseMessage.LOGGED_IN, res, constant.responseStatus.SUCCESS);
}

const getChat  = async(request, res) =>{
	try{

        var decipher = crypto.createDecipher(algorithm,crypto_password)
        // logger.debug("=-=--=-=-=-=-=-=-=-secretdbkey=-=-=-=-=-=-",request.headers.secretdbkey);
        var DbName = decipher.update(request.headers.secretdbkey,'hex','utf8');
        DbName += decipher.final('utf8');
        request.dbName=DbName
        logger.debug("============dbName======",request.dbName)
        let results = await ExecuteQ.Query(request.dbName,"select app_type from screen_flow",[]);
        request.service_type = results[0].app_type
        logger.debug("=========")

	    let userDetail = [] , result= [];
		  let  data =  request.query;
          data.receiver_id = data.receiver_created_id; 
          
        if(data.order_id && data.order_id!=""){
            let orderDetails =   await commonFunctions.getUserorderDetails(data.order_id,request.dbName);  
            logger.debug("+===========orderdetails====+++",constant.TYPE.USER,orderDetails)
            if(orderDetails.length <= 0)
                return   sendResponse.sendErrorMessage(constant.responseMessage.INVALID_ORDER_ID,res,400);

            if(orderDetails[0].status == constant.ORDER_STATUS.DELIVERED)
                return  sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, 200);
        }

		 if(data.userType == constant.TYPE.ADMIN) {
            logger.debug("===============user Details-=====1=1=1=1======",userDetail);
            userDetail  = await  commonFunctions.checkAdminExistsByToken(data.accessToken,request.dbName);
         }
	     else if(data.userType == constant.TYPE.SUPPLIER) {
            logger.debug("===============user Details-=====1=1=1======",userDetail);
            userDetail  = await  commonFunctions.checkSupplierExistsByToken(data.accessToken,request.dbName);
         }
	     else if(data.userType == constant.TYPE.USER) {
            logger.debug("===============user Details-=====1=1======",userDetail);
            userDetail  = await  commonFunctions.checkUserExistsByToken(data.accessToken,request.dbName);
         }
	     else if(data.userType == constant.TYPE.AGENT){
            logger.debug("===============user Details-=====1=======",userDetail);
			var  d_cipher        = crypto.createDecipher(algorithm,crypto_password)
			var db_name          = d_cipher.update(request.headers.secretdbkey,'hex','utf8')
				db_name          += d_cipher.final('utf8');   
			var agent_db_data    = await AgentCommon.GetAgentDbInformation(db_name);
			var agent_connection = await AgentCommon.RunTimeAgentConnection(agent_db_data);
			userDetail               = await AgentCommon.checkAgentExistsByToken(agent_connection, data.accessToken);
		 }
		 else
		{
			return sendResponse.sendErrorMessage(constant.responseMessage.INVALID_ACCESS_TOKEN,res,400);
        }
        logger.debug(userDetail[0].user_created_id,"  userDetail[0].user_created_id, ===============user Details-=====2=======",userDetail)
        if(userDetail.length > 0){
            logger.debug("===========userdetails-====3===",userDetail)
			if(data.userType == constant.TYPE.USER)
                data.send_by = userDetail[0].user_created_id;
            else if(data.userType == constant.TYPE.AGENT)
                data.send_by = userDetail[0].agent_created_id; 
            else if(data.userType == constant.TYPE.SUPPLIER)
                data.send_by = userDetail[0].user_created_id; 

                console.log("userDetail[0].type == constant.TYPE.USER",userDetail[0].type," ============================= ",constant.TYPE.USER)

            if(data.message_id && data.message_id!=""){
                console.log("11111111111111111111111111")
                result = await getConversationListing(data,request.dbName,"3"); // by message_id
            }else{
                if(data.order_id && data.order_id!=""){
                    console.log("2222222222222222222222222222222")
                    result = await getConversationListing(data,request.dbName,"1"); // by order_id
                }else{
                    console.log("3333333333333333333333333333333333333")
                    result = await getConversationListing(data,request.dbName,"2"); // without order_id
                }
            }
            logger.debug(result,"===========last======",userDetail);
            return  sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, 200);
        }else
            return sendResponse.sendErrorMessage(constant.responseMessage.INVALID_TOKEN,res,400);
        
		
    }
	catch(e)
	{  
        console.log("=======getChat========",e)
		sendResponse.somethingWentWrongError(res);
	}
}


function getConversationListing(data,dbName,type){
    return new Promise((resolve,reject)=>{

    var sql = " SELECT * FROM `chats` AS `chats` WHERE order_id = ? ORDER BY `chats`.`c_id` DESC LIMIT "+data.limit+" OFFSET "+data.skip+"";
    if(type=="2"){
        // sql = " SELECT * FROM `chats` AS `chats` WHERE (send_to='"+data.receiver_id+"' or send_by='"+data.send_by+"') and  (send_by='"+data.receiver_id+"' or send_to='"+data.send_by+"') ORDER BY `chats`.`c_id` DESC LIMIT "+data.limit+" OFFSET "+data.skip+"";
        sql = " SELECT * FROM `chats` AS `chats` WHERE (send_to='"+data.receiver_id+"' and send_by='"+data.send_by+"') or  (send_by='"+data.receiver_id+"' and send_to='"+data.send_by+"') ORDER BY `chats`.`c_id` DESC LIMIT "+data.limit+" OFFSET "+data.skip+"";
    }else if(type=="3"){
        sql = " SELECT * FROM `chats` AS `chats` WHERE message_id = '"+data.message_id+"' ORDER BY `chats`.`c_id` DESC LIMIT "+data.limit+" OFFSET "+data.skip+"";
    }

    console.log("555555555555555555555555",sql)
      multiConnection[dbName].query(sql,data.order_id, function(err,data){
          if(err){
                reject(err)
            }
            else{
                if(data && data.length>0){
                    resolve(data);
                }else{
                    resolve([])
                }
            }
        })
    })
}


const getChatMessageId  = async(request, res) =>{
	try{
        var payload =  request.query;
        if(payload.user_created_id && payload.user_created_id!=""){
            var decipher = crypto.createDecipher(algorithm,crypto_password)
            var DbName = decipher.update(request.headers.secretdbkey,'hex','utf8');
            DbName += decipher.final('utf8');
            request.dbName=DbName
            var payload =  request.query;


            var result = await getConversationMessageId(payload,request.dbName); // by message_id
            if(result){
                return  sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, 200);
            }else{
                return sendResponse.sendErrorMessage(constant.responseMessage.INVALID_TOKEN,res,400);
            }
        }else{
            return sendResponse.sendErrorMessage("user_created_id cannot be null ",res,400);
        }
    }
	catch(e)
	{  
        logger.debug("=========e======",e)
		sendResponse.somethingWentWrongError(e);
	}
}

function getConversationMessageId(data,dbName){
    return new Promise(async (resolve,reject)=>{
        try{

        let result,sql;
        let receiver_created_id=data.receiver_created_id || "";
        let supplierData=await ExecuteQ.Query(dbName,"select user_created_id from supplier where id=?",[receiver_created_id]);
        let supplier_user_created_id=supplierData  && supplierData.length>0?supplierData[0].user_created_id:"";
        
        if(data.userType=="Admin"){
            //  sql = "select (SELECT message_id FROM `chats` WHERE (`send_to_type`='ADMIN' or `send_by_type`='ADMIN') and (send_by=u.user_created_id or send_to=u.user_created_id)  and (send_by='"+data.receiver_created_id+"' or send_to='"+data.receiver_created_id+"') order by c_id desc limit 1) as message_id from admin u where user_created_id='"+data.user_created_id+"'";

             sql = "select (SELECT message_id FROM `chats` WHERE (`send_to_type`='ADMIN' or `send_by_type`='ADMIN') and (send_by='"+data.receiver_created_id+"' or send_to='"+data.receiver_created_id+"') order by c_id desc limit 1) as message_id from admin u where user_created_id='"+data.user_created_id+"'";
        }
        else if(data.userType=="Supplier"){
            if(receiver_created_id!=""){
                sql = "select (SELECT message_id FROM `chats` WHERE (`send_to_type`='SUPPLIER' or `send_by_type`='SUPPLIER') and (send_by=u.user_created_id or send_to=u.user_created_id)  and (send_by='"+data.receiver_created_id+"' or send_to='"+data.receiver_created_id+"') order by c_id desc limit 1) as message_id from supplier u where user_created_id='"+data.user_created_id+"'";
            }
            else{
                sql = "select (SELECT message_id FROM `chats` WHERE (`send_to_type`='SUPPLIER' or `send_by_type`='SUPPLIER') and (send_by=u.user_created_id or send_to=u.user_created_id) and (`send_to_type`='ADMIN' or `send_by_type`='ADMIN') order by c_id desc limit 1) as message_id from supplier u where user_created_id='"+data.user_created_id+"'";
            }
        }
        else if(data.userType=="Agent"){
            if(receiver_created_id!=""){
                sql = "select (SELECT message_id FROM "+dbName+".`chats` WHERE (`send_to_type`='SUPPLIER' or `send_by_type`='SUPPLIER') and (send_by=u.agent_created_id or send_to=u.agent_created_id) and (send_by='"+supplier_user_created_id+"' or send_to='"+supplier_user_created_id+"') order by c_id desc limit 1) as message_id from "+dbName+"_agent"+".cbl_user u where agent_created_id='"+data.user_created_id+"'";
            }else{
            sql = "select (SELECT message_id FROM "+dbName+".`chats` WHERE (`send_to_type`='ADMIN' or `send_by_type`='ADMIN') and (send_by=u.agent_created_id or send_to=u.agent_created_id) and (`send_to_type`='AGENT' or `send_by_type`='AGENT') order by c_id desc limit 1) as message_id from "+dbName+"_agent"+".cbl_user u where agent_created_id='"+data.user_created_id+"'";
            }
        }
        else{
            sql = "select (SELECT message_id FROM `chats` WHERE (`send_to_type`='ADMIN' or `send_by_type`='ADMIN') and (send_by=u.user_created_id or send_to=u.user_created_id) and (`send_to_type`='USER' or `send_by_type`='USER') order by c_id desc limit 1) as message_id from user u where user_created_id='"+data.user_created_id+"'";
        }
        result=await ExecuteQ.Query(dbName,sql,[])
       
        if(result && result.length>0){
            resolve({"message_id":result[0].message_id});
        }else{
            resolve({"message_id":""});
        }
         
    }
    catch(Err){
        console.log("==getConversationMessageId=>>",Err)
        resolve({"message_id":""});
    }
    })
}

const getTerminologyByCategory=async (req,res)=>{
    try{
        let serviceTypeId=0;
        let terminology=await Universal.getTerminologyByCategory(req.dbName,req.query.category_id);
        let typeData=await ExecuteQ.Query(req.dbName,"select `type` from categories where id=?",req.query.category_id)
        if(typeData && typeData.length>0){
            serviceTypeId=typeData[0].type
        }
        sendResponse.sendSuccessData({"terminology":terminology,serviceId:serviceTypeId}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch(Err){
        console.log("=ERR==",Err)
        sendResponse.somethingWentWrongError(res);
    }
}

/**
 * @desc Used for sending email
 * @param {*Object} req 
 * @param {*Object} res 
 */
const sendEmail=async (req,res)=>{
    try{
        let receiverEmail = req.body.receiverEmail
        let subject = req.body.subject
        let content  = req.body.content
        let senderEmail = req.body.senderEmail
        let htmlContent = "<!doctype html> "+
        '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">'+
        
        '<head>'+
            '<meta charset="utf-8">'+
            '<meta name="viewport" content="width=device-width">'+
            '<meta http-equiv="X-UA-Compatible" content="IE=edge">'+
            '<meta name="x-apple-disable-message-reformatting">'+
            '<link href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">'+
        
            '<title>'+
             'Welcome'+
            '</title>'+
            '<style>'+
                'html,'+
                'body {'+
                    'margin: 0 auto !important;'+
                    'letter-spacing: 0.5px;'+
                    'padding: 0 !important;'+
                    'height: 100% !important;'+
                    'width: 100% !important;'+
                    'font-family: "Montserrat",'+
                    'sans-serif;'+
                '}'+
        
                '* {'+
                    '-ms-text-size-adjust: 100%;'+
                    '-webkit-text-size-adjust: 100%;'+
                '}'+
        
                'div[style*="margin: 16px 0"] {'+
                    'margin: 0 !important;'+
                '}'+
        
                'table,'+
                'td {'+
                    'mso-table-lspace: 0pt !important;'+
                    'mso-table-rspace: 0pt !important;'+
                '}'+
        
        
                'table table table {'+
                    'table-layout: auto;'+
                '}'+
        
                'img {'+
                    '-ms-interpolation-mode: bicubic;'+
                '}'+
        
                '[x-apple-data-detectors],'+
                '.x-gmail-data-detectors,'+
                '.x-gmail-data-detectors *,'+
                '.aBn {'+
                    'border-bottom: 0 !important;'+
                    'cursor: default !important;'+
                    'color: inherit !important;'+
                    'text-decoration: none !important;'+
                    'font-size: inherit !important;'+
                    'font-family: inherit !important;'+
                    'font-weight: inherit !important;'+
                    'line-height: inherit !important;'+
                '}'+
            '</style>'+
        '</head>'+
        
        '<body width="100%" style="margin: 0;">'+
            '<center style="width: 100%; background: #edf2f740; text-align: left;">'+
                '<div style="max-width: 600px; margin: auto; background: #fff; color: #000; padding-bottom: 70px;"'+
                    'class="email-container">'+
                    '<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%"'+
                        'style="border: 1px solid #ddd; padding-bottom: 50px;">'+
                        '<tbody>'+
                            '<tr>'+
                                '<td>'+
                                    '<div style="padding:20px;text-align: center;">'+
                                        '<div style="width:100%;">'+
                                            '<img src="" class="g-img">'+
                                        '</div>'+
                                    '</div>'+
                                '</td>'+
                            '</tr>'+
                            '<tr>'+
                                '<td>'+
                                    '<div '+
                                    ' style="background-color: #e84b58;padding: 20px 25px; line-height: 23px; margin-bottom: 30px;">'+
                                    '<h2 style="font-size: 20px;font-weight: 600;color: #fff;margin: 0px;">Customer Query'+
                                    ' </h2>'+
                                    '</div>'+
                                '</td>'+
                            '</tr>'+
        
                            '<tr>'+
                                '<td>'+
                                    '<div style="background-color: #88b1a90d; padding: 20px 20px;margin: 0px 25px 20px;">'+
                                        '<table style="width: 100%;font-size: 14px;font-weight: 300;">'+
                                            '<tbody>'+
                                                '<tr>'+
                                                    '<td style="font-weight: 600;font-size: 16px;padding-bottom: 10px;">Hi,</td>'+
                                                '</tr>'+
                                                '<tr>'+
                                                    '<td style="padding-bottom: 10px;line-height: 20px;">Here is query a customer posted to you </td>'+
                                                '</tr>'+
                                                '<tr>'+
                                                    '<td style="padding-bottom: 10px;">'+content+'</td>'+
                                                '</tr>'+
                                                '<tr>'+
                                                    '<td style="font-weight: 400;padding-bottom: 10px">Email: '+senderEmail+'</td>'+
                                                '</tr>'+
        
                                                '<tr>'+
                                                    '<td style="padding-bottom: 10px;"></td>'+
                                                '</tr>'+
                                               
                                            '</tbody>'+
                                        '</table>'+
                                    '</div>'+
                                '</td>'+
                            '</tr>'+
        
                            '<tr>'+
                                '<td><img src="line.jpg" style="'+
                                'margin: 0px 25px;'+
                                'max-width: 92%;'+
                            '"></td>'+
                            '</tr>'+
                           
                            '<tr>'+
                                '<td><img src="line.jpg" style="'+
                                'margin: 0px 25px;'+
                                'max-width: 92%;'+
                            '"></td>'+
                            '</tr>'+
                            '<!-- <tr>'+
                                '<td><hr style="background-color: #e84b58;">'+
                                '</td>'+
                            '</tr> -->'+
                            
        
        
        
        
        
                        '</tbody>'+
                    '</table>'+
                '</div>'+
            '</center>'+
        '</body>'+
        
        '</html>'

        
        const func = require('../../routes/commonfunction');
        let smtpSqlSata=await Universal.smtpData(req.dbName);
        func.sendMailthroughSMTP(smtpSqlSata,res,subject,receiverEmail,htmlContent,0,function(err,result){
            if(err){

                sendResponse.somethingWentWrongError(res);
            }else{
                sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
            }
        });    }
    catch(Err){
        console.log("=ERR==",Err)
        sendResponse.somethingWentWrongError(res);
        throw new Error(Err)
    }
}

function checkUserExist(res,dbName,senderEmail){
    return new Promise(async(resolve,reject)=>{
        let sql = "select * from user where email = ?"
        let result = await ExecuteQ.Query(dbName,sql,[senderEmail])
        if(result && result.length>0){
            resolve()
        }else{
            let msg = "User does not exsist"
            sendResponse.sendErrorMessage(msg,res,500);
        }
    })

}

function sendSystemSettingsEmail(subject, receiversEmail, content, type) {
    logger.debug("========receiver email===222==",receiversEmail)
    return new Promise((resolve, reject) => {
        var transporter = nodemailer.createTransport("SMTP", {
            service: "mailgun",
            auth: {
                user: config.get('EmailCredentials.email'),
                pass: config.get('EmailCredentials.password')
            }
        });
        if (type == 0) {
            var mailOptions = {
                from: config.get('EmailCredentials.email'), // sender address
                to: receiversEmail, // list of receivers
                subject: subject, // Subject line
                html: content  // plaintext body
            };
        }
        else {
            var mailOptions = {
                from: config.get('EmailCredentials.email'), // sender address
                to: receiversEmail, // list of receivers
                subject: subject, // Subject line
                text: content // plaintext body
            };
        }

        // setup e-mail data with unicode symbols


        // send mail with defined transport object
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log("err", error);
                resolve();
            } else {
                console.log('Message sent: ' + JSON.stringify(info));
                resolve();
            }

        });
    })
}
/**
 * @desc Used for supplier registration
 * @param {*Object} req 
 * @param {*Object} res 
 */
var func = require('../../routes/commonfunction');
const supplierRegistraion = async (req,res)=>{
    try{
        var documents = req.files!=undefined?req.files.documents:[];
        var categoryIds = req.body.categoryIds;
        var supplierName = req.body.supplierName;
        var supplierAddress = req.body.supplierAddress;
        var supplierMobileNo = req.body.supplierMobileNo;
        var supplierEmail = req.body.supplierEmail;
        var latitude = req.body.latitude!=undefined && req.body.latitude!=''?req.body.latitude:0;
        var longitude = req.body.longitude!=undefined && req.body.longitude!=''?req.body.longitude:0;
        var commission = req.body.commission!=undefined && req.body.commission!=''?req.body.commission:0;
        var self_pickup=req.body.self_pickup!=undefined?req.body.self_pickup:0
        let iso=req.body.iso!=undefined?req.body.iso:null
        let country_code=req.body.country_code!=undefined?req.body.country_code:null
        // let license_number = req.body.license_number!==undefined?req.body.license_number:0
        let federal_number = req.body.federal_number!==undefined?req.body.federal_number:"";
        let home_chef_orignal_name = req.body.home_chef_orignal_name!==undefined?req.body.home_chef_orignal_name:"";
        let home_address = req.body.home_address!==undefined?req.body.home_address:"";
        let license_issue_date = req.body.license_issue_date!==undefined?req.body.license_issue_date:"0000-00-00 00:00:00";
        let license_end_date = req.body.license_end_date!==undefined?req.body.license_end_date:"0000-00-00 00:00:00";
        let license_document = req.body.license_document!==undefined?req.body.license_document:"";
        let is_dine_in = req.body.is_dine_in!==undefined?req.body.is_dine_in:0
        var password;
        var adminId;
        var supplierInsertId;
        var supplierBranchId
        var supplierAdminId;
        var password2;
        let  supplier_tags = req.body.supplier_tags !==undefined?req.body.supplier_tags:[]
        let user_service_fee = req.body.user_service_fee !== undefined?req.body.user_service_fee:0;
        let license_number = req.body.license_number || "";
        logger.debug("=====body=========",req.body)
        var supplierAccessToken = func.encrypt(supplierEmail + new Date());
        var is_multibranch = req.body.is_multibranch!=null && req.body.is_multibranch!=undefined ?req.body.is_multibranch:0
        let pickupCommision=req.body.pickupCommision!=undefined && req.body.pickupCommision!=""?req.body.pickupCommision:0;

        let speciality=req.body.speciality || "";
        let nationality=req.body.nationality || "";
        let facebook_link=req.body.facebook_link || "";
        let linkedin_link=req.body.linkedin_link || "";
        let brand=req.body.brand || "";
        let description=req.body.description || "";
        let inputs = []
        await checkSupplierEmailAvailability(req.dbName,res,supplierEmail);
        let randomString = await  generateRandomString();
        let documentString = ""
        password = md5(randomString);
        logger.debug("+=============req.files========",req.files)
        if(documents && documents.length>0){
            for(let i=0;i<documents.length;i++){
                let document = await uploadMgr.uploadImageFileToS3BucketNew(documents[i])
                documentString = documentString+document+"#"
                logger.debug("============",documentString)
            }
        }

        documentString = documentString.slice(0,documentString.length-1)

        logger.debug("==========documentstring==========",documentString)
        supplierInsertId = await registerSupplierV1(req.dbName,res,supplierName, supplierEmail,
            supplierMobileNo, supplierAddress,password,latitude,longitude,commission,
            pickupCommision,"0",self_pickup,country_code,iso,is_multibranch,license_number,
            description,brand,linkedin_link,facebook_link,nationality,speciality,documentString,
            federal_number,user_service_fee,
            home_chef_orignal_name,
            home_address,
            license_issue_date,
            license_end_date,
            license_document,is_dine_in,license_number
            )

        let isSupplierSuperadmin = 1;
        supplierAdminId = await addSupplierAdmin(req.dbName,supplierEmail,password,supplierMobileNo,
            isSupplierSuperadmin,"0",supplierAccessToken,supplierInsertId,"0")

        let categoryQueryData = await makeQueryStringForSupplierRegisterApiS(categoryIds,supplierInsertId)

            await insertSupplierInSupplierCategory(req.dbName,
                                    categoryQueryData.querystring,
                                    categoryQueryData.values);

                await insertNameInMultiLanguage(req.dbName,supplierName,"14",
                                    supplierInsertId,supplierAddress)

                await updateSupplierSummary(req.dbName,res,supplierInsertId)

                supplierBranchId = await createSupplierDefaultBranch(req.dbName,res,supplierInsertId,supplierName,
                    supplierAddress,supplierMobileNo,supplierEmail,latitude,longitude,password,commission);
                    let new_email_template_v12=await ExecuteQ.Query(req.dbName,"select `key`,`value` from tbl_setting where `key`=? and value=1 ",["new_email_template_v12"]);
                await createSupplierDefaultBranchMl(req.dbName,res,supplierName,supplierAddress,
                    supplierBranchId)

            
                    let smtpData=await  UniversalFunction.smtpData(req.dbName);
                    var subject = "New Supplier Registration";
                    var content = "New Supplier Registration \n";
                    content += "Congratulations you have been registered \n\n";
                    content += "Your request is under approval, you will receive an email as soon as we approve it.\n\n";
                    content +="Email: "+supplierEmail+"\n";
                    // content +="Password: "+randomString+"\n\n";
                    if(new_email_template_v12.length <=0)
                    content += " Wishing your Business Prosperity and Success \n";
                    // content += " Code Brew Lab";
                    func.sendMailthroughSMTP(smtpData,res, subject, supplierEmail, content, 1,async function(err){
                    
                    
                        var fcmToken = [];

                        let adminData=await ExecuteQ.Query(req.dbName,
                            "select `fcm_token`,`email`,`id` from admin where is_active=1",[])
                        adminData.forEach(element => {
                        fcmToken.push(element.fcm_token)
                         });
    
                        var data = {
                            "type":"supplier_register",
                            "status": 0,
                            "message":"Congratulation a new supplier has been registered at your platform",
                            "supplier_id":supplierInsertId
                        }
                
                        await saveadminsNotifications(req.dbName,supplierInsertId,0,
                            "Congratulation a new supplier has been registered at your platform",
                            0,0,"supplier_register");
                            
                        await lib.sendFcmPushNotification(fcmToken, data,req.dbName);
                        
                        await assignTagsToSupplier(req.dbName,supplier_tags,supplierInsertId)
                        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
                    });


    }
    catch(err){
        logger.error(err)
        sendResponse.somethingWentWrongError(res)
    }
}


async function assignTagsToSupplier(dbName, tags, supplier_id) {
    try {
        return new Promise(async(resolve, reject) => {
            if (tags && tags.length > 0) {
                for (const [index, i] of tags.entries()) {
                    var sql = "insert into supplier_assigned_tags(supplier_id,tag_id) values(?,?)"
                    let result = await executeQ.Query(dbName, sql, [supplier_id, i])

                }
                resolve();
            }
            else {
                resolve();
            }

            // callback(null,result.insertId)
        })
    }
    catch (Err) {
        reject(Err);
    }
}
async function saveadminsNotifications(dbName,supplierId,orderId,message,status,user_id,type){
    return new Promise(async(resolve,reject)=>{
        try{
                var sql = "insert into push_notifications(user_id,supplier_id,order_id,notification_message,notification_status,is_admin,notification_type) values(?,?,?,?,?,?,?) ";
                let params = [user_id, supplierId, orderId, message, status,1,type]

                await ExecuteQ.Query(dbName,sql,params);
                resolve()
            
        }catch(e){
            logger.debug(e);
            resolve()
        }
    })
}

/**
 * @description used for listing an payment gateways acc geofencing
 * @param {*Object} req 
 * @param {*Object} res 
 */
const getPaymentGatewayAccGeof=async (req,res)=>{
    try{   
            let paymnetGatewaysData = await Universal.checkLocationPaymentGateway(req.dbName,req.query.lat,req.query.long)  
            if(paymnetGatewaysData && paymnetGatewaysData.length>0){
                paymnetGatewaysData = paymnetGatewaysData[0].payment_gateways.split("#")
            }
            sendResponse.sendSuccessData({"gateways":paymnetGatewaysData,
        }, constant.responseMessage.SUCCESS, res, 200);
    }
    catch(Err){
        console.log("=ERR==",Err)
        sendResponse.somethingWentWrongError(res);
    }
}
/**
 * @description used for getting an tax acc geofencing
 * @param {*Object} req 
 * @param {*Object} res 
 */
const taxAccGeoFencing=async (req,res)=>{
    try{ 
        let supplierId=0;  
        let branchId=req.query.branchId || 0;
        let supplierData=await ExecuteQ.Query(req.dbName,`select id,supplier_id from supplier_branch where id=?`,[branchId])
        supplierId=supplierData && supplierData.length>0?supplierData[0].supplier_id:0;
        let taxData = await Universal.checkLocationwiseTaxAndpaymentGateway(req.dbName,
            supplierId,req.query.lat,req.query.long);

       logger.debug("=======tAx==DARA!==>>",taxData);
        sendResponse.sendSuccessData({"taxData":taxData,
    }, constant.responseMessage.SUCCESS, res, 200);
}
catch(Err){
    console.log("=ERR==",Err)
    sendResponse.somethingWentWrongError(res);
}
}
const getSubCategoryOfParent=async (req,res)=>{
    try{
        let search=req.query.search || 0;
        let limit=req.query.limit || 10;
        let offset=req.query.offset || 0;
        let categoryId=req.query.categoryId || 0;
        let cData,totalCount,catDataMl;
        let clubData = [];
        if(search==0){
            cData=await ExecuteQ.Query(req.dbName,`select IF((select count(*)  from questions  where questions.category_id=c.id) > 0, 1, 0) as is_question,
            IF((select count(*)  from product  where product.category_id=c.id) > 0, 1, 0) as is_product,
            IF((select COUNT(*) from categories cts where cts.parent_id=c.id and is_deleted=0 )>0,1,0) as is_sub_category,
            is_variant,id,name,image,icon,name,parent_id,illustration,is_live,is_variant,category_flow,is_agent,agent_list,payment_after_confirmation,is_quantity
            ,is_quantity,type,start_time,end_time,tax,terminology,menu_type  from categories c where c.is_deleted=? and c.parent_id=? limit ? offset ?`,[0,categoryId,limit,offset]);
            totalCount=await ExecuteQ.Query(req.dbName,`select COUNT(*) as totalCount from categories c where c.is_deleted=? and c.parent_id=?`,[0,categoryId]);
            var sql2 = "select cm.language_id,cm.name,cm.description,cm.category_id,cm.id,l.language_name from categories_ml cm join language l on l.id = cm.language_id  "
            // logger.debug("======getMainCategoryList===1====",categories.length);
            // logger.debug("======================",sql2)
            let categoryMl = await ExecuteQ.Query(req.dbName,sql2,[]);
            if(cData && cData.length>0){
                clubData = await Universal.categoriesWithMlName(cData,categoryMl);
                // logger.debug("======getMainCategoryList===3====",clubData.length);
            }

        }
        else{
            cData=await ExecuteQ.Query(req.dbName,`select IF((select count(*)  from questions  where questions.category_id=c.id) > 0, 1, 0) as is_question,
            IF((select count(*)  from product  where product.category_id=c.id) > 0, 1, 0) as is_product,
            IF((select COUNT(*) from categories cts where cts.parent_id=c.id )>0,1,0) as is_sub_category,
            is_variant,id,name,image,icon,parent_id,illustration,is_live,is_variant,category_flow,is_agent,agent_list,payment_after_confirmation,is_quantity
            ,is_quantity,type,start_time,end_time,tax,terminology,menu_type from categories c where c.is_deleted=? and c.parent_id=? and c.name  LIKE '%${search}%' limit ? offset ? ` ,[0,categoryId,limit,offset]);
            
            totalCount=await ExecuteQ.Query(req.dbName,`select COUNT(*) as totalCount from categories c where c.is_deleted=? and c.parent_id=? and c.name  LIKE '%${search}%'` ,[0,categoryId]);
            var sql2 = "select cm.language_id,cm.name,cm.description,cm.category_id,cm.id,l.language_name from categories_ml cm join language l on l.id = cm.language_id  "
            // logger.debug("======getMainCategoryList===1====",categories.length);
            // logger.debug("======================",sql2)
            let categoryMl = await ExecuteQ.Query(req.dbName,sql2,[]);
           
            if(cData && cData.length>0){
                clubData = await Universal.categoriesWithMlName(cData,categoryMl);
                // logger.debug("======getMainCategoryList===3====",clubData.length);
            }
        }

        sendResponse.sendSuccessData({cData:clubData,totalCount:totalCount}, constant.responseMessage.SUCCESS, res, 200);        
    }
    catch(Err){
        logger.debug("========error in BrandListAccCat==========================",Err);
        sendResponse.somethingWentWrongError(res);
    }
}

var UniversalFunction = require('../../util/Universal')
const moment = require('moment')
var uploadMgr=require('../../lib/UploadMgr')


/*
 * This function is used to check whether any supplier
 * is already reg with the same email at the time of
 * supplier reg
 */
function checkSupplierEmailAvailability(dbName,res,supplierEmail) {
    return new Promise(async(resolve,reject)=>{
        try{
            let sql = " select 1 from supplier where email = ?";
            let params = [supplierEmail]
            let result = await ExecuteQ.Query(dbName,sql,params);   
            if(result && result.length>0){
                sendResponse.sendErrorMessage(constant.responseMessage.EMAIL_EXISTS, res, constant.responseStatus.SOME_ERROR);
            }else{
                resolve();
            }
        }catch(err){
            logger.debug("=======er===========",err);
            sendResponse.somethingWentWrongError(res);
        }
    })
}


function generateRandomString() {
    return new Promise((resolve,reject)=>{
        var generatedText = "";
        var text = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
        for (var i = 0; i < 6; i++) {
            generatedText += text.charAt(Math.floor((Math.random() * text.length)));
        }
        resolve(generatedText);
    })
}


/*
 * This function is used to make an entry in supplier table
 * at the time of supplier reg.
 */
function registerSupplierV1(dbName,res,supplierName, supplierEmail,
     supplierMobileNo, supplierAddress,
    password,latitude,longitude,commission,
    pickupCommision,is_active,self_pickup,country_code,iso,is_multibranch,license_number,
    description,brand,linkedin_link,facebook_link,nationality,speciality,documents,
    federal_number,user_service_fee,
    home_chef_orignal_name,
    home_address,
    license_issue_date,
    license_end_date,
    license_document,is_dine_in,license_number) {
    return new Promise(async(resolve,reject)=>{

    var randomize = require('randomatic');
    let  user_created_id =  randomize('A0', 30);
        try{
            var sql = ` insert into supplier(name,email,mobile_number_1, 
                address,password,created_by,latitude,longitude,commission,
                pickup_commission,is_active,self_pickup,country_code,iso,is_sponser, 
                license_number,description,brand,linkedin_link,facebook_link,nationality, 
                speciality,documents,user_created_id,federal_number,user_service_charge,
                home_chef_orignal_name,home_address,license_issue_date,
                license_end_date,license_document,is_dine_in)values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
            
                var params = [supplierName, supplierEmail,
                supplierMobileNo, supplierAddress,password,"0",latitude,longitude,commission,
                pickupCommision,is_active,self_pickup,country_code,iso,is_multibranch,license_number,
                description,brand,linkedin_link,facebook_link,nationality,
                speciality,documents,user_created_id,federal_number,user_service_fee,
                home_chef_orignal_name,
                home_address,
                license_issue_date,
                license_end_date,
                license_document,is_dine_in]
            let result = await ExecuteQ.Query(dbName,sql,params);
            resolve(result.insertId)

        }catch(err){
            logger.debug("============er=========",err);
            sendResponse.somethingWentWrongError(res);
        }
    })
}

function addSupplierAdmin(dbName,email,password,phone_number,is_superadmin,created_by_clikat,
    access_token,supplier_id,is_active){
    return new Promise(async(resolve,reject)=>{
        try{
            let sql = "insert into supplier_admin(email,password,phone_number,is_superadmin, "+
            "created_by_clikat,access_token,supplier_id,is_active)values(?,?,?,?,?,?,?,?)";
            let params = [email,password,phone_number,is_superadmin,created_by_clikat,
                access_token,supplier_id,is_active]
            let result = await ExecuteQ.Query(dbName,sql,params)
            resolve(result.insertId)

        }catch(e){
            logger.debug("============e========",e);
            reject(e)
        }
    })
}


makeQueryStringForSupplierRegisterApiS = function(categoryJSON,id){

return new Promise(async(resolve,reject)=>{
    try{
        console.log("dfjdfjdbfjdf",JSON.parse(categoryJSON),id);
    
        categoryJSON = JSON.parse(categoryJSON);
        console.log("length",categoryJSON.length)
        var values = [];
        var insertLength = "(?,?,?,?),";
        var querystring = '';
        if(categoryJSON && categoryJSON.length>0){
        for(var i = 0 ; i < categoryJSON.length ;i++)
        {
            (function(i)
            {
                var categoryId = categoryJSON[i].id;
                var subCategoryData = categoryJSON[i].data;
                var subCategoryLength = subCategoryData.length;
                console.log("==subCategoryLength==subCategoryData=",categoryId,subCategoryLength,subCategoryData)
                if(subCategoryLength>0)
                {
                    for(var j = 0 ; j < subCategoryLength;j++)
                {
                    (function(j)
                    {
                        var subCategoryId = subCategoryData[j].id;
                        var detailedSubCategoryData = subCategoryData[j].data;
                        var detailedSubCategoryLength = detailedSubCategoryData .length;
                        console.log("==detailedSubCategoryLength=detailedSubCategoryData=",detailedSubCategoryLength,detailedSubCategoryData)
                        if(detailedSubCategoryLength>0){
                        for(var k = 0 ; k < detailedSubCategoryLength ; k++)
                        {
                            (function(k)
                            {
                                var detailedSubCategoryId = detailedSubCategoryData[k].id;
                                values.push(id,categoryId,subCategoryId,detailedSubCategoryId);
                                querystring += insertLength;
                                console.log("value",values)
                                if(i == categoryJSON.length - 1 && j == subCategoryLength - 1 && k == detailedSubCategoryLength - 1)
                                {
                                    querystring = querystring.substring(0, querystring.length - 1);
                                    console.log("dfsdfdjfdfdfdf")
                                    resolve({values:values,querystring:querystring});
                                }
    
                            }(k))
                        }}
                        else{
    
    
                            querystring += insertLength;
                            values.push(id,categoryId,subCategoryId,0);
    
                            if(i == categoryJSON.length - 1 && j == subCategoryLength - 1){
    
                                 querystring = querystring.substring(0, querystring.length - 1);
    
                                 logger.debug("=========================values==========",)
                                 resolve({values:values,querystring:querystring});
                            }
                        }
    
                    }(j))
    
                }
            }
            else{
                querystring += insertLength;
                values.push(id,categoryId,0,0);
                if(i == categoryJSON.length - 1){
                    querystring = querystring.substring(0, querystring.length - 1);
                    console.log("===DF=Values===",values,querystring)
                    resolve({values:values,querystring:querystring});
               }
            }
    
            }(i))
    
        }
    }
    else{
        values.push(id,0,0,0);
        resolve({values:values,querystring:"(?,?,?,?)"});
    }
    }catch(e){
        logger.debug("===============errr===========",e);
        reject(e)
    }
})
}

/*
 * This function is used to insert multiple
 * category of a supplier at the time of
 * supplier reg
 */
function insertSupplierInSupplierCategory(dbName,querystring, values) {
        return new Promise(async(resolve,reject)=>{
            console.log("===========values===values=============",values);
            if(values && values.length>0){
                var sql = "insert into supplier_category(supplier_id,category_id,sub_category_id,detailed_sub_category_id) values" + querystring;
                await ExecuteQ.Query(dbName,sql,values);
            }
            resolve();            
        })
 }

 function insertNameInMultiLanguage(dbName,supplierName, languageId, 
    supplierInsertId, address) {
        return new Promise(async(resolve,reject)=>{
            var sql = "insert into supplier_ml(name,address,language_id,supplier_id) values(?,?,?,?) ";
            multiConnection[dbName].query(sql, [supplierName, address, languageId, supplierInsertId], function (err, result) {
                console.log("fdhbgfnjmhmfnhmghmgmgjmgh",err);
        
                var sql = "insert into supplier_ml(name,address,language_id,supplier_id) values(?,?,?,?) ";
                multiConnection[dbName].query(sql, ["", "", 15, supplierInsertId], function (err, result) {
                   if(err){
                       reject(err);
                   }else{
                       resolve();
                   }
         
                })
        
            })
        })
}

function updateSupplierSummary(dbName,res,supplierId){
    return new Promise(async(resolve,reject)=>{
        try{
            var deliveryMinTime = 15,deliveryMaxTime=15,deliveryPriorDays=0,deliveryPriorTime=0,urgentDeliveryTime=30;
            var deliveryPriorTotalTime = parseInt(deliveryPriorTime) + parseInt(deliveryPriorDays)*24*60;        
        
        
            var updateValues = [deliveryMinTime, deliveryMaxTime, deliveryPriorDays, 
            deliveryPriorTime, urgentDeliveryTime, deliveryPriorTotalTime, supplierId];
        
            var timings =
            [
        
                {  "supplier_id": supplierId, "week_id": 0, "week": "mon", "start_time": "00:00:00", "end_time": "23:59:59", "is_open": 1 },
                {  "supplier_id": supplierId, "week_id": 1, "week": "tue", "start_time": "00:00:00", "end_time": "23:59:59", "is_open": 1 },
                {  "supplier_id": supplierId, "week_id": 2, "week": "wed", "start_time": "00:00:00", "end_time": "23:59:59", "is_open": 1 },
                {  "supplier_id": supplierId, "week_id": 3, "week": "thu", "start_time": "00:00:00", "end_time": "23:59:59", "is_open": 1 },
                {  "supplier_id": supplierId, "week_id": 4, "week": "fri", "start_time": "00:00:00", "end_time": "23:59:59", "is_open": 1 },
                {  "supplier_id": supplierId, "week_id": 5, "week": "sat", "start_time": "00:00:00", "end_time": "23:59:59", "is_open": 1 },
                {  "supplier_id": supplierId, "week_id": 6, "week": "sun", "start_time": "00:00:00", "end_time": "23:59:59", "is_open": 1 }
            ]
        
                await updateSupplierDeliveryTime(dbName,res,updateValues)
                await updateSupplierWorkingHours(dbName,res,timings,supplierId);
                resolve();
        }catch(e){
            logger.debug("========e==========",e);
            sendResponse.somethingWentWrongError(res);
        }
    })
}

function updateSupplierDeliveryTime(dbName,res,updateValues)
{
    return new Promise(async(resolve,reject)=>{
        var sql = "update supplier set delivery_min_time = ?,delivery_max_time = ?,delivery_prior_days = ?,delivery_prior_time ";
        sql +=" = ? ,urgent_delivery_time = ?,delivery_prior_total_time = ? where id = ? limit 1";
        multiConnection[dbName].query(sql,updateValues,function(err,result)
        {
            if(err){
                sendResponse.somethingWentWrongError(res);
            }
            else{
               resolve();
            }
    
        })
    })

}

function updateSupplierWorkingHours(dbName,res,timings,supplierId)
{
    return new Promise(async(resolve,reject)=>{
        try{
            logger.debug("....s....",timings)
            var day = moment().isoWeekday();
            day=day-1;
            var j=0;
            var timingsJSON = timings
            var jsonLength = timingsJSON.length;
            var status =0;
            logger.debug("....length....",jsonLength);
        
                 for(var i=0;i<jsonLength;i++){
                     (function (i) {
                         var sql = "insert into supplier_timings(supplier_id,week_id,start_time,end_time,is_open) values(?,?,?,?,?)";
                         multiConnection[dbName].query(sql,[supplierId,timingsJSON[i].week_id,timingsJSON[i].start_time,timingsJSON[i].end_time,timingsJSON[i].is_open],function(err,result)
                         {
                             if(err){
                                 logger.debug("error in updating timings",err);
                                 sendResponse.somethingWentWrongError(res)
                             }
                             else {
                                 if(day == timingsJSON[i].week_id){
                                     status =timingsJSON[i].week_id
                                     if(i == (jsonLength-1))
                                     {
                                         resolve();
                                     }
                                 }
                                 else {
                                     if(i == (jsonLength-1))
                                     {
                                         resolve();
                                     } 
                                 }
        
                             }
                         })
                     }(i))
                 }
        }catch(e){
            logger.debug("=====e======",e)
            sendResponse.somethingWentWrongError(res)
        }
    })
}

function createSupplierDefaultBranch(dbName,res,supplierId,supplierName,
    supplierAddress,supplierMobileNO,supplierEmail,latitude,longitude,password2,
    commission){
    return new Promise(async(resolve,reject)=>{
        try{
            var sql = "insert into supplier_branch(supplier_id,name,branch_name,phone,mobile_1,mobile_2,email,address,is_head_branch,latitude,longitude,is_live,password,commission) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
            var stmt=multiConnection[dbName].query(sql,[supplierId,supplierName,supplierName,supplierMobileNO,supplierMobileNO,supplierMobileNO,supplierEmail,supplierAddress,1,latitude,longitude,1,password2,commission],function(err,result){
                console.log("============errr============",err,stmt.sql,result)
                if(err){
                    logger.debug("============e======+",err)
                    sendResponse.somethingWentWrongError(res)
                }else{
                   resolve(result.insertId)
                }
            })    
        }catch(e){
            logger.debug("+++++++=====================e====",e);
            sendResponse.somethingWentWrongError(res);
        }
    })
}

function createSupplierDefaultBranchMl(dbName,res,supplierName,supplierAddress,
    supplierBranchId){
        return new Promise(async(resolve,reject)=>{
            var sql1 = "insert into supplier_branch_ml(name,branch_name,language_id,supplier_branch_id,address) values(?,?,?,?,?)"
            var stmt = multiConnection[dbName].query(sql1,[supplierName,supplierName,14,supplierBranchId,supplierAddress],function(err,result1){
                logger.debug("============errr============",err,result1)
                if(err){
                    logger.debug("===========err========+",err);
                    sendResponse.somethingWentWrongError(res);
                }else{
                    var sql2 = "insert into supplier_branch_ml(name,branch_name,language_id,supplier_branch_id,address) values(?,?,?,?,?)"
                    var stmt=multiConnection[dbName].query(sql2,[supplierName,supplierName,14,supplierBranchId,supplierAddress],function(err,result2){
                        logger.debug("============qeru==========",stmt.sql2,err)
                        if(err){
                            logger.debug("===========err========+",err);
                            sendResponse.somethingWentWrongError(res);
                        }else{
                            resolve(result2.insertId)
                        }
                    })            
                }
            })
        })
}
const finalCatData=(dbName,parentId,data,supplierId)=>{
    // logger.debug("=====DATA!=",parentId,data)
    let nthleveData=data;
    let returnJson,insertedValues=[],insertLength="(?,?,?,?),",querystring='';
    return new Promise((resolve,reject)=>{
        for (const j of data) {
                if(j.data && j.data.length>0){
                    returnJson= makingSupplierQuery(dbName,parentId,0,nthleveData,supplierId); 
                    logger.debug("====nthLevel==returnJson==>>",returnJson);
                    insertedValues=returnJson.values;
                    querystring=returnJson.querystring;
                }
                else{
                    logger.debug("===Upto=2nd=Level==>>>",parentId,j);
                    querystring+=insertLength;
                    insertedValues.push(supplierId,parentId,j.id,0);
                }
        }
        logger.debug("====AFTER-LOOP=>>>",querystring);
        resolve({insertedValues:insertedValues,querystring:querystring});
    })
}
function makingSupplierQuery(dbName,parentId,id, data,supplierId) {
    async function getNestedChildren(dbName,parentId,id, data,supplierId) {
        for(const [inedx,i] of data.entries()) {
            // logger.debug("===arr[i].data=",parentId,i.data);
            if(i.data && i.data.length>0) {
                logger.debug("=====inex=call=>>",inedx,id,i.data);
                getNestedChildren(dbName,parentId,i.id, i.data,supplierId);
            }
            else{
                logger.debug("====3rd Level",parentId,id,i.data)
            }
        }
        logger.debug("====Lst1 Level",parentId,id,data)
        if(id!==0){
            querystring+=insertLength;
            logger.debug("====Lst2 Level",data[0].data)
            if(data[0].data.length<=0){
                logger.debug("=====ENTERING==!==")
                // values.push(supplierId,parentId,id,data[0].id);
                for(const [ind,j] of data.entries()){
                    values.push(supplierId,parentId,id,j.id);
                }
            }
            
            else{
                logger.debug("==ELSE==IF")
                values.push(supplierId,parentId,id,0);
            }
            logger.debug("===arr[i].data3===",values,querystring);
        }
    }
    var values = [],insertLength="(?,?,?,?),",querystring='';
    getNestedChildren(dbName,parentId,id, data,supplierId);

    return {values:values,querystring:querystring};
}

//  function getNestedChildrenIds(arr, parent) {
//     async function getNestedChildreK(arr, parent){
//     for([inedx,i] of arr.entries()) {
//         if(i.parent_id == parent) {
//             logger.debug("=====",i.id)
//             outIds.push(i.id)
//             getNestedChildreK(arr, i.id);
//         }
//     }
// }
// var outIds = [];
// getNestedChildreK(arr,parent);
// return {ids:outIds};
// }
const getExistingUrlsFromXml=(urls)=>{
    const convert = require('xml-js'),
    options = { compact: true, ignoreComment: true, spaces: 4 };
    let fs=require('fs');
    return new Promise((resolve,reject)=>{
        fs.readFile('./sitemaps.xml-0.xml', (err, data) => {
            if (data) { 
              const existingSitemapList = JSON.parse(convert.xml2json(data,    options));
              let newUrlS=existingSitemapList.urlset.url.push(
                urls
                );
            logger.debug("==existingSitemapList===>>",existingSitemapList,existingSitemapList.urlset.url[0])
            resolve(existingSitemapList);
            }
            else{
                resolve({})
            }
          });
    })
}
const successUrl=async (req,res)=>{
    try{  
        // {
        //     loc: {
        //         _text: "http://example.com/supplier/dummy-list",
        //     },
        //     changefreq: {
        //         _text: 'weekly'
        //     },
        //     }
        const convert = require('xml-js'),
        options = { compact: true, ignoreComment: true, spaces: 4 };
        let fs=require('fs');
        let existinData=await getExistingUrls();
        const finalXML = convert.json2xml(existinData, options); // to convert json text to xml text
        logger.debug("=====existingData!==",finalXML);
        fs.writeFile('./sitemaps.xml-0.xml', finalXML, (err) => {
            if (err) {
             return console.log(err);
            }
             console.log("The file was saved!");
           });
        // fs.readFile('./sitemaps.xml-0.xml', (err, data) => {
        //     if (data) { 
        //       const existingSitemapList = JSON.parse(convert.xml2json(data,    options));
        //       let newUrlS=existingSitemapList.urlset.url.push(
        //         {
        //         loc: {
        //             _text: "http://example.com/supplier/dummy-list",
        //         },
        //         changefreq: {
        //             _text: 'weekly'
        //         },
        //         });

        //       logger.debug("==existingSitemapList===>>",existingSitemapList.urlset.url[0])
        //     }
        //   });
        //   const finalXML = convert.json2xml(newUrlsList, options); // to convert json text to xml text
//         const { createReadStream, createWriteStream } = require('fs');
// const { resolve } = require('path');
// const { createGzip } = require('zlib')
// const {
//   SitemapAndIndexStream,
//   SitemapStream
// } = require('sitemap')
 
// const sitemap = new SitemapAndIndexStream({
//   limit: 50000, // defaults to 45k
//   // SitemapAndIndexStream will call this user provided function every time
//   // it needs to create a new sitemap file. You merely need to return a stream
//   // for it to write the sitemap urls to and the expected url where that sitemap will be hosted
//   getSitemapStream: (i) => {
//       logger.debug("==I",i)
//     const sitemapStream = new SitemapStream({ hostname: 'https://yammfood.royoapps.com' });
//     const path = `./yammfood_sitemaps-0.xml`;
//     return [new URL(path, 'https://yammfood.royoapps.com/').toString(), sitemapStream];
//   },
// });
 
// sitemap.write({ url: '/page-1/', changefreq: 'daily', priority: 0.3 })
// sitemap.end()
// streamToPromise(sitemap).then(buffer => console.log(buffer.toString())) 
        // const { createReadStream, createWriteStream } = require('fs');
        // const { XMLToSitemapItemStream, ObjectStreamToJSON } = require('sitemap');
        // const { SitemapStream, streamToPromise } = require( 'sitemap' )
        // createReadStream('./sitemaps.xml')
        // // turn the xml into sitemap option item options
        // .pipe(new XMLToSitemapItemStream())
        // // convert the object stream to JSON
        // .pipe(new ObjectStreamToJSON())
        // // write the library compatible options to disk
        // .pipe([{ url: '/page-1/', changefreq: 'daily'}])
    //     let subCate=await ExecuteQ.Query(req.dbName,`select id,parent_id from categories where parent_id!=? and is_deleted=?`,[0,0])
      
    //     logger.debug("=subCate==",subCate)
    //     let subIdsUptoNthLevel= UniversalFunction.getNestedChildrenIds(subCate,1)
    //     // let ids=await UniversalFunction.getNthLevelAllCategoryIds(req.dbName,subCate);
    //    logger.debug("===Ids=>>",subIdsUptoNthLevel);

        // let cateData='[{"id":87,"data":[{"id":95,"data":[{"id":96,"data":[{"id":97,"data":[{"id":98,"data":[]}]}]}]}]}]'
        // let subCateData='[{"id":2,"data":[{"id":20,"data":[]},{"id":21,"data":[]},{"id":28,"data":[]},{"id":29,"data":[]}]},{"id":7,"data":[{"id":28,"data":[]},{"id":29,"data":[]}]}]'
        // let detal='[{"id":2,"data":[{"id":20,"data":[]},{"id":21,"data":[]},{"id":22,"data":[]}]}]';
        // let singleCat='[{"id":90,"data":[{"id":91,"data":[{"id":92,"data":[]},{"id":93,"data":[]}]}]}]' 
        // let dlData='[{"id":90,"data":[{"id":91,"data":[{"id":92,"data":[]},{"id":93,"data":[]},{"id":94,"data":[]}]}]}]'
        // let mCate='[{"id":44,"data":[]},{"id":43,"data":[]},{"id":42,"data":[]}]'

        // let cateArrayData=JSON.parse(mCate);
        // let supplierId=0;
        // let insertedValue=[];
        // var insertLength = "(?,?,?,?),",querystring='';
        // for (const [index,i] of cateArrayData.entries()){
        //             if(i.data && i.data.length>0){
        //               let returnJSON=  await Universal.nthLevelCategoryQueryString(req.dbName,i.id,i.data,supplierId);
        //               insertedValue=returnJSON.insertedValues;
        //               querystring=returnJSON.querystring;
        //               logger.debug("===FINAL==returnJSON==>>",returnJSON);
        //             }
        //             else{
        //                 querystring+=insertLength;
        //                 insertedValue.push(supplierId,i.id,0,0);
        //                 logger.debug("===1St=Level==>>",insertedValue)
        //             }
        //             if(index==cateArrayData.length-1){
        //                 querystring=querystring.substring(0, querystring.length - 1);
        //             }
        // }
        // logger.debug("=====>>",querystring,insertedValue)
        // let dhlShipData=await Universal.getDhlKeyData(req.dbName);
        // logger.debug("======dhlShipData==>>",dhlShipData);
        // let dhlData={
        //     "customerEkp": "9012345678",
        //     "orderStatus": "FINALIZE",
        //     "paperwork": {
        //       "contactName": "Max Mustermann",
        //       "awbCopyCount": 3,
        //       "jobReference": "Job ref",
        //       "pickupType": "CUSTOMER_DROP_OFF",
        //       "pickupLocation": "Mustergasse 12",
        //       "pickupDate": "2019-01-02",
        //       "pickupTimeSlot": "MIDDAY",
        //       "telephoneNumber": "+4935120681234"
        //     },
        //     "items": [
        //       {
        //         "product": "GPP",
        //         "serviceLevel": "PRIORITY",
        //         "recipient": "Alfred J. Quack",
        //         "addressLine1": "Mustergasse 12",
        //         "city": "Dresden",
        //         "destinationCountry": "DE",
        //         "id": 1,
        //         "custRef": "REF-2361890-AB",
        //         "recipientPhone": "+4935120681234",
        //         "recipientFax": "+4935120681234",
        //         "recipientEmail": "alfred.j.quack@somewhere.eu",
        //         "addressLine2": "Hinterhaus",
        //         "addressLine3": "1. Etage",
        //         "state": "Sachsen",
        //         "postalCode": "01432",
        //         "shipmentAmount": 100,
        //         "shipmentCurrency": "EUR",
        //         "shipmentGrossWeight": 1500,
        //         "returnItemWanted": false,
        //         "shipmentNaturetype": "GIFT"
        //       }
        //     ]
        //   }
        //   await Universal.addOrderInDhForShipping(dhlShipData,dhlData);
          
          sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch(Err){
        console.log("=ERR==",Err)
        sendResponse.somethingWentWrongError(res);
    }
}
const successSadded=async (request,reply)=>{
    const { createReadStream, createWriteStream } = require('fs');
        const { resolve, parse } = require('path');
        const { createGzip } = require('zlib')
        const {
            SitemapAndIndexStream,
            SitemapStream,
            lineSeparatedURLsToSitemapOptions 
          } = require('sitemap')
          const sms = new SitemapAndIndexStream({
            limit: 50000, // defaults to 45k
            // SitemapAndIndexStream will call this user provided function every time
            // it needs to create a new sitemap file. You merely need to return a stream
            // for it to write the sitemap urls to and the expected url where that sitemap will be hosted
            getSitemapStream: (i) => {

              const sitemapStream = new SitemapStream({ hostname: 'https://example.com' });
              const path = `./sitemap-${i}.xml`;
           
              sitemapStream
                .pipe(createGzip()) // compress the output of the sitemap
                .pipe(createWriteStream(resolve(path + '.gz'))); // write it to sitemap-NUMBER.xml
           
              return [new URL(path, 'https://example.com/subdir/').toString(), sitemapStream];
            },
          });
            // let twilioata=await Universal.getTwilioData(request.dbName);
            // let web_request=require('request');
            // let OtpVerification = await Universal.disableOtpVerification(request.dbName);
            // let muthofunData=await Universal.getMuthoFunData(request.dbName);
            // logger.debug("====twilioata=======muthofunData=",muthofunData,muthofunData["muthofun_username"],muthofunData["muthofun_password"])
            // let message="Hi,Test SmS by Nitin!!"
            // logger.debug("=========TWilio==DATA!=========>>");
            // if(OtpVerification && OtpVerification.length>0){
            //     otp= 12345;
            //     callback(null);
            // }
            // else if(Object.keys(muthofunData).length>0){
            //     var options = {
            //         method: 'GET',
            //         url: "http://clients.muthofun.com:8901/esmsgw/sendsms.jsp?user="+muthofunData["muthofun_username"]+"&password="+muthofunData["muthofun_password"]+"&mobiles=+8801772333444&sms="+message+""
            //     };
            //     logger.debug("===options===",options)
            //     web_request(options, function (err, body) {
            //         logger.debug("==muthofun======",err,body)

            //     })

            // }
            // else{
            //     // if(Object.keys(twilioata).length>0 ){
            //     //     var client = require('twilio')(twilioata[config.get("twilio.s_id")],twilioata[config.get("twilio.auth_key")]);
            //     //     var smsOptions = {
            //     //         from: twilioata[config.get("twilio.number_key")],
            //     //         To: countryCode + mobileNumber.toString(),
            //     //         Body: "Hi there, Your One Time Password is : "+otp
            //     //     };
            //     //     client.messages.create(smsOptions, function (err, message) {
            //     //         logger.debug("=========Twilio==ER!==",err,message)
            //     //         callback(null);
            //     //     });
            //     // }
            //     // else{
            //     //     otp = 12345;
            //     //     callback(null);
            //     // }
            // }

    // emailTemp.supplierNewOrder(request,reply,[{"image_path":"sda","name":"test","quantity":9,"price":100},{"image_path":"sda","name":"test","quantity":9,"price":100}],"durngal@gmail.com",
    // "durngal@gmail.com",1,"supplierName","userName","mobileNumber","area",
    // "landmark","houseNumber[0]","address_link","building",100,"created_on","schedule_date",
    // "payment_type","deliveryCharges","handling","urgent_price","quantity",function(err,result){
    //     if(err){
    //         console.log("..****fb register email*****....",err);
    //     }
    //     else{
    //         reply.redirect('http://yammfood.royoapps.com')
    //     }
    // })
    // emailTemp.cancelOrderByUser(request,reply,"durngal@gmail.com",
    // "durngal@gmail.com",1,"supplierName","userName","mobileNumber","area",
    // "landmark","houseNumber[0]","address_link","building",100,"created_on","schedule_date",
    // "payment_type",function(err,result){
    //     if(err){
    //         console.log("..****fb register email*****....",err);
    //     }
    //     else{
    //         reply.redirect('http://yammfood.royoapps.com')
    //     }
    // })
    // emailTemp.orderRejections(request,request.dbName,reply,"durngal@gmail.com",
    // "dTest",100,"placeDate","deliveryDate","orderId","supplierNameEnglish",
    // "supplierNameArabic","paymentMethod","durngal@gmail.com",14,
    // function(err,result){
    //     if(err){
    //         console.log("..****fb register email*****....",err);
    //     }
    //     else{
    //         reply.redirect('http://yammfood.royoapps.com')
    //     }
    // })
    // emailTemp.UserFirstOrder(request,reply,"durngal@gmail.com",
    // 100,"usenrName","userMobile","area","landmark",
    // "building","house",
    // function(err,result){
    //     if(err){
    //         console.log("..****fb register email*****....",err);
    //     }
    //     else{
    //         reply.redirect('http://yammfood.royoapps.com')
    //     }
    // })
// emailTemp.supplierResetpassword(request,reply,"durngal@gmail.com",
//     "supplierName","password",
//     function(err,result){
//         if(err){
//             console.log("..****fb register email*****....",err);
//         }
//         else{
//             reply.redirect('http://yammfood.royoapps.com')
//         }
//     })

    // emailTemp.supplierNewRegisteration(request,reply,"durngal@gmail.com"
    // ,"password",
    // function(err,result){
    //     if(err){
    //         console.log("..****fb register email*****....",err);
    //     }
    //     else{
    //         reply.redirect('http://yammfood.royoapps.com')
    //     }
    // })
    
    // emailTemp.userRegister(request,reply,"durngal@gmail.com","details.firstname",'',"durngal@gmail.com",14,"dbConnection",function(err,result){
    //     if(err){
    //         console.log("..****register email*****....",err);
    //     }
    // })

           
}
const savePushNotificationOfAgent = async(req,res)=>{
    try{
        let order_id = req.body.order_id
        let status = req.body.status
        let message = req.body.message
        let query = "select o.user_id,sb.supplier_id from orders o "
        query += " join supplier_branch sb on sb.id = o.supplier_branch_id "
        query += " where o.id = ?"
        let params1 = [order_id]

        let data = await ExecuteQ.Query(req.dbName,query,params1);

        var sql1 = "insert into push_notifications(user_id,supplier_id,order_id,notification_message,notification_status,is_admin) values(?,?,?,?,?,?) ";
        let params2 = [data[0].user_id, data[0].supplier_id, order_id, message, status,0]
        await ExecuteQ.Query(req.dbName,sql1,params2);

        // var sql2 = "insert into push_notifications(user_id,supplier_id,order_id,notification_message,notification_status,is_supplier) values(?,?,?,?,?,?) ";
        // let params3 = [data[0].user_id, data[0].supplier_id, order_id, message, status,1]
        // await ExecuteQ.Query(req.dbName,sql2,params3);
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);


    }catch(err){
        logger.debug("======er=======",err);
        return sendResponse.sendErrorMessage("something went wrong!",res,400);
    }
}

/**
 * @desc Used for sending fcm to admin
 * @param {*Object} req 
 * @param {*Object} res 
 */
const lib = require('../../lib/NotificationMgr');
const { agents } = require('../../Model/');
const sendSosFcmToAdmin = async (req,res)=>{
    try{
        let user_id = req.body.user_id
        let device_type = req.body.device_type
        let latitude = req.body.latitude==undefined?0:req.body.latitude
        let longitude = req.body.longitude==undefined?0:req.body.longitude
        let order_id = req.body.order_id==undefined?0:req.body.order_id
        let address = req.body.address==undefined?"":req.body.address
        let fcmToken = [];
        let query = "select * from user where id=?";
        let params = [user_id];
        let result = await ExecuteQ.Query(req.dbName,query,params);


        logger.debug("============body========",
        user_id,device_type,latitude,longitude,order_id)

        let adminData=await ExecuteQ.Query(req.dbName,
            "select `fcm_token`,`email`,`id` from admin where is_active=1 and fcm_token!=? ",["0"])

            adminData.forEach(element => {
                fcmToken.push(element.fcm_token)
            });

            var data = {
                "type":"sos",
                "status": 0,
                "message":"User SOS Notification, Please take an action",
                "device_type":device_type,
                "user_id":user_id
            }
    
            await lib.sendFcmPushNotification(fcmToken, data,req.dbName);

            await saveSosNotification(req.dbName,
            "User SOS Notification, Please take an action",
            0,user_id,device_type,latitude,longitude,data.type,order_id,address);

        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
              }
    catch(err){
        logger.error(err)
        sendResponse.somethingWentWrongError(res)
    }
}



const updateSosNotificationStatus = async (req,res)=>{
    try{
        let status = req.body.status
        let id = req.body.id

        var sql = "update push_notifications set notification_status=? where id=?";
        let params = [status,id];

        await ExecuteQ.Query(req.dbName,sql,params);

        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
              }
    catch(err){
        logger.error(err)
        sendResponse.somethingWentWrongError(res)
    }
}

const saveSosNotification = function(dbName,message,status,user_id,
    device_type,latitude,longitude,type,order_id,address){
    return new Promise(async(resolve,reject)=>{
        try{
                var sql = "insert into push_notifications(user_id,notification_message,notification_status,device_type,is_sos,latitude,longitude,notification_type,order_id,address) values(?,?,?,?,?,?,?,?,?,?) ";
                let params = [user_id, message, status,device_type,1,latitude,longitude,type,order_id,address]

                await ExecuteQ.Query(dbName,sql,params);
                resolve()
            
        }catch(e){
            logger.debug(e);
            resolve()
        }
    })
}


const sosNotificationListing = async (req,res)=>{
    try{
        let limit = parseInt(req.query.limit)
        let offset = parseInt(req.query.offset)

        let query = "SELECT pn.latitude,pn.longitude,pn.order_id,pn.notification_message,pn.notification_status,pn.id,u.id as user_id,pn.device_type,u.firstname as user_name,";
        query += " u.email,u.mobile_no from push_notifications pn";
        query += " join user u on u.id = pn.user_id where is_sos=1 order by pn.id desc limit ?,?";
        let params = [offset,limit];
        let result = await ExecuteQ.Query(req.dbName,query,params);

        let query1 = "SELECT pn.id,u.id as user_id,pn.device_type,u.firstname as user_name,";
        query1 += " u.email,u.mobile_no from push_notifications pn";
        query1 += " join user u on u.id = pn.user_id where is_sos=1  order by pn.id desc";
        let params1 = [offset,limit];
        let result1 = await ExecuteQ.Query(req.dbName,query1,params1);
        
        let data = {
            list:result,
            count:result1 && result1.length>0?result1.length:0
        }

        sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, 200);
              }
    catch(err){
        logger.error(err)
        sendResponse.somethingWentWrongError(res)
    }
}

const getRequestDataEvryClient=(req,res)=>{
    try{
                let globlalConn=mongoConnection.db;
                let startDate=req.query.startDate || "1991-01-01";
                let endDate=req.query.endDate || "2090-12-12";
                let mDbConnection=globlalConn.db(config.get('mongoDb.database'));
                const  collectionName= mDbConnection.collection('client_request_data');
               

                collectionName.aggregate([
                    { "$project": {
                        "createdOns": { 
                            "$dateToString": { 
                                    "format": "%Y-%m-%d", 
                                    "date": "$createdOn" 
                            } 
                        },
                        "_id": 1,
                        "apiPath":1,
                        "clientCode":1
                    } },
                    {
                        $match : { "createdOns": { $gte: startDate, $lte: endDate} }
                      },
                    {
                        "$group": {
                            "_id": {
                                "clientCode": "$clientCode",
                                "apiPath": "$apiPath"
                            },
                            "totalAPICount": {
                                "$sum": 1.0
                            }
                        }
                    }, 
                    {
                        "$group": {
                            "_id": "$_id.clientCode",
                            "apiPath": {
                                "$push": {
                                    "path": "$_id.apiPath",
                                    "hit": "$totalAPICount"
                                }
                            },
                            "totalApiHit": {
                                "$sum": "$totalAPICount"
                            }
                        }
                    }
                ]).toArray((err, docs) => {
                    let datas=_.sortBy(docs,'totalApiHit').reverse()
                    // _.sortBy(finalResult,'commission').reverse()
                    // if(docs)
                    // if (err) {
                    //   console.log(err)
                    //   res.error(err)
                    // } else {
                        logger.debug("=collectionName==Error====>>",err,docs);
                        sendResponse.sendSuccessData({result:datas}, constant.responseMessage.SUCCESS, res, 200); 
                        // if (error) return process.exit(1);
                        // callback(result);
                        // next()
                    // }
                }
                    );
             
    }
    catch(Err){
        logger.debug("========error in BrandListAccCat==========================",Err);
        sendResponse.somethingWentWrongError(res);
    }
}



const getTwilioMaskedPhoneNumber = async (req,res)=>{
    try{


        let agentId = req.body.agentId;
        let userId = req.body.userId;

        let agentDbData = await AgentCommon.GetAgentDbInformation(req.dbName);
        let agentConnection = await AgentCommon.RunTimeAgentConnection(agentDbData);

        let userDetails = await Models.users.getUserDetailsById(req.dbName,userId);
        let agentDetails = await Models.agents.getAgentDetailsById(agentConnection,agentId);

        let twilioData = await Universal.getTwilioData(req.dbName);



        logger.debug("===============userDetails===========",userDetails)
        logger.debug("===============agentDetails===========",agentDetails)

        let userPhoneNumber = (userDetails.countryCode).toString()+(userDetails.phoneNumber).toString();
        let agentPhoneNumber = (agentDetails.countryCode).toString()+(agentDetails.phoneNumber).toString();




        logger.debug("===============userPhoneNumber===========",userPhoneNumber)
        logger.debug("===============agentPhoneNumber===========",agentPhoneNumber)

        if(Object.keys(twilioData).length>0){
            
        // let sessionUniqueName  = userDetails.name +"_" + agentDetails.name
        //     "_" + randomString.generate({
        //         length: 10,
        //         charset: 'alphanumeric'
        //       }).toUpperCase();

        let sessionUniqueName  =  randomString.generate({
                length: 10,
                charset: 'alphanumeric'
              }).toUpperCase();

            logger.debug("===============twillio data===========",
            twilioData,sessionUniqueName)

        let sessionData = await numberMasking.createProxyServiceSession(twilioData.account_sid,
                twilioData.auth_token,twilioData.twillio_service_sid,sessionUniqueName,res);

        let participantUser = await numberMasking.createProxyServiceParticipant(
                    twilioData.account_sid,
                    twilioData.auth_token,
                    twilioData.twillio_service_sid,
                    sessionData.sid,
                    userDetails.name,
                    userPhoneNumber,
                    res);

        let participantAgent = await numberMasking.createProxyServiceParticipant(
                    twilioData.account_sid,
                    twilioData.auth_token,
                    twilioData.twillio_service_sid,
                    sessionData.sid,
                    agentDetails.name,
                    agentPhoneNumber,
                    res);

                    let participants = {
                        participantUser:participantUser,
                        participantAgent:participantAgent
                    }
            
            
        sendResponse.sendSuccessData(participants, constant.responseMessage.SUCCESS, res, 200);
       
    }else{
            let errorMessge = "twilio keys not found";
            sendResponse.sendErrorMessage(errorMessge,res,400);
        }
    }
    catch(err){
        logger.error("======err=======",err)

        let participants = {
            participantUser:{
                proxyIdentifier:""
            }

        }

        sendResponse.sendSuccessData(participants, constant.responseMessage.SUCCESS, res, 200);
           }
}


const commonSecretKey = async function (req, res) {
    req.dbName=config.get('databaseSettings.database');
    logger.debug("=========>>",req.dbName);
    let fData = await ExecuteQ.Query(req.dbName,'select `key`,`value` from tbl_setting where `key`=?',["featureData"])
    let featureData=fData && fData.length>0?JSON.parse(fData[0].value):[]
    var latitude = 0
    let self_pickup=0;
    var longitude = 0
    var supplierName = " "
    let version=Universal.getVersioning(req.path);
    const screen=await screenFlow(req.dbName);
    var supplier_id = 0,supplier_branch_id=0;
    if(screen && screen.length>0 && parseInt(screen[0].is_single_vendor)==1){
        supplier_id = await getSupplierId(req.dbName);
        latitude = supplier_id[0].latitude;
        self_pickup=supplier_id[0].self_pickup;
        longitude = supplier_id[0].longitude;
        supplierName = supplier_id[0].name;
        supplier_id = supplier_id[0].supplier_id;
        supplier_branch_id=await getSupplierBranchId(req.dbName,supplier_id);
    }
    const booking=await bookingFlow(req.dbName);
    const adminDetails = await getDefaultAdminDetails(req.dbName);
    const setting=await gettSetting(req.dbName);
    const keys_value=await keyData(req.dbName);
    const default_category=await defaultCategory(req.dbName);
    const default_address=await defaultAddress(req.dbName)
    var terms_and_conditions = await getTermsConditions(req.dbName);
    let slot_intervals = await getSlotsInterval(req.dbName)
    const white_label_data=await ExecuteQ.Query(req.dbName,"select is_white_label from check_cbl_authority limit 1",[])
 
    let data = 
    {"data":[{
        "total_days": 538,
        "uniqueId": "homent_0753",
        "business_name": "Homent",
        "is_subscribed": 0,
        "app_type": 1,
        "email": "Info@homent.app",
        "phone_number": "65522260",
        "country": "Kuwait",
        "id": 1253,
        "country_code": "965",
        "iso": "kw",
        "whatsapp_phone_number": null,
        "whatsapp_country_code": null,
        "whatsapp_iso": null,
        "cbl_customer_domains": [
          {
            "db_secret_key": "a7b56b15d4c5b0f6ede2aca2ccbe32f5",
            "agent_db_secret_key": "b56487f50fdf68455118670f2a92bd4373808ac8ac8b83d16cfdc2637f131b14",
            "admin_domain": "https://admin.homent.app",
            "supplier_domain": "",
            "site_domain": "https://homent.app",
            "bn_image": "",
            "bn_thumb": "",
            "logo_image": null,
            "logo_thumb": null
          }
        ]
      }
    ],
    "currency": [
      {
        "id": 1,
        "conversion_rate": 1,
        "currency_name": "AED",
        "currency_symbol": "AED",
        "currency_description": "",
        "country_name": null
      }],"flowData":[],
        "featureData":featureData,
        "settingsData":
        {"key_value":keys_value,"default_category":default_category,
        "supplier_branch_id":supplier_branch_id,"supplier_id":supplier_id,"screenFlow":screen,"self_pickup":self_pickup,
         "latitude":latitude,"longitude":longitude,"supplierName":supplierName,
        "bookingFlow":booking,"settingData":setting,"default_address":default_address,
        "slot_intervals":slot_intervals,
        "termsAndConditions":terms_and_conditions,"whitelabel":white_label_data,"adminDetails":adminDetails
        },
        "subscriptionData":[]
    }
    
    sendResponse.sendSuccessDataStatusCode(data, constant.responseMessage.SUCCESS, res,200);
}
const commonSecretKeyAgent = async function (req, res) {

    req.dbName=config.get('databaseSettings.database');
    logger.debug("=========>>",req.dbName);
    let fData = await ExecuteQ.Query(req.dbName,'select `key`,`value` from tbl_setting where `key`=?',["featureData"])
    let featureData=fData && fData.length>0?JSON.parse(fData[0].value):[]
    var latitude = 0
    let self_pickup=0;
    var longitude = 0
    var supplierName = " "
    let version=Universal.getVersioning(req.path);
    const screen=await screenFlow(req.dbName);
    var supplier_id = 0,supplier_branch_id=0;
    if(screen && screen.length>0 && parseInt(screen[0].is_single_vendor)==1){
        supplier_id = await getSupplierId(req.dbName);
        latitude = supplier_id[0].latitude;
        self_pickup=supplier_id[0].self_pickup;
        longitude = supplier_id[0].longitude;
        supplierName = supplier_id[0].name;
        supplier_id = supplier_id[0].supplier_id;
        supplier_branch_id=await getSupplierBranchId(req.dbName,supplier_id);
    }
    
    const booking=await bookingFlow(req.dbName);
    const adminDetails = await getDefaultAdminDetails(req.dbName);
    const setting=await gettSetting(req.dbName);
    const keys_value=await keyData(req.dbName);
    const default_category=await defaultCategory(req.dbName);
    const default_address=await defaultAddress(req.dbName)
    var terms_and_conditions = await getTermsConditions(req.dbName);
    let slot_intervals = await getSlotsInterval(req.dbName)
    const white_label_data=await ExecuteQ.Query(req.dbName,"select is_white_label from check_cbl_authority limit 1",[])
    let currencyData=await ExecuteQ.Query(req.dbName,"SELECT * FROM currency_conversion",[]);
    let data = 
    {"data":[ {
        "total_days": 538,
        "uniqueId": "homent_0753",
        "business_name": "Homent",
        "is_subscribed": 0,
        "app_type": 1,
        "email": "Info@homent.app",
        "phone_number": "65522260",
        "country": "Kuwait",
        "id": 1253,
        "country_code": "965",
        "iso": "kw",
        "whatsapp_phone_number": null,
        "whatsapp_country_code": null,
        "whatsapp_iso": null,
        "cbl_customer_domains": [
          {
            "db_secret_key": "a7b56b15d4c5b0f6ede2aca2ccbe32f5",
            "agent_db_secret_key": "b56487f50fdf68455118670f2a92bd4373808ac8ac8b83d16cfdc2637f131b14",
            "admin_domain": "https://admin.homent.app",
            "supplier_domain": "",
            "site_domain": "https://homent.app",
            "bn_image": "",
            "bn_thumb": "",
            "logo_image": null,
            "logo_thumb": null
          }
        ]
      }
    ],
    "currency": [
      {
        "id": 1,
        "conversion_rate": 1,
        "currency_name": "AED",
        "currency_symbol": "AED",
        "currency_description": "",
        "country_name": null
      }],"flowData":[],
        "featureData":featureData,
        "settingsData":keys_value,
        "key_value":keys_value,
        "default_category":default_category,
        "supplier_branch_id":supplier_branch_id,"supplier_id":supplier_id,"screenFlow":screen,"self_pickup":self_pickup,
         "latitude":latitude,"longitude":longitude,"supplierName":supplierName,
        "bookingFlow":booking,"settingData":setting,"default_address":default_address,
        "slot_intervals":slot_intervals,
        "termsAndConditions":terms_and_conditions,"whitelabel":white_label_data,"adminDetails":adminDetails,
        "subscriptionData":[]
    }
    
    sendResponse.sendSuccessDataStatusCode(data, constant.responseMessage.SUCCESS, res,200);
}
const sendAlertZoomNotifcation = async (req,res)=>{
    try{
        let {userId,agentId,orderId} = req.body;
        let fcmToken = [];

        if(parseInt(userId)!==0){

            let userDetail = await ExecuteQ.Query(req.dbName,"select `device_token`,`id` from user where id=?",[userId]);

            fcmToken.push(userDetail[0].device_token);

        }else if(parseInt(agentId)!==0){

            let agentDbInfo = await AgentCommon.GetAgentDbInformation(req.dbName);
            let RunTimeAgentConnection = await AgentCommon.RunTimeAgentConnection(agentDbInfo);
    
            let agentDetails = await ExecuteQ.QueryAgent(RunTimeAgentConnection,
                "select device_token from cbl_user where id=? ",[agentId]);
                fcmToken.push(agentDetails[0].device_token);

        }else{

            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);

        }
     
            var data = {
                "type":"zoomCall",
                "status": 0,
                "message":" Zoom call joined by someone, you can join now ",
                "orderId":orderId
            }
    
            await lib.sendFcmPushNotification(fcmToken, data,req.dbName);

            // await saveSosNotification(req.dbName,
            // "User SOS Notification, Please take an action",
            // 0,user_id,device_type,latitude,longitude,data.type,order_id,address);

        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
              }
    catch(err){
        logger.error(err)
        console.log("===========err=========",err);
        sendResponse.somethingWentWrongError(res)
    }
}

const getUserRecentMessages  = async(req, res) =>{
	try{
        let {user_created_at, skip, limit} = req.query

        let chatMessages = await ExecuteQ.Query(req.dbName,
            `SELECT ch.*,ch1.name,ch1.supplier_id
            FROM chats ch INNER JOIN (SELECT MAX(c.c_id) as id,s.name,s.id as supplier_id,c.send_by,c.send_to,c.text
            FROM chats c
            left join supplier s on s.user_created_id = c.send_by
             where c.send_to = '${user_created_at}'
             GROUP by c.send_to,c.send_by ) ch1  on ch.c_id = ch1.id order by ch.c_id DESC limit ${skip},${limit} `,[]);
        
        let chatMessagescount = await ExecuteQ.Query(req.dbName,
            `SELECT ch.* 
            FROM chats ch INNER JOIN (SELECT MAX(c.c_id) as id,c.send_by,c.send_to,c.text
            FROM chats c
            left join supplier s on s.user_created_id = c.send_by
             where c.send_to = '${user_created_at}'
             GROUP by c.send_to,c.send_by ) ch1  on ch.c_id = ch1.id order by ch.c_id DESC`,[]);

        let result = {
            list: chatMessages,
            count: chatMessagescount
        }

       sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, 200);
    }
	catch(e)
	{  
        console.log("=======getChat=========",e)
		sendResponse.somethingWentWrongError(res);
	}
}





module.exports={
    sendAlertZoomNotifcation:sendAlertZoomNotifcation,
    commonSecretKeyAgent:commonSecretKeyAgent,
    commonSecretKey:commonSecretKey,
    getRequestDataEvryClient:getRequestDataEvryClient,
    successSadded:successSadded,
    successUrl:successUrl,
    getUserRecentMessages:getUserRecentMessages,
    getSubCategoryOfParent:getSubCategoryOfParent,
    taxAccGeoFencing:taxAccGeoFencing,
    getTerminologyByCategory:getTerminologyByCategory,
    settingData:settingData,
    encrypt:encrypt,
    getSecreteDbKey:getSecreteDbKey,
    getChat : getChat,
    getChatMessageId:getChatMessageId,
    sendEmail:sendEmail,
    getPaymentGatewayAccGeof:getPaymentGatewayAccGeof,
    supplierRegistraion:supplierRegistraion,
    savePushNotificationOfAgent:savePushNotificationOfAgent,
    sendSosFcmToAdmin:sendSosFcmToAdmin,
    sosNotificationListing:sosNotificationListing,
    updateSosNotificationStatus:updateSosNotificationStatus,
    getTwilioMaskedPhoneNumber:getTwilioMaskedPhoneNumber,
    settingDataV1:settingDataV1
}

