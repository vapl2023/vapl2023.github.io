import { socket } from "./lib/client";

const nameInput = document.getElementById("name") as HTMLInputElement;
const roomInput = document.getElementById("room") as HTMLInputElement;
const joinButton = document.getElementById("join") as HTMLButtonElement;
const scoreboadContainer = document.getElementById("scoreboard") as HTMLElement;
const clickButton = document.getElementById("click") as HTMLButtonElement;
const bullyButton = document.getElementById("bully") as HTMLButtonElement;
const hostScoreboardContainer = document.getElementById(
	"host-scoreboard"
) as HTMLElement;
const startButton = document.getElementById("start") as HTMLButtonElement;
const waiting = document.getElementById("waiting") as HTMLElement;
const countdown3 = document.getElementById("countdown-3") as HTMLElement;
const countdown2 = document.getElementById("countdown-2") as HTMLElement;
const countdown1 = document.getElementById("countdown-1") as HTMLElement;
const countdownGo = document.getElementById("countdown-go") as HTMLElement;

startButton.style.display =
	waiting.style.display =
	countdown3.style.display =
	countdown2.style.display =
	countdown1.style.display =
	countdownGo.style.display =
		"none";

const views = ["lobby", "game", "host", "ready", "countdown"];
const setView = (view: string) => {
	(document.getElementById(view) as HTMLElement).style.display = "flex";

	for (const v of views) {
		if (v !== view)
			(document.getElementById(v) as HTMLElement).style.display = "none";
	}
};

setView("lobby");

const params = new URLSearchParams(window.location.search);
const host = params.get("host");
let isHosting = false;

if (host) socket.emit("host", host);

let name = "";
let room = "";

joinButton.onclick = () => {
	if (!nameInput.value || !roomInput.value || isHosting) return;

	socket.emit("join", { name: nameInput.value, room: roomInput.value });
	name = nameInput.value;
	room = roomInput.value;
};

clickButton.onclick = () => {
	if (isHosting) return;

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
	if (!isHosting) return;

	socket.emit("start", host);
};

socket.on("host_accept", () => {
	setView("ready");

	isHosting = true;
	startButton.style.display = "block";
});

socket.on("host_reject", () => {
	alert("room is already being hosted");
});

socket.on("join_accept", () => {
	setView("ready");

	waiting.style.display = "block";
});

socket.on("join_noroom", () => {
	alert("Invalid room code");
});

socket.on("join_reject", () => {
	alert("Display name is already taken");
});

socket.on("state", (state: Record<string, number>) => {
	if (isHosting) {
		while (hostScoreboardContainer.hasChildNodes())
			hostScoreboardContainer.removeChild(
				hostScoreboardContainer.lastChild as Node
			);

		const scores = Object.entries(state)
			.map(([user, score]) => ({
				user,
				score
			}))
			.sort((a, b) => b.score - a.score);

		for (const { user, score } of scores) {
			const card = document.createElement("div");
			card.innerText = `${user} | ${score}`;

			hostScoreboardContainer.appendChild(card);
		}
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

socket.on("countdown", () => {
	setView("countdown");
	countdown3.style.display = "block";

	setTimeout(() => {
		countdown3.style.display = "none";
		countdown2.style.display = "block";
	}, 1000);

	setTimeout(() => {
		countdown2.style.display = "none";
		countdown1.style.display = "block";
	}, 2000);

	setTimeout(() => {
		countdown1.style.display = "none";
		countdownGo.style.display = "block";
	}, 3000);

	setTimeout(() => {
		countdownGo.style.display = "none";
		setView(isHosting ? "host" : "game");
	}, 4000);
});
