const { Router } = require("express");
const { createMeter } = require("../../controller/meter/meter");
const { validate } = require("../../middleware/validate");
const { createMeterJoi } = require("../../validation/meter");

module.exports.meterRouter = Router()
    .post('/create', validate(createMeterJoi), createMeter)