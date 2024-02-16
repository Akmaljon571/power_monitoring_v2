const { Router } = require("express");
const { adminToken_superToken } = require("../../middleware/admin_or_super_token");
const { validateQuery } = require("../../middleware/validateQuery");
const { getDashboardData, getDashboardRealtimeData, getDashboardDataCalculation, getDashboardRealtimeDataCalculation } = require("../../controller/graphics/dashboard");
const { dashboardDataJoi, dashboardRealTimeJoi, dashboardRealTimeCaltulationJoi } = require("../../validation/dashboard");

module.exports.dashboardRouter = Router()
    .get('/data/:id', adminToken_superToken, validateQuery(dashboardDataJoi), getDashboardData)
    .get('/real-time/:id', adminToken_superToken, validateQuery(dashboardRealTimeJoi), getDashboardRealtimeData)
    .get('/caltulation/:id', adminToken_superToken, validateQuery(dashboardDataJoi), getDashboardDataCalculation)
    .get('/realtime-caltulation/:id', adminToken_superToken, validateQuery(dashboardRealTimeCaltulationJoi), getDashboardRealtimeDataCalculation)
    