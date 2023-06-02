import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server);

const states: Record<string, Record<string, number>> = {};

io.on("connection", socket => {
	console.log("user connected");

	socket.on("disconnect", () => {
		console.log("user disconnected");
	});

	socket.on("join", room => {
		if (!states[room]) states[room] = {};

		states[room][socket.id] = 0;
		console.table(states);
	});

	socket.on("click", room => {
		states[room][socket.id]++;
		console.table(states);
	});
});

server.listen(8080, () => {
	console.log("listening on port 8080");
});
