 // фоновый скрипт, на котором проихсходит прием данных от content.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {    
    switch (request.action) {
        case "open_yad2_newad":
            chrome.tabs.create({ url: request.url });
            
            chrome.cookies.getAll({domain: "www.yad2.co.il"}, function(cookies) {
                for(var i=0; i<cookies.length;i++) {
                    chrome.cookies.remove({url: "http://www.yad2.co.il" + cookies[i].path, name: cookies[i].name});
                }
            });
            
            chrome.cookies.getAll({domain: ".yad2.co.il"}, function(cookies) {
                for(var i=0; i<cookies.length;i++) {
                    chrome.cookies.remove({url: "http://www.yad2.co.il" + cookies[i].path, name: cookies[i].name});
                }
            });
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