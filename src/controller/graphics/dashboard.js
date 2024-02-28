const CustomError = require("../../utils/custom_error")
const { repositories } = require("../../repository")

module.exports.getDashboardData = async (req, res) => {
    try {
        const { id } = req.params
        const query = req.data

        query.childObjects = query.childObjects && query.childObjects === false ? query.childObjects : true
        query.getParameters = query.getParameters && query.getParameters === false ? query.getParameters : true
        const dailyDocuments = await repositories().electObjectRepository().findOneAndDashboard(id, query, "daily")
        const monthlyDocuments = await repositories().electObjectRepository().findOneAndDashboard(id, query, "monthly")

        if (dailyDocuments && dailyDocuments.type === 'feeder') {
            for (let i = 0; i < dailyDocuments.parameters.length; i++) {
                dailyDocuments.parameters[i].parameter_values = dailyDocuments.parameters[i].parameter_values.map((param) => {
                    dailyDocuments.parameters[i].multiply.map(element => {
                        param.value = param.value * element
                    })
                    return param
                })
            }
        }
        if (monthlyDocuments && monthlyDocuments.type === 'feeder') {
            for (let i = 0; i < monthlyDocuments.parameters.length; i++) {
                monthlyDocuments.parameters[i].parameter_values = monthlyDocuments.parameters[i].parameter_values.map((param) => {
                    monthlyDocuments.parameters[i].multiply
                        .map(element => {
                            param.value = param.value * element
                        })
                    return param
                })
            }
        }
        res.status(200).json({ status: 200, error: null, data: { dailyDocuments, monthlyDocuments } })
    } catch (err) {
        const error = new CustomError(err.status, err.message)
        res.status(error.status).json({ status: error.status, error: error.message, data: null })
    }
}

module.exports.getDashboardDataCalculation = async (req, res) => {
    try {
        const { id } = req.params
        const query = req.data

        query.childObjects = query.childObjects && query.childObjects === false ? query.childObjects : true
        query.getParameters = query.getParameters && query.getParameters === false ? query.getParameters : true
        const dailyDocuments = await repositories().calculationObjectRepository().findOneAndDashboard(id, query, "daily")
        const monthlyDocuments = await repositories().calculationObjectRepository().findOneAndDashboard(id, query, "monthly")

        res.status(200).json({ status: 200, error: null, data: { dailyDocuments, monthlyDocuments } })
    } catch (err) {
        const error = new CustomError(err.status, err.message)
        res.status(error.status).json({ status: error.status, error: error.message, data: null })
    }
}

module.exports.getRealTime = async (req, res) => {
    try {
        const { id } = req.params

        const data = await repositories().electObjectRepository().realTime(id)
        res.status(200).json({ status: 200, error: null, data })
    } catch (error) {
        console.log(error)
        res.status(error.status).json({ status: error.status, error: error.message, data: null })
    }
}

module.exports.getRealTimeReport = async (req, res) => {
    try {
        const { id } = req.params

        const data = await repositories().calculationObjectRepository().realTime(id)
        res.status(200).json({ status: 200, error: null, data })
    } catch (error) {
        console.log(error)
        res.status(error.status).json({ status: error.status, error: error.message, data: null })
    }
}
