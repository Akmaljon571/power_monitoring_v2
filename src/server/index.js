const { SerialPort } = require("serialport")
const { openPort, closePort, getCounterResponse } = require('./serialports/config/serialport_config')

const { queries } = require("./model")
const ObisQuery = require('./serialports/obis')
const ResultConvertor = require('./serialports/result_convertor')

const { meterSetUp } = require("./utils/setupUtils")
const { checkCounterType, unWrapObject } = require("./utils/commonUtils")
const { dateConvertor, getDaysArray } = require("./utils/dateUtils")
const { insertedVariable, findKeyIndexAndValue } = require("./utils/obisUtils")
const { Validate } = require("./utils/validate")
const { eneromeraObisEnum } = require("./utils/enum")

module.exports = async data => {
    try {
        const { error, value } = Validate(data)
        if (error) throw new Error(error.message)
        return value.ReadingRegisterTime ? await getLstCounterResult(value) : await getCounterResult(value)
    } catch (error) {
        return { path: 'serialPort', message: error.message, error: true }
    }
}

async function getCounterResult(data) {
    try {
        const { tcpConnectionSettings, serialPortSettings, meterOptions } = meterSetUp(data)
        
        const counterValidate = queries[meterOptions.meterType] || {}
        if (!Object.keys(counterValidate).length) throw new Error('counter data not found')
        
        const port = meterOptions.connectionType === 1 ? tcpConnectionSettings : meterOptions.connectionType === 0 ? new SerialPort(serialPortSettings) : undefined
        if (!port) throw new Error('commMedia is not valid')
        meterOptions.connectionType === 0 && port.once('error', error => reject(error.message || 'error while reading data!'))
        
        const type = meterOptions.meterType.split('_')
        const { startCommands, obisCommands } = ObisQuery[type[0]](data.ReadingRegister, meterOptions, 'obis')
        let results = []
        if (checkCounterType('CE', meterOptions)) {
            for (const i of obisCommands) {
                if (Object.values(i)[0]?.length) {
                    startCommands.splice(3, 0, i)
                    await openPort(port)
                    for (const j of startCommands) {
                        const counterResult = await getCounterResponse(j, port, type[0])                   
                        if (counterResult) {
                            const response = ResultConvertor[type[0]](counterResult, meterOptions.meterType)
                            response && results.push(response)
                        }
                    }
                    startCommands.splice(3, 1)
                    await closePort(port)
                }
            }
            if (findKeyIndexAndValue(results, '1.16.0')?.exist === false) {
                let valuesToJoin = []
                let filteredArray = results.filter(obj => !('1.15.0' in obj || '1.16.0' in obj))
                results.forEach(obj => {
                    if ('1.15.0' in obj) {
                        valuesToJoin.push(obj['1.15.0'])
                    } else if ('1.16.0' in obj) {
                        valuesToJoin.unshift(obj['1.16.0'][0])
                    }
                })
                filteredArray.push({ '1.15.0': valuesToJoin.join(' ') })
                results = filteredArray
            }
            return results
        } else {
            return [{ data: 'this type of counter not riten yet' }]
        }     
    } catch (error) {
        return { path: 'getCounterResult', message: error.message, error: true }
    }
}

async function getLstCounterResult(data) {
    try {
        const { tcpConnectionSettings, serialPortSettings, meterOptions } = meterSetUp(data)
        
        const counterValidate = queries[meterOptions.meterType] || {}
        if (!Object.keys(counterValidate).length) throw new Error('counter data not found')
        
        const port = meterOptions.connectionType === 1 ? tcpConnectionSettings : meterOptions.connectionType === 0 ? new SerialPort(serialPortSettings) : undefined
        if (!port) throw new Error('commMedia is not valid')
        meterOptions.connectionType === 0 && port.once('error', error => reject(error.message || 'error while reading data!'))
        
        const type = meterOptions.meterType.split('_')
        const { startCommands, obisCommands } = ObisQuery[type[0]](data.ReadingRegister, meterOptions, 'obis')
        const lstCommands = ObisQuery[type[0]](null, meterOptions, 'lst')

        const lstReq = data.ReadingRegisterTime
        
        if (checkCounterType('CE', meterOptions)) {
            
            let lstResult
            let lstResultIndex
            let getValue = []
            
            if (checkCounterType(type[1], '308')) {
                await openPort(port)
                for (let i of lstCommands) {
                    let counterResult = await getCounterResponse(i, port, type[0])
                    if (counterResult) {
                        const response = ResultConvertor[type[0]](counterResult, meterOptions.meterType)
                        if (response) {
                            lstResult = response
                        }
                    }
                }
                await closePort(port)
                lstResultIndex = dateConvertor(lstReq, lstResult.lst).index
                if (!lstResultIndex.length) return []
                for (let i of obisCommands) {
                    if (Object.values(i)[0]?.length) {
                        for (let j of lstResultIndex) {
                            let {key, value} = unWrapObject(i)
                            let insert = { [key]: insertedVariable(value, j, 10) }
                            startCommands.splice(3, 0, insert)
                            await openPort(port)
                            for (let k of startCommands) {
                                let counterResult = await getCounterResponse(k, port, type[0])
                                if (counterResult) {
                                    let { key } = unWrapObject(counterResult)
                                    if (!eneromeraObisEnum.includes(key)) {
                                        getValue.push(counterResult)
                                    }
                                }
                            }
                            startCommands.splice(3, 1)
                            await closePort(port)
                        }
                    }
                }
                return ResultConvertor[type[0]](getValue, data.ReadingRegister[0])
            } else {
                let date = dateConvertor(lstReq, null, 'YYYY-MM-DD');
                lstResultIndex = getDaysArray(new Date(date.from), new Date(date.to))
                for (let i of obisCommands) {
                    if (Object.values(i)[0]?.length) {
                        for (let j of lstResultIndex) {
                            let {key, value} = unWrapObject(i)
                            let insert = { [key]: insertedVariable(value, j, 10) }
                            // console.log(insert, j);
                            startCommands.splice(3, 0, insert);
                            await openPort(port);
                            for (let k of startCommands) {
                                let counterResult = await getCounterResponse(k, port, type[0])
                                // console.log(counterResult)
                                if (counterResult) {
                                    let { key } = unWrapObject(counterResult)
                                    if (!eneromeraObisEnum.includes(key)) {
                                        getValue.push({ data: counterResult, date: j });
                                    }
                                }
                            }
                            startCommands.splice(3, 1);
                            await closePort(port);
                        }
                    }
                }
                return ResultConvertor[type[0]](getValue, data.ReadingRegister[0])
            }
        }
        
    } catch (error) {
        return { path: 'getLstCounterResult', message: error.message, error: true }
    }
}