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

(function($CQ, _, Backbone, SCF) {
    // embed cq.social.author.hbs.dashboard in clientlibs
    "use strict";
    // pagination vars
    var start = 0,
        pageSize = 30,
        scrollBuffer = 20;

    // global selectors
    var actionbarSel = ".scf-dashboard-actionbar-container",
        ugcContainerSel = ".scf-ugc-container",
        masonryItemSel = "coral-masonry-item",
        counterSel = ".scf-dashboard-counter",
        quickactionsSel = "coral-quickactions";

    /*
      initialized as empty array and will reset to empty with every dashboardView rerenders
      In handleItemSelect either id or rendered ugc or ugc item model (tbd) will be pushed or
      spliced as user selects or unselects a ugc item
    */
    var bulk_selected_items = [];

    /*
      are we in bulk mode?
      Initialized as false, value toggled by switchMode
      as user clicks bulk toggle button in the tool bar
    */
    var bulk_mode = false;

    // steps for date range slider are:  0, hour ago, day ago, week ago, month ago, year ago, all-time. If not 0 or all-time - send in milliseconds

    // today's timestamp
    var today = new Date();
    var now_ms = Date.parse(new Date());

    // slider values 1,2,3.. mapped to actual timestamp values
    var daterange_value_map = {
        0: now_ms - 60 * 100, // minute ago
        1: now_ms - 60 * 60 * 1000, //hour ago
        2: now_ms - 24 * 60 * 60 * 1000, //day ago
        3: now_ms - 7 * 24 * 60 * 60 * 1000, //week ago
        4: now_ms - 30 * 24 * 60 * 60 * 1000, // ~month (30 days ago)
        5: now_ms - 365 * 24 * 60 * 60 * 1000, // ~year (365 days ago)
        6: now_ms - 10 * 365 * 24 * 60 * 60 * 1000 // ~ 10 years
    };

    var updateBulkActions = function() {
        var bulk_can_allow = true;
        var bulk_can_deny = true;
        var bulk_can_delete = true;
        var bulk_can_close = true;
        var bulk_can_open = true;

        if (bulk_selected_items.length > 0) {
            $(bulk_selected_items).each(function() {
                var card = SCF.Model.findLocal(this, false);
                var modActions = card.get('moderatorActions');
                bulk_can_allow = bulk_can_allow && modActions.canAllow;
                bulk_can_deny = bulk_can_deny && modActions.canDeny;
                bulk_can_delete = bulk_can_delete && card.get('canDelete');
                bulk_can_close = bulk_can_close && modActions.canClose && !card.get('isClosed');
                bulk_can_open = bulk_can_open && modActions.canClose && card.get('isClosed');
            });
        } else {
            bulk_can_allow = false;
            bulk_can_deny = false;
            bulk_can_delete = false;
            bulk_can_close = false;
            bulk_can_open = false;
        }

        if (bulk_can_allow) {
            $CQ('.scf-bulkaction-allow').show();
        } else {
            $CQ('.scf-bulkaction-allow').hide();
        }

        if (bulk_can_deny) {
            $CQ('.scf-bulkaction-deny').show();
        } else {
            $CQ('.scf-bulkaction-deny').hide();
        }

        if (bulk_can_delete) {
            $CQ('.scf-bulkaction-delete').show();
        } else {
            $CQ('.scf-bulkaction-delete').hide();
        }

        if (bulk_can_close) {
            $CQ('.scf-bulkaction-close').show();
        } else {
            $CQ('.scf-bulkaction-close').hide();
        }

        if (bulk_can_open) {
            $CQ('.scf-bulkaction-open').show();
        } else {
            $CQ('.scf-bulkaction-open').hide();
        }
    };

    var turnOffQuickactions = function() {
        $CQ(quickactionsSel).attr("interaction", "off");
    };

    var turnOnQuickactions = function() {
        $CQ(quickactionsSel).attr("interaction", "on");
    };

    var deselectAll = function() {
        $CQ(masonryItemSel).removeAttr("selected");
    };

    // initialize dashborad var globally to allow access to model and view
    var dashboard = null;
    $("document").ready(function() {
        var findDashboard = function() {
            var dashboard;
            $.each(SCF.loadedComponents["social/moderation/dashboard"], function(key, val) {
                dashboard = val;
            });
            return dashboard;
        };
        dashboard = findDashboard();

        $("#filter-apply").click(function(e) {
            e.preventDefault();
            var filterData = dashboard.view.getFilterData(true);
            window.history.pushState({
                "moderation": "search"
            }, "title", "?" + jQuery.param(filterData));
            dashboard.view.filter();
        });

        $('.filters .btn-toggle').click(function() {
            $(this).find('.btn').toggleClass('active');

            if ($(this).find('.btn-primary').size() > 0) {
                $(this).find('.btn').toggleClass('btn-primary');
            }
            $(this).find('.btn').toggleClass('btn-default');

        });

        $("coral-quickactions").on("mouseenter", function(e) {
            $(this).parent().css("z-index", 2);
        }).on("mouseleave", function(e) {
            $(this).parent().css("z-index", 1);
        });

        $(document).on('show.bs.collapse', '.filter-group-container', function() {
            var $this = $(this);
            $this.addClass('panel-active');
            $this.find('.scf-icon-chevronRight').attr('class', 'scf-icon-chevronDown');
        });

        $(document).on('hide.bs.collapse', '.filter-group-container', function() {
            var $this = $(this);
            $this.removeClass('panel-active');
            $this.find('.scf-icon-chevronDown').attr('class', 'scf-icon-chevronRight');
        });

        // filter panel transition
        $(document).on('click', '#filter-toggle', function() {
            $('#col2').toggleClass('col-md-12 col-md-10');
            $('#col1').toggleClass('col-md-0 col-md-2');
            $(this).toggleClass("active");
        });
    });

    var dashboardModel = SCF.Model.extend({
        ALLOW_OPERATION: "social:allow",
        CLOSE_OPERATION: "social:close",
        DELETE_OPERATION: "social:delete",
        DENY_OPERATION: "social:deny",
        requestsAllowed: true,

        relationships: {
            "items": {
                collection: "UgcListCollection",
                model: "UGCItemModel"
            }
        },

        events: {
            CLEAR_SELECTED: "dashboard:clearselected",
            NEXT_PAGE_LOADED: "dashboard:nextpageloaded"
        },

        // when we filter - just reload
        setFilter: function(beg, end, qs) {
            if (this.requestsAllowed) {
                this.requestsAllowed = false;
                this.url = SCF.Model.prototype.url.apply(this) + "?" + qs;
                this.url = this.url.replace(".json", "." + beg + "." + end + ".json");

                this.reload();
            }
        },
        // when we scroll - need to append fetched items
        getNexPage: function(beg, end, qs) {
            if (this.requestsAllowed) {
                this.requestsAllowed = false;
                this.url = SCF.Model.prototype.url.apply(this) + "?" + qs;
                this.url = this.url.replace(".json", "." + beg + "." + end + ".json");

                this.fetch({
                    dataType: "json",
                    xhrFields: {
                        withCredentials: true
                    },
                    // TODO: error case below just copied from fetch in reload?
                    // do we need to revisit?
                    error: function(model, response) {
                        SCF.log.error("Error fetching model");
                        SCF.log.error(response);
                        model.clear();
                        model._isReady = true;
                        model.trigger("model:loaded", model);
                        if (callback && typeof(callback.error) === "function") {
                            callback.error();
                        }
                    },
                    success: function(model) {
                        model.trigger(model.events.NEXT_PAGE_LOADED, model);
                    }
                });
            }
        },

        getUrl: function() {
            return _.isFunction(this.url) ? this.url() : this.url;
        },

        allowSelected: function() {
            var success = _.bind(function(response) {
                // response currently does not return list of
                // updated models so from this poin on there
                // will be some fakiness to update the view
                // see updateAllowed
                $(bulk_selected_items).each(function() {
                    var card = SCF.Model.findLocal(this, false);
                    card.trigger(card.events.ALLOWED, {
                        model: card
                    });
                });
                this.trigger(this.events.CLEAR_SELECTED, {
                    model: this
                });
            }, this);
            var error = _.bind(function(jqxhr, text, error) {
                this.log.error("error allowing in bulk " + error);
                this.trigger('ugc:bulkallowerror', {
                    'error': error
                });
            }, this);
            var postData = {
                'id': 'nobot',
                ':operation': this.ALLOW_OPERATION,
                ':items': bulk_selected_items
            };
            $CQ.ajax(this.getUrl(), {
                dataType: 'json',
                type: 'POST',
                xhrFields: {
                    withCredentials: true
                },
                data: this.addEncoding(postData),
                'success': success,
                'error': error
            });
        },
        denySelected: function() {
            var success = _.bind(function(response) {
                $(bulk_selected_items).each(function() {
                    var card = SCF.Model.findLocal(this, false);
                    card.trigger(card.events.DENIED, {
                        model: card
                    });
                });
                this.trigger(this.events.CLEAR_SELECTED, {
                    model: this
                });
            }, this);
            var error = _.bind(function(jqxhr, text, error) {
                this.log.error("error denying in bulk " + error);
                this.trigger('ugc:bulkdenyerror', {
                    'error': error
                });
            }, this);
            var postData = {
                'id': 'nobot',
                ':operation': this.DENY_OPERATION,
                ':items': bulk_selected_items
            };
            $CQ.ajax(this.getUrl(), {
                dataType: 'json',
                type: 'POST',
                xhrFields: {
                    withCredentials: true
                },
                data: this.addEncoding(postData),
                'success': success,
                'error': error
            });
        },
        deleteSelected: function() {
            var success = _.bind(function(response) {
                $(bulk_selected_items).each(function() {
                    var card = SCF.Model.findLocal(this, false);
                    card.trigger(card.events.DELETED, {
                        model: card
                    });
                    card.trigger('destroy', card);
                });
                this.trigger(this.events.CLEAR_SELECTED, {
                    model: this
                });
            }, this);
            var error = _.bind(function(jqxhr, text, error) {
                this.log.error("error deleting in bulk " + error);
                this.trigger("ugc:bulkdeleteerror", {
                    'error': error
                });
            }, this);
            var postData = {
                'id': 'nobot',
                ':operation': this.DELETE_OPERATION,
                ':items': bulk_selected_items
            };
            $CQ.ajax(this.getUrl(), {
                dataType: 'json',
                type: 'POST',
                xhrFields: {
                    withCredentials: true
                },
                data: this.addEncoding(postData),
                'success': success,
                'error': error
            });
        },
        closeSelected: function(doClose) {
            var success = _.bind(function(response) {
                $(bulk_selected_items).each(function() {
                    var card = SCF.Model.findLocal(this, false);
                    card.trigger(doClose ? card.events.CLOSED : card.events.OPENED, {
                        model: card
                    });
                });
                this.trigger(this.events.CLEAR_SELECTED, {
                    model: this
                });
            }, this);
            var error = _.bind(function(jqxhr, text, error) {
                this.log.error("error deleting in bulk " + error);
                this.trigger("ugc:bulkcloseerror", {
                    'error': error
                });
            }, this);
            var close = doClose ? "true" : "false";
            var postData = {
                'id': 'nobot',
                ':operation': this.CLOSE_OPERATION,
                'social:doClose': close,
                ':items': bulk_selected_items
            };
            $CQ.ajax(this.getUrl(), {
                dataType: 'json',
                type: 'POST',
                xhrFields: {
                    withCredentials: true
                },
                data: this.addEncoding(postData),
                'success': success,
                'error': error
            });
        }
    });

    var UgcListCollection = Backbone.Collection.extend({
        collectionName: "UgcListCollection"
    });

    var dashboardView = SCF.View.extend({

        viewName: "Dashboard",

        init: function() {
            this.beg = start;
            this.end = pageSize;
            this.top = 0;
            this.active = false;
            this.scroll = false;

            if (SCF.Session._isReady && SCF.Session.get("loggedIn") === false) {
                location.href = Granite.HTTP.getContextPath() +
                location.pathname.replace("moderation.html", "signin.html") +
                "?resource=" + encodeURIComponent(location.pathname + location.search);
            } else {
                SCF.Session.on("model:loaded", function() {
                     if (SCF.Session.get("loggedIn") === false) {
                         location.href = Granite.HTTP.getContextPath() +
                         location.pathname.replace("moderation.html", "signin.html") +
                         "?resource=" + encodeURIComponent(location.pathname + location.search);
                     }
                });
            }

            // may need to re-name the event since we are not just clearing selections
            // but also turning off bulk mode
            this.listenTo(this.model, this.model.events.CLEAR_SELECTED, this.toggleBulkMode);
            this.listenTo(this.model, this.model.events.NEXT_PAGE_LOADED, this.renderNextPage);

            // only applying this attribute on publish to not break author
            // this is a temporary fix
            if (this.model.id.indexOf("/social/moderation/") === -1) {
                var userFilterBaseUrl = this.model.id.replace("/ugc", "/userlist");
                $(".scf-js-social-console-userlist").attr("data-url-path", userFilterBaseUrl);
            }

            if (window.location.search !== "") {
                this.setFilterData(window.location.search);
            }
        },

        renderNextPage: function() {
            var self = this;
            var newItemModels = this.model.get("items").models;
            $CQ(newItemModels).each(function() {
                var newItemView = new SCF.UGCItemView({
                    model: this
                });
                self.addChildView(newItemView);
                newItemView.appendTo(ugcContainerSel);
            });
            // TODO: check if we need these 2 flags
            this.active = false;
            this.model.requestsAllowed = true;
            this.scroll = false;

            // if during live-scroll we displayed loading animation - remove it
            $('#col2').removeClass('loading_more');
        },

        scrollUgc: function(event) {
            // this.model.get("totalSize") == 0 means on the previous scroll we fetched last item
            if (this.active || !this.model.requestsAllowed || this.model.get("totalSize") === 0) {
                return;
            }
            var viewport = event.target;
            var viewportHeight = $(viewport).height();
            var $ugcContainer = this.$el.find(".scf-ugc-container");

            var ugcHeight = $ugcContainer.height();
            var scrollTop = $(viewport).scrollTop();
            if (scrollTop + viewportHeight > ugcHeight - scrollBuffer) {
                //this.top = scrollTop;
                this.beg += pageSize;
                this.end = pageSize;
                this.scroll = true;
                this.loadNextPage();
            }
        },

        afterRender: function() {
            this.active = false;
            this.model.requestsAllowed = true;

            // if prior to rendering we displayed loading animation - remove it
            $('#col2').removeClass('loading_more');
        },

        loadNextPage: function() {
            var self = this;
            var postData = self.getFilterData();

            /* display loading animation at the bottom for live-scrolling. It is attached to #col2
            (not to .scf-ugc-container) so that it's always at the same place when we scroll down */
            $('#col2').addClass('loading_more');
            this.model.getNexPage(this.beg, this.end, jQuery.param(postData));
        },

        filter: function() {
            var self = this;
            var postData = self.getFilterData();

            if (!this.scroll) {
                this.beg = 0;
                this.end = 30;
                this.top = 0;
                this.active = true;
            }

            // before refreshing content via this.model.setFilter
            // add loading animation
            $('.scf-ugc-container').html('').addClass('loading_new'); // at the top for full view reload
            this.model.setFilter(this.beg, this.end, jQuery.param(postData));

            // unlike scrolling (loadNextPage) when filtering we will exit bulk mode
            bulk_mode = false;
            self.clearSelections();
        },

        toggleBulkMode: function() {
            var self = this;
            if (bulk_mode) {
                self.clearSelections();
                $CQ(actionbarSel).hide();
                turnOnQuickactions();
                bulk_mode = false;
            } else {
                $CQ(actionbarSel).show();
                bulk_mode = true;
            }

        },

        //returns filter values in a format ready to send to the back end
        getFilterData: function(maskProperty) {
            var data = {};

            //content path - text field
            var contentPathText = "" + $CQ("input.dashboard-content-path-value").val();
            if (contentPathText.trim()) { // If there's no content path text, do not include this param
                data["social:contentPathText"] = [];
                data["social:contentPathText"].push(contentPathText);
            }

            //search - text field
            var searchText = "" + $CQ("input.dashboard-search-value").val();
            if (searchText.trim()) { // If there's no search text, do not include these params
                data["social:searchText"] = [];
                data["social:searchText"].push(searchText);

                /* search - these values are being passed with the request as substitution for values
                of checkboxes that were removed from UI but are still expected by backend */
                data["social:searchOptions"] = ["jcr:title", "jcr:description", "tag"];
            }

            // site
            var sitePropertyName = "social:sites";
            if (maskProperty) {
                sitePropertyName = "social-sites";
            }
            data[sitePropertyName] = [];
            $CQ('[data-id="social:sites"]').find('input[type="checkbox"]').each(function() {
                if ($(this).is(":checked")) {
                    data[sitePropertyName].push(this.value);
                }
            });

            //content type
            data["social:contentType"] = [];
            $CQ('[data-id="social:contentType"]').find('input[type="checkbox"]').each(function() {
                if ($(this).is(":checked")) {
                    data["social:contentType"].push(this.value);
                }
            });

            //status
            data["social:status"] = [];
            $CQ('[data-id="social:status"]').find('input[type="checkbox"]').each(function() {
                if ($(this).is(":checked")) {
                    data["social:status"].push(this.value);
                }
            });

            //flagging
            data["social:flagging"] = [];
            data["social:flagging"].push($("input[name='flagging']:checked").val());

            // user filter selections data
            if ($(".scf-js-social-console-userlist coral-taglist").length) {
                var users = $(".scf-js-social-console-userlist coral-taglist").get(0).values;
                data["social:userSearch"] = users;
            }
          
            // date range slider data
            if (document.querySelector(".scf-dashboard-filter-daterange") &&
                document.querySelector(".scf-dashboard-filter-daterange").startValue) {
                data.maxdate = daterange_value_map[document.querySelector(".scf-dashboard-filter-daterange").startValue];
                data.startvalue = document.querySelector(".scf-dashboard-filter-daterange").startValue;
            }

            if (document.querySelector(".scf-dashboard-filter-daterange") &&
                document.querySelector(".scf-dashboard-filter-daterange").endValue) {
                data.mindate = daterange_value_map[document.querySelector(".scf-dashboard-filter-daterange").endValue];
                data.endvalue = document.querySelector(".scf-dashboard-filter-daterange").endValue;
            }

            //sentiment
            data["social:sentiment"] = [];
            $CQ('[data-id="social:sentiment"]').find('input[type="checkbox"]').each(function() {
                if ($(this).is(":checked")) {
                    data["social:sentiment"].push(this.value);
                }
            });

            //adding charset for all searches
            data._charset_ = "utf-8";

            return data;
        },

        setFilterData: function(data) {
            var dataObject = {};
            data = data.substring(1);
            data = decodeURIComponent(data);
            data = data.split("&");

            for (var i = 0; i < data.length; i++) {
                data[i] = data[i].split("=");
                data[i][1] = data[i][1].replace("+", " ");
                if (!dataObject.hasOwnProperty(data[i][0])) {
                    dataObject[data[i][0]] = new Array(data[i][1]);
                } else {
                    dataObject[data[i][0]].push(data[i][1]);
                }
            }

            if (dataObject.hasOwnProperty("social:contentPathText")) {
                $CQ("input.dashboard-content-path-value").val(dataObject["social:contentPathText"][0]);
            }

            if (dataObject.hasOwnProperty("social:searchText")) {
                $CQ("input.dashboard-search-value").val(dataObject["social:searchText"][0]);
            }

            if (dataObject.hasOwnProperty("social-sites")) {
                $CQ.each(dataObject["social-sites"], function(i, site) {
                    $CQ('[data-id="social:sites"]').find('coral-checkbox[value="' + site + '"]')[0].setAttribute('checked', true);
                });
            }

            if (dataObject.hasOwnProperty("social:contentType")) {
                $CQ.each(dataObject["social:contentType"], function(i, content) {
                    $CQ('[data-id="social:contentType"]').find('coral-checkbox[value="' + content + '"]')[0].setAttribute('checked', true);
                });
            }

            if (dataObject.hasOwnProperty("social:status")) {
                $CQ.each(dataObject["social:status"], function(i, status) {
                    $CQ('[data-id="social:status"]').find('coral-checkbox[value="' + status + '"]')[0].setAttribute('checked', true);
                });
            }

            if (dataObject.hasOwnProperty("social:flagging")) {
                var flag = dataObject["social:flagging"];
                if (flag) {
                    flag = flag[0];
                }
                var flaghandler = $CQ('[data-id="social:flagging"]').find('coral-radio[value="' + flag + '"]')[0];
                Coral.commons.ready(flaghandler, function() {
                    flaghandler.set("checked", true);
                })
            }

            if (dataObject.hasOwnProperty("startvalue") && dataObject.hasOwnProperty("endvalue")) {
                var rangeCtrl = document.querySelector(".scf-dashboard-filter-daterange");
                Coral.commons.ready(rangeCtrl, function() {
                    rangeCtrl.set("startValue", dataObject.startvalue[0]);
                    rangeCtrl.set("endValue", dataObject.endvalue[0]);
                });
            }

            if (dataObject.hasOwnProperty("social:sentiment")) {
                $CQ.each(dataObject["social:sentiment"], function(i, sentiment) {
                    $CQ('[data-id="social:sentiment"]').find('coral-checkbox[value="' + sentiment + '"]')[0].setAttribute('checked', true);
                });
            }

            if (dataObject.hasOwnProperty("social:userSearch")) {
                var userlistCtrl = $(".scf-js-social-console-userlist").get(0);
                Coral.commons.ready(userlistCtrl, function() {
                    var $tag = $(".scf-js-social-console-userlist coral-taglist").get(0);

                    $tag.on('coral-collection:add', function(event) {
                        event.detail.item.label.innerHTML = event.detail.item.value;
                    });
                    for (var i = 0; i < dataObject["social:userSearch"].length; i++) {
                        var val = dataObject["social:userSearch"][i];
                        $tag.items.add({
                            value: val,
                            content: {
                                innerHTML: val
                            },
                            selected: true
                        });
                    }
                });
            }
        },

        clearSelections: function() {
            deselectAll();
            bulk_selected_items = [];
        },

        bulkAllow: function(e) {
            e.preventDefault();
            this.model.allowSelected();
        },
        bulkDeny: function(e) {
            e.preventDefault();
            this.model.denySelected();
        },
        bulkDelete: function(e) {
            e.preventDefault();
            this.model.deleteSelected();
        },
        bulkClose: function(e) {
            e.preventDefault();
            this.model.closeSelected(true);
        },
        bulkOpen: function(e) {
            e.preventDefault();
            this.model.closeSelected(false);
        }

    });

    var ugcItem = SCF.Model.extend({
        modelName: "UGCItemModel",
        DELETE_OPERATION: "social:delete",
        RT_CARD: "social/moderation/card",
        TN_UGCDETAILS: "ugcdetails",
        TN_MODHISTORY: "modhistory",
        replyOperationValues: {
            "social/commons/components/comments/comment": "social/commons/components/comments/comment",
            "social/commons/components/hbs/comments/comment": "social/commons/components/comments/comment",
            "social/forum/components/post": "social:createForumPost",
            "social/forum/components/hbs/topic": "social:createForumPost",
            "social/forum/components/topic": "social:createForumPost",
            "social/forum/components/hbs/post": "social:createForumPost",
            "social/journal/components/hbs/entry_topic": "social:createJournalComment",
            "social/journal/components/hbs/comment": "social:createJournalComment"
        },
        events: {
            REPLY: "ugc:reply",
            ALLOWED: "ugc:allowed",
            ALLOW_ERROR: "ugc:allowerror",
            DENIED: "ugc:denied",
            DENY_ERROR: "ugc:denyerror",
            DELETED: "ugc:deleted",
            DELETE_ERROR: "ugc:deleteerror",
            UPDATED: "ugc:updated",
            OPENED: "ugc:open",
            CLOSED: "ugc:close",
            FRAGMENT_CREATED: "ugc:fragmentcreated",
            FRAGMENT_CREATION_TIMEOUT: "ugc:fragmentcreationtimeout",
            FRAGMENT_CREATION_ERROR: "ugc:fragmentcreationerror"
        },
        // vs: delete and deny are copies of remove and deny from commentsystem.js
        close: function(doClose) {
            var success = _.bind(function(response) {
                // this.resetChildren();
                this.reset(response.response);
                this.trigger('comment:closedOpened', {
                    model: this
                });
                this.trigger(this.events.UPDATED, {
                    model: this
                });
            }, this);
            var error = _.bind(function(jqxhr, text, error) {
                this.log.error("error closing/opening comment " + error);
                this.trigger('comment:closeopenerror', {
                    'error': error
                });
            }, this);
            var close = doClose ? "true" : "false";
            var postData = {
                'id': 'nobot',
                ':operation': 'social:close',
                'social:doClose': close
            };
            $CQ.ajax(SCF.config.urlRoot + this.get('id') + SCF.constants.URL_EXT, {
                dataType: 'json',
                type: 'POST',
                xhrFields: {
                    withCredentials: true
                },
                data: this.addEncoding(postData),
                'success': success,
                'error': error
            });
        },
        remove: function() {
            var success = _.bind(function(response) {
                this.trigger(this.events.DELETED, {
                    model: this
                });
                this.trigger('destroy', this);
            }, this);
            var error = _.bind(function(jqxhr, text, error) {
                this.trigger(this.events.DELETE_ERROR, {
                    'error': error
                });
            }, this);
            $CQ.ajax(SCF.config.urlRoot + this.get('id') + SCF.constants.URL_EXT, {
                dataType: 'json',
                type: 'POST',
                xhrFields: {
                    withCredentials: true
                },
                data: {
                    ':operation': this.DELETE_OPERATION
                },
                'success': success,
                'error': error
            });
        },

        deny: function() {
            var success = _.bind(function(response) {
                this.reset(response.response);
                this.trigger(this.events.DENIED, {
                    model: this
                });
            }, this);
            var error = _.bind(function(jqxhr, text, error) {
                this.log.error("error denying comment " + error);
                this.trigger(this.events.DENY_ERROR, {
                    'error': error
                });
            }, this);
            var postData = {
                'id': 'nobot',
                ':operation': 'social:deny'
            };
            $CQ.ajax(SCF.config.urlRoot + this.get('id') + SCF.constants.URL_EXT, {
                dataType: 'json',
                type: 'POST',
                xhrFields: {
                    withCredentials: true
                },
                data: this.addEncoding(postData),
                'success': success,
                'error': error
            });
        },
        allow: function() {
            var success = _.bind(function(response) {
                this.reset(response.response);
                this.trigger(this.events.ALLOWED, {
                    model: this
                });
            }, this);
            var error = _.bind(function(jqxhr, text, error) {
                this.log.error("error allowing " + error);
                this.trigger(this.events.ALLOW_ERROR, {
                    'error': error
                });
            }, this);
            var postData = {
                'id': 'nobot',
                ':operation': 'social:allow'
            };
            $CQ.ajax(SCF.config.urlRoot + this.get('id') + SCF.constants.URL_EXT, {
                dataType: 'json',
                type: 'POST',
                xhrFields: {
                    withCredentials: true
                },
                data: this.addEncoding(postData),
                'success': success,
                'error': error
            });
        },
        reply: function(data, scb, fcb) {
            var success = _.bind(function(response) {
                this.trigger(this.events.UPDATED, {
                    model: this
                });
            }, this);
            var error = _.bind(function(jqxhr, text, error) {
                this.trigger(this.events.ADD_ERROR, {
                    'error': error
                });
            }, this);
            var postData;
            var rt = this.get('resourceType');
            var operation;

            if (typeof this.replyOperationValues[rt] === 'undefined') {
                operation = "";
            } else {
                operation = this.replyOperationValues[rt];
            }

            var hasAttachment = (typeof data.files != 'undefined');

            if (hasAttachment) {
                // Create a formdata object and add the files
                if (window.FormData) {
                    postData = new FormData();
                }

                if (postData) {
                    $CQ.each(data.files, function(key, value) {
                        postData.append("file", value);
                    });
                    postData.append('id', 'nobot');
                    postData.append(':operation', operation);
                    delete data.files;
                    $CQ.each(data, function(key, value) {
                        postData.append(key, value);
                    });
                }
            } else {
                postData = {
                    'id': 'nobot',
                    ':operation': operation
                };
                _.extend(postData, data);
            }

            $CQ.ajax(SCF.config.urlRoot + this.get('id') + SCF.constants.URL_EXT, {
                dataType: 'json',
                type: 'POST',
                processData: !hasAttachment,
                contentType: (hasAttachment) ? false : 'application/x-www-form-urlencoded; charset=UTF-8',

                xhrFields: {
                    withCredentials: true
                },
                data: this.addEncoding(postData),
                'success': success,
                'error': error
            });
        },
        updateAllowed: function() {
            // this hack only needed in bulck selection mode
            // when multiple updated models are not returned with the resoponse
            if (bulk_mode) {
                var modActions = this.get('moderatorActions');
                modActions.canDeny = true;
                modActions.canAllow = false;
                this.set('moderatorActions', modActions);

                var modStatus = this.get('moderatorStatus');
                modStatus.isApproved = true;
                this.set('moderatorStatus', modStatus);
            }
            this.trigger(this.events.UPDATED, {
                model: this
            });
        },
        updateDenied: function() {
            if (bulk_mode) {
                var modActions = this.get('moderatorActions');
                modActions.canDeny = false;
                modActions.canAllow = true;
                this.set('moderatorActions', modActions);

                var modStatus = this.get('moderatorStatus');
                modStatus.isApproved = false;
                this.set('moderatorStatus', modStatus);
            }
            this.trigger(this.events.UPDATED, {
                model: this
            });
        },
        updateClosed: function() {
            if (bulk_mode) {
                this.set('isClosed', true);
            }
            this.trigger(this.events.UPDATED, {
                model: this
            });
        },
        updateOpened: function() {
            if (bulk_mode) {
                this.set('isClosed', false);
            }
            this.trigger(this.events.UPDATED, {
                model: this
            });
        },
        createFragment: function() {
            var data = {};
            data[":operation"] = "social:createUGCFragment";
            var url = this.get("id");
            var success = _.bind(function(response) {
                var responseObj;
                if(typeof(response.response) !== "object") {
                    responseObj = JSON.parse(response.response);
                  } else {
                    responseObj = response.response;
                   }
                if (responseObj.id.length === 0) {
                    //no fragment object in the response means we timed out
                    this.set("fragmentTimeout", "fragmentTimeout");
                    this.trigger(this.events.FRAGMENT_CREATION_TIMEOUT, {
                        model: this
                    });
                } else {
                    this.set("fragmentTitle", responseObj.title);
                    this.set("fragmentPath", responseObj.id);
                    this.set("fragmentFriendlyUrl", responseObj.friendlyUrl);
                    this.trigger(this.events.FRAGMENT_CREATED, {
                        model: this
                    });
                }
            }, this);
            var error = _.bind(function(response) {
                this.set("fragmentCreationError", "fragmentCreationError");
                this.trigger(this.events.FRAGMENT_CREATION_ERROR, {
                    model: this
                });
            }, this);
            $CQ.ajax(url, {
                type: 'POST',
                processData: true,
                contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
                xhrFields: {
                    withCredentials: true
                },
                headers: {
                    Accept: "application/json"
                },
                data: this.addEncoding(data),
                'success': success,
                'error': error
            });
        }
    });

    var ugcItemView = SCF.View.extend({
        init: function() {
            this.listenTo(this.model, this.model.events.DELETED, this.removeView);
            this.listenTo(this.model, this.model.events.UPDATED, this.ugcViewUpdate);
            this.listenTo(this.model, this.model.events.ALLOWED, this.ugcAllowedUpdate);
            this.listenTo(this.model, this.model.events.DENIED, this.ugcDeniedUpdate);

            this.listenTo(this.model, this.model.events.CLOSED, this.ugcClosedUpdate);
            this.listenTo(this.model, this.model.events.OPENED, this.ugcOpenedUpdate);

            this.listenTo(this.model, this.model.events.FRAGMENT_CREATED, this.fragmentCreatedUpdate);
            this.listenTo(this.model, this.model.events.FRAGMENT_CREATION_TIMEOUT, this.fragmentCreationTimeoutUpdate);
            this.listenTo(this.model, this.model.events.FRAGMENT_CREATION_ERROR, this.fragmentCreationError);
            var dashboardModel = this.model.collection.parent;
            if (!dashboardModel.get("canCreateFragments")) {
                this.$el.find(".scf-quickaction-createfragment").remove();
            }
        },

        render: function() {
            SCF.View.prototype.render.apply(this);
            var dashboardModel = this.model.collection.parent;
            if (!dashboardModel.get("canCreateFragments")) {
                this.$el.find(".scf-quickaction-createfragment").remove();
            }
        },

        fragmentCreatedUpdate: function() {
            this.clearWait();
            if (this.model.has("fragmentTitle") && this.model.has("fragmentPath")) {
                var fragmentCreatedDialog = dashboard.view.$el.find(".scf-js-content-fragment-confirmation-success");
                var titleLink = fragmentCreatedDialog.find(".scf-js-content-fragment-title a");
                titleLink.text(this.model.get("fragmentTitle"));
                titleLink.prop("title", this.model.get("fragmentTitle"));
                titleLink.prop("href", this.model.get("fragmentFriendlyUrl"));
                fragmentCreatedDialog.find(".scf-js-content-fragment-path").text(this.model.get("fragmentPath"));
                this._closeDialog = this.launchDialog({
                    id:"fragmentCreated",
                    content: fragmentCreatedDialog,
                    header: CQ.I18n.get("Content Fragment Created")
                });
                this.model.unset("fragmentTitle");
                this.model.unset("fragmentPath");
            }
        },

        fragmentCreationTimeoutUpdate: function() {
            this.clearWait();
            if (this.model.has("fragmentTimeout")) {
                var fragmentCreatedDialog = dashboard.view.$el.find(".scf-js-content-fragment-confirmation-timeout");
                this._closeDialog = this.launchDialog({
                    content: fragmentCreatedDialog,
                    header: CQ.I18n.get("Content Fragment Creation Timeout")
                });
                this.model.unset("fragmentTimeout");
            }
        },

        fragmentCreationError: function() {
            this.clearWait();
            if (this.model.has("fragmentCreationError")) {
                var fragmentCreatedDialog = dashboard.view.$el.find(".scf-js-content-fragment-confirmation-error");
                this._closeDialog = this.launchDialog({
                    content: fragmentCreatedDialog,
                    variant: 'error',
                    header: CQ.I18n.get("Content Fragment Creation Error")
                });
                this.model.unset("fragmentCreationError");
            }
        },

        launchDialog: function(obj) {
            var dialogContainer = document.createElement("div"),
                dialogContent,
                dialogFooter,
                dialog;
            if (obj.content || (obj.content && obj.content[0])) {
                dialogContent = obj.content.innerHTML || obj.content[0].innerHTML;
            } else {
                dialogContent = "";
            }


            if (obj.footer || (obj.footer && obj.footer[0])) {
                dialogFooter = obj.footer.innerHTML || obj.footer[0].innerHTML;
            } else {
                dialogFooter = '<button is="coral-button" variant="primary" coral-close>' + CQ.I18n.get("Ok") + '</button>';
            }

            dialog = new Coral.Dialog().set({
                id: obj.id || "scf-dialog",
                header: {
                    innerHTML: obj.header || ""
                },
                content: {
                    innerHTML: dialogContent
                },
                footer: {
                    innerHTML: dialogFooter
                },
                closable: "on",
                movable: true,
                variant: obj.variant ? obj.variant : ""
            });
            dialogContainer.setAttribute("class", "scf-dialog-container");
            dialogContainer.appendChild(dialog);
            dialog.show();
            dialog.on('coral-overlay:close', function(event) {
                this.remove();
            });
        },

        /* model event handlers */
        removeView: function() {
            return Backbone.View.prototype.remove.apply(this, arguments);
        },
        ugcViewUpdate: function() {
            this.render();
        },
        /* end model event handlers */
        quickReply: function(e) {
            var self = this;
            e.preventDefault();
            var launchDialog = function(model) {
                var el = document.createElement("div");
                var replyDialogView = new ReplyDialogView({
                    "model": model,
                    "el": el
                });
                var template = SCF.findTemplate(model.id, "replydialog", model.RT_CARD);
                replyDialogView.template = template;
                replyDialogView.render();
                self.launchDialog({
                    content: replyDialogView.$el.find(".card-quick-reply-box:first .card-quick-reply-selected-item"),
                    header: CQ.I18n.get("Reply"),
                    footer: replyDialogView.$el.find(".card-quick-reply-box:first .scf-composer-actions")
                });
            };
            var replydialog = ugcItem.find(this.model.url(), launchDialog, true);
            replydialog.cardView = this;
        },
        addQuickReply: function(e) {
            var msg = this.getField('quickReplyMessage');
            var data = _.extend(this.getOtherProperties(), {
                'message': msg
            });
            if (!SCF.Session.get("loggedIn")) {
                data.userIdentifier = this.getField("anon-name");
                data.email = this.getField("anon-email");
                data.url = this.getField("anon-web");
            }
            if (typeof this.files != 'undefined') {
                data.files = this.files;
            }
            this.clearErrorMessages();
            this.model.reply(data);
            e.preventDefault();
            $CQ('.scf-modal-dialog .card-quick-reply-msg').val('');
            this._closeDialog();
            this._closeDialog = undefined;
            return false;
        },
        quickDetail: function(e) {
            var self = this;
            e.preventDefault();
            var launchDialog = function(model) {
                var el = document.createElement("div");
                var detailView = new UgcDetailView({
                    "model": model,
                    "el": el
                });
                var template = SCF.findTemplate(model.id, model.TN_UGCDETAILS, model.RT_CARD);
                detailView.template = template;
                detailView.render();
                self.launchDialog({
                    content: detailView.el,
                    header: CQ.I18n.get("Content Details")
                });
            };
            var ugcDetail = ugcItem.find(this.model.url(), launchDialog, true);
            ugcDetail.cardView = this;
        },
        quickHistory: function(e) {
            var self = this;
            e.preventDefault();
            var launchDialog = function(model) {
                var dialogObj,
                    template,
                    historyView,
                    el = document.createElement("div");

                historyView = new ModHistoryView({
                    "model": model,
                    "el": el
                });

                template = SCF.findTemplate(model.id, model.TN_MODHISTORY, model.RT_CARD);
                historyView.template = template;
                historyView.render();
                dialogObj = {
                    id: "modHistoryDialog",
                    header: CQ.I18n.get("Moderation History"),
                    content: historyView.el
                };
                self.launchDialog(dialogObj);
            };
            var url = dashboard.model.getUrl();
            var parentLocation = url.substr(0, url.lastIndexOf("/"));
            url = parentLocation + "/activitystream.social.json?filter=targetid_s=" + this.model.id;
            var modHistory = ugcItem.find(url, launchDialog, true);
            modHistory.cardView = this;
        },
        quickUserDetail: function(e) {
            var self = this;
            e.preventDefault();
            var card = this;
            var authorID = this.model.get('author').id;
            var isDisabled = this.model.get('author').disabled;
            var findDashboard = function() {
                var dashboard;
                _.each(SCF.loadedComponents["social/moderation/dashboard"], function(comp) {
                    dashboard = comp;
                });
                return dashboard;
            };
            var dashboard = findDashboard();
            var url = SCF.Model.prototype.url.apply(dashboard.model).replace('ugc', 'userdetails');
            url = url + authorID;

            var launchDialog = function(model) {
                /*
                 * Updating user model with disabled propety we got earlier
                 * from ugc item model author.disabled property.
                 * Ideally user model here should have it
                 */
                model.set("disabled", isDisabled);
                model.set("localeDateFormat", moment.localeData().longDateFormat("L"));
                var userDetailView = new UserDetailView({
                    "model": model,
                    "el": $CQ('<div></div>')
                });
                userDetailView.template = SCF.findTemplate(model.id, "userdetails", "social/moderation/userdetails");
                userDetailView.render();
                self.launchDialog({
                    content: userDetailView.el,
                    header: CQ.I18n.get("Member Details")
                });
            };
            var authorDetails = ugcItem.find(url, launchDialog, true);
            authorDetails.cardView = this;
        },
        quickAllow: function(e) {
            e.preventDefault();
            this.model.allow();
        },
        quickDeny: function(e) {
            e.preventDefault();
            this.model.deny();
        },
        quickDelete: function(e) {
            e.preventDefault();
            this.model.remove();
        },
        quickClose: function(e) {
            e.preventDefault();
            this.model.close(true);
        },
        quickOpen: function(e) {
            e.preventDefault();
            this.model.close(false);
        },
        // Bulk mode init triggered by quick action
        // i.e. first selected item
        quickBulkMode: function(e) {
            e.preventDefault();
            // parent container (element) of the current view
            var item = this.$el[0];
            // select item where checkmark quickaction was clicked
            item.selected = true;
            // turn on bulk mode
            bulk_mode = true;
            // push selected item to bulk_selected_items
            bulk_selected_items.push(this.model.id);
            // hide quickactions on current card
            $CQ(item).find("coral-quickactions").removeAttr("open");
            // turn off all quickactions
            $CQ("coral-quickactions").attr("interaction", "off");
            // update counter
            $CQ(counterSel).text($CQ(counterSel).text().replace(/(\d+)/, bulk_selected_items.length.toString()));
            // hide bulk actions that cannont be applied to selected items
            updateBulkActions();
            // display action bar
            $CQ(actionbarSel).show();
        },
        wait: function() {
            if (!this.maskEl) {
                this.maskEl = $(document.createElement("div")).addClass("foundation-ui-mask");
                this.maskEl.append(new Coral.Wait().set({
                    centered: true,
                    size: "L"
                }));
            }
            this.maskEl.appendTo(document.body);
        },
        clearWait: function() {
            if (this.maskEl) {
                this.maskEl.detach();
            }
        },
        createFragment: function(e) {
            e.preventDefault();
            this.wait();
            this.model.createFragment();
        },
        handleItemSelect: function(e) {
            e.preventDefault();
            var item = this.$el[0];
            if (bulk_mode) {
                // select or unselect this card visually
                item.selected = !item.selected;
                if (!item.selected) {
                    // remove it from selected items
                    var rmove_index = bulk_selected_items.indexOf(this.model.id);
                    bulk_selected_items.splice(rmove_index, 1);
                    // if all items have been unselected - turn off bulk mode
                    if (bulk_selected_items.length === 0) {
                        bulk_mode = false;
                        // and turn on quickaction interaction
                        $CQ("coral-quickactions").attr("interaction", "on");
                        // hide actionbar
                        $CQ(actionbarSel).hide();
                    }
                } else {
                    // push to selected items
                    bulk_selected_items.push(this.model.id);
                }
                // populate counter
                $CQ(counterSel).text($CQ(counterSel).text().replace(/(\d+)/, bulk_selected_items.length.toString()));
                // hide bulk actions that cannont be applied to selected items
                updateBulkActions();
            }
        },
        getOtherProperties: function() {
            return {};
        },
        ugcAllowedUpdate: function() {
            this.model.updateAllowed();
        },
        ugcDeniedUpdate: function() {
            this.model.updateDenied();
        },
        ugcClosedUpdate: function() {
            this.model.updateClosed();
        },
        ugcOpenedUpdate: function() {
            this.model.updateOpened();
        },
        goToUGC: function() {
            if (!bulk_mode) {
                window.open(this.model.get("friendlyUrl"));
            }
        }
    });

    var UgcDetailView = SCF.View.extend({
        viewName: "UgcDetail",
        templateName: "ugcdetails"
    });

    var ModHistoryView = SCF.View.extend({
        viewName: "ModHistory",
        templateName: "modhistory"
    });

    var UserDetailView = SCF.View.extend({
        viewName: "UserDetail",
        templateName: "userdetails"
    });

    var ReplyDialogView = SCF.View.extend({
        viewName: "ReplyDialog",
        templateName: "replydialog"
    });

    SCF.Dashboard = dashboardModel;
    SCF.DashboardView = dashboardView;
    SCF.UGCItem = ugcItem;
    SCF.UGCItemView = ugcItemView;
    SCF.registerComponent('social/moderation/dashboard', SCF.Dashboard, SCF.DashboardView);
    SCF.registerComponent('social/moderation/card', SCF.UGCItem, SCF.UGCItemView);

})($CQ, _, Backbone, SCF);
