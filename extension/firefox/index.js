var self = require("sdk/self");
var buttons = require('sdk/ui/button/action');
var tabs = require("sdk/tabs");
var pageMod = require("sdk/page-mod");

var button = buttons.ActionButton({
    id: "mozilla-link",
    label: "Visit Mozilla",
    icon: {
        "16": "./icon-16.png",
        "32": "./icon-32.png",
        "64": "./icon-64.png"
    },
    onClick: handleClick
});

function handleClick(state) {
    tabs.activeTab.attach({
        contentScriptFile: [
            self.data.url('js/vendor/jquery-1.11.1.min.js'),
            self.data.url('plugins/jquery-ui/jquery-ui.js'),
            self.data.url('js/src/builder.js'),
            self.data.url('js/src/content.js')
        ]
    });
    
    pageMod.PageMod({
        include: "*",
        contentStyleFile: self.data.url("./plugins/jquery-ui/jquery-ui.css")
    });
}


function runScript(tab) {
  tab.attach({
    contentScript: "document.body.style.border = '5px solid red';"
  });
}

/*var button = ActionButton({
    id: "my-button",
    label: "my button",
    icon: {
      "16": "./firefox-16.png",
      "32": "./firefox-32.png"
    },
    onClick: function(state) {
        console.log("button '" + state.label + "' was clicked");
    }
  });

// a dummy function, to show how tests work.
// to see how to test this function, look at test/test-index.js
function dummy(text, callback) {
  callback(text);
  alert(123)
}

//exports.dummy = dummy;*/
