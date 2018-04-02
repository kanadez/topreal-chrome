function Utils(){
    this.isNullOrEmpty = function(value){    
        if (value != null && value.trim() != "" && value != undefined){
            return false;
        }
        else{
            return true;
        }
    };
    
    this.stringContains = function(string, substring){
        if (string.indexOf(substring) === -1){
            return false;
        }
        else{
            return true;
        }
    };
    
    this.convertTimestampToDate = function(timestamp){
        var a = new Date(timestamp*1000);
        var year = a.getFullYear();
        var month = this.leadZero(a.getMonth()+1,2);
        var date = this.leadZero(a.getDate(), 2);
        var time = date+'/'+month+'/'+ year;

        return time;
    };
    
    this.leadZero = function(number, length) { // используется ф-иями формирования времени для заполнения нулями результат
        while(number.toString().length < length)
            number = '0' + number;
        
        return number;
    };
    
    this.getUrlParameter = function(parameter){
      var params_string = window.location.href.slice(window.location.href.indexOf('?') + 1);
      var params = params_string.split("&");
      var result = {};
      
      for (var i = 0; i < params.length; i++){
         var tmp = params[i].split("=");
         result[tmp[0]] = tmp[1];
      }
      
      return result[parameter];
    };
   
    this.numberWithCommas = function(x) { // разделение числа x запятыми через каждые 3 разряда
        return x.toString().trim().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };
    
    this.isUndf = function(x){
        return String(x).length == 0 || x == undefined;
    };
}