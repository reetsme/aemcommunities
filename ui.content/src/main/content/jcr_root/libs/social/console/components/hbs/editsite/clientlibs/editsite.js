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
    /*jshint maxcomplexity:12 */
    "use strict";
    SCFConsole.editSite = SCFConsole.editSite || {};
    SCFConsole.editSite.JSON = SCFConsole.editSite.JSON || {};

    SCFConsole.editSite.setSocialLogins = function() {
        //set conf context path
        var sitecontextInputSelector = ".site-cloud-config input";
        var sitecontextInputField = $(sitecontextInputSelector)[0];
        var siteCloudContext = SCFConsole.editSite.JSON.properties.siteCloudConfig;
        if (sitecontextInputField) {
            sitecontextInputField.value = siteCloudContext;
        }
        var allowFacebook = SCFConsole.editSite.JSON.properties.allowFacebook;
        var allowTwitter = SCFConsole.editSite.JSON.properties.allowTwitter;
        if (allowFacebook && JSON.parse(allowFacebook)) {
            var facebookconfigId = SCFConsole.editSite.JSON.properties.fbconnectoauthid;
            $(".scf-js-console-allowfacebook").prop('checked', true);
            if (siteCloudContext !== null) {
                $(".scf-console-facebook-div").hide();
            } else {
                $(".scf-console-facebook-div").show();
            }
            $("input[name=\"allowFacebook\"]").val("true");
            $(".scf-js-social-console-facebook-connect-select select").prop("disabled", false);

            var fbSelect = $(".scf-js-social-console-facebook-connect-select coral-select").get(0);
            if (fbSelect) {
                fbSelect.value = facebookconfigId;
            }
        }
        if (allowTwitter && JSON.parse(allowTwitter)) {
            var twitterconfigId = SCFConsole.editSite.JSON.properties.twitterconnectoauthid;
            $(".scf-js-console-allowtwitter").prop('checked', true);
            if (siteCloudContext !== null) {
                $(".scf-console-twitter-div").hide();
            } else {
                $(".scf-console-twitter-div").show();
            }
            $("input[name=\"allowTwitter\"]").val("true");
            $(".scf-js-social-console-twitter-connect-select select").prop("disabled", false);

            var twitterSelect = $(".scf-js-social-console-twitter-connect-select coral-select").get(0);
            if (twitterSelect) {
                twitterSelect.value = twitterconfigId;
            }
        }
    };
    SCFConsole.editSite.populateUserTags = function(id, attrValue) {
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

        var translationProviderData = null;

        var updateProviderConfigs = function(currentProvider, data) {
            var currentProviderconfigRootPath = "";
            currentProviderconfigRootPath = data.servicemap[0][currentProvider];
            var url = '/libs/cq/gui/components/projects/admin/translation?operation=cloudConfigList&rootPath=' + encodeURIComponent(currentProviderconfigRootPath);
            $.get(url, function(data, status) {
                var configurations = data.configurations;
                if ($.find('#social-console-translation-provider-config-span').length === 0) {
                    return;
                }
                var spanBox = $($.find('#social-console-translation-provider-config-span')[0]);
                var selectElement = spanBox.find("coral-select").get(0);
                var currentValue;
                var selected = false;
                /* Global Coral */
                Coral.commons.ready(selectElement, function() {
                    for (var i = 0; i < configurations.length; i++) {

                        selected = false;
                        if (SCFConsole.editSite.JSON.properties.translationProviderConfig) {
                            currentValue = SCFConsole.editSite.JSON.properties.translationProviderConfig;
                        }
                        if (currentValue &&
                            configurations[i].path === currentValue) {
                            selected = true;
                        }

                        selectElement.items.add({
                            value: configurations[i].path,
                            content: {
                                innerHTML: configurations[i].title
                            },
                            selected: selected
                        });
                    }
                });
            });
        };

        $("#social-console-span-translation-provider").on("selected", function(event) {
            var select = $("#social-console-span-translation-provider coral-select").get(0);
            var provider = select.value;
            updateProviderConfigs(provider, translationProviderData);
        });
        $.get("/services/social/getTranslationProviderInfo", function(data, status) {
            translationProviderData = data;
            var providerList = data.providers[0];
            var currentProvider = "";
            var currentProviderconfigPath = "";
            var providerDropdown = $("#social-console-span-translation-provider coral-select").get(0);
            var selected = false;
            if (providerDropdown !== undefined) {
                /* Global Coral */
                Coral.commons.ready(providerDropdown, function() {
                    for (var i = 0; i < providerList.length; i++) {

                        if (providerList[i] === SCFConsole.editSite.JSON.properties.translationProvider) {
                            currentProvider = providerList[i];
                            selected = true;
                        } else {
                            selected = false;
                        }

                        providerDropdown.items.add({
                            value: providerList[i],
                            content: {
                                innerHTML: providerList[i]
                            },
                            selected: selected
                        });
                    }
                });
            }

            if (currentProvider === "") {
                currentProvider = providerList[0];
            }
            updateProviderConfigs(currentProvider, data);
        });
        //TODO: Due to time constraints I am using a simple selector as there is only JSON script being loaded
        // In case of multiple JSON being loaded, we might have to fix Handlebars engine and add jquery filter
        if ($.isEmptyObject(SCFConsole.editSite.JSON)) {
            var componentId = $("div[data-scf-component=\"social/console/components/hbs/editsite\"]").data("componentId");
            var editSiteModel = $("script[type=\"application/json\"][id=\"" + componentId + "\"]");
            var modelText = $(editSiteModel[0]).text();
            SCFConsole.editSite.JSON = JSON.parse(modelText);
        }
        $("#social-console-pages-accordion .coral-Accordion-content").remove();
        var coralMasonaryContainer = $(".scf-js-cq-social-themes-masonry");
        Coral.commons.ready(coralMasonaryContainer[0], function() {
            //highlight the theme currently used
            var siteTheme = $("#social-console-edit-sitetheme").data("theme-value");
            var siteThemeValue = siteTheme;
            var lastIndex = siteTheme.lastIndexOf("/clientlibs");
            siteTheme = siteTheme.substring(0, lastIndex) + siteTheme.substring(lastIndex + ("/clientlibs").length);

            var siteThemeEl = null;
            var customTheme = SCFConsole.editSite.JSON.usingCustomCSS;
            if (!customTheme) {
                siteThemeEl = $("#social-console-edit-sitetheme").find("[data-component-id=\"" + siteTheme + "\"]");
                //siteThemeEl.toggleClass("selected");
                siteThemeEl.parent().find(".selection-layer").show();
                siteThemeEl.parent().find(".card-asset").toggleClass("selected");
                //Marking the Theme card as selected
                if (siteThemeEl.closest("coral-Masonry-item")[0]) {
                    siteThemeEl.closest("coral-Masonry-item")[0].selected = true;
                }
                siteThemeEl.parent().find(".card-asset input").prop("checked", true);
            } else {
                siteThemeEl = $("#social-console-edit-sitetheme").find(".scf-js-social-console-cssupload article");
                siteThemeEl.toggleClass("selected");
                if (siteThemeEl.closest("coral-Masonry-item")[0]) {
                    siteThemeEl.closest("coral-Masonry-item")[0].selected = true;
                }
                siteThemeEl.parent().find(".selection-layer").show();
                $(".scf-js-addcsslabel").text(Granite.I18n.get("Custom CSS uploaded"));
            }
            $(".scf-js-cq-social-themes input[name=\"theme\"]").val(siteThemeValue);
            //Move the selected theme to top
            var themesContainer = $('.scf-js-themes-container');
            var cardToBeMoved = siteThemeEl.closest('.scf-js-coral-selector');
            themesContainer.prepend(cardToBeMoved);
            $(".scf-js-social-console-group-creation").on("change", function() {
                if ($(".scf-js-social-console-group-members").length &&
                $(".scf-js-social-console-group-members").get(0).checked) {
                    $(".scf-js-social-console-group-moderators").parent().show();
                } else {
                    $(".scf-js-social-console-group-moderators").parent().hide();
                }
            });
            if ($(".scf-js-social-console-group-members").length &&
            $(".scf-js-social-console-group-members").get(0).checked) {
                $(".scf-js-social-console-group-moderators").parent().show();
            } else {
                $(".scf-js-social-console-group-moderators").parent().hide();
            }
        });

        //Set Users as well
        SCFConsole.editSite.populateUserTags("console-group-moderatorUsers", "groupAdmin");

        //Set Social Logins
        SCFConsole.editSite.setSocialLogins();
        $("#console-group-moderatorUsers .coral-TagList").on("itemadded", function(e, item) {
            $(this).find(".coral-TagList-tag input[type=\"hidden\"]").attr("name", "groupAdmin");
        });

        $(".scf-js-console-allowregistration").on("change", function() {
            if ($(".scf-js-console-allowregistration").length &&
            $(".scf-js-console-allowregistration").get(0).checked) {
                $(".scf-js-console-allowcaptcha").parent().show();
            } else {
                $(".scf-js-console-allowcaptcha").parent().hide();
            }
        });

        if ($(".scf-js-console-allowregistration").length &&
        $(".scf-js-console-allowregistration").get(0).checked) {
            $(".scf-js-console-allowcaptcha").parent().show();
        } else {
            $(".scf-js-console-allowcaptcha").parent().hide();
        }

        if ($(".scf-js-social-console-allow-translation").length &&
                $(".scf-js-social-console-allow-translation").get(0).checked) {
            $(".cq-social-console-translation-options").parent().show();
            var smartRenderSpanBox = $("#social-console-smart-render coral-select").get(0);
            var selectedValue = SCFConsole.editSite.JSON.properties.smartRender;
            smartRenderSpanBox.value = selectedValue;
            var selectedValueCommonStore = SCFConsole.editSite.JSON.properties.commonStoreLanguage;
            var spanBox = $("#social-console-common-store coral-select")[0];
            spanBox.value = selectedValueCommonStore;
        } else {
            $(".cq-social-console-translation-options").parent().hide();
        }

        if ($(".scf-js-social-console-enable-analytics").length &&
        $(".scf-js-social-console-enable-analytics").get(0).checked) {

            var selectedCloudConfigPath = SCFConsole.editSite.JSON.configuration.analyticsConfiguration.selectedFrameworkPath;
            if (selectedCloudConfigPath !== "") {
                var select = $(".scf-analytics-js-framework-list .coral-Select").data("select");
                select.setValue(selectedCloudConfigPath);
            }

            $(".cq-social-console-analytics-options").show();
        } else {
            $(".cq-social-console-analytics-options").hide();
        }

        $(".scf-js-social-console-enable-analytics").on("change", function() {
            if ($(".scf-js-social-console-enable-analytics").length &&
            $(".scf-js-social-console-enable-analytics").get(0).checked) {
                $(".cq-social-console-analytics-options").show();
            } else {
                $(".cq-social-console-analytics-options").hide();
            }
        });

        if ($(".scf-analytics-js-framework-list select")[0].options.length === 0) {
            $(".scf-js-social-console-enable-analytics").attr("disabled", true);
        }

        $(".scf-js-social-console-allow-translation").on("change", function() {
            var select = $("#social-console-availableLanguageSelect coral-select").get(0);
            if ($(".scf-js-social-console-allow-translation").length &&
            $(".scf-js-social-console-allow-translation").get(0).checked) {
                $(".cq-social-console-translation-options").parent().show();
                select.values = ["en", "fr", "de", "ja", "it", "es", "pt_BR", "zh_CN", "zh_TW", "ko_KR"];
            } else {
                $(".cq-social-console-translation-options").parent().hide();
                select.values = '';
            }
        });

        $.get(SCF.config.urlRoot + "/libs/social/translation/languageOpts/languageMapping.social.json", function(data) {
            var items = data.items;
            var select = $("#social-console-availableLanguageSelect coral-select").get(0);
            var availableLangs = SCFConsole.editSite.JSON.configuration.translationManagementConfiguration.availableLanguage;
            var selected = false;

            /* Global Coral */
            Coral.commons.ready(select, function() {
                for (var i = 0; i < items.length; i++) {

                    if (availableLangs && availableLangs.indexOf(items[i].languageCode) !== -1) {
                        selected = true;
                    } else {
                        selected = false;
                    }

                    select.items.add({
                        value: items[i].languageCode,
                        content: {
                            innerHTML: items[i].languageName
                        },
                        selected: selected
                    });
                }
            });
        });

        var smartRenderSelect = $("#social-console-smart-render coral-select").get(0);
        smartRenderSelect.value = SCFConsole.editSite.JSON.properties.smartRender;
    });

    var fixFalseyCheckboxes = function(e) {
        var checkbox = $(e.target);
        var checked = (checkbox.length && checkbox.get(0).checked);
        var paramAttr = checkbox.attr("data-param");
        var inputTag = checkbox.find("input[name=" + paramAttr + "]");
        $(inputTag).val(checked);
    };

    $CQ(document).ready(function() {
        var checkboxes = $(".scf-js-fix-checks");
        checkboxes.on("change", fixFalseyCheckboxes);
        for (var i = 0; i < checkboxes.length; i++) {
            var paramAttr = $(checkboxes[i]).attr("data-param");
            $(checkboxes[i]).append("<input type=\"hidden\" name=\"" + paramAttr + "\">");
        }
    });

    $(document).on("change", ".js-social-console-group-creation", function() {
        if ($(".scf-js-social-console-group-members").length &&
                $(".scf-js-social-console-group-members").get(0).checked) {
            $(".js-social-console-group-moderators").parent().show();
        } else {
            $(".js-social-console-group-moderators").parent().hide();
        }
    });

    var fillCommonStoreSelectBox = function(languageMapping) {
        var arr = SCFConsole.editSite.JSON.configuration.siteLanguageCopies || [];
        var defaultLanguage = SCFConsole.editSite.JSON.properties.commonStoreLanguage;
        if (!defaultLanguage) {
            defaultLanguage = "nc";
        }
        var commonStoreSelect = $('#social-console-common-store coral-select').get(0);

        /* Global Coral */
        Coral.commons.ready(commonStoreSelect, function() {

            commonStoreSelect.items.add({
                value: "nc",
                content: {
                    innerHTML: "No Global Shared Store"
                },
                selected: defaultLanguage === "nc"
            });
            for (var i = 0; i < arr.length; i++) {

                var languageCode = arr[i];
                for (var j = 0; j < languageMapping.length; j++) {
                    if (languageCode == languageMapping[j].languageCode) {

                        commonStoreSelect.items.add({
                            value: languageMapping[j].languageCode,
                            content: {
                                innerHTML: languageMapping[j].languageName + ' (' + languageMapping[j].languageCode + ')'
                            },
                            selected: languageMapping[j].languageCode === defaultLanguage
                        });

                        break;
                    }
                }
            }
        });
    };

    $(window).load(function() {
        var languageMapping = [];
        $.get(SCF.config.urlRoot + "/libs/social/translation/languageOpts/languageMapping.social.json", function(data) {
            languageMapping = data.items;
            fillCommonStoreSelectBox(languageMapping);
        }, "json");

        $("#editSiteWizard").on("submit", function(e) {
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
