const { readCECounterOBIS, insertArgsIntoArray } = require('./energomera_obis')
const { readMercuryCounterOBIS } = require('./mercury_obis')
const { readTECounterOBIS } = require('./te_72cas_obis')

module.exports = {
	CE_Counter_Query: readCECounterOBIS,
	Mercury_Counter_Query: readMercuryCounterOBIS,
	TE_Counter_Query: readTECounterOBIS,
	
	// functions
	parseValue: insertArgsIntoArray
}