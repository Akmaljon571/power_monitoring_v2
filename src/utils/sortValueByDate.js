const { all_short_name } = require("../global/file-path")
const { vectorMultiplyVoltage, vectorMultiplyCurrent } = require("../global/variable")
const CustomError = require("./custom_error")

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

module.exports.sortvalueObjectsForGraphObjectCurrent = async (parameters, type = '') => {
    try {
        const currentResult = new Map()
        for (let parameter of parameters) {
            for (let valueObject of parameter.parameter_values) {
                if (currentResult.has(new Date(valueObject.date).getTime())) {
                    //multiply values to TC and TT or unit
                    if (type === 'feeder') {
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
                    if (type === 'feeder') {
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

module.exports.sortvalueObjectsForGraphObjectArchive = async (parameters, type = '') => {
    try {

        const archiveResult = new Map()
        for (let parameter of parameters) {
            for (let valueObject of parameter.parameter_values) {
                if (archiveResult.has(new Date(valueObject.date).getTime())) {
                    //multiply values to TC and TT or unit
                    if (type === 'feeder') {
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
                    if (type === 'feeder') {
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
                    if (type === 'feeder') {
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
                    if (type === 'feeder') {
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

const parameterShortNamesList = all_short_name()

function multiplyTcAndTT(multiply, name, valueObject) {
    if (parameterShortNamesList.includes(name)) {
        multiply.map(element => valueObject.value = Math.round(valueObject.value * element * 1000) / 1000)
    } else if (vectorMultiplyVoltage.includes(name)) {
        if (multiply && multiply[1]) {
            valueObject.value = Math.round(valueObject.value * multiply[1] * 1000) / 1000
        }
    } else if (vectorMultiplyCurrent.includes(name)) {
        if (multiply && multiply[0]) {
            valueObject.value = Math.round(valueObject.value * multiply[0] * 1000) / 1000
        }
    }

    return valueObject
}
