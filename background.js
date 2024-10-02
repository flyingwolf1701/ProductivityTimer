let timer;
let isRunning = false;
let seconds = 0;
let lapSeconds = 0;
let laps = [];
let currentLap = 1;
let showLapTime = false;
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
                port.postMessage({action: 'updatePopup', seconds: seconds, lapSeconds: lapSeconds, currentLap: currentLap, laps: laps});
                break;
            case 'updateBadgeOptions':
                chrome.storage.local.get('showLapTime', (result) => {
                    showLapTime = result.showLapTime;
                    updateBadge();
                });
                break;
            default:
                console.error(`Unknown action: ${request.action}`);
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
            port.postMessage({action: 'updatePopup', seconds: seconds, lapSeconds: lapSeconds, currentLap: currentLap, laps: laps});
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
    port.postMessage({action: 'updatePopup', seconds: seconds, lapSeconds: lapSeconds, currentLap: currentLap, laps: laps});
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

function padZero(num) {
    return num.toString().padStart(2, '0');
}