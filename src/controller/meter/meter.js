const { repositories } = require("../../repository/index")
const CustomError = require("../../utils/custom_error")

// createMeterFunction
module.exports.createMeter = async(req, res) => {
    try {
        const args = req.result
        if (args.meter_form === "meter") {
            let meter_param = {
                name: args.name,
                meter_type: args.meter_type,
                number_meter: args.number_meter,
                meter_form: args.meter_form,
                connection_address: args.connection_address,
                password: args.password,
                connection_channel: args.connection_channel,
                ip_address: args.ip_address,
                port: args.port,
                waiting_time: args.waiting_time,
                interval_time: args.interval_time,
                pause_time: args.pause_time,
                package_size: args.package_size,
                com_port: args.com_port,
                init_line: args.init_line,
                phone_number: args.phone_number,
                data_polling_length: args.data_polling_length,
                data_refresh_length: args.data_refresh_length,
                period_type: args.period_type,
                days_of_month: args.days_of_month,
                days_of_week: args.days_of_week,
                hours_of_day: args.hours_of_day,
                time_difference:args.time_difference
            }

            const newMeterDocument = await repositories().meterRepository().insert(meter_param)
            let folderParameter = {
                name: newMeterDocument.name,
                folder_type: "meter",
                parent_id: args.id,
                meter: newMeterDocument._id,
            }
            await repositories().previousObjectRepository().insert(newMeterDocument)
            await repositories().folderObjectRepository().insert(folderParameter)
            await repositories().parameterRepository().insert(args.parameters, newMeterDocument)

        } else if (args.meter_form === "uspd") {
            let meter_param = {
                name: args.name,
                meter_type: args.meter_type,
                number_meter: args.number_meter,
                meter_form: args.meter_form,
                data_polling_length: args.data_polling_length,
                data_refresh_length: args.data_refresh_length,
                period_type: args.period_type,
                days_of_month: args.days_of_month,
                days_of_week: args.days_of_week,
                hours_of_day: args.hours_of_day
            }
            const newMeterDocument = await repositories().meterRepository().insert(meter_param)
            let folderParameter = {
                name: newMeterDocument.name,
                folder_type: "meter",
                parent_id: args.parent_id,
                meter: newMeterDocument._id
            }
            await repositories().folderObjectRepository().insert(folderParameter)

            await repositories().parameterRepository().insert(args.parameters, newMeterDocument)
            await repositories().previousObjectRepository().create(newMeterDocument)
        } else {
            throw new CustomError(400, "undefined type")
        }

        res.status(201).json({ status: 201, error: null, data: "Succesfull saved" })
    } catch (err) {
        res.json(new CustomError(err.status, err.message))
    }
}

// getListOfMetersFunction
module.exports.getListMeter = async(req, res) => {
    try {
        const meterList = await repositories().meterRepository().findAll({})
        res.status(200).json({ status: 200, error: null, data: meterList })
    } catch (err) {
        const error = new CustomError(err.status, err.message)
        res.status(error.status).json({ status: error.status, error: error.message, data: null })
    }
}

// getSingleMeterFunction
module.exports.getOneMeter = async(req, res) => {
    try {
        const { id } = req.params
        const meterDocument = await repositories().meterRepository().findOne(id)
        res.status(200).json({ status: 200, error: null, data: meterDocument })
    } catch (err) {
        const error = new CustomError(err.status, err.message)
        res.status(error.status).json({ status: error.status, error: error.message, data: null })
    }
}

// editMeterFunction
module.exports.updateMeter = async (req, res) => {
    try {
        const data = req.result
        const { id } = req.params

        if (data.meter_form === "meter") {
            await repositories().meterRepository().updateOne(id, data)
            if(data?.name) await repositories().folderObjectRepository().updateOne(id,{ name:data.name })
            if(data?.parameters) await repositories().parameterRepository().updateMany(data.parameters)
        } else if (data.meter_form === "uspd") {
            await repositories().meterRepository().updateUSPD(id, data)
            if(data?.name) await repositories().folderObjectRepository().updateOne(id,{ name:data.name })
            if(data?.parameters) await repositories().parameterRepository().updateMany(data.parameters)
        } else {
            throw new CustomError(400, "undefined type")
        }

        res.status(200).json({ status: 200, error: null, data: "Succesfull updated" })
    } catch (err) {
        const error = new CustomError(err.status, err.message)
        res.status(error.status).json({ status: error.status, error: error.message, data: null })
    }
}
