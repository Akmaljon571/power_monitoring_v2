const { repositories } = require("../repository");
const { serialPort } = require("../server/utils/serialport/serialport");
const { requestBilling, requestArchive } = require("./request");

const yesterday = new Date();
yesterday.setUTCHours(0, 0, 0, 0)
yesterday.setDate(new Date().getDate() - 1)

const filterPrevious = async () => {
    try {
        const meters = await repositories().previousObjectRepository().findAll()
        const a = meters.filter(e => e.archive - yesterday < 0 || e.billing - yesterday < 0)

        return a
    } catch (error) {
        console.log(error)
    }
}

const archiveFill = async (meter, oldDate) => {
    try {
        const previousDate = new Date(oldDate)

        const meters = await repositories().meterRepository().findAll({ subquery: { parameter_type: "archive" } })
        const shotchik = meters.find(e => String(e._id) == String(meter._id)).parameters
        let activePowerPlus = shotchik.find(e => e.param_short_name === energyarchive[0])
        let activePowerMinus = shotchik.find(e => e.param_short_name === energyarchive[1])
        let reactivePowerPlus = shotchik.find(e => e.param_short_name === energyarchive[2])
        let reactivePowerMinus = shotchik.find(e => e.param_short_name === energyarchive[3])

        const requestString = requestArchive(meter, previousDate, yesterday)
        const data = await serialPort(requestString)

        let valuesList = []
        let divide = 1

        data.map((element) => {
            const [day, month, year, hours, minutes] = element?.date?.split(/[^\d]+/);
            const date = new Date(`20${year}`, month - 1, day, hours, minutes)
            let activePowerValue = {
                date,
                value: Number(element.profile1) / divide,
                parameter: activePowerPlus._id
            }
            let activePowerValueMinus = {
                date,
                value: Number(element.profile2) / divide,
                parameter: activePowerMinus._id
            }
            let reactivePowerValue = {
                date,
                value: Number(element.profile3) / divide,
                parameter: reactivePowerPlus._id
            }
            let reactivePowerValueMinus = {
                date,
                value: Number(element.profile4) / divide,
                parameter: reactivePowerMinus._id
            }
            valuesList.push(activePowerValue, reactivePowerValue, activePowerValueMinus, reactivePowerValueMinus)
        })
        console.log(valuesList.length, "value")
        await repositories().parameterValueRepository().insert(false, valuesList)
        await repositories().previousObjectRepository().update(meter._id, yesterday)
        return 'ok'
    } catch (error) {
        console.log(error)
    }
}

const billingFill = async (meter, oldDate) => {
    try {
        const previousDate = new Date(oldDate)
        const twoDayAgo = new Date();
        twoDayAgo.setUTCHours(0, 0, 0, 0)
        twoDayAgo.setDate(new Date().getDate() - 2)

        const requestString = requestBilling(meter, previousDate, twoDayAgo)
        const data = await serialPort(requestString)
        const valueList = []

        data.map(e => {
            const dateFormat = e[0].split('.').reverse()
            dateFormat[0] = "" + "20" + dateFormat[0]
            const date = new Date(dateFormat)
            date.setUTCHours(0, 0, 0, 0)
            date.setDate(date.getDate() + 1)

            const obj = {
                summa_A1: e[1],
                summa_A0: e[2],
                summa_R0: e[3],
                summa_R1: e[4],
                tarif1_A1: e[5],
                tarif2_A1: e[6],
                tarif3_A1: e[7],
                tarif4_A1: e[8],
                tarif1_A0: e[9],
                tarif2_A0: e[10],
                tarif3_A0: e[11],
                tarif4_A0: e[12],
                tarif1_R1: e[13],
                tarif2_R1: e[14],
                tarif3_R1: e[15],
                tarif4_R1: e[16],
                tarif1_R0: e[17],
                tarif2_R0: e[18],
                tarif3_R0: e[19],
                tarif4_R0: e[20],
                meter_id: meter._id,
                date
            }
            valueList.push(obj)
        })
        console.log(valueList.length, 'valueList billing')

        await repositories().previousObjectRepository().update(meter._id, '', yesterday)
        await repositories().billingRepository().insert(valueList)
    } catch (error) {
        console.log(error)
    }
}

module.exports.previousCheking = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            const previous = await filterPrevious()
            console.log(previous, 'previous')
            if (previous.length) {
                for (let i = 0; i < previous.length; i++) {
                    const meter = await repositories().meterRepository().findOne(previous[i].meter_id)

                    if (previous[i].archive - yesterday < 0) {
                        console.log('archive boshlandi')
                        await repositories().previousObjectRepository().updateStatus(previous[i]._id, true).then(async () => {
                            await archiveFill(meter, previous[i].archive).then(async () => {
                                await repositories().previousObjectRepository().updateStatus(previous[i]._id, false)
                            })
                        })
                    }
                    if (previous[i].billing - yesterday < 0) {
                        console.log('billing boshlandi')
                        await repositories().previousObjectRepository().updateStatus(previous[i]._id, true).then(async () => {
                            await billingFill(meter, previous[i].billing).then(async () => {
                                await repositories().previousObjectRepository().updateStatus(previous[i]._id, false)
                            })
                        })
                    }
                }
                resolve('finish')
            } else {
                resolve('OK')
            }
        } catch (error) {
            console.log(error)
        }
    })
}
