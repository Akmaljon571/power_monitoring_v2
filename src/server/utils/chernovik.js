let x = ``.trim().split(' ')
// console.log(x);




let number = '8045'

function calculateAdress(adress) {
    if (Number(number) > 0 && Number(number) < 255) {
        let shiftRes = number << 1
        let newBinary = Number(shiftRes).toString(2).padStart(8, 0)
        return ['00', parseInt(newBinary.replace(/.$/,"1"), 2).toString(16)]
    } else {
        let shiftRes = number << 1
        let newBinary = Number(shiftRes).toString(2).padStart(16, 0)
        let [firstByte, secondByte] = newBinary.replace(/.$/,"1").match(/.{1,8}/g)
        let newFirstByte = (parseInt(firstByte, 2) << 1).toString(2).padStart(8, 0)
        return parseInt((newFirstByte+secondByte), 2).toString(16).toUpperCase().match(/.{1,2}/g)
    }
}
// console.log(calculateAdress(number));

function ax25crc16(data_p) {
    let crc = 0xFFFF;
    let data;
    const crc16_table = [
        0x0000, 0x1081, 0x2102, 0x3183,
        0x4204, 0x5285, 0x6306, 0x7387,
        0x8408, 0x9489, 0xa50a, 0xb58b,
        0xc60c, 0xd68d, 0xe70e, 0xf78f
    ];
    
    for (let i = 0; i < data_p.length; i++) {
        crc = (crc >> 4) ^ crc16_table[(crc & 0xf) ^ (data_p[i] & 0xf)];
        crc = (crc >> 4) ^ crc16_table[(crc & 0xf) ^ (data_p[i] >> 4)];
    }
    
    data = crc;
    crc = (crc << 8) | (data >> 8 & 0xff); // do byte swap here that is needed by AX25 standard
    return (~crc) & 0xFFFF;
}

const data = [0xA0, 0x19, 0x03, 0x05, 0x32, 0x3C, 0x9C, 0xE6, 0xE6, 0x00, 0xC0, 0x01, 0xC1, 0x00, 0x03, 0x01, 0x00, 0x48, 0x07, 0x00, 0xFF, 0x02, 0x00];

const crcResult = ax25crc16(data);
// console.log(`CRC Result: 0x${crcResult.toString(16)}`);




// const { queryMaker } = require('./crc')
// let addArg = '.R1.ENDQI().p'
// let addArg = "2CE3083.10"


// console.log(Buffer.from(versionKeys).toString())

// console.log([...Buffer.from(addArg)])
// let y = [50, 67, 69, 51, 48, 56, 51, 46, 49, 48, 13, 10]

// let key = [67,69]
// let newVal = y.join().split(',13,10')[0].split(`${key},`)[1].split(',').map(i => +i)
// key.push(...newVal)
// Buffer.from(key).toString()
// 

// console.log(newArg, queryMaker(newArg,false), queryMaker([1,82,49,2,69,84,48,80,69,40,41,3]))
// let result = []
// let counter = 1
// for(let i of addArg){
// 	if (i == '.') {
// 		result.push(counter)
// 		if (counter == 3) break;
// 		counter++
// 	} else {
// 		result.push(i)
// 	}
// }
// console.log(result)
// let newArg = result.map(c => {
// 	if (typeof c == 'number') {
// 		return c
// 	}
// 	return c.charCodeAt (0)
// })
// console.log(newArg, Buffer.from(newArg))

// function strToDec(str) {
// 	return str.split('').map(c => c.charCodeAt (0))
// }

// console.log(strToDec('5.2.24'))
// console.log(strToDec(addArg), Buffer.from(strToDec(addArg)))

// function decimalToHex(d, padding) {
//     if (Array.isArray(d)) {
//         return d.map(value => {
//             var hex = Number(value).toString(16);
//             padding =
//                 typeof padding === 'undefined' || padding === null
//                     ? (padding = 2)
//                     : padding;

//             while (hex.length < padding) {
//                 hex = '0' + hex;
//             }
//             return hex;
//         });
//     } else {
//         var hex = Number(d).toString(16);
//         padding =
//             typeof padding === 'undefined' || padding === null
//                 ? (padding = 2)
//                 : padding;

//         while (hex.length < padding) {
//             hex = '0' + hex;
//         }
//         return hex;
//     }
// }


// function getValuesFromParentheses(inputString) {
//     const regex = /\(([^)]+)\)/g;
//     const matches = [];

//     let match;
//     while ((match = regex.exec(inputString))) {
//         matches.push(match[1]);
//     }
//     return matches;
// }