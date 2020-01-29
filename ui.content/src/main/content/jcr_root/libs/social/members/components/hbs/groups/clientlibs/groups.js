/*
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
 */

(function($, $CQ, _, Backbone, SCF) {
    "use strict";

    document.addEventListener("DOMContentLoaded", function() {
        if (SCF.shell2 && SCF.shell2.isShell2()) {
            SCF.shell2.toggleSelectionMode();
            SCF.shell2.hookFilterButtons("/libs/social/members/content/groups/jcr:content/body/content/content/" +
                "items/preview/items/groups");
        }

    });
    $(function() {
        $(".foundation-mode-change").click(SCF.shell2 && SCF.shell2.toggleSelectionMode);
    });

    $CQ.ajax(SCF.config.urlRoot + "/mnt/overlay/social/members/content/content/tunnelvalidator.social.json", {
        dataType: "json",
        type: "GET",
        async: false,
        "success": function(data) {
            if (!data.tunnelEnabled) {
                window.location.href = SCF.config.urlRoot + "/communities/errorpage";
            }
        }
    });

    // model and view placeholder
    var MemberGroupListModel = SCF.Model.extend({
        modelName: "MemberGroupListModel",
        requestsAllowed: true,
        events: {
            UPDATED: "model:updated",
            LOADED: "model:loaded"
        },

        relationships: {
            "items": {
                collection: "MemberGroupListCollection",
                model: "MemberGroupModel"
            }
        },

        getUrl: function() {
            var url = _.isFunction(this.url) ? this.url() : this.url;
            return url;
        }

    });

    var MemberGroupListCollection = SCF.Collection.extend({
        collectionName: "MemberGroupListCollection",
        parse: function(response) {
            SCF.log.debug("collection parse");
            return response.items;
        }
    });

    var MemberGroupModel = SCF.Model.extend({

        modelName: "MemberGroupModel",

        getUrl: function() {
            // this is currently producing wrong URL, will need to fix
            return _.isFunction(this.url) ? this.url() : this.url;
        }

    });

    // single group view
    var MemberGroupView = SCF.View.extend({
        viewName: "MemberGroupView",

        init: function() {}

    });

    var MemberGroupListView = SCF.View.extend({
        viewName: "MemberGroupListView",

        init: function() {
            var self = this;
            self.suffix = SCF.Util.getContextPath();
            var tbl = this.$el.find(".cq-community-groups").get(0);
            /* global Coral */
            Coral.commons.ready(tbl, function() {
                self.initInfiniScroll();
            });
        },

        render: function() {
            var collection = this.$el.find(".cq-community-groups").adaptTo("foundation-collection");
            collection.clear();
            this.append(0, this.model.get("items").length);
            if (SCF.shell2 && SCF.shell2.isShell2()) {
                SCF.shell2.enforceRowSelectableState();
            }
        },

        append: function(start, end) {
            SCF.log.debug("InfinitScroll-append", start, end);

            var that = this;
            var itemsToAppend = this.model.get("items").slice(start, end);
            var list = this.$el.find("tbody[is='coral-table-body']");
            var addItem = function(model, list, view) {
                var itemView = new MemberGroupView({
                    model: model,
                    parentView: view
                });
                itemView._parentView = view;
                model._isReady = true;
                itemView.render();
                itemView.bindView();
                list.append(itemView.el);
            };
            _.each(itemsToAppend, function(model) {
                addItem(model, list, that);
            });
        },

        initInfiniScroll: function() {
            SCF.log.debug("InfinitScroll-init");

            var that = this;

            var getBaseUrl = function(first) {
                var pageInfo = that.model.get("pageInfo");
                var url = (first ? pageInfo.previousPageURL : pageInfo.nextPageURL).replace("html", "json") +
                    that.suffix;
                return url;
            };

            this.collection = new MemberGroupListCollection();
            this.collection.model = MemberGroupModel;
            this.collection.parent = that;
            this.collection.set(this.model.get("items"), {
                "silent": true
            });
            this.collection.url = getBaseUrl(true);

            this.infiniScroll = new Backbone.InfiniScroll(this.collection, {

                strict: false,
                pageSize: that.model.get("pageInfo").pageSize,
                scrollOffset: 100,
                target: this.$el.find(".coral-Table-wrapper-container"),

                onFetch: function() {

                    SCF.log.debug("InfinitScroll-onFetch");

                    var url = getBaseUrl();
                    that.collection.url = decodeURIComponent(url);

                    SCF.log.debug("infiniScroll collection url:" + url);

                },

                success: function(collection, response) {
                    SCF.log.debug("InfinitScroll-success");
                    if (typeof response.items !== "undefined") {
                        if (response.items !== null && response.items.length > 0) {

                            var oldItems = that.model.get("items");
                            var oldCount = oldItems.length;
                            oldItems.add(response.items, {
                                silent: true,
                                merge: true
                            });
                            that.model.set("pageInfo", response.pageInfo, {
                                silent: true
                            });
                            var newCount = oldItems.length;
                            // rather then call render here, call append directly
                            that.append(oldCount, newCount);
                        }
                    }
                }
            });
        }

    });

    // register group list model
    SCF.MemberGroupListModel = MemberGroupListModel;
    SCF.MemberGroupListView = MemberGroupListView;
    SCF.MemberGroupListCollection = MemberGroupListCollection;
    SCF.registerComponent("social/members/components/hbs/groups", SCF.MemberGroupListModel, SCF.MemberGroupListView);

    // register single group model
    SCF.MemberGroupModel = MemberGroupModel;
    SCF.MemberGroupView = MemberGroupView;

    SCF.registerComponent("social/members/components/hbs/groups/group", SCF.MemberGroupModel, SCF.MemberGroupView);

})($, $CQ, _, Backbone, SCF);
