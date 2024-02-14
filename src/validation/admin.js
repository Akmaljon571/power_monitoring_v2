const Joi = require("joi")
const CustomError = require("../utils/custom_error")

module.exports.validatorAddAdmin = async (data) => {
   const schema = Joi.object().keys({
      name: Joi.string(),
      login: Joi.string().required(),
      password: Joi.string().required(),
      role: Joi.string().valid("admin", "super"),
      token: Joi.string().required(),
      open_page: Joi.array().required()
   }).required()
   const { error, result } = schema.validate(data)
   if (error) {
      throw new CustomError(400, error.message)
   }
}

module.exports.validatorUpdateAdmin = async (data) => {
   const schema = Joi.object().keys({
      id: Joi.string().required(),
      name: Joi.string(),
      login: Joi.string(),
      password: Joi.string(),
      role: Joi.string().valid("admin", "super"),
      open_page: Joi.array(),
      token: Joi.string().required()
   }).required()
   const { error, result } = schema.validate(data)
   if (error) {
      throw new CustomError(400, error.message)
   }
}

module.exports.validateDeleteAdmin = async (data) => {
   const schema = Joi.object().keys({
      id: Joi.string().required(),
      token: Joi.string().required()
   }).required()
   const { error, result } = schema.validate(data)
   if (error) {
      throw new CustomError(400, error.message)
   }
}
