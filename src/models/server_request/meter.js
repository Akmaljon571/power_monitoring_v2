const mongoose = require("mongoose")
const { statusEnum, meter_form, period_type, attachedEnum, baudRateEnum, parityEnum, stopBitEnum, dataBitEnum } = require("../../global/enum")
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
        enum: attachedEnum,
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
        enum: attachedEnum,
        require: true
    },
    ip_address: {
        type: String
    },
    port: {
        type: String
    },
    comport: {
        type: String
    },
    baud_rate: {
        type: String,
        enum: baudRateEnum
    },
    parity: {
        type: String,
        enum: parityEnum
    },
    stop_bit: {
        type: String,
        enum: stopBitEnum
    },
    data_bit: {
        type: String,
        enum: dataBitEnum
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

