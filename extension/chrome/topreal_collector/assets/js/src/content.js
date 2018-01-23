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
var creating_property_anyway = false;
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
    if (collector.current.onSearchPage()){
        chrome.runtime.sendMessage({action: "unset_was_opened"});
    }
    
    if (turned_on === 1){
        stopExtension();
    }
    else{
        $.post(host+"/api/buildertmp/checksession.json", {}, function (response){
            if (response == true){
                chrome.runtime.sendMessage({action: "check_was_opened"}, function(response){
                    if (!response){
                        startExtension();
                    }
                });
            }
        });
    }
}

function startExtension(){ 
    turned_on = 1;
    
    /*$.post(host+"/api/proxy/getfresh.json", {}, function (response){
        chrome.runtime.sendMessage({action: "change_proxy", proxy: response});
    });*/
    
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
            height: 400,
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
        '<style>\n\
            #same_phone_card_exist_table {\n\
                border-collapse: collapse;\n\
            }\n\
            #same_phone_card_exist_table, #same_phone_card_exist_table th, #same_phone_card_exist_table td {\n\
                border: 1px solid white;\n\
            }\n\
        </style>\n\
        <div id="buttons_div" translate="no" locale_title="collector" title="Сборщик данных" style="text-align;center;">\n\
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
            <span id="no_phone_alert_span" style="color:yellow;display:none;font-size:0.8em;" locale="collector_msg2"></span>\n\
            <button class="builder_button" style="display:none;font-size:0.8em;" id="not_actual_property_button" locale="property_not_exist">Нужная недвижимость отсутствует</button>\n\
            <p></p><span style="font-size:0.8em;" locale="collector_msg3"></span>\n\
            <button class="builder_button" id="restart_collector_button" locale="restart_collector">Перезапустить сборщик</button>\n\
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
            <br><span locale="date_label">Дата</span>:&nbsp;<span id="existing_card_collect_date_span"></span>\n\
            <br><span locale="price_label">Цена</span>:&nbsp;<span id="existing_card_price_span"></span>\n\
            <br><span locale="address">Адрес</span>:&nbsp;<span id="existing_card_collect_address_span"></span>\n\
            <br><span locale="house_flat">Дом/Квартира</span>:&nbsp;<span id="existing_card_collect_house_flat_span"></span>\n\
            <br><span locale="floor_label">Этаж</span>:&nbsp;<span id="existing_card_collect_floor_span"></span>\n\
            <p></p><button locale="open_existing_card_ext_button" style="float:right;margin-bottom:10px;" id="open_existing_card_button">Открыть на TopReal</button>\n\
            <br><p></p><button locale="exit" style="float:right;margin-left:10px;" id="close_existing_card_button">Выход</button>\n\
            <!--<button locale="update_card" style="float:right;display:none;" id="update_existing_card_button">Обновить карточку</button>-->\n\
        </div>\n\
        <div id="same_phone_card_dialog" locale_title="warning_h4" title="Внимание" style="display:none;">\n\
            <span id="same_phone_card_exist_error_span" style="display:none;color:red;" locale="card_already_exist_error">Что-то пошло не так. Обновите страницу и попробуйте заново.</span>\n\
            <span id="same_phone_card_exist_success_span" style="display:none;" locale="card_already_exist_success">Карточка успешно обновлена. Нажмите "Выход".</span>\n\
            <span locale="same_phone_card_exist"></span>\n\
            <br><span locale="address"></span>&nbsp;<span class="address_translated"></span>\n\
            <table id="same_phone_card_exist_table">\n\
                <thead>\n\
                    <th locale="date_label"></th>\n\
                    <th locale="price_label"></th>\n\
                    <th locale="address"></th>\n\
                    <th>H/F</th>\n\
                    <th>Fl</th>\n\
                    <th>R</th>\n\
                    <th>S</th>\n\
                    <th></th>\n\
                </thead>\n\
                <tbody></tbody>\n\
            </table>\n\
            <!--<p></p><button locale="open_existing_card_ext_button" style="float:right;margin-bottom:10px;" id="open_same_phone_card_button">Открыть на TopReal</button>-->\n\
            <p></p><button locale="create_new_card_anyway" style="float:right;margin-bottom:10px;" id="create_new_card_anyway_button">Создать новую карточку</button>\n\
            <br><p></p><button locale="exit" style="float:right;margin-left:10px;" id="close_same_phone_card_button">Выход</button>\n\
            <!--<button locale="update_card" style="float:right;display:none;" id="update_same_phone_card_button">Обновить карточку</button>-->\n\
        </div>\n\
        <div id="not_auth_dialog" locale_title="warning_h4" title="Внимание" style="display:none;background:red;">\n\
            <span id="not_auth_error_span" locale="collector_msg1">Вы не авторизовались на topreal.top. Это необходимо для сбора данных.</span>\n\
            <p></p><button style="float:right;margin-left:10px;" id="close_not_auth_dialog_button">OK</button>\n\
        </div>\n\
        <div id="card_create_success_dialog" locale_title="success_label" title="Успешно!" style="display:none;background-color:#2cab2c;">\n\
            <span id="create_success_span" locale="property_successfully_created">Недвижимость успешно создана!</span>\n\
            <p></p><button style="float:right;margin-left:10px;" id="close_create_success_dialog_button">OK</button>\n\
        </div>\n\
        <div id="card_exist_ext_dialog" locale_title="warning_h4" title="Внимание" style="display:none;">\n\
            <span id="ext_card_already_exist_error_span" style="display:none;" locale="card_already_exist_error">Что-то пошло не так. Обновите страницу и попробуйте заново.</span>\n\
            <span id="ext_card_already_exist_success_span" style="display:none;" locale="ext_card_already_exist_success">Карточка успешно обновлена. Нажмите "OK".</span>\n\
            <span locale="card_already_exist"></span>\n\
            <br><span locale="date_label">Дата</span>:&nbsp;<span id="existing_card_ext_collect_date_span"></span>\n\
            <br><span locale="price_label">Цена</span>:&nbsp;<span id="existing_card_ext_price_span"></span>\n\
            <br><span locale="address">Адрес</span>:&nbsp;<span id="existing_card_ext_address_span"></span>\n\
            <br><span locale="floor_label">Этаж</span>:&nbsp;<span id="existing_card_ext_floor_span"></span>\n\
            <br><span locale="rooms_label">Комнаты</span>:&nbsp;<span id="existing_card_ext_rooms_span"></span>\n\
            <p></p><button style="float:right;margin-left:10px;" id="close_existing_card_ext_button">OK</button>\n\
            <!--<button locale="update_card" style="float:right;display:none;" id="update_existing_card_ext_button">Обновить карточку</button>-->\n\
            <button style="float:right;margin:0 10px;" id="open_existing_card_ext_button" locale="open_existing_card_ext_button">Открыть на TopReal</button>\n\
        </div>' 
    ).css("cursor","default");
    
    collector.current.afterLoad();
    
    if (collector.current.notOnAdsPage()){ //если НЕ на странице обявления Яд2
        $.post(host+"/api/proxy/getfresh.json", {}, function (response){
            chrome.runtime.sendMessage({action: "change_proxy", proxy: response});
        });
        
        $('#user_message_span').html('<span style="font-size:1.5em; width:100%; display:block;" locale="select_property_from_list">Выберите недвижимость из списка</span><br><span locale="it_ll_open_in_new_tab">Она откроется в новой вкладке</span>');
        $('#try_collector_button').hide();
        $('#not_actual_property_button').show();
        
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
    
    $('#close_existing_card_button, #close_same_phone_card_button').click(function(){
        //$("#card_exist_dialog").dialog("close");
        //chrome.runtime.sendMessage({action: "close_current_tab"});
        //window.close()
        //console.log(chrome)
        //chrome.tabs.getCurrent(function(tab) {
        //        console.log(tab);//chrome.tabs.remove(tab.id, function() { });
        //    });
        //chrome.runtime.sendMessage({action: "close_current_tab"});
        $('.ui-dialog[aria-describedby=card_exist_dialog], .ui-dialog[aria-describedby=same_phone_card_dialog]').hide();
        chrome.runtime.sendMessage({action: "close_current_tab"});
    });
    
    $('#close_create_success_dialog_button').click(function(){
        chrome.runtime.sendMessage({action: "close_current_tab"});
    });
    
    $('#close_existing_card_ext_button').click(function(){
        $('.ui-dialog[aria-describedby=card_exist_ext_dialog]').hide();
        chrome.runtime.sendMessage({action: "close_current_tab"});
    });
    
    $('#close_not_auth_dialog_button').click(function(){
        $('.ui-dialog[aria-describedby=not_auth_dialog]').hide();
    });

    $('#try_collector_button').click(function(){
        collector.checkSession();
    });
    
    $('#not_actual_property_button').click(function(){
        $.post(host+"/api/buildertmp/removeexternal.json", {
            external_id: getUrlParameter("topreal_external_property")
        }, function (response){
            chrome.runtime.sendMessage({action: "close_current_tab"});
        });
    });
    
    $('#create_new_card_anyway_button').click(function(){
        $('#create_new_card_anyway_button').attr("disabled", true).text("Подождите...");
        creating_property_anyway = true;
        collector.checkSession();
    });
    /*$.post(host+"/api/property/linkfromcollector.json", {
            
        }, function (response){
            chrome.runtime.sendMessage({action: "remove_yad2_cookies"});
            chrome.runtime.sendMessage({action: "change_proxy", proxy: response});
            location.reload();
        });*/
    
    $('#restart_collector_button').click(function(){
        $('#restart_collector_button').attr("disabled", true).text("Подождите...");
        
        $.post(host+"/api/proxy/getfresh.json", {}, function (response){
            chrome.runtime.sendMessage({action: "remove_yad2_cookies"});
            chrome.runtime.sendMessage({action: "change_proxy", proxy: response});
            location.reload();
        });
    });
    
    /*$('#test_proxy_button').click(function(){
        chrome.runtime.sendMessage({action: "set_test_proxy"});
    });*/
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

function getUrlParameter(parameter){
    var params_string = window.location.href.slice(window.location.href.indexOf('?') + 1);
    var params = params_string.split("&");
    var result = {};

    for (var i = 0; i < params.length; i++){
       var tmp = params[i].split("=");
       result[tmp[0]] = tmp[1];
    }

    return result[parameter];
}