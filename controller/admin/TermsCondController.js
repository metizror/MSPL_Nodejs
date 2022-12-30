/**
 * ==============================================================================
 * created by cbl-147
 * @description used for performing an terms/condition related action from admin
 * ===============================================================================
 */
var async = require('async');
var sendResponse = require('../../routes/sendResponse');
var constant = require('../../routes/constant');
var consts=require('./../../config/const')
var _ = require('underscore');
var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = config.get('server.debug_level');
const ExecuteQ=require('../../lib/Execute')
var uploadMgr=require('../../lib/UploadMgr')

/**
 * @desc used for adding the TermsAndConditions
 */

const addTermsAndConditions = async (req,res)=>{

    try{
        let termsAndConditions = req.body.termsAndConditions!==undefined?req.body.termsAndConditions:["",""]
        let privacyPolicy = req.body.privacyPolicy!==undefined?req.body.privacyPolicy:["",""]
        let aboutUs = req.body.about_us!==undefined?req.body.about_us:["",""]
        let language_ids = req.body.language_ids
        let faqs = req.body.faqs==undefined?["",""]:req.body.faqs
        let cookie_policy = req.body.cookie_policy==undefined?["",""]:req.body.cookie_policy;
        let allergy_policy = req.body.allergy_policy==undefined?["",""]:req.body.allergy_policy;

        language_ids = language_ids.split("#")

        console.log("=======termsAndConditions====privacyPolicy===language_ids===",termsAndConditions,privacyPolicy,language_ids)

        let termsdata = await getTermsAndConditions(req.dbName)
        if(termsdata && termsdata.length>0){
            //update
            if(req.body.termsAndConditions!=undefined){
                // This condition used to update "Terms and Conditions"
                await updateTermsAndConditions(req.dbName,
                    termsAndConditions[0],
                    termsdata[0].faq,
                    termsdata[0].about_us,
                    termsdata[0].faqs,
                    termsdata[0].cookie_policy,
                    termsdata[0].allergy_policy,
                    termsdata[0].id)
                await updateTermsAndConditions(req.dbName,
                    termsAndConditions[1],
                    termsdata[1].faq,
                    termsdata[1].about_us,
                    termsdata[1].faqs,
                    termsdata[1].cookie_policy,
                    termsdata[1].allergy_policy,
                    termsdata[1].id)

            }
            else if(req.body.about_us!=undefined){
                // This condition used to update "Privacy Policy"
                await updateTermsAndConditions(req.dbName,
                    termsdata[0].terms_and_conditions,
                    termsdata[0].faq,
                    aboutUs[0],
                    termsdata[0].faqs,
                    termsdata[0].cookie_policy,
                    termsdata[0].allergy_policy,
                    termsdata[0].id)
                await updateTermsAndConditions(req.dbName,
                    termsdata[1].terms_and_conditions,
                    termsdata[1].faq,
                    aboutUs[1],
                    termsdata[1].faqs,
                    termsdata[1].cookie_policy,
                    termsdata[1].allergy_policy,
                    termsdata[1].id)
            }else if(req.body.faqs!=undefined){
                // This condition used to update "faq"
                await updateTermsAndConditions(req.dbName,
                    termsdata[0].terms_and_conditions,
                    termsdata[0].faq,
                    termsdata[0].aboutUs,
                    faqs[0],
                    termsdata[0].cookie_policy,
                    termsdata[0].allergy_policy,
                    termsdata[0].id)
                await updateTermsAndConditions(req.dbName,
                    termsdata[1].terms_and_conditions,
                    termsdata[1].faq,
                    termsdata[0].aboutUs,
                    faqs[1],
                    termsdata[1].cookie_policy,
                    termsdata[1].allergy_policy,
                    termsdata[1].id)
            }else if (req.body.cookie_policy!==undefined){
                // This condition used to update "cookie_policy"
                await updateTermsAndConditions(req.dbName,
                    termsdata[0].terms_and_conditions,
                    termsdata[0].faq,
                    termsdata[0].aboutUs,
                    termsdata[0].faqs,
                    cookie_policy[0],
                    termsdata[0].allergy_policy,
                    termsdata[0].id)
                await updateTermsAndConditions(req.dbName,
                    termsdata[1].terms_and_conditions,
                    termsdata[1].faq,
                    termsdata[1].aboutUs,
                    termsdata[1].faqs,
                    cookie_policy[1],
                    termsdata[1].allergy_policy,
                    termsdata[1].id)
            }else if (req.body.allergy_policy!==undefined){
                // This condition used to update "allergy_policy"
                await updateTermsAndConditions(req.dbName,
                    termsdata[0].terms_and_conditions,
                    termsdata[0].faq,
                    termsdata[0].aboutUs,
                    termsdata[0].faqs,
                    termsdata[0].cookie_policy,
                    allergy_policy[0],
                    termsdata[0].id)
                await updateTermsAndConditions(req.dbName,
                    termsdata[1].terms_and_conditions,
                    termsdata[1].faq,
                    termsdata[1].aboutUs,
                    termsdata[1].faqs,
                    termsdata[1].cookie_policy,
                    allergy_policy[1],
                    termsdata[1].id)
            }
            else{
                // This condition used to update "Privacy Policy"
                await updateTermsAndConditions(req.dbName,
                    termsdata[0].terms_and_conditions,
                    privacyPolicy[0],
                    termsdata[0].about_us,
                    termsdata[0].faqs,
                    termsdata[0].cookie_policy,
                    termsdata[0].allergy_policy,
                    termsdata[0].id)
                await updateTermsAndConditions(req.dbName,
                    termsdata[1].terms_and_conditions,
                    privacyPolicy[1],
                    termsdata[1].about_us,
                    termsdata[1].faqs,
                    termsdata[1].cookie_policy,
                    termsdata[1].allergy_policy,
                    termsdata[1].id)
            }
        }else{
            // This condition used to Insert terms and conditions and privacy policy
            await insertTermsAndConditions(
                req.dbName,
                termsAndConditions[0],
                privacyPolicy[0],
                aboutUs[0],
                faqs[0],
                cookie_policy[0],
                allergy_policy[0],
                language_ids[0]);
            await insertTermsAndConditions(
                req.dbName,
                termsAndConditions[1],
                privacyPolicy[1],
                aboutUs[1],
                faqs[1],
                cookie_policy[1],
                allergy_policy[1],
                language_ids[1]);
        }

        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch(err){
        console.log(err);
        sendResponse.somethingWentWrongError(res);
    }
}

const listTermsAndConditions = async (req,res)=>{

    try{
         let data = await getTermsAndConditions(req.dbName);
        sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch(err){
        console.log(err);
        sendResponse.somethingWentWrongError(res);
    }
}




async function getTermsAndConditions(dbName){
    return new Promise(async(resolve,reject)=>{
        try{
            let sql = "select * from terms_and_conditions"
            let params = []
            let data = await ExecuteQ.Query(dbName,sql,params)
            resolve(data) 
        }catch(err){
            logger.debug("==================ere========",err)
            reject(err)
        }
    })
}
async function insertTermsAndConditions(dbName,terms_and_conditions,privacyPolicy,aboutUs,faqs,language_id){
    return new Promise(async(resolve,reject)=>{
        try{
            let sql = "insert into terms_and_conditions(terms_and_conditions,faq,about_us,faqs,language_id) values(?,?,?,?,?)"
            let params = [terms_and_conditions,privacyPolicy,aboutUs,faqs,language_id]
            await ExecuteQ.Query(dbName,sql,params)
            resolve();

        }catch(err){
            logger.debug("==================errr-==========",err);
            reject(err)
        }
    })
}

async function updateTermsAndConditions(dbName,terms_and_conditions,privacyPolicy,aboutUs,faqs,cookie_policy,allergy_policy,id){
    return new Promise(async(resolve,reject)=>{
        try{
            let sql = "update terms_and_conditions set terms_and_conditions=?, faq=?,about_us=?,faqs=?,cookie_policy=?,allergy_policy=? where id=? "
            let params = [terms_and_conditions,privacyPolicy,aboutUs,faqs,cookie_policy,allergy_policy,id]
            await ExecuteQ.Query(dbName,sql,params)
            resolve();

        }catch(err){
            logger.debug("==================errr-==========",err);
            reject(err)
        }
    })
}


module.exports = {
    addTermsAndConditions : addTermsAndConditions,
    listTermsAndConditions : listTermsAndConditions
}