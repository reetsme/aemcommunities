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

    var UserAssignmentReportTableModel = SCF.Model.extend({
        modelName: "UserAssignmentReportTableModel"
    });

    var UserAssignmentReportTableView = SCF.CoralReportingTableView.extend({
        viewName: "UserAssignmentReportTableView",
        className: "report-userassignment-table",
        init: function() {
            this.listenTo(this.model, "sync", this.onSync);
        },
        onSync: function() {
            this.model.set("localeDateFormat", moment.localeData().longDateFormat("L"), {silent: true});
            this.refreshView();
        }
    });

    SCF.UserAssignmentReportTableModel = UserAssignmentReportTableModel;
    SCF.UserAssignmentReportTableView = UserAssignmentReportTableView;

    SCF.registerComponent("social/enablement/components/hbs/reports/userassignmentreport/table",
        SCF.UserAssignmentReportTableModel, SCF.UserAssignmentReportTableView);
})(SCF);
