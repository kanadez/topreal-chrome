function Builder(){
    this.selected_elements = []; // выбранные данные сайта
    this.selected_element_fields = []; // выбранные названия полей данных сайта (лейблы)
    this.collector_data = []; // данные готового коллектора, отпарвляются на сервер
    this.fields = { // поля topreal для связки
        "remarks_text": "Remarks",
        "types": "Property",
        "price": "Price",
        "currency_id": "Currency",
        "project_id": "Project",
        "ascription": "Ascription",
        "statuses": "Status",
        "floor_from": "Floor from",
        "floors_count": "Floors",
        "rooms_count": "Rooms",
        "free_from": "Free from",
        "age": "Built",
        "name": "Name",
        "contact1": "Contact 1",
        "contact2": "Contact 2",
        "contact3": "Contact 3",
        "contact4": "Contact 4",
        "contact5": "e-Mail",
        "country": "Country",
        "city": "City",
        "neighborhood": "Neighborhood",
        "street": "Street",
        "house_number": "House №",
        "flat_number": "Flat №",
        "home_dims": "Home dimensions",
        "home_size": "Home size",
        "lot_dims": "Lot dimensions",
        "lot_size": "Lot size",
        "elevator_flag": "Elevator",
        "air_cond_flag": "Air cond",
        "parking_flag": "Parking",
        "furniture_flag": "Furniture",
        "directions": "Directions"
    };
    this.saw_rules = [ // объект с правилами разделения данных
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
    ];
    this.checked_checkbox = { // данные чекнутого чекбокса для определения различий между нечекнутым и послед снятия дынных
        class: null,
        style: null
    };
    this.unchecked_checkbox = { // данные нечекнутого чекбокса для определения различий между чекнутым и послед снятия дынных
        class: null,
        style: null
    };

    this.showPreview = function(){ // предпросмотр данных для составления коллектора
        if (select_mode === 1 ){
            switchSelectMode();
        }
        else if (select_fields_mode === 1){
            switchSelectFieldsMode();
        }
        
        if (this.selected_element_fields.length < this.selected_elements.length){
            var diff = this.selected_elements.length-this.selected_element_fields.length;
            
            for (var i = 0; i < diff; i++){
                this.selected_element_fields.push([null, ""]);
            }
        }
        
        document.getElementById("preview_div").innerHTML = "";
        var string = '<ul id="labels_data_ul" class="connectedSortable wide">';
        
        for (var i = 0; i < this.selected_element_fields.length; i++){
            var tooltip_text = this.selected_element_fields[i];
            var del_icon_url = chrome.extension.getURL("/assets/img/del.png");
            string += "<li id='site_label_"+i+"' class='ui-state-default'><div title='"+tooltip_text+"' class='site_field_content'>"+this.selected_element_fields[i][1]+"</div><a class='item_button_a' id='site_field_label_"+i+"_delete_button'><img class='item_button_img' src='"+del_icon_url+"' /></a></li>";
        }
        
        string += '</ul><ul id="collected_data_ul" class="connectedSortable wide">';

        for (var i = 0; i < this.selected_elements.length; i++){
            var del_icon_url = chrome.extension.getURL("/assets/img/del.png");
            var cut_icon_url = chrome.extension.getURL("/assets/img/cut.png");
            var saw_icon_url = chrome.extension.getURL("/assets/img/saw.png");
            var separate_flag = this.isAbleToSeparate(this.selected_elements[i][1]);
            var tooltip_text = this.selected_elements[i][1];
            string += "<li id='site_field_"+i+"' class='ui-state-default'><div title='"+tooltip_text+"' class='site_field_content'>"+this.selected_elements[i][1]+"</div><a class='item_button_a' id='site_field_"+i+"_delete_button'><img class='item_button_img' src='"+del_icon_url+"' /></a>"+(separate_flag === 1 ? "<a id='site_field_"+i+"_cut_button' class='item_button_a'><img class='item_button_img' src='"+cut_icon_url+"' /></a><a id='site_field_"+i+"_saw_button' class='item_button_a'><img class='item_button_img' src='"+saw_icon_url+"' /></a>" : "")+"</li>";
        }
        
        string += '</ul><ul id="sortable1" class="connectedSortable narrow"></ul>\n\
            <ul id="sortable2" class="connectedSortable narrow">';
        
        for (var key in this.fields){
            string += '<li id="'+key+'" class="ui-state-highlight">'+this.fields[key]+'</li>';
        }

        string += '</ul>';
        
        document.getElementById("preview_div").innerHTML = string;
        
        $('#collected_data_ul').scroll(function(){
            $('#sortable1').scrollTop($('#collected_data_ul').scrollTop());
        });
        
        $('#sortable1').scroll(function(){
            $('#collected_data_ul').scrollTop($('#sortable1').scrollTop());
        });
        
        for (var i = 0; i < this.selected_elements.length; i++){
            $('#site_field_'+i+'_cut_button').click({key:i}, function(e){
                builder.separateField(e.data.key);
            });
            
            $('#site_field_'+i+'_saw_button').click({key:i}, function(e){
                builder.openSawFieldDialog(e.data.key);
            });
            
            $('#site_field_'+i+'_delete_button').click({key:i}, function(e){
                builder.deleteField(e.data.key);
            });
        }
        
        for (var i = 0; i < this.selected_element_fields.length; i++){
            $('#site_field_label_'+i+'_delete_button').click({key:i}, function(e){
                builder.deleteFieldLabel(e.data.key);
            });
        }
        
        $( "#labels_data_ul" ).sortable({
            
        }).disableSelection();
        
        $( "#sortable2" ).sortable({
            connectWith: ".connectedSortable",
            remove: function(event, ui) {
                if (ui.item[0].id == "remarks_text"){
                    ui.item.clone().appendTo('#sortable1');
                    $(this).sortable('cancel');                    
                }
            },
            start: function(event, ui) {
                var start_pos = ui.item.index();
                ui.item.data('start_pos', start_pos);
            },
            stop: function(event, ui){
                builder.reloadRemarks();
                builder.createLinks();
            },
            update: function(event, ui) {
                var start_pos = ui.item.data('start_pos');
                var end_pos = ui.item.index();
                //alert(start_pos + ' - ' + end_pos);
            }
        }).disableSelection();

        $("#sortable1").sortable({
            connectWith: ".connectedSortable",
            start: function(event, ui) {
                var start_pos = ui.item.index();
                ui.item.data('start_pos', start_pos);
            },
            stop: function(event, ui){
                builder.reloadRemarks(); 
                builder.createLinks();
            },
            update: function(event, ui) {
                var start_pos = ui.item.data('start_pos');
                var end_pos = ui.item.index();
                //alert(start_pos + ' - ' + end_pos);
            }
        }).disableSelection();
        
        $('#preview_div').show().dialog({
            width: 1000,
            height: 500,
            dialogClass: 'buttons_dialog',
            position: { my: "center", at: "center", of: window },
            beforeClose: function(event, ui) {
                $('#preview_div').hide();
            }
        });
        
        //console.log(this.selected_elements);
    };
    
    this.resetLabels = function(key, length){
        var fields_tmp_array = [];
                
        for (var m = 0; m < this.selected_element_fields.length; m++){
            if (m !== key){
                fields_tmp_array.push(this.selected_element_fields[m]);
            }
            else{
                for (var d = 0; d < length; d++){
                    if (d === 0){
                        fields_tmp_array.push(this.selected_element_fields[m]);
                    }
                    else{
                        fields_tmp_array.push("");
                    }
                }
            }
        }

        this.selected_element_fields = fields_tmp_array;
    };
    
    this.separateFieldByRule = function(rule, key){     
        var splitted = this.saw_rules[rule].func(this.selected_elements[key][1].trim());
        var tmp_array = [];
        var element_id = this.selected_elements[key][0];
        var parent_key = this.findCollectorDataCell(element_id);
        
        this.collector_data[parent_key][1] += "separateByRule("+rule+");";
        
        for (var i = 0; i < this.selected_elements.length; i++){
            if (i != key){
                tmp_array.push(this.selected_elements[i]);
            }
            else if (splitted != null){
                for (var z = 0; z < splitted.length; z++){
                    if (splitted[z] != ""){
                        tmp_array.push([this.selected_elements[i][0]+":"+z, splitted[z], z === 0 ? "parent" : "children", "<span class='transp_text'>"+this.selected_elements[i][1]+"</span>"]);
                    }   
                }
                
                //this.resetLabels(i, splitted.length);
            }
        }
        
        this.selected_elements = tmp_array;
        this.updateFields();
    };
    
    this.separateField = function(key){
        var splitted = this.selected_elements[key][1].trim().split(/(\s+|\/|,)/);
        console.log(key);
        console.log(splitted);
        var tmp_array = [];
        var element_id = this.selected_elements[key][0];
        var parent_key = this.findCollectorDataCell(element_id);
        
        this.collector_data[parent_key][1] += "separate();";
        
        for (var i = 0; i < this.selected_elements.length; i++){
            if (i !== key){
                tmp_array.push(this.selected_elements[i]);
            }
            else{
                for (var z = 0; z < splitted.length; z++){
                    if (splitted[z]  != ""){
                        tmp_array.push([this.selected_elements[i][0]+":"+z, this.filterString(splitted[z]), z === 0 ? "parent" : "children", "<span class='transp_text'>"+this.selected_elements[i][1]+"</span>"]);
                    }
                }
                
                //this.resetLabels(i, splitted.length-1);
            }
        }
        
        this.selected_elements = tmp_array; 
        this.updateFields();
    };
    
    this.filterString = function(string){ // может быть сделать уже при импорте лучше? чтобы у каждого поля свой фильтр
        // string.replace(/[^a-zA-Z0-9 /]/g, ""); //закомментил на время, потому что обрезает лишние символы
        return string;
    };
    
    this.openSawFieldDialog = function(key){
        $('#rule_select').html("");
        
        for (var i = 0; i < this.saw_rules.length; i++){
            $('#rule_select').append("<option key="+key+" value="+i+">"+this.saw_rules[i].pattern+"</option>");
        }
        
        $('#choose_rule_dialog_div').show().dialog({
            width: 400,
            height: 250,
            position: { my: "center", at: "center", of: window },
            beforeClose: function( event, ui ) {
                $('#choose_rule_dialog_div').hide();
            }
        });
    };
    
    this.deleteField = function(key){
        var tmp_array = [];
        var fields_tmp_array = [];
        var element_id = this.selected_elements[key][0];
        var element_status = this.selected_elements[key][2];
        var parent_key = this.findCollectorDataCell(element_id);
        
        if (element_status == "parent"){
            this.collector_data[parent_key][1] += "delete();";
        }
        else if (element_status == "children"){
            var children_key = element_id.split(":")[1];
            this.collector_data[parent_key][1] += "delete("+children_key+");";
        }
        
        for (var i = 0; i < this.selected_elements.length; i++){
            if (i !== key){
                tmp_array.push(this.selected_elements[i]);
            }
        }
        
        /*for (var i = 0; i < this.selected_element_fields.length; i++){
            if (i !== key){
                fields_tmp_array.push(this.selected_element_fields[i]);
            }
        }*/
        /*this.selected_element_fields = fields_tmp_array;*/
        
        this.selected_elements = tmp_array;        
        this.updateFields();
    };
    
    this.deleteFieldLabel = function(key){
        var tmp_array = [];

        for (var i = 0; i < this.selected_element_fields.length; i++){
            if (i !== key){
                tmp_array.push(this.selected_element_fields[i]);
            }
        }

        this.selected_element_fields = tmp_array;
        this.updateFields();
    };
    
    this.isAbleToSeparate = function(data){
        if (data.length > 1 && data.split(" ").length > 1){
            return 1;
        }
        else{
            return 0;
        }
    };
    
    this.concatFieldBack = function(key){
        var tmp_array = [];
        var fields_tmp_array = [];
        var element_id = this.selected_elements[key][0];
        var element_status = this.selected_elements[key][2];
        var parent_key = this.findCollectorDataCell(element_id);
        
        if (element_status == "children"){
            var children_key = element_id.split(":")[1];
            this.collector_data[parent_key][1] += "concate("+children_key+");";
        }
        
        for (var i = 0; i < this.selected_elements.length; i++){
            if (i !== key){
                tmp_array.push(this.selected_elements[i]);
            }
            else{
                this.selected_elements[i-1][1] += this.selected_elements[i][1];
            }
        }
        
        /*for (var i = 0; i < this.selected_element_fields.length; i++){
            if (i !== key){
                fields_tmp_array.push(this.selected_element_fields[i]);
            }
        }*/
        
        this.selected_elements = tmp_array;
        
        /*this.selected_element_fields = fields_tmp_array;
        $('#labels_data_ul').html("");*/
        
        this.updateFields();
    };
    
    this.findCollectorDataCell = function(children_id){
        var parent_key = children_id.split(":")[0];
        
        for (var i = 0; i < this.collector_data.length; i++){
            if (this.collector_data[i][0] == parent_key){
                return i;
            }
        }
    };
    
    this.createLinks = function(){ // создание связок с нашими полями
        //console.log(topreal_field.index());
        $("#sortable1 li").each(function(i, el){
            var link_index = $(el).index();
            var link_id = $(el).attr("id");
            var element_status = builder.selected_elements[link_index][2];
            //console.log(link_index+","+link_id);
            if (builder.selected_elements[link_index] != undefined){
                var element_id = builder.selected_elements[link_index][0];
                var parent_key = builder.findCollectorDataCell(element_id);
                
                if (element_status == "parent"){
                    builder.collector_data[parent_key][1] += "link("+link_id+");";
                }
                else if (element_status == "children"){
                    var children_key = element_id.split(":")[1];
                    builder.collector_data[parent_key][1] += "link("+children_key+","+link_id+");";
                }
                
                
            }
        });
    };
    
    this.updateFields = function(){
        $('#collected_data_ul').html("");
        $('#labels_data_ul').html("");
        
        for (var i = 0; i < this.selected_element_fields.length; i++){ // labels
            var del_icon_url = chrome.extension.getURL("/assets/img/del.png");
            var tooltip_text = this.selected_element_fields[i];
            $('#labels_data_ul').append("<li id='site_label_"+i+"' class='ui-state-default'><div title='"+tooltip_text+"' class='site_field_content'>"+this.selected_element_fields[i][1]+"</div><a class='item_button_a' id='site_field_label_"+i+"_delete_button'><img class='item_button_img' src='"+del_icon_url+"' /></a></li>");
        }
        
        for (var i = 0; i < this.selected_elements.length; i++){            
            var del_icon_url = chrome.extension.getURL("/assets/img/del.png");
            var cut_icon_url = chrome.extension.getURL("/assets/img/cut.png");
            var saw_icon_url = chrome.extension.getURL("/assets/img/saw.png");
            var concat_icon_url = chrome.extension.getURL("/assets/img/arrowup.png");
            var separate_flag = this.isAbleToSeparate(this.selected_elements[i][1]);
            var status = this.selected_elements[i][2];
            var tooltip_text = $(this.selected_elements[i][3]).text()+" "+this.selected_elements[i][1];
            $('#collected_data_ul').append("<li id='site_field_"+i+"' class='ui-state-default'><div title='"+tooltip_text+"' class='site_field_content'>"+this.selected_elements[i][3]+" "+this.selected_elements[i][1]+"</div><a class='item_button_a' id='site_field_"+i+"_delete_button'><img class='item_button_img' src='"+del_icon_url+"' /></a>"+(separate_flag === 1 && status == "parent" ? "<a id='site_field_"+i+"_cut_button' class='item_button_a'><img class='item_button_img' src='"+cut_icon_url+"' /></a><a id='site_field_"+i+"_saw_button' class='item_button_a'><img class='item_button_img' src='"+saw_icon_url+"' /></a>" : "")+(status == "children" ? "<a id='site_field_"+i+"_concat_button' class='item_button_a'><img class='item_button_img' src='"+concat_icon_url+"' /></a>" : "")+"</li>");
        }
        
        for (var i = 0; i < this.selected_elements.length; i++){
            $('#site_field_'+i+'_cut_button').click({key:i}, function(e){
                builder.separateField(e.data.key);
            });
            
            $('#site_field_'+i+'_saw_button').click({key:i}, function(e){
                builder.openSawFieldDialog(e.data.key);
            });
            
            $('#site_field_'+i+'_delete_button').click({key:i}, function(e){
                builder.deleteField(e.data.key);
            });
            
            $('#site_field_'+i+'_concat_button').click({key:i}, function(e){
                builder.concatFieldBack(e.data.key);
            });
        }
        
        for (var i = 0; i < this.selected_element_fields.length; i++){
            $('#site_field_label_'+i+'_delete_button').click({key:i}, function(e){
                builder.deleteFieldLabel(e.data.key);
            });
        }
        
        //console.log(this.selected_elements);
    };
    
    this.getPathTo = function(element) {
        //if (element.id !== '')
            //return 'id("'+element.id+'")';
        //else if (element.class !== '')
            //return 'class("'+element.class+'")';
        if (element === document.body)
            return "HTML/"+element.tagName;

        var ix = 0;
        var siblings = element.parentNode.childNodes;
        for (var i = 0; i < siblings.length; i++){
            var sibling = siblings[i];

            if (sibling === element)
                return this.getPathTo(element.parentNode)+'/'+element.tagName+'['+(ix+1)+']';

            if (sibling.nodeType === 1 && sibling.tagName === element.tagName)
                ix++;
        }
    };

    this.getDataOf = function(element) {
        return $(element).text().trim();
    };
    
    this.getFlagOfCheckbox = function(element){
        var checkbox_class = $(element).attr("class");
        var checkbox_style = $(element).attr("style");
        
        if (this.checked_checkbox.class == checkbox_class || this.checked_checkbox.style == checkbox_style){
            return 1;
        }
        else if (this.unchecked_checkbox.class == checkbox_class || this.unchecked_checkbox.style == checkbox_style){
            return 0;
        }
    };

    this.elementExist = function(xpath){
        var exist = 0;

        for (var i = 0; i < this.selected_elements.length; i++){
            if (this.selected_elements[i][0] == xpath){
                exist = 1;
            }
        }

        return exist;
    };
    
    this.fieldExist = function(text){
        var exist = 0;

        for (var i = 0; i < this.selected_element_fields.length; i++){
            if (this.selected_element_fields[i][1] == text){
                exist = 1;
            }
        }

        return exist;
    };

    this.deleteElement = function(xpath){
        var tmp_array = [];
        var collector_tmp_array = [];

        for (var i = 0; i < this.selected_elements.length; i++){
            if (this.selected_elements[i][0] != xpath){
                tmp_array.push(this.selected_elements[i]);
                collector_tmp_array.push(this.collector_data[i]);
            }
        }

        this.selected_elements = tmp_array;
        this.collector_data = collector_tmp_array;
    };
    
    this.deleteElementField = function(text){
        var tmp_array = [];
        //var collector_tmp_array = [];

        for (var i = 0; i < this.selected_element_fields.length; i++){
            if (this.selected_element_fields[i][1] != text){
                tmp_array.push(this.selected_element_fields[i]);
                //collector_tmp_array.push(this.collector_data[i]);
            }
        }

        this.selected_element_fields = tmp_array;
        //this.collector_data = collector_tmp_array;
    };
    
    this.defineCheckbox = function(target){ // определяет параметры чекбокса для определения чекнутоого и НЕчекнутого
        if (select_checkbox_mode_type === 1){
            this.checked_checkbox.class = $(target).attr("class");
            this.checked_checkbox.style = $(target).attr("style");
            select_checkbox_mode_type = -1;
            select_checkbox_mode = 0;
        }
        else if (select_checkbox_mode_type === 0){
            this.unchecked_checkbox.class = $(target).attr("class");
            this.unchecked_checkbox.style = $(target).attr("style");
            select_checkbox_mode_type = -1;
            select_checkbox_mode = 0;
        }
        
        console.log(this.checked_checkbox);
        console.log(this.unchecked_checkbox);
    };
    
    this.selectElement = function(target){
        if (!this.elementExist(this.getPathTo(target))){
            target.style.boxShadow = "inset 0 0 0 1000px red";
            this.selected_elements.push([this.getPathTo(target), this.getDataOf(target), "parent", "", 1]); // xpath, данные, субординация (parent/children), сценарий, тип данных (1-текст,2-чекбокс)
            this.collector_data.push([this.getPathTo(target), "", 1]);
        }
        else{
            target.style.boxShadow = "0px 0px 5px white";
            this.deleteElement(this.getPathTo(target));
        }
        
        //console.log(this.getPathTo(target));
        //console.log(this.collector_data);
    };
    
    this.selectElementField = function(target){
        if (!this.fieldExist(this.getDataOf(target))){
            target.style.boxShadow = "inset 0 0 0 1000px orange";
            this.selected_element_fields.push([this.getPathTo(target), this.getDataOf(target)]);
            //this.collector_data.push([this.getPathTo(target), ""]);
        }
        else{
            target.style.boxShadow = "0px 0px 5px white";
            this.deleteElementField(this.getDataOf(target));
        }
        
        //console.log(this.selected_element_fields);
        //console.log(this.getPathTo(target));
        //console.log(this.collector_data);
    };
    
    this.selectCheckbox = function(target){
        if (!this.elementExist(this.getPathTo(target))){
            target.style.boxShadow = "inset 0 0 0 1000px red";
            this.selected_elements.push([this.getPathTo(target), this.getFlagOfCheckbox(target), "parent", "", 2]); // xpath, данные, субординация (parent/children), сценарий, тип данных (1-текст,2-чекбокс)
            this.collector_data.push([this.getPathTo(target), "", 2]);
        }
        else{
            target.style.boxShadow = "0px 0px 5px white";
            this.deleteElement(this.getPathTo(target));
        }
        
        //console.log(this.getPathTo(target));
        //console.log(this.collector_data);
    };
    
    /*this.setNoTranslate = function(target){
        target.style.boxShadow = "inset 0 0 0 1000px green";
        $(target).attr("translate", "no").attr("ms_panel", "no");
        this.notranslate_elements.push(this.getPathTo(target));
        console.log(this.notranslate_elements);
    };*/
    
    this.parseYad2Click = function(target){
        var parent_tr = $(target).parent();
        //console.log(parent_tr.attr("id").substr(0, 5));
        
        if (parent_tr.attr("id").substr(0, 5) == "tr_Ad"){
            var ad_url = $('#'+parent_tr.attr("id")+' + tr').children().children().children().children('iframe').attr('src');
            //chrome.tabs.create({ url: ad_url });
            chrome.runtime.sendMessage({action: "open_yad2_newad", url: location.origin+ad_url});
        }
        //else{
        //    this.selectElement(target);
        //}
    };
    
    this.openCollectorDialog = function(){
        $('#save_dialog_div').show().dialog({
            width: 400,
            height: 250,
            position: { my: "center", at: "center", of: window },
            beforeClose: function( event, ui ) {
                $('#save_dialog_div').hide();
            }
        });
    };
    
    this.createCollector = function(){
        if ($('#collector_name_input').val().trim().length > 0){  
            //console.log(this.collector_data)
            $.post("http://topreal.top/api/builder/createcollector.json",{
                title: $('#collector_name_input').val().trim(),
                data: JSON.stringify([this.selected_element_fields, this.collector_data, this.checked_checkbox, this.unchecked_checkbox])
            },function (response){
                if (response.error != undefined){
                    $('#save_response_span').text(response.error.description);
                }
                else{
                    $('#save_response_span').text("Successfully created!");
                    builder.getCollectors();
                }
            });
        }
    };
    
    this.getCollectors = function(){
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
                    builder.getLocale($('#collector_select option:selected').val());
                });
            }
        });
    };
    
    this.getLocale = function(collector){
        if (collector == undefined || collector == "" || collector == null){
            return 0;
        }
        
        $.post("http://topreal.top/api/builder/getlocale.json",{
            collector_id: collector
        },function (response){
            if (response.error == undefined){
                //$('#collector_locale_download_a').show();
            }
            else{
                $('#download_error_span').show().text(response.error.description);
            }
        });
    };
    
    this.tryCollector = function(collector_id){
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
    
    this.reloadRemarks = function(){
        var text = "";
        $('#remarks_edit_area').val("");
        
        for (var i = 0; i < $('#sortable1 li').length; i++){
            if ($($('#sortable1 li')[i]).attr("id") == "remarks_area"){
                text += this.selected_elements[i][1]+"; ";
            }
        }
        
        $('#remarks_edit_area').val(text);
        $('#remarks_edit_area').blur();
    };
}

