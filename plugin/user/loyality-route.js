var Auth=require('../../lib/Auth')
var category=require('../../routes/category')
const Joi = require('joi')
const expressJoi = require('express-joi-validator');
const Controller=require('../../controller');
module.exports=(app)=>{
/**
 * @swagger
 * /user/loyality:
 *   get:
 *     description: api used for getting an loyality data like level,point,earning point etc
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/user/loyality',
    Auth.userAuthenticate,
    Auth.checkCblAuthority,
    Controller.UserController.userLoyalityData
)
}