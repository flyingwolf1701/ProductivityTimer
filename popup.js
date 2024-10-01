// let timer;
// let isRunning = false;
// let seconds = 0;

// document.addEventListener('DOMContentLoaded', () => {
//     const timerDisplay = document.getElementById('timer-display');
//     const startPauseButton = document.getElementById('start-pause');
//     const stopButton = document.getElementById('stop');
//     const resetButton = document.getElementById('reset');

//     startPauseButton.addEventListener('click', toggleTimer);
//     stopButton.addEventListener('click', stopTimer);
//     resetButton.addEventListener('click', resetTimer);

//     function toggleTimer() {
//         if (isRunning) {
//             clearInterval(timer);
//             startPauseButton.textContent = 'Start';
//         } else {
//             timer = setInterval(updateTimer, 1000);
//             startPauseButton.textContent = 'Pause';
//         }
//         isRunning = !isRunning;
//     }

//     function stopTimer() {
//         clearInterval(timer);
//         isRunning = false;
//         startPauseButton.textContent = 'Start';
//     }

//     function resetTimer() {
//         clearInterval(timer);
//         isRunning = false;
//         seconds = 0;
//         updateDisplay();
//         startPauseButton.textContent = 'Start';
//     }

//     function updateTimer() {
//         seconds++;
//         updateDisplay();
//     }

//     function updateDisplay() {
//         const hours = Math.floor(seconds / 3600);
//         const minutes = Math.floor((seconds % 3600) / 60);
//         const secs = seconds % 60;
//         timerDisplay.textContent = `${padZero(hours)}:${padZero(minutes)}:${padZero(secs)}`;
        
//         // Update badge text
//         chrome.action.setBadgeText({text: `${padZero(minutes)}:${padZero(secs)}`});
//     }

//     function padZero(num) {
//         return num.toString().padStart(2, '0');
//     }
// });