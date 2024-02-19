const express = require('express')
const http = require('http')
const cors = require('cors')
const { Server } = require('socket.io')
const { connectDB } = require('./utils/connect_db')
const { router } = require('./router')
const { socketIO, sendMessage, realTime } = require('./web/socket')
const cookieParser = require('cookie-parser')
const { getDataFromMiddleware } = require('./connection')
require('dotenv').config()

const app = express()
const server = http.createServer(app);
const PORT = process.env.PORT || 1000
const DB =process.env.DB

const io = new Server(server, {
    cors: {
        origin: "*",
        method: ["*"],
    },
});

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(router);
getDataFromMiddleware(sendMessage(io), realTime(io))

app.use((err, req, res, next) => {
    console.log(err)
    res.status(err.status).json({ status: err.status, error: err.message, data: null });
});

socketIO(io);

connectDB(server, PORT, DB).then(() => { });