
var countryCodesCntrl=require('../../controller/admin/countryCodesController')
var Auth=require('../../lib/Auth')
// var category=require('../routes/category')
const Joi = require('joi')
const expressJoi = require('express-joi-validator');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

module.exports=(app)=>{
/**
 * @swagger
 * /admin/list_country_codes:
 *   get:
 *     description: For Brand list Api
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
app.get('/admin/list_country_codes',

Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,

expressJoi({query: {
                limit:Joi.number().required(),
                skip:Joi.number().required()
    }
}),
countryCodesCntrl.listCountryCodes
)
/**
 * @swagger
 * /admin/add_update_country_code:
 *   post:
 *     description: For adding an country code
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: country_code
 *         required: true
 *         type: string
 *       - in: body
 *         name: iso
 *         required: true
 *         type: string
 *       - in: body
 *         name: flag_image
 *         required: true
 *         type: string
 *       - in: body
 *         name: country_name
 *         required: true
 *         type: string
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
app.post('/admin/add_update_country_code',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: {
    country_code:Joi.string().required(),  
    iso:Joi.string().required(),
    flag_image:Joi.string().required(),
    country_name:Joi.string().required(),
    id:Joi.number().optional().allow("")
    }
}),
countryCodesCntrl.addUpdateCountryCode
)

/**
 * @swagger
 * /admin/delete_country_code:
 *   post:
 *     description: For deleting an country code
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: brandIds
 *         required: true
 *         schema:
 *           type:array
 *       - in: formData
 *         name: cat_id
 *         required: true
 *         type: number
 *       - in: formData
 *         name: sectionId
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/admin/delete_country_code',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: {
    id:Joi.number().required()
    }
}),
countryCodesCntrl.deleteCountryCodes
)
}