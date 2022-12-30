const Execute=require('../lib/Execute')

/**
 * @description used for option change an status self-pickup or delivery or both
 * @param {*String} dbName 
 * @param {*Array} params 
 */
const updateStatus=(dbName,params)=>{
    return new Promise(async (resolve,reject)=>{
            try{
                let updateRecord=await Execute.Query(dbName,`update booking_cart_flow set is_pickup_order=? limit ?`,params)
                resolve(updateRecord)
            }
            catch(Err){
                reject(Err)
            }   
        })
}
module.exports={
    updateStatus:updateStatus
}