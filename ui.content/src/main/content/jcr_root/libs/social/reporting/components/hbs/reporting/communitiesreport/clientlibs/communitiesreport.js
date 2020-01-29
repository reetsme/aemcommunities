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
(function(SCF) {
    "use strict";

    SCF.LOG_LEVEL = 1;

    var CommunitiesReportView = SCF.View.extend({
        rendered: false,
        init: function() {
            this.listenTo(this.model, "sync", this.onSync);
        },
        drawSummary: function() {

        },
        /*jshint unused: vars */
        setReportMetaData: function(event) {

        },
        /*jshint unused: true */
        onSync: function() {
            if (!this.model.reportGenerated) {
                this.drawSummary();
                this.endWait();
            }
            SCF.Util.announce("reportRefreshTable", {
                model: this.model
            });

        },
        onReportGenerateEvent: function(event) {
            $(".scf-communities-report").hide();
            $(this.$el).show();
            if (this.rendered) {
                this.startWait();
            }

            this.setReportMetaData(event);

            this.model.generate();
        },
        startWait: function() {
            this.$el.find(".scf-js-table-content").hide();
            this.$el.find(".scf-js-spinner").show();
        },
        endWait: function() {
            this.$el.find(".scf-js-spinner").hide();
            this.$el.find(".scf-js-table-content").show();

            this.rendered = true;
        }
    });

    SCF.CommunitiesReportView = CommunitiesReportView;

})(SCF);
