module.exports.getUspdDateFormat = (date, response_type) => {
        const receivedDate = new Date(date)
        const fullYear = receivedDate.getFullYear()
        const month = receivedDate.getMonth() + 1 > 9 ? receivedDate.getMonth() + 1 : ("0" + (receivedDate.getMonth() + 1))
        const day = receivedDate.getDate() > 9 ? receivedDate.getDate() : ("0" + receivedDate.getDate())
        const hour = receivedDate.getHours() > 9 ? receivedDate.getHours() : ("0" + receivedDate.getHours())
        const minute = receivedDate.getMinutes() > 9 ? receivedDate.getMinutes() : ("0" + receivedDate.getMinutes())
        const second = receivedDate.getSeconds() > 9 ? receivedDate.getSeconds() : ("0" + receivedDate.getSeconds())
        const formattedDate = "" + fullYear + month + day + hour + minute + second + ".000"

        return formattedDate
}       