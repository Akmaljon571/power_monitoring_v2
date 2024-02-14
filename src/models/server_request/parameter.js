const mongoose = require("mongoose")
const { channelFullIdNameList_enum, parameterShortNamesList_enum, status_enum, parameter_type_enum } = require("../../../validators/meter")

const parameterSchema = new mongoose.Schema({
    param_meter_type:{
        type:String,
        enum:["meter","uspd"],
        required:true
    },
    status:{
        type:String,
        enum: status_enum,
        default:"active"
    },
    channel_full_id:{
        type:String,
        required:true,
        enum: channelFullIdNameList_enum
    },
    parameter_type:{
        type:String,
        enum: parameter_type_enum,
        required:true,
    },
    param_short_name:{
       type:String,
       required:true,
       enum: parameterShortNamesList_enum
    },
    param_name:{
        type:String
    },
    meter:{type:mongoose.Schema.Types.ObjectId,ref:"meter"}
})


module.exports.parameterModel = mongoose.model("parameter",parameterSchema)
