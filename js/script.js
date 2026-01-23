const charWidth = 24; 

// --- HTML Elemente ---
const textDisplay = document.getElementById('text-display');
const displayContainer = document.getElementById('display-container'); // Für den Blur-Effekt
const textInput = document.getElementById('text-input');
const startBtn = document.getElementById('start-btn');
const startOverlay = document.getElementById('start-overlay');
const modal = document.getElementById('result-modal');
const highScoreDisplay = document.getElementById('high-score-display');

// --- Spiel-Variablen ---
let highScore = localStorage.getItem('typingHighScore') || 0;
let quote = "";
let currentCharIndex = 0;
let totalErrors = 0;
let startTime;

// --- Initialisierung beim Laden ---
if (highScoreDisplay) {
    highScoreDisplay.innerText = highScore;
}

window.addEventListener('load', () => {
    textDisplay.innerHTML = '<span class="placeholder-text">Klicke unten auf den Button, um das Spiel zu laden...</span>';
    textInput.disabled = true;
});

// --- Haupt-Logik: Spiel Starten ---
startBtn.addEventListener('click', () => {
    // 1. Variablen zurücksetzen
    currentCharIndex = 0;
    totalErrors = 0;
    document.getElementById('error-count').innerText = "0";
    document.getElementById('kpm').innerText = "0";

    // 2. Text generieren und anzeigen
    quote = generateRandomText(200); 
    renderQuote();
    
    // 3. UI Update (Blur weg, Button weg)
    startOverlay.style.display = 'none'; 
    if (displayContainer) displayContainer.classList.add('active'); 
    
    // 4. Input aktivieren
    textInput.disabled = false;
    textInput.value = "";
    textInput.focus();
    startTime = new Date();
});

// --- Eingabe-Logik ---
textInput.addEventListener('input', () => {
    const val = textInput.value;
    const lastChar = val[val.length - 1];
    const targetChar = quote[currentCharIndex];

    if (lastChar === targetChar) {
        // Richtig getippt
        const charElement = document.getElementById(`char-${currentCharIndex}`);
        if(charElement) {
            charElement.classList.add('correct');
            charElement.classList.remove('incorrect');
        }
        currentCharIndex++;
        
        if (currentCharIndex >= quote.length) {
            finishGame();
        } else {
            updateScroll();
        }
    } else {
        // Falsch getippt
        totalErrors++;
        const charElement = document.getElementById(`char-${currentCharIndex}`);
        if(charElement) {
            charElement.classList.add('incorrect');
        }
        textInput.value = val.slice(0, -1); 
    }

    // Live-Stats aktualisieren
    const errorDisplay = document.getElementById('error-count');
    if (errorDisplay) errorDisplay.innerText = totalErrors;

    const now = new Date();
    const timeElapsedSeconds = (now - startTime) / 1000;
    
    if (timeElapsedSeconds > 0.5) { 
        const timeElapsedMinutes = timeElapsedSeconds / 60;
        const currentApm = Math.round(currentCharIndex / timeElapsedMinutes);
        const apmDisplay = document.getElementById('kpm');
        if (apmDisplay) apmDisplay.innerText = currentApm;
    }
});

// --- Hilfsfunktionen ---
function generateRandomText(length) {
    let result = [];
    while (result.join(' ').length < length) {
        result.push(wordBank[Math.floor(Math.random() * wordBank.length)]);
    }
    return result.join(' ').substring(0, length);
}

function renderQuote() {
    textDisplay.innerHTML = '';
    quote.split('').forEach((char, i) => {
        const span = document.createElement('span');
        span.innerText = char;
        span.id = `char-${i}`;
        textDisplay.appendChild(span);
    });
    updateScroll();
}

function updateScroll() {
    // Berechnet den Versatz, damit der aktuelle Buchstabe in der Mitte steht
    const offset = currentCharIndex * charWidth;
    textDisplay.style.transform = `translateX(-${offset}px)`;
    // Optional in updateScroll() hinzufügen:
document.querySelectorAll('#text-display span').forEach(s => s.style.fontWeight = "normal");
const currentSpan = document.getElementById(`char-${currentCharIndex}`);
if (currentSpan) currentSpan.style.fontWeight = "800";
    
    // Die Zeilen mit borderBottom wurden hier gelöscht!
}

function finishGame() {
    const durationSeconds = (new Date() - startTime) / 1000;
    const apm = Math.round(quote.length / (durationSeconds / 60));
    const accuracy = (quote.length / (quote.length + totalErrors)) * 100;

    const score = Math.round(apm * Math.pow((accuracy / 100), 3));

    // Highscore speichern
    let isNewRecord = false;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('typingHighScore', highScore);
        if (highScoreDisplay) highScoreDisplay.innerText = highScore;
        isNewRecord = true;
    }

    // Rating ermitteln
    let ratingText = "";
    let ratingColor = "";
    const ratingElement = document.getElementById('final-rating');

    if (apm < 200) {
        ratingText = "Schnecke 🐌";
        ratingColor = "#ca4754";
    } else if (apm <= 325) {
        ratingText = "Tipp-Talent ⌨️";
        ratingColor = "#e2b714";
    } else {
        ratingText = "Code-Ninja 🥷";
        ratingColor = "#4caf50";
    }

    // Modal befüllen
    const scoreDisplay = document.getElementById('final-score');
    scoreDisplay.innerText = score;

    if (isNewRecord) {
        scoreDisplay.innerHTML += '<div style="font-size: 1.2rem; color: #4caf50; margin-top: 10px; animation: pulse 1s infinite;">★ NEUER REKORD ★</div>';
    }

    ratingElement.innerText = ratingText;
    ratingElement.style.color = ratingColor;
    
    document.getElementById('final-time').innerText = Math.round(durationSeconds);
    document.getElementById('final-errors').innerText = totalErrors;
    document.getElementById('final-apm').innerText = apm;
    document.getElementById('final-accuracy').innerText = Math.round(accuracy);

    modal.style.display = 'flex';
    textInput.disabled = true;
}

// Fokus halten
window.addEventListener('click', () => { if(!textInput.disabled) textInput.focus(); });