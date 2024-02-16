const { Router } = require("express");
const { adminToken_superToken } = require("../../middleware/admin_or_super_token");
const { validateQuery } = require("../../middleware/validateQuery");
const { getGraphDataList, getGraphDataListCalculation } = require("../../controller/graphics/data_list");
const { grahpData } = require("../../validation/graph");

module.exports.graphRouter = Router()
    .get('/data/:id', adminToken_superToken, validateQuery(grahpData), getGraphDataList)
    .get('/data-caltulation/:id', adminToken_superToken, validateQuery(grahpData), getGraphDataListCalculation)
    