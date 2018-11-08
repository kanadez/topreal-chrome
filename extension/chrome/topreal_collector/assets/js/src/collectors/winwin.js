function WinWin(){
    this.values_for_compare = null;
    this.pth = location.pathname.split("/");
    this.property_types = {
        "דירה": "apartment",
        "דירת גן": "garden_apartment",
        "דירת גג": "roof_apartment",
        "דירת יוקרה": "apartment",
        "וילות ובתים": "villa",
        "קוטג' / דו משפחתי": "two_family_house",
        "יחידת דיור": "apartment",
        "דירה להחלפה": "apartment",
        "פנטהאוז": "penthouse",
        "מיני פנטהאוז": "penthouse",
        "דופלקס": "duplex",
        "טריפלקס": "duplex_plus",
        "משק חקלאי": "farm",
        "דירת סטודיו": "studio",
        "לופט": "studio",
        "מגרש": "land",
        "מבנה נייד": "other",
        "דירת נופש/צימר": "camp",
        "דמי מפתח": "other",
        "דירת מרתף": "other",
        'נדל"ן אחר': "other",
        "קבוצת רכישה": "other",
        "משרד וירטואלי": "other",
        "קליניקה": "other",
        "כיתת לימוד": "other",
        "בניין": "building",
        "משרדים": "office",
        "חנויות ומסחר": "commercial",
        "מחסן": "store",
        "אולמות": "commercial",
        "עסקים": "commercial",
        "שותפות עסקית": "commercial",
        "מבנה תעשיה": "commercial"
    };
    this.currencies = {
        "₪": "ILS",
        "$": "USD",
        "€": "EUR",
        "₽": "RUB"
    };
    
    this.onSearchPage = function(){
        return this.onAdsPage();
    };
    
    this.onAdsPage = function(){
        if (location.origin === "https://www.winwin.co.il" && this.pth[1] == "RealEstate" && this.pth[3] == "Ads"){
            return true;
        }
        else{
            return false;
        }
    };
    
    this.onCatalogPage = function(){
        if (
                location.origin === "https://www.winwin.co.il" && 
                this.pth[1] == "RealEstate" && 
                (
                    this.pth[3] == "RealEstatePage.aspx" ||
                    this.pth[3] == "Search"
                )
        ){
            return true;
        }
        else{
            return false;
        }
    };
    
    this.notOnAdsPage = function(){
        if (this.pth[3] == undefined || this.pth[3] != "Ads"){
            return true;
        }
        else{
            return false;
        }
    };
    
    this.collectData = function(){
        if ($('#collector_buffer_div').html().length === 0){
            return 0;
        }
        
        var header = $('.adHeaderNew').text();
        
        if (utils.stringContains(header, "חיפוש נכס")){ // если клиент
            collector.createClient(this.collectFromClient());
            //console.log(this.collectFromClient());
        }
        else{ // во всех остальных случаях - недвижимость
            if (creating_property_anyway){
                collector.createPropertyAnyway(this.collectFromProperty());
            }
            else{
                collector.createProperty(this.collectFromProperty());
            }
        }
        
        /*for (var key in values){
            $('#collector_result_div').append("<br>"+key+": "+values[key]);
        }
        
        collector.showPreview();*/
    };
    
    this.collectFromProperty = function(){ // собираем недвижимость
        console.log("prooperty collecting");
        var frameElem = $(document).children().html();
        var isSale = true;
        var types = "";
        
        /*if ($('.phoneImgWrap:visible').length === 1){
            alert(localization.getVariable("collector_msg2"));
            return 0;
        }*/
        
        var value = types = $('.adHeaderNew').text();// парсим заголовок
        
        if (utils.isNullOrEmpty(value)){ // если парсинг не дал ничего
            return "";
        }
        
        if (utils.stringContains(value, "להשכרה")){ // если в результатах парсинга есть Аренда
            isSale = false; // не продажа сейчас (аренда)
        }
        
        var values = {};
        values.remarks_text = "";
        values.collector_suffix = "winwin";

        for (var key in this.property_types){
            if (utils.stringContains(value, key)){
                values.types = this.property_types[key];
                
                if (values.types === "other"){
                    //values.remarks_text += "סוג הנכס: "+"מרתף/פרטר"+"\n";
                }
            }
        }
        
        if (isSale){
            values.ascription = "sale"; // למכירה
        }
        else{
            values.ascription = "rent"; // להשכרה
        }
        
        values.country = "ישראל";
        
        if ($('.adHeaderNew').text().indexOf("-") === -1){
            values.city = values.ascription === "sale" ? $('.adHeaderNew').text().split("למכירה")[1].trim() : $('.adHeaderNew').text().split("להשכרה")[1].trim();
        }
        else{
            values.city = $('.adHeaderNew').text().split(" - ")[1].replace(/\d/g, "").replace("חדרים", "").trim();
        }
        
        values.neighborhood = this.TryParseFrameValue(frameElem, "שכונה:");
        values.street = "";
        value = this.TryParseFrameValue(frameElem, "רחוב:");
        
        if (!utils.isNullOrEmpty(value)){
            var splitted = value.split(" ");

            if (splitted.length > 1){
                var street = "";
                var house_number = isNaN(splitted[splitted.length-1]) ? "" :  splitted.pop();

                for (var s = 0; s < splitted.length; s++){
                    street += splitted[s]+" ";
                }

                values.street = street.trim(); //value.replace(/\d/g, ""); // плохо. посылплентся, если в названии улицы будет цифра
                values.house_number = house_number;
            }
            else{
                values.street = value.trim();
                values.house_number = "";
            }
        }
        
        if (!utils.isNullOrEmpty($('#rightNum').text())){
            values.contact1 = $('#rightNum').text();
        }
        
        if (!utils.isNullOrEmpty($('#leftNum').text())){
            values.contact2 = $('#leftNum').text();
        }
        
        /*if (!utils.isNullOrEmpty($('#rightNumAgent').text())){
            values.contact1 = $('#rightNumAgent').text();
        }
        
        if (!utils.isNullOrEmpty($('#leftNumAgent').text())){
            values.contact2 = $('#leftNumAgent').text();
        }*/
        
        if (values.contact1 == undefined && values.contact2 == undefined){
            $.post(host+"/api/buildertmp/removeexternal.json", {
                external_id: getUrlParameter("topreal_external_property")
            }, null);
            
            alert(localization.getVariable("no_phones_error"));
            
            return null;
        }
        
        values.remarks_text += this.TryParseFrameValue(frameElem, "הערות כלליות:") !== null ? this.TryParseFrameValue(frameElem, "הערות כלליות:")+"\n" : "";
        values.external_id_winwin = this.parseExternalID();
        
        if ($('.priceContent').text() === "לא צויין"){
            values.price = 0;
            values.currency_id = "ILS";
        }
        else{
            var arrayVals = $('.priceContent').text().split(' ');
            
            if (arrayVals.length > 0){
                values.price = arrayVals[0].replace(/\D/g, "");

                if (arrayVals.length > 1){
                    values.currency_id = this.currencies[arrayVals[1]];
                }
            }
        }
        
        values.rooms_count = this.TryParseFrameValue(frameElem, "חדרים:");
        
        value = this.TryParseFloors();
        
        if (!utils.isNullOrEmpty(value)){
            var nameToFind = "מתוך";
            var index1 = value.indexOf(nameToFind);
            
            if (index1 == -1){                    
                values.floor_from = value == "קרקע" ? "0" : value.trim();
            }
            else{
                values.floor_from = value.substr(0, index1).trim();
                values.floors_count = value.substr(index1 + nameToFind.length, value.length - (index1 + nameToFind.length)).trim();
            }
        }
        
        values.name = this.TryParseFrameAdvanced(frameElem, "איש קשר: ");
        
        if (this.TryParseFrameValue(frameElem, 'שטח:') !== null){
            values.home_size = this.TryParseFrameValue(frameElem, 'שטח:').trim().replace(/\D/g, "");
        }
        /*value = this.TryParseFrameValue(frameElem, 'מ"ר בנוי:'); // доп. площадь
        
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
        }*/
        
        value = this.TryParseFrameValue(frameElem, "תאריך כניסה:");
        
        if (value === "מיידי" || value === "גמיש"){
            values.free_from = "immediately";
        }
        else{
            values.free_from = value;
        }
        
        values.remarks_text += this.TryParseCondition(frameElem) !== null ? "מצב:"+" "+this.TryParseCondition(frameElem)+"\n" : "";
        values.remarks_text += this.TryParseFrameValue(frameElem, "לשותפים: ") !== "לא" ? "לשותפים:"+" "+this.TryParseFrameValue(frameElem, "לשותפים: ")+"\n" : "";
        values.remarks_text += this.TryParseFrameValue(frameElem, "מספר תשלומים: ") !== null ? "מספר תשלומים:"+" "+this.TryParseFrameValue(frameElem, "מספר תשלומים: ")+"\n" : "";
        
        values.furniture_flag = this.TryParseFrameFurniture();
        /*value = this.TryParseFrameAdvanced(frameElem, "ריהוט:");
        
        if (value === "כן"){
            values["furniture_flag"] = 1;
        }
        else if (value === "לא"){
            values["furniture_flag"] = 0;
        }
        else if (value === "חלקי"){
            values["furniture_flag"] = 3;
        }*/
        
        values.remarks_text += $('#ctl00_pageContent_accs_shelter').css("background-color") === "rgb(46, 121, 197)" ? $('#ctl00_pageContent_accs_shelter+div').text()+", " : "";
        values.remarks_text += $('#ctl00_pageContent_accs_balcon').css("background-color") === "rgb(46, 121, 197)" ? $('#ctl00_pageContent_accs_balcon+div').text()+", " : "";
        values.remarks_text += $('#ctl00_pageContent_accs_access').css("background-color") === "rgb(46, 121, 197)" ? $('#ctl00_pageContent_accs_access+div').text()+", " : "";
        values.remarks_text += $('#ctl00_pageContent_accs_pandoor').css("background-color") === "rgb(46, 121, 197)" ? $('#ctl00_pageContent_accs_pandoor+div').text()+", " : "";
        values.parking_flag = $('#ctl00_pageContent_accs_cubeParking').css("background-color") === "rgb(46, 121, 197)" ? 1 : null;
        values.elevator_flag = $('#ctl00_pageContent_accs_elevator').css("background-color") === "rgb(46, 121, 197)" ? 1 : null;
        values.air_cond_flag = $('#ctl00_pageContent_accs_cubeAc').css("background-color") === "rgb(46, 121, 197)" ? 1 : null;
        
        var tmp = {};
        
        for (var key in values){ // очистка
            if (values[key] != null && values[key] != "-" && values[key] != ""){
                tmp[key] = values[key];
            }
        }
        
        this.values_for_compare = tmp;
        
        return tmp; // возвращаем очищенный от пустых (null) ячеек массив значений
    };
    
    this.collectFromClient = function(){ // собираем клиента
        console.log("client collecting");
        var frameElem = $(document).children().html();
        var isSale = true;
        var types = "";
        
        /*if ($('.phoneImgWrap:visible').length === 1){
            alert(localization.getVariable("collector_msg2"));
            return 0;
        }*/
        
        var value = types = $('.adHeaderNew').text();// парсим заголовок
        
        if (utils.isNullOrEmpty(value)){ // если парсинг не дал ничего
            return "";
        }
        
        if (utils.stringContains(value, "להשכרה")){ // если в результатах парсинга есть Аренда
            isSale = false; // не продажа сейчас (аренда)
        }
        
        var values = {};
        values.remarks_text = "";
        values.collector_suffix = "winwin";

        /*for (var key in this.property_types){
            if (utils.stringContains(value, key)){
                values.types = this.property_types[key];
                
                if (values.types === "other"){
                    //values.remarks_text += "סוג הנכס: "+"מרתף/פרטר"+"\n";
                }
            }
        }*/
        
        values.types = "other"; // тип - другое, пока не разберемся какой ставить
        
        if (isSale){
            values.ascription = "sale";
        }
        else{
            values.ascription = "rent";
        }

        values.country = "ישראל";
        values.city = $('.adHeaderNew').text().split(" - ")[1].replace(/\d/g, "").replace("חדרים", "").trim();
        values.neighborhood = this.TryParseFrameValue(frameElem, "שכונה:");
        values.street = "";
        value = this.TryParseFrameValue(frameElem, "רחוב:");
        
        if (!utils.isNullOrEmpty(value)){
            var splitted = value.split(" ");

            if (splitted.length > 1){
                var street = "";
                var house_number = isNaN(splitted[splitted.length-1]) ? "" :  splitted.pop();

                for (var s = 0; s < splitted.length; s++){
                    street += splitted[s]+" ";
                }

                values.street = street.trim(); //value.replace(/\d/g, ""); // плохо. посылплентся, если в названии улицы будет цифра
                //values.house_number = house_number;
            }
            else{
                values.street = value.trim();
                //values.house_number = "";
            }
        }
        
        if (!utils.isNullOrEmpty($('#rightNum').text())){
            values.contact1 = $('#rightNum').text();
        }
        
        if (!utils.isNullOrEmpty($('#leftNum').text())){
            values.contact2 = $('#leftNum').text();
        }
        
        /*if (!utils.isNullOrEmpty($('#rightNumAgent').text())){
            values.contact1 = $('#rightNumAgent').text();
        }
        
        if (!utils.isNullOrEmpty($('#leftNumAgent').text())){
            values.contact2 = $('#leftNumAgent').text();
        }*/
        
        if (values.contact1 == undefined && values.contact2 == undefined){
            alert(localization.getVariable("no_phones_error"));
            
            return null;
        }
        
        values.remarks_text += this.TryParseFrameValue(frameElem, "הערות כלליות:") !== null ? this.TryParseFrameValue(frameElem, "הערות כלליות:")+"\n" : "";
        values.external_id_winwin = this.parseExternalID();
        
        if ($('.priceContent').text() === "לא צויין"){
            values.price = 0;
            values.currency_id = "ILS";
        }
        else{
            var arrayVals = $('.priceContent').text().split(' ');
            
            if (arrayVals.length > 0){
                values.price = arrayVals[0].replace(/\D/g, "");

                if (arrayVals.length > 1){
                    values.currency_id = this.currencies[arrayVals[1]];
                }
            }
        }
        
        values.rooms_count = this.TryParseFrameValue(frameElem, "חדרים:");
        
        value = this.TryParseFloors();
        
        if (!utils.isNullOrEmpty(value)){
            var nameToFind = "מתוך";
            var index1 = value.indexOf(nameToFind);
            
            if (index1 == -1){                    
                values.floor_from = value == "קרקע" ? 0 : value.trim()-1;
                values.floors_count = value == "קרקע" ? 1 : value.trim();
            }
            else{
                values.floor_from = value.substr(0, index1).trim();
                values.floors_count = value.substr(index1 + nameToFind.length, value.length - (index1 + nameToFind.length)).trim();
                
                if (values.floor_from == values.floors_count){
                    values.floor_from = values.floors_count-1;
                }
            }
        }
        
        values.name = this.TryParseFrameAdvanced(frameElem, "איש קשר: ");
        
        if (this.TryParseFrameValue(frameElem, 'שטח:') !== null){
            values.home_size = this.TryParseFrameValue(frameElem, 'שטח:').trim().replace(/\D/g, "");
        }
        /*value = this.TryParseFrameValue(frameElem, 'מ"ר בנוי:'); // доп. площадь
        
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
        }*/
        
        value = this.TryParseFrameValue(frameElem, "תאריך כניסה:");
        
        if (value === "מיידי" || value === "גמיש"){
            values.free_from = "immediately";
        }
        else{
            values.free_from = value;
        }
        
        values.remarks_text += this.TryParseCondition(frameElem) !== null ? "מצב:"+" "+this.TryParseCondition(frameElem)+"\n" : "";
        values.remarks_text += this.TryParseFrameValue(frameElem, "לשותפים: ") !== "לא" ? "לשותפים:"+" "+this.TryParseFrameValue(frameElem, "לשותפים: ")+"\n" : "";
        values.remarks_text += this.TryParseFrameValue(frameElem, "מספר תשלומים: ") !== null ? "מספר תשלומים:"+" "+this.TryParseFrameValue(frameElem, "מספר תשלומים: ")+"\n" : "";
        
        values.furniture_flag = this.TryParseFrameFurniture();
        /*value = this.TryParseFrameAdvanced(frameElem, "ריהוט:");
        
        if (value === "כן"){
            values["furniture_flag"] = 1;
        }
        else if (value === "לא"){
            values["furniture_flag"] = 0;
        }
        else if (value === "חלקי"){
            values["furniture_flag"] = 3;
        }*/
        
        values.remarks_text += $('#ctl00_pageContent_accs_shelter').css("background-color") === "rgb(46, 121, 197)" ? $('#ctl00_pageContent_accs_shelter+div').text()+", " : "";
        values.remarks_text += $('#ctl00_pageContent_accs_balcon').css("background-color") === "rgb(46, 121, 197)" ? $('#ctl00_pageContent_accs_balcon+div').text()+", " : "";
        values.remarks_text += $('#ctl00_pageContent_accs_access').css("background-color") === "rgb(46, 121, 197)" ? $('#ctl00_pageContent_accs_access+div').text()+", " : "";
        values.remarks_text += $('#ctl00_pageContent_accs_pandoor').css("background-color") === "rgb(46, 121, 197)" ? $('#ctl00_pageContent_accs_pandoor+div').text()+", " : "";
        values.parking_flag = $('#ctl00_pageContent_accs_cubeParking').css("background-color") === "rgb(46, 121, 197)" ? 1 : null;
        values.elevator_flag = $('#ctl00_pageContent_accs_elevator').css("background-color") === "rgb(46, 121, 197)" ? 1 : null;
        values.air_cond_flag = $('#ctl00_pageContent_accs_cubeAc').css("background-color") === "rgb(46, 121, 197)" ? 1 : null;
        
        var tmp = {};
        
        for (var key in values){
            if (values[key] != null && values[key] != "-" && values[key] != ""){
                tmp[key] = values[key];
            }
        }
        
        return tmp; // возвращаем очищенный от пустых (null) ячеек массив значений
    };
    
    this.TryParseFrameValue = function(source, name){
        var nameToFind = ">" + name + "</div>"; // >סוג הנכס:</TD>
        var index1 = source.indexOf(nameToFind); // ищем >סוג הנכס:</TD> в коде фрейма

        if (index1 == -1){ 
            return null; // если не нашел возвращаем пустую строку
        }
        
        var indexEndData = source.indexOf("</div>", index1 + nameToFind.length); // ищем </TD> начиная с конца >סוג הנכס:</TD>
        var indexStartData = source.indexOf(">", index1 + nameToFind.length)+1;
        
        nameToFind = source.substr(indexStartData, indexEndData - indexStartData).replace("&nbsp;", "").trim();

        return nameToFind !== "-" ? nameToFind : null;
    };
    
    this.TryParseCondition = function(source){
        var nameToFind = '<div class="addDetailsRowTitle">מצב:</div>'; // >סוג הנכס:</TD>
        var index1 = source.indexOf(nameToFind); // ищем >סוג הנכס:</TD> в коде фрейма

        if (index1 == -1){ 
            return null; // если не нашел возвращаем пустую строку
        }
        
        var indexEndData = source.indexOf("</div>", index1 + nameToFind.length); // ищем </TD> начиная с конца >סוג הנכס:</TD>
        var indexStartData = source.indexOf(">", index1 + nameToFind.length)+1;
        
        nameToFind = source.substr(indexStartData, indexEndData - indexStartData).replace("&nbsp;", "").trim();

        return nameToFind !== "-" ? nameToFind : null;
    };
    
    this.TryParseFloors = function(){
        var response_array = [];
        var response_string = "";
        var splitted = $('.addDetailsRowFloor').parent().text().trim().replace("קומה:", "").replace(/\n/g, "").split(" ");
        
        for (var i = 0; i < splitted.length; i++){
            if (splitted[i].length > 0){
                response_array.push(splitted[i]);
            }
        }
        
        for (var z = 0; z < response_array.length; z++){
            response_string += response_array[z]+" ";
        }
        
        return response_string.trim();
    };
    
    this.TryParseFrameAdvanced = function(source, name){
        var nameToFind = ">" + name + "</span>"; // >סוג הנכס:</TD>
        var index1 = source.indexOf(nameToFind); // ищем >סוג הנכס:</TD> в коде фрейма

        if (index1 == -1){ 
            return null; // если не нашел возвращаем пустую строку
        }
        
        var indexEndData = source.indexOf("</span>", index1 + nameToFind.length); // ищем </TD> начиная с конца >סוג הנכס:</TD>
        var indexStartData = source.indexOf(">", index1 + nameToFind.length)+1;
        
        nameToFind = source.substr(indexStartData, indexEndData - indexStartData).replace("&nbsp;", "");

        return nameToFind !== "-" ? nameToFind : null;
    };
    
    this.TryParseFrameFurniture = function(){
        var frameElem = $('#collector_buffer_div').html();
        var nameToFind = ">ריהוט</span>";
        var start_index = frameElem.indexOf(nameToFind);
        var img_class_start_index = frameElem.indexOf('<img class="', start_index+nameToFind.length)+12;
        var img_class_end_index = frameElem.indexOf('"', img_class_start_index);
        return frameElem.substr(img_class_start_index, img_class_end_index-img_class_start_index) === "VImage" ? 1 : null;
    };
    
    this.TryParseFramePrice = function(source){
        if ($('.priceContent').text() === "לא צויין"){
            return 0;
        }
        else{
            var arrayVals = $('.priceContent').text().split(' ');
            
            if (arrayVals.length > 0){
                return arrayVals[0].replace(/\D/g, "");
            }
        }
    };
    
    this.parseExternalID = function(){
        if (this.onAdsPage()){
            return location.pathname.split(",")[1].replace(".aspx","");
        }
    };
    
    this.appendRemark = function(text){
        if (text !== null){
            this.remarks += text+"\n";
        }
    };
    
    this.afterLoad = function(){
        $('#collector_buffer_div').load("https://www.winwin.co.il//Pages/RealEstatePages/RealEstateSaleGridTemplate.aspx?NsId=254&ObjId="+this.parseExternalID()+"&boneid=578&ItemIndex=3&Menu=1&Personal=False&rnd=818");
        $('tr.headEmpty').remove();
        $('tr>td:nth-child(2)>div.agentIcon>img:visible').parent().parent().parent().remove();
        $('tr>td:nth-child(4)').each(function(){
            if ($(this).html() === "חיפוש נכס"){ // удаляем клиентов из списка, нужно только пока не научусь собирать клиентов
                //$(this).parent().remove();
            }
        });
    };
    
    this.advStyle = function(){
        $('#user_message_span').css("color", "#000");
        $('.ui-dialog[aria-describedby="buttons_div"]').css({"max-height": "200px", "height": "200px"});
    };
    
    this.parseCatalogClick = function(target){
        var parent_tr = $(target).parent();
        //console.log(parent_tr);
        if (parent_tr.attr("id").substr(0, 6) == "trOpen"){
            if (parent_tr.attr("need_to_update") != undefined){
                $('#card_exist_ext_dialog>*').show();
                $('#ext_card_already_exist_error_span, #ext_card_already_exist_success_span, #update_card').hide();
                
                if (parent_tr.attr("need_to_update") === "false"){
                    $('#close_existing_card_ext_button').show();
                    $('#update_existing_card_ext_button').hide();
                    parent_tr.children().css("background", "rgba(255,0,0,0.63)");
                }
                else if (parent_tr.attr("need_to_update") === "true"){
                    $('#close_existing_card_ext_button').hide();
                    $('#update_existing_card_ext_button').show();
                    
                    $('#update_existing_card_ext_button').click({
                        card: parent_tr
                    }, function(e){
                        //var arrayVals = collector.TryParseFramePrice($(document).children().html()).split(' ');
                        //var price_parsed = arrayVals[0].replace(/\D/g, "");
                        var new_price = null;
                        
                        if (collector.current.pth === "ForSale"){
                            new_price = $('#'+parent_tr.attr("id")+'>td:nth-child(10)>span').html().trim().replace(/\D/g, "");
                        }
                        else if (collector.current.pth === "ForRent"){
                            new_price = $('#'+parent_tr.attr("id")+'>td:nth-child(9)').text().trim().replace(/\D/g, "");
                        }
                        
                        $.post(host+"/api/buildertmp/updatepropertyext.json",{
                            external_id: parent_tr.attr("id").replace(/\D/g, ""),
                            new_price: new_price,
                            collector: "winwin"
                        },function (response){
                            if (response.error != undefined){
                                $('#card_exist_ext_dialog>*').hide();
                                $('#ext_card_already_exist_error_span').show();
                            }
                            else{
                                $('#card_exist_ext_dialog>*').hide();
                                $('#ext_card_already_exist_success_span, #close_existing_card_ext_button, #card_exist_ext_dialog>p').show();
                                $('tr[topreal_id="'+response+'"]').children().css("background", "rgba(255,0,0,0.63)");
                            }
                        });
                    });
                }
                
                $('#existing_card_ext_collect_date_span').text(utils.convertTimestampToDate(parent_tr.attr("topreal_last_updated")));
                $('#existing_card_ext_price_span').text(utils.numberWithCommas(parent_tr.attr("topreal_price")));
                $('#existing_card_ext_address_span').text(parent_tr.attr("topreal_address"));
                $('#open_existing_card_ext_button').unbind("click").click({topreal_id: parent_tr.attr("topreal_id")}, function(e){
                    chrome.runtime.sendMessage({action: "open_yad2_newad", url: host+"/property?id="+e.data.topreal_id});
                });
                
                if ($('.ui-dialog[aria-describedby=card_exist_ext_dialog]').length > 0){
                    $('.ui-dialog[aria-describedby=card_exist_ext_dialog]').show();
                }
                else{
                    $('#card_exist_ext_dialog').show().dialog({
                        width: 350,
                        height: 160,
                        dialogClass: 'buttons_dialog',
                        position: { my: "center", at: "center", of: window },
                        beforeClose: function( event, ui ) {
                            $('#card_exist_ext_dialog').hide();
                        }
                    }).css("color", "#000");
                    
                    $('.ui-dialog[aria-describedby="card_exist_ext_dialog"]').css({"max-height": "150px", "height": "150px"});
                }
                
                /*if (parent_tr.attr("iframe_url") == undefined){
                    var ad_url = $('#'+parent_tr.attr("id")+' + tr').children().children().children().children('iframe').attr('src');
                    parent_tr.attr("iframe_url", ad_url);
                    $('#'+parent_tr.attr("id")+"+tr").remove();
                    $('#'+parent_tr.attr("id")).children().css("background", "rgba(255,0,0,0.63)");
                }*/
                
                return 0;
            }
            
            var ad_url = "";
            
            /*if (parent_tr.attr("iframe_url") == undefined){
                ad_url = $('#'+parent_tr.attr("id")+' + tr').children().children().children().children('iframe').attr('src');
                parent_tr.attr("iframe_url", ad_url);
                $('#'+parent_tr.attr("id")+"+tr").remove();
                $('#'+parent_tr.attr("id")).children().css("background", "rgba(255,0,0,0.63)");
            }
            else{
                ad_url = parent_tr.attr("iframe_url");
            }*/
            
            var id = parent_tr.attr("id").replace(/\D/g, "");
            var pth = location.pathname.split("/");
            ad_url = location.origin+"/"+pth[1]+"/"+pth[2]+"/Ads/RealEstateAds,"+id+".aspx";
            $('#'+parent_tr.attr("id")+"+tr.headEmpty").remove();
            parent_tr.children().css("background", "rgba(255,0,0,0.63)");
            chrome.runtime.sendMessage({action: "open_yad2_newad", url: ad_url});
        }
    };
    
    this.getExistCards = function(){
        var ids_arr = [];
        
        if (this.pth[2] == "ForSale"){
            $('#savedAddsTable>tbody>tr').each(function(){
                if ($(this).is(":visible") && $(this).attr("id") != undefined){
                    ids_arr.push([$(this).attr("id").replace(/\D/g, ""), $('#'+$(this).attr("id")+'>td:nth-child(10)>span').html().trim().replace(/\D/g, "")]);
                }
            });
        }
        else if (this.pth[2] == "ForRent"){
            $('#savedAddsTable>tbody>tr').each(function(){
                if ($(this).is(":visible") && $(this).attr("id") != undefined){
                    ids_arr.push([$(this).attr("id").replace(/\D/g, ""), $('#'+$(this).attr("id")+'>td:nth-child(9)').text().trim().replace(/\D/g, "")]);
                }
            });
        }
        else if (this.pth[2] == "ComForSale"){
            $('#savedAddsTable>tbody>tr').each(function(){
                if ($(this).is(":visible") && $(this).attr("id") != undefined){
                    ids_arr.push([$(this).attr("id").replace(/\D/g, ""), $('#'+$(this).attr("id")+'>td:nth-child(9)').text().trim().replace(/\D/g, "")]);
                }
            });
        }
        
        $.post(host+"/api/buildertmp/getexist.json", {
            ids: JSON.stringify(ids_arr),
            collector: "winwin"
        }, function (response){
            for (var key in response){
                if (response[key][0] != null){
                    //$('#'+response[key]).remove();
                    if (response[key][1] == true || response[key][1] == false){
                        $('#trOpen'+response[key][0]).attr("need_to_update", response[key][1]);
                        $('#trOpen'+response[key][0]).attr("topreal_price", response[key][3]);
                        $('#trOpen'+response[key][0]).attr("topreal_last_updated", response[key][2]);
                        $('#trOpen'+response[key][0]).attr("topreal_id", response[key][4]);
                        $('#trOpen'+response[key][0]).attr("topreal_address", response[key][5]);
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
    };
    
    this.getStreetTranslation = function(){
        var street = this.values_for_compare.street;
        var city = this.values_for_compare.city;
        var country = "ישראל";
        
        $.post(host+"/api/buildertmp/getaddressbytext.json", {
            address: street+" "+city+" "+country
        }, function (response){
            $('.address_translated').text(response);            
        });
        
        $.post(host+"/api/buildertmp/getaddressbytext.json", {
            address: (street != undefined ? street.replace(/\d+/g, "") : "")+" "+city+" "+country
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