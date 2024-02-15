const { Router } = require("express");
const { loginRouter } = require("./auth/login");
const { adminRouter } = require("./admin/admin");

module.exports.router = Router()
    .use('/', loginRouter)
    .use('/admin', adminRouter)
