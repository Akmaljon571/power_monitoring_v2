module.exports.socketIO = (io) => {
    // io.on("connection", (socket) => {
    //     console.log('A user connected');

    //     socket.on("call_user", async ({ stol_id }) => {

    //         socket.emit("call_user_ofisiant", { stol_id, status: 200 });
    //     });

    //     socket.on("disconnect", () => {
    //         console.log('User disconnected');
    //     });
    // });
};

module.exports.sendMessageFN = (io) => {
    return (id, status, where) => {
        console.log(id, status, where)
        io.emit("send_message", { id, status });
    }
}

module.exports.realTimeFN = (io) => {
    return (data) => {
        console.log(data)
        io.emit("real-time", { data });
    }
}
