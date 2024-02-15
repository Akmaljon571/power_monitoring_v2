const mongoose = require("mongoose")
const adminSchema = new mongoose.Schema({
    name: String,
    login: {
        type: String,
        unique: true
    },
    password: String,
    role: {
        type: String,
        enum: ["super", "admin"],
        default: "super"
    },
    active: {
        type: Boolean,
        default: true
    },
    last_active: {
        type: String, 
        default: ''
    },
    open_page: [{
        type: String,
        default: ['1']
    }]
})

module.exports.adminModel = mongoose.model("admin", adminSchema)