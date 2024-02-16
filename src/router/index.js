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

module.exports.router = Router()
    .use('/', loginRouter)
    .use('/admin', adminRouter)
    .use('/meter', meterRouter)
    .use('/billing', billingRouter)
    .use('/folder', folderRouter)
    .use('/journal', journalRouter)
    .use('/uspd', uspdRouter)
    .use('/report', reportRouter)
    .use('/dashboard', dashboardRouter)
    .use('/*', notFound)
