/*
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2015 Adobe Systems Incorporated
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
(function(Granite, $, SCF) {
    "use strict";

    var ResourceTagsModel = SCF.Model.extend({
        modelName: "ResourceTagsModel"
    });

    var ResourceTagsView = SCF.View.extend({
        viewName: "ResourceTagsView",
        init: function() {
            if (this.model.attributes) {
                if (this.model.attributes.configuration.tagNameSpaces) {
                    // Initialize tags
                    $.ajax({
                        url: SCF.config.urlRoot + "/services/tagfilter",
                        data: {
                            "tagfilter": this.model.attributes.configuration.tagNameSpaces,
                            "includeFullDisplayPath": true
                        },
                        success: function(data) {
                            var tagList = [];
                            var tagsMap = {};
                            for (var i = 0; i < data.length; i++) {
                                var newData = {};
                                newData.value = data[i].tagid;
                                newData.display = data[i].displayPath;
                                tagsMap[newData.value] = newData.display;
                                tagList.push(newData);
                            }
                            $(".js-social-enablement-edittags").each(function() {
                                var $tag = $(this).find(".coral-SelectList").data("selectList");
                                var $tagList = $(this).find(".coral-TagList").data("tagList");
                                $tag.addOption(tagList);
                                $tagList.on("itemadded", function() {
                                    $(this).find(".coral-TagList-tag input[type=\"hidden\"]").
                                    attr("name", "resource-tags");
                                });

                                var resourceTags = SCFConsole.editSite.JSON.resourceTags;
                                if (resourceTags) {
                                    for (var j = 0; j < resourceTags.length; j++) {
                                        var newItem = {};
                                        newItem.value = resourceTags[j];
                                        newItem.display = tagsMap[resourceTags[j]];
                                        $tagList.addItem(newItem);
                                    }
                                }
                            });
                        }
                    });
                }
            }
        }
    });

    SCF.ResourceTagsModel = ResourceTagsModel;
    SCF.ResourceTagsView = ResourceTagsView;
    SCF.registerComponent("social/enablement/components/hbs/admin/resourcetags", SCF.ResourceTagsModel,
        SCF.ResourceTagsView);
})(Granite, Granite.$, SCF);
