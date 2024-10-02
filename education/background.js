chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({
        name: "Jack"
    });
});



chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && /^http/.test(tab.url)) {
        chrome.scripting.insertCSS({
            target: {tabId: tabId},
            files: ["./foreground_styles.css"]
        })
        .then(() => {
            console.log("INJECT THE FOREGROUND STYLES");
            chrome.scripting.executeScript({
                target: {tabId: tabId},
                files: ["./foreground.js"]
            })
                .then(() => {
                    console.log("INJECT THE FOREGROUND SCRIPT");
                    chrome.tabs.sendMessage(tabId, {
                        message: 'change_name',
                        payload: 'John'
                    })
                })
        })
            .catch(err => console.log("ERROR: ", err));
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'get_name') {
        chrome.storage.local.get('name', data => {
            if (chrome.runtime.lastError) {
                sendResponse({
                    message: 'fail'
                });
                return;
            }
            sendResponse({
                message: 'success',
                payload: data.name
            });
        });
        return true;
    } else if (request.message === 'change_name') {
        chrome.storage.local.set({
            name: request.payload
        }, () => {
            if (chrome.runtime.lastError) {
                sendResponse({
                    message: 'fail'
                })
                return;
            }
            sendResponse({
                message: 'success'
            })
        })
        return true;
    }

});