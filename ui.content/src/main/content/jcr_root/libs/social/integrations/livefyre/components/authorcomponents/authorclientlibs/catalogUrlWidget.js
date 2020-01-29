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
    comps.determineCollectionUrl = function(dialog) {
        var $collectionLink = $("#" + dialog.body.id + " .scf-js-lf-collectionLink");
        $collectionLink.text(CQ.I18n.get("Determing Collection Link..."));
        shared.updateCollectionLink(dialog.path, $collectionLink);
    };

})(Granite.$, window.LivefyreAuthoringComponents.shared);
