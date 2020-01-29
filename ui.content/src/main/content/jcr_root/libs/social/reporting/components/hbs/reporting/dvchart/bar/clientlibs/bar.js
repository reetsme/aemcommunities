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
(function(SCF, CQ) {
    "use strict";

    var DVBarChartView = SCF.DVChartView.extend({
        initChart: function() {
            var dv = SCF.DVChartView.dv;
            var chart = dv.chart();
            var timer;
            var rollover = dv.behavior.rollover();
            rollover.that = this;
            chart
                .layers([
                    dv.geom.bar().behaviors([
                        rollover
                        .content(function(d) {
                            return "<span class='tooltip-label'>" + d.data.labels +
                                "</span><span class='tooltip-value'>" + d.data.values +
                                "</span>";
                        })
                        .showTooltip(function(d, i, j, event, self) {
                            self._showTip.call(this, d, i, j, self);
                            window.clearTimeout(timer);
                            d3.selectAll(self.that.$el.find(".bar-geom").toArray())
                                .classed("medium", false)
                                .classed("dv-unselected", function(pointD) {
                                    return d !== pointD;
                                });
                        })
                        .hideTooltip(function(d, i, j, event, self) {
                            self._removeTip.call(this, d, i, j, self);
                            timer = window.setTimeout(function() {
                                d3.selectAll(self.that.$el.find(
                                        ".bar-geom").toArray())
                                    .classed("dv-unselected", false)
                                    .classed("medium", true);
                            }, 400);
                        })
                    ])
                ])
                .coord(dv.coord.cartesian().flip(true))
                .data(this.model.attributes.data)
                .map("x", "labels", dv.scale.ordinal().reverse(true))
                .map("y", "values", dv.scale.linear().lowerLimit(0))
                .map("fill", "labels")
                .guide("x", dv.guide.axis().tickSize(0))
                .padding({
                    top: 15,
                    left: 10,
                    right: 30
                })
                .parent(this.$el.find(".scf-reporting-js-chart")[0]);

            $(window).resize(function() {
                chart.render();
            });

            return chart;
        },
        render: function() {
            SCF.DVChartView.prototype.render.apply(this);
            var isAnalyticsInitialized = this.model.attributes.analyticsInitialized;

            if ((_.isUndefined(isAnalyticsInitialized) || this.model.attributes.analyticsInitialized) &&
                this.model.attributes.data.values !== null) {
                var chart = this.initChart();
                if (!_.isUndefined(this.caption)) {
                    this.caption = CQ.shared.Util.patchText(this.caption, this.model.captionVars);
                    chart.guide("y", dv.guide.axis().orientation("left").title(this.caption));
                }
                chart.render();
            }
        }
    });

    SCF.DVBarChartView = DVBarChartView;

})(SCF, CQ);
