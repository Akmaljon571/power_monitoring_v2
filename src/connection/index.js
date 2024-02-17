const { meterModel } = require('../models')
const { repositories } = require('../repository')
const { serialPort } = require('../server/utils/serialport')

module.exports.getDataFromMiddleware = async (sendMessage) => {
    try {
        while (true) {
            const meters = await meterModel.find()
            for (let i in meters) {
                let parameterIds = []
                meters[i].parameters?.map(param => {
                    if (param.status == 'active') {
                        parameterIds.push("'" + param.channel_full_id + "'")
                    }
                })
                await checkDate(meters[0], parameterIds, sendMessage).then(console.log)
            }
        }
    } catch (err) {
        console.log(err);
    }
}

const checkDate = async (meter, parameterIds, sendMessage) => {
    return new Promise(async (resolve, reject) => {
        const chech_date_fn = async () => {
            await sendMessage(meter._id, 'send')
            const journalParameter = { meter: meter._id, request_type: "archive", status: "sent"}
            const newJournalDocument = await repositories().journalRepository().insert(journalParameter)

            // if (!meter.time_difference) {
            //     await archiveData(meter, parameterIds, sendMessage, newJournalDocument._id)
            //         .then(() => {
            //             resolve({ txt: 'no time given', meter: meter.meter_type })
            //             return
            //         })
            // }

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

            let [time, date] = data[0].currentDate.split(' ')
            date = "20" + date.split('/')[1].split('.').reverse()
            const datatime = new Date(...date.split(',').concat(time.split(':')))

            const result = Math.abs(new Date(datatime) - new Date())
            console.log((result / 1000), meter.time_difference)
            if ((result / 1000) <= meter.time_difference) {
                // await archiveData(meter, parameterIds, sendMessage, newJournalDocument._id)
                resolve({ txt: 'next', meter: meter.meter_type })
            } else {
                console.log(newJournalDocument)
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

// const archiveData = async (meter, parameterIds) => {
//   return new Promise( async (resolve, reject) => {


//     const checkTime = await repositories().parameterValueRepository().findTodayList(new Date())
//     console.log(checkTime)
    
//     const last_add_time = new Date(checkTime.last_add)
//     last_add_time.setUTCMilliseconds(checkTime.time);

//     if(last_add_time - new Date() > 0) {
//       console.log('archive ketdi')
//     //   await billingData(meter, parameterIds, sendMessage, journalId)
//       resolve('next')
//       return
//     }

//     const meters = await repositories().meterRepository().findAll({subquery:{parameter_type:"archive"}})
//     const shotchik = meters.find(e => String(e._id) == String(meter._id)).parameters
//     let activePowerPlus= shotchik.find(e => e.param_short_name === 'energyarchive_A+')
//     let activePowerMinus= shotchik.find(e => e.param_short_name === 'energyarchive_A-')
//     let reactivePowerPlus= shotchik.find(e => e.param_short_name === 'energyarchive_R+')
//     let reactivePowerMinus= shotchik.find(e => e.param_short_name === 'energyarchive_R-')
//     const dan = new Date()
//     const gacha = new Date()
//     const time = [dan.getFullYear(), dan.getMonth()+1, dan.getDate(), gacha.getFullYear(), gacha.getMonth()+1, gacha.getDate()]

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
//         "ReadingRegister": ["3.0"],
//         "ReadingRegisterTime": time
//     }
//     const data = await serialPort(requestString)

//     let valuesList = []
//     let divide = 1
//     data.map(element => {
//         console.log(element)
//         // if(new Date(element.rowValues[0]) - new Date(checkTime.last_add) > 0) {
//             element.loadProfile.map((data) => {
//                 console.log(data)
//                 data.profile1.map(e => {
//                     console.log(e)
//                     let activePowerValue = {
//                         date: new Date(),
//                         value: parseFloat(e.valueRes) / divide,
//                         parameter: activePowerPlus?._id
//                     }
//                     valuesList.push(activePowerValue)
//                 })
//             })
//         // }
//     })
//         // profile.loadProfile[0].profile1.map(e => {
//         //     console.log(e, valueRes)
//         // })
//         // console.log(new Date(element.rowValues[0]), new Date(checkTime.last_add), checkTime.last_add)

//         //     let activePowerValue = {
//         //         date: new Date(element.rowValues[0]),
//         //         value: parseFloat(element.rowValues[2]) / divide,
//         //         parameter: activePowerPlus._id
//         //     }
//         //     let activePowerValueMinus = {
//         //         date: new Date(element.rowValues[0]),
//         //         value: parseFloat(element.rowValues[3]) / divide,
//         //         parameter: activePowerMinus._id
//         //     }
//         //     let reactivePowerValue = {
//         //         date: new Date(element.rowValues[0]),
//         //         value: parseFloat(element.rowValues[4]) / divide,
//         //         parameter: reactivePowerPlus._id
//         //     }
//         //     let reactivePowerValueMinus = {
//         //         date: new Date(element.rowValues[0]),
//         //         value: parseFloat(element.rowValues[5]) / divide,
//         //         parameter: reactivePowerMinus._id
//         //     }            
//         // }
//     // })

//     // console.log(valuesList, 'valueList')
//     // // await billingData(meter, parameterIds, sendMessage, journalId)
//     // // await repositories().parameterValueRepository().insert(false, valuesList)
//     // // await repositories().journalRepository().update({_id: newJournalDocument._id, status: "succeed"})
//     // resolve('ok')
//   })
// }

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
