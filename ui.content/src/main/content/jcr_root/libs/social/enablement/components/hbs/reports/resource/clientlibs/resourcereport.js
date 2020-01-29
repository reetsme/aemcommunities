/*
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2015 Adobe Systems Incorporated
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
(function(document) {
    "use strict";

    $(document).ready(function() {
        var trendSummaryReportJSON = $(".scf-reporting-pageContent").children().first();
        var modelText = $(trendSummaryReportJSON[0]).text();
        var enablementResourceModel = JSON.parse(modelText);
        if (enablementResourceModel.analyticsEnabled) {
            $(".scf-js-reporting-analytics").css("display", "inline-block");

            if (enablementResourceModel.primaryAssetType === "video") {
                $(".scf-js-reporting-video-analytics").css("display", "inline-block");

            }
        }
    });
})(document);
