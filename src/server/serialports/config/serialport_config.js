const { InterByteTimeoutParser } = require('@serialport/parser-inter-byte-timeout')
const { queryMaker } = require('../../utils/crcUtils')
const { unWrapObject } = require('../../utils/commonUtils')

// const { Socket } = require('net')
// const socket = new Socket()

module.exports = {
    openPort,
    closePort,
    getCounterResponse
}

function openPort(port) {
    return new Promise((resolve, reject) => {
        port.open(err => {
            if (err) {
                reject(err)
            } else {
                resolve()
            }
        })
    })
}

function writeToPort(data, port) {
    return new Promise((resolve, reject) => {
        port.write(data, err => {
            if (err) {
                reject(err)
            } else {
                resolve()
            }
        })
    })
}

function closePort(port) {
    return new Promise((resolve, reject) => {
        port.close(err => {
            if (err) {
                reject(err)
            } else {
                resolve()
            }
        })
        port.removeAllListeners('end')
    })
}

function waitForData(port, timeout = 4000) {
    return new Promise((resolve, reject) => {
        const dataHandler = data => {
            resolve(data)
            port.removeAllListeners('data')
            
        }
        port.pipe(new InterByteTimeoutParser({ interval: 300, maxBufferSize: 10000 })).once('data', dataHandler)
        
        const func = () => {
            port.removeListener('data', dataHandler)
            resolve('Timeout waiting for data')
        }
        
        const timeoutId = setTimeout(() => {
            clearTimeout(timeoutId, func())
        }, timeout)
    })
}

async function getCounterResponse(command, port, meterType) {
    try {
        let obj = unWrapObject(command)
        // console.log(obj)
        let reqCommand = queryMaker([...obj.value], meterType, command.crc)
        // console.log(obj.key, reqCommand)
        if (obj.key === 'close') {
            await writeToPort(reqCommand, port)
            return;
        }
        await writeToPort(reqCommand, port)
        let data = await waitForData(port)
        return { [obj.key]: data }
    } catch (error) {
        return { path: 'getCounterResponse', message: error.message, error: true }
    }
}
