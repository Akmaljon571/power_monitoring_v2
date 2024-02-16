const { Router } = require("express");
const { getElectricityObjectsCalculation, getSingleElectricityObjectCalculation, insertPapkaCalculation, updateFolderCalculationFn, attachParamsCalculationFN, deleteCalculation } = require("../../controller/electricity/calculation_object");
const { adminToken_superToken } = require("../../middleware/admin_or_super_token");
const { creatCalculationFolder, updateCalculationFolder, attachParamsCalculationJoi } = require("../../validation/calculation_object");
const { validate } = require("../../middleware/validate");

module.exports.calculationRouter = Router()
    .get('/list', adminToken_superToken, getElectricityObjectsCalculation)
    .get('/single/:id', adminToken_superToken, getSingleElectricityObjectCalculation)
    .post('/create', adminToken_superToken, validate(creatCalculationFolder), insertPapkaCalculation)
    .put('/update/:id', adminToken_superToken, validate(updateCalculationFolder), updateFolderCalculationFn)
    .patch('/attach-params/:id', adminToken_superToken, validate(attachParamsCalculationJoi), attachParamsCalculationFN)
    .delete('/delete/:id', adminToken_superToken, deleteCalculation)
