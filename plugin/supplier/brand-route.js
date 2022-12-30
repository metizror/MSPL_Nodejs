
var BrandController=require('../../controller/admin/BrandController')
var Auth=require('../../lib/Auth')
// var category=require('../routes/category')
const Joi = require('joi')
const expressJoi = require('express-joi-validator');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
module.exports=(app)=>{
/**
 * @swagger
 * /supplier/brand_list:
 *   get:
 *     description: For Brand list Api
 *     tags:
 *       - Supplier API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         type: number
 *       - in: formData
 *         name: sectionId
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
app.get('/supplier/brand_list',
Auth.supplierAuth,
// Auth.checkforAuthorityofThisSupplier,
Auth.checkCblAuthority,
expressJoi({query: {
    limit:Joi.number().required(),
    offset:Joi.number().required(),
    sectionId:Joi.number().required(),
    }
}),
BrandController.List
)
}