module.exports = {
    queryMaker
}

function queryMaker(array, meterType, crc=true) {
    try {
        if (meterType === 'CE') {
            if (crc === false) {
                return Buffer.from(array)
            } else {
                return Buffer.from([...array, calculateCRC8(array)])
            }
        } else if (meterType === 'Mercury') {
            console.log('mercury crc func');
        }
    } catch (error) {
        return { path: 'queryMaker', message: error.message, error: true }
        
    }    
}

// crc calculate functions

function calculateCRC16Modbus(array) {
    try {
        let crc = 0xffff;
        for (let i = 0; i < array.length; i++) {
            crc ^= array[i];
            for (let j = 0; j < 8; j++) {
                if ((crc & 0x0001) !== 0) {
                    crc = (crc >> 1) ^ 0xa001;
                } else {
                    crc >>= 1;
                }
            }
        }
        const crc1 = crc & 0xff; // Low byte
        const crc2 = (crc >> 8) & 0xff; // High byte
        
        return { crc1, crc2 };
    } catch (error) {
        return { path: 'calculateCRC16Modbus', message: error.message, error: true }
        
    }
}

function calculateCRC8(array) {
    try {
        const SOH = 1;
        const STX = 2;
        const ETX = 3;
        
        let data = array.slice();
        
        if (data[0] === SOH || data[0] === STX) {
            data.shift();
        }
        
        let endIndex = data.indexOf(ETX);
        if (endIndex === -1) {
            endIndex = data.length;
        } else {
            endIndex++;
        }
        
        const verificationData = data.slice(0, endIndex);
        
        const sum = verificationData.reduce((acc, num) => acc + num, 0);
        const binaryString = sum.toString(2);
        const paddedBinaryString = binaryString.padStart(verificationData.length * 4, '0');
        const last7Bits = paddedBinaryString.slice(-7);
        return parseInt(last7Bits, 2);
    } catch (error) {
        return { path: 'calculateCRC8', message: error.message, error: true }
        
    }
}
