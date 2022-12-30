const async = require('async');
const sendResponse = require('./sendResponse');
const constant = require('./constant');
const func = require('./commonfunction');


const questionController = require('../controller/question/questionController');



exports.getAllQuestionsDetailByCategoryId=  (req, res)=>{
    const {categoryId} = req.query;

    async.waterfall([
            async function (cb) {
                questionController.getAllQuestionsDetailByCategoryId(req,categoryId,cb);
            }
        ], function (error, result) {

            console.log(result);

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );
};


exports.getQuestionsByCategoryId=  (req, res)=>{
    const {categoryId,languageId} = req.query;

    async.waterfall([
            // function (id, cb) {
            //     func.checkforAuthorityofThisAdmin(id, sectionId, res, cb);
            // },
            async function (cb) {
                questionController.findQuestionsByCategoryId(req,categoryId,14,cb);
            }
        ], function (error, result) {

            console.log(result);

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );
};

exports.getQuestionByQuestionId=  (req, res)=>{
    const questionId = req.query.questionId;
    var manValues = [questionId];
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            // function (id, cb) {
            //     func.checkforAuthorityofThisAdmin(id, sectionId, res, cb);
            // },
            async function (cb) {
                questionController.findQuestionsByQuestionId(req,questionId,cb);
            }
        ], function (error, result) {

            console.log(result);

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );
};

// exports.saveQuestionsByCategoryId=  (req, res)=>{

//     const accessToken = req.body.accessToken;
//     const categoryId = req.body.categoryId;
//     const questions = req.body.questions;

//     var manValues = [accessToken,categoryId, questions];

//     async.waterfall([
//             function (cb) {
//                 func.checkBlank(res, manValues, cb);
//             },
//             function (cb) {
//                 func.authenticateAccessToken(accessToken, res, cb);
//             },
//             async function (adminId, cb) {
//                 questionController.saveQuestionsByCategoryId(adminId,categoryId, questions,cb);
//             }
//         ], function (error, result) {

//             if (error) {
//                 sendResponse.somethingWentWrongError(res);
//             }
//             else {
//                 sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
//             }
//     }
//     );
// };

exports.editQuestion=  (req, res)=>{
    console.log('editQuestion',req.body);

    const accessToken = req.body.accessToken;
    const categoryId = req.body.categoryId;
    const questions = req.body.questions;
    var adminId = req.supplier && req.supplier.supplier_id || req.user.id
    var manValues = [accessToken,categoryId, questions];

    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            // function (cb) {
            //     func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            // },
            async function (cb) {
                questionController.editQuestionsByCategoryId(req,adminId,categoryId, questions,cb);
            }
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );
};

exports.deleteQuestionsByQuestionIds = (req, res)=>{
    const accessToken = req.body.accessToken;
    const questionIds = req.body.questions;
    var adminId =req.supplier && req.supplier.supplier_id || req.user.id;
    var manValues = [accessToken, questionIds];
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            // function (cb) {
            //     func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            // },
            async function (cb) {
                questionController.deleteQuestionsByQuestionIds(req,adminId,questionIds,cb);
            }
        ], function (error, result) {

            console.log(result);

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );
};


exports.getSupplierByServiceId = (req, res)=>{
    const languageId = req.body.languageId;
    const serviceIds = req.body.serviceIds;
    const user_id = req.body.user_id;
    const areaId = req.body.areaId;


    var manValues = [serviceIds];
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            // function (id, cb) {
            //     func.checkforAuthorityofThisAdmin(id, sectionId, res, cb);
            // },
            async function (cb) {
                questionController.getSupplierByServiceId(req,areaId,languageId,serviceIds, user_id ,cb);
            }
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );
};



