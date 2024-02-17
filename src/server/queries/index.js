const CE_308 = require('./energomera/energomera_query_CE308.json')[0]
const CE_303 = require('./energomera/energomera_query_CE303.json')[0]
const CE_102M = require('./energomera/energomera_query_CE102M.json')[0]

const Mercury = require('./mercury/mercury.json')[0]

const TE_73CAS = require('./TE73_CAS/TE_73CAS.json')[0]
const Errors = require('./energomera/counterErrors.json')[0]

module.exports.queries = {
	CE_308,
	CE_303,
	CE_102M,
	Mercury,
	TE_73CAS,
	Errors
}