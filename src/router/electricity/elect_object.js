const { Router } = require("express");
const { adminToken_superToken } = require("../../middleware/admin_or_super_token");
const { validate } = require("../../middleware/validate");
const { validateQuery } = require("../../middleware/validateQuery");
const { getQuery, createElectFolder, createElectMeter, updateElectFolder, updateElectMeter, attachParamsElectJoi } = require("../../validation/elect_object");
const { getElectricityObjects, getSingleElectricityObject, listUseMeterElectFn, insertPapka, insertMeter, updateFolderFn, updateMeterFn, attachParamsElectFN, deleteElect } = require("../../controller/electricity/electricity_object");

module.exports.electRouter = Router()
    .get('/list', adminToken_superToken, getElectricityObjects)
    .get('/meter-use', adminToken_superToken, listUseMeterElectFn)
    .get('/single/:id', adminToken_superToken, validateQuery(getQuery), getSingleElectricityObject)
    .post('/create-folder', adminToken_superToken, validate(createElectFolder), insertPapka)
    .post('/create-meter', adminToken_superToken, validate(createElectMeter), insertMeter)
    .put('/update-folder/:id', adminToken_superToken, validate(updateElectFolder), updateFolderFn)
    .put('/update-meter/:id', adminToken_superToken, validate(updateElectMeter), updateMeterFn)
    .patch('/attach-params/:id', adminToken_superToken, validate(attachParamsElectJoi), attachParamsElectFN)
    .delete('/delete/:id', adminToken_superToken, deleteElect)
