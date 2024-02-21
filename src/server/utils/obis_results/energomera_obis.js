const { getRequestCommandFromJson } = require('../toolbox')

const CE_Counter_Commands = {
	requiredCommands: ['0.0', '0.1', '0.2', '0.3'],
	lsts: ['0.0', '0.1', '0.2', '0.4', '0.3'],
	currentTimeBilling: ["1.0.0", "1.1.0", "1.2.0", "1.3.0"],
	billing: ['2.0.0', '2.1.0', '2.2.0', '2.3.0'],
	loadProfile: ['3.0', '3.1', '3.2', '3.3']
}

function readCECounterOBIS(obis, options, key) {
	try {
		switch (key) {
			case 'lst':
			return commandsCE(CE_Counter_Commands.lsts, options)
			case 'obis':
			let verify = CE_Counter_Commands.currentTimeBilling.some(version => obis.includes(version))
			if (obis.includes('2.0') && !verify && !obis.includes('3.0')) {
				return commandsCE(CE_Counter_Commands.billing, options)
			} else if (!obis.includes('2.0') && !obis.includes('3.0')) {
				let newObis = obis.map(i => {
					if (CE_Counter_Commands.currentTimeBilling.includes(i)) {
						return i
					} else if (i[i.length-1] <= 3) {
						return i.replace(/\.(?=[^.]*$)/, ',')
					} else {
						throw new Error("check API's parametors")
					}
				})
				return commandsCE(newObis, options)
			} else if (obis.includes('3.0') && !obis.includes('2.0') && !verify) {
				return commandsCE(CE_Counter_Commands.loadProfile, options)
			}
			break;
			default:
			return commandsCE(CE_Counter_Commands.requiredCommands, options)
		}
	} catch (error) {
		throw new Error(`Error in energomera_obis.js : ${error.message}`)
	}
}

function commandsCE(data, options) {
	return data.map(i => {
		let result = getRequestCommandFromJson(i, options.meterType)
		if (i === '0.0' && options.address.length) {
			result['0.0_version'] = insertArgsIntoArray(result['0.0_version'], options.address, 2)
		} else if (i === '0.2') {
			result['0.2_password'] = insertArgsIntoArray(result['0.2_password'], options.password, 5)
		}
		return result
	})
}

function insertArgsIntoArray(array, args, index = 0) {
	const newArg = Array.isArray(args) ? args : Array.from(args, c => c.charCodeAt(0));
	const newArray = [...array];
	const from = newArray.splice(0, index);
	return [...from, ...newArg, ...newArray];
}

module.exports = {
	readCECounterOBIS,
	insertArgsIntoArray
}