/*
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2016 Adobe Systems Incorporated
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

(function(window, document, $, shared, ns) {
    "use strict";
    // Update link when touch dialog is displayed
    $(document).on("dialog-ready", function(e) {
        var $document = $(document);
        var $dialog = $document.find(".cq-social-livefyre-touch-coll-meta").closest(".cq-dialog");
        var $collurl = $dialog.find(".scf-js-lf-collectionLink");
        var dragCompAttr = $(".is-selected.is-active").attr("data-path");
        var dialogAction = dragCompAttr.replace("jcr:content", "_jcr_content");
        shared.updateCollectionLink(dialogAction, $collurl);
        var filterFloat = function(value) {
            if (/^(\-|\+)?([0-9]+(\.[0-9]+)?|Infinity)$/.test(value)) {
                return Number(value);
            }
            return NaN;
        };
        $.validator.register({
            selector: "[name='./latitude']",
            validate: function(el) {
                var latitude = filterFloat(el.val());
                $(".cq-dialog-submit").removeAttr("disabled");
                if (isNaN(latitude) || latitude < -90 || latitude > 90) {
                    $(".cq-dialog-submit").attr("disabled", true);
                    return "Must be a float between -90.0 and 90.0";
                }
            }
        });
        $.validator.register({
            selector: "[name='./longitude']",
            validate: function(el) {
                var latitude = filterFloat(el.val());
                $(".cq-dialog-submit").removeAttr("disabled");
                if (isNaN(latitude) || latitude < -180 || latitude > 180) {
                    $(".cq-dialog-submit").attr("disabled", true);
                    return "Must be a float between -180.0 and 180.0";
                }
            }
        });
    });

    // Update form data
    $(document).on("click", ".cq-dialog-submit", function(e) {
        e.preventDefault();
        e.stopPropagation();

        var $form = $(this).closest("form.foundation-form");
        if ($form) {
            $form.submit();
        } else {
            ns.ui.helpers.prompt({
                title: Granite.I18n.get("Invalid Input"),
                message: "Please check your app configuration settings",
                actions: [{
                    id: "CANCEL",
                    text: "CANCEL",
                    className: "coral-Button"
                }],
                callback: function(actionId) {
                    if (actionId === "CANCEL") {
                        console.log(actionId);
                    }
                }
            });
        }

    });
})(window, document, Granite.$, window.LivefyreAuthoringComponents.shared, Granite.author);
