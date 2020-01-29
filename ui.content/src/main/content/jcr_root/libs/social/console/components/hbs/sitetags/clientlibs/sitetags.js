/*
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2014 Adobe Systems Incorporated
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
(function(Granite, $, SCFConsole) {
    "use strict";
    SCFConsole.editSite = SCFConsole.editSite || {};
    SCFConsole.editSite.JSON = SCFConsole.editSite.JSON || {};

    $(document).ready(function() {
        //TODO: Due to time constraints I am using a simple selector as there is only JSON script being loaded
        // In case of multiple JSON being loaded, we might have to fix Handlebars engine and add jquery filter
        var tagVals;
        if ($.isEmptyObject(SCFConsole.editSite.JSON)) {
            var editSiteModel = $("script[type=\"application/json\"]");
            var modelText = $(editSiteModel[0]).text();
            SCFConsole.editSite.JSON = JSON.parse(modelText);
        }
        if (SCFConsole.editSite.JSON.configuration) {
            tagVals = SCFConsole.editSite.JSON.configuration.tagNameSpaces;
        }
        //Initialize tags //Might have to change the URL later
        $.ajax({
            url: SCF.config.urlRoot + "/services/tagfilter",
            data: {
                "tagNameSpaceOnly": true
            },
            success: function(data) {
                var tagList = [];
                for (var i = 0; i < data.length; i++) {
                    var newData = {};
                    newData.value = data[i].value;
                    newData.display = data[i].label;
                    tagList.push(newData);
                }
                $(".js-social-console-edittags").each(function() {
                    var $tag = $(this).find(".coral-SelectList").data("selectList");
                    var $tagList = $(this).find(".coral-TagList").data("tagList");
                    $tag.addOption(tagList);
                    $tagList.on("itemadded", function() {
                        $(this).find(".coral-TagList-tag input[type=\"hidden\"]").attr("name", "tagNameSpaces");
                    });
                    if (tagVals) {
                        $tagList.addItem(tagVals);
                    }
                });
            }
        });
    });
})(Granite, Granite.$, SCFConsole);
