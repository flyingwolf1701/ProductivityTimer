document.addEventListener('DOMContentLoaded', () => {
    const timerDisplay = document.getElementById('timer-display');
    const lapDisplay = document.getElementById('lap-display');
    const startButton = document.getElementById('start');
    const stopButton = document.getElementById('stop');
    const resetButton = document.getElementById('reset');
    const lapButton = document.getElementById('lap');
    const lapList = document.getElementById('lap-list');
    const showLapTimeCheckbox = document.getElementById('show-lap-time');
    const menuItems = document.querySelectorAll('.menu div');
    const timerList = document.getElementById('timer-list');
    const timerType = document.getElementById('timer-type');
    const countdownInputField = document.getElementById('countdown-input');

    let currentTimerType = 'stopwatch';
    

    let port = chrome.runtime.connect({name: 'popup'});

    startButton.addEventListener('click', () => {
        if (currentTimerType === 'stopwatch') {
            port.postMessage({action: 'startTimer'});
        } else if (currentTimerType === 'countdown') {
            const duration = parseInt(countdownInputField.value, 10);
            port.postMessage({action: 'startCountdown', duration: duration});
        }
    });

    stopButton.addEventListener('click', () => {
        if (currentTimerType === 'stopwatch') {
            port.postMessage({action: 'stopTimer'});
        } else if (currentTimerType === 'countdown') {
            port.postMessage({action: 'stopCountdown'});
        }
    });

    resetButton.addEventListener('click', () => {
        if (currentTimerType === 'stopwatch') {
            port.postMessage({action: 'resetTimer'});
        } else if (currentTimerType === 'countdown') {
            port.postMessage({action: 'resetCountdown'});
        }
        lapDisplay.style.display = 'none';
        lapList.style.display = 'none';
        lapList.innerHTML = '';
    });

    lapButton.addEventListener('click', () => { 
        port.postMessage({action: 'lap'}); 
    });

    showLapTimeCheckbox.addEventListener('change', updateBadgeOptions);

    lapDisplay.style.display = 'none';
    lapList.style.display = 'none';

    menuItems.forEach((menuItem) => {
        menuItem.addEventListener('click', () => {
            // Remove the active class from all menu items
            menuItems.forEach((item) => item.classList.remove('active'));
            // Add the active class to the current menu item
            menuItem.classList.add('active');
            // Update the tab content
            if (menuItem.textContent === 'Timer List') {
                timerList.style.display = 'block';
                port.postMessage({action: 'getTimerList'});
            } else if (menuItem.textContent === 'Current Timer') {
                timerList.style.display = 'none';
                if (currentTimerType === 'stopwatch') {
                    // Update UI for stopwatch
                    startButton.textContent = 'Start';
                    stopButton.textContent = 'Stop';
                    resetButton.textContent = 'Reset';
                    lapButton.textContent = 'Lap';
                    timerType.textContent = 'Stopwatch';
                } else if (currentTimerType === 'countdown') {
                    // Update UI for countdown
                    startButton.textContent = 'Start';
                    stopButton.textContent = 'Stop';
                    resetButton.textContent = 'Reset';
                    lapButton.textContent = 'Lap';
                    timerType.textContent = 'Countdown';
                }
            } else if (menuItem.textContent === 'Create Timer') {
                // Create timer logic
            }
        });
    });

    port.onMessage.addListener((request) => {
        if (request.action === 'updateTimerList') {
            const timerListHtml = request.timers.map((timer) => {
                return `<div>${timer.name}</div>`;
            }).join('');
            timerList.innerHTML = timerListHtml;
            const timerListItems = document.querySelectorAll('#timer-list div');
            timerListItems.forEach((timerListItem) => {
                timerListItem.addEventListener('click', () => {
                    if (timerListItem.textContent === 'Basic Stopwatch') {
                        currentTimerType = 'stopwatch';
                        menuItems.forEach((item) => item.classList.remove('active'));
                        menuItems[0].classList.add('active');
                        timerList.style.display = 'none';
                        // Update UI for stopwatch
                        startButton.textContent = 'Start';
                        stopButton.textContent = 'Stop';
                        resetButton.textContent = 'Reset';
                        lapButton.textContent = 'Lap';
                        timerType.textContent = 'Stopwatch';
                    } else if (timerListItem.textContent === 'Basic Countdown Timer') {
                        currentTimerType = 'countdown';
                        menuItems.forEach((item) => item.classList.remove('active'));
                        menuItems[0].classList.add('active');
                        timerList.style.display = 'none';
                        // Update UI for countdown
                        startButton.textContent = 'Start';
                        stopButton.textContent = 'Stop';
                        resetButton.textContent = 'Reset';
                        lapButton.textContent = 'Lap';
                        timerType.textContent = 'Countdown';
                    }
                });
            });
        } else if (request.action === 'updatePopup') {
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
    
            showLapTimeCheckbox.checked = request.showLapTime;
        } else if (request.action === 'updateCountdown') {
            timerDisplay.textContent = `${request.hours}:${request.minutes}:${request.seconds}`;
        }
    });

    function updateBadgeOptions() {
        port.postMessage({action: 'updateBadgeOptions', showLapTime: showLapTimeCheckbox.checked});
    }

    function padZero(num) {
        return num.toString().padStart(2, '0');
    }

    
});