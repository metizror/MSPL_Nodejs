const Auth=require('../../lib/Auth')
// var category=require('../routes/category')
const Joi = require('joi')
const expressJoi = require('express-joi-validator');
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();
const deliveryCompanyCntrl = require('../../controller/admin/deliveryCompaniesController')
module.exports=(app)=>{
/**
 * @swagger
 * /admin/register_delivery_company:
 *   post:
 *     description: For Creating an new brands
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: name
 *         required: true
 *         type: string 
 *       - in: body
 *         name: image_url
 *         required: false
 *         type: string 
 *       - in: body
 *         name: logo_url
 *         required: false
 *         type: string 
 *       - in: body
 *         name: email
 *         required: true
 *         type: string 
 *       - in: body
 *         name: phone_number
 *         required: false
 *         type: string 
 *       - in: body
 *         name: country_code
 *         required: false
 *         type: string 
 *       - in: body
 *         name: password
 *         required: false
 *         type: string 
 *       - in: body
 *         name: address
 *         required: true
 *         type: string 
 *       - in: body
 *         name: latitude
 *         required: true
 *         type: number 
 *       - in: body
 *         name: longitude
 *         required: true
 *         type: number 
 *       - in: body
 *         name: delivery_radius
 *         required: true
 *         type: number 
 *       - in: body
 *         name: radius_price
 *         required: true
 *         type: number 
 *       - in: body
 *         name: base_delivery_charges
 *         required: false
 *         type: number 
 *       - in: body
 *         name: distance_value
 *         required: false
 *         type: number 
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/admin/register_delivery_company',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: {
    name:Joi.string().required(),

    first_name:Joi.string().required(),
    last_name:Joi.string().required(),
    license_number:Joi.string().optional().allow(""),
    designation:Joi.string().optional().allow(""),
    letter_of_intent:Joi.string().optional().allow(""),
    preferred_language:Joi.string().optional().allow(""),
    coverage_cities:Joi.string().optional().allow(""),
    more_information:Joi.string().optional().allow(""),

    license_image:Joi.string().optional().allow(""),

    type_of_deliveries_offered:Joi.number().optional().allow(0),
    booking_type:Joi.number().optional().allow(0),
    no_of_motorbike_controlled_temp:Joi.number().optional().allow(0),
    no_of_motorbike_non_controlled_temp:Joi.number().optional().allow(0),
    no_of_cars:Joi.number().optional().allow(0),
    no_of_vans_controlled_temp:Joi.number().optional().allow(0),
    no_of_vans_non_controlled_temp:Joi.number().optional().allow(0),


    image_url:Joi.string().optional().allow(""),
    logo_url:Joi.string().optional().allow(""),
    email : Joi.string().required(),
    password:Joi.string().optional().allow(""),
    phone_number:Joi.string().optional().allow(""),
    country_code:Joi.string().optional().allow(""),
    address:Joi.string().required(),
    latitude : Joi.number().required(),

    longitude:Joi.number().required(),
    delivery_radius:Joi.number().optional().allow(""),
    radius_price : Joi.number().optional().allow(""),

    base_delivery_charges:Joi.number().optional().allow(0),
    distance_value:Joi.number().optional().allow(0),
    iso:Joi.string().required()
    }
}),
deliveryCompanyCntrl.addDeliveryCompnay
)

/**
 * @swagger
 * /register_delivery_company:
 *   post:
 *     description: For Creating an new brands
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: name
 *         required: true
 *         type: string 
 *       - in: body
 *         name: image_url
 *         required: false
 *         type: string 
 *       - in: body
 *         name: logo_url
 *         required: false
 *         type: string 
 *       - in: body
 *         name: email
 *         required: true
 *         type: string 
 *       - in: body
 *         name: phone_number
 *         required: false
 *         type: string 
 *       - in: body
 *         name: country_code
 *         required: false
 *         type: string 
 *       - in: body
 *         name: password
 *         required: false
 *         type: string 
 *       - in: body
 *         name: address
 *         required: true
 *         type: string 
 *       - in: body
 *         name: latitude
 *         required: true
 *         type: number 
 *       - in: body
 *         name: longitude
 *         required: true
 *         type: number 
 *       - in: body
 *         name: delivery_radius
 *         required: true
 *         type: number 
 *       - in: body
 *         name: radius_price
 *         required: true
 *         type: number 
 *       - in: body
 *         name: base_delivery_charges
 *         required: false
 *         type: number 
 *       - in: body
 *         name: distance_value
 *         required: false
 *         type: number 
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/register_delivery_company',
Auth.storeDbInRequest,
expressJoi({body: {
    name:Joi.string().required(),

    first_name:Joi.string().required(),
    last_name:Joi.string().required(),
    license_number:Joi.string().optional().allow(""),
    designation:Joi.string().optional().allow(""),
    letter_of_intent:Joi.string().optional().allow(""),
    preferred_language:Joi.string().optional().allow(""),
    coverage_cities:Joi.string().optional().allow(""),
    more_information:Joi.string().optional().allow(""),

    license_image:Joi.string().optional().allow(""),

    type_of_deliveries_offered:Joi.number().optional().allow(0),
    booking_type:Joi.number().optional().allow(0),
    no_of_motorbike_controlled_temp:Joi.number().optional().allow(0),
    no_of_motorbike_non_controlled_temp:Joi.number().optional().allow(0),
    no_of_cars:Joi.number().optional().allow(0),
    no_of_vans_controlled_temp:Joi.number().optional().allow(0),
    no_of_vans_non_controlled_temp:Joi.number().optional().allow(0),


    image_url:Joi.string().optional().allow(""),
    logo_url:Joi.string().optional().allow(""),
    email : Joi.string().required(),
    password:Joi.string().optional().allow(""),
    phone_number:Joi.string().optional().allow(""),
    country_code:Joi.string().optional().allow(""),
    address:Joi.string().required(),
    latitude : Joi.number().required(),

    longitude:Joi.number().required(),
    delivery_radius:Joi.number().optional().allow(""),
    radius_price : Joi.number().optional().allow(""),

    base_delivery_charges:Joi.number().optional().allow(0),
    distance_value:Joi.number().optional().allow(0),
    iso:Joi.string().required()
    }
}),
deliveryCompanyCntrl.addDeliveryCompnay
)

/**
 * @swagger
 * /update_delivery_company:
 *   post:
 *     description: For Creating an new brands
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: name
 *         required: true
 *         type: string 
 *       - in: body
 *         name: image_url
 *         required: false
 *         type: string 
 *       - in: body
 *         name: logo_url
 *         required: false
 *         type: string 
 *       - in: body
 *         name: email
 *         required: true
 *         type: string 
 *       - in: body
 *         name: phone_number
 *         required: false
 *         type: string 
 *       - in: body
 *         name: country_code
 *         required: false
 *         type: string 
 *       - in: body
 *         name: address
 *         required: true
 *         type: string 
 *       - in: body
 *         name: latitude
 *         required: true
 *         type: number 
 *       - in: body
 *         name: longitude
 *         required: true
 *         type: number 
 *       - in: body
 *         name: delivery_radius
 *         required: true
 *         type: number 
 *       - in: body
 *         name: radius_price
 *         required: true
 *         type: number 
 *       - in: body
 *         name: base_delivery_charges
 *         required: false
 *         type: number 
 *       - in: body
 *         name: distance_value
 *         required: false
 *         type: number 
 *       - in: body
 *         name: id
 *         required: false
 *         type: number 
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/admin/update_delivery_company',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: {
    name:Joi.string().required(),
    image_url:Joi.string().optional().allow(),
    logo_url:Joi.string().optional().allow(""),
    email : Joi.string().required(),

    first_name:Joi.string().required(),
    last_name:Joi.string().required(),
    license_number:Joi.string().optional().allow(""),
    designation:Joi.string().optional().allow(""),
    letter_of_intent:Joi.string().optional().allow(""),
    preferred_language:Joi.string().optional().allow(""),
    coverage_cities:Joi.string().optional().allow(""),
    more_information:Joi.string().optional().allow(""),

    license_image:Joi.string().optional().allow(""),

    type_of_deliveries_offered:Joi.number().optional().allow(0),
    booking_type:Joi.number().optional().allow(0),
    no_of_motorbike_controlled_temp:Joi.number().optional().allow(0),
    no_of_motorbike_non_controlled_temp:Joi.number().optional().allow(0),
    no_of_cars:Joi.number().optional().allow(0),
    no_of_vans_controlled_temp:Joi.number().optional().allow(0),
    no_of_vans_non_controlled_temp:Joi.number().optional().allow(0),

    phone_number:Joi.string().optional().allow(""),
    country_code:Joi.string().optional().allow(""),
    address:Joi.string().required(),
    latitude : Joi.number().required(),

    longitude:Joi.number().required(),
    delivery_radius:Joi.number().optional().allow(0),
    radius_price : Joi.number().optional().allow(0),
    id : Joi.number().required(),

    base_delivery_charges:Joi.number().optional().allow(0),
    distance_value:Joi.number().optional().allow(0),
    iso:Joi.string().required()
    }
}),
deliveryCompanyCntrl.updateDeliveryCompnay
)


/**
 * @swagger
 * /update_delivery_company:
 *   post:
 *     description: For Creating an new brands
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: name
 *         required: true
 *         type: string 
 *       - in: body
 *         name: image_url
 *         required: false
 *         type: string 
 *       - in: body
 *         name: logo_url
 *         required: false
 *         type: string 
 *       - in: body
 *         name: email
 *         required: true
 *         type: string 
 *       - in: body
 *         name: phone_number
 *         required: false
 *         type: string 
 *       - in: body
 *         name: country_code
 *         required: false
 *         type: string 
 *       - in: body
 *         name: address
 *         required: true
 *         type: string 
 *       - in: body
 *         name: latitude
 *         required: true
 *         type: number 
 *       - in: body
 *         name: longitude
 *         required: true
 *         type: number 
 *       - in: body
 *         name: delivery_radius
 *         required: true
 *         type: number 
 *       - in: body
 *         name: radius_price
 *         required: true
 *         type: number 
 *       - in: body
 *         name: base_delivery_charges
 *         required: false
 *         type: number 
 *       - in: body
 *         name: distance_value
 *         required: false
 *         type: number 
 *       - in: body
 *         name: id
 *         required: false
 *         type: number 
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/update_delivery_company',
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
// Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
    name:Joi.string().required(),
    image_url:Joi.string().optional().allow(),
    logo_url:Joi.string().optional().allow(""),
    email : Joi.string().required(),

    first_name:Joi.string().required(),
    last_name:Joi.string().required(),
    license_number:Joi.string().optional().allow(""),
    designation:Joi.string().optional().allow(""),
    letter_of_intent:Joi.string().optional().allow(""),
    preferred_language:Joi.string().optional().allow(""),
    coverage_cities:Joi.string().optional().allow(""),
    more_information:Joi.string().optional().allow(""),

    license_image:Joi.string().optional().allow(""),

    type_of_deliveries_offered:Joi.number().optional().allow(0),
    booking_type:Joi.number().optional().allow(0),
    no_of_motorbike_controlled_temp:Joi.number().optional().allow(0),
    no_of_motorbike_non_controlled_temp:Joi.number().optional().allow(0),
    no_of_cars:Joi.number().optional().allow(0),
    no_of_vans_controlled_temp:Joi.number().optional().allow(0),
    no_of_vans_non_controlled_temp:Joi.number().optional().allow(0),

    phone_number:Joi.string().optional().allow(""),
    country_code:Joi.string().optional().allow(""),
    address:Joi.string().required(),
    latitude : Joi.number().required(),

    longitude:Joi.number().required(),
    delivery_radius:Joi.number().optional().allow(0),
    radius_price : Joi.number().optional().allow(0),
    id : Joi.number().required(),

    base_delivery_charges:Joi.number().optional().allow(0),
    distance_value:Joi.number().optional().allow(0),
    iso:Joi.string().required()
    }
}),
deliveryCompanyCntrl.updateDeliveryCompnay
)




/**
 * @swagger
 * /admin/block_unblock_delivery_company:
 *   post:
 *     description: For Creating an new brands
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: is_block
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
app.post('/admin/block_unblock_delivery_company',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: {
    is_block:Joi.number().required(),
    id : Joi.number().required()
    }
}),
deliveryCompanyCntrl.blockUnblockDeliveryCompnanies
)

/**
 * @swagger
 * /admin/verify_delivery_company:
 *   post:
 *     description: For Creating an new brands
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: is_verified
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
app.post('/admin/verify_delivery_company',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: {
    is_verified
    :Joi.number().required(),
    id : Joi.number().required()
    }
}),
deliveryCompanyCntrl.verifyDeliveryCompnanies
)

/**
 * @swagger
 * /admin/list_delivery_companies:
 *   get:
 *     description: For listing delivery companies
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
 *         name: supplier_id
 *         required: false
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/admin/list_delivery_companies',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({query: {
                limit:Joi.number().required(),
                skip:Joi.number().required(),
                search:Joi.string().optional().allow(""),
                supplier_id:Joi.number().optional().allow("")
               }
}),
deliveryCompanyCntrl.listDeliveryCompnanies
)

/**
 * @swagger
 * /admin/assign_delivery_company_to_supplier:
 *   post:
 *     description: For assign_delivery_company_to_supplier
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: supplierDeliveryCompanyIds
 *         required: true
 *         type: array
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/admin/assign_delivery_company_to_supplier',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: {
    supplierDeliveryCompanyIds: Joi.array().required()
    }
}),
deliveryCompanyCntrl.assignDeliveryCompanyToSuppliers
)

/**
 * @swagger
 * /admin/delivery_company/profile:
 *   get:
 *     description: For profile delivery companies
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: delivery_company_id 
 *         required: true
 *         type: number 
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/admin/delivery_company/profile',
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
// Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({query: {
    delivery_company_id:Joi.number().required()
               }
}),
deliveryCompanyCntrl.deliveryCompanyProfile
)

// /**
//  * @swagger
//  * /delivery_company/login:
//  *   post:
//  *     description: For assign_delivery_company_to_supplier
//  *     tags:
//  *       - delivery_company API`S
//  *     produces:
//  *       - application/json
//  *     parameters:
//  *       - in: body
//  *         name: supplierDeliveryCompanyIds
//  *         required: true
//  *         type: array
//  *     responses:
//  *       200:
//  *         description: encypt
//  *         schema:
//  *           $ref: '#/definitions/Stock'
//  */
// app.post('/delivery_company/login',
// // Auth.authenticateAccessToken,
// // Auth.checkforAuthorityofThisAdmin,
// // Auth.checkCblAuthority,
// Auth.storeDbInRequest,
// expressJoi({body: {
//     email: Joi.string().required(),
//     password: Joi.string().required(),
//     fcm_token: Joi.string().required()
//     }
// }),
// deliveryCompanyCntrl.deliveryCompanyLogin
// )

// /**
//  * @swagger
//  * /delivery_company/dashboard:
//  *   get:
//  *     description: For listing delivery companies
//  *     tags:
//  *       - Admin API`S
//  *     produces:
//  *       - application/json
//  *     parameters:
//  *       - in: query
//  *         name: delivery_company_id 
//  *         required: true
//  *         type: number 
//  *     responses:
//  *       200:
//  *         description: encypt
//  *         schema:
//  *           $ref: '#/definitions/Stock'
//  */
// app.get('/delivery_company/dashboard',
// // Auth.authenticateAccessToken,
// // Auth.checkforAuthorityofThisAdmin,
// // Auth.checkCblAuthority,
// Auth.storeDbInRequest,
// expressJoi({query: {
//     delivery_company_id:Joi.number().required()
//                }
// }),
// deliveryCompanyCntrl.dashboard
// )

}