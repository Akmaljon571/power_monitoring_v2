const { paramsReadFile } = require("./file-path")

module.exports.vectorMultiplyVoltage = ['current_voltage_A', 'current_voltage_B', 'current_voltage_C']
module.exports.vectorMultiplyCurrent = ['current_current_A', 'current_current_B', 'current_current_C']
module.exports.energyarchive = ['energyarchive_A+', 'energyarchive_A-', 'energyarchive_R+', 'energyarchive_R-']
module.exports.energytotal = ['current_energytotal_A+', 'current_energytotal_A-', 'current_energytotal_R+', 'current_energytotal_R-']
module.exports.energyarchive_obis = ["4.8.1", "4.8.2", "4.8.3", "4.8.4"]
module.exports.realTimeVariable = ["current_active-power_total", "current_reactive-power_total", "current_full-power_total", "current_coef-active-power_total",]
