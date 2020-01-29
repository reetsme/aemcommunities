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
(function(dv, d3, SCF) {
    "use strict";

    var DVChartModel = SCF.Model.extend({
        fetchData: function() {
            this.url = this.formUrl();
            this.url = CQ.shared.HTTP.addParameter(this.url, "filter", "true");

            var that = this;
            this.clear({
                silent: true
            });
            this.fetch({
                success: function(collection, response) {
                    if (!_.isUndefined(response.items) && response.items.length >
                        0) {
                        that.set("model", response);
                    }
                }
            });
        },
        formUrl: function() {
            return SCF.config.urlRoot + this.get("id") + SCF.constants.URL_EXT + SCF.Util.getContextPath();
        }
    });

    var DVChartView = SCF.View.extend({
        fetchOnRender: true,
        init: function() {
            this.listenTo(this.model, "change", this.render);

            // set chart title
            this.$el.find(".scf-reporting-js-chartContainerHeader").text(this.model.title);

            if (this.fetchOnRender) {
                this.model.fetchData();
            }
        },
        render: function() {
            this.$el.find(".scf-reporting-js-chartPending").hide();

            var isAnalyticsInitialized = this.model.attributes.analyticsInitialized;
            var isVideoHeartbeatAnalyticsEnabled = this.model.attributes.videoHeartbeatAnalyticsEnabled;
            if (!_.isUndefined(isAnalyticsInitialized) && !isAnalyticsInitialized) {
                this.$el.find(".scf-reporting-js-chartNoData").text(CQ.I18n.get(
                    "Analytics not configured properly."));
                this.$el.find(".scf-reporting-js-chartNoData").show();
                return;
            } else if (!_.isUndefined(isVideoHeartbeatAnalyticsEnabled) && !isVideoHeartbeatAnalyticsEnabled) {
                this.$el.find(".scf-reporting-js-chartNoData").text(CQ.I18n.get(
                    "Marketing Cloud Org ID required."));
                this.$el.find(".scf-reporting-js-chartNoData").show();
                return;
            } else if (_.isUndefined(this.model.attributes.data) || this.model.attributes.data.y === null ||
                this.model.attributes.data.values === null ||
                (!_.isUndefined(this.model.attributes.noActivity) && this.model.attributes.noActivity)) {
                this.$el.find(".scf-reporting-js-chartNoData").text(CQ.I18n.get(
                    "No activity."));
                this.$el.find(".scf-reporting-js-chartNoData").show();
                return;
            }

            var dvChart = this.$el.find(".scf-reporting-js-chart .dv-chart-container");
            if (dvChart.length > 0) {
                dvChart.show();
            }
        }
    });

    SCF.DVChartModel = DVChartModel;

    DVChartView.d3 = d3;
    DVChartView.dv = dv;
    SCF.DVChartView = DVChartView;

})(dv, d3, SCF);
