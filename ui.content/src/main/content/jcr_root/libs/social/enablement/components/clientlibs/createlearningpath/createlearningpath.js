/*************************************************************************
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
 *
 *************************************************************************/

(function(window, document, Granite, $, Enablement) {
    "use strict";

    var EnablementUtils = Enablement.Utils;
    $(document).on("foundation-contentloaded", function() {

        $("#resourceTitle").val(Enablement.resourceTitle);

        $("input[data-replace-ns]").replaceText();
        $("input[data-replace-ns]").keyup();

        // maxlength support in granite textfield and textarea component.
        $("input[data-maxlength], textarea[data-maxlength]").each(function() {
            $(this).attr("maxlength", $(this).data("maxlength"));
            $(this).removeData("maxlength");
            $(this).removeAttr("data-maxlength");
        });

        $(".scf-enablement-site-selector").on("site-selector-mode.changed", function(e, site) {
            if (site === undefined) {
                $(".site-controlled, .site-controlled input").attr("disabled", "disabled");
                $(".add-resources-wizard").addClass("add-resources-wizard-disabled");

            } else {
                // edit or site set
                $(".site-controlled, .site-controlled input").removeAttr("disabled");
                $(".add-resources-wizard").removeClass("add-resources-wizard-disabled");

                $(".site-controlled span").removeClass("is-disabled");
                if (CQ.Communities.Enablement.NewResourceCard.fileUpload !== undefined) {
                    CQ.Communities.Enablement.NewResourceCard.fileUpload.set("disabled",
                        false);
                }
                // set site specific assets path on resources picker
                $(".add-asset-wizard-wrapper iframe#resourcepicker").data(
                    "resourcepicker-suffix",
                    site.properties.siteResourcesPath);
                $(".add-asset-wizard-wrapper iframe#resourcepicker").attr(
                    "data-resourcepicker-suffix",
                    site.properties.siteResourcesPath);
                // set site context to enrollments
                $(".add-user-add-groups").data("site-filter", site.siteId);
                $(".add-user-add-groups").attr("data-site-filter", site.siteId);
                if ($("#form-wizard-dataform").data("mode-create") === true) {
                    $("#form-wizard-dataform").prop("action", site.properties.siteResourcesPath);
                }
            }
        });

        $(document).off("valid",
            ".foundation-layout-wizard.foundation-wizard .foundation-wizard-step");
        $("[data-enabler-form]").buttonEnabler();

        $(".foundation-wizard-control[data-action=cancel]").attr("data-pre-confirm-dialog",
            "#cancel-confirm-dialog");

        $(document).on("flexwizard-stepchange", function(e, toStep) {
            $("[list-required]").each(function() {
                var $searchableList = $(this);
                var selectedItemTarget = $searchableList.find(".list");

                if (toStep[0].id === $searchableList.closest(
                        ".foundation-wizard-step")[0].id) {
                    var event = $.Event("removable-item-list-modify");
                    event.selectedItemTarget = selectedItemTarget;

                    $searchableList.trigger(event);
                } else {
                    // Reset list-required attribute
                    $searchableList.attr("list-required", "false");
                }
            });

            // Trigger button enabler on each step
            $("[data-enabler-form]").buttonEnabler();
        });

        var showWaitingBar = function(flag) {
            if (!flag) {
                $(".coral-Modal-backdrop").remove();
                $(".coral-Wait.coral-Wait--center.coral-Wait--large").remove();
            } else {
                var waitingBarModalBackDrop =
                    $(
                        "<div class='coral-Modal-backdrop' style='display: block;' aria-hidden='true'></div>"
                    );
                var waitingBar = $(
                    "<div class='coral-Wait coral-Wait--center coral-Wait--large'></div>"
                );
                $("body").append(waitingBarModalBackDrop);
                $("body").append(waitingBar);
            }
        };

        var submitForm = function() {
            var $form = $("#form-wizard-dataform");
            $("input[name='learningpath-items']").val(Enablement.wrapperView.stringify());
            var formData = EnablementUtils.serializeForm($form);
            showWaitingBar(true);
            $.ajax({
                type: $form.prop("method"),
                url: $form.prop("action"),
                data: formData,
                dataType: "json"
            }).done(function(html) {
                showWaitingBar(false);
                var redirectUrl = $form.data("redirect-to");
                var appendChangeLog = $form.data("append-changelog");
                if (appendChangeLog === true) {
                    redirectUrl += html.path;
                }
                window.location.href = redirectUrl;
            }).fail(function(xhr) {
                showWaitingBar(false);
                var response = xhr.responseJSON;
                var failureModalDiv = "#" + $form.data("failure-callback-modal");
                $(failureModalDiv).find(".coral-Modal-body").html(
                    EnablementUtils.getErrorCodeDesc(response["sub-code"],
                        EnablementUtils.i18n)
                );
                // TODO: Need to find how to pop view without jshint complaining
                /*jshint -W031*/ // avoid W031: "Do not use 'new' for side effects."
                new CUI.Modal({
                    element: "#" + $form.data("failure-callback-modal"),
                    type: "error"
                });
            });
        };

        var showSaveResourceModal = function() {
            var modalDiv = $("#saveresource-warn-dialog");
            // TODO: Need to find how to pop view without jshint complaining
            /*jshint -W031*/ // avoid W031: "Do not use 'new' for side effects."
            new CUI.Modal({
                element: modalDiv,
                type: "notice"
            });
            $(modalDiv).find(".coral-Button--primary").on("click", function(e) {
                e.preventDefault();
                submitForm();

            });

            modalDiv.show();
        };

        var showModal = function() {
            var modalDiv = $("#form-wizard-dataform").data("confirm-modal");
            var modal = $(modalDiv).data("modal");
            if (modal) {
                modal.show();
            } else {
                modal = CUI.Modal({
                    element: $("#form-wizard-dataform").data("confirm-modal"),
                    type: "default"
                });

                $(modalDiv).find(".coral-Button:not(.coral-Button--primary)").off();
                $(modalDiv).find(".coral-Button:not(.coral-Button--primary)").on("click",
                    function(e) {
                        e.preventDefault();
                        modal.hide();
                    });

                $(modalDiv).find(".coral-Button--primary").off();
                $(modalDiv).find(".coral-Button--primary").on("click", function(e) {
                    e.preventDefault();
                    if ($("#published").val() === "true") {
                        showSaveResourceModal();
                    } else {
                        submitForm();
                    }
                });
            }
            modal.show();
        };

        var showConfirmation = function(button) {

            if ($(button).data("show-modal") === "true") {
                showModal();
            } else if ($("#published").val() === "true") {
                showSaveResourceModal();
            } else {
                submitForm();
            }
        };

        var showNoItemsModal = function(button) {
            var modalDiv = $("#no-items-warn-dialog");
            // TODO: Need to find how to pop view without jshint complaining
            /*jshint -W031*/ // avoid W031: "Do not use 'new' for side effects."
            new CUI.Modal({
                element: modalDiv,
                type: "notice"
            });

            $(modalDiv).find(".coral-Button--primary").off();
            $(modalDiv).find(".coral-Button--primary").on("click", function(e) {
                e.preventDefault();
                showConfirmation(button);

            });

            modalDiv.show();
        };

        $("#form-wizard-dataform .coral-Wizard-nav").off().on("click", "#submitBtn", function(e) {
            e.preventDefault();
            if ($("#add-items-tbl article").length <= 0) {
                showNoItemsModal(e.target);
            } else {
                showConfirmation(e.target);
            }
        });

        $.validator.register({
            selector: "input, textarea",
            validate: function(el) {
                var isRequired = el.prop("required") === true ||
                    (el.prop("required") === undefined && el.attr("required") !==
                        undefined) ||
                    el.attr("aria-required") === "true";

                if (isRequired && el.val().trim().length === 0) {
                    return el.message("validation.required") || "required";
                }
            }
        });
    });

})(window, document, Granite, Granite.$, CQ.Communities.Enablement);
