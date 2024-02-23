const crc16modbus = require('crc/calculators/crc16modbus');
const { queries: { TE_73CAS } } = require('../../queries/index')
// console.log(TE_73CAS)
module.exports = { queryMaker, TE_Command, checkCrcIs };

function checkCrcIs(buffer, key, sendData) {
    let resCrc = [...buffer].pop();
    let buffArray = verificationArray([12, 21, 3, 4, ...buffer]);
    return CRC8(buffArray) === resCrc;
}

function queryMaker(data, type, crc) {
    if (type === 'Mercury') {
        let { crc1, crc2 } = CRC16Modbus(data);
        return new Buffer.from([...data, crc1, crc2]);
    } else if (type === 'TE') {
        return TE_Command(data);
    } else {
        if (crc == undefined) {
            return Buffer.from([...data, CRC8(data)]);
        } else if (crc == false) {
            return Buffer.from(data);
        }
    }
}

// Mercury, ...
function CRC16Modbus(params) {
    const CRC = String(crc16modbus(new Int8Array(params)).toString(16));
    let crc1 = parseInt(CRC[2] + CRC[3], 16);
    let crc2 = parseInt(CRC[0] + CRC[1], 16);
    return { crc1, crc2 };
}

// energomera, ...
function CRC8(params) {
    const binaryString = sumOfDecimal(params).toString(2);
    const paddedBinaryString = binaryString.padStart(
        sumOfDecimal(params).length * 4,
        '0'
    );
    const last7Bits = paddedBinaryString.slice(-7);
    return parseInt(last7Bits, 2);
}

// TE73_CAS, ...
function ax25crc16(dataArray) {
    let crc = 0xffff;
    const crc16_table = [
        0x0000, 0x1081, 0x2102, 0x3183, 0x4204, 0x5285, 0x6306, 0x7387, 0x8408,
        0x9489, 0xa50a, 0xb58b, 0xc60c, 0xd68d, 0xe70e, 0xf78f,
    ];

    for (let i = 0; i < dataArray.length; i++) {
        const hexValue = parseInt(dataArray[i], 16);
        crc = (crc >> 4) ^ crc16_table[(crc & 0xf) ^ (hexValue & 0xf)];
        crc = (crc >> 4) ^ crc16_table[(crc & 0xf) ^ (hexValue >> 4)];
    }

    crc = (crc << 8) | ((crc >> 8) & 0xff);
    return (~crc & 0xffff).toString(16);
}

// TE73 command maker function
function TE_Command(array) {
    const newArray = [...array];

    const startCommand = newArray.shift();
    const endCommand = newArray.pop();

    let crc1commands = newArray.slice(0, 8);
    let crc1 = ax25crc16(crc1commands)
        .toUpperCase()
        .padStart(4, '0')
        .match(/.{1,2}/g);

    newArray.splice(8, 2, ...crc1);

    let newCommand = [startCommand, ...newArray, endCommand];

    if (newArray.length !== 10) {
        newArray.splice(newArray.length - 2, 2);
        let crc2 = ax25crc16(newArray)
            .toUpperCase()
            .padStart(4, '0')
            .match(/.{1,2}/g);
            // console.log(crc1, crc2)
        newCommand = [startCommand, ...newArray, ...crc2, endCommand];
    }
    const result = [];
    for (let i = 0; i < newCommand.length; i++) {
        result.push(parseInt(newCommand[i], 16));
    }
    
    // console.log(Buffer.from(result));
    return Buffer.from(result)
}

// console.log(111, TE_Command(["7e", "a0", "16", "00", "02", "4c", "73", "05", "74", "c9", "a0", "e6", "e6", "00", "c0", "02", "c1", "00", "00", "00", "00", "5d", "fd", "7e"]));


function sumOfDecimal(numberArray) {
    const data = verificationArray(numberArray);
    return data.reduce((acc, num) => acc + num, 0);
}

function verificationArray(data) {
    const SOH = 1;
    const STX = 2;
    const ETX = 3;

    if (data[0] === SOH || data[0] === STX) {
        data.shift();
    }

    let endIndex = data.indexOf(ETX);
    if (endIndex === -1) {
        endIndex = data.length;
    } else {
        endIndex++;
    }

    return data.slice(0, endIndex);
}
