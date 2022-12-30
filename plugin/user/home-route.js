
var HomeCntrl=require('../../controller/user/homeController')
var Auth=require('../../lib/Auth')
var category=require('../../routes/category')
const Joi = require('joi')
const expressJoi = require('express-joi-validator');
const Controller=require('../../controller')
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
// let userCn=new Controller.UserController.updatePhone("Test")
module.exports=(app)=>{
/**
 * @swagger
 * /user/update/phone:
 *   put:
 *     description: api used for updating an phone number
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: body
 *          required: falsesectionAuthorityData
 *          schema:
 *            type: object
 *            properties: 
 *              country_code:
 *                  type: string
 *                  required: true
 *              mobile_number:
 *                type: string
 *                required: true
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.put('/user/update/phone',
Auth.userAuthenticate,
Auth.checkCblAuthority,
expressJoi({
    body:
        {
            country_code:Joi.string().required(),
            mobile_number:Joi.string().required()
        }
}),
Controller.UserController.Phone.Update
)
/**
 * @swagger
 * /home/supplier_list:
 *   get:
 *     description: api used for getting an supplier list according area`s
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         type: string
 *       - in: query
 *         name: longitude
 *         required: true
 *         type: string
 *       - in: query
 *         name: languageId
 *         required: true
 *         type: string
 *       - in: query
 *         name: self_pickup
 *         required: false
 *         type: number
 *       - in: query
 *         name: self_pickup
 *         required: false
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/home/supplier_list',
Auth.storeDbInRequest,
Auth.checkCblAuthority,
expressJoi({
    query: 
    {  
        // area_id:Joi.number().required(),
        skipLatAndLngDistance:Joi.boolean().default(false),
        latitude:Joi.number()
        .when("skipLatAndLngDistance", {
          is: false,
          then: Joi.number()
            .required(),
          otherwise: Joi.number()
        }),
        categoryId:Joi.number().optional().allow(""),
        longitude : Joi.number()
        .when("skipLatAndLngDistance", {
          is: false,
          then: Joi.number()
            .required(),
          otherwise: Joi.number()
        }),
        languageId:Joi.number().required(),
        self_pickup:Joi.number().optional().allow(""),
        tags:Joi.number().optional().allow(""),
        search : Joi.string().optional().allow(""),
        sort_by: Joi.number().optional().allow(""),
        is_dine_in : Joi.number().optional().allow(0),
        offset:Joi.string().optional().allow(""),
        limit:Joi.string().optional().allow(""),
        skip:Joi.string().optional().allow(""),
        min_preparation_time:Joi.number().optional().allow(""),
        max_preparation_time:Joi.number().optional().allow(""),
        filter:Joi.number().optional().allow(0),
        is_free_delivery:Joi.number().optional().allow(0)
    }
}),
HomeCntrl.SupplierList
)

/**
 * @swagger
 * /home/supplier_list:
 *   get:
 *     description: api used for getting an supplier list according area`s
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         type: string
 *       - in: query
 *         name: longitude
 *         required: true
 *         type: string
 *       - in: query
 *         name: languageId
 *         required: true
 *         type: string
 *       - in: query
 *         name: self_pickup
 *         required: false
 *         type: number
 *       - in: query
 *         name: self_pickup
 *         required: false
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/home/supplier_list/V1',
Auth.storeDbInRequest,
Auth.checkCblAuthority,
expressJoi({
    query: 
    {  
        // area_id:Joi.number().required(),
        skipLatAndLngDistance:Joi.boolean().default(false),
        latitude:Joi.number()
        .when("skipLatAndLngDistance", {
          is: false,
          then: Joi.number()
            .required(),
          otherwise: Joi.number()
        }),
        categoryId:Joi.number().optional().allow(""),
        longitude : Joi.number()
        .when("skipLatAndLngDistance", {
          is: false,
          then: Joi.number()
            .required(),
          otherwise: Joi.number()
        }),
        languageId:Joi.number().required(),
        self_pickup:Joi.number().optional().allow(""),
        tags:Joi.number().optional().allow(""),
        search : Joi.string().optional().allow(""),
        sort_by: Joi.number().optional().allow(""),
        is_dine_in : Joi.number().optional().allow(0),
        offset:Joi.string().optional().allow(""),
        min_preparation_time:Joi.number().optional().allow(""),
        max_preparation_time:Joi.number().optional().allow(""),
        filter:Joi.number().optional().allow(0),
        is_free_delivery:Joi.number().optional().allow(0)
    }
}),
HomeCntrl.SupplierList
)

/**
 * @swagger
 * /home/supplier_list:
 *   get:
 *     description: api used for getting an supplier list according area`s
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         type: string
 *       - in: query
 *         name: longitude
 *         required: true
 *         type: string
 *       - in: query
 *         name: languageId
 *         required: true
 *         type: string
 *       - in: query
 *         name: self_pickup
 *         required: false
 *         type: number
 *       - in: query
 *         name: self_pickup
 *         required: false
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/home/supplier_list/V2',
Auth.storeDbInRequest,
Auth.checkCblAuthority,
expressJoi({
    query: 
    {  
        // area_id:Joi.number().required(),
        skipLatAndLngDistance:Joi.boolean().default(false),
        latitude:Joi.number()
        .when("skipLatAndLngDistance", {
          is: false,
          then: Joi.number()
            .required(),
          otherwise: Joi.number()
        }),
        categoryId:Joi.number().optional().allow(""),
        longitude : Joi.number()
        .when("skipLatAndLngDistance", {
          is: false,
          then: Joi.number()
            .required(),
          otherwise: Joi.number()
        }),
        languageId:Joi.number().required(),
        self_pickup:Joi.number().optional().allow(""),
        tags:Joi.number().optional().allow(""),
        search : Joi.string().optional().allow(""),
        sort_by: Joi.number().optional().allow(""),
        is_dine_in : Joi.number().optional().allow(0),
        offset:Joi.string().optional().allow(""),
        limit:Joi.string().optional().allow(""),
        skip:Joi.string().optional().allow(""),
        min_preparation_time:Joi.number().optional().allow(""),
        max_preparation_time:Joi.number().optional().allow(""),
        filter:Joi.number().optional().allow(0),
        is_free_delivery:Joi.number().optional().allow(0)
    }
}),
HomeCntrl.SupplierList
)



/**
 * @swagger
 * /home/supplier_list/V3:
 *   get:
 *     description: api used for getting an supplier list according area`s
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         type: string
 *       - in: query
 *         name: longitude
 *         required: true
 *         type: string
 *       - in: query
 *         name: languageId
 *         required: true
 *         type: string
 *       - in: query
 *         name: self_pickup
 *         required: false
 *         type: number
 *       - in: query
 *         name: self_pickup
 *         required: false
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/home/supplier_list/V3',
Auth.storeDbInRequest,
Auth.checkCblAuthority,
expressJoi({
    query: 
    {  
        // area_id:Joi.number().required(),
        skipLatAndLngDistance:Joi.boolean().default(false),
        latitude:Joi.number()
        .when("skipLatAndLngDistance", {
          is: false,
          then: Joi.number()
            .required(),
          otherwise: Joi.number()
        }),
        categoryId:Joi.number().optional().allow(""),
        longitude : Joi.number()
        .when("skipLatAndLngDistance", {
          is: false,
          then: Joi.number()
            .required(),
          otherwise: Joi.number()
        }),
        languageId:Joi.number().required(),
        self_pickup:Joi.number().optional().allow(""),
        tags:Joi.number().optional().allow(""),
        search : Joi.string().optional().allow(""),
        sort_by: Joi.number().optional().allow(""),
        is_dine_in : Joi.number().optional().allow(0),
        offset:Joi.string().optional().allow(""),
        limit:Joi.string().optional().allow(""),
        skip:Joi.string().optional().allow(""),
        is_free_delivery:Joi.number().optional().allow(0),
        zone_id : Joi.number().optional().allow(0)
    }
}),
HomeCntrl.SupplierList
)
/**
 * @swagger
 * /home/fastest_delivery_suppliers:
 *   get:
 *     description: api used for getting an supplier list according area`s
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         type: string
 *       - in: query
 *         name: longitude
 *         required: true
 *         type: string
 *       - in: query
 *         name: languageId
 *         required: true
 *         type: string
 *       - in: query
 *         name: self_pickup
 *         required: false
 *         type: number
 *       - in: query
 *         name: self_pickup
 *         required: false
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/home/fastest_delivery_suppliers',
Auth.storeDbInRequest,
Auth.checkCblAuthority,
expressJoi({
    query: 
    {  
        latitude:Joi.number().required(),
        longitude : Joi.number().required(),
        languageId:Joi.number().required(),
        offset:Joi.string().optional().allow(""),
        order_by:Joi.number().optional().allow("")
    }
}),
HomeCntrl.SupplierListWithFastestDelivery
)
/**
 * @swagger
 * /home/supplier_search:
 *   post:
 *     description: api used for searching an supplier by name
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
app.post('/home/supplier_search',
Auth.storeDbInRequest,
HomeCntrl.SupplierSearch
)
/**
 * @swagger
 * /home/subcategory_listing_v1:
 *   get:
 *     description: api used for getting an sub category list 
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: languageId
 *         required: true
 *         type: string
 *       - in: query
 *         name: category_id
 *         required: true
 *         type: string
 *       - in: query
 *         name: supplier_id
 *         type: string
 *       - in: query
 *         name: latitude
 *         type : string
 *       - in: query
 *         name : longitude
 *         type : string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/home/subcategory_listing_v1',
Auth.storeDbInRequest,
Auth.checkCblAuthority,
expressJoi({
    query: 
    {  
        // area_id:Joi.number().optional().allow(""),
        languageId:Joi.number().required(),
        category_id:Joi.number().required(),
        supplier_id:Joi.number().optional().allow(""),
        latitude:Joi.number().optional(),
        longitude:Joi.number().optional()
    }
}),
HomeCntrl.SubCategoryWithOffer
)
/**
 * @swagger
 * /customer/device_token:
 *   get:
 *     description: api used for getting an device token 
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: customer_id
 *         required: true
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/customer/device_token',
Auth.storeDbInRequest,
// Auth.checkCblAuthority,
expressJoi({
    query: 
    {  
        customer_id:Joi.number().required()
    }
}),
HomeCntrl.DeviceToken
)
/**
 * @swagger
 * /agent/change_order_status:
 *   put:
 *     description: api used for getting an device token 
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: body
 *          required: false
 *          schema:
 *            type: object
 *            properties: 
 *              user_id:
 *                  type: number
 *                  required: true
 *              order_id:
 *                  type: string
 *                  required: true   
 *              status:
 *                  type: number
 *                  required: false   
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.put('/agent/change_order_status',
Auth.storeDbInRequest,
Auth.checkCblAuthority,
expressJoi({
    body: 
    {  
        user_id:Joi.number().required(),
        order_id:Joi.string().required(),
        status:Joi.number().required(),
        offset:Joi.string().optional().allow(""),
        return_id:Joi.number().optional().allow(""),
        delivery_latitude:Joi.number().optional().allow(""),
        delivery_longitude:Joi.number().optional().allow(""),
        delivery_notes:Joi.number().optional().allow(""),
    }
}),
HomeCntrl.UpdateOrderStatusbyAgent
)
/**
 * @swagger
 * /agent/group/change_order_status:
 *   put:
 *     description: api used for update an order by grouping 
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: body
 *          required: false
 *          schema:
 *            type: object
 *            properties: 
 *              user_id:
 *                  type: number
 *                  required: true
 *              order_id:
 *                  type: string
 *                  required: true   
 *              status:
 *                  type: number
 *                  required: false   
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.put('/agent/group/change_order_status',
Auth.storeDbInRequest,
Auth.checkCblAuthority,
expressJoi({
    body: 
    {  
        user_id:Joi.number().required(),
        order_id:Joi.string().required(),
        grouping_id:Joi.number().required(),
        status:Joi.number().required(),
        offset:Joi.string().optional().allow(""),
        return_id:Joi.number().optional().allow(""),
        delivery_latitude:Joi.number().optional().allow(""),
        delivery_longitude:Joi.number().optional().allow(""),
        delivery_notes:Joi.string().optional().allow(""),


    }
}),
HomeCntrl.UpdateOrderStatusbyAgentByGroup
)
/**
 * @swagger
 * /agent/order/status:
 *   get:
 *     description: api used for getting an order  
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: order_id
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/agent/order/status',
Auth.storeDbInRequest,
expressJoi({
    query: 
    {  
        order_id:Joi.string().required(),
    }
}),
HomeCntrl.getOrderStatus
)

/**
 * @swagger
 * /user/apple_login:
 *   post:
 *     description: api used for getting an device token 
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: body
 *          required: false
 *          schema:
 *            type: object
 *            properties: 
 *              apple_id:
 *                  type: string
 *                  required: true
 *              first_name:
 *                  type: string
 *                  required: false   
 *              last_name:
 *                  type: string
 *                  required: false   
 *              email:
 *                  type: string
 *                  required: true  
 *              deviceToken:
 *                  type: string
 *                  required: false   
 *              longitude:
 *                  type: number
 *                  required: true   
 *              latitude:
 *                  type: number
 *                  required: true  
 *              languageId:
 *                  type: number
 *                  required: true 
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/user/apple_login',
Auth.storeDbInRequest,
// Auth.checkCblAuthority,
expressJoi({
    body: 
    {  
        apple_id:Joi.string().required(),
        email:Joi.string().optional().allow(""),
        first_name:Joi.string().optional().allow(""),
        deviceToken:Joi.string().optional().allow(""),
        latitude:Joi.number().required(),
        longitude:Joi.number().required(),
        last_name:Joi.string().optional().allow(""),
        languageId:Joi.number().required()
    }
}),
Controller.UserController.newRegistration
),
/**
 * @swagger
 * /user/fcmToken/update:
 *   put:
 *     description: api used for updating an fcm token
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: body
 *          required: false
 *          schema:
 *            type: object
 *            properties: 
 *              fcmToken:
 *                  type: string
 *                  required: true
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.put('/user/fcmToken/update',
Auth.userAuthenticate,
Auth.checkCblAuthority,
expressJoi({
    body: 
    {  
        fcmToken:Joi.string().required()
    }
}),
HomeCntrl.updateDeviceToken
)
/**
 * @swagger
 * /user/logout:
 *   put:
 *     description: api used for updating an fcm token
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
app.put('/user/logout',
Auth.userAuthenticate,
Auth.checkCblAuthority,
HomeCntrl.updateAccessToken
)



/**
 * @swagger
 * /v1/user/registration:
 *   post:
 *     description: For registration of user
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: first_name
 *         required: false
 *         type: string
 *       - in: formData
 *         name: email
 *         required: false
 *         type: string
 *       - in: formData
 *         name: deviceToken
 *         required: false
 *         type: string
 *       - in: formData
 *         name: deviceType
 *         required: false
 *         type: string
 *       - in: formData
 *         name: password
 *         required: false
 *         type: string
 *       - in: formData
 *         name: referralCode
 *         required: false
 *         type: string
 *       - in: formData
 *         name: countryCode
 *         required: false
 *         type: string
 *       - in: formData
 *         name: documents
 *         required: false
 *         type: file
 *       - in: formData
 *         name: mobileNumber
 *         required: false
 *         type: string
 *       - in: formData
 *         name: latitude
 *         required: false
 *         type: string
 *       - in: formData
 *         name: longitude
 *         required: false
 *         type: string
 *       - in: formData
 *         name: last_name
 *         required: false
 *         type: string
 *       - in: formData
 *         name: languageId
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/v1/user/registration',
Auth.checkCblAuthority,
Auth.storeDbInRequest,
multipartMiddleware,
// Auth.checkCblAuthority,
// expressJoi({
//     body: 
//     {  
//         first_name:Joi.string().required(),
//         email:Joi.string().optional().allow(""),
//         deviceToken:Joi.string().optional().allow(""),
//         deviceType:Joi.string().optional().allow(""),
//         password:Joi.string().optional().allow(""),
//         // accessToken:Joi.number().required(),
//         referralCode:Joi.optional().allow(""),
//         countryCode:Joi.number().required(),
//         mobileNumber:Joi.number().required(),
//         latitude:Joi.number().required(),
//         longitude:Joi.number().required(),
//         last_name:Joi.string().optional().allow(""),
//         languageId:Joi.number().required()
//     }
// }),
Controller.UserController.newRegistrationuser
)

/**
 * @swagger
 * /user/register/byPhone:
 *   post:
 *     description: api used for register used by phone number
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: body
 *          required: false
 *          schema:
 *            type: object
 *            properties: 
 *              name:
 *                  type: string
 *                  required: false
 *              countryCode:
 *                  type: string
 *                  required: true
 *              mobileNumber:
 *                  type: string
 *                  required: true
 *              latitude:
 *                  type: number
 *                  required: true
 *              longitude:
 *                  type: number
 *                  required: true
 *              deviceToken:
 *                  type: string
 *                  required: false
 *              deviceType:
 *                  type: string
 *                  required: true
 *              languageId:
 *                  type: number
 *                  required: true
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/user/register/byPhone',
Auth.checkCblAuthority,
expressJoi({
    body: 
    {  
                countryCode:Joi.string().required(),
                mobileNumber:Joi.string().required(),
                name:Joi.string().optional().allow(""),
                latitude:Joi.number().required(),
                deviceToken:Joi.string().optional().allow(""),
                deviceType:Joi.string().optional().allow(""),
                longitude:Joi.number().required(),
                languageId:Joi.number().required(),
                password: Joi.string().optional().allow("")
    }
}),
Controller.UserController.registerByPhone
)
/**
 * @swagger
 * /user/resend/otp:
 *   post:
 *     description: api used for register used by phone number
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: body
 *          required: false
 *          schema:
 *            type: object
 *            properties: 
 *              userCreatedId:
 *                  type: string
 *                  required: true
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/user/resend/otp',
Auth.checkCblAuthority,
expressJoi({
    body: 
    {  
        userCreatedId:Joi.string().required()
                
    }
}),
Controller.UserController.resendUserOtp
)
/**
 * @swagger
 * /user/update/name:
 *   post:
 *     description: api used for register used by phone number
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: body
 *          required: false
 *          schema:
 *            type: object
 *            properties: 
 *              userCreatedId:
 *                  type: string
 *                  required: true
 *              name:
 *                  type: string
 *                  required: true
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/user/update/name',
Auth.checkCblAuthority,
expressJoi({
    body: 
    {  
        userCreatedId:Joi.string().required(),
        name:Joi.string().required()
    }
}),
Controller.UserController.updateUserName
)
/**
 * @swagger
 * /user/otp/verify:
 *   post:
 *     description: api used for verify otp
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: body
 *          required: false
 *          schema:
 *            type: object
 *            properties: 
 *              userCreatedId:
 *                  type: string
 *                  required: true
 *              otp:
 *                  type: number
 *                  required: true
 *              languageId:
 *                  type: number
 *                  required: true
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/user/otp/verify',
Auth.checkCblAuthority,
expressJoi({
    body: 
    {  
        userCreatedId:Joi.string().required(),
        otp:Joi.number().required(),
        languageId:Joi.number().optional().allow("").required()
    }
}),
Controller.UserController.verifyOtp
)
/**
 * @swagger
 * /user/upload/document:
 *   post:
 *     description: For registration of user
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: documents
 *         required: false
 *         type: file
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/user/upload/document',
multipartMiddleware,
Auth.storeDbInRequest,
Auth.userAuthenticate,
// Auth.checkCblAuthority,
Controller.UserController.uploadDocument
)
/**
 * @swagger
 * /v1/user_details:
 *   get:
 *     description: api used for getting an user details  
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
app.get('/v1/user_details',
Auth.storeDbInRequest,
Auth.userAuthenticate,
expressJoi({
    query: 
    {  
        // user_id:Joi.string().required(),
    }
}),
HomeCntrl.getUserDetails
)

/**
 * @swagger
 * /common/getAllBanners:
 *   get:
 *     description: api used for getting all banners
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
app.get('/common/getAllBanners',
Auth.storeDbInRequest,
// Auth.userAuthenticate,
// expressJoi({
//     query: 
//     {  
//         // user_id:Joi.string().required(),
//     }
// }),
Controller.UserController.getAllBanners
)


/**
 * @swagger
 * /home/gift/list:
 *   get:
 *     description: api used for listing an gift card
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: languageId
 *         required: false
 *         type: number
 *       - in: query
 *         name: zoneOffset
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/home/gift/list',
Auth.storeDbInRequest,
expressJoi({
    query: 
    {  
        languageId:Joi.number().required(),
        zoneOffset:Joi.string().required()
    }
}),
HomeCntrl.getGiftCard
),


/**
 * @swagger
 * /user/getSupplierListByTagId:
 *   get:
 *     description: api used for listing an gift card
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: languageId
 *         required: true
 *         type: number
 *       - in: query
 *         name: latitude
 *         required: true
 *         type: number
 *       - in: query
 *         name: longitude
 *         required: true
 *         type: number
 *       - in: query
 *         name: offset
 *         required: false
 *         type: number
 *       - in: query
 *         name: tag_id
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/user/getSupplierListByTagId',
Auth.storeDbInRequest,
expressJoi({
    query: 
    {  
        languageId:Joi.number().required(),
        tag_id:Joi.number().required(),
        latitude:Joi.number().required(),
        longitude:Joi.number().required(),
        offset:Joi.string().optional().allow("")

    }
}),
HomeCntrl.getSupplierListWithTagId
)


/**
 * @swagger
 * /user/getSupplierListByTagId/V1:
 *   get:
 *     description: api used for listing an gift card
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: languageId
 *         required: true
 *         type: number
 *       - in: query
 *         name: latitude
 *         required: true
 *         type: number
 *       - in: query
 *         name: longitude
 *         required: true
 *         type: number
 *       - in: query
 *         name: offset
 *         required: false
 *         type: number
 *       - in: query
 *         name: tag_id
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/user/getSupplierListByTagId/V1',
Auth.storeDbInRequest,
expressJoi({
    query: 
    {  
        languageId:Joi.number().required(),
        tag_id:Joi.number().required(),
        latitude:Joi.number().required(),
        longitude:Joi.number().required(),
        offset:Joi.string().optional().allow("")

    }
}),
HomeCntrl.getSupplierListWithTagIdV1
)


/**
 * @swagger
 * /user/google/matrix:
 *   get:
 *     description: api used for getting an google matrix
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: source_latitude
 *         required: true
 *         type: number
 *       - in: query
 *         name: source_longitude
 *         required: true
 *         type: number
 *       - in: query
 *         name: dest_latitude
 *         required: true
 *         type: number
 *       - in: query
 *         name: dest_longitude
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/user/google/matrix',
    Auth.checkCblAuthority,
    expressJoi({
        query: 
        {  
            dest_longitude:Joi.number().required(),
            dest_latitude:Joi.number().required(),
            source_longitude:Joi.number().required(),
            source_latitude:Joi.number().required()
        }
    }),
    HomeCntrl.getGoogleMatrixData
)



/**
 * @swagger
 * /user/google/matrix/V1:
 *   post:
 *     description: api used for getting an google matrix
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: supplierUserLatLongs
 *         required: true
 *         type: array
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
    app.post('/user/google/matrix/V1',
        Auth.checkCblAuthority,
        expressJoi(
            {
                body: {
                    supplierUserLatLongs: Joi.array().items(Joi.object().keys({
                        dest_longitude:Joi.number().required(),
                        dest_latitude:Joi.number().required(),
                        source_longitude:Joi.number().required(),
                        source_latitude:Joi.number().required(),
                        supplierId:Joi.number().required()
                    })).required(),
                }
            }),
        HomeCntrl.getGoogleMatrixDataV1
    )


/**
 * @swagger
 * /user/contact_us:
 *   post:
 *     description: For registration of user
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: emailId
 *         required: true
 *         type: string
 *       - in: body
 *         name: phoneNumber
 *         required: true
 *         type: string
 *       - in: body
 *         name: countryCode
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/user/contact_us',
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({
    body: 
    {  
        emailId:Joi.string().required(),
        phoneNumber:Joi.string().required(),
        countryCode:Joi.string().required()
                
    }
}),
Controller.UserController.sendContactUsEmail
)

/**
 * @swagger
 * /user/category_wise_suppliers:
 *   post:
 *     description: For category_wise_suppliers
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: categoryIds
 *         required: true
 *         type: array
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/user/category_wise_suppliers',
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({
    body: 
    {  
        categoryIds:Joi.array().required(),
        latitude:Joi.number().required(),
        longitude:Joi.number().required(),
        languageId:Joi.string().required(),   
    }
}),
Controller.UserController.getCategoryWiseSupplierList
)
}