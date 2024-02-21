module.exports.socketIO = (io) => {
    
};

module.exports.sendMessageFN = (io) => {
    return (id, status, where) => {
        console.log(id, status, where)
        io.emit("send_message", { id, status });
    }
}

module.exports.realTimeFN = (io) => {
    return (data) => {
        console.log(data, "real-time")
        io.emit("real-time", { data });
    }
}
