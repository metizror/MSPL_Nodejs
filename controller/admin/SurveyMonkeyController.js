/**
 * ==========================================================================
 * created by Gagan
 * @description used for survey monkey apis
 * ==========================================================================
 */
var async = require('async');
var constant=require('../../routes/constant')
var sendResponse = require('../../routes/sendResponse');
var confg=require('../../config/const');
var _ = require('underscore'); 
//let ExecuteQ=require('../../lib/Execute');
let web_request=require('request');
const Universal = require('../../util/Universal')

var log4js=require("log4js")
var logger = log4js.getLogger();
var languageId = 14;
logger.level = 'debug';

var SurveyMonkeyAPI = require('survey-monkey'); 




/**
 * @description used to get survey Monkey Token
 * @param {*Object} req 
 * @param {*Object} res 
 */
const getSurveyMonkeyCode=async (req,res)=>{
    try{
        let surveMonkey_data = await Universal.getSurveyMonkeyKeys(req.dbName);
        logger.debug("====== data ====>>",surveMonkey_data)
        if( Object.keys(surveMonkey_data).length>0){
            web_request({
                method: 'POST',
                url: "https://api.surveymonkey.com/oauth/authorize",
                form: {
                    "response_type": "code",
                    "client_id": surveMonkey_data['survey_monkey_client_id'],
                    "redirect_uri": "http://localhost:8887/#!/surveyMonkey/survey-monkey"
                }
            }, async function (error, response, body) {
                console.log(error,"==================================",body)
                if(error){
                    return sendResponse.sendErrorMessage("Error",
                            res,400);
                }
                else{                
                    sendResponse.sendSuccessData(body, constant.responseMessage.SUCCESS, res, 200);
                }
            });
        }else{
            return sendResponse.sendErrorMessage(
                "Error",
                    res,400);
        }
    }
    catch(Err){
        console.log("======ERR!==",Err);
        sendResponse.somethingWentWrongError(res);
    }
}


/**
 * @description used to get survey Monkey Token
 * @param {*Object} req 
 * @param {*Object} res 
 */
const getSurveyMonkeyToken=async (req,res)=>{
    try{
        var code = req.query.code;
        let surveMonkey_data = await Universal.getSurveyMonkeyKeys(req.dbName);
        logger.debug("====== data ====>>",surveMonkey_data)
        if( Object.keys(surveMonkey_data).length>0){
            web_request({
                method: 'POST',
                url: "https://api.surveymonkey.net/oauth/token",
                form: {
                    "code": code,
                    "client_id": surveMonkey_data['survey_monkey_client_id'],
                    "client_secret": surveMonkey_data['survey_monkey_secret'],
                    "redirect_uri": "http://localhost:8887/#!/surveyMonkey/survey-monkey",
                    "grant_type": "authorization_code"
                }
            }, async function (error, response, body) {
                console.log(error,"==================================",body)
                if(error){
                    return sendResponse.sendErrorMessage(
                        "Error",
                        res,400);
                }
                else{                
                    sendResponse.sendSuccessData(body, constant.responseMessage.SUCCESS, res, 200);
                }
            });
        }else{
            return sendResponse.sendErrorMessage(
                "Error",
                res,400);
        }
    }
    catch(Err){
        logger.error("======ERR!==",Err);
        sendResponse.somethingWentWrongError(res);
    }
}

/**
 * @description used for (lising of surveys) or (details by id)
 * @param {*Object} req 
 * @param {*Object} res 
 */
const getSurvey=async (req,res)=>{
    try{
        var accessToken = req.query.accessToken;
        try {
            var SMApi = new SurveyMonkeyAPI(accessToken);
            console.log("SMApi ================= ",SMApi)
        } catch (err) {
            console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",err.message);
        }
        var surveyId = req.query.id ? req.query.id : "";
        if(surveyId!=""){
            SMApi.getSurveyDetails(surveyId)
            .then(function (data) {
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, 200);
            }, async function (error) {
                console.log("===getSurveyDetails====ERR!=====",error);
                return sendResponse.sendErrorMessage(
                    "qError",
                    res,400);
            })
        }else{
            SMApi.getSurveyList()
            // .then(data => console.log(data))
            // .catch(err => console.error(err))
            .then(function (data) {
                sendResponse.sendSuccessData(data.data, constant.responseMessage.SUCCESS, res, 200);
            },async function (error) {
                console.log("====getSurveyList===ERR!=====",error);
                return sendResponse.sendErrorMessage(
                    "1Error",
                    res,400);
            })
        }
    }
    catch(Err){
        logger.error("======ERR!==",Err);
        sendResponse.somethingWentWrongError(res);
    }
}


/**
 * @description used to get survey categories
 * @param {*Object} req 
 * @param {*Object} res 
 */
const getSurveyCategories=async (req,res)=>{
    try{
        var accessToken = req.query.accessToken;
        web_request({
            method: 'GET',
            url: "https://api.surveymonkey.net/v3/survey_categories",
            headers:
                { 
                    'Authorization': 'bearer ' + accessToken,
                    'Content-Type': 'application/json' 
                },
        }, async function (error, response, body) {
            console.log(error,"==================================",body)
            if(error){
                return sendResponse.sendErrorMessage("Error",
                        res,400);
            }
            else{
                var data  = JSON.parse(body);
                sendResponse.sendSuccessData(data.data, constant.responseMessage.SUCCESS, res, 200);
            }
        });
    }
    catch(Err){
        logger.error("======ERR!==",Err);
        sendResponse.somethingWentWrongError(res);
    }
}


/**
 * @description used to get Survey Templates
 * @param {*Object} req 
 * @param {*Object} res 
 */
const getSurveyTemplates=async (req,res)=>{
    try{
        var accessToken = req.query.accessToken;
        
        web_request({
            method: 'GET',
            url: "https://api.surveymonkey.net/v3/survey_templates",
            headers:
                { 
                    'Authorization': 'bearer ' + accessToken,
                    'Content-Type': 'application/json' 
                },
        }, async function (error, response, body) {
            console.log(error,"==================================",body)
            if(error){
                return sendResponse.sendErrorMessage("Error",
                        res,400);
            }
            else{
                var data  = JSON.parse(body);
                sendResponse.sendSuccessData(data.data, constant.responseMessage.SUCCESS, res, 200);
            }
        });
    }
    catch(Err){
        logger.error("======ERR!==",Err);
        sendResponse.somethingWentWrongError(res);
    }
}

/**
 * @description used to get (Survey Pages by survey id) or (survey page by survey id and page id)
 * @param {*Object} req 
 * @param {*Object} res 
 */
const getSurveyPage=async (req,res)=>{
    try{
        var accessToken = req.query.accessToken;
        var surveyId = req.query.id;
        var pageId = req.query.page_id ? req.query.page_id : "";
        if(pageId!=""){           
            web_request({
                method: 'GET',
                url: "https://api.surveymonkey.net/v3/surveys/"+surveyId+"/pages/"+pageId,
                headers:
                    { 
                        'Authorization': 'bearer ' + accessToken,
                        'Content-Type': 'application/json' 
                    },
            }, async function (error, response, body) {
                console.log(error,"==================================",body)
                if(error){
                    return sendResponse.sendErrorMessage("Error",
                            res,400);
                }
                else{
                    var data  = JSON.parse(body);
                    sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, 200);
                }
            });
        }else{
            
            web_request({
                method: 'GET',
                url: "https://api.surveymonkey.net/v3/surveys/"+surveyId+"/pages",
                headers:
                    { 
                        'Authorization': 'bearer ' + accessToken,
                        'Content-Type': 'application/json' 
                    },
            }, async function (error, response, body) {
                console.log(error,"==================================",body)
                if(error){
                    return sendResponse.sendErrorMessage("Error",
                            res,400);
                }
                else{
                    var data  = JSON.parse(body);
                    sendResponse.sendSuccessData(data.data, constant.responseMessage.SUCCESS, res, 200);
                }
            });
        }
    }
    catch(Err){
        logger.error("======ERR!==",Err);
        sendResponse.somethingWentWrongError(res);
    }
}


/**
 * @description used to (get Survey Page Question list) or (get Survey Page Question Details)
 * @param {*Object} req 
 * @param {*Object} res 
 */
const getSurveyPageQuestion=async (req,res)=>{
    try{
        var accessToken = req.query.accessToken;
        try {
            var SMApi = new SurveyMonkeyAPI(accessToken);
        } catch (err) {
            console.log(err.message);
        }
        var surveyId = req.query.id;
        var pageId = req.query.page_id;
        var questionId = req.query.question_id ? req.query.question_id : "";
        if(questionId!=""){            
            web_request({
                method: 'GET',
                url: "https://api.surveymonkey.net/v3/surveys/"+surveyId+"/pages/"+pageId+"/questions/"+questionId,
                headers:
                    { 
                        'Authorization': 'bearer ' + accessToken,
                        'Content-Type': 'application/json' 
                    },
            }, async function (error, response, body) {
                console.log(error,"==================================",body)
                if(error){
                    return sendResponse.sendErrorMessage("Error",
                            res,400);
                }
                else{
                    var data  = JSON.parse(body);
                    sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, 200);
                }
            });
        }else{
            
            web_request({
                method: 'GET',
                url: "https://api.surveymonkey.net/v3/surveys/"+surveyId+"/pages/"+pageId+"/questions",                 
                headers:
                    { 
                        'Authorization': 'bearer ' + accessToken,
                        'Content-Type': 'application/json' 
                    },
            }, async function (error, response, body) {
                console.log(error,"==================================",body)
                if(error){
                    return sendResponse.sendErrorMessage("Error",
                            res,400);
                }
                else{
                    var data  = JSON.parse(body);
                    sendResponse.sendSuccessData(data.data, constant.responseMessage.SUCCESS, res, 200);
                }
            });
        }
    }
    catch(Err){
        logger.error("======ERR!==",Err);
        sendResponse.somethingWentWrongError(res);
    }
}


/**
 * @description used to (get Survey Response by survey id) or (get details by response id)
 * @param {*Object} req 
 * @param {*Object} res 
 */
const getSurvayResponse=async (req,res)=>{
    try{
        var accessToken = req.query.accessToken;
        try {
            var SMApi = new SurveyMonkeyAPI(accessToken);
        } catch (err) {
            console.log(err.message);
        }
        var surveyId = req.query.id;
        var responseId = req.query.response_id ? req.query.response_id : "";
        if(responseId!=""){           
            web_request({
                method: 'GET',
                url: "https://api.surveymonkey.com/v3/surveys/"+surveyId+"/responses/"+responseId,
                headers:
                    { 
                        'Authorization': 'bearer ' + accessToken,
                        'Content-Type': 'application/json' 
                    },
            }, async function (error, response, body) {
                console.log(error,"==================================",body)
                if(error){
                    return sendResponse.sendErrorMessage("Error",
                            res,400);
                }
                else{
                    var data  = JSON.parse(body);
                    sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, 200);
                }
            });
        }else{            
            web_request({
                method: 'GET',
                url: "https://api.surveymonkey.com/v3/surveys/"+surveyId+"/responses",
                headers:
                    { 
                        'Authorization': 'bearer ' + accessToken,
                        'Content-Type': 'application/json' 
                    },
            }, async function (error, response, body) {
                console.log(error,"==================================",body)
                if(error){
                    return sendResponse.sendErrorMessage("Error",
                            res,400);
                }
                else{
                    var data  = JSON.parse(body);
                    sendResponse.sendSuccessData(data.data, constant.responseMessage.SUCCESS, res, 200);
                }
            });
        }
    }
    catch(Err){
        logger.error("======ERR!==",Err);
        sendResponse.somethingWentWrongError(res);
    }
}

/**
 * @description used to get bulk resposne of survey
 * @param {*Object} req 
 * @param {*Object} res 
 */
const getSurvayResponsesBulk=async (req,res)=>{
    try{
        var accessToken = req.query.accessToken;
        var surveyId = req.query.id;
        web_request({
            method: 'GET',
            url: "https://api.surveymonkey.com/v3/surveys/"+surveyId+"/responses/bulk",
            headers:
                { 
                    'Authorization': 'bearer ' + accessToken,
                    'Content-Type': 'application/json' 
                },
        }, async function (error, response, body) {
            console.log(error,"==================================",body)
            if(error){
                return sendResponse.sendErrorMessage("Error",
                        res,400);
            }
            else{
                var data  = JSON.parse(body);
                sendResponse.sendSuccessData(data.data, constant.responseMessage.SUCCESS, res, 200);
            }
        });
    }
    catch(Err){
        logger.error("======ERR!==",Err);
        sendResponse.somethingWentWrongError(res);
    }
}



/**
 * @description used to (get Collectro Response by collector id) or (get details by collector id)
 * @param {*Object} req 
 * @param {*Object} res 
 */
const getCollectorResponse=async (req,res)=>{
    try{
        var accessToken = req.query.accessToken;
        var collectorId = req.query.collector_id;
        var responseId = req.query.response_id ? req.query.response_id : "";
        if(responseId!=""){        
            web_request({
                method: 'GET',
                url: "https://api.surveymonkey.com/v3/collectors/"+collectorId+"/responses/"+responseId,
                headers:
                    { 
                        'Authorization': 'bearer ' + accessToken,
                        'Content-Type': 'application/json' 
                    },
            }, async function (error, response, body) {
                console.log(error,"==================================",body)
                if(error){
                    return sendResponse.sendErrorMessage("Error",
                            res,400);
                }
                else{
                    var data  = JSON.parse(body);
                    sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, 200);
                }
            });
        }else{            
            web_request({
                method: 'GET',
                url: "https://api.surveymonkey.com/v3/collectors/"+collectorId+"/responses",
                headers:
                    { 
                        'Authorization': 'bearer ' + accessToken,
                        'Content-Type': 'application/json' 
                    },
            }, async function (error, response, body) {
                console.log(error,"==================================",body)
                if(error){
                    return sendResponse.sendErrorMessage("Error",
                            res,400);
                }
                else{
                    var data  = JSON.parse(body);
                    sendResponse.sendSuccessData(data.data, constant.responseMessage.SUCCESS, res, 200);
                }
            });
        }
    }
    catch(Err){
        logger.error("======ERR!==",Err);
        sendResponse.somethingWentWrongError(res);
    }
}

/**
 * @description used to get bulk resposne of collector
 * @param {*Object} req 
 * @param {*Object} res 
 */
const getCollectorResponsesBulk=async (req,res)=>{
    try{
        var accessToken = req.query.accessToken;
        var collectorId = req.query.collector_id;
        web_request({
            method: 'GET',
            url: "https://api.surveymonkey.com/v3/collectors/"+collectorId+"/responses/bulk",
            headers:
                { 
                    'Authorization': 'bearer ' + accessToken,
                    'Content-Type': 'application/json' 
                },
        }, async function (error, response, body) {
            console.log(error,"==================================",body)
            if(error){
                return sendResponse.sendErrorMessage("Error",
                        res,400);
            }
            else{
                var data  = JSON.parse(body);
                sendResponse.sendSuccessData(data.data, constant.responseMessage.SUCCESS, res, 200);
            }
        });
    }
    catch(Err){
        logger.error("======ERR!==",Err);
        sendResponse.somethingWentWrongError(res);
    }
}



 module.exports={
    getSurveyMonkeyCode:getSurveyMonkeyCode,
    getSurveyMonkeyToken:getSurveyMonkeyToken,
    getSurvey:getSurvey,
    getSurveyCategories:getSurveyCategories,
    getSurveyTemplates:getSurveyTemplates,
    getSurveyPage:getSurveyPage,
    getSurveyPageQuestion:getSurveyPageQuestion,
    getSurvayResponse:getSurvayResponse,
    getSurvayResponsesBulk:getSurvayResponsesBulk,
    getCollectorResponse:getCollectorResponse,
    getCollectorResponsesBulk:getCollectorResponsesBulk
 }