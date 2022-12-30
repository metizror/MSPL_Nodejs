
var controller=require('../controller/user/guestController')
var users=require('../routes/user')
var Auth = require('../lib/Auth')
const Joi = require('joi')
const expressJoi = require('express-joi-validator');
var twilio = require('twilio')
module.exports=(app)=>{
/**
 * @swagger
 * /login:
 *   post:
 *     description: Retrieve an specific stock
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: email
 *         required: true
 *         type: string
 *       - in: formData
 *         name: password
 *         required: true
 *         type: string
 *       - in: formData
 *         name: deviceToken
 *         required: true
 *         type: string
 *       - in: formData
 *         name: deviceType
 *         required: true
 *         type: string
 *       - in: formData
 *         name: languageId
 *         required: true

 *         type: integerconnectionCntl
 *       - in: formData
 *         name: secretDconnectionCntl
 *         type: string
 *     responses:
 *       200:
 *         description: stock
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/login',Auth.checkCblAuthority,users.login);
/**
 * @swagger
 * /getSecretDbKey:
 *   post:
 *     description: Retrieve an specific stock
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: dbName
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/getSecretDbKey',
Auth.storeRequestInMongoDb,
expressJoi({body: {
    dbName: Joi.string().required()
}}),controller.encrypt);
/**
 * @swagger
 * /category/terminology:
 *   get:
 *     description: "vendor_status : 1-for multiple vendor 0-for single vendor cart_flow: 0-for single product 1-form multiple 2- for multiple product with quantity NaN schedule_time: shedule time in days admin_order_priority: 1-for firstly admin accept order 0-for vendor accept order is_pickup_order: 1-for pickup 0-delivery is_variant :1-for product variant can add by vendor/admin API for Screen flow app_type: 0-Ecommerce 1-for Marketing category_level: 1-for nth level 0-for limit level"
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: category_id
 *         in: query
 *         description: access Token
 *         required: true
 *         type: number 
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/category/terminology',Auth.checkCblAuthority,Auth.storeDbInRequest, 
expressJoi({query: {
    category_id: Joi.number().required()
}}),controller.getTerminologyByCategory);
/**
 * @swagger
 * /getSettings:
 *   post:
 *     description: "vendor_status : 1-for multiple vendor 0-for single vendor cart_flow: 0-for single product 1-form multiple 2- for multiple product with quantity NaN schedule_time: shedule time in days admin_order_priority: 1-for firstly admin accept order 0-for vendor accept order is_pickup_order: 1-for pickup 0-delivery is_variant :1-for product variant can add by vendor/admin API for Screen flow app_type: 0-Ecommerce 1-for Marketing category_level: 1-for nth level 0-for limit level"
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/getSettings',Auth.checkCblAuthority,Auth.storeDbInRequest, controller.settingData);
/**
 * @swagger
 * /getSettings:
 *   get:
 *     description: "vendor_status : 1-for multiple vendor 0-for single vendor cart_flow: 0-for single product 1-form multiple 2- for multiple product with quantity NaN schedule_time: shedule time in days admin_order_priority: 1-for firstly admin accept order 0-for vendor accept order is_pickup_order: 1-for pickup 0-delivery is_variant :1-for product variant can add by vendor/admin API for Screen flow app_type: 0-Ecommerce 1-for Marketing category_level: 1-for nth level 0-for limit level"
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/getSettings',Auth.checkCblAuthority,Auth.storeDbInRequest,
 controller.settingData);

 /**
 * @swagger
 * /getSettings/v1:
 *   get:
 *     description: "vendor_status : 1-for multiple vendor 0-for single vendor cart_flow: 0-for single product 1-form multiple 2- for multiple product with quantity NaN schedule_time: shedule time in days admin_order_priority: 1-for firstly admin accept order 0-for vendor accept order is_pickup_order: 1-for pickup 0-delivery is_variant :1-for product variant can add by vendor/admin API for Screen flow app_type: 0-Ecommerce 1-for Marketing category_level: 1-for nth level 0-for limit level"
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/getSettings/v1',Auth.checkCblAuthority,Auth.storeDbInRequest,
controller.settingDataV1);

/**
 * @swagger
 * /addCart:
 *   post:
 *     description: Retrieve an specific stock
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: accessToken
 *         required: true
 *         type: string
 *       - in: formData
 *         name: supplierBranchId
 *         required: true
 *         type: number
 *       - in: formData
 *         name: deviceId
 *         required: true
 *         type: string
 *       - in: formData
 *         name: productList
 *         required: true
 *         type: array
 *       - in: formData
 *         name: area_id
 *         required: true
 *         type: number
 * 
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
// app.post('/add_to_cart', expressJoi({body: {
//     accessToken: Joi.string().required(),
//     supplierBranchId:Joi.number().required(),
//     deviceId:Joi.string().required(),
//     productList:Joi.array().required(),
//     area_id:Joi.number().required()
// }}),users.addToCart);


/**
* @swagger
* /getChat:
*   get:
*     description: For  user getChat
*     tags:
*       - App API`S
*     produces:
*       - "application/xml"
*       - application/json
*     parameters:
*       - name: accessToken
*         in: query
*         description: access Token
*         required: true
*         type: string
*       - name: userType
*         in: query
*         description: type 1- Agent, 2-user, 3-Supplier, 4-Admin
*         required: true
*         type: number
*       - name: receiver_created_id
*         in: query
*         description: receiver_created_id
*         required: true
*         type: string
*       - name: order_id
*         in: query
*         description: order_id
*         required: false
*         type: number
*       - name: limit
*         in: query
*         description: limit
*         required: true
*         type: number
*       - name: skip
*         in: query
*         description: skip
*         required: true
*         type: number
*     responses:
*       200:
*         description: Success
*       400:
*         description: Validation Error
*       500:
*         description: Api Error
*/
app.get("/getChat",
// Auth.storeDbInRequest,
expressJoi({query: {
	//order_id:  Joi.string().required(),
	order_id: Joi.string().optional().allow(""),
	message_id: Joi.string().optional().allow(""),
	accessToken:  Joi.string().required(),
	userType:  Joi.string().required(),
	receiver_created_id: Joi.string().optional().allow(""),
	limit : Joi.number().required(),
	skip: Joi.number().required()  
}}), controller.getChat );


/**
* @swagger
* /getChatMessageId:
*   get:
*     description: To get message id, api is for user and admins
*     tags:
*       - App API`S
*     produces:
*       - "application/xml"
*       - application/json
*     parameters:
*       - name: userType
*         in: query
*         description: type (eg Admin)
*         required: true
*         type: number
*       - name: user_created_id
*         in: query
*         description: user_created_id
*         required: true
*         type: string
*       - name: receiver_created_id
*         in: query
*         description: receiver_created_id
*         required: false
*         type: string
*     responses:
*       200:
*         description: Success
*       400:
*         description: Validation Error
*       500:
*         description: Api Error
*/
app.get("/getChatMessageId",
// Auth.storeDbInRequest,
expressJoi({query: {
	userType:  Joi.string().required(),
	user_created_id: Joi.string().required(),
	receiver_created_id: Joi.string().optional().allow("")
}}), controller.getChatMessageId );


/**
 * @swagger
 * /common/send_email:
 *   post:
 *     description: Retrieve secret db key
 *     tags:
 *       - Common API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: receiverEmail
 *         required: true
 *         type: string
 *       - in: formData
 *         name: subject
 *         required: true
 *         type: string
 *       - in: formData
 *         name: content
 *         required: true
 *         type: string
 *       - in: formData
 *         name: senderEmail
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/common/send_email',
Auth.storeDbInRequest,
// Auth.userAuthenticate,
expressJoi({body: {
    receiverEmail: Joi.string().required(),
    subject: Joi.string().required(),
	content: Joi.string().required(),
	senderEmail: Joi.string().required()

}}),controller.sendEmail);

/**
 * @swagger
 * /user/sos_alert_notification:
 *   post:
 *     description: send soso notification
 *     tags:
 *       - Common API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: user_id
 *         required: true
 *         type: number
 *       - in: body
 *         name: device_type
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/user/sos_alert_notification',
Auth.storeDbInRequest,
// Auth.userAuthenticate,
expressJoi({body: {
    user_id: Joi.number().required(),
	device_type: Joi.number().required(),
	latitude:Joi.number().required(),
	longitude:Joi.number().required(),
	order_id : Joi.number().optional().allow(""),
	address:Joi.string().optional().allow("")
}}),controller.sendSosFcmToAdmin);

/**
 * @swagger
 * /admin/update_sos_notification_status:
 *   post:
 *     description: send soso notification
 *     tags:
 *       - Common API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: status
 *         required: true
 *         type: number
 *       - in: body
 *         name: id
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/admin/update_sos_notification_status',
Auth.storeDbInRequest,
// Auth.userAuthenticate,
expressJoi({body: {
	status: Joi.string().required(),
	id:Joi.number().required()
}}),controller.updateSosNotificationStatus);

/**
* @swagger
* /admin/sos_alert_notifications_listing:
*   get:
*     description: For  user getChat
*     tags:
*       - App API`S
*     produces:
*       - "application/xml"
*       - application/json
*     parameters:
*       - name: limit
*         in: query
*         description: limit
*         required: true
*         type: number
*       - name: offset
*         in: query
*         description: offset
*         required: true
*         type: number
*     responses:
*       200:
*         description: Success
*       400:
*         description: Validation Error
*       500:
*         description: Api Error
*/
app.get("/admin/sos_alert_notifications_listing",
Auth.storeDbInRequest,
expressJoi({query: {
	limit : Joi.number().required(),
	offset: Joi.number().required()  
}}), controller.sosNotificationListing );




// /**
//  * @swagger
//  * /use-sms:
//  *   post:
//  *     description: send soso notification
//  *     tags:
//  *       - Common API`S
//  *     produces:
//  *       - application/json
//  *     parameters:
//  *       - in: body
//  *         name: status
//  *         required: true
//  *         type: number
//  *     responses:
//  *       200:
//  *         description: encypt
//  *         schema:
//  *           $ref: '#/definitions/Stock'
//  */
// app.post('/use-sms',
// twilio.webhook({ validate: false }),
// // Auth.storeDbInRequest,
// // // Auth.userAuthenticate,
// // expressJoi({body: {
// // 	status: Joi.string().required(),
// // 	id:Joi.number().required()
// // }})
// controller.sendSmsMasking);

}