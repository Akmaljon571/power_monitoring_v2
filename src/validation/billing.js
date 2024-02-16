const Joi = require("joi")

module.exports.billingGetJoi = Joi.object().keys({
    date1: Joi.string().required(),
    date2: Joi.string().required(),
}).required()
