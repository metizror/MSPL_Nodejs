
var RateCntrl=require('../../controller/user/ratingController')
var Auth=require('../../lib/Auth')
var category=require('../../routes/category')
const Joi = require('joi')
const expressJoi = require('express-joi-validator');

module.exports=(app)=>{
/**
 * @swagger
 * /rate_product:
 *   post:
 *     description: api used for rating an product
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: value
 *         required: true
 *         type: string
 *       - in: formData
 *         name: product_id
 *         required: true
 *         type: string
 *       - in: formData
 *         name: reviews
 *         required: false
 *         type: string
 *       - in: formData
 *         name: title
 *         required: false
 *         type: string
 *       - in: formData
 *         name: order_id
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/rate_product',

Auth.userAuthenticate,
Auth.checkCblAuthority,

expressJoi({
    body: 
    {  
        value:Joi.number().required(),
        reviews:Joi.string().optional().allow(""),
        order_id:Joi.string().optional().allow(""),
        product_id:Joi.number().required(),
        title:Joi.string().optional().allow(""),
    }
}),
RateCntrl.AddRating
)

app.post('/is_rating_skip',

Auth.userAuthenticate,
Auth.checkCblAuthority,

expressJoi({
    body: 
    {  
       languageId:Joi.number().optional().allow(""),
       accessToken:Joi.string().optional().allow(""),
       order_id:Joi.array().items(Joi.number()).required()
    }
}),
RateCntrl._skipByRating)



/**
 * @swagger
 * /product_rating_review:
 *   get:
 *     description: api used for getting an all rating and reviews of product
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: product_id
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/product_rating_review',
Auth.storeDbInRequest,
Auth.checkCblAuthority,
expressJoi({
    query: 
    {  
        product_id:Joi.number().required()
    }
}),
RateCntrl.ProductRatingReview
)
}