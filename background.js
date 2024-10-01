chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({
        name: "Jack"
    });
});

chrome.storage.local.get('name', data => {

})

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && /^http/.test(tab.url)) {
        chrome.scripting.executeScript({
            target: {tabId: tabId},
            files: ["./foreground.js"]
        })
            .then(() => {
                console.log("INJECT THE FOREGROUND SCRIPT");
            })
            .catch(err => console.log("ERROR: ", err));
    }
});


// let timer;
// let isRunning = false;
// let seconds = 0;

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     if (request.action === 'startTimer') {
//         startTimer();
//     } else if (request.action === 'stopTimer') {
//         stopTimer();
//     } else if (request.action === 'resetTimer') {
//         resetTimer();
//     } else if (request.action === 'getTime') {
//         sendResponse({seconds: seconds, isRunning: isRunning});
//     }
// });

// function startTimer() {
//     if (!isRunning) {
//         isRunning = true;
//         timer = setInterval(() => {
//             seconds++;
//             updateBadge();
//         }, 1000);
//     }
// }

// function stopTimer() {
//     if (isRunning) {
//         clearInterval(timer);
//         isRunning = false;
//     }
// }

// function resetTimer() {
//     stopTimer();
//     seconds = 0;
//     updateBadge();
// }

// function updateBadge() {
//     const minutes = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     chrome.action.setBadgeText({text: `${padZero(minutes)}:${padZero(secs)}`});
// }

// function padZero(num) {
//     return num.toString().padStart(2, '0');
// }