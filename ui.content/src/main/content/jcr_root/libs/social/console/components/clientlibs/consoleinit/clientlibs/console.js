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
    var modal = "#create-tenant-modal";
    var wcmOpenHelper;
    $(document).on("beforeshow", modal, function() {
        // hide "Create" popover
        $(".coral-Popover:visible").popover("hide");
        // reset form (textfields and checkboxes)
        $(".coral-Textfield", modal).each(function() {
            $(this).val("");
        });
        $(".coral-Checkbox-input", modal).each(function() {
            $(this).prop("checked", $(this).attr("checked") === "checked");
        });
    });

    var fixFalseyCheckboxes = function(e) {
        var checkbox = $(e.target);
        var attribue = checkbox.attr("name");
        var checked = checkbox.is(":checked");
        var paramAttr = checkbox.attr("data-param");
        var inputTag = checkbox.siblings("input[name=" + paramAttr + "]")[0];
        $(inputTag).val(checked);
    };

    if ($(window).adaptTo && typeof $(window).adaptTo === "function") {
        wcmOpenHelper = $(window).adaptTo("foundation-registry").get("foundation.collection.action.action").filter(
            function(obj, idx) {
                if (obj.name == "cq.wcm.open") {
                    return obj;
                }
            });
    }

    if (wcmOpenHelper !== undefined && wcmOpenHelper.length >= 1) {
        wcmOpenHelper = wcmOpenHelper[0];
    }
    var editPageWCMHelper = function(event) {
        event.preventDefault();
        var $target = $(event.currentTarget);
        var loc = $target.data("foundation-collection-item-id");
        var contextRoot = CQ.shared.HTTP.getContextPath();
        var config = {
            "data": {
                "cookiePath": contextRoot + "/",
                "href": contextRoot + "/bin/wcmcommand?cmd=open&_charset_=utf-8&path=" + loc
            }
        };
        if (wcmOpenHelper !== undefined) {
            wcmOpenHelper.handler(null, null, config, null, $.makeArray($target));
        }
    };

    $CQ(document).ready(function() {
        $(".scf-js-edit-page[data-foundation-collection-item-id]").click(editPageWCMHelper);
        $("input[type='checkbox'].scf-js-fix-checks").on("change", fixFalseyCheckboxes);
    });
    var SCFConsole = {};
    window.SCFConsole = SCFConsole;
})(window, document, Granite, Granite.$);
