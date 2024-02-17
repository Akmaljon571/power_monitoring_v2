const mongoose = require("mongoose")
const { parameterValueModel } = require("../../models")
const CustomError = require("../../utils/custom_error")

module.exports.parameterValueRepository = () => {
    return Object.freeze({
        insert,
        findLastInserted,
        findLastInsertedCurrent,
        findTodayList
    })

    async function insert(model,args) {
        try {
            let modelname = model ? "parameter_values_"+ model: "parameter_values"
            await parameterValueModel(modelname).insertMany(args)
        } catch (err) {
            throw new CustomError(500, err.message)
        }
    }

    async function findLastInserted(query) {
        try {
            let modelname = "parameter_values"
            const pipArray = [
                {
                   $match:{
                      parameter: new mongoose.Types.ObjectId(query.parameter) 
                   }
                },
                {
                    $sort: {
                        date: -1
                    }
                },
                {
                    $limit: 1
                }
            ]
            if (query.channel_type && query.parameter_type && query.channel_type !== "") {
                pipArray.unshift({
                    $match: {
                        "parameter.parameter_type": query.parameter_type
                    }
                 })
                pipArray.unshift({
                    $match: {
                        "parameter.channel_type": query.channel_type
                    }
                 })
                pipArray.unshift({
                    $lookup: {
                        from: "parameters",
                        foreignField: "_id",
                        localField: "parameter",
                        as: "parameter"
                    }
                })
                
            }

            const parameterDocument = await parameterValueModel(modelname).aggregate(pipArray)
            return parameterDocument[0]
        } catch (err) {
            throw new CustomError(500, err.message)
        }
    }

    async function findLastInsertedCurrent(query) {
        try {
            let modelname =  "parameter_values_" + new Date().getFullYear() + (new Date().getMonth() + 1 )
             
            const pipArray = [
                {
                    $sort: {
                        date: -1
                    }
                },
                {
                    $limit: 1
                }
            ]


            let parameterDocument = await parameterValueModel(modelname).aggregate(pipArray)
            if(parameterDocument.length === 0){
                modelname = "parameter_values_" + new Date().getFullYear() + (new Date().getMonth())
                parameterDocument = await parameterValueModel(modelname).aggregate(pipArray)
             }
            return parameterDocument[0]
        } catch (err) {
            throw new CustomError(500, err.message)
        }
    }

    async function findTodayList(dateTime) {
        try {
            const date = new Date(dateTime)
            date.setUTCHours(0)
            const parameterDocument = await parameterValueModel('parameter_values').find({param_short_name: 'energyarchive_A+'})
            const todayDatas = parameterDocument.filter(e => new Date(e.date) - new Date(date) >= 0).sort((a, b) => a.date - b.date)
            let obj = {
                time: 0,
                last_add: date,
            }
            const reverseData = todayDatas.reverse()
            if (todayDatas.length > 2) {
                obj = {
                    time: reverseData[0].date  - reverseData[1].date,
                    last_add: reverseData[0].date,
                }
            }
            return obj
        } catch (err) {
            throw new CustomError(500, err.message)
        }
    }
}
