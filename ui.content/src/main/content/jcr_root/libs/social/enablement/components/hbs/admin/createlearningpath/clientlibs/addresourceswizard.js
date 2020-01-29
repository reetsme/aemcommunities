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
(function(document, $, Granite) {
    "use strict";
    $(document).ready(function() {
        // Setup data for the Add Resources wizard
        var siteId = $(".dataSiteId").data("siteid");
        var siteResourcesPath = $(".dataSiteResourcesPath").data("siteresourcespath");
        if (siteId === undefined) {
            $(".site-controlled, .site-controlled input").attr("disabled", "disabled");
            $(".add-resources-wizard").addClass("add-resources-wizard-disabled");

        } else {
            // edit or site set
            $(".site-controlled, .site-controlled input").removeAttr("disabled");
            $(".add-resources-wizard").removeClass("add-resources-wizard-disabled");

            $(".site-controlled span").removeClass("is-disabled");
            // set site specific assets path on resources picker
            $(".add-asset-wizard-wrapper iframe#resourcepicker").data(
                "resourcepicker-suffix",
                siteResourcesPath);
            $(".add-asset-wizard-wrapper iframe#resourcepicker").attr(
                "data-resourcepicker-suffix",
                siteResourcesPath);
            // set site context to enrollments
            $(".add-user-add-groups").data("site-filter", siteId);
            $(".add-user-add-groups").attr("data-site-filter", siteId);
            if ($("#form-wizard-dataform").data("mode-create") === true) {
                $("#form-wizard-dataform").prop("action", siteResourcesPath);
            }
        }

        var initializeCheckboxEvents = function() {
            // Click action of Select All
            $(".header-select-all-items input").on("click", function(e) {
                var selectedAll = e.currentTarget.checked ? true : false;
                // Toggle Delete button
                var deleteButton = $(".cq-social-enablement-delete-resource-activator");
                deleteButton.toggleClass("hidden");
                // if 'select all' is checked, select all other checkboxes
                var itemCheckBoxes = $(".uploaded-select-item");
                for (var i = 0; i < itemCheckBoxes.length; i++) {
                    var item = itemCheckBoxes[i];
                    item.checked = selectedAll;
                }
            });
        };

        var initializeDeleteButton = function(e) {
            if (e) {
                e.preventDefault();
            }
            $(".cq-social-enablement-delete-resource-activator").on("click", function() {
                // if 'SelectAll' is checked, remove all items
                var selectAllCheckBox = $(".header-select-all-items input");
                var deleteButton = $(".cq-social-enablement-delete-resource-activator");
                if (selectAllCheckBox[0].checked) {
                    var $resourcesEl = $(".scf-js-added-resources");
                    $resourcesEl.html("");
                    // Unselect 'SelectAll' button
                    selectAllCheckBox[0].checked = false;
                    // Hide the Delete Button
                    deleteButton.toggleClass("hidden");
                }
            });
        };

        var initializeResourcesPicker = function(e) {
            if (e) {
                e.preventDefault();
            }
            var resourcePickerIFrame = $("#resourcepicker");
            $(".cq-social-enablement-add-resource-activator").on("click", function() {
                var iframeSuffix = resourcePickerIFrame.data("resourcepicker-suffix");
                resourcePickerIFrame.attr(
                    "src", Granite.HTTP.getContextPath() + "/communities/resource-picker.html" +
                    iframeSuffix + "?isRequestFromLPCreation=true");
                resourcePickerIFrame.css("display", "block");
            });
            window.addEventListener("message", function(event) {
                // Security concern: Confirm that the event was actually sent by the
                // assetPicker window opened by us and not by any other window.
                if (event.source === document.getElementById("resourcepicker").contentWindow) {
                    var fromPicker = JSON.parse(event.data);
                    var $resourcesEl = $(".scf-js-added-resources");
                    for (var i in fromPicker.data) {
                        if (typeof fromPicker.data[i] === "object") {
                            for (var prop in fromPicker.data[i]) {
                                if (typeof prop === "string") {
                                    fromPicker.data[i][prop] = window.unescape(
                                        fromPicker.data[i][prop]);
                                }
                            }
                            var defaultImage =
                  "/etc.clientlibs/settings/wcm/designs/default/resources/" +
                    "social/enablement/defaultCardImage.png";
                            // Add the selected Resource to LP
                            var attr = {
                                "id": fromPicker.data[i].id,
                                "cardImagePath": fromPicker.data[i].img !== undefined ?
                                    fromPicker.data[i].img : defaultImage,
                                "title": fromPicker.data[i].name,
                                "assetType": fromPicker.data[i].type,
                                "size": fromPicker.data[i].size !== "" ? fromPicker.data[i].size : "",
                                "type": "linked-resource",
                                "path": fromPicker.data[i].path
                            };

                            var resourceArticle = "<li id=\"" + attr.id +
                                "\" coral-dragaction coral-dragaction-dropzone=\"#dropzone\" " +
                                "class=\"ec-card card-item foundation-collection-item scf-js-resource-item\" " +
                                "data-path=\"" + CQ.shared.XSS.getXSSValue(CQ.shared.HTTP.encodePath(attr.path)) +
                                "\" coral-dragaction-axis=\"vertical\" data-name=\"" +
                                CQ.shared.XSS.getXSSValue(attr.title) + "\">" +
                                "<span class=\"coral-Table-cell uploaded-select\">" +
                                "<i class=\"coral-Icon coral-Icon--delete coral-Icon--sizeS " +
                                "remove-resource-item scf-js-item-action\"></i></span>" +
                                "<span class=\"coral-Table-cell uploaded-asset-cover-image\">" +
                                "<div style=\"background-image:" + "url('" +
                                CQ.shared.XSS.getXSSValue(CQ.shared.HTTP.encodePath(Granite.HTTP.getContextPath() +
                                attr.cardImagePath)) +
                                "');\"></div></span>" + "<span class=\"coral-Table-cell uploaded-asset-name\">" +
                                attr.title + "</span>" + "<span class=\"coral-Table-cell uploaded-asset-type\">" +
                                CQ.shared.XSS.getXSSValue(attr.assetType) + "</span>" +
                                "<span class=\"coral-Table-cell uploaded-asset-size\">" +
                                CQ.shared.XSS.getXSSValue(attr.size) + "</span><i class=\"move\"></i></li>";
                            $resourcesEl.append(resourceArticle);
                            var dragAction = new Coral.DragAction("#" + attr.id);
                            dragAction.containment = true;
                        }
                    }
                    resourcePickerIFrame.css("display", "none");
                    resourcePickerIFrame.attr("src", "");
                }

            }, false);
        };

        var initialize = function() {
            initializeCheckboxEvents();
            initializeResourcesPicker();
            initializeDeleteButton();
        };

        initialize();
        // Click action for individual Resource Item Remove
        $(document).on("click", ".remove-resource-item", function(e) {
            var rowItem = e.currentTarget.parentNode.parentNode;
            rowItem.remove();
        });
    });
})(document, $, Granite);
