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

    SCFConsole.socialLogins = SCFConsole.socialLogins || {};

    var socialConfigListBaseURL = $(this).attr("data-url-path") && $(this).attr("data-url-path").length > 0 ? $(this).attr("data-url-path") : "/libs/social/console/content/content/sociallogins";
    var socialConfigListURL = socialConfigListBaseURL + '.social.json'; // ?context=/conf/we-retail

    var data;

    function updateFacebookConfigsInDropdown(configurations) {
        var facebookSelectElementSelector = ".scf-js-social-console-facebook-connect-select coral-select";
        var selectElement = $(facebookSelectElementSelector).get(0);
        selectElement.items.clear(); // clear existing values

        var firstVal = null;
        /* Global Coral */
        Coral.commons.ready(selectElement, function() {
            for (var i = 0; i < configurations.length; i++) {

                selectElement.items.add({
                    value: configurations[i].id,
                    content: {
                        innerHTML: configurations[i].name
                    }
                });
            }
        });
    }

    function updateTwitterConfigsInDropdown(configurations) {
        var twitterSelectElementSelector = ".scf-js-social-console-twitter-connect-select coral-select";
        var selectElement = $(twitterSelectElementSelector).get(0);

        selectElement.items.clear(); // clear existing values
        var firstVal = null;
        /* Global Coral */
        Coral.commons.ready(selectElement, function() {
            for (var i = 0; i < configurations.length; i++) {

                selectElement.items.add({
                    value: configurations[i].id,
                    content: {
                        innerHTML: configurations[i].name
                    }
                });
            }
        });
    }

    SCFConsole.socialLogins.setCloudConfig = function() {

        if ($(".scf-js-console-allowtwitter").is(":checked") && !SCFConsole.socialLogins.isCloudConfigSet()) {
            $(".scf-console-twitter-div").show();
            $(".scf-js-social-console-twitter-connect-select select").prop("disabled", false);
        } else {
            $(".scf-console-twitter-div").hide();
            $(".scf-js-social-console-twitter-connect-select select").prop("disabled", true);
        }
        if ($(".scf-js-console-allowfacebook").is(":checked") && !SCFConsole.socialLogins.isCloudConfigSet()) {
            $(".scf-console-facebook-div").show();
            $(".scf-js-social-console-facebook-connect-select select").prop("disabled", false);
        } else {
            $(".scf-console-facebook-div").hide();
            $(".scf-js-social-console-facebook-connect-select select").prop("disabled", true);
        }
    };
    SCFConsole.socialLogins.isCloudConfigSet = function() {

        var siteCloudConfigContextFieldSelector = ".site-cloud-config input";
        var siteCloudConfigContextField = $(siteCloudConfigContextFieldSelector);
        var siteCloudConfigContext = "";
        if (siteCloudConfigContextField) {
            siteCloudConfigContext = siteCloudConfigContextField.val();
        }
        if (siteCloudConfigContext.trim() !== "") {
            return true;
        } else {
            return false;
        }
    };
    $(document).ready(function() {

        //Attach Event Listeners
        var cloudConfigFieldSelector = ".site-cloud-config";
        var cloudConfigField = $(cloudConfigFieldSelector);
        if (cloudConfigField) {
            cloudConfigField.on("change", function() {
                SCFConsole.socialLogins.setCloudConfig();
            });
        }

        $(".scf-js-console-allowfacebook").on("change", function() {
            if ($(".scf-js-console-allowfacebook").get(0).checked && !SCFConsole.socialLogins.isCloudConfigSet()) {
                $(".scf-console-facebook-div").show();
                $(".scf-js-social-console-facebook-connect-select select").prop("disabled", false);

            } else {
                $(".scf-console-facebook-div").hide();
                $(".scf-js-social-console-facebook-connect-select select").prop("disabled", true);
            }
        });
        $(".scf-js-console-allowtwitter").on("change", function() {
            if ($(".scf-js-console-allowtwitter").get(0).checked && !SCFConsole.socialLogins.isCloudConfigSet()) {
                $(".scf-console-twitter-div").show();
                $(".scf-js-social-console-twitter-connect-select select").prop("disabled", false);

            } else {
                $(".scf-console-twitter-div").hide();
                $(".scf-js-social-console-twitter-connect-select select").prop("disabled", true);
            }
        });
        SCFConsole.socialLogins.setCloudConfig();
    });

})(window, document, Granite, Granite.$, SCFConsole);
