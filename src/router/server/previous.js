const { Router } = require("express");
const { adminToken_superToken } = require("../../middleware/admin_or_super_token");

module.exports.journalRouter = Router()
    .get('/previous', adminToken_superToken, )
