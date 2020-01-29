/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2014 Adobe Systems Incorporated
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

(function(window, Enablement) {
    "use strict";

    var ItemCollection = Enablement.ItemCollection;
    var ItemModel = Enablement.ItemModel;

    var currPageUrl = window.location.pathname;
    var currPageSuffix = Enablement.currPageSuffix;

    var ResourceCollection = ItemCollection.extend({
        urlRoot: currPageSuffix + ".resourcelist.json"
    });

    var ResourcesCollection = ItemCollection.extend({
        urlRoot: currPageUrl.substring(currPageUrl.indexOf(".html") + ".html".length) +
            ".resourcelist.json",

        initialize: function() {
            this.filters.setOrder("enablement-resource-name", "asc");
            this.filters.set("showBadges", false);
        }
    });

    var PublishedResourcesCollection = ItemCollection.extend({
        urlRoot: currPageUrl.substring(currPageUrl.indexOf(".html") + ".html".length) +
            ".resourcelist.json",

        initialize: function() {
            this.filters.setOrder("enablement-resource-name", "asc");
            this.filters.set("publish", true);
            this.filters.set("sling:resourceType",
                "social/enablement/components/hbs/view/resource");
        }
    });

    var LearningPathCollection = ItemCollection.extend({
        urlRoot: currPageUrl.substring(0, currPageUrl.indexOf(".html")) + ".detail.json",

        parse: function(response) {
            _.each(response.items, function(item) {
                _.extend(item, item.info);
            });
            return response.items;
        }

    });

    var LearningPathItemModel = ItemModel.extend({
        stringify: function() {
            var jsonObj = {
                "type": this.get("type"),
                "path": this.get("jcr:path")
            };
            return JSON.stringify(jsonObj);
        }
    });

    var NewLearningPathCollection = ItemCollection.extend({
        model: LearningPathItemModel,

        urlRoot: currPageSuffix + ".detail.json",

        parse: function(response) {
            _.each(response.items, function(item) {
                _.extend(item, item.info);
            });
            return response.items;
        }
    });

    Enablement.ResourceCollection = ResourceCollection; // ???? where is it used?
    Enablement.ResourcesCollection = ResourcesCollection;
    Enablement.PublishedResourcesCollection = PublishedResourcesCollection;
    Enablement.LearningPathCollection = LearningPathCollection; // ???? where is it used?
    Enablement.NewLearningPathCollection = NewLearningPathCollection;
})(window, CQ.Communities.Enablement);
