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

    var GroupAssignmentReportTableModel = SCF.Model.extend({
        modelName: "GroupAssignmentReportTableModel"
    });

    var GroupAssignmentReportTableView = SCF.CoralReportingTableView.extend({
        viewName: "GroupAssignmentReportTableView",
        className: "report-groupassignment-table",
        init: function() {
            this.listenTo(this.model, "sync", this.onSync);
        },
        onSync: function() {
            this.refreshView();
        }
    });

    SCF.GroupAssignmentReportTableModel = GroupAssignmentReportTableModel;
    SCF.GroupAssignmentReportTableView = GroupAssignmentReportTableView;

    SCF.registerComponent("social/enablement/components/hbs/reports/groupassignmentreport/table",
        SCF.GroupAssignmentReportTableModel, SCF.GroupAssignmentReportTableView);
})(SCF);
