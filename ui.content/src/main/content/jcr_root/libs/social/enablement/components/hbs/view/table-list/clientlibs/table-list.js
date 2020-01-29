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

    var ResourceListTableView = SCF.BootstrapReportPaginatedTableView.extend({
        viewName: "ResourceListTableView",
        className: "report-userassignment-table",

        init: function() {
            this.collection = this.model.get("items");
            SCF.BootstrapReportPaginatedTableView.prototype.init.apply(this);
            this.listenTo(this.collection, "sync", this.onSync);
            this.listenTo(this.model, "change:pageInfo", this.onPageInfoChange);
        },

        /*jshint unused: true */
        onSync: function() {
            SCF.Util.announce("reportRefreshTable");
        },

        renderDueStatusLabels: function() {
            if (this.collection.length > 0) {
                var dueStatusList = _.map(this.collection.models, function(obj) {
                    return obj.get("dueStatus");
                });
                var assignmentDueStatusLabels = this.$el.find(".scf-due-status-cell");
                _.each(assignmentDueStatusLabels,
                    function(obj, index) {
                        var status = this[index];
                        var dueStatusClass;

                        switch (status) {
                            case "DueInMoreThan3Days":
                                dueStatusClass = "due-status-safe";
                                break;
                            case "DueWithin3Days":
                                dueStatusClass = "due-status-warning";
                                break;
                            case "PastDue":
                                dueStatusClass = "due-status-expired";
                                break;
                            default:
                                dueStatusClass = "";
                        }
                        if (dueStatusClass !== "") {
                            $(obj).addClass(dueStatusClass);
                            $(obj).show();
                        }
                    },
                    dueStatusList);
            }
            $("#user-assignment-table_info").hide();
        },

        applySearch: function(params) {
            var collection = this.model.get("items");

            if (collection !== undefined) {
                var url = this.model.get("pageInfo").urlpattern.replace("${startIndex}", "0")
                    .replace(".html", ".json");

                var separator = url.indexOf("?") !== -1 ? "&" : "?";
                url = url + separator + $.param(params.params);
                collection.url = url;

                var that = this;
                collection.fetch({
                    success: function(collection, response) {
                        if (response.items !== undefined && response.items.length > 0) {
                            // Need to update the model with the new page info
                            that.model.set("pageInfo", response.pageInfo);
                        }
                    },
                    reset: true
                });
            } else {
                SCF.log.error("No collection found for itemlist component");
            }

            SCF.Util.announce("reportRefreshTable");
        }
    });

    var ResourceTableRowView = SCF.View.extend({});

    var LearningPathTableRowView = SCF.View.extend({
        sendPreReqMessage: function() {
            if (!this.model.get("allPrerequisitesCompleted")) {
                var prerequisites = [];
                _.each(this.model.get("prerequisites"), function(prerequisite) {
                    prerequisites.push(prerequisite);
                });
                SCF.Util.announce("showPreReqMessage", {
                    list: prerequisites
                });
            }
        }
    });

    SCF.ResourceListTableView = ResourceListTableView;
    SCF.ResourceTableRowView = ResourceTableRowView;
    SCF.LearningPathTableRowView = LearningPathTableRowView;

    SCF.registerComponent("social/enablement/components/hbs/view/table-list",
        SCF.Model, SCF.ResourceListTableView);

    SCF.registerComponent("social/enablement/components/hbs/view/resource/table-row",
        SCF.Model, SCF.ResourceTableRowView);

    SCF.registerComponent("social/enablement/components/hbs/view/learningpath/table-row",
        SCF.Model, SCF.LearningPathTableRowView);

})(SCF);
