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
// jshint maxparams:7
(function(window, Granite, $, $CQ, _, Backbone, SCF) {
    "use strict";

    document.addEventListener("DOMContentLoaded", function() {
        if (SCF.shell2 && SCF.shell2.isShell2()) {
            SCF.shell2.toggleSelectionMode();
            SCF.shell2.hookFilterButtons("/libs/social/members/content/members/jcr:content/body/content/content/" +
                "items/preview/items/userlist");
        }

    });
    $(function() {
        $(".foundation-mode-change").click(SCF.shell2 && SCF.shell2.toggleSelectionMode);
        $(".js-users-csv-report").click(function() {
            var downloadUrl =
                Granite.HTTP.getContextPath() +
                "/mnt/overlay/social/members/content-shell3/members/jcr:content/views/content/items/userlist.csv?" +
                "timeframe=" + document.querySelector("#cq-social-members-analytics-timeframe").value + "&" +
                $(".js-users-search-form").serialize();
            window.open(downloadUrl, "_blank");
        });
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
    var UserListModel = SCF.Model.extend({
        modelName: "UserListModel",
        requestsAllowed: true,
        events: {
            UPDATED: "model:updated",
            LOADED: "model:loaded"
        },

        relationships: {
            "items": {
                collection: "UserListCollection",
                model: "UserModel"
            }
        },

        getUrl: function() {
            var url = _.isFunction(this.url) ? this.url() : this.url;
            return url;
        }

    });

    var UserListCollection = SCF.Collection.extend({
        collectionName: "UserListCollection",
        parse: function(response) {
            SCF.log.debug("collection parse");
            return response.items;
        }
    });

    var UserModel = SCF.Model.extend({

        modelName: "UserModel",

        events: {
            BAN: "user:ban",
            UNBAN: "user:unban"
        },

        getUrl: function() {
            // this is currently producing wrong URL, will need to fix
            return _.isFunction(this.url) ? this.url() : this.url;
        },

        ban: function() {
            var self = this;
            var id = this.get("profilePath");

            var postData = {
                ":operation": "social:disableUser"
            };

            return $CQ.ajax(
                SCF.config.urlRoot +
                "/libs/social/moderation/content/admindashboard/jcr:content/body/" +
                "content/content/items/modcontainer/userdetails.social.json/" + id, {
                    dataType: "json",
                    type: "POST",
                    xhrFields: {
                        withCredentials: true
                    },
                    data: this.addEncoding(postData),
                    "success": function() {
                        self.set("disabled", true);
                        self.trigger(self.events.BAN, {
                            model: self
                        });
                    },
                    "error": function() {
                        // implement error handling
                    }
                });
        },

        unban: function() {
            var self = this;
            var id = this.get("profilePath");

            var postData = {
                ":operation": "social:enableUser"
            };

            return $CQ.ajax(
                SCF.config.urlRoot +
                "/libs/social/moderation/content/admindashboard/jcr:content/body/" +
                "content/content/items/modcontainer/userdetails.social.json/" + id, {
                    dataType: "json",
                    type: "POST",
                    xhrFields: {
                        withCredentials: true
                    },
                    data: this.addEncoding(postData),
                    "success": function() {
                        self.set("disabled", false);
                        self.trigger(self.events.UNBAN, {
                            model: self
                        });
                    },
                    "error": function() {
                        // implement error handling
                    }
                });
        }
    });

    // single user view
    var UserView = SCF.View.extend({
        viewName: "UserView",

        init: function() {
            this.listenTo(this.model, this.model.events.BAN, this.handleBan);
            this.listenTo(this.model, this.model.events.UNBAN, this.handleUnBan);
        },

        quickBan: function() {
            this.model.ban();
        },

        quickUnBan: function() {
            this.model.unban();
        },

        handleBan: function() {
            var ITEM_STATUS_CONTAINER = $(this.$el).find(".scf-user-status");

            if ($(ITEM_STATUS_CONTAINER).find(".icon-ban").length > 0) {
                $(ITEM_STATUS_CONTAINER).find(".icon-ban").show();
            } else {
                $(ITEM_STATUS_CONTAINER).append("<i class='coral-Icon coral-Icon--exclude " +
                    "coral-Icon--sizeXS icon-ban' title='" + CQ.I18n.get("Banned") + "'></i>");
            }
        },

        handleUnBan: function() {
            $(this.$el).find(".scf-user-status .icon-ban").hide();
        }

    });

    var UserListView = SCF.View.extend({
        viewName: "UserListView",

        init: function() {
            var self = this;
            self.suffix = SCF.Util.getContextPath();
            var tbl = this.$el.find(".cq-community-members").get(0);
            this.listenTo(this.model, "sync", this.onSync);
            this.listenTo(this.model, "change:pageInfo", this.onPageInfoChange);

            /* global Coral */
            Coral.commons.ready(tbl, function() {
                self.initInfiniScroll();
                $CQ(
                    ".foundation-mode-switcher[data-foundation-mode-switcher-group='cq-community-members']" +
                    " .granite-collection-deselect").on("click", function(event) {
                    self.onClickCloseActionBar(event);
                });
                tbl.on("coral-table:change", function(event) {
                    self.onMemberSelected(event);
                });
                $(window).adaptTo("foundation-registry").register(
                    "foundation.collection.action.action", {
                        name: "cq.community.members.search.member",
                        handler: function() {
                            self.onSearchUsers();
                        }
                    });
                $(window).adaptTo("foundation-registry").register(
                    "foundation.collection.action.action", {
                        name: "cq.community.members.ban.member",
                        handler: function(name, el, config, collection, selections) {
                            self.onClickBan(name, el, config, collection, selections);
                        }
                    });
                $(window).adaptTo("foundation-registry").register(
                    "foundation.collection.action.action", {
                        name: "cq.community.members.unban.member",
                        handler: function(name, el, config, collection, selections) {
                            self.onClickUnban(name, el, config, collection, selections);
                        }
                    });
                if (SCF.shell2 && SCF.shell2.isShell2()) {
                    $(".cq-social-members-ban-users").click(function() {
                        self.onClickBan("cq.community.members.ban.member",
                            null, null, $("table[is=coral-table]")[0]);
                    });
                    $(".cq-social-members-unban-users").click(function() {
                        self.onClickUnban("cq.community.members.unban.member",
                            null, null, $("table[is=coral-table]")[0]);
                    });
                }

            });

            $CQ("#cq-social-members-analytics-timeframe").on("change", function() {
                self.onSearchUsers();
            });
        },

        render: function() {
            $CQ(".foundation-mode-switcher[data-foundation-mode-switcher-group='cq-community-members']" +
                " .granite-collection-deselect").trigger("click");
            var collection = this.$el.find(".cq-community-members").adaptTo("foundation-collection");
            collection.clear();
            this.append(0, this.model.get("items").length);
            if (SCF.shell2 && SCF.shell2.isShell2()) {
                SCF.shell2.enforceRowSelectableState();
            }
        },

        append: function(start, end) {
            SCF.log.debug("InfinitScroll-append", start, end);

            var that = this;
            var coralTable = $CQ("table[is=coral-table]")[0];
            var itemsToAppend = this.model.get("items").slice(start, end);
            var list = this.$el.find("tbody[is='coral-table-body']");
            var addItem = function(model, list, view) {
                var itemView = new UserView({
                    model: model,
                    parentView: view
                });
                itemView._parentView = view;
                model._isReady = true;
                itemView.render();
                itemView.bindView();
                if (!(SCF.shell2 && SCF.shell2.isShell2()) || (SCF.shell2 && SCF.shell2.isShell2() &&
                        coralTable && coralTable.selectable)) {
                    coralTable.variant = Coral.Table.variant.LIST;
                }
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

            this.collection = new UserListCollection();
            this.collection.model = UserModel;
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
        },

        onMemberSelected: function(event) {
            if (event.detail.selection.length > 0) {
                $(".foundation-mode-switcher-item").addClass("foundation-mode-switcher-item-active");
                var labelText = (event.detail.selection.length > 0 ? event.detail.selection.length : 1) +
                    " " + Granite.I18n.get("selected");
                // Couldn't use the setter in Coral due to the icon needing to be behind the text,
                // not sure why this button is different from every other one.
                $(".foundation-admin-selectionstatus").text(labelText);
                var modelsToBan = this.getSelectionModels(event.detail.selection, false);
                if (modelsToBan.length) {
                    $CQ(".cq-community-members-ban-member-activator").prop("disabled", "disabled");
                } else {
                    $CQ(".cq-community-members-ban-member-activator").removeProp("disabled");
                }
                var modelsToUnban = this.getSelectionModels(event.detail.selection, true);
                if (modelsToUnban.length) {
                    $CQ(".cq-community-members-unban-member-activator").prop("disabled", "disabled");
                } else {
                    $CQ(".cq-community-members-unban-member-activator").removeProp("disabled");
                }
            } else {
                $(".foundation-mode-switcher-item").removeClass("foundation-mode-switcher-item-active");
            }
        },

        onClickCloseActionBar: function(e) {
            e.preventDefault();
            e.stopPropagation();

            var items = this.$el.find(".is-selected");

            $CQ.each(items, function(key, value) {
                if ($(value).hasClass("is-selected")) {
                    $(value).removeAttr("aria-selected");
                    $(value).removeAttr("selected");
                    $(value).removeClass("is-selected");
                }
            });
            $(".foundation-mode-switcher-item").removeClass("foundation-mode-switcher-item-active");
        },

        onSearchUsers: function() {
            var keyword = document.querySelector(".scf-js-members-keyword-textbox").value;
            var siteId = document.querySelector(".scf-js-members-site-select").value;
            var activeStatus = document.querySelector(".scf-js-members-status-select").value;
            var timeFrame = document.querySelector("#cq-social-members-analytics-timeframe").value;

            var parameters = {
                _charset_: "utf-8",
                timeframe: timeFrame,
                keyword: keyword,
                siteId: siteId,
                disabled: activeStatus
            };

            if (this.model !== undefined) {
                var url = "/libs/social/members/content-shell3/members/_jcr_content" +
                    "/views/content/items/userlist.social.json?";

                url = url + $.param(parameters);
                this.model.url = url;

                var that = this;
                this.model.fetch({
                    success: function(model, response) {
                        if (response.items !== undefined && response.items.length > 0) {
                            that.$el.find(".coral-Table-wrapper-container").scrollTop(0);
                        }
                    },
                    reset: true
                });
            } else {
                SCF.log.error("No collection found for itemlist component");
            }
        },

        onSync: function(collection, response) {
            this.collection.reset(response.items.models);
            this.model.set("pageInfo", response.pageInfo);
            this.infiniScroll.resetScroll();
            this.render();
        },

        onClickBan: function(name, el, config, collection) {
            var self = this;
            var models = this.getSelectionModels(collection.selectedItems, true);
            if (models.length) {
                $CQ(".cq-community-members-ban-member-activator").prop("disabled", "disabled");
                $(window).adaptTo("foundation-ui").wait();
                var defer;
                $CQ.each(models, function(index, model) {
                    if (index === 0) {
                        defer = model.ban();
                    } else {
                        defer = defer.pipe(function() {
                            return model.ban();
                        });
                    }
                });
                defer.done(function() {
                    $(window).adaptTo("foundation-ui").clearWait();
                    $CQ(".cq-community-members-ban-member-activator").removeProp("disabled");
                    self.render();
                });
            }
        },

        onClickUnban: function(name, el, config, collection) {
            var self = this;
            var models = this.getSelectionModels(collection.selectedItems, false);
            if (models.length) {
                $CQ(".cq-community-members-unban-member-activator").prop("disabled", "disabled");
                $(window).adaptTo("foundation-ui").wait();
                var defer;
                $CQ.each(models, function(index, model) {
                    if (index === 0) {
                        defer = model.unban();
                    } else {
                        defer = defer.pipe(function() {
                            return model.unban();
                        });
                    }
                });
                defer.done(function() {
                    $(window).adaptTo("foundation-ui").clearWait();
                    $CQ(".cq-community-members-unban-member-activator").removeProp("disabled");
                    self.render();
                });
            }
        },

        getSelectionModels: function(selection, ban) {
            var self = this;
            var models = [];
            $CQ.each(selection, function(index, item) {
                var model = self.model.get("items").findWhere({
                    id: item.dataset.componentId,
                    disabled: !ban
                });
                if (model) {
                    models.push(model);
                }
            });
            return models;
        }

    });

    // register user list model
    SCF.UserListModel = UserListModel;
    SCF.UserListView = UserListView;
    SCF.UserListCollection = UserListCollection;
    SCF.registerComponent("social/members/components/hbs/users", SCF.UserListModel, SCF.UserListView);

    // register single user model
    SCF.UserModel = UserModel;
    SCF.UserView = UserView;

    SCF.registerComponent("social/members/components/hbs/users/user", SCF.UserModel, SCF.UserView);

})(window, Granite, $, $CQ, _, Backbone, SCF);
