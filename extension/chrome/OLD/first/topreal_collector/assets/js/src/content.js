// код, выполняемый на каждой отедльной веб-странице
// Description: extension collects text data from webpage selected by (now yad2.co.il website only supported) user and sends all collected data by XHR to topreal.top website for saving

var collector = new Collector(); // extension kernel object. Collects data
var turned_on = 0; // "extension swithed" flag
var default_collector = 33;// currently selected collector (may be some variations with different [arameters)

if (location.origin === "http://www.yad2.co.il" && (location.pathname === "/Nadlan/salesDetails.php" || location.pathname === "/Nadlan/rentDetails.php" || location.pathname === "/Nadlan/businessDetails.php")){ // if we are on Yad2 ad webpage
    toggleExtension();
}
else if (location.origin === "http://www.yad2.co.il" && (location.pathname === "/Nadlan/sales.php" || location.pathname === "/Nadlan/rent.php" || location.pathname === "/Nadlan/business.php")){ // if we are on Yad2 catalog webpage
    toggleExtension();
}

chrome.extension.onMessage.addListener(function (request, sender, sendResponse) { //  switch extension on from popup panel
    if (request.action == "toggle"){
        toggleExtension();
    }
    
    sendResponse({});
});

function toggleExtension(){ // switches extensin on or off
    if (turned_on === 1){
        stopExtension();
    }
    else{
        startExtension();
    }
}

function startExtension(){ // starts extension (showing main window for interaction)
    turned_on = 1;

    $(document.body).append( //  appending main window with jQuery UI
        '<div id="buttons_div" translate="no" title="אספן נתונים" style="display:none;text-align;center;">\n\
            <span id="user_message_span">פתח מספר טלפון ולחץ :פתח כרטיס</span>\n\
            <button class="builder_button" id="try_collector_button">פתח כרטיס</button>\n\
        </div>' 
    ).css("cursor","default");
	
    if (location.pathname !== "/Nadlan/salesDetails.php" && location.pathname !== "/Nadlan/rentDetails.php" && location.pathname !== "/Nadlan/businessDetails.php"){ // if we are NOT on the yad2 ad webpage
        $('#user_message_span').html('<span style="font-size:2em; width:100%; display:block; text-align: center;">בחר רשומה ופתח אותה</span>');
        $('#try_collector_button').hide();
    }

    document.body.onclick = function(ev){
        collector.parseYad2Click(ev.target);
        
        if (location.origin === "http://www.yad2.co.il" && (location.pathname === "/Nadlan/salesDetails.php" || location.pathname === "/Nadlan/rentDetails.php" || location.pathname === "/Nadlan/businessDetails.php")){ // blocking website click events if we are on yad2.co.il
            ev.preventDefault();
            ev.stopPropagation();
        }
    };

    $('#buttons_div').show().dialog({ // showing jquery ui main dialog
        width: 300,
        height: 190,
        dialogClass: 'buttons_dialog',
        position: { my: "right top", at: "right top", of: window },
        beforeClose: function(event, ui) {
            $('#buttons_div').hide();
        }
    });
    
    $('#try_collector_button').click(function(){
        collector.tryCollector(default_collector);
    });

    collector.getCollectors();
}

function stopExtension() { // stop extension and removing UI
    turned_on = 0;
    
    $('#buttons_div').dialog("destroy");
    $('#buttons_div').remove();
}