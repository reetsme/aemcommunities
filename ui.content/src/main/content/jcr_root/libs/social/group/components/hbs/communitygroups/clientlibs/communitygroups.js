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
    "use strict";

    //select user
    var initUserSelector = function(el_selector, path) {
        var $el = $(el_selector);
        //userlist node needs to be next to ugc node
        var base_url = path;
        $el.autocomplete({
            source: function(request, response) {
                var searchString = $(el_selector).val();
                var filterObject = {
                    "operation": "CONTAINS",
                    "./@rep:principalName": searchString
                };
                filterObject = [filterObject];
                var filterGivenName = {
                    "operation": "like",
                    "profile/@givenName": searchString
                };
                filterObject.push(filterGivenName);
                var filterFamilyName = {
                    "operation": "like",
                    "profile/@familyName": searchString
                };
                filterObject.push(filterFamilyName);
                filterObject = JSON.stringify(filterObject);

                var userListURL = base_url + ".social.0.20.json";
                userListURL = CQ.shared.HTTP.addParameter(userListURL, "filter", filterObject);
                userListURL = CQ.shared.HTTP.addParameter(userListURL, "type", "users");
                userListURL = CQ.shared.HTTP.addParameter(userListURL, "fromPublisher", "true");
                userListURL = CQ.shared.HTTP.addParameter(userListURL, "_charset_", "utf-8");
                userListURL = CQ.shared.HTTP.addParameter(userListURL, "groupId", "community-members");
                $.get(userListURL, function(data) {
                    var users = data.items;
                    response(users);
                });
            },
            minLength: 3,
            select: function(event, ui) {
                var $el = $(this).parent(),
                    $selected_items = $el.find(".selected-item-label"),
                    isNewSelection = true; // prevent duplicate selections
                if ($selected_items.length > 0) {
                    var selected_ids = $selected_items.map(function() {
                        return $(this).attr("data-id");
                    }).get();

                    isNewSelection = $.inArray(ui.item.authorizableId, selected_ids) == -
                        1;
                }

                if (isNewSelection) {
                    $el.append('<span data-id="' + ui.item.authorizableId +
                        '" class="selected-item-label"><span class="remove-selection" onclick="$(this).parent().remove()">x</span>' +
                        ui.item.name + '</span>');
                }
            }
        }).data("uiAutocomplete")._renderItem = function(ul, item) {
            if (item.avatarUrl) {
                return $("<li></li>")
                    .append("<a><img src='" + item.avatarUrl + "' width='30' height='30'/>&nbsp;" +
                        item.name + "</a>")
                    .data("item.autocomplete", item)
                    .appendTo(ul);
            } else {
                return $("<li></li>")
                    .append("<a>" + item.name + "</a>")
                    .data("item.autocomplete", item)
                    .appendTo(ul);
            }
        };
    };


    var GroupSystem = SCF.Model.extend({
        modelName: "GroupSystemModel",
        relationships: {
            "items": {
                collection: "GroupList",
                model: "GroupModel"
            }
        },
        createOperation: "social:createCommunityGroup",
        events: {
            ADD: "group:added",
            ADD_ERROR: "group:adderror",
            WAITING_FOR_RESPONSE: "group:waitforresponse",
            REFRESH_ALERT: "group:refreshalert"
        },

        addGroup: function(data, scb, fcb) {
            $CQ('.scf-attachment-error').remove(); //remove previous error messages (if any)

            var success = _.bind(function(response) {
                var group = response.response;
                if (group && !$.isEmptyObject(response)) {
                    var GroupKlass = SCF.Models[this.constructor.prototype.relationships
                        .items.model];
                    var newGroup = new GroupKlass(group);
                    newGroup.set("loggedInAsMember", true);
                    newGroup.set("_isNew", true);
                    newGroup._isReady = true;
                    var groups = this.get("items");
                    var isCollectionNew = false;
                    if (!groups) {
                        var CollectionKlass = SCF.Collections[this.constructor.prototype
                            .relationships.items.collection] || Backbone.Collection;
                        groups = new CollectionKlass();
                        groups.model = GroupKlass;
                        groups.parent = this;
                        isCollectionNew = true;
                    }
                    groups.unshift(newGroup);
                    var totalGroups = this.get("totalSize");
                    if (isCollectionNew) {
                        this.set("items", groups);
                    }
                    this.set("totalSize", totalGroups + 1);
                    newGroup.constructor.prototype._cachedModels[group.id] = newGroup;
                    this.trigger(this.events.ADD, {
                        model: this
                    });
                } else {
                    this.trigger(this.events.REFRESH_ALERT, {
                        model: this
                    });
                }
            }, this);
            var error = _.bind(function(jqxhr, text, error) {
                this.trigger(this.events.ADD_ERROR, this.parseServerError(jqxhr, text,
                    error));
            }, this);
            this.trigger(this.events.WAITING_FOR_RESPONSE, {
                model: this
            });
            var postData;
            var hasAttachment = (typeof data.files !== "undefined");

            if (hasAttachment) {
                // Create a formdata object and add the files
                if (window.FormData) {
                    postData = new FormData();
                }

                if (postData) {
                    $CQ.each(data.files, function(key, value) {
                        postData.append("file", value);
                    });
                    postData.append("id", "nobot");
                    postData.append(":operation", this.createOperation);
                    delete data.files;
                    $CQ.each(data, function(key, value) {
                        postData.append(key, value);
                    });
                }
            } else {
                postData = {
                    "id": "nobot",
                    ":operation": this.createOperation
                };
                _.extend(postData, data);
                //postData = this.getCustomProperties(postData, data);
            }

            $CQ.ajax(SCF.config.urlRoot + this.get("id") + SCF.constants.URL_EXT, {
                dataType: "json",
                type: "POST",
                processData: !hasAttachment,
                contentType: (hasAttachment) ? false : "application/x-www-form-urlencoded; charset=UTF-8",
                xhrFields: {
                    withCredentials: true
                },
                data: this.addEncoding(postData),
                "success": success,
                "error": error
            });
        }
    });

    var GroupSystemView = SCF.View.extend({
        viewName: "GroupSystemView",
        init: function() {
            this.listenTo(this.model, this.model.events.ADD, this.update);
            this.listenTo(this.model, this.model.events.ADD_ERROR, this.showErrorOnAdd);
            this.listenTo(this.model, this.model.events.WAITING_FOR_RESPONSE, this.showWaitModal);
            this.listenTo(this.model, this.model.events.REFRESH_ALERT, this.showRefreshAlert);

            if ($(".scf-js-userfilter").length > 0) {
                initUserSelector(".scf-js-userfilter", this.model.id + "/userlist");
            }
        },
        autoPopulateGrpUrl: function() {
            var name = $CQ("#groupName").val();
            if (name != "") {
                $CQ(".scf-alert-group-highlight").remove();
                name = name.toLowerCase();
                name = name.replace(/ /g, "-");
                name = name.replace(/'/g, "");
                name = name.match("^[a-zA-Z0-9-]+");
                $("#groupUrlName").val(name);
            } else {
                $("#groupUrlName").val("");
            }
        },
        update: function(e) {
            //Dont change the order - Backbone and bootstrap interfere with each other
            //Close the modal and then update the view
            this.closeWaitModalE(e);
            this.render();
        },
        showValidateAlert: function() {
            var _parentEl = $CQ('.scf-group-form')[0];
            if (null == _parentEl) {
                _parentEl = $CQ(document.body);
            }
            $CQ(".scf-js-group-validate-error").clone().removeClass("scf-is-hidden").addClass(
                "scf-alert-group-highlight").prependTo(_parentEl);
        },
        showRefreshAlert: function() {
            this.closeWaitModalE();
            var _parentEl = $CQ('.scf-communitygroups')[0];
            if (null == _parentEl) {
                _parentEl = $CQ(document.body);
            }
            $CQ(".scf-js-group-success-alert").clone().removeClass("scf-is-hidden").addClass(
                "scf-alert-group-highlight").prependTo(_parentEl);
        },
        showNewGroupWizard: function(e) {
            e.stopPropagation();

            this.files = undefined;
            var newWizard = this.$el.find(".scf-js-new-group-box");
            $(newWizard).find("input.form-control").val("");
            this._closeModal = this.launchModal(newWizard, CQ.I18n.get("New Group"));
            $("#imgUploadPreview").attr("src", this.model.get("defaultImage"));
            $("input[name=\"privacyType\"][value=\"Open\"]").prop('checked', true);

            var navTabs = $(".nav-tabs");
            navTabs.find("li.active").toggleClass("active");
            navTabs.find("li:nth-child(1)").toggleClass("active");

            var tabContent = $(".scf-tab-content");
            tabContent.find(".scf-tab-pane.active").toggleClass("active");
            tabContent.find(".scf-tab-pane:nth-child(1)").toggleClass("active");
            tabContent.find(".selected-item-label").remove();
        },
        showWaitModal: function(e) {
            //this.closeWaitModalE(e);
            $CQ(".scf-alert-group-highlight").remove();
            $CQ(".scf-js-group-success").modal("show");
            if (this.modalProgressId) {
                clearInterval(this.modalProgressId);
            }
            this.modalProgressId = setInterval(this.updateModalProgress, 1200);
        },
        updateModalProgress: function() {
            var progress = $CQ(".scf-js-group-success .progress-bar").attr("aria-valuenow");
            progress = parseInt(progress) + 1;
            $CQ(".scf-js-group-success .progress-bar").attr("aria-valuenow", progress);
            $CQ(".scf-js-group-success .progress-bar").css("width", progress + "%");
        },
        closeWaitModal: function(e) {
            $CQ(".scf-alert-group-highlight").remove();
            var _parentEl = $CQ('.scf-communitygroups')[0];
            if (null == _parentEl) {
                _parentEl = $CQ(document.body);
            }
            $CQ(".scf-js-group-danger-alert").clone().removeClass("scf-is-hidden").addClass(
                "scf-alert-group-highlight").prependTo(_parentEl);
            console.log("");
        },
        displayAlert: function(element) {},
        closeWaitModalE: function(e) {
            if (this.modalProgressId) {
                clearInterval(this.modalProgressId);
            }
            $CQ(".scf-js-group-success").modal("hide");
        },
        cancelGroup: function(e) {
            e.stopPropagation();
            this._closeModal();
            this._closeModal = undefined;
            this.files = undefined;
        },
        showErrorOnAdd: function(error) {
            this.closeWaitModal();
            this.closeWaitModalE(error);
            //            this.log.error(error);
        },
        hideError: function() {

        },
        previewImages: function() {
            var $imgUploadImage = $("#imgUploadImage");
            $imgUploadImage.attr("data-file-added", "true");
            var _fr = new window.FileReader();
            _fr.readAsDataURL($imgUploadImage.get(0).files[0]);

            _fr.onload = function(e) {
                var _targRes = e.target.result;
                $("#imgUploadPreview").attr("src", _targRes);
            };

        },
        handleTab: function(e) {
            e.preventDefault();
            if ($(e.target.parentElement).hasClass("active")) {
                return;
            }
            var navTabs = $(".nav-tabs");
            navTabs.find("li.active").toggleClass("active");
            $(e.target.parentElement).toggleClass("active");
            var index = $(e.target.parentElement).index() + 1;

            var tabContent = $(".scf-tab-content");
            tabContent.find(".scf-tab-pane.active").toggleClass("active");
            tabContent.find(".scf-tab-pane:nth-child(" + index + ")").toggleClass("active");

            if (index == 3) {
                $(".scf-image-upload").show();
            } else {
                $(".scf-image-upload").hide();
            }
        },
        searchKeyPress: function(e) {
            if (e.keyCode == 13) {
                this.search(e);
            }
        },
        search: function(e) {
            var url = SCF.config.urlRoot + this.model.id;
            url += SCF.constants.SOCIAL_SELECTOR + ".query" + SCF.constants.JSON_EXT;
            var searchValue = encodeURIComponent($("#search").val());
            this.model.search = searchValue;
            if (searchValue != "") {
                url += "?name=" + searchValue;
            }
            this.model.url = url;
            this.model.reload();
        },
        addGroup: function(e) {
            var name = this.getField("name");
            var urlName = this.getField("urlName");
            var description = this.getField("description");
            var invite = $(".scf-js-userfilter").siblings(".selected-item-label").map(
                function() {
                    return $(this).attr("data-id");
                }).get();
            var privacyType = $("input[name=\"privacyType\"]:checked").val();
            var blueprint = this.getField("blueprint");
            if (!name || !urlName) {
                this.showValidateAlert();
                e.preventDefault();
                return false;
            }
            var data = {
                "name": name,
                "urlName": urlName,
                "jcr:description": description,
                "invite": invite,
                "type": privacyType,
                "blueprint": blueprint
            };
            this.files = $("#imgUploadImage")[0].files;
            if (typeof this.files !== "undefined") {
                data.files = this.files;
            }
            this.clearErrorMessages();
            this.model.addGroup(data);
            e.preventDefault();
            this._closeModal();
            this._closeModal = undefined;
            return false;
        }
    });

    var Group = SCF.Model.extend({
        modelName: "GroupModel",
        joinOperation: "social:joinCommunityGroup",
        leaveOperation: "social:leaveCommunityGroup",
        events: {
            JOIN: "group:joined",
            JOIN_ERROR: "group:joinerror",
            LEAVE: "group:left",
            LEAVE_ERROR: "group:leaveerror",
            DELETED: "group:remove"
        },
        relationships: {
            "items": {
                collection: "GroupList",
                model: "GroupModel"
            }
        },

        joinGroup: function(data) {
            var success = _.bind(function(response) {
                //update member status
                this.set("loggedInAsMember", true);
                this.trigger(this.events.JOIN, {
                    model: this
                });
            }, this);

            var postData = {
                "id": "nobot",
                ":operation": this.joinOperation
            };
            _.extend(postData, data);

            $CQ.ajax(SCF.config.urlRoot + this.get("id") + SCF.constants.URL_EXT, {
                dataType: "json",
                type: "POST",
                xhrFields: {
                    withCredentials: true
                },
                data: this.addEncoding(postData),
                "success": success
            });
        },

        leaveGroup: function(data) {
            var success = _.bind(function(response) {
                //update member status
                if (this.get("type") == "Open") {
                    this.set("loggedInAsMember", false);
                    this.trigger(this.events.LEAVE, {
                        model: this
                    });
                } else {
                    this.trigger(this.events.DELETED, {
                        model: this
                    });
                    this.trigger('destroy', this);
                }
            }, this);

            var postData = {
                "id": "nobot",
                ":operation": this.leaveOperation
            };
            _.extend(postData, data);

            $CQ.ajax(SCF.config.urlRoot + this.get("id") + SCF.constants.URL_EXT, {
                dataType: "json",
                type: "POST",
                xhrFields: {
                    withCredentials: true
                },
                data: this.addEncoding(postData),
                "success": success
            });
        }
    });

    var GroupView = SCF.View.extend({
        viewName: "GroupView",
        init: function() {

            this.listenTo(this.model, this.model.events.JOIN, this.update);
            this.listenTo(this.model, this.model.events.JOIN_ERROR, this.showError);
            this.listenTo(this.model, this.model.events.LEAVE, this.update);
            this.listenTo(this.model, this.model.events.LEAVE_ERROR, this.showError);
            this.listenTo(this.model, this.model.events.DELETED, this.remove);
        },
        update: function() {
            this.render();
        },
        showError: function(error) {
            this.$el.find(".scf-js-composer-block input[type='text'], textarea").addClass(
                "scf-error");
            this.addErrorMessage(this.$el.find(
                ".scf-js-composer-block input[type='text'], textarea").first(), error);
            this.log.error(error);
        },
        followGroup: function(e) {
            e.stopPropagation();
            //TODO
        },
        joinGroup: function(e) {
            e.stopPropagation();
            var data = {
                "path": $(e.target).closest(".scf-group-information").find("#groupUrl").attr(
                    "href")
            }
            this.model.joinGroup(data);
            return false;
        },
        leaveGroup: function(e) {
            e.stopPropagation();
            var data = {
                "path": $(e.target).closest(".scf-group-information").find("#groupUrl").attr(
                    "href")
            }
            this.model.leaveGroup(data);
            return false;
        }
    });

    var GroupList = SCF.Collection.extend({
        collectionName: "GroupList"
    });

    SCF.GroupSystem = GroupSystem;
    SCF.GroupSystemView = GroupSystemView;
    SCF.Group = Group;
    SCF.GroupView = GroupView;
    SCF.GroupList = GroupList;
    SCF.registerComponent("social/group/components/hbs/communitygroups/communitygroup", SCF.Group, SCF.GroupView);
    SCF.registerComponent("social/group/components/hbs/communitygroups", SCF.GroupSystem, SCF.GroupSystemView);
})($CQ, _, Backbone, SCF);
