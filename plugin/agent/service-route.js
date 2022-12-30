
var Cntrl=require('../../controller/')
var Auth=require('../../lib/Auth')
var category=require('../../routes/category')
const Joi = require('joi')
const expressJoi = require('express-joi-validator');
module.exports=(app)=>{
/**
 * @swagger
 * /agent/service_list:
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
app.get('/agent/service_list',
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({
    query: 
    {  
        branchId:Joi.string().optional().allow(0),
        limit:Joi.number().required(),
        offset:Joi.number().required(),
        languageId : Joi.number().optional().allow(0),
        agentId : Joi.number().optional().allow(0),
        category_id : Joi.number().optional().allow(0)

    }
}),
Cntrl.agentserviceCntrl.serviceListForAgent
)
}