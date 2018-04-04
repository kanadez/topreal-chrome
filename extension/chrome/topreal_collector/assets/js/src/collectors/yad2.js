function Yad2(){
    this.values_for_compare = null;
    
    this.onAdsPage = function(){
        if (location.origin === "http://www.yad2.co.il" && (location.pathname === "/Nadlan/salesDetails.php" || location.pathname === "/Nadlan/rentDetails.php" || location.pathname === "/Nadlan/businessDetails.php")){
            chrome.runtime.sendMessage({action: "remove_yad2_cookies"});
            return true;
        }
        else{
            return false;
        }
    };
    
    this.onCatalogPage = function(){
        if (location.origin === "http://www.yad2.co.il" && (location.pathname === "/Nadlan/sales.php" || location.pathname === "/Nadlan/rent.php" || location.pathname === "/Nadlan/business.php")){
            return true;
        }
        else{
            return false;
        }
    };
    
    this.notOnAdsPage = function(){
        if (location.pathname !== "/Nadlan/salesDetails.php" && location.pathname !== "/Nadlan/rentDetails.php" && location.pathname !== "/Nadlan/businessDetails.php"){
            return true;
        }
        else{
            return false;
        }
    };
    
    this.onSearchPage = function(){
        if (utils.stringContains(location.search, "multiSearch")){
            return true;
        }
        else{
            return false;
        }
    };
    
    this.collectData = function(){
        var frameElem = $(document).children().html();
        var isSale = true;
        var types = "";
        
        if (utils.stringContains(frameElem, "להצגת המספר")){
            //alert(localization.getVariable("collector_msg2"));
            $('#no_phone_alert_span').show();
            return 0;
        }
        else{
            $('#no_phone_alert_span').hide();
        }
        
        var value = types = this.TryParseFrameValue(frameElem, "סוג הנכס:");// парсим аскрипшн
        
        if (utils.isNullOrEmpty(value)){ // если парсинг не дал ничего
            return "";
        }
        
        
        if (utils.stringContains(types, "השכרה")){ // если в результатах парсинга есть Аренда
            //var parts = types.split(" "); // делим по пробелам результат
            
            //if (parts.length < 1){
            //    return ""; // если после разделения нуль или меньше двух частей то уходим
            //}
            
            isSale = false; // не продажа сейчас (аренда)
            //value = parts[0]; // значение парсинга = 1 разбитая часть
        }

        var values = {};
        values["yad2_subcat_id"] = utils.getUrlParameter("SubCatID");
        values["remarks_text"] = "";
        values["collector_suffix"] = "hex";

        if (utils.stringContains(value, "דירה")){ // если распарсеный аскрипшн содержит Коттедж
            value = "apartment"; // то значение парсинга = Коттедж
        }
        else if (utils.stringContains(value, "דירת גן")){
            value = "garden_apartment";
            //lot_flag = true;
        }
        else if (utils.stringContains(value, "גג/פנטהאוז")){
            value = "penthouse";
        }
        else if (utils.stringContains(value, "סטודיו/לופט")){
            value = "studio";
        }
        else if (utils.stringContains(value, "דירת נופש")){
            value = "camp";
        }
        else if (utils.stringContains(value, "מרתף/פרטר")){
            value = "other";
            values["remarks_text"] += "סוג הנכס: "+"מרתף/פרטר"+"\n";
        }
        else if (utils.stringContains(value, "דופלקס")){
            value = "duplex";
        }
        else if (utils.stringContains(value, "טריפלקס")){
            value = "duplex_plus";
        }
        else if (utils.stringContains(value, "פרטי/קוטג'")){
            value = "cottage";
        }
        else if (utils.stringContains(value, "דו משפחתי")){
            value = "house";
        }
        else if (utils.stringContains(value, "יחידת דיור")){
            value = "other";
            values["remarks_text"] += "סוג הנכס: "+"יחידת דיור"+"\n";
        }
        else if (utils.stringContains(value, "משק חקלאי/נחלה")){
            value = "farm";
        }
        else if (utils.stringContains(value, "משק עזר")){
            value = "other";
            values["remarks_text"] += "סוג הנכס: "+"משק עזר"+"\n";
        }
        else if (utils.stringContains(value, "מחסן")){
            value = "warehouse";
        }
        else if (utils.stringContains(value, "חניה")){
            value = "other";
            values["remarks_text"] += "סוג הנכס: "+"חניה"+"\n";
        }
        else if (utils.stringContains(value, "מבנים ניידים/קרוואן")){
            value = "other";
            values["remarks_text"] += "סוג הנכס: "+"מבנים ניידים/קרוואן"+"\n";
        }
        else if (utils.stringContains(value, "מגרשים")){
            value = "land";
        }
        else if (utils.stringContains(value, "בניין מגורים")){
            value = "house";
            values["remarks_text"] += "סוג הנכס: "+"בניין מגורים"+"\n";
        }
        else if (utils.stringContains(value, "קב' רכישה/ זכות לנכס")){
            value = "other";
            values["remarks_text"] += "סוג הנכס: "+"קב' רכישה/ זכות לנכס"+"\n";
        }
        else if (utils.stringContains(value, "כללי")){
            value = "other";
            values["remarks_text"] += "סוג הנכס: "+"כללי"+"\n";
        }
        else if (utils.stringContains(value, "סאבלט")){
            value = "other";
            values["remarks_text"] += "סוג הנכס: "+"סאבלט"+"\n";
        }
        else if (utils.stringContains(value, "החלפת הדירות")){
            value = "other";
            values["remarks_text"] += "סוג הנכס: "+"החלפת הדירות"+"\n";
        }
        else if (utils.stringContains(value, "אולמות")){
            value = "other";
            values["remarks_text"] += "סוג הנכס: "+"אולמות"+"\n";
        }
        else if (utils.stringContains(value, "בניין משרדים")){
            value = "office";
            values["remarks_text"] += "סוג הנכס: "+"בניין משרדים"+"\n";
        }
        else if (utils.stringContains(value, "חנויות/שטח מסחרי")){
            value = "store";
            values["remarks_text"] += "סוג הנכס: "+"חנויות/שטח מסחרי"+"\n";
        }
        else if (utils.stringContains(value, "חניון")){
            value = "other";
            values["remarks_text"] += "סוג הנכס: "+"חניון"+"\n";
        }
        else if (utils.stringContains(value, "מבני תעשיה")){
            value = "commercial";
            values["remarks_text"] += "סוג הנכס: "+"מבני תעשיה"+"\n";
        }
        else if (utils.stringContains(value, "מחסנים")){
            value = "warehouse";
            values["remarks_text"] += "סוג הנכס: "+"מחסנים"+"\n";
        }
        else if (utils.stringContains(value, "מרתף")){
            value = "other";
            values["remarks_text"] += "סוג הנכס: "+"מרתף"+"\n";
        }
        else if (utils.stringContains(value, "משק חקלאי")){
            value = "farm";
            values["remarks_text"] += "סוג הנכס: "+"משק חקלאי"+"\n";
        }
        else if (utils.stringContains(value, "משרדים")){
            value = "office";
            values["remarks_text"] += "סוג הנכס: "+"משרדים"+"\n";
        }
        else if (utils.stringContains(value, "נחלה")){
            value = "other";
            values["remarks_text"] += "סוג הנכס: "+"נחלה"+"\n";
        }
        else if (utils.stringContains(value, "עסקים למכירה")){
            value = "commercial";
            values["remarks_text"] += "סוג הנכס: "+"עסקים למכירה"+"\n";
        }
        else if (utils.stringContains(value, "קליניקות")){
            value = "other";
            values["remarks_text"] += "סוג הנכס: "+"קליניקות"+"\n";
        }
        else{
            value = "other";
            values["remarks_text"] += "סוג הנכס: "+(this.TryParseFrameValue(frameElem, "סוג הנכס:").replace(/<\/b>/g, "").trim())+"\n";
        }

        /*if (utils.stringContains(value, "קבוצת רכישה")){
            value = "אחר";
            values["remarks_text"] += "קבוצת רכישה ";
        }*/

        values["types"] = value.trim();
        
        if (isSale){
            values["ascription"] = "sale";
        }
        else{
            values["ascription"] = "rent";
        }

        value = this.TryParseFrameValue(frameElem, "ישוב:").split(" - ");
        values["country"] = value.length > 1 ? value[0] : "ישראל";
        values["city"] = this.TryParseFrameValue(frameElem, "ישוב:");

        value = this.TryParseFrameValue(frameElem, "טלפון 1:");
        
        if (utils.isNullOrEmpty(value)){
            value = this.TryParseFrameValue(frameElem, "טלפון 2:");
            
            if (utils.isNullOrEmpty(value)){
                return null;
            }

            values["contact2"] = "";
        }
        else{
            values["contact2"] = this.TryParseFrameValue(frameElem, "טלפון 2:");
        }
        
        values["contact1"] = value;
        values["remarks_text"] += this.TryParseFrameAdvanced(frameElem, "תוספות:");
        values["external_id"] = this.TryParseFrameID(frameElem);
        values["external_id_hex"] = utils.getUrlParameter("NadlanID");
        
        var arrayVals = this.TryParseFramePrice(frameElem).split(' ');
        
        if (arrayVals.length > 0){
            values["price"] = arrayVals[0].replace(/\D/g, "");
            
            if (arrayVals.length > 1){
                values["currency_id"] = arrayVals[1] == "₪" ? "ILS" : "";
            }
        }

        values["neighborhood"] = this.TryParseFrameValue(frameElem, "שכונה:");
        values["street"] = "";
        value = this.TryParseFrameValue(frameElem, "כתובת:");
        
        if (!utils.isNullOrEmpty(value)){
            values["street"] = value.replace(/\d/g, "").trim();
            values["house_number"] = value.replace(/\D/g, "").trim();
        }

        value = this.TryParseFrameValue(frameElem, "קומה:");
        
        if (!utils.isNullOrEmpty(value)){
            if (utils.stringContains(value, "(על עמודים)")){
                value = value.replace("(על עמודים)", "");
                values["remarks_text"] += " (על עמודים)";
            }

            var nameToFind = "מתוך";
            var index1 = value.indexOf(nameToFind);
            
            if (index1 == -1){                    
                values["floor_from"] = value == "קרקע" ? 0 : value.trim();
                //values["floors_count"] = "";
            }
            else{
                values["floor_from"] = value.substr(0, index1).trim();
                values["floors_count"] = value.substr(index1 + nameToFind.length, value.length - (index1 + nameToFind.length)).trim();
            }
        }

        value = this.TryParseFrameValue(frameElem, "איש קשר:");
        
        if (utils.isNullOrEmpty(value)){
            value = values["city"]+" - "+values["street"];
        }
        
        values["name"] = value;
        values["rooms_count"] = this.TryParseFrameValue(frameElem, "חדרים:");
        values["home_size"] = this.TryParseFrameValue(frameElem, 'גודל במ\"ר:').trim().replace(/\D/g, "");;

        value = this.TryParseFrameValue(frameElem, 'מ"ר בנוי:'); // доп. площадь
        
        if (value.length > 0){ // если есть доп. площать, то кладем ее в осн. площадь, а осн. в лот (меняем)
            var tmp = values["home_size"];
            values["home_size"] = value;
            values["lot_size"] = value == tmp ? "" : tmp;
            values["remarks_text"] += "\n"+'מ"ר גינה: '+this.TryParseFrameValue(frameElem, 'מ"ר גינה:'); // доп. площать сада в ремарки
        }
        
        if (values["types"] == "land"){
            values["lot_size"] = values["home_size"];
            values["home_size"] = "";
        }
        
        if (values["types"] == "farm" && value.length == 0){
            values["lot_size"] = values["home_size"];
            values["home_size"] = "";
        }
        
        value = this.TryParseFrameAdvanced(frameElem, "ריהוט:");
        
        if (value === "כן"){
            values["furniture_flag"] = 1;
        }
        else if (value === "לא"){
            values["furniture_flag"] = 0;
        }
        else if (value === "חלקי"){
            values["furniture_flag"] = 3;
        }
        
        value = this.TryParseFrameAdvanced(frameElem, "פירוט ריהוט:");
        values["remarks_text"] += value.length > 0 ? "\n"+"פירוט ריהוט: "+value : "";
        values["parking_flag"] = this.TryParseFrameCheckbox(frameElem, "חניה") == "כן" ? 1 : 0;
        values["elevator_flag"] = this.TryParseFrameCheckbox(frameElem, "מעלית") == "כן" ? 1 : 0;
        values["air_cond_flag"] = this.TryParseFrameCheckbox(frameElem, "מיזוג") == "כן" ? 1 : 0;
        
        var checkbox_names = [
            "סורגים",
            "גישה לנכים",
            'ממ"ד',
            "מרפסת",
            "מרפסת שמש",
            "מחסן",
            "דלתות פנדור",
            "משופצת",
            "יחידת דיור",
            "מתאימה לשותפים",
            "חיות מחמד",
            "השכרה לטווח ארוך"
        ];
        
        values["remarks_text"] += "\n";
        
        for (var i = 0; i < checkbox_names.length; i++){
            value = this.TryParseFrameCheckbox(frameElem, checkbox_names[i]);
            
            if (value.length > 0){
                values["remarks_text"] += value == "כן" ? checkbox_names[i]+", " : "";
            }
        }
        
        value = this.TryParseFrameFreefrom(frameElem);
        
        if (value == "מיידית"){
            values["free_from"] = "immediately";
        }
        else{
            values["free_from"] = value;
        }
        
        value = this.TryParseFrameAdvanced2(frameElem, "ארנונה לחודשיים:");
        
        if (value.length > 0){
            values["remarks_text"] += ", "+"ארנונה לחודשיים:"+value;
        }
        
        value = this.TryParseFrameAdvanced2(frameElem, "תשלום לועד בית:");
        
        if (value.length > 0){
            values["remarks_text"] += ", "+"תשלום לועד בית:"+value;
        }
        
        value = this.TryParseFrameAdvanced2(frameElem, "תשלומים בשנה:");
        
        if (value.length > 0){
            values["remarks_text"] += ", "+"תשלומים בשנה:"+value;
        }

        /*for (var key in values){
            $('#collector_result_div').append("<br>"+key+": "+values[key]);
        }
        
        collector.showPreview();*/
        
        this.values_for_compare = values;
        
        if (creating_property_anyway){
            collector.createPropertyAnyway(values);
        }
        else{
            collector.createProperty(values);
        }
    };
    
    this.TryParseFrameValue = function(source, name){
        var nameToFind = ">" + name + "</td>"; // >סוג הנכס:</TD>
        var index1 = source.indexOf(nameToFind); // ищем >סוג הנכס:</TD> в коде фрейма

        if (index1 == -1){ 
            return ""; // если не нашел возвращаем пустую строку
        }
        
        var indexEndData = source.indexOf("</td>", index1 + nameToFind.length); // ищем </TD> начиная с конца >סוג הנכס:</TD>
        var indexBold = source.indexOf("<b>", index1); // ищем <B>
        
        if (indexBold < indexEndData){ // если <B> раньше чем </TD>(конец)
            index1 = indexBold; // перемещаем индекс >סוג הנכס:</TD> на индекс <B>
            index1 += 3; // "<B>"

            var index2 = source.indexOf("</td>", index1); // </B></TD>
            
            if (index2 >= 4){
                index2 -= 4; // </B>
            }
            
            nameToFind = source.substr(index1, index2 - index1).replace("&nbsp;", "");
            
            return nameToFind;
        }

        return "";
    };
    
    this.TryParseFrameAdvanced = function(source, name){
        var nameToFind = "<b>" + name + "</b>"; // >סוג הנכס:</TD>
        var index1 = source.indexOf(nameToFind); // ищем >סוג הנכס:</TD> в коде фрейма

        if (index1 == -1){ 
            return ""; // если не нашел возвращаем пустую строку
        }
        
        var indexEndData = source.indexOf("<", index1 + nameToFind.length); // ищем </TD> начиная с конца >סוג הנכס:</TD>
        var indexStartData = index1 + nameToFind.length;
        nameToFind = source.substr(indexStartData, indexEndData-indexStartData-2);

        return nameToFind.trim();
    };
    
    this.TryParseFrameAdvanced2 = function(source, name){
        var nameToFind = name + " "; // >סוג הנכס:</TD>
        var index1 = source.indexOf(nameToFind); // ищем >סוג הנכס:</TD> в коде фрейма

        if (index1 == -1){ 
            return ""; // если не нашел возвращаем пустую строку
        }
        
        var indexEndData = source.indexOf("</b>", index1 + nameToFind.length); // ищем </TD> начиная с конца >סוג הנכס:</TD>
        var indexStartData = index1 + nameToFind.length+3;
        nameToFind = source.substr(indexStartData, indexEndData-indexStartData);

        return nameToFind.trim();
    };
    
    this.TryParseFramePrice = function(source){
        var nameToFind = ">מחיר:</td>"; // >סוג הנכס:</TD>
        var index1 = source.indexOf(nameToFind); // ищем >סוג הנכס:</TD> в коде фрейма
        
        if (index1 == -1){ 
            return ""; // если не нашел возвращаем пустую строку
        }
        
        var indexEndData = source.indexOf("</td>", index1 + nameToFind.length); // ищем </TD> начиная с конца >סוג הנכס:</TD>
        var indexSecondTd = source.indexOf("<td>", index1); // ищем <B>
        
        if (indexSecondTd < indexEndData){ // если <B> раньше чем </TD>(конец)
            index1 = indexSecondTd; // перемещаем индекс >סוג הנכס:</TD> на индекс <B>
            index1 += 4; // "<B>"

            var index2 = source.indexOf("<script", index1); // </B></TD>
            
            return source.substr(index1+1, index2 - index1-2).trim();
        }

        return "";
    };
    
    this.TryParseFrameDescription = function(source, nameToFind){
        nameToFind = "<u>"+nameToFind+"</u>";
        var index1 = source.indexOf(nameToFind);
        
        if (index1 == -1){
            return "";
        }
        
        var indexEndData = source.indexOf("</td>", index1);
        index1 += nameToFind.length;
        var description = source.substr(index1, indexEndData - index1).replace("&nbsp;", "").replace("<br>", "");

        return description;
    };
    
    this.TryParseFrameID = function(source){
        // <div class="adNumber">	מס' מודעה:<span style="font-size: 16px;">84039438</span></div>
        var nameToFind = "מס' מודעה:";
        var index1 = source.indexOf(nameToFind);
        
        if (index1 == -1){ 
            return ""; // если не нашел возвращаем пустую строку
        }
        
        var indexEndData = source.indexOf("</div>", index1 + nameToFind.length); // ищем </TD> начиная с конца >סוג הנכס:</TD>
        var indexSpan = source.indexOf("<span", index1); // ищем <B>
        
        if (indexSpan < indexEndData){ // если <B> раньше чем </TD>(конец)
            index1 = indexSpan; // перемещаем индекс >סוג הנכס:</TD> на индекс <B>

            var index2 = source.indexOf("</span>", index1); // </B></TD>
            
            return $(source.substr(index1, index2+7 - index1).trim()).text();
        }

        return "";
    };
    
    this.TryParseFrameFreefrom = function(source){
        var nameToFind = "תאריך כניסה:";
        var index1 = source.indexOf(nameToFind);
        
        if (index1 == -1){ 
            return ""; // если не нашел возвращаем пустую строку
        }
        
        var indexEndData = source.indexOf("<", index1 + nameToFind.length); // ищем </TD> начиная с конца >סוג הנכס:</TD>
        var index2 = index1 + nameToFind.length;
        
        return source.substr(index2, indexEndData-index2).replace(/&nbsp;/g, "").trim();
    };
    
    this.TryParseFrameCheckbox = function(source, name){
        var nameToFind = name+"</td>";
        var index1 = source.indexOf(nameToFind);
        
        if (index1 == -1){
            return ""; // если не нашел возвращаем пустую строку
        }
        
        var checkbox_start = index1 - 31;
        var checkbox_div = source.substr(checkbox_start, 31);
        
        if (utils.stringContains(checkbox_div, "v_checked")){
            return "כן";
        }

        return "";
    };
    
    this.parseExternalID = function(){
        if (this.onAdsPage()){
            var frameElem = $(document).children().html();
            return this.TryParseFrameID(frameElem);
        }
    };
    
    this.afterLoad = function(){
        if (this.onSearchPage()){
            $('\
                #search_form,\n\
                #menu_strip,\n\
                #menu,\n\
                .intro_block,\n\
                #lastsearch_block,\n\
                .search_banners,\n\
                .platinum,\n\
                #Hotpics,\n\
                .bannerBetweenTables_main,\n\
                #tiv_main_table,\n\
                #top_banners,\n\
                #media_container,\n\
                #linkOverlay\n\
            ').remove();
        }
       
        if (getUrlParameter("external_id") != "null" && getUrlParameter("external_id") != null && getUrlParameter("external_id") != undefined){
            var tr_id = getUrlParameter("external_id");
            var tr_id_next = null;
            
            $('#'+tr_id).children('td').css("background-color", "#98da98").addClass("boohoo");
            tr_id_next = $('#'+tr_id+" + tr").attr("id");
            
            $('.main_table tr').each(function(){
                if ($(this).attr("id") != tr_id && $(this).attr("id") != tr_id_next){
                    $(this).remove();
                }
            });
            
            if ($('.boohoo').length == 0 && $('.main_table').length > 0){
                $.post(host+"/api/buildertmp/removeexternal.json", {
                    external_id: getUrlParameter("topreal_external_property")
                }, function (response){
                    chrome.runtime.sendMessage({action: "close_current_tab"});
                });
            }
        }
    };
    
    this.advStyle = function(){
        
    };
    
    this.parseCatalogClick = function(target){
        var parent_tr = $(target).parent();

        if (parent_tr.attr("id").substr(0, 5) == "tr_Ad"){
            if (parent_tr.attr("need_to_update") != undefined){
                $('#card_exist_ext_dialog>*').show();
                $('#ext_card_already_exist_error_span, #ext_card_already_exist_success_span, #update_card').hide();
                
                if (parent_tr.attr("need_to_update") === "false"){
                    $('#close_existing_card_ext_button').show();
                    $('#update_existing_card_ext_button').hide();
                }
                else if (parent_tr.attr("need_to_update") === "true"){
                    $('#close_existing_card_ext_button').hide();
                    $('#update_existing_card_ext_button').show();
                    
                    $('#update_existing_card_ext_button').click({
                        card: parent_tr
                    }, function(e){
                        //var arrayVals = collector.TryParseFramePrice($(document).children().html()).split(' ');
                        //var price_parsed = arrayVals[0].replace(/\D/g, "");
                        
                        $.post(host+"/api/buildertmp/updatepropertyext.json",{
                            external_id: parent_tr.attr("id").split("_").pop(),
                            new_price: $('#'+parent_tr.attr("id")+'>td:nth-child(11)').text().trim().replace(/\D/g, ""),
                            collector: "hex"
                        },function (response){
                            if (response.error != undefined){
                                $('#card_exist_ext_dialog>*').hide();
                                $('#ext_card_already_exist_error_span').show();
                            }
                            else{
                                $('#card_exist_ext_dialog>*').hide();
                                $('#ext_card_already_exist_success_span, #close_existing_card_ext_button, #card_exist_ext_dialog>p').show();
                            }
                        });
                    });
                }
                
                $('#existing_card_ext_collect_date_span').text(utils.convertTimestampToDate(parent_tr.attr("topreal_last_updated")));
                $('#existing_card_ext_price_span').text(utils.numberWithCommas(parent_tr.attr("topreal_price")));
                $('#existing_card_ext_address_span').text(parent_tr.attr("topreal_address"));
                $('#existing_card_ext_floor_span').text(parent_tr.attr("topreal_floor"));
                $('#existing_card_ext_rooms_span').text(parent_tr.attr("topreal_rooms"));
                $('#open_existing_card_ext_button').unbind("click").click({topreal_id: parent_tr.attr("topreal_id")}, function(e){
                    chrome.runtime.sendMessage({action: "open_yad2_newad", url: host+"/property?id="+e.data.topreal_id});
                });
                
                if ($('.ui-dialog[aria-describedby=card_exist_ext_dialog]').length > 0){
                    $('.ui-dialog[aria-describedby=card_exist_ext_dialog]').show();
                }
                else{
                    $('#card_exist_ext_dialog').show().dialog({
                        width: 350,
                        height: 200,
                        dialogClass: 'buttons_dialog',
                        position: { my: "center", at: "center", of: window },
                        beforeClose: function( event, ui ) {
                            $('#card_exist_ext_dialog').hide();
                        }
                    });
                }
                
                if (parent_tr.attr("iframe_url") == undefined){
                    var ad_url = $('#'+parent_tr.attr("id")+' + tr').children().children().children().children('iframe').attr('src');
                    parent_tr.attr("iframe_url", ad_url);
                    $('#'+parent_tr.attr("id")+"+tr").remove();
                    $('#'+parent_tr.attr("id")).children().css("background", "rgba(255,0,0,0.63)");
                    $('#'+parent_tr.attr("id")+' + tr').children().children().children().children('iframe').css("min-height", "653px");
                }
                
                return 0;
            }
            
            var ad_url = "";
            
            if (parent_tr.attr("iframe_url") == undefined){
                ad_url = $('#'+parent_tr.attr("id")+' + tr').children().children().children().children('iframe').attr('src');
                parent_tr.attr("iframe_url", ad_url);
                $('tr.Info').hide();
                $('#'+parent_tr.attr("id")+"+tr").show();
                $('#'+parent_tr.attr("id")).children().css("background", "rgba(255,0,0,0.63)");
                $('#'+parent_tr.attr("id")+' + tr').children().children().children().children('iframe').css("min-height", "653px");
            }
            else{
                ad_url = parent_tr.attr("iframe_url");
                $('tr.Info').hide();
                $('#'+parent_tr.attr("id")+"+tr").show();
                $('#'+parent_tr.attr("id")+' + tr').children().children().children().children('iframe').css("min-height", "653px");
            }
            
            //chrome.runtime.sendMessage({action: "open_yad2_newad", url: location.origin+ad_url});
        }
    };
    
    this.getExistCards = function(){
        var ids_arr = [];
            
        $('.main_table .showPopupUnder').each(function(){
            ids_arr.push([$(this).attr("id").split("_").pop(), $('#'+$(this).attr("id")+'>td:nth-child(11)').text().trim().replace(/\D/g, "")]);
        });

        $.post(host+"/api/buildertmp/getexist.json", {
            ids: JSON.stringify(ids_arr),
            collector: "hex"
        }, function (response){
            for (var key in response){
                if (response[key][0] != null){
                    //$('#'+response[key]).remove();
                    if (response[key][1] == true || response[key][1] == false){
                        if (location.pathname === "/Nadlan/sales.php"){
                            $('#tr_Ad_2_1_'+response[key][0]).attr("need_to_update", response[key][1]);
                            $('#tr_Ad_2_1_'+response[key][0]).attr("topreal_price", response[key][3]);
                            $('#tr_Ad_2_1_'+response[key][0]).attr("topreal_last_updated", response[key][2]);
                            $('#tr_Ad_2_1_'+response[key][0]).attr("topreal_id", response[key][4]);
                            $('#tr_Ad_2_1_'+response[key][0]).attr("topreal_address", response[key][5]);
                            $('#tr_Ad_2_1_'+response[key][0]).attr("topreal_floor", response[key][6]);
                            $('#tr_Ad_2_1_'+response[key][0]).attr("topreal_rooms", response[key][7]);
                        }
                        else if (location.pathname === "/Nadlan/rent.php"){
                            $('#tr_Ad_2_2_'+response[key][0]).attr("need_to_update", response[key][1]);
                            $('#tr_Ad_2_2_'+response[key][0]).attr("topreal_price", response[key][3]);
                            $('#tr_Ad_2_2_'+response[key][0]).attr("topreal_last_updated", response[key][2]);
                            $('#tr_Ad_2_2_'+response[key][0]).attr("topreal_id", response[key][4]);
                            $('#tr_Ad_2_2_'+response[key][0]).attr("topreal_address", response[key][5]);
                            $('#tr_Ad_2_1_'+response[key][0]).attr("topreal_floor", response[key][6]);
                            $('#tr_Ad_2_1_'+response[key][0]).attr("topreal_rooms", response[key][7]);
                        }
                    }
                }
            }
        });
    };
    
    this.onCreatePropertySuccess = function(response){
        $('#card_create_success_dialog').show().dialog({
            width: 300,
            height: 250,
            dialogClass: 'buttons_dialog',
            position: { my: "center", at: "center", of: window },
            beforeClose: function( event, ui ) {
                $('#card_create_success_dialog').hide();
            }
        });
        setTimeout(closeCurrentTab, 500);
        //chrome.runtime.sendMessage({action: "open_yad2_newad", url: host+"/property?id="+response+"&mode=collected"});
        //chrome.runtime.sendMessage({action: "close_current_tab"});
    };
    
    this.getStreetTranslation = function(){
        var frameElem = $(document).children().html();
        var street = this.TryParseFrameValue(frameElem, "כתובת:");
        var city = this.TryParseFrameValue(frameElem, "ישוב:");
        var country = "ישראל";
        
        $.post(host+"/api/buildertmp/getaddressbytext.json", {
            address: street+" "+city+" "+country
        }, function (response){
            $('.address_translated').text(response);            
        });
        
        $.post(host+"/api/buildertmp/getaddressbytext.json", {
            address: street.replace(/\d+/g, "")+" "+city+" "+country
        }, function (response){
            var address = response;
            var updated = false;
            console.log(collector.cards_obj);
            console.log(collector.current.values_for_compare);
            
            for (var i = 0; i < collector.cards_obj.length; i++){
                if (collector.cards_obj[i].address == address){
                    if (
                            (
                                collector.cards_obj[i].house_flat.split("/")[0] == collector.current.values_for_compare.house_number ||
                                utils.isUndf(collector.current.values_for_compare.house_number)
                            ) &&
                            (
                                collector.cards_obj[i].floor.split("/")[0] == collector.current.values_for_compare.floor_from ||
                                (collector.cards_obj[i].floor.split("/")[0] == 0 && collector.current.values_for_compare.floor_from == "קרקע")
                            ) &&
                            (
                                collector.cards_obj[i].floor.split("/")[1] == collector.current.values_for_compare.floors_count ||
                                (utils.isUndf(collector.cards_obj[i].floor.split("/")[1]) && utils.isUndf(collector.current.values_for_compare.floors_count))
                            ) &&
                            (
                                collector.cards_obj[i].rooms == collector.current.values_for_compare.rooms_count ||
                                utils.aboutRooms(collector.cards_obj[i].rooms, collector.current.values_for_compare.rooms_count)
                            ) &&
                            (
                                collector.cards_obj[i].home_size == collector.current.values_for_compare.home_size ||
                                utils.about(collector.cards_obj[i].home_size, collector.current.values_for_compare.home_size)
                            )
                    ){
                        //console.log(collector.cards_obj[i].external_id_key, collector.cards_obj[i].external_id_value, collector.cards_obj[i].card_id);
                        updated = true;
                        collector.updateSamePhone(collector.cards_obj[i].external_id_key, collector.cards_obj[i].external_id_value, collector.cards_obj[i].card_id);
                    }
                }
            }
            
            if (!updated){
                //console.log("new");
                collector.createOnSamePhone();
            }
        });
    };
}