function getRequest(arr, key) {
    const fullVals = ['32', '74', 'b6', 'f8', '3a', '7c', 'be', 'f0'];
    const restVals = ['51', '91', 'd1', '11'];
    if (key === 'full') {
        let i = fullVals.indexOf(arr[8]);
        let j = parseInt(arr[arr.length - 4], 16) + 1;

        fullVals.length - 1 === i ? (i = 0) : i++;
        arr[8] = fullVals[i];
        arr[arr.length - 4] = `0${j.toString(16)}`;
    } else if (key === 'rest') {
        let i = restVals.indexOf(arr[arr.length - 4]);
        restVals.length - 1 === i ? (i = 0) : i++;
        arr[arr.length - 4] = restVals[i];
    }
    return TE_Command(arr);
}


console.log(getRequest([]));