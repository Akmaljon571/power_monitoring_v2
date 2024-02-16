const { Router } = require("express");
const { loginRouter } = require("./auth/login");
const { adminRouter } = require("./admin/admin");
const { meterRouter } = require("./meter/meter");
const { notFound } = require("../controller");
const { billingRouter } = require("./server/billing");

module.exports.router = Router()
    .use('/', loginRouter)
    .use('/admin', adminRouter)
    .use('/meter', meterRouter)
    .use('/billing', billingRouter)
    .use('/*', notFound)
