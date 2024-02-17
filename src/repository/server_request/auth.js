const { authSchema } = require("../../models");
const CustomError = require("../../utils/custom_error")

module.exports.authRepository = () => {
    return Object.freeze({
        insert,
        findOne,
        remove,
    })

    async function insert(data){
        try{
            return await authSchema.create(data)
        }catch(err){
            throw new CustomError(500, err.message)
        }
    }

    async function findOne(check) {
        try {
            return await authSchema.findOne(check)
        } catch (error) {
            throw new CustomError(500, err.message)
        }
    }

    async function remove(check) {
        try {
            return await authSchema.deleteOne(check)
        } catch (error) {
            throw new CustomError(500, err.message)
        }
    }
}