'use strict';
//=============admin route========================
const UserPaymentController=require('./user/paymentController')
const PromoController=require("./admin/PromoController")
const UserController=require('./user/userController')
const DialogController=require('./dialog/dialogCntrl')
const PGatewaController=require('./admin/PGatewayController')
const userOrderController=require('./user/orderController');
const adminOrderController=require('./admin/OrderController');
const adminGiftController=require('./admin/GifController');
const walletController = require('./user/walletController')
const loyalityLevelController=require('./admin/LoyalityController');
const surveyMonkeyController=require('./admin/SurveyMonkeyController');
const posController=require('./admin/PosController');
const agentserviceCntrl = require('./agent/serviceCntrl')
const deliveryCompanyCntrl = require('./admin/deliveryCompaniesController')
const countryCodesCntrl = require('./admin/countryCodesController')
const deliveryCompanyLoginCntrl = require('./delivery_company/loginCntrl')
const deliveryCompanyDashboardCntrl = require('./delivery_company/dashboardCntrl')
const adminSupplierController=require('./admin/SupplierController')
const adminCommisionController=require('./admin/CommisionController');
const loyalityCntrl = require('./agent/LoyalityCntrl')
const MeetingCntrl=require('./admin/MeetingController')
module.exports = {
    PGatewaController:PGatewaController,
    PromoController:PromoController,
    UserController:UserController,
    DialogController:DialogController,
    UserPaymentController:UserPaymentController,
    userOrderController:userOrderController,
    adminOrderController:adminOrderController,
    adminGiftController:adminGiftController,
    walletController:walletController,
    loyalityLevelController:loyalityLevelController,
    surveyMonkeyController:surveyMonkeyController,
    posController:posController,
    agentserviceCntrl:agentserviceCntrl,
    deliveryCompanyCntrl:deliveryCompanyCntrl,
    countryCodesCntrl:countryCodesCntrl,
    deliveryCompanyLoginCntrl:deliveryCompanyLoginCntrl,
    deliveryCompanyDashboardCntrl:deliveryCompanyDashboardCntrl,
    adminSupplierController:adminSupplierController,
    adminCommisionController:adminCommisionController,
    loyalityCntrl:loyalityCntrl,
    MeetingCntrl:MeetingCntrl
};
