const { reject } = require('async');
const Universal = require('../util/Universal');
const request = require('request');

exports.bandwidth = async (otp, number,
	basicAuthUserName,basicAuthPassword,
	applicationId,userId,fromNumber) => {

	return new Promise((resolve, reject) => {
		try {
			const BandwidthMessaging = require('@bandwidth/messaging');
			BandwidthMessaging.Configuration.basicAuthUserName = basicAuthUserName; // The username to use with basic authentication
			BandwidthMessaging.Configuration.basicAuthPassword = basicAuthPassword;

			var body = new BandwidthMessaging.MessageRequest({
				from: fromNumber, // This must be a Catapult number on your account
				to: number,
				text: otp,
				applicationId: applicationId
			});
			BandwidthMessaging.APIController.createMessage(userId, body, (err, res) => {
				console.log("Authy user", err, res);
				if (err) reject(err);
				console.log('>>>>>>>>>>>>>>>>>>>>>>>>bandwidth res',res)
				resolve(res);
			});
		} catch (error) {
			console.log("Error in bandwidth function")
			reject(error);
		}
	})

};


exports.createAuthyUser = async (authy_production_key, payload) => {
	return new Promise(async(resolve, reject) => {
		try {
			const authy = require('authy')(authy_production_key);
			authy.register_user(payload.email, payload.phone, payload.country_code, (err, res) => {
				console.log("Authy user", err, res);
				if (err) reject(err);
				resolve(res);
			});
		} catch (error) {
			console.log("Error in authy function")
			reject(error);
		}
	})
};

exports.sendToken = async (authy_production_key, payload) => {
	return new Promise((resolve, reject) => {
		try {
			const authy = require('authy')(authy_production_key);
			authy.request_sms(payload, force = true, function (err, res) {
				if (err) reject(err);
				console.log("Authy user message", res);
				resolve(res);
			})
		} catch (error) {
			console.log("Error in authy function")
			reject(error);
		}
	})
};

exports.verifyToken = async (authy_production_key, payload) => {
	return new Promise((resolve, reject) => {
		try {
			const authy = require('authy')(authy_production_key);
			console.log("Data in payload", payload);
			authy.verify(payload.authy_id, payload.token, function (err, res) {
				if(err){
                    resolve(err); //reject(err);
                }else{
                    console.log(err,res);
                    resolve(res);
                } 
				
			});
		} catch (error) {
			console.log("Error in authy function")
			reject(error);
		}
	})
}

exports.sendSafaPaySms = async (message)=>{
	return new Promise(async(resolve,reject)=>{
		try{

			let safaPayKeys = await Universal.getSafaSmsPayKey(req.dbName);
	
			if(Object.keys(safaPayKeys).length>0){
	
				let safapay_username = safaPayKeys.safapay_username || "";
				let safapay_password = safaPayKeys.safapay_password || "";
				let safapay_number = safaPayKeys.safapay_number || "";
				let safapay_sender = safaPayKeys.safapay_username || "";
				
				
				let baseUrl ="https://www.safa-sms.com/api/sendsms.php?username="+safapay_username+"&password="+safapay_password+"&message="+message+"&numbers="+safapay_number+"&sender="+safapay_sender+"";
	
	
				var options = {
					method: 'GET',
					url: baseUrl,
					headers : {
						"content-type": "application/json",
					},
					json: true
				};
				console.log("---------options--------",options)
				request(options, async function (error, response, body) {
					logger.debug("---Err---->>",error,body);
					resolve();
				})
			}
			else{
				let Err="payment gateway not integrated or key not found"
				logger.debug("======ERR!!===>>",Err);

				resolve();
			}
		}
		catch(Err){
			logger.debug("======ERR!!===>>",Err);
			resolve();
		}
	})
}

exports.katrixSmsRequest=async (apiKey,message,phone,senderId)=>{
	return new Promise(async(resolve,reject)=>{
		try{
			
			let phoneWithoutPlus=phone.replace("+","");
			console.log("==phoneWithoutPlus==",phoneWithoutPlus)
		
				let baseUrl ="https://japi.instaalerts.zone/httpapi/QueryStringReceiver?ver=1.0&key="+apiKey+"&encrpt=0&dest="+phoneWithoutPlus+"&send="+senderId+"&text="+message+"";
				var options = {
					method: 'GET',
					url: baseUrl,
					headers : {
						"content-type": "application/json",
					},
					json: true
				};

				console.log("---------options--------",options)

				request(options, async function (error, response, body) {
					console.log("---Err---->>",error,body);
					resolve();
				})

		}
		catch(Err){
			console.log("======ERR!!===>>",Err);
			resolve();
		}
	})

}