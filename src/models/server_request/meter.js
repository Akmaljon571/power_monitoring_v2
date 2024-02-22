const mongoose = require("mongoose")
const { statusEnum, connection_channel, meter_form, attached, period_type } = require("../../global/enum")
const { meterListReadFile } = require("../../global/meter-list")

const meterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: statusEnum,
        default: "active"
    },
    // folder:{
    //     type:mongoose.Schema.Types.ObjectId,
    //     ref:"folders"
    // },
    // uspd:{
    //     type:mongoose.Schema.Types.ObjectId,
    //     ref:"uspds" 
    // },
    attached: {
        type: String,
        enum: attached,
        default: "0"
    },
    meter_type: {
        type: String,
        enum: meterListReadFile()
    },
    meter_form: {
        type: String,
        enum: meter_form
    },
    number_meter: {
        type: String
    },
    connection_address: {
        type: String
    },
    password: {
        type: String
    },
    connection_channel: {
        type: String,
        enum: attached
    },
    ip_address: {
        type: String
    },
    port: {
        type: String
    },
    waiting_time: {
        type: Number
    },
    interval_time: {
        type: Number
    },
    pause_time: {
        type: Number
    },
    package_size: {
        type: Number
    },
    com_port: {
        type: String
    },
    init_line: {
        type: String
    },
    phone_number: {
        type: String
    },
    period_type: {
        type: String,
        enum: period_type
    },
    days_of_month: {
        type: [Number]
    },
    days_of_week: {
        type: [Number]
    },
    hours_of_day: {
        type: [{ hour: Number, minutes: [Number] }],
        default: []
    },
    data_polling_length: {
        type: String
    },
    data_refresh_length: {
        type: Number
    },
    parameterIds: {
        type: [String]
    },
    time_difference: {
        type: Number
    }
})

module.exports.meterModel = mongoose.model("meter", meterSchema)

