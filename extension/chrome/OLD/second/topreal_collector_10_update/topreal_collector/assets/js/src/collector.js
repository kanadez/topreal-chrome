function Collector(){
    this.data = null;
    this.scenarios = null;
    //this.notranslate_elements = null;
    this.selected_elements = [];
    this.checked_checkbox = { // данные чекнутого чекбокса для определения различий между нечекнутым и послед снятия дынных
        class: null,
        style: null
    };
    this.unchecked_checkbox = { // данные нечекнутого чекбокса для определения различий между чекнутым и послед снятия дынных
        class: null,
        style: null
    };
    
    this.checkSession = function(){
        $.post(host+"/api/builder/checksession.json", {}, function (response){
            if (response){
                collector.collectDataYad2();
            }
            else{
                alert(localization.getVariable("collector_msg1"));
            }
        });
    };
    
    this.collectDataYad2 = function(){
        var frameElem = $(document).children().html();
        var isSale = true;
        var types = "";
        
        if (utils.stringContains(frameElem, "להצגת המספר")){
            alert(localization.getVariable("collector_msg2"));
            return 0;
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
        values["remarks_text"] = "";

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
            value = "other";
            values["remarks_text"] += "סוג הנכס: "+"בניין משרדים"+"\n";
        }
        else if (utils.stringContains(value, "חנויות/שטח מסחרי")){
            value = "other";
            values["remarks_text"] += "סוג הנכס: "+"חנויות/שטח מסחרי"+"\n";
        }
        else if (utils.stringContains(value, "חניון")){
            value = "other";
            values["remarks_text"] += "סוג הנכס: "+"חניון"+"\n";
        }
        else if (utils.stringContains(value, "מבני תעשיה")){
            value = "other";
            values["remarks_text"] += "סוג הנכס: "+"מבני תעשיה"+"\n";
        }
        else if (utils.stringContains(value, "מחסנים")){
            value = "other";
            values["remarks_text"] += "סוג הנכס: "+"מחסנים"+"\n";
        }
        else if (utils.stringContains(value, "מרתף")){
            value = "other";
            values["remarks_text"] += "סוג הנכס: "+"מרתף"+"\n";
        }
        else if (utils.stringContains(value, "משק חקלאי")){
            value = "other";
            values["remarks_text"] += "סוג הנכס: "+"משק חקלאי"+"\n";
        }
        else if (utils.stringContains(value, "משרדים")){
            value = "other";
            values["remarks_text"] += "סוג הנכס: "+"משרדים"+"\n";
        }
        else if (utils.stringContains(value, "נחלה")){
            value = "other";
            values["remarks_text"] += "סוג הנכס: "+"נחלה"+"\n";
        }
        else if (utils.stringContains(value, "עסקים למכירה")){
            value = "other";
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
            var splitted = value.split(" ");

            if (splitted.length > 1){
                var street = "";
                var house_number = isNaN(splitted[splitted.length-1]) ? "" :  splitted.pop();

                for (var s = 0; s < splitted.length; s++){
                    street += splitted[s]+" ";
                }

                values["street"] = street.trim(); //value.replace(/\d/g, ""); // плохо. посылплентся, если в названии улицы будет цифра
                values["house_number"] = house_number;
            }
            else{
                values["street"] = value.trim();
                values["house_number"] = "";
            }
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
        }*/
        
        //collector.showPreview();
        collector.createProperty(values);
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
    
    /*this.collectData = function(collector){
        this.data = collector;
        this.labels = JSON.parse(collector.data)[0]; // вытаскиваем и сохраняем лейблы полей
        this.scenarios = JSON.parse(collector.data)[1]; // вытаскиваем и сохраняем сценарии и з коллектора
        this.checked_checkbox = JSON.parse(collector.data)[2];
        this.unchecked_checkbox = JSON.parse(collector.data)[3];
        this.selected_elements = [];
        
        //console.log("labels:");
        //console.log(this.labels);
        //console.log("scenarions:");
        //console.log(this.scenarios);
        //console.log("data:");
        //console.log(this.data);
        //console.log("selected_elements:");
        //console.log(this.selected_elements);
        
        for (var i = 0; i < this.scenarios.length; i++){
            if (this.labels[i] != undefined && this.labels[i][0] != null){
                var label = this.getElementHTMLByXPath(this.labels[i][0]); // получаем текст лейбла со страницы
                
                if (label != null && label == this.labels[i][1]){ // если он совпадает с тем лейблом, что в коллекторе по текущему ключу, значит данные верны, читаем их
                    var element_id = this.scenarios[i][0];
                    var element_data_type = this.scenarios[i][2];
                    //console.log(element_data_type);
                    
                    if (element_data_type == 1){
                        var element_html = this.getElementHTMLByXPath(element_id).trim(); // выдергиваем содержимое html-элемента на странице
                    }
                    else if (element_data_type == 2){
                        var element_html = this.getFlagOfCheckboxByXPath(element_id);
                    }
                    
                    this.selected_elements.push([element_id, element_html, "parent", ""]); // соханяем как родителей
                }
                else{ // если не совпадает, значит данные не верны, ищем на странице лейбл, который совпадает
                    for (var z = 0;  z < this.scenarios.length; z++){
                        //console.log("site: "+this.getElementHTMLByXPath(this.labels[z][0]));
                        //console.log("collector: "+this.labels[i][1]);
                        //console.log(z);
                        
                        if (this.getElementHTMLByXPath(this.labels[z][0]) == this.labels[i][1]){    
                            var element_id = this.scenarios[z][0];
                            var element_data_type = this.scenarios[z][2];
                            //console.log(element_data_type);
                    
                            if (element_data_type == 1){
                                var element_html = this.getElementHTMLByXPath(element_id).trim(); // выдергиваем содержимое html-элемента на странице
                            }
                            else if (element_data_type == 2){
                                var element_html = this.getFlagOfCheckboxByXPath(element_id);
                            }
                            
                            this.selected_elements.push([element_id, element_html, "parent", ""]); // соханяем как родителей
                        }
                    }
                }
            }
            else{
                var element_id = this.scenarios[i][0];
                var element_data_type = this.scenarios[i][2];
                //console.log(element_data_type);
                    
                if (element_data_type == 1){
                    var element_html = this.getElementHTMLByXPath(element_id).trim(); // выдергиваем содержимое html-элемента на странице
                }
                else if (element_data_type == 2){
                    var element_html = this.getFlagOfCheckboxByXPath(element_id);
                }
                
                this.selected_elements.push([element_id, element_html, "parent", ""]); // соханяем как родителей
            }
            
            //console.log(element_html);
        }
        
        for (var i = 0; i < this.scenarios.length; i++){ // именно здесь формируются связки с нашими полями
            if (this.labels[i] != undefined && this.labels[i][0] != null){
                var label = this.getElementHTMLByXPath(this.labels[i][0]);
                
                if (label == this.labels[i][1]){   
                    var scenario = this.scenarios[i][1].split(";");
                    var element_id = this.scenarios[i][0];
                    //console.log(this.findKeyByElementId(element_id));
                    //this.buffered_elements = 

                    for (var z = 0; z < scenario.length; z++){
                        var first_break = scenario[z].indexOf("(");
                        var last_break = scenario[z].indexOf(")");
                        var function_name = scenario[z].substr(0, first_break);
                        var function_parameter = scenario[z].substr(first_break+1, last_break-first_break-1);
                        //console.log("function_name: "+function_name);
                        //console.log("function_parameter: "+function_parameter);

                        switch (function_name) {
                            case "separate": 
                                this.separateField(element_id);
                            break;
                            case "separateByRule": 
                                this.separateFieldByRule(element_id, function_parameter);
                            break;
                            case "delete": 
                                this.deleteField(element_id, function_parameter);
                            break;
                            case "concate": 
                                this.concatFieldBack(element_id, function_parameter);
                            break;
                            case "link": 
                                var comma_index = function_parameter.indexOf(",");

                                if (comma_index == -1){
                                    this.createLink(element_id, 0, function_parameter);
                                }
                                else{
                                    var parameters = function_parameter.split(",");
                                    this.createLink(element_id, parameters[0], parameters[1]);
                                }
                            break;
                        }
                    }
                }
                else{
                    for (var g = 0;  g < this.scenarios.length; g++){
                        //console.log("site: "+this.getElementHTMLByXPath(this.labels[g][0]));
                        //console.log("collector: "+this.labels[i][1]);
                        
                        if (this.labels[g][1] == label){    
                            var scenario = this.scenarios[g][1].split(";");
                            var element_id = this.scenarios[i][0];
                            //console.log(this.scenarios);
                            //console.log("el_id: "+element_id);
                            //console.log("scenario: "+scenario);
                            //this.buffered_elements = 

                            for (var z = 0; z < scenario.length; z++){
                                var first_break = scenario[z].indexOf("(");
                                var last_break = scenario[z].indexOf(")");
                                var function_name = scenario[z].substr(0, first_break);
                                var function_parameter = scenario[z].substr(first_break+1, last_break-first_break-1);
                                //console.log("function_name: "+function_name);
                                //console.log("function_parameter: "+function_parameter);

                                switch (function_name) {
                                    case "separate": 
                                        this.separateField(element_id);
                                    break;
                                    case "separateByRule": 
                                        this.separateFieldByRule(element_id, function_parameter);
                                    break;
                                    case "delete": 
                                        this.deleteField(element_id, function_parameter);
                                    break;
                                    case "concate": 
                                        this.concatFieldBack(element_id, function_parameter);
                                    break;
                                    case "link": 
                                        var comma_index = function_parameter.indexOf(",");

                                        if (comma_index == -1){
                                            this.createLink(element_id, 0, function_parameter);
                                        }
                                        else{
                                            var parameters = function_parameter.split(",");
                                            this.createLink(element_id, parameters[0], parameters[1]);
                                        }
                                    break;
                                }
                            }
                        }
                    }
                }
            }
            else{
                var scenario = this.scenarios[i][1].split(";");
                var element_id = this.scenarios[i][0];
                //console.log(this.findKeyByElementId(element_id));
                //this.buffered_elements = 

                for (var z = 0; z < scenario.length; z++){
                    var first_break = scenario[z].indexOf("(");
                    var last_break = scenario[z].indexOf(")");
                    var function_name = scenario[z].substr(0, first_break);
                    var function_parameter = scenario[z].substr(first_break+1, last_break-first_break-1);
                    //console.log("function_name: "+function_name);
                    //console.log("function_parameter: "+function_parameter);

                    switch (function_name) {
                        case "separate": 
                            this.separateField(element_id);
                        break;
                        case "separateByRule": 
                            this.separateFieldByRule(element_id, function_parameter);
                        break;
                        case "delete": 
                            this.deleteField(element_id, function_parameter);
                        break;
                        case "concate": 
                            this.concatFieldBack(element_id, function_parameter);
                        break;
                        case "link": 
                            var comma_index = function_parameter.indexOf(",");

                            if (comma_index == -1){
                                this.createLink(element_id, 0, function_parameter);
                            }
                            else{
                                var parameters = function_parameter.split(",");
                                this.createLink(element_id, parameters[0], parameters[1]);
                            }
                        break;
                    }
                }
            }
        }
        
        this.getLocale();
        
        //console.log(this.selected_elements);
    };*/
    
    this.getLocale = function(){
        $.post(host+"/api/builder/getlocaleforcollector.json",{
            collector_id: this.data.id
        },function (response){
            /*if (response.error == undefined){
                $('#collector_locale_download_a').show();
            }
            else{
                $('#download_error_span').show().text(response.error.description);
            }*/
            
            for (var i = 0; i < collector.selected_elements.length; i++){
                for (var z = 0; z < response.length; z++){
                    if (collector.selected_elements[i][1] == response[z].site_field){
                        collector.selected_elements[i][1] = response[z].topreal_field;
                    }
                }
            }
            
            //console.log(collector.selected_elements);
            //console.log(response);
            
            //collector.showPreview();
            collector.createProperty();
        });
    };
    
    this.createProperty = function(data){
        //var data = [];
        //var json = {};
        //var remarks_counter = 0;
        /*for (var i = 0; i < this.selected_elements.length; i++){
            if (this.selected_elements[i][3] == "remarks_text"){
                if (this.selected_elements[i][1].length > 1){ // это временно, пока не разберусь как собирать названия чекбоксов в ремакри
                    if (!remarks_counter){
                        json[this.selected_elements[i][3]] = this.selected_elements[i][1]+"\n ";
                    }
                    else{
                        json[this.selected_elements[i][3]] += this.selected_elements[i][1]+"\n ";
                    }
                    
                    remarks_counter++;
                }
            }
            else{
                json[this.selected_elements[i][3]] = this.selected_elements[i][1];
            }
            
            data.push(json);
        }*/
        
        //console.log(json);
        
        $('#try_collector_button, .ui-dialog-titlebar-close').attr("disabled", true);
        $('#try_collector_button').text(localization.getVariable("pls_wait"));

        $.post(host+"/api/builder/createproperty.json",{
            data: JSON.stringify(data)
        },function (response){
            $('#try_collector_button, .ui-dialog-titlebar-close').attr("disabled", false);
            $('#try_collector_button').text(localization.getVariable("collector_create_card"));
            
            if (response.error != undefined){
                if (response.error.code == 405){
                    var obj = JSON.parse(response.error.description);
                    console.log(obj);
                    $('#existing_card_collect_date_span').html(utils.convertTimestampToDate(obj.date));
                    $('#existing_card_price_span').html(utils.numberWithCommas(obj.price));
                    $('#open_existing_card_button').click({topreal_id: obj.card_id}, function(e){
                        chrome.runtime.sendMessage({action: "open_yad2_newad", url: host+"/property?id="+e.data.topreal_id});
                    });
                    
                    if (obj.need_to_update && collector.TryParseFramePrice($(document).children().html()).length > 0){
                        $('#update_existing_card_button').show();
                    }
                    
                    $('#card_exist_dialog').show().dialog({
                        width: 350,
                        height: 230,
                        dialogClass: 'buttons_dialog',
                        position: { my: "center", at: "center", of: window },
                        beforeClose: function( event, ui ) {
                            $('#card_exist_dialog').hide();
                        }
                    });
                    
                    $('#update_existing_card_button').click({
                            card_id: obj.card_id
                        }, function(e){
                            var arrayVals = collector.TryParseFramePrice($(document).children().html()).split(' ');
                            var price_parsed = arrayVals[0].replace(/\D/g, "");

                            $.post(host+"/api/builder/updateproperty.json",{
                                id: e.data.card_id,
                                new_price: price_parsed
                            },function (response){
                                if (response.error != undefined){
                                    $('#card_exist_dialog>*').hide();
                                    $('#card_already_exist_error_span').show();
                                }
                                else{
                                    $('#card_exist_dialog>*').hide();
                                    $('#card_already_exist_success_span, #close_existing_card_button, #card_exist_dialog>p').show();
                                }
                            });
                        }
                    );
                }
            }
            else{
                //console.log(response)
                //chrome.runtime.sendMessage({action: "open_topreal_tab", url: host+"/property?id="+response+"&mode=collected"});
                location.href = host+"/property?id="+response+"&mode=collected";
            }
        });
    };
    
    this.getElementHTMLByXPath = function(xpath){
        //console.log("getElementHTMLByXPath()");
        
        if (document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue != null)
            return document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.innerText.trim();
        else return "";
    };
    
    this.getFlagOfCheckboxByXPath = function(xpath){
        //console.log("getFlagOfCheckboxByXPath()");
        
        if (document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue != null){
            var element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            var checkbox_class = $(element).attr("class");
            var checkbox_style = $(element).attr("style");

            if (this.checked_checkbox.class == checkbox_class || this.checked_checkbox.style == checkbox_style){
                return 1;
            }
            else if (this.unchecked_checkbox.class == checkbox_class || this.unchecked_checkbox.style == checkbox_style){
                return 0;
            }
        }
        else return "";
    };
    
    this.getElementByXPath = function(xpath){
        return document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    };
    
    this.separateField = function(element_id){
        var key = this.findKeyByElementId(element_id);
        var splitted = this.selected_elements[key][1].trim().split(/(\s+|\/|,)/);
        var tmp_array = [];
        
        for (var i = 0; i < this.selected_elements.length; i++){
            if (i !== key){
                tmp_array.push(this.selected_elements[i]);
            }
            else{
                for (var z = 0; z < splitted.length; z++){
                    if (splitted[z]  != ""){
                        tmp_array.push([this.selected_elements[i][0]+":"+z, splitted[z].toString().trim(), z === 0 ? "parent" : "children", ""]);
                    }
                }
            }
        }
        
        this.selected_elements = tmp_array;
    };
    
    this.separateFieldByRule = function(element_id, rule){
        var key = this.findKeyByElementId(element_id);
        
        if (key == undefined){
            return 0;
        }
        
        var splitted = builder.saw_rules[rule].func(this.selected_elements[key][1].trim());
        var tmp_array = [];
        
        for (var i = 0; i < this.selected_elements.length; i++){
            if (i !== key){
                tmp_array.push(this.selected_elements[i]);
            }
            else if (splitted != null){
                for (var z = 0; z < splitted.length; z++){
                    if (splitted[z]  != "" && splitted[z] != undefined){
                        tmp_array.push([this.selected_elements[i][0]+":"+z, splitted[z].toString().trim(), z === 0 ? "parent" : "children", ""]);
                    }
                }
            }
        }
        
        this.selected_elements = tmp_array;
    };
    
    this.deleteField = function(element_id, parameter){
        var tmp_array = [];
        var key = this.findKeyByElementIdAndSeparateKey(element_id, parameter);
        
		//console.log("key: ");
		//console.log(key);
		
        for (var i = 0; i < this.selected_elements.length; i++){
            if (i !== key){
                tmp_array.push(this.selected_elements[i]);
            }
        }
        
        this.selected_elements = tmp_array;
    };
    
    this.concatFieldBack = function(element_id, parameter){
        var tmp_array = [];
        var key = this.findKeyByElementIdAndSeparateKey(element_id, parameter);
        
        for (var i = 0; i < this.selected_elements.length; i++){
            if (i !== key){
                tmp_array.push(this.selected_elements[i]);
            }
            else{
                this.selected_elements[i-1][1] += this.selected_elements[i][1];
            }
        }
        
        this.selected_elements = tmp_array;
    };
    
    this.createLink = function(element_id, separate_key, topreal_key){
        if (separate_key === 0){
            var key = this.findKeyByElementId(element_id);
        }
        else{
            var key = this.findKeyByElementIdAndSeparateKey(element_id, separate_key);
        }
        
        for (var i = 0; i < this.selected_elements.length; i++){
            if (i == key){
                this.selected_elements[i][3] = topreal_key;
            }
        }
    };
    
    this.pushBuilderLink = function(element_id, separate_key, topreal_key){
        if (separate_key === 0){
            var key = this.findKeyByElementId(element_id);
        }
        else{
            var key = this.findKeyByElementIdAndSeparateKey(element_id, separate_key);
        }
        
        var topreal_key_title = null;
        
        for (var k in builder.fields){
            if (topreal_key === k){
                topreal_key_title = builder.fields[k];                
            }
        }
        
        for (var i = 0; i < this.selected_elements.length; i++){
            if (i == key){
                //this.selected_elements[i][3] = topreal_key;
                builder.links[i] = [topreal_key, '<li id="'+topreal_key+'" class="ui-state-highlight ui-sortable-handle">'+topreal_key_title+'</li>']
            }
        }
    };
    
    this.showPreview = function(){
        //$('#collector_result_div').html("");
        
        /*for (var i = 0; i < this.selected_elements.length; i++){
            $('#collector_result_div').append(this.selected_elements[i][3]+":"+this.selected_elements[i][1]+"<br>");
        }*/
        
        $('#collector_result_div').show().dialog({
            width: 1000,
            height: 500,
            dialogClass: 'buttons_dialog',
            position: { my: "center", at: "center", of: window },
            beforeClose: function(event, ui) {
                $('#collector_result_div').hide();
            }
        });
    };
    
    this.findKeyByElementId = function(id){
        for (var i = 0; i < this.selected_elements.length; i++){
            if (this.selected_elements[i][0] == id || this.selected_elements[i][0] == id+":0"){
                return i;
            }
        }
    };
    
    this.findKeyByElementIdAndSeparateKey = function(id, key){
        for (var i = 0; i < this.selected_elements.length; i++){
            var with_zero = id+":"+(key == "" ? 0 : key);
            var without_zero = id+(key == "" ? "" : ":"+key);
            
            if (this.selected_elements[i][0] == without_zero || this.selected_elements[i][0] == with_zero){
                return i;
            }
        }
    };
    
}