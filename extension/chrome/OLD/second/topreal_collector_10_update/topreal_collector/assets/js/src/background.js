 // фоновый скрипт, на котором проихсходит прием данных от content.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {    
    switch (request.action) {
        case "open_yad2_newad":
           chrome.tabs.create({ url: request.url });
        break;
        case "close_current_tab":
           chrome.tabs.remove(sender.tab.id, null);
        break;
    }
});

chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse){ // listener for checking extension exist
    if (request) {
        if (request.message) {
            if (request.message == "installed") {
                sendResponse({"installed":true});
            }
        }
    }
    return true;
});