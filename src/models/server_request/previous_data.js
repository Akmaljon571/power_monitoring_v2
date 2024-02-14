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
    status:{
        type: Boolean,
        required:true,
        default: false
    }
    // Zapros ketvotimi? status:false
})


module.exports.previousModel = mongoose.model("previous",previousSchema)
