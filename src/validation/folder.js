const Joi = require("joi")

module.exports.folderGetJoi = Joi.object().keys({
    limit: Joi.number(),
}).required()
