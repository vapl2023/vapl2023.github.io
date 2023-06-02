import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server);

io.on("connection", socket => {
	console.log("user connected");

	socket.on("disconnect", () => {
		console.log("user disconnected");
	});

	socket.on("ping", () => {
		console.log("ping!");
	});
});

server.listen(8080, () => {
	console.log("listening on port 8080");
});
