/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2013 Adobe Systems Incorporated
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
 **************************************************************************/
(function($CQ, _, Backbone, SCF) {
    "use strict";

    var UserChooser = SCF.Model.extend({
        modelName: "UserChooserModel",

        getUserList: function(params) {
            // params: url, searchString, showUsers, showGroups, profilePath, request, response
            var loadingMsg = CQ.I18n.get("Loading") + "...";
            params.response([{
                avatarUrl: "",
                name: loadingMsg,
                familyName: "",
                loading: true
            }]);
            var searchString = params.searchString
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

            var userListURL = this.id + ".social.0.20.json";
            userListURL = CQ.shared.HTTP.addParameter(userListURL, "filter", filterObject);
            if (params.showUsers && !params.showGroups) {
                userListURL = CQ.shared.HTTP.addParameter(userListURL, "type", "users");
            } else if (!params.showUsers && params.showGroups) {
                userListURL = CQ.shared.HTTP.addParameter(userListURL, "type", "groups");
            } else {
                userListURL = CQ.shared.HTTP.addParameter(userListURL, "type", "userandgroups");
            }
            userListURL = CQ.shared.HTTP.addParameter(userListURL, "fromPublisher", "true");
            userListURL = CQ.shared.HTTP.addParameter(userListURL, "_charset_", "utf-8");
            userListURL = CQ.shared.HTTP.addParameter(userListURL, "groupId", "community-members");
            $CQ.ajax({
                url: userListURL,
                data: {
                    search: params.searchString,
                    profilePath: params.profilePath,
                    showUsers: params.showUsers,
                    showGroups: params.showGroups
                },
                type: "GET"
            }).success(function(data) {
                var jsonData = data.items ? data.items : (typeof(data) === "string" ? $CQ.parseJSON(data) : []);
                for (var user = 0; user < jsonData.length; user++) {
                    jsonData[user].profileURL = jsonData[user].profileURL + ".form.html" +
                        (params.profilePath.trim().indexOf("/") === 0 ?
                            params.profilePath.trim() : "/" + params.profilePath.trim());
                }
                params.response(jsonData);
            });
        },

        findUser: function(url, userId, showUsers, showGroups, profilePath) {
            var outObj = null;
            $CQ.ajax({
                url: url,
                data: {
                    search: userId,
                    profilePath: profilePath,
                    showUsers: showUsers,
                    showGroups: showGroups
                },
                type: "GET",
                async: false
            }).success(function(data) {
                var jsonData = data.items ? data.items : (typeof(data) === "string" ? $CQ.parseJSON(data) : []);
                $CQ.each(jsonData, function() {
                    this.profileURL = this.profileURL + ".form.html" +
                        (profilePath.trim().indexOf("/") === 0 ? profilePath.trim() : "/" + profilePath.trim());
                    if (this.id.trim() === userId.trim()) {
                        outObj = this;
                    }
                });
            });
            return outObj;
        }
    });

    var UserChooserView = SCF.View.extend({
        view: "UserChooser",

        init: function() {
            Backbone.on("selectThisUser", this.selectUser, this);
        },

        events: {
            "click input.userchooser": function(e) {
                this.selectChooser(e);
            },
            "click .userchooserContainer .messaging-user-link": function(e) {
                this.checkAndDisableUserProfileLink(e);
            },
            "hover .userchooserContainer .messaging-user-link": function(e) {
                this.checkAndDisableUserProfileLink(e);
            },
            "click .inlineDiv .removeThisUser": function(e) {
                this.showUserChooser(e);
            }

        },

        checkAndDisableUserProfileLink: function(e) {
            if (!this.model.get("properties").profileFormPath) {
                $CQ(e.currentTarget).addClass("disabled-messaging-user-link");
                e.preventDefault();
            }
        },
        selectChooser: function() {
            var thisView = this;
            var properties = this.model.get("properties");
            var userchooserName = properties.userchooserName ? properties.userchooserName : "";
            var userChooserId = userchooserName + "Id";
            var currentPath = this.model.get("id") + ".social.json";
            var profilePath = "";
            if (properties.profilePath) {
                profilePath = properties.profilePath;
            }

            $CQ("#" + userChooserId).autocomplete({
                minLength: 3,
                source: function(request, response) {
                    thisView.model.getUserList({
                        url: currentPath,
                        searchString: thisView.$el.find("#" + userChooserId).val(),
                        showUsers: properties.showUsers,
                        showGroups: properties.showGroups,
                        profilePath: profilePath,
                        request: request,
                        response: response
                    });
                },
                select: function(event, ui) {
                    thisView.selectThisUser({
                        chooserName: userchooserName,
                        dispObject: this,
                        id: ui.item.id,
                        fullName: ui.item.name,
                        avatarUrl: ui.item.avatarUrl,
                        profileURL: ui.item.profileURL,
                        showClose: true
                    });
                    thisView.$el.find("#" + userChooserId).val("");
                    return false;
                }
            }).data("uiAutocomplete")._renderItem = function(ul, item) {
                if (item.avatarUrl) {
                    return $CQ("<li></li>")
                        .append("<a><img class='newMessageUserChooserAvatar' src='" + item.avatarUrl + "' width='30' height='30'/>&nbsp;" + item.name +
                            "</a>")
                        .data("item.autocomplete", item)
                        .appendTo(ul);
                } else {
                    return $CQ("<li></li>")
                        .append("<a>" + item.name + "</a>")
                        .data("item.autocomplete", item)
                        .appendTo(ul);
                }
            };
        },
        replaceAll: function(find, replace, str) {
            return str.replace(new RegExp(find, "g"), replace);
        },
        showUserChooser: function(e) {
            var properties = this.model.get("properties");
            var userchooserName = properties.userchooserName ? properties.userchooserName : "";
            var $target = this.$el.find(e.target);
            var currentList = this.model.get("currentSelectedUsers");
            var userId = $target.parent().find("[name='userId']").val();
            currentList = currentList.replace(userId + ";", "");
            this.model.set({
                "currentSelectedUsers": currentList
            });
            this.$el.find("#" + userchooserName + "Name").val(currentList);
            this.$el.find("#" + userchooserName + "Id").val("");
            $target.closest(".inlineDiv").remove();
        },
        selectUser: function(event) {
            this.selectThisUser({
                chooserName: event.componentName,
                dispObject: event.dispObject,
                id: event.id,
                fullName: event.name,
                avatarUrl: event.avatarUrl,
                profileURL: event.profileURL,
                showClose: event.readOnly
            });
        },
        selectThisUser: function(params) {
            // params: chooserName, dispObject, id, fullName, avatarUrl, profileURL, showClose
            /*jshint maxcomplexity:false */
            var properties = this.model.get("properties");
            var profilePath = "";
            if (properties.profilePath) {
                profilePath = properties.profilePath;
            }
            var currentPath = this.model.get("id") + ".social.json";
            var userObj = null;
            if (params.fullName.indexOf("Loading") > -1) {
                return;
            }
            if (params.dispObject !== null && params.dispObject !== undefined) {
                params.dispObject.style.visible = "false";
                params.dispObject.style.display = "none";
            }
            this.$el.find("#" + params.chooserName + "Id").show();
            var currentSelectedUsers = this.model.get("currentSelectedUsers");
            if (!currentSelectedUsers) {
                currentSelectedUsers = "";
            }
            currentSelectedUsers += params.id + ";";
            this.model.set({
                "currentSelectedUsers": currentSelectedUsers
            });
            this.$el.find("#" + params.chooserName + "Name").val(currentSelectedUsers);
            this.$el.find("#" + params.chooserName + "Value").show();
            var spanString = "<div class='inlineDiv'>";
            var profileString = params.fullName;
            var closeString = "";
            if (params.profileURL) {
                profileString = params.profileURL.trim() !== "" ?
                    "<a href='" + params.profileURL + "' target='_blank' class='messaging-user-link'>" +
                    params.fullName + "</a>" : params.fullName;
            } else {
                userObj = this.model.findUser(currentPath, params.id,
                    properties.showUsers, properties.showGroups, profilePath);
                if (userObj && (userObj.type === "user" ||
                        (userObj.profileURL !== null && userObj.profileURL !== undefined))) {
                    profileString = userObj.profileURL.trim() !== "" ?
                        "<a href='" + userObj.profileURL + "' target='_blank' class='messaging-user-link'>" +
                        params.fullName + "</a>" : params.fullName;
                }
            }
            if (params.avatarUrl) {
                profileString = "<img src='" + params.avatarUrl + "' width='30' height='30'/>&nbsp;&nbsp;" +
                    profileString;
            } else {
                if (userObj && (userObj.type === "user" ||
                        (userObj.avatarUrl !== null && userObj.avatarUrl !== undefined))) {
                    profileString = "<img src='" + userObj.avatarUrl + "' width='30' height='30'/>&nbsp;&nbsp;" +
                        profileString;
                }
            }
            if (params.showClose) {
                closeString = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input name='userId' type='hidden' value='" +
                    params.id + "'/><a href='#' class='removeThisUser'>X</a>";
            }
            this.$el.find("#" + params.chooserName + "Value").append(spanString + profileString + closeString +
                "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>");
        }

    });

    SCF.UserChooserView = UserChooserView;
    SCF.UserChooser = UserChooser;

    SCF.registerComponent("social/messaging/components/hbs/userchooser", SCF.UserChooser, SCF.UserChooserView);

})($CQ, _, Backbone, SCF);
