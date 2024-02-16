const CustomError = require("../../helpers/customError")
const { repositories } = require("../../db_mongodb/repository/index")
const { sortvalueObjectsForList } = require("../../helpers/sortValueByDate")


module.exports.getGraphDataList = () => {
    return async (event, args) => {
        try {
            const documentId = args.id
            const query = { ...args.query,type:args.type,limit:args.limit }

            const dataListDocuments = await repositories().electObjectRepository().findOneAndDataList(documentId, query)
            let result = new Map()
            if (dataListDocuments) {
                result = await sortvalueObjectsForList(dataListDocuments.parameters, dataListDocuments.type)
            }
            let stringfiedResult = JSON.stringify(Object.fromEntries(result))
            return { status: 200, args: stringfiedResult }
           
        } catch (err) {
            return new CustomError(err.status, err.message)
        }
    }
}


module.exports.getGraphDataListCalculation = () => {
    return async (event, args) => {
        try {
            const documentId = args.id
            const query = { ...args.query,type:args.type,limit:args.limit }           
            
            const dataListDocuments = await repositories().calculationObjectRepository().findOneAndDataList(documentId, query)
            let result = new Map()
            if (dataListDocuments) {
                result = await sortvalueObjectsForGraphObject(dataListDocuments.parameters)
            }
            let stringfiedResult = JSON.stringify(Object.fromEntries(result))
            return { status: 200, args: stringfiedResult }
           
        } catch (err) {
            return new CustomError(err.status, err.message)
        }
    }
}



