const mongoose = require("mongoose")
const { meterModel } = require("../../models")
const CustomError = require("../../utils/custom_error")

module.exports.meterRepository = () => {
    return Object.freeze({
        insert,
        findAll,
        find,
        findOne,
        findById,
        countDocuments,
        updateOne
    })

    async function countDocuments(args){
        try {
            return await meterModel.countDocuments(args)
        } catch (err) {
            throw new CustomError(500, err.message)
        }
    }

    async function insert(args) {
        try {
            const newMeterDocument = await meterModel.create(args)
            return newMeterDocument
         
        } catch (err) {
            throw new CustomError(500, err.message)
        }
    }

    async function find() {
        try {
            return await meterModel.find()
        } catch (error) {
           throw new CustomError(error.status, error.message) 
        }
    }

    async function findAll(query){
        try{
              const subPipArray = [
                { $match: { parameter_type : { $ne: null } } }
              ]
              if(query && query.subquery){
                subPipArray.push({$match:{parameter_type:query.subquery.parameter_type}})
              }
              const pipArray = [
                 {
                    $lookup:{
                        from:"parameters",
                        foreignField:"meter",
                        localField:"_id",
                        pipeline:subPipArray,
                        as:"parameters"
                    }
                }
              ]
               const meterDocuments = await meterModel.aggregate(pipArray)
               return meterDocuments
        }catch(err){
              throw new CustomError(500, err.message)
        }
    }
 
    async function findById(_id) {
        try {
            return await meterModel.findById({_id})
        } catch (error) {
            throw new CustomError(500, err.message)
        }
    }

    async function findOne(id){
        try{
            const meterDocuments = await meterModel.aggregate([
                {
                    $match:{ _id: new mongoose.Types.ObjectId(id) }
                },
                {   
                    $lookup:{
                        from:"parameters",
                        foreignField:"meter",
                        localField:"_id",
                        as:"parameters"
                    }
                }
            ])
             return meterDocuments[0]
        }catch(err){
           throw new CustomError(500, err.message)
        }
    }
    
    async function updateOne(id,args){
        try{
            let meter_param = {
                name: args.name,
                meter_type: args.meter_type,
                number_meter: args.number_meter,
                meter_form: args.meter_form,
                connection_address: args.connection_address,
                password: args.password,
                connection_channel: args.connection_channel,
                ip_address: args.ip_address,
                port: args.port,
                waiting_time: args.waiting_time,
                interval_time: args.interval_time,
                pause_time: args.pause_time,
                package_size: args.package_size,
                com_port: args.com_port,
                init_line: args.init_line,
                phone_number: args.phone_number,
                data_polling_length: args.data_polling_length,
                data_refresh_length: args.data_refresh_length,
                period_type: args.period_type,
                days_of_month: args.days_of_month,
                days_of_week: args.days_of_week,
                hours_of_day: args.hours_of_day
            }
            const meterDocuments = await meterModel.updateOne({
                _id:id
            },meter_param)
             return meterDocuments
        }catch(err){
           throw new CustomError(500, err.message)
        }
    }
    
}