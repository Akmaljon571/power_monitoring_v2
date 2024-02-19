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

module.exports.sendMessage = (io) => {
    return (id, status) => {
        console.log(id, status)
        io.on('connection', (socket) => {
            io.emit("send_message", { id, status });
        })
    }
}