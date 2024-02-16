const { Router } = require("express");
const { adminToken_superToken } = require("../../middleware/admin_or_super_token");
const { validateQuery } = require("../../middleware/validateQuery");
const { getSingleFolder, getListFolders, createFolder } = require("../../controller/server/folder");
const { folderGetJoi, folderCreateJoi } = require("../../validation/folder");
const { validate } = require("../../middleware/validate");

module.exports.folderRouter = Router()
    .get('/list', adminToken_superToken, validateQuery(folderGetJoi), getListFolders)
    .get('/one/:id', adminToken_superToken, getSingleFolder)
    .post('/create', adminToken_superToken, validate(folderCreateJoi), createFolder)
