const mongoose = require("mongoose")
const { electObjectModel, folderModel } = require("../../models")
const CustomError = require("../../utils/custom_error")
const { parameterShortNamesList_enum } = require("../../validation/meter")
const { energyarchive, energytotal } = require("../../global/variable")

module.exports.electObjectRepository = () => {
    return Object.freeze({
        insert,
        findById,
        findMeter,
        listUse,
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
        firstTemplateReport,
        remove,
        insertParentParams
    })

    async function countDocuments(args) {
        try {
            return await electObjectModel.countDocuments(args)
        } catch (err) {
            throw new CustomError(500, err.message)
        }
    }

    async function listUse() {
        try {
            const list = await electObjectModel.find({ meter_id: { $exists: true } })
            const meters = await folderModel.find()
            const result = []
            let ids = []
            for (let i = 0; i < meters.length; i++) {
                const find = list.map(e => String(e.meter_id))
                if (!find.includes(String(meters[i].meter)) && !ids.includes(meters[i].meter) && meters[i].meter) {
                    result.push({ id: String(meters[i].meter), name: meters[i].name })
                    ids.push(meters[i].meter)
                }
            }
            return result
        } catch (err) {
            throw new CustomError(500, err.message)
        }
    }

    async function insert(args) {
        try {
            const objectDocuments = await electObjectModel.create(args)
            return objectDocuments
        } catch (err) {
            throw new CustomError(500, err.message)
        }
    }

    async function update(_id, query) {
        try {
            const objectDocuments = await electObjectModel.updateOne({ _id }, { $set: query })
            return objectDocuments
        } catch (err) {
            throw new CustomError(500, err.message)
        }
    }

    async function findById(id) {
        try {
            const objectDocuments = await electObjectModel.findById(id)
            return objectDocuments
        } catch (err) {
            throw new CustomError(500, err.message)
        }
    }

    async function findParentMeter(id) {
        try {
            const getMeter = await electObjectModel.findOne({ parent_object: id })
            return getMeter
        } catch (err) {
            throw new CustomError(500, err.message)
        }
    }

    async function insertParentParams(id, paramerts_list) {
        try {
            await electObjectModel.updateOne({ _id: id }, { $set: { parameters: paramerts_list } })
            return 'ok'
        } catch (error) {
            throw new CustomError(500, err.message)
        }
    }

    async function remove(id) {
        try {
            const find = await electObjectModel.findOne({ parent_object: id },)
            if (find) {
                await electObjectModel.deleteOne({ _id: id })
                remove(find._id)
            }
            await electObjectModel.deleteOne({ _id: id })
            return 'ok'
        } catch (error) {
            throw new CustomError(404, "ElectObject Not Found")
        }
    }

    async function findMeter(id) {
        try {
            const objectDocuments = await electObjectModel.findOne({ meter_id: id })
            return objectDocuments
        } catch (err) {
            throw new CustomError(500, err.message)
        }
    }

    async function findAll(args) {
        try {
            const pipArray = [
                {
                    $lookup: {
                        from: "elect_objects",
                        localField: "_id",
                        foreignField: "parent_object",
                        pipeline: [
                            {
                                $lookup: {
                                    from: "elect_objects",
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
            return await electObjectModel.aggregate(pipArray)

        } catch (err) {
            throw new CustomError(500, err.message)
        }
    }

    async function findOne(id, query) {
        try {
            const pipArray = [
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(id)
                    }
                },
                {
                    $lookup: {
                        from: "elect_objects",
                        localField: "_id",
                        foreignField: "parent_object",
                        pipeline: [
                            {
                                $lookup: {
                                    from: "elect_objects",
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
                }
            ]

            if (query.type === 'feeder') {
                pipArray.push(
                    {
                        $lookup: {
                            from: "elect_objects",
                            localField: "_id",
                            foreignField: "parent_object",
                            pipeline: [
                                {
                                    $lookup: {
                                        from: "meters",
                                        localField: "meter_id",
                                        foreignField: "_id",
                                        as: "meter"
                                    }
                                }
                            ],
                            as: "elect_meter"
                        }
                    },
                    {
                        $unwind: {
                            path: "$elect_meter",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $unwind: {
                            path: "$elect_meter.meter",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        "$group": {
                            "_id": "$_id",
                            "name": { $first: "$name" },
                            "parameters": {
                                "$push": "$parameters"
                            },
                            "vt": { $first: "$elect_meter.vt" },
                            "ct": { $first: "$elect_meter.ct" },
                            "type": { $first: "$type" },
                            "meter_type": { $first: "$elect_meter.meter.meter_type" },
                            "number_meter": { $first: "$elect_meter.meter.number_meter" },
                            "createdAt": { $first: "$createdAt" },
                            "parent_object": { $first: "$parent_object" },
                            "updatedAt": { $first: "$updatedAt" },
                            "child_objects": { $first: "$child_objects" },
                        }
                    }
                )
            } else if (query.type === 'meter') {
                pipArray.push(
                    {
                        $lookup: {
                            from: "meters",
                            localField: "meter_id",
                            foreignField: "_id",
                            as: "meter"
                        }
                    },
                    {
                        $unwind: {
                            path: "$meter",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        "$group": {
                            "_id": "$_id",
                            "name": { $first: "$name" },
                            "parameters": {
                                "$push": "$parameters"
                            },
                            "type": { $first: "$type" },
                            "meter_type": { $first: "$meter.meter_type" },
                            "number_meter": { $first: "$meter.number_meter" },
                            "createdAt": { $first: "$createdAt" },
                            "parent_object": { $first: "$parent_object" },
                            "updatedAt": { $first: "$updatedAt" },
                            "child_objects": { $first: "$child_objects" },
                            "vt": { $first: "$vt" },
                            "ct": { $first: "$ct" }
                        }
                    }
                )
            } else {
                pipArray.push(
                    {
                        "$group": {
                            "_id": "$_id",
                            "name": { $first: "$name" },
                            "parameters": {
                                "$push": "$parameters"
                            },
                            "type": { $first: "$type" },
                            "createdAt": { $first: "$createdAt" },
                            "parent_object": { $first: "$parent_object" },
                            "updatedAt": { $first: "$updatedAt" },
                            "child_objects": { $first: "$child_objects" },
                        }
                    }
                )
            }
            const electObjectDocument = await electObjectModel.aggregate(pipArray)
            return electObjectDocument[0]
        } catch (err) {
            throw new CustomError(500, err.message)
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
            let existList = query && query.selectedParameters ? query.selectedParameters : parameterShortNamesList_enum
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
                        },
                        name: 1,
                        type: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        child_objects: 1
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

            const electObjectDocument = await electObjectModel.aggregate(pipArray, { maxTimeMS: 50000 })
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
                        },
                        name: 1,
                        type: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        child_objects: 1
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

            const electObjectDocument = await electObjectModel.aggregate(pipArray, { maxTimeMS: 50000 })
            return electObjectDocument[0]
        } catch (err) {
            throw new CustomError(500, err.message)
        }
    }

    async function findOneGraphAndObjectCurrent(id, query) {
        try {
            let modelname = query && query.modelDate ? "parameter_values_" + new Date(query.modelDate).getFullYear() + new Date(query.modelDate).getMonth() : "parameter_values_" + new Date().getFullYear() + new Date().getMonth()

            let existList = query && query.selectedParameters ? query.selectedParameters : parameterShortNamesList_enum

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
                        },
                        name: 1,
                        type: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        child_objects: 1
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

            const electObjectDocument = await electObjectModel.aggregate(pipArray, { maxTimeMS: 50000 })
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
            ];

            const electObjectDocument = await electObjectModel.aggregate(electObjectPipelines, { maxTimeMS: 50000 })
            return electObjectDocument[0]
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

            const electObjectDocument = await electObjectModel.aggregate(electObjectPipelines, { maxTimeMS: 50000 })
            return electObjectDocument[0]
        } catch (err) {
            throw new CustomError(500, err.message)
        }
    }

    async function firstTemplateReport(id, query) {
        try {
            let existList = [energyarchive[0], energyarchive[2]]
            
            let startDate = new Date(query.startDate)
            let finishDate = new Date(query.finishDate)
            startDate.setUTCHours(0, 0, 0, 0)
            finishDate.setUTCHours(0, 0, 0, 0)
            startDate.setDate(startDate.getDate() +1)
            finishDate.setDate(finishDate.getDate() +1)

            let subPipArray = [
                {
                    $match: {
                        date: {
                            $gte: startDate,
                            $lt: finishDate
                        },
                    },
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
                        "child_objects": { $first: "$child_objects" }
                    }
                }
            ]

            const electObjectDocument = await electObjectModel.aggregate(electObjectPipelines, { maxTimeMS: 50000 })
            return electObjectDocument[0]
        } catch (err) {
            throw new CustomError(500, err.message)
        }
    }
}