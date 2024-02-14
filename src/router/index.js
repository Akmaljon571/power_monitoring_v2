const { Router } = require("express");

module.exports.router = Router()
    .get('/', (req, res) => {res.json('OK')})