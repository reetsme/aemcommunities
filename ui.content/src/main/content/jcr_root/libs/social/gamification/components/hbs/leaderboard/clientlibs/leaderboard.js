/*
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2015 Adobe Systems Incorporated
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
(function(SCF) {
    "use strict";

    var LeaderboardModel = SCF.Model.extend({
        modelName: "LeaderboardModel",
        loadDataAsync: function() {
            this.url = this.get("pageInfo").urlpattern.replace(".html", ".json").replace(
                    ".10", "." + this.get("displayLimit"))
                .replace("${startIndex}", "0");

            this.url = this.url + SCF.Util.getContextPath();

            var that = this;

            this.fetch({
                success: function(collection, response) {
                    if (!_.isUndefined(response.items) && response.items.length > 0) {
                        that.set("model", response);
                    }
                }
            });
        }
    });
    var LeaderboardView = SCF.BootstrapReportPaginatedTableView.extend({
        viewName: "LeaderboardView",
        className: "scf-leaderboard",

        init: function() {
            this.collection = this.model.get("items");
            SCF.BootstrapReportPaginatedTableView.prototype.init.apply(this);
            this.listenTo(this.model, "change:pageInfo", this.onPageInfoChange);
            this.model.loadDataAsync();
        },
        paginate: function() {
            var baseURL = SCF.config.urlRoot + this.model.get("id") + SCF.constants.SOCIAL_SELECTOR + ".";
            var parsedOffset = arguments[1];
            var parsedSize = arguments[2];
            var parsedIndexName = (arguments.length <= 3) ? null : arguments[3];
            var url = null;
            if (arguments.length <= 3) {
                url = baseURL + parsedOffset + "." + parsedSize + SCF.constants.JSON_EXT;
            } else {
                url = baseURL + "index." + parsedOffset + "." +
                    parsedSize + "." +
                    (parsedIndexName !== undefined ? parsedIndexName + "." : "") +
                    SCF.constants.JSON_EXT;
            }
            this.model.url = url;
            this.model.reload();
        },
        navigate: function(e) {
            var pageInfo = this.model.get("pageInfo");

            var suffixObj = $(e.currentTarget).data("pageSuffix");
            var suffix = suffixObj.toString();
            var suffixInfo = suffix.split(".");

            if (pageInfo.selectedIndex !== null) {
                this.paginate(pageInfo.basePageURL, suffixInfo[0], suffixInfo[1], pageInfo.selectedIndex);
            } else {
                this.paginate(pageInfo.basePageURL, suffixInfo[0], suffixInfo[1]);
            }
        }
    });

    SCF.LeaderboardModel = LeaderboardModel;
    SCF.LeaderboardView = LeaderboardView;

    SCF.registerComponent("social/gamification/components/hbs/leaderboard",
        SCF.LeaderboardModel, SCF.LeaderboardView);
})(SCF);
