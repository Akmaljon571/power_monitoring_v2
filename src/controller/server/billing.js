const CustomError = require("../../utils/custom_error")
const { repositories } = require("../../repository")

module.exports.getListBilling = async (req, res) => {
    try {
        const { id } = req.params
        let { date1, date2 } = req.data

        const data = await repositories().billingRepository().findList(id, date1, date2)
        res.status(200).json({status: 200, error: null, data})
    } catch (err) { 
        const error = new CustomError(err.status, err.message)
        res.status(error.status).json({ status: error.status, error: error.message, data: null })
    }
}
