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
(function(SCF, Coral) {

    "use strict";

    // commonly used selectors
    var sitefilterSel = "#scf-js-analytics-sitefilter";
    var componentFilterSel = "#scf-js-analytics-componentfilter";
    var dateFilterSel = "#scf-js-analytics-datelist";
    var generateButtonSel = "#scf-js-btn-analytics-report-generate";

    var sitePath;
    var componentType;
    var dateFrom = window.moment().subtract(7, "d").format("YYYY-MM-DD");
    var dateTo = window.moment().format("YYYY-MM-DD");

    function adjustGenerateButtonState() {
        if (_.isUndefined(sitePath) || _.isUndefined(componentType) || _.isUndefined(dateFrom) || _.isUndefined(
                dateTo)) {
            $(generateButtonSel).prop("disabled", true);
        } else {
            $(generateButtonSel).prop("disabled", false);
        }
    }

    $("document").ready(function() {

        var siteFilter = document.querySelector(sitefilterSel);
        var lastSiteInput = "";

        Coral.commons.ready(siteFilter, function() {
            siteFilter.on("change", function() {
                sitePath = siteFilter.value;
                lastSiteInput = siteFilter.items._host._optionsMap[sitePath].content;
                adjustGenerateButtonState();
            });

            siteFilter.on("coral-autocomplete:showsuggestions", function(event) {
                if (lastSiteInput === event.detail.value) {
                    event.preventDefault();
                    window.setTimeout(function() {
                        siteFilter.addSuggestions(siteFilter.items._host._options, true);
                    }, 50);
                } else {
                    lastSiteInput = event.detail.value;
                }
            });
        });

        var componentFilter = document.querySelector(componentFilterSel);
        var lastComponentInput = "";

        Coral.commons.ready(componentFilter, function() {
            componentFilter.on("change", function() {
                componentType = componentFilter.value;
                lastComponentInput = componentFilter.items._host._optionsMap[componentType].content;
                adjustGenerateButtonState();
            });

            componentFilter.on("coral-autocomplete:showsuggestions", function(event) {
                if (lastComponentInput === event.detail.value) {
                    event.preventDefault();
                    window.setTimeout(function() {
                        componentFilter.addSuggestions(componentFilter.items._host._options, true);
                    }, 50);
                } else {
                    lastComponentInput = event.detail.value;
                }
            });
        });

        var dateFilter = document.querySelector(dateFilterSel);

        Coral.commons.ready(dateFilter, function() {
            dateFilter.on("change", function() {
                dateFrom = window.moment().subtract(Number(dateFilter.value), "d").format("YYYY-MM-DD");
                adjustGenerateButtonState();
            });
        });

        $(generateButtonSel).on("click", function() {
            SCF.Util.announce("generateSiteTrendReport", {
                sitePath: sitePath,
                componentType: componentType,
                dateFrom: dateFrom,
                dateTo: dateTo
            });

            $(".scf-js-reporting-pageContent").show();
        });

    });
})(SCF, window.Coral);
