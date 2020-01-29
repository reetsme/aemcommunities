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

    var CoralReportPaginatedTableView = SCF.CoralTableView.extend({
        top: -1,
        viewName: "CoralReportPaginatedTableView",
        init: function() {
            SCF.Util.listenTo("reportRefreshTable", $.proxy(this.refreshTable, this));
        },
        refreshTable: function(data) {
            if (data.model === this.model) {
                var totalRows = this.model.get("totalSize");
                if (totalRows > 0) {
                    this.refreshView(totalRows, this.model.currentOffset,
                        this.pagingCallback);

                    this.model.currentOffset = this.model.get("pageInfo").currentIndex;
                    this.model.pageSize = this.model.get("pageInfo").pageSize;
                    this.model.lastPageOffset = this.model.pageSize * (this.model.get("pageInfo").totalPages - 1);

                    this.model.reportGenerated = true;

                    this.validatePaginationButtons();
                } else {
                    this.render();
                }
            }
        },
        pagingCallback: function(view) {
            view.model.firstPage();
        },
        validatePaginationButtons: function() {
            SCF.Util.announce("reportValidatePaginationButtons", {
                model: this.model
            });
        }
    });

    SCF.CoralReportPaginatedTableView = CoralReportPaginatedTableView;

    SCF.registerComponent("social/reporting/components/hbs/reporting/datatable/coral/pagination",
        SCF.Model, SCF.ReportPaginationControlView);
})(SCF);
