const mongoose = require("mongoose")

const billingSchema = new mongoose.Schema({
    summa_A1:{
        type:Number,
        required:true
    },
    summa_A0:{
        type:Number,
        required:true
    },
    summa_R0:{
        type:Number,
        required:true
    },
    summa_R1:{
        type:Number,
        required:true
    },
    tarif1_A1: {
        type:Number,
        required:true
    },
    tarif2_A1: {
        type:Number,
        required:true
    },
    tarif3_A1: {
        type:Number,
        required:true
    },
    tarif4_A1: {
        type:Number,
        required:true
    },
    tarif1_A0: {
        type:Number,
        required:true
    },
    tarif2_A0: {
        type:Number,
        required:true
    },
    tarif3_A0: {
        type:Number,
        required:true
    },
    tarif4_A0: {
        type:Number,
        required:true
    },
    tarif1_R1: {
        type:Number,
        required:true
    },
    tarif2_R1: {
        type:Number,
        required:true
    },
    tarif3_R1: {
        type:Number,
        required:true
    },
    tarif4_R1: {
        type:Number,
        required:true
    },
    tarif1_R0: {
        type:Number,
        required:true
    },
    tarif2_R0: {
        type:Number,
        required:true
    },
    tarif3_R0: {
        type:Number,
        required:true
    },
    tarif4_R0: {
        type:Number,
        required:true
    },
    meter_id: {type:mongoose.Schema.Types.ObjectId,ref:"meter"},
    date: {
        type:Date,
        required: true
    }
})

module.exports.billingModel = mongoose.model("billing", billingSchema)
