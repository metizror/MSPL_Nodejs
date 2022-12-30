const Joi = require('joi')

 const {IdObjectCommonModal} = require('./commonModal');


 exports.getGroupDetailById = {
  Id:Joi.number().required().min(1),
};



exports.deleteGroupByIds  ={
  groupIds: Joi.array().items(IdObjectCommonModal).required()
};
  
exports.assignUsersToGroup  ={
  groupId: Joi.number().required().integer().min(1),
  userIds: Joi.array().items(IdObjectCommonModal).required()
};

exports.deleteUsersFromGroup  ={
  groupId: Joi.number().required().integer().min(1),
  userIds: Joi.array().items(IdObjectCommonModal).required()
};



exports.deleteEmployeeDiscountFromGroup  ={
  groupId: Joi.number().required().integer().min(1),
  groupDiscountIds: Joi.array().items(IdObjectCommonModal).required()
};




const employeeDiscountObject = {
  category_id: Joi.number().required().integer().min(1),
  sub_category_id: Joi.number().required().integer().min(1),
  service_id: Joi.number().required().integer().min(1),
  valueChargeType: Joi.number().optional().min(1).max(2),
  flatValue: Joi.number().optional().allow([null,'']).default(null),
  percentageValue: Joi.number().optional().allow([null,'']).default(null)
};

exports.addGroup  ={
  groupName: Joi.string().required(),
  supplierId: Joi.number().required().integer().min(1),
  userIds: Joi.array().items(IdObjectCommonModal).required(),
  employee_discount: Joi.array().items(employeeDiscountObject).required()
};

exports.addEmployeeDiscountToGroup  ={
  groupId: Joi.number().required().integer().min(1),
  employee_discount: Joi.array().items(employeeDiscountObject).required()
};

exports.getUserPrice  ={
  languageId: Joi.number().required().integer().min(1),
  areaId:Joi.number().integer().min(1).optional().default(47),
  serviceIds: Joi.array().items(Joi.number().required().integer().min(1)).required()
};
    

