const sharedConst = require('./const');
const Joi = require('joi');


/////////// Logger 

var log4js = require('log4js');
var logger = log4js.getLogger();

const queryExecute = async function(dbName,sql,sqlParams){
    return new Promise( (resolve,reject)=>{
        let statement=multiConnection[dbName].query(sql,sqlParams,function(err,result){
            logger.debug(".....queryExecute .........err..........................................",statement.sql);
           if(err){
                //  logger.debug(" queryExecute err",err);
                 reject(err);
            }else{
                resolve(result);
            }
        });
    })
};

exports.queryExecute = queryExecute;




exports.validateJsonModal = function(jsonModal, JoiSchema,callback){

    Joi.validate(jsonModal, JoiSchema, callback);

}
