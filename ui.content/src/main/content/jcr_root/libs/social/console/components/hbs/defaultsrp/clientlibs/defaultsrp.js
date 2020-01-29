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
(function(window, Granite, $, CUI, hbs) {
    "use strict";
    var initialConfig = null;
    var DEFAULT_CONFIG_PATH = Granite.HTTP.getContextPath() + "/conf/global/settings/community/srpc/defaultconfiguration";
    var DEFAULT_CONFIG_PATH_OLD = Granite.HTTP.getContextPath() + "/etc/socialconfig/srpc/defaultconfiguration";
    var CONFIG_PATH_POST = DEFAULT_CONFIG_PATH;

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

    $(function() {
        // Hook the radio button
        $(".js-scf-storage-type-selection coral-radio").change(function(event) {
            var $target = $(event.currentTarget);
            // Hide all the forms
            $("form[class^='js-scf-form-']").hide();
            // Just show the one we changed to
            $(".js-scf-form-" + $target.val()).show();
        });

        // Hook the submit buttons
        $("form[class^='js-scf-form-'] button.js-scf-dsrp-Button--primary").click(function(event) {
            event.preventDefault();
            var $target = $(event.currentTarget);
            var $form = $target.closest("form");
            var data = $form.serialize();
            data += "&jcr:primaryType=nt:unstructured&_charset_=UTF-8";
            var formValid = true;
            $form.find("input[required]").each(function(index, element) {
                if ($(element).val() === "") {
                    formValid = false;
                }
            });
            if (!formValid) {
                showAlert("error", CQ.I18n.get("Your configuration is not correct."), CQ.I18n.get("Error"));
                return false;
            }
            $form.find("input[type='password']").each(function(index, element) {
                var $e = $(element);
                data += "&" + $e.attr("name") + "@Encrypted=true";
            });
            $.post(CONFIG_PATH_POST, data).done(function() {
                showAlert("success", CQ.I18n.get("Your configuration has been saved."), CQ.I18n.get("Success"));
            }).fail(function(jqXHR) {
                showAlert("error", CQ.I18n.get("Your configuration has not saved: {0} : {1}", [jqXHR.statusCode(), jqXHR.statusText]), CQ.I18n.get("Error"));
            });
            return false;
        });

        //Hook the test buttons
        $("form[class^='js-scf-form-'] button.js-scf-dsrp-Button.js-scf-testConfig").click(function(event) {
            event.preventDefault();
            $.get("/services/social/datastore/cloud/ping").done(function() {
                showAlert("success", CQ.I18n.get("Your configuration looks correct."), CQ.I18n.get("Success"));
            }).fail(function(jqXHR) {
                try {
                    var o = JSON.parse(jqXHR.responseText);
                    showAlert("error", errorTemplate(o), CQ.I18n.get("Error"));
                } catch (e) {
                    showAlert("error", CQ.I18n.get("Could not parse response from health check"), CQ.I18n.get("Error"));
                }
            });
            return false;
        });

    });

    function setCurrentConfig(data) {
        var type = (data && data.hasOwnProperty && data.hasOwnProperty("type")) ? data.type : "jsrp";
        if (type !== "jsrp" && type !== "msrp" && type !== "asrp" && type !== "dsrp") {
            type = "jsrp";
        }
        if (initialConfig === null) {
            if (data === null) {
                initialConfig = {
                    "type": "jsrp"
                };
            } else {
                initialConfig = data;
            }
        }

        var $targetForm = $(".js-scf-form-" + type);
        $targetForm.find("input:not([readonly])").each(function(index, element) {
            var $e = $(element);
            if (data.hasOwnProperty($e.attr("name"))) {
                if ($e.attr("name") === "hosturl") {
                    $("coral-autocomplete").val(data[$e.attr("name")]);
                } else {
                    $e.val(data[$e.attr("name")]);
                }
            }
        });
        $(".js-scf-storage-type-selection input[type='radio'][value='" + type + "']").click();
    }

    $.get(DEFAULT_CONFIG_PATH_OLD + ".json?ck=" + (new Date()).getTime()).done(function(data) {
        setCurrentConfig(data);
        CONFIG_PATH_POST = DEFAULT_CONFIG_PATH_OLD;
    }).fail(function(jqXHR) {
        if (jqXHR.status === 404) {
            $.get(DEFAULT_CONFIG_PATH + ".json?ck=" + (new Date()).getTime()).done(function(data) {
                setCurrentConfig(data);
                CONFIG_PATH_POST = DEFAULT_CONFIG_PATH;
            }).fail(function(jqXHR) {
                if (jqXHR.status === 404) {
                    setCurrentConfig(null);
                }
            });
        }

    });
})(window, Granite, Granite.$, CUI, Handlebars);
