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

(function($CQ, _, Backbone, SCF, Granite) {
    "use strict";

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

    var GroupProfile = SCF.Model.extend({
        modelName: "GroupProfileModel",
        UPDATE_OPERATION: "social:updateMemberGroup",
        CREATE_OPERATION: "social:createMemberGroup",
        ADD_TO_GROUP_OPERATION: "social:addMemberToGroup",
        REMOVE_FROM_GROUP_OPERATION: "social:removeMemberFromGroup",
        events: {
            CREATED: "groupprofile:created",
            UPDATED: "groupprofile:updated"
        },

        GROUP_MANIPULATION_URL: "/libs/social/members/content/content/groupprofile",

        initialize: function() {},

        saveGroup: function(operation) {
            var that = this;

            var error = _.bind(function() {
                that.showOperationMessage(Granite.I18n.get("Error Saving Group"), true);
            }, this);

            var success = _.bind(function() {
                window.location.href = SCF.config.urlRoot + "/communities/groups";
            }, this);

            this.doPost(operation, success, error);
        },

        doPost: function(op, success, error) {
            var postData = {
                "groupId": this.get("authorizableID"),
                "givenName": this.get("profileProperties").givenName,
                "aboutMe": this.get("profileProperties").aboutMe,
                "memberId": this.get("memberId"),
                ":operation": op
            };

            $CQ.ajax(SCF.config.urlRoot + this.GROUP_MANIPULATION_URL + SCF.constants.URL_EXT, {
                dataType: "json",
                type: "POST",
                xhrFields: {
                    withCredentials: true
                },
                data: this.addEncoding(postData),
                "success": success,
                "error": error
            });
        },

        showOperationMessage: function(message, isError) {
            var container = $(".scf-js-member-group-profile-success");
            if (isError) {
                container = $(".scf-js-member-group-profile-error");
            }
            container.text(message);
            container.show().delay(7500).fadeOut();
        }

    });

    var GroupProfileView = SCF.View.extend({
        viewName: "GroupProfile",
        tagName: "div",
        className: "groupProfile",
        init: function() {
            $(".scf-js-parentGroups-container :last").remove();
            this.setMembersData();
            this.initFormValidation();
        },
        initFormValidation: function() {
            var that = this;
            that.checkFormValid();
            var requiredFields = $(that.el).find("input[required]");
            requiredFields.on("change", function() {
                that.checkFormValid();
            });
        },
        checkFormValid: function() {
            var requiredFields = $(this.el).find("input[required]");
            $CQ.each(requiredFields, function(index, item) {
                $(".scf-js-group-profile-save").attr("disabled", (!item.validity.valid));
            });
        },
        setMembersData: function() {
            var that = this;

            /* global Coral */
            this.autocomplete = new Coral.Autocomplete().set({
                multiple: true
            });
            this.request = null;

            $(".scf-js-group-profile-members").append(this.autocomplete);
            $(this.autocomplete).css("width", "100%");

            Coral.commons.ready(that.autocomplete, function() {
                that.autocomplete.on("coral-autocomplete:showsuggestions", function(event) {
                    if (that.request) {
                        that.request.abort();
                    }
                    event.preventDefault();
                    that.request = $.get(SCF.config.urlRoot +
                        "/libs/social/members/content/content/userlist.social.json?_charset_=utf-8&" +
                        "type=allusersgroups&keyword=" +
                        encodeURIComponent(event.detail.value),
                        function(data) {
                            var suggestions = [];
                            if (data && data.items) {
                                $CQ.each(data.items, function(index, item) {
                                    suggestions.push({
                                        value: item.authorizableId,
                                        content: $CQ("<span/>").text(item.name).html() + " (" +
                                            $CQ("<span/>").text(item.authorizableId).html() + ")"
                                    });
                                });
                            }
                            that.autocomplete.addSuggestions(suggestions);
                        }, "json");
                });
                that.autocomplete.on("coral-autocomplete:hidesuggestions", function() {
                    $(that.autocomplete).find(".coral-Autocomplete-input").val("");
                    that.autocomplete.invalid = false;
                    if (that.request) {
                        that.request.abort();
                    }
                });
            });
        },
        translate: function() {
            this.model.translate();
        },
        hideTranslation: function() {
            this.model.set({
                showingTranslation: false
            });
        },

        update: function(e) {
            e.stopPropagation();
            this.prepareForChanges(e);
            this.model.saveGroup(this.model.UPDATE_OPERATION);
            return false;
        },

        create: function(e) {
            this.prepareForChanges(e);
            this.model.saveGroup(this.model.CREATE_OPERATION);
            return false;
        },

        prepareForChanges: function(e) {
            e.stopPropagation();
            var data = {
                authorizableID: this.getField("groupId"),
                profileProperties: {
                    givenName: this.getField("givenName"),
                    aboutMe: this.getField("aboutMe")
                },
                memberId: this.getMembersId()
            };
            this.clearErrorMessages();
            this.model.set(data);
        },

        searchGroups: function(evt) {
            $CQ.each(this.model.get("members"), function(index, item) {
                var elem = $(".user-group-list-container article[data-itemid='" + item.authorizableId + "']");
                if (item.name.toLowerCase().indexOf($(evt.currentTarget).val().toLowerCase()) === -1) {
                    elem.hide();
                } else {
                    elem.show();
                }
            });
        },

        changeMemberStatus: function(evt) {
            var itemid = $(evt.currentTarget).data().itemid;
            var selectedItem = $(".user-group-list-container article[data-itemid='" + itemid + "']");
            selectedItem.toggleClass("scf-memberlist-deleted-item");
            if (selectedItem.hasClass("scf-memberlist-deleted-item")) {
                $(evt.currentTarget).removeClass("coral-Icon--delete");
                $(evt.currentTarget).addClass("coral-Icon--undo");
            } else {
                $(evt.currentTarget).removeClass("coral-Icon--undo");
                $(evt.currentTarget).addClass("coral-Icon--delete");
            }

        },

        getMembersId: function() {
            var itemids = [];
            var items = $(".scf-js-memberlist-item:not(.scf-memberlist-deleted-item)");
            $CQ.each(items, function(index, item) {
                itemids.push($(item).data().itemid);
            });
            if (this.autocomplete.values.length) {
                itemids = itemids.concat(this.autocomplete.values);
            }
            return itemids;
        }

    });

    SCF.GroupProfile = GroupProfile;
    SCF.GroupProfileView = GroupProfileView;
    SCF.registerComponent("social/members/components/hbs/groupprofile", SCF.GroupProfile, SCF.GroupProfileView);

})($CQ, _, Backbone, SCF, Granite);
