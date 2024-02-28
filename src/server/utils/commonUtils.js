module.exports = {
    checkCounterType,
    unWrapObject
}

function checkCounterType(str, param) {
    if (typeof param === 'string') {
        return param.includes(str);
    } else {
        return param.meterType.includes(str);
    }
}

function unWrapObject(obj, key) {
    return { key: Object.keys(obj)[0], value: Object.values(obj)[0]}
}

