const Joi = require("joi")

const type_folder_enum = ["main","child","meter"]

module.exports.billingGetJoi = Joi.object().keys({
    date1: Joi.string().required(),
    date2: Joi.string().required(),
}).required()
