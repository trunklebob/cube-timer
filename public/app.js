var socket = io();
var timerFunc;
socket.on('begin', (data) => {
	startTimer();
});

socket.on('player_finished', (player) => {
	playerFinished(player);
});
let beginTime = 0;
let players = [];
let numPlayers = 1;
let playersRemaining = players.length;
const timers = document.getElementById('timers');

createTimers(numPlayers);

document.getElementById('num-players').addEventListener('change', () => {
	numPlayers = document.getElementById('num-players').value;
	createTimers(numPlayers);
});

document.getElementById('btnSimulate').addEventListener('click', () => {
	document.getElementById('num-players').disabled = true;
	socket.emit('simulate', { players: players, maxLength: 30 }, (data) => {
		console.log(data);
	});
});

function createTimers(num) {
	let timerHTML = '';
	let modalInputs = '';
	players = [];
	for (let index = 1; index <= num; index++) {
		let player = { name: 'Player ' + index, id: `player_${index}`, time: '0:00.000', finished: false };
		players.push(player);
		timerHTML += `<h2><label class="player-label" id="label-${index}" for="player_${index}">Player ${index}</label><span class="time" id="player_${index}">0:00.00</span></h2>`;

		modalInputs += `<div class="modal-players"><label class="modal-label" for="edit-${index}">Player ${index}:&nbsp;</label><input type="text" name="edit-${index}" class="modal-textbox" id="edit-${index}"></div>`;
	}
	console.log(players);
	playersRemaining = players.length;
	timers.innerHTML = timerHTML;
	document.getElementById('modal-boxes').innerHTML = modalInputs;
	document.getElementById('modal-save').addEventListener('click', () => {
		saveNames();
		modal.style.display = 'none';
	});
}

function saveNames() {
	let index = 0;
	players.forEach((player) => {
		let name = document.getElementById(`edit-${index + 1}`).value;
		if (name != '') {
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
	const time = minutes + ':' + seconds + '.' + ms;
	return time.slice(0, -1);
}

function playerFinished(player) {
	const idx = players.findIndex((x) => {
		return x.id === player.id;
	});
	players[idx] = player;
	playersRemaining--;
	if (!playersRemaining) {
		clearInterval(timerFunc);
	}
}

// Edit names Modal
var modal = document.getElementById('myModal');
var btn = document.getElementById('btnNames');
var span = document.getElementsByClassName('close')[0];
btn.onclick = function() {
	modal.style.display = 'block';
};
window.onclick = function(event) {
	if (event.target == modal) {
		modal.style.display = 'none';
	}
};
