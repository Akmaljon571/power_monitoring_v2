const { Router } = require("express");
const { adminToken_superToken } = require("../../middleware/admin_or_super_token");
const { validateQuery } = require("../../middleware/validateQuery");
const { vector } = require("../../validation/graph");
const { getVectorDiagramData, getVectorDiagramDataCalculation } = require("../../controller/graphics/vector_diagram");

module.exports.vectorRouter = Router()
    .get('/data/:id', adminToken_superToken, validateQuery(vector), getVectorDiagramData)
    .get('/caltulation/:id', adminToken_superToken, validateQuery(vector), getVectorDiagramDataCalculation)
    