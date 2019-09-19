/* eslint-disable prefer-template */
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const timerFn = require('./timer');
const gpio = require('onoff').Gpio;

const port = process.env.PORT || 3000;

const LED1 = new Gpio(4, 'out'); //use GPIO pin 4 as output
const LED2 = new Gpio(5, 'out'); //use GPIO pin 4 as output
const LED3 = new Gpio(6, 'out'); //use GPIO pin 4 as output
const LED4 = new Gpio(13, 'out'); //use GPIO pin 4 as output
const LEDMaster = new Gpio(19, 'out');

const BUTTON1 = new Gpio(18, 'in', 'both'); //use GPIO pin 17 as input, and 'both' button presses, and releases should be handled
const BUTTON2 = new Gpio(23, 'in', 'both'); //use GPIO pin 17 as input, and 'both' button presses, and releases should be handled
const BUTTON3 = new Gpio(24, 'in', 'both'); //use GPIO pin 17 as input, and 'both' button presses, and releases should be handled
const BUTTON4 = new Gpio(25, 'in', 'both'); //use GPIO pin 17 as input, and 'both' button presses, and releases should be handled
const BUTTONMaster = new Gpio(12, 'in', 'both'); //use GPIO pin 17 as input, and 'both' button presses, and releases should be handled

const timer = timerFn('myTimer');
let timerRunning = false;
let playersRemaining = 0;
let timeouts = [];

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

app.use(express.static('public'));

http.listen(port, () => {});

function simEvent(players, maxLength) {
    playersRemaining = 0;
    if (!players.length) {
        return;
    }
    playersRemaining = players.length + 1;
    if (timer.isRunning) {
        timer.stop();
    }

    if (timeouts.length > 0) {
        timeouts.forEach((myTimer) => {
            clearTimeout(myTimer);
        });
        timeouts = [];
    }
    timer.clear();
    timer.start();
    io.emit('begin');
    players.forEach((player) => {
        const timerId = setTimeout(() => { playerFinished(player); }, getRandomInt((maxLength * 500), maxLength * 1000));
        timeouts.push(timerId);
    });

    function playerFinished(player) {
        const finishedPlayer = { ...player };
        finishedPlayer.time = timer.currTime();
        finishedPlayer.finished = true;
        playersRemaining--;
        if (!playersRemaining) {
            timer.stop();
        }
        console.log('player_finished', JSON.stringify(finishedPlayer));
        io.emit('player_finished', finishedPlayer);
        const idx = players.findIndex((x) => x.id === finishedPlayer.id);
        // eslint-disable-next-line no-param-reassign
        players[idx] = finishedPlayer;
    }
}

function getRandomInt(min, max) {
    return Math.random() * (max - min) + min;
}
