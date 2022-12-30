'use strict';
//=============Model Route========================
const supplierModel=require('./supplierModel');
const bookingCarFlow=require('./bookingCartFlow');
const services=require('./services');
const users = require('./user');
const agents = require('./agent');
const supplier=require('./supplierModel')
const commision=require('./commision')
const meeting=require('./meeting')
module.exports = {
    supplierModel:supplierModel,
    bookingCarFlow:bookingCarFlow,
    services:services,
    users:users,
    agents:agents,
    supplier:supplier,
    meeting:meeting,
    commision:commision
};
