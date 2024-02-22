const path = require('path')
const fs = require('fs')

module.exports.paramsReadFile = (type) => {
    const filePath = path.join(__dirname, '..', 'server', 'params', type+'.json')
    const data = JSON.parse(fs.readFileSync(filePath))
    return data[0]
}

module.exports.paramsOBISReadFile = (type) => {
    const filePath = path.join(__dirname, '..', 'server', 'params', type+'.json')
    const data = JSON.parse(fs.readFileSync(filePath))
    return Object.values(data)
}

module.exports.params_short_name_read = (type) => {
    const filePath = path.join(__dirname, '..', 'server', 'params', type+'.json')
    const data = JSON.parse(fs.readFileSync(filePath))
    return Object.keys(data)
}

module.exports.params_short_name_read = (type) => {
    const filePath = path.join(__dirname, '..', 'server', 'params', type+'.json')
    const data = JSON.parse(fs.readFileSync(filePath))
    return data[1]
}
