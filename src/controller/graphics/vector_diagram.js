const CustomError = require("../../utils/custom_error")
const { repositories } = require("../../repository")
const { sortvalueObjectsForVectorDiagram } = require("../../utils/sortValueByDate")

module.exports.getVectorDiagramData = async(req, res) => {
    try {
        const { id } = req.params
        const query = req.data

        const digramDocuments = await repositories().electObjectRepository().findOneVectorDiagram(id, query)
        let result = new Map()
        if (digramDocuments) result = await sortvalueObjectsForVectorDiagram(digramDocuments.parameters, query)

        res.status(200).json({ status: 200, error: null, data: Object.fromEntries(result) })
    } catch (err) {
        const error = new CustomError(err.status, err.message)
        res.status(error.status).json({ status: error.status, error: error.message, data: null })
    }
}

module.exports.getVectorDiagramDataCalculation = async(req, res) => {
    try {
        const { id } = req.params
        const query = req.data
        
        const digramDocuments = await repositories().calculationObjectRepository().findOneVectorDiagram(id, query)
        let result = new Map()
        if (digramDocuments) result = await sortvalueObjectsForVectorDiagram(digramDocuments.parameters,query)

        res.status(200).json({ status: 200, error: null, data: Object.fromEntries(result) })
    } catch (err) {
        const error = new CustomError(err.status, err.message)
        res.status(error.status).json({ status: error.status, error: error.message, data: null })
    }
}
