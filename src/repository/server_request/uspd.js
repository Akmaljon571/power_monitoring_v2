const {uspdModel} = require("../../models")
const CustomError = require("../../utils/custom_error")

module.exports.uspdObjectRepository = () =>{
    return Object.freeze({
        insert,
        updateOne,
        findById
    })

    async function insert(args) {
        try{
            const uspdDocument = await uspdModel.create(args)
            return uspdDocument
        }catch(err){
            throw new CustomError(500, err.message)
        }
    }

    async function findById(id) {
        try{
            const uspdDocument = await uspdModel.findById(id)
            return uspdDocument
        }catch(err){
            throw new CustomError(500, err.message)
        }
    }

    async function updateOne(filter,args){
        try{
            const  uspdDocument = await uspdModel.updateOne(filter,{...args})
            return uspdDocument
        }catch(err){
            throw new CustomError(500, err.message)
        }
    }
}