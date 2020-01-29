/*
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2017 Adobe Systems Incorporated
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

(function(Granite, $) {
    "use strict";
    $(document).ready(function() {

        var ctrl = $(this).find(".scf-js-social-console-userlist").get(0);

        var that = this;
        that.request = null;
        if (ctrl) {
            var userListBaseURL = $(ctrl).attr("data-url-path") && $(ctrl).attr("data-url-path").length > 0 ? $(ctrl).attr("data-url-path") : "/libs/social/console/content/content/userlist";
            var userListURL = userListBaseURL + '.social.0.20.json';
            /* global Coral */
            Coral.commons.ready(ctrl, function() {
                ctrl.on("coral-autocomplete:showsuggestions", function(event) {
                    if (that.request) {
                        that.request.abort();
                    }
                    event.preventDefault();
                    that.request = $.get(SCF.config.urlRoot + userListURL +
                        '?filter=[{"operation":"CONTAINS","./@rep:principalName":"' +
                        encodeURIComponent(event.detail.value) + '"},{"operation":"like","profile/@givenName":"' +
                        encodeURIComponent(event.detail.value) + '"},{"operation":"like","profile/@familyName":"' +
                        encodeURIComponent(event.detail.value) + '"}]&type=users&fromPublisher=true&_charset_=utf-8',
                        function(data) {
                            var suggestions = [];
                            if (data && data.items) {
                                $CQ.each(data.items, function(index, item) {
                                    suggestions.push({
                                        value: item.authorizableId,
                                        content: '<img class="scf-js-console-useritem-avatar" width="32" height="32" src="' +
                                            item.externalAvatarUrl + '">' +
                                            '<span class="scf-js-console-useritem-name-block">' + item.name + '</span>' +
                                            '<div class="scf-js-console-useritem-id">' + item.authorizableId + '</div>'

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
            });
        }
    });
})(Granite, Granite.$);
