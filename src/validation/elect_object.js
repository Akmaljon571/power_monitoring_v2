const Joi = require("joi")
const CustomError = require("../utils/custom_error")

const type_enum = ["factory", "substation", "tire_section", "feeder", "meter"]
const type_folder_enum = ["factory", "substation", "tire_section", "feeder"]
const type_meter_enum = ["meter"]

module.exports.createElectFolder =  async (data) => {
    try {
        const schema = Joi.object().keys({
            name: Joi.string().required(),
            type: Joi.valid(...type_folder_enum).required(),
            parent_object: Joi.string(),
        })
        const { error, result } = schema.validate(data)
        if (error) {
            throw new CustomError(400, error.message)
        }
    } catch (error) {
        throw new CustomError(400, error.message)
    }
}

module.exports.createElectMeter =  async (data) => {
    try {
        const schema = Joi.object().keys({
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
        })
        const { error, result } = schema.validate(data)
        if (error) {
            throw new CustomError(400, error.message)
        }
    } catch (error) {
        throw new CustomError(400, error.message)
    }
}

module.exports.updateElectFolder =  async (data) => {
    try {
        const schema = Joi.object().keys({
            id: Joi.string().required(),
            name: Joi.string().required()
        })
        const { error, result } = schema.validate(data)
        if (error) {
            throw new CustomError(400, error.message)
        }
    } catch (error) {
        throw new CustomError(400, error.message)
    }
}

module.exports.updateElectMeter =  async (data) => {
    try {
        const schema = Joi.object().keys({
            id: Joi.string().required(),
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
        })
        const { error, result } = schema.validate(data)
        if (error) {
            throw new CustomError(400, error.message)
        }
    } catch (error) {
        throw new CustomError(400, error.message)
    }
}

module.exports.attachParamsElectJoi =  async (data) => {
    try {
        const schema = Joi.object().keys({
            id: Joi.string().required(),
            parameters: Joi.array().items(
                Joi.object().keys({
                    parameter_id: Joi.string().required(),
                    sign: Joi.boolean().required()
                }).required()
            ).required()
        })
        const { error, result } = schema.validate(data)
        if (error) {
            throw new CustomError(400, error.message)
        }
    } catch (error) {
        throw new CustomError(400, error.message)
    }
}

module.exports.type_enum = type_enum
