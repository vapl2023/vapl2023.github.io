"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const config_1 = require("./lib/config");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, { cors: { origin: "*" } });
const names = {};
const states = {};
io.on("connection", socket => {
    console.log("user connected");
    socket.on("disconnecting", () => {
        if (names[socket.id]) {
            socket.rooms.forEach(room => {
                if (states[room])
                    delete states[room][names[socket.id]];
            });
        }
        else {
            socket.rooms.forEach(room => {
                if (states[room])
                    delete states[room];
            });
        }
        delete names[socket.id];
    });
    socket.on("disconnect", () => {
        console.log("user disconnected");
    });
    socket.on("join", ({ name, room }) => {
        if (!states[room]) {
            socket.emit("join_noroom");
            return;
        }
        if (Object.values(names).indexOf(name) != -1) {
            socket.emit("join_reject");
            return;
        }
        names[socket.id] = name;
        states[room][name] = 0;
        socket.join(room);
        socket.emit("join_accept");
        socket.emit("state", states[room]);
    });
    socket.on("click", (room) => {
        states[room][names[socket.id]]++;
    });
    socket.on("bully", (room) => {
        states[room][names[socket.id]] += config_1.BULLY_GET;
        const random = [];
        const tmp = Object.keys(states[room]);
        tmp.splice(tmp.indexOf(names[socket.id]), 1);
        let n = Math.ceil(tmp.length / 2);
        while (n--) {
            const i = Math.floor(Math.random() * tmp.length);
            random.push(tmp[i]);
            tmp.splice(i, 1);
        }
        for (const user of random) {
            states[room][user] -= config_1.BULLY_TAKE;
            if (states[room][user] < 0)
                states[room][user] = 0;
        }
    });
    socket.on("host", (room) => {
        if (states[room]) {
            socket.emit("host_reject");
            return;
        }
        states[room] = {};
        socket.join(room);
        socket.emit("host_accept");
    });
    socket.on("start", (room) => {
        io.to(room).emit("countdown");
    });
});
server.listen(8080, () => {
    console.log(`listening on port 8080`);
});
setInterval(() => {
    for (const room in states) {
        io.to(room).emit("state", states[room]);
    }
}, 1000);
