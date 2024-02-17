const Joi = require('joi')

module.exports.Validation = Joi.object().keys({
    MeterType: Joi.string().required(),
    MeterAddress: Joi.string(),
    MeterPassword: Joi.string().required(),
    commMedia: Joi.number().required(),
    commDetail1: Joi.string().required(),
    commDetail2: Joi.number().required(),
    parity: Joi.string(),
    stopBit: Joi.number(),
    dataBit: Joi.number(),
    ReadingRegister: Joi.array().items(Joi.string()).required(),
    ReadingRegisterTime: Joi.array().items(Joi.number().required()).min(6).max(6)
})