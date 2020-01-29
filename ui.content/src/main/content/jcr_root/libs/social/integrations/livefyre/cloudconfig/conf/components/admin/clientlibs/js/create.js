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
(function(document, $) {

    "use strict";

    var contentPath = null;
    var relCreateConfig = ".social-create-config-livefyre";

    $(document).on("foundation-contentloaded", initCreateConfig);
    $(document).on("click", relCreateConfig, initCreateConfig);

    $(document).on("foundation-selections-change", function(e) {

        var localName = e.target.localName;
        if ($(".foundation-selections-item").length == 1) {
            // In columns view we have create folder functionality in selection mode as well.
            contentPath = $(".foundation-selections-item").data("foundation-collection-item-id");
            if (contentPath != undefined && contentPath.charAt(contentPath.length - 1) != "/") {
                contentPath = contentPath + "/";
            }
            if (document.querySelector(".cq-confadmin-actions-createconfig-activator")) {
                var createConfig = new CreateConfigDialog()
                    .set("createConfig", document.querySelector(relCreateConfig));
                createConfig.initialize();
            }
        }
    });

    var createDialogEl;

    var CreateConfigDialog = new Class({

        createConfig: null,
        dialog: null,
        _ILLEGAL_FILENAME_CHARS: "%/\\:*?\"[]|\n\t\r. #{}^;+",

        set: function(prop, value) {
            this[prop] = value;
            return this;
        },

        initialize: function() {
            var self = this;

            var $foundationPath = $(".foundation-content-path");

            if (!self.dialog) {
                self.dialog = self.createDialog();
                document.body.appendChild(self.dialog);
            }

            Coral.commons.ready(self.createConfig, function() {
                self.createConfig
                    .on("click", function(event) {
                        var parentAPI = $(self.createConfig)
                            .closest(".foundation-toggleable")
                            .adaptTo("foundation-toggleable");
                        if (parentAPI) {
                            parentAPI.hide();
                        }
                        self._cleanDialog();
                        self.dialog.show();
                    });
            });

        },

        createDialog: function() {
            var self = this;
            var dialogExist = true;
            if (!createDialogEl) {
                dialogExist = false;
                createDialogEl = new Coral.Dialog().set({
                    id: "createconfig",
                    header: {
                        innerHTML: Granite.I18n.get("Create Livefyre Configuration")
                    },
                    closable: "on"
                });
            }

            var dialog = createDialogEl;
            var content = dialog.querySelector("coral-dialog-content");
            if (!dialogExist) {
                // The modal is basically a form
                var contentForm = content.appendChild(document.createElement("form"));
                contentForm.className += " coral-Form--vertical";
                contentForm.action = "/bin/wcmcommand";
                ;
                contentForm.method = "POST";
                contentForm.encType = "application/x-www-form-urlencoded";

                // Hidden. For command.
                contentForm.appendChild(function() {
                    var dom = document.createElement("input");
                    dom.type = "hidden";
                    dom.name = "label";
                    dom.value = "livefyre";
                    return dom;

                }());

                // Hidden. For command.
                contentForm.appendChild(function() {
                    var dom = document.createElement("input");
                    dom.type = "hidden";
                    dom.name = "title";
                    dom.value = "livefyre";
                    return dom;

                }());

                // Hidden. For command.
                contentForm.appendChild(function() {
                    var dom = document.createElement("input");
                    dom.type = "hidden";
                    dom.name = "cmd";
                    dom.value = "createPage";
                    return dom;

                }());

                // Hidden. parent path used for page.
                contentForm.appendChild(function() {
                    var dom = document.createElement("input");
                    dom.className = "configuration-parent-path";
                    dom.type = "hidden";
                    dom.name = "parentPath";
                    dom.value = contentPath + "settings/cloudconfigs";
                    return dom;

                }());

                // Hidden. Template used for page.
                contentForm.appendChild(function() {
                    var dom = document.createElement("input");
                    dom.type = "hidden";
                    dom.name = "template";
                    dom.value = "/libs/social/integrations/livefyre/cloudconfig/pagetemplate";
                    return dom;

                }());

                // Hidden. for _charset_.
                contentForm.appendChild(function() {
                    var dom = document.createElement("input");
                    dom.type = "hidden";
                    dom.name = "_charset_";
                    dom.value = "UTF-8";
                    return dom;

                }());

                var footer = dialog.querySelector("coral-dialog-footer");
                var cancel = new Coral.Button();
                cancel.label.textContent = Granite.I18n.get("Cancel");
                footer.appendChild(cancel).on("click", function() {
                    self._cleanDialog();
                    dialog.hide();
                });

                var submitButton = new Coral.Button().set({
                    variant: "primary"
                }).on("click", function() {
                    self._submit();
                });
                submitButton.label.textContent = Granite.I18n.get("Create");

                footer.appendChild(submitButton);

                // Few settings to be used on various actions
                dialog.submit = submitButton;
                dialog.isPrivate = false;

            } else {
                var contentForm = content.childNodes.item(0);
            }

            return dialog;
        },

        _submit: function() {
            var self = this;

            var nameInput = $("input[name=\"label\"]", self.dialog)[0];
            var name = nameInput.value;
            if (self._hasRestrictedChar(name)) {
                Array.prototype.slice.call(nameInput.parentElement.getElementsByTagName("coral-tooltip"))
                    .forEach(function(item) {
                        item.remove();
                    });

                var errorIcon = new Coral.Icon().set({
                    id: "config-folder-name-textfield-fielderror-submit",
                    icon: "infoCircle",
                    size: "S"
                });
                errorIcon.className += " coral-Form-fielderror error-info-icon";
                nameInput.parentElement.appendChild(errorIcon);

                var errorTooltip = new Coral.Tooltip().set({
                    content: {
                        innerHTML: Granite.I18n.get("The name must not contain {0}, " +
                            "so replaced by {1}", [self._ILLEGAL_FILENAME_CHARS.toString().replace(/[,]/g, " "), "-"])
                    },
                    variant: "error",
                    target: "#config-folder-name-textfield-fielderror-submit",
                    placement: "right",
                    id: "config-folder-name-textfield-fielderror-tooltip"
                });
                nameInput.parentElement.appendChild(errorTooltip);

            } else {
                var form = self.dialog.querySelector("form");
                var basePath = form.getAttribute("action");
                var parentHidden = $(".configuration-parent-path");
                if (parentHidden) {
                    parentHidden.val(contentPath + "settings/cloudconfigs");
                }
                $.ajax({
                    type: form.method,
                    url: Granite.HTTP.externalize(basePath),
                    contentType: form.encType,
                    data: $(form).serialize(),
                    cache: false
                }).done(function(data, textStatus, jqXHR) {
                    self._cleanDialog();
                    self.dialog.hide();
                    self._refresh();
                }).fail(function(jqXHR, textStatus, errorThrown) {
                    var errDialog = new Coral.Dialog().set({
                        header: {
                            innerHTML: Granite.I18n.get("Error")
                        },
                        content: {
                            innerHTML: Granite.I18n.get("Failed to create configuration.")
                        }
                    });
                    var errorDlgOkBtn = new Coral.Button();
                    errorDlgOkBtn.variant = "primary";
                    errorDlgOkBtn.label.textContent = Granite.I18n.get("Ok");
                    errDialog.querySelector("coral-dialog-footer")
                        .appendChild(errorDlgOkBtn)
                        .on("click", function(event) {
                            self._cleanDialog();
                            errDialog.hide();
                        });
                    self.dialog.hide();
                    errDialog.show();
                });
            }
        },

        _validateAndAddTooltip: function(enteredText) {
            var self = this;
            var toDisable = false;
            if (enteredText === "") {
                toDisable = toDisable || true;
            }
            // Remove the stale tooltips if any
            Array.prototype.slice.call(self.dialog.nameInput.parentElement.getElementsByClassName("error-info-icon"))
                .forEach(function(item) {
                    item.remove();
                });

            if (self._hasRestrictedChar(enteredText)) {
                var errorIcon = new Coral.Icon().set({
                    id: "config-folder-name-textfield-fielderror",
                    icon: "infoCircle",
                    size: "S"
                });
                errorIcon.className += " coral-Form-fieldinfo error-info-icon";
                self.dialog.nameInput.parentElement.appendChild(errorIcon);

                var errorTooltip = new Coral.Tooltip().set({
                    content: {
                        innerHTML: Granite.I18n.get("The name must not contain {0}, " +
                            "so replaced by {1}", [self._ILLEGAL_FILENAME_CHARS.toString().replace(/[,]/g, " "), "-"])
                    },
                    variant: "inspect",
                    target: "#config-folder-name-textfield-fielderror",
                    placement: "left",
                    id: "config-folder-name-textfield-fielderror-tooltip"
                });
                self.dialog.nameInput.parentElement.appendChild(errorTooltip);

                self.dialog.nameInput.value = self._replaceRestrictedCodes(enteredText.toLowerCase())
                    .replace(/ /g, "-");
            } else {
                self.dialog.nameInput.value = enteredText.toLowerCase().replace(/ /g, "-");
            }
        },

        _cleanDialog: function() {
            var self = this;
            $.each(self.dialog.getElementsByTagName("input"), function(cnt, input) {
                if (input.type === "text") {
                    input.value = "";
                } else if (input.type === "checkbox") {
                    input.checked = false;
                }
            });
            // Remove the stale tooltips if any
            Array.prototype.slice.call(self.dialog.getElementsByClassName("error-info-icon")).forEach(function(item) {
                item.remove();
            });
            Array.prototype.slice.call(self.dialog.getElementsByClassName("coral3-Tooltip--error"))
                .forEach(function(item) {
                    item.remove();
                });
        },

        _isRestricted: function(code) {
            var self = this;
            var charVal = String.fromCharCode(code);
            if (self._ILLEGAL_FILENAME_CHARS.indexOf(charVal) > -1) {
                return true;
            } else {
                return false;
            }
        },

        _hasRestrictedChar: function(textValue) {
            var self = this;
            for (var i = 0, ln = textValue.length; i < ln; i++) {
                if (self._isRestricted(textValue.charCodeAt(i))) {
                    return true;
                }
            }
            return false;
        },

        _replaceRestrictedCodes: function(name) {
            var self = this;
            var jcrValidName = "";
            for (var i = 0, ln = name.length; i < ln; i++) {
                if (self._isRestricted(name.charCodeAt(i))) {
                    jcrValidName += "-";
                } else {
                    jcrValidName += name[i];
                }
            }
            return jcrValidName;
        },

        _refresh: function() {
            var contentApi = $(".foundation-content").adaptTo("foundation-content");
            if (contentApi) {
                contentApi.refresh();
            } else {
                location.reload(true);
            }
        }

    });

    function initCreateConfig() {

        $(".social-create-config-livefyre").show();
        $(".foundation-collection-item").each(function(idx) {
            if ($(this).attr("data-foundation-collection-item-id").indexOf("cloudconfig") >= 0) {
                $(".social-create-config-livefyre").hide();
            }
        });

        contentPath = $(".cq-confadmin-admin-childpages.foundation-collection").data("foundationCollectionId");
        if (contentPath != undefined && contentPath.charAt(contentPath.length - 1) != "/") {
            contentPath = contentPath + "/";
        }
        if (document.querySelector(relCreateConfig)) {
            var createConfig = new CreateConfigDialog().set("createConfig", document.querySelector(relCreateConfig));
            createConfig.initialize();
        }
    }

})(document, Granite.$);
