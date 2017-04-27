chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action:'toggle'}, function(response) {
        console.log('Toggle action sent');
    });
});

window.close();


