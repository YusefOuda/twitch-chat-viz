chrome.browserAction.onClicked.addListener(tab => {
    if (tab.url.indexOf("twitch.tv") != -1) {
        chrome.tabs.sendMessage(tabId, {
            message: 'tabupdate'
        });
        chrome.windows.create({
            url: chrome.runtime.getURL("popup.html"),
            type: "popup",
            focused: true,
            height: 760,
            width: 836
            /* can also set width/height here, see docs */
        });
    }
});

var dataPort;

chrome.extension.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.message && dataPort) {
            dataPort.postMessage({ message: request.message });
        }
        if (request.emote && dataPort) {
            dataPort.postMessage({ message: request.message });
        }
    }
);


chrome.runtime.onConnect.addListener(function (port) {
    dataPort = port;
    dataPort.onDisconnect.addListener(function () {
        dataPort = null;
    });
});

chrome.tabs.onUpdated.addListener(
    function (tabId, changeInfo, tab) {
        if (changeInfo.url) {
            chrome.tabs.sendMessage(tabId, {
                message: 'tabupdate'
            });
            dataPort.postMessage({ update: true });
        }
    }
);