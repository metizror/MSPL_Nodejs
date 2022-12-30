
var DashboardCntrl=require('../../controller/admin/DashboardController')
var Auth=require('../../lib/Auth')
// var category=require('../routes/category')
const Joi = require('joi')
const expressJoi = require('express-joi-validator');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
module.exports=(app)=>{
/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     description: For Creating an new brands
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: end_date
 *         required: true
 *         type: string 
 *       - in: query
 *         name: start_date
 *         required: true
 *         type: string 
 *       - in: query
 *         name: sectionId
 *         required: true
 *         type: string 
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
app.get('/admin/dashboard',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({query: {
                start_date:Joi.string().required(),
                end_date:Joi.string().required(),
                sectionId:Joi.string().optional().allow(""),
                supplier_id : Joi.number().optional().allow()
    }
}),
DashboardCntrl.Dashboard
)

/**
 * @swagger
 * /v2/admin/dashboard:
 *   get:
 *     description: For Creating an new brands
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: end_date
 *         required: true
 *         type: string 
 *       - in: query
 *         name: start_date
 *         required: true
 *         type: string 
 *       - in: query
 *         name: sectionId
 *         required: true
 *         type: string 
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
app.get('/v2/admin/dashboard',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({query: {
                start_date:Joi.string().required(),
                end_date:Joi.string().required(),
                sectionId:Joi.string().optional().allow(""),
                supplier_id : Joi.number().optional().allow(),
                month_filter:Joi.string().optional().allow(""),
                year_filter:Joi.string().optional().allow("")
    }
}),
DashboardCntrl.DashboardV2
)

}