/*
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2012 Adobe Systems Incorporated
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
var SCFValidatorItem = function(element, batch_processing) {
    var _self = this;
    this.element = element;
    var _config = $(this.element).data("scf-validator");

    if (baseRules[_config.validation] !== null) {
        this.validation = baseRules[_config.validation].regexp;
        this.message = baseRules[_config.validation].text;
    } else {
        this.validation = baseRules["default"].regexp;
        this.message = baseRules["default"].text;
    }

    this.callbacks = {
        init: null,
        success: null,
        error: null,
        complete: null
    };

    this.evt = "change";
    this.resetevt = "focus";
    this.notification = "highlight";
    this.notification_str = "";
    this.error_element = null;
    this.anchor_element = null; //Anchor Element is used to attach error/info message to. By default AE is the element, message will be attached next to it
    this.error_css = null;

    if (typeof(_config.evt) !== "undefined") {
        this.evt = _config.evt;
    }
    if (typeof(_config.resetevt) !== "undefined") {
        this.resetevt = _config.resetevt;
    }
    if (typeof(_config.notification) !== "undefined") {
        this.notification = _config.notification;
    }
    //new callbacks impl
    if (typeof(_config.callbacks) !== "undefined" && typeof(_config.callbacks) === "object") {
        this.callbacks = _config.callbacks;
    }
    //calback on init
    if (this.callbacks.init !== null) {
        window[this.callbacks.init].call();
    }
    if (typeof(this.notification) === "object") {
        this.anchor_element = $("#" + this.notification.anchor); // TODO check for string/oject, then use obj or add $()
        this.error_css = this.notification.css;
        this.notification_str = "custom";
    } else {
        this.anchor_element = this.element;
        this.notification_str = this.notification;
        this.error_css = "scf-validation-highlight-error";
    }
    $(this.element).on(_self.resetevt, function() {
        _self.reset();
    });
    if (batch_processing === false) {
        $(this.element).on(_self.evt, function() {
            if (_self.validate()) {
                if (_self.callbacks.success !== null) {
                    window[_self.callbacks.success].call();
                }
            } else {
                if (_self.callbacks.error !== null) {
                    window[_self.callbacks.error].call();
                }
            }
            if (_self.callbacks.complete !== null) {
                window[_self.callbacks.complete].call();
            }
        });
    }
    return this;
};
SCFValidatorItem.prototype.validate = function() {
    if ($(this.element).hasClass(this.error_css)) {
        this.reset();
    }
    var _value = $(this.element).val();
    var _patt = new RegExp(this.validation);
    if (_patt.test(_value)) {
        return true;
    }
    $(this.element).addClass(this.error_css);
    this.error_element = $('<div class="alert alert-danger">' + this.message + '</div>');

    switch (this.notification_str) {
        case "highlight":
            $(this.error_element).insertAfter($(this.anchor_element));
            break;
        case "popup":
            alert(this.message);
            break;
        case "custom":
            $(this.error_element).appendTo($(this.anchor_element));
            break;
        default:
            alert("Validation error message");
    }
    return false;
};
SCFValidatorItem.prototype.reset = function() {
    $(this.element).removeClass(this.error_css);
    if (this.error_element !== null) {
        $(this.error_element).remove();
    }
};
