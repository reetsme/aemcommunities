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

    var segmentLabels = [CQ.I18n.get("Viewers")];

    var inspectorLabelFunc = function(d, i) {

        var format = SCF.DVChartView.d3.time.format("%M:%S");
        if (i === 0) {
            return CQ.I18n.get("Start");
        } else if (i === this.model.x.length - 1) {
            return CQ.I18n.get("Complete");
        } else {
            return format(d);
        }
    };

    var VideoDropoffReport = SCF.DVChartModel.extend({
        modelName: "VideoDropoffReportModel",
        title: CQ.I18n.get("Viewer Engagement"),
        parse: function(response) {
            if (response.analyticsInitialized && response.data !== null) {
                response.data.x = _.map(_.clone(
                        response.data.x),
                    function(d) {
                        return new Date(d);
                    });
            }
            return response;
        }
    });

    var VideoDropoffReportView = SCF.DVTrendLineChartView.extend({
        viewName: "VideoDropoffReportView",
        className: "video-dropoff-report",
        segmentLabels: segmentLabels,
        inspectorLabelFunc: inspectorLabelFunc,
        render: function() {
            SCF.DVTrendLineChartView.prototype.render.apply(this);
            if (this.model.attributes.analyticsInitialized && this.model.attributes.data.y !==
                null) {
                var d3 = SCF.DVChartView.d3;
                var dv = SCF.DVChartView.dv;
                var chart = this.initChart();
                chart
                    .guide("x", dv.guide.axis().tickFormat(d3.time.format("%M:%S")).tickDy(-
                        12).orientation("bottom").title(CQ.I18n.get("Minutes")))
                    .guide("y", dv.guide.axis().orientation("right").tickDx(-12).title(CQ.I18n
                        .get("Viewers")))
                    .render();

                this.drawLabels();
            }
        }
    });

    SCF.VideoDropoffReport = VideoDropoffReport;
    SCF.VideoDropoffReportView = VideoDropoffReportView;

    SCF.registerComponent("social/enablement/components/hbs/reports/resource/videodropoffreport",
        SCF.VideoDropoffReport, SCF.VideoDropoffReportView);

})(CQ, SCF);
