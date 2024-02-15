const { Router } = require("express");
const { createAdmin, listActive } = require("../../controller/admin/admin");
const { adminToken } = require("../../middleware/admin_token");
const {validate} = require("../../middleware/validate");
const { createAdminJoi } = require("../../validation/admin");

module.exports.adminRouter = Router()
    // adminToken qoyiladi yoki yoq anniq emas get da
    .get('/list', listActive)
    .post('/create', adminToken, validate(createAdminJoi), createAdmin)
    