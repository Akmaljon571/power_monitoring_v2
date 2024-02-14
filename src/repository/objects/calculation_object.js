const mongoose = require("mongoose")
const { models } = require("../../models")
const CustomError = require("../../utils/custom_error")

module.exports.calculationObjectRepository = () => {
    return Object.freeze({
        insert,
        findById,
        findMeter,
        remove,
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
        findOneAndGetRealtime
    })

    async function countDocuments(args){
        try {
            return await models().calculationObjectModel.countDocuments(args)
        } catch (err) {
            throw new CustomError(500, err.message)
        }
    }

    async function insert(args) {
        try {
            const objectDocuments = await models().calculationObjectModel.create(args)
            return objectDocuments
        } catch (err) {
            throw new CustomError(500, err.message)
        }
    }

    async function listUse() {
        try {
            const list = await models().calculationObjectModel.find()
            const meters = await models().meterModel.find()
            return meters.map(e => list.find(w => w.meter_id == e._id) ? '' : {id: String(e._id), name: e.name}).filter(e => e)
        } catch (err) {
            throw new CustomError(500, err.message)
        }
    }

    async function update(_id, query) {
        try {
            const objectDocuments = await models().calculationObjectModel.updateOne({ _id }, { $set: query})
            return objectDocuments
        } catch (err) {
            throw new CustomError(500, err.message)
        }
    }

    async function findById(id) {
        try {
            const objectDocuments = await models().calculationObjectModel.findById(id)
            return objectDocuments
        } catch (err) {
            throw new CustomError(500, err.message)
        }
    }

    async function findParentMeter(id) {
        try {
            const getMeter = await models().calculationObjectModel.findOne({ parent_object: id })
            return getMeter
        } catch (err) {
            throw new CustomError(500, err.message)
        }
    }

    async function findMeter(id) {
        try {
            const objectDocuments = await models().calculationObjectModel.findOne({ meter_id: id })
            return objectDocuments
        } catch (err) {
            throw new CustomError(500, err.message)
        }
    }

    async function remove(id) {
        try {
            const find = await models().calculationObjectModel.findOne({ parent_object: id }, )
            if(find) {
                await models().calculationObjectModel.deleteOne({ _id: id })
                remove(find._id)
            }
            await models().calculationObjectModel.deleteOne({ _id: id })
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
                        path:"$parameters",
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
            return await models().calculationObjectModel.aggregate(pipArray)

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
                        path:"$parameters",
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
            const electObjectDocument = await models().calculationObjectModel.aggregate(pipArray)
            return electObjectDocument[0]
        } catch (err) {
            throw new CustomError(500, err.message)
        }
    }

    async function findOneVectorDiagram(id, query) {
        try {
            let modelname = query && query.modelDate ? "parameter_values_" + new Date(query.modelDate).getFullYear() + new Date(query.modelDate).getMonth(): "parameter_values_" + new Date().getFullYear() + new Date().getMonth()
            if(query && query.paramDate){
                 query.startDate = new Date(query.paramDate)
                 query.startDate.setUTCHours(0)
                 query.finishDate = new Date(query.startDate)
                 query.finishDate.setDate(query.startDate.getDate()+1)
            }
            let existList =  [
                "voltage_A","voltage_B","voltage_C","voltage_AB","voltage_BC","voltage_AC",
                "current_A","current_B","current_C",
                "frequency",
                "active-power_A","active-power_B","active-power_C","active-power_total",
                "reactive-power_A","reactive-power_B","reactive-power_C","reactive-power_total",
                "full-power_A","full-power_B","full-power_C","full-power_total",
                "coef-active-power_A","coef-active-power_B","coef-active-power_C","coef-active-power_total",
                "coef-reactive-power_A","coef-reactive-power_B","coef-reactive-power_C","coef-reactive-power_total"
            ]
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

            const electObjectDocument = await models().calculationObjectModel.aggregate(pipArray, { maxTimeMS: 50000 })
             console.log(electObjectDocument,"electObjectDocument")
            return electObjectDocument[0]
        } catch (err) {
            throw new CustomError(500, err.message)
        } 
    }

    async function findOneGraphAndObjectArchive(id, query) {
        try {
            let existList = query && query.selectedParameters ? query.selectedParameters : ["energyarchive_A+", "energyarchive_A-", "energyarchive_R+", "energyarchive_R-"]
         
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
                    $unwind:{
                        path:"$parameters.param_details",
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

            const electObjectDocument = await models().calculationObjectModel.aggregate(pipArray, { maxTimeMS: 50000 })
            return electObjectDocument[0]
        } catch (err) {
            throw new CustomError(500, err.message)
        }
    }

    async function findOneGraphAndObjectCurrent(id, query) {
        try {
            let modelname = query && query.modelDate ? "parameter_values_" + new Date(query.modelDate).getFullYear() + new Date(query.modelDate).getMonth(): "parameter_values_" + new Date().getFullYear() + new Date().getMonth()
            let existList = query && query.selectedParameters ? query.selectedParameters : [
                "energycurrent_A+", "energycurrent_A-", "energycurrent_R+", "energycurrent_R-",
                "voltage_A", "voltage_B", "voltage_C", "voltage_AB", "voltage_BC", "voltage_AC",
                "current_A", "current_B", "current_C",
                "frequency",
                "active-power_A", "active-power_B", "active-power_C", "active-power_total",
                "reactive-power_A", "reactive-power_B", "reactive-power_C", "reactive-power_total",
                "full-power_A", "full-power_B", "full-power_C", "full-power_total",
                "coef-active-power_A", "coef-active-power_B", "coef-active-power_C", "coef-active-power_total",
                "coef-reactive-power_A", "coef-reactive-power_B", "coef-reactive-power_C", "coef-reactive-power_total"
            ]

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

            const electObjectDocument = await models().calculationObjectModel.aggregate(pipArray, { maxTimeMS: 50000 })
            console.log(electObjectDocument[0])
            return electObjectDocument[0]
        } catch (err) {
            throw new CustomError(500, err.message)
        }
    }

    async function findOneAndDataList(id, query) {
        try {
            let modelname = 'parameter_values'
            let existList = query.selectedParameters ? query.selectedParameters : ["energytotal_A+", "energytotal_A-", "energytotal_R+", "energytotal_R-"]

            if(query.type === "current"){
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
     
            const calculationDocuments = await models().calculationObjectModel.aggregate(electObjectPipelines, { maxTimeMS: 50000 })
            return calculationDocuments[0]
        } catch (err) {
            throw new CustomError(500, err.message)
        }
    }

    async function findOneAndDashboard(id, query,type) {
        try {
            const existList = query.selectedParameters ? query.selectedParameters : ["energyarchive_A+", "energyarchive_A-", "energyarchive_R+", "energyarchive_R-"]
            const year = query.year ? query.year : new Date().getFullYear()
            const month = query.month? query.month: new Date().getMonth() 
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
                        day:{$dayOfMonth:"$date"},
                        month:{$month:"$date"},
                        year:{$year:"$date"}
                    }
                },
                {
                    $group:{
                        _id:{
                            day:"$day",
                            month:"$month",
                            year:"$year"
                        },
                        value:{$sum:"$value"}
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
                        month:{$month:"$date"},
                        year:{$year:"$date"}
                    }
                },
                {
                    $group:{
                        _id:{
                            month:"$month",
                            year:"$year"
                        },
                        value:{$sum:"$value"}
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
                        pipeline: type === "monthly"?subPipArrayMonthly:subPipArrayDaily,
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

            const electObjectDocument = await models().calculationObjectModel.aggregate(electObjectPipelines, { maxTimeMS: 50000 })
            return electObjectDocument[0]
        } catch (err) {
            throw new CustomError(500, err.message)
        }
    }


    async function findOneAndGetRealtime(id, query) {
        try {
            let modelname = "parameter_values_" + new Date().getFullYear() + new Date().getMonth()
            const existList = query.param_list ? query.param_list : ["active-power_total", "full-power_total", "reactive-power_total", "coef-active-power_total"]
            let subPipArray = [
                {
                    $sort: {
                        date: -1
                    }
                },
                {
                    $limit: 1
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
                        path:"$parameters",
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

            const realtimeDocuments = await models().electObjectModel.aggregate(electObjectPipelines)
            return realtimeDocuments[0]
        } catch (err) {
            throw new CustomError(500, err.message)
        }
    }
}