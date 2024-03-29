const { paramsOBISReadFile, paramsIndex2 } = require('../global/file-path')
const { energyarchive } = require('../global/variable')
const { repositories } = require('../repository')
const { previousCheking } = require('./previous')
const { requestBilling, requestArchive, requestDateTime, requestCurrent } = require('./request')
const serialPort = require('../server')
const CustomError = require('../utils/custom_error')

let bool = true
let sendMessageFN
let loading = false
let queueList = []

module.exports.startMiddleware = async (status, sendMessage = sendMessageFN) => {
    sendMessageFN = sendMessage
    const metersList = await repositories().meterRepository().findAll({ subquery: { parameter_type: "current" } })
    const meters = metersList.filter(e => e.meter_type != 'TE_73CAS')
    if (status === 'run-app') {
        if (!loading) {
            bool = false
            // await previousCheking().then(e => {
            //     if(e == 'loading') {
            //         loading = true
            //     } else {
            //         loading = false
            //     }
            // })
        } else {
            console.log('Navbatlar royxatiga tushdi')
            queueList.push(1)
        }
    }

    bool = true
    if (!loading) {
        // await getDataFromMiddleware(meters, sendMessage)
    }
}

const getDataFromMiddleware = async (meters, sendMessage) => {
    try {
        if (bool) {
            for (let i in meters) {
                let parameterIds = []
                meters[i].parameters?.map(param => {
                    if (param.status == 'active') {
                        parameterIds.push(`${param.channel_full_id}`)
                    }
                })
                if (queueList.length) {
                    queueList = []
                    await this.startMiddleware('run-app', sendMessage)
                    return
                }
                loading = true
                await checkDate(meters[i], parameterIds, sendMessage).then(() => loading = false)
            }
            if (meters.length) {
                if (queueList.length) {
                    queueList = []
                    await this.startMiddleware('run-app', sendMessage)
                    return
                } else {
                    await getDataFromMiddleware(meters, sendMessage)
                }
            }
        }
    } catch (err) {
        console.log(err);
    }
}

const checkDate = async (meter, parameterIds, sendMessage) => {
    return new Promise(async (resolve, reject) => {
        try {
            const chech_date_fn = async () => {
                console.log(meter.meter_type)
                sendMessage(meter._id, 'send', 'date')
                const journalParameter = { meter: meter._id, request_type: "archive", status: "sent" }
                const newJournalDocument = await repositories().journalRepository().insert(journalParameter)

                if (!meter.time_difference) {
                    await archiveData(meter, parameterIds, newJournalDocument._id, sendMessage).then((res) => {
                        console.log(res)
                        resolve({ txt: 'no time given', meter: meter.meter_type })
                    })
                    return
                }

                const requestString = requestDateTime(meter)
                console.log(requestString)
                const data = await serialPort(requestString)
                console.log(data)
                if(data.error) {
                    throw new CustomError(500, data.message)
                }

                const time = data[0]?.[paramsIndex2(meter.meter_type).datatime]?.split(' ')[0]
                const date = data[0]?.[paramsIndex2(meter.meter_type).datatime]?.split('/')[1].split('.').reverse()
                date[0] = '' + 20 + date[0]
                const datatime = new Date(...date.concat(time.split(':')))
                datatime.setMonth(datatime.getMonth() - 1)

                const result = Math.abs(datatime - new Date())

                if ((result / 1000) <= meter.time_difference) {
                    console.log('date o`tdi')
                    sendMessage(meter._id, 'end', 'date')
                    await archiveData(meter, parameterIds, newJournalDocument._id, sendMessage).then((res) => {
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
            console.log(error, '___________________________________________________________ Aynan meni errorim')
            sendMessage(meter._id, 'Error', 'date')
            setTimeout(() => {
                resolve('error')
            }, 5000);
        }
    });
};

const archiveData = async (meter, parameterIds, journalId, sendMessage) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!paramsIndex2(meter.meter_type).archive) {
                await repositories().previousObjectRepository().updateLoop(meter._id, new Date())
                await billingData(meter, parameterIds, sendMessage).then(() => {
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
            const checkTime = await repositories().parameterValueRepository().findTodayList(activePowerPlus._id)

            if (checkTime.last_join - new Date() > 0) {
                sendMessage(meter._id, 'end', 'archive')
                await billingData(meter, parameterIds, sendMessage).then((res) => {
                    console.log(res)
                    resolve('next')
                })
                return
            }

            const newDate = new Date()
            const requestString = requestArchive(meter, newDate, newDate)
            sendMessage(meter._id, 'send', 'archive')
            console.log(requestString)
            const data = await serialPort(requestString)
            console.log(data)
            if(data.error) {
                throw new CustomError(500, data.error)
            }

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
                    console.log(element)
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
            console.log(valuesList.length, 'valueList Archive')
            sendMessage(meter._id, 'end', 'archive')

            await billingData(meter, parameterIds, sendMessage).then(async () => {
                await repositories().parameterValueRepository().insert(false, valuesList)
                await repositories().journalRepository().update({ _id: journalId, status: "succeed" })
                await repositories().previousObjectRepository().updateLoop(meter._id, new Date())
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

const billingData = async (meter, parameterIds, sendMessage) => {
    return new Promise(async (resolve, reject) => {
        try {
            const yesterday = new Date();
            yesterday.setUTCHours(0, 0, 0, 0)
            yesterday.setDate(new Date().getDate() - 1)

            if (!paramsIndex2(meter.meter_type).billing) {
                await repositories().previousObjectRepository().update(meter._id, '', yesterday)
                await currentData(meter, parameterIds, sendMessage).then(() => {
                    resolve('next')
                })
                return
            }

            if (await repositories().billingRepository().findToday(meter._id)) {
                console.log('billing ketdi')
                sendMessage(meter._id, 'end', 'billing')
                await currentData(meter, parameterIds, sendMessage).then(() => {
                    resolve('next')
                })
                return
            }

            const requestString = requestBilling(meter, yesterday, yesterday)
            sendMessage(meter._id, 'send', 'billing')
            console.log(requestString)
            const data = await serialPort(requestString)
            console.log(data)
            if(data.error) {
                throw new CustomError(500, data.error)
            }

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
                console.log(newObj)
                valueList.push(newObj)
            })
            console.log(valueList.length, 'valueList billing')
            sendMessage(meter._id, 'end', 'billing')

            await currentData(meter, parameterIds, sendMessage).then(async () => {
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

const currentData = async (meter, list, sendMessage) => {
    return new Promise(async (resolve, reject) => {
        try {
            let journalParameter = {
                meter: meter._id,
                request_type: "current",
                status: "sent"
            }
            let newJournalDocument = await repositories().journalRepository().insert(journalParameter)
            
            const requestString = requestCurrent(meter, list)
            sendMessage(meter._id, 'send', 'current')
            console.log(requestString)
            const data = await serialPort(requestString)
            console.log(data)
            if(data.error) {
                throw new CustomError(500, data.error)
            }

            const date = new Date()
            const modelDate = "" + date.getFullYear() + date.getMonth()
            const valueList = []

            const existsObis = paramsOBISReadFile(meter.meter_type)

            for (let i = 0; i < list.length; i++) {
                if (existsObis.includes(list[i])) {
                    let parameter = await repositories().parameterRepository().findOne({ channel_full_id: list[i], meter: meter._id })

                    if (parameter) {
                        const result = { value: data[i][list[i]], date, parameter: parameter._id }
                        valueList.push(result)
                    } else {
                        console.log('parameter not found')
                    }
                }
            }

            await repositories().parameterValueRepository().insert(modelDate, valueList).then(async () => {
                await repositories().journalRepository().update({ _id: newJournalDocument._id, status: "succeed" })
                sendMessage(meter._id, "end", 'current')
            }).finally(() => {
                resolve('ok')
            })
        } catch (error) {
            console.log(error)
            sendMessage(meter._id, 'Error', 'current')
            resolve('error')
        }
    })
}
