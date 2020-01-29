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
(function(CQ, SCF) {
    "use strict";

    var inspectorLabelFunc = function(d) {
        var format = SCF.DVChartView.d3.time.format("%B %e, %Y");
        return format(d);
    };

    var SiteTrendReport = SCF.DVTrendLineChartModel.extend({
        modelName: "SiteTrendReport",
        formUrl: function() {
            var url = SCF.config.urlRoot + this.get("id") + SCF.constants.URL_EXT;
            url = CQ.shared.HTTP.addParameter(url, "sitePath", this.sitePath);
            for (var i = 0; i < this.componentType.length; i++) {
                url = CQ.shared.HTTP.addParameter(url, "componentType", this.componentType[i]);
                url = CQ.shared.HTTP.addParameter(url, "componentTitle", this.segmentLabels[i]);
            }
            url = CQ.shared.HTTP.addParameter(url, "dateFrom", this.dateFrom);
            url = CQ.shared.HTTP.addParameter(url, "dateTo", this.dateTo);
            url = CQ.shared.HTTP.addParameter(url, "cqEvent", this.get("properties").cqEvent);
            url = CQ.shared.HTTP.addParameter(url, "cqEvar", this.get("properties").cqEvar);
            return url;
        }
    });

    var SiteTrendReportView = SCF.DVTrendLineChartView.extend({
        modelName: "SiteTrendReportModel",
        className: "site-trend-report",
        inspectorLabelFunc: inspectorLabelFunc,
        fetchOnRender: false,
        init: function() {
            this.model.title = CQ.I18n.get(this.model.get("properties").title);
            SCF.DVTrendLineChartView.prototype.init.apply(this);
            SCF.Util.listenTo("generateSiteTrendReport", $.proxy(this.onReportGenerateEvent,
                this));
        },
        onReportGenerateEvent: function(event) {
            this.model.sitePath = event.sitePath;
            this.model.componentType = event.componentType;
            this.model.dateFrom = event.dateFrom;
            this.model.dateTo = event.dateTo;

            var componentType = this.model.componentType.split(",");
            this.model.componentType = [];
            this.model.segmentLabels = [];
            for (var i = 0; i < componentType.length; i++) {
                var arr = componentType[i].split("|");
                this.model.segmentLabels.push(CQ.I18n.get(arr[0]));
                this.model.componentType.push(arr[1]);
            }

            if (this.model.segmentLabels.length > 1) {
                this.model.segmentLabels.push(CQ.I18n.get("Total"));
            }

            this.segmentLabels = this.model.segmentLabels;

            this.model.fetchData();

            var dvChart = this.$el.find(".scf-reporting-js-chart .dv-chart-container");
            var noDataChart = this.$el.find(".scf-reporting-js-chartNoData");
            if (dvChart.length > 0) {
                // we are generating a subsequent trend report.
                dvChart.hide();
            }
            if (noDataChart.length > 0) {
                // we are generating a subsequent trend report.
                noDataChart.hide();
            }
            this.$el.find(".scf-reporting-js-chartPending").show();
        }
    });

    SCF.SiteTrendReport = SiteTrendReport;
    SCF.SiteTrendReportView = SiteTrendReportView;

    SCF.registerComponent("social/reporting/analytics/components/hbs/sitetrendreport",
        SCF.SiteTrendReport, SCF.SiteTrendReportView);

})(CQ, SCF);
