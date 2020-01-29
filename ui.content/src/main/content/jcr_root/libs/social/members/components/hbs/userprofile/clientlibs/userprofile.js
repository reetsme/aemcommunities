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

/* global Coral */

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

    var UserProfile = SCF.Model.extend({
        modelName: "UserProfileModel",
        CREATE_OPERATION: "social:createMemberUser",
        UPDATE_OPERATION: "social:updateMemberUserProfile",
        CHANGE_PASSWORD_OPERATION: "social:resetMemberPassword",
        CHANGE_AVATAR_OPERATION: "social:changeMemberAvatar",
        ADD_TO_GROUP_OPERATION: "social:addUserToGroup",
        REMOVE_FROM_GROUP_OPERATION: "social:removeUserFromGroup",
        DISABLE_USER: "social:disableMemberUser",
        ENABLE_USER: "social:enableMemberUser",
        events: {
            CREATED: "userprofile:created",
            UPDATED: "userprofile:updated",
            PASSWORD_UPDATED: "password:updated",
            AVATAR_UPDATED: "avatar:updated"
        },
        PROFILE_MANIPULATION_URL: "/libs/social/members/content/content/userprofile",

        initialize: function() {},
        doPost: function(op, success, error) {

            var postData;
            if (window.FormData) {
                postData = new window.FormData();
            }

            var groupIds = this.get("groupId");
            var siteIds = this.get("siteId");
            if (postData) {
                if (this.get("file")) {
                    postData.append("file", this.get("file"), "profile.png");
                }
                if (this.get("userId")) {
                    postData.append("userId", this.get("userId"));
                }
                postData.append("displayName", this.get("displayName"));
                postData.append("givenName", this.get("profileProperties").givenName);
                postData.append("familyName", this.get("profileProperties").familyName);
                postData.append("email", this.get("profileProperties").email);
                postData.append("gender", this.get("profileProperties").gender);
                postData.append("streetAddress", this.get("profileProperties").streetAddress);
                postData.append("city", this.get("profileProperties").city);
                postData.append("region", this.get("profileProperties").region);
                postData.append("language", this.get("profileProperties").language);
                postData.append("jobTitle", this.get("profileProperties").jobTitle);
                postData.append("url", this.get("profileProperties").url);
                postData.append("disabled", this.get("disabled"));
                postData.append("aboutMe", this.get("profileProperties").aboutMe);
                postData.append("password", this.get("profileProperties").password);
                postData.append("confirmPassword", this.get("profileProperties").confirmPassword);
                if (groupIds.length) {
                    $CQ.each(groupIds, function(index, item) {
                        postData.append("groupId", item);
                    });
                } else {
                    postData.append("groupId", "");
                }
                if (siteIds.length) {
                    $CQ.each(siteIds, function(index, item) {
                        postData.append("siteId", item);
                    });
                } else {
                    postData.append("siteId", "");
                }
                /* global JSON */
                postData.append("assignedBadges", JSON.stringify(this.get("assignedBadges")));
                postData.append("limitUserUGC", this.get("limitUserUGC"));
                postData.append(":operation", op);
            }

            $CQ.ajax(SCF.config.urlRoot + this.PROFILE_MANIPULATION_URL + SCF.constants.URL_EXT, {
                dataType: "json",
                type: "POST",
                processData: false,
                contentType: false,
                xhrFields: {
                    withCredentials: true
                },
                data: this.addEncoding(postData),
                "success": success,
                "error": error
            });
        },
        saveUser: function(operation) {
            var that = this;
            var error = _.bind(function() {
                that.showOperationMessage(Granite.I18n.get("Error Saving User"), true);
            }, this);
            var success = _.bind(function() {
                window.location.href = SCF.config.urlRoot + "/communities/members";
            }, this);

            this.doPost(operation, success, error);
        },
        changePassword: function(postData) {
            var that = this;
            var error = _.bind(function() {
                that.showOperationMessage(Granite.I18n.get("Error Changing Password"), true);
            }, this);
            var success = _.bind(function() {
                this.trigger(this.events.PASSWORD_UPDATED, {
                    model: this
                });
                that.showOperationMessage(Granite.I18n.get("Change Password Successful"));
            }, this);

            postData[":operation"] = this.CHANGE_PASSWORD_OPERATION;

            $CQ.ajax(SCF.config.urlRoot + this.PROFILE_MANIPULATION_URL + SCF.constants.URL_EXT + this.getSuffix(), {
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
        getSuffix: function() {
            // get suffix if any
            var suffix = "";
            var index = document.location.href.lastIndexOf(".html");
            if (index > 0) {
                suffix = document.location.href.substring(index + 5);
            }
            return suffix;
        },
        showOperationMessage: function(message, isError) {
            var container = $(".scf-js-saveuser-success");
            if (isError) {
                container = $(".scf-js-saveuser-error");
            }
            container.text(message);
            container.show().delay(7500).fadeOut();
            var left = $(window).width() / 2 - container.width() / 2;
            container.css("left", left + "px");

        }

    });

    var UserProfileView = SCF.View.extend({
        viewName: "UserProfile",
        tagName: "div",
        className: "userProfile",
        langList: "",
        addMemberToGroupsCtrl: null,
        addMemberToSitesCtrl: null,
        addMemberToCommunityModeratorsCtrl: null,
        addMemberToCommunityPrivilegedMembersCtrl: null,
        addMemberToGroupModeratorCtrl: null,
        memberBadgesCtrl: null,
        initBadgeControl: false,
        siteCollectionForBadges: null,
        init: function() {
            this.listenTo(this.model, this.model.events.AVATAR_UPDATED, this.avatarUpdate);
            this.listenTo(this.model, this.model.events.PASSWORD_UPDATED, this.passwordUpdate);
            this.initSubControls();
            this.initRequireFields();
        },
        setBadges: function() {
            var that = this;
            if (this.model.get("assignedBadges") && this.model.get("assignedBadges").length &&
                !$(this.memberBadgesCtrl).find(".scf-js-userprofile-badge-tag").length) {
                var existTags = $(this.memberBadgesCtrl).find("coral-tag");
                $CQ.each(existTags, function(i, tag) {
                    that.createBadgeTemplate(tag, true);
                });
            }
            if (this.model.get("earnedBadges") && this.model.get("earnedBadges").length) {
                var tagList = $(this.memberBadgesCtrl).find("coral-taglist").get(0);
                $CQ.each(this.model.get("earnedBadges"), function(i, badge) {
                    var earnedTag = "<span class=\"scf-js-userprofile-earned-badge\">" +
                        "<img class='scf-js-userprofile-badge-icon' src='" + badge.imageUrl + "' />" +
                        "<coral-tag-label class=\"coral-Tag-label\">" + badge.title + "</coral-tag-label>" +
                        "<span class=\"scf-memberlist-site-roles\">*" +
                        Granite.I18n.get("Earned") + "</span><br />" +
                        "<span class=\"coral-TagList coral3-Select-tagList\">";
                    $CQ.each(that.siteCollectionForBadges, function(i, site) {
                        if (badge.sites.indexOf(site.siteId) !== -1) {
                            earnedTag += "<span class=\"scf-js-userprofile-earned-badge-tag " +
                                "coral-Tag coral-Tag--large coral-Tag--multiline\">" +
                                "<coral-tag-label class=\"coral-Tag-label\">" +
                                site.name + "</coral-tag-label>" +
                                "</span>";
                        }
                    });
                    earnedTag += "</span></span><br />";
                    $(tagList).append(earnedTag);
                });
            }
        },
        initSubControls: function() {
            this.presetSelectControl(".scf-js-member-profile-status", this.model.get("disabled"));
            if (this.model.get("properties")) {
                this.presetSelectControl(".scf-js-member-profile-select", this.model.get("properties").gender);
            }

            this.setLanguageData();
            this.addMemberToGroupsCtrl = this.initAddMemberControl(".scf-js-member-profile-groups",
                "/libs/social/members/content/content/grouplist.social.json");
            this.addMemberToSitesCtrl = this.initAddMemberControl(".scf-js-member-profile-sites",
                "/mnt/overlay/social/console/content/content/publishedsitecollection.social.json?_charset_=utf-8",
                "siteId");
            this.addMemberToCommunityModeratorsCtrl = this.initAddMemberControl(
                ".scf-js-member-profile-comunity-moderator",
                "/mnt/overlay/social/console/content/content/publishedsitecollection.social.json?_charset_=utf-8",
                "siteId");
            this.addMemberToCommunityPrivilegedMembersCtrl = this.initAddMemberControl(
                ".scf-js-member-profile-priveleged-member",
                "/mnt/overlay/social/console/content/content/publishedsitecollection.social.json?_charset_=utf-8",
                "siteId");
            this.addMemberToGroupModeratorCtrl = this.initAddMemberControl(
                ".scf-js-member-profile-groups-moderator",
                "/mnt/overlay/social/console/content/content/publishedsitecollection.social.json?_charset_=utf-8",
                "siteId");
            this.memberBadgesCtrl = this.initAddMemberControl(".scf-js-member-profile-bagges",
                "/mnt/overlay/social/gamification/content/endpoint/badgecollection.social.json?_charset_=utf-8",
                "imageURL", "displayName", true);
        },
        initRequireFields: function() {
            var requiredFields = $(this.el).find("input[required]");
            var that = this;
            $CQ.each(requiredFields, function(index, item) {
                $(item).on("change", function() {
                    that.checkFormValid();
                });
            });
        },
        checkFormValid: function() {
            var requiredFields = $(this.el).find("input[required]");
            $CQ.each(requiredFields, function(index, item) {
                var valid = item.checkValidity();
                $(".scf-js-member-user-profile-save").attr("disabled", (!valid));
                if (!valid) {
                    return false;
                }
            });
        },
        presetSelectControl: function(ctrlClass, value) {
            var ctrl = $(ctrlClass).get(0);
            if (ctrl) {
                /* Global Coral */
                Coral.commons.ready(ctrl, function() {
                    ctrl.value = value;
                });
            }
        },
        initAddMemberControl: function(parentClass, dataUrl, idFieldName, fieldValue, isBadges) {
            /* global Coral */
            var ctrl = new Coral.Autocomplete().set({
                multiple: true,
                forceSelection: (idFieldName ? true : false)
            });
            var that = this;
            that.request = null;
            $(parentClass).append(ctrl);
            if ($.type(parentClass) === "string") {
                $(ctrl).css("width", "100%");
            }

            if (!idFieldName) {
                /* global Coral */
                Coral.commons.ready(ctrl, function() {
                    ctrl.on("coral-autocomplete:showsuggestions", function(event) {
                        if (that.request) {
                            that.request.abort();
                        }
                        event.preventDefault();
                        that.request = $.get(SCF.config.urlRoot + dataUrl + "?_charset_=utf-8&" +
                            "keyword=" + encodeURIComponent(event.detail.value),
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
                                ctrl.addSuggestions(suggestions);
                            }, "json");
                    });
                    ctrl.on("coral-autocomplete:hidesuggestions", function() {
                        $(ctrl).find(".coral-Autocomplete-input").val("");
                        ctrl.invalid = false;
                        if (that.request) {
                            that.request.abort();
                        }
                    });
                });
            } else {
                $.get(SCF.config.urlRoot + dataUrl, function(data) {
                    /* global Coral */
                    if (data && data.items) {
                        Coral.commons.ready(ctrl, function() {
                            $CQ.each(data.items, function(index, item) {
                                var isSelect = false;
                                if (isBadges && that.model.get("assignedBadges") &&
                                    that.model.get("assignedBadges").length
                                ) {
                                    var badges = that.model.get("assignedBadges");
                                    for (var i = 0; i < badges.length; i++) {
                                        if (item.imageURL === badges[i].imageUrl) {
                                            isSelect = true;
                                            break;
                                        }
                                    }
                                }
                                var value;
                                var nameWithLocale = item.name + " (" + item.properties.baseLanguage + ")";
                                if (item && item.properties && item.properties.baseLanguage) {
                                    value = (fieldValue ? item[fieldValue] : nameWithLocale);
                                } else {
                                    value = (fieldValue ? item[fieldValue] : item.name);
                                }
                                ctrl.items.add({
                                    value: item[idFieldName],
                                    content: {
                                        innerHTML: $CQ("<span/>").text(value).html()
                                    },
                                    selected: isSelect
                                });
                            });
                            ctrl.on("coral-autocomplete:hidesuggestions", function() {
                                $(ctrl).find(".coral-Autocomplete-input").val("");
                                ctrl.invalid = false;
                                if (isBadges) {
                                    var tags = $(ctrl).find("coral-tag[value='" +
                                        ctrl.values[ctrl.values.length - 1] +
                                        "']");
                                    that.createBadgeTemplate(tags[1] ? tags[1] : tags[0]);
                                }

                            });
                        });
                    }
                }, "json");
            }
            return ctrl;
        },
        getSiteCollectionForBadges: function() {
            this.initBadgeControl = true;
            if (!this.siteCollectionForBadges) {
                var that = this;
                var AllSites = {
                    siteId: "all-sites",
                    name: Granite.I18n.get("All Sites")
                };
                that.siteCollectionForBadges = [AllSites];
                var jqxhr = $.get(SCF.config.urlRoot + "/mnt/overlay/social/console/content" +
                    "/content/publishedsitecollection.social.json?_charset_=utf-8",
                    function(data) {
                        if (data && data.items) {
                            that.siteCollectionForBadges = data.items;
                            that.siteCollectionForBadges.unshift(AllSites);
                        }
                    }, "json");
                jqxhr.always(function() {
                    that.setBadges();
                });
            }
        },
        createBadgeTemplate: function(tag, saved) {
            var that = this;
            if (!tag || $(tag).hasClass("scf-js-userprofile-badge-tag")) {
                return;
            }
            var badge;
            if (that.model.get("assignedBadges")) {
                for (var i = 0; i < that.model.get("assignedBadges").length; i++) {
                    if (tag.value === that.model.get("assignedBadges")[i].imageUrl) {
                        badge = that.model.get("assignedBadges")[i];
                        break;
                    }
                }
            }
            $(tag).addClass("scf-js-userprofile-badge-tag");
            $(tag).find(".coral-Tag-removeButton coral-icon").switchClass(
                "coral-Icon--close", "coral-Icon--delete"
            );
            $(tag).prepend("<img class='scf-js-userprofile-badge-icon' src='" + tag.value + "' />");
            $(tag).append("<span class=\"scf-memberlist-site-roles\">*" +
                Granite.I18n.get("Assigned") + "</span>");
            var select = new Coral.Select().set({
                placeholder: Granite.I18n.get("Choose a Site"),
                variant: "quiet",
                multiple: true
            });
            $(tag).append(select);
            $(select).addClass("scf-js-userprofile-badge-select-site");

            /* global Coral */
            Coral.commons.ready(select, function() {
                $CQ.each(that.siteCollectionForBadges, function(index, item) {
                    var isSelect = false;
                    if (saved && badge && badge.sites.indexOf(item.siteId) !== -1) {
                        isSelect = true;
                    }
                    select.items.add({
                        value: item.siteId,
                        content: {
                            innerHTML: item.name
                        },
                        disabled: false,
                        selected: isSelect
                    });
                });
                select.on("change", function(e) {
                    if (e.currentTarget.values.length) {
                        if (e.currentTarget.values[e.currentTarget.values.length - 1] === "all-sites") {
                            e.currentTarget.values = ["all-sites"];
                        } else if (e.currentTarget.selectedItems[0].value === "all-sites") {
                            e.currentTarget.values = [e.currentTarget.selectedItems[1].value];
                        }
                    }

                });
            });
        },
        setLanguageData: function() {
            var that = this;
            var select = $(".scf-js-userprofile-language").get(0);
            if (select) {
                $.get(SCF.config.urlRoot + "/libs/social/translation/languageOpts/" +
                    "languageMapping.social.json?_charset_=utf-8",
                    function(data) {
                        if (data && data.items) {
                            var items = data.items;
                            items.forEach(function(item) {
                                var sel = false;
                                if (that.model.get("properties")) {
                                    sel = (that.model.get("properties").language === item.languageCode);
                                }
                                select.items.add({
                                    value: item.languageCode,
                                    content: {
                                        innerHTML: Granite.I18n.get(item.languageName)
                                    },
                                    selected: sel
                                });
                            });
                        }
                    }, "json");
            }
        },
        avatarUpdate: function() {
            var canvasSupported = !(!window.HTMLCanvasElement);
            if (canvasSupported) {
                var image = this.$el.find(".scf-js-userprofile-avatar");
                var base64String = window.btoa(String.fromCharCode.apply(null, this.model.blob));
                $(image).css("background-image", "url('data:image/png;base64," + base64String + "')");
                delete this.model.blob;
            }
        },
        passwordUpdate: function() {
            this._closeModal.hide();
            this._closeModal = undefined;
        },
        translate: function() {
            this.model.translate();
        },
        hideTranslation: function() {
            this.model.set({
                showingTranslation: false
            });
        },
        previewImages: function() {
            function cropImage(image, scale, canvas) {
                var deltaX = 0;
                var deltaY = 0;
                var destHeight = canvas.clientHeight;
                var destWidth = canvas.clientWidth;
                canvas.width = destWidth;
                canvas.height = destHeight;

                var sourceWidth = image.width;
                var sourceHeight = image.height;
                var ratio = sourceWidth / sourceHeight;
                var cropWidth = image.width * (scale - 1);
                var cropHeight = image.height * (scale - 1);
                if (sourceWidth > sourceHeight) {
                    if (scale === 1) {
                        deltaX = 0;
                        deltaY = destHeight * (1 - 1 / ratio) / 2;
                        destHeight = destHeight - 2 * deltaY;
                        cropHeight = cropHeight / ratio;
                    } else {
                        var newW = sourceWidth - cropWidth * 2;
                        if (newW > sourceHeight) {
                            cropHeight = 0;
                            deltaY = destHeight * (1 - sourceHeight / newW) / 2;
                            destHeight = destHeight - 2 * deltaY;
                        } else {
                            cropHeight = (sourceHeight - newW) / 2;
                            deltaY = 0;
                        }
                        deltaX = 0;
                    }
                } else if (sourceWidth < sourceHeight) {
                    if (scale === 1) {
                        deltaX = destWidth * (1 - ratio) / 2;
                        deltaY = 0;
                        destWidth = destWidth - 2 * deltaX;
                        cropWidth = cropWidth * ratio;
                    } else {
                        var newH = sourceHeight - cropHeight * 2;
                        if (newH > sourceWidth) {
                            cropWidth = 0;
                            deltaX = destWidth * (1 - sourceWidth / newH) / 2;
                            destWidth = destWidth - 2 * deltaX;
                        } else {
                            cropWidth = (sourceWidth - newH) / 2;
                            deltaX = 0;
                        }
                        deltaY = 0;
                    }
                }
                sourceWidth = image.width - cropWidth * 2;
                sourceHeight = image.height - cropHeight * 2;

                canvas.getContext("2d").drawImage(
                    image, cropWidth, cropHeight, sourceWidth,
                    sourceHeight, deltaX, deltaY, destWidth, destHeight
                );
            }

            $("#change-avatar-submit").get(0).disabled = false;

            var canvasSupported = !(!window.HTMLCanvasElement);
            if (!canvasSupported) {
                var imageText = $("#imgUploadText").get(0);
                imageText.innerHTML = $("#imgUploadImage").get(0).value;
                return;
            }

            $("input:radio[name=\"cropOption\"]").get(0).checked = true;
            // preview #1
            /* global FileReader */
            var fr = new FileReader();
            /* global Image */
            var image = new Image();

            fr.readAsDataURL($("#imgUploadImage").get(0).files[0]);

            fr.onload = function(e) {
                var targRes = e.target.result;
                image.src = targRes;
                image.onload = function(evt) {
                    var canvas = $("#imgUploadPreview1").get(0);
                    var source = evt.target;
                    cropImage(source, 1, canvas);
                };
            };

            // preview #2
            var fr2 = new FileReader();
            var image2 = new Image();

            fr2.readAsDataURL($("#imgUploadImage").get(0).files[0]);

            fr2.onload = function(e) {
                var targRes = e.target.result;
                image2.src = targRes;
                image2.onload = function(evt) {
                    // draw cropped image
                    var canvas = $("#imgUploadPreview2").get(0);
                    var source = evt.target;
                    cropImage(source, 1.1, canvas);
                };
            };

            // preview #3
            var fr3 = new FileReader();
            var image3 = new Image();

            fr3.readAsDataURL($("#imgUploadImage").get(0).files[0]);

            fr3.onload = function(e) {
                var targRes = e.target.result;
                image3.src = targRes;
                image3.onload = function(evt) {
                    // draw cropped image
                    var canvas = $("#imgUploadPreview3").get(0);
                    var source = evt.target;
                    cropImage(source, 1.2, canvas);

                };
            };
        },
        showAvatarBox: function(e) {
            e.stopPropagation();
            var avatarBox = $(".scf-js-avatar-box");
            avatarBox.find("#change-avatar-submit")[0].disabled = true;
            var canvasSupported = !!window.HTMLCanvasElement;
            var canvas;
            if (canvasSupported) {
                // clear canvas
                canvas = $("#imgUploadPreview1").get(0);
                canvas.width = canvas.width;
                canvas = $("#imgUploadPreview2").get(0);
                canvas.width = canvas.width;
                canvas = $("#imgUploadPreview3").get(0);
                canvas.width = canvas.width;

            } else {
                if (avatarBox.find("#canvas-row").size() > 0) {
                    // replace canvas elements with image
                    canvas = avatarBox.find(".scf-form-row")[0];
                    var form = $(canvas).parent();
                    $(avatarBox.find("#canvas-row")).remove();
                    $CQ("<div class=\"row scf-form-row\">" +
                        "<span id=\"imgUploadText\"></span><div>").prependTo($CQ(form));
                }

            }
            avatarBox[0].show();
            this._closeModal = avatarBox[0];
        },
        showPasswordBox: function(e) {
            e.stopPropagation();

            var passwordBox = $(".scf-js-password-box");
            $(passwordBox).find("input[type=\"password\"]").val("");
            $(passwordBox).find(".scf-js-error-message").remove();
            $(passwordBox).find(".scf-error").removeClass("scf-error");
            passwordBox[0].show();
            this._closeModal = passwordBox[0];
        },
        cancelAvatar: function(e) {
            e.stopPropagation();
            this._closeModal.hide();
            this._closeModal = undefined;
        },
        create: function(e) {
            this.prepareForChanges(e);
            this.model.saveUser(this.model.CREATE_OPERATION);
            return false;
        },
        update: function(e) {
            this.prepareForChanges(e);
            if (this.isSiteSelected()) {
                this.model.saveUser(this.model.UPDATE_OPERATION);
            }
            return false;
        },
        isSiteSelected: function() {
            var assignedBadges = this.model.attributes.assignedBadges;
            for (var i = 0 ; assignedBadges !== undefined && i < assignedBadges.length ; i++) {
                if (assignedBadges[i].sites.length === 0) {
                    window.alert("Please choose a site");
                    return false;
                }
            }
            return true;
        },
        prepareForChanges: function(e) {
            e.stopPropagation();
            var cityState = [];
            if (this.getField("city") !== "") {
                cityState = this.getField("city").split(",");
            }
            var data = {
                userId: this.getField("userId"),
                displayName: this.getField("displayName"),
                profileProperties: {
                    givenName: this.getField("givenName"),
                    familyName: this.getField("familyName"),
                    gender: this.getField("gender"),
                    email: this.getField("email"),
                    streetAddress: this.getField("streetAddress"),
                    city: cityState[0] || "",
                    region: cityState[1] || "",
                    language: this.getField("language"),
                    jobTitle: this.getField("jobTitle"),
                    url: this.getField("url"),
                    aboutMe: this.getField("aboutMe"),
                    smartRendering: this.getField("smartRendering"),
                    password: this.getField("password"),
                    confirmPassword: this.getField("confirmpass")
                },
                disabled: this.getField("disabled"),
                limitUserUGC: this.getField("limitUserUGC"),
                groupId: this.getItemIds(".scf-js-member-of-groups", this.addMemberToGroupsCtrl),
                siteId: this.getItemIds(".scf-js-member-of-sites", this.addMemberToSitesCtrl),
                assignedBadges: (this.initBadgeControl ? this.getBadgesData() : this.model.get("assignedBadges"))
            };
            this.model.set(data);
        },
        changePassword: function(e) {
            e.stopPropagation();
            var passwordBox = $CQ.find(".scf-js-password-box")[0];
            $(passwordBox).find(".scf-js-error-message").remove();
            $(passwordBox).find(".scf-error").removeClass("scf-error");

            // validate new password

            var resetPwd = this.getField("resetPwd");
            var confirmPwd = this.getField("confirmPwd");
            var errorMsg = "";
            if (resetPwd === "") {
                errorMsg = Granite.I18n.get("You need to enter the New Password.");
                $("#resetPwd").focus();
                $("#resetPwd").attr("invalid", true);

            } else if (resetPwd !== confirmPwd) {
                errorMsg = Granite.I18n.get("The Confirm New Password doesn't match.");
                $("#confirmPwd").focus();
                $("#confirmPwd").attr("invalid", true);
            }

            if (errorMsg !== "") {
                // show error msg
                var errorContainer = $(".scf-js-changepass-error");
                errorContainer.text(errorMsg);
                errorContainer.show().delay(7500).fadeOut();
                errorContainer.css("top", "65%");
                errorContainer.css("left", "20%");
            } else {
                var data = {
                    resetPwd: this.getField("resetPwd"),
                    confirmPwd: this.getField("confirmPwd")
                };
                this.model.changePassword(data);
            }
            return false;
        },
        changeAvatar: function(e) {
            e.stopPropagation();

            var file;
            var canvasSupported = !!window.HTMLCanvasElement;
            if (!canvasSupported) {
                file = $("#imgUploadImage").get(0).files[0];

            } else {

                var selected = $("input:radio[name=\"cropOption\"]:checked").val();
                var canvas;
                switch (selected) {
                    case "Crop b":
                        canvas = $("#imgUploadPreview2").get(0);
                        break;
                    case "Crop c":
                        canvas = $("#imgUploadPreview3").get(0);
                        break;
                    default:
                        canvas = $("#imgUploadPreview1").get(0);
                }

                var dataURL = canvas.toDataURL();

                var image = this.$el.find(".scf-js-userprofile-avatar");
                $(image).css("background-image", "url('" + dataURL + "')");

                /* global atob */
                var blobBin = atob(dataURL.split(",")[1]);
                var array = [];
                for (var i = 0; i < blobBin.length; i++) {
                    array.push(blobBin.charCodeAt(i));
                }
                var filetype = $("#imgUploadImage").get(0).files[0].type;
                var blob = new window.Uint8Array(array);
                file = new window.Blob([blob], {
                    type: filetype
                });

                this.model.blob = blob;
            }

            this.model.set({
                "file": file
            });
            this._closeModal.hide();
            this._closeModal = undefined;
            return false;
        },

        searchMemberOfItems: function(evt) {
            var collectionName = $(evt.currentTarget).data().collectionName;
            var IDFieldName = $(evt.currentTarget).data().idFieldName;

            $CQ.each(this.model.get(collectionName), function(index, item) {
                var elem = $("#scf-js-memberlist-" + (item.authorizableId || item[IDFieldName]));
                if (item.name.toLowerCase().indexOf($(evt.currentTarget).val().toLowerCase()) === -1) {
                    elem.hide();
                } else {
                    elem.show();
                }
            });
        },

        changeItemStatus: function(evt) {
            var itemId = $(evt.currentTarget).data().itemId;
            $("#scf-js-memberlist-" + itemId).toggleClass("scf-memberlist-deleted-item");
            if ($("#scf-js-memberlist-" + itemId).hasClass("scf-memberlist-deleted-item")) {
                $(evt.currentTarget).removeClass("coral-Icon--delete");
                $(evt.currentTarget).addClass("coral-Icon--undo");
            } else {
                $(evt.currentTarget).removeClass("coral-Icon--undo");
                $(evt.currentTarget).addClass("coral-Icon--delete");
            }

        },

        getItemIds: function(context, addCtrl) {
            var itemIds = [];
            if (context) {
                var items = $(context).find(".scf-js-memberlist-item:not(.scf-memberlist-deleted-item)");
                $CQ.each(items, function(index, item) {
                    itemIds.push($(item).data().itemId);
                });
            }
            if (addCtrl.values.length) {
                itemIds = itemIds.concat(addCtrl.values);
            }
            return itemIds;
        },

        getBadgesData: function() {
            var badges = [];
            var that = this;
            $CQ.each($(this.memberBadgesCtrl).find(".scf-js-userprofile-badge-tag"), function(index, item) {
                badges.push({
                    imageUrl: item.value,
                    sites: that.getBadgeSiteData($(item).find("coral-select").get(0))
                });
            });
            return badges;
        },

        getBadgeSiteData: function(siteControl) {
            var sitePaths = [];
            if (siteControl.selectedItems.length) {
                $CQ.each(siteControl.selectedItems, function(index, item) {
                    sitePaths.push(item.value);
                });
            }
            return sitePaths;
        }
    });

    SCF.UserProfile = UserProfile;
    SCF.UserProfileView = UserProfileView;
    SCF.registerComponent("social/members/components/hbs/userprofile", SCF.UserProfile, SCF.UserProfileView);

})($CQ, _, Backbone, SCF, Granite);
