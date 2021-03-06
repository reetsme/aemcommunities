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

    var CoralReportingTableView = SCF.ReportingTableView.extend({
        initializeSort: function() {
            $(this.el).find(".coral-Table-headerCell").on(
                "click.custom",
                null, {
                    el: this.el
                },
                function(event) {
                    if ($(this).hasClass(
                            "sorting_asc") || $(this)
                        .hasClass("sorting_desc")) {
                        $(event.data.el).find(".dataTables_wrapper thead").find(
                            "i").remove(".coral-Icon");

                        if ($(this).hasClass("sorting_asc")) {
                            $(this).append(
                                "<i class='coral-Icon coral-Icon--arrowUp coral-Icon--sizeXS'></i>"
                            );
                        } else {
                            $(this).append(
                                "<i class='coral-Icon coral-Icon--arrowDown coral-Icon--sizeXS'></i>"
                            );
                        }
                    }
                });

            $(this.el).find(".coral-Table-headerCell").on(
                "mousedown",
                function(e1) {
                    if (e1.currentTarget.style.cursor !== "col-resize") {
                        return;
                    }

                    var event;

                    _.each($._data(this, "events").click, function(data) {
                        if (data.namespace === "custom") {
                            event = data;
                            return;
                        }
                    });

                    $(this).off("click.custom");

                    $(this).on("mouseup", {
                        e: event
                    }, function(e2) {
                        $(this).on("click.custom", null, e2.data.e.data, e2.data.e
                            .handler);
                    });
                });
        },
        setSortIcon: function() {
            $(this.el).find(".coral-Table-headerCell:first").append(
                "<i class='coral-Icon coral-Icon--arrowUp coral-Icon--sizeXS'></i>"
            );
        },
        initializeSearchFilter: function() {
            var searchFilter = $(
                "<span class='coral-DecoratedTextfield'>" +
                "<i class='coral-DecoratedTextfield-icon coral-Icon coral-Icon--sizeXS coral-Icon--search'></i>" +
                "</span>"
            );

            var input = $(this.el).find(".dataTables_filter").find(
                "input").addClass(
                "coral-DecoratedTextfield-input coral-Textfield"
            );
            input = $(this.el).find(".dataTables_filter").find(
                "input").attr(
                "placeholder", Granite.I18n.get("Filter")
            );
            $(searchFilter).append(input);

            $(searchFilter).append(
                "<button id='clearFilter' type='button' " +
                "class='coral-DecoratedTextfield-button coral-MinimalButton'>" +
                "<i class='coral-MinimalButton-icon coral-Icon coral-Icon--sizeXS coral-Icon--close'></i>" +
                "</button>"
            );

            $(this.el).find(".dataTables_filter").empty().append(
                searchFilter);

            $(this.el).find(".dataTables_filter").find("button")
                .click({
                    el: this.el
                }, function(event) {
                    $(event.data.el).find(
                        ".dataTables_filter").find(
                        "input").val("");
                    $(event.data.el).find(
                        ".dataTables_filter").find(
                        "input").keyup();
                });
        },
        refreshView: function() {
            SCF.ReportingTableView.prototype.refreshView.apply(this);

            this.initializeSearchFilter();

            $($(this.el).find(".ColVis")).on(
                "dataTablesColumnUpdate",
                null, {
                    el: this.el
                },
                function(event) {
                    $(event.data.el).find(".dataTables_scrollHead thead").find(
                        "th").each(function() {
                        $(this).find("i").remove(
                            ".coral-Icon");
                        if ($(this).hasClass(
                                "sorting_asc")) {
                            $(this).append(
                                "<i class='coral-Icon coral-Icon--arrowUp coral-Icon--sizeXS'></i>"
                            );
                        } else if ($(this).hasClass(
                                "sorting_desc")) {
                            $(this).append(
                                "<i class='coral-Icon coral-Icon--arrowDown coral-Icon--sizeXS'></i>"
                            );
                        }
                    });
                });
        }
    });

    SCF.CoralReportingTableView = CoralReportingTableView;

})(SCF);
