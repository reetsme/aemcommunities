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

    var BootstrapReportPaginatedTableView = SCF.DataTableView.extend({
        top: -1,
        viewName: "BootstrapReportPaginatedTableView",
        init: function() {
            this.listenTo(this.model, "sync", this.onSync);
            SCF.Util.listenTo("reportRefreshTable", $.proxy(this.refreshTable, this));
        },
        refreshTable: function() {
            var totalRows = this.collection.size();
            if (totalRows > 0) {
                this.refreshView(totalRows, this.model.currentOffset,
                    this.pagingCallback);

                this.model.currentOffset = this.model.get("pageInfo").currentIndex;
                this.model.pageSize = this.model.get("pageInfo").pageSize;
                this.model.lastPageOffset = this.model.pageSize * (this.model.get("pageInfo").totalPages - 1);

                this.model.reportGenerated = true;
                this.renderDueStatusLabels();
                this.validatePaginationButtons();
            } else {
                this.render();
            }
        },
        pagingCallback: function(view) {
            view.model.firstPage();
        },
        renderDueStatusLabels: function() {},
        validatePaginationButtons: function() {
            SCF.Util.announce("reportValidatePaginationButtons", {
                model: this.model,
                currentOffset: this.model.currentOffset,
                lastPageOffset: this.model.lastPageOffset
            });
        },
        initializeSort: function() {

        }
    });

    SCF.BootstrapReportPaginatedTableView = BootstrapReportPaginatedTableView;

    SCF.registerComponent("social/reporting/components/hbs/reporting/datatable/bootstrap/pagination",
        SCF.Model, SCF.ReportPaginationControlView);
})(SCF);
