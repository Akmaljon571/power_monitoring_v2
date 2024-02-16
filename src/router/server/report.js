const { Router } = require("express");
const { adminToken_superToken } = require("../../middleware/admin_or_super_token");
const { validateQuery } = require("../../middleware/validateQuery");
const { billingGetJoi } = require("../../validation/billing");
const { getFirstTemplateReport } = require("../../controller/server/report");

module.exports.reportRouter = Router()
    .get('/', adminToken_superToken, validateQuery(billingGetJoi), getFirstTemplateReport)
