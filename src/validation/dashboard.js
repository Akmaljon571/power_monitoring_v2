const Joi = require("joi")

module.exports.dashboardDataJoi = Joi.object().keys({
    childObjects: Joi.string().optional(),
    getParameters: Joi.string().optional(),
    selectedParameters: Joi.string().optional(),
    year: Joi.string().optional(),
    month: Joi.string().optional(),
}).required()

module.exports.dashboardRealTimeJoi = Joi.object().keys({
    year: Joi.string().optional(),
    month: Joi.string().optional(),
}).required()

module.exports.dashboardRealTimeCaltulationJoi = Joi.object().keys({
    param_list: Joi.string().optional(),
}).required()
