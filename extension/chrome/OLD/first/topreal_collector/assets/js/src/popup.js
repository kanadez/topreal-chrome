chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) { // sends toggle message to content.js on popup open (if extension button clicked)
    chrome.tabs.sendMessage(tabs[0].id, {action:'toggle'}, function(response){});
});

window.close();


