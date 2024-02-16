const Joi = require("joi")

module.exports.grahpData =  Joi.object().keys({
    type: Joi.string(),
    modelDate: Joi.string(),
    limit: Joi.string(),
    selectedParameters: Joi.string(),
    date1: Joi.string(),
    date2: Joi.string()
}).required()

module.exports.validatorUpdateAdmin = Joi.object().keys({
    type: Joi.string(),
    limit: Joi.string(),
    modelDate: Joi.string(),
    selectedParameters: Joi.string(),
    date1: Joi.string(),
    date2: Joi.string()
}).required()
