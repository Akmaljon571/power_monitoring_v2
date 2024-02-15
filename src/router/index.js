const { Router } = require("express");
const { loginRouter } = require("./auth/login");

module.exports.router = Router()
    .use('/', loginRouter)