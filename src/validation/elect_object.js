const Joi = require("joi")

const type_enum = ["factory", "substation", "tire_section", "feeder", "meter"]
const type_folder_enum = ["factory", "substation", "tire_section", "feeder"]
const type_meter_enum = ["meter"]

module.exports.createElectFolder = Joi.object().keys({
    name: Joi.string().required(),
    type: Joi.valid(...type_folder_enum).required(),
    parent_object: Joi.string(),
}).required()

module.exports.getQuery = Joi.object().keys({
    type: Joi.valid('meter', 'feeder').required(),
}).required()

module.exports.createElectMeter = Joi.object().keys({
    name: Joi.string().required(),
    type: Joi.valid(...type_meter_enum).required(),
    parent_object: Joi.string().required(),
    meter_id: Joi.string().required(),
    vt: Joi.object().keys({
        dividend: Joi.number().required(),
        divisor: Joi.number().required()
    }).required(),
    ct: Joi.object().keys({
        dividend: Joi.number().required(),
        divisor: Joi.number().required()
    }).required(),
    multiply: Joi.array().items(Joi.number()).required(),
}).required()

module.exports.updateElectFolder = Joi.object().keys({
    name: Joi.string().required()
}).required()

module.exports.updateElectMeter = Joi.object().keys({
    name: Joi.string(),
    vt: Joi.object().keys({
        dividend: Joi.number(),
        divisor: Joi.number()
    }),
    ct: Joi.object().keys({
        dividend: Joi.number(),
        divisor: Joi.number()
    }),
    multiply: Joi.array().items(Joi.number()),
}).required()

module.exports.attachParamsElectJoi = Joi.object().keys({
    parameters: Joi.array().items(
        Joi.object().keys({
            parameter_id: Joi.string().required(),
            sign: Joi.boolean().required()
        }).required()
    ).required()
}).required()

module.exports.type_enum = type_enum
