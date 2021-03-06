<?php

use Database\TinyMVCDatabase as DB;

class Builder{ // класс Локализации сайта
    public function getExist($ids){
        global $agency;
        
        $ids_decoded = json_decode($ids);
        
        for ($i = 0; $i < count($ids_decoded); $i++){
            if ($ids_decoded[$i][0] == null){
               unset($ids_decoded[$i]);
               continue;
            }
            
            $id = explode("_", $ids_decoded[$i][0]);
            $id_exploded = array_pop($id);
            $property = Property::loadByRow("external_id_hex", $id_exploded);
            
            if ($property === FALSE){
                unset($ids_decoded[$i]);
            }
            else{
                if ($agency->getId() == 1 && ((trim($ids_decoded[$i][1]) != "" && $property->price != $ids_decoded[$i][1]) || $property->last_updated < time()-5184000)){
                    $ids_decoded[$i] = [$ids_decoded[$i][0], true, $property->last_updated, $property->price, $property->id];
                }
                else{
                    $ids_decoded[$i] = [$ids_decoded[$i][0], false, $property->last_updated, $property->price, $property->id];
                }
            }
        }
        
        return $ids_decoded;
    }
    
    public function getStatForAgent(){
        define("MONTH_START", strtotime("first day of this month")-(time() - strtotime("today")));
        define("MONTH_END", strtotime("last day of this month")-(time() - strtotime("today"))+86399);
        define("TODAY_START", strtotime("midnight"));
        define("TODAY_END", strtotime("midnight")+86399);
        
        if (
            $_SESSION["user"] == 1 ||
            $_SESSION["user"] == 1350
        ){
            $query = DB::createQuery()->select('id')->where('agent_id = ? AND external_id IS NOT NULL AND temporary = 0 AND deleted = 0 AND timestamp BETWEEN ? AND ?'); 
            $properties_for_today = Property::getList($query, [$_SESSION["user"], TODAY_START, TODAY_END]);
            $properties_for_month = Property::getList($query, [$_SESSION["user"], MONTH_START, MONTH_END]);

            $query = DB::createQuery()->select('id')->where('agent_id = ? AND external_id IS NOT NULL AND temporary = 0 AND deleted = 0'); 
            $properties_total = Property::getList($query, [$_SESSION["user"]]);
        }
        else{
            return -1;
        }
            
        return [count($properties_for_today), count($properties_for_month), count($properties_total)];
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
    
    public function updatePropertyExternal($yad2_id, $new_price){
        global $property;
        
        $tmp = explode("_", $yad2_id);
        $external_id_hex = array_pop($tmp);
        
        $update_event = CollectorEvent::create([
            "event" => 1,
            "user" => $_SESSION["user"],
            "timestamp" => time()
        ]);
        $update_event->save();
        
        $property_to_update = Property::loadByRow("external_id_hex", strval($external_id_hex));
        $property->savePriceHistory($property_to_update->id, $new_price, $property_to_update->price, $property_to_update->currency_id);
        $property->setStockHistory($property_to_update->id, '{"price":{"old":"'.$property_to_update->price.'","new":"'.$new_price.'"}}');
        $property_to_update->price = intval($new_price);
        $property_to_update->last_updated = time();
         
        return $property_to_update->save();
    }
    
    public function updateProperty($id, $new_price){
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
        $property_to_update->last_updated = time();
         
        return $property_to_update->save();
    }
    
    public function createProperty($json_data){
        global $property_form_data, $currency, $agency;
        $decoded = json_decode($json_data, true);
        $user = $_SESSION["user"];
        //return var_dump($decoded);
        try{// здесь нужно будет все параметры сделать динамичными :
            //############### проверяем есть ли такая карточка в стоке или агентстве ############### //
        
            $query = DB::createQuery()->select('id, last_updated, price, currency_id')->where('external_id = ? AND (agency = ? OR stock = 1) AND temporary = 0 AND deleted = 0'); 
            $properties = Property::getList($query, [intval($decoded["external_id"]), $agency->getId()]);

            if (count($properties) > 0){
                $message = [
                    "message" => "card_already_exist", 
                    "date" => $properties[0]->last_updated,
                    "price" => $properties[0]->price.' '.$currency->getSymbolCode($properties[0]->currency_id),
                    "card_id" => $properties[0]->id,
                    "need_to_update" => $agency->getId() == 1 && ($properties[0]->price != $decoded["price"] || $properties[0]->last_updated < time()-5184000) ? true : false
                ];
                
                throw new Exception(json_encode($message), 405);
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
                "statuses" => 0
            ]); 
            
            foreach ($decoded as $key => $val){ // перебираем поля недвижимости 
                switch ($key) {
                    case "country":
                        $parsed = str_replace('"', "", $this->getPlaceIdByAddress($val));

                        if ($parsed != null){
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

                            if ($parsed != null){
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

                            if ($parsed != null){
                                $property->neighborhood = $parsed;
                                $property->neighborhood_text = Geo::getFullAddress($property->neighborhood);
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

                            if ($parsed != null && $parsed != $property->city){
                                $property->street = $parsed;
                                $latlng = Geo::getTrueLocation($property->street, $decoded["house_number"], $decoded["statuses"]);
                                $property->lat = $latlng["lat"];
                                $property->lng = $latlng["lng"];
                                $property->street_text = Geo::getFullAddress($property->street);
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
                    case "external_id_hex":
                        $property->external_id_hex = $val;
                    break;
                    default:
                        $property->remarks_text .= " ".$key.": ".str_replace('"', "", $val).", ";
                        $error++;
                    break;
                }
            }
            
            $response = $property->save();
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    protected function getPlaceIdByAddress($address){
        global $googleac;
    
        $query = DB::createQuery()->select('placeid')->where('short_name LIKE ? OR long_name LIKE ?'); 
        $places = $googleac->getList($query, [$address, $address]);

        if (count($places) > 0){
            return json_encode($places[0]->placeid);
        }
        
        $jsonUrl = "http://maps.googleapis.com/maps/api/geocode/json?address=" . urlencode($address) . "&sensor=false";

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
        
        $jsonUrl = "http://maps.googleapis.com/maps/api/geocode/json?address=" . urlencode($address) . "&sensor=false";

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
        if (isset($_SESSION["user"])){
            return true;
        }
        else{
            return false;
        }
    }
}
