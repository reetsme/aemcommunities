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

(function(window, document, Granite, $, $CQ, _, Backbone, SCF) { // jshint ignore:line
    "use strict";
    var start = 0;
    var page_size = 40;
    var scrollBuffer = 10;
    var dashboard = null;

    // some dom selectors
    var user_filter_sel = "#userfilter input";
    var user_taglist_sel = "#userfilter .js-coral-Autocomplete-tagList"; // these are the selected users
    var site_filter_sel = "#sitefilter input";
    var user_banned_sel = ".scf-js-ban-status-banned";
    var user_unbanned_sel = ".scf-js-ban-status-unbanned";

    function getFilterSelections() {

        // user filter data - array of IDs
        var user_filter_values = $(user_taglist_sel).data("tagList").getValues();
        var user_length = user_filter_values.length;
        var user_filter_json = "";

        if (user_length > 0) {
            user_filter_json += "&filter=[";
            $.each(user_filter_values, function(key, val) {
                var authId = val.split("/")[val.split("/").length - 1];
                var del_str = key == user_length - 1 ? "" : ",";
                user_filter_json += '{"operation":"LIKE","rep:authorizableId":"' + authId + '"}' + del_str;
            });
            user_filter_json += "]";
        }

        // site filter data - single ID. API currently does not support filtering by multiple sites
        //var site_filter_values = $("#sitefilter .js-coral-Autocomplete-tagList").data("tagList").getValues();
        var site_filter_val = $(site_filter_sel).val();
        var site_filter = "";
        if (site_filter_val.length > 0) {
            site_filter = "&siteId=" + site_filter_val;
        }

        // banned - unbanned status, if both are checked or unchecked - no need to send anything,
        // so only if either one or another, will need to change if more statuses are added
        var status_filter_json = "";
        if ($(".scf-js-ban-status:checked").length > 0 && $(".scf-js-ban-status:checked").length < $(".scf-js-ban-status").length) {
            if ($(user_banned_sel).is(":checked")) {
                user_filter_json += '&filter=[{"operation":"LIKE","rep:disabled":"inactive"}]';
            } else if ($(user_unbanned_sel).is(":checked")) {
                user_filter_json += '&filter=[{"operation":"NOTEXIST","rep:disabled":"inactive"}]';
            }
        }

        return user_filter_json + status_filter_json + site_filter;
    }

    function modelReloadWithFilters(model) {
        var qs = getFilterSelections();
        // use fresh url from Model prototype and attach parameters to it
        model.url = SCF.Model.prototype.url.apply(model) + "?type=users" + qs;
        model.reload();
    }

    $("document").ready(function() {

        // initialize dashborad var globally to allow access to model and view
        var findDashboard = function() {
            var dashboard;
            if (!SCF.loadedComponents["social/members/components/hbs/users"]) {
                return undefined;
            }
            $.each(SCF.loadedComponents["social/members/components/hbs/users"], function(key, val) {
                dashboard = val;
            });
            return dashboard;
        };
        var dashboard = findDashboard();

        if (!dashboard) {
            return;
        }

        // can we use /libs/social/console/components/hbs/userlist for this?
        // populate user filter (coral autocomplete) with users from publish asynchronously
        $(user_filter_sel).on("input", function(e) {
            e.stopPropagation();
            var $selectListEl = $("#userfilter .js-coral-Autocomplete-selectList");
            var selectList = $selectListEl.data("selectList");
            $selectListEl.html("");
            var query = this.value;
            $.get(SCF.config.urlRoot + dashboard.model.id + '.social.0.20.json?&type=users&filter=[{"operation":"like","rep:principalName":"' + query + '"}]', function(response) {
                $(response.items).each(function() {
                    selectList.addOption($('<li class="js-userpicker-item coral-SelectList-item coral-SelectList-item--option foundation-layout-flexmedia foundation-layout-flexmedia-middle" data-value="' + this.id + '" data-display="' + this.name + '"><img class="foundation-layout-flexmedia-img" width="32" height="32" src="' + this.avatarUrl + '"><div class="foundation-layout-flexmedia-bd"><div class="foundation-layout-flexmedia-bd-singleline">' + this.name + '</div><div class="foundation-layout-flexmedia-bd-singleline foundation-layout-util-subtletext">' + this.id + '</div></div></li>'));
                });
            });
        });

        // apply filters - collect filter selections and attach as filter parameters to user collection api call
        $("#filter-apply").click(function() {
            start = 0;
            modelReloadWithFilters(dashboard.model);
        });

        // clear all fitlers and call model.reload
        $("#filter-clear").click(function() {

            // user filter
            var selected_users = $(user_taglist_sel).data("tagList").getValues();
            if (selected_users && selected_users.length > 0) {
                $(selected_users).each(function() {
                    $(user_taglist_sel).data("tagList").removeItem(this);
                });
            }

            // site filter
            $(site_filter_sel).val("");

            // group filter - add once it is hooked up. Will depend on whether it is single of multi selection

            /*  text filter - add once it is hooked up. Might be not needed and removed.
                in the contest of user management it pretty much duplicates user filter */

            // ban status filter
            $(user_banned_sel).removeAttr("checked");
            $(user_unbanned_sel).removeAttr("checked");

            modelReloadWithFilters(dashboard.model);

        });
    });

    // model and view placeholder
    var userListModel = SCF.Model.extend({
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
        },

        scroll: function() {
            if (this.requestsAllowed) {
                var that = this;
                var qs = getFilterSelections();
                this.requestsAllowed = false;
                var url = this.getUrl();
                url = url.indexOf("?type=users") != -1 ? url : url + "?type=users";
                start += page_size;
                url = url.replace(".json", "." + start + "." + page_size + ".json") + qs;
                var moreUsers = this.constructor.find(url, function(model) {
                    var items = model.get("items");
                    if (model.get("totalSize") === 0) {
                        return false;
                    } else {
                        var oldItems = that.get("items");
                        oldItems.add(items.models, {
                            silent: true,
                            merge: true
                        });
                        /* Models are merged and now triggering LOADED will trigger SCF's native render().
                         * After that Granite grid layout will be applied to rendered items wrapping them into columns etc.
                         * Better way would be to write a custom render() that will append new items to already rendered ones
                         * but it isn't as easy as it was in ModX due to above mentioned Granite's layout. Checked DAM, looks
                         * like they are re-rendering the whole thing during infinite scroll as well. This is a good item for
                         * as separate improvement issue.
                         */
                        that.trigger(that.events.LOADED, {
                            model: that
                        });
                    }
                }, true);
            }
        }

    });

    var UserListCollection = Backbone.Collection.extend({
        collectionName: "UserListCollection"
    });

    var userModel = SCF.Model.extend({

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
                ':operation': 'social:disableUser'
            };

            //$CQ.ajax(SCF.config.urlRoot + id + SCF.constants.URL_EXT, {
            //SCF model currently doesn't provide operations endpoint url so for now hardcoding this one
            $CQ.ajax(SCF.config.urlRoot + "/libs/social/moderation/content/admindashboard/jcr:content/body/content/content/items/modcontainer/userdetails.social.json/" + id, {
                dataType: 'json',
                type: 'POST',
                xhrFields: {
                    withCredentials: true
                },
                data: this.addEncoding(postData),
                'success': function(response) {
                    self.trigger(self.events.BAN, {
                        model: self
                    });
                },
                'error': function(error) {
                    // implement error handling
                    console.log(error);
                }
            });
        },

        unban: function() {
            var self = this;
            var id = this.get("profilePath");

            var postData = {
                ':operation': 'social:enableUser'
            };

            //$CQ.ajax(SCF.config.urlRoot + id + SCF.constants.URL_EXT, {
            $CQ.ajax(SCF.config.urlRoot + "/libs/social/moderation/content/admindashboard/jcr:content/body/content/content/items/modcontainer/userdetails.social.json/" + id, {
                dataType: 'json',
                type: 'POST',
                xhrFields: {
                    withCredentials: true
                },
                data: this.addEncoding(postData),
                'success': function(response) {
                    self.trigger(self.events.UNBAN, {
                        model: self
                    });
                },
                'error': function(error) {
                    // implement error handling
                    console.log(error);
                }
            });
        }
    });

    var userListView = SCF.View.extend({
        viewName: 'userList',

        init: function() {

        },

        scroll: function(e) {
            var $scroll_el = $(e.target);
            // height of the content that has been scrolled up
            var scrollTop = $scroll_el.scrollTop();
            // height of viewport
            var scrollHeight = $scroll_el.height();
            // height of entire content container including portion outside and inside of the viewport
            var contentHeight = $scroll_el.get(0).scrollHeight;
            // using scrollBuffer here to make sure scrolling doesn't get stuck due to an extra pixel lost somewhere
            if (scrollTop + scrollHeight >= contentHeight - scrollBuffer) {
                this.model.scroll();
            }
        },

        afterRender: function() {
            // apply layout
            Granite.UI.Foundation.Layouts.layout($(".grid"));
            var $scroll_el = this.$el.find(".foundation-collection-container");
            var scrollHeight = $scroll_el.height();
            var contentHeight = $scroll_el.get(0).scrollHeight;
            // position scroll bar away from the bottom of the scroll area
            var scrollTop_afterRender = contentHeight - scrollHeight - scrollHeight * 0.7;
            $scroll_el.scrollTop(scrollTop_afterRender);
            this.model.requestsAllowed = true;
        }

    });

    // single user view
    var userView = SCF.View.extend({
        viewName: 'user',

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
            var item_status_container = $(this.$el).find(".scf-user-status");

            if ($(item_status_container).find(".icon-ban").length > 0) {
                $(item_status_container).find(".icon-ban").show();
            } else {
                $(item_status_container).append('<i class="coral-Icon coral-Icon--exclude coral-Icon--sizeXS icon-ban" title="' + CQ.I18n.get("Banned") + '"></i>');
            }
        },

        handleUnBan: function() {
            $(this.$el).find(".scf-user-status .icon-ban").hide();
        }

    });

    // register user list model
    SCF.UserList = userListModel;
    SCF.UserListView = userListView;
    SCF.registerComponent('social/console/components/hbs/users', SCF.UserList, SCF.UserListView);

    // register single user model
    SCF.User = userModel;
    SCF.UserView = userView;

    SCF.registerComponent('social/console/components/hbs/users/user', SCF.User, SCF.UserView);

})(window, document, Granite, Granite.$, $CQ, _, Backbone, SCF);
