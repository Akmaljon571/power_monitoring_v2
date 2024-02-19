const { Router } = require("express");
const { adminToken_superToken } = require("../../middleware/admin_or_super_token");
const { validateQuery } = require("../../middleware/validateQuery");
const { getGraphDataList, getGraphDataListCalculation } = require("../../controller/graphics/data_list");
const { grahpData, graphArchive } = require("../../validation/graph");
const { getGraphsAndObjectDataArchive, getGraphsAndObjectCurrent, getGraphsAndObjectDataCalculationArchive, getGraphsAndObjectDataCalculationCurrent } = require("../../controller/graphics/graphs_object_data");

module.exports.graphRouter = Router()
    .get('/data/:id', adminToken_superToken, validateQuery(grahpData), getGraphDataList)
    .get('/data-calculation/:id', adminToken_superToken, validateQuery(grahpData), getGraphDataListCalculation)
    .get('/data-archive/:id', adminToken_superToken, validateQuery(graphArchive), getGraphsAndObjectDataArchive)
    .get('/data-current/:id', adminToken_superToken, validateQuery(graphArchive), getGraphsAndObjectCurrent)
    .get('/calculation-archive/:id', adminToken_superToken, validateQuery(graphArchive), getGraphsAndObjectDataCalculationArchive)
    .get('/calculation-current/:id', adminToken_superToken, validateQuery(graphArchive), getGraphsAndObjectDataCalculationCurrent)
    