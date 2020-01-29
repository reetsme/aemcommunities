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

(function(window, document, Granite, $, SCF) {
    "use strict";
    $(document).ready(function() {
        var data = {};
        var unreadcount = 0;
        var contextRoot = CQ.shared.HTTP.getContextPath();
        var communityFunctionsPath = contextRoot + "/content/communities/templates/functions";
        if ($("#scf-js-notificationsUnreadCount").length) {
            var siteurl = $("#scf-js-notificationsUnreadCount").data("siteurl");
            if (siteurl && !SCF.Util.startsWith(siteurl, communityFunctionsPath)) {
                $.ajax({
                    type: "GET",
                    url: siteurl + "/notifications/jcr:content/content/primary/notifications.social.0.0.json",
                    async: true,
                    data: data,
                    success: function(json) {
                        unreadcount = json.unreadCount;
                        $("#scf-js-notificationsUnreadCount").text(unreadcount);
                    }
                });
            }
        }
        // arg1: 1 - single notification is marked as read
        //     : all - mark all as read
        $(document).on("socialNotificationMarkAsRead", function(event, arg1) {
            if (arg1 == "all") {
                unreadcount = 0;
            } else {
                unreadcount = unreadcount - 1;
            }
            $("#scf-js-notificationsUnreadCount").text(unreadcount);
        });
    });
})(window, document, Granite, Granite.$, SCF);
