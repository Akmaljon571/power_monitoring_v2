const { Router } = require("express");
const { loginRouter } = require("./auth/login");
const { adminRouter } = require("./admin/admin");
const { meterRouter } = require("./meter/meter");
const { notFound } = require("../controller");

module.exports.router = Router()
    .use('/', loginRouter)
    .use('/admin', adminRouter)
    .use('/meter', meterRouter)
    .use('/*', notFound)