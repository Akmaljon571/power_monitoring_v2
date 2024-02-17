const { getRequestCommandFromJson } = require('../toolbox');

const TE_Counter_Commands = {
    requiredCommands: ['0.0', '0.1'],
};

function readTECounterOBIS(obis, options, key) {
    try {
        switch (key) {
            case 'obis':
                return commandsTE(obis, options);
            default:
                return commandsTE(
                    TE_Counter_Commands.requiredCommands,
                    options
                );
        }
    } catch (error) {
        throw new Error(`Error in te_72cas_obis.js: ${error.message}`);
    }
}

function commandsTE(data, options) {
    let address = calculateAddress(options.address);
    return data.map(i => {
        let result = getRequestCommandFromJson(i, options.meterType);
        result[Object.keys(result)[0]].splice(5, 2, ...address);
        return result;
    });
}

function calculateAddress(address) {
    const isByte = Number(address) > 0 && Number(address) < 255;
    let shiftRes = address << 1;

    if (isByte) {
        let newBinary = shiftRes.toString(2).padStart(8, '0');
        return [
            '00',
            parseInt(newBinary.replace(/.$/, '1'), 2)
                .toString(16)
                .toUpperCase(),
        ];
    } else {
        let newBinary = shiftRes.toString(2).padStart(16, '0');
        let [firstByte, secondByte] = newBinary
            .replace(/.$/, '1')
            .match(/.{1,8}/g);
        let newFirstByte = (parseInt(firstByte, 2) << 1)
            .toString(2)
            .padStart(8, '0');
        return parseInt(newFirstByte + secondByte, 2)
            .toString(16)
            .toUpperCase()
            .match(/.{1,2}/g);
    }
}

module.exports = {
    commandsTE,
    readTECounterOBIS,
	calculateAddress
};
