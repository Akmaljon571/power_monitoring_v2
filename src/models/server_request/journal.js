const mongoose = require("mongoose")

const journalSchema = new mongoose.Schema({
    request_type:{
        type:String,
        enum:["current","archive"]
    },
    parameter:{type:mongoose.Schema.Types.ObjectId,ref:"parameter"},
    meter:{type:mongoose.Schema.Types.ObjectId,ref:"meter"},
    status:{
        type:String,
        enum:["sent","failed","succeed"]
    }
},{
    timestamps:true
})

module.exports.journalModel = mongoose.model("journal",journalSchema)
