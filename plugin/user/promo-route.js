var Auth=require('../../lib/Auth')
var category=require('../../routes/category')
const Joi = require('joi')
const expressJoi = require('express-joi-validator');
const promoController=require('../../controller/user/promoController');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

module.exports=(app)=>{
    
/**
 * @swagger
 * /user/promo_codes:
 *   get:
 *     description: For updating an post
 *     tags:
 *       - User API`S
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
 *         name: supplierIds
 *         required: true
 *         type: string
 *       - in: query
 *         name: categoryIds
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/user/promo_codes', 
Auth.storeDbInRequest,
// Auth.userAuthenticate,
expressJoi({query: {
                limit: Joi.number().required(),
                skip: Joi.number().required(),
                // promo_code_type:Joi.number().required(),
                categoryId: Joi.number().optional().allow(0),
                supplierIds:Joi.string().required(),
                categoryId: Joi.number().optional().allow(0),
                categoryIds:Joi.array().optional().allow("")
        }
}),
promoController.promoListing
);

/**
 * @swagger
 * /user/voucher_codes:
 *   get:
 *     description: For updating an post
 *     tags:
 *       - User API`S
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
 *         name: supplierIds
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/user/voucher_codes', 
Auth.storeDbInRequest,
// Auth.userAuthenticate,
expressJoi({query: {
                limit:Joi.number().required(),
                skip:Joi.number().required(),
                // promo_code_type:Joi.number().required(),
                // supplierIds:Joi.string().required()
        }
}),
promoController.voucherListing
);
    
}