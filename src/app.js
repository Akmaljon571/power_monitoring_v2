const http = require('http')
const { Server } = require('socket.io');
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const { connectDB } = require('./utils/connect_db')
const { router } = require('./router')
const { startMiddleware } = require('./connection/index.js')
const { ErrorHandle } = require('./middleware/errorHandler.js')
require('dotenv').config()

const app = express()
const server = http.createServer(app);
const PORT = process.env.PORT || 1000
const DB = process.env.DB

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
app.use(ErrorHandle);

const realTime = (data) => {
    // console.log(data, "real-time")
    io.emit("real-time", { data });
}

const sendMessage = (id, status, where) => {
    console.log(id, status, where)
    io.emit("send-message", { id, status, where });
}

startMiddleware('run-app', sendMessage, realTime).catch(console.log);
connectDB(server, PORT, DB).then(() => {})
