import { socket } from "./lib/client";

const ping = document.getElementById("ping") as HTMLButtonElement;

ping.onclick = () => {
	socket.emit("ping");
};
