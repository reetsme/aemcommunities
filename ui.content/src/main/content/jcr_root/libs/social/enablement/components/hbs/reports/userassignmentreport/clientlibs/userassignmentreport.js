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
    var UserAssignmentReportModel = SCF.UserAssignmentReportTableModel.extend({
        modelName: "UserAssignmentReportModel",
        generate: function() {
            var url = this.get("pageInfo").urlpattern.replace(".html", ".json").replace(
                "${startIndex}", "0");
            url = CQ.shared.HTTP.addParameter(url, "filter", "true");
            url = CQ.shared.HTTP.addParameter(url, "user", this.userId);
            url = CQ.shared.HTTP.addParameter(url, "sitePath", this.sitePath);
            this.url = url;

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

    var UserAssignmentReportView = SCF.CommunitiesReportView.extend({
        viewName: "UserAssignmentReportView",
        className: "report-userassignment",
        init: function() {
            SCF.CommunitiesReportView.prototype.init.apply(this);
            SCF.Util.listenTo("generateUserAssignmentReport", $.proxy(this.onReportGenerateEvent,
                this));
        },
        drawSummary: function() {
            this.$el.find(".scf-js-report-metadata").text(this.reportMetaData);
            this.$el.find(".scf-js-report-title").text(this.reportTitle);
        },
        setReportMetaData: function(event) {
            moment.locale(CQ.shared.I18n.getLocale());
            this.reportMetaData = event.userName + CQ.I18n.get(" Assignments");
            this.reportTitle = event.siteTitle + ": " +
                moment().format(CQ.I18n.get("MMMM Do, YYYY", null, "Moment.js date format"));
            this.model.userId = event.userId;
            this.model.sitePath = event.sitePath;
        },
        downloadCSV: function() {
            var url = this.model.id + ".csv";
            url = CQ.shared.HTTP.addParameter(url, "user", this.model.userId);
            url = CQ.shared.HTTP.addParameter(url, "sitePath", this.model.sitePath);
            url = CQ.shared.HTTP.addParameter(url, "filter", "true");
            window.open(url, "_self");
        }
    });

    SCF.UserAssignmentReportModel = UserAssignmentReportModel;
    SCF.UserAssignmentReportView = UserAssignmentReportView;

    SCF.registerComponent("social/enablement/components/hbs/reports/userassignmentreport",
        SCF.UserAssignmentReportModel, SCF.UserAssignmentReportView);
})(SCF);
