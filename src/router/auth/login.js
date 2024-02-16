const { Router } = require("express");
const { authorization } = require("../../controller/auth/login");

module.exports.loginRouter = Router()
    .post('/login', authorization)
