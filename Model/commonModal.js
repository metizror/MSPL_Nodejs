const Joi = require('joi')

 const questionOption = Joi.object({
    questionOptionId: Joi.number().integer().optional().default(0),
    optionLabel: Joi.string().required(),
    valueChargeType: Joi.number().optional().min(1).max(2),
    flatValue: Joi.number().optional().allow([null,'']).default(null),
    percentageValue: Joi.number().optional().allow([null,'']).default(null),

    // @todo with conditional base
    // flatValue: Joi.alternatives().conditional('valueChargeType', { is: true, then: Joi.number().required() }),
    // percentageValue: Joi.alternatives().conditional('valueChargeType', { is: 2, then: Joi.number().required() }),
  
  }); 

 const question = Joi.object({
    questionId: Joi.number().integer().min(0).optional().default(0),
    question: Joi.string().required(),
    questionTypeSelection:  Joi.number().integer().required(),
    optionsList: Joi.array().items(questionOption).required()
  }); 


  const IdObject = Joi.object({
    Id: Joi.number().integer().min(0).optional().default(0),
  }); 

  exports.IdObjectCommonModal = IdObject;
  exports.questionCommonModal = question;