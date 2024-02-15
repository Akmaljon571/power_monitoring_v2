const {meterModel} = require("./server_request/meter")
const {parameterValueModel} = require("./server_request/parameter_value")
const {parameterModel} = require("./server_request/parameter")
const {adminModel} = require("./admin")
const {electObjectModel} = require("./objects/elect_object")
const {calculationObjectModel} = require("./objects/calculation_object")
const {folderModel} = require("./server_request/folder")
const {uspdModel} = require("./server_request/uspd")
const {journalModel} = require("./server_request/journal")
const {billingModel} = require("./server_request/billing")
const {previousModel} = require('./server_request/previous_data')

module.exports = Object.freeze({
    meterModel,
    parameterModel,
    parameterValueModel,
    adminModel,
    electObjectModel,
    calculationObjectModel,
    folderModel,
    uspdModel,
    journalModel,
    billingModel,
    previousModel
})
