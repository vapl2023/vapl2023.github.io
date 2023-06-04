import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

import { BULLY_GET, BULLY_TAKE } from "./lib/config";

const app = express();
const server = createServer(app);
const io = new Server(server);

const names: Record<string, string> = {};
const states: Record<string, Record<string, number>> = {};

io.on("connection", socket => {
	console.log("user connected");

	socket.on("disconnecting", () => {
		socket.rooms.forEach(room => {
			if (states[room]) delete states[room][names[socket.id]];
		});

		delete names[socket.id];
	});

	socket.on("disconnect", () => {
		console.log("user disconnected");
	});

	socket.on("join", ({ name, room }: { name: string; room: string }) => {
		if (Object.values(names).indexOf(name) != -1) {
			socket.emit("reject");
			return;
		}
		names[socket.id] = name;

		if (!states[room]) states[room] = {};

		states[room][name] = 0;
		socket.join(room);

		socket.emit("accept");
		socket.emit("state", states[room]);
	});

	socket.on("click", (room: string) => {
		states[room][names[socket.id]]++;
	});

	socket.on("bully", (room: string) => {
		states[room][names[socket.id]] += BULLY_GET;
		const random: string[] = [];
		const tmp = Object.keys(states[room]);
		tmp.splice(tmp.indexOf(names[socket.id]), 1);
		let n = Math.floor(tmp.length / 2);

		while (n--) {
			const i = Math.floor(Math.random() * tmp.length);
			random.push(tmp[i]);
			tmp.splice(i, 1);
		}

		for (const user of random) {
			states[room][user] -= BULLY_TAKE;
			if (states[room][user] < 0) states[room][user] = 0;
		}
	});
});

server.listen(8080, () => {
	console.log("listening on port 8080");
});

setInterval(() => {
	for (const room in states) {
		io.to(room).emit("state", states[room]);
	}
}, 1000);
