const { Router } = require("express");
const { adminToken_superToken } = require("../../middleware/admin_or_super_token");
const { validateQuery } = require("../../middleware/validateQuery");
const { getFoldersList } = require("../../controller/server/folder");
const { folderGetJoi } = require("../../validation/folder");

module.exports.folderRouter = Router()
    .get('/list', adminToken_superToken, validateQuery(folderGetJoi), getFoldersList)
