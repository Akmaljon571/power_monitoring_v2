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
                    if (parameter.param_details.param_short_name === "energyarchive_A+") {
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
                    } else if (parameter.param_details.param_short_name === "energyarchive_R+") {
                        lastObject.general_rplus = lastObject.general_rplus + valueObject.value
                    }
                    result.set(currentElementKey, lastObject)
                } else {
                    valueObject = multiplyTcAndTT(parameter.multiply, parameter.param_details.param_short_name, valueObject)
                    let lastObject = { first_tariff: 0, second_tariff: 0, third_tariff: 0, fourth_tariff: 0, general_aplus: 0, general_rplus: 0 }
                    if (parameter.param_details.param_short_name === "energyarchive_A+") {
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
                    } else if (parameter.param_details.param_short_name === "energyarchive_R+") {
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

const parameterShortNamesList = [
    'energyarchive_A+','energyarchive_A-','energyarchive_R+','energyarchive_R-',
    "frequency",'active-power_A','active-power_B', 'active-power_C',
    "coef-active-power_A","coef-active-power_B","coef-active-power_C","coef-active-power_total",
    "coef-reactive-power_A","coef-reactive-power_B","coef-reactive-power_C","coef-reactive-power_total",
    "coef-angel_A", "coef-angel_B", "coef-angel_C","coef-angel_AB", "coef-angel_BC", "coef-angel_CA",
    "total_A+_1", "total_A+_2", "total_A+_3", "total_A+_4",
    "total_A-_1", "total_A-_2", "total_A-_3", "total_A-_4",
    "total_R+_1", "total_R+_2", "total_R+_3", "total_R+_4",
    "total_R-_1", "total_R-_2", "total_R-_3", "total_R-_4",'reactive-power_A', 'reactive-power_B', 'active-power_total',
    'full-power_A','full-power_B','full-power_C','energytotal_A+_1','energytotal_A+_2','energytotal_A+_3','energytotal_A+_4',
    'energytotal_A-_1','energytotal_A-_2','energytotal_A-_3','energytotal_A-_4','energytotal_R+','energytotal_R-',
    'energytotal_R+_1','energytotal_R+_2','energytotal_R+_3','energytotal_R+_4','energytotal_R-_1','energytotal_R-_2',
    'energytotal_R-_3','energytotal_R-_4','energycurrent_A+','energycurrent_A-','energycurrent_R+','energycurrent_R-',
    'frequency',"coef-active-power_A",'reactive-power_C','reactive-power_total','full-power_total','energytotal_A+','energytotal_A-', ]

function multiplyTcAndTT(multiply, name, valueObject) {
    if(parameterShortNamesList.includes(name)) {
        multiply.map(element => valueObject.value = Math.round(valueObject.value * element * 1000) / 1000)
    } else if (['voltage_A','voltage_B','voltage_C'].includes(name)){
        if (multiply && multiply[1]) {
            valueObject.value = Math.round(valueObject.value * multiply[1] * 1000) / 1000
        }
    } else if (['current_A','current_B','current_C'].includes(name)){
        if (multiply && multiply[0]) {
            valueObject.value = Math.round(valueObject.value * multiply[0] * 1000) / 1000
        }
    }
    
    return valueObject
}