<?php

function buildertmp_getaddressbytext(){
    global $buildertmp;
    return $buildertmp->getAddressTranslation($_POST["address"]);
}

function buildertmp_removeexternal(){
    global $buildertmp;
    return $buildertmp->removeExternalProperty($_POST["external_id"]);
}

function buildertmp_getexist(){
    global $buildertmp;
    return $buildertmp->getExist($_POST["ids"], $_POST["collector"]);
}

function buildertmp_getstatforagent(){
    global $buildertmp;
    return $buildertmp->getStatForAgent();
}

function buildertmp_checksession(){
    global $buildertmp;
    return $buildertmp->checkSession();
}

function buildertmp_updatepropertyext(){
    global $buildertmp;
    return $buildertmp->updatePropertyExternal($_POST["external_id"], $_POST["new_price"], $_POST["collector"]);
}

function buildertmp_updateproperty(){
    global $buildertmp;
    return $buildertmp->updateProperty($_POST["id"], $_POST["new_price"], $_POST["external_id_key"], $_POST["external_id_value"]);
}

function buildertmp_createproperty(){
    global $buildertmp;
    return $buildertmp->createProperty($_POST["data"], $_POST["check_existing"]);
}

function buildertmp_createclient(){
    global $buildertmp;
    return $buildertmp->createClient($_POST["data"]);
}

function buildertmp_getlocaleforcollector(){
    global $buildertmp;
    return $buildertmp->getLocaleForCollector($_POST["collector_id"]);
}

function buildertmp_getlocale(){
    global $buildertmp;
    return $buildertmp->getLocale($_POST["collector_id"]);
}

function buildertmp_getcollector(){
    global $buildertmp;
    return $buildertmp->getCollector($_POST["id"]);
}

function buildertmp_getcollectors(){
    global $buildertmp;
    return $buildertmp->getCollectors();
}

function buildertmp_createcollector(){
    global $buildertmp;
    return $buildertmp->createCollector($_POST["title"], $_POST["data"]);
}

function buildertmp_createcsv(){
    global $buildertmp;
    return $buildertmp->getCSV($_POST["data"]);
}

?>
