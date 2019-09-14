// eslint-disable-next-line no-undef
const socket = io();
let timerFunc;
socket.on('begin', () => {
	startTimer();
});

socket.on('player_finished', (player) => {
	playerFinished(player);
});

socket.on('finished', (players) => {
	console.log(players);
	gameOver(players);
});
let beginTime = 0;
let players = [];
let results = [];
let history = [];
let resultsHTML = '';
let numPlayers = 1;
let playersRemaining = players.length;
const timers = document.getElementById('timers');

createPlayers(numPlayers);

document.getElementById('modal-save').addEventListener('click', () => {
	saveNames();
	modal.style.display = 'none';
});

document.getElementById('num-players').addEventListener('change', () => {
	numPlayers = document.getElementById('num-players').value;
	document.getElementById('results').innerHTML = resultsHTML = '';
	createPlayers(numPlayers);
});

document.getElementById('btnSimulate').addEventListener('click', () => {
	document.getElementById('num-players').disabled = true;
	document.getElementById('results').innerHTML = resultsHTML = '';
	socket.emit('simulate', { players, maxLength: 5 });
});

function createPlayers(num) {
	if (num <= players.length) {
		players = players.slice(0, num);
	} else {
		for (let index = players.length; index < num; index++) {
			let player = {
				name: 'Player ' + (index + 1),
				id: `player_${index + 1}`,
				time: '0:00.000',
				finished: false
			};
			players.push(player);
		}
	}
	playersRemaining = players.length;
	createTimers();
}

function createTimers() {
	let timerHTML = '';
	let modalInputs = '';
	players.forEach((player) => {
		index = players.indexOf(player) + 1;
		timerHTML += `<h2><label class="player-label" id="label-${index}" for="player_${index}">${player.name}</label><span class="time" id="player_${index}">0:00.00</span></h2>`;

		modalInputs += `<div class="modal-players"><label class="modal-label" for="edit-${index +
			1}">Player ${index}:&nbsp;</label><input type="text" name="edit-${index}" class="modal-textbox" id="edit-${index}" value="${player.name}"></div>`;
	});
	timers.innerHTML = timerHTML;
	document.getElementById('modal-boxes').innerHTML = modalInputs;
}

function saveNames() {
	let index = 0;
	players.forEach((player) => {
		const name = document.getElementById(`edit-${index + 1}`).value;
		if (name !== '') {
			player.name = name;
			document.getElementById(`label-${index + 1}`).innerText = name;
		}
		index++;
	});
}

function startTimer() {
	beginTime = new Date(Date.now()).getTime();
	timerFunc = setInterval(() => {
		const elapsed = new Date(Date.now()).getTime() - beginTime;
		const formattedTime = formatTime(elapsed);
		updateTimes(formattedTime);
	}, 10);
}

function updateTimes(newTime) {
	players.forEach((player) => {
		if (!player.finished) {
			player.time = newTime;
		}
		drawTime(player);
	});
}

function drawTime(player) {
	document.getElementById(player.id).innerHTML = player.time;
}

function formatTime(milli) {
	const minutes = Math.floor(milli / 1000 / 60).toString();
	const seconds = (Math.floor(milli / 1000) % 60).toString().padStart(2, '0');
	const ms = (milli % 1000).toString().padStart(3, '0');
	const time = `${minutes}:${seconds}.${ms}`;
	return time.slice(0, -1);
}

function playerFinished(player) {
	const idx = players.findIndex((x) => x.id === player.id);
	players[idx] = player;
	results.push(idx);
	playersRemaining--;
	if (!playersRemaining) {
		clearInterval(timerFunc);
	}
}

function gameOver(donePlayers) {
	donePlayers.forEach((player) => {
		drawTime(player);
	});
	results.forEach((idx) => {
		showResults(players[idx], results.indexOf(idx) + 1);
	});

	document.getElementById('num-players').disabled = false;
	document.getElementById('results').innerHTML = resultsHTML;
}

function showResults(player, rank) {
	resultsHTML += `<h2 class="h2-${rank}"><label class="player-label" for="rank-${rank}">${player.name}</label><span class="time" id="rank-${rank}">${player.time}</span></h2>`;
}

// Edit names Modal
const modal = document.getElementById('myModal');
const btn = document.getElementById('btnNames');
const span = document.getElementsByClassName('close')[0];
btn.onclick = function showModal() {
	modal.style.display = 'block';
};
window.onclick = function hideModal(event) {
	if (event.target === modal) {
		modal.style.display = 'none';
	}
};
