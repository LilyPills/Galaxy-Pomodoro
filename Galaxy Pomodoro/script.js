// Timer state
let timeLeft = 25 * 60;
let timerId = null;
let currentMode = 'focus'; // 'focus', 'break', 'long-break'
let cycleCount = 1;
let isAutoMode = false;
let currentLang = 'pt';
let isMusicPlaying = false;

const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const startPauseBtn = document.getElementById('start-pause');
const resetBtn = document.getElementById('reset');
const focusModeBtn = document.getElementById('focus-mode');
const breakModeBtn = document.getElementById('break-mode');
const longBreakModeBtn = document.getElementById('long-break-mode');
const autoModeCheckbox = document.getElementById('auto-mode');
const cycleDisplay = document.getElementById('current-cycle');
const toggleAudioBtn = document.getElementById('toggle-audio');
const audioIcon = document.getElementById('audio-icon');
const toggleLangBtn = document.getElementById('toggle-lang');
const langText = document.getElementById('lang-text');
const youtubePlayer = document.getElementById('youtube-player');

const VIDEO_URL = "https://www.youtube.com/embed/vG2hCgewoBY?autoplay=1&mute=0&loop=1&playlist=vG2hCgewoBY";

const MODES = {
    focus: { time: 25 * 60, btn: focusModeBtn },
    break: { time: 5 * 60, btn: breakModeBtn },
    'long-break': { time: 15 * 60, btn: longBreakModeBtn }
};

const translations = {
    pt: {
        title: "Pomodoro Galáxia",
        subtitle: "Mantenha o foco entre as estrelas",
        focus: "Foco",
        break: "Pausa",
        longBreak: "Pausa Longa",
        cycle: "Ciclo",
        start: "Iniciar",
        pause: "Pausar",
        continue: "Continuar",
        reset: "Reiniciar",
        autoMode: "Modo Automático",
        footer: "Técnica Pomodoro: 25 min foco / 5 min pausa / 15 min pausa longa",
        alertBreak: "Hora de uma pausa!",
        alertFocus: "Hora de focar!",
        alertFinished: "Sessão finalizada!"
    },
    en: {
        title: "Galaxy Pomodoro",
        subtitle: "Keep focus among the stars",
        focus: "Focus",
        break: "Break",
        longBreak: "Long Break",
        cycle: "Cycle",
        start: "Start",
        pause: "Pause",
        continue: "Continue",
        reset: "Reset",
        autoMode: "Auto Mode",
        footer: "Pomodoro Technique: 25 min focus / 5 min break / 15 min long break",
        alertBreak: "Time for a break!",
        alertFocus: "Time to focus!",
        alertFinished: "Session finished!"
    }
};

// Estrelas
function createStars() {
    const container = document.getElementById('stars-container');
    if (!container) return;

    const starCount = 150;
    container.innerHTML = ''; // Limpa estrelas existentes

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';

        const size = Math.random() * 3;
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const duration = 2 + Math.random() * 3;

        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${x}%`;
        star.style.top = `${y}%`;
        star.style.setProperty('--duration', `${duration}s`);

        container.appendChild(star);
    }
}

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    minutesDisplay.textContent = minutes.toString().padStart(2, '0');
    secondsDisplay.textContent = seconds.toString().padStart(2, '0');
    cycleDisplay.textContent = cycleCount;
    document.title = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} - ${translations[currentLang].title}`;
}

function updateLanguage() {
    const t = translations[currentLang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.textContent = t[key];
    });

    langText.textContent = currentLang === 'pt' ? 'EN' : 'PT';

    // Atualiza texto do botão com base no estado
    if (timerId) {
        startPauseBtn.textContent = t.pause;
    } else if (timeLeft < MODES[currentMode].time) {
        startPauseBtn.textContent = t.continue;
    } else {
        startPauseBtn.textContent = t.start;
    }
}

function startTimer() {
    if (timerId) return;

    timerId = setInterval(() => {
        timeLeft--;
        updateDisplay();

        if (timeLeft === 0) {
            clearInterval(timerId);
            timerId = null;
            handleSessionEnd();
        }
    }, 1000);

    startPauseBtn.textContent = translations[currentLang].pause;
}

function handleSessionEnd() {
    if (currentMode === 'focus') {
        if (cycleCount < 4) {
            switchMode('break');
        } else {
            switchMode('long-break');
        }
    } else {
        if (currentMode === 'long-break') {
            cycleCount = 1;
        } else {
            cycleCount++;
        }
        switchMode('focus');
    }

    if (isAutoMode) {
        startTimer();
    } else {
        startPauseBtn.textContent = translations[currentLang].start;
        alert(translations[currentLang].alertFinished);
    }
}

function pauseTimer() {
    clearInterval(timerId);
    timerId = null;
    startPauseBtn.textContent = translations[currentLang].continue;
}

function resetTimer() {
    pauseTimer();
    timeLeft = MODES[currentMode].time;
    updateDisplay();
    startPauseBtn.textContent = translations[currentLang].start;
}

function switchMode(mode) {
    currentMode = mode;
    timeLeft = MODES[mode].time;

    // Update UI buttons
    Object.values(MODES).forEach(m => m.btn.classList.remove('active'));
    MODES[mode].btn.classList.add('active');

    updateDisplay();
    pauseTimer();
    startPauseBtn.textContent = translations[currentLang].start;
}

startPauseBtn.addEventListener('click', () => {
    if (timerId) {
        pauseTimer();
    } else {
        startTimer();
    }
});

resetBtn.addEventListener('click', resetTimer);

focusModeBtn.addEventListener('click', () => {
    cycleCount = 1;
    switchMode('focus');
});
breakModeBtn.addEventListener('click', () => switchMode('break'));
longBreakModeBtn.addEventListener('click', () => switchMode('long-break'));

autoModeCheckbox.addEventListener('change', (e) => {
    isAutoMode = e.target.checked;
});

// Controle de áudio usando src toggle para máxima compatibilidade com protocolo de arquivo ===== Ainda não funcioa, continuar amanha
toggleAudioBtn.addEventListener('click', () => {
    console.log("Audio toggle clicked. Current state:", isMusicPlaying ? "Playing" : "Paused");
    if (isMusicPlaying) {
        youtubePlayer.src = "about:blank";
        audioIcon.textContent = '🔈';
        console.log("Music stopped (src set to about:blank)");
    } else {
        youtubePlayer.src = VIDEO_URL;
        audioIcon.textContent = '🔊';
        console.log("Music started (src set to VIDEO_URL)");
    }
    isMusicPlaying = !isMusicPlaying;
});

// Toggle de idioma
toggleLangBtn.addEventListener('click', () => {
    currentLang = currentLang === 'pt' ? 'en' : 'pt';
    updateLanguage();
    updateDisplay();
});

// Inicialização
createStars();
updateDisplay();
updateLanguage();
// Garante que o iframe comece vazio
youtubePlayer.src = "about:blank";