import { socket } from "./lib/client";

const lobbyView = document.getElementById("lobby") as HTMLElement;
const nameInput = document.getElementById("name") as HTMLInputElement;
const roomInput = document.getElementById("room") as HTMLInputElement;
const joinButton = document.getElementById("join") as HTMLButtonElement;
const gameView = document.getElementById("game") as HTMLElement;
const scoreboadContainer = document.getElementById("scoreboard") as HTMLElement;
const clickButton = document.getElementById("click") as HTMLButtonElement;
const bullyButton = document.getElementById("bully") as HTMLButtonElement;
const hostView = document.getElementById("host") as HTMLElement;
const startButton = document.getElementById("start") as HTMLButtonElement;
const hostScoreboardContainer = document.getElementById(
	"host-scoreboard"
) as HTMLElement;

const params = new URLSearchParams(window.location.search);
const host = params.get("host");
let isHosting = false;

if (host) socket.emit("host", host);

gameView.hidden = true;
hostView.hidden = true;

let name = "";
let room = "";

joinButton.onclick = () => {
	if (!nameInput.value || !roomInput.value) return;

	socket.emit("join", { name: nameInput.value, room: roomInput.value });
	name = nameInput.value;
	room = roomInput.value;
};

clickButton.onclick = () => {
	socket.emit("click", room);
};

bullyButton.onclick = () => {
	socket.emit("bully", room);
	bullyButton.disabled = true;

	setTimeout(() => {
		bullyButton.disabled = false;
	}, 1000);
};

startButton.onclick = () => {
	socket.emit("start", host);
};

socket.on("host_accept", () => {
	lobbyView.hidden = true;
	hostView.hidden = false;

	isHosting = true;
});

socket.on("host_reject", () => {
	alert("room is already being hosted");
});

socket.on("join_accept", () => {
	lobbyView.hidden = true;
	gameView.hidden = false;
});

socket.on("join_noroom", () => {
	alert("Invalid room code");
});

socket.on("join_reject", () => {
	alert("Display name is already taken");
});

socket.on("state", (state: Record<string, number>) => {
	if (isHosting) {
	} else {
		while (scoreboadContainer.hasChildNodes())
			scoreboadContainer.removeChild(scoreboadContainer.lastChild as Node);

		const scores = Object.entries(state)
			.map(([user, score]) => ({
				user,
				score
			}))
			.sort((a, b) => b.score - a.score);

		for (const { user, score } of scores) {
			const card = document.createElement("div");
			card.innerText = `${user} | ${score}`;

			if (user === name) card.style.color = "blue";

			scoreboadContainer.appendChild(card);
		}
	}
});
