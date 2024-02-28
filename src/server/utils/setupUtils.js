const meterSetUp = reqData => ({
	serialPortSettings: {
		path: reqData.commDetail1,
		baudRate: reqData.commDetail2,
		dataBits: reqData.dataBit,
		stopBits: reqData.stopBit,
		parity: reqData.parity,
		autoOpen: false,
	},
	tcpConnectionSettings: {
		host: reqData.commDetail1,
		port: reqData.commDetail2,
		tcp: true,
	},
	meterOptions: {
		address: reqData.MeterAddress || '',
		password: reqData.MeterPassword,
		meterType: reqData.MeterType,
		connectionType: reqData.commMedia,
	},
})

const checkTCPConnection = port => port.tcp || false

module.exports = {
    meterSetUp,
    checkTCPConnection
}
