const mongoose = require("mongoose")

const calculationObject = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["main","child", "meter"]
    },
    meter_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "meter",
        require: false
    },
    parent_object: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "calculation_object"
    },
    parameters: [
        {
            parameter_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "parameter"
            },
            sign: {
                type: Boolean
            },
            multiply: {
                type: [Number],
                default:[1]
            }
        }
    ]
}, {
    timestamps: true
})

module.exports.calculationObjectModel = mongoose.model("calculation_object", calculationObject)
