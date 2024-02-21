const CustomError = require("../../utils/custom_error")
const { repositories } = require("../../repository")
const { sortvalueObjectsForList } = require("../../utils/sortValueByDate")

module.exports.getGraphDataList = async(req, res) => {
    try {
        const { id }= req.params
        const args = req.data
        const query = { ...args, type: args.type, limit:args.limit, finishDate: args.date2, startDate: args.date1 }
        const dataListDocuments = await repositories().electObjectRepository().findOneAndDataList(id, query)
        let result = new Map()
        if (dataListDocuments) result = await sortvalueObjectsForList(dataListDocuments.parameters, dataListDocuments.type)

        res.status(200).json({ status: 200, error: null, data: Object.fromEntries(result) })
    } catch (err) {
        const error = new CustomError(err.status, err.message)
        res.status(error.status).json({ status: error.status, error: error.message, data: null })
    }
}


module.exports.getGraphDataListCalculation = async(req, res) => {
    try {
        const { id }= req.params
        const args = req.data
        const query = { ...args, type: args.type, limit:args.limit, finishDate: args.date2, startDate: args.date1 }
        
        const dataListDocuments = await repositories().calculationObjectRepository().findOneAndDataList(id, query)
        let result = new Map()
        if (dataListDocuments) result = await sortvalueObjectsForGraphObject(dataListDocuments.parameters)
        
        res.status(200).json({ status: 200, error: null, data: Object.fromEntries(result) })
    } catch (err) {
        const error = new CustomError(err.status, err.message)
        res.status(error.status).json({ status: error.status, error: error.message, data: null })
    }
}
