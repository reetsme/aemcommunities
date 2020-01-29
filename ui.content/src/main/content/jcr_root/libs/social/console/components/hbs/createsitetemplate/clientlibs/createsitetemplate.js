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

    $(document).ready(function() {

        var enableSaveButton = function() {
            var tempName = $(".scf-js-social-console-template-name").val();

            if (_.isEmpty(tempName)) {
                $("#cq-social-create-sitetemplate-submit").prop("disabled", true);
            } else {
                $("#cq-social-create-sitetemplate-submit").prop("disabled", false);
            }
        };

        $(".scf-js-social-console-template-name").on("input", function() {
            enableSaveButton();
        });

        $("#cq-social-create-sitetemplate-submit").on("click", function(e) {
            var funcElements = $(".scf-js-community-function-list");
            var configSet = funcElements.data("func-config-set");
            var funcConfigs = configSet.getFuncConfigs();

            $("#functions").val(JSON.stringify({
                "functions": funcConfigs
            }));
            $(this).closest("form").submit();
        });
        enableSaveButton();
    });
})(window, document, Granite, Granite.$, SCFConsole);
