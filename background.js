let timer;
let isRunning = false;
let seconds = 0;
let lapSeconds = 0;
let laps = [];
let currentLap = 1;
let showLapTime = false;

let countdownTimer;
let countdownDuration = 0; // Total duration in seconds
let countdownRemaining = 0; // Remaining time in seconds
let countdownIsRunning = false;
let port;



chrome.runtime.onConnect.addListener((popupPort) => {
    port = popupPort;
    port.onMessage.addListener((request) => {
        switch (request.action) {
            case 'startTimer':
                startTimer();
                break;
            case 'stopTimer':
                stopTimer();
                break;
            case 'resetTimer':
                resetTimer();
                break;
            case 'lap':
                lap();
                if (port) {
                    port.postMessage({action: 'updatePopup', seconds: seconds, lapSeconds: lapSeconds, currentLap: currentLap, laps: laps, showLapTime: showLapTime});
                }
                break;
            case 'startCountdown':
                startCountdown(request.duration);
                break;
            case 'stopCountdown':
                stopCountdown();
                break;
            case 'resetCountdown':
                resetCountdown();
                break;    
            case 'updateBadgeOptions':
                showLapTime = request.showLapTime;
                chrome.storage.local.set({showLapTime: showLapTime});
                updateBadge();
                break;
            default:
                console.error(`Unknown action: ${request.action}`);
        }
    });

    port.onDisconnect.addListener(() => {
        port = null;
    });

    chrome.storage.local.get('showLapTime', (result) => {
        showLapTime = result.showLapTime;
        if (port) {
            port.postMessage({action: 'updatePopup', seconds: seconds, lapSeconds: lapSeconds, currentLap: currentLap, laps: laps, showLapTime: showLapTime});
        }
    });
});

function startTimer() {
    if (!isRunning) {
        isRunning = true;
        timer = setInterval(() => {
            seconds++;
            lapSeconds++;
            updateBadge();
            if (port) {
                port.postMessage({action: 'updatePopup', seconds: seconds, lapSeconds: lapSeconds, currentLap: currentLap, laps: laps, showLapTime: showLapTime});
            }
        }, 1000);
    }
}

function stopTimer() {
    if (isRunning) {
        clearInterval(timer);
        isRunning = false;
    }
}

function resetTimer() {
    stopTimer();
    seconds = 0;
    lapSeconds = 0;
    laps = [];
    currentLap = 1;
    updateBadge();
    if (port) {
        port.postMessage({action: 'updatePopup', seconds: seconds, lapSeconds: lapSeconds, currentLap: currentLap, laps: laps, showLapTime: showLapTime});
    }
}

function updateBadge() {
    if (showLapTime && laps.length > 0) {
        const lapMinutes = Math.floor(lapSeconds / 60);
        const lapSecs = lapSeconds % 60;
        chrome.action.setBadgeText({text: `${padZero(lapMinutes)}:${padZero(lapSecs)}`});
    } else {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        chrome.action.setBadgeText({text: `${padZero(minutes)}:${padZero(secs)}`});
    }
}

function lap() {
    const lapTime = lapSeconds;
    const minutes = Math.floor(lapTime / 60);
    const secs = lapTime % 60;
    laps.push(`${padZero(minutes)}:${padZero(secs)}`);
    lapSeconds = 0;
    currentLap++;
}

// Start the countdown timer
function startCountdown(duration) {
    if (!countdownIsRunning) {
        countdownDuration = duration;
        countdownRemaining = duration;
        countdownIsRunning = true;

        countdownTimer = setInterval(() => {
            if (countdownRemaining > 0) {
                countdownRemaining--;
                updateCountdownDisplay();
            } else {
                stopCountdown();
                if (port) {
                    port.postMessage({action: 'countdownComplete'});
                }
            }
        }, 1000);
    }
}

// Stop the countdown timer
function stopCountdown() {
    if (countdownIsRunning) {
        clearInterval(countdownTimer);
        countdownIsRunning = false;
    }
}

// Reset the countdown timer
function resetCountdown() {
    stopCountdown();
    countdownRemaining = 0;
    updateCountdownDisplay();
}

// Update the popup display with the remaining time
function updateCountdownDisplay() {
    if (port) {
        const hours = Math.floor(countdownRemaining / 3600);
        const minutes = Math.floor((countdownRemaining % 3600) / 60);
        const seconds = countdownRemaining % 60;

        port.postMessage({
            action: 'updateCountdown',
            hours: padZero(hours),
            minutes: padZero(minutes),
            seconds: padZero(seconds)
        });
    }
}

function padZero(num) {
    return num.toString().padStart(2, '0');
}