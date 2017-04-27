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
    //this.mst = null;
    //this.separated_elements = [];
    
    this.collectData = function(collector){
        this.data = collector;
        this.labels = JSON.parse(collector.data)[0]; // вытаскиваем и сохраняем лейблы полей
        this.scenarios = JSON.parse(collector.data)[1]; // вытаскиваем и сохраняем сценарии и з коллектора
        this.checked_checkbox = JSON.parse(collector.data)[2];
        this.unchecked_checkbox = JSON.parse(collector.data)[3];
        this.selected_elements = [];
        
        console.log("labels:");
        console.log(this.labels);
        console.log("scenarions:");
        console.log(this.scenarios);
        console.log("data:");
        console.log(this.data);
        console.log("selected_elements:");
        console.log(this.selected_elements);
        
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
    };
    
    this.getLocale = function(){
        $.post("http://topreal.top/api/builder/getlocaleforcollector.json",{
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
            
            collector.showPreview();
        });
    };
    
    this.createProperty = function(){
        var data = [];
        var json = {};
            
        for (var i = 0; i < this.selected_elements.length; i++){
            json[this.selected_elements[i][3]] = this.selected_elements[i][1];
            data.push(json);
        }

        $.post("http://topreal.top/api/builder/createproperty.json",{
            data: JSON.stringify(json)
        },function (response){
            if (response.error != undefined){
                console.log(response.error.description);
            }
            else{
                //console.log(response)
                chrome.runtime.sendMessage({action: "open_yad2_newad", url: "http://topreal.top/property?id="+response});
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
        var splitted = builder.saw_rules[rule].func(this.selected_elements[key][1].trim());
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
    
    this.showPreview = function(){
        $('#collector_result_div').html("");
        
        for (var i = 0; i < this.selected_elements.length; i++){
            $('#collector_result_div').append(this.selected_elements[i][3]+":"+this.selected_elements[i][1]+"<br>");
        }
        
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