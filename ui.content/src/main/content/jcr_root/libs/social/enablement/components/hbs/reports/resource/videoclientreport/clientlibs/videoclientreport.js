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

    var VideoClientReport = SCF.DVChartModel.extend({
        modelName: "VideoClientReportModel",
        title: CQ.I18n.get("Engagement by Device")
    });
    var VideoClientReportView = SCF.DVDonutChartView.extend({
        viewName: "VideoClientReportView",
        className: "video-client-report",
        centerLabel: CQ.I18n.get("views")
    });

    SCF.VideoClientReport = VideoClientReport;
    SCF.VideoClientReportView = VideoClientReportView;

    SCF.registerComponent("social/enablement/components/hbs/reports/resource/videoclientreport",
        SCF.VideoClientReport, SCF.VideoClientReportView);

})(CQ, SCF);
