/* eslint-disable prefer-template */
const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const timerFn = require('./timer');

const port = process.env.PORT || 3000;

const timer = timerFn('myTimer');
let playersRemaining = 0;

io.on('connection', (socket) => {
    // console.log(socket.id);

    socket.on('timer_reset', () => {
        timer.clear();
    });

    socket.on('message', (data) => { console.log(data); });

    socket.on('timer_start', () => {
        timer.start();
    });

    socket.on('simulate', (simReq) => {
        const { players, maxLength } = simReq;
        simEvent(players, maxLength);
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

http.listen(port, () => {});

function simEvent(players, maxLength) {
    playersRemaining = 0;
    if (!players.length) {
        return;
    }
    playersRemaining = players.length + 1;
    timer.clear();
    timer.start();
    io.emit('begin');
    players.forEach((player) => {
        setTimeout(() => {
            playerFinished(player);
        }, getRandomInt((maxLength * 500), maxLength * 1000));
    });

    function playerFinished(player) {
        const finishedPlayer = [...player];
        finishedPlayer[2] = timer.currTime();
        finishedPlayer[3] = true;
        playersRemaining--;
        if (!playersRemaining) {
            timer.stop();
        }
        console.log('player_finished', { player: finishedPlayer });
        io.emit('player_finished', finishedPlayer);
        const idx = players.findIndex((x) => x[0] === finishedPlayer[0]);
        players[idx] = finishedPlayer;
    }
}

function getRandomInt(min, max) {
    return Math.random() * (max - min) + min;
}
