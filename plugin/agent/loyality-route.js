
var Cntrl=require('../../controller')
var Auth=require('../../lib/Auth')
var category=require('../../routes/category')
const Joi = require('joi')
const expressJoi = require('express-joi-validator');
module.exports=(app)=>{
/**
 * @swagger
 * /agent/get_loyality_leve:
 *   get:
 *     description: api used for getting services list for agent
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: branchId
 *         required: true
 *         type: string
 *       - in: query
 *         name: limit
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
app.get('/agent/get_loyality_level',
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({
    query: 
    {  
        agent_id:Joi.number().required()

    }
}),
Cntrl.loyalityCntrl.getLoyalityDetails
)
}