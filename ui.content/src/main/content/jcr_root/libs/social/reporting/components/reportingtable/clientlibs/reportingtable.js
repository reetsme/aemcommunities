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

    var ReportingTableView = SCF.View.extend({
        initializeSort: function() {

        },
        setSortIcon: function() {

        },
        refreshView: function() {
            this.render();

            // apply data tables
            var table = $(this.el).find("table").DataTable({
                dom: "frAtiSJ",
                scrollY: 400,
                scrollCollapse: true,
                language: {
                    search: "_INPUT_",
                    searchPlaceholder: CQ.I18n.get("Filter"),
                    emptyTable: CQ.I18n.get("No data available in table"),
                    infoEmpty: CQ.I18n.get("No entries to show"),
                    info: CQ.I18n.get("Showing") +  " _START_ " +
                    CQ.I18n.get("to") + " _END_ " +
                    CQ.I18n.get("of") + " _TOTAL_ " + CQ.I18n.get("entries")
                }
            });
            table.$("tbody tr").on("click", function() {
                if ($(this).hasClass("selected")) {
                    $(this).removeClass("selected");
                } else {
                    table.$("tr.selected").removeClass("selected");
                    $(this).addClass("selected");
                }
            });
            var colvis = new $.fn.dataTable.ColVis(table, {
                fnStateChange: function() {
                    var evt = $.Event(
                        "dataTablesColumnUpdate"
                    );
                    $(this.dom.wrapper).trigger(evt);
                }
            });

            this.initializeSort();

            var i = 0;
            var sortIndex = 0;
            _.each($(this.el).find(
                    ".dataTables_scrollHead thead th"),
                function(data) {

                    if ($(data).hasClass("dt-hide")) {
                        $($(this.el).find("table")[1]).dataTable()
                            .fnSetColumnVis(i, false);
                        if (sortIndex === i) {
                            sortIndex++;
                        }
                    }
                    i++;
                }, this);

            this.setSortIcon();
            table.order([
                [sortIndex, "asc"]
            ]).draw();

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
        }
    });

    SCF.ReportingTableView = ReportingTableView;

})(SCF);
