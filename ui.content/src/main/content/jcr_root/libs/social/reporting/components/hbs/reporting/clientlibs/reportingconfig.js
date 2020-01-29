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
(function(SCF, Coral) {

    "use strict";

    // commonly used selectors
    var sitefilterSel = "#scf-js-sitefilter";
    var resourcefilterSel = "#scf-js-resourcefilter";
    var userfilterSel = "#scf-js-userfilter";
    var groupfilterSel = "#scf-js-groupfilter";
    var usergroupswitchSel = "#scf-js-usergroupswitch";

    // breaking strings to pass jshint tests
    var userfilterBaseUrl = "/mnt/overlay/social/enablement/gui/components/ui" +
        "/searchabledropdownlist/userlist.social.0.10.json?type=simpleusers&fromPublisher=true&_charset_=utf-8";
    var groupfilterBaseUrl = "/mnt/overlay/social/enablement/gui/components/ui/" +
        "searchabledropdownlist/userlist.social.0.10.json?type=groups&fromPublisher=true&_charset_=utf-8";

    /*
     * Async. populate user filter :
     *  - when site is selected get first page of users with an empty strin query
     *  - when user types in the filter get users matching the query and populate user filter
     */

    var groupSuggestions;
    var localGroupSuggestions;
    var groupFilterRequest = null;
    var loadingGroups = false;

    var userSuggestions;
    var localUserSuggestions;
    var userFilterRequest = null;
    var loadingUsers = false;

    function refreshUserFilter() {
        var userFilter = document.querySelector(userfilterSel);
        localUserSuggestions = [];
        if (userSuggestions) {
            for (var i = 0; i < userSuggestions.length; i++) {
                var suggestion = {};
                suggestion.content = userSuggestions[i].content;
                suggestion.value = userSuggestions[i].value;
                if (userFilter.value !== suggestion.value) {
                    localUserSuggestions.push(suggestion);
                }
            }
            userFilter.addSuggestions(localUserSuggestions, true);
        }
    }

    function refreshGroupFilter() {
        var groupFilter = document.querySelector(groupfilterSel);
        localGroupSuggestions = [];
        if (groupSuggestions) {
            for (var i = 0; i < groupSuggestions.length; i++) {
                var suggestion = {};
                suggestion.content = groupSuggestions[i].content;
                suggestion.value = groupSuggestions[i].value;
                if (groupFilter.value !== suggestion.value) {
                    localGroupSuggestions.push(suggestion);
                }
            }
            groupFilter.addSuggestions(localGroupSuggestions, true);
        }
    }

    function populateUserFilter(e) {
        if (e) {
            e.stopPropagation();
        }
        var $userInput = $(userfilterSel + " input.coral-Textfield");
        var query = $userInput.val();
        var filter = "";
        if (query) {
            filter = "&filter=[{%22operation%22:%22like%22,%22@rep:principalName%22:%22" + query + "%22}," +
                "{%22operation%22:%22like%22,%22profile/@givenName%22:%22" + query + "%22}," +
                "{%22operation%22:%22like%22,%22profile/@familyName%22:%22" + query + "%22}]";
        }

        var userFilter = document.querySelector(userfilterSel);
        userSuggestions = [];

        Coral.commons.ready(userFilter, function() {
            if (userFilterRequest !== null) {
                userFilterRequest.abort();
            }
            userFilterRequest = $.get(userfilterBaseUrl + filter,
                function(response) {
                    userFilterRequest = null;

                    $(response.items).each(function() {
                        var suggestion = {};
                        suggestion.content = this.name;
                        suggestion.value = this.path;
                        if (userFilter.value !== suggestion.value) {
                            userSuggestions.push(suggestion);
                        }
                    });

                    refreshUserFilter();
                    loadingUsers = false;
                });
        });
    }

    // same as populateUserFilter only for groups
    function populateGroupFilter(e) {
        if (e) {
            e.stopPropagation();
        }
        var $groupInput = $(groupfilterSel + " input.coral-Textfield");
        var query = $groupInput.val();
        var filter = "";
        if (query) {
            filter = "&filter=[{\"operation\":\"like\",\"rep:principalName\":\"" + query + "\"}]";
        }

        var groupFilter = document.querySelector(groupfilterSel);
        groupSuggestions = [];

        Coral.commons.ready(groupFilter, function() {
            if (groupFilterRequest !== null) {
                groupFilterRequest.abort();
            }
            groupFilterRequest = $.get(groupfilterBaseUrl + filter,
                function(response) {
                    groupFilterRequest = null;
                    $(response.items).each(function() {
                        var suggestion = {};
                        suggestion.content = this.name;
                        suggestion.value = this.authorizableId;
                        if (groupFilter.value !== suggestion.value) {
                            groupSuggestions.push(suggestion);
                        }
                    });

                    refreshGroupFilter();
                    loadingGroups = false;
                });
        });
    }

    $("document").ready(function() {
        /*  site selection event handler
            - enable user-group switch and selectors
            - modify user-group async. call url by adding siteId
        */
        var sitePath;
        var siteTitle;
        var groupId;
        var groupName;
        var userId;
        var userName;
        var resourceId;
        var resourceName;

        var siteFilter = document.querySelector(sitefilterSel);
        var userFilter = document.querySelector(userfilterSel);
        var groupFilter = document.querySelector(groupfilterSel);
        var resourceFilter = document.querySelector(resourcefilterSel);
        var userGroupSwitch = document.querySelector(usergroupswitchSel);

        if (!_.isNull(userFilter)) {
            Coral.commons.ready(userFilter, function() {
                userFilter.on("coral-autocomplete:showsuggestions", function(e) {
                    if (loadingUsers) {
                        e.preventDefault();
                    } else if (localUserSuggestions && localUserSuggestions.length !== 0) {
                        e.preventDefault();
                        userFilter.addSuggestions(localUserSuggestions, true);
                    }
                });

                userFilter.on("coral-autocomplete:hidesuggestions", function() {
                    userFilter.clearSuggestions();
                    refreshUserFilter();
                });

                userFilter.on("change", function() {

                    // get list of user currently loaded on the client
                    var items = $(userfilterSel + " coral-autocomplete-item");

                    // get the path/id of the newly selected user (we need this for the query)
                    userId = $(userfilterSel + " input").val();

                    // get the list item that matches the newly selected user
                    var selectedItem = _.find(items, function(li) {
                        return $(li).attr("value") === userId;
                    });

                    userName = $(selectedItem).text();

                    if ($(userfilterSel + " input").val().length > 0) {
                        $("#scf-js-btn-generate").removeAttr("disabled");
                    }

                });
            });
        }

        if (!_.isNull(groupFilter)) {
            Coral.commons.ready(groupFilter, function() {
                groupFilter.on("coral-autocomplete:showsuggestions", function(e) {
                    if (loadingGroups) {
                        e.preventDefault();
                    } else if (localGroupSuggestions && localGroupSuggestions.length !== 0) {
                        e.preventDefault();
                        groupFilter.addSuggestions(localGroupSuggestions, true);
                    }
                });

                groupFilter.on("coral-autocomplete:hidesuggestions", function() {
                    groupFilter.clearSuggestions();
                    refreshGroupFilter();
                });

                groupFilter.on("change", function() {

                    // get list of groups currently loaded on the client
                    var items = $(groupfilterSel + " coral-autocomplete-item");

                    // get the path/id of the newly selected group (we need this for the query)
                    groupId = $(groupfilterSel + " input").val();

                    // get the list item that matches the newly selected group
                    var selectedItem = _.find(items, function(li) {
                        return $(li).attr("value") === groupId;
                    });

                    groupName = $(selectedItem).text();

                });
            });
        }

        if (!_.isNull(siteFilter)) {
            Coral.commons.ready(siteFilter, function() {
                siteFilter.on("change", function() {
                    sitePath = siteFilter.value;

                    /*
                     * Workaround necessary to get the site Id
                     */

                    // get list of sites loaded on the client
                    var items = $(sitefilterSel + " coral-autocomplete-item");

                    // get the list item that matches the selected site
                    var selectedItem = _.find(items, function(li) {
                        return $(li).attr("value") === sitePath;
                    });

                    var siteId = $(selectedItem).attr("data-id");
                    siteTitle = $(selectedItem).attr("data-display");

                    userfilterBaseUrl = CQ.shared.HTTP.removeParameter(userfilterBaseUrl, "siteId");
                    groupfilterBaseUrl = CQ.shared.HTTP.removeParameter(groupfilterBaseUrl, "siteId");

                    if (sitePath.length > 0) {

                        userfilterBaseUrl = CQ.shared.HTTP.addParameter(userfilterBaseUrl, "siteId", siteId);
                        groupfilterBaseUrl = CQ.shared.HTTP.addParameter(groupfilterBaseUrl, "siteId", siteId);

                        // enable rest of selectors once site is selected but not the buttons
                        $(".scf-communities-report-form-wrapper :disabled").removeAttr("disabled");
                    }

                    SCF.Util.announce("siteChange", {
                        sitePath: sitePath
                    });

                    /*
                     * When changing site selection the populate function will take care of resetting the hidden
                     * dropdownswith values relavant to the newly selected site. But we also need to clean out
                     * selected values.
                     */

                    // prepopulate group selector
                    $(groupfilterSel + " input").val("");
                    populateGroupFilter();

                    // prepopulate user selector
                    $(userfilterSel + " input").val("");
                    populateUserFilter();

                    // clear assignment selection when site changes
                    $(resourcefilterSel + " input").val("");
                });
            });
        }

        if (!_.isNull(resourceFilter)) {
            Coral.commons.ready(resourceFilter, function() {
                resourceFilter.on("change", function() {
                    /*
                     * Workaround necessary to display the resource title
                     * instead of the resource path after a resource is
                     * selected
                     */

                    // get list of resources currently loaded on the client
                    var items = $(resourcefilterSel + " coral-autocomplete-item");
                    // get the path/id of the newly selected resource (we need this for the query)
                    resourceId = $(resourcefilterSel + " input").val();

                    // get the list item that matches the newly selected resource
                    var selectedItem = _.find(items, function(li) {
                        return $(li).attr("value") === resourceId;
                    });

                    resourceName = $(selectedItem).text();

                    if (resourceId.length > 0) {
                        // enable button if group is also selected
                        if ($(groupfilterSel + " input").val().length > 0) {
                            $("#scf-js-btn-generate").removeAttr("disabled");
                        }
                    }

                });
            });
        }

        // if 2 following handlers (groups and users) continue being the same - comine into a function
        $(userfilterSel + " input").on("keyup", function(e) {
            localUserSuggestions = [];
            loadingUsers = true;
            populateUserFilter(e);
        });

        $(groupfilterSel + " input").on("keyup", function(e) {
            localGroupSuggestions = [];
            loadingGroups = true;
            populateGroupFilter(e);
        });

        $("#scf-js-btn-generate").on("click", function() {

            if ($("#scf-js-switchgroup")[0].checked) {
                SCF.Util.announce("generateGroupAssignmentReport", {
                    siteTitle: siteTitle,
                    groupId: groupId,
                    groupName: groupName,
                    resourceId: resourceId,
                    resourceName: resourceName
                });
            } else {
                SCF.Util.announce("generateUserAssignmentReport", {
                    sitePath: sitePath,
                    siteTitle: siteTitle,
                    userId: userId,
                    userName: userName
                });
            }
        });

        if (!_.isNull(userGroupSwitch)) {
            Coral.commons.ready(userGroupSwitch, function() {
                // user-groups radio switch
                userGroupSwitch.addEventListener("change", function(event) {
                    if (event.target.value === "user") {
                        $(".scf-userfilter-container").show();
                        $(".scf-groupfilter-container").hide();
                        // switching to user should clear out and disable assignments
                        $(resourcefilterSel + " input").val("").attr("disabled", "disabled");
                        $(resourcefilterSel + " button").attr("disabled", "disabled");
                        // clear out group
                        $(groupfilterSel + " input").val("");
                        // disable Generate btn because group and assignment have been cleared out
                        $("#scf-js-btn-generate").attr("disabled", "disabled");
                    } else {
                        $(".scf-userfilter-container").hide();
                        $(".scf-groupfilter-container").show();
                        // switching to group should enable assignments
                        $(resourcefilterSel + " input").removeAttr("disabled");
                        $(resourcefilterSel + " button").removeAttr("disabled");
                        // switching to group should clear out user
                        $(userfilterSel + " input").val("");
                        // disable Generate btn because user and assignment have been cleared out
                        $("#scf-js-btn-generate").attr("disabled", "disabled");

                        // need to refresh resource list since we cleared the selection
                        SCF.Util.announce("siteChange", {
                            sitePath: sitePath
                        });
                    }
                });
            });
        }

    });
})(SCF, window.Coral);
