const Joi = require("joi")
const CustomError = require("../utils/custom_error")

const parameterShortNamesList = [
   "energyarchive_A+","energyarchive_A-","energyarchive_R+","energyarchive_R-",
   "energytotal_A+","energytotal_A-","energytotal_R+","energytotal_R-",
   "energytotal_A+_1","energytotal_A-_1","energytotal_R+_1","energytotal_R-_1",
   "energytotal_A+_2","energytotal_A-_2","energytotal_R+_2","energytotal_R-_2",
   "energytotal_A+_3","energytotal_A-_3","energytotal_R+_3","energytotal_R-_3",
   "energytotal_A+_4","energytotal_A-_4","energytotal_R+_4","energytotal_R-_4",

   "energycurrent_A+","energycurrent_A-","energycurrent_R+","energycurrent_R-",
   "voltage_A","voltage_B","voltage_C","voltage_AB","voltage_BC","voltage_AC",
   "current_A","current_B","current_C",
   "frequency",
   "active-power_A","active-power_B","active-power_C","active-power_total",
   "reactive-power_A","reactive-power_B","reactive-power_C","reactive-power_total",
   "full-power_A","full-power_B","full-power_C","full-power_total",
   "coef-active-power_A","coef-active-power_B","coef-active-power_C","coef-active-power_total",
   "coef-reactive-power_A","coef-reactive-power_B","coef-reactive-power_C","coef-reactive-power_total",
   "coef-angel_A", "coef-angel_B", "coef-angel_C","coef-angel_AB", "coef-angel_BC", "coef-angel_CA",
   "total_A+_1", "total_A+_2", "total_A+_3", "total_A+_4",
   "total_A-_1", "total_A-_2", "total_A-_3", "total_A-_4",
   "total_R+_1", "total_R+_2", "total_R+_3", "total_R+_4",
   "total_R-_1", "total_R-_2", "total_R-_3", "total_R-_4", 
]

const channelFullIdNameList = [
   "32.7.0",'52.7.0','72.7.0','31.7.0','51.7.0',
   '71.7.0','14.7.0','21.7.0','41.7.0','61.7.0','23.7.0','43.7.0',
   '63.7.0','29.7.0','49.7.0','69.7.0','33.7.0','53.7.0','73.7.0',
   '13.7.0','81.7.40','81.7.51','81.7.62','1.7.0','2.7.0','3.7.0',
   '4.7.0','9.8.0','15.8.0','1.8.0','2.8.0','3.8.0','4.8.0',
   '81.7.10','81.7.2','81.7.21','81.7.20',
   "1.8.1","1.8.2","1.8.3","1.8.4","2.8.1","2.8.2","2.8.3","2.8.4",
   "3.8.1","3.8.2","3.8.3","3.8.4","4.8.1",
   "4.8.2","4.8.3","4.8.4",
]

const meter_type = ["EX518","TE73","TE73-V2"]

const status = ["active","inactive"]

const connection_channel = ['0','1']

const parameter_type = ["current","archive","total"]

const meter_form = ["uspd","meter"]

const period_type = ["weekly","monthly"]

module.exports.createMeterJoi = Joi.object({
   connection_address: Joi.string().required(),
   connection_channel: Joi.valid(...connection_channel).required(),
   id: Joi.string().required(),
   ip_address: Joi.string().required(),
   meter_form: Joi.valid(...meter_form).required(),
   meter_type: Joi.valid(...meter_type).required(),
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
         channel_full_id: Joi.valid(...channelFullIdNameList).required(),
         param_name: Joi.string().required(),
         param_short_name: Joi.valid(...parameterShortNamesList).required(),
         parameter_type: Joi.valid(...parameter_type).required(),
         status: Joi.valid(...status).required(),
         text: Joi.string().optional().allow('')
   })).required(),
}).required()

module.exports.updateMeterJoi = Joi.object({
   connection_address: Joi.string(),
   connection_channel: Joi.valid(...connection_channel),
   id: Joi.string(),
   ip_address: Joi.string(),
   meter_form: Joi.valid(...meter_form).required(),
   meter_type: Joi.valid(...meter_type),
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
         channel_full_id: Joi.valid(...channelFullIdNameList),
         param_name: Joi.string(),
         param_short_name: Joi.valid(...parameterShortNamesList),
         parameter_type: Joi.valid(...parameter_type),
         status: Joi.valid(...status),
         text: Joi.string().optional().allow('')
   })),
}).required()


module.exports.meter_type_enum = meter_type
module.exports.connection_channel_enum = connection_channel
module.exports.status_enum = status
module.exports.channelFullIdNameList_enum = channelFullIdNameList
module.exports.parameterShortNamesList_enum = parameterShortNamesList
module.exports.parameter_type_enum = parameter_type
module.exports.meter_form_enum = meter_form
module.exports.period_type_enum = period_type
