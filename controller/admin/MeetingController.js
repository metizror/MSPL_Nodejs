"use strict";
const model=require("../../Model");
const sendResponse = require('../../routes/sendResponse');
const constant=require('../../routes/constant');
const Execute=require('../../lib/Execute');
const lib=require('../../lib/NotificationMgr')
class meeting{
    
static async  addUpdate(req,res,next){
    
    try{
        let _timing=req.body.timing;
        let _fromDate=req.body.from_date;
        let _toDate=req.body.to_date;
        let _offset=req.body.offset || "+05:30";
        let _dateId=req.body.dateId || 0;
        if(_dateId){
            await model.meeting.slots.deleteByDate(req.dbName,_dateId);
            await model.meeting.slots.addTiming(req.dbName,_timing,_dateId,_offset);
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
        }
        else{
            let _dateExist=await model.meeting.slots.dateExist(req.dbName,_fromDate)
            if(_dateExist && _dateExist.length>0){
                sendResponse.sendErrorMessageWithTranslation(req,'slots already exist you can modify it from calender', res, 400)
            }
            else{
            let _insertedId= await model.meeting.slots.addDate(req.dbName,_fromDate,_toDate);
            console.log("======_insertedId==>>",_insertedId)
            await model.meeting.slots.addTiming(req.dbName,_timing,_insertedId,_offset);
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
            }
        }
       
    }
    catch (err) {
        sendResponse.sendErrorMessageWithTranslation(req,'Something went wrong', res, 400)
    }
}
static async listing(req,res,next){
    try{
        let _meetingData=await model.meeting.slots.listTiming(req.dbName);
        sendResponse.sendSuccessData(_meetingData, constant.responseMessage.SUCCESS, res, 200);
    }
    catch(Err){
        sendResponse.sendErrorMessageWithTranslation(req,'Something went wrong', res, 400)
    }
}
static async deleteSlots (req,res,next){
    try{
        let _id=req.body.id;
        await model.meeting.slots.delete(req.dbName,_id)
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200); 
    }
    catch(Err){
        sendResponse.sendErrorMessageWithTranslation(req,'Something went wrong', res, 400);
    }
}
static async requestList(req,res,next){
    try{
        let agentId=req.agentId || 0;
        let _mRequest= await model.meeting.request.list(req.dbName,agentId);
        let _reqCount=await model.meeting.request.count(req.dbName,agentId);
        sendResponse.sendSuccessData({"request":_mRequest,"total":_reqCount[0].total}, constant.responseMessage.SUCCESS, res, 200); 
    }
    catch(Err){
        sendResponse.sendErrorMessageWithTranslation(req,'Something went wrong', res, 400);
    }
}
static async meetingRequestApprove(req,res,next){
    try{
        let _status=req.body.status;
        let _id=req.body.id;
        let _link=req.body.link;
        let fcmToken=[];
        let _agentData=await Execute.Query(req.dbName,`select am.start_time,am.end_time,agent.id,agent.device_token,agent.name from ${req.dbName}_agent.cbl_user agent join agent_meeting_slot_timings_request ams on ams.agent_id=agent.id join admin_meeting_slot_timings am on am.id=ams.slot_id  where ams.id=?`,[_id]);
        if(_agentData && _agentData.length>0){
            await model.meeting.request.approveDisapprove(req.dbName,_status,_id,_link);
            let msgStatus=req.body.status==1?"approved":"disapproved"
            let message="Hi, your meeting request has been "+msgStatus;
            let noteData = {
                "status": 0,
                "message":message,
                "type":"meeting",
            }
            fcmToken.push(_agentData[0].device_token)
            await lib.sendFcmPushNotification(fcmToken, noteData,req.dbName);
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200); 
        }
        else{
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200); 
        }
    }
    catch(Err){
        sendResponse.sendErrorMessageWithTranslation(req,'Something went wrong', res, 400);
    }
}
static async meetingRequestByAgent (req,res,next){
    try{
        let _slotId=req.body.id;
        let _agentId=req.agentId || 0;
        await model.meeting.request.add(req.dbName,_slotId,_agentId);
        let adminToken=await Execute.Query(req.dbName,`SELECT GROUP_CONCAT(fcm_token) as fcm_token FROM admin`);
        adminToken= adminToken && adminToken.length>0?adminToken[0].fcm_token.split(","):[""];
        console.log("===adminToken>>",adminToken)
        let message="Hi, new meeting request has been sent by"+req.agentName;
        let noteData = {
            "status": 0,
            "message":message,
            "type":"meeting",
        }
        await lib.sendFcmPushNotification(adminToken, noteData,req.dbName);
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200); 
    }
    catch(Err){
        console.log("=Err==>",Err)
        sendResponse.sendErrorMessageWithTranslation(req,'Something went wrong', res, 400);
    }
}
}
module.exports={
    meeting:meeting
}