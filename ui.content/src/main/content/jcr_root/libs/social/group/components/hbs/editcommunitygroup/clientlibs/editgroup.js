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

(function(window, document, Granite, $, SCFConsole) {
    "use strict";
    SCFConsole.editGroup = SCFConsole.editGroup || {};
    SCFConsole.editGroup.JSON = SCFConsole.editGroup.JSON || {};

    $(document).ready(function() {
        if ($.isEmptyObject(SCFConsole.editGroup.JSON)) {
            var componentId = $("div[data-scf-component=\"social/group/components/hbs/editcommunitygroup\"]").data("componentId");
            var editGroupModel = $("script[type=\"application/json\"][id=\"" + componentId + "\"]");
            var modelText = $(editGroupModel[0]).text();
            SCFConsole.editGroup.JSON = JSON.parse(modelText);
        }
        $("#social-console-pages-accordion .coral-Accordion-content").remove();
    });

    var fixFalseyCheckboxes = function(e) {
        var checkbox = $(e.target);
        var attribue = checkbox.attr("name");
        var checked = checkbox.is(":checked");
        var paramAttr = checkbox.attr("data-param");
        var inputTag = checkbox.siblings("input[name=" + paramAttr + "]")[0];
        $(inputTag).val(checked);
    };

    $CQ(document).ready(function() {
        $("input[type='checkbox']").on("change", fixFalseyCheckboxes);
    });

    var fillCommonStoreSelectBox = function(languageMapping) {
        var arr = SCFConsole.editGroup.JSON.properties.commonStoreLanguages;
        var commonStoreSelect = $('#social-console-common-store').data('select');

        commonStoreSelect.addOption({
            value: "nc",
            display: "No Global Shared Store"
        });
        commonStoreSelect.setValue("nc");
        for (var i = 0; i < arr.length; i++) {
            var languageCode = arr[i];
            for (var j = 0; j < languageMapping.length; j++) {
                if (languageCode == languageMapping[j].languageCode) {
                    commonStoreSelect.addOption({
                        value: languageMapping[j].languageCode,
                        display: languageMapping[j].languageName + ' (' + languageMapping[j].languageCode + ')'
                    });
                    if (languageMapping[j].languageCode == SCFConsole.editGroup.JSON.properties.commonStoreLanguage) {
                        commonStoreSelect.setValue(languageMapping[j].languageCode);
                    }
                    break;
                }
            }
        }

    };
    SCFConsole.editGroup.populateUserTags = function(id, attrValue) {
        var admins = null;
        var consoleusertags = null;
        var $tag = null;

        function addUserTags(consoleusertags) {
            if (consoleusertags !== undefined && admins !== undefined && admins) {
                for (var i = 0; i < admins.length; i++) {
                    consoleusertags.addItem({
                        "value": admins[i],
                        "display": admins[i]
                    });
                }
            }
        }

        if ($("#console-group-moderatorUsers").data("group-createpermission") ===
            "COMMUNITY_GROUP_ADMINISTRATORS") {
            admins = SCFConsole.editSite.JSON.configuration.groupManagementConfiguration.groupAdminIds;
            $tag = $("#console-group-moderatorUsers ul.coral-TagList.js-coral-Autocomplete-tagList");
            consoleusertags = $tag.data("tagList");
            addUserTags(consoleusertags);
        }
    };

    $(document).ready(function() {
        var coralMasonaryContainer = $(".scf-js-cq-social-themes-masonry");
        if (coralMasonaryContainer != null && coralMasonaryContainer[0] != null) {
            Coral.commons.ready(coralMasonaryContainer[0], function() {
                var groupTheme = $("#social-console-edit-editgroup").data("theme-value");
                var groupThemeValue = groupTheme;
                groupTheme = groupTheme.replace("/clientlibs", "");
                var customTheme = SCFConsole.editGroup.JSON.usingCustomCSS;
                var groupThemeEl = null;
                if (!customTheme) {
                    groupThemeEl = $("#social-console-edit-editgroup").find("[data-component-id=\"" + groupTheme + "\"]");
                    //groupThemeEl.toggleClass("selected");
                    groupThemeEl.parent().find(".selection-layer").show();
                    groupThemeEl.parent().find(".card-asset").toggleClass("selected");
                    groupThemeEl.parent().find(".card-asset input").prop("checked", true);
                    if (groupThemeEl.closest(".coral-Masonry-item")[0] != null) {
                        groupThemeEl.closest(".coral-Masonry-item")[0].selected = true;
                    }
                } else {
                    groupThemeEl = $("#social-console-edit-editgroup").find(".scf-js-social-console-cssupload article");
                    groupThemeEl.toggleClass("selected");
                    if (groupThemeEl.closest(".coral-Masonry-item")[0] != null) {
                        groupThemeEl.closest(".coral-Masonry-item")[0].selected = true;
                    }
                    groupThemeEl.parent().find(".selection-layer").show();
                    $(".scf-js-addcsslabel").text(Granite.I18n.get("Custom CSS uploaded"));
                }
                $(".scf-js-cq-social-themes input[name=\"theme\"]").val(groupThemeValue);
                //Move the selected theme to top
                var themesContainer = $('.scf-js-themes-container');
                var cardToBeMoved = groupThemeEl.closest('.scf-js-coral-selector');
                themesContainer.prepend(cardToBeMoved);
                $(".scf-js-social-console-group-creation").on("change", function() {
                    if ($(".scf-js-social-console-group-members").is(":checked")) {
                        $(".scf-js-social-console-group-moderators").parent().show();
                    } else {
                        $(".scf-js-social-console-group-moderators").parent().hide();
                    }
                });
            });
        }
    });

    $(document).ready(function() {
        $("#editGroupWizard").on("submit", function(e) {

            var funcElements = $(".scf-js-community-function-list");
            var configSet = funcElements.data("func-config-set");
            var funcConfigs = configSet.getFuncConfigs();
            $("#functions").val(JSON.stringify({
                "functions": funcConfigs
            }));
        });
        //Adding tabs from extendednav component
        var tabs = $(".scf-js-settingstabs").data("tabs");
        var extendedTabNavs = $(".scf-js-tabcontainter-tab");
        $.each(extendedTabNavs, function(index, value) {
            var tabEl = $(value);
            var tabNavEl = tabEl.find(".scf-js-coralTab");
            var tabText = tabNavEl.data("title");
            var tabClass = tabNavEl.data("cssclass");
            var tabIdid = tabs.addItem({
                tabContent: tabText,
                panelContent: tabEl.find(".scj-js-tab-panelcontent"),
                active: false
            });
            $(tabIdid).addClass(tabClass);
        });
    });

})(window, document, Granite, Granite.$, SCFConsole);
