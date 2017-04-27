$('#embed_button').click(function(){
    chrome.runtime.sendMessage({site:location.href});
});