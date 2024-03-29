/**
 * Chesterfield Module for the Cloud9 IDE
 *
 * @copyright 2010, Ajax.org B.V.
 * @license GPLv3 <http://www.gnu.org/licenses/gpl.txt>
 */
 define(function(require, exports, module) {

 var ide    = require("core/ide");
 var ext    = require("core/ext");
 var util   = require("core/util");
 var fs     = require("ext/filesystem/filesystem");
 var markup = require("text!ext/chesterfield/chesterfield.xml");

module.exports = ext.register("ext/chesterfield/chesterfield", {
    dev     : "vertex.io",
    name    : "Chesterfield",
    alone   : true,
    offline : false,
    type    : ext.GENERAL,
    markup  : markup,
    deps    : [fs],
    commands : {
        "createapp": {hint: "creates a base Chesterfield app in the current directory"},
    },
    hotitems: {},

    nodes   : [],

    init : function(amlNode){
        var _self = this;
        
        // Append the button bar to the main toolbar
        var nodes = tbChesterfield.childNodes;
        for (var i = nodes.length - 1; i >= 0; i--) {
            this.nodes.push(ide.barTools.appendChild(nodes[0]));
        }
        
        winPushConfirm.onafterrender = function(){
            btnPush.addEventListener("click", function(){
                /*var host = txtHost.value;
                var db = txtDb.value;*/
                winPushConfirm.hide();
                _self.pushDDoc(null, null);
            });
            btnPushCancel.addEventListener("click", function(){
                winPushConfirm.hide();
            });
        }
    },
    
    pushDDoc: function(host, db) {
        
        // Since Node.CouchApp.js apps don't have _id, check for app.js instead 
        var DESIGN = "app.js"; // "_id";
        var COUCH_ROOT = "http://localhost:5984";
        console.log("starting push.");
        
        // some *magic* to get the current working directory
        var node = trFiles.selected;
        if (!node)
            node = trFiles.xmlRoot.selectSingleNode("folder");
        if (node.getAttribute("type") != "folder")
            node = node.parentNode;
            
        path  = node.getAttribute("path");
        if (!path) {
            path = ide.davPrefix;
            node.setAttribute("path", path);
        }
        
        
        // verify that a design doc exists
        fs.exists(path + '/' + DESIGN, function(exists) {
            
            console.log(path);
            
            var split_directories = path.split('/');
            var appname = split_directories[split_directories.length -1];
            
            /* we have a design document */
            if (exists) {
                
                var url = "http://127.0.0.1:3001/?command=push&cwd=" + appname + "&args=sandbox/"+appname+"/"+DESIGN+","+COUCH_ROOT+"/" + appname;

                try {
                    var client = new XMLHttpRequest();

                    client.open("GET", url, false);
                    client.send();
                }
                catch(err) {
                    console.log(err);
                    util.alert( "Push", 
                                "FAILURE", 
                                "Unable to push: \n" + err);
                    return;
                }
                
                var json_res = JSON.parse(client.responseText);
                var couchapp_returncode = parseInt(json_res.returncode, 10);
                console.log(couchapp_returncode);

                if (couchapp_returncode == 0) {
                    console.log("The request succeeded!\n\nThe response representation was:\n\n" + client.responseText);
                    
                    // var appurl = json_res.error.split('\n');
                    // var appurl = appurl[appurl.length -2];
                    
                    // HARDCODE app url for now
                    var appurl = COUCH_ROOT+"/"+appname+"/_design/app/_rewrite/";
                    
                    util.alert( "Push", 
                                "SUCCESS", 
                                "CouchApp has been pushed successfully.\nView it here: <a target=\"_blank\" href=\"" + appurl + "\">" + appname + "</a>");
                }
                else {
                    //console.log("The request did not succeed!\n\nThe response status was: " + client.status + " " + client.statusText + ".");
                    util.alert( "Push", 
                                "FAILURE", 
                                "Unable to push: \n" + json_res.error);
                }
                
            }
            else {
                util.alert( "Push", 
                            "FAILURE", 
                            "Unable to push, design document '" + DESIGN + 
                                "' does not exist in the working directory '"+path+"'.");
            }
        });
        
    },
    
    showPushConfirm: function() {
        winPushConfirm.show();
    },

    createapp: function() {
        // create a VERY simple Hello World couchapp
        // NOTE: need to change the actual contents of these files
        fs.createFile("_design");
        fs.createFolder("_attachments");
        fs.createFile("_attachments/index.html");
        return false;
    },
    
    enable : function(){
        if (!this.disabled) return;
        
        this.nodes.each(function(item){
            item.enable();
        });
        this.disabled = false;
    },
    
    disable : function(){
        if (this.disabled) return;
        
        this.nodes.each(function(item){
            item.disable();
        });
        this.disabled = true;
    },

    destroy : function(){
        this.nodes.each(function(item){
            item.destroy(true, true);
        });
        this.nodes = [];
        
        mnuNew.destroy(true, true);

        tabEditors.removeEventListener("close", this.$close);
    }
});

    }
);