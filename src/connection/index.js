const { energyarchive, real_time_variable } = require('../global/variable')
const { repositories } = require('../repository')
const { serialPort } = require('../server/utils/serialport/serialport')
const { previousCheking } = require('./previous')
const { requestBilling, requestArchive, requestDateTime, requestCurrent } = require('./request')

let bool = true

module.exports.startMiddleware = async (status, sendMessage, realTime) => {
    if (status === 'run-app') {
        bool = false
        // await previousCheking()
    }

    bool = true
    await getDataFromMiddleware(sendMessage, realTime)
}

const getDataFromMiddleware = async (sendMessage, realTime) => {
    try {
        if (bool) {
            const meters = await repositories().meterRepository().findAll({ subquery: { parameter_type: "current" } })
            for (let i in meters) {
                let parameterIds = []
                meters[i].parameters?.map(param => {
                    if (param.status == 'active') {
                        parameterIds.push(`${param.channel_full_id}`)
                    }
                })
                await checkDate(meters[0], parameterIds, sendMessage, realTime).then(async (res) => {
                    await getDataFromMiddleware(sendMessage, realTime)
                })
            }
        }
    } catch (err) {
        console.log(err);
    }
}

const checkDate = async (meter, parameterIds, sendMessage, realTime) => {
    return new Promise(async (resolve, reject) => {
        try {
            const chech_date_fn = async () => {
                sendMessage(meter._id, 'send', 'date')
                const journalParameter = { meter: meter._id, request_type: "archive", status: "sent" }
                const newJournalDocument = await repositories().journalRepository().insert(journalParameter)

                if (!meter.time_difference) {
                    await archiveData(meter, parameterIds, newJournalDocument._id, sendMessage, realTime).then((res) => {
                        console.log(res)
                        resolve({ txt: 'no time given', meter: meter.meter_type })
                    })
                    return
                }

                const requestString = requestDateTime(meter)
                const data = await serialPort(requestString)

                const time = data[0]?.['1.15.0']?.split(' ')[0]
                const date = data[0]?.['1.15.0']?.split('/')[1].split('.').reverse()
                date[0] = '' + 20 + date[0]
                const datatime = new Date(...date.concat(time.split(':')))
                datatime.setMonth(datatime.getMonth() - 1)

                const result = Math.abs(datatime - new Date())
                if ((result / 1000) <= meter.time_difference) {
                    console.log('date o`tdi')
                    sendMessage(meter._id, 'end', 'date')
                    await archiveData(meter, parameterIds, newJournalDocument._id, sendMessage, realTime)
                        .then((res) => {
                            console.log(res)
                            resolve('ok')
                        })
                } else {
                    await repositories().journalRepository().update({ _id: newJournalDocument._id, status: "failed" })
                    sendMessage(meter._id, "Error", 'date')
                    resolve('ok')
                }
            }

            const date = new Date()
            if (meter.days_of_month.includes(date.getDate())) {
                const hour = meter.hours_of_day.find(e => e.hour == date.getHours())

                if (hour && hour.minutes.includes(date.getMinutes())) {
                    await chech_date_fn()
                    return
                }
            }

            resolve('ok')
        } catch (error) {
            console.log(error)
            sendMessage(meter._id, 'Error', 'date')
            resolve('error')
        }
    });
};

const archiveData = async (meter, parameterIds, journalId, sendMessage, realTime) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkTime = await repositories().parameterValueRepository().findTodayList(new Date())
            await repositories().journalRepository().update({ _id: journalId, status: "succeed" })

            const last_add_time = new Date(checkTime.last_add)
            last_add_time.setUTCMilliseconds(checkTime.time);

            if (last_add_time - new Date() > 0) {
                sendMessage(meter._id, 'end', 'archive')
                await billingData(meter, parameterIds, sendMessage, realTime).then((res) => {
                    console.log(res)
                    resolve('next')
                })
                return
            }

            const meters = await repositories().meterRepository().findAll({ subquery: { parameter_type: "archive" } })
            const shotchik = meters.find(e => String(e._id) == String(meter._id)).parameters
            let activePowerPlus = shotchik.find(e => e.param_short_name === energyarchive[0])
            let activePowerMinus = shotchik.find(e => e.param_short_name === energyarchive[1])
            let reactivePowerPlus = shotchik.find(e => e.param_short_name === energyarchive[2])
            let reactivePowerMinus = shotchik.find(e => e.param_short_name === energyarchive[3])

            const newDate = new Date()
            const requestString = requestArchive(meter, newDate, newDate)
            const data = await serialPort(requestString)
            sendMessage(meter._id, 'send', 'archive')

            let valuesList = []

            data.map((element) => {
                const [day, month, year, hours, minutes] = element?.date?.split(/[^\d]+/);
                const date = new Date(`20${year}`, month - 1, day, hours, minutes)
                if (date - new Date(checkTime.last_add) > 0 && element.status == 1) {
                    let activePowerValue = {
                        date,
                        value: Number(element.profile1),
                        parameter: activePowerPlus._id
                    }
                    let activePowerValueMinus = {
                        date,
                        value: Number(element.profile2),
                        parameter: activePowerMinus._id
                    }
                    let reactivePowerValue = {
                        date,
                        value: Number(element.profile3),
                        parameter: reactivePowerPlus._id
                    }
                    let reactivePowerValueMinus = {
                        date,
                        value: Number(element.profile4),
                        parameter: reactivePowerMinus._id
                    }
                    valuesList.push(activePowerValue, reactivePowerValue, activePowerValueMinus, reactivePowerValueMinus)
                }
            })

            console.log(valuesList.length, 'valueList Archive')
            sendMessage(meter._id, 'end', 'archive')
            await billingData(meter, parameterIds, sendMessage, realTime).then(async () => {
                await repositories().parameterValueRepository().insert(false, valuesList)
                await repositories().journalRepository().update({ _id: journalId, status: "succeed" })
                await repositories().previousObjectRepository().update(meter._id, last_add_time)
            }).finally(() => {
                resolve('ok')
            })
        } catch (error) {
            console.log(error)
            sendMessage(meter._id, 'Error', 'archive')
            resolve('ok')
        }
    })
}

const billingData = async (meter, parameterIds, sendMessage, realTime) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (await repositories().billingRepository().findToday(meter._id)) {
                console.log('billing ketdi')
                sendMessage(meter._id, 'end', 'billing')
                await currentData(meter, parameterIds, sendMessage, realTime).then(() => {
                    resolve('next')
                })
                return
            }
            const yesterday = new Date();
            yesterday.setUTCHours(0, 0, 0, 0)
            yesterday.setDate(new Date().getDate() - 1)

            const requestString = requestBilling(meter, yesterday, yesterday)
            const data = await serialPort(requestString)
            sendMessage(meter._id, 'send', 'billing')

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
            sendMessage(meter._id, 'end', 'billing')

            await currentData(meter, parameterIds, sendMessage, realTime).then(async () => {
                await repositories().billingRepository().insert(valueList)
                await repositories().previousObjectRepository().update(meter._id, '', yesterday)
            }).finally(() => {
                resolve('ok')
            })
        } catch (error) {
            console.log(error)
            sendMessage(meter._id, 'Error', 'billing')
            resolve('ok')
        }
    })
}

const currentData = async (meter, list, sendMessage, realTime) => {
    return new Promise(async (resolve, reject) => {
        let journalParameter = {
            meter: meter._id,
            request_type: "current",
            status: "sent"
        }
        sendMessage(meter._id, 'send', 'current')
        let newJournalDocument = await repositories().journalRepository().insert(journalParameter)

        const requestString = requestCurrent(meter, list)
        console.log(requestString)
        const data = await serialPort(requestString)

        const date = new Date()
        const modelDate = "" + date.getFullYear() + date.getMonth()
        const realTimeData = { date: new Date(), "AP": "0", "RP": "0", "FP": "0", "CP": "0" }
        const valueList = []

        const realTimeVariable = real_time_variable(meter.meter_type)
        for (let i = 0; i < list.length; i++) {
            let parameter = await repositories().parameterRepository().findOne({ channel_full_id: list[i], meter: meter._id })
            if (list[i] == realTimeVariable[0]) {
                realTimeData.AP = data[i][list[i]]
            } else if (list[i] == realTimeVariable[1]) {
                realTimeData.RP = data[i][list[i]]
            } else if (list[i] == realTimeVariable[2]) {
                realTimeData.FP = data[i][list[i]]
            } else if (list[i] == realTimeVariable[3]) {
                realTimeData.CP = data[i][list[i]]
            }

            if (parameter) {
                const result = { value: data[i][list[i]], date, parameter: parameter._id }
                valueList.push(result)
            } else {
                console.log('parameter not found')
            }
        }

        await repositories().parameterValueRepository().insert(modelDate, valueList).then(async () => {
            realTime(realTimeData)
            await repositories().journalRepository().update({ _id: newJournalDocument._id, status: "succeed" })
            sendMessage(meter._id, "end", 'current')
        }).finally(() => {
            resolve('ok')
        })
    })
}
