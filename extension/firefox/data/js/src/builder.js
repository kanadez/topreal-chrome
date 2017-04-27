var _frame = null;
var _data = null;

function showBuilderPage(){
    $('#content_div').html("");
    $('#content_div').load("./dom/builder.html", function() {
        // Handle form submit.
        $('#params').submit(function(){
            var proxy = 'src/ba-simple-proxy.php',
            url = proxy + '?' + $('#params').serialize();

            // Update some stuff.
            $('#request').html( $('<a/>').attr( 'href', url ).text( url ) );
            $('#iframe1').attr("src", url);
            //$('#response').html( 'Loading...' );

            // Test to see if HTML mode.
            /*if ( /mode=native/.test( url ) ) {
                $.get( url, function(data){
                    _frame = $('<iframe id="frame_to_collect_iframe" onload="builder.injectIFrame()" style="width:100%; height:1000px;">');
                    _data = data;
                    
                    $('#response').html( _frame );
                    setTimeout( function() {
                            var doc = _frame[0].contentWindow.document;
                            var body = $('body',doc);
                            body.html(_data);
                    }, 1 );
                      //$('#response').html("<iframe style='width:100%;'>"++"</iframe>");
                });
            } */

            return false;
        });

        // Submit the form on page load if ?url= is passed into the example page.
        if ( $('#url').val() !== '' ) {
            $('#params').submit();
        }

        // Disable AJAX caching.
        $.ajaxSetup({ cache: false });

        // Disable dependent checkboxes as necessary.
        $('input:radio').click(function(){
            var that = $(this),
                c1 = 'dependent-' + that.attr('name'),
                c2 = c1 + '-' + that.val();

            that.closest('form')
                .find( '.' + c1 + ' input' )
                    .attr( 'disabled', 'disabled' )
                    .end()
                .find( '.' + c2 + ' input' )
                    .removeAttr( 'disabled' );
        });

        // Clicking sample remote urls should populate the "Remote URL" box.
        $('#sample a').click(function(){
            $('#url').val( $(this).attr( 'href' ) );
            return false;
        });
    });
}

function Builder(){
    this.selected_elements = [];


    this.showPreview = function(){
        document.getElementById("preview_div").innerHTML = "";
        var string = "<table>";

        for (var i = 0; i < this.selected_elements.length; i++){
            string += "<tr><td>"+this.selected_elements[i][0]+"</td><td>"+this.selected_elements[i][1]+"</td></tr>";
        }

        string += "</table>";

        document.getElementById("preview_div").innerHTML = string;
        $('#preview_div').show().dialog({
            width: 1000,
            height: 500,
            position: { my: "center", at: "center", of: window },
            beforeClose: function( event, ui ) {
                $('#preview_div').hide();
            }
        });
    };
    
    this.getPathTo = function(element) {
        if (element.id !== '')
            return 'id("'+element.id+'")';
        //else if (element.class !== '')
            //return 'class("'+element.class+'")';
        if (element === document.body)
            return element.tagName;

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
        return element.innerHTML;
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

    this.deleteElement = function(xpath){
        var tmp_array = [];

        for (var i = 0; i < this.selected_elements.length; i++){
            if (this.selected_elements[i][0] != xpath){
                tmp_array.push(this.selected_elements[i]);
            }
        }

        this.selected_elements = tmp_array;
    };
}

