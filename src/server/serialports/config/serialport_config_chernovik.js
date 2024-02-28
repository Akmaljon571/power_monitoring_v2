const { Socket } = require('net')
const { InterByteTimeoutParser } = require('@serialport/parser-inter-byte-timeout')
// const { queryMaker } = require('./crc.js')

const socket = new Socket()

module.exports = {
	openPort,
	closePort,
	writeToPort,
	waitForData,
	setConfig,
	serialPortEngine,
}

function openPort(port) {
	return new Promise((resolve, reject) => {
		if (!checkTCPConnection(port)) {
			port.open(err => {
				if (err) {
					reject(err.message || 'connection error')
				} else {
					resolve()
				}
			})
		} else {
			socket.connect({ ...port }, () => {
				resolve()
			})
			socket.on('error', err => {
				reject(new Error(`Failed to connect to ${port.host}:${port.port}. Error: ${err.message}`))
			})
		}
	})
}

function writeToPort(data, port) {
	return new Promise((resolve, reject) => {
		if (!checkTCPConnection(port)) {
			port.write(data, err => {
				if (err) {
					reject(err)
				} else {
					resolve()
				}
			})
		} else {
			socket.write(data, 'ascii', err => {
				if (err) {
					reject(err)
				} else {
					resolve()
				}
			})
		}
	})
}

function closePort(port) {
	return new Promise((resolve, reject) => {
		if (!checkTCPConnection(port)) {
			port.close(err => {
				if (err) {
					reject(err)
				} else {
					resolve()
				}
			})
			port.removeAllListeners('end')
		} else {
			socket.end(err => {
				if (err) {
					reject(err)
				} else {
					resolve()
				}
			})
			socket.removeAllListeners('end')
		}
	})	
}

function waitForData(port, timeout = 4000) {
	return new Promise((resolve, reject) => {
		const dataHandler = data => resolve(data)
		

		if (!checkTCPConnection(port)) {

			port.pipe(new InterByteTimeoutParser({ interval: 300, maxBufferSize: 10000 })).once('data', dataHandler)
			
			const timeoutId = setTimeout(() => {
				reject(new Error('Timeout waiting for data'))
			}, timeout)
			
			const clearTimer = () => {
				clearTimeout(timeoutId)
			}
			
			port.removeListener('data', dataHandler)
			port.once('data', clearTimer)
		} else {
			const parser = socket.pipe()
			parser.once('data', dataHandler)
			const timeoutId = setTimeout(() => {
				reject(new Error('Timeout waiting for data'))
			}, timeout)
			
			const clearTimer = () => {
				clearTimeout(timeoutId)
			}
			
			parser.removeListener('data', dataHandler)
			parser.once('data', clearTimer)
		}
	})	
}


async function serialPortEngine(command, port, meterType) {
	try {
		let key = Object.keys(command)[0]
		let dataReq = queryMaker([...Object.values(command)[0]], meterType, command.crc)
		// console.log(dataReq)
		// console.log(key, dataReq)
		if (key == 'closeCommand') {
			await writeToPort(dataReq, port)
			return { key, data: null }
		}
		await writeToPort(dataReq, port)
		let data = await waitForData(port)
		return { key, data }
	} catch (err) {
		console.log(err)
		throw new Error('Error in serialport engine', err.message)
	}
}

function checkTCPConnection(port) {
	return port.tcp || false
}

const setConfig = reqData => ({
	serialPort: {
		path: reqData.commDetail1,
		baudRate: reqData.commDetail2,
		dataBits: reqData.dataBit,
		stopBits: reqData.stopBit,
		parity: reqData.parity,
		autoOpen: false,
	},
	tcpConnection: {
		host: reqData.commDetail1,
		port: reqData.commDetail2,
		tcp: true,
	},
	setUp: {
		address: reqData.MeterAddress || '',
		password: reqData.MeterPassword,
		meterType: reqData.MeterType,
		connectionType: reqData.commMedia,
	},
})


