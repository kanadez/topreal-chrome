function Collector(){ // kernel extension object, collects data from websites
    this.data = null; // current collector  parametrs data
    this.scenarios = null; // scenarios for collecting data
    this.selected_elements = []; // selected DOM elemets with data to collect
    this.checked_checkbox = { // checked checkboxes for collecting
        class: null,
        style: null
    };
    this.unchecked_checkbox = { // unchecked checkboxes for collecting
        class: null,
        style: null
    };
    
    this.saw_rules = [ // rules for separating data to collect (for collecting by parts)
        {
            pattern: "123,456 $ and some text (remove text and split)",
            func: function(x){
                var splitted = x.split(" ");
                return [Number(splitted[0].replace(/\D/g,'')), splitted[1]];
            } 
        },
        {
            pattern: "123,456 $",
            func: function(x){
                return [Number(x.replace(/\D/g,'')), x.toString().replace(/(\d|,|\s*)/g,'')];
            } 
        },
        {
            pattern: "123 456 $",
            func: function(x){
                return [Number(x.replace(/\D/g,'')), x.toString().replace(/(\d|\s*)/g,'')];
            } 
        },
        {
            pattern: "Property for ascription (split)", // property for sale
            func: function(x){
                var splitted = x.split(" ");
                var ascription;
                var property = "";
                
                for (var i = 0; i < splitted.length; i++){
                    if (i === splitted.length-1){
                        ascription = splitted[i];
                    }
                    else{
                        property += " "+splitted[i]
                    }
                }
                return [ascription, property];
            } 
        },
        {
            pattern: "Get numbers only (remove any text)", // get numbers only
            func: function(x){
                return x.match(/\d+/g);
            } 
        },
        {
            pattern: "Field: data (return data)",
            func: function(x){
                if (x.split(/(:)/g)[0] != undefined && x.split(/(:)/g)[2] != undefined){
                        return [x.split(/(:)/g)[0].trim(), x.split(/(:)/g)[2].trim()];
                }
                else return null;
            } 
        },
		{
            pattern: "123 street (split house and street)",
            func: function(x){
                if (x.match(/\d+/g) != null && x.match(/\D+/g) != null){
                    return [x.match(/\d+/g)[0].trim(), x.match(/\D+/g)[0].trim()];
                }
                else{
                    return ["", x];
                }
            } 
        }
    ];
    
    this.collectData = function(collector){ // collects data by downloaded from topreal.top scenarios
        this.data = collector;
        this.labels = JSON.parse(collector.data)[0]; // parsing json of collector object
        this.scenarios = JSON.parse(collector.data)[1]; // parsing json of collector object
        this.checked_checkbox = JSON.parse(collector.data)[2]; // parsing json of collector object
        this.unchecked_checkbox = JSON.parse(collector.data)[3]; // parsing json of collector object
        this.selected_elements = [];
        
        for (var i = 0; i < this.scenarios.length; i++){
            if (this.labels[i] != undefined && this.labels[i][0] != null){
                var label = this.getElementHTMLByXPath(this.labels[i][0]); // получаем текст лейбла со страницы
                
                if (label != null && label == this.labels[i][1]){ // если он совпадает с тем лейблом, что в коллекторе по текущему ключу, значит данные верны, читаем их
                    var element_id = this.scenarios[i][0];
                    var element_data_type = this.scenarios[i][2];
                    
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
                        if (this.getElementHTMLByXPath(this.labels[z][0]) == this.labels[i][1]){    
                            var element_id = this.scenarios[z][0];
                            var element_data_type = this.scenarios[z][2];
                    
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
                    
                if (element_data_type == 1){
                    var element_html = this.getElementHTMLByXPath(element_id).trim(); // выдергиваем содержимое html-элемента на странице
                }
                else if (element_data_type == 2){
                    var element_html = this.getFlagOfCheckboxByXPath(element_id);
                }
                
                this.selected_elements.push([element_id, element_html, "parent", ""]); // соханяем как родителей
            }
        }
        
        for (var i = 0; i < this.scenarios.length; i++){ // именно здесь формируются связки с нашими полями
            if (this.labels[i] != undefined && this.labels[i][0] != null){
                var label = this.getElementHTMLByXPath(this.labels[i][0]);
                
                if (label == this.labels[i][1]){   
                    var scenario = this.scenarios[i][1].split(";");
                    var element_id = this.scenarios[i][0];

                    for (var z = 0; z < scenario.length; z++){
                        var first_break = scenario[z].indexOf("(");
                        var last_break = scenario[z].indexOf(")");
                        var function_name = scenario[z].substr(0, first_break);
                        var function_parameter = scenario[z].substr(first_break+1, last_break-first_break-1);

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
                        
                        if (this.labels[g][1] == label){    
                            var scenario = this.scenarios[g][1].split(";");
                            var element_id = this.scenarios[i][0];

                            for (var z = 0; z < scenario.length; z++){
                                var first_break = scenario[z].indexOf("(");
                                var last_break = scenario[z].indexOf(")");
                                var function_name = scenario[z].substr(0, first_break);
                                var function_parameter = scenario[z].substr(first_break+1, last_break-first_break-1);

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

                for (var z = 0; z < scenario.length; z++){
                    var first_break = scenario[z].indexOf("(");
                    var last_break = scenario[z].indexOf(")");
                    var function_name = scenario[z].substr(0, first_break);
                    var function_parameter = scenario[z].substr(first_break+1, last_break-first_break-1);

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
    };
    
    this.getLocale = function(){ // gets localization data (for collecting data on different languages)
        $.post("http://topreal.top/api/builder/getlocaleforcollector.json",{
            collector_id: this.data.id
        },function (response){
            for (var i = 0; i < collector.selected_elements.length; i++){
                for (var z = 0; z < response.length; z++){
                    if (collector.selected_elements[i][1] == response[z].site_field){
                        collector.selected_elements[i][1] = response[z].topreal_field;
                    }
                }
            }

            collector.createProperty();
        });
    };
    
    this.createProperty = function(){ // sending collected data to topreal.top servers
        var data = [];
        var json = {};
            
        for (var i = 0; i < this.selected_elements.length; i++){
            json[this.selected_elements[i][3]] = this.selected_elements[i][1];
            data.push(json);
        }

        $.post("http://topreal.top/api/builder/createproperty.json",{
            data: JSON.stringify(json)
        },function (response){
            if (response.error == undefined){
                chrome.runtime.sendMessage({action: "open_yad2_newad", url: "http://topreal.top/property?id="+response+"&mode=collected"});
            }
        });
    };
    
    this.getElementHTMLByXPath = function(xpath){ // gets DOM element's html by saved xpath (in collector data)
        if (document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue != null)
            return document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.innerText.trim();
        else return "";
    };
    
    this.getFlagOfCheckboxByXPath = function(xpath){ // gets checkbox by saved xpath (in collector data)
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
    
    this.getElementByXPath = function(xpath){ // gets DOM element by saved xpath (in collector data)
        return document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    };
    
    this.separateField = function(element_id){ // separates some data to collect separately (if set in scenario)
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
    
    this.separateFieldByRule = function(element_id, rule){ // separates some data to collect separately (if set in scenario) by specially created rules ()  
        var key = this.findKeyByElementId(element_id);
        var splitted = collector.saw_rules[rule].func(this.selected_elements[key][1].trim());
        var tmp_array = [];
        
        for (var i = 0; i < this.selected_elements.length; i++){
            if (i !== key){
                tmp_array.push(this.selected_elements[i]);
            }
            else if (splitted != null){
                for (var z = 0; z < splitted.length; z++){
                    if (splitted[z]  != ""){
                        tmp_array.push([this.selected_elements[i][0]+":"+z, splitted[z].toString().trim(), z === 0 ? "parent" : "children", ""]);
                    }
                }
            }
        }
        
        this.selected_elements = tmp_array;
    };
    
    this.deleteField = function(element_id, parameter){ // deletes separatly collected data 
        var tmp_array = [];
        var key = this.findKeyByElementIdAndSeparateKey(element_id, parameter);
		
        for (var i = 0; i < this.selected_elements.length; i++){
            if (i !== key){
                tmp_array.push(this.selected_elements[i]);
            }
        }
        
        this.selected_elements = tmp_array;
    };
    
    this.concatFieldBack = function(element_id, parameter){ // cancatenates separated data to previous data part
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
    
    this.createLink = function(element_id, separate_key, topreal_key){ //  creates link between collected data and topreal.top data descriptor (to sctructurise data)
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
    
    this.findKeyByElementId = function(id){ // searches element in selected DOM elements by DOM ID
        for (var i = 0; i < this.selected_elements.length; i++){
            if (this.selected_elements[i][0] == id || this.selected_elements[i][0] == id+":0"){
                return i;
            }
        }
    };
    
    this.findKeyByElementIdAndSeparateKey = function(id, key){ // searches element in selected DOM elements by DOM ID and separate key
        for (var i = 0; i < this.selected_elements.length; i++){
            var with_zero = id+":"+(key == "" ? 0 : key);
            var without_zero = id+(key == "" ? "" : ":"+key);
		
            if (this.selected_elements[i][0] == without_zero || this.selected_elements[i][0] == with_zero){
                return i;
            }
        }
    };
    
    this.parseYad2Click = function(target){ // parses click on yad2.co.il webpage
        var parent_tr = $(target).parent();

        if (parent_tr.attr("id").substr(0, 5) == "tr_Ad"){
            var ad_url = $('#'+parent_tr.attr("id")+' + tr').children().children().children().children('iframe').attr('src');
            chrome.runtime.sendMessage({action: "open_yad2_newad", url: location.origin+ad_url});
        }
    };
    
    this.tryCollector = function(collector_id){ // starts collecting with current collector
        if (collector_id === null){
            if ($('#collector_select').val() == 0){
                return 0;
            }
        }
        
        $.post("http://topreal.top/api/builder/getcollector.json",{
            id: collector_id === null ? $('#collector_select').val() : collector_id
        },function (response){
            if (response.error != undefined){
                $('#error_span').text(response.error.description);
            }
            else{
                collector.collectData(response);
            }
        });
    };
    
    this.getCollectors = function(){ // reading all existing collectors from topreal.top server
        $.post("http://topreal.top/api/builder/getcollectors.json",{
        },function (response){
            if (response.error != undefined){
                $('#error_span').text(response.error.description);
            }
            else{
                $('#collector_select').html("");
                
                for (var i = 0; i < response.length; i++){
                    $('#collector_select').append("<option value='"+response[i].id+"'>"+response[i].title+"</option>");
                }
                
                $('#collector_select').change(function(){
                    collector.getLocale($('#collector_select option:selected').val());
                });
            }
        });
    };
    
    this.getLocale = function(collector){ // reads localization for collecting data on different languages
        if (collector == undefined || collector == "" || collector == null){
            return 0;
        }
        
        $.post("http://topreal.top/api/builder/getlocale.json",{
            collector_id: collector
        },function (response){
            if (response.error != undefined){
                $('#download_error_span').show().text(response.error.description);
            }
        });
    };
    
}