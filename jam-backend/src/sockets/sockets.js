
const cursorMoveEvent = (io, socket) => {
    socket.on("cursor-move", (data) => {
        socket.broadcast.emit("cursor-move", data);
    })
}

const newStrokeEvent = (io, socket) => {
    socket.on("stroke-new", (stroke) => {
        socket.broadcast.emit("stroke-new", stroke);
    })
}

const currentStrokeEvent = (io, socket) => {
    socket.on("stroke-current", (data) => {
        socket.broadcast.emit("stroke-current", data);
    })
}

const changeImageEvent = (io, socket) => {
    socket.on("image-change", (base64) => {
        socket.broadcast.emit("image-change", base64);   
    })
}

module.exports = { cursorMoveEvent, newStrokeEvent, currentStrokeEvent, changeImageEvent};