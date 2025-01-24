let startTime = 0;
let elapsedTime = 0;
let timerInterval;
let running = false;

const timerDisplay = document.getElementById('timer');
const startStopButton = document.getElementById('startStop');
const resetButton = document.getElementById('reset');

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

function updateTimer() {
  elapsedTime = Date.now() - startTime;
  timerDisplay.textContent = formatTime(elapsedTime);
}

startStopButton.addEventListener('click', () => {
  if (running) {
    clearInterval(timerInterval);
    elapsedTime = Date.now() - startTime;
    running = false;
    startStopButton.textContent = 'Start';
  } else {
    startTime = Date.now() - elapsedTime;
    timerInterval = setInterval(updateTimer, 1000);
    running = true;
    startStopButton.textContent = 'Stopp';
  }
});

resetButton.addEventListener('click', () => {
  clearInterval(timerInterval);
  running = false;
  elapsedTime = 0;
  timerDisplay.textContent = '00:00:00';
  startStopButton.textContent = 'Start';
});
