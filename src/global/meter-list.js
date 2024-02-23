const path = require('path')
const fs = require('fs')

module.exports.meterListReadFile = () => {
    const filePath = path.join(__dirname, '..', 'server', 'queries', 'params', 'meter_list.json')
    return JSON.parse(fs.readFileSync(filePath))
}