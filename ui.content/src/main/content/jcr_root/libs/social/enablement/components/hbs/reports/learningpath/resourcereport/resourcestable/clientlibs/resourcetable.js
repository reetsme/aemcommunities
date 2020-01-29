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

    SCF.LOG_LEVEL = 1;

    var LearningPathResourceReportModel = SCF.Model.extend({
        modelName: "LearningPathResourceReportModel",
        loadDataAsync: function() {
            this.url = this.get("pageInfo").urlpattern.replace(".html", ".json").replace(
                    ".10", "." + this.get("totalSize"))
                .replace("${startIndex}", "0");

            this.url = this.url + SCF.Util.getContextPath();
            this.url = CQ.shared.HTTP.addParameter(this.url, "filter", "true");

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

    var LearningPathResourceReportView = SCF.CoralReportingTableView.extend({
        viewName: "LearningPathResourceReportView",
        className: "report-learningpath-resource-table",
        init: function() {
            this.listenTo(this.model, "sync", this.onSync);
            this.model.loadDataAsync();
        },
        onSync: function() {
            this.model.set("localeDateFormat", moment.localeData().longDateFormat("L"), {silent: true});
            this.refreshView();
        }
    });

    SCF.LearningPathResourceReportModel = LearningPathResourceReportModel;
    SCF.LearningPathResourceReportView = LearningPathResourceReportView;

    SCF.registerComponent("social/enablement/components/hbs/reports/learningpath/resourcereport/resourcestable",
        SCF.LearningPathResourceReportModel, SCF.LearningPathResourceReportView);

    $(document).ready(function() {
        $("#learningPath-Resource-Report").attr("download", "learningPath-resource-report.csv");
    });

})(SCF);
