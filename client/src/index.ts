import { socket } from "./lib/client";

const nameInput = document.getElementById("name") as HTMLInputElement;
const roomInput = document.getElementById("room") as HTMLInputElement;
const joinButton = document.getElementById("join") as HTMLButtonElement;
const scoreboadContainer = document.getElementById("scoreboard") as HTMLElement;
const buttonContainer = document.getElementById(
	"button-container"
) as HTMLElement;
const clickButton = document.getElementById("click") as HTMLButtonElement;
const bullyButton = document.getElementById("bully") as HTMLButtonElement;
const timeText = document.getElementById("time") as HTMLElement;
const scoreText = document.getElementById("score") as HTMLElement;
const hostScoreboardContainer = document.getElementById(
	"host-scoreboard"
) as HTMLElement;
const hostTimeText = document.getElementById("host-time") as HTMLElement;
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
let playing = false;
let time = 60;

joinButton.onclick = () => {
	if (isHosting) return;
	if (!nameInput.value || nameInput.value.length > 20) {
		alert("Name must be between 1 and 20 characters long");
		return;
	}
	if (!roomInput.value) {
		alert("Please provide a room code");
		return;
	}

	socket.emit("join", { name: nameInput.value, room: roomInput.value });
	name = nameInput.value;
	room = roomInput.value;
};

clickButton.onclick = () => {
	if (isHosting || !playing) return;

	socket.emit("click", room);
};

bullyButton.onclick = () => {
	if (isHosting || !playing) return;

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
	alert("Room is already being hosted");
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

		let first = true;
		for (const { user, score } of scores) {
			const card = document.createElement("div");
			card.innerText = `${user}: ${score}`;
			card.classList.add("card");

			if (first) {
				card.style.color = "#fab387";
				first = false;
			}

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

		let first = true;
		for (const { user, score } of scores) {
			const card = document.createElement("div");
			card.innerText = `${user}: ${score}`;
			card.classList.add("card");

			if (first) {
				card.style.color = "#fab387";
				first = false;
			}
			if (user === name) {
				card.style.color = "#a6e3a1";
				scoreText.innerText = `Score: ${score}`;
			}

			scoreboadContainer.appendChild(card);
		}
	}

	if (time > 0 && playing) {
		time--;
		(isHosting
			? hostTimeText
			: timeText
		).innerText = `Time: ${time.toString()}`;
	} else if (playing) {
		buttonContainer.style.display = "none";
		(isHosting ? hostTimeText : timeText).innerText = "Game over!";
		playing = false;
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
		playing = true;
		setView(isHosting ? "host" : "game");
	}, 4000);
});
