/*
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2013 Adobe Systems Incorporated
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
(function(CQ, SCF) {
    "use strict";

    var EnrollmentStatusReport = SCF.DVChartModel.extend({
        modelName: "EnrollmentStatusReportModel",
        title: CQ.I18n.get("Assignee Status")
    });
    var EnrollmentStatusReportView = SCF.DVDonutChartView.extend({
        viewName: "EnrollmentStatusReportView",
        className: "enrollment-status-report",
        centerLabel: CQ.I18n.get("assignments")
    });

    SCF.EnrollmentStatusReport = EnrollmentStatusReport;
    SCF.EnrollmentStatusReportView = EnrollmentStatusReportView;

    SCF.registerComponent(
        "social/enablement/components/hbs/reports/resource/enrollmentstatusreport",
        SCF.EnrollmentStatusReport, SCF.EnrollmentStatusReportView);

})(CQ, SCF);
