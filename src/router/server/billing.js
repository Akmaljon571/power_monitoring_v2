const { Router } = require("express");
const { getListBilling } = require("../../controller/server/billing");
const { adminToken_superToken } = require("../../middleware/admin_or_super_token");
const { validateQuery } = require("../../middleware/validateQuery");
const { billingGetJoi } = require("../../validation/billing");

module.exports.billingRouter = Router()
    .get('/', adminToken_superToken, validateQuery(billingGetJoi), getListBilling)
