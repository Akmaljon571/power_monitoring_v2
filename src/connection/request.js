const { paramsIndex2 } = require("../global/file-path")

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
        "ReadingRegister": [paramsIndex2(meter.meter_type).billing],
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
        "ReadingRegister": [paramsIndex2(meter.meter_type).archive],
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
        "ReadingRegister": [paramsIndex2(meter.meter_type).datatime]
    }
}

module.exports.requestCurrent = (meter, list) => {
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
        "ReadingRegister": list
    }
}
