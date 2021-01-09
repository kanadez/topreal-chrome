<?php

function builder_getexist(){
    global $builder;
    return $builder->getExist($_POST["ids"]);
}

function builder_getstatforagent(){
    global $builder;
    return $builder->getStatForAgent();
}

function builder_checksession(){
    global $builder;
    return $builder->checkSession();
}

function builder_updatepropertyext(){
    global $builder;
    return $builder->updatePropertyExternal($_POST["yad2_id"], $_POST["new_price"]);
}

function builder_updateproperty(){
    global $builder;
    return $builder->updateProperty($_POST["id"], $_POST["new_price"]);
}

function builder_createproperty(){
    global $builder;
    return $builder->createProperty($_POST["data"]);
}

function builder_getlocaleforcollector(){
    global $builder;
    return $builder->getLocaleForCollector($_POST["collector_id"]);
}

function builder_getlocale(){
    global $builder;
    return $builder->getLocale($_POST["collector_id"]);
}

function builder_getcollector(){
    global $builder;
    return $builder->getCollector($_POST["id"]);
}

function builder_getcollectors(){
    global $builder;
    return $builder->getCollectors();
}

function builder_createcollector(){
    global $builder;
    return $builder->createCollector($_POST["title"], $_POST["data"]);
}

function builder_createcsv(){
    global $builder;
    return $builder->getCSV($_POST["data"]);
}

?>
