const CustomError = require("../../utils/custom_error")
const { repositories } = require("../../repository")
const { sortvalueObjectsForFirstReport } = require("../../utils/sortValueByDate")

module.exports.getFirstTemplateReport = async(req, res) => {
    try {
        const { id } = req.params
        const { date1, date2 } = req.data

        const pages = await repositories().electObjectRepository().firstTemplateReport(id, { startDate: date1, finishDate: date2})
        let reportData
        if (pages) reportData = sortvalueObjectsForFirstReport(pages.parameters)
        
        res.status(200).json({ status: 200, error: null, data: reportData ? Object.fromEntries(reportData) : {} })
    } catch (err) {
        const error = new CustomError(err.status, err.message)
        res.status(error.status).json({ status: error.status, error: error.message, data: null })
    }
}
