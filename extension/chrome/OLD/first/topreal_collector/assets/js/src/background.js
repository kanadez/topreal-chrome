 // background script for all tabs, sedns commnads to content.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {  // open new tab if ad link on www.yad2.co.il/Nadlan/sales.php website cliecked
    switch (request.action) {
        case "open_yad2_newad":
           chrome.tabs.create({ url: request.url }); 
        break;
    }
});

chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse){ // listener for checking extension installed by current user
    if (request) {
        if (request.message) {
            if (request.message == "installed") {
                sendResponse({"installed":true});
            }
        }
    }
    return true;
});