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
    var GroupAssignmentReportModel = SCF.GroupAssignmentReportTableModel.extend({
        modelName: "GroupAssignmentReportModel",
        generate: function() {
            var url = this.get("pageInfo").urlpattern.replace(".html", ".json").replace(
                "${startIndex}", "0");
            url = CQ.shared.HTTP.addParameter(url, "filter", "true");
            url = CQ.shared.HTTP.addParameter(url, "groupId", this.groupId);
            url = CQ.shared.HTTP.addParameter(url, "resourceId", this.resourceId);
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

    var GroupAssignmentReportView = SCF.CommunitiesReportView.extend({
        viewName: "GroupAssignmentReportView",
        className: "report-groupassignment",
        init: function() {
            SCF.CommunitiesReportView.prototype.init.apply(this);
            SCF.Util.listenTo("generateGroupAssignmentReport", $.proxy(this.onReportGenerateEvent,
                this));
        },
        drawSummary: function() {
            this.$el.find(".scf-js-report-metadata").text(this.reportMetaData);
            this.$el.find(".scf-js-report-title").text(this.reportTitle);
            this.$el.find(".scf-js-total-assigned-summary").text(CQ.I18n.get("Total Assignees: ") +
                this.model.get("assignedUsersCount") + "/" + this.model.get("totalSize"));
            this.$el.find(".scf-js-completed-summary").text(CQ.I18n.get("Completed: ") +
                this.model.get("completedUsersCount") + "/" + this.model.get("assignedUsersCount"));
            this.$el.find(".scf-js-average-score-summary").text(CQ.I18n.get("Average Score: ") +
                this.model.get("averageScore") + "%");
            this.$el.find(".scf-js-not-started-summary").text(CQ.I18n.get("Not Started: ") +
                this.model.get("notStartedUsersCount"));
            this.$el.find(".scf-js-in-progress-summary").text(CQ.I18n.get("In Progress: ") +
                this.model.get("inProgressUsersCount"));
        },
        setReportMetaData: function(event) {
            moment.locale(CQ.shared.I18n.getLocale());
            this.reportMetaData = CQ.I18n.get("Site: ") + event.siteTitle + " | " + CQ.I18n.get("Group: ") +
                event.groupName + " | " + CQ.I18n.get("Assignment: ") + event.resourceName;
            this.reportTitle = CQ.I18n.get("Group Assignment Report: ") +
                moment().format(CQ.I18n.get("MMMM Do, YYYY", null, "Moment.js date format"));
            this.model.groupId = event.groupId;
            this.model.resourceId = event.resourceId;
        },
        downloadCSV: function() {
            var url = this.model.id + ".csv";
            url = CQ.shared.HTTP.addParameter(url, "groupId", this.model.groupId);
            url = CQ.shared.HTTP.addParameter(url, "resourceId", this.model.resourceId);
            url = CQ.shared.HTTP.addParameter(url, "filter", "true");
            window.open(url, "_self");
        }
    });

    SCF.GroupAssignmentReportModel = GroupAssignmentReportModel;
    SCF.GroupAssignmentReportView = GroupAssignmentReportView;

    SCF.registerComponent("social/enablement/components/hbs/reports/groupassignmentreport",
        SCF.GroupAssignmentReportModel, SCF.GroupAssignmentReportView);
})(SCF);
