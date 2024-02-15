const { Router } = require("express");
const { adminToken } = require("../../middleware/admin_token");
const { validate } = require("../../middleware/validate");
const { createAdminJoi, validatorUpdateAdmin } = require("../../validation/admin");
const { createAdmin, listActive, updateAdmin, activeAdmin, deleteAdmin } = require("../../controller/admin/admin");

module.exports.adminRouter = Router()
    .get('/list', listActive)
    .post('/create', adminToken, validate(createAdminJoi), createAdmin)
    .patch('/update/:id', adminToken, validate(validatorUpdateAdmin), updateAdmin)
    .put('/activate/:id', adminToken, activeAdmin)
    .delete('/remove/:id', adminToken, deleteAdmin)
    