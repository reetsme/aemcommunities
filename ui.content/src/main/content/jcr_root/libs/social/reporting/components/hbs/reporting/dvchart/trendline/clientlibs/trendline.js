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

    var DVTrendLineChartModel = SCF.DVChartModel.extend({
        parse: function(response) {
            if (response.analyticsInitialized && !_.isNull(response.data) && !_.isUndefined(response.data)) {
                response.data.x = _.map(_.clone(
                        response.data.x),
                    function(d) {
                        return new Date(Number(
                            d));
                    });
                response.noActivity = _.isUndefined(_.find(_.clone(
                        response.data.y),
                    function(d) {
                        return Number(d) > 0;
                    }));
            }
            return response;
        }
    });

    var DVTrendLineChartView = SCF.DVChartView.extend({
        initChart: function() {
            var dv = SCF.DVChartView.dv;
            var d3 = SCF.DVChartView.d3;
            var chart = dv.chart();
            var inspector = dv.behavior.inspector();
            inspector.model = this.model.attributes.data;
            inspector.that = this;
            chart
                .layers([dv.geom.line()])
                .behaviors([
                    inspector
                    .orientation("bottom")
                    .inspectorMove(
                        function(d, i) {
                            var offset = i % this.that.segmentLabels.length;
                            i = i - offset;
                            for (var j = 0; j < this.that.segmentLabels.length; j++) {
                                $(this.that.$el.find(
                                    ".scf-reporting-js-chart .legend-entry-label")[j]).text(
                                    this.that.segmentLabels[j] + " " + this.model.y[i +
                                        j]);
                            }

                            d3.selectAll(this.that.$el.find(
                                    ".scf-reporting-js-chart .axis-x .axis-label").toArray())
                                .style("opacity", 0);
                            d3.selectAll(this.that.$el.find(
                                ".scf-reporting-js-chart .axis-title-x").toArray()).style(
                                "opacity", 0);
                        })
                    .inspectorOut(
                        function() {
                            for (var j = 0; j < this.that.segmentLabels.length; j++) {
                                $(this.that.$el.find(
                                    ".scf-reporting-js-chart .legend-entry-label")[j]).text(
                                    this.that.segmentLabels[j]);
                            }
                            d3.selectAll(this.that.$el.find(
                                    ".scf-reporting-js-chart .axis-x .axis-label").toArray())
                                .style("opacity", 1);
                            d3.selectAll(this.that.$el.find(
                                ".scf-reporting-js-chart .axis-title-x").toArray()).style(
                                "opacity", 1);
                        })
                    .label(this.inspectorLabelFunc)
                    .underGeoms(true) // Render the inspector underneath the geoms.
                ])
                .data(this.model.attributes.data)
                .map("x", "x", dv.scale.time.utc())
                .map("y", "y", dv.scale.linear())
                .map("stroke", "series")
                .map("linetype", "series")
                .guide(["stroke", "linetype"], dv.guide.legend().orientation("top"))
                .padding({
                    left: 10,
                    right: 10
                })
                .parent(this.$el.find(".scf-reporting-js-chart")[0]);

            $(window).resize(function() {
                chart.render();
            });

            return chart;
        },
        render: function() {
            SCF.DVChartView.prototype.render.apply(this);
            if (this.model.attributes.analyticsInitialized && !_.isUndefined(this.model.attributes.data) &&
                this.model.attributes.data.y !== null && !_.isUndefined(this.model.attributes.noActivity) &&
                !this.model.attributes.noActivity) {
                var chart = this.initChart();
                chart.render();

                this.drawLabels();
            }
        },
        drawLabels: function() {
            if (this.segmentLabels.length > 1) {
                for (var j = 0; j < this.segmentLabels.length; j++) {
                    $(this.$el.find(".scf-reporting-js-chart .legend-entry-label")[j]).text(this.segmentLabels[
                        j]);
                }
            }
        }
    });

    SCF.DVTrendLineChartView = DVTrendLineChartView;
    SCF.DVTrendLineChartModel = DVTrendLineChartModel;

})(SCF);
