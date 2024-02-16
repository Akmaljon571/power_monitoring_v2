const CustomError = require("../../helpers/customError")
const { repositories } = require("../../db_mongodb/repository/index")
const { sortvalueObjectsForGraphObjectArchive, sortvalueObjectsForGraphObjectCurrent } = require("../../helpers/sortValueByDate")

module.exports.getGraphsAndObjectDataArchive = () => {
    return async (event, args) => {
        try {
            const documentId = args.id
            const archiveQuery = args.query && args.query.archive ? { ...args.query.archive } : null
            let resultArchive = new Map()
            if (archiveQuery) {
                const graphDocumentsArchive = await repositories().electObjectRepository().findOneGraphAndObjectArchive(documentId, archiveQuery)
                if (graphDocumentsArchive) {
                    resultArchive = await sortvalueObjectsForGraphObjectArchive(graphDocumentsArchive.parameters, graphDocumentsArchive.type)
                }
            }
                
            resultArchive = JSON.stringify(Object.fromEntries(resultArchive))

            return { status: 200, args: {archiveResult: resultArchive } }

        } catch (err) {
            return new CustomError(err.status, err.message)
        }
    }
}


module.exports.getGraphsAndObjectCurrent = () => {
    return async (event, args) => {
        try {
            const documentId = args.id
            const currentQuery = args.query && args.query.current ? { ...args.query.current } : null
            let resultCurrent = new Map()
            
             if (currentQuery) {
                const graphDocumentsCurrent = await repositories().electObjectRepository().findOneGraphAndObjectCurrent(documentId, currentQuery)
                if (graphDocumentsCurrent) {
                    resultCurrent = await sortvalueObjectsForGraphObjectCurrent(graphDocumentsCurrent.parameters, graphDocumentsCurrent.type)
                }
            }
            resultCurrent = JSON.stringify(Object.fromEntries(resultCurrent))
            return { status: 200, args: {  currentResult: resultCurrent } }
        
        } catch (err) {
            return new CustomError(err.status, err.message)
        }
    }
}

module.exports.getGraphsAndObjectDataCalculationArchive = () => {
    return async (event, args) => {
        try {
            const documentId = args.id
            const archiveQuery = args.query && args.query.archive ? { ...args.query.archive } : null
            let resultArchive = new Map()
            if (archiveQuery) {
                const graphDocumentsArchive = await repositories().calculationObjectRepository().findOneGraphAndObjectArchive(documentId, archiveQuery)
                if (graphDocumentsArchive) {
                    resultArchive = await sortvalueObjectsForGraphObjectArchive(graphDocumentsArchive.parameters, graphDocumentsArchive.type)
                }
            }
          
            resultArchive = JSON.stringify(Object.fromEntries(resultArchive))
             console.log(resultArchive,"archive graphs")
            return { status: 200, args: {archiveResult: resultArchive } }

        } catch (err) {
            return new CustomError(err.status, err.message)
        }
    }
}

module.exports.getGraphsAndObjectDataCalculationCurrent = () => {
    return async (event, args) => {
        try {
            const documentId = args.id
            const currentQuery = args.query && args.query.current ? { ...args.query.current } : null
            let resultCurrent = new Map()
          
            if (currentQuery) {
                const graphDocumentsCurrent = await repositories().calculationObjectRepository().findOneGraphAndObjectCurrent(documentId, currentQuery)
                if (graphDocumentsCurrent) {
                    resultCurrent = await sortvalueObjectsForGraphObjectCurrent(graphDocumentsCurrent.parameters, graphDocumentsCurrent.type)
                }
            }

            resultCurrent = JSON.stringify(Object.fromEntries(resultCurrent))
             console.log(resultCurrent,"graph object")
            return { status: 200, args: { currentResult: resultCurrent } }

        } catch (err) {
            return new CustomError(err.status, err.message)
        }
    }
}