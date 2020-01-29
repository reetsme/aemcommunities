/*************************************************************************
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
 *
 *************************************************************************/
(function(window, document, Granite, $) {
    "use strict";

    var ns = ".assetselection-wiz";
    var destinationPath = [];

    var currURLPath = Granite.HTTP.getPath();
    var index = currURLPath.indexOf(".html");
    currURLPath = currURLPath.substr(0, index) + ".html";
    var windowLocation = window.location.href;
    var nextUrlParam = "?next=";
    index = windowLocation.indexOf(nextUrlParam);
    windowLocation = windowLocation.substr(index + nextUrlParam.length);

    $(document).on("foundation-contentloaded" + ns, function() {

        $(".foundation-collection").addClass("mode-selection");

        $(".foundation-collection-item").each(function() {
            var type = $(this).data("type");
            var itemPath = $(this).data("path");
            if (type !== "asset") {
                $(this).children("a").attr("href", currURLPath + itemPath + nextUrlParam +
                    windowLocation);
            } else {
                $(this).children("a").attr("href", "#");
            }
        });

        $(".foundation-collection-item").click(function(e) {
            var assetType = $(this).data("type");
            if (assetType.toLowerCase() === "directory") {
                e.preventDefault();
                e.stopImmediatePropagation();
                window.location.href = $(this).children("a").attr("href");
            }
        });
    });

    $(document).fipo("tap", "click", ".cancelassetselection", function(e) {
        e.preventDefault();
        window.location.href = windowLocation;
    });

    $(document).fipo("tap", "click", ".addassetselection", function() {
        var collections = $(".cq-damadmin-admin-childpages");
        var selected = collections.find(".foundation-selections-item");
        if (selected.length === 0) {
            return;
        }

        selected.each(function() {
            destinationPath.push($(this).data("path"));
        });
        var destinationPathStr = "?";
        for (var i = 0; i < destinationPath.length; i++) {
            destinationPathStr += "asset=" + destinationPath[i] + "&";
        }
        destinationPathStr = destinationPathStr.substr(0, destinationPathStr.length - 1);
        window.location.href = windowLocation + destinationPathStr;
    });

})(window, document, Granite, Granite.$);
