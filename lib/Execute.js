var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = config.get('server.debug_level');
var redis =require("redis");
var redisClient = redis.createClient( {
    host : config.get("server.redis.host")
    // password: "redis@123"
});
var redisClient = redis.createClient();

/**
 * @desc used for execute an mysql query
 * @param {*String} dbname 
 * @param {*String} query 
 * @param {*Array} params 
 */
const Query=(dbname,query,params)=>{
    
    return new Promise(async (resolve,reject)=>{
        console.log(dbname)
        try{
            multiConnection[dbname].getConnection(async function(err, mconnections) {
                try{
                        var st= mconnections.query({sql:query,values:params,timeout:60000},(err,data)=>{
                            
                            console.log("=======QUERY=STMT=",st.sql,err)
                            if(err){
                                reject(err)
                            }
                            else{
                                resolve(data);
                            }
                            mconnections.release();
                        })
                }
                catch(Err){
                    console.log("=====Query=Execution=Error>>",query,Err)
                    resolve([])
                }

            });
        }

        catch(Err){
            console.log("=======Query===Err==>>",Err)
            resolve([])
        }
    })
}

/**
 * @desc used for execute an mysql query
 * @param {*String} dbname 
 * @param {*String} query 
 * @param {*Array} params 
 */
const QueryV1=(req,dbname,query,params)=>{
    return new Promise(async (resolve,reject)=>{
        try{
        if(req.isCacheOn==1){

            redisClient.get(req.dbName+"_"+query,async function (err, redisData) {
                // logger.debug("====redisData===>>",redisData);

               if(redisData!=null){
                    let oData=JSON.parse(redisData);
                    // logger.debug("=========oData===>>",oData);
                    resolve(oData)
                   
               }
               else{
                multiConnection[dbname].getConnection(function(err, mconnections) {

                    var st= mconnections.query({sql:query,values:params,timeout:40000},(err,data)=>{
                        console.log(dbname)
                        console.log("=======QUERY=STMT=",st.sql,err)
                         if(err){
                             reject(err)
                         }
                         else{
                            //  logger.debug("======Setting An Cache===>>",req.dbName+"_"+query,data)
                            redisClient.set(req.dbName+"_"+query,JSON.stringify(data));
                            redisClient.expire(req.dbName+"_"+query,parseInt(req.cacheTime));

                             resolve(data);
                         }
                         mconnections.release();
                     });
                  });
               }

            })
        }

        else{
            
            multiConnection[dbname].getConnection(function(err, mconnections) {
                var st= mconnections.query(query,params,(err,data)=>{
                    console.log(dbname)
                    console.log("====QueryV1===QUERY=STMT=",st.sql,err)
                     if(err){
                         reject(err)
                     }
                     else{
                         resolve(data);
                     }
                     mconnections.release()
                 });
              });
        }
    }
    catch(Err){
        console.log("==========QueryV1=Err=>>",Err)
        resolve([])
    }
    })
}
const QueryAgent = (agentConnection,query,params)=>{
    return new Promise(async (resolve,reject)=>{
        try{
        var st = agentConnection.query(query,params,(err,data)=>{
            console.log("=======**==AgentQuery====**===",st.sql,err)
            if(err){
                reject(err)
            }else{
                resolve(data)
            }
        })
        }
        catch(Err){
            logger.debug("==========Err==>>",Err)
            resolve([])
        }
    })
}
module.exports={
    QueryV1:QueryV1,
    Query:Query,
    QueryAgent:QueryAgent
}