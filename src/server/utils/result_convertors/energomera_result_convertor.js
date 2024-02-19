module.exports = { getEnergomeraResult }

function getEnergomeraResult(data, key, opt) {
    try {
        // if (data.toString().toLowerCase().includes('err')) {
        //     return { [key]: null };
        // }
        let value = extractorFunc(data.toString())
        if (typeof data === 'string') {
            value = [data]
        }
        switch (key) {
            case 'version':
            const versionKeys = [67, 69];
            const newVal = [...data].join().split(',13,10')[0].split(`${versionKeys},`)[1].split(',');
            versionKeys.push(...newVal.map(i => +i));
            return { [key]: Buffer.from(versionKeys).toString() };
            case 'voltA':
            return {
                [key]: {
                    Ua: value[0],
                    Ub: value[1],
                    Uc: value[2]
                }
            };
            case 'voltL':
            return {
                [key]: {
                    Uab: value[0],
                    Ubc: value[1],
                    Uca: value[2]
                }
            };
            case 'frequency':
            return { [key]: value[0] };
            case 'current':
            return {
                [key]: {
                    Ia: value[0],
                    Ib: value[1],
                    Ic: value[2]
                }
            };
            case 'powp':
            case 'powq':
            case 'pows':
            return {
                [key]: {
                    [`${key[3].toUpperCase()}a`]: value[0],
                    [`${key[3].toUpperCase()}b`]: value[1],
                    [`${key[3].toUpperCase()}c`]: value[2],
                    [`${key[3].toUpperCase()}sum`]: value[3]
                }
            };
            case 'coriu':
            return {
                [key]: {
                    'COS_F(a)_angle': value[0],
                    'COS_F(b)_angle': value[1],
                    'COS_F(c)_angle': value[2]
                }
            };
            
            case 'coruu':
            return {
                [key]: {
                    'a_Ua_Ub': value[0],
                    'a_Ub_Uc': value[1],
                    'a_Uc_Ua': value[2]
                }
            }
            case 'cosf':
            case 'tanf':
            return {
                [key]: {
                    [`${key === 'cosf' ? 'COS' : 'TAN'}_fa`]: value[0],
                    [`${key === 'cosf' ? 'COS' : 'TAN'}_fb`]: value[1],
                    [`${key === 'cosf' ? 'COS' : 'TAN'}_fc`]: value[2],
                    [`${key === 'cosf' ? 'COS' : 'TAN'}_fsum`]: value[3]
                }
            };
            case 'currentDate':
            const today = value[0].split(',');
            return { [key]: `${today[0]} ${today[1].replace('.', '/')}` };
            case 'lst':
            return { [key]: value }
            case '3.0':
            return getProfile1(data, opt)
            case '2.0':
            return createResultA_R(data, key, opt)
            case 'cAutoReading':
            return createResultA_R(data)
            default:
            const ifExist = ['positiveA', 'positiveR', 'negativeA', 'negativeR']
            if (ifExist.includes(key.split('.')[0])){
                return createResultA_R(data, key, opt)
            } else {
                console.log(key, data, 'hammasi ok');
            }
        }
    } catch (error) {
        throw new Error(`Error in getEnergomeraResult function: ${error.message}`)
    }
}

function createResultA_R(param, keyResult='', optDate) {
    let value = {
        date: '',
        billing: []
    }
    let key
    for (const i of param) {
        const [dateSum, ...tarifs] = extractorFunc(i.data.toString());
        const [date, sum] = dateSum.split(',').length === 1 ? [null, tarifs.shift()] : dateSum.split(',');
        
        const result = {};
        keyResult = i.key.includes('autoReading.') ? i.key.split('autoReading.')[1] : i.key
        key = keyResult.split('.')[0]
        if (keyResult.endsWith('.all')) {
            result[key] = { sum, ...tarifs.reduce((acc, tarif, index) => ({ ...acc, [`tarif${index + 1}`]: tarif }), {}) };
        } else if (keyResult.endsWith('.sum')) {
            result[key] = { sum: sum || '0.0' };
        } else {
            const tarifIndex = parseInt(keyResult.slice(-1));
            const tarifValue = tarifs[tarifs.length - 1] || '0.0';
            result[key] = { sum: tarifValue, [`tarif${tarifIndex}`]: tarifValue };
        }
        if (keyResult != '') {
            if (optDate) {
                value.date = optDate
            } else {
                value.date += value.date.length ? `, ${date}` : date
            }
        } else {
            value.date = date
        }
        // value.date = keyResult !== '' ? (value.date.length ? `${value.date}, ${date}` : date) : date;
        
        value.billing.push(result)
    }
    return value;
}

function getProfile1(data) {
    const results = []
    for (const i of data) {
        let extactedData = extractorFunc(i.data)
        let currentTime = new Date();
        currentTime.setHours(0, 0, 0, 0);
        let from = new Date(currentTime);
        let to = new Date(currentTime);
        
        if (i?.date) {
            for (const j of extactedData) {
                let newDate = `${i.date} ${fromToDate(from,to).to}`
                if (!results.length) {
                    results.push({
                        date: newDate,
                        [i.key]: j
                    })
                } else {
                    if (results.filter(k => k.date.includes(i.date) && Object.keys(k).includes(i.key)).length) {
                        if (!results.filter(k => k.date.includes(newDate)).length) {
                            results.push({
                                date: newDate,
                                [i.key]: j
                            })
                        } else {
                            results.filter(k => k.date.includes(newDate))[0][i.key] = j
                        }
                    } else {
                        if (!results.filter(k => k.date.includes(i.date)).length) {
                            results.push({
                                date: newDate,
                                [i.key]: j
                            })
                        }
                        results.filter(k => k.date.includes(newDate))[0][i.key] = j
                    }
                }
            }
        } else {
            let str = extactedData.shift()
            let [date, ...second] = str.split(',')
            extactedData = [second.join(','), ...extactedData]
            
            for (const j of extactedData) {
                const [valueRes, status] = j.split(',');
                let newDate = `${date} ${fromToDate(from,to).to}`
                if (!results.length) {
                    results.push({
                        date: newDate,
                        status,
                        [i.key]: valueRes
                    })
                } else {
                    if (results.filter(k => k.date.includes(date) && Object.keys(k).includes(i.key)).length) {
                        if (!results.filter(k => k.date.includes(newDate)).length) {
                            results.push({
                                date: newDate,
                                status,
                                [i.key]: valueRes
                            })
                        } else {
                            results.filter(k => k.date.includes(newDate))[0][i.key] = valueRes
                        }
                    } else {
                        if (!results.filter(k => k.date.includes(date)).length) {
                            results.push({
                                date: newDate,
                                status,
                                [i.key]: valueRes
                            })
                        }
                        results.filter(k => k.date.includes(newDate))[0][i.key] = valueRes
                    }
                }
            }
        }
    }

    return results
}


function fromToDate(from, to) {
    to.setMinutes(to.getMinutes() + 30);
    return {
        from: `${from.getHours()}:${from.getMinutes().toString().padStart(2, '0')}`,
        to: `${to.getHours()}:${to.getMinutes().toString().padStart(2, '0')}`
    };
}

function extractorFunc(value){
    let reBrackets = /\((.*?)\)/g;
    let sortedData = []
    let found;
    while ((found = reBrackets.exec(value))) {
        sortedData.push(found[1]);
    }
    return sortedData
}