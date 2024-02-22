const Joi = require("joi")
const { meter_form, parameter_type, period_type, statusEnum, attached } = require("../global/enum")
const { meterListReadFile } = require("../global/meter-list")
const { paramsOBISReadFile, params_short_name_read } = require("../global/file-path")

module.exports.createMeterJoi = (type) => Joi.object({
   connection_address: Joi.string().required(),
   connection_channel: Joi.valid(...attached).required(),
   id: Joi.string().required(),
   ip_address: Joi.string().required(),
   meter_form: Joi.valid(...meter_form).required(),
   meter_type: Joi.valid(...meterListReadFile()).required(),
   name: Joi.string().required(),
   number_meter: Joi.string().required(),
   password: Joi.string().required(),
   port: Joi.number().required(),
   waiting_time: Joi.number(),
   interval_time: Joi.number(),
   pause_time: Joi.number(),
   package_size: Joi.number(),
   time_difference: Joi.number(),
   days_of_month: Joi.array().items(Joi.number()),
   period_type: Joi.valid(...period_type),
   data_polling_length: Joi.string(),
   data_refresh_length: Joi.string(),

   hours_of_day: Joi.array().items(
      Joi.object({
         hour: Joi.number().required(),
         minutes: Joi.array().items(Joi.number()).required()
      })
   ).optional(),

   parameters: Joi.array().items(
      Joi.object({
         channel_full_id: Joi.valid(...paramsOBISReadFile(type)).required(),
         param_name: Joi.string().required(),
         param_short_name: Joi.valid(...params_short_name_read(type)).required(),
         parameter_type: Joi.valid(...parameter_type).required(),
         status: Joi.valid(...statusEnum).required(),
         text: Joi.string().optional().allow('')
      }
      )).required(),
}).required()

module.exports.updateMeterJoi = (type) =>  Joi.object({
   connection_address: Joi.string(),
   connection_channel: Joi.valid(...attached),
   id: Joi.string(),
   ip_address: Joi.string(),
   meter_form: Joi.valid(...meter_form).required(),
   meter_type: Joi.valid(...meterListReadFile()),
   name: Joi.string(),
   number_meter: Joi.string(),
   password: Joi.string(),
   port: Joi.number(),
   waiting_time: Joi.number(),
   interval_time: Joi.number(),
   pause_time: Joi.number(),
   package_size: Joi.number(),
   time_difference: Joi.number(),
   days_of_month: Joi.array().items(Joi.number()),
   period_type: Joi.valid(...period_type),
   data_polling_length: Joi.string(),
   data_refresh_length: Joi.string(),

   hours_of_day: Joi.array().items(
      Joi.object({
         hour: Joi.number(),
         minutes: Joi.array().items(Joi.number())
      })
   ).optional(),

   parameters: Joi.array().items(
      Joi.object({
         channel_full_id: Joi.valid(...paramsOBISReadFile(type)),
         param_name: Joi.string(),
         param_short_name: Joi.valid(...params_short_name_read(type)),
         parameter_type: Joi.valid(...parameter_type),
         status: Joi.valid(...statusEnum),
         text: Joi.string().optional().allow('')
      })),
}).required()
