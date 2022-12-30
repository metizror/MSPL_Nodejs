
var AgentServiceCntrl=require('../../controller/user/agentServiceController')
var Auth=require('../../lib/Auth')
var category=require('../../routes/category')
const Joi = require('joi')
const expressJoi = require('express-joi-validator');

module.exports=(app)=>{
/**
 * @swagger
 * /agent/get_agent_keys:
 *   post:
 *     description: api used for listing an agent keys
 *     tags:
 *       - App API`S
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/agent/get_agent_keys',Auth.checkCblAuthority,Auth.userAuthenticate,AgentServiceCntrl.KeyList,)
}