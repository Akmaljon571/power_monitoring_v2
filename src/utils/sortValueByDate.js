const { all_short_name } = require("../global/file-path")
const { vectorMultiplyVoltage, vectorMultiplyCurrent, energyarchive } = require("../global/variable")

module.exports.sortvalueObjectsForVectorDiagram = async (parameters, query) => {
    try {
        const result = new Map()
        for (let parameter of parameters) {

            for (let valueObject of parameter.parameter_values) {
                if (result.has(new Date(valueObject.date).getTime())) {
                    //multiply values to TC and TT or unit
                    if (query.coefficient === true || query.coefficient === "true") {
                        valueObject = multiplyTcAndTT(parameter.multiply, parameter.param_details.param_short_name, valueObject)
                    }
                    let value = !parameter.sign || parameter.sign === true ? valueObject.value : -valueObject.value
                    let dateObject = result.get(new Date(valueObject.date).getTime())

                    if (dateObject[parameter.param_details.param_short_name]) {
                        dateObject[parameter.param_details.param_short_name].value = dateObject[parameter.param_details.param_short_name].value + value
                    } else {
                        dateObject[parameter.param_details.param_short_name] = {
                            value: value,
                            param_name: parameter.param_details.param_name,
                            date: new Date(valueObject.date).getTime()
                        }
                    }
                    result.set(new Date(valueObject.date).getTime(), dateObject)
                } else {

                    if (query.coefficient === true || query.coefficient === "true") {
                        valueObject = multiplyTcAndTT(parameter.multiply, parameter.param_details.param_short_name, valueObject)
                    }
                    let value = !parameter.sign || parameter.sign === true ? valueObject.value : -valueObject.value

                    let paramObject = {
                        [parameter.param_details.param_short_name]: {
                            value: value,
                            param_name: parameter.param_details.param_name,
                            date: new Date(valueObject.date).getTime()
                        }
                    }

                    result.set(new Date(valueObject.date).getTime(), paramObject)

                }
            }
        }

        return result
    } catch (err) {
        throw new CustomError(err.status, err.message)
    }
}

module.exports.sortvalueObjectsForGraphObjectCurrent = async (parameters, type='') => {
    try {
        const currentResult = new Map()
        for (let parameter of parameters) {
            for (let valueObject of parameter.parameter_values) {
                if (currentResult.has(new Date(valueObject.date).getTime())) {
                    //multiply values to TC and TT or unit
                    if(type === 'feeder') {
                        valueObject = multiplyTcAndTT(parameter.multiply, parameter.param_details.param_short_name, valueObject)
                    }
                    let value = !parameter.sign || parameter.sign === true ? valueObject.value : -valueObject.value
                    let dateObject = currentResult.get(new Date(valueObject.date).getTime())

                    if (dateObject[parameter.param_details.param_short_name]) {
                        dateObject[parameter.param_details.param_short_name].value = dateObject[parameter.param_details.param_short_name].value + value
                    } else {
                        dateObject[parameter.param_details.param_short_name] = {
                            value: value,
                            param_name: parameter.param_details.param_name,
                            date: new Date(valueObject.date).getTime()
                        }
                    }

                    currentResult.set(new Date(valueObject.date).getTime(), dateObject)
                } else {
                    if(type === 'feeder') {
                        valueObject = multiplyTcAndTT(parameter.multiply, parameter.param_details.param_short_name, valueObject)
                    }

                    let value = !parameter.sign || parameter.sign === true ? valueObject.value : -valueObject.value
                    let paramObject = {
                        [parameter.param_details.param_short_name]: {
                            value: value,
                            param_name: parameter.param_details.param_name,
                            date: new Date(valueObject.date).getTime()
                        }
                    }

                    currentResult.set(new Date(valueObject.date).getTime(), paramObject)

                }
            }
        }

        return currentResult
    } catch (err) {
        throw new CustomError(err.status, err.message)
    }
}

module.exports.sortvalueObjectsForGraphObjectArchive = async (parameters, type='') => {
    try {

        const archiveResult = new Map()
        for (let parameter of parameters) {
            for (let valueObject of parameter.parameter_values) {
                if (archiveResult.has(new Date(valueObject.date).getTime())) {
                    //multiply values to TC and TT or unit
                    if(type === 'feeder') {
                        valueObject = multiplyTcAndTT(parameter.multiply, parameter.param_details.param_short_name, valueObject)
                    }
                    let value = !parameter.sign || parameter.sign === true ? valueObject.value : -valueObject.value
                    let dateObject = archiveResult.get(new Date(valueObject.date).getTime())

                    if (dateObject[parameter.param_details.param_short_name]) {
                        dateObject[parameter.param_details.param_short_name].value = dateObject[parameter.param_details.param_short_name].value + value
                    } else {
                        dateObject[parameter.param_details.param_short_name] = {
                            value: value,
                            param_name: parameter.param_details.param_name,
                            date: new Date(valueObject.date).getTime()
                        }
                    }

                    archiveResult.set(new Date(valueObject.date).getTime(), dateObject)
                } else {
                    if(type === 'feeder') {
                        valueObject = multiplyTcAndTT(parameter.multiply, parameter.param_details.param_short_name, valueObject)
                    }
                    let value = !parameter.sign || parameter.sign === true ? valueObject.value : -valueObject.value

                    let paramObject = {
                        [parameter.param_details.param_short_name]: {
                            value: value,
                            param_name: parameter.param_details.param_name,
                            date: new Date(valueObject.date).getTime()
                        }
                    }

                    archiveResult.set(new Date(valueObject.date).getTime(), paramObject)

                }
            }

        }
        return archiveResult

    } catch (err) {
        throw new CustomError(err.status, err.message)
    }
}

module.exports.sortvalueObjectsForList = async (parameters, type) => {
    try {
        let result = new Map()
        for (let parameter of parameters) {
            for (let valueObject of parameter.parameter_values) {
                if (result.has(new Date(valueObject.date).getTime())) {
                    if(type === 'feeder') {
                        valueObject = multiplyTcAndTT(parameter.multiply, parameter.param_details.param_short_name, valueObject)
                    }
                    let value = !parameter.sign || parameter.sign === true ? valueObject.value : -valueObject.value
                    let dateObject = result.get(new Date(valueObject.date).getTime())

                    if (dateObject[parameter.param_details.param_short_name]) {
                        if (valueObject.tariff && valueObject.tariff !== 0) {
                            if (dateObject[parameter.param_details.param_short_name][valueObject.tariff]) {
                                dateObject[parameter.param_details.param_short_name][valueObject.tariff].value = dateObject[parameter.param_details.param_short_name][valueObject.tariff].value + value
                            } else {
                                dateObject[parameter.param_details.param_short_name][valueObject.tariff] = {
                                    value: value,
                                    param_name: parameter.param_details.param_name,
                                    date: new Date(valueObject.date).getTime()
                                }
                            }
                        } else {
                            if (dateObject[parameter.param_details.param_short_name].total) {
                                dateObject[parameter.param_details.param_short_name].total.value = dateObject[parameter.param_details.param_short_name].total.value + value
                            } else {
                                dateObject[parameter.param_details.param_short_name].total = {
                                    value: value,
                                    param_name: parameter.param_details.param_name,
                                    date: new Date(valueObject.date).getTime()
                                }
                            }
                        }
                    } else {
                        if (valueObject.tariff && valueObject.tariff !== 0) {
                            dateObject[parameter.param_details.param_short_name] = {
                                [valueObject.tariff]: {
                                    value: value,
                                    param_name: parameter.param_details.param_name,
                                    date: new Date(valueObject.date).getTime()
                                }
                            }
                        } else {
                            dateObject[parameter.param_details.param_short_name] = {
                                total: {
                                    value: value,
                                    param_name: parameter.param_details.param_name,
                                    date: new Date(valueObject.date).getTime()
                                }
                            }
                        }

                    }

                    result.set(new Date(valueObject.date).getTime(), dateObject)
                } else {
                    if(type === 'feeder') {
                        valueObject = multiplyTcAndTT(parameter.multiply, parameter.param_details.param_short_name, valueObject)
                    }
                    let value = !parameter.sign || parameter.sign === true ? valueObject.value : -valueObject.value

                    let paramObject = {
                        [parameter.param_details.param_short_name]: {
                            [valueObject.tariff && valueObject.tariff !== 0 ? valueObject.tariff : "total"]: {
                                value: value,
                                param_name: parameter.param_details.param_name,
                                date: new Date(valueObject.date).getTime()
                            }

                        }
                    }
                    result.set(new Date(valueObject.date).getTime(), paramObject)
                }
            }
        }
        return result
    } catch (err) {
        throw new CustomError(err.status, err.message)
    }
}

module.exports.sortvalueObjectsForFirstReport =  (parameters, tariffs) => {
    try {
        let sampleObject = { first_tariff: 123, second_tariff: 1234, third_tariff: 543, fourth_tariff: 652, general_aplus: 900, general_rplus: 500 }
        //6-9,9-17,17-22,22-6      
        const result = new Map()
        for (let parameter of parameters) {
            for (let valueObject of parameter.parameter_values) {
                let currentElementDate = new Date(valueObject.date)
                let currentElementKey = new Date(currentElementDate.getFullYear(), currentElementDate.getMonth(), currentElementDate.getDate()).getTime()
                if (result.has(currentElementKey)) {
                    valueObject = multiplyTcAndTT(parameter.multiply, parameter.param_details.param_short_name, valueObject)
                    let lastObject = result.get(currentElementKey)
                    if (parameter.param_details.param_short_name === energyarchive[0]) {
                        if (currentElementDate.getHours() > 6 && currentElementDate.getHours() <= 9) {
                            lastObject.first_tariff = lastObject.first_tariff + valueObject.value
                        } else if (currentElementDate.getHours() > 9 && currentElementDate.getHours() <= 17) {
                            lastObject.second_tariff = lastObject.second_tariff + valueObject.value
                        } else if (currentElementDate.getHours() > 17 && currentElementDate.getHours() <= 22) {
                            lastObject.third_tariff = lastObject.third_tariff + valueObject.value
                        } else {
                            lastObject.fourth_tariff = lastObject.fourth_tariff + valueObject.value
                        }
                        lastObject.general_aplus = lastObject.general_aplus + valueObject.value
                    } else if (parameter.param_details.param_short_name === energyarchive[2]) {
                        lastObject.general_rplus = lastObject.general_rplus + valueObject.value
                    }
                    result.set(currentElementKey, lastObject)
                } else {
                    valueObject = multiplyTcAndTT(parameter.multiply, parameter.param_details.param_short_name, valueObject)
                    let lastObject = { first_tariff: 0, second_tariff: 0, third_tariff: 0, fourth_tariff: 0, general_aplus: 0, general_rplus: 0 }
                    if (parameter.param_details.param_short_name === energyarchive[0]) {
                        if (currentElementDate.getHours() > 6 && currentElementDate.getHours() <= 9) {
                            lastObject.first_tariff = lastObject.first_tariff + valueObject.value
                        } else if (currentElementDate.getHours() > 9 && currentElementDate.getHours() <= 17) {
                            lastObject.second_tariff = lastObject.second_tariff + valueObject.value
                        } else if (currentElementDate.getHours() > 17 && currentElementDate.getHours() <= 22) {
                            lastObject.third_tariff = lastObject.third_tariff + valueObject.value
                        } else {
                            lastObject.fourth_tariff = lastObject.fourth_tariff + valueObject.value
                        }
                        lastObject.general_aplus = lastObject.general_aplus + valueObject.value
                    } else if (parameter.param_details.param_short_name === energyarchive[2]) {
                        lastObject.general_rplus = lastObject.general_rplus + valueObject.value
                    }
                    result.set(currentElementKey, lastObject)
                }
            }
        }


         return result
    } catch (err) {
        throw new CustomError(err.status, err.message)
    }
}

const parameterShortNamesList = all_short_name()

function multiplyTcAndTT(multiply, name, valueObject) {
    if(parameterShortNamesList.includes(name)) {
        multiply.map(element => valueObject.value = Math.round(valueObject.value * element * 1000) / 1000)
    } else if (vectorMultiplyVoltage.includes(name)){
        if (multiply && multiply[1]) {
            valueObject.value = Math.round(valueObject.value * multiply[1] * 1000) / 1000
        }
    } else if (vectorMultiplyCurrent.includes(name)){
        if (multiply && multiply[0]) {
            valueObject.value = Math.round(valueObject.value * multiply[0] * 1000) / 1000
        }
    }
    
    return valueObject
}