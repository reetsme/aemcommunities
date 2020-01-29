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

(function(document, $) {
    "use strict";
    $(document).ready(function() {
        var progressionContainer = $(".scf-js-leaderboarditem-progression");
        var thresholds = progressionContainer.data("thresholds");
        if (thresholds) {
            // Assuming the thresholds are in ascending order.
            // So pickin the last value
            var maxThreshold = thresholds[thresholds.length - 1];
            $(".scf-js-progress").attr("aria-valuemax", maxThreshold);
        }
    });
})(document, $);
