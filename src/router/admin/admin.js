const { Router } = require("express");
const { createAdmin } = require("../../controller/admin/admin");
const { adminToken } = require("../../middleware/admin_token");
const {validate} = require("../../middleware/validate");
const { createAdminJoi } = require("../../validation/admin");

module.exports.adminRouter = Router()
    .post('/create', adminToken, validate(createAdminJoi), createAdmin)
    