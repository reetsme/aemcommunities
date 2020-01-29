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
/* jshint maxparams: 6 */
(function(document, $, Backbone, _, Enablement, Granite) {
    /* jshint maxparams: 5 */
    "use strict";

    var AddAssetWizard = Enablement.AddAssetWizard;
    AddAssetWizard.Asset = AddAssetWizard.Asset || {};

    var AssetView = Backbone.View.extend({

        initialize: function() {
            this.listenTo(this.model, "change:coverImg", this.updateCoverImgSrc);
            this.listenTo(this.model, "deleteAsset", this.deleteView);
            this.listenTo(this.model, "select-asset", this.selectView);
            this.listenTo(this.model, "move-asset", this.moveAsset);
            this.listenTo(this.model, "change", this.propagateAssetViewChanged);
            $("table#course-contents-tbl tbody", this.$el).append(
                "<tr  class='coral-Table-row'></tr>");
            $(".add-items-previews ol", this.$el).append("<li></li>");
            this.$rowEl = $("table#course-contents-tbl tbody tr:last", this.$el);
            this.$previewEl = $(".add-items-previews ol li:last", this.$el);
            this.render();
        },

        renderTableRow: function() {
            var assetInfo = this.model.get("asset");
            var trHtml =
                "<td class='coral-Table-cell'><label><input class='choose-this-row-chkbox' type='checkbox'>";
            trHtml += "<span></span></label></td>";
            trHtml += "<td class=\"coral-Table-cell uploaded-asset-name\">" +
                CQ.shared.XSS.getXSSValue(assetInfo.title) + "</td>";
            trHtml += "<td class='coral-Table-cell'>" + CQ.shared.XSS.getXSSValue(assetInfo.type) + "</td>";
            var size = assetInfo.size;
            if (assetInfo.size === undefined) {
                size = "";
            }
            trHtml += "<td class='coral-Table-cell'>" + CQ.shared.XSS.getXSSValue(size) + "</td>";
            this.$rowEl.append(trHtml);
            this.$rowEl.data("asset-model", this.model);
            $("#completion-req", this.$rowEl).select({});
        },

        renderPreview: function() {
            var assetInfo = this.model.get("asset");
            var that = this;
            $("div.add-item-asset-name").text(assetInfo.title);
            var liHtml = $("#uploaded-asset-cover-img-template").html();
            this.$previewEl.append(liHtml);
            if (this.model.get("thumbnailSource") === "custom") {
                this.customCoverImageView(true);
            } else {
                this.customCoverImageView(false);
            }

            $("#add-items-upload-custom-cover-btn", this.$previewEl)
                .off("coral-fileupload:loadend")
                .on("coral-fileupload:loadend", function(event) {
                    that.uploadCustomCoverImg(event);
                })
                .off("coral-fileupload:error")
                .on("coral-fileupload:error", function() {
                    this.showErrorMsg(CQ.I18n.get("Error while uploading asset cover image."));
                });
        },

        render: function() {
            this.renderTableRow();
            this.renderPreview();
            $("#course-contents-tbl").trigger("enablement-assetTable-rowcountchanged");
        },

        selectView: function(selectFlag) {
            $(".choose-this-row-chkbox", this.$rowEl).prop("checked", selectFlag);
            if (selectFlag) {
                $("i.uploaded-asset-cover-img-select", this.$previewEl).css("display",
                    "block");
                this.$previewEl.children("div").css("opacity", "0.5");
            } else {
                $("i.uploaded-asset-cover-img-select", this.$previewEl).css("display", "none");
                this.$previewEl.children("div").css("opacity", "1");
            }
        },

        customCoverImageView: function(customFlag) {
            if (customFlag) {
                var that = this;
                this.$previewEl
                    .find(".add-item-remove-custom-cover-btn")
                    .css("opacity", "1").fipo("tap", "click",
                        function() {
                            that.removeCustomCoverImg();
                        });
            } else {
                this.$previewEl.find(".add-item-remove-custom-cover-btn").css("opacity",
                    "0.5").off();
            }
        },

        isSelected: function() {
            return $(".choose-this-row-chkbox", this.$rowEl).is(":checked");
        },

        deleteView: function() {
            var trElem = this.$rowEl.closest("tr");
            var liElem = this.$previewEl.closest("li");
            this.stopListening();
            trElem.remove();
            liElem.remove();
            $("#course-contents-tbl").trigger("enablement-assetTable-rowcountchanged");
        },

        moveAsset: function(index, step, maxIndex) {
            if (index + step >= 0 && index + step < maxIndex) {
                if (step === 1) {
                    this.$rowEl.detach().insertAfter("table#course-contents-tbl tbody tr:eq(" +
                        index + ")");
                    this.$previewEl.detach().insertAfter(".add-items-previews ol li:eq(" +
                        index + ")");
                } else if (step === -1) {
                    this.$rowEl.detach().insertBefore(
                        "table#course-contents-tbl tbody tr:eq(" + (index - 1) + ")");
                    this.$previewEl.detach().insertBefore(".add-items-previews ol li:eq(" + (
                        index - 1) + ")");
                }
            }
            return false;
        },

        uploadCustomCoverImg: function(event) {
            var response = $.parseJSON(event.originalEvent.detail.item.responseText);
            var status = response.status;
            if (status.toLowerCase() === "ok") {
                this.model.set("coverImg", response.result["uploaded-path"] + "/image");
                this.model.set("thumbnailSource", "custom");
                this.model.setAssetState(AddAssetWizard.States.EDITED);
                this.customCoverImageView(true);
            } else {
                this.showErrorMsg();
            }
        },
        removeCustomCoverImg: function() {

            // try to take out the dam thumbnail else default thumbnail
            var generatedCoverImg = this.model.get("asset").path +
                "/jcr:content/renditions/cq5dam.thumbnail.319.319.png";
            if (CQ.shared.HTTP.isOk(CQ.shared.HTTP.get(generatedCoverImg))) {
                this.model.set("coverImg", generatedCoverImg);
                this.model.set("thumbnailSource", "dam");
            } else {
                this.model.set("coverImg", this.model.get("assetDefCoverImg"));
                this.model.set("thumbnailSource", "default");
            }
            this.model.setAssetState(AddAssetWizard.States.EDITED);
            this.customCoverImageView(false);
        },

        showErrorMsg: function(errMsg, ommitI18n) {
            var btnArr = [{
                label: CQ.I18n.get("Close"),
                click: "hide"
            }];
            if (ommitI18n) {
                this.showModal("error", CQ.I18n.get("Error"), errMsg, btnArr);
            } else {
                this.showModal("error", CQ.I18n.get("Error"), CQ.I18n.get(errMsg), btnArr);
            }
        },

        showModal: function(type, headerHtml, bodyHtml, buttonArr) {
            if (this.$modalDiv) {
                var modal = this.$modalDiv.data("modal");
                modal.options.buttons = buttonArr;
                modal.options.header = headerHtml;
                modal.options.content = bodyHtml;
                modal.options.type = type;
                modal.applyOptions();
                modal.show();
            } else {
                this.$modalDiv = $(".asset-upload-status-div", this.$el).modal({
                    type: type,
                    header: headerHtml,
                    content: bodyHtml,
                    buttons: buttonArr
                });
            }
        },

        updateCoverImgSrc: function() {
            $(".add-item-asset-cover-img",
                this.$previewEl).css("background-image",
                "url(\"" + Granite.HTTP.getContextPath() + this.model.get("coverImg") + "\")"
            );
        },

        propagateAssetViewChanged: function() {
            this.trigger("change:assetView");
        },

        stringify: function() {
            return this.model.stringify();
        },

        events: {}

    });

    AddAssetWizard.Asset.view = AssetView;

})(document, $, Backbone, _, CQ.Communities.Enablement, Granite);
