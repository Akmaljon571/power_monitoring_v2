const { Router } = require("express");
const { adminToken_superToken } = require("../../middleware/admin_or_super_token");
const { validateQuery } = require("../../middleware/validateQuery");
const { getDashboardData, getDashboardDataCalculation, getRealTime } = require("../../controller/graphics/dashboard");
const { dashboardDataJoi } = require("../../validation/dashboard");
const { repositories } = require("../../repository");

module.exports.dashboardRouter = Router()
    .get('/data/:id', adminToken_superToken, validateQuery(dashboardDataJoi), getDashboardData)
    .get('/calculation/:id', adminToken_superToken, validateQuery(dashboardDataJoi), getDashboardDataCalculation)
    .get('/real-time/:id', adminToken_superToken, getRealTime)