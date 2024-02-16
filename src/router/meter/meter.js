const { Router } = require("express");
const { createMeter, getListMeter, getOneMeter, updateMeter } = require("../../controller/meter/meter");
const { validate } = require("../../middleware/validate");
const { createMeterJoi, updateMeterJoi } = require("../../validation/meter");
const { adminToken_superToken } = require("../../middleware/admin_or_super_token");

module.exports.meterRouter = Router()
    .get('/list', adminToken_superToken, getListMeter)
    .get('/one/:id', adminToken_superToken, getOneMeter)
    .post('/create', adminToken_superToken, validate(createMeterJoi), createMeter)
    .patch('/update/:id', adminToken_superToken, validate(updateMeterJoi), updateMeter)
