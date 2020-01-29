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

(function(window, document, Granite, $) {
    "use strict";

    $(document).ready(function() {
        var controlSaveButton = function() {
            var urlVal = _.isEmpty($(".scf-js-social-console-siteurl").val());
            var title = _.isEmpty($(".scf-js-social-console-title").val());
            if (!urlVal && !title) {
                $(".scf-js-community-function-modal-save").prop("disabled", false);
            } else {
                $(".scf-js-community-function-modal-save").prop("disabled", true);
            }
        };
        controlSaveButton();
        /*
            Listen to validation failure (foundation-validation-invalid) event
            for cases where the URL field does not satisfy the jcr:name constraints
        */
        $(document).on("foundation-validation-invalid", function() {
            $(".scf-js-community-function-modal-save").prop("disabled", true);
        });
        $(document).on("foundation-validation-valid", function() {
            $(".scf-js-community-function-modal-save").prop("disabled", false);
        });
    });

})(window, document, Granite, Granite.$);
