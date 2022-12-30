
var Auth=require('../../lib/Auth')
var category=require('../../routes/category')
const Joi = require('joi')
const expressJoi = require('express-joi-validator');
const Controller=require('../../controller');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

module.exports=(app)=>{
/**
 * @swagger
 * /atlantic/verify:
 *   post:
 *     description: api used for getting an access code of paystack
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/atlantic/verify',
Controller.UserPaymentController.atlanticTransactionVerification
)
/**
 * @swagger
 * /paystack/access_code:
 *   get:
 *     description: api used for getting an access code of paystack
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         type: string
 *       - in: query
 *         name: net_amount
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/paystack/access_code',
    Auth.userAuthenticate,
    Auth.checkCblAuthority,
    expressJoi({
        query:
            {
                net_amount:Joi.number().required(),
                email:Joi.string().required()
            }
    }),
Controller.UserPaymentController.AccessCode
)
/**
 * @swagger
 * /paypal/create-order:
 *   get:
 *     description: api used for getting an access code of paystack
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: net_amount
 *         required: true
 *         type: number
 *       - in: query
 *         name: currency
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/paypal/create-order',
    Auth.userAuthenticate,
    Auth.checkCblAuthority,
    expressJoi({
        query:
            {
                net_amount:Joi.number().required(),
                currency:Joi.string().required()
            }
    }),
    Controller.UserPaymentController.createPaypalPayment
)
/**
 * @swagger
 * /braintree/client-token:
 *   get:
 *     description: api used for getting an access code of paystack
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
app.get('/braintree/client-token',
    Auth.userAuthenticate,
    Auth.checkCblAuthority,
    Controller.UserPaymentController.clientToken
)

/**
 * @swagger
 *   /agent/braintree/client-token:
 *   get:
 *     description: For getting agent braintree token
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: user_id
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/agent/braintree/client-token',
    Auth.storeDbInRequest1,
    expressJoi({query: {
        user_id: Joi.number().required()
     }
}),
    Controller.UserPaymentController.clientToken
)



/**
 * @swagger
 *   /customer/add_card:
 *   post:
 *     description: For Creating an card for customer
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: user_id
 *         required: true
 *         type: number
 *       - in: formData
 *         name: card_type
 *         required: false
 *         type: string
 *       - in: formData
 *         name: card_number
 *         required: true
 *         type: string
 *       - in: formData
 *         name: exp_month
 *         required: true
 *         type: string
 *       - in: formData
 *         name: exp_year
 *         required: true
 *         type: string
 *       - in: formData
 *         name: card_token
 *         required: false
 *         type: string
 *       - in: formData
 *         name: gateway_unique_id
 *         required: true
 *         type: string
 *       - in: formData
 *         name: cvc
 *         required: true
 *         type: string
 *       - in: formData
 *         name: card_nonce 
 *         required: false
 *         description: card_nonce is required in squareup 
 *         type: string
 *       - in: formData
 *         name: card_holder_name
 *         required: false
 *         description: card_holder_name is required in squareup 
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/customer/add_card',
        Auth.userAuthenticate,
        Auth.storeDbInRequest,
        // Auth.checkCblAuthority,
        expressJoi({
            body: {
                user_id: Joi.number().required(),
                card_holder_name:Joi.string().required(),
                card_type: Joi.string().optional().allow(""),
                card_token : Joi.string().optional().allow(""),
                card_number: Joi.string().required(),
                exp_month: Joi.string().required(),
                exp_year: Joi.string().required(),
                cvc : Joi.string().required(),
                gateway_unique_id:Joi.string().required(),
                card_nonce: Joi.string().optional().allow(""),
                card_holder_name : Joi.string().optional().allow("") ,            
                stripe_token : Joi.string().optional().allow("") ,            
                zipCode : Joi.string().optional().allow("")             
            }
        }),
        Controller.UserPaymentController.addCard
)

/**
 * @swagger
 *   /agent/add_card:
 *   post:
 *     description: For Creating an card for agent
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: user_id
 *         required: true
 *         type: number
 *       - in: formData
 *         name: card_type
 *         required: false
 *         type: string
 *       - in: formData
 *         name: card_number
 *         required: true
 *         type: string
 *       - in: formData
 *         name: exp_month
 *         required: true
 *         type: string
 *       - in: formData
 *         name: exp_year
 *         required: true
 *         type: string
 *       - in: formData
 *         name: card_token
 *         required: false
 *         type: string
 *       - in: formData
 *         name: gateway_unique_id
 *         required: true
 *         type: string
 *       - in: formData
 *         name: cvc
 *         required: true
 *         type: string
 *       - in: formData
 *         name: card_nonce 
 *         required: false
 *         description: card_nonce is required in squareup 
 *         type: string
 *       - in: formData
 *         name: card_holder_name
 *         required: false
 *         description: card_holder_name is required in squareup 
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/agent/add_card',
        Auth.agentAuthenticate,
        Auth.storeDbInRequest1,
        //Auth.checkCblAuthority,
        expressJoi({
            body: {
                user_id: Joi.number().required(),
                card_holder_name:Joi.string().required(),
                card_type: Joi.string().optional().uppercase().allow(""),
                card_token : Joi.string().optional().allow(""),
                card_number: Joi.string().required(),
                exp_month: Joi.string().required(),
                exp_year: Joi.string().required(),
                cvc : Joi.string().required(),
                gateway_unique_id:Joi.string().required(),
                card_nonce: Joi.string().optional().allow(""),
                card_holder_name : Joi.string().optional().allow(""),
            }
        }),
        Controller.UserPaymentController.addCard
)




/**
 * @swagger
 * /supplier/tap/create_bussiness:
 *   post:
 *     description: 
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         type: string
 *       - in: query
 *         name: phone
 *         required: true
 *         type: string
 *       - in: query
 *         name: name
 *         required: true
 *         type: string
 *       - in: query
 *         name: country_code
 *         required: true
 *         type: string
 *       - in: query
 *         name: currency
 *         required: true
 *         type: string
 *       - in: query
 *         name: amount
 *         required: true
 *         type: number
 *       - in: query
 *         name: post_url
 *         required: true
 *         type: string
 *       - in: query
 *         name: redirect_url
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/supplier/tap/create_bussiness',
// Auth.userAuthenticate,
Auth.storeDbInRequest,
    expressJoi({
        body:{
            business_profile_json : Joi.object().required()
        }
    }),
    Controller.UserPaymentController.createTapBusinessProfile
)



/**
 * @swagger
 * /admin/tap/create_bussiness:
 *   post:
 *     description: 
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         type: string
 *       - in: query
 *         name: phone
 *         required: true
 *         type: string
 *       - in: query
 *         name: name
 *         required: true
 *         type: string
 *       - in: query
 *         name: country_code
 *         required: true
 *         type: string
 *       - in: query
 *         name: currency
 *         required: true
 *         type: string
 *       - in: query
 *         name: amount
 *         required: true
 *         type: number
 *       - in: query
 *         name: post_url
 *         required: true
 *         type: string
 *       - in: query
 *         name: redirect_url
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/admin/tap/create_bussiness',
// Auth.userAuthenticate,
Auth.storeDbInRequest,
    expressJoi({
        body:{
            business_profile_json : Joi.object().required()
        }
    }),
    Controller.UserPaymentController.createTapBusinessProfile
)

/**
 * @swagger
 * /supplier/tap/add_card:
 *   post:
 *     description: 
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: email
 *         required: true
 *         type: string
 *       - in: body
 *         name: phone
 *         required: true
 *         type: string
 *       - in: body
 *         name: name
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/supplier/tap/add_card',
// Auth.userAuthenticate,
Auth.storeDbInRequest,
    expressJoi({
        body:{
            customer_profile_json : Joi.object().required(),
            card_token : Joi.string().required(),
            supplier_id : Joi.number().required()
        }
    }),
    Controller.UserPaymentController.addTapCustomerAndCard
)


/**
 * @swagger
 * /agent/tap/create_bussiness:
 *   post:
 *     description: 
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         type: string
 *       - in: query
 *         name: phone
 *         required: true
 *         type: string
 *       - in: query
 *         name: name
 *         required: true
 *         type: string
 *       - in: query
 *         name: country_code
 *         required: true
 *         type: string
 *       - in: query
 *         name: currency
 *         required: true
 *         type: string
 *       - in: query
 *         name: amount
 *         required: true
 *         type: number
 *       - in: query
 *         name: post_url
 *         required: true
 *         type: string
 *       - in: query
 *         name: redirect_url
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/agent/tap/create_bussiness',
// Auth.userAuthenticate,
Auth.storeDbInRequest,
    expressJoi({
        body:{
            business_profile_json : Joi.object().required()
        }
    }),
    Controller.UserPaymentController.createTapBusinessProfile
)






/**
 * @swagger
 * /supplier/tap/create_Detination:
 *   post:
 *     description: 
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         type: string
 *       - in: query
 *         name: phone
 *         required: true
 *         type: string
 *       - in: query
 *         name: name
 *         required: true
 *         type: string
 *       - in: query
 *         name: country_code
 *         required: true
 *         type: string
 *       - in: query
 *         name: currency
 *         required: true
 *         type: string
 *       - in: query
 *         name: amount
 *         required: true
 *         type: number
 *       - in: query
 *         name: post_url
 *         required: true
 *         type: string
 *       - in: query
 *         name: redirect_url
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/supplier/tap/create_Detination',
// Auth.userAuthenticate,
Auth.storeDbInRequest,
    expressJoi({
        body:{
            business_profile_json : Joi.object().required()
        }
    }),
    Controller.UserPaymentController.createTapBusinessDestination
)



/**
 * @swagger
 * /agent/tap/create_Detination:
 *   post:
 *     description: 
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         type: string
 *       - in: query
 *         name: phone
 *         required: true
 *         type: string
 *       - in: query
 *         name: name
 *         required: true
 *         type: string
 *       - in: query
 *         name: country_code
 *         required: true
 *         type: string
 *       - in: query
 *         name: currency
 *         required: true
 *         type: string
 *       - in: query
 *         name: amount
 *         required: true
 *         type: number
 *       - in: query
 *         name: post_url
 *         required: true
 *         type: string
 *       - in: query
 *         name: redirect_url
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/agent/tap/create_Detination',
// Auth.userAuthenticate,
Auth.storeDbInRequest,
    expressJoi({
        body:{
            business_profile_json : Joi.object().required()
        }
    }),
    Controller.UserPaymentController.createTapBusinessDestination
)


/**
 * @swagger
 * /admin/tap/create_Detination:
 *   post:
 *     description: 
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         type: string
 *       - in: query
 *         name: phone
 *         required: true
 *         type: string
 *       - in: query
 *         name: name
 *         required: true
 *         type: string
 *       - in: query
 *         name: country_code
 *         required: true
 *         type: string
 *       - in: query
 *         name: currency
 *         required: true
 *         type: string
 *       - in: query
 *         name: amount
 *         required: true
 *         type: number
 *       - in: query
 *         name: post_url
 *         required: true
 *         type: string
 *       - in: query
 *         name: redirect_url
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/admin/tap/create_Detination',
// Auth.userAuthenticate,
Auth.storeDbInRequest,
    expressJoi({
        body:{
            business_profile_json : Joi.object().required()
        }
    }),
    Controller.UserPaymentController.createTapBusinessDestination
)









/**
 * @swagger
 *   /customer/update_card:
 *   put:
 *     description: For updating an card for customer
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: user_id
 *         required: true
 *         type: number
 *       - in: formData
 *         name: customer_payment_id
 *         required: true
 *         type: string
 *       - in: formData
 *         name: card_id
 *         required: true
 *         type: string
 *       - in: formData
 *         name: exp_month
 *         required: true
 *         type: string
 *       - in: formData
 *         name: exp_year
 *         required: true
 *         type: number
 *       - name: card_holder_name
 *         in: formData
 *         description: card holderName e.g MS Dhoni
 *         required: false
 *         type: string
 *       - in: formData
 *         name: gateway_unique_id
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.put('/customer/update_card',
    // Auth.userAuthenticate,
    Auth.storeDbInRequest,
    // Auth.checkCblAuthority,
    expressJoi({
        body: {
            user_id: Joi.number().required(),
            customer_payment_id: Joi.string().required(),
            card_id: Joi.string().required(),
            exp_month: Joi.string().required(),
            exp_year: Joi.string().required(),
            card_holder_name :Joi.string().optional().allow(""),
            gateway_unique_id :Joi.string().required(),
        }
    }),
    Controller.UserPaymentController.UpdateCard
)


/**
 * @swagger
 *   /customer/get_cards:
 *   get:
 *     description: For getting cards of customer
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: customer_payment_id
 *         required: true
 *         type: string
 *       - in: query
 *         name: gateway_unique_id
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/customer/get_cards',
    Auth.userAuthenticate,
    Auth.storeDbInRequest,
    // Auth.checkCblAuthority,
    expressJoi({query: {
        customer_payment_id:Joi.string().optional().allow(""),
        gateway_unique_id:Joi.string().allow("")
     }
}),
    Controller.UserPaymentController.listCards
)

/**
 * @swagger
 *   /agent/get_cards:
 *   get:
 *     description: For getting cards of customer
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: customer_payment_id
 *         required: false
 *         type: string
 *       - in: query
 *         name: gateway_unique_id
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/agent/get_cards',
    Auth.storeDbInRequest1,
    expressJoi({query: {
        customer_payment_id:Joi.string().optional().allow(""),
        gateway_unique_id:Joi.string().allow("")
     }
}),
    Controller.UserPaymentController.listAgentCards
)

/**
 * @swagger
 *   /customer/get_context:
 *   get:
 *     description: For getting cards of customer
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
app.get('/customer/get_context',
    Auth.userAuthenticate,
    Auth.storeDbInRequest,
    Auth.checkCblAuthority,
    Controller.UserPaymentController.getContextCyberSource
)

/**
 * @swagger
 *   /customer/delete_card:
 *   post:
 *     description: For deleting an card for customer
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: customer_payment_id
 *         required: true
 *         type: string
 *       - in: formData
 *         name: card_id
 *         required: true
 *         type: string
 *       - in: formData
 *         name: gateway_unique_id
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/customer/delete_card',
        Auth.userAuthenticate,
        Auth.storeDbInRequest1,
        //Auth.checkCblAuthority,
        expressJoi({
            body: {
                customer_payment_id: Joi.string().optional().allow(""),
                card_id: Joi.string().required(),
                gateway_unique_id:Joi.string().required()
            }
        }),
        Controller.UserPaymentController.deleteCard
),
/**
 * @swagger
 * /user/gift/purchase:
 *   post:
 *     description: api used for []
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
 *              gift_id:
 *                  type: string
 *                  required: true
 *              gateway_unique_id:
 *                  type: string
 *                  required: true
 *              customer_payment_id:
 *                  type: string
 *                  required: true
 *              card_id:
 *                  type: string
 *                  required: false
 *              currency:
 *                  type: string
 *                  required: true
 *              zone_offset:
 *                  type: string
 *                  required: true
 *              languageId:
 *                  type: number
 *                  required: true
 *              quantity:
 *                  type: number
 *                  required: true
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/user/gift/purchase',
Auth.userAuthenticate,
Auth.checkCblAuthority,
expressJoi({    
    body: 
    {  
        gift_id:Joi.string().required(),
        zone_offset:Joi.string().required(),
        gateway_unique_id:Joi.string().required(),
        currency:Joi.string().optional().allow(""),
        card_id:Joi.string().optional().allow(""),
        customer_payment_id:Joi.string().optional().allow(""),
        payment_token:Joi.string().optional().allow(""),
        languageId:Joi.number().required(),
        quantity:Joi.number().required()
    }
}),
Controller.UserPaymentController.purchaseGift
)
/**
 * @swagger
 * /user/gift/purchaseList:
 *   get:
 *     description: api used for getting an access code of paystack
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
 *         name: offset
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/user/gift/purchaseList',
    Auth.userAuthenticate,
    Auth.checkCblAuthority,
    expressJoi({
        query:
            {
                limit:Joi.number().required(),
                offset:Joi.number().required()
            }
    }),
Controller.UserPaymentController.getPurchasedGift
),
/**
 * @swagger
 *   /customer/telrTest:
 *   get:
 *     description: For getting cards of customer
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
app.get('/customer/telrTest',
    // Auth.userAuthenticate,
    // Auth.storeDbInRequest,
    // Auth.checkCblAuthority,
    Controller.UserPaymentController.testTelnr
)
/**
 * @swagger
 * /user/Sadded/getPaymentUrl:
 *   get:
 *     description: 
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         type: string
 *       - in: query
 *         name: name
 *         required: true
 *         type: string
 *       - in: query
 *         name: amount
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/user/Sadded/getPaymentUrl',
//Auth.userAuthenticate,
Auth.storeDbInRequest,
    expressJoi({
        query: 
        {  
            name:Joi.string().required(),
            email:Joi.string().required(),
            amount:Joi.number().required()
        }
    }),
    Controller.UserPaymentController.getSaadedPaymentUrl
)

/**
 * @swagger
 * /user/tap/getPaymentUrl:
 *   get:
 *     description: 
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         type: string
 *       - in: query
 *         name: phone
 *         required: true
 *         type: string
 *       - in: query
 *         name: name
 *         required: true
 *         type: string
 *       - in: query
 *         name: country_code
 *         required: true
 *         type: string
 *       - in: query
 *         name: currency
 *         required: true
 *         type: string
 *       - in: query
 *         name: amount
 *         required: true
 *         type: number
 *       - in: query
 *         name: post_url
 *         required: true
 *         type: string
 *       - in: query
 *         name: redirect_url
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/user/tap/getPaymentUrl',
// Auth.userAuthenticate,
Auth.storeDbInRequest,
    expressJoi({
        query: 
        {  
            name:Joi.string().required(),
            email:Joi.string().required(),
            phone:Joi.string().required(),
            country_code:Joi.string().required(),
            amount:Joi.number().required(),
            currency:Joi.string().required(),
            post_url:Joi.string().required(),
            redirect_url:Joi.string().required(),
        }
    }),
    Controller.UserPaymentController.getTapPaymentUrl
)




/**
 * @swagger
 * /supplier/tap/create_bussiness:
 *   post:
 *     description: 
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         type: string
 *       - in: query
 *         name: phone
 *         required: true
 *         type: string
 *       - in: query
 *         name: name
 *         required: true
 *         type: string
 *       - in: query
 *         name: country_code
 *         required: true
 *         type: string
 *       - in: query
 *         name: currency
 *         required: true
 *         type: string
 *       - in: query
 *         name: amount
 *         required: true
 *         type: number
 *       - in: query
 *         name: post_url
 *         required: true
 *         type: string
 *       - in: query
 *         name: redirect_url
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/supplier/tap/create_bussiness',
// Auth.userAuthenticate,
Auth.storeDbInRequest,
    expressJoi({
        body:{
            business_profile_json : Joi.object().required()
        }
    }),
    Controller.UserPaymentController.createTapBusinessProfile
)



/**
 * @swagger
 * /admin/tap/create_bussiness:
 *   post:
 *     description: 
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         type: string
 *       - in: query
 *         name: phone
 *         required: true
 *         type: string
 *       - in: query
 *         name: name
 *         required: true
 *         type: string
 *       - in: query
 *         name: country_code
 *         required: true
 *         type: string
 *       - in: query
 *         name: currency
 *         required: true
 *         type: string
 *       - in: query
 *         name: amount
 *         required: true
 *         type: number
 *       - in: query
 *         name: post_url
 *         required: true
 *         type: string
 *       - in: query
 *         name: redirect_url
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/admin/tap/create_bussiness',
// Auth.userAuthenticate,
Auth.storeDbInRequest,
    expressJoi({
        body:{
            business_profile_json : Joi.object().required()
        }
    }),
    Controller.UserPaymentController.createTapBusinessProfile
)

/**
 * @swagger
 * /supplier/tap/add_card:
 *   post:
 *     description: 
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: email
 *         required: true
 *         type: string
 *       - in: body
 *         name: phone
 *         required: true
 *         type: string
 *       - in: body
 *         name: name
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/supplier/tap/add_card',
// Auth.userAuthenticate,
Auth.storeDbInRequest,
    expressJoi({
        body:{
            customer_profile_json : Joi.object().required(),
            card_token : Joi.string().required(),
            supplier_id : Joi.number().required()
        }
    }),
    Controller.UserPaymentController.addTapCustomerAndCard
)


/**
 * @swagger
 * /agent/tap/create_bussiness:
 *   post:
 *     description: 
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         type: string
 *       - in: query
 *         name: phone
 *         required: true
 *         type: string
 *       - in: query
 *         name: name
 *         required: true
 *         type: string
 *       - in: query
 *         name: country_code
 *         required: true
 *         type: string
 *       - in: query
 *         name: currency
 *         required: true
 *         type: string
 *       - in: query
 *         name: amount
 *         required: true
 *         type: number
 *       - in: query
 *         name: post_url
 *         required: true
 *         type: string
 *       - in: query
 *         name: redirect_url
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/agent/tap/create_bussiness',
// Auth.userAuthenticate,
Auth.storeDbInRequest,
    expressJoi({
        body:{
            business_profile_json : Joi.object().required()
        }
    }),
    Controller.UserPaymentController.createTapBusinessProfile
)



/**
 * @swagger
 * /tap/file_upload:
 *   post:
 *     description: 
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         type: string
 *       - in: query
 *         name: phone
 *         required: true
 *         type: string
 *       - in: query
 *         name: name
 *         required: true
 *         type: string
 *       - in: query
 *         name: country_code
 *         required: true
 *         type: string
 *       - in: query
 *         name: currency
 *         required: true
 *         type: string
 *       - in: query
 *         name: amount
 *         required: true
 *         type: number
 *       - in: query
 *         name: post_url
 *         required: true
 *         type: string
 *       - in: query
 *         name: redirect_url
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/tap/file_upload',
multipartMiddleware,
// Auth.userAuthenticate,

Auth.storeDbInRequest,
    expressJoi({
        body:{
            purpose : Joi.string().optional().allow(""),
            title : Joi.string().optional().allow(""),
            file_link_create : Joi.string().optional().allow("")
        }
    }),
    Controller.UserPaymentController.uploadTapFiles
)



/**
 * @swagger
 * /supplier/tap/create_Detination:
 *   post:
 *     description: 
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         type: string
 *       - in: query
 *         name: phone
 *         required: true
 *         type: string
 *       - in: query
 *         name: name
 *         required: true
 *         type: string
 *       - in: query
 *         name: country_code
 *         required: true
 *         type: string
 *       - in: query
 *         name: currency
 *         required: true
 *         type: string
 *       - in: query
 *         name: amount
 *         required: true
 *         type: number
 *       - in: query
 *         name: post_url
 *         required: true
 *         type: string
 *       - in: query
 *         name: redirect_url
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/supplier/tap/create_Detination',
// Auth.userAuthenticate,
Auth.storeDbInRequest,
    expressJoi({
        body:{
            business_profile_json : Joi.object().required()
        }
    }),
    Controller.UserPaymentController.createTapBusinessDestination
)



/**
 * @swagger
 * /agent/tap/create_Detination:
 *   post:
 *     description: 
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         type: string
 *       - in: query
 *         name: phone
 *         required: true
 *         type: string
 *       - in: query
 *         name: name
 *         required: true
 *         type: string
 *       - in: query
 *         name: country_code
 *         required: true
 *         type: string
 *       - in: query
 *         name: currency
 *         required: true
 *         type: string
 *       - in: query
 *         name: amount
 *         required: true
 *         type: number
 *       - in: query
 *         name: post_url
 *         required: true
 *         type: string
 *       - in: query
 *         name: redirect_url
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/agent/tap/create_Detination',
// Auth.userAuthenticate,
Auth.storeDbInRequest,
    expressJoi({
        body:{
            business_profile_json : Joi.object().required()
        }
    }),
    Controller.UserPaymentController.createTapBusinessDestination
)


/**
 * @swagger
 * /admin/tap/create_Detination:
 *   post:
 *     description: 
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         type: string
 *       - in: query
 *         name: phone
 *         required: true
 *         type: string
 *       - in: query
 *         name: name
 *         required: true
 *         type: string
 *       - in: query
 *         name: country_code
 *         required: true
 *         type: string
 *       - in: query
 *         name: currency
 *         required: true
 *         type: string
 *       - in: query
 *         name: amount
 *         required: true
 *         type: number
 *       - in: query
 *         name: post_url
 *         required: true
 *         type: string
 *       - in: query
 *         name: redirect_url
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/admin/tap/create_Detination',
// Auth.userAuthenticate,
Auth.storeDbInRequest,
    expressJoi({
        body:{
            business_profile_json : Joi.object().required()
        }
    }),
    Controller.UserPaymentController.createTapBusinessDestination
)


/**
 * @swagger
 *   /user/mPaisa/getUrl:
 *   post:
 *     description: For getting payment url of m-Paisa
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: checkout_url
 *         required: true
 *         type: string
 *       - in: formData
 *         name: amount
 *         required: true
 *         type: number
 *       - in: formData
 *         name: items_details
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/user/mPaisa/getUrl',
        // Auth.userAuthenticate,
        Auth.storeDbInRequest,
        // Auth.checkCblAuthority,
        expressJoi({
            body: {
                checkout_url:Joi.string().required(),
                // transaction_id: Joi.number().required(),
                amount: Joi.number().required(),
                // client_id: Joi.number().required(),
                items_details:Joi.string().required()
            }
        }),
        Controller.UserPaymentController.getMPaiseUrl
)
/**
 * @swagger
 *   /user/urway/getUrl:
 *   post:
 *     description: For getting payment url of m-Paisa
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: amount
 *         required: true
 *         type: number
 *       - in: formData
 *         name: payment_token
 *         required: true
 *         type: string
 *       - in: formData
 *         name: currency
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/user/urway/getUrl',
        Auth.storeDbInRequest,
        expressJoi({
            body: {
                amount: Joi.number().required(),
                payment_token:Joi.string().required(),
                currency:Joi.string().required()
            }
        }),
Controller.UserPaymentController.getUrwayCheckout
)
/**
 * @swagger
 *   /user/windcave/getUrl:
 *   post:
 *     description: For getting payment url of windcave
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: amount
 *         required: true
 *         type: number
 *       - in: formData
 *         name: currency
 *         required: true
 *         type: string
 *       - in: formData
 *         name: address
 *         required: true
 *         type: string
 *       - in: formData
 *         name: email
 *         required: true
 *         type: string
 *       - in: formData
 *         name: success_url
 *         required: true
 *         type: string
 *       - in: formData
 *         name: failure_url
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/user/windcave/getUrl',
        // Auth.userAuthenticate,
        Auth.storeDbInRequest,
        // Auth.checkCblAuthority,
        expressJoi({
            body: {
                amount: Joi.string().required(),
                currency: Joi.string().optional().allow(""),
                address: Joi.string().optional().allow(""),
                email : Joi.string().required(),
                success_url:Joi.string().optional().allow(""),
                failure_url:Joi.string().optional().allow("")
            }
        }),
        Controller.UserPaymentController.getwindCaveUrl
)

/**
 * @swagger
 *   /user/wallet/add_money:
 *   post:
 *     description: For adding money to user wallet
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: gateway_unique_id
 *         required: true
 *         type: string
 *       - in: formData
 *         name: amount
 *         required: true
 *         type: number
 *       - in: formData
 *         name: phoneNumber
 *         required: false
 *         type: string
 *       - in: formData
 *         name: card_id
 *         required: false
 *         type: string
 *       - in: formData
 *         name: customer_payment_id
 *         required: false
 *         type: string
 *       - in: formData
 *         name: payment_token
 *         required: false
 *         type: string
 *       - in: formData
 *         name: invoiceId
 *         required: false
 *         type: string
 *       - in: formData
 *         name: currency
 *         required: true
 *         type: string
 *       - in: formData
 *         name: cartId
 *         required: false
 *         type: number
 *       - in: formData
 *         name: languageId
 *         required: true
 *         type: string
 *       - in: formData
 *         name: user_id
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/user/wallet/add_money',
        Auth.userAuthenticate,
        Auth.storeDbInRequest,
        // Auth.checkCblAuthority,
        expressJoi({
            body: {
                gateway_unique_id:Joi.string().required(),
                amount: Joi.number().required(),
                phoneNumber:Joi.string().optional().allow(""),
                card_id:Joi.string().optional().allow(""),
                customer_payment_id:Joi.string().optional().allow(""),
                payment_token:Joi.string().optional().allow(""),
                expMonth:Joi.string().optional().allow(""),
                expYear:Joi.string().optional().allow(""),
                cvt:Joi.string().optional().allow(""),
                cp:Joi.string().optional().allow(""),
                invoiceId:Joi.string().optional().allow(""),
                currency:Joi.string().optional().allow(""),
                cartId:Joi.number().optional().allow(""),
                languageId:Joi.string().optional().allow(""),
                user_id:Joi.number().required(),
                cardHolderName:Joi.string().allow().allow(""),
                authnet_profile_id:Joi.string().optional().allow(""),
                authnet_payment_profile_id:Joi.string().optional().allow("")
            }
        }),
        Controller.walletController.addMoneyToWallet
)

/**
 * @swagger
 *   /agent/wallet/add_money:
 *   post:
 *     description: For adding money to agent wallet
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: gateway_unique_id
 *         required: true
 *         type: string
 *       - in: formData
 *         name: amount
 *         required: true
 *         type: number
 *       - in: formData
 *         name: phoneNumber
 *         required: false
 *         type: string
 *       - in: formData
 *         name: card_id
 *         required: false
 *         type: string
 *       - in: formData
 *         name: customer_payment_id
 *         required: false
 *         type: string
 *       - in: formData
 *         name: payment_token
 *         required: false
 *         type: string
 *       - in: formData
 *         name: invoiceId
 *         required: false
 *         type: string
 *       - in: formData
 *         name: currency
 *         required: true
 *         type: string
 *       - in: formData
 *         name: cartId
 *         required: false
 *         type: number
 *       - in: formData
 *         name: languageId
 *         required: true
 *         type: string
 *       - in: formData
 *         name: user_id
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/agent/wallet/add_money',
        // Auth.userAuthenticate,
        Auth.storeDbInRequest1,
        // Auth.checkCblAuthority,
        expressJoi({
            body: {
                gateway_unique_id:Joi.string().required(),
                amount: Joi.number().required(),
                phoneNumber:Joi.string().optional().allow(""),
                card_id:Joi.string().optional().allow(""),
                customer_payment_id:Joi.string().optional().allow(""),
                payment_token:Joi.string().optional().allow(""),
                invoiceId:Joi.string().optional().allow(""),
                currency:Joi.string().optional().allow(""),
                cartId:Joi.number().optional().allow(""),
                languageId:Joi.string().optional().allow(""),
                user_id:Joi.number().required()
            }
        }),
        Controller.walletController.addMoneyToAgentWallet
)


/**
 * @swagger
 *   /admin/wallet/add_money_to_user:
 *   post:
 *     description: For adding money to user wallet
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: gateway_unique_id
 *         required: false
 *         type: string
 *       - in: formData
 *         name: amount
 *         required: true
 *         type: number
 *       - in: formData
 *         name: phoneNumber
 *         required: false
 *         type: string
 *       - in: formData
 *         name: card_id
 *         required: false
 *         type: string
 *       - in: formData
 *         name: customer_payment_id
 *         required: false
 *         type: string
 *       - in: formData
 *         name: payment_token
 *         required: false
 *         type: string
 *       - in: formData
 *         name: invoiceId
 *         required: false
 *         type: string
 *       - in: formData
 *         name: currency
 *         required: true
 *         type: string
 *       - in: formData
 *         name: cartId
 *         required: false
 *         type: number
 *       - in: formData
 *         name: languageId
 *         required: true
 *         type: string
 *       - in: formData
 *         name: user_id
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/admin/wallet/add_money_to_user',
        // Auth.userAuthenticate,
        Auth.storeDbInRequest,
        // Auth.checkCblAuthority,
        expressJoi({
            body: {
                gateway_unique_id:Joi.string().optional().allow(),
                amount: Joi.number().required(),
                phoneNumber:Joi.string().optional().allow(""),
                card_id:Joi.string().optional().allow(""),
                customer_payment_id:Joi.string().optional().allow(""),
                payment_token:Joi.string().optional().allow(""),
                invoiceId:Joi.string().optional().allow(""),
                currency:Joi.string().optional().allow(""),
                cartId:Joi.number().optional().allow(""),
                languageId:Joi.string().optional().allow(),
                user_id:Joi.number().required(),
                comment:Joi.string().optional().allow("")
            }
        }),
        Controller.walletController.addMoneyToWallet
)


/**
 * @swagger
 *   /admin/wallet/add_money_to_agent:
 *   post:
 *     description: For adding money to agent wallet
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: gateway_unique_id
 *         required: false
 *         type: string
 *       - in: formData
 *         name: amount
 *         required: true
 *         type: number
 *       - in: formData
 *         name: phoneNumber
 *         required: false
 *         type: string
 *       - in: formData
 *         name: card_id
 *         required: false
 *         type: string
 *       - in: formData
 *         name: customer_payment_id
 *         required: false
 *         type: string
 *       - in: formData
 *         name: payment_token
 *         required: false
 *         type: string
 *       - in: formData
 *         name: invoiceId
 *         required: false
 *         type: string
 *       - in: formData
 *         name: currency
 *         required: true
 *         type: string
 *       - in: formData
 *         name: cartId
 *         required: false
 *         type: number
 *       - in: formData
 *         name: languageId
 *         required: true
 *         type: string
 *       - in: formData
 *         name: user_id
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/admin/wallet/add_money_to_agent',
        // Auth.userAuthenticate,
        Auth.storeDbInRequest,
        // Auth.checkCblAuthority,
        expressJoi({
            body: {
                gateway_unique_id:Joi.string().optional().allow(),
                amount: Joi.number().required(),
                phoneNumber:Joi.string().optional().allow(""),
                card_id:Joi.string().optional().allow(""),
                customer_payment_id:Joi.string().optional().allow(""),
                payment_token:Joi.string().optional().allow(""),
                invoiceId:Joi.string().optional().allow(""),
                currency:Joi.string().optional().allow(""),
                cartId:Joi.number().optional().allow(""),
                languageId:Joi.string().optional().allow(),
                user_id:Joi.number().required(),
                comment:Joi.string().optional().allow("")
            }
        }),
        Controller.walletController.addMoneyToAgentWallet
)


/**
 * @swagger
 *   /user/wallet/share:
 *   post:
 *     description: For adding money to user wallet
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: amount
 *         required: true
 *         type: string
 *       - in: formData
 *         name: user_email
 *         required: false
 *         type: number
 *       - in: formData
 *         name: phone_number
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/user/wallet/share',
        // Auth.userAuthenticate,
        Auth.storeDbInRequest,
        Auth.userAuthenticate,
        // Auth.checkCblAuthority,
        expressJoi({
            body: {
                amount: Joi.number().required(),
                user_email:Joi.string().optional().allow(""),
                countryCode:Joi.string().optional().allow(""),
                phone_number:Joi.string().optional().allow(""),
                comment:Joi.string().optional().allow("")
            }
        }),
        Controller.walletController.shareWalletMoney
)

/**
 * @swagger
 *   /agent/wallet/share:
 *   post:
 *     description: For adding money to agent wallet
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: amount
 *         required: true
 *         type: string
 *       - in: formData
 *         name: user_id
 *         required: true
 *         type: number
 *       - in: formData
 *         name: user_email
 *         required: false
 *         type: string
 *       - in: formData
 *         name: countryCode
 *         required: false
 *         type: string
 *       - in: formData
 *         name: phone_number
 *         required: false
 *         type: string
 *       - in: formData
 *         name: comment
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/agent/wallet/share',
        // Auth.userAuthenticate,
        Auth.storeDbInRequest1,
        //Auth.userAuthenticate,
        // Auth.checkCblAuthority,
        expressJoi({
            body: {
                amount: Joi.number().required(),
                user_id: Joi.number().required(),
                user_email:Joi.string().optional().allow(""),
                countryCode:Joi.string().optional().allow(""),
                phone_number:Joi.string().optional().allow(""),
                comment:Joi.string().optional().allow("")
            }
        }),
        Controller.walletController.agentShareWalletMoney
)


/**
 * @swagger
 * /user/wallet/transactions:
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
 *         name: skip
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/user/wallet/transactions',
Auth.userAuthenticate,
Auth.storeDbInRequest,
    expressJoi({
        query: 
        {  
            limit : Joi.number().required(),
            skip : Joi.number().required()
        }
    }),
    Controller.walletController.userWalletTransactions
)

/**
 * @swagger
 * /agent/wallet/transactions:
 *   get:
 *     description: 
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: user_id
 *         required: true
 *         type: number
 *       - in: query
 *         name: limit
 *         required: true
 *         type: number
 *       - in: query
 *         name: skip
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/agent/wallet/transactions',
// Auth.userAuthenticate,
Auth.storeDbInRequest1,
    expressJoi({
        query: 
        {   
            user_id : Joi.number().required(),
            limit : Joi.number().required(),
            skip : Joi.number().required()
        }
    }),
    Controller.walletController.agentWalletTransactions
)

/**
 * @swagger
 * /admin/user_wallet/transactions:
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
 *         name: skip
 *         required: true
 *         type: number
 *       - in: query
 *         name: user_id
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/admin/user_wallet/transactions',
// Auth.userAuthenticate,
Auth.storeDbInRequest,
    expressJoi({
        query: 
        {  
            limit : Joi.number().required(),
            skip : Joi.number().required(),
            user_id : Joi.number().required()
        }
    }),
    Controller.walletController.adminWalletTransactions
)


/**
 * @swagger
 * /user/aamarpay/getPaymentUrl:
 *   get:
 *     description: 
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         type: string
 *       - in: query
 *         name: name
 *         required: true
 *         type: string
 *       - in: query
 *         name: amount
 *         required: true
 *         type: number
 *       - in: query
 *         name: desc
 *         required: true
 *         type: string
 *       - in: query
 *         name: address
 *         required: true
 *         type: string
 *       - in: query
 *         name: phone
 *         required: true
 *         type: string
 *       - in: query
 *         name: success_url
 *         required: false
 *         type: string
 *       - in: query
 *         name: fail_url
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/user/aamarpay/getPaymentUrl',
//Auth.userAuthenticate,
Auth.storeDbInRequest,
    expressJoi({
        query: 
        {  
            desc:Joi.string().required(),
            email:Joi.string().required(),
            name:Joi.string().required(),
            amount:Joi.number().required(),
            address:Joi.string().required(),
            phone:Joi.string().required(),
            currency:Joi.string().required(),
            success_url:Joi.string().optional().allow(""),
            fail_url:Joi.string().optional().allow("")
        }
    }),
    Controller.UserPaymentController.getAmarPayUrl
)


/**
 * @swagger
 * /user/thawani/getPaymentUrl:
 *   get:
 *     description: 
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         type: string
 *       - in: query
 *         name: name
 *         required: true
 *         type: string
 *       - in: query
 *         name: amount
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/user/thawani/getPaymentUrl',
Auth.userAuthenticate,
Auth.storeDbInRequest,
    expressJoi({
        query: 
        {  
            email:Joi.string().required(),
            name:Joi.string().required(),
            phoneNumber:Joi.string().optional().allow(""),
            amount:Joi.string().required(),
            success_url:Joi.string().optional().allow(""),
            cancel_url : Joi.string().optional().allow("")
        }
    }),
    Controller.UserPaymentController.getthawaniUrlNew
)

/**
 * @swagger
 * /user/telr/getPaymentUrl:
 *   get:
 *     description: 
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         type: string
 *       - in: query
 *         name: name
 *         required: true
 *         type: string
 *       - in: query
 *         name: amount
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/user/telr/getPaymentUrl',
Auth.userAuthenticate,
Auth.storeDbInRequest,
    expressJoi({
        query: 
        {  
            amount:Joi.string().required(),
            desc:Joi.string().required(),
            currency:Joi.string().required(),
            success_url:Joi.string().optional().allow(""),
            cancel_url:Joi.string().optional().allow("")
        }
    }),
    Controller.UserPaymentController.getTelrUrl
)

/**
	 * @swagger
	 *   /user/hyperpay/getPaymentUrlId:
	 *   post:
	 *     description: For adding money to agent wallet
	 *     tags:
	 *       - App API`S
	 *     produces:
	 *       - application/json
	 *     parameters:
	 *       - in: body
	 *         name: amount
	 *         required: true
	 *         type: number
	 *       - in: body
	 *         name: currency
	 *         required: true
	 *         type: string
	 *     responses:
	 *       200:
	 *         description: encypt
	 *         schema:
	 *           $ref: '#/definitions/Stock'
	 */
	app.post(
		"/user/hyperpay/getPaymentUrlId",
		Auth.storeDbInRequest1,
		expressJoi({
			body: {
				amount: Joi.number().required(),
                currency: Joi.string().required(),
                is_mada_entity_id:Joi.number().optional().allow(0),
                email :Joi.string().optional().allow(""),
                street1 :Joi.string().optional().allow(""),
                city :Joi.string().optional().allow(""),
                state :Joi.string().optional().allow(""),
                country :Joi.string().optional().allow(""),
                postcode :Joi.string().optional().allow(""),
                givenName :Joi.string().optional().allow(""),
                surname :Joi.string().optional().allow("")
			},
		}),
		Controller.UserPaymentController.getHyperPayUrlId
  );
  
/**
	 * @swagger
	 *   /user/get_paymaya_url:
	 *   post:
	 *     description: For getting paymaya url
	 *     tags:
	 *       - App API`S
	 *     produces:
	 *       - application/json
	 *     parameters:
	 *       - in: formData
	 *         name: amount
	 *         required: true
	 *         type: number
	 *       - in: formData
	 *         name: currency
	 *         required: true
	 *         type: string
	 *     responses:
	 *       200:
	 *         description: encypt
	 *         schema:
	 *           $ref: '#/definitions/Stock'
	 */
	app.post(
		"/user/get_paymaya_url",
		Auth.storeDbInRequest1,
		expressJoi({
			body: {
				amount: Joi.number().required(),
                currency: Joi.string().required(),
                userId:Joi.number().required(),
                successUrl:Joi.string().required(),
                failureUrl:Joi.string().required()
			},
		}),
		Controller.UserPaymentController.getPayMayaUrl
  );
  /**
	 * @swagger
	 *   /user/atlantic/getForm:
	 *   post:
	 *     description: For getting paymaya url
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
    *                  type: number
    *                  required: true
    *              currency:
    *                  type: string
    *                  required: true
    *              payment_token:
    *                  type: string
    *                  required: true
    *              success_url:
    *                   type:string
    *                   required:false
	 *     responses:
	 *       200:
	 *         description: encypt
	 *         schema:
	 *           $ref: '#/definitions/Stock'
	 */
	app.post(
		"/user/atlantic/getForm",
		Auth.storeDbInRequest1,
		expressJoi({
			body: {
				amount: Joi.number().required(),
                currency: Joi.string().required(),
                successUrl:Joi.string().optional().allow(""),
                failureUrl:Joi.string().optional().allow(""),
                payment_token:Joi.string().required()
			},
		}),
		Controller.UserPaymentController.getAltanticEcommerce
  );

}