const { repositories } = require("../repository");

module.exports.filterPrevious = async() => {
    try {
        const yesterday = new Date();
        yesterday.setUTCHours(0, 0, 0, 0)
        yesterday.setDate(new Date().getDate() - 1)
        console.log(yesterday)

        const meters = await repositories().previousObjectRepository().findAll()
        const a = meters.filter(e => e.archive - yesterday < 0 || e.billing - yesterday < 0)
        
        return a.length
    } catch (error) {
        console.log(error)
    }
}

module.exports.previousCheking = async() => {
    try {
        console.log('Shunaqa')
    } catch (error) {
        console.log(error)
    }
}