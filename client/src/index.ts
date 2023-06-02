import { socket } from "./lib/client";

const lobbyView = document.getElementById("lobby") as HTMLElement;
const roomInput = document.getElementById("room") as HTMLInputElement;
const joinButton = document.getElementById("join") as HTMLButtonElement;
const gameView = document.getElementById("game") as HTMLElement;
const clickButton = document.getElementById("click") as HTMLButtonElement;

gameView.hidden = true;

let room = "";

joinButton.onclick = () => {
	if (!roomInput.value) return;

	socket.emit("join", roomInput.value);
	room = roomInput.value;

	lobbyView.hidden = true;
	gameView.hidden = false;
};

clickButton.onclick = () => {
	socket.emit("click", room);
};
