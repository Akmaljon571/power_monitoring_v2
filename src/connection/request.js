const { paramsIndex2 } = require("../global/file-path")

module.exports.requestBilling = (meter, date1, date2) => {
    const time = [date1.getFullYear(), date1.getMonth() + 1, date1.getDate(), date2.getFullYear(), date2.getMonth() + 1, date2.getDate()]
    return meter.connection_channel && meter.connection_channel == '1' ? {
        "MeterType": meter.meter_type,
        "MeterAddress": meter.connection_address,
        "MeterPassword": meter.password,
        "commMedia": meter.connection_channel,
        "commDetail1": meter.ip_address,
        "commDetail2": meter.port,
        "ReadingRegister": [paramsIndex2(meter.meter_type).billing],
        "ReadingRegisterTime": time
    } : {
        "MeterType": meter.meter_type,
        "MeterAddress": meter.connection_address,
        "MeterPassword": meter.password,
        "commMedia": meter.connection_channel,
        "commDetail1": meter.comport,
        "commDetail2": meter.baud_rate,
        "parity": meter.parity,
        "stopBit": meter.stop_bit,
        "dataBit": meter.data_bit,
        "ReadingRegister": [paramsIndex2(meter.meter_type).billing],
        "ReadingRegisterTime": time
    }
}

module.exports.requestArchive = (meter, date1, date2) => {
    const time = [date1.getFullYear(), date1.getMonth() + 1, date1.getDate(), date2.getFullYear(), date2.getMonth() + 1, date2.getDate()]
    return meter.connection_channel && meter.connection_channel == '1' ? {
        "MeterType": meter.meter_type,
        "MeterAddress": meter.connection_address,
        "MeterPassword": meter.password,
        "commMedia": meter.connection_channel,
        "commDetail1": meter.ip_address,
        "commDetail2": meter.port,
        "ReadingRegister": [paramsIndex2(meter.meter_type).archive],
        "ReadingRegisterTime": time
    } : {
        "MeterType": meter.meter_type,
        "MeterAddress": meter.connection_address,
        "MeterPassword": meter.password,
        "commMedia": meter.connection_channel,
        "commDetail1": meter.comport,
        "commDetail2": meter.baud_rate,
        "parity": meter.parity,
        "stopBit": meter.stop_bit,
        "dataBit": meter.data_bit,
        "ReadingRegister": [paramsIndex2(meter.meter_type).archive],
        "ReadingRegisterTime": time
    }
}

module.exports.requestDateTime = (meter) => {
    return meter.connection_channel && meter.connection_channel == '1' ? {
        "MeterType": meter.meter_type,
        "MeterAddress": meter.connection_address,
        "MeterPassword": meter.password,
        "commMedia": meter.connection_channel,
        "commDetail1": meter.ip_address,
        "commDetail2": meter.port,
        "ReadingRegister": [paramsIndex2(meter.meter_type).datatime]
    } : {
        "MeterType": meter.meter_type,
        "MeterAddress": meter.connection_address,
        "MeterPassword": meter.password,
        "commMedia": meter.connection_channel,
        "commDetail1": meter.comport,
        "commDetail2": meter.baud_rate,
        "parity": meter.parity,
        "stopBit": meter.stop_bit,
        "dataBit": meter.data_bit,
        "ReadingRegister": [paramsIndex2(meter.meter_type).datatime]
    }
}

module.exports.requestCurrent = (meter, list) => {
    return meter.connection_channel && meter.connection_channel == '1' ? {
        "MeterType": meter.meter_type,
        "MeterAddress": meter.connection_address,
        "MeterPassword": meter.password,
        "commMedia": meter.connection_channel,
        "commDetail1": meter.ip_address,
        "commDetail2": meter.port,
        "ReadingRegister": list
    } : {
        "MeterType": meter.meter_type,
        "MeterAddress": meter.connection_address,
        "MeterPassword": meter.password,
        "commMedia": meter.connection_channel,
        "commDetail1": meter.comport,
        "commDetail2": meter.baud_rate,
        "parity": meter.parity,
        "stopBit": meter.stop_bit,
        "dataBit": meter.data_bit,
        "ReadingRegister": list
    }
}
