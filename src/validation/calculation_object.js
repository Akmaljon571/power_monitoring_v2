const Joi = require("joi")
const CustomError = require("../utils/custom_error")

const type_folder_enum = ["main","child","meter"]

module.exports.creatCalculationFolder =  async (data) => {
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

module.exports.updateCalculationFolder =  async (data) => {
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

module.exports.attachParamsCalculationJoi =  async (data) => {
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