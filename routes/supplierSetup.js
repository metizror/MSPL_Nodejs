var async = require('async');
var sendResponse = require('./sendResponse');
var constant = require('./constant');
var func = require('./commonfunction');
var _ = require('underscore');
var validator = require("email-validator");
var loginCasesSupplier = require('./loginCasesSupplier');

var log4js=require("log4js")
var logger = log4js.getLogger();
logger.level = 'debug';
let moment = require('moment');
const loginController = require('../controller/admin/LoginController')

var ExecuteQ = require('../lib/Execute')

/**
 * @description used for making an login of supplier by username & password
 */

exports.supplierLoginUsingPassword = async function(req, res) {
	var email = req.body.email;
	var password = req.body.password;
	var flag = req.body.sub;
	var encryptedPassword;
	var supplierId;
	var supplierBranchId=0;
	var superAdmin;
	var accessToken;
	let supplierAdminId=0
	let fcmToken=req.body.fcm_token;
	var manValue = [ password, flag];
	let userResponse;
	let phone_number = req.body.phone_number!==undefined?req.body.phone_number:"";
	let country_code = req.body.country_code!==undefined?req.body.country_code:"";
	
	console.log("..------>>..",req.body);
	let  sql = "select `key`,value from tbl_setting where `key` = ? and value=1 limit 1 ";
	let setDefaultToDeactive = await ExecuteQ.Query(req.dbName,sql,["set_default_to_deactive"]);


	async.waterfall([
		function(cb) {
				func.checkBlank(res, manValue, cb);
			},
		async function(cb) {
			try{
				console.log("00000000000")
				encryptedPassword = md5(password);
				var TABLE = ' ';
				if(flag==1){
					TABLE = ' supplier_admin ';
				}
				else {
					TABLE = ' supplier_branch ';
				}
				console.log("2222222222222222222222")
				
				
				if(phone_number!=="" && country_code!==""){
					var sql = "select id,password,supplier_id,is_superadmin from " + TABLE + " where phone_number = ? and country_code=?  limit 1 ";
					userResponse=await ExecuteQ.Query(req.dbName,sql,[phone_number,country_code]);
					console.log("user Response",userResponse);
					if (userResponse && userResponse.length>0) {
						console.log(' user password from data===',userResponse[0].password);
						console.log(' pass===',encryptedPassword);
						if (encryptedPassword == userResponse[0].password) {
							cb(null, userResponse[0]);
						} else {
							var data = {};
							sendResponse.sendSuccessData(data, constant.responseMessage.INCORRECT_CREDENTIALS, res, constant.responseStatus.SOME_ERROR);
						}
				// 	}


				// });
					}
					else{
						sendResponse.sendSuccessData(data, constant.responseMessage.PHONE_NUMBER_NOT_EXIST, res, constant.responseStatus.SOME_ERROR);
					}
				}else{
					var sql = "select id,password,supplier_id,is_superadmin from " + TABLE + " where email = ?  limit 1 ";
					userResponse=await ExecuteQ.Query(req.dbName,sql,[email]);
					console.log("user Response",userResponse);
					if (userResponse && userResponse.length>0) {
						console.log(' user password from data===',userResponse[0].password);
						console.log(' pass===',encryptedPassword);
						if (encryptedPassword == userResponse[0].password) {
							supplierAdminId=userResponse[0].id
							cb(null, userResponse[0]);
						} else {
							var data = {};
							sendResponse.sendSuccessData(data, constant.responseMessage.INCORRECT_CREDENTIALS, res, constant.responseStatus.SOME_ERROR);
						}
				// 	}


				// });
					}
					else{
						sendResponse.sendSuccessData(data, constant.responseMessage.EMAIL_NOT_EXISTS, res, constant.responseStatus.SOME_ERROR);
					}
				}
				
				
					}
					catch(Err){
						logger.debug("===Err",Err)
						sendResponse.somethingWentWrongError(res);
					}
			},
			async function(id, cb) {
				
				if (flag == 1) {
					if(id.is_superadmin==1){
						superAdmin=1;
						supplierId = id.supplier_id;
						checkSupplierAdminActiveOrNotAtLogin(req.dbName,res, supplierId, cb,1);	
					}
					else {
						superAdmin=0;
						// supplierId=id.id
						supplierAdminId=id.id
						supplierId = id.supplier_id;
						var sql = "select is_active from supplier_admin where id = ? limit 1 ";
						let response=await ExecuteQ.Query(req.dbName,sql,[id.id]);
						
								if (response[0].is_active == 1) {
									cb(null)
								} else {
									let data = {};

									if(setDefaultToDeactive && setDefaultToDeactive.length>0){
										cb(null);
									}else{
									sendResponse.sendSuccessData(data, constant.responseMessage.NOT_APPROVED, res, constant.responseStatus.SOME_ERROR);
									}
								}
						
					}
					
				} else {
					superAdmin=1;
					supplierBranchId = id.id;
					supplierId = id.supplier_id;
					checkSupplierBranchActiveOrNotAtLogin(req.dbName,res, supplierBranchId, cb);
				}
			},
			async function(cb) {

				if(superAdmin){
					
					func.updateSupplierAccessToken(req.dbName,fcmToken,
						res, cb, supplierId, email, 1, flag,supplierBranchId);	
				}
				else {
					
					let query = "select `key`, value from tbl_setting where `key`=? and value='1'";

					let supplierLoginCheck = await ExecuteQ.Query(req.dbName,query,["supplier_multiple_login"]);

					if(supplierLoginCheck && supplierLoginCheck.length>0){
						accessToken = func.encrypt(email);
					}else{
						accessToken = func.encrypt(email + new Date());
					}

					var sql = "update supplier_admin sa join supplier s on s.id = sa.supplier_id " +
			            " SET sa.access_token = ?,s.access_token = ?,s.device_token=? where sa.id = ? ";
					await ExecuteQ.Query(req.dbName,sql,[accessToken,accessToken,fcmToken,supplierAdminId]);
					cb(null, accessToken);

				}
				
			},
			async function(accessToken1, cb) {
				if (flag == 1) {
					accessToken = accessToken1;
					var sql = "update supplier_admin sa join supplier s on s.id = sa.supplier_id " +
			            " SET sa.fcm_token = ? where sa.id = ? ";
					await ExecuteQ.Query(req.dbName,sql,[fcmToken,supplierAdminId]);
					cb(null,superAdmin)
				} else {
					accessToken = accessToken1;
					cb(null, 1);
				}
				
			},
			async function(check, cb) {
				if (check) {
					
					let supplierBranchDetails = await getSupplierBranchDetail(req.dbName,supplierId,supplierBranchId)
					let supplierSubscription = await supplierSubscriptionDetails(req.dbName,supplierId)
					logger.debug('=======supplierbranchdetails========',supplierBranchDetails)
					let query = "select (SELECT message_id FROM `chats` WHERE (`send_to_type`='ADMIN' or `send_by_type`='ADMIN') and (send_by=s.user_created_id or send_to=s.user_created_id) and (`send_to_type`='SUPPLIER' or `send_by_type`='SUPPLIER') order by c_id desc limit 1) as message_id, s.user_created_id,s.is_own_delivery,s.is_vat_applicable,s.allow_agent_section_in_supplier,s.allow_geofence_section_in_supplier, s.name from supplier s where s.id = ?";
					let details = await Execute.Query(req.dbName,query,[supplierId]);
					var data = {
						"access_token": accessToken,
						"categoryIds": [1, 2, 3, 4, 5, 6, 7],
						"is_super_admin": 1,
						"supplierName" : details[0].name!==undefined?details[0].name:"",
						"message_id" : details[0].message_id!==undefined?details[0].message_id:"",
						"user_created_id" : details[0].user_created_id!==undefined?details[0].user_created_id:"",
						"supplierId":supplierId,
						"is_multibranch":supplierBranchDetails[0].is_multibranch,
						"default_branch_id":supplierBranchDetails[0].default_branch_id,
						"is_head_branch":1,
						"supplierSubscription":supplierSubscription,
						"branchName":supplierBranchDetails.length? supplierBranchDetails[0].branch_name:"",
						"logo":supplierBranchDetails.length? supplierBranchDetails[0].logo:"",
						"is_own_delivery":details[0].is_own_delivery,
						"banner_limit":supplierSubscription && supplierSubscription.length>0?supplierSubscription[0].banner_limit:0,
						"is_vat_applicable": details[0].is_vat_applicable,
						"allow_agent_section_in_supplier" : details[0].allow_agent_section_in_supplier,
						"allow_geofence_section_in_supplier" : details[0].allow_geofence_section_in_supplier
					};
					
					  // GET productCustomTabDescriptionLabel per supplier
						const settingDataKeys = await func.getSettingDataKeyAndValue(req.dbName, ['productCustomTabDescriptionLabel', 'isProductCustomTabDescriptionEnable']);
						settingDataKeys.keyAndValue.isProductCustomTabDescriptionEnable = !!settingDataKeys.keyAndValue.isProductCustomTabDescriptionEnable;
					   if(settingDataKeys.keyAndValue.isProductCustomTabDescriptionEnable === true){
							let sql = "SELECT productCustomTabDescriptionLabelSelected FROM supplier WHERE id = ?;";
							let params = [supplierId];
							const result = await ExecuteQ.Query(req.dbName,sql,params);    
							data.productCustomTabDescriptionLabelSelected = result[0]["productCustomTabDescriptionLabelSelected"];
					   }
					let section_data = await loginController.sectionSupplierData(userResponse[0].id,req.dbName)
					data.section_data = section_data
					sendResponse.sendSuccessData(data, constant.responseMessage.LOGGED_IN, res, constant.responseStatus.SUCCESS);
				} else {
					func.getAllSupplierSectionIds(req.dbName,res, supplierId, cb);
				}
			},
			function(allSectionId, cb) {
				assignSupplierCategory(req.dbName,cb, allSectionId);
			}
		],
		async function(err, result) {
			if (err) {
				sendResponse.somethingWentWrongError(res);
			} else {
					let supplierBranchDetails = await getSupplierBranchDetail(req.dbName,supplierId,supplierBranchId)

					// let supplierBranchDetails = await getSupplierBranchDetail(req.dbName,supplierId)
					let supplierSubscription = await supplierSubscriptionDetails(req.dbName,supplierId)
					logger.debug("===========================")
					let query = "select (SELECT message_id FROM `chats` WHERE (`send_to_type`='ADMIN' or `send_by_type`='ADMIN') and (send_by=s.user_created_id or send_to=s.user_created_id) and (`send_to_type`='SUPPLIER' or `send_by_type`='SUPPLIER') order by c_id desc limit 1) as message_id, s.user_created_id,s.is_own_delivery,s.is_vat_applicable,s.allow_agent_section_in_supplier,s.allow_geofence_section_in_supplier, s.name from supplier s where s.id = ?";
					let details = await Execute.Query(req.dbName,query,[supplierId]);
					
					
				var data = {
					"access_token": accessToken,
					"categoryIds" : result,
					"supplierName" : details && details[0].name!=undefined?details[0].name:"",
					"message_id" : details && details[0].message_id!=undefined?details[0].message_id:"",
					"user_created_id" : details && details[0].user_created_id!=undefined?details[0].user_created_id:"",
					"is_super_admin": 0,
					"supplierId":supplierId,
					"is_multibranch": supplierBranchDetails.length && supplierBranchDetails[0].is_multibranch ? supplierBranchDetails[0].is_multibranch:0,
					"default_branch_id": supplierBranchId, //supplierBranchDetails.length && supplierBranchDetails[0].default_branch_id? supplierBranchDetails[0].default_branch_id:0
					"is_head_branch":supplierBranchDetails.length? supplierBranchDetails[0].is_head_branch:0,
					"branchName":supplierBranchDetails.length? supplierBranchDetails[0].branch_name:"",
					"logo":supplierBranchDetails.length? supplierBranchDetails[0].logo:"",
					"is_own_delivery":details[0].is_own_delivery,
					// "is_multibranch":supplierBranchDetails[0].is_multibranch,
					// "default_branch_id":supplierBranchDetails[0].default_branch_id,
					"supplierSubscription":supplierSubscription,
					"banner_limit":supplierSubscription && supplierSubscription.length>0?supplierSubscription[0].banner_limit:0,
					"is_vat_applicable": details[0].is_vat_applicable,
					"allow_agent_section_in_supplier" : details[0].allow_agent_section_in_supplier,
					"allow_geofence_section_in_supplier" : details[0].allow_geofence_section_in_supplier
				};
				let section_data = await loginController.sectionSupplierData(userResponse[0].id,req.dbName)
				data.section_data = section_data
				sendResponse.sendSuccessData(data, constant.responseMessage.LOGGED_IN, res, constant.responseStatus.SUCCESS);
			}
		})
}


const subscription_plans = require('../controller/admin/SubscriptionController');
const Execute = require('../lib/Execute');
const supplierSubscriptionDetails = (dbName,supplier_id)=>{
	return new Promise(async(resolve,reject)=>{
		let query = "select * from supplier_subscription where supplier_id=? and status = ? order by id desc limit 1"
		let params = [supplier_id,"active"];
		let result = await ExecuteQ.Query(dbName,query,params);
		let curentUnixTimeStamp = moment().utc().unix();
		console.log("curentUnixTimeStamp===>>",curentUnixTimeStamp)
		if(result && result.length>0){

			if(result[0].current_period_end > curentUnixTimeStamp){
				console.log("==ENT=IN=SUB=>>")
				let data = await subscription_plans.getSupplierPlanFromDb(dbName,result[0].plan_id);
				if(data && data.length>0){
						data[0].is_approved = result && result.length>0?result[0].is_approved:0
				}
				resolve(data);
			}else{
				resolve([]);
			}
		}else{
			// let data = await subscription_plans.getAllPermissionsForSupplierLogin(dbName)
			resolve([])
		}
	})
}

function getSupplierBranchDetail(dbName,supplierId,supplierBranchId){
	return new Promise(async(resolve,reject)=>{
		try{
			let query = "select sb.id as default_branch_id,s.is_sponser as is_multibranch,sb.is_head_branch,sb.logo,sb.branch_name "
				query += "from supplier s join supplier_branch sb on s.id = sb.supplier_id "
				query += "where s.id = ? "
			if(supplierBranchId){
				query += " and sb.id="+supplierBranchId; 
			}
			let params = [supplierId]
			let data = await ExecuteQ.Query(dbName,query,params)
			resolve(data)
		}catch(err){
			logger.debug("===========errrr====",err)
			reject(err)
		}
	})

}





/*
 *-------------------------------
 *---------------------------------
 * get supplier home data
 *--------------------------------------
 * --------------------------
 */


exports.getSupplierHomeData = function(req,res) {
	var accessToken =  req.body.accessToken;
	var sectionIdFromFrontEnd = req.body.sectionId;
	var filter1 =  req.body.filter; // 0 ,1,2 (weekly,monthly)
	var flag = req.body.sub;
	var dataToBeSent;
	var supplierId;
	var manValue = [accessToken,filter1,flag];
	
	console.log("......",req.body);
	async.waterfall([
		function (cb) {
			func.checkBlank(res, manValue, cb);
		},
		function (cb) {
			func.authenticateSupplierAccessToken(req.dbName,accessToken, res, cb,flag);
		},
		/*function (id,cb) {
			getId(res,id,cb);
		},*/
		function (id, cb) {

			console.log("id",id);
			
			if (flag == 1) {
				supplierId = id;

				checkSupplierAdminActiveOrNotAtLogin(req.dbName,res, supplierId, cb, 0);
			} else {


				supplierId = id;

				checkSupplierBranchActiveOrNotAtLogin(req.dbName,res, supplierId, cb, 0);
			}
		},
		function (cb) {


			if(flag==1)
				dataOnUpdationSupplier(req.dbName,res, cb, supplierId, sectionIdFromFrontEnd, accessToken, filter1);
			else
			{
				// branches
				cb(null);
			}

			
		}
	], function (error, dataToBeSent1) {

		if (error) {
			sendResponse.somethingWentWrongError(res);
		} else {
			dataToBeSent = dataToBeSent1;
			sendResponse.sendSuccessData(dataToBeSent, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
		}

	})

}



function dataOnUpdationSupplier(dbName,res, callback, supplierId, sectionIdFromFrontEnd, accessToken, filter1) {
	var dataSectionIds;
	var singleSectionData;
	var sectionDetails;
	var isSuper;
	var supplier_id;
   //  console.log("kjbsdfhjbsdf",sectionIdFromFrontEnd);
	if (sectionIdFromFrontEnd != '') {

		sectionIdFromFrontEnd = parseInt(sectionIdFromFrontEnd);
	}
	async.waterfall([
		function (cb) {
			checkSupplierSuperAdminOrNot(dbName,res, supplierId,1, cb);
		},
		function (superAdminCheck, cb) {
			isSuper = superAdminCheck;
			console.log("vjjads",isSuper)
			if (superAdminCheck) {
				getAllSectionDetailsOfSuperAdminSupplier(dbName,res, cb);
			}
			else {
				getAllSectionDetailsSupplier(dbName,res, supplierId, cb);
			}
			


		},
		function (sectionDetails1, cb) {
			sectionDetails = sectionDetails1;
			// console.log("===ENTER========")
			getSectionIdsSupplier(sectionDetails, cb);
			
		},
		function (sectionIds,cb){
			dataSectionIds = sectionIds;
			//console.log("kjdfs",dataSectionIds);
			getId(dbName,res,supplierId,cb);
		},
		function (id,cb) {
			supplier_id=id;
			/*

			*dataSectionIds : all section ids assigned to this supplier admin
			*/
			//console.log("kbjvsdbsdv",sectionIdFromFrontEnd.toString())
			if (accessToken && (sectionIdFromFrontEnd.toString() != '')) {
			//	console.log("if")
				loginCasesSupplier.logInCases(dbName,res, [parseInt(sectionIdFromFrontEnd)], supplier_id, cb, filter1);
			} else if (accessToken) {
			//	console.log("else");
				loginCasesSupplier.logInCases(dbName,res,dataSectionIds, supplier_id, cb, filter1);
			}


		},
		function (singleSectionData1, cb) {
			/*
			 *singleSectionData : data of section(single section) to be
			 * display at home screen after login
			 */
		
			singleSectionData = singleSectionData1;
			//  var singleSectionDataKeys = Object.keys(singleSectionData[0]);
			// console.log("dataSectionIds",dataSectionIds)
			// console.log("bnaddddsdfksd",logInArray)
			getDifference(dataSectionIds, logInArray, cb);
		},
		function (sectionIds, cb) {
			/*
			 *sectionIds : ids of those section for which only section name,
			 * section id and category to be send
			 */
			// console.log("888888==88",sectionIds)
			if (sectionIds.length) {
				if (isSuper) {

					getSectionNameByIdForSuperAdmin(dbName,res, sectionIds, cb);
				}
				else {
					getSectionNameById(dbName,res, supplierId, sectionIds, cb);
				}

			}
			else {
				getSectionNameById(dbName,res, supplierId, dataSectionIds, cb);
			}


		},
		function (remainingSectionNames, cb) {
			/*
			 *remainingSectionNames : array of section names
			 */
			clubSectionDataAtLogin(singleSectionData, remainingSectionNames, sectionDetails, dataSectionIds, cb);

		}
	], function (error, result) {
		if (error) {
			sendResponse.somethingWentWrongError(res);
		}
		else {
			callback(null, result);
		}

	})

}




function getSectionNameById(dbName,res, supplierId, sectionIds, callback) {
	
	var sql = "select adma.supplier_section_id ,adms.section_name,adms.section_category_id,admscat.section_category_name from supplier ad ";
	sql += " join supplier_authority adma on ad.id = adma.supplier_admin_id join supplier_sections adms on adma.supplier_section_id=adms.id ";
	sql += " join supplier_section_category admscat on adms.section_category_id=admscat.id where ad.id = ? and adma.supplier_section_id in (" + sectionIds + ")";

	multiConnection[dbName].query(sql, [supplierId], function (err, reply) {
		console.log("fnksdfdsf",err,reply)
		if (err) {
			console.log(err);
			callback(null,[])
		} else if (reply.length) {
			callback(null, reply);
		}
		else {
			callback(null,[])
		}
	});
}


/*
 *This function is used detials of sections and category of
 * sections by the given sectionIds for super admin
 */


function getSectionNameByIdForSuperAdmin(dbName,res, sectionIds, callback) {
	var sql = "select ads.id as section_id,ads.section_name,adsc.id as section_category_id, adsc.section_category_name";
	sql += " from supplier_sections ads join supplier_section_category adsc on ads.section_category_id = adsc.id WHERE ads.id > 10 ORDER BY ads.id ASC";
	multiConnection[dbName].query(sql, [], function (err, reply) {
		if (err) {
			console.log(err);
			sendResponse.somethingWentWrongError(res);
		} else if (reply.length) {
			callback(null, reply);
		}
	});
}



function getAllSectionDetailsOfSuperAdminSupplier(dbName,res, callback) {
	var sql = "select adms.id as section_id,adms.section_name,adms.section_category_id,adm.section_category_name ";
	sql += "from supplier_sections adms join supplier_section_category adm on adms.section_category_id = adm.id ORDER by adms.id ASC "
	multiConnection[dbName].query(sql,function (err, result) {
		if (err) {
			sendResponse.somethingWentWrongError(res);
		}
		else {
			callback(null, result);

		}

	})

}


function getSectionIdsSupplier(sectionDetails, cb) {
	var sectionLength = sectionDetails.length;
	console.log("===sectionLength===",sectionLength)
	var ids = [];
	if(sectionLength>0){
	for (var i = 0; i < sectionLength; i++) {
		(function (i) {
			ids.push(sectionDetails[i].section_id);
			console.log("====NOT")
			if (i == sectionLength - 1) {
				console.log("===YES===")
				cb(null, ids);
			}

		}(i))
	}
}
else{
	cb(null, ids);
}

}

/*
 * This function is used to get detail of sections and category
 * for supplier admin other than sub admin
 */

function getAllSectionDetailsSupplier(dbName,res, supplierId, callback) {
	var sql = "select adma.supplier_section_id as section_id,adms.section_name,adms.section_category_id,admscat.section_category_name from supplier_admin ad ";
	sql += " join supplier_authority adma on ad.id = adma.supplier_admin_id join supplier_sections adms on adma.supplier_section_id=adms.id ";
	sql += " join supplier_section_category admscat on adms.section_category_id=admscat.id where ad.id = ? ORDER BY adma.supplier_section_id ASC ";
	multiConnection[dbName].query(sql, [supplierId], function (err, result) {
		if (err) {
			console.log("err====",err);
			sendResponse.somethingWentWrongError(res);
		}
		else {
		//	console.log("result",result);
			callback(null, result);

		}

	})

}


/*
 * This function is used to check the whether admin
 * is active admin or not
 */

async function checkSupplierAdminActiveOrNotAtLogin(dbName,res, supplierId, callback,flag) {
	//console.log("njsdjsfd",supplierId)
	try{
	if(flag==1){
		var sql = "select is_active from supplier where id = ? limit 1 ";
	}
	else {
		var sql = "select is_active from supplier_admin where id = ? limit 1 ";
	}
	let response=await ExecuteQ.Query(dbName,sql,[supplierId]);
	// multiConnection[dbName].query(sql, [supplierId], function(err, response) {
	// 	//console.log("jkbdsjhdsf",response)
	// 	if (err) {
	// 		console.error("errror in activInactice"+err);
	// 		sendResponse.somethingWentWrongError(res);
	// 	} else {
			if (response[0].is_active == 1) {
				callback(null)
			} else {
				var data = {};
				sendResponse.sendSuccessData(data, constant.responseMessage.NOT_APPROVED, res, constant.responseStatus.SOME_ERROR);
			}
	// 	}
	// })
		}
		catch(Err){
			logger.debug("====Err!==",Err);
			sendResponse.somethingWentWrongError(res);
		}
}

async function checkSupplierBranchActiveOrNotAtLogin(dbName,res, supplierId, callback) {
	try{
	var sql = "select is_live from supplier_branch where id = ? limit 1 ";
	let response=await ExecuteQ.Query(dbName,sql,[supplierId])
	// multiConnection[dbName].query(sql, [supplierId], function(err, response) {
	// 	if (err) {
	// 		console.error("branch error===", err)
	// 		sendResponse.somethingWentWrongError(res);
	// 	} else {
			if (response[0].is_live == 1) {
				callback(null)
			} else {
				async.waterfall([

					function(cb) {
						cb(null)
						// func.insertFailure(res, cb, clientIp, adminId, country, city, mesage,status);
					}
				], function(error, reply) {
					var data = {};
					sendResponse.sendSuccessData(data, constant.responseMessage.NOT_ACTIVE, res, constant.responseStatus.SOME_ERROR);
				})
			}
	// 	}
	// })
		}
		catch(Err){
			logger.debug("===Err!==",Err)
			sendResponse.somethingWentWrongError(res);
		}
}
/*
 * This function is used to check the whether admin
 * is super admin or not
 */


function checkSupplierSuperAdminOrNot(dbName,res, supplierId,type,cb) {
	console.log(":kbjfifsd",supplierId)
	if(type==0){
		var sql = "select is_superadmin from supplier_admin where supplier_id = ? limit 1 ";
	}
	else {
		var sql = "select is_superadmin from supplier_admin where id = ? limit 1 ";
	}
	
	multiConnection[dbName].query(sql, [supplierId], function(err, response) {
			if (err) {
			console.error("err check admin=====", err)
			sendResponse.somethingWentWrongError(res);
		} else {
			if(response.length){
				if (response[0].is_superadmin == 1) {
					cb(null, 1);
				} else {
					cb(null, 0);
				}
			}
			else {
				cb(null,0)
			}
			
		}
	})
}



function assignSupplierCategory(dbname,cb, allSectionId) {
	var _ = require('underscore');
	var categoryId = [];
	var categoryData = [];
	var BreakException = {};
	for (var i = 0; i < 6; i++) {
		(function(i) {
			switch (i) {
				//HOME
				case 0:
					/*
					 * This loop will execute for the total number of
					 * section assigned to this admin.
					 */
					var home = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
					if ((_.intersection(home, allSectionId).length)) {
						categoryId.push({
							"category_id": 1,
							"section_ids": _.intersection(home, allSectionId)
						});
					}

					break;
				//PROFILE
				case 1:
					var case1 = false;

					var profile = [11,12,13,14,15];
					if ((_.intersection(profile, allSectionId).length)) {
						categoryId.push({
							"category_id": 2,
							"section_ids": _.intersection(profile, allSectionId)
						});
					}
					break;
				//PRODUCTION
				case 2:
					var case2 = false;
					var production = [16,17,18,19];
					if ((_.intersection(production, allSectionId).length))
						categoryId.push({
							"category_id": 3,
							"section_ids": _.intersection(production, allSectionId)
						});
					break;
				//ORDERS
				case 3:
					var case3 = false;
					var orders = [20,21,22];
					if ((_.intersection(orders, allSectionId).length))
						categoryId.push({
							"category_id": 4,
							"section_ids": _.intersection(orders, allSectionId)
						});
					break;
				//ACCOUNT
				case 4:
					var case4 = false;
					var account = [23,24,25,26];
					if ((_.intersection(account, allSectionId).length))
						categoryId.push({
							"category_id": 5,
							"section_ids": _.intersection(account, allSectionId)
						});
					break;
				//REPORTS
				case 5:
					var case5 = false;
					var reports = [27,28,29,30,31,32];
					if ((_.intersection(reports, allSectionId).length))
						categoryId.push({
							"category_id": 6,
							"section_ids": _.intersection(reports, allSectionId)
						});
					break;

				default:
					break;
			}
			if (i == 5) {
				categoryData.push(categoryId);
				cb(null, categoryData);
			}
		}(i))
	}
}


function getDifference(myArray, toRemove, callback1) {
	
	console.log("====myArray=",myArray);

	var result = [];
	if(myArray && myArray.length>0){
	for (var j = 0; j < myArray.length; j++) {
		(function (j) {
			if (toRemove.indexOf(parseInt(myArray[j])) === -1) {
				result.push(myArray[j]);
			}
			if (j == myArray.length - 1) {

				callback1(null, result);
			}
		}(j))
	}
}
else{
		callback1(null, result);
}
}




/*
 *This function is used to club all the data to be sent
 * at the time of admin login after successfull authentication
 */

function clubSectionDataAtLogin(singleSectionData, remainingSectionNames, sectionDetails, allSectionIds, cb) {
	var home = [];
	var profile = [];
	var production = [];
	var orders = [];
	var account = [];
	var reports = [];
	var sectionDetailsLength = sectionDetails.length;
	var loginArrayLength = logInArray.length;
	// console.log("========================",logInArray,loginArrayLength);
	//console.log("nbfdsdfvsdbkgd",sectionDetails,sectionDetailsLength);
	var singleSectionDataLength = singleSectionData.length;
	var data = [];
	//console.log("nbfdsdfvdsssdbkgd",sectionDetails,sectionDetailsLength);

	/*
	 *This loop is working for 6 categories
	 */
	//	console.log("singl",singleSectionData);
	//	console.log("remain",remainingSectionNames);
	//	console.log("section",sectionDetails);
	//	console.log("allsection",allSectionIds);
	//	console.log("login",logInArray);
	for (var i = 0; i < 6; i++) {
		(function (i) {
			switch (i) {
				//HOME
				case 0 :
					var case0 = false;
					/*
					 * This loop will execute for the total number of
					 * section assigned to this admin.
					 */
					for (var j = 0; j < sectionDetailsLength; j++) {
						(function (j) {
							var section = {};
							if (sectionDetails[j].section_id <= 10) {
								case0 = true;
								section.section_name = sectionDetails[j].section_name;
								section.section_id = sectionDetails[j].section_id;
								var lengthCheck = false;
								for (var k = 0; k < loginArrayLength; k++) {
									(function (k) {
									//	console.log("logggg",logInArray[k],sectionDetails[j].section_id)
										if (logInArray[k] == sectionDetails[j].section_id) {
											var homeData = [];
									//		console.log("seeeeee",singleSectionData[0]);
											var singleSectionData1 = singleSectionData[0];
											if (Array.isArray(singleSectionData1)) {
										//		console.log("in if");
										//		console.log("seeeeee",singleSectionData2);
												var singleSectionData2 = singleSectionData1[0];
												var c = Object.keys(JSON.parse(JSON.stringify(singleSectionData2)));
												var data = {};
												//data[sectionDetails[j].sections_name] = singleSectionData2[c[k]];
												console.log("seeeeee",singleSectionData2[c[k]]);
												data["values"] = singleSectionData2[c[k]];
											//	console.log("hom")
												homeData.push(data);
												section.data = homeData;
												lengthCheck = true
											}
											else {

												var c = Object.keys(JSON.parse(JSON.stringify(singleSectionData1)));
												var data = {};
												//data[sectionDetails[j].sections_name] = singleSectionData1[c[k]];
												data["values"] = singleSectionData1[c[k]];
												homeData.push(data);
												section.data = homeData;
												lengthCheck = true;
											}

										}
										else if (k == loginArrayLength - 1 && !lengthCheck) {
											section.data = [];
										}


									}(k))
								}
								home.push(section);
							}
							/*else {
								if (sectionDetails[j].section_id == 10) {
									case0 = true;
									section.section_name = sectionDetails[j].section_name;
									section.section_id = sectionDetails[j].section_id;
									var lengthCheck = false;
									for (var k = 0; k < loginArrayLength; k++) {
										(function (k) {
											console.log("kbjsddsfsfd",logInArray[k],sectionDetails[j].section_id);
											if (logInArray[k] == sectionDetails[j].section_id) {
												console.log("dfbskfs",singleSectionData)
												var singleSectionData1 = singleSectionData[0];
												console.log("kjbfsjfs",singleSectionData1)
												if (Array.isArray(singleSectionData1)) {
													//var homeData =[];
													// var data ={};
													var single = singleSectionData[singleSectionDataLength - 1];
													//data = single[0]
													//console.log("=====data 0 ====" + JSON.stringify(single));

													//homeData.push(single);
													//section.data =homeData;
													section.data = single;
													lengthCheck = true;
												}
												else {
													//  var homeData =[];
													// var data ={};
													//data = singleSectionData;
													// homeData.push(data);
													//  section.data =homeData;
													section.data = singleSectionData;
													lengthCheck = true;
												}

											}
											else if (k == loginArrayLength - 1 && !lengthCheck) {
												section.data = [];
											}
										}(k))
									}
									home.push(section);
								}

							}
*/
							if (j == sectionDetailsLength - 1 && case0 == true) {

								data.push({"category_id": 1, "category_name": "HOME", "category_data": home});
								//console.log(JSON.stringify(data));

							}
						}(j))
					}
					break;
				//PROFILE
				case 1 :
					var case1 = false;
					for (var j = 0; j < sectionDetailsLength; j++) {
						(function (j) {
							var section = {};
							if (sectionDetails[j].section_id > 10 && sectionDetails[j].section_id < 16 ||  sectionDetails[j].section_id==33) {
								case1 = true;
								section.section_name = sectionDetails[j].section_name;
								section.section_id = sectionDetails[j].section_id;
								var lengthCheck = false;
								for (var k = 0; k < loginArrayLength; k++) {
									(function (k) {
										if (logInArray[k] == sectionDetails[j].section_id) {
											var homeData = [];
											var singleSectionData1 = singleSectionData;
											//console.log(singleSectionData1);
											//var data = {};
											//data = singleSectionData1;
											// homeData.push(singleSectionData1);
											section.data = singleSectionData1;
											lengthCheck = true;
										}
										else if (k == loginArrayLength - 1 && !lengthCheck) {
											section.data = [];
										}

									}(k))
								}
								profile.push(section);

							}
							if (j == sectionDetailsLength - 1 && case1 == true) {
								data.push({"category_id": 2, "category_name": "PROFILE", "category_data": profile});
							}

						}(j))
					}
					break;
				//PRODUCTION
				case 2 :
					var case2 = false;
					// console.log("=======",sectionDetailsLength,sectionDetails)
					for (var j = 0; j < sectionDetailsLength; j++) {
						(function (j) {
							var section = {};
							if (sectionDetails[j].section_id > 15 && sectionDetails[j].section_id < 20) {
								case2 = true;

								section.section_name = sectionDetails[j].section_name;
								section.section_id = sectionDetails[j].section_id;
								var lengthCheck = false;
								for (var k = 0; k < loginArrayLength; k++) {
									(function (k) {
										if (logInArray[k] == sectionDetails[j].section_id) {
											var homeData = [];
											var singleSectionData1 = singleSectionData;
											//console.log(singleSectionData1);
											//var data = {};
											//data = singleSectionData1;
											// homeData.push(singleSectionData1);
											section.data = singleSectionData1;
											lengthCheck = true;
										}
										else if (k == loginArrayLength - 1 && !lengthCheck) {
											section.data = [];
										}
									}(k))
								}
								production.push(section);

							}
							if (j == sectionDetailsLength - 1 && case2 == true) {
								data.push({
									"category_id": 3,
									"category_name": "PRODUCTION",
									"category_data": production
								});
							}

						}(j))
					}
					break;
				//ORDERS
				case 3 :
					var case3 = false;
					for (var j = 0; j < sectionDetailsLength; j++) {
						(function (j) {
							var section = {};
							if (sectionDetails[j].section_id > 19 && sectionDetails[j].section_id < 23) {
								case3 = true;
								section.section_name = sectionDetails[j].section_name;
								section.section_id = sectionDetails[j].section_id;
								var lengthCheck = false;
								for (var k = 0; k < loginArrayLength; k++) {
									(function (k) {
										if (logInArray[k] == sectionDetails[j].section_id) {
											var homeData = [];
											var singleSectionData1 = singleSectionData;
											//console.log(singleSectionData1);
											//var data = {};
											//data = singleSectionData1;
											// homeData.push(singleSectionData1);
											section.data = singleSectionData1;
											lengthCheck = true;
										}
										else if (k == loginArrayLength - 1 && !lengthCheck) {
											section.data = [];
										}
									}(k))
								}
								orders.push(section);

							}
							if (j == sectionDetailsLength - 1 && case3 == true) {
								data.push({"category_id": 4, "category_name": "ORDERS", "category_data": orders});
							}


						}(j))
					}
					break;
				//ACCOUNT
				case 4 :
					var case4 = false;
					for (var j = 0; j < sectionDetailsLength; j++) {
						(function (j) {
							var section = {};
							if (sectionDetails[j].section_id > 22 && sectionDetails[j].section_id < 27) {
								case4 = true
								section.section_name = sectionDetails[j].section_name;
								section.section_id = sectionDetails[j].section_id;
								var lengthCheck = false;
								for (var k = 0; k < loginArrayLength; k++) {
									(function (k) {
										if (logInArray[k] == sectionDetails[j].section_id) {
											var homeData = [];
											var singleSectionData1 = singleSectionData;
											//console.log(singleSectionData1);
											//var data = {};
											//data = singleSectionData1;
											// homeData.push(singleSectionData1);
											section.data = singleSectionData1;
											lengthCheck = true;
										}
										else if (k == loginArrayLength - 1 && !lengthCheck) {
											section.data = [];
										}
									}(k))
								}
								account.push(section);

							}
							if (j == sectionDetailsLength - 1 && case4 == true) {
								data.push({"category_id": 5, "category_name": "ACCOUNT", "category_data": account});
							}


						}(j))
					}
					break;
				//REPORTS
				case 5 :
					var case5 = false;
					for (var j = 0; j < sectionDetailsLength; j++) {
						(function (j) {
							var section = {};
							if (sectionDetails[j].section_id > 26 && sectionDetails[j].section_id < 33) {
								case5 = true;
								section.section_name = sectionDetails[j].section_name;
								section.section_id = sectionDetails[j].section_id;
								var lengthCheck = false;
								for (var k = 0; k < loginArrayLength; k++) {
									(function (k) {
										if (logInArray[k] == sectionDetails[j].section_id) {
											var homeData = [];
											var singleSectionData1 = singleSectionData;
											//console.log(singleSectionData1);
											//var data = {};
											//data = singleSectionData1;
											// homeData.push(singleSectionData1);
											section.data = singleSectionData1;
											lengthCheck = true;
										}
										else if (k == loginArrayLength - 1 && !lengthCheck) {
											section.data = [];
										}
									}(k))
								}
								reports.push(section);

							}
							if (j == sectionDetailsLength - 1 && case5 == true) {
								data.push({"category_id": 6, "category_name": "REPORTS", "category_data": reports});
							}


						}(j))
					}
					break;
				default :
					break;
			}
			if (i == 5) {
				cb(null, data);
			}
		}(i))
	}

}

// function getId(dbName,res,id,callback){
// 	//console.log("asdasdsad",id)
// 	var sql='select supplier_id from supplier_admin where id=?';
// 	multiConnection[dbName].query(sql,[id],function (err,id) {
// 		//console.log("asdkdfdsdsf",err,id)
// 		if(err)
// 		{
// 			console.log('error------',err);
// 			sendResponse.somethingWentWrongError(res);

// 		}
// 		else {
// 			callback(null,id[0].supplier_id);
// 		}
// 	})
// }
function getId(dbName, res, id, cb) {
	var sql = 'select supplier_id from supplier_admin where id=?';
	multiConnection[dbName].query(sql, [id], function (err, result) {
		if (err) {
			console.log('error------', err);
			sendResponse.somethingWentWrongError(res);

		}
		else {
			//console.log('result-----',id);
			if (result.length) {
				cb(null,result);
			} else {
				var sql = 'select supplier_id from supplier_branch where id=?';
				multiConnection[dbName].query(sql, [id], function (err, result) {
					if (err) {
						console.log('error------', err);
						sendResponse.somethingWentWrongError(res);

					}
					else {
						//console.log('result-----',id);
						if (result.length){
							cb(null, result);
						}else{
							sendResponse.somethingWentWrongError(res);
						}
					}
				})
			}

		}
	})
}

exports.countSupplier = function(req,res){
	var categoryId;
	var count;
	async.auto({
		getValue:function(cb){
			categoryId = req.body.categoryId;
			cb(null);
		},
		getCount:['getValue',function(cb){
			var sql = "select s.id from supplier s join supplier_category sc on s.id = sc.supplier_id where sc.category_id = ?";
			multiConnection[req.dbName].query(sql,[categoryId],function (err,result) {
				if(err) {
					cb(err);
				}
				else {
					count = result.length;
					callback(null,count);
				}
			})
		}]
	},function(err,result){
		if (err) {
			sendResponse.somethingWentWrongError(res);
		} else {
			sendResponse.sendSuccessData(count, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

		}
	})
}

exports.supplierLoyaltyLevel = function (req,res) {
	var accessToken =0 ;
	var supplierId=0;
	var supplier_id=0;
	var data;
	var data1;
	var data2;
	async.auto({
		blankField:function(cb) {
			if(req.body && req.body.accessToken) {
				accessToken=req.body.accessToken;
				cb(null)
			}
			else {
				sendResponse.parameterMissingError(res);
			}
		},
		authenticate:['blankField',function (cb) {
			func.authenticateSupplierAccessToken(req.dbName,accessToken, res,function(err,result){
				//console.log("dsandsafdsf",err,result)
				if(err)
				{
					sendResponse .somethingWentWrongError(res);
				}
				else
				{
					supplier_id=result;
					cb(null);
				}

			},1)
		}],
		supplierId:['authenticate',function (cb) {
			getId(req.dbName,res,supplier_id,function (err,result) {
			//console.log("znjkds",err,result)
					if(err) {
					sendResponse.somethingWentWrongError(res);
				}
				else {
					supplierId=result;
					cb(null);
				}
			})
		}],
		getSupplierCommissionPlan:['supplierId',function (cb) {
			//console.log("dbdsfjbdsfsdf")
			getSupplierCommissionPlan(req.dbName,res, 14,supplierId,function (err,result) {
				console.log("..commission********",err,result)
				if(err){
					cb(err)
				}
				else {
					data1=result;
					cb(null)
				}
			});
		}],
		getSupplierPosition:['supplierId',function (cb) {
			getSupplierPositioning(req.dbName,res,14, supplierId,function (err,result) {
				console.log("**********Position********",err,result)
				if(err){
					cb(err)
				}
				else {
					data2=result;
					cb(null)
				}
			});
		}],
		clubCommissionPlanAndPosition:['getSupplierCommissionPlan','getSupplierPosition',function (cb) {
			clubCommissionPlanAndPosition(res, data1, data2, function (err,result) {
				console.log("**********final********",err,result)
				if(err){
					cb(err)
				}
				else {
					data=result;
					cb(null)
				}
			});
		}]
	},function(err,result){
		if(err) {
			sendResponse.somethingWentWrongError(res);
		}else{
			sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,constant.responseStatus.SUCCESS);
		}
	})
}

function getSupplierCommissionPlan(dbName,res,languageId, supplierId,callback) {
	var result;
	var data=[];
	async.auto({
		getCommission:function (cb) {
			var sql = "select s.commission,s.commission_package,s.onOffComm,c.name,c.category_id,s.commission_type,ss.commisionButton from supplier_category s join categories_ml c on ";
			sql += " s.category_id = c.category_id join supplier ss on ss.id = s.supplier_id where s.supplier_id = ? and c.language_id = ? group by s.category_id ORDER BY c.id ASC";
			multiConnection[dbName].query(sql, [supplierId, languageId], function (error, reply) {
				console.log("error from getSupplierCommissionPlan " + error);
				if (error) {

					var msg = "db error :";
					sendResponse.sendErrorMessage(msg, res, 500);
				}
				else {
					result=reply;
					cb(null)
				}
			})
		},
		setPackage:['getCommission',function (cb) {
			var length=result.length;
			if(length == 0){
				cb(null);
			}
			console.log("error from setPackage ");
			for(var i=0;i<length;i++)
			{
				(function (i) {
					if(result[i].onOffComm==1 && result[i].commission_type == 1 && result[i].commisionButton == 1){
						setCommission(dbName,res,result[i],function (err,response,result1) {
							if(err){

								var msg = "db error :";
								sendResponse.sendErrorMessage(msg, res, 500);
							}
							else {
								if(result1.length){
									result[i].commission_package = response;
									/*result[i].first=0;
									result[i].second=0;
									result[i].third=0;*/
									//console.log(".....",result1);
									/*if(result1[0].commission>result[i].commission){
										result[i].first=result1[0].commission-result[i].commission;
									}
									if(result1[1].commission>result[i].commission){
										result[i].second=result1[1].commission-result[i].commission;
									}if(result1[2].commission>result[i].commission){
										result[i].third=result1[2].commission-result[i].commission;
									}*/

									if(i==(length-1)){
										cb(null);
									}
								}
								else {
									result[i].commission_package = response;
									/*result[i].first=0;
									result[i].second=0;
									result[i].third=0;*/
									if(i==(length-1)){
										cb(null);
									}
								}

							}
						});
					}
					else {
						result[i].commission_package=3;
						/*result[i].first=0;
						result[i].second=0;
						result[i].third=0;*/
						if(i==(length-1)){
							cb(null);
						}
					}
				}(i))
			}
		}]
	},function (err,response) {
		if(err){
			console.log("errr",err);
			var msg = "db error :";
			sendResponse.sendErrorMessage(msg, res, 500);
		}
		else {
			console.log("...............call.....................",result);
			if(result.length){
				callback(null,result)
			}
			else {
				callback(null,"NO PLAN")
			}
		}
	})

}

function setCommission(dbName,res,result1,callback){
	var data=result1;
	var comm= data.category_id;
	var commission=[];
	var sql1= 'select distinct(sc.commission) as commission from supplier_category sc join supplier s on sc.supplier_id = s.id where sc.onOffComm = 1 and sc.category_id = ? and sc.commission_type = 1  and s.commisionButton = 1 order by sc.commission DESC LIMIT 0,3'
	multiConnection[dbName].query(sql1,[comm],function(err,result){
		console.log("eee.....ee..",result);
		if(err){
			console.log("1....",err);
			sendResponse.somethingWentWrongError(res);
		}
		else {
			if(!(result[0])){
				result.push({'commission':0});
			}
			if(!(result[1])){
				result.push({'commission':0});
			}
			if(!(result[2])){
				result.push({'commission':0});
			}
			if(result[0].commission == data.commission){
				callback(null,2,result);
			}
			else if(result[1].commission == data.commission){
				callback(null,0,result);
			}
			else if(result[2].commission == data.commission){
				callback(null,1,result);
			}
			else
			{
				callback(null,3,result);
			}
		}
	})
}

function getSupplierPositioning(dbName,res, languageId, supplierId,callback) {
	//console.log("inside here")
	var categoryTotal;
	var categoryPosition;
	async.auto({
			getTotalValues: function (cb) {
				getCategoryWiseTotalValues(dbName,res, supplierId, function (err, result) {
					if (err) {
						console.log("rrr1",err);
						var msg = "something went wrong";
						return sendResponse.sendErrorMessage(msg, res, 500);
					}
					else {
						categoryTotal = result;
						cb(null);

					}

				});
			},
			getCategoryWisePositioning: function (cb) {
				getCategoryWisePositioning(dbName,res, supplierId, languageId, function (err, result) {
					if (err) {
						console.log("rrr2",err);
						var msg = "something went wrong";
						return sendResponse.sendErrorMessage(msg, res, 500);
					}
					else {
						categoryPosition = result;
						cb(null);

					}
				});
			},
			clubPositioning: ['getTotalValues', 'getCategoryWisePositioning', function (cb) {
				getPositionsCategoryWise(res, categoryTotal, categoryPosition, cb);
			}]
		}
		, function (err, response) {
			callback(null, response.clubPositioning)
		})
}

function getCategoryWiseTotalValues(dbName,res, supplierId, callback) {
	var sql = "select count(*) total,category_id from supplier_category where category_id IN ";
	sql += " (select category_id from supplier_category where supplier_id = ? group by category_id) group by category_id";
	multiConnection[dbName].query(sql, [supplierId], function (err, result) {
		if (err) {
			console.log("error from getCategoryWiseTotalValues " + err);
			var msg = "db error :";
			sendResponse.sendErrorMessage(msg, res, 500);
		}
		else {
			callback(null, result);
		}

	})

}

function getCategoryWisePositioning(dbName,res, supplierId, languageId, callback) {
	var data = [];
	var sql = "select category_id from supplier_category where supplier_id = ? group by category_id";
	multiConnection[dbName].query(sql, [supplierId], function (err, categories) {
		if (err) {
			console.log("error from getCategoryWiseTotalValues " + err);
			var msg = "db error :";
			sendResponse.sendErrorMessage(msg, res, 500);
		} else {
			for (var i = 0; i < categories.length; i++) {
				(function (i) {
					var sql2 = "select supplier_id,category_name,category_id,position from (SELECT s.supplier_id, ";
					sql2 += " a.name category_name,a.category_id category_id, @rownum := @rownum + 1 AS position FROM supplier_category s ";
					sql2 += " join categories_ml a on a.category_id =s.category_id,(SELECT @rownum := 0) r where ";
					sql2 += " s.category_id = ? and a.language_id = ? group by s.supplier_id) selection where supplier_id = ?";
					var statement = multiConnection[dbName].query(sql2, [categories[i].category_id, languageId, supplierId], function (err, response) {
						logger.debug("=============statement.sql=======in getCategoryWisePositioning=======",statement.sql)
						data.push({
							"category_id": response[0].category_id,
							"category_name": response[0].category_name,
							"position": response[0].position
						})
						if (i == categories.length - 1) {
							callback(null, data);
						}


					})


				}(i))

			}

		}

	})


}

function getPositionsCategoryWise(res, categoryTotal, categoryPosition, callback) {
	var categoryTotalLength = categoryTotal.length;
	for (var i = 0; i < categoryTotalLength; i++) {
		(function (i) {
			for (var j = 0; j < categoryTotalLength; j++) {
				(function (j) {
					if (categoryPosition[i].category_id == categoryTotal[j].category_id) {
						categoryPosition[i].total = categoryTotal[j].total;
						if (j == categoryTotalLength - 1) {
							if (i == categoryTotalLength - 1) {

								callback(null, categoryPosition);

							}
						}
					}
					else {
						if (j == categoryTotalLength - 1) {
							if (i == categoryTotalLength - 1) {

								callback(null, categoryPosition);

							}
						}
					}

				}(j))

			}

		}(i))

	}
}


function clubCommissionPlanAndPosition(res,commissionPackage,position,callback) {
	var first=0
	var second=0;
	var third=0;
	var onOffComm = 0;
	var commisionButton = 0;
	var  commission_type= 0;
	var  currentCommission= 0;
	for( var i = 0 ; i < position.length ; i++)
	{
		(function(i)
		{
			var package = 0;
			for( var j = 0 ; j < commissionPackage.length ; j++)
			{
				(function(j)
				{
					if(position[i].category_id == commissionPackage[j].category_id)
					{
						package = commissionPackage[j].commission_package;
						currentCommission=commissionPackage[j].commission;
						first=commissionPackage[j].first;
						second=commissionPackage[j].second;
						third=commissionPackage[j].third;
						onOffComm = commissionPackage[j].onOffComm;
						commisionButton = commissionPackage[j].commisionButton;
						commission_type= commissionPackage[j].commission_type;
						if(j == commissionPackage.length - 1)
						{
							position[i].commission_package = package;
							position[i].currentCommission = currentCommission;
						/*	position[i].first= first
							position[i].second =second;
							position[i].third=third;
							position[i].onOffComm=onOffComm;
							position[i].commisionButton=commisionButton;
							position[i].commission_type=commission_type;*/
							if(i == position.length - 1)
							{
								callback(null,position);
							}
						}

					}
					else{
						if(j == commissionPackage.length - 1)
						{
							position[i].commission_package = package;
							position[i].currentCommission = currentCommission;
						/*	position[i].first= first
							position[i].second =second;
							position[i].third=third;
							position[i].onOffComm=onOffComm;
							position[i].commisionButton=commisionButton;
							position[i].commission_type=commission_type;*/
							if(i == position.length - 1)
							{
								callback(null,position);
							}
						}
					}

				}(j))

			}

		}(i))

	}

}
