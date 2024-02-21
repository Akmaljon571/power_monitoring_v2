module.exports.requestBilling = (meter, date1, date2) => {
    const time = [date1.getFullYear(), date1.getMonth() + 1, date1.getDate(), date2.getFullYear(), date2.getMonth() + 1, date2.getDate()]
    return {
        "MeterType": meter.meter_type,
        "MeterAddress": meter.connection_address,
        "MeterPassword": meter.password,
        "commMedia": meter.connection_channel,
        "commDetail1": "COM6",
        "commDetail2": meter.port,
        "parity": "even",
        "stopBit": 1,
        "dataBit": 7,
        "ReadingRegister": ["2.0"],
        "ReadingRegisterTime": time
    }
}

module.exports.requestArchive = (meter, date1, date2) => {
    const time = [date1.getFullYear(), date1.getMonth() + 1, date1.getDate(), date2.getFullYear(), date2.getMonth() + 1, date2.getDate()]
    return {
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
}

module.exports.requestDateTime = (meter) => {
    return {
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
}
