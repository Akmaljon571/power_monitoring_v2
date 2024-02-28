const { queries } = require('../model');
const { eneromeraObisEnum, eneromeraObisEnumNotCrc } = require('./enum');

module.exports = {
	jsonReaderFunc,
	insertedVariable,
	findKeyIndexAndValue
}

function jsonReaderFunc(obis, meterType) {
	try {
		const queriesOfType = queries[meterType] || []
		let [obisKey] = obis.split(',')
		let result
		for (const key in queriesOfType) {
			Object.keys(queriesOfType[key]).some(i => {
				if (i.split('_')[0] === obisKey) {
					result = obisKeyController(i, queriesOfType[key][i], obis, meterType)
				}
			})
		}
		return result || { [obis.split(',').join('.')]: null }
	} catch (error) {
		return { path: 'jsonReaderFunc', message: error.message, error: true }
	}
}

function obisKeyController(keyInput, data, obis, meterType) {
	try {
		let result
		meterType = meterType.split('_')[0]
		let [key, ...desc] = keyInput.split('_')
		desc = desc.join('_')
		
		if (meterType === 'CE') {
			if (eneromeraObisEnumNotCrc.includes(desc)) {
				result = { [desc]: data, crc: false }
			} else if (eneromeraObisEnum.includes(desc)) {
				result = { [desc]: data }
			} else {
				result = { [`${obis}_${desc}`]: data }
			}
		}
		
		return result
	} catch (error) {
		return { path: 'obisKeyController', message: error.message, error: true }
	}
}

function insertedVariable(array, param, index) {
    let data = [...array]
    data.splice(index, 0, ...Array.from(param, c => c.charCodeAt(0)))
    return data
}

function findKeyIndexAndValue(array, key) {
  for (let i = 0; i < array.length; i++) {
    const currentKey = Object.keys(array[i])[0];
    if (currentKey === key) {
      const value = Object.values(array[i])[0];
      if (Array.isArray(value)) {
        return { key: currentKey, index: i, value: value, exist: false };
      } else if (typeof value === 'object') {
        return { key: currentKey, index: i, value: value, exist: true };
      }
    }
  }
  return { key: key, index: -1, value: false }; // If key is not found
}
