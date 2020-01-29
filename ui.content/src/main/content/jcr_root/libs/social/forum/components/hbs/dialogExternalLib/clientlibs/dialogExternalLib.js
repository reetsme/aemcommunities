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

(function(window, document, $, ns, $CQ) {
    "use strict";

    $(document).on("dialog-ready", function(e) {
        var $document = $(document);
        var actionPath = $document.find(".cq-dialog").attr("action");
        var allowSubscriptions = $document.find(".scf-js-lf-allowSubscriptions");
        var allowFollowing = $document.find(".scf-js-lf-allowFollowing");
        var sortDataPath = "/libs/social/commons/sortorder.json";
        var sortByHolder = $document.find("coral-checkbox[name='./sortBy']").parent();
        var taggingFilterHolder = $document.find("coral-checkbox[name='./taggingFilter']").parent();
        var sortFieldHolder = $document.find(".scf-js-lf-sortField");

        allowSubscriptions.on("change", function() {
            if (allowSubscriptions.get(0).checked) {
                allowFollowing.get(0).checked = true;
            }
        });

        var sortField = new Coral.Select().set({
            name: "./sortField",
            placeholder: CQ.I18n.get("Set as Default")
        });

        var contextPath = CQ.shared.HTTP.getContextPath() || "";

        var items = [];

        var isTagSelected = function(defaultTagValues, tag) {
            var isSelected = false;
            if (typeof (defaultTagValues) === "string") {
                if (defaultTagValues === tag) {
                    isSelected = true;
                }
            } else {
                for (var i = 0; i < defaultTagValues.length; i++) {
                    var defaultTag = defaultTagValues[i];
                    if (defaultTag.substring(defaultTag.indexOf(tag)) === tag) {
                        isSelected = true;
                        break;
                    }

                }
            }
            return isSelected;
        };

        $document.find("coral-checkbox[name='./taggingFilter']").remove();
        taggingFilterHolder.prepend("<label class=\"coral-Form-fieldlabel\">" +
        CQ.I18n.get("Allowed Namespaces") + "</label>");
        taggingFilterHolder.find("coral-icon").css("position", "absolute");
        taggingFilterHolder.find("coral-tooltip").attr("placement", "left");

        CQ.shared.HTTP.get(contextPath + actionPath + ".json", function(o, ok, response) {
            var values = JSON.parse(response.responseText);
            var defaultTagValues = (values && values.taggingFilter ? values.taggingFilter : []);
            var tagCheckbox = new Coral.Checkbox().set({
                label: {
                    innerHTML: CQ.I18n.get("Include All Tags")
                },
                value: "/content/cq:tags",
                name: "./taggingFilter",
                checked: isTagSelected(defaultTagValues, "/content/cq:tags")
            });
            taggingFilterHolder.append(tagCheckbox);
            taggingFilterHolder.append("<br>");

            CQ.shared.HTTP.get(contextPath + "/content/cq:tags.tags.json", function(o, ok, response) {
                var tags = JSON.parse(response.responseText);

                for (var i = 0; i < tags.tags.length; i++) {
                    var tag = tags.tags[i];
                    var tagCheckbox = new Coral.Checkbox().set({
                        label: {
                            innerHTML: CQ.I18n.get(tag.title)
                        },
                        value: tag.path,
                        name: "./taggingFilter",
                        checked: isTagSelected(defaultTagValues, tag.path)
                    });

                    taggingFilterHolder.append(tagCheckbox);
                    taggingFilterHolder.append("<br>");
                }
            });

            if ($document.find(".scf-js-filelibrary-sortBy").length) {
                sortDataPath = "/libs/social/filelibrary/sortorder.json";
            }
            $document.find("coral-checkbox[name='./sortBy']").remove();

            CQ.shared.HTTP.get(contextPath + sortDataPath, function(o, ok, response) {
                var items = JSON.parse(response.responseText);
                var defaultValues = ["newest", "added", "latestActivityDate_dt"];

                if (values && values.sortBy) {
                    defaultValues = values.sortBy;
                }

                for (var i = items.sortorder.length - 1; i > -1; i--) {
                    var item = items.sortorder[i];
                    var splitItem = item.split(":");

                    sortField.items.add({
                        content: {
                            innerHTML: CQ.I18n.get(splitItem[0])
                        },
                        value: splitItem[1]
                    });

                    var checkbox = new Coral.Checkbox().set({
                        label: {
                            innerHTML: CQ.I18n.get(splitItem[0])
                        },
                        value: splitItem[1],
                        name: "./sortBy",
                        checked: (defaultValues.indexOf(splitItem[1]) > -1)
                    });
                    sortByHolder.prepend("<br>");
                    sortByHolder.prepend(checkbox);
                }

                sortFieldHolder.replaceWith(sortField);
                $(sortField).addClass("scf-js-lf-sortField");
                sortField.value = (values && values.sortField ? values.sortField : "newest");

                sortField.on("change", function() {
                    if (!$document.find(".scf-js-lf-sortFieldOrder").length) {
                        return;
                    }
                    if (sortField.value == "added") {
                        $document.find(".scf-js-lf-sortFieldOrder").get(0).value = "asc";
                    } else {
                        $document.find(".scf-js-lf-sortFieldOrder").get(0).value = "desc";
                    }
                });
                sortByHolder.prepend("<label class=\"coral-Form-fieldlabel\">" + CQ.I18n.get("Sort By") + "</label>");
            });
        });
    });
})(window, document, Granite.$, Granite.author, $CQ);
