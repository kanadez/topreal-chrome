var was_opened = true; // тумблер, по которому проверка на открытие экстеншна больше одного раза
var t = 0;

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
           //chrome.proxy.settings.clear({scope: 'regular'});
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
        case "change_proxy":
            clearTimeout(t);
            t = setTimeout("stopProxy()", 600000);
            var config = {
                mode: "fixed_servers",
                rules: {
                    proxyForHttp: {
                        scheme: "http",
                        host: request.proxy.split(":")[0],
                        port: Number(request.proxy.split(":")[1])
                    },
                    bypassList: ["topreal.top", "dev.topreal.top"]
                }
            };

            chrome.proxy.settings.set({value: config, scope: 'regular'}, function(){});
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

function stopProxy(){
    chrome.proxy.settings.clear({scope: 'regular'});
}

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