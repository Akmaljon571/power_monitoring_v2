const sum = require('../../queries/TE73_CAS/TE_73CAS.json')[0]['settings']['devideToSum'] 

function getTE_73Result(data, key) {
    try {
        const hexString = data.toString('hex');
        let dataBufArray = hexString.split(hexString.slice(0, 26))[1].match(/.{1,2}/g).slice(0, -3);
        
        let currentVal = dataBufArray.join('').slice(-8);
        let newKey = key.split('.');

        if (newKey.length === 2) {
            if (newKey[0].includes('positive')) key = 'Positive';
            else if (
                newKey[0].includes('negative') ||
                newKey[0].includes('current') ||
                newKey[0].includes('pow') ||
                newKey[0].includes('cosf')
                )
                key = 'Negative';
                else if (newKey[0].includes('volt')) key = 'Voltage';
                else if (newKey[0].includes('cor')) key = 'Cor';
            }
            const resOfCurrent = parseInt(currentVal.slice(-4), 16);
            switch (key) {
                case 'currentDate':
                return { [key]: currentDate(dataBufArray) };
                case 'frequency':
                return { [key]: resOfCurrent / 100 };
                case 'Negative':
                case 'Positive':
                case 'Voltage':
                return {
                    [newKey.join('.')]:
                    resOfCurrent / (key === 'Voltage' ? 10 : 100),
                };
                case 'Cor':
                return { [newKey.join('.')]: parseInt(currentVal, 16) / 1000 };
                default:
                return { [key]: resOfCurrent };
            }
        } catch (error) {
            throw new Error(error.message);
        }
    }
    
    function currentDate(params) {
        const year = parseInt(params.slice(7, 9).join(''), 16);
        const month = parseInt(params[9], 16);
        const day = parseInt(params[10], 16);
        const hour = parseInt(params[12], 16);
        const minute = parseInt(params[13], 16);
        const second = parseInt(params[14], 16);
        return `${pad2(day)}-${pad2(month)}-${year} ${pad2(hour)}:${pad2(
            minute
            )}:${pad2(second)}`;
        }
        
        function pad2(n) {
            return String(n).padStart(2, '0');
        }
        