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
    SCFConsole.communityfunction = SCFConsole.communityfunction || {};
    SCFConsole.communityfunction.components = {};
    SCFConsole.urlRoot = window.location.protocol + "//" + window.location.host;

    var FuncConfigSet = function(element) {
        this.currentElement = undefined;
        this._instanceCounts = {};
        this.funcConfigs = [];
        this.removedConfigs = [];
        this.hasUserList = false;
        element.data("func-config-set", this);
        this.trackChanges = element.data("trackchanges") || false;
        this.$el = element;
        var componentID = null;
        var jsonString = null;
        var jsonDef = null;
        var structure = null;
        componentID = element.data("component-id");
        if (!_.isUndefined(componentID)) {
            this.componentID = componentID;
            jsonString = $("script[type='application/json'][id='" + componentID + "']")[0].text;
            if (!_.isUndefined(jsonString)) {
                try {
                    jsonDef = $.parseJSON(jsonString);
                    structure = jsonDef.structure;
                } catch (err) {

                }

            }
        }
        if (!_.isUndefined(structure) || !_.isEmpty(structure)) {
            this.buildConfig(structure);
        }
        this.cuiDraggableList = element.data("draggable-list");
        this.cuiDraggableList.set("closeable", "true");
        this.cuiDraggableList.on("inserted", _.bind(this.onInsert, this));
        this.cuiDraggableList.on("reordered", _.bind(this.onReorder, this));
    };

    var FuncConfig = function(element, parent, isNew) {
        this.parent = parent;
        this.isNew = isNew || false;
        this.config = {};
        if (_.isElement(element) || element instanceof $) {
            this.$el = $(element);
            this.id = this.$el.data("function-path");
            this.number = this.parent._getInstanceNumber(this.id);
        } else {
            var structure = element;
            this.id = structure["function"].id;
            this.number = this.parent._getInstanceNumber(this.id);
            this.$el = $(this.parent.$el.find("li[data-function-path='" + this.id + "']")[this.number -
                1]);
            this.initConfig(structure);
        }
        this.$el.data("funcConfig", this);
        this.config["function"] = this.id;
        this.$el.addClass("scf-is-list-added-item");
        var deleteButton = this.$el.find(".scf-js-list-remove");
        var settingsButton = this.$el.find(".scf-js-list-edit");
        var that = this;
        settingsButton.click(function(e) {
            e.preventDefault();
            parent.currentElement = that.$el;
            that.launchModal(that.$el, true);
        });
        deleteButton.click(function(e) {
            parent.cuiDraggableList.close(e);
            if (!isNew && parent.trackChanges) {
                parent.addDeletedFunction(that);
            }
        });
        var closeButton = this.$el.find(".scf-js-community-function-modal-close");
        closeButton.click(function(e) {
            that.closeConfig(that.$el, triggeredFromSettingIcon);
        });
    };

    FuncConfigSet.prototype.buildConfig = function(structure) {
        var that = this;
        _.each(structure, function(fcJSON) {
            var fc = new FuncConfig(fcJSON, that);
        });
    };

    FuncConfigSet.prototype.getFuncConfigs = function() {
        var funcElements = this.$el.find("li.scf-is-list-added-item");
        var configs = [];
        var that = this;
        funcElements.each(function(i, el) {
            var fc = $(el).data("func-config");
            var config = fc.config;
            if (that.trackChanges && fc.isNew) {
                config.action = "NEW";
            }
            configs.push(config);
        });
        if (this.trackChanges) {
            for (var i = 0; i < this.removedConfigs.length; i++) {
                var config = this.removedConfigs[i].config;
                config.action = "DEL";
                configs.push(config);
            }
        }
        return configs;
    };

    FuncConfigSet.prototype.addDeletedFunction = function(funcConfig) {
        this.removedConfigs.push(funcConfig);
    };

    FuncConfigSet.prototype.onInsert = function(event) {
        var insertedEl = $(event.item);
        var fc = new FuncConfig(insertedEl, this, this.trackChanges ? true : false);
        this.funcConfigs.push(fc);
        this.currentElement = insertedEl;
        fc.launchModal(insertedEl, false);
    };

    FuncConfigSet.prototype.onReorder = function(event) {
        if (!this.trackChanges) {
            return;
        }
        var movedEl = $(event.item);
        var fc = movedEl.data("funcConfig");
        if (!fc.isNew) {
            fc.config.action = "MOV";
        }
    };

    FuncConfigSet.prototype._getInstanceNumber = function(funcPath) {
        var count = this._instanceCounts[funcPath];
        if (_.isUndefined(count) || count === 0) {
            count = 1;
        } else {
            count++;
        }
        this._instanceCounts[funcPath] = count;
        return count;
    };

    FuncConfig.prototype.closeConfig = function(listItem, triggeredFromSettingIcon) {
        if (!triggeredFromSettingIcon) {
            listItem.remove();
        }
    };

    var setUserValues = function(funcObjectInstance) {
        var that = funcObjectInstance;
        _.each(that.config.configuration, function(config) {
            if (config.id == "cq:privilegedMembers") {
                var tagList = that.getElementFromModal(".console-js-grouplist");
                var allowPrivilegedUsers = that.getElementFromModal(
                    "[data-config-id=\"allowPrivilegedMembers\"]").is(":checked");
                var val = config.value;
                if ($.type(val) === "string" && !_.isEmpty(val)) {
                    val = JSON.parse(val);
                }
                if (val.length) {
                    $CQ.each(val, function(index, item) {
                        tagList.get(0).items.add({
                            value: item,
                            content: {
                                innerHTML: item
                            },
                            selected: true
                        });
                    });
                }
                if (allowPrivilegedUsers) {
                    tagList.removeClass("scf-is-hidden");
                } else {
                    tagList.addClass("scf-is-hidden");
                }
            }
        });
    };

    var modalTemplate = "<div class=\"coral-Modal\"><div class=\"coral-Modal-header\">" +
        "<i class=\"coral-Modal-typeIcon coral-Icon coral-Icon--sizeS\"></i>" +
        "<h2 class=\"coral-Modal-title coral-Heading coral-Heading--2\">{{i18n \"Configuration Function Details\"}}</h2>" +
        "<button type=\"button\" class=\"coral-MinimalButton coral-Modal-closeButton scf-js-community-function-modal-close\" title=\"{{i18n \"Close\"}}\" data-dismiss=\"modal\">" +
        "<i class=\"coral-Icon coral-Icon--sizeXS coral-Icon--close coral-MinimalButton-icon \"></i>" +
        "</button></div>" + "<div class=\"coral-Modal-body\">{{{content}}}</div>" +
        "<div class=\"coral-Modal-footer\">" +
        "<button type=\"button\" class=\"coral-Button coral-Button--primary scf-js-community-function-modal-save\" >{{i18n \"Save\"}}</button></div></div>";

    var selectTemplate =
        "<span id=\"groupTemplateSelect\" class=\"coral-Select\" data-nativewidget=\"true\">" +
        "<button type=\"button\" class=\"coral-Select-button coral-MinimalButton\">" +
        "<span class=\"coral-Select-button-text\">{{i18n label}}</span>" + "</button>" +
        "<select class=\"coral-Select-select\" multiple=\"true\">" + "</select>" + "</span>";

    var checkboxTemplate = "<coral-checkbox class=\"scf-js-fix-checks scf-fix-checks\"" +
            "{{isChecked}} data-config-id=\"{{id}}\" {{isChecked}}>" +
            "{{i18n label}}</coral-checkbox>";

    var checkboxTemplateC = Handlebars.compile(checkboxTemplate);

    var selectTemplateC = Handlebars.compile(selectTemplate);

    var modalTemplateC = Handlebars.compile(modalTemplate);

    FuncConfig.prototype.launchModal = function(listItem, triggeredFromSettingIcon) {
        var closeButton;
        if (!_.isUndefined(this.modal)) {
            closeButton = this.modal.get("element").find(".scf-js-community-function-modal-close");
            closeButton.unbind("click");
            closeButton.click(_.bind(this.closeConfig, this, listItem, triggeredFromSettingIcon));
            this.modal.show();
            this.modal.center();
            return;
        }
        var waitHTML =
            "<div style=\"display: block;margin:50px auto;\" class=\"coral-Wait coral-Wait--large\"></div>";
        var modalEl = $(modalTemplateC({
            content: waitHTML
        }));
        this.modal = new CUI.Modal({
            element: modalEl,
            visible: false
        });
        this.modal.show();
        var suffix = !_.isUndefined(this.parent.componentID) ? this.parent.componentID : "";
        var htmlFetch = FuncConfig.getConfigHtml(this.id, suffix);
        var that = this;
        htmlFetch.done(function(data) {
            var content = $(data);
            that.setConfigValues(content);
            that.modal.set("content", content);
            that.initCoralInputs(content);
            if (that.hasUserList) {
                setUserValues(that);
            }
            that.modal.on("hide", function(event) {
                if ($(that.modal.$element[0]).is(event.target)) {
                    that.resetConfig();
                }
            });
            that.modal.center();
        });
        var saveButton = this.modal.get("element").find(".scf-js-community-function-modal-save");
        saveButton.click(_.bind(this.saveConfig, this));
        closeButton = this.modal.get("element").find(".scf-js-community-function-modal-close");
        closeButton.click(_.bind(this.closeConfig, this, listItem, triggeredFromSettingIcon));
    };

    var getUserListTemplate = function() {
        var resourceType = "social/console/components/hbs/userlist";
        var templateName = "userlist";
        var templateScript;
        $CQ.ajax({
            async: false,
            // xhrFields: {
            //  withCredentials: true
            // },
            url: SCF.config.urlRoot + "/services/social/templates" + "?resourceType=" +
                resourceType + "&ext=hbs&selector=" + templateName
        }).done(function(data, status) {
            if (status == "success") {
                templateScript = Handlebars.compile(data);
            }
        });
        return templateScript;
    };

    var getCoralSelectValue = function(inputElement) {
        if (inputElement.find("coral-select").length) {
            if (inputElement.find("coral-select").get(0).values.length) {
                return inputElement.find("coral-select").get(0).values;
            } else {
                var values = [];
                _.each(inputElement.find("coral-select").get(0).selectedItems, function(item) {
                    values.push(item.value);
                });
                return values;
            }
        } else {
            return inputElement.data("select").getValue();
        }
    };

    FuncConfig.prototype.setConfigValues = function(element) {
        element.find("input.scf-js-community-function-title").val(this.config.title);
        element.find("input.scf-js-community-function-url").val(this.config.url);
        _.each(this.config.configuration, function(config) {
            var configEl = element.find("[data-config-id='" + config.id + "']");
            if (!_.isEmpty(configEl)) {
                var val = config.value;
                var type = configEl.data("type");
                if (_.isUndefined(type)) {
                    type = "coral-" + configEl.data("init");
                }
                if (type === "checkbox") {
                    configEl.attr("data-default", val);
                } else if (type === "coral-select" || type === "select") {
                    var optEls = configEl.find("option");
                    if ($.type(val) === "string") {
                        val = JSON.parse(val);
                    }
                    _.each(val, function(selectedVal) {
                        optEls.each(function(i, optEl) {
                            var optVal = $(optEl).val();
                            if (optVal === selectedVal) {
                                $(optEl).attr("selected", "selected");
                            }
                        });
                    });
                }
            }
        });
    };

    FuncConfig.getConfigHtml = function(path, suffix) {
        return $.get(path + ".configuration.html" + suffix);
    };

    FuncConfig.prototype.initConfig = function(structure) {
        this.config.title = structure.title;
        this.config.url = structure.url;
        if (this.parent.trackChanges) {
            this.config.origUrl = structure.url;
        }
        this.config.configuration = [];
        var that = this;
        _.each(structure.configuration, function(val, key) {
            var conf = {};
            conf.id = key;
            conf.value = val;
            that.config.configuration.push(conf);
        });
    };

    FuncConfig.prototype.resetConfig = function() {
        var content = this.config;
        var configEl = this.modal.get("content");
        configEl.find(".scf-js-community-function-title").val(content.title);
        configEl.find(".scf-js-community-function-url").val(content.url);
        this.$el.find(".scf-is-func-title").text(content.title);
        var that = this;
        _.each(this.config.configuration, function(config) {
            var configSelector = "[data-config-id=\"" + config.id + "\"]";
            var configListEl = configEl.find(configSelector);
            var inputType = configListEl.attr("type");
            if (inputType === "checkbox") {
                var $tn = $(that.getElementFromModal(
                    ".scf-js-community-function-tagNamespaces"));
                if (config.value === "true" || config.value === true) {
                    configListEl.prop("checked", true);
                    $tn.addClass("scf-is-hidden");
                    // handle case of allowPrivilegedMembers checkbox:
                    // its state needs to be synced with displaying or hiding group selector
                    if (config.id === "allowPrivilegedMembers") {
                        that.getElementFromModal(".console-js-grouplist").removeClass(
                            "scf-is-hidden");
                    }
                } else {
                    configListEl.prop("checked", false);
                    $tn.removeClass("scf-is-hidden");
                    if (config.id === "allowPrivilegedMembers") {
                        that.getElementFromModal(".console-js-grouplist").addClass(
                            "scf-is-hidden");
                    }
                }
            } else if (inputType === "coral-select" || inputType === "select") {
                configListEl.data("select").setValue(config.value);
            }
        });

    };

    FuncConfig.prototype.saveConfig = function() {
        var configEl = this.modal.get("content");
        this.config.title = configEl.find(".scf-js-community-function-title").val();
        this.config.url = configEl.find(".scf-js-community-function-url").val();
        if (_.isEmpty(this.config.url)) {
            configEl.find(".scf-js-community-function-url").attr({
                "required": true
            }).attr({
                "placeholder": CQ.I18n.get("Required")
            });
            return;
        }
        this.$el.find(".scf-is-func-title").text(this.config.title);
        this.config.configuration = [];
        var that = this;
        var configs = configEl.find("[data-config-id]");
        var selectAllNamespacesEl = this.getElementFromModal("[data-config-id=\"selectAllNamespaces\"]");
        configs.each(function(i, inputEl) {
            var $inputEl = $(inputEl);
            var conf = {};
            conf.id = $inputEl.data("config-id");
            var inputType = $inputEl.attr("type");
            if (_.isUndefined(inputType)) {
                inputType = "coral-" + $inputEl.data("init");
            }
            conf.value = $inputEl.val();
            if (inputType === "checkbox") {
                conf.value = $inputEl.is(":checked") ? true : false;
                if ($inputEl.attr("id") && $inputEl.attr("id") === selectAllNamespacesEl.attr("id")) {
                    var confAllNamespaces = {};
                    confAllNamespaces.id = "tagNamespaces";
                    confAllNamespaces.value = [];
                    if (selectAllNamespacesEl.is(":checked")) {
                        confAllNamespaces.value.push("all-namespaces");
                    }
                    that.config.configuration.push(confAllNamespaces);
                }
            } else if (inputType === "coral-select") {
                if (selectAllNamespacesEl.is(":checked")) {
                    conf.id = "tagNamespaces";
                    conf.value = [];
                    conf.value.push("all-namespaces");
                } else {
                    conf.value = getCoralSelectValue($inputEl);
                }
            } else if (inputType === "autocomplete") {
                conf.value = $inputEl.get(0).values;
                var allowPrivilegedUsers = that.getElementFromModal(
                    "[data-config-id=\"allowPrivilegedMembers\"]").is(":checked");
                if (conf.id === "cq:privilegedMembers" && !allowPrivilegedUsers) {
                    conf.value = [];
                }
            }
            that.config.configuration.push(conf);
        });
        if (!this.isNew && this.parent.trackChanges) {
            this.hasChanged = true;
        }
        this.modal.hide();
    };

    FuncConfig.prototype.getElementFromModal = function(selector) {
        if (this.modal) {
            return this.modal.get("element").find(selector);
        }
    };

    FuncConfig.prototype.addListenertoUserListSelect = function(allowUsers) {
        var groupListEl = this.getElementFromModal(".console-js-grouplist");
        var groupListURL = "/libs/social/console/content/content/userlist.social.0.20.json";
        groupListURL = CQ.shared.HTTP.addParameter(groupListURL, "fromPublisher", true);
        groupListURL = CQ.shared.HTTP.addParameter(groupListURL, "_charset_", "utf-8");
        if (allowUsers === false) {
            groupListURL = CQ.shared.HTTP.addParameter(groupListURL, "type", "groups");
        }
        SCFConsole.userList.loadData(groupListEl.get(0), groupListURL, {});
        var userListEl = this.getElementFromModal("[data-config-id=\"allowPrivilegedMembers\"]");
        if (userListEl && userListEl.is(":checked")) {
            groupListEl.removeClass("scf-is-hidden");
        } else {
            groupListEl.addClass("scf-is-hidden");
        }

    };

    FuncConfig.prototype.mutallyLockAllNamespacesAndOthersNS = function() {
        var $an = $(this.getElementFromModal("[data-config-id=\"selectAllNamespaces\"]"));
        var $tn = $(this.getElementFromModal(".scf-js-community-function-tagNamespaces"));
        var isAllNamespacesSelected = $an.data("default");
        if (_.isUndefined(isAllNamespacesSelected) || isAllNamespacesSelected) {
            $an.prop("checked", true);
            $tn.addClass("scf-is-hidden");
        } else {
            $an.prop("checked", false);
            $tn.removeClass("scf-is-hidden");
        }
        $an.on("change", function() {
            if ($an.is(":checked")) {
                $tn.addClass("scf-is-hidden");
            } else {
                $tn.removeClass("scf-is-hidden");
            }
        });
    };

    FuncConfig.prototype.initCoralInputs = function(listItem) {
        this.mutallyLockAllNamespacesAndOthersNS();
        var inputs = listItem.find(".scf-js-function-config-def");
        var that = this;
        inputs.each(function(i, el) {
            var $el = $(el);
            var type = $el.data("type");
            var allowUsers = typeof $el.data("allow-users") !== 'undefined' ? $el.data(
                "allow-users") : false;
            var defaultVal = $el.data("default");
            var id = $el.data("config-id");
            var label = $el.data("label");
            var context = {};
            var html = null;
            context.id = id;
            context.label = label;
            if (type === "checkbox") {
                if (defaultVal === true) {
                    context.isChecked = "checked";
                }
                html = $(checkboxTemplateC(context));
                $el.replaceWith(html);
            } else if (type === "select") {
                var options = [];
                $el.find("option").each(function(i, opt) {
                    var option = {};
                    option.value = $(opt).val();
                    option.display = $(opt).text();
                    options.push(option);
                });
                html = $(selectTemplateC(context));
                $el.replaceWith(html);
                var list = new CUI.Select({
                    element: $el
                });
                list.addOption(options);
            } else if (type === "userlist") {
                //get userlist component template
                that.hasUserList = true;
                var userListTemplateC = getUserListTemplate();
                html = $CQ(userListTemplateC(context));
                var textBox = html.find("input.scf-js-console-userlist-textbox");
                textBox.removeClass("scf-js-console-userlist-textbox").addClass(
                    "console-js-grouplist-textbox");
                textBox.attr("placeholder", allowUsers === false ?
                    CQ.I18n.get("Search Privileged Users Group") :
                    CQ.I18n.get("Search Privileged Users and Groups"));
                var userListEl = html.find(".scf-js-social-console-userlist");
                userListEl.addClass(
                    "console-js-grouplist scf-community-function-field scf-is-hidden");
                userListEl.attr("data-config-id", "cq:privilegedMembers");
                userListEl.attr("type", "autocomplete");
                that.getElementFromModal("[data-config-id=\"allowPrivilegedMembers\"]").on(
                    "click",
                    function() {
                        var groupListEl = that.getElementFromModal(
                            ".console-js-grouplist");
                        groupListEl.toggleClass("scf-is-hidden");
                        groupListEl.attr("name", "cq:privilegedMembers");
                        that.modal.center();
                    });
                $el.replaceWith(html);
                $el.addClass("scf-community-function-field");
                $el.parent().addClass("console-js-grouplist");
                //add a method
                that.addListenertoUserListSelect(allowUsers);
            }
        });
        listItem.trigger("cui-contentloaded");
    };

    var buildFormAndSubmit = function() {
        var funcElements = $(".scf-js-community-function-list");
        var configSet = funcElements.data("func-config-set");
        var funcConfigs = configSet.getFuncConfigs();

        $("#functions").val(JSON.stringify({
            "functions": funcConfigs
        }));
        $(this).closest("form").submit();
    };

    $(window).load(function() {
        var funcConfigSet = new FuncConfigSet($(".scf-js-community-function-list"));
    });
})(window, document, Granite, Granite.$, SCFConsole);
