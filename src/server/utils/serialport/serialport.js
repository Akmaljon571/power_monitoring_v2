const { Validation } = require('../../validation/validation.js')

const { SerialPort } = require('serialport')
const { setConfig, openPort, closePort, serialPortEngine } = require('./serialport_config.js')

const ObisQuery = require('../obis_results/index.js')
const { dateConvertor, getDaysArray } = require('../dateUtils.js')

const { getEnergomeraResult } = require('../result_convertors/energomera_result_convertor.js')
const { getMercuryResult } = require('../result_convertors/mercury_result_convertor.js')
const { getTE_73Result } = require('../result_convertors/TE_73CAS.js')



let allowParametres = ['0.1_hashedPassword', '0.2_password', '0.0_version']
let versionAllowed = ['0.1_hashedPassword', '0.2_password']
let onlyVerionAllow = ['version', 'password']

async function getCounterResult(data) {
    try {
        const result = []
        const { setUp, tcpConnection, serialPort } = setConfig(data)
        
        const port = setUp?.connectionType === 1 ? tcpConnection : setUp?.connectionType === 0 ? new SerialPort(serialPort) : undefined
        port.once('error', (error) => reject(error.message || 'error while reading data!'))
        
        if (!port) throw new Error('commMedia is not valid')
        let type = setUp.meterType.split('_')
        
        const getCommands = ObisQuery[`${type[0]}_Counter_Query`](data.ReadingRegister, setUp, 'obis')
        const startCommands = ObisQuery[`${type[0]}_Counter_Query`](null, setUp)
        
        if (checkCounterExist('CE', setUp)) {
            for(let i of getCommands) {
                startCommands.splice(3,0,i)
                await openPort(port)
                for (let j of startCommands) {
                    let { data, key } = await serialPortEngine(j, port)
                    if (data && !versionAllowed.includes(key)) {
                        let resValue = getEnergomeraResult(data,key)
                        if (resValue.version && !resValue.version.includes(type.join(''))) {
                            throw new Error('connection error check parameters')
                        } else if (key.split('_')[1] != 'version') {
                            result.push(resValue)
                        }
                    }
                }
                
                startCommands.splice(3,1)
                await closePort(port)
            }
        } else if (checkCounterExist('Mercury', setUp)) {
            for(let i of getCommands) {
                startCommands.splice(startCommands.length,0,i)
                await openPort(port)
                for (let j of startCommands) {
                    let { data, key } = await serialPortEngine(j, port, type[0])
                    if (data && !onlyVerionAllow.includes(key)) {
                        let resValue = getMercuryResult(data,key)
                        result.push(resValue)
                    }
                }
                startCommands.splice(startCommands.length,1)
                await closePort(port)
            }
        } else if (checkCounterExist('TE', setUp)) {
            for(let i of getCommands) {
                startCommands.splice(startCommands.length,0,i)
                await openPort(port)
                for (let j of startCommands) {
                    let { data, key } = await serialPortEngine(j, port, type[0])
                    console.log(key, data);
                    if (data && !onlyVerionAllow.includes(key)) {
                        let resValue = getTE_73Result(data,key)
                        result.push(resValue)
                    }
                }
                startCommands.splice(startCommands.length,1)
                await closePort(port)
            }
        } else {
            return [{data: 'this type of counter not riten yet'}]
        }
        return result
    } catch (error) {
        console.log(error.message)
        throw new Error(`Error in getCounterResult function: ${error.message}`)
    }
}

async function getLstCounterResult(data) {
    try {
        verifyLstDataInput(data)
        const result = []
        const { setUp, serialPort } = setConfig(data)
        const port = new SerialPort(serialPort)
        port.once('error', (error) => reject(error.message || 'error while reading data!'))
        
        let type = setUp.meterType.split('_')
        
        const getCommands = ObisQuery[`${type[0]}_Counter_Query`](data.ReadingRegister, setUp, 'obis')
        const startCommands = ObisQuery[`${type[0]}_Counter_Query`](null, setUp)
        
        const lstReq = data.ReadingRegisterTime
        let lstResult
        let lstResultIndex
        let getValue = []

        if (checkCounterExist('CE', setUp)) {
            if (checkCounterExist(type[1], '308')) {
                const lstCommands = ObisQuery[`${type[0]}_Counter_Query`](null, setUp, 'lst')
                await openPort(port)
                for(let i of lstCommands) {
                    let {data,key} = await serialPortEngine(i, port)
                    if (data && !versionAllowed.includes(key)) {
                        let resValue = getEnergomeraResult(data,key)
                        if (resValue.version && !resValue.version.includes(type.join(''))) {
                            throw new Error('connection error check parameters')
                        } else if (key.split('_')[1] != 'version') {
                            lstResult=resValue
                        }
                        
                        
                    }
                }
                await closePort(port)
                
                lstResultIndex = dateConvertor(lstReq, lstResult.lst).index
                if (!lstResultIndex.length) { return [] }
                
                for(let i of getCommands) {
                    for(let j of lstResultIndex) {
                        let insert = {[getObjectKeyValue(i)]: ObisQuery.parseValue(getObjectKeyValue(i, 'value'),j,10)}
                        startCommands.splice(3,0,insert)
                        await openPort(port)
                        for(let k of startCommands) {
                            let {data,key} = await serialPortEngine(k, port)
                            if (data && !allowParametres.includes(key)) {
                                getValue.push({key, data})
                            }
                        }
                        startCommands.splice(3,1)
                        await closePort(port)
                    }
                }
                return getEnergomeraResult(getValue, data.ReadingRegister[0])
            } else if (!checkCounterExist(type[1], '308')) {
                let date = dateConvertor(lstReq,null,'YYYY-MM-DD')
                console.log(123);
                lstResultIndex = getDaysArray(new Date(date.from),new Date(date.to)).map(i => Array.from(i, c => c.charCodeAt(0)))
                for(let i of getCommands) {
                    if (!getObjectKeyValue(i, 'value')?.length) {
                        continue
                    } else {
                        for(let j of lstResultIndex) {
                            let insert = {[getObjectKeyValue(i)]: ObisQuery.parseValue(getObjectKeyValue(i, 'value'),j,10)}
                            startCommands.splice(3,0,insert)
                            await openPort(port)
                            for(let k of startCommands) {
                                let {data,key} = await serialPortEngine(k, port)
                                if (data && !allowParametres.includes(key)) {
                                    getValue.push({key, data, date: String.fromCharCode(...j)})
                                }
                            }
                            startCommands.splice(3,1)
                            await closePort(port)
                        }
                    }
                }
                return getEnergomeraResult(getValue, data.ReadingRegister[0])
            }
        } else {
            return [{data: 'this type of counter not written yet'}]
        }
        return result
        
    } catch (error) {
        throw new Error(`Error in getLstCounterResult function: ${error.message}`)
    }
}

function verifyLstDataInput(data) {
    if (data.ReadingRegister.length !== 1 && (data.ReadingRegister.includes('2.0') || data.ReadingRegister.includes('3.0'))) {
        throw new Error("check API's parametors")
    } else if (!['2.0', '3.0'].includes(data.ReadingRegister[0])) {
        throw new Error("check API's parametors")
    }
}

function checkCounterExist(str, param) {
    if (typeof param === 'string') {
        return param.includes(str)
    } else {
        return param.meterType.includes(str)
    }
}

function getObjectKeyValue(object, key) {
    if (key === 'value') {
        return Object.values(object)[0]
    } else {
        return Object.keys(object)[0]
    }
}

async function serialPort(dataReq) {
    const { error, value } = Validation.validate(dataReq)
    if (error) throw new Error(error.message)
    return value.ReadingRegisterTime ? await getLstCounterResult(value) : await getCounterResult(value)
}

module.exports = { serialPort }