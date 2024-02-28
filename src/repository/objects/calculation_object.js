const mongoose = require("mongoose")
const { calculationObjectModel } = require("../../models")
const CustomError = require("../../utils/custom_error")
const { energyarchive, energytotal } = require("../../global/variable")
const { all_short_name } = require("../../global/file-path")

module.exports.calculationObjectRepository = () => {
    return Object.freeze({
        insert,
        findById,
        findMeter,
        remove,
        update,
        findParentMeter,
        countDocuments,
        findAll,
        findOne,
        findOneVectorDiagram,
        findOneGraphAndObjectArchive,
        findOneGraphAndObjectCurrent,
        findOneAndDataList,
        findOneAndDashboard,
        realTime
    })

    async function countDocuments(args) {
        try {
            return await calculationObjectModel.countDocuments(args)
        } catch (err) {
            throw new CustomError(500, err.message)
        }
    }

    async function insert(args) {
        try {
            const objectDocuments = await calculationObjectModel.create(args)
            return objectDocuments
        } catch (err) {
            throw new CustomError(500, err.message)
        }
    }

    async function update(_id, query) {
        try {
            const objectDocuments = await calculationObjectModel.updateOne({ _id }, { $set: query })
            return objectDocuments
        } catch (err) {
            throw new CustomError(500, err.message)
        }
    }

    async function findById(id) {
        try {
            const objectDocuments = await calculationObjectModel.findById(id)
            return objectDocuments
        } catch (err) {
            throw new CustomError(500, err.message)
        }
    }

    async function findParentMeter(id) {
        try {
            const getMeter = await calculationObjectModel.findOne({ parent_object: id })
            return getMeter
        } catch (err) {
            throw new CustomError(500, err.message)
        }
    }

    async function findMeter(id) {
        try {
            const objectDocuments = await calculationObjectModel.findOne({ meter_id: id })
            return objectDocuments
        } catch (err) {
            throw new CustomError(500, err.message)
        }
    }

    async function remove(id) {
        try {
            const find = await calculationObjectModel.findOne({ parent_object: id },)
            if (find) {
                await calculationObjectModel.deleteOne({ _id: id })
                remove(find._id)
            }
            await calculationObjectModel.deleteOne({ _id: id })
            return 'ok'
        } catch (error) {
            throw new CustomError(404, "ElectObject Not Found")
        }
    }

    async function findAll(args) {
        try {
            const pipArray = [
                {
                    $lookup: {
                        from: "calculation_objects",
                        localField: "_id",
                        foreignField: "parent_object",
                        pipeline: [
                            {
                                $lookup: {
                                    from: "calculation_objects",
                                    localField: "_id",
                                    foreignField: "parent_object",
                                    as: "child_objects"
                                }
                            }
                        ],
                        as: "child_objects"
                    }
                },
                {
                    $unwind: {
                        path: "$parameters",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: "parameters",
                        localField: "parameters.parameter_id",
                        foreignField: "_id",
                        as: "parameters.param_details"
                    }
                },
                {
                    "$group": {
                        "_id": "$_id",
                        "parameters": {
                            "$push": "$parameters"
                        },
                        "name": { $first: "$name" },
                        "type": { $first: "$type" },
                        "createdAt": { $first: "$createdAt" },
                        "updatedAt": { $first: "$updatedAt" },
                        "child_objects": { $first: "$child_objects" },
                    }
                }
            ]
            if (args.type && args.type !== "") {
                pipArray.unshift({
                    $match: {
                        type: args.type
                    }
                })
            }
            return await calculationObjectModel.aggregate(pipArray)

        } catch (err) {
            throw new CustomError(500, err.message)
        }
    }

    async function findOne(id) {
        try {
            const pipArray = [
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(id)
                    }
                },
                {
                    $lookup: {
                        from: "calculation_objects",
                        localField: "_id",
                        foreignField: "parent_object",
                        pipeline: [
                            {
                                $lookup: {
                                    from: "calculation_objects",
                                    localField: "_id",
                                    foreignField: "parent_object",
                                    as: "child_objects"
                                }
                            }
                        ],
                        as: "child_objects"
                    }
                },
                {
                    $unwind: {
                        path: "$parameters",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: "parameters",
                        localField: "parameters.parameter_id",
                        foreignField: "_id",
                        as: "parameters.param_details"
                    }
                },
                {
                    "$group": {
                        "_id": "$_id",
                        "parameters": {
                            "$push": "$parameters"
                        },
                        "name": { $first: "$name" },
                        "type": { $first: "$type" },
                        "parent_object": { $first: "$parent_object" },
                        "createdAt": { $first: "$createdAt" },
                        "updatedAt": { $first: "$updatedAt" },
                        "child_objects": { $first: "$child_objects" },
                    }
                }
            ]
            const electObjectDocument = await calculationObjectModel.aggregate(pipArray)
            return electObjectDocument[0]
        } catch (err) {
            throw new CustomError(500, err.message)
        }
    }

    async function realTime(id) {
        try {
            let modelname = "parameter_values_" + new Date().getFullYear() + new Date().getMonth()
            let subPipArray = [
                {
                    $sort: {
                        date: -1
                    }
                }
            ]
            const electObjectPipelines = [
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(id)
                    }
                },
                {
                    $unwind: {
                        path: "$parameters",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: "parameters",
                        localField: "parameters.parameter_id",
                        foreignField: "_id",
                        as: "parameters.param_details"
                    }
                },
                {
                    $unwind: {
                        path: "$parameters.param_details",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    "$group": {
                        "_id": "$_id",
                        "parameters": {
                            "$push": "$parameters"
                        },
                        "name": { $first: "$name" },
                        "type": { $first: "$type" },
                        "createdAt": { $first: "$createdAt" },
                        "updatedAt": { $first: "$updatedAt" },
                        "child_objects": { $first: "$child_objects" },
                    }
                },
                {
                    $project: {
                        parameters: {
                            $filter: {
                                input: "$parameters",
                                as: "param",
                                cond: {
                                    $in: [
                                        "$$param.param_details.param_short_name",
                                        realTimeVariable
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    $unwind: "$parameters"
                },
                {
                    $lookup: {
                        from: modelname,
                        localField: "parameters.param_details._id",
                        foreignField: "parameter",
                        pipeline: subPipArray,
                        as: "parameters.parameter_values"
                    }
                },
                {
                    "$group": {
                        "_id": "$_id",
                        "parameters": {
                            "$push": "$parameters"
                        },
                        "name": { $first: "$name" },
                        "type": { $first: "$type" },
                        "createdAt": { $first: "$createdAt" },
                        "updatedAt": { $first: "$updatedAt" },
                        "child_objects": { $first: "$child_objects" },
                    }
                }
            ]

            const realtimeDocuments = await calculationObjectModel.aggregate(electObjectPipelines)

            const realTimeData = { date: new Date(), "AP": "0", "RP": "0", "FP": "0", "CP": "0" }
            realtimeDocuments[0]?.parameters?.map(e => {
                if (e.param_details.param_short_name == realTimeVariable[0]) {
                    realTimeData.AP = e.parameter_values[0].value
                } else if (e.param_details.param_short_name == realTimeVariable[1]) {
                    realTimeData.RP = e.parameter_values[0].value
                } else if (e.param_details.param_short_name == realTimeVariable[2]) {
                    realTimeData.FP = e.parameter_values[0].value
                } else if (e.param_details.param_short_name == realTimeVariable[3]) {
                    realTimeData.CP = e.parameter_values[0].value
                }

            })

            return realTimeData
        } catch (err) {
            console.log(err)
            throw new Error(err.message)
        }
    }

    async function findOneVectorDiagram(id, query) {
        try {
            let modelname = query && query.modelDate ? "parameter_values_" + new Date(query.modelDate).getFullYear() + new Date(query.modelDate).getMonth() : "parameter_values_" + new Date().getFullYear() + new Date().getMonth()
            if (query && query.paramDate) {
                query.startDate = new Date(query.paramDate)
                query.startDate.setUTCHours(0, 0, 0, 0)
                query.finishDate = new Date(query.startDate)
                query.finishDate.setDate(query.startDate.getDate() + 1)
            }
            let existList = all_short_name()
            const limit = query && query.limit ? query.limit : 150
            let subPipArray = [
                {
                    $sort: {
                        date: -1
                    }
                },
                {
                    $limit: limit
                }
            ]
            if (query && query.startDate) {
                subPipArray.unshift({
                    $match: {
                        date: {
                            $gte: new Date(query.startDate)
                        }
                    }
                })
            }
            if (query && query.finishDate) {
                subPipArray.unshift({
                    $match: {
                        date: {
                            $lte: new Date(query.finishDate)
                        }
                    }
                })
            }

            const pipArray = [
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(id)
                    }
                },
                {
                    $unwind: {
                        path: "$parameters",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: "parameters",
                        localField: "parameters.parameter_id",
                        foreignField: "_id",
                        pipeline: [
                            {
                                $match: {
                                    status: "active"
                                },
                            }
                        ],
                        as: "parameters.param_details"
                    }
                },
                {
                    $unwind: "$parameters.param_details"
                },
                {
                    "$group": {
                        "_id": "$_id",
                        "parameters": {
                            "$push": "$parameters"
                        },
                        "name": { $first: "$name" },
                        "type": { $first: "$type" },
                        "createdAt": { $first: "$createdAt" },
                        "updatedAt": { $first: "$updatedAt" },
                        "child_objects": { $first: "$child_objects" },
                    }
                },
                {
                    $project: {
                        parameters: {
                            $filter: {
                                input: "$parameters",
                                as: "param",
                                cond: {
                                    $in: [
                                        "$$param.param_details.param_short_name",
                                        existList
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    $unwind: {
                        path: "$parameters",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: modelname,
                        localField: "parameters.param_details._id",
                        foreignField: "parameter",
                        pipeline: subPipArray,
                        as: "parameters.parameter_values"
                    }
                },
                {
                    "$group": {
                        "_id": "$_id",
                        "parameters": {
                            "$push": "$parameters"
                        },
                        "name": { $first: "$name" },
                        "type": { $first: "$type" },
                        "createdAt": { $first: "$createdAt" },
                        "updatedAt": { $first: "$updatedAt" },
                        "child_objects": { $first: "$child_objects" },
                    }
                }
            ]

            const electObjectDocument = await calculationObjectModel.aggregate(pipArray, { maxTimeMS: 50000 })
            return electObjectDocument[0]
        } catch (err) {
            throw new CustomError(500, err.message)
        }
    }

    async function findOneGraphAndObjectArchive(id, query) {
        try {
            let existList = query && query.selectedParameters ? query.selectedParameters : energyarchive

            const limit = query && query.limit ? query.limit : 150
            let subPipArray = [
                {
                    $limit: limit
                }
            ]
            if (query && query.startDate) {
                subPipArray.unshift({
                    $match: {
                        date: {
                            $gte: new Date(query.startDate)
                        }
                    }
                })
            }
            if (query && query.finishDate) {
                subPipArray.unshift({
                    $match: {
                        date: {
                            $lte: new Date(query.finishDate)
                        }
                    }
                })
            }

            const pipArray = [
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(id)
                    }
                },
                {
                    $unwind: {
                        path: "$parameters",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: "parameters",
                        localField: "parameters.parameter_id",
                        foreignField: "_id",
                        as: "parameters.param_details"
                    }
                },
                {
                    $unwind: {
                        path: "$parameters.param_details",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    "$group": {
                        "_id": "$_id",
                        "parameters": {
                            "$push": "$parameters"
                        },
                        "name": { $first: "$name" },
                        "type": { $first: "$type" },
                        "createdAt": { $first: "$createdAt" },
                        "updatedAt": { $first: "$updatedAt" },
                        "child_objects": { $first: "$child_objects" },
                    }
                },
                {
                    $project: {
                        parameters: {
                            $filter: {
                                input: "$parameters",
                                as: "param",
                                cond: {
                                    $in: [
                                        "$$param.param_details.param_short_name",
                                        existList
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    $unwind: {
                        path: "$parameters",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: "parameter_values",
                        localField: "parameters.param_details._id",
                        foreignField: "parameter",
                        pipeline: subPipArray,
                        as: "parameters.parameter_values"
                    }
                },
                {
                    "$group": {
                        "_id": "$_id",
                        "parameters": {
                            "$push": "$parameters"
                        },
                        "name": { $first: "$name" },
                        "type": { $first: "$type" },
                        "createdAt": { $first: "$createdAt" },
                        "updatedAt": { $first: "$updatedAt" },
                    }
                }
            ]

            const electObjectDocument = await calculationObjectModel.aggregate(pipArray, { maxTimeMS: 50000 })
            return electObjectDocument[0]
        } catch (err) {
            throw new CustomError(500, err.message)
        }
    }

    async function findOneGraphAndObjectCurrent(id, query) {
        try {
            let modelname = query && query.modelDate ? "parameter_values_" + new Date(query.modelDate).getFullYear() + new Date(query.modelDate).getMonth() : "parameter_values_" + new Date().getFullYear() + new Date().getMonth()
            let existList = query && query.selectedParameters ? query.selectedParameters : all_short_name()

            const limit = query && query.limit ? query.limit : 150
            let subPipArray = [
                {
                    $sort: {
                        date: -1
                    }
                },
                {
                    $limit: limit
                }
            ]
            if (query && query.startDate) {
                subPipArray.unshift({
                    $match: {
                        date: {
                            $gte: new Date(query.startDate)
                        }
                    }
                })
            }
            if (query && query.finishDate) {
                subPipArray.unshift({
                    $match: {
                        date: {
                            $lte: new Date(query.finishDate)
                        }
                    }
                })
            }

            const pipArray = [
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(id)
                    }
                },
                {
                    $unwind: {
                        path: "$parameters",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: "parameters",
                        localField: "parameters.parameter_id",
                        foreignField: "_id",
                        as: "parameters.param_details"
                    }
                },
                {
                    $unwind: "$parameters.param_details"
                },
                {
                    "$group": {
                        "_id": "$_id",
                        "parameters": {
                            "$push": "$parameters"
                        },
                        "name": { $first: "$name" },
                        "type": { $first: "$type" },
                        "createdAt": { $first: "$createdAt" },
                        "updatedAt": { $first: "$updatedAt" },
                        "child_objects": { $first: "$child_objects" },
                    }
                },
                {
                    $project: {
                        parameters: {
                            $filter: {
                                input: "$parameters",
                                as: "param",
                                cond: {
                                    $in: [
                                        "$$param.param_details.param_short_name",
                                        existList
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    $unwind: {
                        path: "$parameters",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: modelname,
                        localField: "parameters.param_details._id",
                        foreignField: "parameter",



                        pipeline: subPipArray,
                        as: "parameters.parameter_values"
                    }
                },
                {
                    "$group": {
                        "_id": "$_id",
                        "parameters": {
                            "$push": "$parameters"
                        },
                        "name": { $first: "$name" },
                        "type": { $first: "$type" },
                        "createdAt": { $first: "$createdAt" },
                        "updatedAt": { $first: "$updatedAt" },
                        "child_objects": { $first: "$child_objects" },
                    }
                }
            ]

            const electObjectDocument = await calculationObjectModel.aggregate(pipArray, { maxTimeMS: 50000 })
            return electObjectDocument[0]
        } catch (err) {
            throw new CustomError(500, err.message)
        }
    }

    async function findOneAndDataList(id, query) {
        try {
            let modelname = 'parameter_values'
            let existList = query.selectedParameters ? JSON.parse(query.selectedParameters) : energytotal
            if (query.type === "current") {
                modelname = query && query.modelDate ? "parameter_values_" + new Date(query.modelDate).getFullYear() + new Date(query.modelDate).getMonth() : "parameter_values_" + new Date().getFullYear() + new Date().getMonth()
            }
            const limit = query.limit ? query.limit : 150
            let subPipArray = [
                {
                    $sort: {
                        date: -1
                    }
                },
                {
                    $limit: limit
                }
            ]
            if (query && query.startDate) {
                subPipArray.unshift({
                    $match: {
                        date: {
                            $gte: new Date(query.startDate)
                        }
                    }
                })
            }
            if (query && query.finishDate) {
                subPipArray.unshift({
                    $match: {
                        date: {
                            $lte: new Date(query.finishDate)
                        }
                    }
                })
            }

            const electObjectPipelines = [
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(id)
                    }
                },
                {
                    $unwind: {
                        path: "$parameters",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: "parameters",
                        localField: "parameters.parameter_id",
                        foreignField: "_id",
                        as: "parameters.param_details"
                    }
                },
                {
                    $unwind: {
                        path: "$parameters.param_details",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $group: {
                        _id: "$_id",
                        parameters: { $push: "$parameters" },
                        name: { $first: "$name" },
                        type: { $first: "$type" },
                        createdAt: { $first: "$createdAt" },
                        updatedAt: { $first: "$updatedAt" },
                        child_objects: { $first: "$child_objects" }
                    }
                },
                {
                    $project: {
                        parameters: {
                            $filter: {
                                input: "$parameters",
                                as: "param",
                                cond: {
                                    $in: [
                                        "$$param.param_details.param_short_name",
                                        existList
                                    ]
                                }
                            }
                        },
                        name: 1,
                        type: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        child_objects: 1
                    }
                },
                {
                    $unwind: "$parameters"
                },
                {
                    $lookup: {
                        from: modelname,
                        localField: "parameters.param_details._id",
                        foreignField: "parameter",
                        pipeline: subPipArray,
                        as: "parameters.parameter_values"
                    }
                },
                {
                    $group: {
                        _id: "$_id",
                        parameters: { $push: "$parameters" },
                        name: { $first: "$name" },
                        type: { $first: "$type" },
                        createdAt: { $first: "$createdAt" },
                        updatedAt: { $first: "$updatedAt" },
                        child_objects: { $first: "$child_objects" }
                    }
                }
            ]

            const calculationDocuments = await calculationObjectModel.aggregate(electObjectPipelines, { maxTimeMS: 50000 })
            return calculationDocuments[0]
        } catch (err) {
            throw new CustomError(500, err.message)
        }
    }

    async function findOneAndDashboard(id, query, type) {
        try {
            const existList = query.selectedParameters ? query.selectedParameters : energyarchive
            const year = query.year ? query.year : new Date().getFullYear()
            const month = query.month ? query.month : new Date().getMonth()
            let subPipArrayDaily = [
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $eq: [{ $month: '$date' }, month] },
                                { $eq: [{ $year: '$date' }, year] }
                            ]
                        }
                    }
                },
                {
                    $addFields: {
                        day: { $dayOfMonth: "$date" },
                        month: { $month: "$date" },
                        year: { $year: "$date" }
                    }
                },
                {
                    $group: {
                        _id: {
                            day: "$day",
                            month: "$month",
                            year: "$year"
                        },
                        value: { $sum: "$value" }
                    }
                },
                {
                    $sort: {
                        "_id.year": 1,
                        "_id.month": 1,
                        "_id.day": 1
                    }
                }
            ]
            let subPipArrayMonthly = [
                {
                    $match: {
                        $expr: {
                            $eq: [{ $year: '$date' }, year]
                        }
                    }
                },
                {
                    $addFields: {
                        month: { $month: "$date" },
                        year: { $year: "$date" }
                    }
                },
                {
                    $group: {
                        _id: {
                            month: "$month",
                            year: "$year"
                        },
                        value: { $sum: "$value" }
                    }
                },
                {
                    $sort: {
                        "_id.year": 1,
                        "_id.month": 1
                    }
                }
            ]

            const electObjectPipelines = [
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(id)
                    }
                },
                {
                    $unwind: {
                        path: "$parameters",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: "parameters",
                        localField: "parameters.parameter_id",
                        foreignField: "_id",
                        as: "parameters.param_details"
                    }
                },
                {
                    $unwind: {
                        path: "$parameters.param_details",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    "$group": {
                        "_id": "$_id",
                        "parameters": {
                            "$push": "$parameters"
                        },
                        "name": { $first: "$name" },
                        "type": { $first: "$type" },
                        "createdAt": { $first: "$createdAt" },
                        "updatedAt": { $first: "$updatedAt" },
                        "child_objects": { $first: "$child_objects" },
                    }
                },
                {
                    $project: {
                        parameters: {
                            $filter: {
                                input: "$parameters",
                                as: "param",
                                cond: {
                                    $in: [
                                        "$$param.param_details.param_short_name",
                                        existList
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    $unwind: "$parameters"
                },
                {
                    $lookup: {
                        from: "parameter_values",
                        localField: "parameters.param_details._id",
                        foreignField: "parameter",
                        pipeline: type === "monthly" ? subPipArrayMonthly : subPipArrayDaily,
                        as: "parameters.parameter_values"
                    }
                },
                {
                    "$group": {
                        "_id": "$_id",
                        "parameters": {
                            "$push": "$parameters"
                        },
                        "name": { $first: "$name" },
                        "type": { $first: "$type" },
                        "createdAt": { $first: "$createdAt" },
                        "updatedAt": { $first: "$updatedAt" },
                        "child_objects": { $first: "$child_objects" },
                    }
                }
            ]

            const electObjectDocument = await calculationObjectModel.aggregate(electObjectPipelines, { maxTimeMS: 50000 })
            return electObjectDocument[0]
        } catch (err) {
            throw new CustomError(500, err.message)
        }
    }
}