
var AreaController=require('../../controller/admin/AreaController')
var Auth=require('../../lib/Auth')
var category=require('../../routes/category')
const Joi = require('joi')
const expressJoi = require('express-joi-validator');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
module.exports=(app)=>{
/**
 * @swagger
 * /admin/add_pincode:
 *   post:
 *     description: api used for adding an pincode
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: area_id
 *         required: true
 *         type: number
 *       - in: formData
 *         name: sectionId
 *         required: true
 *         type: number
 *       - in: formData
 *         name: pincode
 *         required: false
 *         schema:
 *           type:array
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/admin/add_pincode',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: 
    {
        sectionId:Joi.number().required(),
        area_id:Joi.number().required(),
        pincode:Joi.array().required()
    }
}),
AreaController.AddPin

)
/**
 * @swagger
 * /admin/list_pincode:
 *   get:
 *     description: api used for listing an pincodes
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: area_id
 *         required: true
 *         type: number
 *       - in: query
 *         name: sectionId
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/admin/list_pincode',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({query: 
    {
        area_id:Joi.number().required(),
        sectionId:Joi.number().required()
    }
}),
AreaController.PinCodeList
)


/**
 * @swagger
 * /admin/add_geofence:
 *   post:
 *     description: For add  geofence
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: coordinates
 *          required: true
 *          type: array
 *        - in: body
 *          name: name
 *          required: true
 *          type: string
 *     responses:
*       200:
 *         description: Success!
 */
app.post('/admin/add_geofence',
// multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,

expressJoi({body: {
                name:Joi.string().required(),
                coordinates : Joi.array().required()
    }
}),
AreaController.addGeoFence
)

/**
 * @swagger
 * /admin/active_deactivate_geofence_area:
 *   post:
 *     description: For add  geofence
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: coordinates
 *          required: true
 *          type: array
 *        - in: body
 *          name: name
 *          required: true
 *          type: string
 *     responses:
*       200:
 *         description: Success!
 */
app.post('/admin/active_deactivate_geofence_area',
// multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,

expressJoi({body: {
                id:Joi.number().required(),
                is_live : Joi.number().required()
    }
}),
AreaController.activeDeactivateGeofence
)

/**
 * @swagger
 * /admin/update_geofence:
 *   post:
 *     description: For update  geofence
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: coordinates
 *          required: true
 *          type: array
 *        - in: body
 *          name: name
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
app.post('/admin/update_geofence',
// multipartMiddleware,
Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,

expressJoi({body: {
                id:Joi.number().required(),
                coordinates : Joi.array().required(),
                name:Joi.string().required()
    }
}),
AreaController.updateGeoFence
)

/**
 * @swagger
 * /admin/delete_geofence:
 *   post:
 *     description: For deleting category geofence
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
app.post('/admin/delete_geofence',
// multipartMiddleware,
Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: {
                id:Joi.number().required()
    }
}),
AreaController.deleteGeoFence
)

/**
 * @swagger
 * /admin/list_geofence:
 *   get:
 *     description: For listing geofence categories
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
app.get('/admin/list_geofence',
// multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
// Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({query: {
        limit:Joi.number().optional().allow(0),
        skip:Joi.number().optional().allow(0),
        supplier_id:Joi.number().optional().allow(0)
    }
}),
AreaController.listGeoFence
)

/**
 * @swagger
 * /admin/assign_unassign_geofence_to_supplier:
 *   post:
 *     description: For deleting category geofence
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
app.post('/admin/assign_unassign_geofence_to_supplier',
// multipartMiddleware,
Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: {
                supplier_id:Joi.number().required(),
                geofenceIds:Joi.array().required()
    }
}),
AreaController.assignUnassignGeofenceAreaToSupplier
)

}