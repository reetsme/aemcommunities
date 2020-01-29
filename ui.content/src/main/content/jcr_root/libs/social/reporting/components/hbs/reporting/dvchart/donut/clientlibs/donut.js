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
(function(SCF) {
    "use strict";

    var DVDonutChartView = SCF.DVChartView.extend({
        render: function() {
            SCF.DVChartView.prototype.render.apply(this);

            var isAnalyticsInitialized = this.model.attributes.analyticsInitialized;

            if ((_.isUndefined(isAnalyticsInitialized) || this.model.attributes.analyticsInitialized) &&
                this.model.attributes.data.y !== null) {
                var dv = SCF.DVChartView.dv;
                var d3 = SCF.DVChartView.d3;
                var chart = dv.chart();
                var timer;
                var rollover = dv.behavior.rollover();
                rollover.that = this;
                for (var i = 0; i < this.model.get("data").categories.length; i++) {
                    this.model.get("data").categories[i] = CQ.I18n.get(this.model.get("data").categories[i]);
                }
                chart.layers(
                    [
                        dv.geom.bar()
                        .position("fill").set("stroke", "#FFF")
                        .behaviors([
                            rollover
                            .content(function(d) {
                                return "<span class='tooltip-label'>" + d.data.categories +
                                    "</span><span class='tooltip-value'>" + d.data
                                    .y + "</span><span class='metric-name'>" + (d
                                        .data.y === 1 ? this.that.centerLabel.slice(
                                            0, -1) : this.that.centerLabel) +
                                    "</span>";
                            })
                            .showTooltip(function(d, i, j, event, self) {
                                var selectedSeries = "series-" + j;
                                self._showTip.call(this, d, i, j, self);
                                window.clearTimeout(timer);
                                d3.selectAll(self.that.$el.find(".bar-geom").toArray())
                                    .classed("medium", false)
                                    .classed("dv-unselected", function(pointD) {
                                        return d !== pointD;
                                    });
                                d3.selectAll(self.that.$el.find(".text-geom").toArray())
                                    .classed("medium", false)
                                    .classed("cv-unselected", function() {
                                        return $(this).attr("class").indexOf(
                                            selectedSeries) === -1;
                                    });
                            })
                            .hideTooltip(function(d, i, j, event, self) {
                                self._removeTip.call(this, d, i, j, self);
                                timer = window.setTimeout(function() {
                                    d3.selectAll(self.that.$el.find(
                                            ".bar-geom").toArray())
                                        .classed("dv-unselected", false)
                                        .classed("medium", true);
                                    d3.selectAll(self.that.$el.find(
                                            ".text-geom").toArray())
                                        .classed("cv-unselected", false)
                                        .classed("medium", true);
                                }, 400);
                            })
                        ]),
                        dv.geom.text().data(this.model
                            .attributes.labels).map(
                            "label",
                            "percentLabels").set(
                            "stroke", "none").map(
                            "fill", "categories")
                        .textAnchor("middle").dx(-
                            20)
                    ]).data(
                    this.model.attributes.data).coord(
                    dv.coord.polar().flip(true).innerRadius(
                        "50%")).map("x", "x",
                    dv.scale.ordinal()).map("y",
                    "y", dv.scale.linear()).map(
                    "fill", "categories").guide(
                    ["x", "y"], "none").guide(
                    "fill",
                    dv.guide.legend().orientation(
                        "top").values(this.model.attributes
                        .data.y).padding({
                        "bottom": 20
                    }).hGap(20)).parent(this.$el.find(
                    ".scf-reporting-js-chart")[0]).render();

                $(window).resize(function() {
                    chart.render();
                });

                // Manually add the text to the center of the donut
                var metricTitle = d3.select(this.$el.find(
                    ".scf-reporting-js-chart .dv-chart-container"
                )[0]).selectAll(
                    ".reporting-metric-title").data(
                    [this.model.attributes.labels
                        .totalCount + " " +
                        (this.model.attributes.labels
                            .totalCount === 1 ?
                            this.centerLabel.slice(0, -1) : this.centerLabel)
                    ]);
                metricTitle.enter().append("span").classed(
                    "reporting-metric-title", true);
                metricTitle.exit().remove();
                metricTitle.text(function(d) {
                    return d;
                });
            }
        }
    });

    SCF.DVDonutChartView = DVDonutChartView;

})(SCF);
