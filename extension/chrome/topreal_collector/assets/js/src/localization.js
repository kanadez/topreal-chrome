function Localization(){
    this.locale_value = null;// сюда нужно читать дефолт агента при инициализации
    this.locale_data = null;
    
    this.init = function(){
        $('#locale_select').change(function(){
            localization.setLocale($(this).val());
        });
    };
    
    this.getLocale = function(locale){
        if (locale == -1){
            this.locale_value = "ru";
        }
        else{
            this.locale_value = locale;
        }
        
        $.post(host+"/api/localization/getlocale.json",{
            locale: this.locale_value
        },function (response){
            localization.locale_data = response;

            for (var i = 0; i < response.length; i++){
                var e = $('*[locale="'+response[i].variable+'"]');
                var v = response[i][localization.locale_value];
                e.html(v);
                
                if (e.attr("localized") == undefined){
                    e.attr("localized", "no");
                }
                
                localization.localeTitle(i);
                
                if (localization.isOverflowed(e)){
                    e.attr("title", v);
                    var e_selected = $('*[locale="'+response[i].variable+'"]:selected');
                    
                    if (e_selected.length > 0 && e_selected.attr("localized") == "no"){
                        e_selected.parent().attr("title", v);
                        e_selected.attr("localized", "yes");
                    }
                }
                else{
                    e.attr("title", "");
                }
            }
            
            localization.setArabian();
        });
    };
    
    this.toLocale = function(){
        if (this.locale_data != null){
            for (var i = 0; i < this.locale_data.length; i++){
                var e = $('*[locale="'+this.locale_data[i].variable+'"]');
                var v = this.locale_data[i][this.locale_value];
                e.html(v);
                
                this.localeTitle(i);
                
                if (localization.isOverflowed(e)){
                    e.attr("title", v);
                }
                else{
                    e.attr("title", "");
                }
            }
            
            this.setArabian();
        }
    };
    
    this.getVariable = function(key){ // отдает значение отдельного слова/фразы на текущем языке
        if (this.locale_data != null){
            for (var i = 0; i < this.locale_data.length; i++){
                if (this.locale_data[i].variable === key){
                    return this.locale_data[i][this.locale_value];
                }
            }
        }
    };
    
    this.setLocale = function(locale){
        this.locale_value = locale;
        //utils.setCookie("locale", locale, {expires: 315360000});
        //$('#locale_select').val(locale);
        this.getLocale(locale);
    };
    
    this.setDefault = function(){
        localization.locale_value = "en";
        this.getLocale("en");
    };
    
    this.localeDynamic = function(wrapper){
        
    };
    
    this.localeTitle = function(counter){
        var e = $('*[locale_title="'+this.locale_data[counter].variable+'"]');
        var v = this.locale_data[counter][this.locale_value];
        e.attr("title", v);

        e = $('*[locale_data_title="'+this.locale_data[counter].variable+'"]');
        v = this.locale_data[counter][this.locale_value];
        e.attr("data-title", v);

        e = $('*[locale_placeholder="'+this.locale_data[counter].variable+'"]');
        v = this.locale_data[counter][this.locale_value];
        e.attr("placeholder", v);
    };
    
    this.setArabian = function(){
        if (location.pathname == "/" && (this.locale_value == "he" || this.locale_value == "ar" || this.locale_value == "fa")){
            $('body').attr("dir", "rtl");
        }
        else if (location.pathname != "/" && (this.locale_value == "he" || this.locale_value == "ar" || this.locale_value == "fa")){
            $('span, label, input, button, a, .modal, select, textarea').css("direction", "rtl");
            $('#tools_button, #help_a, #toggle-right, #logout_a').css("direction", "ltr");
            $('.show_password_span').css("right", "-21px");
        }
        else{
            $('body').attr("dir", "ltr");
            $('span, label, input, button, a, .modal, select, textarea').css("direction", "ltr");
            $('.show_password_span').css("right", "12px");
        }
    };
    
    this.isArabian = function(){
        if (this.locale_value === "he" || this.locale_value === "ar" || this.locale_value === "fa"){
            return true;
        }
        else{
            return false;
        }
    };
    
    this.isOverflowed = function(element){
        var e = element[0];
        
        if (e != undefined){
            return e.scrollHeight > e.clientHeight || e.scrollWidth > e.clientWidth || this.textOverflowed(element);
        }
        else{
            return false;
        }
    };
    
    this.textOverflowed = function(e) {
        var tagname = e.prop("tagName");
        var font = e.css("font-family");
        var font_size = e.css("font-size");
        var font_weight = e.css("font-weight");
        // if given, use cached canvas for better performance
        // else, create new canvas
        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");
        context.font = font+" "+font_size+" "+font_weight;
        
        switch (tagname) {
            case "OPTION":
                var metrics = context.measureText(e.html());
                
                if (e.parent().width() > metrics.width*1.3){
                    return false;
                }
                else return true;
            break;
            case "INPUT": 
                var metrics = context.measureText(e.val());
                
                if (e.width() > metrics.width*1.3){
                    return false;
                }
                else{
                    return true;
                }
            break;
        }
    };
}