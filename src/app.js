const express = require('express')
const http = require('http')
const cors = require('cors')
const { Server } = require('socket.io')
const { connectDB } = require('./utils/connect_db')
const { router } = require('./router')
const { socketIO } = require('./web/socket')
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
app.use(router);
app.use((err, req, res, next) => {
    res.status(500).json({ status: 500, error: 'Something went wrong!', data: null });
});

socketIO(io);

connectDB(server, PORT, DB).then(() => { });