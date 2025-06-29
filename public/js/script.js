

let duration = 25 * 60; // 25 minutos en segundos
let remaining = duration;
let timer = null;
let running = false;

const clock = document.getElementById('clock');
const startPauseBtn = document.getElementById('startPauseBtn');
const resetBtn = document.getElementById('resetBtn');

function updateClock() {
  const mins = String(Math.floor(remaining / 60)).padStart(2, '0');
  const secs = String(remaining % 60).padStart(2, '0');
  clock.textContent = `${mins}:${secs}`;
}

function startTimer() {
  if (!running) {
    timer = setInterval(() => {
      if (remaining > 0) {
        remaining--;
        updateClock();
      } else {
        clearInterval(timer);
        alert("¡Pomodoro terminado! 🕒🍅");
      }
    }, 1000);
    startPauseBtn.textContent = '⏸️';
    startPauseBtn.classList.remove('btn-success');
    startPauseBtn.classList.add('btn-warning');
    running = true;
  } else {
    clearInterval(timer);
    startPauseBtn.textContent = '▶️';
    startPauseBtn.classList.remove('btn-warning');
    startPauseBtn.classList.add('btn-success');
    running = false;
  }
}

function resetTimer() {
  clearInterval(timer);
  remaining = duration;
  updateClock();
  startPauseBtn.textContent = '▶️';
  startPauseBtn.classList.remove('btn-warning');
  startPauseBtn.classList.add('btn-success');
  running = false;
}

startPauseBtn.addEventListener('click', startTimer);
resetBtn.addEventListener('click', resetTimer);

// Inicializar el reloj
updateClock();