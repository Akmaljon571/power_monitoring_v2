const { jsonReaderFunc, insertedVariable, findKeyIndexAndValue } = require("../../utils/obisUtils")

const CE_Counter_Commands = {
    startCommands: ["0.0", "0.1", "0.2", "0.3"],
    lstsCommands: ['0.0', '0.1', '0.2', '0.4', '0.3'],
    currentTimeBillingCommads: [],
    billingCommands: ['2.0.5', '2.1.5', '2.2.5', '2.3.5'],
    loadProfileCommands: ['3.0', '3.1', '3.2', '3.3']
}

function readEnergomeraCounterOBIS(obis, options, key) {
    try {
        switch (key) {
            case 'lst':
                return commandsCE(CE_Counter_Commands.lstsCommands, options)
            case 'obis':
                let result = {
                    startCommands: commandsCE(CE_Counter_Commands.startCommands, options),
                    obisCommands: []
                }

                if (obis.includes('2.0') && !obis.includes('3.0')) {
                    result['obisCommands'] = commandsCE(CE_Counter_Commands.billingCommands, options)
                } else if (obis.includes('3.0') && !obis.includes('2.0')) {
                    result['obisCommands'] = commandsCE(CE_Counter_Commands.loadProfileCommands, options)
                } else {
                    let newObis = obis.map(i => {
                        if (i.split('.').join('') >= 140) {
                            return i.replace(/\.(?=[^.]*$)/, ',')
                        } else {
                            return i
                        } 
                    })
                	let checkKey = '1.15,0_currentDate'
                    let obisCode = commandsCE(newObis, options)
                    let checkValue = findKeyIndexAndValue(obisCode, checkKey)
                    if (!checkValue?.exist) {
                        result['obisCommands'] = obisCode
                    } else {
                        let index = checkValue?.index
                        const newParams = [ 
                            { [checkKey]: checkValue?.value.date },
                            { '1.16,0_currentTime': checkValue?.value.time }
                        ]
                        obisCode.splice(index, 1, ...newParams)
                        result['obisCommands'] = obisCode
                    }
                }
                return result
            default:
                console.log('ok obis default')
        }
        
    } catch (error) {
        return { path: 'readEnergomeraCounterOBIS', message: error.message, error: true }
    }
}

function commandsCE(data, options) {
    try {
        return data.map(i => {
            let jsonResult = i ? jsonReaderFunc(i, options.meterType) : []
            if (i === '0.0') {
                jsonResult['open&version'] = insertedVariable(jsonResult['open&version'], options.address, 2)
            } else if (i === '0.2') {
                jsonResult['password'] = insertedVariable(jsonResult['password'], options.password, 5)
            }
            return jsonResult
        })
    } catch (error) {
        return { path: 'commandsCE', message: error.message, error: true }
    }
}

module.exports = {
    readEnergomeraCounterOBIS
}