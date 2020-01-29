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

    var DataTableView = SCF.View.extend({
        viewName: "DataTableView",
        setSortIcon: function() {

        },
        initializePagination: function() {

        },
        refreshView: function(totalSize, startIndex, pagingCallback) {
            this.render();

            var that = this;

            /*
             * Every time the table gets drawn, a server side paging call ("ajax" funtion
             * below) is triggered.  After initializing the column sorting below, we manually
             * redraw the table but we don't want that to trigger a paging call.  So
             * this variable is instantiated so that we can only allow the paging call
             * to be triggered AFTER that draw request has been made.
             */
            var numDraws = 0;

            // apply data tables
            var table = $(this.el).find("table").DataTable({
                dom: "rAtiJ",
                ordering: false,
                serverSide: true,
                deferLoading: totalSize,
                displayStart: startIndex,
                /*jshint unused: vars */
                ajax: function(data, callback, settings) {
                    if (numDraws === 1) {
                        pagingCallback(that, data.start);
                        /*
                         * TODO: When we add sorting support, will need to
                         * trigger callback for table redraw here
                         */
                    }
                    numDraws++;
                },
                /*jshint unused: true */
                language: {
                    search: "_INPUT_",
                    searchPlaceholder: CQ.I18n.get("Filter"),
                    emptyTable: CQ.I18n.get("No data available in table"),
                    infoEmpty: CQ.I18n.get("No entries to show"),
                    info: CQ.I18n.get("Showing") +  " _START_ " + CQ.I18n.get("to") + " _END_ " +
                    CQ.I18n.get("of") + " _TOTAL_ " + CQ.I18n.get("entries")
                }
            });

            var colvis = new $.fn.dataTable.ColVis(table, {
                fnStateChange: function() {
                    var evt = $.Event(
                        "dataTablesColumnUpdate"
                    );
                    $(this.dom.wrapper).trigger(evt);

                    that.columnVisibility = [];
                    table.columns().eq(0).each(function(index) {
                        var column = table.column(index);
                        that.columnVisibility.push(column.visible());
                    });
                }
            });

            this.initializeSort();

            var i = 0;
            var sortIndex = 0;
            _.each($(this.el).find(
                    ".dataTable thead th"),
                function(data) {

                    var isVisible = true;
                    if (!_.isUndefined(this.columnVisibility)) {
                        isVisible = this.columnVisibility[i];
                    }
                    if ($(data).hasClass("dt-hide") || !isVisible) {
                        $($(this.el).find("table")[0]).dataTable()
                            .fnSetColumnVis(i, false, false);
                        if (sortIndex === i) {
                            sortIndex++;
                        }
                    }
                    i++;
                }, this);

            $.fn.dataTable.ColVis.fnRebuild($($(this.el).find("table")[0]).dataTable());

            table.order([
                [sortIndex, "asc"]
            ]).draw(false);

            colvis.button().children[0].innerText = CQ.I18n.get("Show / hide columns");
            $(this.el).find(".dataTables_wrapper").prepend(
                colvis.button());

            var toolBar = $(
                "<div class='dataTables_toolbar'></div>");

            $(toolBar).append($(this.el).find(".ColVis"));
            $(toolBar).append($(this.el).find(
                ".dataTables_filter"));

            $(this.el).find(".dataTables_wrapper").prepend(
                toolBar);

            var settings = table.settings()[0];

            $(settings.nTable).trigger("init.dt", [settings]);
        }
    });

    SCF.DataTableView = DataTableView;

})(SCF);
