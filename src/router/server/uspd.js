const { Router } = require("express");
const { adminToken_superToken } = require("../../middleware/admin_or_super_token");
const { createUspdServer, updateUspdServer } = require("../../controller/server/uspd");
const { validate } = require("../../middleware/validate");
const { uspdCreateJoi, uspdUpdateJoi } = require("../../validation/uspd");

module.exports.uspdRouter = Router()
    .post('/create', adminToken_superToken, validate(uspdCreateJoi), createUspdServer)
    .patch('/update/:id', adminToken_superToken, validate(uspdUpdateJoi), updateUspdServer)
