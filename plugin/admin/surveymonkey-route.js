
var Controller=require('../../controller')
var Auth=require('../../lib/Auth')
const Joi = require('joi')
const expressJoi = require('express-joi-validator');
module.exports=(app)=>{

    /**
 * @swagger
 * /admin/survey/getCode:
 *   get:
 *     description: For Survey Code required to be sent while getting access token
 *     tags:
 *       - Admin Survey API`S
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/admin/survey/getCode',
Auth.authenticateAccessToken,
Auth.checkCblAuthority,
Controller.surveyMonkeyController.getSurveyMonkeyCode
)

/**
 * @swagger
 * /admin/survey/getAccessToken:
 *   get:
 *     description: For Survey Access Token Api
 *     tags:
 *       - Admin Survey API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/admin/survey/getAccessToken',
Auth.authenticateAccessToken,
Auth.checkCblAuthority,
expressJoi({query: {
    code:Joi.string().required()
    }
}),
Controller.surveyMonkeyController.getSurveyMonkeyToken
)

/**
 * @swagger
 * /admin/survey/get:
 *   get:
 *     description: For Survey List/Details Api
 *     tags:
 *       - Admin Survey API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: accessToken
 *         required: true
 *         type: string
 *       - in: query
 *         name: id
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/admin/survey/get',
Auth.authenticateAccessToken,
Auth.checkCblAuthority,
expressJoi({query: {
        accessToken:Joi.string().required(),
        id:Joi.string().optional(),
    }
}),
Controller.surveyMonkeyController.getSurvey
)

/**
 * @swagger
 * /admin/survey_categories/get:
 *   get:
 *     description: For Survey Categories Api
 *     tags:
 *       - Admin Survey API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: accessToken
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/admin/survey_categories/get',
Auth.authenticateAccessToken,
Auth.checkCblAuthority,
expressJoi({query: {
    accessToken:Joi.string().required()
}
}),
Controller.surveyMonkeyController.getSurveyCategories)

/**
 * @swagger
 * /admin/survey_templates/get:
 *   get:
 *     description: For Survey Templates Api
 *     tags:
 *       - Admin Survey API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: accessToken
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/admin/survey_templates/get',
Auth.authenticateAccessToken,
Auth.checkCblAuthority,
expressJoi({query: {
    accessToken:Joi.string().required()
}
}),
Controller.surveyMonkeyController.getSurveyTemplates)



/**
 * @swagger
 * /admin/survey_page/get:
 *   get:
 *     description: For Survey Page List/Details Api
 *     tags:
 *       - Admin Survey API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: accessToken
 *         required: true
 *         type: string
 *       - in: query
 *         name: id
 *         required: true
 *         type: string
 * 
 *       - in: query
 *         name: page_id
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/admin/survey_page/get',
Auth.authenticateAccessToken,
Auth.checkCblAuthority,
expressJoi({query: {
        accessToken:Joi.string().required(),
        id:Joi.string().required(),
        page_id:Joi.string().optional(),
    }
}),
Controller.surveyMonkeyController.getSurveyPage
)


/**
 * @swagger
 * /admin/survey_page_question/get:
 *   get:
 *     description: For Survey Page Questions List/Details Api
 *     tags:
 *       - Admin Survey API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: accessToken
 *         required: true
 *         type: string
 *       - in: query
 *         name: id
 *         required: true
 *         type: string
 * 
 *       - in: query
 *         name: page_id
 *         required: true
 *         type: string
 * 
 *       - in: query
 *         name: question_id
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/admin/survey_page_question/get',
Auth.authenticateAccessToken,
Auth.checkCblAuthority,
expressJoi({query: {
        accessToken:Joi.string().required(),
        id:Joi.string().required(),
        page_id:Joi.string().required(),
        question_id:Joi.string().optional(),
    }
}),
Controller.surveyMonkeyController.getSurveyPageQuestion
)


/**
 * @swagger
 * /admin/survey_response/get:
 *   get:
 *     description: For Survey Response  Api
 *     tags:
 *       - Admin Survey API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: accessToken
 *         required: true
 *         type: string
 *       - in: query
 *         name: id
 *         required: true
 *         type: string
 * 
 *       - in: query
 *         name: response_id
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/admin/survey_response/get',
Auth.authenticateAccessToken,
Auth.checkCblAuthority,
expressJoi({query: {
        accessToken:Joi.string().required(),
        id:Joi.string().required(),
        response_id:Joi.string().optional(),
    }
}),
Controller.surveyMonkeyController.getSurvayResponse
)

/**
 * @swagger
 * /admin/survey_response_bulk/get:
 *   get:
 *     description: For Survey Response  Api
 *     tags:
 *       - Admin Survey API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: accessToken
 *         required: true
 *         type: string
 *       - in: query
 *         name: id
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/admin/survey_response_bulk/get',
Auth.authenticateAccessToken,
Auth.checkCblAuthority,
expressJoi({query: {
        accessToken:Joi.string().required(),
        id:Joi.string().required()
    }
}),
Controller.surveyMonkeyController.getSurvayResponsesBulk
)


/**
 * @swagger
 * /admin/collector_response/get:
 *   get:
 *     description: For Survey Response  Api
 *     tags:
 *       - Admin Survey API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: accessToken
 *         required: true
 *         type: string
 *       - in: query
 *         name: collector_id
 *         required: true
 *         type: string
 * 
 *       - in: query
 *         name: response_id
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/admin/collector_response/get',
Auth.authenticateAccessToken,
Auth.checkCblAuthority,
expressJoi({query: {
        accessToken:Joi.string().required(),
        collector_id:Joi.string().required(),
        response_id:Joi.string().optional(),
    }
}),
Controller.surveyMonkeyController.getCollectorResponse
)

/**
 * @swagger
 * /admin/collector_response_bulk/get:
 *   get:
 *     description: For Survey Response  Api
 *     tags:
 *       - Admin Survey API`S
 *     produces:
 *       - application/json
 *     parameters:  
 *       - in: query
 *         name: accessToken
 *         required: true
 *         type: string
 *       - in: query
 *         name: collector_id
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/admin/collector_response_bulk/get',
Auth.authenticateAccessToken,
Auth.checkCblAuthority,
expressJoi({query: {
        accessToken:Joi.string().required(),
        collector_id:Joi.string().required()
    }
}),
Controller.surveyMonkeyController.getCollectorResponsesBulk
)


}