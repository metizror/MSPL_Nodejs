const {Query} = require('../lib/Execute');

module.exports.getUserDetailsById = (dbName,userId)=>{
    let methodName = "getUserDetailsById";

    return new Promise(async(resolve,reject)=>{
        try{
            let query = `select id,email,mobile_no as phoneNumber,country_code as countryCode,
            firstname as name
             from user where id=${userId}`;
            let result = await Query(dbName,query,[]);
            resolve(result[0]);
        }catch(Error){
            logger.debug({methodName:methodName,Error:Error});
            reject(Error);
        }

    })
}
/**
 * used for update an User Detail
 */
class phone {
        constructor (dbName,mobileNumber,countryCode,userId){
            this.dbName=dbName
            this.mobileNumber=mobileNumber
            this.countryCode=countryCode
            this.userId=userId
        }
        // async updateDetail(sql,inputParams,dbName){
        async update() {
            console.log("====inputParams====>>",this.dbName);
            let data=await Query(this.dbName,"update user set country_code=?,mobile_no=? where id=?",[this.countryCode,this.mobileNumber,this.userId])
            return data
        }
}
module.exports.phone=phone
