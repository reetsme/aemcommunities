/*************************************************************************
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
 *
 *************************************************************************/
(function($CQ, _, Backbone, SCF, Coral) {
    "use strict";

    SCF.LOG_LEVEL = 1;

    var ResourceListModel = SCF.Model.extend({
        modelName: "ResourceListModel",
        relationships: {
            "items": {
                collection: "ResourceListCollection",
                model: "ResourceModel"
            }
        },
        initialize: function() {
            SCF.Model.prototype.initialize.apply(this);
            SCF.Util.listenTo("siteChange", $.proxy(this.onSiteUpdateEvent, this));
            this.resourceFilterRequest = null;
        },
        refreshFilterModel: function(params) {
            var site = this.get("sitePath");
            if (!_.isUndefined(site)) {
                params.sitePath = site;

                var url = this.get("pageInfo").urlpattern.replace("${startIndex}", "0")
                    .replace(".html", ".json");

                var separator = url.indexOf("?") !== -1 ? "&" : "?";
                url = url + separator + $.param(params);
                this.url = url;

                var that = this;
                if (this.resourceFilterRequest !== null) {
                    this.resourceFilterRequest.abort();
                }
                this.resourceFilterRequest = this.fetch({
                    success: function(collection, response) {
                        if (response.items !== undefined && response.items.length > 0) {
                            // Need to update the model with the new page info
                            that.set("pageInfo", response.pageInfo);
                        }
                    }
                });
            }
        },
        onSiteUpdateEvent: function(data) {
            this.set("sitePath", data.sitePath);
            var params = {
                "filter": true
            };
            this.refreshFilterModel(params);
        }
    });

    var ResourceListView = SCF.View.extend({
        viewName: "ResourceList",
        className: "resource-list",
        init: function() {
            this.enabled = false;
            this.resourcesLoading = false;
            this.listenTo(this.model, "sync", this.onSync);

            var resourceFilter = this.$el.find("#scf-js-resourcefilter")[0];
            var that = this;

            Coral.commons.ready(resourceFilter, function() {
                resourceFilter.on("coral-autocomplete:showsuggestions", function(e) {
                    if (that.resourcesLoading) {
                        e.preventDefault();
                    } else {
                        e.preventDefault();
                        resourceFilter.addSuggestions(that.suggestions, true);
                    }
                });

                resourceFilter.on("coral-autocomplete:hidesuggestions", function() {
                    resourceFilter.clearSuggestions();
                    that.refreshFilterView();
                });
            });
        },
        onSync: function() {
            this.model.resourceFilterRequest = null;
            this.refreshFilterView();
            this.resourcesLoading = false;
        },
        onFilterInputChange: function() {
            var params = {
                "filter": true,
                "searchText": this.$el.find("input")[1].value
            };
            this.resourcesLoading = true;
            this.model.refreshFilterModel(params);
        },
        refreshFilterView: function() {
            var resourceFilter = this.$el.find("#scf-js-resourcefilter")[0];
            this.suggestions = [];
            var newResourceList = this.model.get("items");
            if (newResourceList) {
                for (var i = 0; i < newResourceList.length; i++) {
                    var suggestion = {};
                    suggestion.content = newResourceList.models[i].get("title");
                    suggestion.value = newResourceList.models[i].get("id");
                    if (resourceFilter.value !== suggestion.value) {
                        this.suggestions.push(suggestion);
                    }
                }

                if (this.suggestions.length > 0) {
                    resourceFilter.addSuggestions(this.suggestions, true);
                }
            }
        }
    });

    var ResourceListCollection = Backbone.Collection.extend({
        collectionName: "ResourceListCollection"
    });

    var ResourceModel = SCF.Model.extend({
        modelName: "ResourceModel"
    });

    SCF.ResourceListModel = ResourceListModel;
    SCF.ResourceListView = ResourceListView;
    SCF.ResourceListCollection = ResourceListCollection;
    SCF.ResourceModel = ResourceModel;

    SCF.registerComponent("social/enablement/components/hbs/admin/resourcelist", SCF.ResourceListModel,
        SCF.ResourceListView);
})($CQ, _, Backbone, SCF, window.Coral);
