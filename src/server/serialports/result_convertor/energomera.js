const { unWrapObject } = require("../../utils/commonUtils")
const { eneromeraObisEnum } = require("../../utils/enum")

module.exports = getEnergomeraResult

function getEnergomeraResult(data, inputKey, opt) {
    try {
        console.log(data,inputKey, opt)

        let { key, value } = unWrapObject(data)
        if (eneromeraObisEnum.includes(key)) {
            return verifyResponse(value, key, opt)
        }

        let extractedValue = extractorFunc(value.toString())
        let [newKey, ...desc] = key.split('_')
        desc = ['A+', 'A-', 'R+', 'R-'].includes(desc[0]) ? desc[0] :  desc.join('_')
        let keys = newKey.split(',') 
        let keyArg = keys.join('.')
        desc = desc || inputKey
        switch (desc) {
            case 'version':
                const versionKeys = [67, 69]
                const newVal = [...data].join().split(',13,10')[0].split(`${versionKeys},`)[1].split(',')
                versionKeys.push(...newVal.map(i => +i))
                return { [desc]: Buffer.from(versionKeys).toString() }
            case 'voltA':
            case 'voltL':
            case 'frequency':
            case 'current':
            case 'powp':
            case 'powq':
            case 'pows':
            case 'coriu':
            case 'coruu':
            case 'cosf':
            case 'tanf':
                return { [keyArg]: extractedValue[keys[1]]}
            case 'currentTime': return { [keyArg]:[  extractedValue[0] ] } 
            case 'currentDate':
                const today = extractedValue.length ? extractedValue[0].split(',') : ''
                if (!today.length) return {[keyArg]: ''}
                return { [keyArg]: today.length != 1 ? `${today[0]} ${today[1].replace('.', '/')}` : extractedValue[0].replace('.', '/') }
            case 'lst':
                return { [desc]: extractedValue}
            case 'A+':
            case 'A-':
            case 'R+':
            case 'R-':
                return { [keyArg]: createResultA_R_Current(extractedValue) || "" }
            case '2.0':
            // console.log(createResultA_R(data))
            return createResultA_R(data)
            case '3.0':
                return getProfile(data)
            default:
                console.log(keyArg, newKey, data, 'hammasi ok')
                break
        }
        
        return []
    } catch (error) {
        return { path: 'getEnergomeraResult', message: error.message, error: true }
    }
}

function createResultA_R_Current(params) {
    try {
        const [data, ...tarifs] = params
        let sum = data.split(',')
        return sum.length == 2 ? sum[1] : data
    } catch (error) {
        return { path: 'createResultA_R_Current', message: error.message, error: true }
    }
}

function createResultA_R(params) {
    try {
        let results = []
        
        for (const i of params) {
            let {key, value} = unWrapObject(i.data ? i.data : i)
            let [dateSum, ...tarifs] = extractorFunc(value.toString())
            let [date, sum] = dateSum.split(',')
            if (!sum) {
                sum = tarifs.shift()
                date = i.date
            }
            if (!results.length) {
                results.push({
                    date,
                    [key.split('_')[1] + ':sum']: sum,
                    tarif: tarifs
                })
            }else {
                let result = results.filter(n => n.date === date)
                if (result.length) {
                    result[0][key.split('_')[1] + ':sum'] = sum
                    result[0].tarif.push(...tarifs)
                } else {
                    results.push({
                        date,
                        [key.split('_')[1] + ':sum']: sum,
                        tarif: tarifs
                    })
                }
            }
        }

        return results.map(i => {
            if (!i['A-:sum'] && !i['R+:sum'] && !i['R-:sum']) {
                i.tarif.splice(4,0, ...new Array(12).fill(null))
                return [i.date, i['A+:sum'], i['A-:sum'], i['R+:sum'], i['R-:sum'], ...i.tarif]
            } else if (!i['A-:sum']) {
                i.tarif.splice(4,0, ...new Array(4).fill(null))
                return [i.date, i['A+:sum'], i['A-:sum'], i['R+:sum'], i['R-:sum'], ...i.tarif]
            } else {
                return [i.date, i['A+:sum'], i['A-:sum'], i['R+:sum'], i['R-:sum'], ...i.tarif]   
            }
        })
    } catch (error) {
        return { path: 'createResultA_R', message: error.message, error: true }
    }
}

function getProfile(data) {
    try {
        console.log(data);
        const results = []
        for (const i of data) {
            let {key, value} = unWrapObject(i.data ? i.data : i)
            let extractedData = extractorFunc(value.toString())
            let currentTime = new Date()
            currentTime.setHours(0, 0, 0, 0)
            let from = new Date(currentTime)
            let to = new Date(currentTime)

            if (i?.date) {
                for (const j of extractedData) {
                    let newDate = `${i.date} ${fromToDate(from,to).to}`
                    if (!results.length) {
                        results.push({
                            date: newDate,
                            [key.split('_')[2]]: j
                        })
                    } else {
                        if (results.filter(k => k.date.includes(i.date) && Object.keys(k).includes(key.split('_')[2])).length) {
                            if (!results.filter(k => k.date.includes(newDate)).length) {
                                results.push({
                                    date: newDate,
                                    [key.split('_')[2]]: j
                                })
                            } else {
                                results.filter(k => k.date.includes(newDate))[0][key.split('_')[2]] = j
                            }
                        } else {
                            if (!results.filter(k => k.date.includes(i.date)).length) {
                                results.push({
                                    date: newDate,
                                    [key.split('_')[2]]: j
                                })
                            }
                            results.filter(k => k.date.includes(newDate))[0][key.split('_')[2]] = j
                        }
                    }
                }
            } else {
                let str = extractedData.shift()
                let [date, ...second] = str.split(',')
                extractedData = [second.join(','), ...extractedData]
                
                for (const j of extractedData) {
                    const [valueRes, status] = j.split(',')
                    let newDate = `${date} ${fromToDate(from,to).to}`
                    if (!results.length) {
                        results.push({
                            date: newDate,
                            status,
                            [key.split('_')[2]]: valueRes
                        })
                    } else {
                        if (results.filter(k => k.date.includes(date) && Object.keys(k).includes(key.split('_')[2])).length) {
                            if (!results.filter(k => k.date.includes(newDate)).length) {
                                results.push({
                                    date: newDate,
                                    status,
                                    [key.split('_')[2]]: valueRes
                                })
                            } else {
                                results.filter(k => k.date.includes(newDate))[0][key.split('_')[2]] = valueRes
                            }
                        } else {
                            if (!results.filter(k => k.date.includes(date)).length) {
                                results.push({
                                    date: newDate,
                                    status,
                                    [key.split('_')[2]]: valueRes
                                })
                            }
                            results.filter(k => k.date.includes(newDate))[0][key.split('_')[2]] = valueRes
                        }
                    }
                }
            }
        }
        return results
    } catch (error) {
        return { path: 'getProfile', message: error.message, error: true }
    }
}

function fromToDate(from, to) {
    to.setMinutes(to.getMinutes() + 30)
    return {
        from: `${from.getHours()}:${from.getMinutes().toString().padStart(2, '0')}`,
        to: `${to.getHours()}:${to.getMinutes().toString().padStart(2, '0')}`
    }
}

function verifyResponse(data, key, meterType) {
    
    // console.log(data, key)
    return
}

function extractorFunc(value){
    let reBrackets = /\((.*?)\)/g
    let sortedData = []
    let found
    while ((found = reBrackets.exec(value))) {
        sortedData.push(found[1])
    }
    return sortedData
}