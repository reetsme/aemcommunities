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

    var segmentLabels = [CQ.I18n.get("Views"), CQ.I18n.get("Plays"), CQ.I18n.get("Ratings"), CQ.I18n.get(
        "Comments")];

    var inspectorLabelFunc = function(d) {
        var format = SCF.DVChartView.d3.time.format("%B %e, %Y");
        return format(d);
    };

    var TrendSummaryReport = SCF.DVTrendLineChartModel.extend({
        modelName: "TrendSummaryReportModel",
        title: CQ.I18n.get("Timeline")
    });

    var TrendSummaryReportView = SCF.DVTrendLineChartView.extend({
        viewName: "TrendSummaryReportView",
        className: "trend-summary-report",
        segmentLabels: segmentLabels,
        inspectorLabelFunc: inspectorLabelFunc
    });

    SCF.TrendSummaryReport = TrendSummaryReport;
    SCF.TrendSummaryReportView = TrendSummaryReportView;

    SCF.registerComponent("social/enablement/components/hbs/reports/resource/trendsummaryreport",
        SCF.TrendSummaryReport, SCF.TrendSummaryReportView);

})(CQ, SCF);
