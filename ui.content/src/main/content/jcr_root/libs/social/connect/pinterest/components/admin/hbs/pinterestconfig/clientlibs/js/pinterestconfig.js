/*
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2017 Adobe Systems Incorporated
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
(function(window, Granite, $, CUI, hbs) {
    "use strict";


    var PinterestConfigModel = SCF.Model.extend({
        modelName: "PinterestConfigModel"
    });
    var PinterestConfigView = SCF.View.extend({
        viewName: "PinterestConfigView"
    });

    SCF.PinterestConfigModel = PinterestConfigModel;
    SCF.PinterestConfigView = PinterestConfigView;
    SCF.PinterestConfigModel.JSON = SCF.PinterestConfigModel.JSON || {};

    SCF.registerComponent("social/connect/pinterest/components/admin/hbs/pinterestconfig", SCF.PinterestConfigModel,
        SCF.PinterestConfigView);

    var DEFAULT_CONFIG_PATH = Granite.HTTP.getContextPath() +"/libs/social/connect/pinterest/content/configurations.html" + "/conf";

    var errorTemplate = "<p>{{message}}</p><ul>{{#each errors}}<li>{{this}}</li>{{/each}}</ul>";
    errorTemplate = hbs.compile(errorTemplate);

    function showAlert(type, content, heading) {
        $("#myDialog").remove();
        var dialog = new Coral.Dialog().set({
            id: 'myDialog',
            header: {
                innerHTML: heading
            },
            content: {
                innerHTML: content
            },
            footer: {
                innerHTML: '<button is="coral-button" variant="primary" coral-close>Ok</button>'
            }
        });
        document.body.appendChild(dialog);
        dialog.show();
    }


    // Create the User value from JSON Object
    var getGroupFromJSON = function(group) {
        return encodeURIComponent("{\"userId\":\"" + group.authId + "\", \"userName\":\"" +
            group.authName + "\", \"userEmail\":\"" + group.authEmail + "\", \"userPath\":\"" +
            group.authPath + "\", \"userAvatarUrl\":\"" + group.authAvatarUrl + "\"}");
    };

    var populateGroupSelectorTags = function(id, attrValue) {
        if (SCF.PinterestConfigModel.JSON.addToUserGroups) {
            var grouptags  = $(id + " foundation-autocomplete coral-taglist")[0];
            Coral.commons.ready(grouptags,function(){
                var data;
                data = SCF.PinterestConfigModel.JSON.addToUserGroups;



                if (grouptags !== undefined && data !== undefined && data) {
                    for (var i = 0; i < data.length; i++) {
                        var tag = new Coral.Tag().set({value: data[i],label: {innerHTML: data[i]}});

                        grouptags.items.add(tag);
                    }
                }
                if ($(id + " .coral-TagList").has(".coral-TagList-tag")) {
                    $(id + " .coral-TagList .coral-TagList-tag input[type=\"hidden\"]").attr("name", attrValue);
                }
            });
        }
    };


    var fixFalseyCheckboxes = function(e) {
        var checkbox = $(e.target);
        var attribue = checkbox.attr("name");
        var checked = checkbox.is(":checked");
        var paramAttr = checkbox.attr("data-param");
        var inputTag = checkbox.siblings("input[name='" + paramAttr + "']")[0];
        $(inputTag).val(checked);
    };
    var setOperation = function() {
        var createConfigURL= "/libs/social/connect/pinterest/content/configurations/createpinterestconfig.html";
        var actionItem = $('input[name=":operation"]')[0];
        var isCreateAction = document.location.href.indexOf(createConfigURL) > -1;
        if(actionItem && isCreateAction){
            actionItem.value="social:createPinterestConfig"
        }
    };
    $CQ(document).ready(function() {
        $("input[type='checkbox']").on("change", fixFalseyCheckboxes);
        if ($.isEmptyObject(SCF.PinterestConfigModel.JSON)) {
            var componentId = $("div[data-scf-component=\"social/connect/pinterest/components/admin/hbs/pinterestconfig\"]").data("componentId");
            var editConfigModel = $("script[type=\"application/json\"][id=\"" + componentId + "\"]");
            var modelText = $(editConfigModel[0]).text();
            SCF.PinterestConfigModel.JSON = JSON.parse(modelText);
            setOperation();
            populateGroupSelectorTags("#scf-js-groupselector", "addToUserGroups");
        }


    });


})(window, Granite, Granite.$, CUI, Handlebars);
