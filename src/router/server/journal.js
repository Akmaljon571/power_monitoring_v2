const { Router } = require("express");
const { adminToken_superToken } = require("../../middleware/admin_or_super_token");
const { getLastInsertedJournal } = require("../../controller/server/journal");

module.exports.journalRouter = Router()
    .get('/last-inserted/:meter_id', adminToken_superToken, getLastInsertedJournal)
