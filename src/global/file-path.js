const path = require('path')
const fs = require('fs')
const { meterListReadFile } = require('./meter-list')

module.exports.paramsReadFile = (type) => {
    const filePath = path.join(__dirname, '..', 'server', 'params', type+'.json')
    const data = JSON.parse(fs.readFileSync(filePath))
    return data[0]
}

module.exports.paramsOBISReadFile = (type) => {
    const filePath = path.join(__dirname, '..', 'server', 'params', type+'.json')
    const data = JSON.parse(fs.readFileSync(filePath))[0]
    return Object.values(data)
}

module.exports.params_short_name_read = (type) => {
    const filePath = path.join(__dirname, '..', 'server', 'params', type+'.json')
    const data = JSON.parse(fs.readFileSync(filePath))[0]
    return Object.keys(data)
}

module.exports.all_short_name = () => {
    const type = meterListReadFile()[0]
    const filePath = path.join(__dirname, '..', 'server', 'params', type+'.json')
    const data = JSON.parse(fs.readFileSync(filePath))[0]
    return Object.keys(data)
}

module.exports.paramsIndex2 = (type) => {
    const filePath = path.join(__dirname, '..', 'server', 'params', type+'.json')
    const data = JSON.parse(fs.readFileSync(filePath))
    return data[1]
}
