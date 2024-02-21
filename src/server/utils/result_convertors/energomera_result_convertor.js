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

        let [keyArg, newKey] = key.split('_')
        let keyArgProp = keyArg.split(',')[1]
        keyArg = keyArg.replace(/,(?=[^,]*$)/, '.')
        newKey = ['2.0', '3.0'].includes(key) ? key : newKey
        switch (newKey) {
            case 'version':
                const versionKeys = [67, 69]
                const newVal = [...data].join().split(',13,10')[0].split(`${versionKeys},`)[1].split(',')
                versionKeys.push(...newVal.map(i => +i));
                return { [newKey]: Buffer.from(versionKeys).toString() };
            case 'voltA':
                return {
                    [keyArg]: value[keyArgProp]
                };
            case 'voltL':
                return {
                    [keyArg]: value[keyArgProp]
                };
            case 'frequency':
                return { [keyArg]: value[keyArgProp] };
            case 'current':
                return { [keyArg]: value[keyArgProp] };
            case 'powp':
            case 'powq':
            case 'pows':
                return {
                    [keyArg]: value[keyArgProp]
                };
            case 'coriu':
                return { [keyArg]: value[keyArgProp] };
            case 'coruu':
                return {
                    [keyArg]: value[keyArgProp]
                }
            case 'cosf':
            case 'tanf':
                return {
                    [keyArg]: value[keyArgProp]
                };
            case 'currentDate':
                const today = value[0].split(',');
                return { [keyArg]: `${today[0]} ${today[1].replace('.', '/')}` };
            case 'lst':
                return { [newKey]: value }
            case '3.0':
                return getProfile(data, opt)
            case 'positiveA.all':
            case 'positiveR.all':
            case 'negativeA.all':
            case 'negativeR.all':
            case '2.0':
                if (key !== '2.0') {
                    return { [keyArg]: createResultA_R_Current(value) }
                } else {
                    return createResultA_R(data)
                }
            default:
                // console.log(key, data, 'hammasi ok');
        }
    } catch (error) {
        throw new Error(`Error in getEnergomeraResult function: ${error.message}`)
    }
}

function createResultA_R(params) {
    let results = []
    for (const i of params) {
        // console.log(extractorFunc(i.data.toString()))
        const [dateSum, ...tarifs] = extractorFunc(i.data.toString())
        const [date, sum] = dateSum.split(',')
        if (!results.length) {
            results.push({
                date,
                [i.key.split('_')[1] + ':sum']: sum,
                tarif: tarifs
            })
        }else {
            let result = results.filter(n => n.date === date)
            if (result.length) {
                result[0][i.key.split('_')[1] + ':sum'] = sum
                result[0].tarif.push(...tarifs)
            } else {
                results.push({
                    date,
                    [i.key.split('_')[1] + ':sum']: sum,
                    tarif: tarifs
                })
            }
        }
    }
    console.log(results);
    return results.map(i => [i.date, i['positiveA.all:sum'], i['negativeA.all:sum'], i['positiveR.all:sum'], i['negativeR.all:sum'], ...i.tarif])
}

function createResultA_R_Current(params) {
    const [date, ...tarifs] = params
    return date.split(',')[1]
}

function getProfile(data) {
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
                        [i.key.split('_')[1]]: j
                    })
                } else {
                    if (results.filter(k => k.date.includes(i.date) && Object.keys(k).includes(i.key.split('_')[1])).length) {
                        if (!results.filter(k => k.date.includes(newDate)).length) {
                            results.push({
                                date: newDate,
                                [i.key.split('_')[1]]: j
                            })
                        } else {
                            results.filter(k => k.date.includes(newDate))[0][i.key.split('_')[1]] = j
                        }
                    } else {
                        if (!results.filter(k => k.date.includes(i.date)).length) {
                            results.push({
                                date: newDate,
                                [i.key.split('_')[1]]: j
                            })
                        }
                        results.filter(k => k.date.includes(newDate))[0][i.key.split('_')[1]] = j
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
                        [i.key.split('_')[1]]: valueRes
                    })
                } else {
                    if (results.filter(k => k.date.includes(date) && Object.keys(k).includes(i.key.split('_')[1])).length) {
                        if (!results.filter(k => k.date.includes(newDate)).length) {
                            results.push({
                                date: newDate,
                                status,
                                [i.key.split('_')[1]]: valueRes
                            })
                        } else {
                            results.filter(k => k.date.includes(newDate))[0][i.key.split('_')[1]] = valueRes
                        }
                    } else {
                        if (!results.filter(k => k.date.includes(date)).length) {
                            results.push({
                                date: newDate,
                                status,
                                [i.key.split('_')[1]]: valueRes
                            })
                        }
                        results.filter(k => k.date.includes(newDate))[0][i.key.split('_')[1]] = valueRes
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

const current_time_obis = [ 
        "1.0.0",  // positiveA 
        "1.1.0",  // positiveR 
        "1.2.0",  // negativeA 
        "1.3.0",  // negativeR 
        "1.4.0",  // voltA 
        "1.4.1",  // voltB 
        "1.4.2",  // voltC 
        "1.5.0",  // voltLA 
        "1.5.1",  // voltLB 
        "1.5.2",  // voltLC 
        "1.6.0",   // frequency 
        "1.7.0", // current a
        "1.7.1", // current b
        "1.7.2", // current c
        "1.8.0", // powp a
        "1.8.1", // powp b
        "1.8.2", // powp c
        "1.8.3", // powp sum
        "1.9.0", // powq a
        "1.9.1", // powq b
        "1.9.2", // powq c
        "1.9.3", // powq sum
        "1.10.0", // pows a
        "1.10.1", // pows b
        "1.10.2", // pows c
        "1.10.3", // pows sum
        "1.11.0", // coriu angle a
        "1.11.1", // coriu angle b
        "1.11.2", // coriu angle c
        "1.12.0", // coruu a
        "1.12.1", // coruu b
        "1.12.2", // coruu c
        "1.13.0", // cosf a
        "1.13.1", // cosf b
        "1.13.2", // cosf c
        "1.13.3", // cosf sum
        "1.14.0", // tanf a
        "1.14.1", // tanf b
        "1.14.2", // tanf c
        "1.14.3", // tanf sum
        "1.15.0" // current time 
    ]