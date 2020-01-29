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
(function(window, document, Granite, $, SCFConsole) {
    "use strict";
    SCFConsole.editEnablementSite = SCFConsole.editEnablementSite || {};
    SCFConsole.editEnablementSite.JSON = SCFConsole.editEnablementSite.JSON || {};

    $(document).bind("communities-enablementTab", function() {
        /* var userListURL =
            "/libs/social/console/content/content/userlist.social.0.20.json?" +
            "filter=[{%22operation%22:%22CONTAINS%22,%22./@rep:principalName%22:%22" +
            query + "%22}," +
            "{%22operation%22:%22like%22,%22profile/@givenName%22:%22" + query +
            "%22}," +
            "{%22operation%22:%22like%22,%22profile/@familyName%22:%22" + query +
            "%22}]" +
            "&type=users&fromPublisher=false&groupId=community-enablementmanagers&_charset_=utf-8";*/

        if ($.isEmptyObject(SCFConsole.editEnablementSite.JSON)) {
            var componentId = $(
                    "div[data-scf-component=\"social/enablement/components/hbs/admin/enablementsite\"]"
                )
                .data("componentId");
            var editSiteModel = $("script[type=\"application/json\"][id=\"" + componentId + "\"]");
            var modelText = $(editSiteModel[0]).text();
            if (!_.isEmpty(modelText)) {
                SCFConsole.editEnablementSite.JSON = JSON.parse(modelText);
                if (!$.isEmptyObject(SCFConsole.editEnablementSite.JSON) &&
                        (!$.isEmptyObject(SCFConsole.editEnablementSite.JSON.configuration)) &&
                        (!$.isEmptyObject(SCFConsole.editEnablementSite.JSON.configuration.enablementManagers))) {
                    $.each(SCFConsole.editEnablementSite.JSON.configuration.enablementManagers,
                            function(index, value) {
                            value.id = "/social/authors/" + value.authorizableID;
                        });
                }
            }
        }
    });
})(window, document, Granite, Granite.$, SCFConsole);
