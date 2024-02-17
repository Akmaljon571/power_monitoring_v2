const { queries } = require('../../queries')

const CE_Counter_Commands = {
	requiredCommands: ['0.0', '0.1', '0.2', '0.3'],
	lsts: ['0.0', '0.1', '0.2', '0.4', '0.3']
}

const Mercury_Counter_Commands = {
	requiredCommands: ['0.0','0.1']
}

const TE_Counter_Commands = {
	requiredCommands: ['0.0','0.1']
}

module.exports = {
	CE_Counter_Query: readCECounterOBIS,
	Mercury_Counter_Query: readMercuryCounterOBIS,
	TE_Counter_Query: readTECounterOBIS,
	
	// functions
	parseValue: insertArgsIntoArray
}

function readTECounterOBIS(obis, options, key) {
	try {
		switch (key) {
		case 'obis':
			return commandsTE(obis, options)
		default:
			return commandsTE(TE_Counter_Commands.requiredCommands, options)
		}
	} catch (error) {
		throw new Error(`Error in readTECounterOBIS function: ${error.message}`)
	}
}

function commandsTE(data, options) {
	return data.map(i => {
		let result = getRequestCommandFromJson(i, options.meterType)
		// if (i === '0.0' && options.address.length) {
		// 	result.version = insertArgsIntoArray(result.version, options.address, 2)
		// } else if (i === '0.2') {
		// 	result.password = insertArgsIntoArray(result.password, options.password, 5)
		// }
		return result
	})
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
		throw new Error(`Error in readMercuryCounterOBIS function: ${error.message}`)
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
				// result.password = insertArgsIntoArray(result.password, options.password, 3)
				
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

function readCECounterOBIS(obis, options, key) {
	try {
		switch (key) {
		case 'lst':
			return commandsCE(CE_Counter_Commands.lsts, options)
		case 'obis':
			return commandsCE(obis, options)
		default:
			return commandsCE(CE_Counter_Commands.requiredCommands, options)
		}
	} catch (error) {
		throw new Error(`Error in readCECounterOBIS function: ${error.message}`)
	}
}

function commandsCE(data, options) {
	return data.map(i => {
		let result = getRequestCommandFromJson(i, options.meterType)
		if (i === '0.0' && options.address.length) {
			result.version = insertArgsIntoArray(result.version, options.address, 2)
		} else if (i === '0.2') {
			result.password = insertArgsIntoArray(result.password, options.password, 5)
		}
		return result
	})
}

function getRequestCommandFromJson(argument, type) {
	const queriesOfType = queries[type] || [];
	if (!Object.keys(queriesOfType).length) return {};
	let dataR = {};
	let dataY = '';
	let data = argument.split('.');
	let dataKey = '';
	for (let i = 0; i < data.length; i++) {
		if (dataY.length > 0) {
			dataY = Object.keys(dataR)[+data[i]];
			dataR = dataR[dataY];
			if (i >= 1) {
				dataKey += (dataKey.length ? '.' : '') + dataY;
			}
		} else {
			let index = Object.keys(queriesOfType)[+data[i]];
			dataR = queriesOfType[index];
			dataY = index;
		}
	}
	if (type.includes('CE')) {
		return ['hashedPassword', 'version'].includes(dataKey) ?
		{ [dataKey]: dataR, crc: false } :
		{ [dataKey]: dataR };
	} else {
		return { [dataKey]: dataR };
	}
}

function insertArgsIntoArray(array, args, index = 0) {
	const newArg = Array.isArray(args) ? args : Array.from(args, c => c.charCodeAt(0));
	const newArray = [...array];
	const from = newArray.splice(0, index);
	return [...from, ...newArg, ...newArray];
}