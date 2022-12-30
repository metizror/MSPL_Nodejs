const Joi = require('joi')

const {IdObjectCommonModal} = require('./commonModal');

const deleteQuestionId = Joi.object({
    Id:  Joi.number().integer().required().min(1),
  }); 


  exports.deleteQuestionsByQuestionIds = {
    accessToken:Joi.string().required(),
    questions: Joi.array().items(Joi.number().integer().required().min(1)).required()
    };


  exports.getQuestionsByCategoryId = {
    categoryId:Joi.number().required().min(1),
    languageId:Joi.number().optional().min(1)
  };

  exports.getAllQuestionsDetailByCategoryId = {
    categoryId:Joi.number().required().min(1)
  };

  

  exports.getQuestionByQuestionId = {
    questionId:Joi.number().required().min(1),
  };



  // exports.saveQuestionsByCategoryId ={
  //   accessToken:Joi.string().required(),
  //   categoryId:Joi.number().required(),
  //   questions: Joi.array().items(question).required()
  //   };


 const questionOption = Joi.object({
  questionOptionId: Joi.number().integer().optional().default(0),
  optionLabel: Joi.string().required(),
  optionLabel_ar: Joi.string().optional().allow(""),
  valueChargeType: Joi.number().optional().min(1).max(2),
  flatValue: Joi.number().optional().allow([null,'']).default(null),
  percentageValue: Joi.number().optional().allow([null,'']).default(null),
}); 

  const questionModal = Joi.object({
    questionId: Joi.number().integer().min(0).optional().default(0),
    question: Joi.string().required(),
    question_ar: Joi.string().optional().allow(""),
    questionTypeSelection:  Joi.number().integer().required(),
    optionsList: Joi.array().items(questionOption).required()
  }); 


    exports.editQuestion ={
        accessToken:Joi.string().required(),
        categoryId:Joi.number().required(),
        questions: Joi.array().items(questionModal).required()
        };

exports.getSupplierByServiceId  ={
  languageId:Joi.number().integer().min(1).required(),
  areaId:Joi.number().integer().min(1).optional().default(47),
  serviceIds: Joi.array().items(IdObjectCommonModal).required(),
  user_id: Joi.number().integer().min(1).optional()
};
    
    