const Joi = require("joi")

module.exports.grahpData =  Joi.object().keys({
    type: Joi.string(),
    modelDate: Joi.string(),
    limit: Joi.string(),
    selectedParameters: Joi.string(),
    date1: Joi.string(),
    date2: Joi.string()
}).required()

module.exports.graphArchive = Joi.object().keys({
    selectedParameters: Joi.string(),
    limit: Joi.string(),
    date1: Joi.string(),
    date2: Joi.string()
}).required()
