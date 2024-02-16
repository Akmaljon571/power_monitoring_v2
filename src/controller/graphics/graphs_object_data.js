const CustomError = require("../../utils/custom_error")
const { repositories } = require("../../repository")
const { sortvalueObjectsForGraphObjectArchive, sortvalueObjectsForGraphObjectCurrent } = require("../../utils/sortValueByDate")

module.exports.getGraphsAndObjectDataArchive = async(req, res) => {
    try {
        const { id } = req.id
        const archiveQuery = req.data

        let resultArchive = new Map()
        if (archiveQuery) {
            const graphDocumentsArchive = await repositories().electObjectRepository().findOneGraphAndObjectArchive(id, archiveQuery)
            if (graphDocumentsArchive) resultArchive = await sortvalueObjectsForGraphObjectArchive(graphDocumentsArchive.parameters, graphDocumentsArchive.type)
        }
            
        res.status(200).json({ status: 200, error: null, data: Object.fromEntries(resultArchive) })
    } catch (err) {
        const error = new CustomError(err.status, err.message)
        res.status(error.status).json({ status: error.status, error: error.message, data: null })
    }
}

module.exports.getGraphsAndObjectCurrent = async(req, res) => {
    try {
        const { id } = req.id
        const currentQuery = req.data

        let resultCurrent = new Map()
        if (currentQuery) {
            const graphDocumentsCurrent = await repositories().electObjectRepository().findOneGraphAndObjectCurrent(id, currentQuery)
            if (graphDocumentsCurrent) resultCurrent = await sortvalueObjectsForGraphObjectCurrent(graphDocumentsCurrent.parameters, graphDocumentsCurrent.type)
        }

        res.status(200).json({ status: 200, error: null, data: Object.fromEntries(resultCurrent) })
    } catch (err) {
        const error = new CustomError(err.status, err.message)
        res.status(error.status).json({ status: error.status, error: error.message, data: null })
    }
}

module.exports.getGraphsAndObjectDataCalculationArchive = async(req, res) => {
    try {
        const { id } = req.id
        const archiveQuery = req.data

        let resultArchive = new Map()
        if (archiveQuery) {
            const graphDocumentsArchive = await repositories().calculationObjectRepository().findOneGraphAndObjectArchive(id, archiveQuery)
            if (graphDocumentsArchive) resultArchive = await sortvalueObjectsForGraphObjectArchive(graphDocumentsArchive.parameters, graphDocumentsArchive.type)
        }
        
        res.status(200).json({ status: 200, error: null, data: Object.fromEntries(resultArchive) })
    } catch (err) {
        const error = new CustomError(err.status, err.message)
        res.status(error.status).json({ status: error.status, error: error.message, data: null })
    }
}

module.exports.getGraphsAndObjectDataCalculationCurrent = async(req, res) => {
    try {
        const { id } = req.id
        const currentQuery = req.data

        let resultCurrent = new Map()
        if (currentQuery) {
            const graphDocumentsCurrent = await repositories().calculationObjectRepository().findOneGraphAndObjectCurrent(id, currentQuery)
            if (graphDocumentsCurrent) resultCurrent = await sortvalueObjectsForGraphObjectCurrent(graphDocumentsCurrent.parameters, graphDocumentsCurrent.type)
        }

        res.status(200).json({ status: 200, error: null, data: Object.fromEntries(resultCurrent) })
    } catch (err) {
        const error = new CustomError(err.status, err.message)
        res.status(error.status).json({ status: error.status, error: error.message, data: null })
    }
}
