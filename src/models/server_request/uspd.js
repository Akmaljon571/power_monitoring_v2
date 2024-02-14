const mongoose = require("mongoose")
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
        enum:["245","246","247","248"]
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


