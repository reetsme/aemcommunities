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

    $(document).on("click", ".scf-js-quickaction-console-group-publish", function(e) {
        e.preventDefault();

        $("body").prepend("<div id='publishOverlayDiv'></div>");
        $(".scf-publish-group-wait").show();
        var postData = {
            "id": "nobot",
            ":operation": "social:publishCommunityGroup",
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
                $('#publishOverlayDiv').remove();
                $(".scf-publish-group-wait").hide();
                $('.scf-js-grouppublish-success').show().delay(7500).fadeOut();
            },
            error: function() {
                $('#publishOverlayDiv').remove();
                $(".scf-publish-group-wait").hide();
                $('.scf-js-grouppublish-error').show().delay(7500).fadeOut();
            }
        });

        return false;
    });

    $(document).on("click", ".scf-js-quickaction-console-group-export", function(e) {
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
                window.location.href = "/crx/packmgr/download.jsp?_charset_=utf-8&path=" + data.location;
            },
            error: function() {
                $('.scf-js-siteexport-error').show().delay(7500).fadeOut();
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
        $(".scf-publish-group-wait").show();

        var deleteGroupPath = $(".scf-js-confirmation-dialog").find("#deleteGroupPath").val();
        confirmWindow.hide();
        confirmWindow = undefined;
        var postData = {
            ":operation": "social:deleteCommunityGroup"
        };
        $.ajax(Granite.HTTP.getContextPath() + deleteGroupPath + "/configuration.social.json", {
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
                $(".scf-publish-group-wait").hide();
                location.reload(true);
            },
            error: function() {
                $('.scf-js-groupdelete-error').show().delay(7500).fadeOut();
                $('#publishOverlayDiv').remove();
                $(".scf-publish-group-wait").hide();

            }
        });
        return false;
    });

    $(document).on("click", ".scf-js-quickaction-console-group-delete", function(e) {
        e.preventDefault();
        var confirmBox = $(".scf-js-confirmation-dialog");
        $(confirmBox).find("#deleteGroupPath").val($(this).data("path"));
        confirmBox[0].show();
        confirmWindow = confirmBox[0];
        return false;
    });
})(window, document, Granite, Granite.$);
