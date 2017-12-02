var was_opened = true; // тумблер, по которому проверка на открытие экстеншна больше одного раза

// фоновый скрипт, на котором проихсходит прием данных от content.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {    
    switch (request.action) {
        case "open_yad2_newad":
            chrome.tabs.create({ url: request.url });
            removeYad2Cookies();
        break;
        case "close_current_tab":
           chrome.tabs.remove(sender.tab.id, null);
           was_opened = true;
        break;
        case "remove_yad2_cookies":
           removeYad2Cookies();
        break;
        case "unset_was_opened":
            was_opened = false;
        break;
        case "check_was_opened":
            sendResponse(was_opened);
        break;
    }
});

chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse){ // listener for checking extension exist
    if (request) {
        if (request.message) {
            if (request.message == "installed") {
                sendResponse({"installed":true});
            }
            else if (request.message == "get_was_opened") {
                sendResponse({"was_opened":was_opened});
            }
        }
    }
    return true;
});

function removeYad2Cookies(){
    chrome.cookies.getAll({domain: "www.yad2.co.il"}, function(cookies) {
        for(var i=0; i<cookies.length;i++) {
            chrome.cookies.remove({url: "http://www.yad2.co.il" + cookies[i].path, name: cookies[i].name});
        }
        
        /*chrome.cookies.getAll({domain: "www.yad2.co.il"}, function(cookies) {
            console.log(cookies);
        });*/
    });

    chrome.cookies.getAll({domain: ".yad2.co.il"}, function(cookies) {
        for(var i=0; i<cookies.length;i++) {
            chrome.cookies.remove({url: "http://"+cookies[i].domain + cookies[i].path, name: cookies[i].name});
        }
        
        /*chrome.cookies.getAll({domain: ".yad2.co.il"}, function(cookies) {
            console.log(cookies);
        });*/
    });
    
    
}