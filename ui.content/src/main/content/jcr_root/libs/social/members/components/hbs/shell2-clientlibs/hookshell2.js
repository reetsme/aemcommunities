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
(function($, SCF, document, console) {
    "use strict";

    var targetModel = null;
    var targetView = null;
    SCF.shell2 = {};

    var keywordFilterSel = ".scf-js-members-keyword-textbox";
    var siteFilterSel = "#sitefilter input[type=text]";
    var siteFilterACItemsSel = "#sitefilter .coral-SelectList-item--option";
    var siteFilterIdSel = "#sitefilter input[type=hidden]";
    var userBannedSel = ".scf-js-ban-status-banned";
    var userUnbannedSel = ".scf-js-ban-status-unbanned";

    SCF.shell2.toggleSelectionMode = function() {
        var coralTable = $("table[is=coral-table]")[0];
        if (!coralTable) {
            return;
        }
        if (coralTable.selectable || (coralTable.selectionMode !== "none")) {
            coralTable.selectable = false;
            coralTable.selectionMode = "none";
        } else {
            coralTable.selectable = true;
            coralTable.selectionMode = "row";
        }
        SCF.shell2.enforceRowSelectableState();
    };

    SCF.shell2.enforceRowSelectableState = function() {
        var coralTable = $("table[is=coral-table]")[0];
        if (!coralTable) {
            return;
        }
        if (coralTable.selectable) {
            coralTable.variant = Coral.Table.variant.LIST;
        }
    };

    SCF.shell2.isShell2 = function() {
        return ($(".js-endor-page").length > 0);
    };

    SCF.shell2.hookFilterButtons = function(targetComponent) {
        // Look under the rail for a form
        $(("button[id^='filter-']")).click(function(event) {
            event.preventDefault();
            var $target = $(event.target);
            var $form = $target.closest("form");
            if ($form.length < 1) {
                return;
            }
            if ($target.attr("id").indexOf("apply") >= 0) {
                var action = $form.attr("action");
                // Apply siteId for selected site
                var siteUrlName = $(siteFilterSel).val();
                var siteId = $(siteFilterACItemsSel).filter(function() {
                    return $(this).attr("data-value") === siteUrlName;
                }).attr("data-id");
                $(siteFilterIdSel).val(siteId);
                var urlToGet = action + "&" + $form.serialize();
                // Then serialzing the form doesn't pickup things even though checked="checked"
                if ($form.find("input[type='checkbox'].scf-js-ban-status-banned").attr("checked") &&
                    !$form.find("input[type='checkbox'].scf-js-ban-status-unbanned").attr("checked")) {
                    urlToGet += "&disabled=true";
                }
                if ($form.find("input[type='checkbox'].scf-js-ban-status-unbanned").attr("checked") &&
                    !$form.find("input[type='checkbox'].scf-js-ban-status-banned").attr("checked")) {
                    urlToGet += "&disabled=false";
                }
                var req = $.get(urlToGet);
                req.done(function(data) {
                    if (!targetModel) {
                        _.each(SCF.loadedComponents, function(o) {
                            _.each(o, function(o) {
                                // Some reason this whole thing is mounted on an overlay.
                                var mntOption = "/mnt/overlay" + targetComponent.substring(5);
                                if ((mntOption === o.model.get("id")) || (targetComponent === o.model.get("id"))) {
                                    targetModel = o.model;
                                    targetView = o.view;
                                }
                            });
                        });
                    }
                    if (!targetModel) {
                        console.warn("Could not find component with ID %s to refresh", targetComponent);
                        return;
                    }
                    targetModel.set(targetModel.parse(data));
                    targetModel.set("id", targetComponent);
                    targetModel.trigger("model:loaded");
                });
                req.error(function() {
                    console.error("error!");
                });
            } else {
                $(keywordFilterSel).val("");
                $(siteFilterSel).val("");
                $(userBannedSel).removeAttr("checked");
                $(userUnbannedSel).removeAttr("checked");
            }
        });
    };
    // Really don't like this but the coral checkboxes don't update the markup with anything to tell if
    // they are checked once a accordion is collapsed.
    $CQ(function() {
        $(".endor-Page-sidepanel--innerRail input[type='checkbox'].coral-Checkbox-input").click(function(event) {
            var $checkbox = $(event.target);
            $checkbox.attr("checked", !($checkbox.attr("checked")));
        });
    });
})($CQ, SCF, document, window.console);
