const { Router } = require("express");
const { createMeter, getListMeter, getOneMeter, updateMeter, paramsList, meterList, createCOMMeter, updateCOMMeter, portList } = require("../../controller/meter/meter");
const { validate } = require("../../middleware/validate");
const { createMeterJoi, updateMeterJoi, createMeterCOMJoi, updateMeterCOMJoi } = require("../../validation/meter");
const { adminToken_superToken } = require("../../middleware/admin_or_super_token");
const { meterValidate } = require("../../middleware/meter.validate");

module.exports.meterRouter = Router()
    .get('/list', adminToken_superToken, getListMeter)
    .get('/one/:id', adminToken_superToken, getOneMeter)
    .get('/params/:type', adminToken_superToken, paramsList)
    .get('/meter-list', adminToken_superToken, meterList)
    .get('/port-list', adminToken_superToken, portList)
    .post('/create', adminToken_superToken, meterValidate(createMeterJoi), createMeter)
    .post('/create-com', adminToken_superToken, meterValidate(createMeterCOMJoi), createCOMMeter)
    .patch('/update-com/:id', adminToken_superToken, meterValidate(updateMeterCOMJoi), updateCOMMeter)
    .patch('/update/:id', adminToken_superToken, meterValidate(updateMeterJoi), updateMeter)
