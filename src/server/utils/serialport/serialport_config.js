const { Socket } = require('net');
const { InterByteTimeoutParser } = require('@serialport/parser-inter-byte-timeout');
const { queryMaker, checkCrcIs } = require('../crc.js');

const socket = new Socket();

const openPort = (port) => {
    return new Promise((resolve, reject) => {
        if (!checkTCPConnection(port)) {
            port.open(err => {
                if (err) {
                    reject(err.message || 'connection error'); 
                } else {
                    resolve()
                }
            });
        } else {
            socket.connect(port, () => {
                resolve();
            });
            socket.on('error', err => {
                reject(
                    new Error(
                        `Failed to connect to ${port.host}:${port.port}. Error: ${err.message}`
                    )
                );
            });
        }
    });
};

const writeToPort = (data, port) => {
    return new Promise((resolve, reject) => {
        if (!checkTCPConnection(port)) {
            port.write(data, err => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        } else {
            socket.write(data, 'ascii', err => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        }
    });
};

const closePort = (port) => {
    return new Promise((resolve, reject) => {
        if (!checkTCPConnection(port)) {
            port.close(err => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
            port.removeAllListeners('end')
        } else {
            socket.end(err => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
            socket.removeAllListeners('end')
        }
    });
};

const waitForData = (port, timeout = 1600) => {
    return new Promise((resolve, reject) => {
        const dataHandler = data => {
            if (!checkTCPConnection(port)) {
                port.removeAllListeners('data')
            } else {
                socket.removeAllListeners('data')
            }
            resolve(data)
        };
        if (!checkTCPConnection(port)) {
            port.pipe(
                new InterByteTimeoutParser({
                    interval: 300,
                    maxBufferSize: 10000
                })
            ).once('data', dataHandler)
            // port.removeAllListeners('data')
            
            const timeoutId = setTimeout(() => {
                clearTimeout(timeoutId);
                reject(new Error('Timeout waiting for data'));
            }, timeout);
        } else {
            const parser = socket.pipe(
                new InterByteTimeoutParser({ interval: 100, maxBufferSize: 10000 })
            );
            parser.once('data', dataHandler);
            const timeoutId = setTimeout(() => {
                clearTimeout(timeoutId);
                reject(new Error('Timeout waiting for data'))
            }, timeout);
        }
    });
};

async function serialPortEngine(command, port, meterType) {
    try {
        let key = Object.keys(command)[0];
        let dataReq = queryMaker([...Object.values(command)[0]], meterType, command.crc);
        // console.log(key, dataReq);
        if (key == '0.3_closeCommand') {
            await writeToPort(dataReq, port);
            return { key, data: null };
        }
        await writeToPort(dataReq, port);
        let data = await waitForData(port);
        // let crcCheckValue
        // if (!['hashedPassword', 'password', 'version'].includes(key)) {
        //     crcCheckValue = checkCrcIs(data, key, dataReq)
        // }
        // if (crcCheckValue === false && meterType === undefined) {
        //     data = 'received data is corrup'
        // }
        return { key, data }
    } catch (err) {
        console.log(err)
        throw new Error('Error in serialport engine', err.message);
    }
}

function checkTCPConnection(port) {
    return port.tcp || false;
}

const setConfig = (reqData) => ({
    serialPort: {
        path: reqData.commDetail1,
        baudRate: reqData.commDetail2,
        dataBits: reqData.dataBit,
        stopBits: reqData.stopBit,
        parity: reqData.parity,
        autoOpen: false
    },
    tcpConnection: {
        host: reqData.commDetail1,
        port: reqData.commDetail2,
        tcp: true
    },
    setUp: {
        address: reqData.MeterAddress || '',
        password: reqData.MeterPassword,
        meterType: reqData.MeterType,
        connectionType: reqData.commMedia
    }
})

module.exports = {
    openPort,
    closePort,
    writeToPort,
    waitForData,
    setConfig,
    serialPortEngine
};
