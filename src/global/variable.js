const { paramsReadFile } = require("./file-path")

module.exports.vectorMultiplyVoltage = ['current_voltage_A', 'current_voltage_B', 'current_voltage_C']
module.exports.vectorMultiplyCurrent = ['current_current_A', 'current_current_B', 'current_current_C']
module.exports.energyarchive = ['energyarchive_A+', 'energyarchive_A-', 'energyarchive_R+', 'energyarchive_R-']
module.exports.energytotal = ['current_energytotal_A+', 'current_energytotal_A-', 'current_energytotal_R+', 'current_energytotal_R-']

module.exports.real_time_variable = (type) => {
    const all = paramsReadFile(type)
    return [all[this.energytotal[0]], all[this.energytotal[1]], all[this.energytotal[2]], all[this.energytotal[3]]]
}