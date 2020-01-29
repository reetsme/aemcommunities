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

    var RatingsReport = SCF.DVChartModel.extend({
        title: CQ.I18n.get("Ratings"),
        parse: function(response) {
            if (response.data !== null) {
                var captionVars = [];
                captionVars.push(response.totalRatingCount);
                captionVars.push(response.average);
                this.captionVars = captionVars;
            }
            return response;
        }
    });
    var RatingsReportView = SCF.DVBarChartView.extend({
        viewName: "RatingsReportView",
        className: "ratings-report",
        caption: CQ.I18n.get("Total ratings: ") + "{0} | " + CQ.I18n.get("Average: ") + "{1}"
    });

    SCF.RatingsReport = RatingsReport;
    SCF.RatingsReportView = RatingsReportView;

    SCF.registerComponent("social/enablement/components/hbs/reports/resource/ratingsreport",
        SCF.RatingsReport, SCF.RatingsReportView);

})(CQ, SCF);
