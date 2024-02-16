const mongoose = require("mongoose")
const { connection_channel_enum } = require("../../validation/uspd")
const uspdSchema = new mongoose.Schema({
    name:{
        type:String
    },
    ipAddress:{
        type:String
    },
    port:{
        type:String
    },
    connection_channel:{
        type:String,
        enum: connection_channel_enum
    },
    number_uspd:{
        type:String
    },
    timeDifference:{
         type:Number
    },
    login:{
        type:String
    },
    password:{
        type:String
    }
})

module.exports.uspdModel = mongoose.model("uspds",uspdSchema)


