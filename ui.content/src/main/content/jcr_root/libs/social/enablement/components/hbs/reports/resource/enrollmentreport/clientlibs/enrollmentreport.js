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

    SCF.LOG_LEVEL = 1;

    var ResourceEnrollmentReportModel = SCF.Model.extend({
        modelName: "ResourceEnrollmentReportModel",
        loadDataAsync: function() {
            this.url = this.get("pageInfo").urlpattern.replace(".html", ".json").replace(
                    ".10", "." + this.get("totalSize"))
                .replace("${startIndex}", "0");

            this.url = this.url + SCF.Util.getContextPath();
            this.url = CQ.shared.HTTP.addParameter(this.url, "filter", "true");

            var that = this;

            this.fetch({
                success: function(collection, response) {
                    if (!_.isUndefined(response.items) && response.items.length > 0) {
                        that.set("model", response);
                    }
                }
            });
        }
    });

    /*
     * For localization to translate statuses in the report table
     * i18n.get("Not Assigned");
     * i18n.get("Not Attempted");
     * i18n.get("In Progress");
     * i18n.get("Completed");
     */
    var ResourceEnrollmentReportView = SCF.CoralReportingTableView.extend({
        viewName: "ResourceEnrollmentReportView",
        className: "scf-report-enrollment-table",
        init: function() {

            this.listenTo(this.model, "sync", this.onSync);
            var modalForm = document.querySelector("#myModal");
            var modalError = document.querySelector("#scf-select-row-modal");

            this.completionStatusInput = document.querySelector(
                "#scf-external-resource-completion-status");
            this.successStatusInput = document.querySelector("#scf-external-resource-success-status");

            var that = this;
            $(".scf-report-enrollment-table").on("click", "#editReport", function() {
                var items = that.model.get("items");
                var selectedId = $("#enrollment-table .selected").attr("data-scf-userid");
                that.selectedIndex = _.findIndex(items, function(row) {
                    return row.userId === selectedId;
                });
                if (that.selectedIndex > -1) {

                    var row = items[that.selectedIndex];
                    var scoreInput = document.querySelector("#scf-external-resource-score");
                    if (isNaN(row.score)) {
                        row.score = 0;
                    }
                    scoreInput.value = row.score;

                    var nameInputs = document.querySelectorAll(
                        "#scf-external-resource-report-edit-form input");
                    nameInputs[0].value = row.firstName;
                    nameInputs[1].value = row.lastName;

                    if (_.isUndefined(that.initialized)) {
                        /*
                         * If this is the first time rendering the modal, we need to set the initial
                         * value of each select list to be different from the value it's initially
                         * trying to render otherwise the "change" event isn't triggered and the
                         * component isn't rendered properly. On each subsequent render of the modal,
                         * the change event will either be properly triggered because a change happens
                         * or is unnecessary because we're trying to modify the same row we already
                         * selected.
                         */
                        that.completionStatusInput.value = row.completionStatus ===
                            "In Progress" ? "Completed" : "In Progress";
                        that.successStatusInput.value = row.successStatus === "Passed" ?
                            "Failed" : "Passed";
                        that.initialized = true;
                    }
                    window.setTimeout($.proxy(that.updateListDisplays, that), 50);
                    modalForm.show();

                } else {
                    modalError.show();
                }
            });
            $("#myModal").on("click", ".scf-edit-report-save", this.saveState);
            this.model.loadDataAsync();
        },
        updateListDisplays: function() {
            var items = this.model.get("items");
            var row = items[this.selectedIndex];
            this.completionStatusInput.value = row.completionStatus === "In Progress" ? "In Progress" :
                "Completed";
            this.successStatusInput.value = row.successStatus === "Passed" ? "Passed" : "Failed";
        },
        onSync: function() {
            this.refreshView();
            if (this.model.get("resourcePrimaryAssetType") === "location") {
                var toolbar = $(".dataTables_toolbar");
                var editButton = $("#edit-button-template").html();
                toolbar.append(editButton);
                var table = $(".scf-table");
                table.addClass("scf-enablement-location-resource");
                table.addClass("coral-Table--hover");
            }
        },
        saveState: function() {
            var index = $("#enrollment-table .selected").index();
            if (index > -1) {
                var userId = $("#enrollment-table .selected").attr("data-scf-userId");
                var numberInput = document.querySelector("#scf-external-resource-score");
                var score = numberInput.value;
                if (isNaN(score)) {
                    score = -1;
                }
                var completionStatus = document.querySelector(
                    "#scf-external-resource-completion-status").value;
                var successStatus = document.querySelector("#scf-external-resource-success-status").value;
                var url = SCF.Util.getContextPath() + SCF.constants.JSON_EXT;
                $.post(url, {
                    ":operation": "social:reportEnablementResourceModel",
                    "user": userId,
                    "score_tl": score,
                    "completionStatus_s": completionStatus,
                    "successStatus_s": successStatus
                }, function() {
                    window.location.reload();
                });
            }
        }
    });

    SCF.ResourceEnrollmentReportModel = ResourceEnrollmentReportModel;
    SCF.ResourceEnrollmentReportView = ResourceEnrollmentReportView;

    SCF.registerComponent("social/enablement/components/hbs/reports/resource/enrollmentreport",
        SCF.ResourceEnrollmentReportModel, SCF.ResourceEnrollmentReportView);

    $(document).ready(function() {
        $("#resource-Report").attr("download", "resource_report.csv");
    });

})(SCF);
