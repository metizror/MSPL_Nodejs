

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
const common = require('../../common/agent');
const { reject } = require('underscore');
/**
 * @desc used for getting the list of services for agent
 * @param {*Object} req 
 * @param {*Object} res 
 */
const getLoyalityDetails = async (req, res) => {   
    try {
        let  {agent_id} = req.query

        let ordersNeeded = 0;

        // get agent db info
        let agentDbInfo = await common.GetAgentDbInformation(req.dbName);

        // to make agent runtime connection
        let agentDbCon = await common.RunTimeAgentConnection(agentDbInfo);

        // for getting how many orders agent deliver in last 30 days        
        let OrderDetails = await agentOrderDetails(agentDbCon,agent_id);

        // for getting agent loyalty level
        let loyalityLevel = await getLoyalityLevel(agentDbCon,OrderDetails[0].total);

        // handle case if agent not reach any loyalty level yet
        loyalityLevel = loyalityLevel && loyalityLevel.length>0?loyalityLevel[0] : null;

        let upcomingLevel = await getLoyalityUpcomingLevel(agentDbCon,OrderDetails[0].total);

        if(loyalityLevel && loyalityLevel.length>0){
            if(upcomingLevel && upcomingLevel.length>0){
                ordersNeeded = parseInt(upcomingLevel[0].total_orders)-parseInt(loyalityLevel[0].total_orders);
            }
        }else{
            ordersNeeded = parseInt(upcomingLevel[0].total_orders)
        }

        sendResponse.sendSuccessData(
          {
              loyalityLevel:loyalityLevel,
              ordersNeeded:ordersNeeded,
              // for getting agent default commission
              currentCommission: await getAgentCurrentCommission(agentDbCon,agent_id),
              totalOrderCompleted: OrderDetails[0].total
          },
            
            constant.responseMessage.SUCCESS, res, 200);

    }
    catch (err) {
        logger.error(err);
        sendResponse.somethingWentWrongError(res);
    }
}

// for getting how many orders agent deliver in last 30 days        
function agentOrderDetails(ageentDbCon,agent_id) {
    return new Promise(async(resolve,reject)=>{
        let query = `SELECT  COUNT(id) as total
        FROM    cbl_user_orders 
        WHERE   created_on BETWEEN CURDATE() - INTERVAL 30 DAY AND CURDATE()
        
        and user_id=? and status=5`;
        let data = await Execute.QueryAgent(ageentDbCon,query,[agent_id]);
        resolve(data);
    })
}

// for getting agent default commission
function getAgentCurrentCommission(ageentDbCon,agent_id) {
    return new Promise(async(resolve,reject)=>{
        let query = `SELECT  commission
        FROM    cbl_user WHERE   id=? `;
        let data = await Execute.QueryAgent(ageentDbCon,query,[agent_id]);
        resolve(data[0].commission);
    })
}

// for getting agent loyality level
function getLoyalityLevel(ageentDbCon,total_orders){
    return new Promise(async(resolve,reject)=>{
        let query = `select * from cbl_user_loyality_level where  total_orders<=? order by total_orders desc limit 1`;
        let data = await Execute.QueryAgent(ageentDbCon,query,[total_orders]);
        resolve(data);
    })
}

// for getting agent upcoming loyality level
function getLoyalityUpcomingLevel(ageentDbCon,total_orders){
    return new Promise(async(resolve,reject)=>{
        let query = `select * from cbl_user_loyality_level where  total_orders>? order by total_orders desc limit 1`;
        let data = await Execute.QueryAgent(ageentDbCon,query,[total_orders]);
        resolve(data);
    })
}

// for getting agent upcoming loyality levels
// function getUpcomingLoyalityLevel(ageentDbCon,total_orders){
//     return new Promise(async(resolve,reject)=>{
//         let query = `select * from cbl_user_loyality_level where  total_orders>=33`;
//         let data = await Execute.QueryAgent(ageentDbCon,query,[]);
//         resolve(data);
//     })
// }

module.exports = {
    getLoyalityDetails:getLoyalityDetails
}