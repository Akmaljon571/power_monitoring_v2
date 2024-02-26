const { paramsIndex2 } = require("../global/file-path");
const { energyarchive } = require("../global/variable");
const { repositories } = require("../repository");
const { serialPort } = require("../server/utils/serialport/serialport");
const { requestBilling, requestArchive, requestDateTime } = require("./request");

const yesterday = new Date();
yesterday.setUTCHours(0, 0, 0, 0)
yesterday.setDate(new Date().getDate() - 1)

var millisecondsInDay = 1000 * 60 * 60 * 24;

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
        if (!paramsIndex2(meter.meter_type).archive) {
            await repositories().previousObjectRepository().update(meter._id, yesterday)
            return
        }

        const previousDate = new Date(oldDate)
        const currentDate = new Date(oldDate)

        const difference = yesterday - previousDate;
        const daysDifference = Math.ceil(difference / millisecondsInDay);
        const kun = Math.floor(daysDifference / 10)
        const qoldiq = daysDifference % 10

        const meters = await repositories().meterRepository().findAll({ subquery: { parameter_type: "archive" } })
        const shotchik = meters.find(e => String(e._id) == String(meter._id)).parameters

        let activePowerPlus = shotchik.find(e => e.param_short_name === energyarchive[0])
        let activePowerMinus = shotchik.find(e => e.param_short_name === energyarchive[1])
        let reactivePowerPlus = shotchik.find(e => e.param_short_name === energyarchive[2])
        let reactivePowerMinus = shotchik.find(e => e.param_short_name === energyarchive[3])
        const checkTime = await repositories().parameterValueRepository().findTodayList(activePowerPlus._id)

        for (let i = 0; i < kun; i++) {
            if (i) {
                previousDate.setDate(previousDate.getDate() + 10)
            }

            currentDate.setDate(previousDate.getDate() + 9)
            const requestString = requestArchive(meter, previousDate, currentDate)
            console.log(requestString)

            const data = await serialPort(requestString)
            await saveData(data)
        }

        if (qoldiq) {
            if (kun) {
                previousDate.setDate(previousDate.getDate() + 10)
            }

            const requestString = requestArchive(meter, previousDate, yesterday)
            console.log(requestString)

            const data = await serialPort(requestString)
            await saveData(data)
        }

        async function saveData(data) {
            const dateTime = (date) => {
                const [day, month, year, hours, minutes] = date.split(/[^\d]+/);
                return new Date(`20${year}`, month - 1, day, hours, minutes)
            }

            let valuesList = []
            data.map((element) => {
                if (element?.status != undefined && element?.status == 0) {
                    return
                }
                const date = dateTime(element?.date)
                const today = new Date()

                const check1 = date - today <= 0
                let check2 = true
                let check3 = true
                if (checkTime.last_add) {
                    check2 = today - checkTime.last_add > 0
                    check3 = date - new Date(checkTime.last_join) >= 0
                }

                if (check1 && check2 && check3) {
                    if (element?.profile1) {
                        let activePowerValue = {
                            date,
                            value: Number(element.profile1),
                            parameter: activePowerPlus._id
                        }
                        valuesList.push(activePowerValue)
                    }
                    if (element?.profile2) {
                        let activePowerValueMinus = {
                            date,
                            value: Number(element.profile2),
                            parameter: activePowerMinus._id
                        }
                        valuesList.push(activePowerValueMinus)
                    }
                    if (element?.profile3) {
                        let reactivePowerValue = {
                            date,
                            value: Number(element.profile3),
                            parameter: reactivePowerPlus._id
                        }
                        valuesList.push(reactivePowerValue)
                    }
                    if (element?.profile4) {
                        let reactivePowerValueMinus = {
                            date,
                            value: Number(element.profile4),
                            parameter: reactivePowerMinus._id
                        }
                        valuesList.push(reactivePowerValueMinus)
                    }
                }
            })
            console.log(valuesList.length, "value")
            await repositories().parameterValueRepository().insert(false, valuesList)
            await repositories().previousObjectRepository().update(meter._id, yesterday)
        }

        return 'ok'
    } catch (error) {
        console.log(error, 'dfsetf')
    }
}

const billingFill = async (meter, oldDate) => {
    try {
        if (!paramsIndex2(meter.meter_type).billing) {
            await repositories().previousObjectRepository().update(meter._id, '', yesterday)
            return
        }

        const previousDate = new Date(oldDate)
        const currentDate = new Date(oldDate)

        const difference = yesterday - previousDate;
        const daysDifference = Math.ceil(difference / millisecondsInDay);
        const kun = Math.floor(daysDifference / 10)
        const qoldiq = daysDifference % 10

        if (kun) {
            for (let i = 0; i < kun; i++) {
                if (i) {
                    previousDate.setDate(previousDate.getDate() + 10)
                }
                currentDate.setDate(previousDate.getDate() + 9)
                const requestString = requestBilling(meter, previousDate, currentDate)
                console.log(requestString)

                const data = await serialPort(requestString)
                await saveData(data)
            }
        }

        if (qoldiq) {
            if (kun) {
                previousDate.setDate(previousDate.getDate() + 10)
            }
            const requestString = requestBilling(meter, previousDate, yesterday)
            console.log(requestString)
            const data = await serialPort(requestString)
            await saveData(data)
        }

        async function saveData(data) {
            const valueList = []

            data.map(e => {
                const dateFormat = e[0].split('.').reverse()
                dateFormat[0] = "" + "20" + dateFormat[0]
                const date = new Date(dateFormat)
                date.setUTCHours(0, 0, 0, 0)
                date.setDate(date.getDate() + 1)

                const newObj = { date, meter_id: meter._id, }
                for (let i = 0; i < e.length; i++) {
                    if (e[i]) {
                        switch (i) {
                            case 1:
                                newObj["summa_A1"] = e[1]
                                break;
                            case 2:
                                newObj["summa_A0"] = e[2]
                                break;
                            case 3:
                                newObj["summa_R1"] = e[3]
                                break;
                            case 4:
                                newObj["summa_R0"] = e[4]
                                break;
                            case 5:
                                newObj["tarif1_A1"] = e[5]
                                break;
                            case 6:
                                newObj["tarif2_A1"] = e[6]
                                break;
                            case 7:
                                newObj["tarif3_A1"] = e[7]
                                break;
                            case 8:
                                newObj["tarif4_A1"] = e[8]
                                break;
                            case 9:
                                newObj["tarif1_A0"] = e[9]
                                break;
                            case 10:
                                newObj["tarif2_A0"] = e[10]
                                break;
                            case 11:
                                newObj["tarif3_A0"] = e[11]
                                break;
                            case 12:
                                newObj["tarif4_A0"] = e[12]
                                break;
                            case 13:
                                newObj["tarif1_R1"] = e[13]
                                break;
                            case 14:
                                newObj["tarif2_R1"] = e[14]
                                break;
                            case 15:
                                newObj["tarif3_R1"] = e[15]
                                break;
                            case 16:
                                newObj["tarif4_R1"] = e[16]
                                break;
                            case 17:
                                newObj["tarif1_R0"] = e[17]
                                break;
                            case 18:
                                newObj["tarif2_R0"] = e[18]
                                break;
                            case 19:
                                newObj["tarif3_R0"] = e[19]
                                break;
                            case 20:
                                newObj["tarif4_R0"] = e[20]
                                break;
                        }
                    }
                }
                valueList.push(newObj)
            })
            console.log(valueList.length, 'valueList billing')

            await repositories().previousObjectRepository().update(meter._id, '', yesterday)
            await repositories().billingRepository().insert(valueList)
        }

        return 'ok'
    } catch (error) {
        console.log(error)
    }
}

const checkDate = async (meter) => {
    try {
        if (!meter.time_difference) {
            return 'ok'
        }

        const requestString = requestDateTime(meter)
        const data = await serialPort(requestString)
        const time = data[0]?.[paramsIndex2(meter.meter_type).datatime]?.split(' ')[0]
        const date = data[0]?.[paramsIndex2(meter.meter_type).datatime]?.split('/')[1].split('.').reverse()
        date[0] = '' + 20 + date[0]
        const datatime = new Date(...date.concat(time.split(':')))
        datatime.setMonth(datatime.getMonth() - 1)

        const result = Math.abs(datatime - new Date())

        if ((result / 1000) <= meter.time_difference) {
            console.log('date o`tdi')
            return 'ok'
        } else {
            return
        }
    } catch (error) {
        console.log(error)
        return
    }
};

module.exports.previousCheking = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            const previous = await filterPrevious()
            console.log(previous, 'previous')
            if (previous.length) {
                for (let i = 0; i < previous.length; i++) {
                    const meter = await repositories().meterRepository().findOne(previous[i].meter_id)

                    const date = await checkDate(meter)
                    if (date) {
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
