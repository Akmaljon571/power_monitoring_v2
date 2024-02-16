const Joi = require("joi")

const type_folder_enum = ["main","child","meter"]

module.exports.creatCalculationFolder = Joi.object().keys({
    name: Joi.string().required(),
    type: Joi.valid(...type_folder_enum).required(),
    parent_object: Joi.string(),
}).required()

module.exports.updateCalculationFolder = Joi.object().keys({
    name: Joi.string().required()
}).required()

module.exports.attachParamsCalculationJoi = Joi.object().keys({
    parameters: Joi.array().items(
        Joi.object().keys({
            parameter_id: Joi.string().required(),
            sign: Joi.boolean().required()
        }).required()
    ).required()
}).required()
