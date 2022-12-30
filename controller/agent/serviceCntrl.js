
var sendResponse = require('../../routes/sendResponse');
var constant = require('../../routes/constant');
var CONSTS = require('./../../config/const')
var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = config.get('server.debug_level');
algorithm = CONSTS.SERVER.CYPTO.ALGO,
crypto_password = CONSTS.SERVER.CYPTO.PWD
const Execute = require('../../lib/Execute')
const Models = require('../../Model/')
/**
 * @desc used for getting the list of services for agent
 * @param {*Object} req 
 * @param {*Object} res 
 */
const serviceListForAgent = async (req, res) => {   
    try {
        let  {limit,offset,branchId,languageId,agentId,category_id} = req.query

         languageId = languageId!==undefined && languageId!==0?languageId:14
         agentId = agentId!==undefined && agentId!==0?agentId:0
         category_id = category_id!==undefined && category_id!==0?category_id:0
         branchId = branchId!==undefined && branchId!==0?branchId:0

        let serviceList = await Models.services.getServicesListingByBranchId(
            req.dbName,branchId,offset,limit,languageId,agentId,category_id
        )
        if(serviceList && serviceList.list.length>0){
            for(let i =0;i<serviceList.list.length;i++){
                serviceList.list[i].images =serviceList.list[i] && serviceList.list[i].images?JSON.parse(serviceList.list[i].images):[];
                logger.debug("============serviceList[i].images============", serviceList.list[i].images)
                if(i == (serviceList.list.length -1)){                     
                    sendResponse.sendSuccessData(serviceList, constant.responseMessage.SUCCESS, res, 200);
                }
            }
        }else{
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);

        }

        // let serviceList = await getServicesListingByBranchId(req.dbName,branchId,offset,limit,languageId,agentId);
        
    }
    catch (err) {
        logger.error(err);
        sendResponse.somethingWentWrongError(res);
    }
}
module.exports = {
    serviceListForAgent:serviceListForAgent
}