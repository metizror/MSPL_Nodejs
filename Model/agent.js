const {Query,QueryAgent} = require('../lib/Execute');

module.exports.getAgentDetailsById = (agentConnection,agentId)=>{
    
    let methodName = "getUserDetailsById";

    return new Promise(async(resolve,reject)=>{
        try{
            let query = `select id,email,phone_number as phoneNumber,
            country_code as countryCode
             from cbl_user where id=${agentId}`;
            let result = await QueryAgent(agentConnection,query,[]);
            resolve(result[0]);
        }catch(Error){
            logger.debug({methodName:methodName,Error:Error});
            reject(Error);
        }

    })
}
