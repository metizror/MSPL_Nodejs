var Controller=require('../../controller')
var Auth=require('../../lib/Auth')
var category=require('../../routes/category')
const Joi = require('joi')
const expressJoi = require('express-joi-validator');

module.exports=(app)=>{
/**
 * @swagger
 * /admin/updatePromo:
 *   put:
 *     description: api used for assigned service an agent
 *     summary: used for an update promo code 
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
 *              promoType:
 *                  type: number
 *                  required: true
 *              id:
 *                  type: number
 *                  required: true
 *              name:
 *                  type: string
 *                  required: true
 *              desc:
 *                  type: string
 *                  required: true
 *              promoCode:
 *                  type: string
 *                  required: true
 *              maxUser:
 *                  type: number
 *                  required: true
 *              minPrice:
 *                  type: number
 *                  required: true
 *              perUserCount:
 *                  type: number
 *                  required: true
 *              endDate:
 *                  type: string
 *                  required: true
 *              discountPrice:
 *                  type: number
 *                  required: true
 *              startDate:
 *                  type: string
 *                  required: true
 *              details:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties: 
 *                             supplierId:
 *                                type: number
 *                             categoryId:
 *                                type: number 
 *                             supplierName:
 *                                 type: string
 *                             categoryName:
 *                                 type: string
 *              discountType:
 *                  type: number
 *                  required: true
 *              firstTime:
 *                  type: number
 *                  required: true
 *              bear_by:
 *                  type: number
 *                  required: true
 *              commission_on:
 *                  type: number
 *                  required: true
 *   
 *     responses:
 *       200:
 *         description: Success!
 */
app.put('/admin/updatePromo',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: {
                id:Joi.number().required(),
                promoType:Joi.number().required(),
                name:Joi.string().required(),
                promoCode:Joi.string().required(),
                desc:Joi.string().optional().allow(""),
                maxUser:Joi.number().required(),
                minPrice:Joi.number().required(),
                perUserCount:Joi.number().required(),
                endDate:Joi.string().required(),
                discountPrice:Joi.number().optional().allow("").default(0),
                startDate:Joi.string().required(),
                max_discount_value:Joi.number().optional().allow(0),
                details:Joi.array().items(Joi.object().keys({
                    supplierId:Joi.number().required(),
                    categoryId:Joi.number().optional().allow(""),
                    supplierName:Joi.string().optional().allow(""),
                    categoryName:Joi.string().optional().allow(""),
                })).required(),
                discountType:Joi.number().required(),
                firstTime:Joi.number().required(),
                promo_user_subscription_type:Joi.string().optional().allow(""),
                sectionId:Joi.number().optional().allow(""),
                promo_level: Joi.string().optional().allow(""),
                product_ids : Joi.array().optional().allow(""), 
                region_ids: Joi.array().optional().allow(""), 
                category_ids: Joi.array().optional().allow(""), 
                bear_by : Joi.number().required(),
                commission_on : Joi.number().required(),
                buy_x_get_x_arr :Joi.string().optional().allow(""),
                promo_buy_x_quantity :Joi.number().optional().allow("").default(0),
                promo_get_x_quantity :Joi.number().optional().allow("").default(0),
                max_buy_x_get:Joi.number().optional().allow("").default(0),
                max_discount_value:Joi.number().optional().allow("").default(0)

    }
}),
Controller.PromoController.Update
)


/**
 * @swagger
 * /supplier/updatePromo:
 *   put:
 *     description: api used for assigned service an agent
 *     summary: used for an update promo code 
 *     tags:
 *       - Supplier API`S
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
 *              promoType:
 *                  type: number
 *                  required: true
 *              id:
 *                  type: number
 *                  required: true
 *              name:
 *                  type: string
 *                  required: true
 *              desc:
 *                  type: string
 *                  required: true
 *              promoCode:
 *                  type: string
 *                  required: true
 *              maxUser:
 *                  type: number
 *                  required: true
 *              minPrice:
 *                  type: number
 *                  required: true
 *              perUserCount:
 *                  type: number
 *                  required: true
 *              endDate:
 *                  type: string
 *                  required: true
 *              discountPrice:
 *                  type: number
 *                  required: true
 *              startDate:
 *                  type: string
 *                  required: true
 *              details:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties: 
 *                             supplierId:
 *                                type: number
 *                             categoryId:
 *                                type: number 
 *                             supplierName:
 *                                 type: string
 *                             categoryName:
 *                                 type: string
 *              discountType:
 *                  type: number
 *                  required: true
 *              firstTime:
 *                  type: number
 *                  required: true
 *              bear_by:
 *                  type: number
 *                  required: true
 *              commission_on:
 *                  type: number
 *                  required: true
 *   
 *     responses:
 *       200:
 *         description: Success!
 */
app.put('/supplier/updatePromo',
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
                id:Joi.number().required(),
                promoType:Joi.number().required(),
                name:Joi.string().required(),
                promoCode:Joi.string().required(),
                desc:Joi.string().optional().allow(""),
                region_ids:Joi.array().optional().allow(""),
                product_ids:Joi.array().optional().allow(""),
                category_ids:Joi.array().optional().allow(""),
                promo_level:Joi.string().optional().allow(""),
                max_discount_value:Joi.number().optional().allow(0),
                maxUser:Joi.number().required(),
                minPrice:Joi.number().required(),
                perUserCount:Joi.number().required(),
                endDate:Joi.string().required(),
                max_discount_value:Joi.number().optional().allow("").default(0),
                discountPrice:Joi.number().required(),
                startDate:Joi.string().required(),
                details:Joi.array().items(Joi.object().keys({
                    supplierId:Joi.number().required(),
                    categoryId:Joi.number().optional().allow(""),
                    supplierName:Joi.string().optional().allow(""),
                    categoryName:Joi.string().optional().allow(""),
                })).required(),
                discountType:Joi.number().required(),
                firstTime:Joi.number().required(),
                sectionId:Joi.number().optional().allow(""),
                bear_by : Joi.number().required(),
                commission_on : Joi.number().required(),
                promo_user_subscription_type:Joi.number().optional().allow("")
    }
}),
Controller.PromoController.Update
)



}