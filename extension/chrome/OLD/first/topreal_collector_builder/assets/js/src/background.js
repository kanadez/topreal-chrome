 // фоновый скрипт, на котором проихсходит прием данных от content.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {    
    switch (request.action) {
        case "open_yad2_newad":
           chrome.tabs.create({ url: request.url });
        break;
    }
});