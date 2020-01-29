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

(function(window, document, Granite, $, SCF) {
    "use strict";
    $(document).ready(function() {
        var languageCodes = [];
        var translationProviderData = null;
        var languageMapping = [];
        var communitySiteRootPathField = $(".js-coral-pathbrowser-input");
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

        var fixFalseyCheckboxes = function(e) {
            var checkbox = $(e.target);
            var checked = (checkbox.length && checkbox.get(0).checked);
            var paramAttr = checkbox.attr("data-param");
            var inputTag = checkbox.find("input[name=" + paramAttr + "]");
            $(inputTag).val(checked);
        };

        var checkboxes = $(".scf-js-fix-checks");
        checkboxes.on("change", fixFalseyCheckboxes);
        for (var i = 0; i < checkboxes.length; i++) {
            var paramAttr = $(checkboxes[i]).attr("data-param");
            $(checkboxes[i]).append("<input type=\"hidden\" name=\"" + paramAttr + "\">");
        }

        var initSelectControls = function(select, items) {
            var first = true;
            var selected = false;
            /* Global Coral */
            Coral.commons.ready(select, function() {
                //select.value = bluePrintPath;
                for (var i = 0; i < items.length; i++) {
                    if (!items[i].disabled) {
                        if (first) {
                            selected = true;
                            first = false;
                        } else {
                            selected = false;
                        }
                        select.items.add({
                            value: items[i].id,
                            content: {
                                innerHTML: items[i].title
                            },
                            selected: selected
                        });

                    }
                }
            });
        };

        $.get(SCF.config.urlRoot + "/libs/settings/community/templates/sites.social.json", function(data) {
            var items = data.items;
            items.sort(sort_by("title", function(a) {
                return a.toUpperCase();
            }));
            var select = $("#social-console-bluePrintSelect coral-select").get(0);

            if (select) {
                initSelectControls(select, items);
            }
        }, "json");

        function updateProviderConfigsInDropdown(configurations) {
            if ($.find('#social-console-translation-provider-config-span').length === 0) {
                return;
            }
            var spanBox = $($.find('#social-console-translation-provider-config-span')[0]);
            var selectElement = spanBox.find("coral-select").get(0);
            var firstVal = null;
            /* Global Coral */
            Coral.commons.ready(selectElement, function() {
                for (var i = 0; i < configurations.length; i++) {

                    selectElement.items.add({
                        value: configurations[i].path,
                        content: {
                            innerHTML: configurations[i].title
                        }
                    });
                }
            });
            spanBox.find("coral-select").get(0).value = firstVal;
        }

        var updateProviderConfigs = function(currentProvider, data) {
            var currentProviderconfigRootPath = "";
            currentProviderconfigRootPath = data.servicemap[0][currentProvider];

            var url = '/libs/cq/gui/components/projects/admin/translation?operation=cloudConfigList&rootPath=' + encodeURIComponent(currentProviderconfigRootPath);
            $.get(url, function(data, status) {
                var configurations = data.configurations;
                updateProviderConfigsInDropdown(configurations);
            });
        };

        $("#social-console-span-translation-provider").on("selected", function(event) {
            var select = $("#social-console-span-translation-provider").data("select");
            var provider = select.getValue();
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
                    //select.value = bluePrintPath;
                    for (var i = 0; i < providerList.length; i++) {

                        if (providerList[i] === "microsoft") {
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

        var updateCommonStoreLanguagesDropDown = function(languages) {
            if ($.find('#social-console-common-store').length === 0) {
                return;
            }
            var spanBox = $($.find('#social-console-common-store')[0]);
            var selectElement = spanBox.find("coral-select").get(0);

            /* Global Coral */
            Coral.commons.ready(selectElement, function() {
                // Clear all selection and populate the new list
                selectElement.items.clear();
                // Add the default "No Global Shared Store"
                selectElement.items.add({
                    value: "nc",
                    content: {
                        innerHTML: "No Global Shared Store"
                    }
                });
                var firstVal = "nc";

                for (var i = 0; i < languages.length; i++) {
                    for (var j = 0; j < languageMapping.length; j++) {
                        if (languages[i] === languageMapping[j].languageCode) {
                            var langCode = languageMapping[j].languageCode;
                            var langName = languageMapping[j].languageName;

                            if (firstVal === null) {
                                firstVal = languages[i];
                            }
                            selectElement.items.add({
                                value: langCode,
                                content: {
                                    innerHTML: langName + " (" + langCode + ")"
                                }
                            });
                            break;

                        }
                    }
                }
                spanBox.find("coral-select").get(0).value = firstVal;
            });
        };

        $("#social-console-baseLanguageSelect").on("change", function() {
            var commonStoreLanguages = $("#social-console-baseLanguageSelect coral-select").get(0).values;
            updateCommonStoreLanguagesDropDown(commonStoreLanguages);
        });

        $.get(SCF.config.urlRoot + "/libs/social/translation/languageOpts/languageMapping.social.json", function(data) {
            var items = data.items;
            languageMapping = items;
            var select = $("#social-console-availableLanguageSelect coral-select").get(0);
            var baselanguage = $("#social-console-baseLanguageSelect coral-select").get(0);
            languageCodes = [];
            if (select) {
                /* Global Coral */
                Coral.commons.ready(baselanguage, function() {
                    for (var i = 0; i < items.length; i++) {
                        languageCodes.push(items[i].languageCode);
                        var languageDisplay = CQ.I18n.get(items[i].languageName);

                        select.items.add({
                            value: items[i].languageCode,
                            content: {
                                innerHTML: languageDisplay
                            },
                            selected: (i === 0)
                        });
                        if (items[i].properties.languageSetting === "baselanguage") {
                            baselanguage.items.add({
                                value: items[i].languageCode,
                                content: {
                                    innerHTML: languageDisplay
                                },
                                selected: (i === 0)
                            });
                        }
                    }
                });
            }
        }, "json");

        function checkLanguageRootInDeepSite() {
            var select = $CQ("[name=\"initialLanguages\"]");
            var deepPath = communitySiteRootPathField.val();
            if (deepPath !== "" && select) {
                var tokens = deepPath.split("/");
                var token = "";
                var lang = "";
                var index = -1;
                for (var i = 0; i < tokens.length; i++) {
                    token = tokens[i];
                    index = languageCodes.indexOf(token);
                    if (index !== -1) {
                        lang = languageCodes[index];
                        break;
                    }
                }

                if (lang !== "") {
                    select.value = lang;
                    select.disabled = true;
                } else {
                    select.disabled = false;
                }
            } else if (select) {
                select.disabled = false;
            }
        }

        checkLanguageRootInDeepSite();
        communitySiteRootPathField.on("change", checkLanguageRootInDeepSite);
        $(".scf-js-console-allowregistration").on("change", function() {
            if ($(".scf-js-console-allowregistration").length &&
            $(".scf-js-console-allowregistration").get(0).checked) {
                $(".scf-js-console-allowcaptcha").parent().show();
            } else {
                $(".scf-js-console-allowcaptcha").parent().hide();
            }
        });
        if ($(".scf-js-social-console-group-members").length &&
        $(".scf-js-social-console-group-members").get(0).checked) {
            $(".scf-js-social-console-group-moderators").parent().show();
        } else {
            $(".scf-js-social-console-group-moderators").parent().hide();
        }

        $(".scf-js-social-console-group-creation").on("change", function() {
            if ($(".scf-js-social-console-group-members").length &&
            $(".scf-js-social-console-group-members").get(0).checked) {
                $(".scf-js-social-console-group-moderators").parent().show();
            } else {
                $(".scf-js-social-console-group-moderators").parent().hide();
            }
        });

        if ($(".scf-js-social-console-allow-translation").length &&
        $(".scf-js-social-console-allow-translation").get(0).checked) {
            $(".cq-social-console-translation-options").parent().show();
        } else {
            $(".cq-social-console-translation-options").parent().hide();
        }

        $(".scf-js-social-console-enable-analytics").on("change", function() {
            if ($(".scf-js-social-console-enable-analytics").length &&
            $(".scf-js-social-console-enable-analytics").get(0).checked) {
                $(".cq-social-console-analytics-options").show();
            } else {
                $(".cq-social-console-analytics-options").hide();
            }
        });

        if ($(".scf-analytics-js-framework-list select").length > 0 && $(".scf-analytics-js-framework-list select")[0].options.length === 0) {
            $(".scf-js-social-console-enable-analytics").attr("disabled", true);
        }

        if ($(".scf-js-console-allowregistration").length &&
        $(".scf-js-console-allowregistration").get(0).checked) {
            $(".scf-js-console-allowcaptcha").parent().show();
        } else {
            $(".scf-js-console-allowcaptcha").parent().hide();
        }

        $(".scf-js-social-console-allow-translation").on("change", function() {
            var select = $("#social-console-availableLanguageSelect coral-select").get(0);
            if ($(".scf-js-social-console-allow-translation").length &&
            $(".scf-js-social-console-allow-translation").get(0).checked) {
                $(".cq-social-console-translation-options").parent().show();
                select.values = ["en", "fr", "de", "ja", "it", "es", "pt_BR", "zh_CN", "zh_TW", "ko_KR"];
            } else {
                $(".cq-social-console-translation-options").parent().hide();
                select.values = "";
            }
        });

        if ($(".scf-js-social-console-group-enablement-managers").length) {
            $(".coral-TabPanel-tab.enablement").show();
        }

        function errorMessageGenerator(message) {
            $('.scf-console-createsite-erroralert .coral-Alert-title').text(CQ.I18n.get("Error"));
            $('.scf-console-createsite-erroralert .coral-Alert-message').text(message);
            $('.scf-console-createsite-erroralert').show().delay(10000).fadeOut();
        }

        $("#cq-social-create-site-submit").on("click", function() {
            if (!$("#scf-site-wizard-last-tab").hasClass("is-selected")) {
                return false;
            }
            $("body").prepend("<div id='createSiteOverlayDiv'></div>");
            $(".scf-create-site-wait").show();
            $("#social-console-baseLanguageSelect coral-select").get(0).set('disabled', false);
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
                            errorMessageGenerator(message);
                            return false;
                        }, this);
                        var success = _.bind(function(response) {
                            CQ.shared.Util.reload(null, SCF.config.urlRoot + "/communities/sites.html");
                        }, this);
                        $.ajax({
                            url: SCF.config.urlRoot + "/content.social.json",
                            type: 'POST',
                            data: new FormData(this),
                            processData: false,
                            contentType: false,
                            "error": error,
                            "success": success
                        });
                        $("#cq-social-create-site-submit").prop("disabled", true);
                        e.preventDefault();
                    });
            }
        });
        $(".scf-js-social-console-siteurl").on("keyup", function() {
            var urlText = $(".scf-js-social-console-siteurl").val();
            var rootText = $('input[name=siteRoot]').val() + "/";
            if (rootText == "/") {
                rootText = "/content/sites/";
            }
            urlText = SCF.config.urlRoot + rootText + urlText;
            $(".scf-js-social-console-siteurlclone").val(urlText);
        });

        var isValidUrl = function(urlText) {
            var NON_VALID_CHARS = "%/\\:*?\"[]|\n\t\r. ";
            for (var i = 0, ln = urlText.length; i < ln; i++) {
                if (NON_VALID_CHARS.indexOf(urlText[i]) >= 0 || urlText.charCodeAt(i) > 127) {
                    return false;
                }
            }
            return true;
        };

        var enableTabButton = function() {
            var siteUrl = $(".scf-js-social-console-siteurl").val();
            var urlVal = _.isEmpty(siteUrl);
            var title = _.isEmpty($(".scf-js-social-console-title").val());
            var isValid = isValidUrl(siteUrl);
            if (!urlVal && !title && isValid) {
                $(".scj-js-basictab-next").prop("disabled", false);
            } else {
                $(".scj-js-basictab-next").prop("disabled", true);
            }
        };

        $(".scf-js-social-console-siteurl").on("input", function() {
            enableTabButton();
        });

        $(".scf-js-social-console-title").on("input", function() {
            enableTabButton();
        });

        $("#console-group-moderatorUsers .coral-TagList").on("itemadded", function() {
            $(this).find(".coral-TagList-tag input[type=\"hidden\"]").attr("name", "groupAdmin");
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

        enableTabButton();
    });
})(window, document, Granite, Granite.$, SCF);
