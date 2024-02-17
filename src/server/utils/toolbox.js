const { queries } = require('../queries')

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

module.exports.getRequestCommandFromJson = getRequestCommandFromJson