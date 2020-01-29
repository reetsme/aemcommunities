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
    SCFConsole.editCommunityFunction = SCFConsole.editCommunityFunction || {};
    SCFConsole.editCommunityFunction.JSON = SCFConsole.editCommunityFunction.JSON || {};

    $(document).ready(function() {
        if ($.isEmptyObject(SCFConsole.editSite.JSON)) {
            var editCommunityFunctionModel = $("script[type=\"application/json\"]");
            var modelText = $(editCommunityFunctionModel[0]).text();
            SCFConsole.editCommunityFunction.JSON = JSON.parse(modelText);
        }

        var select = $(".scf-js-cq-social-blueprints-select").get(0);
        if (SCFConsole.editCommunityFunction.JSON && SCFConsole.editCommunityFunction.JSON.bluePrintPath) {
            var bluePrintPath = SCFConsole.editCommunityFunction.JSON.bluePrintPath;
            /* Global Coral */
            Coral.commons.ready(select, function() {
                select.value = bluePrintPath;
            });
        }
    });
})(Granite, Granite.$, SCFConsole);
