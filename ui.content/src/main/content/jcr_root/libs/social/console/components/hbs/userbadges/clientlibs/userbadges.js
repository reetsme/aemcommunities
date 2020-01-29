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

(function($CQ, _, Backbone, SCF) {
    "use strict";
    var UserBadges = SCF.Model.extend({
        modelName: "UserBadgesModel",
        initialize: function() {}
    });

    var UserBadgesView = SCF.View.extend({
        viewName: "UserBadges",
        init: function() {
            var topAssigned = $(".scf-js-user-profile-top-assigned-badge");
            var topEarned = $(".scf-js-user-profile-top-earned-badge");
            topAssigned.each(function(idx, element) {
                if (idx > 2) {
                    $(element).hide();
                }
            });

            topEarned.each(function(idx, element) {
                if (idx > 2) {
                    $(element).hide();
                }
            });

            if (topEarned.length && topEarned.length > 3) {
                $(".scf-js-user-profile-top-earned-badge-count").text("(+" + (topEarned.length - 3) + ")");
            }

            if (topAssigned.length && topAssigned.length > 3) {
                $(".scf-js-user-profile-top-assigned-badge-count").text("(+" + (topAssigned.length - 3) + ")");
            }
        },

        selectBadges: function(e) {
            $(".scf-js-user-profile-badges-list").hide();
            if ($(e.currentTarget).data("type") === "") {
                $(".scf-js-user-profile-badges-list").show();
            } else {
                $("#" + $(e.currentTarget).data("type")).show();
            }
            $(".scf-js-badges-select-label").text($(e.currentTarget).text());
        }
    });

    SCF.UserBadges = UserBadges;
    SCF.UserBadgesView = UserBadgesView;
    SCF.registerComponent("social/console/components/hbs/userbadges", SCF.UserBadges, SCF.UserBadgesView);

})($CQ, _, Backbone, SCF);
