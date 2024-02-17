const { getRequestCommandFromJson } = require('../toolbox')

const Mercury_Counter_Commands = {
	requiredCommands: ['0.0','0.1']
}

function readMercuryCounterOBIS(obis, options, key) {
	try {
		switch (key) {
		case 'obis':
			return commandsMercury(obis, options)
		default:
			return commandsMercury(Mercury_Counter_Commands.requiredCommands, options)
		}
	} catch (error) {
		throw new Error(`Error in mercury_obis.js: ${error.message}`)
	}
}

function commandsMercury(data, options) {
	return data.map(i => {
		let result = getRequestCommandFromJson(i, options.meterType)
		let newKey = Object.keys(result)[0]
		if (options.address.length) {
			result[newKey].splice(0, 1, +options.address)
			if (i === '0.1') {
				result.password.splice(3, 6, ...Array.from(options.password, c => +c))
			}
			return result
		} else {
			if (i === '0.1') {
				result.password.splice(3, 6, ...Array.from(options.password, c => +c))
			}
			return result
		}
	})
}

module.exports.readMercuryCounterOBIS = readMercuryCounterOBIS