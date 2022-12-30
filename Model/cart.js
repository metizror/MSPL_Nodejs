const Joi = require('joi');

const {questionCommonModal} = require('./commonModal');


exports.questionSaveInCartOrOrder ={
    questions: Joi.array().items(questionCommonModal).required()
};

