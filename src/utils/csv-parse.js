module.exports.csvParser = (response, channelParameters,req_type) => {
    let parameter_value = []
    let commonDate
    response
        .split("\n")
        .map((line, index) => {
            if (index === 0) return;
            const row = line.trim().split(",")
            if (channelParameters.get(row[0].trim())) {
                //row index is taken according to documentation
                const value = Number(Number(row[2].trim()).toFixed(4))
                //time is changing from dd-mm-YYYY HH:MM:SS to YYYY-mm-dd HH:MM:SS
                const [paramDate, paramTime] = row[1].trim().split(" ")
                const [day, month, year] = paramDate.split("-")
                let date = new Date(year + "-" + month + "-" + day + " " + paramTime.slice(0, paramTime.length - 2))
                const parameter = channelParameters.get(row[0].trim())._id
                const state = row[3].trim()
                //if difference bigger than 10 seconds then put original value else common value only in current requests
                const biggestDifference = 10000
                if (req_type === "current" && !commonDate) {
                    commonDate = date
                } else if (req_type === "current" && Math.abs(new Date(commonDate).getTime() - date.getTime()) < biggestDifference) {
                    date = commonDate
                }
                let paramObject = { value, date, parameter, state }
                if (row[4]) {
                    paramObject.tariff = Number(row[4].trim())
                }
                parameter_value.push(paramObject)
            }
        })

    return [...parameter_value]
}

module.exports.csvParserArchiveCurrent = (response, channelParameters) =>{
    let parameter_value = new Map()
    response
        .split("\n")
        .map((line, index) => {
            if (index === 0) return;
            const row = line.trim().split(",")
            if (channelParameters.get(row[0].trim())) {
                //row index is taken according to documentation
                const value = Number(Number(row[2].trim()).toFixed(4))
                //time is changing from dd-mm-YYYY HH:MM:SS to YYYY-mm-dd HH:MM:SS
                const [paramDate, paramTime] = row[1].trim().split(" ")
                const [day, month, year] = paramDate.split("-")
                let date = new Date(year + "-" + month + "-" + day + " " + paramTime.slice(0, paramTime.length - 2))
                const parameter = channelParameters.get(row[0].trim())._id
                const state = row[3].trim()
                let paramObject = { value, date, parameter, state }
                if (row[4]) {
                    paramObject.tariff = Number(row[4].trim())
                }
                let parameterKey = "" + year + month
                if(parameter_value.has(parameterKey)){
                    parameter_value.set(parameterKey,[...parameter_value.get(parameterKey),paramObject])
                }else{
                    parameter_value.set(parameterKey,[paramObject])
                }
            }
        })

    return parameter_value
}