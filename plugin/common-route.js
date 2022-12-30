
var controller=require('../controller/user/guestController')
var Cntrl=require('../controller/')
var users=require('../routes/user')
const Joi = require('joi')
const expressJoi = require('express-joi-validator');
var Auth=require('../lib/Auth')
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
module.exports=(app)=>{
/**
 * @swagger
 * /common/add_order_phrase:
 *   post:
 *     description: used for generating an phrase related an order
 *     tags:
 *       - Common API`S
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/common/add_order_phrase',Auth.storeDbInRequest,Cntrl.DialogController.AddOrderPhrase);
/**
 * @swagger
 * /common/secretKey:
 *   post:
 *     description: Retrieve secret db key
 *     tags:
 *       - Common API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: domain
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/common/secretKey', expressJoi({body: {
    domain: Joi.string().required()
}}),controller.getSecreteDbKey);

/**
 * @swagger
 * /client/requests/data:
 *   get:
 *     description: api used for gettnig an evry clietnt data
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         type: string
 *       - in: query
 *         name: endDate
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/client/requests/data',
controller.getRequestDataEvryClient
)

/**
 * @swagger
 * /common/update_product_synonym:
 *   post:
 *     description: update product name in synonym
 *     tags:
 *       - Common API`S
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/common/update_product_synonym', 
Auth.storeDbInRequest,
Cntrl.DialogController.ProductEntityUpdate);
/**
 * @swagger
 * /common/update_supplier_synonym:
 *   post:
 *     description: update supplier name in synonym
 *     tags:
 *       - Common API`S
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/common/update_supplier_synonym', 
Auth.storeDbInRequest,
Cntrl.DialogController.SupplierEntityUpdate);
/**
 * @swagger
 * /common/getAllEntities:
 *   post:
 *     description: Retrieve entities db key
 *     tags:
 *       - Common API`S
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/common/getAllEntities', 
// Auth.storeDbInRequest,
Cntrl.DialogController.getAllEntity
)
/**
 * @swagger
 * /common/geofencing_gateways:
 *   get:
 *     description: api used for gateways
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         type: number
 *       - in: query
 *         name: long
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/common/geofencing_gateways',
Auth.storeDbInRequest,
expressJoi({
    query: 
    {  
        lat:Joi.number().required(),
        long: Joi.number().required()
    }
}),
controller.getPaymentGatewayAccGeof
)

/**
 * @swagger
 * /user/recent_chats:
 *   get:
 *     description: api used for gateways
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: true
 *         type: number
 *       - in: query
 *         name: skip
 *         required: true
 *         type: number
 *       - in: query
 *         name: user_created_at
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
 app.get('/user/recent_chats',
 Auth.storeDbInRequest,
 expressJoi({
     query: 
     {  
         limit:Joi.number().required(),
         skip:Joi.number().required(),
         user_created_at: Joi.string().required()
     }
 }),
 controller.getUserRecentMessages
 )


/**
 * @swagger
 * /common/geofencing_tax:
 *   get:
 *     description: api used for getting an tax
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         type: number
 *       - in: query
 *         name: long
 *         required: true
 *         type: number
 *       - in: query
 *         name: branchId
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/common/geofencing_tax',
Auth.storeDbInRequest,
expressJoi({
    query: 
    {  
        lat:Joi.number().required(),
        long: Joi.number().required(),
        branchId:Joi.number().required()
    }
}),
controller.taxAccGeoFencing
)
/**
 * @swagger
 * /common/get_sub_categories:
 *   get:
 *     description: api used for getting an tax
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: search
 *         required: false
 *         type: string
 *       - in: query
 *         name: offset
 *         required: true
 *         type: number
 *       - in: query
 *         name: limit
 *         required: true
 *         type: number
 *       - in: query
 *         name: categoryId
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/common/get_sub_categories',
Auth.storeDbInRequest,
expressJoi({
    query: 
    {  
        search:Joi.string().optional().allow(""),
        limit:Joi.number().required(),
        offset: Joi.number().required(),
        categoryId:Joi.number().required()
    }
}),
controller.getSubCategoryOfParent
)
/**
 * @swagger
 * /common/sadadPayment/success:
 *   get:
 *     description: api used for gateways
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: search
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/common/sadadPayment/success',
Auth.storeDbInRequest,
controller.successUrl
)

/**
 * @swagger
 * /common/supplier_register:
 *   post:
 *     description: Retrieve secret db key
 *     tags:
 *       - Common API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: categoryIds
 *         required: true
 *         type: string
 *       - in: formData
 *         name: commission
 *         required: true
 *         type: number
 *       - in: formData
 *         name: country_code
 *         required: true
 *         type: string
 *       - in: formData
 *         name: iso
 *         required: true
 *         type: string
 *       - in: formData
 *         name: is_multibranch
 *         required: true
 *         type: number
 *       - in: formData
 *         name: latitude
 *         required: false
 *         type: number
 *       - in: formData
 *         name: longitude
 *         required: false
 *         type: number
 *       - in: formData
 *         name: license_number
 *         required: true
 *         type: number
 *       - in: formData
 *         name: pickupCommision
 *         required: true
 *         type: number
 *       - in: formData
 *         name: self_pickup
 *         required: true
 *         type: number
 *       - in: formData
 *         name: supplierAddress
 *         required: true
 *         type: string
 *       - in: formData
 *         name: supplierEmail
 *         required: true
 *         type: string
 *       - in: formData
 *         name: supplierMobileNo
 *         required: true
 *         type: string
 *       - in: formData
 *         name: supplierName
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/common/supplier_register',
Auth.checkCblAuthority,
Auth.storeDbInRequest,
multipartMiddleware,
// expressJoi({body: {
//     categoryIds: Joi.string().required(),
//     commission:Joi.number().optional().allow(""),
//     country_code:Joi.string().required(),
//     iso:Joi.string().required(),
//     is_multibranch:Joi.number().required(),
//     latitude:Joi.number().optional().allow(""),
//     longitude:Joi.number().optional().allow(""),
//     license_number:Joi.number().optional().allow(""),
//     pickupCommision:Joi.number().optional().allow(""),
//     is_dine_in:Joi.number().optional().allow(0),
//     self_pickup:Joi.number().required(),
//     supplierAddress:Joi.string().required(),
//     supplierEmail:Joi.string().required(),
//     supplierMobileNo:Joi.string().required(),
//     supplierName:Joi.string().required(),
//     federal_number:Joi.string().optional().allow(""),
//     user_service_fee:Joi.number().optional().allow(""),
//     home_chef_orignal_name:Joi.string().optional().allow(""),
//     home_address:Joi.string().optional().allow(""),
//     license_issue_date:Joi.string().optional().allow(""),
//     license_end_date:Joi.string().optional().allow(""),
//     license_document:Joi.string().optional().allow(""),
//     license_number:Joi.string().optional().allow(""),

//     geofence_ids:Joi.array().optional().allow([]),
//     description:Joi.string().optional().allow(""),

//     is_dine_in : Joi.number().optional().allow(0)
// }}),
controller.supplierRegistraion
);
/**
 * @swagger
 * /common/sadad/success:
 *   post:
 *     description: api used for gateways
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
app.post('/common/sadad/success',
Auth.checkCblAuthority,
controller.successSadded
)
/**
 * @swagger
 * /common/dialog/token:
 *   get:
 *     description: Retrieve secret db key
 *     tags:
 *       - Common API`S
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/common/dialog/token',
Auth.checkCblAuthority,
Cntrl.DialogController.getDialogToken);


/**
 * @swagger
 * /common/save_agent_notification:
 *   put:
 *     description: save agent notification
 *     tags:
 *       - Common API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: message
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.put('/common/save_agent_notification',
Auth.storeDbInRequest, 
// expressJoi({body: {
//     message: Joi.string().required(),
//     order_id:Joi.number().required()
// }}
// ),
controller.savePushNotificationOfAgent);


/**
 * @swagger
 * /common/geofencing_gateways:
 *   post:
 *     description: api used for gateways
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: agentId
 *         required: true
 *         type: number
 *       - in: body
 *         name: userId
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/common/get_masked_phone_numbers',
Auth.storeDbInRequest,
expressJoi({
    body: 
    {  
        agentId:Joi.number().required(),
        userId: Joi.number().required()
    }
}),
controller.getTwilioMaskedPhoneNumber
)

/**
 * @swagger
 * /common/alert_zoom_call_notification:
 *   post:
 *     description: api used for gateways
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: agentId
 *         required: false
 *         type: number
 *       - in: body
 *         name: userId
 *         required: false
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
 app.post('/common/alert_zoom_call_notification',
 Auth.storeDbInRequest,
 expressJoi({
     body: 
     {  
         agentId:Joi.number().optional().allow(0),
         userId: Joi.number().optional().allow(0),
         orderId: Joi.number().optional().allow(0)
     }
 }),
 controller.sendAlertZoomNotifcation
 )

}