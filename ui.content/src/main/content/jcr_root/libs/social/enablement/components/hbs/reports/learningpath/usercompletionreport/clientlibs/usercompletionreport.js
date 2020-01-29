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
(function(SCF) {
    "use strict";

    SCF.LOG_LEVEL = 1;

    var LearningPathUserCompletionReportModel = SCF.Model.extend({
        modelName: "LearningPathUserCompletionReportModel",
        loadDataAsync: function() {
            this.url = this.get("pageInfo").urlpattern.replace(".html", ".json").replace(
                ".10", "." + this.get("totalSize")).replace("${startIndex}", "0");
            this.url = this.url + "?filter=true";
            var that = this;
            this.fetch({
                success: function(collection, response) {
                    if (!_.isUndefined(response.items)) {
                        that.set("model", response);
                    }
                }
            });
        }
    });

    var LearningPathUserCompletionReportView = SCF.View.extend({
        viewName: "LearningPathUserCompletionReportView",
        className: "report-learningpath-user-completion-report",
        init: function() {
            this.listenTo(this.model, "sync", this.onSync);
            this.model.loadDataAsync();
        },
        sortByDateDescending: function() {
            var items = this.model.get("items");
            items = _.sortBy(items, function(lp) {
                var m = moment(lp.completeDate, "MM/DD/YY");
                return 0 - m.valueOf();
            });
            this.model.set("items", items);
        },
        onSync: function() {
            this.sortByDateDescending();
            this.model.set("localeDateFormat", moment.localeData().longDateFormat("L"), {silent: true});
            this.render();
        }
    });

    SCF.LearningPathUserCompletionReportModel = LearningPathUserCompletionReportModel;
    SCF.LearningPathUserCompletionReportView = LearningPathUserCompletionReportView;

    SCF.registerComponent("social/enablement/components/hbs/reports/learningpath/usercompletionreport",
        SCF.LearningPathUserCompletionReportModel, SCF.LearningPathUserCompletionReportView);
})(SCF);
