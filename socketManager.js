'use strict';
/**
 * Created by prince on 06/06/16.
 */
var freeAdmin = [];
const lib = require('./lib/NotificationMgr')
const common = require('./common');
const commonFunctions = require('./routes/commonfunction')
const pushNotification = require('./routes/pushNotifications')
const CONSTANT=require('./config/const');
const AgentCommon=require('./common/agent')
const constant = require('./routes/constant');
var moment = require('moment');
var log4js = require('log4js');
var randomize = require('randomatic');
var logger = log4js.getLogger();
var chunk = require('chunk');
logger.level = config.get('server.debug_level');
var consts=require('./config/const')
var crypto = require('crypto')
    algorithm = consts.SERVER.CYPTO.ALGO,
    crypto_password =  consts.SERVER.CYPTO.PWD
var socketInfo={}
let Execute = require('./lib/Execute');
var status = {
    'DISCONNECT':301,
    'TYPING':302,
    'STOP_TYPING':303,
    'NEW_MESSAGE':200,
    'NOT_FOUND':304,
    'NOT_FORMAT':401,
    'CONNECTED':201
}

exports.connectSocket = function (server) {
    if (!server.app) {
        server.app = {}
    }
    server.app.socketConnections = {};
    var socket = require('socket.io')(server);
    socket.on('disconnect', function(){
        //console.log('socket disconnected');
    });
    
    socket.on('connection', async function(socket){
        console.log("connection>>est############################################################")
        logger.debug("======",socketInfo[socket.handshake.query.id+socket.handshake.query.secretdbkey],socket.handshake.query,socket.id);
        // var user_id=server.user!=undefined?server.user.id:0
        // socketInfo[user_id]=socket.id;
        socketInfo[socket.handshake.query.id+socket.handshake.query.secretdbkey]=socket.id;
        if(socket.handshake.query.type!=undefined && socket.handshake.query.type!=""){
            socketInfo[socket.handshake.query.user_id+socket.handshake.query.secretdbkey+socket.handshake.query.type]=socket.id;
        }
        logger.debug("===<useronnection><admin/supplierconnection>:==>",socketInfo[socket.handshake.query.id], socketInfo[socket.handshake.query.user_id+socket.handshake.query.secretdbkey+socket.handshake.query.type]);

        if( socket && socket.handshake.query &&  socket.handshake.query.secretdbkey && socket.handshake.query.id  && socket.id ){
            // if( socket && socket.handshake.query && (socket.handshake.query.access_token || socket.handshake.query.access_token !=='') && socket.id 
            // && (socket.handshake.query.secretdbkey || socket.handshake.query.secretdbkey !=='')){
            
            var  senderId, senderDetails = [];

            let access_token    = socket.handshake.query.access_token;
            let secretdbkey      = socket.handshake.query.secretdbkey;
            let  updated_at     = await commonFunctions.currentUTC();

            logger.debug("=======access_token===secret_key=====",socket.handshake.query,  secretdbkey); 

            var  d_cipher    = crypto.createDecipher(algorithm,crypto_password);
            var dbName      = d_cipher.update(secretdbkey,'hex','utf8');
            dbName     += d_cipher.final('utf8');   
            logger.debug("==db_name=",dbName);

            var agent_db_data    = await AgentCommon.GetAgentDbInformation(dbName);
            
            logger.debug("==agent_db_data=",agent_db_data);

            var agent_connection  = await AgentCommon.RunTimeAgentConnection(agent_db_data);
            // logger.debug("================agetn=connection======",agent_connection)
            // Check Simple user Exists


            logger.debug("=======simpleuser==senderId=====**********", senderDetails);
            var  send_by_type = ""
            if(socket.handshake.query.userType==4){//ADMIN
                send_by_type = "ADMIN"
                logger.debug("============in 4===================")
                senderDetails   = await commonFunctions.checkAdminExists(socket.handshake.query.id,dbName);
                senderId =  senderDetails[0].user_created_id ;
                senderDetails[0].firstname="ADMIN"
                await commonFunctions.updateSupplierAdminDetails(socket.id,"4",updated_at,senderDetails[0].id,dbName); 
                logger.debug("======simpleadmin==senderId=", senderDetails[0].user_created_id);
            }else if(socket.handshake.query.userType==3){//SUPPLIER
                send_by_type = "SUPPLIER"
                logger.debug("============in 3===================")
                senderDetails   = await commonFunctions.checkSupplierExists(socket.handshake.query.id,dbName);
                senderId =  senderDetails[0].user_created_id ;
                await commonFunctions.updateSupplierAdminDetails(socket.id,"3", updated_at,senderDetails[0].id,dbName); 
                logger.debug("======simplesupplier==senderId=", senderDetails[0].user_created_id);
            }else if(socket.handshake.query.userType==2){//USER
                send_by_type = "USER"
                logger.debug("============in 2===================")
                senderDetails   = await commonFunctions.checkUserExists(socket.handshake.query.id,dbName);
                senderId =  senderDetails[0].user_created_id ;
                console.log("=====senderDetails==senderDetails=====senderId===senderId===",senderDetails,senderId)
                await commonFunctions.updateUserDetails(socket.id, updated_at,senderDetails[0].id,dbName); 
                logger.debug("======simpleuser==senderId=", senderDetails[0].user_created_id);
            }else if(socket.handshake.query.userType==1){//AGENT
                send_by_type = "AGENT"
                logger.debug("==============in 2==========")
                senderDetails = await AgentCommon.checkAgentExists(agent_connection, socket.handshake.query.id);
                logger.debug("=======checkAgentExists==senderId=", senderDetails);

            if(senderDetails.length > 0){
                    await AgentCommon.updateAgentDetails(socket.id, updated_at,senderDetails[0].id, agent_connection); 
                    logger.debug("=======RunTime==senderId=", senderDetails);
                    senderId             =  senderDetails[0].agent_created_id ;
                    logger.debug("=============senderDetails[0].socket_id=======================",senderDetails[0].socket_id)
                    senderDetails[0].socket_id = socket.id
                    logger.debug("=============senderDetails[0].socket_id=======================",senderDetails[0].socket_id)
                    logger.debug("=======senderDetails[0].created_on==RunTime=", senderId);
                }         
            }else if(senderDetails.length == 0 && senderDetails.length == undefined || senderDetails.length == null) {
                logger.debug("Auth Errorrrrrrrrrrrrrrrrrrrrrr Socket", access_token, socket.id);
                return socket.emit(CONSTANT.SERVER.SOCKET.ERROR.SOCKET_ERROR, CONSTANT.SERVER.SOCKET.ERROR_MSG.INVALID_AUTH_TOKEN, socket.handshake.query.id); //Not Work
            }
            

            /**@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
             *  updateSocket
             *
             * @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
             */

            //     logger.debug("========updated_at", updated_at);
            //    await commonFunctions.updateUserDetails(socket.id, updated_at,senderDetails[0].id);     

            socket.on('join_room', async (data,cb) => {
                try{
                var room_id = data.message_id;
                var name = data.username
                console.log(room_id," &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&=== room_id, name===",room_id,name)
                if(room_id=="" || room_id=="0"){
                    room_id =  randomize('Aa0', 64);
                }
                 
                socket.join(room_id);
                console.log(room_id," === room_id ===")
                socket.room = room_id;
                console.log(room_id," === room_id ===")
                cb({"status":200,"message":"success","data":{"room_id":room_id}});
                socket.broadcast.to(room_id).emit('updategroupchat',  name + ' has connected to this room');
               
            }
            catch(Err){
                console.log("==join_room=Err==>>",Err)
                cb({"status":200,"message":"success","data":{"room_id":room_id}});
            }

            });

            // socket.on('adduser', function(username) {
            //     socket.username = username;
            //     socket.room = 'Lobby';
            //     usernames[username] = username;
            //     socket.join('Lobby');
            //     socket.emit('updatechat', 'SERVER', 'you have connected to Lobby');
            //     socket.broadcast.to('Lobby').emit('updatechat', 'SERVER', username + ' has connected to this room');
            //     socket.emit('updaterooms', rooms, 'Lobby');
            // });
        
            // socket.on('create', function(room) {
            //     rooms.push(room);
            //     socket.emit('updaterooms', rooms, socket.room);
            // });
        
            // socket.on('sendchat', function(data) {
            //     io.sockets["in"](socket.room).emit('updatechat', socket.username, data);
            // });
        
            // socket.on('switchRoom', function(newroom) {
            //     var oldroom;
            //     oldroom = socket.room;
            //     socket.leave(socket.room);
            //     socket.join(newroom);
            //     socket.emit('updatechat', 'SERVER', 'you have connected to ' + newroom);
            //     socket.broadcast.to(oldroom).emit('updatechat', 'SERVER', socket.username + ' has left this room');
            //     socket.room = newroom;
            //     socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username + ' has joined this room');
            //     socket.emit('updaterooms', rooms, newroom);
            // });
        
            // socket.on('disconnect', function() {
            //     delete usernames[socket.username];
            //     io.sockets.emit('updateusers', usernames);
            //     socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
            //     socket.leave(socket.room);
            // });
          
            socket.on(CONSTANT.SERVER.SOCKET.CHAT.SEND_MESSAGE, async (data,cb) => {
                let offset;
                logger.debug("===========socket.handshake.query=========",socket.handshake.query)
                console.log("=====senderDetails==senderDetails=====senderId===senderId===",senderId,
                senderDetails[0].user_created_id,senderDetails);
                console.log("====sendMessage==input==> ", data);
                console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
                let receiver_created_id,sender_created_id;
                let is_message_id=data.detail.message_id
                var message_id = data.detail.message_id;
                console.log(data.detail.type,"bbbbbbbbbbbbbbbbbbbbbbbbbbbbb",constant.TYPE.AGENT)
                var receieverDetails =  []
                var  send_to_type = ""
                if(data.detail.type  == constant.TYPE.AGENT){

                    send_to_type="AGENT"
                    console.log("ccccccccccccccccccccccccccccccccccccccccccc")
                    receieverDetails =  await  AgentCommon.getagentDetails(agent_connection, data.detail.receiver_created_id);
                    sender_created_id=data.detail.sender_created_id;
                    receiver_created_id = receieverDetails[0].agent_created_id
                    console.log("11111111111111111111111111",receiver_created_id)
                    if(receieverDetails.length <= 0){
                        socket.emit(CONSTANT.SERVER.SOCKET.ERROR.PARAMETER_ERROR, CONSTANT.SERVER.SOCKET.ERROR_MSG.INVALID_RECEIVER_ID_REQUIRED, data);
                        cb({"status":400,"message":CONSTANT.SERVER.SOCKET.ERROR_MSG.INVALID_RECEIVER_ID_REQUIRED,"data":data});
                     }

                }
                else	if(data.detail.type ==  constant.TYPE.USER){
                    
                    send_to_type="USER"
                    receieverDetails =  await  commonFunctions.getrecieverDetails(data.detail.receiver_created_id,dbName);
                    receiver_created_id = receieverDetails[0].user_created_id;
                    sender_created_id=data.detail.sender_created_id;
                    if(receieverDetails.length <= 0){
                        cb({"status":400,"message":CONSTANT.SERVER.SOCKET.ERROR_MSG.INVALID_RECEIVER_ID_REQUIRED,"data":data});
                    }
                }

                else	if(data.detail.type ==  constant.TYPE.SUPPLIER){


                    send_to_type="SUPPLIER"
                    // if(socket.room!=undefined && socket.room!=""){
                    //     receiver_created_id = "";    
                    // }else{
                    receieverDetails =  await  commonFunctions.getrecieverSupplierAdminDetails(data.detail.receiver_created_id,"3",dbName);
                    receiver_created_id = receieverDetails[0].user_created_id
                    sender_created_id=data.detail.sender_created_id;
                    if(receieverDetails.length <= 0){
                         socket.emit(CONSTANT.SERVER.SOCKET.ERROR.PARAMETER_ERROR, CONSTANT.SERVER.SOCKET.ERROR_MSG.INVALID_RECEIVER_ID_REQUIRED, data);
                        cb({"status":400,"message":CONSTANT.SERVER.SOCKET.ERROR_MSG.INVALID_RECEIVER_ID_REQUIRED,"data":data});
                     }
                        //}

                }
                else	if(data.detail.type ==  constant.TYPE.ADMIN){


                    send_to_type="ADMIN"
                    console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
                    receieverDetails =  await  commonFunctions.getrecieverSuperAdminDetails(dbName,data.detail.receiver_created_id);
                    if(receieverDetails && receieverDetails.length<=0){
                        receieverDetails=await  commonFunctions.getrecieverSuperAdminDetailsV1(dbName);
                    }

                    // receiver_created_id = receieverDetails[0].user_created_id
                    // if(receieverDetails.length <= 0)
                    // return socket.emit(CONSTANT.SERVER.SOCKET.ERROR.PARAMETER_ERROR, CONSTANT.SERVER.SOCKET.ERROR_MSG.INVALID_RECEIVER_ID_REQUIRED, data);
                    receiver_created_id = "";
                    sender_created_id=data.detail.sender_created_id;

                }
                else{
                     socket.emit(CONSTANT.SERVER.SOCKET.ERROR.PARAMETER_ERROR, CONSTANT.SERVER.SOCKET.ERROR_MSG.INVALID_RECEIVER_TYPE, data);
                    cb({"status":400,"message":CONSTANT.SERVER.SOCKET.ERROR.PARAMETER_ERROR,"data":data});
                
                }
                
                // if(!data.detail.receiver_created_id && (socket.room==undefined || socket.room=="")){
                //      socket.emit(CONSTANT.SERVER.SOCKET.ERROR.PARAMETER_ERROR, CONSTANT.SERVER.SOCKET.ERROR_MSG.RECEIVER_ID_REQUIRED, data);
                //      cb({"status":400,"message":CONSTANT.SERVER.SOCKET.ERROR.PARAMETER_ERROR,"data":data});
                //     }


                // if(((data.detail.text == undefined) && (data.detail.original ==undefined) && (data.detail.thumbnail == undefined)))
                //     return socket.emit(CONSTANT.SERVER.SOCKET.ERROR.PARAMETER_ERROR, CONSTANT.SERVER.SOCKET.ERROR_MSG.MESSAGE_IS_REQUIRED, data);


                if(!data.detail.chat_type){
                     socket.emit(CONSTANT.SERVER.SOCKET.ERROR.PARAMETER_ERROR, CONSTANT.SERVER.SOCKET.ERROR_MSG.MESSAGE_TYPE_REQUIRED, data);
                     cb({"status":400,"message":CONSTANT.SERVER.SOCKET.ERROR.PARAMETER_ERROR,"data":data});
                    }
                // if(!data.detail.order_id)
                //     return socket.emit(CONSTANT.SERVER.SOCKET.ERROR.PARAMETER_ERROR, CONSTANT.SERVER.SOCKET.ERROR_MSG.ORDER_ID_REQUIRED, data);

                console.log("2222222222222222222222222222222222")

                if(data.detail.order_id && data.detail.order_id!=""){
                    let orderDetails =  await commonFunctions.getUserorderDetails(data.detail.order_id,dbName); 
                    
                    if(orderDetails.length <= 0){
                         socket.emit(CONSTANT.SERVER.SOCKET.ERROR.PARAMETER_ERROR, CONSTANT.SERVER.SOCKET.ERROR_MSG.INVALID_ORDER_ID, data);
                        cb({"status":400,"message":CONSTANT.SERVER.SOCKET.ERROR.PARAMETER_ERROR,"data":data});
                    }
                    else if(orderDetails.status == constant.ORDER_STATUS.DELIVERED){
                         socket.emit(CONSTANT.SERVER.SOCKET.ERROR.PARAMETER_ERROR, CONSTANT.SERVER.SOCKET.ERROR_MSG.ORDER_ALREADY_DELIVERED, data);
                         cb({"status":400,"message":CONSTANT.SERVER.SOCKET.ERROR.PARAMETER_ERROR,"data":data});
                        }
                    }else{
                    data.detail.order_id="";
                }

                if(data.detail.offset!==undefined && data.detail.offset!==""){
                    offset = data.detail.offset
                }else{
                    offset = "+05:30"
                }

                data.detail.sent_at =moment().utcOffset(offset).format("YYYY-MM-DD HH:mm:ss") 
                if(data.detail.text==undefined){ data.detail.text="" }
                if(data.detail.image_url==undefined){ data.detail.image_url="" }
               
                if(                    
                    (send_to_type == "ADMIN" && send_by_type == "AGENT") || 
                    (send_to_type == "ADMIN" && send_by_type == "USER") || 
                    (send_to_type == "ADMIN" && send_by_type == "SUPPLIER") || 
                    (send_to_type == "AGENT" && send_by_type == "ADMIN") || 
                    (send_to_type == "USER" && send_by_type == "ADMIN") || 
                    (send_to_type == "SUPPLIER" && send_by_type == "ADMIN")
                ){
                    if(socket.room!=undefined && socket.room!=""){
                        message_id = socket.room;
                    }
                    if(data.detail.message_id && data.detail.message_id!=""){
                        message_id = data.detail.message_id
                    }
                }
                data.detail.message_id = message_id;
                data.detail.message_id=data.detail.message_id==""?randomize('Aa0', 64):data.detail.message_id;
            
                console.log("=socket.room==",socket.room,"==message_id==",message_id)
                let insertMsgDetails =  await commonFunctions.insertMsgText(dbName,receiver_created_id,
                    senderId, data.detail.text, data.detail.image_url,data.detail.sent_at, data.detail.original,
                    data.detail.thumbnail, data.detail.chat_type, data.detail.order_id,data.detail.message_id,send_by_type,send_to_type);
                data.detail.sent_to = receiver_created_id
                data.detail.sent_by = senderId
                data.detail.c_id = insertMsgDetails.insertId
                if(parseInt(data.detail.sender_type)==constant.TYPE.ADMIN && parseInt(data.detail.type)==constant.TYPE.USER){
                    data.detail.is_admin=1
                }
                console.log("33333333333333333333333333333")
                
          
                

                // if(senderDetails[0].device_token && senderDetails[0].device_token != ''){
                    if(parseInt(data.detail.type) ==  constant.TYPE.ADMIN){
                        for(var i=0; i < receieverDetails.length; i++){     
                            receieverDetails[i]["device_token"]=receieverDetails[i].fcm_token!=undefined?receieverDetails[i].fcm_token:receieverDetails[i].device_token                                             
                            await pushNotification.chatmessagePushNotification(dbName,data.detail,receieverDetails[i],receiver_created_id,senderDetails,sender_created_id);
                        }
                    }
                    else{
                        await pushNotification.chatmessagePushNotification(dbName,data.detail,receieverDetails[0],receiver_created_id,senderDetails,sender_created_id);	
                    }
                    //     for(var i=0; i < receieverDetails.length; i++){                                                        
                    //         await pushNotification.chatmessagePushNotification(dbName,data.detail,receieverDetails[i],receieverDetails[i].user_created_id,senderDetails);
                    //     }
                    // }else{
                    // await pushNotification.chatmessagePushNotification(dbName,data.detail,receieverDetails[0],receiver_created_id,senderDetails,sender_created_id);	
                // }

                if ((receieverDetails[0] && receieverDetails[0].socket_id) || (socket.room!=undefined && socket.room!="")){
                    console.log("444444444444444444444444=da",data)
                    
                    // socket.to(socketIdToSend).emit(CONSTANT.SERVER.SOCKET.CHAT.SEND_MESSAGE,data);
                    
                    //if(socket.room!=undefined && socket.room!=""){
                    if(
                        (send_to_type == "ADMIN" && send_by_type == "AGENT") || 
                        (send_to_type == "ADMIN" && send_by_type == "USER") || 
                        (send_to_type == "ADMIN" && send_by_type == "SUPPLIER") || 
                        (send_to_type == "AGENT" && send_by_type == "ADMIN") || 
                        (send_to_type == "USER" && send_by_type == "ADMIN") || 
                        (send_to_type == "SUPPLIER" && send_by_type == "ADMIN")
                    ){
                        console.log("=====is_message_id====>>",is_message_id)
                        // if(is_message_id==""){
                        //     for(var i=0; i < receieverDetails.length; i++){ 
                        //         socket.broadcast.to(receieverDetails[i].socket_id).emit(CONSTANT.SERVER.SOCKET.CHAT.RECEIVE_MESSAGE, data);    
                        //       }
                        // }
                        if(receieverDetails && receieverDetails.length>0){
                            for(var i=0; i < receieverDetails.length; i++){ 
                                socket.broadcast.to(receieverDetails[i].socket_id).emit(CONSTANT.SERVER.SOCKET.CHAT.RECEIVE_MESSAGE, data);    
                              }
                        }
                        console.log(message_id,"555555555555555555555555555555555555",socket.room)
                     
                        cb({"status":200,"message":"success","data":data}); 
                        //socket.emit(CONSTANT.SERVER.SOCKET.CHAT.RECEIVE_MESSAGE,data)
                    }else{
                        console.log("########################################################")
                        console.log("receieverDetails[0].socket_id --- ",receieverDetails[0].socket_id)
                        console.log("data ---------- " , data)
                        console.log("########################################################")
                        socket.broadcast.to(receieverDetails[0].socket_id).emit(CONSTANT.SERVER.SOCKET.CHAT.RECEIVE_MESSAGE, data);
                        // socket.to(receieverDetails[0].socket_id).emit(CONSTANT.SERVER.SOCKET.CHAT.RECEIVE_MESSAGE ,data);
                        cb({"status":200,"message":"success","data":data}); 
                    }
                }
            });     

        } 

    socket.on(CONSTANT.SERVER.SOCKET.START.DISCONNECT, () => {
        logger.debug(socket.id, " has left rooms!!!!!!!!!!!!!!!!!id");
    });
    socket.on('on_the_way',async function(data){
                    //for user

                    let estimatedTimeInMinutes;

                    var decipher = crypto.createDecipher(algorithm, crypto_password)
                    // logger.debug("=-=--=-=-=-=-=-=-=-secretdbkey=-=-=-=-=-=-", data.client_secret_key);
                    var DbName = decipher.update(data.client_secret_key, 'hex', 'utf8');
                    DbName += decipher.final('utf8');
                    console.log('DbName',DbName);
                    
                    let GOOGLE_API_KEY = await common.getGoogleApiKey(DbName);
                    let userDetails = await common.getUserDetails(DbName,data.order_id);
                    let est_distance = await common.getUserDriverDistance(DbName,data.order_id);

                    let user_lat = userDetails && userDetails.length>0?userDetails[0].latitude:10.4805937;
                    let user_long = userDetails && userDetails.length>0?userDetails[0].longitude:-66.90360629999999


                    if (GOOGLE_API_KEY && GOOGLE_API_KEY.length > 0) {
                        logger.debug("=====1==========")
                        estimatedTimeInMinutes = await common.getEstimatedTime(DbName, GOOGLE_API_KEY,user_lat,user_long, data.latitude, data.longitude);
                    } else {
                        let default_api_key = config.get("google_keys.google_map_key");
                        estimatedTimeInMinutes = await common.getEstimatedTime(DbName,default_api_key,user_lat,user_long,data.latitude, data.longitude)
                    }
                    data.estimatedTimeInMinutes = estimatedTimeInMinutes
                    data.estimateddistance = est_distance[0].distance;
                    socket.to(socketInfo[data.user_id+data.client_secret_key]).emit("order_location",data);
                    //for admin 
                    socket.to(socketInfo[data.user_id+data.client_secret_key+"ADMIN"]).emit("order_location",data);
                    //for supplier
                    socket.to(socketInfo[data.user_id+data.client_secret_key+"SUPPLIER"]).emit("order_location",data);
                })

                socket.on('track_order',async function(data){
                    console.log("track-order>>>>>>>>>>>>>>>>>>>>>>>>",data)
                   if(data && data.order_id && data.secret_key  && data.access_token){
                       try{
                           console.log("Hi track-order1>>>>>>>>>>>>>>>>>>>>>>>>")
                           var d_cipher = crypto.createDecipher(algorithm,crypto_password)
                           var db_name = d_cipher.update(data.secret_key,'hex','utf8')
                           db_name += d_cipher.final('utf8');   

                           var agent_db_data=await AgentCommon.GetAgentDbInformation(db_name);
                           var agent_connections=await AgentCommon.RunTimeAgentConnection(agent_db_data);
                           //var sqlQuery="select `add`.`address_link`,`usr`.`latitude`,`usr`.`longitude`,`ors`.`order_id` from cbl_user_orders `ors` inner join cbl_user `usr` on `usr`.`id`=`ors`.`user_id` inner join cbl_user_order_address `add` on `add`.`order_id`=`ors`.`id` where `ors`.`order_id`=? and `ors`.`status`=?";
                           //here, we change, status=4 to --> staus=4 or status=3 by amit
                           var sqlQuery="select `add`.`address_link`,`usr`.`latitude`,`usr`.`longitude`,`ors`.`order_id` from cbl_user_orders `ors` inner join cbl_user `usr` on `usr`.`id`=`ors`.`user_id` inner join cbl_user_order_address `add` on `add`.`order_id`=`ors`.`id` where `ors`.`order_id`=? and (`ors`.`status` =? or `ors`.`status` =?)";
                           var response_data;
                           //here we pass one extra status 3 by amit
                           var st= agent_connections.query(sqlQuery,[data.order_id,4,3], async function(err,bData){
                               console.log("track_order2>>>>>>>>>>>>>>>>>>>>>>>>>>>bData",bData)
                            //    logger.debug(st.sql)
                               if(err){
                                   socket.emit('error_msg', CONSTANT.SERVER.SOCKET.ERROR.SOCKET_ERROR);
                               }
                               else{
                                logger.debug("===socket.id==========",bData);
                                   if(bData && bData.length>0){

                                        let est_distance = await common.getUserDriverDistance(db_name,data.order_id);
                                        bData[0].estimateddistance = est_distance[0].distance;
                                        socket.emit('order_location', bData[0]);
                                   }   
                                   else{
                                       socket.emit('order_location', {});
                                   }
                                 }
                               })                           
                       }                    
                       catch(Err){

                           logger.debug("===ERR!====",Err);

                           socket.emit('error_msg', CONSTANT.SERVER.SOCKET.ERROR.SOCKET_ERROR);
                       }
                   }
                   else{ 
                      socket.emit('error_msg', CONSTANT.SERVER.SOCKET.ERROR.SOCKET_ERROR);
                   } 
                })   

                socket.on('user_update_location',async function(data){
                    if(data && data.currentTime && data.table_booking_id && data.secret_key && data.latitude && data.longitude){
                    try{
                            let table_booking_id = data.table_booking_id==undefined?0:data.table_booking_id
                            let scheduleDateTime = "";
                            let distance_of_user_supplier = 0;
                            let notification_distance = 150;
                            let notification_time = 15;
                            let currentTime = data.currentTime
                            let supplier_id_new = 0
                            var d_cipher = crypto.createDecipher(algorithm,crypto_password)
                            var db_name = d_cipher.update(data.secret_key,'hex','utf8')
                            db_name += d_cipher.final('utf8');  
                            
                            let query_new = "update user_table_booked set user_on_the_way = 1 where id=?";
                            let params_new = [table_booking_id];
                            await Execute.Query(db_name,query_new,params_new);
                    
                           let sqlQuery =  "select utb.supplier_id,utb.branch_id as supplier_branch_id, u.id,u.latitude,u.longitude from user_table_booked utb "
                               sqlQuery += " join user u on u.id= utb.user_id where utb.id=?";
                    
                            let bData = await Execute.Query(db_name,sqlQuery,[table_booking_id]);
                    

                            let query = "update user set latitude = ? , longitude = ? where id=?";
                            let params = [data.latitude,data.longitude,bData[0].id];
                            logger.debug("=====db_name======",db_name)
                            await Execute.Query(db_name,query,params);


                    
                            let distanceOfUser = await common.getUserSupplierDistance(db_name,
                             bData[0].latitude,bData[0].longitude,bData[0].supplier_branch_id);
                    
                            let tableBookingDetails = await common.getTableBookingDetails(db_name,table_booking_id);
                             scheduleDateTime = tableBookingDetails[0].schedule_date
                    
                    
                    
                             let getTimeAndDistanceForNotif = await common.getDistanceAndTimeCheckForNotification(db_name)
                             if(getTimeAndDistanceForNotif && getTimeAndDistanceForNotif.length>0){
                                 notification_distance = getTimeAndDistanceForNotif[0].value,   
                                 notification_time = getTimeAndDistanceForNotif[1].value
                             }
                    
                              distance_of_user_supplier = distanceOfUser[0].distance;
                             let dataOfNotif = {
                                "type":"table_booking",
                                 "status": 0,
                                 "message":"You are near to restaurant, Now you can make an order",
                                 "orderId":{
                                     "supplier_branch_id":bData[0].supplier_branch_id,
                                     "supplier_id":bData[0].supplier_id
                                     }
                             }

                    
                             
                             
                            scheduleDateTime = new Date(scheduleDateTime); 
                            currentTime = new Date(currentTime);
                            let difference = scheduleDateTime.getTime() - currentTime.getTime(); // This will give difference in milliseconds
                            let resultInMinutes = Math.round(difference / 60000);


                           

                             if(parseInt(resultInMinutes)<parseInt(notification_time) && parseInt(distance_of_user_supplier)<parseInt(notification_distance)){
                                    let checkUserAlreadyInRange = await Execute.Query(db_name,
                                        "select user_in_range from user_table_booked where id=?",[table_booking_id]);
                                        
                                    if(checkUserAlreadyInRange && checkUserAlreadyInRange.length>0){
                                        if(parseInt(checkUserAlreadyInRange[0].user_in_range)!==1){
                                            
                                          
                                            let query_new = "update user_table_booked set user_in_range = 1 where id=?";
                                            let params_new = [table_booking_id];
                                            await Execute.Query(db_name,query_new,params_new);


                                            await common.saveadminsNotifications(db_name,bData[0].supplier_id,0,
                                                "You are near to restaurant, Now you can make an order",
                                                1,bData[0].id);
                                                await lib.sendFcmPushNotification(bData[0].device_token,
                                                    dataOfNotif,db_name);
                                        }
                                    }
                                
                                }

                    
                            if(bData && bData.length>0){
                             socket.broadcast.emit('user_location', bData[0]);
                            }else{
                             socket.broadcast.emit('user_location', {});
                            }                         
                        }                    
                        catch(Err){
                    
                            logger.debug("===ERR!====",Err);
                    
                            socket.emit('error_msg', CONSTANT.SERVER.SOCKET.ERROR.SOCKET_ERROR);
                        }
                    }

                  else if(data && data.user_id && data.secret_key  && data.latitude && data.longitude && data.order_id){
                       try{
                           var d_cipher = crypto.createDecipher(algorithm,crypto_password)
                           var db_name = d_cipher.update(data.secret_key,'hex','utf8')
                           db_name += d_cipher.final('utf8');  
                           logger.debug("]============dbname======",db_name)

                           let query = "update user set latitude = ? , longitude = ? where id=?";
                           let params = [data.latitude,data.longitude,data.user_id];
                           logger.debug("=====db_name======",db_name)
                           await Execute.Query(db_name,query,params);

                           var sqlQuery="select s.id as supplier_id,u.device_token,o.supplier_branch_id,u.latitude,u.longitude,o.id as order_id, sb.latitude as branch_latitude,sb.longitude as branch_longitude from orders o "
                               sqlQuery +=  "join user u on u.id = o.user_id join supplier_branch sb on sb.id = o.supplier_branch_id "
                               sqlQuery +=  "join supplier s on s.id = sb.supplier_id where o.id = ?";

                           let bData = await Execute.Query(db_name,sqlQuery,[data.order_id]);


                           let distanceOfUser = await common.getUserSupplierDistance(db_name,
                            bData[0].latitude,bData[0].longitude,bData[0].supplier_branch_id);
                            let distance = distanceOfUser[0].distance;
                            let dataOfNotif = {
                                "status": 0,
                                "message":"You are near to restaurant, Now you can make an order",
                                "orderId":{
                                    "supplier_branch_id":bData[0].supplier_branch_id,
                                    "supplier_id":bData[0].supplier_id
                                    },
                                "self_pickup":self_pickup
                            }
                            if(parseInt(distance)<1){
                                await lib.sendFcmPushNotification(bData[0].device_token, dataOfNotif,db_name);
                            }


                           if(bData && bData.length>0){
                            socket.broadcast.emit('user_location', bData[0]);
                           }else{
                            socket.broadcast.emit('user_location', {});
                           }                         
                       }                    
                       catch(Err){

                           logger.debug("===ERR!====",Err);

                           socket.emit('error_msg', CONSTANT.SERVER.SOCKET.ERROR.SOCKET_ERROR);
                       }
                   }
                   else{ 
                      socket.emit('error_msg', CONSTANT.SERVER.SOCKET.ERROR.SOCKET_ERROR);
                   } 
                })
         
        socket.on('adminConnection',function(data){ 
            if(data && data.id){
                 var d = freeAdmin.indexOf(data.id)
                if(d < 0){
                    freeAdmin.push(data.id);
                }
            }else{
                data.status = status.NOT_FORMAT;
                socket.emit('messageToAdmin', data);
            }
        })
        

        socket.on('messageToServer', function (data) {
            //Update SocketConnections
            if (data  && data.name && data.message && data.userId) {
                if(freeAdmin.length){
                    if (data && data.userId) {
                        if (server.app.socketConnections.hasOwnProperty(data.userId)) {
                            server.app.socketConnections[data.userId].socketId = socket.id;
                            data.status = status.NEW_MESSAGE;
                        
                            if(data.adminId == -1){
                                data.adminId = freeAdmin[0];
                                //console.log("freeAdmin.............",freeAdmin);
                                freeAdmin.shift();
                            }
                            process.emit('messageToAdmin',data);
                        } else {
                            server.app.socketConnections[data.userId] = {
                                socketId: socket.id
                            };
                            data.adminId = freeAdmin[0];
                            //console.log("freeAdmin;.....................................",freeAdmin);
                            
                            freeAdmin.shift();
             
                            data.status = status.NEW_MESSAGE;
                            process.emit('messageToAdmin',data);
                         
                        }
                    } else {
                        data.message = "data not in format";
                        data.status = status.NOT_FORMAT;
                        process.emit('messageFromServer',data);
                    }
                }else{
                    data.message = "no one  online ";
                    data.status = status.NOT_FOUND;
                    process.emit('messageFromServer',data);
                }
            }
            else {
                data.message = "data not in format";
                data.status = status.NOT_FORMAT;
                process.emit('messageFromServer',data);
            }
        });
        socket.on('messageFromAdmin', function (data) {
            //Update SocketConnections
            if (data  && data.name  && data.message && data.userId && data.adminId) {
                    if (data && data.userId) {
                        if (server.app.socketConnections.hasOwnProperty(data.adminId)) {
                            server.app.socketConnections[data.adminId].socketId = socket.userId;
                            data.status = status.NEW_MESSAGE;
                            process.emit('messageFromServer',data);
                        } else {
                            server.app.socketConnections[data.adminId] = {
                                socketId: socket.id
                            };
                            data.status = status.NEW_MESSAGE;
                            process.emit('messageFromServer',data);
                        }
                    } else {
                        data.message = "data not in format";
                        data.status = status.NOT_FORMAT;
                        process.emit('messageToAdmin',data);
                    }
                }else{
                    data.message = "data not in format ";
                    data.status = status.NOT_FORMAT;
                    process.emit('messageToAdmin',data);
                }
        });

        socket.on('disconnectFromApp', function(data){
            if(data  && data.name  && data.message && data.userId && data.adminId) {
                if (data && data.userId) {
                    if (server.app.socketConnections.hasOwnProperty(data.userId)) {
                        server.app.socketConnections[data.userId].socketId = socket.userId;
                        data.status = status.DISCONNECT;
                        data.message = "bye bye";
                        //console.log("..........................bye bye..........",data);
                        freeAdmin.push(data.adminId);
                        //console.log("..........................bye bye..........",freeAdmin);
                        process.emit('messageToAdmin',data);
                    } else {
                        server.app.socketConnections[data.userId] = {
                            socketId: socket.id
                        };
                        data.status = status.DISCONNECT;
                        data.message = "bye bye";
                        freeAdmin.push(data.adminId);
                        //console.log("..........................bye bye..........",freeAdmin);
                        process.emit('messageToAdmin',data);
                    }
                } else {
                    data.message = "data not in format";
                    data.status = status.NOT_FORMAT;
                    process.emit('messageToAdmin',data);
                }
            }else{
                data.message = "data not in format ";
                data.status = status.NOT_FORMAT;
                process.emit('messageToAdmin',data);
            }
        });

        socket.on('disconnectFromAdmin', function(data){
            if(data  && data.name  && data.message && data.userId && data.adminId) {
                if (data && data.userId) {
                    if (server.app.socketConnections.hasOwnProperty(data.adminId)) {
                        server.app.socketConnections[data.adminId].socketId = socket.userId;
                        data.status = status.DISCONNECT;
                        process.emit('messageFromServer',data);
                    } else {
                        server.app.socketConnections[data.adminId] = {
                            socketId: socket.id
                        };
                        data.status = status.DISCONNECT;
                        process.emit('messageFromServer',data);
                    }
                } else {
                    data.message = "data not in format";
                    data.status = status.NOT_FORMAT;
                    process.emit('messageToAdmin',data);
                }
            }else{
                data.message = "data not in format ";
                data.status = status.NOT_FORMAT;
                process.emit('messageToAdmin',data);
            }
        });


        socket.on('typingAdmin', function(data){
            if(data  && data.name  && data.message && data.userId && data.adminId) {
                if (data && data.userId) {
                    if (server.app.socketConnections.hasOwnProperty(data.adminId)) {
                        server.app.socketConnections[data.adminId].socketId = socket.adminId;
                        data.status = status.TYPING;
                        process.emit('typing',data);
                    } else {
                        server.app.socketConnections[data.adminId] = {
                            socketId: socket.id
                        };
                        data.status = status.TYPING;
                        process.emit('typing',data);
                    }
                } else {
                    data.message = "data not in format";
                    data.status = status.NOT_FORMAT;
                    process.emit('messageToAdmin',data);
                }
            }else{
                data.message = "data not in format ";
                data.status = status.NOT_FORMAT;
                process.emit('messageToAdmin',data);
            }
        });


        socket.on('typing', function(data){
            if(data  && data.userId && data.adminId) {
                if (data && data.userId) {
                    if (server.app.socketConnections.hasOwnProperty(data.userId)) {
                        server.app.socketConnections[data.userId].socketId = socket.userId;
                        data.status = status.TYPING;
                        process.emit('typingAdmin',data);
                    } else {
                        server.app.socketConnections[data.userId] = {
                            socketId: socket.id
                        };
                        data.status = status.TYPING;
                        process.emit('typingAdmin',data);
                    }
                } else {
                    var temp = {};
                    temp.message = "data not in format";
                    temp.status = status.NOT_FORMAT;
                    process.emit('messageFromServer',temp);
                }
            }else{
                data.message = "data not in format ";
                data.status = status.NOT_FORMAT;
                process.emit('messageFromServer',data);
            }
        });

        socket.on('stopTypingAdmin', function(data){
            if(data  && data.name  && data.message && data.userId && data.adminId) {
                if (data && data.userId) {
                    if (server.app.socketConnections.hasOwnProperty(data.adminId)) {
                        server.app.socketConnections[data.adminId].socketId = socket.adminId;
                        data.status = status.STOP_TYPING;
                        process.emit('stopTyping',data);
                    } else {
                        server.app.socketConnections[data.adminId] = {
                            socketId: socket.id
                        };
                        data.status = status.STOP_TYPING;
                        process.emit('stopTyping',data);
                    }
                } else {
                    data.message = "data not in format";
                    data.status = status.NOT_FORMAT;
                    process.emit('messageToAdmin',data);
                }
            }else{
                data.message = "data not in format ";
                data.status = status.NOT_FORMAT;
                process.emit('messageToAdmin',data);
            }
        });


        socket.on('stopTyping', function(data){
            if(data  && data.userId && data.adminId) {
                if (data && data.userId) {
                    if (server.app.socketConnections.hasOwnProperty(data.userId)) {
                        server.app.socketConnections[data.userId].socketId = socket.userId;
                        data.status = status.STOP_TYPING;
                        process.emit('stopTypingAdmin',data);
                    } else {
                        server.app.socketConnections[data.userId] = {
                            socketId: socket.id
                        };
                        data.status = status.STOP_TYPING;
                        process.emit('stopTypingAdmin',data);
                    }
                } else {
                    var temp = {};
                    temp.message = "data not in format";
                    temp.status = status.NOT_FORMAT;
                    process.emit('messageFromServer',temp);
                }
            }else{
                data.message = "data not in format ";
                data.status = status.NOT_FORMAT;
                process.emit('messageFromServer',data);
            }
        });

        socket.emit('messageFromServer', { message:'WELCOME TO royo',status:201});
        socket.emit('messageToAdmin', {status:status.CONNECTED});
    });

    //Customer Notifications :

    process.on('messageToAdmin',function(data){
        var sparkIdToSend = server.app.socketConnections[data.adminId.toString() || null]
            && server.app.socketConnections[data.adminId.toString() || null].socketId;

        //console.log(' messageToAdmin..........................', data);
        socket.emit('messageToAdmin',data);
    })

    process.on('messageFromServer',function(data){
        var sparkIdToSend = server.app.socketConnections[data.userId.toString() || null]
            && server.app.socketConnections[data.userId.toString() || null].socketId;

        //console.log('messageFromServer................................................', data)
        socket.emit('messageFromServer',data);

    })
    process.on('typing',function(data){
        var sparkIdToSend = server.app.socketConnections[data.userId.toString() || null]
            && server.app.socketConnections[data.userId.toString() || null].socketId;

        //console.log('typing.............................................', data)
        socket.emit('typing',data);

    })

    process.on('typingAdmin',function(data){
        var sparkIdToSend = server.app.socketConnections[data.userId.toString() || null]
            && server.app.socketConnections[data.userId.toString() || null].socketId;

        //console.log('typingAdmin.............................................', data);
        socket.emit('typingAdmin',data);

    })

    process.on('stopTyping',function(data){
        var sparkIdToSend = server.app.socketConnections[data.userId.toString() || null]
            && server.app.socketConnections[data.userId.toString() || null].socketId;
        
        
        //console.log('stopTyping.............................................', data);
        socket.emit('stopTyping',data);

    })



    process.on('stopTypingAdmin',function(data){
        var sparkIdToSend = server.app.socketConnections[data.userId.toString() || null]
            && server.app.socketConnections[data.userId.toString() || null].socketId;

        //console.log('stopTypingAdmin.............................................', data);
        socket.emit('stopTypingAdmin',data);

    })
    
    process.on('AdminIds',function(data){
        var sparkIdToSend = server.app.socketConnections[data.toString() || null]
            && server.app.socketConnections[data.toString() || null].socketId;
        var datas = {};
        datas.adminId = data;
        datas.status = 201;
        //console.log('AdminId.............................................', data);
        socket.emit('AdminId',data);    
    })
};
