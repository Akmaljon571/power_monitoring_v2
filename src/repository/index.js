const {meterRepository} = require("./server_request/meter")
const {parameterValueRepository} = require("./server_request/parameter_value")
const {parameterRepository} = require("./server_request/parameter")
const {adminRepository} = require("./admin")
const {electObjectRepository} = require("./objects/elect_object")
const {calculationObjectRepository} = require("./objects/calculation_object")
const {folderObjectRepository}  = require("./server_request/folder")
const {uspdObjectRepository} = require("./server_request/uspd")
const {journalRepository} = require("./server_request/journal")
const {billingRepository} = require("./server_request/billing")
const {previousObjectRepository} = require('./server_request/previous_data')
const {authRepository} = require('./server_request/auth')

module.exports.repositories = function(){
    return Object.freeze({
        meterRepository,
        parameterRepository,
        parameterValueRepository,
        adminRepository,
        electObjectRepository,
        calculationObjectRepository,
        folderObjectRepository,
        uspdObjectRepository,
        journalRepository,
        billingRepository,
        previousObjectRepository,
        authRepository
    })
}
