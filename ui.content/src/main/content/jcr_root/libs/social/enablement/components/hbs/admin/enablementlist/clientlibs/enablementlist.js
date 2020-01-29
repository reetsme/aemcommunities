/*
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2016 Adobe Systems Incorporated
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

    var start = 0;
    var pageSize = 30;
    var scrollBuffer = 20;
    var actionbarSel = ".scf-enablementlist-actionbar-container";
    var enablementContainerSel = ".se-enablement-list";
    var masonryItemSel = "coral-masonry-item";
    var counterSel = ".scf-enablementlist-counter";
    var quickactionsSel = "coral-quickactions";
    var DELETE_DIALOG_ID = "confirmDeleteDialog";
    var DELETE_ERROR_ID = "deleteErrorAlert";
    var bulkSelectedItems = [];
    var bulkMode = false;
    var updateBulkActions;
    var turnOffQuickactions;
    var turnOnQuickactions;
    var deselectAll;
    var enablementlist;
    var EnablementListModel;
    var EnablementListView;
    var ResourceCardModel;
    var ResourceCardView;
    var EnablementListCollection;

    updateBulkActions = function(evt) {
        var bulkCanDelete = evt.deleteProperty !== undefined ?
            evt.deleteProperty : true;
        var bulkCanSubmit = evt.submitProperty !== undefined ?
            evt.submitProperty : true;
        var bulkCanClose = evt.closeProperty !== undefined ?
            evt.closeProperty : true;

        if (bulkCanDelete) {
            $CQ(".scf-bulkaction-delete").show();
        } else {
            $CQ(".scf-bulkaction-delete").hide();
        }

        if (bulkCanSubmit) {
            $CQ(".scf-bulkaction-submit").show();
        } else {
            $CQ(".scf-bulkaction-submit").hide();
        }

        if (bulkCanClose) {
            $CQ(".scf-bulkaction-close").show();
        } else {
            $CQ(".scf-bulkaction-close").hide();
        }

    };

    turnOffQuickactions = function() {
        $CQ(quickactionsSel).attr("interaction", "off");
    };

    turnOnQuickactions = function() {
        $CQ(quickactionsSel).attr("interaction", "on");
    };

    deselectAll = function() {
        $CQ(masonryItemSel).removeAttr("selected");
    };

    // initialize enablementList var globally to allow access to model and view
    enablementlist = null;
    $("document").ready(function() {
        var findEnablementList = function() {
            var enablementlist;
            $.each(SCF.loadedComponents["social/enablement/components/hbs/admin/enablementlist"], function(key, val) {
                enablementlist = val;
            });
            return enablementlist;
        };
        enablementlist = findEnablementList();

        $("#filter-apply").click(function(e) {
            e.preventDefault();
            enablementlist.view.filter();
            if (enablementlist.view.editProperty !== undefined && !enablementlist.view.editProperty) {
                $CQ(".scf-quickaction-edit").remove();
            }
        });

        $(".scf-enablementlist-search-inp").keyup(function(e) {
            if (e.keyCode === 13) {
                e.preventDefault();
                enablementlist.view.filter();
                if (enablementlist.view.editProperty !== undefined && !enablementlist.view.editProperty) {
                    $CQ(".scf-quickaction-edit").remove();
                }
            }
        });

        $("#filter-clear").click(function(e) {
            e.preventDefault();
            $(".scf-enablementlist-search-inp").val("");
        });
    });

    EnablementListModel = SCF.Model.extend({
        modelName: "EnablementListModel",
        DELETE_OPERATION: "social:deleteEnablementResourceModel",
        requestsAllowed: true,
        relationships: {
            "items": {
                collection: "EnablementListCollection",
                model: "ResourceCardModel"
            }
        },
        events: {
            CLEAR_SELECTED: "enablementlist:clearselected",
            NEXT_PAGE_LOADED: "enablementlist:nextpageloaded"
        },

        // when we scroll - need to append fetched items
        getNexPage: function(beg, end) {
            if (this.requestsAllowed) {
                this.requestsAllowed = false;
                this.url = SCF.Model.prototype.url.apply(this);
                this.url = this.url.replace(".json", "." + beg + "." + end + ".json") + SCF.Util.getContextPath();

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
                        // if (callback && typeof(callback.error) === "function") {
                        //     callback.error();
                        // }
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

        applySearch: function(params) {
            var collection = this.get("items");

            if (collection !== undefined) {
                var url = this.get("pageInfo").urlpattern.replace("${startIndex}", "0")
                    .replace(".html", ".json");

                var separator = url.indexOf("?") !== -1 ? "&" : "?";
                url = url + SCF.Util.getContextPath() + separator + $.param(params);
                this.url = url;
                this.reload();
            } else {
                SCF.log.error("No collection found for itemlist component");
            }
        },

        onClickClose: function() {
            this.getParent().postMessage("{}", "*");
        },

        onClickSubmit: function() {
            var data = [];
            if (bulkSelectedItems.length > 0) {
                $(bulkSelectedItems).each(function() {
                    var card = SCF.Model.findLocal(this, false);
                    var resource = {};
                    resource.path = card.id;
                    resource.id = card.get("resourceUID");
                    resource.url = SCF.config.urlRoot + card.id;
                    resource.type = card.get("primaryAssetType");
                    resource.name = card.get("name");
                    resource.size = card.get("primaryAsset") !== undefined ?
                        card.get("primaryAsset").friendlySize : "unknown";
                    resource.img = card.get("coverImage");
                    resource.catalogVisible = card.get("allowCatalogVisibility") || false;
                    data.push(resource);
                });
            }
            var send = {
                "data": data,
                "config": {
                    "action": "done"
                }
            };

            this.getParent().postMessage(JSON.stringify(send), "*");
        },

        getParent: function() {
            if (window.opener) {
                return window.opener;
            }
            return window.parent;
        },

        onClickDelete: function(suffix) {
            if (bulkSelectedItems.length > 0) {
                this.suffix = suffix;
                $("#" + DELETE_DIALOG_ID).remove();
                var message;
                var header;
                var dialogFooter =
                    "<button id=\"cancelButton\" is=\"coral-button\" variant=\"default\" coral-close>" +
                    Granite.I18n.get("Cancel") + "</button>" +
                    "<button id=\"acceptButton\" is=\"coral-button\" variant=\"warning\">" +
                    Granite.I18n.get("Delete") + "</button>";
                if (bulkSelectedItems.length > 1) {
                    message = Granite.I18n.get("You are about to delete the following resources:");
                    header = Granite.I18n.get("Delete Resources");
                } else {
                    message = Granite.I18n.get("You are about to delete the following resource:");
                    header = Granite.I18n.get("Delete Resource");
                }
                message += "<ul>";
                $.each(bulkSelectedItems, function(k, v) {
                    message += "<li><b>" + v + "</b></li>";
                });
                message += "</ul>";
                var dialog = new Coral.Dialog().set({
                    id: DELETE_DIALOG_ID,
                    header: {
                        innerHTML: header
                    },
                    content: {
                        innerHTML: message
                    },
                    footer: {
                        innerHTML: dialogFooter
                    }
                });
                document.body.appendChild(dialog);
                dialog.on("click", "#acceptButton", $.proxy(this.deleteSelected, this));
                dialog.show();
            }
        },

        deleteSelected: function() {
            $("#" + DELETE_DIALOG_ID).hide();
            $("#" + DELETE_DIALOG_ID).remove();
            var success = _.bind(function() {
                $(bulkSelectedItems).each(function() {
                    var card = SCF.Model.findLocal(this, false);
                    card.trigger(card.events.ITEM_DELETED, {
                        model: card
                    });
                });
                this.trigger(this.events.CLEAR_SELECTED, {
                    model: this
                });
            }, this);
            var error = _.bind(function(jqxhr, text, error) {
                $("#" + DELETE_ERROR_ID).remove();
                var closeButton = "<div style=\"text-align:right\">" +
                    "<button is=\"coral-button\" variant=\"minimal\" coral-close>" + Granite.I18n.get("Close") +
                    "</button></div>";
                var alert = new Coral.Alert().set({
                    id: DELETE_ERROR_ID,
                    size: Coral.Alert.size.LARGE,
                    variant: "error",
                    header: {
                        innerHTML: Granite.I18n.get("Error when deleting resource(s)")
                    },
                    content: {
                        innerHTML: error + closeButton
                    }
                });
                document.body.appendChild(alert);
                // clearSelections();
            }, this);
            var postData = {
                ":operation": this.DELETE_OPERATION,
                ":applyTo": bulkSelectedItems
            };
            $CQ.ajax(SCF.config.urlRoot + this.suffix, {
                dataType: "json",
                type: "POST",
                xhrFields: {
                    withCredentials: true
                },
                data: this.addEncoding(postData),
                "success": success,
                "error": error
            });
        }
    });

    EnablementListView = SCF.View.extend({
        viewName: "EnablementListView",
        el: "#resource-picker",
        init: function() {
            this.beg = start;
            this.end = pageSize;
            this.top = 0;
            this.active = false;
            this.scroll = true;
            this.suffix = SCF.Util.getContextPath();

            if (this.model.id.indexOf("resourcepicker") !== -1 ||
                this.model.id.indexOf("learningpathpicker") !== -1) {
                $CQ(actionbarSel).show();
                turnOffQuickactions();
                bulkMode = true;
            }

            // Reads edit property and filters quick actions if needed
            if (typeof this.model.get("properties").edit !== "undefined" && !this.model.get("properties").edit) {
                this.editProperty = false;
                $CQ(".scf-quickaction-edit").remove();
            }

            // Reads edit property and filters quick actions if needed
            if (typeof this.model.get("properties").bulkDelete !== "undefined" &&
                !this.model.get("properties").bulkDelete) {
                this.deleteProperty = false;
                $CQ(".scf-bulkaction-delete").hide();
            }

            // Reads edit property and filters quick actions if needed
            if (typeof this.model.get("properties").bulkSubmit !== "undefined" &&
                !this.model.get("properties").bulkSubmit) {
                this.submitProperty = false;
                $CQ(".scf-bulkaction-submit").hide();
            }

            // Reads edit property and filters quick actions if needed
            if (typeof this.model.get("properties").bulkClose !== "undefined" &&
                !this.model.get("properties").bulkClose) {
                this.closeProperty = false;
                $CQ(".scf-bulkaction-close").hide();
            }

            // may need to re-name the event since we are not just clearing selections
            // but also turning off bulk mode
            this.listenTo(this.model, this.model.events.CLEAR_SELECTED, this.toggleBulkMode);
            this.listenTo(this.model, this.model.events.NEXT_PAGE_LOADED, this.renderNextPage);
            var that = this;
            function loadMoreResources() {
                if (($(".enablementlist").height() > $("#enablement-list").height()) &&
                  that.model.get("totalSize") > 0) {
                    that.beg += pageSize;
                    that.end = pageSize;
                    that.scroll = true;
                    that.loadNextPage();
                }
            }
            $(window).resize(loadMoreResources);
            $(window).load(loadMoreResources);
        },

        renderNextPage: function() {
            var self = this;
            var newItemModels = this.model.get("items").models;
            $CQ(newItemModels).each(function() {
                var newItemView = new SCF.ResourceCardView({
                    model: this
                });
                self.addChildView(newItemView);
                newItemView.appendTo(enablementContainerSel);
            });
            // TODO: check if we need these 2 flags
            this.active = false;
            this.model.requestsAllowed = true;
            this.scroll = false;

            // if during live-scroll we displayed loading animation - remove it
            $("#enablement-list").removeClass("loading_more");
        },

        scrollEnablementList: function(event) {
            // this.model.get("totalSize") == 0 means on the previous scroll we fetched last item
            if (this.active || !this.model.requestsAllowed || this.model.get("totalSize") === 0) {
                return;
            }
            var viewport = event.target;
            var viewportHeight = $(viewport).height();
            var $listContainer = this.$el.find(".se-enablement-list");

            var listHeight = $listContainer.height();
            var scrollTop = $(viewport).scrollTop();
            if (scrollTop + viewportHeight > listHeight - scrollBuffer) {
                // this.top = scrollTop;
                this.beg += pageSize;
                this.end = pageSize;
                this.scroll = true;
                this.loadNextPage();
            }
        },

        loadNextPage: function() {

            /* display loading animation at the bottom for live-scrolling. It is attached to #enablement-list
            so that it's always at the same place when we scroll down */
            $("#enablement-list").addClass("loading_more");
            this.model.getNexPage(this.beg, this.end);
        },

        filter: function() {
            var searchText = $(".scf-enablementlist-search-inp").val();

            var parameters = {
                "filter": true,
                "searchText": encodeURIComponent(searchText)
            };

            this.model.applySearch(parameters);
            if (this.resource.indexOf("resourcepicker") !== -1 ||
                this.resource.indexOf("learningpathpicker") !== -1) {
                $CQ(actionbarSel).show();
                turnOffQuickactions();
                bulkMode = true;
            }
            this.clearSelections();
        },

        toggleBulkMode: function() {
            var self = this;
            if (bulkMode) {
                self.clearSelections();
                $CQ(actionbarSel).hide();
                turnOnQuickactions();
                bulkMode = false;
            } else {
                $CQ(actionbarSel).show();
                turnOffQuickactions();
                bulkMode = true;
            }
            updateBulkActions(this);
        },

        clearSelections: function() {
            deselectAll();
            bulkSelectedItems = [];
        },

        bulkDelete: function(e) {
            e.preventDefault();
            this.model.onClickDelete(this.suffix);
        },

        bulkSubmit: function(e) {
            e.preventDefault();
            this.model.onClickSubmit();
        },

        bulkClose: function(e) {
            e.preventDefault();
            this.model.onClickClose();
        }
    });

    ResourceCardModel = SCF.Model.extend({
        modelName: "ResourceCardModel",
        events: {
            ITEM_SELECTED: "scf:itemSelected",
            ITEM_DELETED: "scf:itemDeleted"
        }
    });

    ResourceCardView = SCF.View.extend({
        viewName: "ResourceCardView",

        init: function() {
            this.listenTo(this.model, this.model.events.ITEM_DELETED, this.removeView);
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
            bulkMode = true;
            // push selected item to bulkSelectedItems
            bulkSelectedItems.push(this.model.id);
            // hide quickactions on current card
            $CQ(item).find("coral-quickactions").removeAttr("open");
            // turn off all quickactions
            $CQ("coral-quickactions").attr("interaction", "off");
            // update counter
            $CQ(counterSel).text($CQ(counterSel).text().replace(/(\d+)/, bulkSelectedItems.length.toString()));
            // hide bulk actions that cannont be applied to selected items
            updateBulkActions(this._parentView);
            // display action bar
            $CQ(actionbarSel).show();
        },

        handleItemSelect: function(e) {
            e.preventDefault();
            var item = this.$el[0];
            if (bulkMode) {
                // select or unselect this card visually
                item.selected = !item.selected;
                if (!item.selected) {
                    // remove it from selected items
                    var removeIndex = bulkSelectedItems.indexOf(this.model.id);
                    bulkSelectedItems.splice(removeIndex, 1);
                    // if all items have been unselected - turn off bulk mode
                    if (bulkSelectedItems.length === 0 &&
                        (this._parentView.resource.indexOf("resourcepicker") === -1 ||
                            this._parentView.resource.indexOf("learningpathpicker") === -1)) {
                        bulkMode = false;
                        // and turn on quickaction interaction
                        turnOnQuickactions();
                        // hide actionbar
                        $CQ(actionbarSel).hide();
                    }
                } else {
                    // push to selected items
                    bulkSelectedItems.push(this.model.id);
                    turnOffQuickactions();
                    $CQ(actionbarSel).show();
                }
                // populate counter
                $CQ(counterSel).text($CQ(counterSel).text().replace(/(\d+)/, bulkSelectedItems.length.toString()));
                // hide bulk actions that cannont be applied to selected items
                updateBulkActions(this._parentView);
            } else {
                if (this.model.get("enablementType") === "learningpath") {
                    window.location.href = Granite.HTTP.getContextPath() +
                        "/communities/learningpath-info.html" + this.model.id;
                } else {
                    window.location.href = Granite.HTTP.getContextPath() +
                        "/communities/resource-info.html" + this.model.id;
                }
            }
        },

        quickEdit: function(e) {
            e.preventDefault();
            if (this.model.get("enablementType") === "learningpath") {
                window.location.href = Granite.HTTP.getContextPath() +
                    "/communities/learningpath-create.html" + this.model.id;
            } else {
                window.location.href = Granite.HTTP.getContextPath() +
                    "/communities/resource-create.html" + this.model.id;
            }
        },

        removeView: function() {
            return Backbone.View.prototype.remove.apply(this, arguments);
        }
    });

    EnablementListCollection = SCF.Collection.extend({
        collectionName: "EnablementListCollection",
        parse: function(response) {
            SCF.log.debug("collection parse");
            return response.items;
        }
    });

    SCF.EnablementListModel = EnablementListModel;
    SCF.EnablementListView = EnablementListView;
    SCF.ResourceCardModel = ResourceCardModel;
    SCF.ResourceCardView = ResourceCardView;
    SCF.EnablementListCollection = EnablementListCollection;

    SCF.registerComponent("social/enablement/components/hbs/admin/enablementlist",
        SCF.EnablementListModel, SCF.EnablementListView);
    SCF.registerComponent("social/enablement/components/hbs/admin/enablementlist/resourcecard",
        SCF.ResourceCardModel, SCF.ResourceCardView);
    SCF.registerComponent("social/enablement/components/hbs/admin/enablementlist/learningpathcard",
        SCF.ResourceCardModel, SCF.ResourceCardView);

})($CQ, _, Backbone, SCF, Granite);
