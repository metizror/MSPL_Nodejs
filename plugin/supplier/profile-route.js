
var profileController = require('../../controller/supplier/profileController')
var Auth = require('../../lib/Auth')
// var category=require('../routes/category')
const Joi = require('joi')
const expressJoi = require('express-joi-validator');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
module.exports = (app) => {
    /**
     * @swagger
     * /supplier/uploadDetails:
     *   get:
     *     description: For Creating an new brands
     *     tags:
     *       - Supplier API`S   
     *     produces:
     *       - application/json
     *     parameters:
     *       - in: formData
     *         name: passport_id
     *         required: true
     *         type: string 
     *       - in: formData
     *         name: bank_details
     *         required: false
     *         type: string 
     *       - in: formData
     *         name: business_certificate
     *         required: false
     *         type: file
     *     responses:
     *       200:
     *         description: encypt
     *         schema:
     *           $ref: '#/definitions/Stock'
     */
    app.post('/supplier/uploadDetails',
        multipartMiddleware,
        Auth.supplierAuth,
        // Auth.checkforAuthorityofThisSupplier,
        Auth.checkCblAuthority,
        expressJoi({
            body: {
                passport_id: Joi.string().required(),
                bank_details: Joi.string().optional().allow(''),
                business_certificate: Joi.any().optional().allow(''),
                // business_certificate: Joi.any().meta({ swaggerType: 'file' }).optional().allow(''),
            }
        }),
        profileController.uploadDetails
    ),
    /**
     * @swagger
     * /admin/update/language:
     *   post:
     *     description: api used for log by admin
     *     tags:
     *       - Admin API`S
     *     consumes:
     *       - application/json
     *     parameters:
     *        - in: body
     *          name: body
     *          required: falsesectionAuthorityData
     *          schema:
     *            type: object
     *            properties: 
     *              language_id:
     *                  type: number
     *                  required: true
     *     responses:
     *       200:
     *         description: success!
     */
    app.post('/supplier/update/language',
    // Auth.checkCblAuthority,
    Auth.supplierAuth,
    profileController.updateSupplierLanguage
    )
    /**
     * @swagger
     * /admin/add_supplier_min_distance_price:
     *   post:
     *     description: For Creating an new add_supplier_min_distance_price
     *     tags:
     *       - Admin API`S   
     *     produces:
     *       - application/json
     *     parameters:
     *       - in: body
     *         name: distance
     *         required: true
     *         type: number 
     *       - in: body
     *         name: supplier_id
     *         required: true
     *         type: number
     *       - in: body
     *         name: min_amount
     *         required: true
     *         type: number
     *     responses:
     *       200:
     *         description: encypt
     *         schema:
     *           $ref: '#/definitions/Stock'
     */
app.post('/admin/add_supplier_min_distance_price',
        // multipartMiddleware,
        // Auth.supplierAuth,
        // Auth.checkforAuthorityofThisSupplier,
        // Auth.checkCblAuthority,
        Auth.storeDbInRequest,
        expressJoi({
            body: {
                distance: Joi.number().required(),
                supplier_id: Joi.number().required(),
                min_amount: Joi.number().required(),
                id:Joi.number().optional().allow(0)
            }
        }),
        profileController.addSupplierMinOrderDistancePrice
)


    /**
     * @swagger
     * /admin/list_supplier_min_distance_price:
     *   get:
     *     description: For Creating an new list supplier min_distance price
     *     tags:
     *       - Admin API`S   
     *     produces:
     *       - application/json
     *     parameters:
     *       - in: query
     *         name: supplier_id
     *         required: true
     *         type: number
     *     responses:
     *       200:
     *         description: encypt
     *         schema:
     *           $ref: '#/definitions/Stock'
     */
    app.get('/admin/list_supplier_min_distance_price',
    // multipartMiddleware,
    // Auth.supplierAuth,
    // Auth.checkforAuthorityofThisSupplier,
    // Auth.checkCblAuthority,
    Auth.storeDbInRequest,
    expressJoi({
        query: {
            supplier_id: Joi.number().required()
        }
    }),
    profileController.listSupplierMinOrderDistancePrice
)


    /**
     * @swagger
     * /admin/delete_supplier_min_distance_price:
     *   post:
     *     description: For  delete supplier_min_distance_price
     *     tags:
     *       - Admin API`S   
     *     produces:
     *       - application/json
     *     parameters:
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
    app.post('/admin/delete_supplier_min_distance_price',
    // multipartMiddleware,
    // Auth.supplierAuth,
    // Auth.checkforAuthorityofThisSupplier,
    // Auth.checkCblAuthority,
    Auth.storeDbInRequest,
    expressJoi({
        body: {
            id: Joi.number().required()
        }
    }),
    profileController.deleteSupplierMinOrderDistancePrice
)

}