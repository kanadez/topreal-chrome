function Collector(){
    this.current = null;
    this.cards_obj = null;
    
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
                //alert(localization.getVariable("collector_msg1"));
                $('.ui-dialog[aria-describedby=not_auth_dialog]').show();
                $('#not_auth_dialog').show().dialog({
                    width: 350,
                    height: 300,
                    dialogClass: 'buttons_dialog',
                    position: { my: "center", at: "center", of: window },
                    beforeClose: function( event, ui ) {
                        $('#not_auth_dialog').hide();
                    }
                });
            }
        });
    };
    
    this.createProperty = function(data){
        $('#try_collector_button, .ui-dialog-titlebar-close').attr("disabled", true);
        $('#try_collector_button').text(localization.getVariable("pls_wait"));
        
        $.post(host+"/api/buildertmp/createproperty.json",{
            data: JSON.stringify(data),
            check_existing: 1
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
                    $('#existing_card_collect_house_flat_span').html(obj.house_flat);
                    $('#existing_card_collect_floor_span').html(obj.floor);
                    $('#open_existing_card_button').click({topreal_id: obj.card_id}, function(e){
                        chrome.runtime.sendMessage({action: "open_yad2_newad", url: host+"/property?id="+e.data.topreal_id});
                    });
                    
                    if (obj.need_to_update && collector.current.TryParseFramePrice($(document).children().html()).length > 0){
                        $('#update_existing_card_button').show();
                    }
                    
                    $('#card_exist_dialog').show().dialog({
                        width: 350,
                        height: 350,
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
                else if (response.error.code == 406){
                    var obj = JSON.parse(response.error.description);
                    var cards_obj = obj.cards_data;
                    collector.cards_obj = obj.cards_data;
                    $('#same_phone_card_exist_table tbody').html("");
                    
                    for (var i = 0; i < cards_obj.length; i++){
                        $('#same_phone_card_exist_table tbody').append(
                            "<tr>\n\
                                <td>"+utils.convertTimestampToDate(cards_obj[i].date)+"</td>\n\
                                <td>"+utils.numberWithCommas(cards_obj[i].price)+"</td>\n\
                                <td>"+cards_obj[i].address+"</td>\n\
                                <td>"+cards_obj[i].house_flat+"</td>\n\
                                <td>"+cards_obj[i].floor+"</td>\n\
                                <td>"+cards_obj[i].rooms+"</td>\n\
                                <td>"+cards_obj[i].home_size+"</td>\n\
                                <td><button class='same_phone_card_update_button' id='same_phone_card_update_"+cards_obj[i].card_id+"' data-external-id-key='"+cards_obj[i].external_id_key+"' data-external-id-value='"+cards_obj[i].external_id_value+"' data-card-id='"+cards_obj[i].card_id+"'>↺</button></td>\n\
                            </tr>"
                        );
                        
                        /*$('#open_same_phone_card_button').click({topreal_id: cards_obj[i].card_id}, function(e){
                            chrome.runtime.sendMessage({action: "open_yad2_newad", url: host+"/property?id="+e.data.topreal_id});
                        });*/
                    }
                    
                    /*if (collector.current.TryParseFramePrice($(document).children().html()).length > 0){
                        $('#update_same_phone_card_button').show();
                    }*/
                
                    collector.current.getStreetTranslation();
                    
                    $('#same_phone_card_dialog').show().dialog({
                        width: 600,
                        height: 450,
                        dialogClass: 'buttons_dialog',
                        position: { my: "center", at: "center", of: window },
                        beforeClose: function( event, ui ) {
                            $('#same_phone_card_dialog').hide();
                        }
                    });
                    
                    $('.same_phone_card_update_button').click(function(event){
                        var arrayVals = collector.current.TryParseFramePrice($(document).children().html()).split(' ');
                        var price_parsed = arrayVals[0].replace(/\D/g, "");
                        
                        $(event.target).text("...").attr("disabled", true);
                        $.post(host+"/api/buildertmp/updateproperty.json",{
                            id: $(event.target).data("card-id"),
                            new_price: price_parsed,
                            external_id_key: $(event.target).data("external-id-key"),
                            external_id_value: $(event.target).data("external-id-value")
                        },function (response){
                            if (response.error != undefined){
                                $('#same_phone_card_dialog>*').hide();
                                $('#same_phone_card_exist_error_span').show();
                            }
                            else{
                                $('#same_phone_card_dialog>*').hide();
                                $('#same_phone_card_exist_success_span, #close_same_phone_card_button, #same_phone_card_dialog>p').show();
                            }
                        });
                    });
                    
                    /*$('#update_same_phone_card_button').click({
                            card_id: obj.card_id
                        }, function(e){
                            var arrayVals = collector.current.TryParseFramePrice($(document).children().html()).split(' ');
                            var price_parsed = arrayVals[0].replace(/\D/g, "");

                            $.post(host+"/api/buildertmp/updateproperty.json",{
                                id: e.data.card_id,
                                new_price: price_parsed
                            },function (response){
                                if (response.error != undefined){
                                    $('#same_phone_card_dialog>*').hide();
                                    $('#same_phone_card_exist_error_span').show();
                                }
                                else{
                                    $('#same_phone_card_dialog>*').hide();
                                    $('#same_phone_card_exist_success_span, #close_same_phone_card_button, #same_phone_card_dialog>p').show();
                                }
                            });
                        }
                    );*/
                }
            }
            else{
                collector.current.onCreatePropertySuccess(response);
            }
        });
    };
    
    this.createPropertyAnyway = function(data){
        $('#try_collector_button, .ui-dialog-titlebar-close').attr("disabled", true);
        $('#try_collector_button').text(localization.getVariable("pls_wait"));
        
        $.post(host+"/api/buildertmp/createproperty.json",{
            data: JSON.stringify(data),
            check_existing: 0
        },function (response){
            $('#try_collector_button, .ui-dialog-titlebar-close').attr("disabled", false);
            $('#try_collector_button').text(localization.getVariable("collector_create_card"));
            
            if (response.error != undefined){
                $('#same_phone_card_exist_error_span').show();
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
                        height: 300,
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
    
    this.updateSamePhone = function(external_id_key, external_id_value, card_id){
        var arrayVals = this.current.TryParseFramePrice($(document).children().html()).split(' ');
        var price_parsed = arrayVals[0].replace(/\D/g, "");

        $('#same_phone_card_update_'+card_id).text("...").attr("disabled", true);
        $.post(host+"/api/buildertmp/updateproperty.json",{
            id: card_id,
            new_price: price_parsed,
            new_rooms: collector.current.values_for_compare.rooms_count,
            new_home_size: collector.current.values_for_compare.home_size,
            external_id_key: external_id_key,
            external_id_value: external_id_value
        },function (response){
            if (response.error != undefined){
                $('#same_phone_card_dialog>*').hide();
                $('#same_phone_card_exist_error_span').show();
            }
            else{
                $('#same_phone_card_dialog>*').hide();
                $('#same_phone_card_exist_success_span, #close_same_phone_card_button, #same_phone_card_dialog>p').show();
                setTimeout(closeCurrentTab, 500);
            }
        });
    };
    
    this.createOnSamePhone = function(){
        $('#create_new_card_anyway_button').attr("disabled", true).text("Подождите...");
        $('.same_phone_card_update_button').attr("disabled", true);
        creating_property_anyway = true;
        this.checkSession();
    };
}

function closeCurrentTab(){
    chrome.runtime.sendMessage({action: "close_current_tab"});
}