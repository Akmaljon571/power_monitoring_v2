const mongoose = require("mongoose")

const electObjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["factory", "substation", "tire_section", "feeder", "meter"]
    },
    parent_object: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "elect_object"
    },
    meter_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "meter",
        require: false
    },
    vt: {
        dividend: Number,
        divisor: Number
    },
    ct: {
        dividend: Number,
        divisor: Number
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

module.exports.electObjectModel = mongoose.model("elect_object", electObjectSchema)
