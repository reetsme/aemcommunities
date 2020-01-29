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
        title: CQ.I18n.get("Resources by Average Star Rating"),
        parse: function(response) {
            if (response.data !== null) {
                var captionVars = [];
                captionVars.push(response.totalRatedCount);
                captionVars.push(response.percentRated);
                captionVars.push(response.totalUnratedCount);
                captionVars.push(response.percentUnrated);
                captionVars.push(response.average);
                this.captionVars = captionVars;
            }
            return response;
        },
        formUrl: function() {
            return SCF.config.urlRoot + this.get("id") + SCF.constants.URL_EXT + SCF.Util.getContextPath();
        }
    });
    var RatingsReportView = SCF.DVBarChartView.extend({
        viewName: "RatingsReportView",
        className: "ratings-report",
        caption: "{0}" + CQ.I18n.get(" Rated ") + "({1}) | {2}" + CQ.I18n.get(" Unrated ") +
            "({3}) | " +
            CQ.I18n.get("Aggregate average: ") + "{4}"
    });

    SCF.RatingsReport = RatingsReport;
    SCF.RatingsReportView = RatingsReportView;

    SCF.registerComponent("social/enablement/components/hbs/reports/site/ratingsreport",
        SCF.RatingsReport, SCF.RatingsReportView);

})(CQ, SCF);
