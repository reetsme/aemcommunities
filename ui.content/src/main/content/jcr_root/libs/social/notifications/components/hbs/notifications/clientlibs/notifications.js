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
(function($CQ, _, Backbone, SCF, Granite) {
    "use strict";

    var Notifications = SCF.Model.extend({
        modelName: "NotificationsModel",
        events: {
            MARK_ALL_READ: "markAllAsRead"
        },
        relationships: {
            "items": {
                collection: "NotificationList",
                model: "NotificationModel"
            }
        },
        handleMarkAllAsRead: function(_url, redirectURL) {
            var success = _.bind(function(response) {
                var items = this.get("items");
                if (items != null) {
                    for (var i = 0; i < items.length; i++) {
                        var model = items.models[i];
                        if (model.get("status") === "UNREAD") {
                            model.set("status", "READ");
                        }
                    };
                }
                this.set("unreadCount", 0);

                this.trigger(this.events.MARK_ALL_READ, items);
                SCF.Util.announce("socialNotificationMarkAsRead", "all");
            }, this);

            var error = _.bind(function(jqxhr, text, error) {
                SCF.log.error("error toggle notification state %o", error);
            }, this);


            var _self = this;
            $CQ.ajax(_url, {
                dataType: "json",
                type: "POST",
                xhrFields: {
                    withCredentials: true
                },
                data: {
                    ":operation": "social:setAllNotificationReadStatus"
                },
                "success": success,
                "error": error
            });
        }
    });
    var NotificationsView = SCF.View.extend({
        viewName: "NotificationsView",
        init: function() {
            this.initInfiniScroll();
            this.listenTo(this.model, this.model.events.MARK_ALL_READ, this.update);
            this.listenTo(this.model, "sync", this.update);
            this.model.fetch();
        },
        initInfiniScroll: function() {
            SCF.log.debug("initInfinitScroll");

            var that = this;
            this.infiniScroll = new Backbone.InfiniScroll(this.model.get("items"), {
                strict: false,
                pageSize: this.model.get("pageInfo").pageSize,
                //target : table,
                scrollOffset: 400,
                onFetch: function() {
                    // set the url here for infiniScroll to use.
                    var collection = that.model.get("items");

                    var url = that.model.get("pageInfo").nextPageURL;
                    if (url.endsWith(".html")) {
                        url = url.replace(".html", ".json");
                    }
                    collection.url = url;
                    SCF.log.debug("infiniScroll collection url:" + url);
                },

                success: function(collection, response) {
                    if (typeof(response.items) !== "undefined") {
                        if (response.items !== null && response.items.length > 0) {
                            // Need to update the model with the new page info
                            that.model.set("pageInfo", response.pageInfo);
                            that.render();
                        }
                    }
                }
            });

        },
        update: function() {
            this.render();
        },
        openPreferencesPage: function(e) {
            var url = Granite.HTTP.getContextPath() + CQ.shared.HTTP.getPath() + "/preferences.html";
            window.location.replace(url); // redirect to the subscription preferences page
        },
        markAllAsRead: function(e) {
            if (this.model.get("unreadCount") > 0) {
                this.model.handleMarkAllAsRead(this.model.get("id"));
            }
        }
    });

    var Notification = SCF.Model.extend({
        modelName: "NotificationModel",
        events: {
            MARK_AS_READ: "markAsRead",
        },
        markAsRead: function(_url, redirectURL) {
            var success = _.bind(function(response) {
                this.set("status", "READ");
                this.trigger(this.events.MARK_AS_READ, {
                    model: this
                });
                if (!_.isUndefined(redirectURL)) {
                    window.location.href = redirectURL;
                } else {
                    SCF.Util.announce("socialNotificationMarkAsRead", 1);
                }
            }, this);

            var error = _.bind(function(jqxhr, text, error) {
                SCF.log.error("error toggle notification state %o", error);
            }, this);


            var _self = this;
            $CQ.ajax(_url, {
                dataType: "json",
                type: "POST",
                xhrFields: {
                    withCredentials: true
                },
                data: {
                    ":operation": "social:setNotificationReadStatus"
                },
                "success": success,
                "error": error
            });
        }

    });

    var ExpandingViewMixin = {
        "MESSAGES": {
            "EXPAND": CQ.I18n.get("Show more"),
            "COLLAPSE": CQ.I18n.get("Show less")
        },
        createExpander: function() {
            var self = this;
            this.$el.find(".scf-js-expand").each(function(i, o) {
                var $o = $(o);
                if (Math.abs(o.scrollHeight - $o.innerHeight()) > 20) {
                    $o.addClass("scf-hasOverflow");
                    $o.parent().find(".scf-js-expandText").css("display", "block");
                    $o.parent().find(".scf-js-expandText").click(function(e) {
                        e.preventDefault();
                        var $target = $(e.currentTarget);
                        var $overFlowCheck = $target.parent().find(".scf-hasOverflow");
                        if ($overFlowCheck.hasClass("scf-js-expand")) {
                            $target.text(self.MESSAGES.COLLAPSE);
                        } else {
                            $target.text(self.MESSAGES.EXPAND);
                        }
                        $overFlowCheck.toggleClass("scf-js-expand");
                    }).show();
                }
            });
        }

    };

    var NotificationView = SCF.View.extend({
        viewName: "NotificationView",

        init: function() {
            this.listenTo(this.model, this.model.events.MARK_AS_READ, this.afterRead);
            this.createExpander();

        },
        update: function() {
            this.render();
        },
        afterRead: function(e) {
            this.render();
            // this class name is not updated by render
            this.$el.removeClass("active");
        },
        markAsRead: function(e) {
            e.preventDefault();
            if (this.model.get("status") == "UNREAD") {
                this.model.markAsRead(this.model.get("path"));
            }
        },
        handleTableRowClick: function(e) {
            var baseURL = e.target.href;
            if (baseURL === undefined || baseURL === null) {
                baseURL = Granite.HTTP.getContextPath() + this.model.get("target").properties.url;
            }else{
                baseURL = Granite.HTTP.getContextPath() + baseURL;
            }
            if (this.model.get("status") == "UNREAD") {
                this.model.markAsRead(this.model.get("path"), e.target.href);
            } else {
                window.location.href = baseURL;
            }
        }
    }).extend(ExpandingViewMixin);

    var NotificationList = SCF.Collection.extend({
        collectioName: "NotificationList",
        parse: function(response) {
            SCF.log.debug("collection parse");
            return response.items;
        }
    });

    SCF.Notifications = Notifications;
    SCF.NotificationsView = NotificationsView;
    SCF.Notification = Notification;
    SCF.NotificationView = NotificationView;
    SCF.NotificationList = NotificationList;

    SCF.registerComponent("social/notifications/components/hbs/notifications", SCF.Notifications, SCF.NotificationsView);
    SCF.registerComponent("social/notifications/components/hbs/notifications/notification", SCF.Notification, SCF.NotificationView);

})($CQ, _, Backbone, SCF, Granite);
