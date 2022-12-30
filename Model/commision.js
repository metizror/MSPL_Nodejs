'use strict';
const { Logger } = require('mongodb');
const {Query}=require('../lib/Execute')
let randomize = require('randomatic');
let func = require('../routes/commonfunction');
let log4js = require('log4js');
let logger = log4js.getLogger();
logger.level = config.get('server.debug_level');

/**
 * used for getting an admin commision data
 */
class  admin{
    constructor (dbName,minimum_amount,below_commission_type,below_commission_amount,above_commission_type,above_commission_amount,minimum_cart_fee,id){
        this.dbName=dbName;
        this.minimum_amount=minimum_amount;
        this.below_commission_type=below_commission_type;
        this.below_commission_amount=below_commission_amount;
        this.above_commission_type=above_commission_type;
        this.above_commission_amount=above_commission_amount;
        this.minimum_cart_fee=minimum_cart_fee;
        this.id=id;
    }
    async find() {
        logger.debug("====inputParams====>>",this.dbName);
        let data=await Query(this.dbName,"select `id`,`minimum_amount`,`below_commission_type`,`above_commission_type`,`below_commission_amount`,`above_commission_amount`,`minimum_cart_fee` from admin_customized_commission",[]);
        return data;
    }
    async update() {
        logger.debug("====inputParams====>>",this.minimum_amount,this.below_commission_type,this.below_commission_amount,this.above_commission_type,this.above_commission_amount,this.minimum_cart_fee,this.id);
        let data=await Query(this.dbName,"update admin_customized_commission set `minimum_amount`=?,`below_commission_type`=?,`above_commission_type`=?,`below_commission_amount`=?,`above_commission_amount`=?,`minimum_cart_fee`=? where id=?",[this.minimum_amount,this.below_commission_type,this.above_commission_type,this.below_commission_amount,this.above_commission_amount,this.minimum_cart_fee,this.id]);
        return data;
    }
}
module.exports.admin=admin
