const express = require('express')
const http = require('http')
const cors = require('cors')
const { Server } = require('socket.io')
const { connectDB } = require('./utils/connectDB')
const { socketIO } = require('./utils/socket')
const { router } = require('./router')
require('dotenv').config()

// import router from './router/index.js'

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

socketIO(io);

connectDB(server, PORT, DB).then(() => { });