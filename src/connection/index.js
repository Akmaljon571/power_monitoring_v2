const { meterModel } = require('../models')
const { repositories } = require('../repository')
const { serialPort } = require('../server/utils/serialport')

module.exports.getDataFromMiddleware = async (sendMessage, realTime) => {
    try {
        // while (true) {
        //     const meters = await meterModel.find()
        //     for (let i in meters) {
        //         let parameterIds = []
        //         meters[i].parameters?.map(param => {
        //             if (param.status == 'active') {
        //                 parameterIds.push("'" + param.channel_full_id + "'")
        //             }
        //         })
        //         await checkDate(meters[0], parameterIds, sendMessage, realTime).then(console.log)
        //     }
        // }
    } catch (err) {
        console.log(err);
    }
}

const checkDate = async (meter, parameterIds, sendMessage, realTime) => {
    return new Promise(async (resolve, reject) => {
        const chech_date_fn = async () => {
            await sendMessage(meter._id, 'send')
            const journalParameter = { meter: meter._id, request_type: "archive", status: "sent" }
            const newJournalDocument = await repositories().journalRepository().insert(journalParameter)

            if (!meter.time_difference) {
                await archiveData(meter, parameterIds, sendMessage, realTime, newJournalDocument._id)
                    .then(() => {
                        resolve({ txt: 'no time given', meter: meter.meter_type })
                        return
                    })
            }

            const requestString = {
                "MeterType": meter.meter_type,
                "MeterAddress": meter.connection_address,
                "MeterPassword": meter.password,
                "commMedia": meter.connection_channel,
                "commDetail1": "COM6",
                "commDetail2": meter.port,
                "parity": "even",
                "stopBit": 1,
                "dataBit": 7,
                "ReadingRegister": ["1.12"]
            }
            const data = await serialPort(requestString)
            const time = data[0]?.currentDate?.split(' ')[0]
            const date = data[0]?.currentDate?.split('/')[1].split('.').reverse()
            date[0] = '' + 20 + date[0]
            const datatime = new Date(...date.concat(time.split(':')))
            datatime.setMonth(datatime.getMonth() - 1)

            console.log(datatime)
            const result = Math.abs(datatime - new Date())
            if ((result / 1000) <= meter.time_difference) {
                console.log('date o`tdi')
                await archiveData(meter, parameterIds, sendMessage, realTime, newJournalDocument._id)
                    .then(() => {
                        resolve({ txt: 'next', meter: meter.meter_type })
                    })
            } else {
                await repositories().journalRepository().update({ _id: newJournalDocument._id, status: "failed" })
                await sendMessage(meter._id, "Error")
                resolve({ txt: 'error', meter: meter.meter_type })
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

        resolve({ txt: 'exit', meter: meter.meter_type })
    });
};

const archiveData = async (meter, parameterIds, sendMessage, realTime, journalId) => {
    return new Promise(async (resolve, reject) => {
        const checkTime = await repositories().parameterValueRepository().findTodayList(new Date())
        await repositories().journalRepository().update({ _id: journalId, status: "succeed" })

        const last_add_time = new Date(checkTime.last_add)
        last_add_time.setUTCMilliseconds(checkTime.time);

        if (last_add_time - new Date() > 0) {
            console.log('archive ketdi')
            realTime({
                "active-power_total": 0,
                "full-power_total": 0,
                "reactive-power_total": 0,
                "coef-active-power_total": 0,
            })
            await sendMessage(meter._id, 'end')
            //   await billingData(meter, parameterIds, sendMessage, journalId)
            // .then(() => {
            resolve('next')
            return
            // })
        }

        const meters = await repositories().meterRepository().findAll({ subquery: { parameter_type: "archive" } })
        const shotchik = meters.find(e => String(e._id) == String(meter._id)).parameters
        let activePowerPlus = shotchik.find(e => e.param_short_name === 'energyarchive_A+')
        let activePowerMinus = shotchik.find(e => e.param_short_name === 'energyarchive_A-')
        let reactivePowerPlus = shotchik.find(e => e.param_short_name === 'energyarchive_R+')
        let reactivePowerMinus = shotchik.find(e => e.param_short_name === 'energyarchive_R-')

        const newDate = new Date()
        const time = [newDate.getFullYear(), newDate.getMonth() + 1, newDate.getDate(), newDate.getFullYear(), newDate.getMonth() + 1, newDate.getDate()]

        const requestString = {
            "MeterType": meter.meter_type,
            "MeterAddress": meter.connection_address,
            "MeterPassword": meter.password,
            "commMedia": meter.connection_channel,
            "commDetail1": "COM6",
            "commDetail2": meter.port,
            "parity": "even",
            "stopBit": 1,
            "dataBit": 7,
            "ReadingRegister": ["3.0"],
            "ReadingRegisterTime": time
        }
        const data = await serialPort(requestString)
        let valuesList = []
        let divide = 1

        data.map((element) => {
            const [day, month, year, hours, minutes] = element?.date?.split(/[^\d]+/);
            const date = new Date(`20${year}`, month - 1, day, hours, minutes)
            if (date - new Date(checkTime.last_add) > 0 && element.status == 1) {
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
            }
        })

        console.log(valuesList.length, 'valueList')
        // await billingData(meter, parameterIds, sendMessage, journalId).then(async() => {
        await repositories().parameterValueRepository().insert(false, valuesList)
        await repositories().journalRepository().update({ _id: journalId, status: "succeed" })
        // }).finally(() => {
        resolve('ok')
        // })
    })
}

// const billingData = async (meter, parameterIds) => {
//   return new Promise( async (resolve, reject) => {
//     // if (await repositories().billingRepository().findToday(meter._id)) {
//     //   console.log('billing ketdi')
//     // //   await currentData(meter, parameterIds, sendMessage, journalId)
//     //   resolve('next')
//     //   return
//     // }

//     const date = new Date();
//     const days = [date.getFullYear(), date.getMonth()+1, date.getDate(), date.getFullYear(), date.getMonth()+1, date.getDate()]

//     const requestString = {
//         "MeterType": meter.meter_type,
//         "MeterAddress": meter.connection_address,
//         "MeterPassword": meter.password,
//         "commMedia": meter.connection_channel,
//         "commDetail1": "COM6",
//         "commDetail2": meter.port,
//         "parity": "even",
//         "stopBit": 1,
//         "dataBit": 7,
//         "ReadingRegister": ["2.0"],
//         "ReadingRegisterTime": days
//     }
//     const data = await serialPort(requestString)
//     console.log(data)
//     // if (Array.isArray(json), (json.length == 3|| json.length == 2)) {
//     //     const id = json.length == 3 ? 1 : 0
//     //     const dataArr = json[id].rowValues
//     //     const obj = {
//     //         summa_A1: dataArr[2]/100,
//     //         summa_A0: dataArr[3]/100,
//     //         summa_R0: dataArr[4]/100,
//     //         summa_R1: dataArr[5]/100,
//     //         tarif1_A1: dataArr[6]/100,
//     //         tarif2_A1: dataArr[7]/100,
//     //         tarif3_A1: dataArr[8]/100,
//     //         tarif4_A1: dataArr[9]/100,
//     //         tarif1_A0: dataArr[10]/100,
//     //         tarif2_A0: dataArr[11]/100,
//     //         tarif3_A0: dataArr[12]/100,
//     //         tarif4_A0: dataArr[13]/100,
//     //         tarif1_R1: dataArr[14]/100,
//     //         tarif2_R1: dataArr[15]/100,
//     //         tarif3_R1: dataArr[16]/100,
//     //         tarif4_R1: dataArr[17]/100,
//     //         tarif1_R0: dataArr[18]/100,
//     //         tarif2_R0: dataArr[19]/100,
//     //         tarif3_R0: dataArr[20]/100,
//     //         tarif4_R0: dataArr[21]/100,
//     //         meter_id: meter._id,
//     //         date: dataArr[0]
//     //     }

//     //     await repositories().billingRepository().insert(obj)
//     //     await currentData(meter, parameterIds, sendMessage, journalId)
//     //     resolve(json)
//     // }
//   })
// }


// const currentData = async (meter, parameterIds, sendMessage) => {
//     return new Promise(async (resolve, reject) => {
//         let request;
//         let journalParameter = {
//             meter: meter._id,
//             request_type: "current",
//             status: "sent"
//         }
//         let newJournalDocument = await repositories().journalRepository().insert(journalParameter)
//         // const journalId = newJournalDocument._id
//         const requestString = {
//             "MeterType": meter.meter_type,
//             "MeterAddress": meter.connection_address,
//             "MeterPassword": meter.password,
//             "commMedia": meter.connection_channel,
//             "commDetail1": "COM6",
//             "commDetail2": meter.port,
//             "parity": "even",
//             "stopBit": 1,
//             "dataBit": 7,
//             "ReadingRegister": ["1.1", "1.2", "1.3", "1.4", "1.5", "1.6", "1.7", "1.8", "1.9", "1.10", "1.11"]
//         }
//         const data = await serialPort(requestString)
//         console.log(data, ["1.1", "1.2", "1.3", "1.4", "1.5", "1.6", "1.7", "1.8", "1.9", "1.10", "1.11"])
//     //     let currentDate = new Date()
//     //     let activePowerCounter = 0, reactivePowerCounter = 0, fullPowerCounter = 0, coefActivePowerCounter = 0
//     //     let totals = { "active_power_total": { value: 0, exist: false }, reactive_power_total: { value: 0, exist: false }, full_power_total: { value: 0, exist: false }, coef_active_total: { value: 0, exist: false } }

//     //     client.on("data", async (data) => {
//     //         await sendMessage(meter._id, 'end')
//     //         const buf = Buffer.from(data);
//     //         const json = JSON.parse(buf.toString('utf8'));
//     //         console.json(json)
//     //         if (json.result === 1) {
//     //             let parameter = await repositories().parameterRepository().findOne({ channel_full_id: json.name, meter: meter._id })
//     //             if (!parameter || parameter.param_short_name) { console.log("parameter not found") }

//     //             switch (parameter.param_short_name) {
//     //                 case "active-power_A":
//     //                 case "active-power_B":
//     //                 case "active-power_C": {
//     //                     totals.active_power_total.value = totals.active_power_total.value + json.value
//     //                     totals.active_power_total.exist = true
//     //                     activePowerCounter++;
//     //                     break;
//     //                 }
//     //                 case "reactive-power_A":
//     //                 case "reactive-power_B":
//     //                 case "reactive-power_B": {
//     //                     totals.reactive_power_total.value = totals.reactive_power_total.value + json.value
//     //                     totals.reactive_power_total.exist = true
//     //                     reactivePowerCounter++;
//     //                     break;
//     //                 }
//     //                 case "full-power_A":
//     //                 case "full-power_B":
//     //                 case "full-power_C": {
//     //                     totals.full_power_total.value = totals.full_power_total.value + json.value
//     //                     totals.full_power_total.exist = true
//     //                     fullPowerCounter++;
//     //                     break;
//     //                 }
//     //                 case "coef-active-power_A":
//     //                 case "coef-active-power_B":
//     //                 case "coef-active-power_C": {
//     //                     totals.coef_active_total.value = totals.coef_active_total.value + json.value
//     //                     totals.coef_active_total.exist = true
//     //                     coefActivePowerCounter++;
//     //                     break;
//     //                 }
//     //             }

//     //             let modelDate = "" + currentDate.getFullYear() + currentDate.getMonth()
//     //             let value = { value: json.value, date: currentDate, parameter: parameter._id }
//     //             if (meter.meter_type == 'TE73') {
//     //                 switch (parameter.param_short_name) {
//     //                     case "current_A":
//     //                     case "current_B":
//     //                     case "current_C":
//     //                         value.value /= 100
//     //                         break;
//     //                 }
//     //                 switch (parameter.param_short_name) {
//     //                     case "coef-active-power_A":
//     //                     case "coef-active-power_B":
//     //                     case "coef-active-power_C":
//     //                         value.value /= 10
//     //                         break;
//     //                 }
//     //             }

//     //             if (activePowerCounter === 3) {
//     //                 let totalParameter = await repositories().parameterRepository().findOne({ param_short_name: "active-power_total", meter: meter._id })

//     //                 if (!totalParameter) {
//     //                     console.log("parameter not found")
//     //                 } else {
//     //                     let totalValue = { value: totals.active_power_total.value, date: currentDate, parameter: totalParameter._id }
//     //                     await repositories().parameterValueRepository().insert(modelDate, { ...totalValue })
//     //                 }
//     //                 activePowerCounter = 0
//     //             }

//     //             if (reactivePowerCounter === 3) {
//     //                 let totalParameter = await repositories().parameterRepository().findOne({ param_short_name: "reactive-power_total", meter: meter._id })

//     //                 if (!totalParameter) {
//     //                     console.log("parameter not found")
//     //                 } else {
//     //                     let totalValue = { value: totals.reactive_power_total.value, date: currentDate, parameter: totalParameter._id }
//     //                     await repositories().parameterValueRepository().insert(modelDate, { ...totalValue })
//     //                 }
//     //                 reactivePowerCounter = 0
//     //             }

//     //             if (fullPowerCounter === 3) {
//     //                 let totalParameter = await repositories().parameterRepository().findOne({ param_short_name: "full-power_total", meter: meter._id })

//     //                 if (!totalParameter) {
//     //                     console.log("parameter not found")
//     //                 } else {
//     //                     let totalValue = { value: totals.full_power_total.value, date: currentDate, parameter: totalParameter._id }
//     //                     await repositories().parameterValueRepository().insert(modelDate, { ...totalValue })
//     //                 }
//     //                 fullPowerCounter = 0
//     //             }

//     //             if (coefActivePowerCounter === 3) {
//     //                 let totalParameter = await repositories().parameterRepository().findOne({ param_short_name: "coef-active-power_total", meter: meter._id })

//     //                 if (!totalParameter) {
//     //                     console.log("parameter not found")
//     //                 } else {
//     //                     let totalValue = { value: totals.coef_active_total.value, date: currentDate, parameter: totalParameter._id }
//     //                     await repositories().parameterValueRepository().insert(modelDate, { ...totalValue })
//     //                 }
//     //                 coefActivePowerCounter = 0
//     //             }

//     //             if (request == 'sent') {
//     //                 request = 'end'
//     //                 console.log(meter._id, 'succeed')
//     //                 await repositories().journalRepository().update({ _id: journalId, status: "succeed" })
//     //             }

//     //             removeListeners('CurrentData 1st ---')
//     //             await repositories().parameterValueRepository().insert(modelDate, { ...value })
//     //             resolve(data)
//     //         } else {
//     //             if (request == 'sent') {
//     //                 console.log(meter._id, 'failed')
//     //                 await repositories().journalRepository().update({ _id: journalId, status: "failed" })
//     //             }

//     //             removeListeners('CurrentData last ---')
//     //             await sendMessage(meter._id, "Error")
//     //             resolve('finish')
//     //         }
//     //     })
//     })
// }
