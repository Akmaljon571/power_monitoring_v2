const CustomError = require("../../helpers/customError")
const { repositories } = require("../../db_mongodb/repository/index")
const { sortvalueObjectsForVectorDiagram } = require("../../helpers/sortValueByDate")
module.exports.getVectorDiagramData = () => {
    return async (event, args) => {
        try {
            const documentId = args.id
            const query = { ...args }
            const digramDocuments = await repositories().electObjectRepository().findOneVectorDiagram(documentId, query)
             let result = new Map()
             if (digramDocuments) {
                result = await sortvalueObjectsForVectorDiagram(digramDocuments.parameters,query)
             }    
            let stringfiedResult = JSON.stringify(Object.fromEntries(result))
            return { status: 200, args: stringfiedResult }
        } catch (err) {
            return new CustomError(err.status, err.message)
        }
    }
}


module.exports.getVectorDiagramDataCalculation = () => {
    return async (event, args) => {
        try {
            const documentId = args.id
            const query = { ...args }
            const digramDocuments = await repositories().calculationObjectRepository().findOneVectorDiagram(documentId, query)
             let result = new Map()
             if (digramDocuments) {
                result = await sortvalueObjectsForVectorDiagram(digramDocuments.parameters,query)
            }
            
            let stringfiedResult = JSON.stringify(Object.fromEntries(result))
            return { status: 200, args: stringfiedResult }
        } catch (err) {
            return new CustomError(err.status, err.message)
        }
    }
}
