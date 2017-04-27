// код, выполняемый на каждой отедльной веб-странице

var builder = new Builder();
var collector = new Collector();
var select_mode = 0; // 0 - selecting elements off, 1 - on
var select_fields_mode = 0; // 0 - selecting elements labels off, 1 - on
var select_checkbox_mode = 0; // тумблер режима выбора чекбоксов
var select_checkbox_mode_type = -1; // -1 = выключено, 0 = нечекнутый, 1 = чекнутый (какой чекбокс сейчас выбирается для определения)
var select_checkbox_data_mode = 0; // тумблер режима выбора данных чекбоксов
var select_for_show_xpath = 0; // тумблер для дебжжной ф-ии показа xpath элемента по клику
var turned_on = 0;
var no_translate_mode = 0;

/*var port = chrome.runtime.connect({name: "knockknock"});
port.postMessage({joke: "Knock knock"});
port.onMessage.addListener(function(msg) {
  if (msg.question == "Who's there?"){
      console.log(msg.question)
    port.postMessage({answer: "Madame"});
    }
  else if (msg.question == "Madame who?")
    port.postMessage({answer: "Madame... Bovary"});
});
$('head').append('<script>chrome.runtime.onConnect.addListener(function(port) {console.assert(port.name == "knockknock");port.onMessage.addListener(function(msg) {if (msg.joke == "Knock knock")port.postMessage({question: "Whos there?"});else if (msg.answer == "Madame")port.postMessage({question: "Madame who?"});else if (msg.answer == "Madame... Bovary")port.postMessage({question: "I dont get it."});});});</script>');
*/
/*window.addEventListener("message", function(event) {
    // We only accept messages from ourselves
    if (event.source != window)
        return;

    if (event.data.type && (event.data.type == "FROM_PAGE")) {
        console.log("Content script received: " + event.data.text);
        
    }
}, false);*/

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
    
    $(document).ready(function(){
        //window['_mstConfig'].floaterStylePath = '';

    });

    $(document.body).append(
        '<div id="buttons_div" translate="no" title="TopReal Builder" style="display:none;text-align;center;">\n\
            <p>Building:<br>\n\
            <button class="builder_button" id="show_collected_data_button">Show collected data</button>\n\
            <button class="builder_button" id="switch_select_mode_button">On data select mode</button>\n\
            <button class="builder_button" id="switch_select_fields_mode_button">On fields select mode</button>\n\
            <button class="builder_button" id="create_builder_button">Create collector</button>\n\
            <!--<button class="builder_button" id="choose_notranslate_button">Choose no-translate elements</button>-->\n\
            <input style="width:100%" id="upload_collector_locale_input" type="file" name="file" accept=".csv" multiple="multiple" data-url="http://topreal.top/storage/upload.php" />\n\
            <span id="upload_error_span" style="display:none"></span>\n\
            <button class="builder_button" id="define_checkbox_button">Define checkbox</button>\n\
            <button class="builder_button" id="on_checkbox_select_mode_button">On checkbox select mode</button>\n\
            <p>Testing:<br><span id="error_span"></span>\n\
            <select id="collector_select"><option value="0">Select collector</option></select>\n\
            <button class="builder_button" id="try_collector_button">Collect data</button>\n\
            <a id="collector_locale_download_a" href="http://topreal.top/storage/collector_locale.csv" style="display:none;">Download collector locale</a>\n\
            <span id="download_error_span" style="display:none"></span>\n\
            <p>Debug:<br><button class="builder_button"  id="show_selected_elements_button">Show selected elements</button>\n\
            <button class="builder_button"  id="show_element_xpath_button">Show element xpath</button>\n\
            <button class="builder_button"  id="show_collector_data_button">Show collector data</button>\n\
            <button class="builder_button"  id="show_mst_button">Show mst data</button>\n\
            <button class="builder_button"  id="create_property_button">Create property</button>\n\
            <div id="preview_div" title="Creating collector links" style="display:none;"></div>\n\
            <div id="collector_result_div" title="Collected data preview" style="display:none;"></div>\n\
            <div id="save_dialog_div" title="Set collector name" style="display:none;"><label for="collector_name_input">Collector name:</label><input id="collector_name_input" /><p><button id="save_collector_button">Save</button><p><span id="save_response_span"></span></div>\n\
            <div id="choose_rule_dialog_div" title="Choose cut rule" style="display:none;">\n\
                <label for="rule_select">Rule:</label><select id="rule_select"></select>\n\
                <p><button id="apply_rule_button">Apply</button>\n\
                <p><span id="apply_response_span"></span>\n\
            </div>\n\
            <div id="define_checkbox_dialog_div" title="Define checkbox" style="display:none;">\n\
                <button id="select_checked_button" class="builder_button" style="width:100%">Select checked</button>\n\
                <p><button id="select_unchecked_button" class="builder_button" style="width:100%">Select unchecked</button>\n\
            </div>\n\
            <div id="yad2_container_div" style="display:none;"></div>' 
    ).css("cursor","default");

    document.body.onmouseover = function(ev){
        if (select_mode === 1){ // режим выбора данных
            if (
                    !builder.elementExist(builder.getPathTo(ev.target)) && 
                    ev.target.className != "builder_button" &&
                    $(ev.target).attr("id") != "buttons_div"
            ){
                ev.target.style.boxShadow = "0px 0px 5px red";
                //.ev.target.style.background = "white";
            }
        }
        else if (select_fields_mode === 1){ //  режим выбора полей данных
            if (
                    !builder.fieldExist(builder.getDataOf(ev.target)) && 
                    ev.target.className != "builder_button" &&
                    $(ev.target).attr("id") != "buttons_div"
            ){
                ev.target.style.boxShadow = "0px 0px 5px orange";
                //ev.target.style.background = "white";
            }
        }
        else if (select_checkbox_mode === 1){ // режим выбора чекбокса для его опредеения
            if (ev.target.className != "builder_button"){
                ev.target.style.boxShadow = "0px 0px 5px blue";
            }
        }
        else if (select_for_show_xpath === 1){ // режим показа xpath элемента
            ev.target.style.boxShadow = "0px 0px 5px green";
        }
    };

    document.body.onmouseout = function(ev){
        if (select_mode === 1){ // режим выбора данных
            if (
                    !builder.elementExist(builder.getPathTo(ev.target)) &&
                    ev.target.className != "builder_button" &&
                    $(ev.target).attr("id") != "buttons_div"
            ){
                ev.target.style.boxShadow = "0px 0px 5px white";
            }
        }
        else if (select_fields_mode === 1){ //  режим выбора полей данных
            if (
                    !builder.fieldExist(builder.getDataOf(ev.target)) &&
                    ev.target.className != "builder_button" &&
                    $(ev.target).attr("id") != "buttons_div"
            ){
                ev.target.style.boxShadow = "0px 0px 5px white";
            }
        }
        else if (select_checkbox_mode === 1){ // режим выбора чекбокса для его опредеения
            if (ev.target.className != "builder_button"){
                ev.target.style.boxShadow = "0px 0px 5px white";
            }
        }
        else if (select_for_show_xpath === 1){ // режим показа xpath элемента
            ev.target.style.boxShadow = "0px 0px 5px white";
        }
    };

    document.body.onclick = function(ev){
        if (select_mode === 1){  // режим выбора данных
            if (
                    ev.target.id != "show_collected_data_button" && 
                    ev.target.id != "switch_select_mode_button" &&
                    ev.target.className != "builder_button"
                ){
                switch (location.host) {
                    case "www.yad2.co.il":  // если находимся на Yad2
                        if (location.pathname == "/Nadlan/salesDetails.php"){
                            if (select_checkbox_data_mode === 1){ // режим выбора данных чекбоксов
                                builder.selectCheckbox(ev.target);
                            }
                            else{ // режим выбора данных
                                builder.selectElement(ev.target);
                            }
                        }
                        else{ // парсим клик по обявлению на Яд2
                            builder.parseYad2Click(ev.target);
                        }
                    break;
                    default:
                        if (select_checkbox_data_mode === 1){
                            builder.selectCheckbox(ev.target);
                        }
                        else{
                            builder.selectElement(ev.target);
                        }
                    break;
                }

                ev.preventDefault();
                ev.stopPropagation();
            }
        }
        else if (select_fields_mode === 1){
            if (
                    ev.target.id != "show_collected_data_button" && 
                    ev.target.id != "switch_select_mode_button" &&
                    ev.target.className != "builder_button"
                ){
                switch (location.host) {
                    case "www.yad2.co.il":  // именно поэтому не работает выделение для no-translate
                        if (location.pathname == "/Nadlan/salesDetails.php"){
                            builder.selectElementField(ev.target);
                        }
                        else{
                            builder.parseYad2Click(ev.target);
                        }
                    break;
                    default:
                        builder.selectElementField(ev.target);
                    break;
                }

                ev.preventDefault();
                ev.stopPropagation();
            }
        }
        else if (select_checkbox_mode === 1){
            if (
                    ev.target.id != "show_collected_data_button" && 
                    ev.target.id != "switch_select_mode_button" &&
                    ev.target.className != "builder_button"
                ){
                builder.defineCheckbox(ev.target);
                
                ev.preventDefault();
                ev.stopPropagation();
            }
        }
        else if (select_for_show_xpath === 1){
            if (ev.target.className != "builder_button"){
                console.log(builder.getPathTo(ev.target));

                ev.preventDefault();
                ev.stopPropagation();
            }
        }
    };

    $('#buttons_div').show().dialog({
        width: 300,
        height: 700,
        dialogClass: 'buttons_dialog',
        position: { my: "right top", at: "right top", of: window },
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
    
    $('#switch_select_fields_mode_button').click(function(){
        switchSelectFieldsMode();
    });

    $('#create_builder_button').click(function(){
        builder.openCollectorDialog();
    });
    
    $('#define_checkbox_button').click(function(){
        $('#define_checkbox_dialog_div').show().dialog({
            width: 300,
            height: 180,
            position: { my: "center", at: "center", of: window },
            beforeClose: function( event, ui ) {
                $('#define_checkbox_dialog_div').hide();
            }
        });
    });
    
    $('#select_checked_button').click(function(){
        if (select_mode === 1 ){
            switchSelectMode();
        }
        else if (select_fields_mode === 1){
            switchSelectFieldsMode();
        }
        
        select_checkbox_mode = 1;
        select_checkbox_mode_type = 1;
    });
    
    $('#select_unchecked_button').click(function(){
        if (select_mode === 1 ){
            switchSelectMode();
        }
        else if (select_fields_mode === 1){
            switchSelectFieldsMode();
        }
        
        select_checkbox_mode = 1;
        select_checkbox_mode_type = 0;
    });
    
    $('#on_checkbox_select_mode_button').click(function(){
        switchSelectCheckboxMode();
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
    $('#show_element_xpath_button').click(function(){
        switchSelectXpathMode();
    });

    $('#show_selected_elements_button').click(function(){
        console.log(builder.selected_elements);
    });

    $('#show_collector_data_button').click(function(){
        console.log(builder.collector_data);
    });
    
    $('#show_mst_button').click(function(){
        chrome.runtime.connect().postMessage("event.data.text");
    });
    
    $('#create_property_button').click(function(){
        collector.createProperty();
    });
    //#########################################################################//

    builder.getCollectors();
    console.log(window);
    //chrome.runtime.sendMessage({action: "mst_translate"});
}

function stopExtension() { 
    turned_on = 0;
    
    $('#buttons_div').dialog("destroy");
    $('#buttons_div').remove();
}

function switchSelectMode(){
    if (select_mode === 1){
        select_mode = 0;
        $('#switch_select_mode_button').text("On data select mode");
    }
    else{ 
        select_mode = 1;
        $('#switch_select_mode_button').text("Off data select mode");
        
        if (select_fields_mode === 1){
            switchSelectFieldsMode();
        }
    }
}

function switchSelectFieldsMode(){
    if (select_fields_mode === 1){
        select_fields_mode = 0;
        $('#switch_select_fields_mode_button').text("On fields select mode");
    }
    else{
        select_fields_mode = 1;
        $('#switch_select_fields_mode_button').text("Off fields select mode");
        
        if (select_mode === 1){
            switchSelectMode();
        }
    }
}

function switchSelectCheckboxMode(){
    if (select_checkbox_data_mode === 1){
        select_checkbox_data_mode = 0;
        $('#on_checkbox_select_mode_button').text("On checkbox select mode");
    }
    else{
        select_checkbox_data_mode = 1;
        $('#on_checkbox_select_mode_button').text("Off checkbox select mode");
    }
}

function switchSelectXpathMode(){
    if (select_for_show_xpath === 0){
        select_for_show_xpath = 1;
        $('#show_element_xpath_button').text("Off select element Xpath mode");
    }
    else{
        select_for_show_xpath = 0;
        $('#show_element_xpath_button').text("On select element Xpath mode");
    }
};