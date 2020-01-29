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
    var confirmWindow = null;

    $(document).ready(function(e) {
        if ($("#granite-collection-breadcrumbs-toggle betty-breadcrumbs-item").length > 1) {
            $(".scf-js-create-site-btn").hide();
        } else {
            $(".scf-js-create-site-btn").show();
        }
    });

    $(document).on("click", ".scf-js-quickaction-console-site-publish", function(e) {
        e.preventDefault();

        $("body").prepend("<div id='publishOverlayDiv'></div>");
        $(".scf-publish-site-wait").show();
        var postData = {
            "id": "nobot",
            ":operation": "social:publishSite",
            "nestedActivation": false,
            "path": $(this).data("path")
        };
        $.ajax(this.baseURI, {
            dataType: "json",
            type: "POST",
            processData: true,
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
            xhrFields: {
                withCredentials: true
            },
            data: postData,
            success: function() {
                $('.scf-js-sitepublish-success').show().delay(7500).fadeOut();
                $('#publishOverlayDiv').remove();
                $(".scf-publish-site-wait").hide();
            },
            error: function() {
                $('.scf-js-sitepublish-error').show().delay(7500).fadeOut();
                $('#publishOverlayDiv').remove();
                $(".scf-publish-site-wait").hide();
            }
        });

        return false;
    });

    $(document).on("click", ".scf-js-confirmation-dialog #deleteCancelBtn", function(e) {
        e.stopPropagation();
        confirmWindow.hide();
        confirmWindow = undefined;
        return false;
    });

    $(document).on("click", ".scf-js-confirmation-dialog #deleteOkBtn", function(e) {
        e.stopPropagation();
        $("body").prepend("<div id='publishOverlayDiv'></div>");
        $(".scf-publish-site-wait").show();

        var deleteSitePath = $(".scf-js-confirmation-dialog").find("#deleteSitePath").val();
        var ignoreAssets = $(".scf-js-confirmation-dialog").find("#deleteIgnoreAssets")[0].checked;
        confirmWindow.hide();
        confirmWindow = undefined;

        var postData = {
            ":operation": "social:deleteSite",
            "ignoreAssets": ignoreAssets
        };

        $.ajax(Granite.HTTP.getContextPath() + deleteSitePath + "/configuration.social.json", {
            dataType: "json",
            type: "POST",
            processData: true,
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
            xhrFields: {
                withCredentials: true
            },
            data: postData,
            success: function() {
                $('#publishOverlayDiv').remove();
                $(".scf-publish-site-wait").hide();
                location.href = Granite.HTTP.getContextPath() + "/communities/sites.html";
            },
            error: function() {
                $('.scf-js-sitedelete-error').show().delay(7500).fadeOut();
                $('#publishOverlayDiv').remove();
                $(".scf-publish-site-wait").hide();
            }
        });

        return false;
    });

    $(document).on("click", ".scf-js-quickaction-console-site-delete", function(e) {
        e.preventDefault();
        var confirmBox = $(".scf-js-confirmation-dialog");
        $(confirmBox).find("#deleteSitePath").val($(this).data("path"));
        confirmBox[0].show();
        confirmWindow = confirmBox[0];
        return false;
    });

    $(document).on("click", ".scf-js-quickaction-console-site-export", function(e) {
        e.preventDefault();

        var postData = {
            "id": "nobot",
            ":operation": "social:exportSite",
            "path": $(this).data("path")
        };
        $.ajax(this.baseURI, {
            dataType: "json",
            type: "POST",
            processData: true,
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
            xhrFields: {
                withCredentials: true
            },
            data: postData,
            success: function(data) {
                $('.scf-js-siteexport-success').show().delay(7500).fadeOut();
                var packLocation = data.location.replace(Granite.HTTP.getContextPath(), "");
                window.location.href = Granite.HTTP.getContextPath() +
                "/crx/packmgr/download.jsp?_charset_=utf-8&path=" + packLocation;
            },
            error: function() {
                $('.scf-js-siteexport-error').show().delay(7500).fadeOut();
            }
        });

        return false;
    });
})(window, document, Granite, Granite.$);
