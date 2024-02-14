const {models} = require("../../models/index")
const CustomError = require("../../../helpers/customError")

module.exports.uspdObjectRepository = () =>{
    return Object.freeze({
           insert,
           findAll,
           updateOne
    })

    async function insert(args) {
            try{
                const uspdDocument = await models().uspdModel.create(args)
                return uspdDocument
            }catch(err){
                throw new CustomError(500, err.message)
            }
    }

    async function updateOne(filter,args){
        try{
            const  uspdDocument = await models().uspdModel.updateOne(filter,{...args})
            return uspdDocument
        }catch(err){
            throw new CustomError(500, err.message)
        }
    }

    async function findAll(){
         
    }


}