
var Controller=require('../../controller')
var Auth=require('../../lib/Auth')
var category=require('../../routes/category')
const Joi = require('joi')
const expressJoi = require('express-joi-validator');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
module.exports=(app)=>{
/**
 * @swagger
 * /generate_order:
 *   post:
 *     description: api used for generate orders by customer
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
 *              languageId:
 *                  type: number
 *                  required: true
 *              offset:
 *                  type: string
 *                  required: true   
 *              isPackage:
 *                  type: string
 *                  required: false   
 *              paymentType:
 *                  type: string
 *                  required: true
 *              agentIds:
 *                type: array
 *                items:
 *                  type: number
 *              date_time:
 *                 type: string
 *              duration:
 *                  type: number
 *              cartId:
 *                  type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/generate_order',
Auth.userAuthenticate,
Auth.checkCblAuthority,
expressJoi({
    body: 
    {  
        languageId:Joi.number().required(),
        isPackage:Joi.string().optional().allow(""),
        paymentType:Joi.number().required(),
        offset:Joi.string().required(),
        duration:Joi.number().optional().allow(""),
        agentIds:Joi.array().required(),
        cartId:Joi.string().required(),
        date_time:Joi.string().required()

    }
   
}),
    Controller.userOrderController.generateOrder
)
/**
 * @swagger
 * /user/order/addReceipt:
 *   post:
 *     description: For Updating an  brands
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: file
 *         required: false
 *         type: file
 *       - in: formData
 *         name: id
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/user/order/addReceipt',
    multipartMiddleware,
    // Auth.userAuthenticate,
    // Auth.checkforAuthorityofThisAdmin,
    // Auth.checkCblAuthority,
    Controller.userOrderController.addOrderReciept
)
/**
 * @swagger
 * /user/prescription/deleteImage:
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
 *              image_url:
 *                  type: string
 *                  required: true
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/user/prescription/deleteImage',
Auth.storeDbInRequest,
// Auth.checkCblAuthority,
expressJoi({
    body: 
    {  
        image_url:Joi.string().required()
        // https://api.royoapps.com/clikat-buckettest/ic_category_img.svg
    }
}),
Controller.userOrderController.deleteImage
)
/**
 * @swagger
 * /user/shipping/getOrder:
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
 *              orderId:
 *                  type: string
 *                  required: true
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/user/shipping/getOrder',
Auth.storeDbInRequest,
// Auth.checkCblAuthority,
expressJoi({
    body: 
    {  
        orderId:Joi.string().required()
        // https://api.royoapps.com/clikat-buckettest/ic_category_img.svg
    }
}),
Controller.userOrderController.getOrderInShipStation
),
/**
 * @swagger
 * /user/order/request:
 *   post:
 *     description: For Requesting  An  Order By User
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: file
 *         required: false
 *         type: file
 *       - in: formData
 *         name: prescription
 *         required: false
 *         type: string
 *       - in: formData
 *         name: supplier_branch_id
 *         required: false
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/user/order/request',
    multipartMiddleware,
    Auth.userAuthenticate,
    // Auth.checkforAuthorityofThisAdmin,
    // Auth.checkCblAuthority,
    Controller.userOrderController.orderRequestByUser
),
/**
 * @swagger
 * /user/order/requestList:
 *   get:
 *     description: 
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: true
 *         type: number
 *       - in: query
 *         name: offset
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/user/order/requestList',
Auth.userAuthenticate,
    expressJoi({
        query: 
        {  
            limit:Joi.number().required(),
            offset:Joi.number().required()
        }
    }),
    Controller.userOrderController.orderRequestList
),
/**
 * @swagger
 * /user/order/make_payment:
 *   post:
 *     description: api used for making an order payment after confirmation 
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
 *              order_id:
 *                  type: string
 *                  required: true
 *              gateway_unique_id:
 *                  type: string
 *                  required: false
 *              customer_payment_id:
 *                  type: string
 *                  required: false
 *              currency:
 *                  type: string
 *                  required: false
 *              card_id:
 *                  type: string
 *                  required: false
 *              payment_token:
 *                  type: string
 *                  required: false
 *              languageId:
 *                  type: number
 *                  required: false
 *              payment_type:
 *                  type: number
 *                  required: false
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/user/order/make_payment',
Auth.userAuthenticate,
// Auth.checkCblAuthority,
expressJoi({
    body: 
    {  
        order_id:Joi.string().required(),
        gateway_unique_id:Joi.optional().allow(""),
        currency:Joi.string().optional().allow(""),
        payment_type:Joi.number().required(),
        card_id:Joi.string().optional().allow(""),
        payment_token:Joi.string().optional().allow(""),
        languageId:Joi.number().required(),
        customer_payment_id:Joi.string().optional().allow("")
    }
}),
Controller.userOrderController.makeOrderPayment
),
/**
 * @swagger
 * /user/language/update:
 *   post:
 *     description: api used for updating an language
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
 *              language_id:
 *                  type: number
 *                  required: true
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/user/language/update',
Auth.userAuthenticate,
// Auth.checkCblAuthority,
expressJoi({
    body: 
    {  
        language_id:Joi.number().required()
    }
}),
Controller.userOrderController.updateUserLanguage
),
/**
 * @swagger
 * /user/order/make_safer_payment:
 *   post:
 *     description: api used for making an order payment after confirmation 
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
 *              amount:
 *                  type: string
 *                  required: true
 *              currency:
 *                  type: string
 *                  required: false
 *              languageId:
 *                  type: number
 *                  required: false
 *              success_url:
 *                  type: string
 *                  required: true
 *              cancel_url:
 *                  type: string
 *                  required: true
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/user/order/make_safer_payment',
Auth.userAuthenticate,
// Auth.checkCblAuthority,
expressJoi({
    body: 
    {  
        amount:Joi.string().required(),
        currency:Joi.string().optional().allow(""),
        languageId:Joi.number().required(),
        cancel_url:Joi.string().required(),
        success_url:Joi.string().required()
    }
}),
Controller.userOrderController.makeSaferPayment
),
/**
 * @swagger
 * /user/order/check_safer_taransaction_authorize:
 *   post:
 *     description: api used for payment confirmation 
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
 *              order_id:
 *                  type: string
 *                  required: true
 *              languageId:
 *                  type: number
 *                  required: false
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/user/order/check_safer_taransaction_authorize',
Auth.userAuthenticate,
// Auth.checkCblAuthority,
expressJoi({
    body: 
    {  
        order_id:Joi.string().required()
    }
}),
Controller.userOrderController.checkSaferTransactionAuthorize
),

/**
 * @swagger
 * /user/order/remaining_payment:
 *   post:
 *     description: api used for making an remaing payment of orders 
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
 *              order_id:
 *                  type: string
 *                  required: true
 *              gateway_unique_id:
 *                  type: string
 *                  required: true
 *              customer_payment_id:
 *                  type: string
 *                  required: false
 *              currency:
 *                  type: string
 *                  required: false
 *              card_id:
 *                  type: string
 *                  required: false
 *              payment_token:
 *                  type: string
 *                  required: false
 *              languageId:
 *                  type: number
 *                  required: false
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/user/order/remaining_payment',
Auth.userAuthenticate,
// Auth.checkCblAuthority,
expressJoi({
    body: 
    {  
        order_id:Joi.string().required(),
        gateway_unique_id:Joi.string().required(),
        currency:Joi.string().optional().allow(""),
        card_id:Joi.string().optional().allow(""),
        payment_token:Joi.string().optional().allow(""),
        customer_payment_id:Joi.string().optional().allow(""),
        languageId:Joi.number().required()
    }
}),
Controller.userOrderController.makeOrderPaymentOfRemainingAmount
),
/**
 * @swagger
 * /user/order/return_request:
 *   post:
 *     description: api used for sending an return order request  
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
 *              order_price_id:
 *                  type: number
 *                  required: true
 *              product_id:
 *                  type: number
 *                  required: true
 *              reason:
 *                  type: string
 *                  required: false
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/user/order/return_request',
Auth.userAuthenticate,
// Auth.checkCblAuthority,
expressJoi({
    body: 
    {  
        order_price_id:Joi.number().required(),
        product_id:Joi.number().required(),
        reason:Joi.string().optional().allow(""),
        refund_to_wallet:Joi.number().optional().allow("")
    }
}),
Controller.userOrderController.orderReturnRequest
)

/**
 * @swagger
 * /agent/order/return_request:
 *   post:
 *     description: api used for sending an return order request  
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
 *              order_price_id:
 *                  type: number
 *                  required: true
 *              product_id:
 *                  type: number
 *                  required: true
 *              reason:
 *                  type: string
 *                  required: false
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/agent/order/return_request',
// Auth.userAuthenticate,
// Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({
    body: 
    {  
        order_price_id:Joi.number().required(),
        product_id:Joi.number().required(),
        reason:Joi.string().optional().allow(""),
        user_id:Joi.number().optional().allow(0),
        agent_order_id:Joi.number().optional().allow(""),
        refund_to_wallet:Joi.number().optional().allow("")
    }
}),
Controller.userOrderController.orderReturnRequestByAgent
)

/**
 * @swagger
 * /user/order/request_reject:
 *   put:
 *     description: For Cancel Order Request
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
 *              id:
 *                type: number
 *                required: true
 *              reason:
 *                type: string
 *                required: false
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.put('/user/order/request_reject',
Auth.userAuthenticate,
expressJoi({body: {
                 id:Joi.number().required(),
                 reason:Joi.string().optional().allow("")
            }
}),
Controller.userOrderController.requestCancelledByUser
)

/**
 * @swagger
 * /user/change_order_status:
 *   post:
 *     description: For changing status of order
 *     tags:
 *       - User API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: order_id
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/user/change_order_status',
    Auth.userAuthenticate,
    Auth.storeDbInRequest,
    // Auth.checkforAuthorityofThisAdmin,
    // Auth.checkCblAuthority,
    Controller.userOrderController.changeOrderStatusByUser
),
/**
 * @swagger
 * /user/dhl/shipment/track:
 *   post:
 *     description: used for dhl shipment tracking
 *     tags:
 *       - User API`S
 *     produces:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: body
 *          required: falsesectionAuthorityData
 *          schema:
 *            type: object
 *            properties: 
 *              orderId:
 *                type: number
 *                required: true
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/user/dhl/shipment/track',
Auth.userAuthenticate,
Auth.storeDbInRequest,
// Auth.checkCblAuthority,
expressJoi({body: 
    {   
        orderId:Joi.number().required()
    }
}),
Controller.userOrderController.trackShipment
)

/**
 * @swagger
 * /user/ship_rocket/shipment/track:
 *   post:
 *     description: used for dhl ship_rocket tracking
 *     tags:
 *       - User API`S
 *     produces:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: body
 *          required: falsesectionAuthorityData
 *          schema:
 *            type: object
 *            properties: 
 *              orderId:
 *                type: number
 *                required: true
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/user/ship_rocket/shipment/track',
Auth.userAuthenticate,
Auth.storeDbInRequest,
// Auth.checkCblAuthority,
expressJoi({body: 
    {   
        orderId:Joi.number().required()
    }
}),
Controller.userOrderController.trackShipmentOfShipRocket
)

/**
 * @swagger
 * /admin/ship_rocket/shipment/track:
 *   post:
 *     description: used for dhl ship_rocket tracking
 *     tags:
 *       - admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: body
 *          required: falsesectionAuthorityData
 *          schema:
 *            type: object
 *            properties: 
 *              orderId:
 *                type: number
 *                required: true
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/admin/ship_rocket/shipment/track',
// Auth.userAuthenticate,
Auth.storeDbInRequest,
// Auth.checkCblAuthority,
expressJoi({body: 
    {   
        orderId:Joi.number().required()
    }
}),
Controller.userOrderController.trackShipmentOfShipRocket
)

}

