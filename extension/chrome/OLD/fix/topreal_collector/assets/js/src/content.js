// код, выполняемый на каждой отедльной веб-странице
var test_mode = 1;  //  режим тестирования. если включен, работа происходит с dev.topreal.top. если нет - topreal.
var host = null;
var builder = new Builder();
var collector = new Collector();
var select_mode = 0; // 0 - selecting elements off, 1 - on
var turned_on = 0;
var no_translate_mode = 0;
var default_collector = 33;// сюда доджен читаться номер купленного и выбранного в Tools коллектора
//$('head').append("<script type='text/javascript' src='//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'>");
//var host = null;

if (location.origin === "http://www.yad2.co.il" && (location.pathname === "/Nadlan/salesDetails.php" || location.pathname === "/Nadlan/rentDetails.php" || location.pathname === "/Nadlan/businessDetails.php")){ // если НА странице обявления Яд2
    toggleExtension();
    select_mode = 0;
}
else if (location.origin === "http://www.yad2.co.il" && (location.pathname === "/Nadlan/sales.php" || location.pathname === "/Nadlan/rent.php" || location.pathname === "/Nadlan/business.php")){ // если НА странице каталога Яд2
    toggleExtension();
}

chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action == "toggle"){
        toggleExtension();
    }
    
    sendResponse({});
});

function toggleExtension(){
    if (turned_on === 1){
        stopExtension();
    }
    else{
        startExtension();
    }
}

function startExtension(){ 
    turned_on = 1;
    host = test_mode === 1 ? "http://dev.topreal.top" : "http://topreal.top";
    
    $(document).ready(function(){
        //window['_mstConfig'].floaterStylePath = '';

    });

    $(document.body).append(
        '<div id="buttons_div" translate="no" title="אספן נתונים" style="display:none;text-align;center;">\n\
            <button style="display:none" class="builder_button" id="show_collected_data_button">Show collected data</button>\n\
            <button style="display:none" class="builder_button" id="switch_select_mode_button">Switch select mode</button>\n\
            <button style="display:none" class="builder_button" id="create_builder_button">Create collector</button>\n\
            <button style="display:none" class="builder_button" id="choose_notranslate_button">Choose no-translate elements</button>\n\
            <input style="display:none" style="width:100%" id="upload_collector_locale_input" type="file" name="file" accept=".csv" multiple="multiple" data-url="'+host+'/storage/upload.php" />\n\
            <span id="upload_error_span" style="display:none"></span>\n\
            <p style="display:none;">Select collector:<br><span id="error_span"></span>\n\
            <select id="collector_select" style="display:none;"><option value="0">Select collector</option></select></p>\n\
            <span id="user_message_span">פתח מספר טלפון ולחץ :פתח כרטיס</span>\n\
			<button class="builder_button" id="try_collector_button">פתח כרטיס</button>\n\
            <a style="display:none" id="collector_locale_download_a" href="'+host+'/storage/collector_locale.csv" style="display:none;">Download collector locale</a>\n\
            <span style="display:none" id="download_error_span" style="display:none"></span>\n\
            <button style="display:none"  class="builder_button"  id="show_selected_elements_button">Show selected elements</button>\n\
            <button style="display:none"  class="builder_button"  id="show_collector_data_button">Show collector data</button>\n\
            <div id="preview_div" title="Creating collector links" style="display:none;"></div>\n\
            <div id="collector_result_div" title="Collected data preview" style="display:none;"></div>\n\
            <div id="save_dialog_div" title="Set collector name" style="display:none;"><label for="collector_name_input">Collector name:</label><input id="collector_name_input" /><p><button id="save_collector_button">Save</button><p><span id="save_response_span"></span></div>\n\
            <div id="choose_rule_dialog_div" title="Choose cut rule" style="display:none;">\n\
                <label for="rule_select">Rule:</label><select id="rule_select"></select>\n\
                <p><button id="apply_rule_button">Apply</button>\n\
                <p><span id="apply_response_span"></span>\n\
            </div>\n\
            <div id="yad2_container_div" style="display:none;"></div>' 
    ).css("cursor","default");
	
	if (location.pathname !== "/Nadlan/salesDetails.php" && location.pathname !== "/Nadlan/rentDetails.php" && location.pathname !== "/Nadlan/businessDetails.php"){ //если НЕ на странице обявления Яд2
		$('#user_message_span').html('<span style="font-size:2em; width:100%; display:block; text-align: center;">בחר רשומה ופתח אותה</span>');
		$('#try_collector_button').hide();
	}

    /*document.body.onmouseover = function(ev){
        if (!builder.elementExist(builder.getPathTo(ev.target)) && 
                select_mode == 1 && 
                $(ev.target).attr("translate") != "no" &&
                ev.target.className != "builder_button" &&
                $(ev.target).attr("id") != "MicrosoftTranslatorWidget" &&
                $(ev.target).attr("id") != "buttons_div"){
            ev.target.style.boxShadow = "0px 0px 5px red";
            ev.target.style.background = "white";
        }
        
        //console.log(ev.target.className)

        if ($(ev.target).attr("translate") == "no" && 
                $(ev.target).attr("id") != "MicrosoftTranslatorWidget" && 
                $(ev.target).attr("id") != "buttons_div" &&
                $(ev.target).attr("ms_panel") != "no"){
            $(ev.target).remove();
        }
    };*/

    /*document.body.onmouseout = function(ev){
        if (!builder.elementExist(builder.getPathTo(ev.target)) && 
                select_mode == 1 && 
                $(ev.target).attr("translate") != "no" &&
                ev.target.className != "builder_button" &&
                $(ev.target).attr("id") != "MicrosoftTranslatorWidget" &&
                $(ev.target).attr("id") != "buttons_div"){
            ev.target.style.boxShadow = "0px 0px 5px white";
        }
    };*/

    document.body.onclick = function(ev){
        
			builder.parseYad2Click(ev.target);
                    
		if (location.origin === "http://www.yad2.co.il" && (location.pathname === "/Nadlan/salesDetails.php" || location.pathname === "/Nadlan/rentDetails.php" || location.pathname === "/Nadlan/businessDetails.php")){
            ev.preventDefault();
            ev.stopPropagation();
		}
        
    };

    $('#buttons_div').show().dialog({
        width: 300,
        height: 190,
        dialogClass: 'buttons_dialog',
        position: { my: "left top", at: "left top", of: window },
        beforeClose: function( event, ui ) {
            $('#buttons_div').hide();
        }
    });
    
    $('#upload_collector_locale_input').fileupload({
        formData:{
            action: "upload_collector_locale"
        },
        done: function (e, data) {
            var obj = JSON.parse(data.result);

            if (obj.error != undefined){
                $('#upload_error_span').show().text(obj.error.description).show();
            }
            else{
                $('#upload_error_span').show().text("Successfully imported!");
            }
        }
    });

    $('#show_collected_data_button').click(function(){
        builder.showPreview();
    });

    $('#switch_select_mode_button').click(function(){
        switchSelectMode();
    });
    
    $('#choose_notranslate_button').click(function(){
        if (no_translate_mode == 0){
            no_translate_mode = 1;
        }
        else{
            no_translate_mode = 0;
        }
    });

    $('#create_builder_button').click(function(){
        builder.openCollectorDialog();
    });

    $('#save_collector_button').click(function(){
        builder.createCollector();
    });

    $('#try_collector_button').click(function(){
        builder.tryCollector();
    });
    
    $('#apply_rule_button').click(function(){
        var rule = $('#rule_select').val(); // здесь нужно будет сделать выбор правила из измененного селектора, а не жестко
        var key = $('#rule_select option:selected').attr("key");  // здесь тоже
        builder.separateFieldByRule(rule, key);
        $('#choose_rule_dialog_div').dialog("close");
    });
    
    //##################### стороительные леса ################################//

    $('#show_selected_elements_button').click(function(){
        console.log(builder.selected_elements);
    });

    $('#show_collector_data_button').click(function(){
        console.log(builder.collector_data);
    });

    //#########################################################################//

    builder.getCollectors();
}

function stopExtension() { 
    turned_on = 0;
    
    $('#buttons_div').dialog("destroy");
    $('#buttons_div').remove();
}

function switchSelectMode(){
    if (select_mode == 1)
        select_mode = 0;
    else select_mode = 1;
}