document.addEventListener('DOMContentLoaded', () => {
    const timerDisplay = document.getElementById('timer-display');
    const lapDisplay = document.getElementById('lap-display');
    const startButton = document.getElementById('start');
    const stopButton = document.getElementById('stop');
    const resetButton = document.getElementById('reset');
    const lapButton = document.getElementById('lap');
    const lapList = document.getElementById('lap-list');
    const showLapTimeCheckbox = document.getElementById('show-lap-time');

    let port = chrome.runtime.connect({name: 'popup'});

    startButton.addEventListener('click', () => { port.postMessage({action: 'startTimer'}); });
    stopButton.addEventListener('click', () => { port.postMessage({action: 'stopTimer'}); });
    resetButton.addEventListener('click', () => { port.postMessage({action: 'resetTimer'}); });
    lapButton.addEventListener('click', () => { port.postMessage({action: 'lap'}); });
    showLapTimeCheckbox.addEventListener('change', updateBadgeOptions);

    lapDisplay.style.display = 'none';
    lapList.style.display = 'none';

    port.onMessage.addListener((request) => {
        if (request.action === 'updatePopup') {
            const hours = Math.floor(request.seconds / 3600);
            const minutes = Math.floor((request.seconds % 3600) / 60);
            const secs = request.seconds % 60;
            timerDisplay.textContent = `${padZero(hours)}:${padZero(minutes)}:${padZero(secs)}`;

            if (request.laps.length > 0) {
                lapDisplay.style.display = 'block';
                lapList.style.display = 'block';

                const lapMinutes = Math.floor(request.lapSeconds / 60);
                const lapSecs = request.lapSeconds % 60;
                lapDisplay.textContent = `Lap ${request.currentLap}: ${padZero(lapMinutes)}:${padZero(lapSecs)}`;

                const lapHtml = request.laps.map((lapTime, index) => {
                    return `<div>Lap ${index + 1}: ${lapTime}</div>`;
                }).join('');
                lapList.innerHTML = lapHtml;
            }

            updateBadgeOptions();
        }
    });

    function updateBadgeOptions() {
        chrome.storage.local.set({showLapTime: showLapTimeCheckbox.checked});
        port.postMessage({action: 'updateBadgeOptions'});
    }

    function padZero(num) {
        return num.toString().padStart(2, '0');
    }
});