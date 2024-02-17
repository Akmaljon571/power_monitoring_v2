const { Router } = require("express");
const { authorization } = require("../../controller/auth/login");
const { logout } = require("../../middleware/logout");
const { refresh_token } = require("../../middleware/refresh_token");
const { single } = require("../../middleware/single");

module.exports.loginRouter = Router()
    .post('/login', authorization)
    .post('/logout', logout)
    .post('/refresh_token', refresh_token)
    .get('/single', single)
