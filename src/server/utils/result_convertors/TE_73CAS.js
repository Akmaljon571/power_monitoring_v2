const sum = require('../../queries/TE73_CAS/TE_73CAS.json')[0]['settings']['devideToSum'] 

function getTE_73Result(data, key) {
    try {
        const hexString = data.toString('hex');
        let dataBufArray = key != 'profile' ? hexString.split(hexString.slice(0, 26))[1].match(/.{1,2}/g).slice(0, -3) : data
        
        let currentVal = key != 'profile' ? dataBufArray.join('').slice(-8) : data
        let newKey = key.split('.');
        
        if (newKey.length === 2) {
            if (newKey[0].includes('positive')) key = 'Positive';
            else if (newKey[0].includes('negative') ||newKey[0].includes('current') ||newKey[0].includes('pow') ||newKey[0].includes('cosf')) key = 'Negative';
            else if (newKey[0].includes('volt')) key = 'Voltage';
            else if (newKey[0].includes('cor')) key = 'Cor';
        }
        const resOfCurrent = key != 'profile' ? parseInt(currentVal.slice(-4), 16) : data
        switch (key) {
            case 'currentDate':
            return { [key]: currentDate(dataBufArray) };
            case 'frequency':
            return { [key]: resOfCurrent / 100 };
            case 'Negative':
            case 'Positive':
            case 'Voltage':
            return {
                [newKey.join('.')]: resOfCurrent / (key === 'Voltage' ? 10 : 100),
            };
            case 'Cor':
            return { [newKey.join('.')]: parseInt(currentVal, 16) / 1000 };
            default:
                return { [key]: getProfile(data) };
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
    return `${pad2(day)}-${pad2(month)}-${year} ${pad2(hour)}:${pad2(minute)}:${pad2(second)}`;
}

function pad2(n) {
    return String(n).padStart(2, '0');
}

function getProfile(params) {
    let arr = Object.keys(params)
    
    var newArray = []
    for (var i=0; i<arr.length; i+=2) {
        newArray.push([params[arr[i]], params[arr[i+1]]])
    }
    let readableData = []
    
    for(let i=0; i<=newArray.length-1; i++) {
        const modifiedArrays = [
            newArray[i][0].slice(0, -3),
            newArray[i][1].slice(11)
        ];
        let joinedArray = modifiedArrays.flat()
        if (!readableData.length) {
            joinedArray.splice(0, 32)
            readableData.push(joinedArray.slice(0, -3))
        } else {
            if (joinedArray.length>30) {
                joinedArray.splice(0, 28)
                readableData.push(joinedArray.slice(0, -3))
            } else {
                readableData.push(null)
            }
        }
    }
    console.log(readableData)
    let result = []
    // console.log(readableData.length)
    for (const i of readableData) {
        // console.log(i);
        getElementRes(i, result)
    }
    // console.log()
    return result
}

module.exports = { getTE_73Result };

function getElementRes(data, result=[]) {
    let fullYear = data.splice(0, 2)
    fullYear=parseInt(fullYear.join(''), 16)
    let [month, day, weekDay, hour, minute, second] = data
    
    month=parseInt(month,16)
    day=parseInt(day,16)
    weekDay=parseInt(weekDay,16)
    hour=parseInt(hour,16)
    minute=parseInt(minute,16)
    second=parseInt(second,16)
    
    data.splice(0, 12)

    let date = `${fullYear}-${pad2(month)}-${pad2(day)} ${pad2(hour)}:${pad2(minute)}`
    // console.log(date, data)
    
    let groupedArray = []
    for (let i = 0; i < 35; i += 5) {
        let removed = data.splice(0, 5)
        removed.shift()
        groupedArray.push(parseInt(removed.join(''),16));
    }
    let reg2 = data.splice(0, 3)

    result.push({
        date,
        status: null,
        profile1: String(groupedArray[0]/sum),
        profile2: String(groupedArray[1]/sum),
        profile3: String(groupedArray[2]/sum),
        profile4: String(groupedArray[3]/sum)
    })

    if (data.length > 50) {
        return getElementRes(data, result)
    } else {
        return
    }
}


// let data = '07e8020703132d0000012c001180060000000006000000000600000000060000000006000000000600000000060000000002091907e802070314000000012c001100060000000006000000000600000000060000000006000000000600000000060000000002091907e8020703140f0000012c001100060000000006000000000600000000060000000006000000000600000000060000000002091907e8020703141e0000012c0011000600000000060000000006000000000600000000060000000006000000000600000000'
// // console.log(data.match(/.{1,2}/g))

// let result = []
// getElementRes(data.match(/.{1,2}/g), result)

// console.log(result);