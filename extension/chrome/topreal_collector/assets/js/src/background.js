var was_opened = true; // тумблер, по которому проверка на открытие экстеншна больше одного раза
var t = 0;
var r = null;
var tab_id = null;

chrome.extension.onConnect.addListener(function(port) {
    port.onMessage.addListener(function(msg){
        resetProxy();
    });
});

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
        case "remove_yad2_cookies_force_restart":
           removeYad2CookiesOnForceRestart();
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
            r = request;
            tab_id = sender.tab.id;
            
            startProxy();
        break;
        case "set_test_proxy":
            var config = {
            mode: "fixed_servers",
            rules: {
                proxyForHttp: {
                    scheme: "http",
                    host: "127.0.0.1",
                    port: 8080
                },
                bypassList: ["topreal.top", "dev.topreal.top"]
            }
        };

        chrome.proxy.settings.set({value: config, scope: 'regular'}, function(){});
    }
});

chrome.proxy.onProxyError.addListener(function(d){
    resetProxy();
});

function resetProxy(){
    var xhr = new XMLHttpRequest();
    xhr.open('POST', "http://dev.topreal.top/api/proxy/getfresh.json", true);
    xhr.send();

    xhr.onreadystatechange = function() {
        if (xhr.readyState != 4) {
          return false;
        }

        if (xhr.status === 200){
            removeYad2Cookies();

            var parsed_response = JSON.parse(xhr.responseText);

            var config = {
                mode: "fixed_servers",
                rules: {
                    proxyForHttp: {
                        scheme: "http",
                        host: parsed_response.split(":")[0],
                        port: Number(parsed_response.split(":")[1])
                    },
                    bypassList: ["topreal.top", "dev.topreal.top"]
                }
            };

            chrome.proxy.settings.set({value: config, scope: 'regular'}, function(){});

            chrome.tabs.getSelected(null, function(tab) {
                var tabId = tab.id;
                tabUrl = tabId.url;

                chrome.tabs.reload(tabId, null, null);
            });
        }
    };
}

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

function startProxy(){
    var config = {
        mode: "fixed_servers",
        rules: {
            proxyForHttp: {
                scheme: "http",
                host: r.proxy.split(":")[0],
                port: Number(r.proxy.split(":")[1])
            },
            bypassList: ["topreal.top", "dev.topreal.top"]
        }
    };

    chrome.proxy.settings.set({value: config, scope: 'regular'}, function(){});
    r = null;
}

function stopProxy(){
    chrome.proxy.settings.clear({scope: 'regular'});
}

function removeYad2Cookies(){
    return false;
    
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

function removeYad2CookiesOnForceRestart(){
    clearCache();
    
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

function clearCache(){
      var millisecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
      var oneWeekAgo = (new Date()).getTime() - millisecondsPerWeek;
      chrome.browsingData.remove({
        "since": oneWeekAgo
      }, {
        "appcache": true,
        "cache": true,
        "cookies": false,
        "downloads": false,
        "fileSystems": true,
        "formData": false,
        "history": false,
        "indexedDB": true,
        "localStorage": true,
        "pluginData": true,
        "passwords": false,
        "webSQL": true
      }, function(){});
}