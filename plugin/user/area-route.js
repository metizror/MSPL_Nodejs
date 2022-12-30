
var AreaController=require('../../controller/user/areaController')
var Auth=require('../../lib/Auth')
var category=require('../../routes/category')
const Joi = require('joi')
const expressJoi = require('express-joi-validator');

module.exports=(app)=>{
/**
 * @swagger
 * /get_area:
 *   post:
 *     description: api used for getting an area
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: pincode
 *         required: true
 *         type: string
 *       - in: formData
 *         name: languageId
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/get_area',
Auth.userAuthenticate,
Auth.checkCblAuthority,
expressJoi({
    body: 
    {  
        pincode:Joi.string().required(),
        languageId:Joi.number().required()
    }
}),
AreaController.GetArea
)






/**
 * @swagger
 * /user/get_zone:
 *   get:
 *     description: api used for getting an area
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         type: number
 *       - in: query
 *         name: longitude
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/user/get_zone',
// Auth.userAuthenticate,
// Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({
    query: 
    {  
        latitude:Joi.number().required(),
        longitude:Joi.number().required()
    }
}),
AreaController.GetUserZone
)


}