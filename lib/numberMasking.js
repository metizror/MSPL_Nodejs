const AgentCommon = require('../common/agent');
const Models = require('../Model/');
const Universal = require('../util/Universal');
const randomString = require("randomstring");
const sendResponse = require('../routes/sendResponse');
let log4js = require('log4js');
let logger = log4js.getLogger();
logger.level = config.get('server.debug_level');


const createProxyService = async (accountSid, authToken, uniqueName) => {
	return new Promise(async(resolve, reject) => {
		try {
            const client = require("twilio")(accountSid, authToken);

            let serviceData = await  client.proxy.services
            .create({ uniqueName: uniqueName })
            
            resolve(serviceData);
            
		} catch (error) {
			console.log("Error in createProxyService",error);
			reject(error);
		}
	})
};

const createProxyServicePhone = async (accountSid, authToken, serviceSid, phonenumberSid) => {
	return new Promise(async(resolve, reject) => {
		try {
            const client = require("twilio")(accountSid, authToken);

            let servicePhoneData = await  client.proxy
            .services(serviceSid)
            .phoneNumbers.create({ sid: phonenumberSid });
            
            resolve(servicePhoneData);
            
		} catch (error) {
			console.log("Error in createProxyServicePhone",error);
			reject(error);
		}
	})
};

const createProxyServiceSession = async (accountSid, authToken, serviceSid,uniqueName,res) => {
	return new Promise(async(resolve, reject) => {
		try {
			console.log("===============createProxyServiceSession===========",
			accountSid, authToken, serviceSid,uniqueName)

            const client = require("twilio")(accountSid, authToken);


            let sessionData  = await  client.proxy.services(serviceSid)
            .sessions.create({ uniqueName: uniqueName, ttl:240 });
			
			console.log("===============sessionData===========",sessionData)

            resolve(sessionData);
            
		} catch (error) {
			console.log("Error in createProxyServiceSession",error);
			sendResponse.sendErrorMessage(error,res,400)

		}
	})
};


const createProxyServiceParticipant = async (accountSid,authToken,serviceSid, 
	sessionId, friendlyName, phoneNumber,res) => {
	return new Promise(async(resolve, reject) => {
		try {

			console.log("===============createProxyServiceParticipant===========",
            accountSid,authToken,serviceSid, sessionId, 
            friendlyName, phoneNumber,res
            )



			const client = require("twilio")(accountSid, authToken);
			
		
            let participant  = await client.proxy.services(serviceSid).sessions(sessionId)
                .participants.create({ friendlyName: friendlyName, identifier: phoneNumber });
				console.log("===============participant===========",participant)

            resolve(participant);
            
		} catch (error) {
			console.log("Error in createProxyServiceParticipant",error);
			sendResponse.sendErrorMessage("Error during createProxyServiceParticipant",res,400)
		}
	})
};

exports.getTwilioMaskedPhoneNumber = async (agentId,userId,orderId,res,dbName)=>{
    try{
        return new Promise(async(resolve,reject)=>{
            let agentDbData = await AgentCommon.GetAgentDbInformation(dbName);
            let agentConnection = await AgentCommon.RunTimeAgentConnection(agentDbData);
    
            let userDetails = await Models.users.getUserDetailsById(dbName,userId);
            let agentDetails = await Models.agents.getAgentDetailsById(agentConnection,agentId);
    
            let twilioData = await Universal.getTwilioData(dbName);
    
    
    
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
    
            let sessionData = await createProxyServiceSession(twilioData.account_sid,
                    twilioData.auth_token,twilioData.twillio_service_sid,sessionUniqueName);
    
            let participantUser = await createProxyServiceParticipant(
                        twilioData.account_sid,
                        twilioData.auth_token,
                        twilioData.twillio_service_sid,
                        sessionData.sid,
                        userDetails.name,
                        userPhoneNumber,
                        res);
    
            let participantAgent = await createProxyServiceParticipant(
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
    
            resolve(participants)
            }else{
                let errorMessge = "twilio keys not found";
                sendResponse.sendErrorMessage(errorMessge,res,400);
            }
        })
    }
    catch(err){
        logger.error("======err=======",err)
        let participants = {
            participantUser:{
                proxyIdentifier:""
            }

        }
        resolve(participants)
    }
}