const newrelic = require('newrelic');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var cors = require('cors');
const Mongo = require('mongodb')
config = require('config');
var moment = require('moment');
var quickbooks = require('./routes/quickbooks');
  
// mongoConnection=require('./lib/mongoConnection').mongoConnection;
// mongoConnection.connectToMongo()
var SocketManager = require('./socketManager');
var Boom = require('boom');
var Auth = require('./lib/Auth');
var sendResponse = require('./routes/sendResponse');
var https = require('https');
var fs = require('fs');
const questionRouter = require('./routes/question');
const expressJoi = require('express-joi-validator');
i18n = require("i18n");
global.dirname=__dirname;
// var privateKey  = fs.readFileSync('/etc/apache2/ssl/starssl.royoapps.com/key.pem');
// var certificate = fs.readFileSync('/etc/apache2/ssl/starssl.royoapps.com/cert.pem');
/*
var redis = require("redis"),*/
var promo = require('./routes/promo');

var admin = require('./routes/admin');
var orderFilter = require('./routes/orderFilter');
var currencyProfile = require('./routes/currencyProfile');
var category = require('./routes/category');
var dataGathering = require('./routes/dataGathering');
var supplierReg = require('./routes/supplierReg');
var profileSetup = require('./routes/profileSetup');
var supplierProfile = require('./routes/supplierProfile');
var supplierExtranet = require('./routes/supplierExtranet');
var product = require('./routes/product');
var website = require('./routes/website');
var supplierproduct = require('./routes/supplierproduct');
var supplierSetup = require('./routes/supplierSetup.js');
var supplierBranchSetup = require('./routes/supplierBranchSetup.js');
var controller=require('./controller/user/guestController')

var users = require('./routes/user');
var subsupplier = require('./routes/subsupplier');


var supplierSummaryIndication = require('./routes/supplierSummaryIndication');
var supplierExtranetProfile = require('./routes/supplierExtranetProfile');

var extranetProductManager = require('./routes/extranetProductManager');
var packagesAndPromotions = require('./routes/packagesAndPromotions');
var loyaltyPoints = require('./routes/loyaltyPointsAndRedemptionVoucher');
var clientProfile = require('./routes/clientProfile');
var advertisements = require('./routes/advertisements');
var reports = require('./routes/Reports');
// var pushNot = require('./routes/pushNotAndroid');
var adminOrders = require('./routes/adminOrders');
var supplierorder = require('./routes/supplierorder');
var branchOrder = require('./routes/branchOrders');


var adminAccounts = require('./routes/adminAccounts');
var supplierAccounts = require('./routes/supplierAccount');
var supplierSummarySetup = require('./routes/supplierSummarySetup');
var settings = require('./routes/settings');
var supplierPackagesAndPromotions = require('./routes/supplierPackagesAndPromotions');
var image = require('./routes/image');
var adminLoyalityOrders = require('./routes/adminLoyalityOrders');
var supplierLoyaltyOrders = require('./routes/supplierLoyaltyOrders');
var supplierBranchExtranet = require('./routes/supplierBranchExtranet');
var supplierReports = require('./routes/supplierReports');
var consts = require('./config/const')
md5 = require('md5');
var app = express();
// process.env.NODE_ENV = 'development';
// if (consts.SERVER.WHITE_LABLE.STATUS == 0) {
//     require('./routes/cblConnection');
// }
require('./routes/multiConnection');
// multiConnection = require('./routes/multiConnection');
//dbconnection = require('./routes/connection.js');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.use(logger('dev'));
app.use(bodyParser());
app.use(bodyParser.urlencoded({ limit: "50mb", extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use("/.well-known", express.static(path.join(__dirname, 'well-known')));

// app.use(express.static(__dirname + '/public'));
i18n.configure({
    locales:['en','ar','es','sp'],
    directory: __dirname + '/locales'
});

app.use(cors());


app.use(function(req,res,next){
    console.log("request - ",JSON.stringify(req.query),JSON.stringify(req.body));
    next();
})
app.get('/health', function (req, res) {
    res.render('test.jade');
})

app.get('/local_ankit', function (req, res) {
    res.render('local_ankit');
})

app.get('/test', function (req, res) {
    res.render('test');
});


app.get('/local_test', function (req, res) {
    res.render('local_test');
});

app.get('/shumi_test', function (req, res) {
    res.render('shumi_test.jade');
});

app.get('/test1', function (req, res) {
    res.sendfile('index.html');
    console.log("hello");
});

app.get('/mohit_local', function (req, res) {
    res.render('mohit_local');
})

app.get('/supplier_app', function (req, res) {
    res.render('supplier_app');
})

app.get('/branch_app', function (req, res) {
    res.render('branch_app');
})

app.get('/clikat_api', function (req, res) {
    res.sendFile(__dirname + '/public/index1.html');
});

// array for login cases
logInArray = new Array();
status = new Array();
baseUrl = "http://royo.com:" + config.get("PORT");
app.disable('x-powered-by');
//app.post('/add_admin', passwordFile.createAdmin);
//app.post('/admin_login', passwordFile.login);
require('./plugin/user/posts-route')(app);
require('./plugin/swagger-route')(app)
require('./plugin/variant-route')(app)
require('./plugin/product-route')(app)
require('./plugin/category-route')(app)
require('./plugin/admin/product-route')(app)
require('./plugin/supplier/product-route')(app)
require('./plugin/supplier/agent-route')(app)
require('./plugin/supplier/order-route')(app)
require('./plugin/supplier/branch-route')(app)
require('./plugin/supplier/subscription-route')(app)
require('./plugin/admin/area-route')(app)
require('./plugin/user/area-route')(app)
require('./plugin/user/rating-route')(app)
require('./plugin/user/agent-route')(app)
require('./plugin/admin/variant-route')(app)
require('./plugin/admin/brand-route')(app)
require('./plugin/admin/agent-route')(app)
require('./plugin/admin/cat-route')(app);
require('./plugin/admin/pgateway-route')(app)
require('./plugin/supplier/cat-route')(app);
require('./plugin/common-route')(app);
require('./plugin/user/order-route')(app);
require('./plugin/user/home-route')(app);
require('./plugin/user/address-route')(app);
require('./plugin/admin/dashboard-route')(app);
require('./plugin/supplier/dashboard-route')(app);
require('./plugin/admin/settings-route')(app);
require('./plugin/supplier/gift-route')(app);
require('./plugin/supplier/variant-route')(app);
require('./plugin/supplier/brand-route')(app);
require('./plugin/admin/banner-route')(app);
require('./plugin/admin/password-route')(app);
require('./plugin/admin/supplier-route')(app);
require('./plugin/admin/gift-route')(app);
require('./plugin/admin/promo-route')(app);
require('./plugin/admin/terminologies-route')(app);
require('./plugin/admin/loyality-route')(app);
require('./plugin/admin/termsConditions-route')(app);
require('./plugin/admin/placeHolder-route')(app);
require('./plugin/admin/login-route')(app);
require('./plugin/admin/branch-route')(app);
require('./plugin/admin/commision-route')(app);
require('./plugin/admin/meeting-route')(app);
require('./plugin/admin/order-route')(app);
require('./plugin/admin/subAdmin-route')(app);
require('./plugin/admin/cancellationPolicy-route')(app);
require('./plugin/user/payment-route')(app)
require('./plugin/user/referral_route')(app)
require('./plugin/user/loyality-route')(app)
require('./plugin/supplier/profile-route')(app)

require('./plugin/admin/subscription-route')(app)
require('./plugin/admin/surveymonkey-route')(app);
require('./plugin/user/wallet-route')(app);
require('./plugin/user/promo-route')(app);
require('./plugin/admin/pos-route')(app);
// require('./routes/cronJob');
require('./plugin/agent/service-route')(app);
require('./plugin/admin/deliveryCompanies-route')(app);
require('./plugin/delivery_company-route')(app);
require('./plugin/admin/countryCodes-route')(app);
require('./plugin/agent/loyality-route')(app);
var swagger = require('./plugin/swagger')(app)
//=========================Questionaries Routes=====================================
///////////////////////// Question API //////////////////////////////////////
const questionModel = require('./Model/question');
const urlencodedParser = bodyParser.urlencoded({ extended: false });


//////////////////////quickbooks//////////////////////
app.get('/authUri',urlencodedParser,quickbooks.authUri);
/**
 * Handle the callback to extract the `Auth Code` and exchange them for `Bearer-Tokens`
 */
 app.get('/callback', quickbooks.callback);

 app.get('/retrieveToken',quickbooks.retriveToken);
 app.get('/refreshAccessToken',quickbooks.refreshAccessToken);
 app.get('/getCompanyInfo', quickbooks.getCompanyInfo);

 app.post('/add_qk_customer',Auth.checkCblAuthority,quickbooks.addCustomer);
 app.post('/create_invoice',quickbooks.createInvoice);




app.get('/getQuestionsByCategoryId',Auth.checkCblAuthority, Auth.storeDbInRequest, expressJoi({query: questionModel.getQuestionsByCategoryId}),questionRouter.getQuestionsByCategoryId)
app.get('/getAllQuestionsDetailByCategoryId',Auth.authenticateAccessToken, expressJoi({query: questionModel.getAllQuestionsDetailByCategoryId}),questionRouter.getAllQuestionsDetailByCategoryId)
app.get('/getQuestionByQuestionId',Auth.checkCblAuthority, Auth.storeDbInRequest, expressJoi({query: questionModel.getQuestionByQuestionId}),questionRouter.getQuestionByQuestionId)
app.post('/deleteQuestionsByQuestionIds', Auth.checkCblAuthority,Auth.authenticateAccessToken,Auth.storeDbInRequest,expressJoi({body: questionModel.deleteQuestionsByQuestionIds}),questionRouter.deleteQuestionsByQuestionIds)

// app.post('/saveQuestionsByCategoryId', expressJoi({body: questionModel.saveQuestionsByCategoryId}),questionRouter.saveQuestionsByCategoryId)

app.post('/addAndEditQuestionsByCategory',Auth.checkCblAuthority,Auth.authenticateAccessToken, expressJoi({body: questionModel.editQuestion}), questionRouter.editQuestion);

app.get('/supplier/getAllQuestionsDetailByCategoryId',Auth.checkCblAuthority,Auth.supplierAuth, expressJoi({query: questionModel.getAllQuestionsDetailByCategoryId}),questionRouter.getAllQuestionsDetailByCategoryId)
app.post('/supplier/addAndEditQuestionsByCategory',Auth.checkCblAuthority,Auth.supplierAuth, expressJoi({body: questionModel.editQuestion}), questionRouter.editQuestion);
app.post('/supplier/deleteQuestionsByQuestionIds', Auth.checkCblAuthority, Auth.supplierAuth,expressJoi({body: questionModel.deleteQuestionsByQuestionIds}),questionRouter.deleteQuestionsByQuestionIds)




//=====================Admin profile API'S==============================================


app.post('/admin_login',Auth.checkCblAuthority, Auth.storeDbInRequest,admin.adminLoginUsingPassword);

app.post('/get_admin_home_data',Auth.checkCblAuthority,Auth.storeDbInRequest, admin.getAdminHomeData);


app.post('/add_admin',Auth.checkCblAuthority, Auth.storeDbInRequest,admin.addAdmin);
app.post('/make_admin_active_or_inactive',Auth.checkCblAuthority,Auth.storeDbInRequest, admin.makeAdminActiveOrInActive);

app.post('/assign_or_revoke_section',Auth.checkCblAuthority,Auth.storeDbInRequest, admin.assignOrRevokeSection);
app.post('/get_all_reg_admin',Auth.checkCblAuthority,Auth.storeDbInRequest, admin.getAllAdmin);
app.post('/get_admin_data_to_view', Auth.checkCblAuthority,Auth.storeDbInRequest, admin.getAdminDataById);
app.post('/forgot_password', Auth.checkCblAuthority,Auth.storeDbInRequest, admin.forgotPassword);
app.use('/import_admin_product', multipartMiddleware);
app.post('/import_admin_product',Auth.checkCblAuthority,Auth.storeDbInRequest, admin.importAdminProduct);

app.use('/import_admin_product_pricing', multipartMiddleware);
app.post('/import_admin_product_pricing',Auth.checkCblAuthority,Auth.storeDbInRequest, admin.importAdminProductPricing)
app.use('/import_supplier_product', multipartMiddleware);
app.post('/import_supplier_product',Auth.checkCblAuthority,Auth.storeDbInRequest, admin.importSupplierProduct);
app.use('/import_supplier_product_pricing', multipartMiddleware);
app.post('/import_supplier_product_pricing',Auth.checkCblAuthority,Auth.storeDbInRequest, admin.importSupplierProductPricing);

/*
app.post('/userstatsu',admin.importSupplierProductPricing)
*/

/*
app.use('/multiple_image_upload', multipartMiddleware);
app.post('/multiple_image_upload',admin.multipleImageUpload)
*/


//=====================Category API'S==============================================
app.use('/add_category', multipartMiddleware);

app.post('/add_category',Auth.checkCblAuthority, Auth.storeDbInRequest, category.addCategory);


app.post('/list_categories',Auth.checkCblAuthority, Auth.storeDbInRequest, category.listCategories);

app.use('/edit_category', multipartMiddleware);
app.post('/edit_category',Auth.checkCblAuthority, Auth.storeDbInRequest, category.editCategory);


app.use('/edit_category_by_supplier', multipartMiddleware);
app.post('/edit_category_by_supplier',Auth.checkCblAuthority, Auth.supplierAuth, supplierExtranet.editCategoryBySupplier);

// app.post('/add_variant', category.editCategory);

// app.post('/variant_list', category.listVariants);


app.use('/add_category_by_supplier', multipartMiddleware);
app.post('/add_category_by_supplier',Auth.checkCblAuthority, Auth.supplierAuth, supplierExtranet.addCategoryBySupplier);

app.post('/supplier_payout_request',Auth.checkCblAuthority, Auth.supplierAuth, supplierExtranet.supplierPayoutRequest);



app.get('/requestForCategoriesApproval',
Auth.authenticateAccessToken,
Auth.storeDbInRequest, supplierExtranet.requestForCategoriesApproval);

app.patch('/requestForCategoriesApproval',
Auth.authenticateAccessToken,
Auth.storeDbInRequest,supplierExtranet.patchRequestForCategoriesApproval);




app.use('/add_sub_category', multipartMiddleware);
app.post('/add_sub_category',Auth.checkCblAuthority, Auth.storeDbInRequest, category.addSubCategory);


app.use('/add_sub_category_by_supplier',multipartMiddleware);
app.post('/add_sub_category_by_supplier',Auth.checkCblAuthority,Auth.supplierAuth,supplierExtranet.addSubCategoryBySupplier)

app.use('/edit_sub_category', multipartMiddleware);
app.post('/edit_sub_category',Auth.checkCblAuthority, Auth.storeDbInRequest, category.editSubCategory);

app.use('/edit_sub_category_by_supplier', multipartMiddleware);
app.post('/edit_sub_category_by_supplier',Auth.checkCblAuthority, Auth.supplierAuth, supplierExtranet.editSubCategoryBySupplier);


app.post('/delete_category',Auth.checkCblAuthority, Auth.storeDbInRequest, category.deleteCategory);
app.post('/make_category_live',Auth.checkCblAuthority, Auth.storeDbInRequest, category.makeCategoryLive);

app.post('/delete_category_by_supplier',Auth.checkCblAuthority, Auth.supplierAuth,supplierExtranet.deleteCategoryBySupplier)


//======================== SUB CATEGORY API'S=========================================
app.post('/list_subcategories',Auth.checkCblAuthority, Auth.storeDbInRequest, category.listSubCategories);
app.post('/list_category_names_with_ids',Auth.checkCblAuthority, Auth.storeDbInRequest, category.listCategoriesNamesWithIds);
app.post('/list_sub_category_names_with_ids',Auth.checkCblAuthority, Auth.storeDbInRequest, category.listSubCategoriesNamesWithIds);
app.post('/list_detailed_sub_categories',Auth.checkCblAuthority, Auth.storeDbInRequest, category.listDetailedSubCategories);
app.post('/list_subcategories_by_supplier',Auth.checkCblAuthority,Auth.supplierAuth,supplierExtranet.listSubCategoriesBySupplier)
app.post('/list_detailed_sub_category_by_supplier',Auth.checkCblAuthority,Auth.supplierAuth,supplierExtranet.listDetailedSubCategoriesBySupplier)


//========================CURRENCY PROFILE API'S=========================================
app.post('/add_currency',Auth.checkCblAuthority, Auth.storeDbInRequest, currencyProfile.addCurrency);
app.post('/get_country_at_add_more',Auth.checkCblAuthority, Auth.storeDbInRequest, currencyProfile.getCountryAtAddMore);
app.post('/get_all_countries',Auth.checkCblAuthority, Auth.storeDbInRequest, currencyProfile.getAllCountries);
//will be removed, handle it with case
app.post('/get_currency_profile',Auth.checkCblAuthority, Auth.storeDbInRequest, currencyProfile.getCurrencyProfile);
app.post('/get_currency_data_at_edit',Auth.checkCblAuthority, Auth.storeDbInRequest, currencyProfile.getCurrencyDataAtEdit);
app.post('/edit_currency',Auth.checkCblAuthority, Auth.storeDbInRequest, currencyProfile.editThisCurrency);
app.post('/delete_currency',Auth.checkCblAuthority, Auth.storeDbInRequest, currencyProfile.deleteThisCurrency);
app.post('/set_default_currency',Auth.checkCblAuthority, Auth.storeDbInRequest, currencyProfile.makeDefaultThisCurrency);


//language API's 
app.post('/add_language',Auth.checkCblAuthority, Auth.storeDbInRequest, profileSetup.addLanguage);
app.post('/get_languages',Auth.checkCblAuthority, Auth.storeDbInRequest, profileSetup.getLanguages);
app.post('/make_default_language',Auth.checkCblAuthority, Auth.storeDbInRequest, profileSetup.makeDefaultLanguage);


//Country Profile API's
app.post('/add_country',Auth.checkCblAuthority, Auth.storeDbInRequest, profileSetup.addCountry);
app.post('/make_country_live',Auth.checkCblAuthority, Auth.storeDbInRequest, profileSetup.makeCountryLive);
app.post('/delete_country',Auth.checkCblAuthority, Auth.storeDbInRequest, profileSetup.deleteCountry);
app.post('/edit_country_name',Auth.checkCblAuthority, Auth.storeDbInRequest, profileSetup.editCountryName);

//City Profile API's
app.post('/get_country_city_list',Auth.checkCblAuthority, Auth.storeDbInRequest, profileSetup.getCountryCityList);
app.post('/add_city',Auth.checkCblAuthority, Auth.storeDbInRequest, profileSetup.addCity);
app.post('/list_city',Auth.checkCblAuthority, Auth.storeDbInRequest, profileSetup.listCity);
app.post('/delete_city',Auth.checkCblAuthority, Auth.storeDbInRequest, profileSetup.deleteCity);
app.post('/make_city_live',Auth.checkCblAuthority, Auth.storeDbInRequest, profileSetup.makeCityLive);
app.post('/edit_city_name',Auth.checkCblAuthority, Auth.storeDbInRequest, profileSetup.editCityName);
app.post('/delete_all_cities_of_country',Auth.checkCblAuthority, Auth.storeDbInRequest, profileSetup.deleteAllCitiesOfCountry);


//Zone Profile API's
app.post('/list_city_names_with_id',Auth.checkCblAuthority, Auth.storeDbInRequest, profileSetup.listCityNameWIthId);
app.post('/add_zone',Auth.checkCblAuthority, Auth.storeDbInRequest, profileSetup.addZone);
app.post('/delete_zone',Auth.checkCblAuthority, Auth.storeDbInRequest, profileSetup.deleteZone);
app.post('/make_zone_live',Auth.checkCblAuthority, Auth.storeDbInRequest, profileSetup.makeZoneLive);
app.post('/edit_zone_name',Auth.checkCblAuthority, Auth.storeDbInRequest, profileSetup.editZoneName);
app.post('/list_zones_according_to_city_id',Auth.checkCblAuthority, Auth.storeDbInRequest, profileSetup.listZonesAccordingToCityId);


//Area Profile API's
app.post('/list_zone_names_with_id',Auth.checkCblAuthority, Auth.storeDbInRequest, profileSetup.listZoneNameWIthId);
app.post('/list_areas_according_to_zone_id',Auth.checkCblAuthority, Auth.storeDbInRequest, profileSetup.listAreasOfParticularZone);
app.post('/add_area',Auth.checkCblAuthority, Auth.storeDbInRequest, profileSetup.addArea);
app.post('/delete_area',Auth.checkCblAuthority, Auth.storeDbInRequest, profileSetup.deleteArea);
app.post('/make_area_live',Auth.checkCblAuthority, Auth.storeDbInRequest, profileSetup.makeAreaLive);
app.post('/edit_area_name',Auth.checkCblAuthority, Auth.storeDbInRequest, profileSetup.editAreaName);

//Data gathering API's
app.post('/get_city_by_country_id',Auth.checkCblAuthority, Auth.storeDbInRequest, dataGathering.listCityWithNameAndId);
app.post('/get_area_by_zone_id',Auth.checkCblAuthority, Auth.storeDbInRequest, dataGathering.listAreaWithNameAndId);
app.post('/get_country_with_names_and_id',Auth.checkCblAuthority, Auth.storeDbInRequest, dataGathering.listCountryWithNamesAndId);
app.post('/get_zone_by_city_id',Auth.checkCblAuthority, Auth.storeDbInRequest, dataGathering.listZonesWithNamesAndId);
app.post('/get_zone_and_area_for_city',Auth.checkCblAuthority, Auth.storeDbInRequest, dataGathering.listZonesAndAreas);
app.post('/get_category_with_names_and_id',Auth.checkCblAuthority, Auth.storeDbInRequest, dataGathering.listCategoryWithNamesAndId);
app.post('/get_sub_category_with_names_and_id',Auth.checkCblAuthority, Auth.storeDbInRequest, dataGathering.listSubCategoriesWithNamesAndId);
app.use('/store_supplier_data_step1', multipartMiddleware);
app.post('/store_supplier_data_step1',Auth.checkCblAuthority, Auth.storeDbInRequest, dataGathering.storeSupplierDataStep1);
app.post('/store_supplier_data_step2',Auth.checkCblAuthority, Auth.storeDbInRequest, dataGathering.storeSupplierDataStep2);
app.post('/store_data_step_three',Auth.checkCblAuthority, Auth.storeDbInRequest, dataGathering.storeSupplierDataStepThree);
app.post('/store_data_step_four',Auth.checkCblAuthority, Auth.storeDbInRequest, dataGathering.storeSupplierDataStepFour);
app.post('/list_data_gathering_admins',Auth.checkCblAuthority, Auth.storeDbInRequest, dataGathering.listDataGatheringAdmins);
app.post('/add_data_gathering_admin',Auth.checkCblAuthority, Auth.storeDbInRequest, dataGathering.addDataGatheringAdmin);
app.post('/active_or_inactive_data_admin',Auth.checkCblAuthority, Auth.storeDbInRequest, dataGathering.activeOrInactiveDataGatheringAdmin);
app.post('/data_gathering_email_login',Auth.checkCblAuthority, Auth.storeDbInRequest, dataGathering.emailLogin);
app.post('/get_city_list',Auth.checkCblAuthority, Auth.storeDbInRequest, dataGathering.getCityListWithId);
app.post('/get_zone_list',Auth.checkCblAuthority, Auth.storeDbInRequest, dataGathering.getZoneListWithId);
app.post('/get_area_list',Auth.checkCblAuthority, Auth.storeDbInRequest, dataGathering.getAreaListWithId);
app.post('/update_delivery_charges_by_area',Auth.checkCblAuthority,Auth.storeDbInRequest, dataGathering.updateChargesByAreaId);


//Supplier Registeration API's
app.post('/add_supplier_by_clikat',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierReg.regSupplier);
app.post('/get_reg_supplier',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierReg.getRegSupplierList);
app.post('/list_dump_suppliers',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierReg.getDumpSupplierList);
app.post('/view_dump_details_of_supplier',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierReg.dumpDetailsOfSupplier);
app.post('/delete_dump_data_of_supplier',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierReg.deleteDumpDataOfSupplier);
app.post('/active_or_inactive_supplier',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierReg.activeOrInActiveSupplier);
app.post('/reg_supplier_directly',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierReg.regSupplierDirectly);

app.post('/v1/reg_supplier_directly',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierReg.regSupplierDirectly);
app.post('/v2/reg_supplier_directly',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierReg.regSupplierDirectlyV2);
app.post('/list_sub_and_detailed_categories',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierReg.listSubAndDetailedSubCategories);


//Subsupplier API's
app.post('/add_subsupplier_by_supplier',Auth.checkCblAuthority, Auth.storeDbInRequest,Auth.supplierAuth, subsupplier.add_sub_supplier);
app.post('/list_subsupplier',Auth.checkCblAuthority, Auth.storeDbInRequest, subsupplier.listSubsupplier);
app.post('/change_subsupplier_status',Auth.checkCblAuthority, Auth.storeDbInRequest, subsupplier.makeSubsupplierActiveOrInActive);
app.post('/assign_or_revoke_sub_supplier_section',Auth.checkCblAuthority, Auth.storeDbInRequest, subsupplier.assignOrRevokesubsupplierSection);
app.post('/all_section_list_of_subsupplier',Auth.checkCblAuthority, Auth.storeDbInRequest, subsupplier.getallsectionwithassignedstatus)

//Supplier Profile API's
app.post('/get_supplier_info_tab1',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierProfile.getRegSupplierInfoTab1);



app.post('/supplier/get_supplier_info_tab1',Auth.supplierAuth,
Auth.checkforAuthorityofThisSupplier,  supplierProfile.supplier_getRegSupplierInfoTab1);



app.use('/save_supplier_image_2', multipartMiddleware);
app.post('/save_supplier_image_2',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierProfile.saveSupplierImage_2);
app.use('/get_supplier_sub_info_tab1', multipartMiddleware);

app.use('/v1/get_supplier_sub_info_tab1', multipartMiddleware);
app.post('/get_supplier_sub_info_tab1',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierProfile.saveSeeupplierProfileSubTab1);

app.post('/v1/get_supplier_sub_info_tab1',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierProfile.saveSeeupplierProfileSubTab1);
app.post('/update_supplier_status_save',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierProfile.updateSupplierStatusSave)

app.post('/add_category_of_supplier',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierProfile.addCategoryToSupplier);

app.post('/v1/add_category_of_supplier',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierProfile.addCategoryToSupplierV1);


app.post('/order_by_category_of_supplier',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierProfile.orderByCategoryToSupplier);

app.post('/save_supplier_profile_tab1',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierProfile.saveSupplierProfileTab1);
app.post('/get_supplier_info_tab2',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierProfile.getRegSupplierInfoTab2);

app.post('/change_branch_status',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierProfile.changeBranchStatus);
app.post('/delete_branch',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierProfile.deleteBranch);
app.use('/add_branch', multipartMiddleware);
app.post('/add_branch',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierProfile.addBranch);

app.post('/add_supplier_delivery_areas',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierProfile.addSupplierDeliveryAreas);
app.post('/list_unassigned_areas',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierProfile.listUnassignedAreas);

app.post('/remove_supplier_delivery_area',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierProfile.removeSupplierDeliveryAreas);

app.post('/list_country_ids',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierProfile.listCountryIds);
app.post('/list_area_ids',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierProfile.listAreaIds);
app.post('/get_supplier_info_tab3',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierProfile.getRegSupplierInfoTab3);

app.post('/save_supplier_profile_tab3',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierProfile.saveSupplierInfoTab3);
app.get('/list_supplier_admins',Auth.checkCblAuthority, Auth.storeDbInRequest,Auth.supplierAuth, supplierProfile.listSupplierAdmins);

app.post('/change_supplier_admin_status',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierProfile.makeSupplierAdminActiveOrInActive);
app.post('/add_supplier_sub_admin',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierProfile.addSupplierSubAdmin);
app.post('/assign_or_revoke_supplier_section',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierProfile.assignOrRevokeSupplierSection);

app.post('/get_supplier_sub_admin_data_to_view',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierProfile.getSupplierSubAdminDataById);
app.post('/list_supplier_added_categories',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierProfile.listSupplierAddedCategoryData);
app.post('/delete_supplier_category',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierProfile.deleteSupplierCategory);
app.post('/get_package_listing',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierProfile.getPackageListing);
app.post('/suuplier_Branch_refresh',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierProfile.supplierBranchRefresh);
app.post('/on_off_cache',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierProfile.onOffCache);
app.post('/get_cache',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierProfile.getCache);

/*app.post('/suuplier_refresh',supplierProfile.supplierRefresh);*/



// supplier login
app.post('/supplier_login',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierSetup.supplierLoginUsingPassword);

app.post('/supplier_count',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierSetup.countSupplier);

app.post('/get_supplier_home_data',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierSetup.getSupplierHomeData);
app.post('/get_supplier_branch_home_data',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierBranchSetup.getSupplierBranchHomeData);
app.post('/supplier_forget_password',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierBranchSetup.supplierForgetPassword);
app.post('/supplier_branch_forget_password',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierBranchSetup.supplierBranchForgetPassword);
app.post('/supplier_ios_forget_password', Auth.checkCblAuthority,Auth.storeDbInRequest, supplierBranchSetup.supplierIosForgetPassword);
app.post('/supplier_ios_branch_forget_password',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierBranchSetup.supplierIOsBranchForgetPassword);
app.post('/supplier_loyalty_level',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierSetup.supplierLoyaltyLevel)
app.post('/dashBoardTicker', Auth.checkCblAuthority,Auth.storeDbInRequest, supplierBranchSetup.dashBoardTicker);




//Supplier Extranet API's
app.post('/get_supplier_dashboard',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierExtranet.supplierLoginToApp);
app.use('/save_supplier_profile_extranet_tab1', multipartMiddleware);
app.post('/save_supplier_profile_extranet_tab1',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierExtranetProfile.saveSupplierProfileSubTab1);
app.post('/change_status_by_supplier',Auth.checkCblAuthority,Auth.storeDbInRequest, supplierExtranetProfile.changeStatus);
//app.post('/supplier_status',supplierExtranetProfile.getStatus);
app.use('/save_supplier_extranet_image_2', multipartMiddleware);
app.post('/save_supplier_extranet_image_2',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierExtranetProfile.saveSupplierImage_2);
app.post('/get_supplierExtranet_info_tab1',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierExtranetProfile.getRegSupplierInfoTab11);
app.post('/get_supplier_extranet_info_tab2',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierExtranetProfile.getRegSupplierInfoTab2Extranet);

app.post('/change_supplier_extranet_branch_status',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierExtranetProfile.changeBranchStatusExtranet);
app.post('/delete_supplier_extranet_branch',Auth.checkCblAuthority,Auth.storeDbInRequest, supplierExtranetProfile.deleteBranchExtranet);
app.use('/add_branch_supplier_extranet', multipartMiddleware);
app.post('/add_branch_supplier_extranet', Auth.checkCblAuthority,Auth.storeDbInRequest, supplierExtranetProfile.addBranchExtranet);
app.use('/add_logo_supplier_branch', multipartMiddleware);
app.post('/add_logo_supplier_branch', Auth.checkCblAuthority,Auth.storeDbInRequest, supplierExtranetProfile.addLogoBranchExtranet);
app.post('/add_supplier_extranet_delivery_areas',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierExtranetProfile.addSupplierDeliveryAreasExtranet);
app.post('/list_unassigned_areas_supplier_extranet',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierExtranetProfile.listUnassignedAreasExtranet);
app.post('/remove_supplier_extranet_delivery_area', Auth.checkCblAuthority,Auth.storeDbInRequest, supplierExtranetProfile.removeSupplierDeliveryAreasExtranet);
app.post('/list_supplier_extranet_country_ids',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierExtranetProfile.listCountryIdsExtranet);
app.post('/list_supplier_extranet_area_ids',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierExtranetProfile.listAreaIdsExtranet);
app.post('/list_supplier_extranet_city_ids',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierExtranetProfile.getCountryCityList);
app.post('/list_supplier_extranet_zone_ids',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierExtranetProfile.listZonesAccordingToCityId);



app.post('/get_supplier_extranet_info_tab3', Auth.checkCblAuthority,Auth.storeDbInRequest, supplierExtranetProfile.getRegSupplierExtranetInfoTab3);
app.post('/save_supplier_profile_extranet_tab3',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierExtranetProfile.saveSupplierExtranetInfoTab3);





//Product API's
app.post('/list_currencies',Auth.checkCblAuthority, Auth.storeDbInRequest, product.listCurrencies);
app.post('/list_all_categories', Auth.checkCblAuthority,Auth.storeDbInRequest, product.listCategories);
app.post('/list_all_subcategories',Auth.checkCblAuthority, Auth.storeDbInRequest, product.listSubCategories);
app.use('/add_product', multipartMiddleware);
app.post('/add_product',Auth.checkCblAuthority, Auth.storeDbInRequest, product.addProduct);

app.use('/v1/add_product', multipartMiddleware);
app.post('/v1/add_product',Auth.checkCblAuthority, Auth.storeDbInRequest, product.addProduct);

app.post('/delete_product',Auth.checkCblAuthority, Auth.storeDbInRequest, product.deleteProduct);
app.post('/list_supplier_categories',Auth.checkCblAuthority, Auth.storeDbInRequest, product.listSupplierCategories);
app.get('/user/list_supplier_categories',Auth.checkCblAuthority, Auth.storeDbInRequest, product.listSupplierCategoriesForUser);

app.post('/list_supplier_sub_categories',Auth.checkCblAuthority, Auth.storeDbInRequest, product.listSupplierSubCategories);
app.post('/list_supplier_detailed_sub_categories',Auth.checkCblAuthority, Auth.storeDbInRequest, product.listSupplierDetailedSubCategories);

app.post('/list_products',Auth.checkCblAuthority, Auth.storeDbInRequest, product.listProducts);
app.post('/v1/list_products',Auth.checkCblAuthority, Auth.storeDbInRequest, product.listProducts);

app.post('/assign_product_to_supplier',Auth.checkCblAuthority, Auth.storeDbInRequest, product.assignProductToSupplier);
app.use('/add_supplier_product', multipartMiddleware);
app.post('/add_supplier_product',Auth.checkCblAuthority, Auth.storeDbInRequest, product.addSupplierProduct);

///////////////////zipcod apis///////////////////////////////

app.post('/delete_zipcode',Auth.checkCblAuthority, Auth.storeDbInRequest,supplierproduct.deletezipcode)
app.post('/edit_zipcode',Auth.checkCblAuthority, Auth.storeDbInRequest,supplierproduct.editzipcode)



app.use('/v1/add_supplier_product', multipartMiddleware);
app.post('/v1/add_supplier_product',Auth.checkCblAuthority, Auth.storeDbInRequest, product.addSupplierProduct);


app.post('/delete_supplier_product',Auth.checkCblAuthority, Auth.storeDbInRequest, product.deleteSupplierProduct);

app.post('/list_supplier_products',Auth.checkCblAuthority, Auth.storeDbInRequest, product.listProductDetailsOfSupplier);
app.post('/v1/list_supplier_products',Auth.checkCblAuthority, Auth.storeDbInRequest, product.listProductDetailsOfSupplier);

app.post('/add_product_pricing_by_admin',Auth.checkCblAuthority, Auth.storeDbInRequest, product.addPricingOfProductByAdmin);

app.post('/list_product_pricing',Auth.checkCblAuthority, Auth.storeDbInRequest, product.listProductPricing);
app.post('/list_supplier_names',Auth.checkCblAuthority, Auth.storeDbInRequest, product.listRegisteredSuppliersWithNamesOnly);
app.post('/delete_pricing',Auth.checkCblAuthority, Auth.storeDbInRequest, product.deletePricing);
// app.post('/delete_pricing',product.deletePricing);
app.post('/edit_pricing',Auth.checkCblAuthority, Auth.storeDbInRequest, product.editPricing);
app.post('/change_product_status', Auth.checkCblAuthority,Auth.storeDbInRequest, product.changeProductStatus);
app.post('/list_supplier_branch_products', Auth.checkCblAuthority,Auth.storeDbInRequest, product.listProductDetailsOfSupplierBranch);
app.post('/v1/list_supplier_branch_products', Auth.checkCblAuthority,Auth.storeDbInRequest, product.listProductDetailsOfSupplierBranch);

app.post('/assign_product_to_supplier_branch',Auth.checkCblAuthority, Auth.storeDbInRequest, product.assignProductToSupplierBranch);

app.use('/add_supplier_branch_product', multipartMiddleware);
app.post('/add_supplier_branch_product',Auth.checkCblAuthority, Auth.storeDbInRequest, product.addSupplierBranchProduct);


app.use('/v1/add_supplier_branch_product', multipartMiddleware);
app.post('/v1/add_supplier_branch_product',Auth.checkCblAuthority, Auth.storeDbInRequest, product.addSupplierBranchProduct);


app.use('/order_by_supplier_branch_product', multipartMiddleware);
app.post('/order_by_supplier_branch_product',Auth.checkCblAuthority, Auth.storeDbInRequest, product.orderBySupplierBranchProduct);

app.post('/delete_supplier_branch_product', Auth.checkCblAuthority,Auth.storeDbInRequest, product.deleteSupplierBranchProduct);
app.post('/list_supplier_branch_names',Auth.checkCblAuthority, Auth.storeDbInRequest, product.listSupplierBranchesWithNamesOnly);
app.post('/list_products_for_assigning_to_supplier',Auth.checkCblAuthority, Auth.storeDbInRequest, product.listProductsSortedByCategoryOfSupplier);
app.post('/list_branch_areas', Auth.checkCblAuthority,Auth.storeDbInRequest, product.listBranchAreas);
app.use('/edit_product', multipartMiddleware);
app.post('/edit_product',Auth.checkCblAuthority, Auth.storeDbInRequest, product.editProduct);
app.post('/add_hourly_price_of_product', Auth.checkCblAuthority,Auth.storeDbInRequest, product.addPerHourPricing);
app.post('/list_hourly_pricing',Auth.checkCblAuthority, Auth.storeDbInRequest, product.listPerHourPricing);
app.post('/delete_hourly_pricing', Auth.checkCblAuthority,Auth.storeDbInRequest, product.deletePerHourPricing);
app.post('/edit_hourly_pricing',Auth.checkCblAuthority, Auth.storeDbInRequest, product.editPerHourPricing);
app.post('/product_list',Auth.checkCblAuthority, Auth.storeDbInRequest, product.productsList);

app.post('/supplier_product_list',Auth.checkCblAuthority, Auth.storeDbInRequest, product.supplierProductsList);
app.post('/refresh_buttton', Auth.checkCblAuthority,Auth.storeDbInRequest, product.refreshButttons);
app.post('/branch_product_list',Auth.checkCblAuthority, Auth.storeDbInRequest, product.branchProductList);



//Supplier-Production API's 
app.post('/list_currencies_in_supplier',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierproduct.listCurrencies);
app.use('/add_product_by_supplier', multipartMiddleware);
app.post('/add_product_by_supplier',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierproduct.addProductbysupplier);

app.use('/v1/add_product_by_supplier', multipartMiddleware);
app.post('/v1/add_product_by_supplier',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierproduct.addProductbysupplier);

app.post('/product_info',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierproduct.listProductofsupplier);
app.post('/delete_product_by_supplier',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierproduct.deleteproduct);
app.post('/product_description',Auth.checkCblAuthority,Auth.storeDbInRequest, supplierproduct.productdescription);
app.post('/add_product_pricing_by_supplier', Auth.checkCblAuthority,Auth.storeDbInRequest, supplierproduct.addPricingOfProductBysupplier);

app.post('/list_supplier_branch_products_by_supplier',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierproduct.listProductDetailsOfSupplierBranch);
app.post('/v1/list_supplier_branch_products_by_supplier',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierproduct.listProductDetailsOfSupplierBranchV1);
app.post('/assign_product_to_supplier_branch_by_supplier',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierproduct.assignProductToSupplierBranch);

app.use('/add_supplier_branch_product_by_supplier', multipartMiddleware);
app.post('/add_supplier_branch_product_by_supplier',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierproduct.addSupplierBranchProduct);

app.use('/v1/add_supplier_branch_product_by_supplier', multipartMiddleware);
app.post('/v1/add_supplier_branch_product_by_supplier',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierproduct.addSupplierBranchProduct);


app.post('/delete_supplier_branch_product_by_supplier',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierproduct.deleteSupplierBranchProduct);
/*
app.post('/list_supplier_branch_names_by_supplier',supplierproduct.listSupplierBranchesWithNamesOnly);
*/
app.post('/list_branch_areas_by_supplier',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierproduct.listBranchAreas);
app.post('/get_languages_in_supplier',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierproduct.getLanguages);
app.use('/edit_product_by_supplier', multipartMiddleware);
app.post('/edit_product_by_supplier',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierproduct.editProduct);
app.post('/list_product_pricing_by_supplier',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierproduct.listProductPricing);
app.post('/delete_pricing_by_supplier',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierproduct.deletePricing);
app.post('/edit_pricing_by_supplier',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierproduct.editPricing);
app.post('/list_supplier_category',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierproduct.listSupplierCategories);
app.post('/list_supplier_sub_category',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierproduct.listSupplierSubCategories);
app.post('/list_supplier_detailed_sub_category',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierproduct.listSupplierDetailedSubCategories);
app.post('/assign_product_of_admin_by_supplier',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierproduct.assignProductToSupplier);

app.post('/list_admin_products',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierproduct.listProducts);

app.post('/list_supplier_branch',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierproduct.listSupplierBranchesWithNamesOnly);
app.post('/check_supplier',Auth.checkCblAuthority, Auth.storeDbInRequest, users.checkSupplier);
app.post('/check_branch',Auth.checkCblAuthority, Auth.storeDbInRequest, users.checkBranch);
/*app.post('/seraching_product',supplierproduct.serachingProduct);*/

//WebSite Api's
app.post('/register_supplier_on_website',Auth.checkCblAuthority, Auth.storeDbInRequest, website.registerSupplierOnWebsite);



//Extranet Product Manager

app.post('/list_pending_approval_products',Auth.checkCblAuthority, Auth.storeDbInRequest, extranetProductManager.listPendingApprovalProducts);
app.post('/approve_pending_product', Auth.checkCblAuthority,Auth.storeDbInRequest, extranetProductManager.approveProductByAdmin);

// image
app.post('/post_image_resize', Auth.checkCblAuthority,Auth.storeDbInRequest, image.imageResize);
app.get('/get_image_resize',Auth.checkCblAuthority, Auth.storeDbInRequest, image.getimageResize);

//Packages and promotions
app.post('/checkPromoV1',Auth.checkCblAuthority, Auth.storeDbInRequest,promo.checkPromoV1);
app.post('/list_suppliers',Auth.checkCblAuthority, Auth.storeDbInRequest, packagesAndPromotions.listSuppliers);
app.post('/list_branches',Auth.checkCblAuthority, Auth.storeDbInRequest, packagesAndPromotions.listBranches);

app.post('/list_branches_by_agent',Auth.checkCblAuthority, Auth.storeDbInRequest, packagesAndPromotions.listBranchesByAgent);


app.post('/list_supplier_categories_for_package',Auth.checkCblAuthority, Auth.storeDbInRequest, packagesAndPromotions.listSupplierCategoriesForPackage);
app.post('/list_branch_products_for_promotions',Auth.checkCblAuthority, Auth.storeDbInRequest, packagesAndPromotions.listBranchProducts);
app.post('/list_packages_of_supplier_branch',Auth.checkCblAuthority, Auth.storeDbInRequest, packagesAndPromotions.listPackages);

app.post('/list_package_pricing',Auth.checkCblAuthority, Auth.storeDbInRequest, packagesAndPromotions.listPackagePricing);
app.use('/add_supplier_package', multipartMiddleware);

app.post('/add_supplier_package',Auth.checkCblAuthority, Auth.storeDbInRequest, packagesAndPromotions.addSupplierPackage);

app.post('/add_package_pricing',Auth.checkCblAuthority, Auth.storeDbInRequest, packagesAndPromotions.addPricingOfPackage);

app.post('/add_package_pricing_by_supplier', Auth.checkCblAuthority,Auth.storeDbInRequest, supplierPackagesAndPromotions.addPricingOfPackage);


app.post('/delete_package',Auth.checkCblAuthority, Auth.storeDbInRequest, packagesAndPromotions.deletePackage);
app.use('/add_promotion', multipartMiddleware);
app.post('/add_promotion',Auth.checkCblAuthority, Auth.storeDbInRequest, packagesAndPromotions.addPromotion);

app.post('/list_promotions',Auth.checkCblAuthority, Auth.storeDbInRequest, packagesAndPromotions.listPromotions);

app.post('/delete_promotion', Auth.checkCblAuthority,Auth.storeDbInRequest, packagesAndPromotions.deletePromotion);


//Supplier summary indication
app.post('/list_supplier_countries', Auth.checkCblAuthority,Auth.storeDbInRequest, supplierSummaryIndication.getSupplierCountryListWithId);
app.post('/list_supplier_cities',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierSummaryIndication.getSupplierCityListWithId);
app.post('/list_supplier_zones',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierSummaryIndication.getSupplierZoneListWithId);
app.post('/list_supplier_areas',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierSummaryIndication.getSupplierAreaListWithId);
app.post('/update_zone_city_charges',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierSummaryIndication.updateSupplierChargesByCityAndZoneId);
app.post('/update_area_charges',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierSummaryIndication.updateSupplierChargesByAreaId);

app.post('/get_supplier_summary',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierSummaryIndication.getSupplierSummaryInfo);
app.post('/update_supplier_summary', Auth.checkCblAuthority,Auth.storeDbInRequest, supplierSummaryIndication.updateSupplierSummaryInfo);
app.post('/update_area_mo',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierSummaryIndication.updateAreaMo);


//Loyalty Points And Redemption Voucher

app.post('/get_loyalty_points',Auth.checkCblAuthority, Auth.storeDbInRequest, loyaltyPoints.getLoyaltyPoints);
app.post('/update_loyalty_points',Auth.checkCblAuthority, Auth.storeDbInRequest, loyaltyPoints.updateLoyaltyPoints);
app.post('/get_supplier_branch_products_for_loyalty',Auth.checkCblAuthority, Auth.storeDbInRequest, loyaltyPoints.listSupplierBranchProductsForRedemptionPage);
app.post('/update_loyalty_points_of_branch',Auth.checkCblAuthority, Auth.storeDbInRequest, loyaltyPoints.updateLoyaltyPointsofBranch);
app.post('/delete_product_loyalty_points',Auth.checkCblAuthority, Auth.storeDbInRequest, loyaltyPoints.deleteLoyaltyPointsOfProduct);
app.post('/list_loyalty_points_of_product',Auth.checkCblAuthority, Auth.storeDbInRequest, loyaltyPoints.listLoyaltyPointsOfProduct);
app.post('/delete_voucher',Auth.checkCblAuthority, Auth.storeDbInRequest, loyaltyPoints.delete_voucher);



//Client Profile
app.post('/get_users',Auth.checkCblAuthority, Auth.storeDbInRequest, clientProfile.listUsers);
app.post('/active_deactive_user',Auth.checkCblAuthority, Auth.storeDbInRequest, clientProfile.activeDeactiveUsers);
app.post('/update_user_loyalty',Auth.checkCblAuthority, Auth.storeDbInRequest, clientProfile.updateUserLoyaltyPoint);


//Advertisements
app.use('/add_banner_advertisement', multipartMiddleware);
app.post('/add_banner_advertisement',Auth.checkCblAuthority, Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin, advertisements.addBannerAdvertisement);
app.use('/add_banner_advertisement_by_supplier', multipartMiddleware);
app.post('/add_banner_advertisement_by_supplier',Auth.checkCblAuthority,Auth.supplierAuth,
Auth.checkforAuthorityofThisSupplier, advertisements.addBannerAdvertisement);


app.post('/add_notification_advertisement',Auth.checkCblAuthority, Auth.storeDbInRequest, advertisements.addNotificationAdvertisement);
app.use('/add_supplier_advertisement', multipartMiddleware);
app.post('/add_supplier_advertisement',Auth.checkCblAuthority, Auth.storeDbInRequest, advertisements.addSupplierExtranetAdvertisement);
app.use('/add_sponsor_advertisement', multipartMiddleware);
app.post('/add_sponsor_advertisement',Auth.checkCblAuthority, Auth.storeDbInRequest, advertisements.addSponsorAdvertisement);
app.use('/add_email_advertisement', multipartMiddleware);
app.post('/add_email_advertisement',Auth.checkCblAuthority, Auth.storeDbInRequest, advertisements.addEmailAdvertisement);
app.post('/delete_advertisement',Auth.checkCblAuthority,Auth.storeDbInRequest, advertisements.deleteAdvertisement);
app.post('/send_email_advertisement',Auth.checkCblAuthority, Auth.storeDbInRequest, advertisements.sendEmailAdvertisement);
app.post('/change_advertisement_status',Auth.checkCblAuthority, Auth.storeDbInRequest, advertisements.changeAdvertisementStatus);
app.post('/change_advertisement_status_new',Auth.checkCblAuthority, Auth.storeDbInRequest, advertisements.changeAdvertisementStatusNew);
app.post('/list_advertisements',Auth.checkCblAuthority, Auth.storeDbInRequest, advertisements.listAdvertisements);
app.post('/list_advertisements_by_supplier',Auth.checkCblAuthority, Auth.storeDbInRequest, advertisements.listAdvertisementsBySupplier);
app.post('/send_push_notification',Auth.checkCblAuthority, Auth.storeDbInRequest, advertisements.sendPushNotification);
app.post('/delete_advertisement_new',Auth.checkCblAuthority, Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin, advertisements.deleteAdvertisement_new);
app.post('/delete_advertisement_new_by_supplier',Auth.checkCblAuthority,Auth.supplierAuth,
Auth.checkforAuthorityofThisSupplier, advertisements.deleteAdvertisement_new);

//Admin-Orders API's
app.post('/change_date',Auth.checkCblAuthority, Auth.storeDbInRequest, adminOrders.changeDate);
app.post('/change_date_ios',Auth.checkCblAuthority, Auth.storeDbInRequest, adminOrders.changeDateIos);
app.get('/admin_list_pos_keys',/*Auth.checkCblAuthority, */Auth.storeDbInRequest1, adminOrders.listPosKeys);


app.post('/admin_order_list',Auth.checkCblAuthority, Auth.storeDbInRequest, adminOrders.orderListing);

app.post('/v2/admin_order_list',Auth.checkCblAuthority, Auth.storeDbInRequest, adminOrders.orderListingV2);

app.post('/delivery_company_order_list',Auth.checkCblAuthority, Auth.storeDbInRequest, adminOrders.deliveryCompanyOrderListing);


app.post('/v2/order_description',Auth.checkCblAuthority, Auth.storeDbInRequest, adminOrders.orderDescriptionV2);

/**
 * add new for north west Eats project for without authentication case
 */
app.post('/v3/order_description',Auth.checkCblAuthority, Auth.storeDbInRequest, adminOrders.orderDescriptionV3)
/**
 * end
 */
app.post('/delivery_company_order_description',Auth.checkCblAuthority, Auth.storeDbInRequest, adminOrders.deliveryCompanyOrderDescription);

app.post('/order_description',Auth.checkCblAuthority, Auth.storeDbInRequest, adminOrders.orderDescription);


app.post('/pending_orders',Auth.checkCblAuthority, Auth.storeDbInRequest, adminOrders.pendingOrders);
app.post('/admin/see_users',Auth.checkCblAuthority,users.see_user);


app.post('/confirm_pending_order_by_admin',Auth.checkCblAuthority,Auth.authenticateAccessToken,adminOrders.confirmPendingOrder);

app.post('/confirm_pending_order_by_delivery_company',Auth.storeDbInRequest,adminOrders.deliveryCompanyConfirmPendingOrder);

app.post('/order_progress_by_admin',Auth.checkCblAuthority,Auth.authenticateAccessToken,adminOrders.orderInProgress);
app.post('/order_progress_by_delivery_company',Auth.storeDbInRequest,adminOrders.deliveryCompanyOrderInProgress);

app.post('/order_shipped_by_admin',Auth.checkCblAuthority,Auth.authenticateAccessToken,adminOrders.orderShipped);


app.post('/order_nearby_by_admin',Auth.checkCblAuthority,Auth.authenticateAccessToken,adminOrders.orderNearby);

app.post('/order_delivered_by_admin',Auth.checkCblAuthority,Auth.authenticateAccessToken,adminOrders.deliveredOrder);

app.post('/order_nearby_delivery_company',Auth.storeDbInRequest,adminOrders.deliveryCompanyOrderNearby);

app.post('/order_delivered_by_delivery_company',Auth.checkCblAuthority,Auth.authenticateAccessToken,adminOrders.deliveryCompanyDeliveredOrder);
app.post('/order_shipped_by_delivery_company',Auth.storeDbInRequest,adminOrders.deliveryCompanyOrderShipped);


app.post('/mumybene_payment_status',Auth.checkCblAuthority,Auth.authenticateAccessToken,adminOrders.mumybenePaymentStatus);
app.post('/mumybene_account_balance',Auth.checkCblAuthority,Auth.authenticateAccessToken,adminOrders.mumybeneAccountBalance);
app.post('/mumybene_reverse_payment',Auth.checkCblAuthority,Auth.authenticateAccessToken,adminOrders.mumybeneReversePayment);



//Supplier-Orders API's
app.post('/supplier_order_list',Auth.checkCblAuthority,Auth.supplierAuth,supplierorder.supplierOrderListing);
app.post('/v2/supplier_order_list',Auth.checkCblAuthority,Auth.supplierAuth,supplierorder.supplierOrderListingV2);

app.post('/supplier_order_description',Auth.checkCblAuthority,Auth.supplierAuth,supplierorder.supplierOrderDescription);
app.post('/supplier_pending_orders',Auth.checkCblAuthority,Auth.supplierAuth,supplierorder.supplierPendingOrders);
app.post('/confirm_pending_order_by_supplier',Auth.checkCblAuthority,Auth.supplierAuth,supplierorder.supplierConfirmPendingOrder);

app.post('/order_progress_by_supplier',Auth.checkCblAuthority,Auth.supplierAuth,supplierorder.supplierOrderInProgress);

app.post('/order_shipped_by_supplier',Auth.checkCblAuthority,Auth.supplierAuth,supplierorder.supplierOrderShipped);

app.post('/order_delivered_by_admin', Auth.checkCblAuthority,Auth.storeDbInRequest, adminOrders.deliveredOrder);

app.post('/tracking_order_list',Auth.checkCblAuthority, Auth.storeDbInRequest, adminOrders.ordersTracked);
app.post('/update_tracked_order',Auth.checkCblAuthority, Auth.storeDbInRequest, adminOrders.updateTrackedOrder);
app.post('/supplier_rate_comments__listing',Auth.checkCblAuthority, Auth.storeDbInRequest, adminOrders.rateCommentListing);
app.post('/approved_rate_comment',Auth.checkCblAuthority, Auth.storeDbInRequest, adminOrders.approveRateComment);
app.post('/order_feedback_list',Auth.checkCblAuthority, Auth.storeDbInRequest, adminOrders.feedbackList);
app.post('/read_order_feedback',Auth.checkCblAuthority, Auth.storeDbInRequest, adminOrders.readFeedback);
app.post('/scheduled_order_list',Auth.checkCblAuthority, Auth.storeDbInRequest, adminOrders.scheduledOrder);


//Supplier-Orders API's
// app.post('/supplier_order_list',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierorder.supplierOrderListing);
app.post('/supplier_order_description',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierorder.supplierOrderDescription);
app.post('/v2/supplier_order_description',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierorder.supplierOrderDescriptionV2);
app.post('/supplier_pending_orders',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierorder.supplierPendingOrders);
app.post('/confirm_pending_order_by_supplier',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierorder.supplierConfirmPendingOrder);
app.post('/order_shipped_by_supplier',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierorder.supplierOrderShipped);


app.post('/order_nearby_by_supplier',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierorder.supplierOrderNearby);
app.post('/order_delivered_by_supplier',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierorder.supplierDeliveredOrder);
app.post('/supplier_tracking_order_list',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierorder.supplierOrdersTrackedList);
app.post('/update_tracked_order_by_supplier',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierorder.updateTrackedOrderbySupplier);
app.post('/scheduled_order_list_by_supplier',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierorder.scheduledOrder);
app.post('/rate_comments_listing_of_supplier',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierorder.rateCommentListing);


//Branch-Orders API's
app.post('/branch_order_list',Auth.checkCblAuthority, Auth.storeDbInRequest, branchOrder.branchOrderListing);
app.post('/btanch_order_description',Auth.checkCblAuthority, Auth.storeDbInRequest, branchOrder.branchOrderDescription);
app.post('/branch_pending_orders',Auth.checkCblAuthority, Auth.storeDbInRequest, branchOrder.branchPendingOrders);
app.post('/confirm_pending_order_by_branch',Auth.checkCblAuthority, Auth.storeDbInRequest, branchOrder.branchConfirmPendingOrder);
app.post('/order_shipped_by_branch',Auth.checkCblAuthority, Auth.storeDbInRequest, branchOrder.branchOrderShipped);
app.post('/order_nearby_by_branch',Auth.checkCblAuthority, Auth.storeDbInRequest, branchOrder.branchOrderNearby);
app.post('/order_delivered_by_branch',Auth.checkCblAuthority,Auth.storeDbInRequest, branchOrder.branchDeliveredOrder);
app.post('/branch_tracking_order_list',Auth.checkCblAuthority, Auth.storeDbInRequest, branchOrder.branchOrdersTrackedList);
app.post('/update_tracked_order_by_branch',Auth.checkCblAuthority, Auth.storeDbInRequest, branchOrder.updateTrackedOrderbyBranch);


//Admin Account API's
app.get('/get_admin_chat_list',Auth.checkCblAuthority, Auth.storeDbInRequest, adminAccounts.getAdminChatList);
app.get('/get_supplier_chat_list',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierAccounts.getSupplierChatList);
app.get('/get_agents_payout_request_list',Auth.checkCblAuthority, Auth.storeDbInRequest, adminAccounts.payoutAgentRequestList);
app.get('/get_supplier_payout_request_list',Auth.checkCblAuthority, Auth.storeDbInRequest, adminAccounts.payoutSupplierRequestList);
app.post('/accept_reject_payout_request',Auth.checkCblAuthority, Auth.storeDbInRequest, adminAccounts.acceptRejectPayoutRequest);
app.post('/v1/accept_reject_payout_request',Auth.checkCblAuthority, Auth.storeDbInRequest, adminAccounts.acceptRejectPayoutRequestV1);
app.post('/agent_payout_payament',Auth.checkCblAuthority, Auth.storeDbInRequest, adminAccounts.agentPayoutPayments);
app.post('/supplier_payout_payament',Auth.checkCblAuthority, Auth.storeDbInRequest, adminAccounts.supplierPayoutPayments);

app.post('/account_payable_list',Auth.checkCblAuthority, Auth.storeDbInRequest, adminAccounts.accountPayablelist);
app.post('/v1/account_payable_list',Auth.checkCblAuthority, Auth.storeDbInRequest, adminAccounts.accountPayablelistV1);
app.post('/payable_description',Auth.checkCblAuthority, Auth.storeDbInRequest, adminAccounts.payableDescription);
app.post('/account_payament',Auth.checkCblAuthority, Auth.storeDbInRequest, adminAccounts.payment);
app.post('/account_receivable_list',Auth.checkCblAuthority, Auth.storeDbInRequest, adminAccounts.accountReceivablelist);
app.post('/v1/account_receivable_list',Auth.checkCblAuthority, Auth.storeDbInRequest, adminAccounts.accountReceivablelistV1);
app.post('/receivable_description',Auth.checkCblAuthority, Auth.storeDbInRequest, adminAccounts.receivableDescription);

app.post('/admin_account_statement',Auth.checkCblAuthority, Auth.storeDbInRequest, adminAccounts.statement);
app.post('/v1/admin_account_statement',Auth.checkCblAuthority, Auth.storeDbInRequest, adminAccounts.statementV1);

app.post('/driver_account_statement',Auth.checkCblAuthority, Auth.storeDbInRequest, adminAccounts.driverStatement);
app.post('/v1/driver_account_statement',Auth.checkCblAuthority, Auth.storeDbInRequest, adminAccounts.driverStatementV1);
app.post('/driver_account_payable_list',Auth.checkCblAuthority, Auth.storeDbInRequest, adminAccounts.driverAccountPayablelist);
app.post('/v1/driver_account_payable_list',Auth.checkCblAuthority, Auth.storeDbInRequest, adminAccounts.driverAccountPayablelistV1);
app.post('/driver_account_payament',Auth.checkCblAuthority, Auth.storeDbInRequest, adminAccounts.driverPayment);

app.post('/add_suggestions',Auth.checkCblAuthority, Auth.storeDbInRequest, adminAccounts.addSuggestions);
app.post('/edit_suggestions',Auth.checkCblAuthority, Auth.storeDbInRequest, adminAccounts.editSuggestions);
app.get('/get_suggestions',Auth.checkCblAuthority, Auth.storeDbInRequest, adminAccounts.getSuggestions);
app.post('/delete_block_suggestions',Auth.checkCblAuthority, Auth.storeDbInRequest, adminAccounts.deleteBlockSuggestions);
app.post('/approve_new_suggestions',Auth.checkCblAuthority, Auth.storeDbInRequest, adminAccounts.approveNewSuggestions);
app.get('/get_feedbacks',Auth.checkCblAuthority, Auth.storeDbInRequest, adminAccounts.getFeedbacks);
app.post('/edit_feedback',Auth.checkCblAuthority, Auth.storeDbInRequest, adminAccounts.editFeedback);
app.post('/delete_feedbacks',Auth.checkCblAuthority, Auth.storeDbInRequest, adminAccounts.deleteFeedbacks);
app.post('/save_footer_details',Auth.checkCblAuthority, Auth.storeDbInRequest, adminAccounts.saveFooterDetails);



app.get('/v1/reset_password_link',admin.sendPwdresetlink)
app.post('/v1/verify',admin.verifylink);
app.post('/v1/updatePassword',admin.updatePassword)
 

// in driver_account_payament API below 4 params are required
//transaction_mode
// amount
// orderId
// user_id
 

//Supplier-Account API's
app.post('/supplier_account_payable_list',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierAccounts.accountPayablelist);
app.post('/supplier_payable_description',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierAccounts.payableDescription);
app.post('/supplier_account_payament',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierAccounts.payment);
app.post('/supplier_account_receivable_list',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierAccounts.accountReceivablelist);
app.post('/supplier_receivable_description',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierAccounts.receivableDescription);
app.post('/supplier_account_statement',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierAccounts.statement);


app.post('/supplier_driver_account_statement',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierAccounts.driverStatement);
app.post('/supplier_driver_account_payable_list',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierAccounts.supplierDriverAccountPayablelist);
app.post('/supplier_driver_account_payament',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierAccounts.supplierDriverPayment);

app.post('/supplier_connectWithStripe',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierAccounts.supplierConnectWithStripe);

// in driver_account_payament API below 4 params are required
//transaction_mode
// amount
// orderId
// user_id
 

// app.post('/add_notifica')
//Reports
app.post('/user_subscription_revenue_report',Auth.checkCblAuthority,Auth.authenticateAccessToken,Auth.checkforAuthorityofThisAdmin, reports.userSubscriptionRevenueReport);
app.post('/supplier_subscription_revenue_report',Auth.checkCblAuthority,Auth.authenticateAccessToken,Auth.checkforAuthorityofThisAdmin, reports.supplierSubscriptionRevenueReport);
app.post('/order_graphical_report',Auth.checkCblAuthority,Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin, reports.orderGrapicalReport);
app.post('/supplier_order_graphical_report',Auth.checkCblAuthority, Auth.supplierAuth,
Auth.checkforAuthorityofThisSupplier, reports.orderGrapicalReport);
app.post('/order_report',Auth.checkCblAuthority, Auth.storeDbInRequest, reports.orderReport);
app.post('/user_report',Auth.checkCblAuthority, Auth.storeDbInRequest, reports.userReport);
app.post('/zone_report',Auth.checkCblAuthority, Auth.storeDbInRequest, reports.zoneReport);
app.post('/area_report',Auth.checkCblAuthority, Auth.storeDbInRequest, reports.areaReport);
app.post('/admin_report',Auth.checkCblAuthority, Auth.storeDbInRequest, reports.adminReport);
app.post('/supplier_report',Auth.checkCblAuthority, Auth.storeDbInRequest, reports.supplierReport);
app.post('/category_report',Auth.checkCblAuthority, Auth.storeDbInRequest, reports.categoryReport);
app.post('/services_report',Auth.checkCblAuthority, Auth.storeDbInRequest, reports.servicesReport);
app.post('/products_report',Auth.checkCblAuthority, Auth.storeDbInRequest, reports.productReport);
app.post('/profit_loss_report',Auth.checkCblAuthority, Auth.storeDbInRequest, reports.profitLossReport);
app.post('/package_report',Auth.checkCblAuthority, Auth.storeDbInRequest, reports.packageReport);
app.post('/agent_report',Auth.checkCblAuthority,Auth.storeDbInRequest, reports.agentReport)
app.post('/admin_products_report',Auth.checkCblAuthority,Auth.storeDbInRequest, Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin, reports.adminProductReport);
app.post('/supplier_products_report',Auth.checkCblAuthority, Auth.storeDbInRequest,Auth.supplierAuth,
Auth.checkforAuthorityofThisSupplier, reports.adminProductReport);

/**
 *  User subscription report
 * @todo
 * @author Parijat Chauahn
 */

 app.post('/user_subscription_report', Auth.checkCblAuthority, Auth.storeDbInRequest, reports.userSubscriptionReport);





//Supplier Reports
app.post('/supplier_order_report',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierReports.orderReport);
app.post('/supplier_area_report',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierReports.areaReport);
app.post('/supplier_agent_report',Auth.checkCblAuthority,Auth.storeDbInRequest,supplierReports.agentReport);


//Supplier Extranet/App
app.post('/check_app_version',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierExtranet.checkAppVersion);

app.post('/get_Admin_version',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierExtranet.get_Admin_version);


app.post('/edit_version',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierExtranet.edit_version);



app.post('/supplier_app_login',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierExtranet.supplierLoginToApp);

app.post('/access_token_login',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierExtranet.accessTokenLogin);
app.post('/order_management',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierExtranet.orderManagementPage);
app.post('/supplier_profile', Auth.checkCblAuthority,Auth.storeDbInRequest, supplierExtranet.supplierProfile);
app.post('/list_pending_orders',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierExtranet.listPendingOrders);
app.post('/list_pending_tracking_alerts',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierExtranet.listPendingTrackingAlerts);
app.post('/list_scheduled_orders_for_tomorrow',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierExtranet.listScheduledOrderForTomorrow);
app.post('/advertisement_page',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierExtranet.advertisementPage);
app.post('/no_of_orders_delivered', Auth.checkCblAuthority, Auth.storeDbInRequest,Auth.storeDbInRequest, supplierExtranet.noOfOrdersDelivered);
app.post('/accept_order',Auth.checkCblAuthority,  Auth.storeDbInRequest,Auth.storeDbInRequest, supplierExtranet.acceptPendingOrder);
app.post('/reject_order',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierExtranet.rejectPendingOrder);
app.post('/request_subscription_renewal',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierExtranet.requestSubscriptionRenewal);
app.post('/request_commission_change',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierExtranet.requestCommissionChange);
app.post('/supplier_logout',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierExtranet.supplierLogout);
app.post('/supplier_branch_logout',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierExtranet.supplierBranchLogout);
app.post('/total_supplier_revenue',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierExtranet.totalRevenue);  // supplier total revenue
app.post('/change_status_order',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierExtranet.changeStatusOrder);
app.post('/change_supplier_status',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierExtranet.changeSupplierStatus);

app.post('/order_details',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierExtranet.orderDetails);

app.post('/user_canceled_orders',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierExtranet.userCancelOrder);
app.post('/acknowledge_cancel_order',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierExtranet.acknowledgeCancelOrder);



//Settings Page
app.post('/list_social_account_links',Auth.checkCblAuthority, Auth.storeDbInRequest, settings.viewSocialAccountLinks);
app.post('/update_social_account_links',Auth.checkCblAuthority, Auth.storeDbInRequest, settings.updateSocialAccountLinks);
app.post('/list_users_for_settings',Auth.checkCblAuthority, Auth.storeDbInRequest, settings.listUsersForSettingsPage);
app.post('/list_suppliers_for_settings',Auth.checkCblAuthority, Auth.storeDbInRequest, settings.listSuppliersForSettingsPage);
app.get('/list_agents_for_settings',Auth.checkCblAuthority, Auth.storeDbInRequest, settings.listAgentsForSettingsPage);


app.get('/api/v1/flexpay/callback',settings.flexPayCallback)
app.post('/api/v1/flexpay/callback',settings.flexPayCallback)

app.post('/delete_flexpay',Auth.checkCblAuthority, Auth.storeDbInRequest,settings.deleteFlexPayMobile)
app.get('/get_flexpay',Auth.checkCblAuthority, Auth.storeDbInRequest,settings.getFlexPayMobile)
app.post('/save_flexpay',Auth.checkCblAuthority, Auth.storeDbInRequest,settings.saveFlexPayMobile)



app.post('/send_system_email',Auth.checkCblAuthority, Auth.storeDbInRequest, settings.sendSystemEmail);
app.post('/send_system_sms',Auth.checkCblAuthority, Auth.storeDbInRequest, settings.sendSystemSMS);
// app.post('/send_system_sms',Auth.storeDbInRequest,settings.sendSystemSMS);
app.post('/list_t_and_c',Auth.checkCblAuthority, Auth.storeDbInRequest, settings.listTermsAndConditions);
app.post('/list_faq',Auth.checkCblAuthority, Auth.storeDbInRequest, settings.listFAQ);
app.post('/list_about_us',Auth.checkCblAuthority, Auth.storeDbInRequest, settings.listAboutUs);
app.post('/update_t_and_c',Auth.checkCblAuthority, Auth.storeDbInRequest, settings.updateTandC);
app.post('/update_faq',Auth.checkCblAuthority, Auth.storeDbInRequest, settings.updateFAQ);
app.post('/update_about_us',Auth.checkCblAuthority, Auth.storeDbInRequest, settings.updateAboutUs);
app.post('/send_push_to_customer',Auth.checkCblAuthority, Auth.storeDbInRequest, settings.sendPushToCustomers);
app.post('/list_system_emails', Auth.checkCblAuthority,Auth.storeDbInRequest, settings.listSystemEmails);
app.post('/list_system_sms',Auth.checkCblAuthority, Auth.storeDbInRequest, settings.listSystemSMS);



//Supplier summary indication




//Supplier Summary Setup
app.post('/list_supplier_country',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierSummarySetup.getSupplierCountryListWithId);
app.post('/list_supplier_city',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierSummarySetup.getSupplierCityListWithId);
app.post('/list_supplier_zone',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierSummarySetup.getSupplierZoneListWithId);
app.post('/list_supplier_area',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierSummarySetup.getSupplierAreaListWithId);
app.post('/update_area_charge',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierSummarySetup.updateSupplierChargesByAreaId);
app.post('/fetch_supplier_summary',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierSummarySetup.getSupplierSummaryInfo);
app.post('/updated_supplier_summary',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierSummarySetup.updateSupplierSummaryInfo);
app.post('/supplier_update_area_mo',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierSummarySetup.updateAreaMo);
app.post('/update_zone_city_charge',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierSummarySetup.updateSupplierChargesByCityAndZoneId);




//Packages And Promotion of supplier

app.post('/list_branches_by_supplier',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierPackagesAndPromotions.listBranches);
app.post('/list_supplier_categories_for_package_by_supplier',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierPackagesAndPromotions.listSupplierCategoriesForPackage);
app.post('/list_branch_products_for_promotions_by_supplier',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierPackagesAndPromotions.listBranchProducts);
app.post('/list_packages_of_supplier_branch_by_supplier',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierPackagesAndPromotions.listPackages);

app.use('/add_package_by_supplier', multipartMiddleware);
app.post('/add_package_by_supplier',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierPackagesAndPromotions.addPackage);
app.post('/delete_package_by_supplier',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierPackagesAndPromotions.deletePackage);

app.use('/add_promotion_by_supplier', multipartMiddleware);
app.post('/add_promotion_by_supplier',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierPackagesAndPromotions.addPromotion);
app.post('/list_promotions_by_supplier',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierPackagesAndPromotions.listPromotions);

app.post('/delete_promotion_by_supplier',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierPackagesAndPromotions.deletePromotion);
app.post('/get_supplier_branch_products',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierPackagesAndPromotions.listSupplierBranchProducts);


//Admin Loyality Orders
app.post('/admin_loyalty_order_list',Auth.checkCblAuthority, Auth.storeDbInRequest, adminLoyalityOrders.orderListing);
app.post('/loyalty_order_description',Auth.checkCblAuthority, Auth.storeDbInRequest, adminLoyalityOrders.orderDescription);
app.post('/confirm_pending_loyalty_order_by_admin',Auth.checkCblAuthority, Auth.storeDbInRequest, adminLoyalityOrders.confirmPendingOrder);
app.post('/loyalty_order_shipped_by_admin',Auth.checkCblAuthority, Auth.storeDbInRequest, adminLoyalityOrders.orderShipped);
app.post('/loyalty_order_nearby_by_admin',Auth.checkCblAuthority, Auth.storeDbInRequest, adminLoyalityOrders.orderNearby);
app.post('/loyalty_order_delivered_by_admin',Auth.checkCblAuthority, Auth.storeDbInRequest, adminLoyalityOrders.deliveredOrder);
app.post('/tracking_loyalty_order_list',Auth.checkCblAuthority, Auth.storeDbInRequest, adminLoyalityOrders.ordersTracked);
app.post('/update_tracked_loyalty_order',Auth.checkCblAuthority, Auth.storeDbInRequest, adminLoyalityOrders.updateTrackedOrder);


//Supplier Loyalty Orders

app.post('/supplier_loyalty_order_list',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierLoyaltyOrders.orderListing);
app.post('/supplier_loyalty_order_description',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierLoyaltyOrders.orderDescription);
app.post('/confirm_pending_loyalty_order_by_supplier',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierLoyaltyOrders.confirmPendingOrder);
app.post('/loyalty_order_shipped_by_supplier',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierLoyaltyOrders.orderShipped);
app.post('/loyalty_order_nearby_by_supplier',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierLoyaltyOrders.orderNearby);
app.post('/loyalty_order_delivered_by_supplier',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierLoyaltyOrders.deliveredOrder);
app.post('/logout_supplier',Auth.checkCblAuthority, Auth.storeDbInRequest, supplierLoyaltyOrders.logoutSupplier);


//supplier branch app
app.post('/branch_login',Auth.checkCblAuthority, Auth.storeDbInRequest, branchOrder.branchLogin);
app.post('/branch_product_lists',Auth.checkCblAuthority, Auth.storeDbInRequest, branchOrder.branchProductlist);
app.post('/change_status_order',Auth.checkCblAuthority, Auth.storeDbInRequest, branchOrder.changeStatusOrder);
app.post('/bulk_image',Auth.checkCblAuthority, Auth.storeDbInRequest, branchOrder.bulkImage);
app.post('/branch_order_management',Auth.checkCblAuthority, Auth.storeDbInRequest, branchOrder.orderManagementPage);
app.post('/list_branch_pending_orders',Auth.checkCblAuthority, Auth.storeDbInRequest, branchOrder.listPendingOrders);
app.post('/list_branch_pending_tracking_alerts',Auth.checkCblAuthority, Auth.storeDbInRequest, branchOrder.listPendingTrackingAlerts);
app.post('/list_branch_scheduled_orders_for_tomorrow',Auth.checkCblAuthority, Auth.storeDbInRequest, branchOrder.listScheduledOrderForTomorrow);
app.post('/branch_accept_order',Auth.checkCblAuthority, Auth.storeDbInRequest, branchOrder.acceptPendingOrder);
app.post('/branch_reject_order',Auth.checkCblAuthority, Auth.storeDbInRequest, branchOrder.rejectPendingOrder);
app.post('/branch_change_status_order',Auth.checkCblAuthority, Auth.storeDbInRequest, branchOrder.changeBranchStatusOrder);

app.post('/branch_cancel_order',Auth.checkCblAuthority, Auth.storeDbInRequest, branchOrder.branchCancelOrder);
app.post('/branch_order_details',Auth.checkCblAuthority, Auth.storeDbInRequest, branchOrder.branchOrderDetails);
app.post('/branch_acknowledge_cancel_order',Auth.checkCblAuthority, Auth.storeDbInRequest, branchOrder.branchOrderBranchAcknowledgeCancelOrder);
app.post('/testing_andriod',Auth.checkCblAuthority, Auth.storeDbInRequest, branchOrder.testingAndriod);
app.post('/changeBanner',Auth.checkCblAuthority, Auth.storeDbInRequest, branchOrder.changeBanner);


//app.post('/imageChange',branchOrder.image_Change);

app.post('/addPromo',Auth.checkCblAuthority, Auth.storeDbInRequest, promo.createNewPromo);

app.post('/listPromo',Auth.checkCblAuthority, Auth.storeDbInRequest, promo.listPromo);
app.post('/serachPromo',Auth.checkCblAuthority, Auth.storeDbInRequest, promo.serachPromo);
app.post('/startPromo',Auth.checkCblAuthority,Auth.storeDbInRequest, promo.startPromo);



app.post('/checkPromo',Auth.checkCblAuthority, Auth.storeDbInRequest, promo.checkPromo);

app.post('/listPromoUser',Auth.checkCblAuthority, Auth.storeDbInRequest, promo.listPromoUser);
//app.post('/editPromo',promo.editPromo);
app.post('/deletePromo',Auth.checkCblAuthority, Auth.storeDbInRequest, promo.deletePromo);
app.post('/deactivePromo',Auth.checkCblAuthority, Auth.storeDbInRequest, promo.deactivePromo);

// customer API's
app.get('/get_all_category_new',Auth.checkCblAuthority, Auth.storeDbInRequest, users.getAllCategoryNew);

app.get('/get_all_category_new/V1',Auth.checkCblAuthority, Auth.storeDbInRequest, users.getAllCategoryNew);

app.post('/get_all_category',Auth.checkCblAuthority, Auth.storeDbInRequest, users.getAllCategory);

app.get('/get_all_offer_list',Auth.checkCblAuthority, Auth.storeDbInRequest,users.getAllOffers);

app.get('/get_all_offer_list/v1',Auth.checkCblAuthority, Auth.storeDbInRequest,users.getAllOffersV1);

app.get('/get_all_offer_list/v2',Auth.checkCblAuthority, Auth.storeDbInRequest,users.getAllOffersV2);

app.post('/get_total_pending_schedule',Auth.checkCblAuthority, Auth.storeDbInRequest, users.getPendingAndScheduleCount);

app.post('/get_all_country',Auth.checkCblAuthority, Auth.storeDbInRequest, users.getAllCountry);
app.post('/get_all_city',Auth.checkCblAuthority, Auth.storeDbInRequest, users.getCity);
app.post('/get_all_area',Auth.checkCblAuthority, Auth.storeDbInRequest, users.getArea);
app.post('/get_myfatoorah_payment_url',/*Auth.checkCblAuthority,*/ Auth.storeDbInRequest, users.myFatoorahPayment);
app.post('/get_converge_payment_token',/*Auth.checkCblAuthority,*/ Auth.storeDbInRequest, users.myConvergePayment);
app.post('/payhere_notify_url', users.payhereNotifiyUrl);
app.post('/check_payhere_payment_status',Auth.checkCblAuthority, Auth.storeDbInRequest, users.checkPayherePaymentStatus);

app.post('/get_all_country1',Auth.checkCblAuthority, Auth.storeDbInRequest, users.getAllCountry1);

app.post('/get_all_city1',Auth.checkCblAuthority, Auth.storeDbInRequest, users.getCity1);
app.post('/get_all_area1',Auth.checkCblAuthority, Auth.storeDbInRequest, users.getArea1);


app.post('/get_all_zone',Auth.checkCblAuthority, Auth.storeDbInRequest, users.getZone);



app.post('/get_all_language',Auth.checkCblAuthority, Auth.storeDbInRequest, users.getAllLanguage);

app.post('/supplier_details',Auth.checkCblAuthority, Auth.storeDbInRequest, users.supplierDetails);

app.post('/subcategory_listing',Auth.checkCblAuthority, Auth.storeDbInRequest, users.getSubcategoryDetails);
app.post('/detailed_subcategory_listing',Auth.checkCblAuthority, Auth.storeDbInRequest, users.getDetailsSubcategory);
app.post('/get_products',Auth.checkCblAuthority, Auth.storeDbInRequest, users.getProducts);



app.post('/customer_register_step_first',Auth.checkCblAuthority, Auth.storeDbInRequest, users.customerRegisterstepfirst);
app.post('/v1/customer_register_step_first',Auth.checkCblAuthority, Auth.storeDbInRequest, users.customerRegisterstepfirst);


app.post('/customer_register_step_second',Auth.checkCblAuthority, Auth.storeDbInRequest, users.customerRegisterstepsecond);

app.post('/check_otp',Auth.checkCblAuthority, Auth.storeDbInRequest, users.checkOtp);
app.post('/check_otp_new',Auth.checkCblAuthority, Auth.storeDbInRequest, users.checkOtp);
app.post('/login',Auth.checkCblAuthority, Auth.storeDbInRequest, users.login);
app.post('/v1/login',Auth.checkCblAuthority, Auth.storeDbInRequest, users.login);


app.post('/get_supplier_list',Auth.checkCblAuthority, Auth.storeDbInRequest, users.getSupplierList);
app.post('/get_supplier_list/V1',Auth.checkCblAuthority, Auth.storeDbInRequest, users.getSupplierList);

app.post('/get_supplier_branch_list',Auth.checkCblAuthority, Auth.storeDbInRequest, users.getSupplierBranchList);
app.post('/get_supplier_branch_list/V1',Auth.checkCblAuthority, Auth.storeDbInRequest, users.getSupplierBranchList);

app.use('/customer_register_step_third',Auth.checkCblAuthority, multipartMiddleware);
app.post('/customer_register_step_third',Auth.checkCblAuthority, Auth.storeDbInRequest, users.customerRegisterstepthird);


app.post('/add_new_address',Auth.checkCblAuthority,Auth.storeDbInRequest, users.customerAddNewAddress);
app.post('/get_all_customer_address',Auth.checkCblAuthority, Auth.storeDbInRequest, users.getCustomerAddress);
app.post('/delete_customer_address',Auth.checkCblAuthority, Auth.storeDbInRequest, users.deleteCustomerAddress);

app.post('/get_product_details',Auth.checkCblAuthority, Auth.storeDbInRequest, users.getProductDetails);
app.post('/v1/get_product_details',Auth.checkCblAuthority, Auth.storeDbInRequest, users.getProductDetails);
app.post('/admin/see_users',Auth.checkCblAuthority,users.see_user);
app.post('/edit_address',Auth.checkCblAuthority, Auth.storeDbInRequest, users.editAddress);
app.use('/add_to_cart', multipartMiddleware);
app.post('/add_to_cart',Auth.checkCblAuthority, Auth.storeDbInRequest, users.addToCart);
app.use('/v1/add_to_cart', multipartMiddleware);
app.post('/v1/add_to_cart',Auth.checkCblAuthority, Auth.storeDbInRequest, users.addToCart);
app.use('/v2/add_to_cart', multipartMiddleware);
app.post('/v2/add_to_cart',Auth.checkCblAuthority, Auth.storeDbInRequest, users.addToCartV2);

app.post('/add_to_favourite',Auth.checkCblAuthority, Auth.storeDbInRequest, users.addToFavourite);

app.post('/update_cart_info',Auth.checkCblAuthority, Auth.storeDbInRequest, users.updateCartInfo);

// app.post('/check_product_list',Auth.checkCblAuthority, Auth.storeDbInRequest,users.checkProductList)

app.post('/genrate_order',Auth.checkCblAuthority, Auth.userAuthenticate, users.genrateOrder);


app.post('/v1/genrate_order',Auth.checkCblAuthority, Auth.userAuthenticate, users.genrateOrder);
app.post('/v2/genrate_order',Auth.checkCblAuthority, Auth.userAuthenticate, users.genrateOrderV2);




app.post('/supplier/add_to_cart',Auth.checkCblAuthority,Auth.storeDbInRequest,users.addToCartBySupplier)

app.post('/supplier/update_cart_info',Auth.checkCblAuthority, Auth.storeDbInRequest,  users.updateCartInfoBySupplier);

app.post('/supplier/genrate_order',Auth.checkCblAuthority, Auth.storeDbInRequest,  users.genrateOrderBySupplierV2);


///////////stripe 3d route ////////////////////

app.post('/create-payment-intent',Auth.checkCblAuthority, Auth.storeDbInRequest, users.createPaymentIntent);

app.post('/multi_search',Auth.checkCblAuthority, Auth.storeDbInRequest, users.multiSearch);
app.post('/delivery_type',Auth.checkCblAuthority, Auth.storeDbInRequest, users.deliveryType);
app.post('/resend_otp',Auth.checkCblAuthority, Auth.storeDbInRequest, users.resendOtp);
app.post('/supplier_rating',Auth.checkCblAuthority, Auth.storeDbInRequest, users.supplierRating);
app.post('/get_my_favourite',Auth.checkCblAuthority, Auth.storeDbInRequest, users.getMyFavourite);

app.post('/change_password',Auth.checkCblAuthority, Auth.storeDbInRequest, users.changePassword);
app.post('/on_off_notification',Auth.checkCblAuthority, Auth.storeDbInRequest, users.onOffNotification);
app.post('/notification_language',Auth.checkCblAuthority, Auth.storeDbInRequest, users.notificationLanguage);

app.post('/history_order',Auth.checkCblAuthority, Auth.storeDbInRequest, users.historyOrder);
app.post('/v2/history_order',Auth.checkCblAuthority, Auth.storeDbInRequest, users.historyOrderV2);

app.post('/upcoming_order',Auth.checkCblAuthority, Auth.storeDbInRequest, users.upcomingOrder);
app.post('/v2/upcoming_order',Auth.checkCblAuthority, Auth.storeDbInRequest, users.upcomingOrderV2);

app.post('/laundary_supplier_list',Auth.checkCblAuthority, Auth.storeDbInRequest, users.laundarySupplier);
/*app.post('/get_track_order_list',users.trackOrderList);*/
app.post('/order_track',Auth.checkCblAuthority, Auth.storeDbInRequest, users.trackOrderupdate);
app.post('/facebook_login',Auth.checkCblAuthority, Auth.storeDbInRequest, users.facebookLogin);
app.post('/google_login',Auth.checkCblAuthority, Auth.storeDbInRequest, users.googleLogin);
app.post('/package_category', Auth.checkCblAuthority,Auth.storeDbInRequest, users.packageCategory);
app.post('/package_product',Auth.checkCblAuthority, Auth.storeDbInRequest, users.packageProduct);

app.post('/schedule_order',Auth.checkCblAuthority, Auth.storeDbInRequest, users.scheduleOrder);

app.post('/get_loyality_product',Auth.checkCblAuthority, Auth.storeDbInRequest, users.getloyalityProduct);
app.post('/get_promoation_product',Auth.checkCblAuthority,  Auth.storeDbInRequest, users.getPromoationProduct);

app.post('/cancel_order',Auth.checkCblAuthority,  Auth.storeDbInRequest, users.cancelOrder);
app.post('/rate_my_order',Auth.checkCblAuthority,  Auth.storeDbInRequest, users.rateMyOrder);
app.post('/update_schedule_order_status',Auth.checkCblAuthority,  Auth.storeDbInRequest, users.updateScheduleOrderStatus);
app.post('/get_laundry_product',Auth.checkCblAuthority,  Auth.storeDbInRequest, users.getLaundryData);
app.post('/rate_my_order_list',Auth.checkCblAuthority,  Auth.storeDbInRequest, users.rateMyOrderList);
app.post('/track_order_list',Auth.checkCblAuthority,  Auth.storeDbInRequest, users.trackOderList);

app.post('/supplier_category_list',Auth.checkCblAuthority,  Auth.storeDbInRequest, users.supplierCategoryList);

app.post('/bar_code',Auth.checkCblAuthority,  Auth.storeDbInRequest, users.barCode);
app.post('/user_rate_order',Auth.checkCblAuthority,  Auth.storeDbInRequest, users.ratingOrder);
app.get('/get_all_notification',Auth.checkCblAuthority,  Auth.storeDbInRequest, users.getNotification);
app.get('/get_all_admin_notification',Auth.checkCblAuthority,  Auth.storeDbInRequest,Auth.authenticateAccessToken, users.getNotificationAdmin);
app.get('/get_all_supplier_notification',Auth.checkCblAuthority,  Auth.storeDbInRequest, users.getNotificationSupplier);

app.post('/clear_all_notification',Auth.checkCblAuthority,  Auth.storeDbInRequest, users.AllclearNotification);
app.post('/clear_notification',Auth.checkCblAuthority,  Auth.storeDbInRequest, users.clearNotification);
app.post('/un_favourite',Auth.checkCblAuthority,  Auth.storeDbInRequest, users.unFavourite);

app.post('/loyality_order',Auth.checkCblAuthority,  Auth.storeDbInRequest, users.loyalityOrder);

app.post('/change_location',Auth.checkCblAuthority,  Auth.storeDbInRequest, users.changeLocation);
app.post('/confirm_order',Auth.checkCblAuthority,  Auth.storeDbInRequest, users.conformOrder);
app.use('/testing', multipartMiddleware);
app.post('/testing',Auth.checkCblAuthority,  Auth.storeDbInRequest, users.testing);

app.post('/forget_password',Auth.checkCblAuthority,  Auth.storeDbInRequest, users.forgetPassword);
app.post('/forget_password_by_phone',Auth.checkCblAuthority,  Auth.storeDbInRequest, users.forgetPasswordByPhone);
app.post('/view_all_offer',Auth.checkCblAuthority,  Auth.storeDbInRequest, users.viewAllOffer);

app.use('/change_profile', multipartMiddleware);
app.post('/change_profile',Auth.checkCblAuthority,  Auth.storeDbInRequest, users.changeProfile);
app.post('/compare_product',Auth.checkCblAuthority,  Auth.storeDbInRequest, users.compareProduct);
app.post('/product_acco_to_area',Auth.checkCblAuthority,  Auth.storeDbInRequest, users.getproductAccoToArea);
app.post('/supplier_image',Auth.checkCblAuthority,  Auth.storeDbInRequest, users.getsupplierImage);
app.post('/customer_order_description',Auth.checkCblAuthority,  Auth.storeDbInRequest, users.orderDescription);
app.post('/order_serach',Auth.checkCblAuthority,  Auth.storeDbInRequest, users.orderSerach);
app.post('/schedule_order_new',Auth.checkCblAuthority,  Auth.storeDbInRequest, users.scheduleNewOrder1);
app.post('/schedule_orders',Auth.checkCblAuthority,  Auth.storeDbInRequest, users.scheduleOrders);

app.post('/user_order_details',Auth.checkCblAuthority,  Auth.userAuthenticate, users.orderDetails);

app.get('/v1/common/secret_key',controller.commonSecretKey);
app.get('/v1/common/agent/boot',controller.commonSecretKeyAgent);
app.get('/cbl/clientAdmin/getFeature',Auth.storeDbInRequest,users.featureData);
app.post('/cbl/clientAdmin/setFeature',Auth.storeDbInRequest,users.setFeatureData)

app.post('/v1/user_order_details',Auth.checkCblAuthority,  Auth.userAuthenticate, users.orderDetails);
app.post('/v2/user_order_details',Auth.checkCblAuthority,  Auth.userAuthenticate, users.orderDetailsV2);
app.post('/send_notification_to_suplier',Auth.checkCblAuthority,  Auth.userAuthenticate, users.sendSuplierNotifcation);

app.post('/update_regId',Auth.checkCblAuthority,  Auth.storeDbInRequest, users.updateRegId);
app.post('/testing_push',Auth.checkCblAuthority,  Auth.storeDbInRequest, users.testingIosPush);

// on borard api
app.get('/v1/common/secret_key',users.commonSecretKey);
app.get('/v1/common/agent/boot',users.commonSecretKey);
app.post('/change__db_url',Auth.checkCblAuthority, users.changeCdnUrl);

app.get('/get_user_subscriptions_list',Auth.checkCblAuthority, Auth.storeDbInRequest, users.getUserSubscriptionsList);
app.post('/buy_user_subscription',Auth.checkCblAuthority, Auth.storeDbInRequest, users.buyUserSubscription);
app.post('/cancel_delete_user_subscription',Auth.checkCblAuthority, Auth.storeDbInRequest, users.cancelDeleteUserSubscription);
app.get('/get_my_subscriptions_list',Auth.checkCblAuthority, Auth.storeDbInRequest, users.getMySubscriptionsList);
app.post('/add_feedback',Auth.storeDbInRequest, users.addFeedback);
app.get('/get_user_suggestions',Auth.checkCblAuthority, Auth.storeDbInRequest, users.getUserSuggestions);
app.get('/zoom_auth',Auth.checkCblAuthority, Auth.storeDbInRequest, users.zoomAuth);
app.post('/zoom_create_meeting',Auth.checkCblAuthority, Auth.storeDbInRequest, users.createZoomMeeting);
app.use('/upload_chat_image', multipartMiddleware);
app.post('/upload_chat_image', users.uploadChatImage);

app.post('/admin/invoice-email', Auth.storeDbInRequest,Auth.checkCblAuthority,users.invoiceEmail);

app.post('/admin/invoice-email-multiple', Auth.storeDbInRequest,Auth.checkCblAuthority,users.invoiceEmailMultiple1);

//app.post('/create_peach_customer',Auth.checkCblAuthority, Auth.storeDbInRequest, users.createPeachCustomer);


// digidine
require("./digidine-routes").setup(app);

app.use(function (err, req, res, next) {
    console.log("===ERR==!", err);
    if (err.isBoom) {
        //  return res.status(err.output.statusCode).json(err.data[0].message);
        sendResponse.parameterMissingError(res);
    }
    else {
        sendResponse.somethingWentWrongError(res);
    }
})


var server = http.createServer(
//     {
//     key: privateKey,
//     cert: certificate
// },
app).listen(config.get('PORT'),function () {
    console.log("********=Royo server listening on port=******* " + config.get('PORT'));
});

process.on('uncaughtException', function (err) {
  console.error((new Date).toUTCString() + ' uncaughtException:', err.message)
  console.error(err.stack)
  process.exit(1)
})




SocketManager.connectSocket(server);


//