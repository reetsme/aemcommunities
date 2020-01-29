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

    var ReportPaginatedTableModel = SCF.Model.extend({
        reportGenerated: false,
        fetchNewReport: function(url) {
            this.paginationUrl = url;

            this.reportGenerated = false;

            this.clear();

            this.firstPage();
        },
        changePage: function(updatedOffset) {
            this.currentOffset = updatedOffset;
            this.url = this.paginationUrl.replace("${startIndex}", updatedOffset);

            var that = this;

            /*
             * In most cases we should calls "this.reload()" here but that will trigger
             * a re-render of the entire report.  Since we only want to re-render the table,
             * we manually run the fetch ourselves so that we don't re-render the entire
             * report.
             */
            this.fetch({
                success: function(collection, response) {
                    if (response.items !== undefined && response.items.length > 0) {
                        that.set("model", response);
                    }
                }
            });
        },
        firstPage: function() {
            var newOffset = 0;
            this.changePage(newOffset);
        },
        nextPage: function() {
            var newOffset = this.currentOffset += (this.pageSize);
            this.changePage(newOffset);
        },
        previousPage: function() {
            var newOffset = this.currentOffset -= (this.pageSize);
            this.changePage(newOffset);
        },
        lastPage: function() {
            var newOffset = this.lastPageOffset;
            this.changePage(newOffset);
        }
    });

    SCF.ReportPaginatedTableModel = ReportPaginatedTableModel;

    var ReportPaginationControlView = SCF.View.extend({
        init: function() {
            SCF.Util.listenTo("reportValidatePaginationButtons", $.proxy(this.validate, this));
        },
        firstPage: function() {
            this.model.firstPage();
        },
        nextPage: function() {
            this.model.nextPage();
        },
        previousPage: function() {
            this.model.previousPage();
        },
        lastPage: function() {
            this.model.lastPage();
        },
        validate: function(data) {
            if (data.model === this.model) {
                var firstDisabled = false;
                var lastDisabled = false;

                if (this.model.currentOffset === 0) {
                    firstDisabled = true;
                }
                if (this.model.currentOffset === this.model.lastPageOffset) {
                    lastDisabled = true;
                }

                this.$el.find(".scf-pagination-first-btn").prop("disabled", firstDisabled);
                this.$el.find(".scf-pagination-previous-btn").prop("disabled", firstDisabled);
                this.$el.find(".scf-pagination-next-btn").prop("disabled", lastDisabled);
                this.$el.find(".scf-pagination-last-btn").prop("disabled", lastDisabled);
            }
        }
    });

    SCF.ReportPaginationControlView = ReportPaginationControlView;

})(SCF);
