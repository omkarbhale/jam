require("dotenv").config()
const express = require("express");
const app = express();
const server = require('http').createServer(app);
const cors = require('cors');
const bodyParser = require('body-parser');
const { Server } = require('socket.io');
const io = new Server(server, {
    cors: {
        origin: '*'
    }
});
const connectDB = require('./src/db/connect.js');

app.use(bodyParser.json({ limit: '50mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

app.get('/', (req, res, next) => {
    res.send('jam backend hosted here');
});

const canvasRouter = require('./src/routes/canvas.js');
app.use('/canvas', canvasRouter);

const { cursorMoveEvent, newStrokeEvent, currentStrokeEvent, changeImageEvent } = require("./src/sockets/sockets.js");
io.on('connection', (socket) => {
    // console.log(`${socket.id} connected`);

    cursorMoveEvent(io, socket);
    newStrokeEvent(io, socket);
    currentStrokeEvent(io, socket);
    changeImageEvent(io, socket);
    
    socket.on('disconnect', () => {
        // console.log(`${socket.id} disconnected`);
    })
});

const run = async () => {
    await connectDB();
    server.listen(process.env.PORT, () => {
        console.log('listening on ' + process.env.PORT)
    });
}
run();