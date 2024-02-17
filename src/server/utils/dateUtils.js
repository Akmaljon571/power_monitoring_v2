module.exports = {
    dateConvertor,
    getDaysArray
}

function dateConvertor(data, compareData, format = 'MM.DD.YY') {
    const yyyy = format.includes('YYYY');
    const pad2 = (n) => n.toString().padStart(2, '0');
    const getDatePart = (dateArray, startIndex) => ({
        [yyyy ? 'YYYY' : 'YY']: yyyy ? dateArray[startIndex] : String(dateArray[startIndex]).match(/.{1,2}/g)[1],
        MM: pad2(dateArray[startIndex + 1]),
        DD: pad2(dateArray[startIndex + 2]),
        hh: pad2(0),
        mm: pad2(0),
        ss: pad2(0),
    });
    const map = getDatePart(data, 0);
    const map2 = getDatePart(data, 3);
    const formatDate = (map) => Object.entries(map).reduce((prev, [key, value]) => prev.replace(key, value), format);
    let date = {
        from: formatDate(map),
        to: formatDate(map2)
    };
    if (compareData) { 
        let sortedData = { date: [], index: [] };
        for (let i in compareData) {
            const compareDate = reverseDatePlace(compareData[i]);
            if (Date.parse(date.from) <= Date.parse(compareDate) && Date.parse(compareDate) <= Date.parse(date.to)) {
                sortedData.index.push(i);
                sortedData.date.push(compareData[i]);
            }
        }
        return sortedData;
    }
    return date;
}

function reverseDatePlace(str) {
    let [day, month, year] = str.split('.');
    return `${month}.${day}.${year}`;
}

function getDaysArray(start, end, format = 'DD.MM.YY') {
    const yyyy = format.includes('YYYY');
    const arr = [];
    for (let dt = new Date(start); dt <= new Date(end); dt.setDate(dt.getDate() + 1)) {
        const date = new Date(dt);
        const fullYear = date.getFullYear();
        const year = yyyy ? fullYear : `${fullYear}`.match(/.{1,2}/g)[1];
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const formattedDate = format
        .replace(yyyy ? 'YYYY' : 'YY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('hh', '00')
        .replace('mm', '00')
        .replace('ss', '00');
        arr.push(formattedDate);
    }
    return arr;
}