// код, выполняемый на каждой отедльной веб-странице
var test_mode = 0;  //  режим тестирования. если включен, работа происходит с dev.topreal.top. если нет - topreal.
var host = test_mode === 1 ? "http://dev.topreal.top" : "https://topreal.top";
var localization = new Localization();
var utils = new Utils();
var collector = new Collector(); // здесь нуно будет вставлять номер коллектора зависимо от выбранного юзером. пока фиксированно
var select_mode = 0; // 0 - selecting elements off, 1 - on
var turned_on = 0;
var no_translate_mode = 0;
var default_collector = 33;// сюда доджен читаться номер купленного и выбранного в Tools коллектора
var locale = null;
//$('head').append("<script type='text/javascript' src='//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'>");
//var host = null;

if (collector.current !== null){ // если хотя бы один из коллекторов активизировался
    if (collector.current.onAdsPage()){ // если НА странице обявления Яд2
        toggleExtension();
        select_mode = 0;
    }
    else if (collector.current.onCatalogPage()){ // если НА странице каталога Яд2
        toggleExtension();
    }

    chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.action == "toggle"){
            toggleExtension();
        }

        sendResponse({});
    });
}

function toggleExtension(){
    if (turned_on === 1){
        stopExtension();
    }
    else{
        $.post(host+"/api/buildertmp/checksession.json", {}, function (response){
            if (response == true){
                startExtension();
            }
        });
    }
}

function startExtension(){ 
    turned_on = 1;
    
    //if (location.pathname !== "/Nadlan/salesDetails.php" && location.pathname !== "/Nadlan/rentDetails.php" && location.pathname !== "/Nadlan/businessDetails.php"){ //если НЕ на странице обявления Яд2
        //$(collector.getElementByXPath("HTML/BODY/DIV[7]")).remove();
        //$(collector.getElementByXPath("HTML/BODY/DIV[8]")).remove();
        //$(collector.getElementByXPath("HTML/BODY/DIV[9]/DIV[8]")).remove();
        //$(collector.getElementByXPath("HTML/BODY/DIV[9]/DIV[13]/DIV[1]/DIV[1]/TABLE[1]/TBODY[1]/TR[1]/TD[2]/DIV[1]")).remove();
        //$('#rtower, #Hotpics, #ad_martef, #bottom_banner___ID___1').remove();
    //}
    
    $.post(host+"/api/defaults/getlocale.json", {}, function (response){
        locale = response;
        localization.setLocale(response);
        
        $('#buttons_div').show().dialog({
            width: 300,
            height: 270,
            dialogClass: 'buttons_dialog',
            position: { my: "left top+50", at: "left top+50", of: window },
            beforeClose: function( event, ui ) {
                $('#buttons_div').hide();
            }
        });
        
        collector.current.advStyle();
        $('.ui-dialog-title').attr("locale", "collector");
        localization.toLocale();
    });
    
    $(document).ready(function(){
        if (collector.current.notOnAdsPage()){ //если НЕ на странице обявления Яд2
            collector.current.getExistCards();
        }
    });

    $(document.body).append(
        '<div id="buttons_div" translate="no" locale_title="collector" title="Сборщик данных" style="text-align;center;">\n\
            <button style="display:none" class="builder_button" id="show_collected_data_button">Show collected data</button>\n\
            <button style="display:none" class="builder_button" id="switch_select_mode_button">Switch select mode</button>\n\
            <button style="display:none" class="builder_button" id="create_builder_button">Create collector</button>\n\
            <button style="display:none" class="builder_button" id="choose_notranslate_button">Choose no-translate elements</button>\n\
            <input style="display:none" style="width:100%" id="upload_collector_locale_input" type="file" name="file" accept=".csv" multiple="multiple" data-url="'+host+'/storage/upload.php" />\n\
            <span id="upload_error_span" style="display:none"></span>\n\
            <p style="display:none;">Select collector:<br><span id="error_span"></span>\n\
            <select id="collector_select" style="display:none;"><option value="0">Select collector</option></select></p>\n\
            <span id="user_message_span"><span locale="open_phone_and_click">Откройте номер телефона и нажмите:</span></span>\n\
            <button class="builder_button" id="try_collector_button" locale="collector_create_card">Создать карточку</button>\n\
            <a style="display:none" id="collector_locale_download_a" href="'+host+'/storage/collector_locale.csv" style="display:none;">Download collector locale</a>\n\
            <span style="display:none" id="download_error_span" style="display:none"></span>\n\
            <button style="display:none"  class="builder_button"  id="show_selected_elements_button">Show selected elements</button>\n\
            <button style="display:none"  class="builder_button"  id="show_collector_data_button">Show collector data</button>\n\
            <div id="preview_div" title="Creating collector links" style="display:none;"></div>\n\
            <div id="collector_result_div" title="Collected data preview"></div>\n\
            <div id="collector_buffer_div" style="display:none;"></div>\n\
            <div id="save_dialog_div" title="Set collector name" style="display:none;"><label for="collector_name_input">Collector name:</label><input id="collector_name_input" /><p><button id="save_collector_button">Save</button><p><span id="save_response_span"></span></div>\n\
            <div id="choose_rule_dialog_div" title="Choose cut rule" style="display:none;">\n\
            <label for="rule_select">Rule:</label><select id="rule_select"></select>\n\
            <p><button id="apply_rule_button">Apply</button>\n\
            <p><span id="apply_response_span"></span>\n\
        </div>\n\
        <div id="yad2_container_div" style="display:none;"></div>\n\
        <div id="card_exist_dialog" locale_title="warning_h4" title="Внимание" style="display:none;">\n\
            <span id="card_already_exist_error_span" style="display:none;" locale="card_already_exist_error">Что-то пошло не так. Обновите страницу и попробуйте заново.</span>\n\
            <span id="card_already_exist_success_span" style="display:none;" locale="card_already_exist_success">Карточка успешно обновлена. Нажмите "Выход".</span>\n\
            <span locale="card_already_exist"></span>\n\
            <br><span locale="date_label">Дата</span>&nbsp;<span id="existing_card_collect_date_span"></span>\n\
            <br><span locale="price_label">Цена</span>&nbsp;<span id="existing_card_price_span"></span>\n\
            <br><span locale="address">Адрес</span>&nbsp;<span id="existing_card_collect_address_span"></span>\n\
            <p></p><button locale="open_existing_card_ext_button" style="float:right;margin-bottom:10px;" id="open_existing_card_button">Открыть на TopReal</button>\n\
            <br><p></p><button locale="exit" style="float:right;margin-left:10px;" id="close_existing_card_button">Выход</button>\n\
            <button locale="update_card" style="float:right;display:none;" id="update_existing_card_button">Обновить карточку</button>\n\
        </div>\n\
        <div id="not_auth_dialog" locale_title="warning_h4" title="Внимание" style="display:none;background:red;">\n\
            <span id="not_auth_error_span" locale="collector_msg1">Вы не авторизовались на topreal.top. Это необходимо для сбора данных.</span>\n\
            <p></p><button style="float:right;margin-left:10px;" id="close_not_auth_dialog_button">OK</button>\n\
        </div>\n\
        <div id="card_exist_ext_dialog" locale_title="warning_h4" title="Внимание" style="display:none;">\n\
            <span id="ext_card_already_exist_error_span" style="display:none;" locale="card_already_exist_error">Что-то пошло не так. Обновите страницу и попробуйте заново.</span>\n\
            <span id="ext_card_already_exist_success_span" style="display:none;" locale="ext_card_already_exist_success">Карточка успешно обновлена. Нажмите "OK".</span>\n\
            <span locale="card_already_exist"></span>\n\
            <br><span locale="date_label">Дата</span>&nbsp;<span id="existing_card_ext_collect_date_span"></span>\n\
            <br><span locale="price_label">Цена</span>&nbsp;<span id="existing_card_ext_price_span"></span>\n\
            <br><span locale="address">Адрес</span>&nbsp;<span id="existing_card_ext_address_span"></span>\n\
            <p></p><button style="float:right;margin-left:10px;" id="close_existing_card_ext_button">OK</button>\n\
            <button locale="update_card" style="float:right;display:none;" id="update_existing_card_ext_button">Обновить карточку</button>\n\
            <button style="float:right;margin:0 10px;" id="open_existing_card_ext_button" locale="open_existing_card_ext_button">Открыть на TopReal</button>\n\
        </div>' 
    ).css("cursor","default");
    
    collector.current.afterLoad();
    
    if (collector.current.notOnAdsPage()){ //если НЕ на странице обявления Яд2
        $('#user_message_span').html('<span style="font-size:1.5em; width:100%; display:block;" locale="select_property_from_list">Выберите недвижимость из списка</span><br><span locale="it_ll_open_in_new_tab">Она откроется в новой вкладке</span>');
        $('#try_collector_button').hide();
        
        $.post(host+"/api/buildertmp/getstatforagent.json", {}, function (response){
            if (response != -1){
                $('#user_message_span').append('<p></p><span locale="collected_today">Собрано сегодня</span>:&nbsp;<span id="collected_today_counter_span">'+response[0]+'</span>');
                $('#user_message_span').append('<br><span locale="collected_for_month">Собрано за месяц</span>:&nbsp;<span id="collected_for_month_counter_span">'+response[1]+'</span>');
                $('#user_message_span').append('<br><span locale="collected_total">Собрано всего</span>:&nbsp;<span id="collected_total_counter_span">'+response[2]+'</span>');
                $('#user_message_span').append('<br><span locale="updated_today">Обновлено сегодня</span>:&nbsp;<span id="">'+response[3]+'</span>');
                $('#user_message_span').append('<br><span locale="updated_for_month">Обновлено за месяц</span>:&nbsp;<span id="">'+response[4]+'</span>');
                $('#user_message_span').append('<br><span locale="updated_total">Обновлено всего</span>:&nbsp;<span id="">'+response[5]+'</span>');
            }
        });
    }
    
    document.body.onclick = function(ev){
        if (collector.current.onAdsPage()){
            ev.preventDefault();
            ev.stopPropagation();
        }
        else{
            collector.current.parseCatalogClick(ev.target);
        }
    };
    
    $('#close_existing_card_button').click(function(){
        //$("#card_exist_dialog").dialog("close");
        //chrome.runtime.sendMessage({action: "close_current_tab"});
        //window.close()
        //console.log(chrome)
        //chrome.tabs.getCurrent(function(tab) {
        //        console.log(tab);//chrome.tabs.remove(tab.id, function() { });
        //    });
        //chrome.runtime.sendMessage({action: "close_current_tab"});
        $('.ui-dialog[aria-describedby=card_exist_dialog]').hide();
    });
    
    $('#close_existing_card_ext_button').click(function(){
        $('.ui-dialog[aria-describedby=card_exist_ext_dialog]').hide();
    });
    
    $('#close_not_auth_dialog_button').click(function(){
        $('.ui-dialog[aria-describedby=not_auth_dialog]').hide();
    });

    $('#try_collector_button').click(function(){
        collector.checkSession();
    });
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