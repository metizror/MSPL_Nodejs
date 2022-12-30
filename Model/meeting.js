'use strict';
const Execute=require('../lib/Execute');
let log4js = require('log4js');
let logger = log4js.getLogger();
logger.level = config.get('server.debug_level');
const _=require("underscore");
class slots{
     static async addDate(dbName,fromDate,toDate){
        return new Promise(async (resolve,reject)=>{
        try{
            let _dData=await Execute.Query(dbName,`select id from admin_meeting_available_dates where from_date=?`,[fromDate])
            if(_dData && _dData.length>0){
                resolve(_dData[0].id);
            }
            else{
                let _insertD=await Execute.Query(dbName,`insert into admin_meeting_available_dates(from_date,to_date) values(?,?)`,[fromDate,toDate])
                resolve(_insertD.insertId);
            }
        }
        catch(Err){
            console.log(Err)
            reject(Err);
        }
    })
    }
    static async dateExist(dbName,fromDate){
        return new Promise(async (resolve,reject)=>{
                try{
                    let _dData=await Execute.Query(dbName,`select am.id from admin_meeting_available_dates am join admin_meeting_slot_timings ams on ams.date_id=am.id where am.from_date=?`,[fromDate])
                    resolve(_dData);
                }
                catch(Err){
                    console.log(Err)
                    reject(Err);
                }
    })
    }
    static  async addTiming(dbName,timing,dateId,offset){
        return new Promise(async (resolve,reject)=>{
        try{    
            let _bulkTiming=[];
            for(const [index,i] of timing.entries()){
                _bulkTiming.push(i.start_time);
                _bulkTiming.push(i.end_time);
                _bulkTiming.push(dateId);
                _bulkTiming.push(offset);
            }
            let insertedVal=_.chunk(_bulkTiming,4);
            console.log("=timing==insertedVal>>",timing,insertedVal)
            await Execute.Query(dbName,`insert into admin_meeting_slot_timings(start_time,end_time,date_id,offset) values ?`,[insertedVal]);
            resolve(true);
        }
        catch(Err){
            reject(Err);
        }
    })
    }
    static async listTiming(dbName){
        try{
            let _data=await Execute.Query(dbName,`select am.*,(select CONCAT(
                '[',
                GROUP_CONCAT(
                  JSON_OBJECT(
                    'start_time', TIME_FORMAT(ams.start_time,'%H:%i'),
                    'end_time', TIME_FORMAT(ams.end_time,'%H:%i'),
                    "date_id",ams.date_id,
                    "id",ams.id
                  )
                ),
                ']'
              ) AS lists from admin_meeting_slot_timings ams where ams.date_id=am.id) as timing from
              admin_meeting_available_dates am`);
              return _data;
        }
        catch(Err){
            return Err;
        }

    }
    static  async deleteByDate(dbName,dateId){
        return new Promise(async (resolve,reject)=>{
        try{    
            await Execute.Query(dbName,`delete from admin_meeting_slot_timings where date_id=?`,[dateId]);
            resolve(true);
        }
        catch(Err){
            reject(Err);
        }
    })
    }
    static  async delete(dbName,id){
        return new Promise(async (resolve,reject)=>{
        try{    
            await Execute.Query(dbName,`delete from admin_meeting_slot_timings where id=?`,[id]);
            resolve(true);
        }
        catch(Err){
            reject(Err);
        }
    })
    }
    
}
class request{
    static async list(dbName,agentId){
        return new Promise(async (resolve,reject)=>{
        try{    
            let _agentDb=dbName+"_agent"
            let _whereClause=parseInt(agentId)==0?"":`where agent.id=${agentId}`
            let _agentRequest=await Execute.Query(dbName,`select agr.meeting_link,agr.status,agent.id as agent_id,agent.name,ams.start_time,ams.end_time,agr.id,am.id as date_id,am.from_date,am.to_date from agent_meeting_slot_timings_request agr join ${_agentDb}.cbl_user agent on agent.id=agr.agent_id join admin_meeting_slot_timings ams on agr.slot_id=ams.id join admin_meeting_available_dates am on am.id=ams.date_id ${_whereClause}`,[]);
            resolve(_agentRequest);
        }
        catch(Err){
            reject(Err);
        }
    })
    }
    static async count(dbName,agentId){
        return new Promise(async (resolve,reject)=>{
        try{    
            let _agentDb=dbName+"_agent"
            let _whereClause=parseInt(agentId)==0?"":`where agent.id=${agentId}`
            let _agentRequest=await Execute.Query(dbName,`select COUNT(agr.id) as total from agent_meeting_slot_timings_request agr join ${_agentDb}.cbl_user agent on agent.id=agr.agent_id join admin_meeting_slot_timings ams on agr.slot_id=ams.id ${_whereClause}`,[]);
            resolve(_agentRequest);
        }
        catch(Err){
            reject(Err);
        }
    })
    }
    static async approveDisapprove(dbName,status,id,link){
        return new Promise(async (resolve,reject)=>{
        try{    
            let _agentRequest=await Execute.Query(dbName,`update agent_meeting_slot_timings_request set status=?,meeting_link=? where id=?`,[status,link,id]);
            resolve(_agentRequest);
        }
        catch(Err){
            reject(Err);
        }
    })
    }
    static async add(dbName,slotId,agentId){
        return new Promise(async (resolve,reject)=>{
        try{    
            let _agentRequest=await Execute.Query(dbName,`insert into agent_meeting_slot_timings_request(agent_id,slot_id) values(?,?)`,[agentId,slotId]);
            resolve(_agentRequest);

        }
        catch(Err){
            reject(Err);
        }
    })
    }
}
module.exports={
    slots:slots,
    request:request
}