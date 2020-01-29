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
(function($CQ, _, Backbone, SCF) {
    "use strict";

    SCF.LOG_LEVEL = 1;
    var LearningPathListViewModel = SCF.ReportPaginatedTableModel.extend({
        modelName: "LearningPathListViewModel",
        initialize: function() {
            var url = this.get("pageInfo").previousPageURL.replace(".html", ".json");
            url = CQ.shared.HTTP.addParameter(url, "filter", "true");
            url = CQ.shared.HTTP.addParameter(url, "user", SCF.Session.attributes.path);
            url = CQ.shared.HTTP.addParameter(url, "sitePath", this.get("pageInfo").baseURI);

            this.url = url;
        }

    });

    var LearningPathListView = SCF.BootstrapReportPaginatedTableView.extend({
        top: -1,
        viewName: "LearningPathListView",
        className: "learningpath-list",
        init: function() {
            SCF.BootstrapReportPaginatedTableView.prototype.init.apply(this);
            this.collection = this.model.get("items");
            this.listenTo(this.model, "sync", this.onSync);
            this.renderDueStatusLabels();
            this.updateLinks();
            this.updateCrumbs();
        },
        onSync: function() {
            SCF.Util.announce("reportRefreshTable");
            this.model.set("localeDateFormat", moment.localeData().longDateFormat("L"), {silent: true});
            this.render();
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
        },
        updateLinks: function() {
            if (this.collection.length > 0) {
                var linkDisableStatusList = this.model.get("enforcedOrderedResourceRule");
                var learningPathItemTitles = this.$el.find(".scf-linked-resource-title");
                if (!_.isUndefined(linkDisableStatusList)) {
                    _.each(learningPathItemTitles,
                        function(obj, index) {
                            var status = this[index];
                            if (!status) {
                                $(obj).removeAttr("href");
                                $(obj).addClass("scf-unclickable-link");
                            }
                        },
                        linkDisableStatusList);
                }
            }
        },
        showBanner: function(evt) {
            if (!$(evt.target).attr("href")) {
                $(".scf-js-enforce-order-message").show().delay(3000).fadeOut();
            }
        },
        updateCrumbs: function() {
            var crumbs = [];
            var URL = CQ.shared.HTTP.getPath();
            var pageExtension = CQ.shared.HTTP.getExtension();
            var urlSplit = URL.split(pageExtension);
            if (urlSplit && urlSplit !== undefined) {
                var parent = urlSplit[0];
                var splitSelectors = parent.split(".");
                if (splitSelectors && splitSelectors !== undefined) {
                    parent = splitSelectors[0] + "." + pageExtension;
                    crumbs.push({
                        "title": "",
                        "url": parent
                    });
                }
            }

            crumbs.push({
                "title": CQ.I18n.get(this.model.get("title")),
                "url": "",
                "active": true
            });
            SCF.Util.announce("crumbs", {
                "crumbs": crumbs
            });
        }
    });

    SCF.LearningPathListViewModel = LearningPathListViewModel;
    SCF.LearningPathListView = LearningPathListView;

    SCF.registerComponent("social/enablement/components/hbs/view/learningpath/table-list",
        SCF.LearningPathListViewModel, SCF.LearningPathListView);
})($CQ, _, Backbone, SCF);
