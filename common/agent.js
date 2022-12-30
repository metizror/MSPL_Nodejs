

var async = require('async');
var _ = require('underscore');
var constant = require('../routes/constant');
var consts = require('./../config/const');
let ExecuteQ = require('../lib/Execute')
var moment = require('moment');
var AdminMail = "ops@royo.com";
var log4js = require('log4js');
var logger = log4js.getLogger();
var chunk = require('chunk');
logger.level = config.get('server.debug_level');
var request = require('request');
var crypto = require('crypto')
algorithm = consts.SERVER.CYPTO.ALGO,
    crypto_password = consts.SERVER.CYPTO.PWD
const runTimeDbConnection = require('../routes/runTimeDbConnection');

function AgentRegisteration(params, file, secret_key) {
    logger.debug("========PARAMS==DATA!==", config.get("agent.api_link") + config.get("agent.registeration"), params, secret_key);
    return new Promise((resolve, reject) => {
        // logger.debug(file,file.file.path);
        request.post({
            headers: {
                // 'Content-Length': contentLength,
                // 'Content-Type': 'multipart/form-data',
                'secret_key': secret_key
            },
            url: config.get("agent.api_link") + config.get("agent.registeration"),
            method: "POST",
            formData: {
                offset: params.offset,
                name: params.name,
                phone_number: params.phone_number,
                email: params.email,
                area_id: params.area_id,
                supplier_id: params.supplier_id,
                experience: params.experience,
                occupation: params.occupation,
                file: file && file.file && file.file.path ? fs.createReadStream(file.file.path) : ""
            }
        }, function (error, response, body) {
            var data = body && body != undefined ? JSON.parse(body) : body
            logger.debug("===Body!==", body, "=====MES=", data);
            if (!error && data.statusCode == 200) {
                resolve()
            } else {
                logger.debug("===Else Body!==");
                reject(data.message);
            }
        })
    })

}

const AssignOrderToAgent = async (data, api_key, secret_key) => {
    logger.debug("=====DAa==AF===", data, api_key, secret_key);

    return new Promise((resolve, reject) => {
        request.post({
            headers: {
                'secret_key': secret_key,
                'api_key': api_key
            },
            url: config.get("agent.api_link") + config.get("agent.assign_order"),
            method: "POST",
            body: data,
            json: true
        }, function (error, response, body) {
            console.log("===Body!==", error, "=====MES=", body);
            // var data=body && body!=undefined?body.message:"Something Went Wrong !"       
            // if (!error && body.statusCode == 200) {
            resolve()
            //   } else {
            // reject(data.message);
            //   } 
        })
    })
}
const OrderItems = async (db_name, order_id) => {
    return new Promise((resolve, reject) => {
        var select_query = "select quantity,price,product_id as item_id,product_name as item_name, " +
            "product_desc as item_desc,product_name as item_name,image_path, " +
            "  sb.name as supplier_branch_name,sb.address as supplier_branch_address,sb.latitude,sb.longitude " +
            "from order_prices join supplier_branch sb on sb.id=order_prices.supplier_branch_id where order_id=?"
        multiConnection[db_name].query(select_query, [parseInt(order_id)], function (err, orderItemData) {
            if (err) {
                reject(err)
            }
            else {
                logger.debug("===ORder==Items==", orderItemData);
                resolve(orderItemData)
            }
        })
    })
}
const OrderDetail = async (db_name, order_id) => {


    var select_query = "select ors.grouping_id,  CONCAT(usr.firstname,usr.lastname) AS customer_name, " +
        " ors.drop_off_date,sp.name as supplier_name,IFNULL(ors.agent_verification_code,0) as agent_verification_code,ors.have_coin_change,ors.created_on,ors.schedule_date as delivered_on,ors.schedule_date as delivery_date,usr.mobile_no as customer_phone_number,usr.user_image as customer_image ,CAST(usr.id as CHAR(50)) as customer_id," +
        " spb.latitude as supplier_branch_latitude,spb.longitude as supplier_branch_longitude,spb.name as supplier_branch_name,ors.promo_discount,ors.promo_code,ors.wallet_discount_amount,ors.payment_type,ors.comment,ors.remarks,ors.urgent_price," +
        " ors.urgent,ors.tip_agent,ors.net_amount,ors.delivery_charges,ors.handling_supplier," +
        " ors.handling_admin,CAST(ors.id AS CHAR) as order_id " +
        " from orders ors inner join supplier inner join" +
        " supplier_branch spb on spb.id=ors.supplier_branch_id inner join supplier sp " +
        " on sp.id=spb.supplier_id inner join user usr on usr.id=ors.user_id where ors.id=? group by order_id"
    return new Promise(async (resolve, reject) => {
        try {
            let data = await ExecuteQ.Query(db_name, select_query, [parseInt(order_id)])
            if (data && data.length > 0) {
                resolve(data[0]);
            }
            else {
                resolve({})
            }
        }
        catch (Err) {
            logger.debug("==Agent=OrderDetail==>>", Err)
            reject(err)
        }
    })
}
const DeliveryAddress = async (db_name, order_id) => {
    return new Promise((resolve, reject) => {
        var select_query = "select usr.address_line_1,usr.address_line_2,usr.pincode,usr.city,usr.landmark, " +
            "usr.directions_for_delivery,usr.address_link,usr.latitude,usr.longitude,usr.customer_address from orders ors  inner join user_address usr on usr.id=ors.user_delivery_address where ors.id=?"
        multiConnection[db_name].query(select_query, [parseInt(order_id)], function (err, deliveryData) {
            if (err) {
                callback(err)
            }
            else {
                if (deliveryData && deliveryData.length > 0) {
                    deliveryData[0].type = 0
                    resolve(deliveryData[0])
                }
                else {
                    resolve({})
                }
            }
        })
    })
}
const KeyData = async (agent_connection, key_name) => {
    // logger.debug(agent_connection)
    return new Promise((resolve, reject) => {

        var assignQuery = "select `value` from cbl_keys where `key`=?";
        var st2 = agent_connection.query(assignQuery, [key_name], function (err, data) {
            logger.debug(st2.sql);
            if (err) {
                reject(err)
            }
            else {
                resolve(data[0].value)
            }
        })
    })
}
function GetAgentDbInformation(dbName) {
    // logger.debug("===dbName=========1",dbName);
    return new Promise(async (resolve, reject) => {
        // try{
        //     var sql ="select name,user,password,host from agent_db"
        //     logger.debug("+==========GetAgentDbInformation=================",dbName);
        //     let data=await ExecuteQ.Query(dbName,sql,[]);
        //     logger.debug("+==========GetAgentDbInformation====data=============",data);
        //         if(data && data.length>0){
        //             resolve(data[0])
        //         }
        //         else{
        //             resolve({})
        //         }
        // }
        // catch(Err){
        //     logger.debug("=======Err!==",Err)
        //     resolve({})
        // }
        var sql = "select name,user,password,host from agent_db"
        multiConnection[dbName].query(sql, [], function (err, data) {
            if (err) {
                reject(err)
            }
            else {
                // logger.debug("====DATA===",data);
                if (data && data.length > 0) {
                    resolve(data[0])
                }
                else {
                    reject()
                }
            }
        })
    })
}
function RunTimeAgentConnection(data) {
    var decipher = crypto.createDecipher(algorithm, crypto_password)
    var password = decipher.update(data.password, 'hex', 'utf8')
    password += decipher.final('utf8');
    // logger.debug("=====password===",password);
    return new Promise((resolve, reject) => {
        resolve(
            runTimeDbConnection.runTimeDbConnections(
                data.name,
                data.host,
                data.user,
                password
            )
        )
    })
}
const AddAgentAvailability = async (data, api_key, secret_key, token) => {
    logger.debug("=====DAa==AF===", data, api_key, secret_key);
    return new Promise((resolve, reject) => {
        request.post({
            headers: {
                'secret_key': secret_key,
                'api_key': api_key,
                'Authorization': token
            },
            url: config.get("agent.api_link") + config.get("agent.set_agent_availability"),
            method: "POST",
            body: data,
            json: true
        }, function (error, response, body) {
            logger.debug("===Body!==", error, "=====MES=", body);
            var data = body && body != undefined ? body.message : "Something Went Wrong !"
            if (!error && body.statusCode == 200) {
                resolve()
            } else {
                // logger.debug("===ERROR===",data,data.message)
                reject(data);
            }
        })
    })
}
const UpdateAgentAvailability = async (data, api_key, secret_key, token) => {
    logger.debug("=====DAa==AF===", data, api_key, secret_key);
    return new Promise((resolve, reject) => {

        request.put({
            headers: {
                'secret_key': secret_key,
                'api_key': api_key,
                'Authorization': token
            },
            url: config.get("agent.api_link") + config.get("agent.update_agent_availability"),
            method: "PUT",
            body: data,
            json: true
        }, function (error, response, body) {
            logger.debug("===Body!==", error, "=====MES=", body);
            var data = body && body != undefined ? body.message : "Something Went Wrong !"
            if (!error && body.statusCode == 200) {
                resolve()
            } else {
                // logger.debug("===ERROR===",data,data.message)
                reject(data);
            }
        })
    })
}
const GetAgentAvailability = async (secret_key, token, agentId = 0) => {
    console.log("GetAgentAvailability4>>>>>>>>>>>>>>>>secret_key,token,agentId", secret_key, token, agentId)
    return new Promise((resolve, reject) => {
        request.get({
            headers: {
                'secret_key': secret_key,
                'Authorization': token
            },
            url: config.get("agent.api_link") + config.get("agent.get_agent_availability") + "?id=" + agentId,
            method: "GET"
        }, function (error, response, body) {
            logger.debug("===Body!==", error, "=====MES=", body);
            console.log("===Body!==", error, "=====MES=", body)

            var data = body && body != undefined ? body.message : "Something Went Wrong !"
            if (!error && JSON.parse(body).statusCode == 200) {
                logger.debug("=======SUCCESS========");
                resolve(JSON.parse(body).data)
            } else {
                // logger.debug("===ERROR===",data,data.message)
                reject(data);
            }
        })
    })

}

const GetAgentAvailabilityV1 = async (secret_key, token, agentId = 0) => {
    return new Promise((resolve, reject) => {
        request.get({
            headers: {
                'secret_key': secret_key,
                'Authorization': token
            },
            url: config.get("agent.api_link") + "/v1/agent/getAvailability?id=" + agentId,
            method: "GET"
        }, function (error, response, body) {
            logger.debug("===Body!==", error, "=====MES=", body);

            var data = body && body != undefined ? body.message : "Something Went Wrong !"
            if (!error && JSON.parse(body).statusCode == 200) {
                logger.debug("=======SUCCESS========");
                resolve(JSON.parse(body).data)
            } else {
                // logger.debug("===ERROR===",data,data.message)
                reject(data);
            }
        })
    })

}

const addAgentsBlockTime = async (data, api_key, secret_key, token) => {
    logger.debug("=====DAa==AF===", data, api_key, secret_key);
    return new Promise((resolve, reject) => {
        request.post({
            headers: {
                'secret_key': secret_key,
                'api_key': api_key,
                'Authorization': token
            },
            url: config.get("agent.api_link") + "/agent/set_block_time",
            method: "POST",
            body: data,
            json: true
        }, function (error, response, body) {
            logger.debug("===Body!==", error, "=====MES=", body);
            var data = body && body != undefined ? body.message : "Something Went Wrong !"
            if (!error && body.statusCode == 200) {
                resolve()
            } else {
                // logger.debug("===ERROR===",data,data.message)
                reject(data);
            }
        })
    })
}

const DeleteAgentTime = async (secret_key, token, params) => {
    // logger.debug("==secret_key,token,id==",config.get("agent.api_link")+config.get("agent.delete_agent_timing")+"/"+params.slotId)
    return new Promise((resolve, reject) => {
        request.delete({
            headers: {
                'secret_key': secret_key,
                'Authorization': token
            },
            url: config.get("agent.api_link") + config.get("agent.delete_agent_timing") + "/" + params.slotId,
            method: "DELETE"
        }, function (error, response, body) {
            logger.debug("===Body!==", error, "=====MES=", body);

            var data = body && body != undefined ? body.message : "Something Went Wrong !"
            if (!error && JSON.parse(body).statusCode == 200) {
                logger.debug("=======SUCCESS========");
                resolve(JSON.parse(body).data)
            } else {
                // logger.debug("===ERROR===",data,data.message)
                reject(data);
            }
        })
    })

}
const AvailsAgentIds = async (data, api_key, secret_key) => {
    logger.debug("=====DAa==AF===", data, api_key, secret_key, config.get("agent.api_link") + config.get("agent.agent_service_list"));
    return new Promise((resolve, reject) => {
        request.post({
            headers: {
                'secret_key': secret_key,
                'api_key': api_key,
                // 'Authorization':token
            },
            url: config.get("agent.api_link") + config.get("agent.agent_service_list"),
            method: "POST",
            body: data,
            json: true
        }, function (error, response, body) {
            logger.debug("===Body!==", error, "=====MES=", body);
            var data = body && body != undefined ? body.message : "Something Went Wrong !"
            if (!error && body.statusCode == 200) {
                resolve(body.data)
            } else {
                reject(data);
            }
        })
    })
}
//used for getting screen flow 
const screenInfo = (dbName) => {
    return new Promise(async (resolve, reject) => {
        try {
            let screenData = await ExecuteQ.Query(dbName, "select `app_type`,`type`,`is_single_vendor` from screen_flow", [])
            resolve(screenData[0])
        }
        catch (Err) {
            reject(Err)
        }
        // multiConnection[dbName].query("select `app_type`,`type`,`is_single_vendor` from screen_flow ",(err,screenData)=>{
        //     if(err){
        //         reject(err)
        //     }
        //     else{
        //         resolve(screenData[0])
        //     }
        // })
    })
}
const AssignOrderToAgentByLocation = async (data, api_key, secret_key) => {
    logger.debug("=====DAa==AF===", data, api_key, secret_key);
    return new Promise((resolve, reject) => {
        console.log(" =============== ", JSON.stringify({
            headers: {
                'secret_key': secret_key,
                'api_key': api_key
            },
            url: config.get("agent.api_link") + config.get("agent.assign_order_by_location"),
            method: "POST",
            body: data,
            json: true
        }))
        request.post({
            headers: {
                'secret_key': secret_key,
                'api_key': api_key
            },
            url: config.get("agent.api_link") + config.get("agent.assign_order_by_location"),
            method: "POST",
            body: data,
            json: true
        }, function (error, response, body) {
            console.log("===Body!==", error, "=====MES=", body);
            // var data=body && body!=undefined?body.message:"Something Went Wrong !"       
            // if (!error && body.statusCode == 200) {
            resolve()
            //   } else {
            //     reject(data.message);
            //   } 
        })
    })
}
const AssignMultipleOrderToAgentByLocation = async (data, api_key, secret_key) => {
    logger.debug("=====DAa==AF===", data, api_key, secret_key);
    return new Promise((resolve, reject) => {
        console.log(" =============== ", JSON.stringify({
            headers: {
                'secret_key': secret_key,
                'api_key': api_key
            },
            url: config.get("agent.api_link") + config.get("agent.assign_multiple_order_by_location"),
            method: "POST",
            body: data,
            json: true
        }))
        request.post({
            headers: {
                'secret_key': secret_key,
                'api_key': api_key
            },
            url: config.get("agent.api_link") + config.get("agent.assign_multiple_order_by_location"),
            method: "POST",
            body: data,
            json: true
        }, function (error, response, body) {
            console.log("===Body!==", error, "=====MES=", body);
            // var data=body && body!=undefined?body.message:"Something Went Wrong !"       
            // if (!error && body.statusCode == 200) {
            resolve()
            //   } else {
            //     reject(data.message);
            //   } 
        })
    })
}

const AssignOrderToAgentByLocationV1 = async (data, api_key, secret_key) => {
    logger.debug("=====DAa==AF===", data, api_key, secret_key);
    return new Promise((resolve, reject) => {
        console.log(" =============== ", JSON.stringify({
            headers: {
                'secret_key': secret_key,
                'api_key': api_key
            },
            url: config.get("agent.api_link") + "/order/location/assignment/v1",
            method: "POST",
            body: data,
            json: true
        }))
        request.post({
            headers: {
                'secret_key': secret_key,
                'api_key': api_key
            },
            url: config.get("agent.api_link") + "/order/location/assignment/v1",
            method: "POST",
            body: data,
            json: true
        }, function (error, response, body) {
            console.log("===Body!==", error, "=====MES=", body);
            // var data=body && body!=undefined?body.message:"Something Went Wrong !"       
            // if (!error && body.statusCode == 200) {
            resolve()
            //   } else {
            //     reject(data.message);
            //   } 
        })
    })
}

const checkAgentExists = async (agent_connection, id) => {
    return new Promise((resolve, reject) => {
        let sql = "select cbu.name as firstname,cbu.* from cbl_user cbu where id = ?";
        agent_connection.query(sql, [id], (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        })
    })
}
const checkAgentExistsByToken = async (agent_connection, id) => {
    return new Promise((resolve, reject) => {
        let sql = "select * from cbl_user where access_token = ?";
        agent_connection.query(sql, [id], (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        })
    })
}

const updateAgentDetails = async (socket_id, updated_at, id, agent_connection) => {

    return new Promise((resolve, reject) => {
        var sql = "UPDATE `cbl_user` SET `socket_id`= ?, `updated_at`=? WHERE id = ?";
        agent_connection.query(sql, [socket_id, updated_at, id], function (err, data) {
            if (err) {
                console.log("==========err", err);
                return reject(err)
            }
            else {
                console.log("==::::::::::::=updatesockets", data);
                return resolve(data)
            }
        })
    })


};



const getagentDetails = async (agent_connection, agent_created_id) => {

    return new Promise((resolve, reject) => {
        var sql = "select * from cbl_user where agent_created_id = ?  and deleted_by= ?  ";
        let stmt = agent_connection.query(sql, [agent_created_id, 0], function (err, data) {
            logger.debug("==========stmt of agent selction+======", stmt.sql)
            if (err) {
                console.log("==========err", err);
                return reject(err)
            }
            else {
                if (data && data.length > 0) {
                    resolve(data)
                }
                else {
                    reject(data)
                }
            }
        })
    })
}

const getagentSocketDetails = async (agent_connection, id) => {

    return new Promise((resolve, reject) => {
        var sql = "select * from cbl_user where id = ?  and deleted_by= ?  ";
        let stmt = agent_connection.query(sql, [id, 0], function (err, data) {
            logger.debug("==========stmt of agent selction+======", stmt.sql)
            if (err) {
                console.log("==========err", err);
                return reject(err)
            }
            else {
                if (data && data.length > 0) {
                    resolve(data[0].socket_id)
                }
                else {
                    reject(data)
                }
            }
        })
    })
}
const ridesRegisteration = async (baseUrl, data, dbSecretKey) => {
    console.log("=====Rides=Registratio=inputData==", baseUrl, dbSecretKey, data);
    return new Promise((resolve, reject) => {
        if (dbSecretKey != "") {
            request.post({
                headers: {
                    'secretdbkey': dbSecretKey
                },
                url: baseUrl + config.get("server.rides.registeration"),
                method: "POST",
                body: data,
                json: true
            }, function (error, response, body) {
                console.log("===ridesRegisteration!==", error, "=====MES=", body);
                resolve()
            })
        }
        else {
            request.post({
                url: baseUrl + config.get("server.rides.registeration"),
                method: "POST",
                body: data,
                json: true
            }, function (error, response, body) {
                console.log("===ridesRegisteration!==", error, "=====MES=", body);
                resolve()
            })
        }

    })
}
const updateRidesOldToken = async (baseUrl, data, dbSecretKey) => {
    logger.debug("==baseUrl===Rides=Registratio=inputData==", baseUrl, data, config.get("server.rides.api_link") + config.get("server.rides.registeration"));
    return new Promise((resolve, reject) => {
        if (dbSecretKey != "") {
            request.post({
                headers: {
                    'secretdbkey': dbSecretKey
                },
                url: baseUrl + config.get("server.rides.updateToken"),
                method: "POST",
                body: data,
                json: true
            }, function (error, response, body) {
                logger.debug("===Body!==", error, "=====MES=", body);
                resolve()
            })
        }
        else {
            request.post({
                url: baseUrl + config.get("server.rides.updateToken"),
                method: "POST",
                body: data,
                json: true
            }, function (error, response, body) {
                logger.debug("===Body!==", error, "=====MES=", body);
                resolve()
            })
        }
    })
}

const AssignReturnOrderToAgent = async (data, api_key, secret_key) => {
    logger.debug("=====DAa==AF===", data, api_key, secret_key);

    return new Promise((resolve, reject) => {
        request.post({
            headers: {
                'secret_key': secret_key,
                'api_key': api_key
            },
            url: config.get("agent.api_link") + config.get("agent.return_assign_order"),
            method: "POST",
            body: data,
            json: true
        }, function (error, response, body) {
            console.log("===AssignReturnOrderToAgent=Erro==Boyd=", error, body)
            logger.debug("===Body!==", error, "=====MES=", body);
            var data = body && body != undefined ? body.message : "Something Went Wrong !"
            if (!error && body.statusCode == 200) {
                resolve()
            } else {
                reject(data.message);
            }
        })
    })
}

const AssignOrderToAgentByLocationV2 = async (data, api_key, secret_key) => {
    logger.debug("=====DAa==AF===", data, api_key, secret_key);
    return new Promise((resolve, reject) => {
        console.log(" =============== ", JSON.stringify({
            headers: {
                'secret_key': secret_key,
                'api_key': api_key
            },
            url: config.get("agent.api_link") + "/order/location/assignment/v2",
            method: "POST",
            body: data,
            json: true
        }))
        request.post({
            headers: {
                'secret_key': secret_key,
                'api_key': api_key
            },
            url: config.get("agent.api_link") + "/order/location/assignment/v2",
            method: "POST",
            body: data,
            json: true
        }, function (error, response, body) {
            console.log("===Body!==", error, "=====MES=", body);
            // var data=body && body!=undefined?body.message:"Something Went Wrong !"       
            // if (!error && body.statusCode == 200) {
            resolve()
            //   } else {
            //     reject(data.message);
            //   } 
        })
    })
}

module.exports = {
    AssignMultipleOrderToAgentByLocation: AssignMultipleOrderToAgentByLocation,
    AssignReturnOrderToAgent: AssignReturnOrderToAgent,
    updateRidesOldToken: updateRidesOldToken,
    ridesRegisteration: ridesRegisteration,
    screenInfo: screenInfo,
    AssignOrderToAgentByLocation: AssignOrderToAgentByLocation,
    AssignOrderToAgent: AssignOrderToAgent,
    OrderItems: OrderItems,
    DeliveryAddress: DeliveryAddress,
    OrderDetail: OrderDetail,
    KeyData: KeyData,
    GetAgentDbInformation: GetAgentDbInformation,
    RunTimeAgentConnection: RunTimeAgentConnection,
    AddAgentAvailability: AddAgentAvailability,
    UpdateAgentAvailability: UpdateAgentAvailability,
    GetAgentAvailability: GetAgentAvailability,
    DeleteAgentTime: DeleteAgentTime,
    AvailsAgentIds: AvailsAgentIds,
    checkAgentExists: checkAgentExists,
    updateAgentDetails: updateAgentDetails,
    checkAgentExistsByToken: checkAgentExistsByToken,
    getagentDetails: getagentDetails,
    getagentSocketDetails: getagentSocketDetails,
    addAgentsBlockTime: addAgentsBlockTime,
    AssignOrderToAgentByLocationV1: AssignOrderToAgentByLocationV1,
    AssignOrderToAgentByLocationV2: AssignOrderToAgentByLocationV2,
    GetAgentAvailabilityV1: GetAgentAvailabilityV1
}
