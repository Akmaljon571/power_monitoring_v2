const mongoose = require("mongoose")

const previousSchema = new mongoose.Schema({
    meter_id:{type:mongoose.Schema.Types.ObjectId,ref:"meter"},
    billing:{
        type: Date,
        required:true,
    },
    archive:{
        type: Date,
        required:true,
    },
})


module.exports.previousModel = mongoose.model("previous",previousSchema)
