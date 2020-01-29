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

var SCFValidator = function(context, flag) {
    var _self = this;
    this.items = [];
    if (context !== null) {
        this.context = context;
    } else {
        this.context = $(document.body);
    }
    this.batch_processing = false;
    var _batchProcessing = $(this.context).attr("data-scf-validator-batch-processing");
    if (typeof(_batchProcessing) !== "undefined" && _batchProcessing === "true") {
        this.batch_processing = true;
    }

    this.elements = $('[data-scf-validator]');
    $.each(this.elements, function(key, value) {
        if ($($(value).closest("form")).is(_self.context)) {
            _self.items.push(new SCFValidatorItem(value, _self.batch_processing));
        }
    });
};
SCFValidator.prototype.validate = function() {
    var _elements = [];
    $.each(this.items, function(key, value) {
        _elements.push(value.validate());
    });
    var _passed = function(el, index, array) {
        return el === true;
    };
    return _elements.every(_passed);
};
SCFValidator.prototype.reset = function() {
    $.each(this.items, function(key, value) {
        value.reset();
    });
};
