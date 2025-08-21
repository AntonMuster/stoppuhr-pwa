class StopwatchApp {
    constructor() {
        this.timerInterval = null;
        this.animationFrame = null;
        this.elapsedTime = 0;
        this.running = false;
        this.startTime = 0;
        this.lapTimes = [];
        this.lapCounter = 1;
        
        this.initializeElements();
        this.loadState();
        this.attachEventListeners();
        this.setupKeyboardNavigation();
    }

    initializeElements() {
        try {
            this.timerElement = document.getElementById('timer');
            this.startStopBtn = document.getElementById('startStopBtn');
            this.resetBtn = document.getElementById('resetBtn');
            this.lapBtn = document.getElementById('lapBtn');
            this.lapList = document.getElementById('lap-list');
            this.clearLapsBtn = document.getElementById('clearLapsBtn');
            this.errorMessage = document.getElementById('error-message');

            if (!this.timerElement || !this.startStopBtn || !this.resetBtn) {
                throw new Error('Erforderliche DOM-Elemente nicht gefunden');
            }
        } catch (error) {
            this.showError('Initialisierungsfehler: ' + error.message);
        }
    }

    attachEventListeners() {
        try {
            this.startStopBtn.addEventListener('click', () => this.startStopTimer());
            this.resetBtn.addEventListener('click', () => this.resetTimer());
            this.lapBtn.addEventListener('click', () => this.addLapTime());
            this.clearLapsBtn.addEventListener('click', () => this.clearLapTimes());
            
            // Visibility API für Hintergrund-Verhalten
            document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
            
            // Beforeunload für State-Speicherung
            window.addEventListener('beforeunload', () => this.saveState());
        } catch (error) {
            this.showError('Event-Listener Fehler: ' + error.message);
        }
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (event) => {
            try {
                switch (event.code) {
                    case 'Space':
                        event.preventDefault();
                        this.startStopTimer();
                        break;
                    case 'KeyR':
                        if (event.ctrlKey) {
                            event.preventDefault();
                            this.resetTimer();
                        }
                        break;
                    case 'KeyL':
                        if (event.ctrlKey && this.running) {
                            event.preventDefault();
                            this.addLapTime();
                        }
                        break;
                    case 'Escape':
                        this.resetTimer();
                        break;
                }
            } catch (error) {
                this.showError('Keyboard-Navigation Fehler: ' + error.message);
            }
        });
    }

    formatTime(ms) {
        try {
            const totalSeconds = Math.floor(ms / 1000);
            const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
            const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
            const seconds = String(totalSeconds % 60).padStart(2, '0');
            const milliseconds = String(Math.floor((ms % 1000) / 10)).padStart(2, '0');
            return `${hours}:${minutes}:${seconds}.${milliseconds}`;
        } catch (error) {
            this.showError('Zeitformat-Fehler: ' + error.message);
            return '00:00:00.00';
        }
    }

    updateDisplay() {
        try {
            if (this.running) {
                this.elapsedTime = performance.now() - this.startTime;
            }
            this.timerElement.textContent = this.formatTime(this.elapsedTime);
            
            if (this.running) {
                this.animationFrame = requestAnimationFrame(() => this.updateDisplay());
            }
        } catch (error) {
            this.showError('Display-Update Fehler: ' + error.message);
        }
    }

    startStopTimer() {
        try {
            if (this.running) {
                // Timer stoppen
                this.running = false;
                if (this.animationFrame) {
                    cancelAnimationFrame(this.animationFrame);
                }
                this.startStopBtn.textContent = 'Start';
                this.startStopBtn.setAttribute('aria-label', 'Timer starten');
                this.lapBtn.disabled = true;
            } else {
                // Timer starten
                this.running = true;
                this.startTime = performance.now() - this.elapsedTime;
                this.updateDisplay();
                this.startStopBtn.textContent = 'Stop';
                this.startStopBtn.setAttribute('aria-label', 'Timer stoppen');
                this.lapBtn.disabled = false;
            }
            
            this.resetBtn.disabled = !this.running && this.elapsedTime === 0;
            this.saveState();
        } catch (error) {
            this.showError('Start/Stop Fehler: ' + error.message);
        }
    }

    resetTimer() {
        try {
            if (this.animationFrame) {
                cancelAnimationFrame(this.animationFrame);
            }
            
            this.running = false;
            this.elapsedTime = 0;
            this.timerElement.textContent = '00:00:00.00';
            this.startStopBtn.textContent = 'Start';
            this.startStopBtn.setAttribute('aria-label', 'Timer starten');
            this.resetBtn.disabled = true;
            this.lapBtn.disabled = true;
            
            this.clearLapTimes();
            this.saveState();
        } catch (error) {
            this.showError('Reset Fehler: ' + error.message);
        }
    }

    addLapTime() {
        try {
            if (!this.running) return;
            
            const lapTime = this.elapsedTime;
            const previousLapTime = this.lapTimes.length > 0 ? this.lapTimes[this.lapTimes.length - 1].total : 0;
            const splitTime = lapTime - previousLapTime;
            
            const lap = {
                number: this.lapCounter++,
                split: splitTime,
                total: lapTime
            };
            
            this.lapTimes.push(lap);
            this.displayLapTime(lap);
            this.clearLapsBtn.style.display = 'inline-block';
            this.saveState();
        } catch (error) {
            this.showError('Rundenzeit Fehler: ' + error.message);
        }
    }

    displayLapTime(lap) {
        try {
            const listItem = document.createElement('li');
            listItem.className = 'lap-time';
            listItem.innerHTML = `
                <span class="lap-number">Runde ${lap.number}</span>
                <span class="lap-split">+${this.formatTime(lap.split)}</span>
                <span class="lap-total">${this.formatTime(lap.total)}</span>
            `;
            this.lapList.appendChild(listItem);
            
            // Scroll zum neuesten Eintrag
            listItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } catch (error) {
            this.showError('Rundenzeit-Anzeige Fehler: ' + error.message);
        }
    }

    clearLapTimes() {
        try {
            this.lapTimes = [];
            this.lapCounter = 1;
            this.lapList.innerHTML = '';
            this.clearLapsBtn.style.display = 'none';
            this.saveState();
        } catch (error) {
            this.showError('Rundenzeiten löschen Fehler: ' + error.message);
        }
    }

    saveState() {
        try {
            const state = {
                elapsedTime: this.elapsedTime,
                running: this.running,
                startTime: this.running ? this.startTime : null,
                lapTimes: this.lapTimes,
                lapCounter: this.lapCounter,
                timestamp: Date.now()
            };
            localStorage.setItem('stopwatch-state', JSON.stringify(state));
        } catch (error) {
            console.warn('State speichern fehlgeschlagen:', error);
        }
    }

    loadState() {
        try {
            const savedState = localStorage.getItem('stopwatch-state');
            if (!savedState) return;
            
            const state = JSON.parse(savedState);
            const timeDiff = Date.now() - state.timestamp;
            
            // Nur laden wenn weniger als 24 Stunden vergangen (erweitert für längere Laufzeiten)
            if (timeDiff > 86400000) {
                localStorage.removeItem('stopwatch-state');
                return;
            }
            
            this.elapsedTime = state.elapsedTime || 0;
            this.lapTimes = state.lapTimes || [];
            this.lapCounter = state.lapCounter || 1;
            
            // Rundenzeiten anzeigen
            this.lapTimes.forEach(lap => this.displayLapTime(lap));
            if (this.lapTimes.length > 0) {
                this.clearLapsBtn.style.display = 'inline-block';
            }
            
            // Timer wiederherstellen wenn er lief
            if (state.running && state.startTime) {
                this.running = true;
                // Startzeit anpassen basierend auf der verstrichenen Zeit seit dem Speichern
                const realElapsedTime = state.elapsedTime + timeDiff;
                this.startTime = performance.now() - realElapsedTime;
                this.elapsedTime = realElapsedTime;
                
                // UI entsprechend aktualisieren
                this.startStopBtn.textContent = 'Stop';
                this.startStopBtn.setAttribute('aria-label', 'Timer stoppen');
                this.lapBtn.disabled = false;
                this.resetBtn.disabled = false;
                
                // Timer-Display starten
                this.updateDisplay();
            } else {
                // Timer-Anzeige aktualisieren für gestoppten Timer
                this.timerElement.textContent = this.formatTime(this.elapsedTime);
                this.resetBtn.disabled = this.elapsedTime === 0;
            }
            
        } catch (error) {
            console.warn('State laden fehlgeschlagen:', error);
            localStorage.removeItem('stopwatch-state');
        }
    }

    handleVisibilityChange() {
        try {
            if (document.hidden && this.running) {
                // Timer läuft im Hintergrund weiter
                this.saveState();
            } else if (!document.hidden && this.running) {
                // Zurück im Vordergrund - Zeit synchronisieren
                this.loadState();
            }
        } catch (error) {
            this.showError('Visibility-Change Fehler: ' + error.message);
        }
    }

    showError(message) {
        try {
            if (this.errorMessage) {
                this.errorMessage.textContent = message;
                this.errorMessage.style.display = 'block';
                setTimeout(() => {
                    this.errorMessage.style.display = 'none';
                }, 5000);
            }
            console.error('Stoppuhr Fehler:', message);
        } catch (error) {
            console.error('Fehler beim Anzeigen der Fehlermeldung:', error);
        }
    }
}

// App initialisieren wenn DOM geladen ist
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.stopwatchApp = new StopwatchApp();
    } catch (error) {
        console.error('App-Initialisierung fehlgeschlagen:', error);
    }
});
