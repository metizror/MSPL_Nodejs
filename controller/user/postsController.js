
var async = require('async');
var sendResponse = require('../../routes/sendResponse');
var constant = require('../../routes/constant');
var func = require('../../routes/commonfunction');
var CONSTS = require('./../../config/const')
const lib = require('../../lib/NotificationMgr')
var _ = require('underscore');
var fs = require('fs')
var web_request = require('request');
var something = "Something went wrong";
var client = require('twilio')("AC4b6d9ecd84afd6db7cf9ac5f055d7784", "782e67bf1f26170706acd639d757ae08");
var moment = require('moment');
var pushNotifications = require('../../routes/pushNotifications');
var orderFunction = require('../../routes/orderFunction');
var loginFunctions = require('../../routes/loginFunctions');
var Universal = require('../../util/Universal');
var randomstring = require("randomstring");
var log4js = require('log4js');
var logger = log4js.getLogger();
var chunk = require('chunk');
logger.level = config.get('server.debug_level');
var AdminMail = "ops@royo.com";
var crypto = require('crypto');
algorithm = CONSTS.SERVER.CYPTO.ALGO,
    crypto_password = CONSTS.SERVER.CYPTO.PWD
var uploadMgr = require('../../lib/UploadMgr')
var FormData = require('form-data');
var request = require('request');
const runTimeDbConnection = require('../../routes/runTimeDbConnection')
const Agent = require('../../common/agent');
var braintree = require("braintree");

const ExecuteQ = require('../../lib/Execute');
const { count } = require('console');


const createPost = async (req, res) => {
    try {
        let params = req.body

        let post_id = await savePostDetails(
            req.dbName,
            params.supplier_id==undefined || params.supplier_id==""?0:params.supplier_id,
            params.branch_id==undefined || params.branch_id==""?0:params.branch_id,
            params.user_id,
            params.heading,
            params.description,
            params.product_id==undefined || params.product_id==""?0:params.product_id,
        )

        let post_images = params.post_images==undefined || params.post_images==""?[]:params.post_images
        
        await savePostImages(
             req.dbName, post_id,
             post_images
             );

        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        logger.debug("============ERR!==", err);
        return sendResponse.sendErrorMessage(CONSTS.SERVER.ERROR_MSG.DEFAULT_ERROR.MSG, res, 400);
    }

}

const updatePost = async (req, res) => {
    try {
        let params = req.body

        await updatePostDetails(
            req.dbName,
            params.supplier_id==undefined || params.supplier_id==""?0:params.supplier_id,
            params.branch_id==undefined || params.branch_id==""?0:params.branch_id,
            req.users.id,
            params.heading,
            params.description,
            params.product_id==undefined || params.product_id==""?0:params.product_id,
            params.id
        )

        let post_images = params.post_images == undefined ? [] : params.post_images
        await saveAndUpdatePostImages(req.dbName, params.id, post_images);

        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        logger.debug("============ERR!==", err);
        return sendResponse.sendErrorMessage(CONSTS.SERVER.ERROR_MSG.DEFAULT_ERROR.MSG, res, 400);
    }

}

const savePostDetails = async (dbName, supplier_id, branch_id,
    user_id, heading, description, product_id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let query = "insert into posts(supplier_id,branch_id,user_id,heading,description,product_id) ";
            query += "values(?,?,?,?,?,?)"
            let params = [supplier_id, branch_id, user_id, heading, description, product_id]
            let result = await ExecuteQ.Query(dbName, query, params);
            resolve(result.insertId)
        } catch (error) {
            logger.debug("-----------", error);
            reject("Error during creating an postDetails")
        }
    })
}

const updatePostDetails = (dbName, supplier_id, branch_id,
    user_id, heading, description, product_id, post_id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let query = "update posts set supplier_id=?,branch_id=?,user_id=?,heading=?,description=?,";
            query += "product_id=? where id=?"
            let params = [supplier_id, branch_id, user_id, heading, description, product_id, post_id]
            let result = await ExecuteQ.Query(dbName, query, params);
            resolve()
        } catch (error) {
            logger.debug("-----------", error);
            reject("Error during updating an post")
        }
    })
}

const savePostImages = async (dbName, post_id, post_images) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (post_images && post_images.length > 0) {
                for (const [index, i] of post_images.entries()) {
                    let query = "insert into post_images(post_id,image) ";
                    query += "values(?,?)"
                    let params = [post_id, post_images[index]];
                    let result = await ExecuteQ.Query(dbName, query, params);
                    if (index == post_images.length - 1) {
                        resolve();
                    }
                }
            } else {
                resolve();
            }
        } catch (error) {
            logger.debug("-----------", error);
            reject("Error during saving images of post");
        }
    })
}


const saveAndUpdatePostImages = async (dbName, post_id, post_images) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (post_images && post_images.length > 0) {
                for (const [index, i] of post_images.entries()) {
                    logger.debug("========i======",i,i.id)
                    if (i.id==undefined) {
                        let query = "insert into post_images(post_id,image) ";
                        query += "values(?,?)"
                        let params = [post_id, i.image];
                        let result = await ExecuteQ.Query(dbName, query, params);
                    } else {

                        let query = "delete from post_images where id=?"
                        let params = [i.id];
                        let result = await ExecuteQ.Query(dbName, query, params);
                    }

                    if (index == post_images.length - 1) {
                        resolve();
                    }
                }
            } else {
                resolve();
            }
        } catch (error) {
            logger.debug("-----------", error);
            reject("Error during saving images of post");
        }
    })
}


const getPosts = async (req, res) => {
    try {
        let is_trending = req.query.is_trending!==undefined?req.query.is_trending:0
        let order_by = ""
        if(parseInt(is_trending)==1){
            order_by = " order by total_likes desc,total_comments desc "
        }else{
            order_by = " order by p.id desc"
        }
        let params = req.query
        let limit = params.limit != undefined ? params.limit : 20;
        let offset = params.offset != undefined ? params.offset : 0
        let user_id = params.user_id != undefined ? params.user_id : 0
        let query = "";
        let count_query = ""
        let param = []
        let count_param = []
        let result = []
        let count_result = []

        let block_condition = ""
        if(parseInt(user_id)>0){
            block_condition = " and u.id not in (SELECT blocked_user_id from post_user_block where blocked_by_user_id="+parseInt(user_id)+") "
        }
        // if (parseInt(user_id) != 0) {
        //     query = "select (select count(id) from post_likes where post_id=p.id) as total_likes, pr.name as product_name,pr.id as product_id, p.heading,p.description,p.id,s.name as supplier_name,s.email as supplier_email, "
        //     query += " (select count(id) from post_comments where post_id=p.id) as total_comments, s.id as supplier_id,u.firstname as user_name,u.email as user_email, "
        //     query += "sb.name as branch_name,sb.id as branch_id,sb.email as branch_email "
        //     query += "from posts p left join supplier s on s.id = p.supplier_id "
        //     query += "  join user u on u.id = p.user_id left join supplier_branch sb on sb.id = p.branch_id "
        //     query += "   left join supplier_branch_product sbp on sbp.product_id= p.product_id left join product pr on pr.id = p.product_id   where p.user_id=? and p.is_deleted=0 "+ order_by +" limit ?,? "

        //     param = [user_id, offset, limit]

        //     count_query = "select count(id) from posts where user_id=? and is_deleted=0"
        //     count_param = [user_id];
        // } else {

            query = "select u.user_image,p.created_at, (select count(id) from post_likes where post_id=p.id) as total_likes,pr.name as product_name,pr.id as product_id, p.heading,p.description,p.id,s.name as supplier_name,s.email as supplier_email, "
            query += " (select count(id) from post_comments where post_id=p.id) as total_comments, s.id as supplier_id,u.id as user_id,u.firstname as user_name,u.email as user_email, "
            query += "sb.name as branch_name,sb.id as branch_id,sb.email as branch_email "
            query += "from posts p left join supplier s on s.id = p.supplier_id "
            query += "join user u on u.id = p.user_id left join supplier_branch sb on sb.id = p.branch_id "
            query += "  left join supplier_branch_product sbp on sbp.product_id= p.product_id left join product pr on pr.id = p.product_id    where  p.is_deleted=0 " +block_condition+ " "+ order_by +" limit ?,? "

            param = [offset, limit]

            count_query = "select count(id) as total from posts where  is_deleted=0"
            count_param = [];


        // }   

        result = await ExecuteQ.Query(req.dbName, query, param);
        count_result = await ExecuteQ.Query(req.dbName, count_query, count_param);

        if (result && result.length > 0) {
            for (const [index, i] of result.entries()) {
                let images = await getPostImages(req.dbName, i.id);
                i.post_images = images;
            }
        }

        if(result && result.length>0){
            for(const [index,i] of result.entries()){
                let query = "select id from post_likes where post_id=? and user_id=? "
                let params = [i.id,user_id]
                let result = await ExecuteQ.Query(req.dbName,query,params);
                if(result && result.length>0){
                    i.already_like = 1;
                }else{
                    i.already_like = 0;
                }
            }
        }

        let finalData = {
            list: result,
            count: count_result && count_result.length > 0 ? count_result[0].total : 0
        }
        sendResponse.sendSuccessData(finalData, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        logger.debug("============ERR!==", err);
        return sendResponse.sendErrorMessage(CONSTS.SERVER.ERROR_MSG.DEFAULT_ERROR.MSG, res, 400);
    }

}

const postDetails = async (req, res) => {
    try {
        let id = req.query.id
            query = "select u.user_image,(select count(id) from post_likes where post_id=p.id) as total_likes, pr.name as product_name,pr.id as product_id, p.heading,p.description,p.id,s.name as supplier_name,s.email as supplier_email, "
            query += " (select count(id) from post_comments where post_id=p.id) as total_comments, s.id as supplier_id,u.firstname as user_name,u.email as user_email, "
            query += "sb.name as branch_name,sb.id as branch_id,sb.email as branch_email "
            query += "from posts p left join supplier s on s.id = p.supplier_id "
            query += "  join user u on u.id = p.user_id left join supplier_branch sb on sb.id = p.branch_id "
            query += "   left join supplier_branch_product sbp on sbp.product_id= p.product_id left join product pr on pr.id = p.product_id   where p.id=?"

            param = [id]

        result = await ExecuteQ.Query(req.dbName, query, param);

        if (result && result.length > 0) {
            for (const [index, i] of result.entries()) {
                let images = await getPostImages(req.dbName, i.id);
                i.post_images = images;
            }
        }
        if(result[0].product_id!==undefined){
            for (const [index, i] of result.entries()) {
                let q = "select image_path from product_image where product_id=?";
                let p = [i.product_id];
                i.default_product_images = await ExecuteQ.Query(req.dbName,q,p);
            }
        }


        sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        logger.debug("============ERR!==", err);
        return sendResponse.sendErrorMessage(CONSTS.SERVER.ERROR_MSG.DEFAULT_ERROR.MSG, res, 400);
    }

}

const getPostImages = async (dbName, post_id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let query = "select id, image from post_images where post_id=?";
            let params = [post_id];
            let result = await ExecuteQ.Query(dbName, query, params);
            resolve(result);
        } catch (err) {
            logger.debug(err);
            resolve()
        }
    })
}


const deletePost = async (req, res) => {
    try {
        console.log("======", req.params);
        let deleted_by = "user"
        let query = "update posts set is_deleted = 1,deleted_by=? where id=?";
        await ExecuteQ.Query(req.dbName, query, [deleted_by,req.params.id])

        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        logger.debug("============ERR!==", err);
        return sendResponse.sendErrorMessage(CONSTS.SERVER.ERROR_MSG.DEFAULT_ERROR.MSG, res, 400);
    }

}

const deletePostByAdmin = async (req, res) => {
    try {
        console.log("======", req.body);
        let deleted_by = "admin"
        let query = "update posts set is_deleted = 1,deleted_by=? where id=?";
        await ExecuteQ.Query(req.dbName, query, [deleted_by,req.body.id])

        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        logger.debug("============ERR!==", err);
        return sendResponse.sendErrorMessage(CONSTS.SERVER.ERROR_MSG.DEFAULT_ERROR.MSG, res, 400);
    }

}

const addPostComment = async (req, res) => {
    try {
        console.log("======", req.params)
        let params = req.params

        let query = "insert into post_comments(comment,post_id,user_id)";
        query += " values(?,?,?)"

        await ExecuteQ.Query(req.dbName, query,
            [req.body.comment, req.body.id, req.users.id])

        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        logger.debug("============ERR!==", err);
        return sendResponse.sendErrorMessage(CONSTS.SERVER.ERROR_MSG.DEFAULT_ERROR.MSG, res, 400);
    }

}

const updatePostComment = async (req, res) => {
    try {
        console.log("======", req.params)
        let params = req.body

        let query = "update post_comments set comment=? where id=?";

        await ExecuteQ.Query(req.dbName, query,
            [params.comment,params.id])

        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        logger.debug("============ERR!==", err);
        return sendResponse.sendErrorMessage(CONSTS.SERVER.ERROR_MSG.DEFAULT_ERROR.MSG, res, 400);
    }

}

const deletePostComment = async (req, res) => {
    try {
        console.log("======", req.params)
        let params = req.body

        let query = "delete from post_comments  where id=?";

        await ExecuteQ.Query(req.dbName, query,
            [params.id])

        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        logger.debug("============ERR!==", err);
        return sendResponse.sendErrorMessage(CONSTS.SERVER.ERROR_MSG.DEFAULT_ERROR.MSG, res, 400);
    }

}

const addPostLike = async (req, res) => {
    try {
        console.log("======", req.params)
        let params = req.params

        let query = "insert into post_likes(post_id,user_id)";
        query += " values(?,?)"

        await ExecuteQ.Query(req.dbName, query,
            [req.body.id, req.users.id])

        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        logger.debug("============ERR!==", err);
        return sendResponse.sendErrorMessage(CONSTS.SERVER.ERROR_MSG.DEFAULT_ERROR.MSG, res, 400);
    }

}

const getPostComments = async (req, res) => {
    try {
        let params = req.query
        let limit = params.limit != undefined ? params.limit : 20;
        let offset = params.offset != undefined ? params.offset : 0
        let post_id = params.post_id
        let query = "";
        let count_query = ""
        let param = []
        let count_param = []
        let result = []
        let count_result = []


        query = "SELECT u.user_image,pc.id,pc.comment,pc.user_id,u.firstname as user_name "
        query += "from posts p join post_comments pc on pc.post_id = p.id "
        query += "join user u on u.id = pc.user_id where p.id = ? limit ?,?"

        param = [post_id, offset, limit]

        count_query = "SELECT u.user_image,pc.id,pc.comment,pc.user_id,u.firstname as user_name "
        count_query += "from posts p join post_comments pc on pc.post_id = p.id "
        count_query += "join user u on u.id = pc.user_id where p.id = ?"

        count_param = [post_id];

        result = await ExecuteQ.Query(req.dbName, query, param);
        count_result = await ExecuteQ.Query(req.dbName, count_query, count_param);



        let finalData = {
            list: result,
            count: count_result && count_result.length > 0 ? count_result.length : 0
        }
        sendResponse.sendSuccessData(finalData, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        logger.debug("============ERR!==", err);
        return sendResponse.sendErrorMessage(CONSTS.SERVER.ERROR_MSG.DEFAULT_ERROR.MSG, res, 400);
    }

}

const getPostLikeUsers = async (req, res) => {
    try {
        let params = req.query
        let limit = params.limit != undefined ? params.limit : 20;
        let offset = params.offset != undefined ? params.offset : 0
        let post_id = params.post_id
        let query = "";
        let count_query = ""
        let param = []
        let count_param = []
        let result = []
        let count_result = []


        query = "SELECT u.user_image,pl.id,u.firstname as user_name,u.id as user_id "
        query += "from  posts p   join post_likes pl on p.id=pl.post_id  "
        query += "join user u on u.id = pl.user_id where  p.id = ? limit ?,?"

        param = [post_id, offset, limit]

        count_query = "SELECT u.user_image,u.firstname as user_name,u.id as user_id "
        count_query += "from  posts p   join post_likes pl on p.id=pl.post_id  "
        count_query += "join user u on u.id = pl.user_id where  p.id = ? "

        count_param = [post_id];

        result = await ExecuteQ.Query(req.dbName, query, param);
        count_result = await ExecuteQ.Query(req.dbName, count_query, count_param);



        let finalData = {
            list: result,
            count: count_result && count_result.length > 0 ? count_result.length : 0
        }
        sendResponse.sendSuccessData(finalData, constant.responseMessage.SUCCESS, res, 200);

    }
    catch (err) {
        logger.debug("============ERR!==", err);
        return sendResponse.sendErrorMessage(CONSTS.SERVER.ERROR_MSG.DEFAULT_ERROR.MSG, res, 400);
    }

}


const removePostLike = async (req, res) => {
    try {
        console.log("======", req.params)
        let params = req.body

        let query = "delete from post_likes where post_id=? and user_id=?";

        await ExecuteQ.Query(req.dbName, query,
            [params.post_id,params.user_id])

        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        logger.debug("============ERR!==", err);
        return sendResponse.sendErrorMessage(CONSTS.SERVER.ERROR_MSG.DEFAULT_ERROR.MSG, res, 400);
    }

}

const addReport = async (req, res) => {
    try {
        console.log("======", req.params)
        let params = req.body

        let query = "insert into post_reports (post_id,user_id,heading,description)";
        query += " values(?,?,?,?)"

        await ExecuteQ.Query(req.dbName, query,
            [params.post_id,params.user_id,params.heading,params.description])

        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        logger.debug("============ERR!==", err);
        return sendResponse.sendErrorMessage(CONSTS.SERVER.ERROR_MSG.DEFAULT_ERROR.MSG, res, 400);
    }

}


const listReports = async (req, res) => {
    try {
        console.log("======", req.params)
        let params = req.query

         
        let query = "select p.is_deleted,pr.heading,pr.description, p.id as post_id,u.id as reported_by_user_id, "
        query += "u.firstname as reported_by_user_name,u.email as reported_by_user_email,"
        query += "ur.id as reported_to_user_id,ur.firstname as reported_to_user_name,ur.email as reported_to_user_email "
        query += "from posts p join post_reports pr on p.id = pr.post_id join user u on pr.user_id = u.id  join user ur on ur.id = p.user_id "
        query += " order by pr.id desc limit 0,20 "

        let query2 = "select   p.id as post_id,u.id as user_id,u.firstname as user_name,u.email as user_email "
        query2 += "from posts p join post_reports pr on p.id = pr.post_id join user u on pr.user_id = u.id  join user ur on ur.id = p.user_id "
         
        let count_result = await ExecuteQ.Query(req.dbName,query2,[]);

        let result = await ExecuteQ.Query(req.dbName, query,
            [params.offset,params.limit])
        
            let data_final = {
                list : result,
                count : count_result && count_result.length>0?count_result.length:0
            }

        sendResponse.sendSuccessData(data_final, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        logger.debug("============ERR!==", err);
        return sendResponse.sendErrorMessage(CONSTS.SERVER.ERROR_MSG.DEFAULT_ERROR.MSG, res, 400);
    }

}

const blockUnblockUser = async (req, res) => {
    try {
        console.log("======", req.params)
        let params = req.body
        if(parseInt(params.is_block)==1){
            let query = "insert into post_user_block (blocked_by_user_id,blocked_user_id)";
            query += " values(?,?)"
    
            await ExecuteQ.Query(req.dbName, query,
                [params.blocked_by_user_id,params.blocked_user_id])
    
        }else{
            let query = "delete from post_user_block where blocked_by_user_id=? and blocked_user_id=? "
    
            await ExecuteQ.Query(req.dbName, query,
                [params.blocked_by_user_id,params.blocked_user_id])
    
        }

        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        logger.debug("============ERR!==", err);
        return sendResponse.sendErrorMessage(CONSTS.SERVER.ERROR_MSG.DEFAULT_ERROR.MSG, res, 400);
    }

}

const getBlockUsers = async (req, res) => {
    try {
        console.log("======", req.params)
        let params = req.body
        let query = "select bu.id,bu.firstname as user_name,bu.user_image "
        query += "from post_user_block pub join user ubb on ubb.id = pub.blocked_by_user_id "
        query += "join user bu on bu.id = pub.blocked_user_id where pub.blocked_by_user_id=? limit ?,?"

        let result = await ExecuteQ.Query(req.dbName, query,[req.users.id,params.offset,params.limit]);

        let query2 = "select bu.id,bu.firstname as user_name,bu.user_image "
        query2 += "from post_user_block pub join user ubb on ubb.id = pub.blocked_by_user_id "
        query2 += "join user bu on bu.id = pub.blocked_user_id where pub.blocked_by_user_id=? "

        let count_result = await ExecuteQ.Query(req.dbName, query2,[req.users.id])

// l      let final = {
//             list: result,
//             count : result2 && result2.length>0:result2.length:0
//         }

        let finalData = {
                list: result,
                count: count_result && count_result.length > 0 ? count_result.length : 0
        }

        sendResponse.sendSuccessData(finalData, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        logger.debug("============ERR!==", err);
        return sendResponse.sendErrorMessage(CONSTS.SERVER.ERROR_MSG.DEFAULT_ERROR.MSG, res, 400);
    }

}


module.exports = {
    createPost: createPost,
    getPosts: getPosts,
    deletePost: deletePost,
    deletePostByAdmin:deletePostByAdmin,
    updatePost: updatePost,
    addPostComment: addPostComment,
    addPostLike: addPostLike,
    getPostComments: getPostComments,
    getPostLikeUsers: getPostLikeUsers,
    updatePostComment:updatePostComment,
    deletePostComment:deletePostComment,
    removePostLike:removePostLike,
    postDetails:postDetails,
    addReport:addReport,
    listReports:listReports,
    blockUnblockUser:blockUnblockUser,
    getBlockUsers:getBlockUsers
}