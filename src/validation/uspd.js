const Joi = require("joi")
const { connection_channel_enum } = require("../global/enum")

module.exports.uspdCreateJoi = Joi.object().keys({
    name: Joi.string().required(), 
    port: Joi.string().required(), 
    ipAddress: Joi.string().required(),
    timeDifference: Joi.string().required(),
    login: Joi.string().required(),
    password: Joi.string().required(),
    connection_channel: Joi.valid(...connection_channel_enum).required()
}).required()
            
module.exports.uspdUpdateJoi = Joi.object().keys({
    name: Joi.string(), 
    port: Joi.string(), 
    ipAddress: Joi.string(),
    timeDifference: Joi.string(),
    login: Joi.string(),
    password: Joi.string(),
    connection_channel: Joi.valid(...connection_channel_enum)
}).required()
