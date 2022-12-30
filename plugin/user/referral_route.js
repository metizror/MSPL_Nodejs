
var Auth=require('../../lib/Auth')
var category=require('../../routes/category')
const Joi = require('joi')
const expressJoi = require('express-joi-validator');
const Controller=require('../../controller');
module.exports=(app)=>{
/**
 * @swagger
 * /user/myReferral:
 *   get:
 *     description: api used for getting an list of user refered by me
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
app.get('/user/myReferral',
    Auth.userAuthenticate,
    Auth.checkCblAuthority,
    Controller.UserController.getMyReferralData
)
/**
 * @swagger
 * /user/referralAmount:
 *   get:
 *     description: api used for getting an list of user refered by me
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
app.get('/user/referralAmount',
    Auth.userAuthenticate,
    Auth.checkCblAuthority,
    Controller.UserController.myReferralAmount
)
}