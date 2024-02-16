const { Router } = require("express");
const { loginRouter } = require("./auth/login");
const { adminRouter } = require("./admin/admin");
const { meterRouter } = require("./meter/meter");
const { notFound } = require("../controller");
const { billingRouter } = require("./server/billing");
const { folderRouter } = require("./server/folder");
const { journalRouter } = require("./server/journal");
const { uspdRouter } = require("./server/uspd");
const { reportRouter } = require("./server/report");
const { dashboardRouter } = require("./graphics/dashboard");
const { graphRouter } = require("./graphics/graph");
const { vectorRouter } = require("./graphics/vector");
const { calculationRouter } = require("./electricity/calculation_object");

module.exports.router = Router()
    .use('/', loginRouter)
    .use('/admin', adminRouter)
    .use('/meter', meterRouter)
    .use('/billing', billingRouter)
    .use('/folder', folderRouter)
    .use('/journal', journalRouter)
    .use('/graph', graphRouter)
    .use('/uspd', uspdRouter)
    .use('/vector', vectorRouter)
    .use('/report', reportRouter)
    .use('/calculation', calculationRouter)
    .use('/dashboard', dashboardRouter)
    .use('/*', notFound)
