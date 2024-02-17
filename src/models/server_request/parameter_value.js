const mongoose = require("mongoose")
const parameterValueSchema = new mongoose.Schema({
    value:{
        type:Number,
        required:true
    },
    date:{
        type:Date,
        index:true
    },
    state:{
        type:Number
    },
    tariff:{
        type:Number,
        enum:[0,1,2,3,4,5,6,7,8]
    },
    parameter:{type:mongoose.Schema.Types.ObjectId,ref:"parameter", index:true}
})

module.exports.parameterValueModel = function(modelname){
    return mongoose.model(modelname,parameterValueSchema)
} 