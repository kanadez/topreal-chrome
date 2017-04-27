/* // фоновый скрипт, на котором проихсходит прием данных от content.js
chrome.runtime.onMessage.addListener(
function(request, sender, sendResponse) {
    var a = request.site; // данные о сайте
    var b = request.time; // данные о проведенном времени
    // тут делаем с этими данными что хотим.
});*/