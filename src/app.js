const express = require('express')
const http = require('http')
const cors = require('cors')
const { Server } = require('socket.io')
const { connectDB } = require('./utils/connect_db')
const { router } = require('./router')
const { socketIO } = require('./web/socket')
const cookieParser = require('cookie-parser')
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

app.use(cors({
    origin: 'http://127.0.0.1:5500',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(router);
app.use((err, req, res, next) => {
    console.log(err)
    console.log(req.body)
    res.status(err.status).json({ status: err.status, error: err.message, data: null });
});

socketIO(io);

connectDB(server, PORT, DB).then(() => { });