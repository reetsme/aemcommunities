/*************************************************************************
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
 *
 *************************************************************************/

(function($CQ, _, SCF, Granite) {
    "use strict";
    var BadgeModel = SCF.Model.extend({
        modelName: "BadgeModel",
        defaults: {
            badgeName: "",
            badgeImage: "",
            badgeImageType: ""
        },
        allowedImageTypes: ["image/jpg", "image/jpeg", "image/png"],
        isValid: function() {
            var image = this.get("image");
            var imageType = image ? image.type : this.get("badgeImageType");
            var badgeName = image ? image.name : this.get("badgeName");
            var badgeImage = image ? image.path : this.get("badgeImage");
            this.isAllowedType = _.contains(this.allowedImageTypes, imageType);
            if (badgeName && badgeImage && this.isAllowedType) {
                return true;
            }
            return false;
        }
    });
    var BadgeView = SCF.View.extend({
        viewName: "BadgeView",
        events: {
            "change input.scf-js-social-badge-badgename": "badgeNameAdded",
            "change .scf-js-social-console-imgUploadImage": "badgeImageAdded",
            "click .scf-js-badge-create": "submitForm"
        },
        init: function() {
            this.isAllowedType = true;
            this.$form = $("#form-wizard-dataform");
            // Edit Case: Enable the Create button when loading the page
            this.enableCreateButton();
            if (this.model.get("image")) {
                this.changeImageFieldName(this.$form, "badgeImage");
                this.adjustImagePreviewDimensions();
            }
        },
        // Enabling the Next Button based on mandatory fields
        badgeNameAdded: function(e) {
            this.model.set("badgeName", $(e.currentTarget).val());
            this.enableCreateButton();
        },
        badgeImageAdded: function(e) {
            var imgFile = e.currentTarget.files[0];
            this.badgeImage = imgFile.name;
            this.badgeImageType = imgFile.type;
            // Populate Model
            this.model.set("badgeImage", imgFile.name);
            this.model.set("badgeImageType", imgFile.type);
            this.isAllowedType = _.contains(this.model.allowedImageTypes, this.badgeImageType);
            if (this.isAllowedType) {
                this.enableCreateButton();
            } else {
                // Disabling the create button
                $(".scf-js-badge-create").prop("disabled", true);
                var errorMessage = CQ.I18n.get("Invalid Image type. Only JPG and PNG format files are accepted");
                this.displayErrorMessage(errorMessage);
            }
            this.adjustImagePreviewDimensions();
        },
        adjustImagePreviewDimensions: function() {
            $(".scf-js-social-console-divImagePreview").css({
                "height": "140px",
                "width": "auto"
            });
            $(".scf-js-social-console-imgUploadPreview").css({
                "width": "initial",
                "height": "initial",
                "max-height": "140px",
                "padding-top": "25px"
            });
        },
        /*
            Mandatory fields to enable the 'Create' Button:
                1. Badge Name
                2. Badge Image
        */
        enableCreateButton: function() {
            var createButton = $(".scf-js-badge-create");
            if (this.model.isValid()) {
                $(createButton).prop("disabled", false);
            } else {
                $(createButton).prop("disabled", true);
            }
        },
        // Display an error message at the page
        displayErrorMessage: function(errorMessage) {
            $(".scf-badging-erroralert .coral-Alert-message").text(errorMessage);
            $(".scf-badging-erroralert").show().delay(10000).fadeOut();
        },
        changeImageFieldName: function(form, fieldName) {
            form.find(".scf-js-social-console-divImageUpload input[type=\"file\"]").each(function() {
                $(this).attr("data-upload-url", fieldName);
                $(this).attr("data-file-name-parameter", fieldName);
            });
            if ($(".scf-js-social-console-divImageUpload input[type=\"hidden\"]").length > 0) {
                form.find(".scf-js-social-console-divImageUpload input[type=\"hidden\"]").each(function() {
                    $(this).attr("name", fieldName);
                });
            } else {
                $("<input>").attr({
                    type: "hidden",
                    id: "badgeImage",
                    name: "badgeImage",
                    value: this.$cacheFactorybadgeImage
                }).appendTo($(".scf-js-social-console-divImageUpload"));
            }
        },
        // In the Edit case, we need the suffix (badgePath) to post
        getSuffix: function() {
            var URL = CQ.shared.HTTP.getPath();
            var pageExtension = CQ.shared.HTTP.getExtension();
            var urlSplit = URL.split(pageExtension);
            if (urlSplit && urlSplit !== undefined) {
                if (urlSplit.length > 1) {
                    return Granite.HTTP.getContextPath() + urlSplit[1];
                }
            }
            return "";
        },
        submitForm: function(e) {
            e.preventDefault();
            var urlSuffix = this.getSuffix();
            if (urlSuffix) {
                this.$form.attr("action", urlSuffix);
            }
            // Check if the required form fields are available
            if (this.model.isValid()) {
                this.$form.submit();
            }
        }
    });

    SCF.BadgeModel = BadgeModel;
    SCF.BadgeView = BadgeView;
    SCF.registerComponent("social/gamification/components/hbs/managebadge", SCF.BadgeModel,
        SCF.BadgeView);
})($CQ, _, SCF, Granite);
