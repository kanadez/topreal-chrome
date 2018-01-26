<?php 
// test comment
use Database\TinyMVCDatabase as DB;

class BuilderTmp{ 
    public function removeExternalProperty($external_id){
        $ep = PropertyExternal::load(intval($external_id));
        $ep->deleted = 1;
        return $ep->save();
    }
    
    public function getExist($ids, $collector){
        global $agency;
        
        return json_decode([]); // закрываем временно работу функции
        
        $ids_decoded = json_decode($ids);
        
        for ($i = 0; $i < count($ids_decoded); $i++){
            if ($ids_decoded[$i][0] == null){
               unset($ids_decoded[$i]);
               continue;
            }
            
            //$id = explode("_", $ids_decoded[$i][0]);
            //$id_exploded = array_pop($id);
            $property = Property::loadByRow("external_id_".$collector, $ids_decoded[$i][0]); // для Я2 это hex
            
            if ($property === FALSE || $property->temporary == 1 || $property->deleted == 1){
                unset($ids_decoded[$i]);
            }
            else{
                if ($agency->getId() == 1 && ((trim($ids_decoded[$i][1]) != "" && $property->price != $ids_decoded[$i][1]) )){
                    $this->updatePropertyExternal($ids_decoded[$i][0], $ids_decoded[$i][1], $collector);
                    $ids_decoded[$i] = [$ids_decoded[$i][0], false, $property->last_updated, $property->price, $property->id, $property->street_text, $property->floor_from, $property->rooms_count];
                }
                else{
                    $ids_decoded[$i] = [$ids_decoded[$i][0], false, $property->last_updated, $property->price, $property->id, $property->street_text, $property->floor_from, $property->rooms_count];
                }
            }
        }
        
        return $ids_decoded;
    }
    
    public function getStatForAgent(){
        global $agency;
        
        define("MONTH_START", strtotime("first day of this month")-(time() - strtotime("today")));
        define("MONTH_END", strtotime("last day of this month")-(time() - strtotime("today"))+86399);
        define("TODAY_START", strtotime("midnight"));
        define("TODAY_END", strtotime("midnight")+86399);
        
        if ($agency->getId() == 1){
            $query = DB::createQuery()->select('id')->where('agent_id = ? AND ('
                    . 'external_id IS NOT NULL OR '
                    . 'external_id_hex IS NOT NULL OR '
                    . 'external_id_winwin IS NOT NULL'
                    . ') AND temporary = 0 AND deleted = 0 AND timestamp BETWEEN ? AND ?'); 
            $properties_for_today = Property::getList($query, [$_SESSION["user"], TODAY_START, TODAY_END]);
            $properties_for_month = Property::getList($query, [$_SESSION["user"], MONTH_START, MONTH_END]);

            $query = DB::createQuery()->select('id')->where('agent_id = ? AND ('
                    . 'external_id IS NOT NULL OR '
                    . 'external_id_hex IS NOT NULL OR '
                    . 'external_id_winwin IS NOT NULL'
                    . ') AND temporary = 0 AND deleted = 0'); 
            $properties_total = Property::getList($query, [$_SESSION["user"]]);
            
            $query = DB::createQuery()->select('id')->where('user = ? AND timestamp BETWEEN ? AND ?'); 
            $updated_for_today = CollectorEvent::getList($query, [$_SESSION["user"], TODAY_START, TODAY_END]);
            $updated_for_month = CollectorEvent::getList($query, [$_SESSION["user"], MONTH_START, MONTH_END]);
            
            $query = DB::createQuery()->select('id')->where('user = ?'); 
            $updated_total = CollectorEvent::getList($query, [$_SESSION["user"]]);
        }
        else{
            return -1;
        }
            
        return [
            count($properties_for_today), 
            count($properties_for_month), 
            count($properties_total),
            count($updated_for_today),
            count($updated_for_month),
            count($updated_total)
        ];
    }
    
    public function getCSV($data){        
        $csv_name = "collector.csv";
        $csv = fopen(dirname(dirname(__FILE__))."/storage/".$csv_name, "wb");
        $json_parsed = json_decode($data);
        $object_keys = ["Topreal field", "Site field"]; 
        $object_vals = [];
        fputcsv($csv, $object_keys);

        foreach ($json_parsed as $fields){
            fputcsv($csv, $fields);
        }

        fclose($csv);
        
        return $csv_name;
    }
    
    public function createCollector($title, $data){
        $new_collector = Collector::create(["title" => strval($title), "data" => strval($data)]);
        return $new_collector->save();
    }
    
    public function saveCollector($id, $data){
        $collector = Collector::load(intval($id));
        $collector->data = strval($data);
        return $collector->save();
    }
    
    public function getCollectors(){
        return Collector::getList();
    }
    
    public function getCollector($id){
        return Collector::load($id);
    }
    
    public function getLocale($collector){ // отдает данные для адаптации в виде CSV-файла
        $query = DB::createQuery()->select('*')->where('collector=?'); 
        $result = CollectorLocale::getList($query, [intval($collector)]);
        
        $csv_name = "collector_locale.csv";
        $csv = fopen(dirname(dirname(__FILE__))."/storage/".$csv_name, "wb");
        $object_keys = [];
        
        array_push($object_keys, "ID");
        array_push($object_keys, "Collector");
        array_push($object_keys, "Site field");
        array_push($object_keys, "TopReal field");
        
        fputcsv($csv, $object_keys);
        
        for ($i = 0; $i < count($result); $i++){
            $object_vals = [];

            foreach ($result[$i] as $key => $val){
                array_push($object_vals, $val);
            }

            fputcsv($csv, $object_vals);
        }
        
        if (count($object_vals) == 0){
            fputcsv($csv, ["0",$collector,"test field 1","test field 2"]);
        }

        fclose($csv);
        
        return $csv_name;
    }
    
    public function getLocaleForCollector($collector){ // отдает данные для адаптации в виде CSV-файла
        $query = DB::createQuery()->select('*')->where('collector=?'); 
        return CollectorLocale::getList($query, [intval($collector)]);
    }
    
    public function updatePropertyExternal($external_id, $new_price, $collector){
        global $property;
        
        $update_event = CollectorEvent::create([
            "event" => 1,
            "user" => $_SESSION["user"],
            "timestamp" => time()
        ]);
        $update_event->save();
        
        $property_to_update = Property::loadByRow("external_id_".$collector, strval($external_id));
        $property->savePriceHistory($property_to_update->id, $new_price, $property_to_update->price, $property_to_update->currency_id);
        $property->setStockHistory($property_to_update->id, '{"price":{"old":"'.$property_to_update->price.'","new":"'.$new_price.'"}}');
        $property_to_update->price = intval($new_price);
        $property_to_update->last_updated = time();
        
        PropertyExternal::createLink($property_to_update, $external_id);
         
        return $property_to_update->save();
    }
    
    public function updateProperty($id, $new_price, $external_id_key = null, $external_id_value = null){
        global $property;
        
        $update_event = CollectorEvent::create([
            "event" => 1,
            "user" => $_SESSION["user"],
            "timestamp" => time()
        ]);
        $update_event->save();
        
        $property_to_update = Property::load(intval($id));
        $property->savePriceHistory($id, $new_price, $property_to_update->price, $property_to_update->currency_id);
        $property->setStockHistory($id, '{"price":{"old":"'.$property_to_update->price.'","new":"'.$new_price.'"}}');
        $property_to_update->price = intval($new_price);
        
        if ($external_id_key != null && $external_id_value != null){
            $property_to_update->$external_id_key = $external_id_value;
            $property_to_update->external_id = $external_id_value;
        }
        
        $property_to_update->last_updated = time();
        
        PropertyExternal::createLink($property_to_update, $property_to_update->external_id);
        PropertyExternal::createLink($property_to_update, $property_to_update->external_id_hex);
        PropertyExternal::createLink($property_to_update, $property_to_update->external_id_winwin);
         
        return $property_to_update->save();
    }
    
    public function createProperty($json_data, $check_existing){
        global $property_form_data, $currency, $agency, $googleac, $stock, $utils;
        $decoded = json_decode($json_data, true);
        $user = $_SESSION["user"];
        $suffix = $decoded["collector_suffix"];
        //return var_dump($decoded);
        try{// здесь нужно будет все параметры сделать динамичными :
            if ($check_existing == 1){
                //############### проверяем есть ли такая карточка в стоке или агентстве ############### //
                $query = DB::createQuery()->select('id, last_updated, price, street_text, house_number, flat_number, floor_from, currency_id')->where('external_id_'.$suffix.' = ? AND (agency = ? OR stock = 1) AND temporary = 0 AND deleted = 0'); 
                $properties = Property::getList($query, [intval($decoded['external_id_'.$suffix]), $agency->getId()]);

                if (count($properties) > 0){
                    $message = [
                        "message" => "card_already_exist", 
                        "date" => $properties[0]->last_updated,
                        "price" => $decoded["price"].' '.$currency->getSymbolCode($properties[0]->currency_id),
                        "address" => $properties[0]->street_text,
                        "house_flat" => $properties[0]->house_number."/".$properties[0]->flat_number,
                        "floor" => $properties[0]->floor_from,
                        "card_id" => $properties[0]->id,
                        "need_to_update" => false
                    ];
                    
                    if ($agency->getId() == 1 && $properties[0]->price != $decoded["price"]){
                        $this->updateProperty($properties[0]->id, $decoded["price"]);
                    }

                    $res = PropertyExternal::createLink($properties[0], $decoded['external_id_'.$suffix]);

                    throw new Exception(json_encode($message), 405);
                }

                //############### проверяем есть ли карточка с таким номером тел. и ценой в стоке или агентстве ############### //
                $ascription = $decoded["ascription"] == "sale" ? 0 : 1;
                $city = str_replace('"', "", $this->getPlaceIdByAddress($decoded["city"]." ".$decoded["country"]));
                $city_text = Geo::getFullAddress($city);
                $phone_exploded = $utils->explodePhone($decoded["contact1"]);
                $query = DB::createQuery()
                        ->select('id, last_updated, price, street_text, house_number, flat_number, floor_from, rooms_count, home_size, floors_count, currency_id, external_id, external_id_hex, external_id_winwin')
                        ->where('(city = ? OR city_text = ?) AND ascription = ? AND (contact1 REGEXP ? OR contact2 REGEXP ? OR contact3 REGEXP ? OR contact4 REGEXP ?) AND stock = 1 AND temporary = 0 AND deleted = 0'); 
                $properties = Property::getList($query, [$city, $city_text, $ascription, $phone_exploded, $phone_exploded, $phone_exploded, $phone_exploded]);

                if (count($properties) > 0){
                    $cards_data = [];

                    for ($i = 0; $i < count($properties); $i++){
                        $card_data = [
                            "date" => $properties[$i]->last_updated,
                            "price" => $properties[$i]->price.' '.$currency->getSymbolCode($properties[$i]->currency_id),
                            "address" => $properties[$i]->street_text,
                            "house_flat" => $properties[$i]->house_number."/".$properties[$i]->flat_number,
                            "floor" => $properties[$i]->floor_from."/".$properties[$i]->floors_count,
                            "rooms" => $properties[$i]->rooms_count,
                            "home_size" => $properties[$i]->home_size,
                            "card_id" => $properties[$i]->id,
                            "external_id_key" => 'external_id_'.$suffix,
                            "external_id_value" => $decoded['external_id_'.$suffix],
                            "need_to_update" => $properties[$i]->price != $decoded["price"] ? true : false
                        ];
                        array_push($cards_data, $card_data);
                    }

                    $message = [
                        "message" => "same_phone_card_exist", 
                        "cards_data" => $cards_data
                    ];

                    throw new Exception(json_encode($message), 406);
                }
            }

            //###################################################################################### //
            
            $property = Property::create([
                "stock" => 1, 
                "agent_id" => $user, 
                "agency" => $agency->getId(), 
                "home_dims" => 5, 
                "lot_dims" => 5, 
                //"country" => "ChIJi8mnMiRJABURuiw1EyBCa2o", 
                "timestamp" => time(), 
                "statuses" => 0,
                "collected" => 1
            ]); 
            
            foreach ($decoded as $key => $val){ // перебираем поля недвижимости 
                switch ($key){
                    case "yad2_subcat_id":
                        if (strlen($val) > 0){
                            $property->yad2_subcat_id = $val;
                        }
                    break;
                    case "country":
                        $parsed = str_replace('"', "", $this->getPlaceIdByAddress($val));

                        if ($parsed != null && $parsed != "null"){
                            $property->country = $parsed;
                            $property->country_text = Geo::getFullAddress($property->country);
                        }
                        else{
                            $property->remarks_text .= " ".$key.": ".$val.", ";
                            $error++;
                        }
                    break;
                    case "city":
                        if (strlen($val) === 0)
                            $error++;
                        else{ 
                            $parsed = str_replace('"', "", $this->getPlaceIdByAddress($val." ".$decoded["country"]));

                            if ($parsed != null && $parsed != "null"){
                                $property->city = $parsed;
                                $property->city_text = Geo::getFullAddress($property->city);
                            }
                            else{
                                $property->remarks_text .= " ".$key.": ".$val.", ";
                                $error++;
                            }
                        }
                    break;
                    case "neighborhood":
                        if (strlen($val) > 0){
                            $parsed = str_replace('"', "", $this->getPlaceIdByAddress($val." ".$decoded["city"]." ".$decoded["country"]));

                            if ($parsed != null && $parsed != "null"){
                                $property->neighborhood = $parsed;
                                $property->neighborhood_text = Geo::getFullAddress($property->neighborhood);
                                $googleac->ajaxAddShort($parsed);
                            }
                            else{
                                $property->remarks_text .= " ".$key.": ".$val.", ";
                                $error++;
                            }
                        }
                    break;
                    case "street":
                        if (strlen($val) > 0){
                            $parsed = str_replace('"', "", $this->getPlaceIdByAddress($val." ".$decoded["city"]." ".$decoded["country"]));

                            if ($parsed != null && $parsed != "null" && $parsed != $property->city){
                                $property->street = $parsed;
                                $latlng = Geo::getTrueLocation($property->street, $decoded["house_number"], $decoded["statuses"]);
                                $property->lat = $latlng["lat"];
                                $property->lng = $latlng["lng"];
                                $property->street_text = Geo::getFullAddress($property->street);
                                $googleac->ajaxAddShort($parsed);
                            }
                            else{
                                $property->remarks_text .= " ".$key.": ".$val.", ";
                                $error++;
                            }
                        }
                    break;
                    case "ascription":
                        if (strlen($val) === 0)
                            $error++;
                        else{
                            $index = array_search($val, $property_form_data["ascription"]);

                            if ($index === FALSE){
                                $property->remarks_text .= " ".$key.": ".$val.", ";
                                $error++;
                            }
                            else{   
                                $property->ascription = $index;
                                
                                if ($index == 1){
                                    $property->remarks_text .= $decoded["rent_remark"];
                                }
                            }
                        }
                    break;
                    case "statuses":
                        /*if (strlen($val) === 0)
                            $error++;
                        else{
                            //$index = array_search($val, $property_form_data["status"]);
                            //$index = 0; // строка выше закомментирована хотя не должна быть. сейчас статус по умолч актуально, хотя может быть и другой, это сделано в строке выше
                            // строки выше закомментированы, потому как статус по умолчанию задается вверху жестко. хотя этого быть не должно на будущее
                            
                            if ($index === FALSE){
                                $property->remarks_text .= " ".$key.": ".$val.", ";
                                $error++;
                            }
                            else $property->statuses = $index;
                        }*/
                    break;
                    case "furniture_flag": // закоментировано изза ошибки. В. решение: нужны переводы для всех furniture_flag
                        if ($val == 1){
                            $property->furniture_flag = 1;
                        }
                        else if ($val == 0){
                            $property->furniture_flag = 0;
                        }
                        else if ($val == 3){
                            $property->furniture_flag = 3;
                        }
                        else{ 
                            $property->furniture_flag = 2;
                        }
                        //$property->remarks_text .= " ".$key.": ".$val.", ";
                    break;
                    case "types":
                        if (strlen(str_replace('"', "", $val)) === 0){
                            $property->remarks_text .= " ".$key.": ".$val.", ";
                            $error++;
                        }

                        $exploded = explode(",", str_replace('"', "", $val));

                        if (is_array($exploded)){
                            $property->types = [];

                            for ($m = 0; $m < count($exploded); $m++){
                                $index = array_search($exploded[$m], $property_form_data["property_type"]);

                                if ($index === FALSE){
                                    $property->remarks_text .= " ".$key.": ".$val.", ";
                                    $error++;
                                }
                                else array_push($property->types, $index);
                            }

                            $property->types = json_encode($property->types);
                        }
                        else $error++;
                    break;
                    case "price":
                        if (strlen($val) === 0){
                            //$property->remarks_text .= " ".$key.": ".$val.", ";
                            //$error++;
                            $property->price = 0;
                        }
                        else $property->price = $val;
                    break;
                    case "currency_id":
                        if (strlen($val) === 0){
                            $property->remarks_text .= " ".$key.": ".$val.", ";
                            $error++;
                        }

                        $id = $currency->getCode($val);

                        if (is_array($id)){
                            $property->remarks_text .= " ".$key.": ".$val.", ";
                            $error++;
                        }
                        else $property->currency_id = $id;
                    break;
                    case "age":
                        $property->age = $val;
                    break;
                    case "floor_from":
                        $property->floor_from = $val;
                    break;
                    case "floors_count":
                        $property->floors_count = $val;
                    break;
                    case "rooms_count":
                        $property->rooms_count = $val;
                    break;
                    case "project_id":
                        if (strlen($val) > 0){
                            $id = $agency->getProjectId($val);

                            if (is_array($id)){
                                $property->remarks_text .= " ".$key.": ".$val.", ";
                                $error++;
                            }
                            else $property->project_id = $id;
                        }
                    break;
                    case "parking_flag":
                        $property->parking_flag = $val == 1 ? 1 : null;
                    break;
                    case "air_cond_flag":
                        $property->air_cond_flag = $val == 1 ? 1 : null;;
                    break;
                    case "elevator_flag":
                        $property->elevator_flag = $val == 1 ? 1 : null;;
                    break;
                    /*case "facade_flag":
                        $property->facade_flag = $val == "Yes" ? 1 : 0;
                    break;
                    case "last_floor_flag":
                        $property->last_floor_flag = $val == "Yes" ? 1 : 0;
                    break;
                    case "ground_floor_flag":
                        $property->ground_floor_flag = $val == "Yes" ? 1 : 0;
                    break;*/
                    case "home_dims":
                        if (strlen($val) > 0){
                            $index = array_search($val, $property_form_data["dimension"]);

                            if ($index === FALSE){
                                $property->remarks_text .= " ".$key.": ".$val.", ";
                                $error++;
                            }
                            else $property->home_dims = $index;
                        }
                    break;
                    case "lot_dims":
                        if (strlen($val) > 0){
                            $index = array_search($val, $property_form_data["dimension"]);

                            if ($index === FALSE){
                                $property->remarks_text .= " ".$key.": ".$val.", ";
                                $error++;
                            }
                            else $property->lot_dims = $index;
                        }
                    break;
                    case "house_number":
                        $property->house_number = $val;
                    break;
                    case "flat_number":
                        $property->flat_number = $val;
                    break;
                    case "home_size":
                        $property->home_size = $val;
                    break;
                    case "lot_size":
                        $property->lot_size = $val;
                    break;
                    case "views":
                        if (strlen(str_replace('"', "", $val)) > 0){
                            $exploded = explode(",", str_replace('"', "", $val));

                            if (is_array($exploded)){
                                $property->views = [];

                                for ($m = 0; $m < count($exploded); $m++){
                                    $index = array_search($exploded[$m], $property_form_data["view"]);

                                    if ($index === FALSE){
                                        $property->remarks_text .= " ".$key.": ".$val.", ";
                                        $error++;
                                    }
                                    else array_push($property->views, $index);
                                }

                                $property->views = json_encode($property->views);
                            }
                            else{
                                $property->remarks_text .= " ".$key.": ".$val.", ";
                                $error++;
                            }
                        }
                    break;
                    case "free_from": // то, что закоментировано, нужно будет заставить рабоать
                        if (strlen($val) > 0){
                            if ($val === "immediately"){
                                $property->free_from = time();
                            }
                            elseif (strlen($val) == 10){
                                $a = strptime($val, '%d/%m/%Y');

                                if ($a === FALSE){
                                    $property->remarks_text .= " ".$key.": ".$val.", ";
                                    $error++;
                                }
                                else{ 
                                    $property->free_from = mktime(0, 0, 0, $a['tm_mon']+1, $a['tm_mday'], $a['tm_year']+1900);
                                }
                            }
                            else{
                                $property->remarks_text .= $val.", ";
                            }
                        }
                    break;
                    case "directions":
                        if (strlen(str_replace('"', "", $val)) > 0){
                            $exploded = explode(",", str_replace('"', "", $val));

                            if (is_array($exploded)){
                                $property->directions = [];

                                for ($m = 0; $m < count($exploded); $m++){
                                    $index = array_search($exploded[$m], $property_form_data["direction"]);

                                    if ($index === FALSE){
                                        $property->remarks_text .= " ".$key.": ".$val.", ";
                                        $error++;
                                    }
                                    else array_push($property->directions, $index);
                                }

                                $property->directions = json_encode($property->directions);
                            }
                            else{
                                $property->remarks_text .= " ".$key.": ".$val.", ";
                                $error++;
                            }
                        }
                    break;
                    case "name":
                        $property->name = $val;
                    break;
                    case "contact5":
                        if (filter_var($val, FILTER_VALIDATE_EMAIL)){
                            $property->email = $val;
                        }
                    break;
                    case "contact1":
                        if (strlen($val) === 0){
                            $property->remarks_text .= " ".$key.": ".$val.", ";
                            $error++;
                        }
                        else $property->contact1 = $val;
                    break;
                    case "contact2":
                        $property->contact2 = $val;
                    break;
                    case "contact3":
                        $property->contact3 = $val;
                    break;
                    case "contact4":
                        $property->contact4 = $val;
                    break;
                    case "remarks_text":
                        $property->remarks_text .= str_replace('"', "", $val);
                    break;
                    case "external_id":
                        $property->external_id = $val;
                    break;
                    case "external_id_".$suffix:
                        $varname = "external_id_".$suffix;
                        $property->$varname = $val;
                    break;
                    case "collector_suffix":
                        // нихрена не делаем
                    break;
                    default:
                        $property->remarks_text .= " ".$key.": ".str_replace('"', "", $val).", ";
                        $error++;
                    break;
                }
            }
            
            $response = $property->save();
            
            $property_object = new Property;
            $property_props = get_object_vars($property);
            $property_object->set($response, json_encode($property_props), 1);
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function createClient($json_data){
        global $client_form_data, $currency, $agency;
        $decoded = json_decode($json_data, true);
        $user = $_SESSION["user"];
        $suffix = $decoded["collector_suffix"];
        //return var_dump($decoded);
        try{// здесь нужно будет все параметры сделать динамичными :
            //############### проверяем есть ли такая карточка в стоке или агентстве ############### //
            
            $price_from = $decoded["price"]-$decoded["price"]*.15;
            $price_to = $decoded["price"]+$decoded["price"]*.15;
            $query = DB::createQuery()->select('id, last_updated, price_from, price_to, currency_id')->where('external_id_'.$suffix.' = ? AND agency = ? AND temporary = 0 AND deleted = 0'); 
            $clients = Client::getList($query, [intval($decoded['external_id_'.$suffix]), $agency->getId()]);

            if (count($properties) > 0){
                $message = [
                    "message" => "card_already_exist", 
                    "date" => $properties[0]->last_updated,
                    "price" => $properties[0]->price_from.' - '.$properties[0]->price_to.' '.$currency->getSymbolCode($properties[0]->currency_id),
                    "card_id" => $properties[0]->id,
                    "need_to_update" => $agency->getId() == 1 && ($properties[0]->price_from != $price_from || $properties[0]->price_to != $price_to || $properties[0]->last_updated < time()-5184000) ? true : false
                ];
                
                throw new Exception(json_encode($message), 405);
            }
            
            //############### проверяем есть ли карточка с таким номером тел. и ценой в стоке или агентстве ############### //
            /*$query = DB::createQuery()->select('id, last_updated, price, currency_id')->where('(contact1 = ? OR contact2 = ? OR contact3 = ? OR contact4 = ?) AND price = ? AND (agency = ? OR stock = 1) AND temporary = 0 AND deleted = 0'); 
            $properties = Property::getList($query, [$decoded["contact1"], $decoded["contact1"], $decoded["contact1"], $decoded["contact1"], $decoded["price"], $agency->getId()]);

            if (count($properties) > 0){
                $message = [
                    "message" => "card_already_exist", 
                    "date" => $properties[0]->last_updated,
                    "price" => $properties[0]->price.' '.$currency->getSymbolCode($properties[0]->currency_id),
                    "card_id" => $properties[0]->id,
                    "need_to_update" => false
                ];
                
                throw new Exception(json_encode($message), 405);
            }*/

            //###################################################################################### //
            
            $client = Client::create([
                "agent_id" => $user, 
                "agency" => $agency->getId(), 
                "home_size_dims" => 5, 
                //"lot_size_dims" => 5, 
                //"country" => "ChIJi8mnMiRJABURuiw1EyBCa2o", 
                "timestamp" => time(), 
                "status" => 0
            ]); 
            
            foreach ($decoded as $key => $val){ // перебираем поля недвижимости 
                switch ($key) {
                    case "country":
                        $parsed = str_replace('"', "", $this->getPlaceIdByAddress($val));

                        if ($parsed != null){
                            $client->country = $parsed;
                            $client->country_text = Geo::getFullAddress($client->country);
                        }
                        else{
                            $client->remarks_text .= " ".$key.": ".$val.", ";
                            $error++;
                        }
                    break;
                    case "city":
                        if (strlen($val) === 0)
                            $error++;
                        else{ 
                            $parsed = str_replace('"', "", $this->getPlaceIdByAddress($val." ".$decoded["country"]));

                            if ($parsed != null){
                                $client->city = $parsed;
                                $client->city_text = Geo::getFullAddress($client->city);
                            }
                            else{
                                $client->remarks_text .= " ".$key.": ".$val.", ";
                                $error++;
                            }
                        }
                    break;
                    case "neighborhood":
                        if (strlen($val) > 0){
                            $parsed = str_replace('"', "", $this->getPlaceIdByAddress($val." ".$decoded["city"]." ".$decoded["country"]));

                            if ($parsed != null){
                                $client->neighborhood = $parsed;
                                $client->neighborhood_text = Geo::getFullAddress($client->neighborhood);
                            }
                            else{
                                $client->remarks_text .= " ".$key.": ".$val.", ";
                                $error++;
                            }
                        }
                    break;
                    case "street":
                        if (strlen($val) > 0){
                            $parsed = str_replace('"', "", $this->getPlaceIdByAddress($val." ".$decoded["city"]." ".$decoded["country"]));

                            if ($parsed != null && $parsed != $client->city){
                                $client->street = json_encode([$parsed]);
                                $latlng = Geo::getTrueLocation($parsed, $decoded["house_number"], $decoded["statuses"]);
                                $client->lat = $latlng["lat"];
                                $client->lng = $latlng["lng"];
                                $client->street_text = json_encode([Geo::getFullAddress($parsed)]);
                            }
                            else{
                                $client->remarks_text .= " ".$key.": ".$val.", ";
                                $error++;
                            }
                        }
                    break;
                    case "ascription":
                        if (strlen($val) === 0)
                            $error++;
                        else{
                            $index = array_search($val, $client_form_data["ascription"]);

                            if ($index === FALSE){
                                $client->remarks_text .= " ".$key.": ".$val.", ";
                                $error++;
                            }
                            else{   
                                $client->ascription = $index;
                                
                                if ($index == 1){
                                    $client->remarks_text .= $decoded["rent_remark"];
                                }
                            }
                        }
                    break;
                    case "furniture_flag": // закоментировано изза ошибки. В. решение: нужны переводы для всех furniture_flag
                        if ($val == 1){
                            $client->furniture_flag = 1;
                        }
                        else if ($val == 0){
                            $client->furniture_flag = 0;
                        }
                        else if ($val == 3){
                            $client->furniture_flag = 3;
                        }
                        else{ 
                            $client->furniture_flag = 2;
                        }
                        //$property->remarks_text .= " ".$key.": ".$val.", ";
                    break;
                    case "types":
                        if (strlen(str_replace('"', "", $val)) === 0){
                            $client->remarks_text .= " ".$key.": ".$val.", ";
                            $error++;
                        }

                        $exploded = explode(",", str_replace('"', "", $val));

                        if (is_array($exploded)){
                            $client->property_types = [];

                            for ($m = 0; $m < count($exploded); $m++){
                                $index = array_search($exploded[$m], $client_form_data["property_type"]);

                                if ($index === FALSE){
                                    $client->remarks_text .= " ".$key.": ".$val.", ";
                                    $error++;
                                }
                                else array_push($client->property_types, $index);
                            }

                            $client->property_types = json_encode($client->property_types);
                        }
                        else $error++;
                    break;
                    case "price":
                        if (strlen($val) === 0){
                            //$property->remarks_text .= " ".$key.": ".$val.", ";
                            //$error++;
                            $client->price_from = 0;
                            $client->price_to = 0;
                        }
                        else{
                            $client->price_from = $val-$val*.15;
                            $client->price_to = $val+$val*.15;
                        }
                    break;
                    case "currency_id":
                        if (strlen($val) === 0){
                            $client->remarks_text .= " ".$key.": ".$val.", ";
                            $error++;
                        }

                        $id = $currency->getCode($val);

                        if (is_array($id)){
                            $client->remarks_text .= " ".$key.": ".$val.", ";
                            $error++;
                        }
                        else{ 
                            $client->currency_id = $id;
                        }
                    break;
                    /*case "age":
                        $client->age = $val;
                    break;*/
                    case "floor_from":
                        $client->floor_from = $val;
                    break;
                    case "floors_count":
                        $client->floor_to = $val;
                    break;
                    case "rooms_count":
                        $client->rooms_type = 1;
                        $client->rooms_from = $val-1;
                        $client->rooms_to = $val;
                    break;
                    /*case "project_id":
                        if (strlen($val) > 0){
                            $id = $agency->getProjectId($val);

                            if (is_array($id)){
                                $property->remarks_text .= " ".$key.": ".$val.", ";
                                $error++;
                            }
                            else $property->project_id = $id;
                        }
                    break;*/
                    case "parking_flag":
                        $client->parking_flag = $val == 1 ? 1 : null;
                    break;
                    case "air_cond_flag":
                        $client->air_cond_flag = $val == 1 ? 1 : null;
                    break;
                    case "elevator_flag":
                        $client->elevator_flag = $val == 1 ? 1 : null;
                    break;
                    /*case "home_dims":
                        if (strlen($val) > 0){
                            $index = array_search($val, $property_form_data["dimension"]);

                            if ($index === FALSE){
                                $property->remarks_text .= " ".$key.": ".$val.", ";
                                $error++;
                            }
                            else $property->home_dims = $index;
                        }
                    break;
                    case "lot_dims":
                        if (strlen($val) > 0){
                            $index = array_search($val, $property_form_data["dimension"]);

                            if ($index === FALSE){
                                $property->remarks_text .= " ".$key.": ".$val.", ";
                                $error++;
                            }
                            else $property->lot_dims = $index;
                        }
                    break;
                    case "house_number":
                        $property->house_number = $val;
                    break;
                    case "flat_number":
                        $property->flat_number = $val;
                    break;*/
                    case "home_size":
                        $client->home_size_from = $val-$val*.15;
                        $client->home_size_to = $val+$val*.15;
                    break;
                    /*case "lot_size":
                        $property->lot_size = $val;
                    break;
                    case "views":
                        if (strlen(str_replace('"', "", $val)) > 0){
                            $exploded = explode(",", str_replace('"', "", $val));

                            if (is_array($exploded)){
                                $property->views = [];

                                for ($m = 0; $m < count($exploded); $m++){
                                    $index = array_search($exploded[$m], $property_form_data["view"]);

                                    if ($index === FALSE){
                                        $property->remarks_text .= " ".$key.": ".$val.", ";
                                        $error++;
                                    }
                                    else array_push($property->views, $index);
                                }

                                $property->views = json_encode($property->views);
                            }
                            else{
                                $property->remarks_text .= " ".$key.": ".$val.", ";
                                $error++;
                            }
                        }
                    break;*/
                    case "free_from": // то, что закоментировано, нужно будет заставить рабоать
                        if (strlen($val) > 0){
                            if ($val === "immediately"){
                                $client->free_from = time();
                            }
                            elseif (strlen($val) == 10){
                                $a = strptime($val, '%d/%m/%Y');

                                if ($a === FALSE){
                                    $client->remarks_text .= " ".$key.": ".$val.", ";
                                    $error++;
                                }
                                else{ 
                                    $client->free_from = mktime(0, 0, 0, $a['tm_mon']+1, $a['tm_mday'], $a['tm_year']+1900);
                                }
                            }
                            else{
                                $client->remarks_text .= $val.", ";
                            }
                        }
                    break;
                    /*case "directions":
                        if (strlen(str_replace('"', "", $val)) > 0){
                            $exploded = explode(",", str_replace('"', "", $val));

                            if (is_array($exploded)){
                                $property->directions = [];

                                for ($m = 0; $m < count($exploded); $m++){
                                    $index = array_search($exploded[$m], $property_form_data["direction"]);

                                    if ($index === FALSE){
                                        $property->remarks_text .= " ".$key.": ".$val.", ";
                                        $error++;
                                    }
                                    else array_push($property->directions, $index);
                                }

                                $property->directions = json_encode($property->directions);
                            }
                            else{
                                $property->remarks_text .= " ".$key.": ".$val.", ";
                                $error++;
                            }
                        }
                    break;*/
                    case "name":
                        $client->name = $val;
                    break;
                    case "contact5":
                        if (filter_var($val, FILTER_VALIDATE_EMAIL)){
                            $client->email = $val;
                        }
                    break;
                    case "contact1":
                        if (strlen($val) === 0){
                            $client->remarks_text .= " ".$key.": ".$val.", ";
                            $error++;
                        }
                        else $client->contact1 = $val;
                    break;
                    case "contact2":
                        $client->contact2 = $val;
                    break;
                    case "contact3":
                        $client->contact3 = $val;
                    break;
                    case "contact4":
                        $client->contact4 = $val;
                    break;
                    case "remarks_text":
                        $client->remarks_text .= str_replace('"', "", $val);
                    break;
                    /*case "external_id":
                        $property->external_id = $val;
                    break;*/
                    case "external_id_".$suffix:
                        $varname = "external_id_".$suffix;
                        $client->$varname = $val;
                    break;
                    case "collector_suffix":
                        // нихрена не делаем
                    break;
                    default:
                        $client->remarks_text .= " ".$key.": ".str_replace('"', "", $val).", ";
                        $error++;
                    break;
                }
            }
            
            $response = $client->save();
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function getAddressTranslation($address){
        $geo = new Geo;
        
        $parsed = $geo->getPlaceIdByAddress($address);
        return Geo::getFullAddress($parsed);
    }
    
    protected function getPlaceIdByAddress($address){
        global $googleac;
    
        $query = DB::createQuery()->select('placeid')->where('short_name LIKE ? OR long_name LIKE ?'); 
        $places = $googleac->getList($query, [$address, $address]);

        if (count($places) > 0){
            return json_encode($places[0]->placeid);
        }
        
        $jsonUrl = "https://maps.googleapis.com/maps/api/geocode/json?address=" . urlencode($address) . "&key=AIzaSyB9Wn9uRK8mlCHzA20yrPJzJzTVsz3mws0";

        $geocurl = curl_init();
        curl_setopt($geocurl, CURLOPT_URL, $jsonUrl);
        curl_setopt($geocurl, CURLOPT_HEADER,0); //Change this to a 1 to return headers
        curl_setopt($geocurl, CURLOPT_USERAGENT, $_SERVER["HTTP_USER_AGENT"]);
        curl_setopt($geocurl, CURLOPT_FOLLOWLOCATION, 1);
        curl_setopt($geocurl, CURLOPT_RETURNTRANSFER, 1);

        $geofile = curl_exec($geocurl);
        curl_close($geofile);
        $decoded = json_decode($geofile, true);

        return json_encode($decoded["results"][0]["place_id"]);
    }
    
    protected function getLatLngByAddress($address){
        global $googleac;
    
        $query = DB::createQuery()->select('lat, lng')->where('short_name LIKE ? OR long_name LIKE ?'); 
        $places = $googleac->getList($query, [$address, $address]);

        if (count($places) > 0){
            return ["lat" => $places[0]->lat, "lng" => $places[0]->lng];
        }
        
        $jsonUrl = "https://maps.googleapis.com/maps/api/geocode/json?address=" . urlencode($address) . "&key=AIzaSyB9Wn9uRK8mlCHzA20yrPJzJzTVsz3mws0";

        $geocurl = curl_init();
        curl_setopt($geocurl, CURLOPT_URL, $jsonUrl);
        curl_setopt($geocurl, CURLOPT_HEADER,0); //Change this to a 1 to return headers
        curl_setopt($geocurl, CURLOPT_USERAGENT, $_SERVER["HTTP_USER_AGENT"]);
        curl_setopt($geocurl, CURLOPT_FOLLOWLOCATION, 1);
        curl_setopt($geocurl, CURLOPT_RETURNTRANSFER, 1);

        $geofile = curl_exec($geocurl);
        curl_close($geofile);
        $decoded = json_decode($geofile, true);

        return $decoded["results"][0]["geometry"]["location"];
    }
    
    public function checkSession(){
        global $user;
        
        $permission = new Permission();
        
        if (
                isset($_SESSION["user"]) && 
                $permission->is("use_data_collecting") &&
                $user->notSeenTooLong($_SESSION["user"]) == 0
            )
        {
            return true;
        }
        else{
            return false;
        }
    }
}
