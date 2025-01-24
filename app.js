let timerInterval;
let elapsedTime = 0;
let running = false;

const timerElement = document.getElementById('timer');
const startStopBtn = document.getElementById('startStopBtn');
const resetBtn = document.getElementById('resetBtn');

function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

function startStopTimer() {
    if (running) {
        clearInterval(timerInterval);
        startStopBtn.textContent = 'Start';
    } else {
        const startTime = Date.now() - elapsedTime;
        timerInterval = setInterval(() => {
            elapsedTime = Date.now() - startTime;
            timerElement.textContent = formatTime(elapsedTime);
        }, 100);
        startStopBtn.textContent = 'Stop';
    }
    running = !running;
    resetBtn.disabled = !running && elapsedTime === 0;
}

function resetTimer() {
    clearInterval(timerInterval);
    elapsedTime = 0;
    timerElement.textContent = '00:00:00';
    startStopBtn.textContent = 'Start';
    running = false;
    resetBtn.disabled = true;
}

startStopBtn.addEventListener('click', startStopTimer);
resetBtn.addEventListener('click', resetTimer);
