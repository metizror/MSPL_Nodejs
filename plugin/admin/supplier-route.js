
var supplierController = require('../../controller/admin/SupplierController')
var Auth=require('../../lib/Auth')
var category=require('../../routes/category')
const Joi = require('joi')
const universal = require('../../util/Universal')
const expressJoi = require('express-joi-validator');
var multipart = require('connect-multiparty');
const { join } = require('lodash');
var multipartMiddleware = multipart();
const Controller=require('../../controller')
module.exports=(app)=>{
 /**
 * @swagger
 * /admin/supplier_listing:
 *   get:
 *     description: For listing of suppliers
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
 *       - in: query
 *         name: order_by
 *         required: true
 *         type: number
 *       - in: query
 *         name: is_desc
 *         required: true
 *         type: number
 *       - in: query
 *         name: search
 *         required: false
 *         type: string
 *       - in: query
 *         name: is_active
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/admin/supplier_listing',
multipartMiddleware,
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({query: {
    limit:Joi.number().required(),
    offset:Joi.number().required(),
    order_by: Joi.number().required(),
    is_desc : Joi.number().required(),
    search : Joi.string().optional().allow(""),
    country_code : Joi.string().optional().allow(""),
    country_code_type : Joi.string().optional().allow(""),
    is_active : Joi.string().required(),
    is_out_network:Joi.number().optional().allow(""),
    is_stripe_connected:Joi.number().optional().allow(0),
    sequence_wise:Joi.number().optional().allow(0),
    language_id:Joi.number().optional().allow("")
    }
}),
supplierController.listSuppliers
)
 /**
 * @swagger
 * /admin/all/supplier_listing:
 *   get:
 *     description: For listing of suppliers
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/admin/all/supplier_listing',
multipartMiddleware,
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
supplierController.listAllSuppliers
)


/**
 * @swagger
 * /admin/add_supplier_area:
 *   post:
 *     description: For updating users
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: formData
 *          name: user_id
 *          required: true
 *          type: number
 *        - in: formData
 *          name: password
 *          required: true
 *          type: string
 *        - in: formData
 *          name: confirm_password
 *          required: false
 *          type: string
 *     responses:
*       200:
 *         description: Success!
 */
app.post('/admin/add_supplier_area',
multipartMiddleware,
Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
// expressJoi({body: {
//                 user_id:Joi.number().required(),
//                 password : Joi.string().required(),
//                 confirm_password:Joi.string().required()
//     }
// }),
supplierController.addSupplierGeoFence
)
/**
 * @swagger
 * /admin/update_supplier_area:
 *   post:
 *     description: For updating users
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: formData
 *          name: user_id
 *          required: true
 *          type: number
 *        - in: formData
 *          name: password
 *          required: true
 *          type: string
 *        - in: formData
 *          name: confirm_password
 *          required: false
 *          type: string
 *     responses:
*       200:
 *         description: Success!
 */
app.post('/admin/update_supplier_area',
multipartMiddleware,
Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
// expressJoi({body: {
//                 user_id:Joi.number().required(),
//                 password : Joi.string().required(),
//                 confirm_password:Joi.string().required()
//     }
// }),
supplierController.updateSupplierGeoFence
)

/**
 * @swagger
 * /admin/delete_supplier_area:
 *   post:
 *     description: For updating users
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: formData
 *          name: user_id
 *          required: true
 *          type: number
 *        - in: formData
 *          name: password
 *          required: true
 *          type: string
 *        - in: formData
 *          name: confirm_password
 *          required: false
 *          type: string
 *     responses:
*       200:
 *         description: Success!
 */
app.post('/admin/delete_supplier_area',
multipartMiddleware,
Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
// expressJoi({body: {
//                 user_id:Joi.number().required(),
//                 password : Joi.string().required(),
//                 confirm_password:Joi.string().required()
//     }
// }),
supplierController.deleteSupplierGeoFence
)

/**
 * @swagger
 * /admin/list_supplier_area:
 *   get:
 *     description: For updating users
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: formData
 *          name: user_id
 *          required: true
 *          type: number
 *        - in: formData
 *          name: password
 *          required: true
 *          type: string
 *        - in: formData
 *          name: confirm_password
 *          required: false
 *          type: string
 *     responses:
*       200:
 *         description: Success!
 */
app.get('/admin/list_supplier_area',
multipartMiddleware,
Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
// expressJoi({body: {
//                 user_id:Joi.number().required(),
//                 password : Joi.string().required(),
//                 confirm_password:Joi.string().required()
//     }
// }),
supplierController.listSupplierGeoFence
)


/**
 * @swagger
 * /supplier/add_supplier_area:
 *   post:
 *     description: For updating users
 *     tags:
 *       - Supplier API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: formData
 *          name: user_id
 *          required: true
 *          type: number
 *        - in: formData
 *          name: password
 *          required: true
 *          type: string
 *        - in: formData
 *          name: confirm_password
 *          required: false
 *          type: string
 *     responses:
*       200:
 *         description: Success!
 */
app.post('/supplier/add_supplier_area',
multipartMiddleware,
Auth.supplierAuth,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
// expressJoi({body: {
//                 user_id:Joi.number().required(),
//                 password : Joi.string().required(),
//                 confirm_password:Joi.string().required()
//     }
// }),
supplierController.addSupplierGeoFence
)
/**
 * @swagger
 * /supplier/update_supplier_area:
 *   post:
 *     description: For updating users
 *     tags:
 *       - Supplier API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: formData
 *          name: user_id
 *          required: true
 *          type: number
 *        - in: formData
 *          name: password
 *          required: true
 *          type: string
 *        - in: formData
 *          name: confirm_password
 *          required: false
 *          type: string
 *     responses:
*       200:
 *         description: Success!
 */
app.post('/supplier/update_supplier_area',
multipartMiddleware,
Auth.supplierAuth,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
// expressJoi({body: {
//                 user_id:Joi.number().required(),
//                 password : Joi.string().required(),
//                 confirm_password:Joi.string().required()
//     }
// }),
supplierController.updateSupplierGeoFence
)

/**
 * @swagger
 * /supplier/delete_supplier_area:
 *   post:
 *     description: For updating users
 *     tags:
 *       - Supplier API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: formData
 *          name: user_id
 *          required: true
 *          type: number
 *        - in: formData
 *          name: password
 *          required: true
 *          type: string
 *        - in: formData
 *          name: confirm_password
 *          required: false
 *          type: string
 *     responses:
*       200:
 *         description: Success!
 */
app.post('/supplier/delete_supplier_area',
multipartMiddleware,
Auth.supplierAuth,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
// expressJoi({body: {
//                 user_id:Joi.number().required(),
//                 password : Joi.string().required(),
//                 confirm_password:Joi.string().required()
//     }
// }),
supplierController.deleteSupplierGeoFence
)

/**
 * @swagger
 * /supplier/list_supplier_area:
 *   get:
 *     description: For updating users
 *     tags:
 *       - Supplier API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: formData
 *          name: user_id
 *          required: true
 *          type: number
 *        - in: formData
 *          name: password
 *          required: true
 *          type: string
 *        - in: formData
 *          name: confirm_password
 *          required: false
 *          type: string
 *     responses:
*       200:
 *         description: Success!
 */
app.get('/supplier/list_supplier_area',
multipartMiddleware,
Auth.supplierAuth,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
// expressJoi({body: {
//                 user_id:Joi.number().required(),
//                 password : Joi.string().required(),
//                 confirm_password:Joi.string().required()
//     }
// }),
supplierController.listSupplierGeoFence
)

/**
 * @swagger
 * /admin/supplier_set_availability:
 *   post:
 *     description: api used for set an supplier availability
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: body
 *          required: false
 *          schema:
 *            type: object
 *            properties: 
 *              sectionId:
 *                  type: number
 *                  required: true
 *              supplier_id:
 *                  type: number
 *                  required: true
 *              date_order_type:
 *                  type: number
 *                  required: true
 *              supplier_location_id:
 *                  type: number
 *                  required: true
 *              offset:
 *                  type: string
 *                  required: true   
 *              interval:
 *                  type: string
 *                  required: false  
 *              weeks_data:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                   day_id:
 *                     type: number
 *                   status:
 *                     type: number
 *              supplier_timings:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                   start_time:
 *                     type: string
 *                   end_time:
 *                     type: string
 *                   day_id:
 *                     type: number
 *                   price:
 *                     type: number
 *                   quantity:
 *                     type: number
 *              supplier_available_dates:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                   from_date:
 *                     type: string
 *                   to_date:
 *                     type: string
 *                   status:
 *                     type: string
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/admin/supplier_set_availability',
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
            sectionId:Joi.number().required(),
            supplier_id:Joi.number().required(),
            date_order_type:Joi.number().required(),
            supplier_location_id:Joi.number().required(),
            weeks_data:Joi.array().items(
                Joi.object().keys({
                    day_id:Joi.number().valid([0,1,2,3,4,5,6]).required(),
                    status:Joi.number().required()
                }).unknown(true)
            ).min(7).unique().required(),
            supplier_timings:Joi.array().items(
                Joi.object().keys({
                start_time:Joi.string().required(),
                end_time:Joi.string().required(),
                quantity:Joi.number().optional().allow(""),
                price:Joi.number().optional().allow(""),
                day_id:Joi.number().valid([0,1,2,3,4,5,6]).optional().allow(""),
            }).unknown(true)
            ).min(1).unique().required(),
            supplier_available_dates:Joi.array().items(
                Joi.object().keys({
                    from_date:Joi.string().required(),
                    to_date:Joi.string().required(),
                    status:Joi.number().required()
                }).unknown(true)
            ).required(),   
            offset:Joi.string().required(),
            supplier_slots_interval : Joi.number().optional().allow("")
    }
}),
supplierController.AddSupplierAvailability
)

/**
 * @swagger
 * /admin/supplier_update_availability:
 *   post:
 *     description: api used for update an agent availability
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: body
 *          required: false
 *          schema:
 *            type: object
 *            properties: 
 *              sectionId:
 *                  type: number
 *                  required: true
 *              supplier_id:
 *                  type: number
 *                  required: true
 *              date_order_type:
 *                  type: number
 *                  required: true
 *              supplier_location_id:
 *                  type: number
 *                  required: true
 *              offset:
 *                  type: string
 *                  required: true    
 *              interval:
 *                  type: string
 *                  required: false  
 *              weeks_data:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                   day_id:
 *                     type: number
 *                   status:
 *                     type: number
 *              supplier_timings:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                   start_time:
 *                     type: string
 *                   end_time:
 *                     type: string
 *                   id:
 *                     type: string
 *                   day_id:
 *                     type: number
 *                   price:
 *                     type: number
 *                   quantity:
 *                     type: number
 *              supplier_available_dates:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                   from_date:
 *                     type: string
 *                   to_date:
 *                     type: string
 *                   status:
 *                     type: string
 *                   id:
 *                     type: string
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/admin/supplier_update_availability',
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
            sectionId:Joi.number().required(),
            supplier_id:Joi.number().required(),
            date_order_type:Joi.number().required(),
            supplier_location_id:Joi.number().required(),
            weeks_data:Joi.array().items(
                Joi.object().keys({
                    id:Joi.number().required(),
                    status:Joi.number().required()
                }).unknown(true)
            ).optional().allow(""),
            supplier_timings:Joi.array().items(
                Joi.object().keys({
                        id:Joi.number().optional().allow(""),
                        start_time:Joi.string().required(),
                        end_time:Joi.string().required(),
                        quantity:Joi.number().optional().allow(""),
                        price:Joi.number().optional().allow(""),
                        day_id:Joi.number().valid([0,1,2,3,4,5,6]).optional().allow(""),
                }).unknown(true)
            ).optional().allow(""),
            supplier_available_dates:Joi.array().items(
                Joi.object().keys({
                    id:Joi.number().optional().allow(""),
                    from_date:Joi.string().required(),
                    to_date:Joi.string().required(),
                    status:Joi.number().required()
                }).unknown(true)
            ).required(),                  
            offset:Joi.string().required(),
            supplier_slots_interval : Joi.number().optional().allow("")
    }
}),
supplierController.UpdateSupplierAvailability
)

/**
 * @swagger
 * /admin/get_supplier_availability:
 *   get:
 *     description: api for getting agent token ( date_order_type - 0 for default 1 for delivery 2 for pickup 3 for dining)
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: supplier_id
 *         required: false
 *         type: number
 *       - in: query
 *         name: date_order_type
 *         required: false
 *         type: number
 *       - in: query
 *         name: supplier_location_id
 *         required: false
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/admin/get_supplier_availability',
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({query: 
    {
        supplier_id:Joi.number().required(),
        date_order_type:Joi.number().required(),
        supplier_location_id:Joi.number().optional().allow(0)
    }
}),
supplierController.GetSupplierAvailability
)

/**
 * @swagger
 * /admin/add_supplier_order_geofence:
 *   post:
 *     description: For updating users
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: formData
 *          name: supplier_id
 *          required: true
 *          type: number
 *        - in: formData
 *          name: coordinates
 *          required: true
 *          type: string
 *     responses:
*       200:
 *         description: Success!
 */
app.post('/admin/add_supplier_order_geofence',
multipartMiddleware,
Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
// expressJoi({body: {
//                 user_id:Joi.number().required(),
//                 password : Joi.string().required(),
//                 confirm_password:Joi.string().required()
//     }
// }),
supplierController.addSupplierOrderGeoFence
)

/**
 * @swagger
 * /admin/update_supplier_order_geofence:
 *   post:
 *     description: For updating users
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: formData
 *          name: user_id
 *          required: true
 *          type: number
 *        - in: formData
 *          name: password
 *          required: true
 *          type: string
 *        - in: formData
 *          name: confirm_password
 *          required: false
 *          type: string
 *     responses:
*       200:
 *         description: Success!
 */
app.post('/admin/update_supplier_order_geofence',
multipartMiddleware,
Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
// expressJoi({body: {
//                 user_id:Joi.number().required(),
//                 password : Joi.string().required(),
//                 confirm_password:Joi.string().required()
//     }
// }),
supplierController.updateSupplierOrderGeoFence
)

/**
 * @swagger
 * /admin/delete_supplier_order_geofence:
 *   post:
 *     description: For updating users
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: formData
 *          name: user_id
 *          required: true
 *          type: number
 *        - in: formData
 *          name: password
 *          required: true
 *          type: string
 *        - in: formData
 *          name: confirm_password
 *          required: false
 *          type: string
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/admin/delete_supplier_order_geofence',
multipartMiddleware,
Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
// expressJoi({body: {
//                 user_id:Joi.number().required(),
//                 password : Joi.string().required(),
//                 confirm_password:Joi.string().required()
//     }
// }),
supplierController.deleteSupplierOrderGeoFence
)

/**
 * @swagger
 * /admin/list_supplier_order_geofence:
 *   get:
 *     description: For updating users
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: formData
 *          name: user_id
 *          required: true
 *          type: number
 *        - in: formData
 *          name: password
 *          required: true
 *          type: string
 *        - in: formData
 *          name: confirm_password
 *          required: false
 *          type: string
 *     responses:
*       200:
 *         description: Success!
 */
app.get('/admin/list_supplier_order_geofence',
multipartMiddleware,
Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
// expressJoi({body: {
//                 user_id:Joi.number().required(),
//                 password : Joi.string().required(),
//                 confirm_password:Joi.string().required()
//     }
// }),
supplierController.listSupplierOrderGeoFence
)

/**
 * @swagger
 * /admin/delete_supplier_slots:
 *   put:
 *     description: For updating users
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: formData
 *          name: user_id
 *          required: true
 *          type: number
 *        - in: formData
 *          name: password
 *          required: true
 *          type: string
 *        - in: formData
 *          name: confirm_password
 *          required: false
 *          type: string
 *     responses:
*       200:
 *         description: Success!
 */
app.put('/admin/delete_supplier_slots',
multipartMiddleware,
Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
// expressJoi({body: {
//                 user_id:Joi.number().required(),
//                 password : Joi.string().required(),
//                 confirm_password:Joi.string().required()
//     }
// }),
supplierController.deleteSlotsTimings
)


/**
 * @swagger
 * /supplier/supplier_set_availability:
 *   post:
 *     description: api used for set an supplier availability
 *     tags:
 *       - supplier API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: body
 *          required: false
 *          schema:
 *            type: object
 *            properties: 
 *              sectionId:
 *                  type: number
 *                  required: true
 *              supplier_id:
 *                  type: number
 *                  required: true
 *              date_order_type:
 *                  type: number
 *                  required: true
 *              supplier_location_id:
 *                  type: number
 *                  required: true
 *              offset:
 *                  type: string
 *                  required: true   
 *              interval:
 *                  type: string
 *                  required: false  
 *              weeks_data:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                   day_id:
 *                     type: number
 *                   status:
 *                     type: number
 *              supplier_timings:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                   start_time:
 *                     type: string
 *                   end_time:
 *                     type: string
 *                   day_id:
 *                     type: number
 *                   price:
 *                     type: number
 *                   quantity:
 *                     type: number
 *              supplier_available_dates:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                   from_date:
 *                     type: string
 *                   to_date:
 *                     type: string
 *                   status:
 *                     type: string
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/supplier/supplier_set_availability',
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
            sectionId:Joi.number().required(),
            supplier_id:Joi.number().required(),
            date_order_type:Joi.number().required(),
            supplier_location_id:Joi.number().required(),
            weeks_data:Joi.array().items(
                Joi.object().keys({
                    day_id:Joi.number().valid([0,1,2,3,4,5,6]).required(),
                    status:Joi.number().required()
                }).unknown(true)
            ).min(7).unique().required(),
            supplier_timings:Joi.array().items(
                Joi.object().keys({
                start_time:Joi.string().required(),
                end_time:Joi.string().required(),
                quantity:Joi.number().optional().allow(""),
                price:Joi.number().optional().allow(""),
                day_id:Joi.number().valid([0,1,2,3,4,5,6]).optional().allow(""),
            }).unknown(true)
            ).min(1).unique().required(),
            supplier_available_dates:Joi.array().items(
                Joi.object().keys({
                    from_date:Joi.string().required(),
                    to_date:Joi.string().required(),
                    status:Joi.number().required()
                }).unknown(true)
            ).required(),   
            offset:Joi.string().required(),
            supplier_slots_interval : Joi.number().optional().allow("")
    }
}),
supplierController.AddSupplierAvailability
)

/**
 * @swagger
 * /supplier/supplier_update_availability:
 *   post:
 *     description: api used for update an agent availability
 *     tags:
 *       - supplier API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: body
 *          required: false
 *          schema:
 *            type: object
 *            properties: 
 *              sectionId:
 *                  type: number
 *                  required: true
 *              supplier_id:
 *                  type: number
 *                  required: true
 *              date_order_type:
 *                  type: number
 *                  required: true
 *              supplier_location_id:
 *                  type: number
 *                  required: true
 *              offset:
 *                  type: string
 *                  required: true    
 *              interval:
 *                  type: string
 *                  required: false  
 *              weeks_data:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                   day_id:
 *                     type: number
 *                   status:
 *                     type: number
 *              supplier_timings:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                   start_time:
 *                     type: string
 *                   end_time:
 *                     type: string
 *                   id:
 *                     type: string
 *                   day_id:
 *                     type: number
 *                   price:
 *                     type: number
 *                   quantity:
 *                     type: number
 *              supplier_available_dates:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                   from_date:
 *                     type: string
 *                   to_date:
 *                     type: string
 *                   status:
 *                     type: string
 *                   id:
 *                     type: string
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/supplier/supplier_update_availability',
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
            sectionId:Joi.number().required(),
            supplier_id:Joi.number().required(),
            date_order_type:Joi.number().required(),
            supplier_location_id:Joi.number().required(),
            weeks_data:Joi.array().items(
                Joi.object().keys({
                    id:Joi.number().required(),
                    status:Joi.number().required()
                }).unknown(true)
            ).optional().allow(""),
            supplier_timings:Joi.array().items(
                Joi.object().keys({
                        id:Joi.number().optional().allow(""),
                        start_time:Joi.string().required(),
                        end_time:Joi.string().required(),
                        quantity:Joi.number().optional().allow(""),
                        price:Joi.number().optional().allow(""),
                        day_id:Joi.number().valid([0,1,2,3,4,5,6]).optional().allow(""),
                }).unknown(true)
            ).optional().allow(""),
            supplier_available_dates:Joi.array().items(
                Joi.object().keys({
                    id:Joi.number().optional().allow(""),
                    from_date:Joi.string().required(),
                    to_date:Joi.string().required(),
                    status:Joi.number().required()
                }).unknown(true)
            ).required(),                  
            offset:Joi.string().required(),
            supplier_slots_interval : Joi.number().optional().allow("")
    }
}),
supplierController.UpdateSupplierAvailability
)

/**
 * @swagger
 * /supplier/get_supplier_availability:
 *   get:
 *     description: api for getting agent token ( date_order_type - 0 for default 1 for delivery 2 for pickup 3 for dining)
 *     tags:
 *       - supplier API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: supplier_id
 *         required: false
 *         type: number
 *       - in: query
 *         name: date_order_type
 *         required: false
 *         type: number
 *       - in: query
 *         name: supplier_location_id
 *         required: false
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/supplier/get_supplier_availability',
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({query: 
    {
        supplier_id:Joi.number().required(),
        date_order_type:Joi.number().required(),
        supplier_location_id:Joi.number().optional().allow(0)
    }
}),
supplierController.GetSupplierAvailability
)

/**
 * @swagger
 * /supplier/add_supplier_order_geofence:
 *   post:
 *     description: For updating users
 *     tags:
 *       - supplier API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: formData
 *          name: supplier_id
 *          required: true
 *          type: number
 *        - in: formData
 *          name: coordinates
 *          required: true
 *          type: string
 *     responses:
*       200:
 *         description: Success!
 */
app.post('/supplier/add_supplier_order_geofence',
multipartMiddleware,
Auth.adminSupplierBranchAuth,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
// expressJoi({body: {
//                 user_id:Joi.number().required(),
//                 password : Joi.string().required(),
//                 confirm_password:Joi.string().required()
//     }
// }),
supplierController.addSupplierOrderGeoFence
)

/**
 * @swagger
 * /supplier/update_supplier_order_geofence:
 *   post:
 *     description: For updating users
 *     tags:
 *       - supplier API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: formData
 *          name: user_id
 *          required: true
 *          type: number
 *        - in: formData
 *          name: password
 *          required: true
 *          type: string
 *        - in: formData
 *          name: confirm_password
 *          required: false
 *          type: string
 *     responses:
*       200:
 *         description: Success!
 */
app.post('/supplier/update_supplier_order_geofence',
multipartMiddleware,
Auth.adminSupplierBranchAuth,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
// expressJoi({body: {
//                 user_id:Joi.number().required(),
//                 password : Joi.string().required(),
//                 confirm_password:Joi.string().required()
//     }
// }),
supplierController.updateSupplierOrderGeoFence
)

/**
 * @swagger
 * /supplier/delete_supplier_order_geofence:
 *   post:
 *     description: For updating users
 *     tags:
 *       - supplier API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: formData
 *          name: user_id
 *          required: true
 *          type: number
 *        - in: formData
 *          name: password
 *          required: true
 *          type: string
 *        - in: formData
 *          name: confirm_password
 *          required: false
 *          type: string
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/supplier/delete_supplier_order_geofence',
multipartMiddleware,
Auth.adminSupplierBranchAuth,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
// expressJoi({body: {
//                 user_id:Joi.number().required(),
//                 password : Joi.string().required(),
//                 confirm_password:Joi.string().required()
//     }
// }),
supplierController.deleteSupplierOrderGeoFence
)

/**
 * @swagger
 * /supplier/list_supplier_order_geofence:
 *   get:
 *     description: For updating users
 *     tags:
 *       - Supplier API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: formData
 *          name: user_id
 *          required: true
 *          type: number
 *        - in: formData
 *          name: password
 *          required: true
 *          type: string
 *        - in: formData
 *          name: confirm_password
 *          required: false
 *          type: string
 *     responses:
*       200:
 *         description: Success!
 */
app.get('/supplier/list_supplier_order_geofence',
multipartMiddleware,
Auth.adminSupplierBranchAuth,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
// expressJoi({body: {
//                 user_id:Joi.number().required(),
//                 password : Joi.string().required(),
//                 confirm_password:Joi.string().required()
//     }
// }),
supplierController.listSupplierOrderGeoFence
)

/**
 * @swagger
 * /supplier/delete_supplier_slots:
 *   post:
 *     description: For updating users
 *     tags:
 *       - Supplier API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: formData
 *          name: user_id
 *          required: true
 *          type: number
 *        - in: formData
 *          name: password
 *          required: true
 *          type: string
 *        - in: formData
 *          name: confirm_password
 *          required: false
 *          type: string
 *     responses:
*       200:
 *         description: Success!
 */
app.post('/supplier/delete_supplier_slots',
multipartMiddleware,
Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
// expressJoi({body: {
//                 user_id:Joi.number().required(),
//                 password : Joi.string().required(),
//                 confirm_password:Joi.string().required()
//     }
// }),
supplierController.deleteSlotsTimings
)

/**
 * @swagger
 * /supplier/updation_request:
 *   post:
 *     description: For updating supplier request
 *     tags:
 *       - Supplier API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: formData
 *          name: user_id
 *          required: true
 *          type: number
 *        - in: formData
 *          name: password
 *          required: true
 *          type: string
 *        - in: formData
 *          name: confirm_password
 *          required: false
 *          type: string
 *     responses:
*       200:
 *         description: Success!
 */
app.post('/supplier/updation_request',
multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.storeDbInRequest,
expressJoi({body: {
                supplierName:Joi.string().required(),
                supplierEmail : Joi.string().required(),
                supplierMobileNo:Joi.string().required(),
                delivery_radius:Joi.number().required(),
                supplierAddress:Joi.string().required(),
                radius_price:Joi.number().required(),
                latitude : Joi.number().required(),
                longitude:Joi.number().required(),
                commission:Joi.number().required(),
                min_order:Joi.number().optional().allow(0),
                
                self_pickup:Joi.number().required(),
                country_code:Joi.string().required(),
                
                distance_value:Joi.number().required(),
                payment_method:Joi.number().required(),
                supplier_id:Joi.number().required(),
                iso : Joi.string().required(),
                updationRequestId: Joi.number().optional().allow(0),

                base_delivery_charges:Joi.number().optional().allow(0),
                pickupCommision : Joi.number().optional().allow(0),
                is_dine_in:Joi.number().optional().allow(0),
                is_scheduled:Joi.number().optional().allow(0),
                is_user_service_charge_flat:Joi.number().optional().allow(0),
                is_own_delivery:Joi.number().optional().allow(0),
                table_booking_price:Joi.number().optional().allow(0),
                table_booking_discount:Joi.number().optional().allow(0),

                

                speciality: Joi.string().optional().allow(""),
                nationality: Joi.string().optional().allow(""),
                facebook_link: Joi.string().optional().allow(""),
                linkedin_link: Joi.string().optional().allow(""),
                brand: Joi.string().optional().allow(""),
                license_number:Joi.string().optional().allow(""),
                description : Joi.string().optional().allow(""),
                user_service_charge:Joi.number().optional().allow(0),
                logo : Joi.string().optional().allow("")
    }
}),
supplierController.addSupplierUpdationRequest
)


/**
 * @swagger
 * /supplier/updation_product_request:
 *   post:
 *     description: For updating supplier request
 *     tags:
 *       - Supplier API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: formData
 *          name: user_id
 *          required: true
 *          type: number
 *        - in: formData
 *          name: password
 *          required: true
 *          type: string
 *        - in: formData
 *          name: confirm_password
 *          required: false
 *          type: string
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/supplier/updation_product_request',
multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.storeDbInRequest,
expressJoi({body: {
                name:Joi.string().required(),
                description:Joi.string().required(),
                priceUnit : Joi.string().required(),
                measuringUnit:Joi.string().required(),
                commissionPackage:Joi.number().required(),
                commission:Joi.string().required(),
                barCode:Joi.number().required(),
                count : Joi.number().required(),
                imagePath:Joi.number().required(),
                quantity:Joi.number().required(),
                
                brand_id:Joi.number().required(),
                pricing_type:Joi.number().required(),
                
                is_product:Joi.number().required(),
                payment_after_confirmation:Joi.number().required(),
                cart_image_upload:Joi.number().required(),
                making_price : Joi.string().required(),
                product_tags: Joi.array().optional().allow([]),

                variant:Joi.array().optional().allow([]),
                is_updation_vendor_request : Joi.number().optional().allow(0)
    }
}),
supplierController.addSupplierUpdationRequest
)


/**
 * @swagger
 * /supplier/approve_supplier_updation_request:
 *   post:
 *     description: For updating supplier request
 *     tags:
 *       - Supplier API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: formData
 *          name: user_id
 *          required: true
 *          type: number
 *        - in: formData
 *          name: password
 *          required: true
 *          type: string
 *        - in: formData
 *          name: confirm_password
 *          required: false
 *          type: string
 *     responses:
*       200:
 *         description: Success!
 */
app.post('/admin/approve_supplier_updation_request',
multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.storeDbInRequest,
expressJoi({body: {
        updationRequestId:Joi.number().required(),
        update_request_approved:Joi.number().optional().allow(0)
    }
}),
supplierController.approveSupplierUpdationRequest
)


/**
 * @swagger
 * /user/list_supplier_slots:
 *   get:
 *     description: For getting supplier slots
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: formData
 *          name: supplier_id
 *          required: true
 *          type: number
 *        - in: formData
 *          name: date
 *          required: true
 *          type: string
 *        - in: formData
 *          name: date_order_type
 *          required: false
 *          type: number
 *        - in: formData
 *          name: latitude
 *          required: false
 *          type: number
 *        - in: formData
 *          name: longitude
 *          required: false
 *          type: number
 *     responses:
*       200:
 *         description: Success!
 */
app.get('/user/list_supplier_slots',
// multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({query: {
                supplier_id:Joi.number().required(),
                date : Joi.string().required(),
                date_order_type:Joi.number().required(),
                latitude : Joi.number().required(),
                longitude:Joi.number().required(),
                seating_capacity: Joi.number().optional().allow(0),
                branch_id : Joi.number().optional().allow(0),
    }
}),
supplierController.getSupplierSlots
)


/**
 * @swagger
 * /admin/list_supplier_updation_requests:
 *   get:
 *     description: For getting supplier updation requests
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: query
 *          name: limit
 *          required: true
 *          type: number
 *        - in: query
 *          name: skip
 *          required: true
 *          type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.get('/admin/list_supplier_updation_requests',
Auth.storeDbInRequest,
expressJoi({query: {
                limit:Joi.number().required(),
                skip : Joi.number().required()
    }
}),
supplierController.getSupplierUpdationRequests
)

/**
 * @swagger
 * /supplier/updation_request:
 *   get:
 *     description: For getting supplier updation requests
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: query
 *          name: limit
 *          required: true
 *          type: number
 *        - in: query
 *          name: skip
 *          required: true
 *          type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.get('/supplier/updation_request',
Auth.storeDbInRequest,
expressJoi({query: {
                limit:Joi.number().required(),
                skip : Joi.number().required(),
                supplier_id:Joi.number().required()
    }
}),
supplierController.getSupplierUpdationRequestsBySupplier
)



/**
 * @swagger
 * /user/list_supplier_slots/v1:
 *   get:
 *     description: For getting supplier slots
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: formData
 *          name: supplier_id
 *          required: true
 *          type: number
 *        - in: formData
 *          name: date
 *          required: true
 *          type: string
 *        - in: formData
 *          name: date_order_type
 *          required: false
 *          type: number
 *        - in: formData
 *          name: latitude
 *          required: false
 *          type: number
 *        - in: formData
 *          name: longitude
 *          required: false
 *          type: number
 *     responses:
*       200:
 *         description: Success!
 */
app.get('/user/list_supplier_slots/v1',
// multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({query: {
                supplier_id:Joi.number().required(),
                date : Joi.string().required(),
                date_order_type:Joi.number().required(),
                latitude : Joi.number().required(),
                longitude:Joi.number().required(),
                seating_capacity: Joi.number().optional().allow(0),
                branch_id : Joi.number().optional().allow(0),
                offset : Joi.string().optional().allow("")
    }
}),
supplierController.getSupplierSlots
)




/**
 * @swagger
 * /user/list_supplier_slots/v2:
 *   get:
 *     description: For getting supplier slots
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: formData
 *          name: supplier_id
 *          required: true
 *          type: number
 *        - in: formData
 *          name: date
 *          required: true
 *          type: string
 *        - in: formData
 *          name: date_order_type
 *          required: false
 *          type: number
 *        - in: formData
 *          name: latitude
 *          required: false
 *          type: number
 *        - in: formData
 *          name: longitude
 *          required: false
 *          type: number
 *     responses:
*       200:
 *         description: Success!
 */
app.get('/user/list_supplier_slots/v2',
// multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({query: {
                supplier_id:Joi.number().required(),
                date : Joi.string().required(),
                date_order_type:Joi.number().required(),
                latitude : Joi.number().required(),
                longitude:Joi.number().required(),
                seating_capacity: Joi.number().optional().allow(0),
                branch_id : Joi.number().optional().allow(0),
                offset : Joi.string().optional().allow("")
    }
}),
supplierController.getSupplierSlots
)



/**
 * @swagger
 * /user/supplier_availabilities:
 *   get:
 *     description: For getting supplier slots
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: formData
 *          name: date_order_type
 *          required: true
 *          type: number
 *        - in: formData
 *          name: supplier_id
 *          required: true
 *          type: number
 *        - in: formData
 *          name: latitude
 *          required: false
 *          type: number
 *        - in: formData
 *          name: longitude
 *          required: false
 *          type: number
 *     responses:
*       200:
 *         description: Success!
 */
app.get('/user/supplier_availabilities',
// multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({query: {
                date_order_type:Joi.number().required(),
                supplier_id : Joi.number().required(),
                latitude:Joi.number().required(),
                longitude:Joi.number().required()
    }
}),
supplierController.getSupplierAvailabilityAccToOrderType
)








/**
 * @swagger
 * /admin/add_supplier_table:
 *   post:
 *     description: For adding supplier tables
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: supplier_id
 *          required: true
 *          type: number
 *        - in: body
 *          name: branch_id
 *          required: true
 *          type: number
 *        - in: body
 *          name: table_number
 *          required: true
 *          type: number
 *        - in: body
 *          name: table_name
 *          required: true
 *          type: string
 *        - in: body
 *          name: seating_capacity
 *          required: true
 *          type: number
 *     responses:
*       200:
 *         description: Success!
 */
app.post('/admin/add_supplier_table',
Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
                supplier_id:Joi.number().required(),
                branch_id:Joi.number().required(),
                table_number : Joi.number().required(),
                table_name:Joi.string().required(),
                seating_capacity:Joi.number().required()
    }
}),
supplierController.AddSupplierTables
)




/**
 * @swagger
 * /supplier/add_supplier_table:
 *   post:
 *     description: For adding supplier tables
 *     tags:
 *       - supplier API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: supplier_id
 *          required: true
 *          type: number
 *        - in: body
 *          name: branch_id
 *          required: true
 *          type: number
 *        - in: body
 *          name: table_number
 *          required: true
 *          type: number
 *        - in: body
 *          name: table_name
 *          required: true
 *          type: string
 *        - in: body
 *          name: seating_capacity
 *          required: true
 *          type: number
 *     responses:
*       200:
 *         description: Success!
 */
app.post('/supplier/add_supplier_table',
Auth.supplierAuth,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
                supplier_id:Joi.number().required(),
                branch_id:Joi.number().required(),
                table_number : Joi.number().required(),
                table_name:Joi.string().required(),
                seating_capacity:Joi.number().required()
    }
}),
supplierController.AddSupplierTables
)


/**
 * @swagger
 * /admin/update_supplier_table:
 *   post:
 *     description: For updating supplier tables
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: supplier_id
 *          required: true
 *          type: number
 *        - in: body
 *          name: table_number
 *          required: true
 *          type: number
 *        - in: body
 *          name: table_name
 *          required: true
 *          type: string
 *        - in: body
 *          name: seating_capacity
 *          required: true
 *          type: number
 *        - in: body
 *          name: id
 *          required: true
 *          type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/admin/update_supplier_table',
Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
                table_number : Joi.number().required(),
                table_name:Joi.string().required(),
                seating_capacity:Joi.number().required(),
                id : Joi.number().required()
    }
}),
supplierController.updateSupplierTables
)

/**
 * @swagger
 * /supplier/update_supplier_table:
 *   post:
 *     description: For updating supplier tables
 *     tags:
 *       - supplier API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: supplier_id
 *          required: true
 *          type: number
 *        - in: body
 *          name: table_number
 *          required: true
 *          type: number
 *        - in: body
 *          name: table_name
 *          required: true
 *          type: string
 *        - in: body
 *          name: seating_capacity
 *          required: true
 *          type: number
 *        - in: body
 *          name: id
 *          required: true
 *          type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/supplier/update_supplier_table',
Auth.supplierAuth,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
                table_number : Joi.number().required(),
                table_name:Joi.string().required(),
                seating_capacity:Joi.number().required(),
                id : Joi.number().required()
    }
}),
supplierController.updateSupplierTables
)



/**
 * @swagger
 * /admin/list_supplier_tables:
 *   get:
 *     description: For getting supplier tables
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: query
 *          name: supplier_id
 *          required: true
 *          type: number
 *        - in: query
 *          name: branch_id
 *          required: true
 *          type: number
 *        - in: query
 *          name: limit
 *          required: true
 *          type: number
 *        - in: query
 *          name: offset
 *          required: true
 *          type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.get('/admin/list_supplier_tables',
// multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({query: {
                supplier_id : Joi.number().required(),
                branch_id : Joi.number().required(),
                limit:Joi.number().required(),
                offset:Joi.number().required()
    }
}),
supplierController.listSupplierTables
)


/**
 * @swagger
 * /user/list_tables_seating_capacities:
 *   get:
 *     description: For getting supplier tables capacities
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: query
 *          name: supplier_id
 *          required: true
 *          type: number
 *        - in: query
 *          name: branch_id
 *          required: true
 *          type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.get('/user/list_tables_seating_capacities',
// multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({query: {
                supplier_id : Joi.number().required(),
                branch_id : Joi.number().required()
    }
}),
supplierController.listSupplierTablesCapacities
)



/**
 * @swagger
 * /supplier/list_supplier_tables:
 *   get:
 *     description: For getting supplier tables
 *     tags:
 *       - supplier API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: query
 *          name: supplier_id
 *          required: true
 *          type: number
 *        - in: query
 *          name: branch_id
 *          required: true
 *          type: number
 *        - in: query
 *          name: limit
 *          required: true
 *          type: number
 *        - in: query
 *          name: offset
 *          required: true
 *          type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.get('/supplier/list_supplier_tables',
Auth.supplierAuth,

// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({query: {
                supplier_id : Joi.number().required(),
                branch_id : Joi.number().required(),
                limit:Joi.number().required(),
                offset:Joi.number().required()
    }
}),
supplierController.listSupplierTables
)

/**
 * @swagger
 * /admin/delete_supplier_table:
 *   post:
 *     description: For deleting supplier tables
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: id
 *          required: true
 *          type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/admin/delete_supplier_table',
Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
          id : Joi.number().required(),
    }
}),
supplierController.deleteSupplierTable
)

/**
 * @swagger
 * /supplier/delete_supplier_table:
 *   post:
 *     description: For deleting supplier tables
 *     tags:
 *       - supplier API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: id
 *          required: true
 *          type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/supplier/delete_supplier_table',
Auth.supplierAuth,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
          id : Joi.number().required(),
    }
}),
supplierController.deleteSupplierTable
)


/**
 * @swagger
 * /admin/add_table_qr_code:
 *   post:
 *     description: For adding qr code table 
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: id
 *          required: true
 *          type: number
 *        - in: body
 *          name: qr_code
 *          required: true
 *          type: string
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/admin/add_table_qr_code',
Auth.authenticateAccessToken,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
          id : Joi.number().required(),
          qr_code: Joi.string().required()
    }
}),
supplierController.addTableQrCode
)
/**
 * @swagger
 * /supplier/add_table_qr_code:
 *   post:
 *     description: For adding qr code table 
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: id
 *          required: true
 *          type: number
 *        - in: body
 *          name: qr_code
 *          required: true
 *          type: string
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/supplier/add_qr_code',
Auth.supplierAuth,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
          qr_code: Joi.string().required()
    }
}),
supplierController.addSupplierQrCode
)

/**
 * @swagger
 * /admin/supplier/add_table_qr_code:
 *   post:
 *     description: For adding qr code table 
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: id
 *          required: true
 *          type: number
 *        - in: body
 *          name: qr_code
 *          required: true
 *          type: string
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/admin/supplier/add_qr_code',
Auth.authenticateAccessToken,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
          id : Joi.number().required(),
          qr_code: Joi.string().required()
    }
}),
supplierController.addSupplierQrCodeByAdmin
)

/**
 * @swagger
 * /supplier/add_table_qr_code:
 *   post:
 *     description: For adding qr code table 
 *     tags:
 *       - supplier API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: id
 *          required: true
 *          type: number
 *        - in: body
 *          name: qr_code
 *          required: true
 *          type: string
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/supplier/add_table_qr_code',
Auth.supplierAuth,

Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
          id : Joi.number().required(),
          qr_code: Joi.string().required()
    }
}),
supplierController.addTableQrCode
)


/**
 * @swagger
 * /user/list_supplier_tables:
 *   get:
 *     description: For getting supplier tables
 *     tags:
 *       - User API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: query
 *          name: supplier_id
 *          required: true
 *          type: number
 *        - in: query
 *          name: branch_id
 *          required: true
 *          type: number
 *        - in: query
 *          name: limit
 *          required: true
 *          type: number
 *        - in: query
 *          name: offset
 *          required: true
 *          type: number
 *        - in: query
 *          name: slot_id
 *          required: false
 *          type: number
 * 
 *     responses:
 *       200:
 *         description: Success!
 */
app.get('/user/list_supplier_tables',
// multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({query: {
                supplier_id : Joi.number().required(),
                branch_id : Joi.number().required(),
                limit:Joi.number().required(),
                offset:Joi.number().required(),
                slot_id:Joi.number().optional().allow("")
    }
}),
supplierController.listSupplierTablesForUser
)



/**
 * @swagger
 * /admin/user_booking_requests:
 *   get:
 *     description: For getting supplier tables
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: query
 *          name: limit
 *          required: true
 *          type: number
 *        - in: query
 *          name: offset
 *          required: true
 *          type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.get('/admin/user_booking_requests',
// multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({query: {
                limit:Joi.number().required(),
                offset:Joi.number().required()
    }
}),
supplierController.listSupplierBokingRequests
)

/**
 * @swagger
 * /supplier/user_booking_requests:
 *   get:
 *     description: For getting supplier tables
 *     tags:
 *       - supplier API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: query
 *          name: limit
 *          required: true
 *          type: number
 *        - in: query
 *          name: offset
 *          required: true
 *          type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.get('/supplier/user_booking_requests',
// multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.supplierAuth,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({query: {
                limit:Joi.number().required(),
                offset:Joi.number().required()
    }
}),
supplierController.listSupplierBokingRequests
)

/**
 * @swagger
 * /admin/update_table_booking_requests:
 *   post:
 *     description: For getting supplier tables
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: id
 *          required: true
 *          type: number
 *        - in: body
 *          name: status
 *          required: true
 *          type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/admin/update_table_booking_requests',
// multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
                id:Joi.number().required(),
                status:Joi.number().required(),
                reason:Joi.string().optional().allow("")
    }
}),
supplierController.updateTableBookingStatus
)

/**
 * @swagger
 * /user/hold_supplier_slots:
 *   post:
 *     description: For holding supplier slots
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: id
 *          required: true
 *          type: number
 *        - in: body
 *          name: status
 *          required: true
 *          type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/user/hold_supplier_slots',
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
                supplier_id:Joi.number().required(),
                branch_id:Joi.number().required(),
                slotDate:Joi.string().required(),
                slotTime:Joi.string().required(),
                offset:Joi.string().required()
    }
}),
supplierController.holdSupplierTableSlots
)


/**
 * @swagger
 * /admin/update_supplier_products_offer:
 *   post:
 *     description: For updating supplier product offer
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: supplierBranchId
 *          required: true
 *          type: number
 *        - in: body
 *          name: supplierId
 *          required: true
 *          type: number
 *        - in: body
 *          name: offerValue
 *          required: true
 *          type: number
 *        - in: body
 *          name: isProductOffer
 *          required: true
 *          type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/admin/update_supplier_products_offer',
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
    supplierBranchId:Joi.number().required(),
    supplierId:Joi.number().required(),
    offerValue:Joi.number().required(),
    admin_offer:Joi.number().optional().allow(0),
    supplier_offer:Joi.number().optional().allow(0),
    is_products_offer:Joi.number().required()
    }
}),
supplierController.updateSupplierProductOffer
)


/**
 * @swagger
 * /supplier/update_table_booking_requests:
 *   post:
 *     description: For getting supplier tables
 *     tags:
 *       - supplier API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: id
 *          required: true
 *          type: number
 *        - in: body
 *          name: status
 *          required: true
 *          type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/supplier/update_table_booking_requests',
// multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
                id:Joi.number().required(),
                status:Joi.number().required(),
                reason:Joi.string().optional().allow("")
    }
}),
supplierController.updateTableBookingStatus
)

/**
 * @swagger
 * /user/make_table_booking_requests:
 *   post:
 *     description: For getting supplier tables
 *     tags:
 *       - User API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: user_id
 *          required: true
 *          type: number
 *        - in: body
 *          name: table_id
 *          required: false
 *          type: number
 *        - in: body
 *          name: slot_id
 *          required: false
 *          type: number
 *        - in: body
 *          name: schedule_date
 *          required: false
 *          type: string    
 *        - in: body
 *          name: schedule_end_date
 *          required: false
 *          type: string
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/user/make_table_booking_requests',
// multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
                user_id:Joi.number().required(),
                table_id:Joi.number().optional().allow(0),
                supplier_id:Joi.number().optional().allow(""),
                branch_id:Joi.number().optional().allow(""),
                slot_id:Joi.number().optional().allow(0),
                schedule_date:Joi.string().optional().allow(""),
                schedule_end_date:Joi.string().optional().allow(""),
                cardHolderName : Joi.string().optional().allow(""),
                seating_capacity : Joi.number().optional().allow(0),
                gateway_unique_id:Joi.string().optional().allow(""),
                amount: Joi.number().optional().allow(""),
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
                authnet_profile_id:Joi.string().optional().allow(""),
                authnet_payment_profile_id:Joi.string().optional().allow("")
    }
}),
supplierController.makeTableBookingRequest
)

/**
 * @swagger
 * /user/list_booking_requests:
 *   get:
 *     description: For getting supplier tables
 *     tags:
 *       - User API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: query
 *          name: user_id
 *          required: true
 *          type: number
 *        - in: query
 *          name: offset
 *          required: true
 *          type: number
 *        - in: query
 *          name: limit
 *          required: true
 *          type: number
 *        - in: query
 *          name: invitation_list
 *          required: false
 *          type: number
 * 
 *     responses:
 *       200:
 *         description: Success!
 */
app.get('/user/list_booking_requests',
// multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({query: {
                limit : Joi.number().required(),
                offset : Joi.number().required(),
                user_id:Joi.number().required(),
                invitation_list:Joi.number().optional().allow(0),
                status : Joi.number().optional().allow(0)
    }
}),
supplierController.listUserBokingRequests
)


/**
 * @swagger
 * /admin/assign_table_to_user:
 *   post:
 *     description: For assigning user table
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: user_id
 *          required: false
 *          type: number
 *        - in: body
 *          name: table_id
 *          required: true
 *          type: number
 *        - in: body
 *          name: request_id
 *          required: true
 *          type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/admin/assign_table_to_user',
// multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
                user_id:Joi.number().optional().allow(0),
                table_id:Joi.number().required(),
                request_id:Joi.number().required()
    }
}),
supplierController.assignTableToUser
)

/**
 * @swagger
 * /user/verify_table_number:
 *   post:
 *     description: For assigning user table
 *     tags:
 *       - User API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: table_number
 *          required: false
 *          type: number
 *        - in: body
 *          name: supplier_id
 *          required: true
 *          type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/user/verify_table_number',
// multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
// expressJoi({body: {
//                 // table_number:Joi.number().required(),
//                 supplier_id:Joi.number().required()
//     }
// }),
supplierController.verifyTableNumber
)


/**
 * @swagger
 * /user/accept_invitation:
 *   post:
 *     description: For accept invitaion
 *     tags:
 *       - User API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: table_booking_id
 *          required: false
 *          type: number
 *        - in: body
 *          name: user_id
 *          required: true
 *          type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/user/accept_invitation',
// multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
                table_booking_id:Joi.number().required(),
                user_id:Joi.number().required()
    }
}),
supplierController.acceptTableInvitation
)

/**
 * @swagger
 * /user/genrate_table_deeplink:
 *   post:
 *     description: For accept invitaion
 *     tags:
 *       - User API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: domainUriPrefix
 *          required: false
 *          type: string
 *        - in: body
 *          name: link
 *          required: true
 *          type: string
 *        - in: body
 *          name: androidPackageName
 *          required: false
 *          type: string
 *        - in: body
 *          name: iosBundleId
 *          required: true
 *          type: string
 *        - in: body
 *          name: firebase_api_key
 *          required: true
 *          type: string
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/user/genrate_table_deeplink',
// multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
            domainUriPrefix: Joi.string().required(),
            link: Joi.string().required(),
            androidPackageName: Joi.string().required(),
            iosBundleId: Joi.string().required(),
            firebase_api_key: Joi.string().required()
    }
}),
supplierController.genrateTableDeeplink
)


/**
 * @swagger
 * /admin/update_table_number:
 *   post:
 *     description: For update_table_number
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: table_id
 *          required: true
 *          type: number
 *        - in: body
 *          name: id
 *          required: true
 *          type: number
 *        - in: body
 *          name: order_id
 *          required: false
 *          type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/admin/update_table_number',
// multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
            id: Joi.number().required(),
            table_id: Joi.number().required(),
            order_id : Joi.number().optional().allow(0)
    }
}),
supplierController.updateTableNumber
)

/**
 * @swagger
 * /admin/update_supplier_sequence:
 *   post:
 *     description: For update_table_number
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: categoriesSequence
 *          required: true
 *          type: array
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/admin/update_supplier_sequence',
// multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
            supplierSequence: Joi.array().required()
    }
}),
supplierController.updateSupplierSequenceNumber
)

/**
 * @swagger
 * /supplier/update_table_number:
 *   post:
 *     description: For update_table_number
 *     tags:
 *       - Supplier API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: table_id
 *          required: true
 *          type: number
 *        - in: body
 *          name: id
 *          required: true
 *          type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/supplier/update_table_number',
// multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
            id: Joi.number().required(),
            table_id: Joi.number().required(),
    }
}),
supplierController.updateTableNumber
)

/**
 * @swagger
 * /admin/update_supplier_password:
 *   post:
 *     description: For update_supplier_password
 *     tags:
 *       - Supplier API`S
 *     consumes:
 *       - application/json
 *     parameters:
*        - in: body
 *          name: body
 *          required: true
 *          schema:
 *            type: object
 *            properties: 
 *              supplier_id:
 *                  type: number
 *                  required: true
 *              password:
 *                type: string
 *                required: true
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/admin/update_supplier_password',
// multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
            supplier_id: Joi.number().required(),
            password: Joi.string().required(),
    }
}),
supplierController.updateSupplierPassword
)


/**
 * @swagger
 * /admin/add_tags_for_supplier:
 *   post:
 *     description: for add tags for supplier 
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: name
 *          required: true
 *          type: string
 *        - in: body
 *          name: tag_image
 *          required: true
 *          type: string
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/admin/add_tags_for_supplier',
// multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
            name: Joi.string().required(),
            tag_image: Joi.string().required(),
    }
}),
supplierController.addSupplierTags
)

/**
 * @swagger
 * /admin/update_tags_for_supplier:
 *   post:
 *     description: for update tags for supplier 
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: name
 *          required: true
 *          type: string
 *        - in: body
 *          name: tag_image
 *          required: true
 *          type: string
 *        - in: body
 *          name: id
 *          required: true
 *          type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/admin/update_tags_for_supplier',
// multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
            name: Joi.string().required(),
            tag_image: Joi.string().required(),
            id:Joi.number().required()
    }
}),
supplierController.updateSupplierTags
)


/**
 * @swagger
 * /admin/suppier/monthly_charge:
 *   post:
 *     description: for update tags for supplier 
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: startDate
 *          required: true
 *          type: string
 *        - in: body
 *          name: endDate
 *          required: true
 *          type: string
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/admin/suppier/monthly_charge',
Auth.storeDbInRequest,
expressJoi({body: {
            startDate: Joi.string().required(),
            endDate: Joi.string().required()
    }
}),
universal.makeSuppliersPaymentFromSaveCards
)

/**
 * @swagger
 * /admin/delete_tag_for_supplier:
 *   post:
 *     description: for update tags for supplier 
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: id
 *          required: true
 *          type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/admin/delete_tag_for_supplier',
// multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
            id:Joi.number().required()
    }
}),
supplierController.deleteSupplierTag
)

/**
 * @swagger
 * /admin/assign_tag_for_supplier:
 *   post:
 *     description: for update tags for supplier 
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: supplier_id
 *          required: true
 *          type: number
 *        - in: body
 *          name: tag_id
 *          required: true
 *          type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/admin/assign_tag_for_supplier',
// multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
             supplier_id:Joi.number().required(),
             tag_ids:Joi.array().required()
             
    }
}),
supplierController.assignTagsToSupplier
)

/**
 * @swagger
 * /admin/unassign_tag_for_supplier:
 *   post:
 *     description: for update tags for supplier 
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: id
 *          required: true
 *          type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/admin/unassign_tag_for_supplier',
// multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
             id:Joi.number().required()

    }
}),
supplierController.unassignTagsToSupplier
)


/**
 * @swagger
 * /admin/add_update_flavor_supplier:
 *   post:
 *     description: for add or update supplier flavor
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: id
 *          required: true
 *          type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/admin/add_update_flavor_supplier',
// multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
        flavor_of_week:Joi.string().required(),
        supplier_id:Joi.number().required(),
        is_flavor_of_week:Joi.number().required()

    }
}),
supplierController.addUpdateSupplierFlavor
)



/**
 * @swagger
 * /admin/update_weight_wise_delivery_charge:
 *   post:
 *     description: for update_weight_wise_delivery_charge
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: supplier_id
 *          required: true
 *          type: number
 *        - in: body
 *          name: weight
 *          required: true
 *          type: number
 *        - in: body
 *          name: delivery_charge
 *          required: true
 *          type: number
 *        - in: body
 *          name: id
 *          required: false
 *          type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/admin/update_weight_wise_delivery_charge',
// multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
        delivery_charge:Joi.number().required(),
        supplier_id:Joi.number().required(),
        weight:Joi.number().required(),
        id:Joi.number().optional().allow("")
    }
}),
supplierController.addUpdateWeightWiseDeliveryCharge
)


/**
 * @swagger
 * /admin/delete_weight_wise_delivery_charge:
 *   post:
 *     description: for delete_weight_wise_delivery_charge
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: id
 *          required: true
 *          type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/admin/delete_weight_wise_delivery_charge',
// multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
        id:Joi.number().required()
    }
}),
supplierController.deleteWeightWiseDeliveryCharge
)

/**
 * @swagger
 * /admin/list_weight_wise_delivery_charge:
 *   get:
 *     description: for list_weight_wise_delivery_charge
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: query
 *          name: limit
 *          required: true
 *          type: number
 *        - in: query
 *          name: skip
 *          required: true
 *          type: number
 *        - in: query
 *          name: supplier_id
 *          required: true
 *          type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.get('/admin/list_weight_wise_delivery_charge',
// multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({query: {
            limit:Joi.number().required(),
            skip:Joi.number().required(),
            supplier_id:Joi.number().required()
    }
}),
supplierController.listWeightWiseDeliveryCharge
)


/**
 * @swagger
 * /admin/list_tags_for_supplier:
 *   get:
 *     description: for list tags for supplier 
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: query
 *          name: limit
 *          required: true
 *          type: number
 *        - in: query
 *          name: skip
 *          required: true
 *          type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.get('/admin/list_tags_for_supplier',
// multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({query: {
            limit:Joi.number().required(),
            skip:Joi.number().required()
    }
}),
supplierController.listSupplierTags
)


/**
 * @swagger
 * /admin/list_tags_by_supplier_id:
 *   get:
 *     description: for list tags for supplier 
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: query
 *          name: limit
 *          required: true
 *          type: number
 *        - in: query
 *          name: skip
 *          required: true
 *          type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.get('/admin/list_tags_by_supplier_id',
// multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({query: {
            limit:Joi.number().required(),
            skip:Joi.number().required(),
            supplier_id:Joi.number().required()
    }
}),
supplierController.listSupplierTagsBySupplierId
)

/**
 * @swagger
 * /admin/update_supplier_cover_images:
 *   post:
 *     description: for update_supplier_cover_images
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: supplier_id
 *          required: true
 *          type: number
 *        - in: body
 *          name: supplier_images
 *          required: true
 *          type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/admin/update_supplier_cover_images',
// multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
// expressJoi({body: {
//         id:Joi.number().required()
//     }
// }),
supplierController.updateSupplierImages
)


/**
 * @swagger
 * /admin/list_order_wise_gateways:
 *   get:
 *     description: for list_order_wise_gateways
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: query
 *          name: supplier_id
 *          required: true
 *          type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.get('/admin/list_order_wise_gateways',
// multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({query: {
            supplier_id:Joi.number().required()
    }
}),
supplierController.listOrderTypeWiseGateway
)


/**
 * @swagger
 * /admin/update_order_wise_gateways:
 *   post:
 *     description: for update_supplier_cover_images
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: id
 *          required: true
 *          type: number
 *        - in: body
 *          name: payment_gateways
 *          required: true
 *          type: string
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/admin/update_order_wise_gateways',
// multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
        id:Joi.number().required(),
        payment_gateways:Joi.string().required()
    }
}),
supplierController.updateOrderTypeWiseGateways
)


/**
 * @swagger
 * /admin/add_order_wise_gateways:
 *   post:
 *     description: for update_supplier_cover_images
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: supplier_id
 *          required: true
 *          type: number
 *        - in: body
 *          name: order_type
 *          required: true
 *          type: number
 *        - in: body
 *          name: payment_gateways
 *          required: true
 *          type: string
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/admin/add_order_wise_gateways',
// multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
        supplier_id:Joi.number().required(),
        order_type:Joi.number().required(),
        payment_gateways:Joi.string().required()
    }
}),
supplierController.addOrderTypeWiseGateways
)


/**
 * @swagger
 * /admin/delete_order_wise_gateways:
 *   post:
 *     description: for update_supplier_cover_images
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: id
 *          required: true
 *          type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/admin/delete_order_wise_gateways',
// multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
        id:Joi.number().required()
    }
}),
supplierController.deleteOrderTypeWiseGateway
)



/**
 * @swagger
 * /admin/update_supplier_availibility:
 *   post:
 *     description: for update_supplier_cover_images
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: id
 *          required: true
 *          type: number
 *        - in: body
 *          name: is_open
 *          required: true
 *          type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/admin/update_supplier_availibity_onoff',
// multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
        id:Joi.number().required(),
        is_open:Joi.number().required()
    }
}),
supplierController.updateSupplierAvailibilityOnOff
)



/**
 * @swagger
 * /supplier/update_supplier_availibility:
 *   post:
 *     description: for supplier
 *     tags:
 *       - supplier API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: id
 *          required: true
 *          type: number
 *        - in: body
 *          name: is_open
 *          required: true
 *          type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/supplier/update_supplier_availibity_onoff',
// multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
        id:Joi.number().required(),
        is_open:Joi.number().required()
    }
}),
supplierController.updateSupplierAvailibilityOnOff
)
/**
 * @swagger
 * /admin/supplier/import:
 *   post:
 *     description: impor supplier from admin in bulk
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: file
 *         required: true
 *         type: file
 *       - in: formData
 *         name: sectionId
 *         required: false
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/admin/supplier/import',
multipartMiddleware,
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: 
    {
        sectionId:Joi.number().required()
    }
}),
Controller.adminSupplierController.Supplier.Import
)



/**
 * @swagger
 * /admin/product_updation_request:
 *   get:
 *     description: for supplier
 *     tags:
 *       - supplier API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: query
 *          name: limit
 *          required: true
 *          type: number
 *        - in: query
 *          name: skip
 *          required: true
 *          type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.get('/supplier/update_supplier_availibity_onoff',
// multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({query: {
        id:Joi.number().required(),
        is_open:Joi.number().required()
    }
}),
supplierController.updateSupplierAvailibilityOnOff
)


/**
 * @swagger
 * /admin/product_updation_requests:
 *   get:
 *     description: for admin
 *     tags:
 *       - admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: query
 *          name: limit
 *          required: true
 *          type: number
 *        - in: query
 *          name: skip
 *          required: true
 *          type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.get('/admin/product_updation_requests',
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({query: {
        limit:Joi.number().required(),
        skip:Joi.number().required()
    }
}),
supplierController.getSupplierProductUpdationRequests
)


/**
 * @swagger
 * /admin/product_pricing_updation_requests:
 *   get:
 *     description: for admin
 *     tags:
 *       - admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: query
 *          name: limit
 *          required: true
 *          type: number
 *        - in: query
 *          name: skip
 *          required: true
 *          type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.get('/admin/product_pricing_updation_requests',
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({query: {
        limit:Joi.number().required(),
        skip:Joi.number().required()
    }
}),
supplierController.getSupplierProductPricingUpdationRequests
)



/**
 * @swagger
 * /admin/product_price_updation_request:
 *   post:
 *     description: for update_supplier_cover_images
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: supplier_id
 *          required: true
 *          type: number
 *        - in: body
 *          name: order_type
 *          required: true
 *          type: number
 *        - in: body
 *          name: payment_gateways
 *          required: true
 *          type: string
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/admin/product_price_updation_request',
// multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
    updationRequestId:Joi.number().required(),
    update_request_approved:Joi.number().required()
    }
}),
supplierController.approveSupplierProductPricingUpdationRequest
)   


/**
 * @swagger
 * /supplier/product_updation_request:
 *   get:
 *     description: for admin
 *     tags:
 *       - admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: query
 *          name: limit
 *          required: true
 *          type: number
 *        - in: query
 *          name: skip
 *          required: true
 *          type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.get('/supplier/product_updation_request',
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({query: {
        limit:Joi.number().required(),
        skip:Joi.number().required(),
        product_id:Joi.number().required()
    }
}),
supplierController.getSupplierProductUpdationRequests
)


/**
 * @swagger
 * /admin/approve_product_updation_request:
 *   post:
 *     description: for supplier
 *     tags:
 *       - supplier API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: updationRequestId
 *          required: true
 *          type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/admin/approve_product_updation_request',
// multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
    updationRequestId:Joi.number().required(),
    update_request_approved:Joi.number().optional().allow(0)
    }
}),
supplierController.approveSupplierProductUpdationRequest
)


/**
 * @swagger
 * /admin/approve_product_pricing_updation_request:
 *   post:
 *     description: for supplier
 *     tags:
 *       - supplier API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: updationRequestId
 *          required: true
 *          type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/admin/approve_product_pricing_updation_request',
// multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
    updationRequestIds:Joi.array().required()
    }
}),
supplierController.approveSupplierProductPricingUpdationRequest
)


/**
 * @swagger
 * /admin/create_supplier_tap_destination:
 *   post:
 *     description: For getting supplier tables
 *     tags:
 *       - supplier API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: id
 *          required: true
 *          type: number
 *        - in: body
 *          name: status
 *          required: true
 *          type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/admin/create_supplier_tap_destination',
// multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
                display_name:Joi.number().required()
    }
}),
supplierController.updateTableBookingStatus
)

}