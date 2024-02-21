module.exports.oneMeter = async (meter, sendMessage) => {
    return new Promise(async (resolve, reject) => {
        const chech_date_fn = async () => {
            sendMessage(meter._id, 'send')

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
            sendMessage(meter._id, 'send')

            const time = data[0]?.currentDate?.split(' ')[0]
            const date = data[0]?.currentDate?.split('/')[1].split('.').reverse()
            date[0] = '' + 20 + date[0]
            const datatime = new Date(...date.concat(time.split(':')))
            datatime.setMonth(datatime.getMonth() - 1)

            const result = Math.abs(datatime - new Date())
            if ((result / 1000) <= meter.time_difference) {
                console.log('date o`tdi')
                sendMessage(meter._id, 'send')
                resolve({ txt: 'next', meter: meter.meter_type })
            } else {
                sendMessage(meter._id, "Error")
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