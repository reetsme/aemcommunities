/*
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2016 Adobe Systems Incorporated
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */

(function(window, document, Granite, $, SCF) {
    "use strict";
    $(document).ready(function() {
        var languageMapping = [];
        var languageCodes = [];
        var splits = null;
        var col_index = null;
        var selectedTagData = null;
        var tableval = null;
        var selectLanguageCode = [];
        var selectLanguageText = [];
        var defaultInput = null;
        var flag = 0 ;
        $.get(SCF.config.urlRoot + "/libs/settings/community/templates/groups.social.json", function(data) {
            var items = data.items,
                dropdownItems;
            items.sort(sort_by("title", function(a) {
                return a.toUpperCase();
            }));

            dropdownItems = _.map(items, function(item) {
                return {
                    content: {
                        textContent: item.title
                    },
                    value: item.id
                }
            });

            var select = $("#social-group-bluePrintSelect").get(0);
            var selected = false;
            dropdownItems.forEach(function(value, index) {
                if (!selected) {
                    value.selected = true;
                    selected = true;
                }
                select.items.add(value);
            });
        }, "json");
        $.get(SCF.config.urlRoot + "/libs/social/translation/languageOpts/languageMapping.social.json", function(data) {
            $("#coral-16").val(defaultInput);
            var items = data.items;
            languageMapping = items;
            var baselanguage = $("#social-community-baseLanguageSelect coral-select").get(0);
            languageCodes = [];
            var sitename = $('input[name=siteRoot]').val();
            var splitname = sitename.split('/');
            $.get(SCF.config.urlRoot + "/libs/work/group/languageProviderServlet?path=" +sitename, function(data){
                 // Display the returned data in browser
                 var lang = JSON.parse(data).languages;
                 for (var i = 0; i < items.length; i++) {
                     if(contains(lang,items[i].languageCode)){
                         languageCodes.push(items[i].languageCode);
                         var languageDisplay = CQ.I18n.get(items[i].languageName);
                         var compare = items[i].languageCode;
                         if (sitesharedStore == compare){
                             $(".social-community-value").val(languageDisplay);
                         }
                         else{
                             baselanguage.items.add({
                            value: items[i].languageCode,
                               content: {
                                 innerHTML: languageDisplay
                               }
                          });
                         }
                       }
                 }
            });

            function contains(a, obj) {
              for (var i = 0; i < a.length; i++) {
                 if (a[i] === obj) {
                  return true;
                  }
              }
            return false;
            }

            var sitesharedStore = splitname[4];
        }, "json");

              $("#cq-social-create-group-submit").on("click", function() {
              var tableList = [];
              var completeTableLen = $('#selected-table-data tr').length;
               for(var ctl=1; ctl<completeTableLen ; ctl++){
                var Language =$('#selected-table-data tr:nth-child('+ ctl +') td:nth-child(1)').text();
                var Name = $('#selected-table-data tr:nth-child('+ ctl +') td:nth-child(3)').text();
                tableList.push(Language,Name);
                tableList.push("\n");
              }
              var submitedValue = $("#completeTableData").val(tableList);
          });
               $("#save-title").click(function(){ 
                var new_values = $("#modal-value").val();
                 if(col_index == 1){
                 $('#selected-table-data tr:nth-child('+splits[1]+') td:nth-child(2)').find('span').text(new_values);
            }else{
              $('#selected-table-data tr:nth-child('+ splits[1] +') td:nth-child(3)').find('span').text(new_values);
             }
           });
        var sort_by = function(field, primer) {
            var key = primer ?
                function(x) {
                    return primer(x[field]);
                } :
                function(x) {
                    return x[field];
                };
            return function(a, b) {
                return a = key(a), b = key(b), ((a > b) - (b > a));
            };
        };

        //get suffix if any
        var index = document.location.href.lastIndexOf(".html");
        if (index > 0) {
            var suffix = document.location.href.substring(index + 5);
            $("input.js-coral-pathbrowser-input").val(suffix);
        }

        // disable invite fields when Optinal Membership is selected
        $("#console-group-inviteUsers :input").prop("disabled", true);
        $("input[name=type]:radio").change(function(event) {
            if (this.value.toLowerCase() === "public") {
                $("#console-group-inviteUsers :input").attr("disabled", true);
                $("#console-group-inviteUsers .coral-TagList").empty();
            } else {
                $("#console-group-inviteUsers :input").attr("disabled", false);
            }

        });
        //disable group root from basic tab
        $('#scf-community_group_root :input').attr('disabled', true);

        $("#cq-social-create-group-submit").on("click", function() {

            $("body").prepend("<div id='createGroupOverlayDiv'></div>");
            $(".scf-create-group-wait").show();
            if (!window.FormData) {
                $(this).closest("form").submit();
                $(this).prop("disabled", true);
            } else {
                $(this).closest("form")
                    .submit(function(e) {
                        var error = _.bind(function(jqxhr, text, error) {
                            var message;
                            if (jqxhr.status == 500) { //vs bugfix
                                var errorDetails = $CQ($CQ.parseHTML(jqxhr.responseText));
                                var code = errorDetails.find("#Status").text();
                                message = errorDetails.find("#Message").text();
                                if (_.isEmpty(code)) {
                                    code = "";
                                }

                                if (_.isEmpty(message)) {
                                    message = CQ.I18n.get("Server Error Please try again");
                                }
                                //alert.set("heading", CQ.I18n.get("Error"));
                                //alert.set("content", code + " " + message);
                            } else if (jqxhr.status == 409) {
                                message = CQ.I18n.get("Site with your selected language already exists");
                            } else if (jqxhr.status == 400) {
                                message = CQ.I18n.get("Illegal name, 'resources' is a reserved name and cannot be used for the name of site.");
                            }
                            // errorMessageGenerator(message);
                            return false;
                        }, this);
                        var success = _.bind(function(response) {
                            var redirect = this.baseURI.replace("/communities/createcommunitygroup.html", "/communities/communitygroups.html");
                            window.setTimeout(function() {
                                 window.location.href = redirect;
                            }, 1000);
                            window.location.href = redirect;
                        }, this);

                        $.ajax({
                            url: SCF.config.urlRoot + $('input[name=siteRoot]').val() + ".social.json",
                            type: 'POST',
                            data: new FormData(this),
                            processData: false,
                            contentType: false,
                            "error": error,
                            "success": success
                        });
                        $("#cq-social-create-group-submit").prop("disabled", true);
                        e.preventDefault();
                    });
            }
        });
    });

})(window, document, Granite, Granite.$, SCF);
