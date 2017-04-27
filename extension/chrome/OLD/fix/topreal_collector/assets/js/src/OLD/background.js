 // фоновый скрипт, на котором проихсходит прием данных от content.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    chrome.tabs.create({ url: request.url });
});