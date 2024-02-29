const { previousModel } = require("../../models")
const CustomError = require("../../utils/custom_error")

module.exports.previousObjectRepository = () => {
    return Object.freeze({
        insert,
        update,
        findOne,
        findAll,
        updateLoop
    })

    async function insert(meter) {
        try {
            const date = new Date()
            date.setUTCHours(0, 0, 0, 0)
            if (meter.data_polling_length) {
                date.setDate(new Date().getDate() - Number(meter.data_polling_length))
            }
            await previousModel.create({
                archive: date,
                billing: date,
                meter_id: meter._id
            })
            // await previous funksiyasi chaqirib yuboriladi
        } catch (error) {
            throw new CustomError(error.status, error.message)
        }
    }

    async function update(meter_id, archive = '', billing = '') {
        try {
            const find = await previousModel.findOne({ meter_id })

            await previousModel.updateOne(
                { meter_id: meter_id },
                { $set: { archive: archive || find.archive, billing: billing || find.billing } }
            )
        } catch (error) {
            throw new CustomError(error.status, error.message)
        }
    }

    async function updateLoop(meter_id, archive = '', billing = '') {
        try {
            const find = await previousModel.findOne({ meter_id })
            const dateFind = archive || billing
            const date = new Date(dateFind)
            date.setUTCHours(date.getHours())

            await previousModel.updateOne(
                { meter_id: meter_id },
                { $set: { archive: archive ? date : find.archive, billing: billing ? date : find.billing } }
            )
        } catch (error) {
            throw new CustomError(error.status, error.message)
        }
    }

    async function findOne(meter_id) {
        return await previousModel.findOne({ meter_id: meter_id })
    }

    async function findAll() {
        try {
            return await previousModel.find()
        } catch (error) {
            throw new CustomError(error.status, error.message)
        }
    }
}