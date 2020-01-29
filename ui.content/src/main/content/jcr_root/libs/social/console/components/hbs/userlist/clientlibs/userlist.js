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

(function(Granite, $, SCFConsole) {
    "use strict";
    SCFConsole.editSite = SCFConsole.editSite || {};
    SCFConsole.editSite.JSON = SCFConsole.editSite.JSON || {};
    SCFConsole.userList = SCFConsole.userList || {};

    SCFConsole.userList.loadData = function(ctrl, userListURL, data) {
        var that = this;
        that.request = null;
        var selectedUsers = "";

        if (data.selectedusers && !$.isEmptyObject(SCFConsole.editSite.JSON) && data.fieldname == "groupEnablementManagers") {
            selectedUsers = SCFConsole.editEnablementSite.JSON;
            $CQ.each(data.selectedusers.split("."), function(index, item) {
                if (selectedUsers.hasOwnProperty(item)) {
                    selectedUsers = selectedUsers[item];
                } else {
                    selectedUsers = "";
                }
            });
        } else if (data.selectedusers && !$.isEmptyObject(SCFConsole.editSite.JSON)) {
            selectedUsers = SCFConsole.editSite.JSON;
            $CQ.each(data.selectedusers.split("."), function(index, item) {
                if (selectedUsers.hasOwnProperty(item)) {
                    selectedUsers = selectedUsers[item];
                } else {
                    selectedUsers = "";
                }
            });
        }

        /* global Coral */
        Coral.commons.ready(ctrl, function() {
            ctrl.set({
                forceSelection: true
            });
            ctrl.on("coral-autocomplete:showsuggestions", function(event) {
                if (that.request) {
                    that.request.abort();
                }
                event.preventDefault();
                var url = SCF.config.urlRoot + userListURL;
                if (userListURL.indexOf("type=groups") !== -1) {
                    url += '&filter=[{"operation":"like","rep:principalName":"' +
                        encodeURIComponent(event.detail.value) + '"},{"operation":"CONTAINS","profile/@givenName":"' +
                        encodeURIComponent(event.detail.value) + '"}]&fromPublisher=true&_charset_=utf-8';
                } else if (ctrl.name == "groupEnablementManagers") {
                    url += '?&filter=[{"operation":"CONTAINS","./@rep:principalName":"' + encodeURIComponent(event.detail.value) + '"},' +
                    '{"operation":"like","profile/@givenName":"' + encodeURIComponent(event.detail.value) + '"},' +
                    '{"operation":"like","profile/@familyName":"' +  encodeURIComponent(event.detail.value) + '"}]' +
                     '&type=users&fromPublisher=false&groupId=community-enablementmanagers&_charset_=utf-8';
                } else {
                    url += '?type=users&filter=[{"operation":"CONTAINS","./@rep:principalName":"' +
                        encodeURIComponent(event.detail.value) + '"},{"operation":"like","./@rep:principalName":"' +
                        encodeURIComponent(event.detail.value) + '"},{"operation":"like","profile/@givenName":"' +
                        encodeURIComponent(event.detail.value) + '"},{"operation":"like","profile/@familyName":"' +
                        encodeURIComponent(event.detail.value) + '"}]&fromPublisher=true&_charset_=utf-8';
                }
                that.request = $.get(url,
                    function(data) {
                        var suggestions = [];
                        if (data && data.items) {
                            $CQ.each(data.items, function(index, item) {
                                suggestions.push({
                                    value: item.id,
                                    content: '<img class="scf-js-console-useritem-avatar" width="32" height="32" src="' +
                                        item.externalAvatarUrl + '">' +
                                        '<span class="scf-js-console-useritem-name-block">' + item.name + '</span>' +
                                        '<div class="scf-js-console-useritem-id">' + item.id + '</div>'

                                });
                            });
                        }
                        ctrl.addSuggestions(suggestions);
                    }, "json");
            });
            ctrl.on("coral-autocomplete:hidesuggestions", function() {
                $(ctrl).find(".coral-Autocomplete-input").val("");
                ctrl.invalid = false;
                $(ctrl).find("coral-tag-label .scf-js-console-useritem-avatar").hide();
                $(ctrl).find("coral-tag-label .scf-js-console-useritem-id").hide();

                if (that.request) {
                    that.request.abort();
                }
            });
            if (selectedUsers.length) {
                $CQ.each(selectedUsers, function(index, item) {
                    ctrl.items.add({
                        value: item.id,
                        content: {
                            innerHTML: item.id
                        },
                        selected: true
                    });
                });
            }
        });
    };

    $(document).ready(function() {
        $(document).trigger("communities-enablementTab");
        if ($.isEmptyObject(SCFConsole.editSite.JSON)) {
            var editSiteModel = $("script[type=\"application/json\"]");
            if (editSiteModel.length) {
                var modelText = $(editSiteModel[0]).text();
                SCFConsole.editSite.JSON = JSON.parse(modelText);
            }
        }

        var holders = $(this).find(".scf-js-social-console-userlist-holder");
        var userListBaseURL = $(this).attr("data-url-path") && $(this).attr("data-url-path").length > 0 ? $(this).attr("data-url-path") : "/libs/social/console/content/content/userlist";
        var userListURL = userListBaseURL + '.social.0.20.json';

        $CQ.each(holders, function(index, holder) {
            var ctrl = $(holder).find(".scf-js-social-console-userlist").get(0);
            var data = $(holder).parent().data();
            if (data.fieldname) {
                $(ctrl).attr("name", data.fieldname);
            }
            SCFConsole.userList.loadData(ctrl, userListURL, data);
        });

    });
})(Granite, Granite.$, SCFConsole);
