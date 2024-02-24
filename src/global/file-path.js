const path = require('path')
const fs = require('fs')

module.exports.paramsReadFile = (type) => {
    const filePath = path.join(__dirname, '..', 'server', 'queries', 'params', type+'.json')
    const data = JSON.parse(fs.readFileSync(filePath))
    return data[0]
}

module.exports.paramsOBISReadFile = (type) => {
    const filePath = path.join(__dirname, '..', 'server', 'queries', 'params', type+'.json')
    const data = JSON.parse(fs.readFileSync(filePath))[0]
    return Object.values(data)
}

module.exports.params_short_name_read = (type) => {
    const filePath = path.join(__dirname, '..', 'server', 'queries', 'params', type+'.json')
    const data = JSON.parse(fs.readFileSync(filePath))[0]
    return Object.keys(data)
}

module.exports.all_short_name = () => {
    const filePath = path.join(__dirname, 'all_short_name.json')
    return JSON.parse(fs.readFileSync(filePath))
}

module.exports.paramsIndex2 = (type) => {
    const filePath = path.join(__dirname, '..', 'server', 'queries', 'params', type+'.json')
    const data = JSON.parse(fs.readFileSync(filePath))
    return data[1]
}
