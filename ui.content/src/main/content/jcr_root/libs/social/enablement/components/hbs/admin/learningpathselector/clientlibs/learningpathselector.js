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
(function(Granite, $) {
    "use strict";

    $(document).ready(function() {
        var siteId = $(".dataSiteId").data("siteid");
        var siteResourcesPath = $(".dataSiteResourcesPath").data("siteresourcespath");
        if (siteId === undefined) {
            $(".site-controlled, .site-controlled input").attr("disabled", "disabled");
            $(".add-learningpaths-wizard").addClass("add-learningpaths-wizard-disabled");

        } else {
            // edit or site set
            $(".site-controlled, .site-controlled input").removeAttr("disabled");
            $(".add-learningpaths-wizard").removeClass("add-learningpaths-wizard-disabled");

            $(".site-controlled span").removeClass("is-disabled");
            // set site specific assets path on learningpaths picker
            $(".add-asset-wizard-wrapper iframe#learningpathpicker").data(
                "learningpathpicker-suffix",
                siteResourcesPath);
            $(".add-asset-wizard-wrapper iframe#learningpathpicker").attr(
                "data-resourcepicker-suffix",
                siteResourcesPath);
            // set site context to enrollments
            $(".add-user-add-groups").data("site-filter", siteId);
            $(".add-user-add-groups").attr("data-site-filter", siteId);
            if ($("#form-wizard-dataform").data("mode-create") === true) {
                $("#form-wizard-dataform").prop("action", siteResourcesPath);
            }
        }

        var initializeLearningPathsPicker = function(e) {
            if (e) {
                e.preventDefault();
            }
            var learningpathPickerIFrame = $("#learningpathpicker");
            $(".cq-social-enablement-add-learningpath-activator").on("click", function() {
                var iframeSuffix = learningpathPickerIFrame.data("learningpathpicker-suffix");
                learningpathPickerIFrame.attr(
                    "src", Granite.HTTP.getContextPath() + "/communities/learningpath-picker.html" +
                    iframeSuffix + "?isRequestFromLPCreation=true");
                learningpathPickerIFrame.css("display", "block");
            });
            window.addEventListener("message", function(event) {
                // Security concern: Confirm that the event was actually sent by the
                // assetPicker window opened by us and not by any other window.
                if (event.source === document.getElementById("learningpathpicker").contentWindow) {
                    var fromPicker = JSON.parse(event.data);
                    var $learningpathsEl = $(".scf-learningpathselector-selectlist");
                    for (var i in fromPicker.data) {
                        if (typeof fromPicker.data[i] === "object") {
                            // Add the selected learningpath to LP
                            var attr = {
                                "title": fromPicker.data[i].name,
                                "path": fromPicker.data[i].path
                            };
                            var learningpathTag = "<coral-tag name=\"lp-prerequisites\" value=\"" +
                                attr.path + "\">" +
                                CQ.shared.XSS.getXSSValue(attr.title) + "</coral-tag>";

                            $learningpathsEl.append(learningpathTag);
                        }
                    }
                    learningpathPickerIFrame.css("display", "none");
                    learningpathPickerIFrame.attr("src", "");
                }
            }, false);
        };

        var initialize = function() {
            initializeLearningPathsPicker();
        };

        initialize();
    });
})(Granite, Granite.$);
