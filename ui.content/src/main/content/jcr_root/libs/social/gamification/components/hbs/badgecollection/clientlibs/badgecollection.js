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

(function(Granite, $, Backbone, SCF) {
    "use strict";

    var BadgeListModel = SCF.Model.extend({
        modelName: "BadgeListModel",
        relationships: {
            "items": {
                collection: "BadgeCollection",
                model: "BadgeModel"
            }
        }
    });

    var BadgeModel = SCF.Model.extend({
        modelName: "BadgeModel"
    });

    var BadgeView = SCF.View.extend({
        viewName: "BadgeView"
    });

    var BadgeListView = SCF.View.extend({
        viewName: "BadgeListView",
        init: function() {
            this.initInfiniScroll();
            this.suffix = SCF.Util.getContextPath();
            $(window).load($.proxy(this.onFirstRender, this));
        },

        //
        //  This overrides the normal render functionality of SCF
        //  The issue here is that the entire list is being reset
        //   rather then appending to the list and this is causing
        //   masonry to reset the scrollbar to the top of the page.
        //
        append: function(start, end) {

            var masonry = $CQ("coral-masonry");
            var itemsToAppend = this.model.get("items").slice(start, end);

            var addCardItem = function(item, masonry, view) {
                var cardView = new BadgeView({
                    model: item,
                    parentView: view
                });
                cardView._parentView = view;
                item._isReady = true;
                cardView.render();
                cardView.bindView();
                masonry.append(cardView.el);
            };

            var that = this;
            _.each(itemsToAppend, function(item) {
                addCardItem(item, masonry, that);
            });
        },
        // This compensates for the issue where the number items fits into
        // the size of the window and thus not producing a scroll bar which
        // prevents any triggering of infiniScroll to get any more items.
        // This function forces infiniScroll to get the next set of items
        // if the item list container does not fill the page.
        onFirstRender: function() {

            // 110px accounts for the top toolbars.
            var containerHeight = $(".coral-masonry").height() + 110;
            var windowHeight = window.innerHeight;

            if (containerHeight < windowHeight) {

                this.infiniScroll.onFetch();
                this.infiniScroll.disableFetch();
                this.infiniScroll.collection.fetch({
                    success: this.infiniScroll.fetchSuccess,
                    error: this.infiniScroll.fetchError,
                    remove: this.infiniScroll.options.remove
                });
            }
        },
        initInfiniScroll: function() {
            SCF.log.debug("initInfinitScroll");

            this.collection = this.model.get("items");
            this.collection.url = this.model.get("pageInfo").nextPageURL.replace("html", "json");
            var that = this;
            this.infiniScroll = new Backbone.InfiniScroll(this.collection, {
                strict: false,
                pageSize: this.model.get("pageInfo").pageSize,
                scrollOffset: 100,
                target: $(".foundation-layout-panel-content"),

                onFetch: function() {

                    SCF.log.debug("onFetch");

                    var pageInfo = that.model.get("pageInfo");
                    var url = pageInfo.nextPageURL.replace("html", "json");
                    that.collection.url = decodeURIComponent(url);

                    SCF.log.debug("infiniScroll collection url:" + url);

                },

                success: function(collection, response) {
                    if (typeof response.items !== "undefined") {
                        if (response.items !== null && response.items.length > 0) {
                            // Need to update the model with the new page info

                            var lastPageInfo = that.model.get("pageInfo");
                            var lastCount = lastPageInfo.selectedPage * lastPageInfo.pageSize;

                            response.pageInfo.currentIndex += response.pageInfo.pageSize;
                            response.pageInfo.previousPageURL = response.pageInfo.nextPageURL;
                            response.pageInfo.previousSuffix = response.pageInfo.nextSuffix;
                            response.pageInfo.nextSuffix =
                                response.pageInfo.currentIndex + "." + response.pageInfo.pageSize;
                            response.pageInfo.nextPageURL =
                                response.pageInfo.nextPageURL.replace(response.pageInfo.previousSuffix,
                                    response.pageInfo.nextSuffix);

                            var newCount = that.model.get("items").length;

                            that.model.set("pageInfo", response.pageInfo);

                            // rather then call render here, call append directly
                            that.append(lastCount, newCount);
                        }
                    }
                }
            });
        }
    });

    var BadgeCollection = SCF.Collection.extend({
        collectioName: "BadgeCollection",
        parse: function(response) {
            SCF.log.debug("collection parse");
            return response.items;
        }
    });

    SCF.BadgeListModel = BadgeListModel;
    SCF.BadgeListView = BadgeListView;
    SCF.registerComponent("social/gamification/components/hbs/badgecollection",
        SCF.BadgeListModel, SCF.BadgeListView);

    SCF.BadgeModel = BadgeModel;
    SCF.BadgeView = BadgeView;
    SCF.BadgeCollection = BadgeCollection;

    SCF.registerComponent("social/gamification/components/hbs/badgecollection/badge",
        SCF.BadgeModel, SCF.BadgeView);

})(Granite, $, Backbone, SCF);
