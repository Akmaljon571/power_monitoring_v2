const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const { connectDB } = require('./utils/connect_db')
const { router } = require('./router')
const { startMiddleware } = require('./connection/index.js')
const { ErrorHandle } = require('./middleware/errorHandler.js')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 1000
const DB = process.env.DB

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(router);
app.use(ErrorHandle);

startMiddleware('run-app')
connectDB(app, PORT, DB).then(() => { });
