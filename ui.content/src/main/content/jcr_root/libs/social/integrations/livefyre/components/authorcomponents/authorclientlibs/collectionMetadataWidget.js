/*
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2016 Adobe Systems Incorporated
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

(function($, shared) {
    "use strict";
    var comps = window.LivefyreAuthoringComponents || {};
    var fixUIBasedOnSelection = function($scope, value) {
        var cssSearchPrefix = ".scf-js-";
        var cssMainClass = ".scf-js-collmetadata";
        var cssShowClass = cssSearchPrefix + value;
        $scope.find(cssMainClass).each(function(i, obj) {
            $(obj).closest(".x-form-item").hide().removeClass("x-hide-display");
            $(obj).closest(".x-form-item").find(".x-hide-display").removeClass("x-hide-display");
        });

        $scope.find(cssShowClass).each(function(i, obj) {
            $(obj).closest(".x-form-item").show();
        });
        console.log("got event: %o", $dialogBody);
    };

    comps.collectionMetadataChange = function(field, newValue) {
        var $panel = $(field.ownerCt.el.dom);
        fixUIBasedOnSelection($panel, newValue);
    };

    comps.expandCollectionUrlIfNeeded = function(field) {
        // var $field = $(field),
        var $panel = $(field.ownerCt.el.dom);
        var metaSelectionValue = $panel.find("[name='./generationType']:checked").val();
        if (metaSelectionValue.match(/^collUrl$/i)) {
            var dialog = field.findParentByType("dialog");
            var metadataAPI = "/api/v3.0/collection";
            if (field.initialConfig.validatorPromise && field.initialConfig.validatorPromise < 4) {
                return false;
            }
            if (field.isDirty()) {
                field.initialConfig.validatorPromise = shared.getCollectionMetaData(dialog.path, field.getValue());
                field.initialConfig.validatorPromise.done(function(metadata) {
                    delete field.initialConfig.validatorPromise;
                    $.each(metadata, function(name, value) {
                        dialog.params[name] = value;
                    });
                    dialog.getField("./customSiteId").setValue(metadata["./customSiteId"]);
                    dialog.getField("./customArticleId").setValue(metadata["./customArticleId"]);
                });
                field.initialConfig.validatorPromise.fail(function(e) {
                    delete field.initialConfig.validatorPromise;
                });
                return true;
            }
            // Async request is running please wait
            return false;
        } else {
            return true;
        }
    };
    window.LivefyreAuthoringComponents = comps;
})(Granite.$, window.LivefyreAuthoringComponents.shared);
