const mongoose = require("mongoose")
const folderSchema = new mongoose.Schema({
    name:{
        type:String
    },
    folder_type:{
        type:String,
        enum:["folder","uspd","meter"]
    },
    parent_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"folders"
    },
    uspd:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"uspds"
    },
    meter:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"meter"
    }
})

module.exports.folderModel = mongoose.model("folders",folderSchema)
