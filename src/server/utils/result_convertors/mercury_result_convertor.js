module.exports = { getMercuryResult }

function getMercuryResult(data, key, opt) {
    try {
        // if (data.toString().toLowerCase().includes('err')) {
        //     return { [key]: null };
        // }
        // let value = extractorFunc(data.toString())
        switch (key) {
        case 'currentDate':
            const mutatedData = data.map(item => item.toString(16).toUpperCase().slice(-4));
            const [_,second, minute, hour, week, day, month, year, timeZone] = mutatedData;
            const date = `${hour}:${minute}:${second} ${day}.${month}.${year}`;
            return {[key]:date};
        default:
            console.log(key, value)
        }
    } catch (error) {
        throw new Error(`Error in getMercuryResult function: ${error.message}`)
    }
}