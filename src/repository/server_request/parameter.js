const { parameterModel } = require("../../models")
const CustomError = require("../../utils/custom_error")

module.exports.parameterRepository = () => {
    return Object.freeze({
        findOne,
        insert,
        findMeter,
        findAll,
        countDocuments,
        updateMany
    })

    async function countDocuments(args) {
        try {
            return await parameterModel.countDocuments(args)
        } catch (err) {
            throw new CustomError(500, err.message)
        }
    }

    async function findMeter(query) {
        try {
            const paramDocuments = await parameterModel.find(query)
            return paramDocuments
        } catch (err) {
            throw new CustomError(500, err.message)
        }
    }

    async function findOne(query) {
        try {
            let pipArray = [{ $match: { ...query } }]
            const paramDocuments = await parameterModel.aggregate(pipArray)

            return paramDocuments[0]
        } catch (err) {
            throw new CustomError(500, err.message)
        }
    }

    async function findAll(query) {
        try {
            let pipArray = [{ $match: { parameter_type: { $ne: null } } }]
            if (query.channel_full_id && query.channel_full_id !== "") {
                pipArray.unshift({
                    $match: { channel_full_id: query.channel_full_id }
                })
            }
            if (query.massive_full_id) {
                pipArray.unshift({
                    $match: {
                        channel_full_id: {
                            $in: query.massive_full_id
                        }
                    }
                })
            }

            if (query.parameter_type && query.parameter_type !== "") {
                pipArray.unshift({
                    $match: { parameter_type: query.parameter_type }
                })
            }

            const paramDocuments = await parameterModel.aggregate(pipArray)

            return paramDocuments
        } catch (err) {
            throw new CustomError(500, err.message)
        }
    }

    async function insert(args, meter) {
        try {
            let parameterIds = []
            const newParams = args.map((el) => {
                let stringParamName = `${el.channel_full_id}`
                parameterIds.push(stringParamName)
                return {
                    meter: meter._id,
                    status: el.status,
                    parameter_type: el.parameter_type,
                    channel_full_id: el.channel_full_id,
                    param_short_name: el.param_short_name,
                    param_name: el.param_name,
                    param_meter_type: meter.meter_form
                }
            })

            await parameterModel.insertMany(newParams)
            return parameterIds
        } catch (err) {
            throw new CustomError(err.status, err.message)
        }
    }

    async function updateMany(data) {
        try {
            data = data.map((element) => {
                return parameterModel.updateOne({ _id: element._id }, { status: element.status })
            })

            Promise.all(data).then((result) => {
                return result
            }).catch(err => {
                throw new CustomError(500, err.message)
            })

        } catch (err) {
            throw new CustomError(500, err.message)
        }
    }
}
