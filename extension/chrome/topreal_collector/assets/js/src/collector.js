function Collector(){
    this.current = null;
    
    switch (location.origin){
        case "http://www.yad2.co.il":
            this.current = new Yad2();
        break;
        case "https://www.winwin.co.il":
            this.current = new WinWin();
        break;
    }
    
    this.checkSession = function(){
        $.post(host+"/api/buildertmp/checksession.json", {}, function (response){
            if (response){
                collector.current.collectData();
            }
            else{
                alert(localization.getVariable("collector_msg1"));
            }
        });
    };
    
    this.createProperty = function(data){
        $('#try_collector_button, .ui-dialog-titlebar-close').attr("disabled", true);
        $('#try_collector_button').text(localization.getVariable("pls_wait"));
        
        $.post(host+"/api/buildertmp/createproperty.json",{
            data: JSON.stringify(data)
        },function (response){
            $('#try_collector_button, .ui-dialog-titlebar-close').attr("disabled", false);
            $('#try_collector_button').text(localization.getVariable("collector_create_card"));
            
            if (response.error != undefined){
                if (response.error.code == 405){
                    var obj = JSON.parse(response.error.description);
                    //console.log(obj);
                    $('#existing_card_collect_date_span').html(utils.convertTimestampToDate(obj.date));
                    $('#existing_card_price_span').html(utils.numberWithCommas(obj.price));
                    $('#existing_card_collect_address_span').html(obj.address);
                    $('#open_existing_card_button').click({topreal_id: obj.card_id}, function(e){
                        chrome.runtime.sendMessage({action: "open_yad2_newad", url: host+"/property?id="+e.data.topreal_id});
                    });
                    
                    if (obj.need_to_update && collector.current.TryParseFramePrice($(document).children().html()).length > 0){
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
                            var arrayVals = collector.current.TryParseFramePrice($(document).children().html()).split(' ');
                            var price_parsed = arrayVals[0].replace(/\D/g, "");

                            $.post(host+"/api/buildertmp/updateproperty.json",{
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
                collector.current.onCreatePropertySuccess(response);
            }
        });
    };
    
    this.createClient = function(data){
        $('#try_collector_button, .ui-dialog-titlebar-close').attr("disabled", true);
        $('#try_collector_button').text(localization.getVariable("pls_wait"));

        $.post(host+"/api/buildertmp/createclient.json",{
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
                    
                    if (obj.need_to_update && collector.current.TryParseFramePrice($(document).children().html()).length > 0){
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
                            var arrayVals = collector.current.TryParseFramePrice($(document).children().html()).split(' ');
                            var price_parsed = arrayVals[0].replace(/\D/g, "");

                            $.post(host+"/api/buildertmp/updateproperty.json",{
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
                location.href = host+"/client?id="+response+"&mode=collected";
            }
        });
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
    
}