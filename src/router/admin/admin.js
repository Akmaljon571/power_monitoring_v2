const { Router } = require("express");
const { createAdmin, listActive, updateAdmin } = require("../../controller/admin/admin");
const { adminToken } = require("../../middleware/admin_token");
const {validate} = require("../../middleware/validate");
const { createAdminJoi, validatorUpdateAdmin } = require("../../validation/admin");

module.exports.adminRouter = Router()
    // adminToken qoyiladi yoki yoq anniq emas get da
    .get('/list', listActive)
    .post('/create', adminToken, validate(createAdminJoi), createAdmin)
    .patch('/update/:id', adminToken, validate(validatorUpdateAdmin), updateAdmin)
    