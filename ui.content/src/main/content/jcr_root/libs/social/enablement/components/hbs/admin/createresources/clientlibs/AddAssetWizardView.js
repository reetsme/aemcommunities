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

(function(document, $, Backbone, Enablement) {
    "use strict";

    var AddAssetWizard = Enablement.AddAssetWizard = Enablement.AddAssetWizard || {};

    var AddAssetWizardView = Backbone.View.extend({

        refreshView: function() {
            this.stringify();
            this.updateTopIconsList();
            this.updateTblBackgroundView();
            this.showWaitingDiv(false);
            this.previewDisplayStatus();
            if (this.model.totalAssets() === 1) {
                $(".add-items-actions nav.pulldown", this.$el).addClass("hidden");
            } else {
                $(".add-items-actions nav.pulldown", this.$el).removeClass("hidden");
            }
            $(".add-items-actions nav.pulldown .coral-Popover", this.$el).css("display",
                "none");
            $("#add-items-add-actions-btn .coral-FileUpload-input", this.$el).val(null);
        },

        previewDisplayStatus: function() {
            if (this.model.totalAssets() === 0) {
                $(".add-items-previews", this.$el).addClass("hidden");
            } else {
                $(".add-items-previews", this.$el).removeClass("hidden");
            }
        },

        getAssetPickerIFrame: function() {
            return $("iframe#assetpicker", this.$el);
        },

        getModalDiv: function() {
            return $(".asset-upload-status-div", this.$el);
        },

        getWaitingDiv: function() {
            return $(".waiting-div", this.$el);
        },

        getExternalUrlResourceForm: function() {
            return this.options.externalUrlResourceForm;
        },

        getExternalResourceForm: function() {
            return this.options.externalResourceForm;
        },

        getConnectUrlResourceForm: function() {
            return this.options.adobeConnectUrlForm;
        },

        showWaitingDiv: function(flag) {
            if (!flag) {
                $(".add-items-tbl", this.$el).css("opacity", "1");
                $(".waiting-div", this.$el).css("display", "none");
            } else {
                $(".add-items-tbl", this.$el).css("opacity", "0.3");
                $(".waiting-div", this.$el).css("display", "block");
            }
        },

        stringify: function() {
            var jsonStr = this.model.stringify();
            $("input[name='assets']", this.$el).val(jsonStr);
            return jsonStr;
        },

        showConfirmForAddZipAssets: function(assetModel) {
            if (assetModel.getType() === "application/zip" &&
                Enablement.AddAssetWizard.States.ADDED === assetModel.get("state")
            ) {
                var that = this;
                this.showModalWin("#assetAddNotifyModal", "info", function() {
                        that.updateAssetView(assetModel);
                    },
                    function() {
                        that.model.undoLast(assetModel);
                        that.refreshView();
                    });
            } else {
                this.updateAssetView(assetModel);
            }
        },

        updateAssetView: function(assetModel) {
            var assetView = new Enablement.AddAssetWizard.Asset.view({
                "model": assetModel,
                "el": this.$el
            });
            this.listenTo(assetView, "change:assetView", this.stringify);
            this.refreshView();
        },

        updateTopIconsList: function() {
            var selectedAssets = this.model.getSelectedAssets();
            var numViewsSelected = selectedAssets.length;

            switch (numViewsSelected) {
                case 0:
                    $(".add-items-actions #add-items-del-actions-btn", this.$el).addClass(
                        "noshow");
                    $(".add-items-actions #add-items-up-actions-btn", this.$el).addClass(
                        "noshow");
                    $(".add-items-actions #add-items-down-actions-btn", this.$el).addClass(
                        "noshow");
                    break;

                case 1:
                    $(".add-items-actions #add-items-del-actions-btn", this.$el).removeClass(
                        "noshow");
                    if (this.model.totalAssets() > 1) {
                        $(".add-items-actions #add-items-down-actions-btn", this.$el).removeClass(
                            "noshow");
                        $(".add-items-actions #add-items-up-actions-btn", this.$el).removeClass(
                            "noshow");
                    }
                    break;

                default:
                    $(".add-items-actions #add-items-del-actions-btn", this.$el).removeClass(
                        "noshow");
                    $(".add-items-actions #add-items-up-actions-btn", this.$el).addClass(
                        "noshow");
                    $(".add-items-actions #add-items-down-actions-btn", this.$el).addClass(
                        "noshow");
                    break;
            }

        },

        updateFileUploadUrl: function() {
            this.fileUpload.set("uploadUrl", $(".dataSiteAssetsPath").data("siteassetspath") +
                ".createasset.html");
        },

        updateTblBackgroundView: function() {
            if (this.model.totalAssets() === 0) {
                $(".add-items-tbl", this.$el).css("background-color", "#eeeeee");
            } else {
                $(".add-items-tbl", this.$el).css("background-color", "#ffffff");
            }
        },

        initialize: function(options) {
            this.options = options;
            this.modalWins = {};
            this.previewDisplayStatus();
            this.addAssetActionsView = new Enablement.AddAssetWizard.AddAssetActionsView({
                el: $("nav.pulldown", this.$el),
                parentView: this
            });
            var that = this;
            this.listenTo(this.model, "addassetwizard:assetadded", function(assetInfo) {
                that.showConfirmForAddZipAssets(assetInfo);
            });
        },

        selectAllAssets: function() {
            var selectFlag = $("#add-items-tbl-check-all", this.$el).is(":checked");
            this.model.iterateOverAssetList(function(assetModel) {
                assetModel.selectAsset(selectFlag);
                return true;
            });
            this.updateTopIconsList();
        },

        selectAsset: function(e) {
            if ($(e.target).closest("tr").data("asset-model") !== undefined) {
                $(e.target).closest("tr").data("asset-model").selectAsset($(e.target).is(
                    ":checked"));
            }
            this.updateTopIconsList();
        },

        showConfirmForDeleteSelectedAssets: function() {
            if (!this.model.isSelectedClean()) {
                var that = this;
                that.deleteSelectedAssets();
            } else {
                this.deleteSelectedAssets();
            }
        },

        deleteSelectedAssets: function() {
            this.model.deleteSelectedAssets();
            this.refreshView();
        },

        moveSelectedAsset: function(evt) {
            var step = 0 + $(evt.target).data("step");
            var that = this;
            this.model.iterateOverAssetList(function(assetModel, index) {
                if (assetModel.isSelected()) {
                    that.model.moveAsset(index, step);
                    return false;
                }
                return true;
            });
            this.stringify();
        },

        loadInitialAssets: function(assetList) {
            this.addAssetActionsView.loadInitialAssets(assetList);
        },

        showModalWin: function(elemRef, type, primaryAction, cancelAction) {
            if (!this.modalWins[elemRef]) {
                this.modalWins[elemRef] = new CUI.Modal({
                    element: elemRef,
                    type: type
                });
                var that = this;
                if (cancelAction) {
                    $(elemRef + " .cancelBtn").on("click", function(evt) {
                        evt.preventDefault();
                        cancelAction();
                        that.modalWins[elemRef].hide();
                    });
                }

                if (primaryAction) {
                    $(elemRef + " .primaryBtn").on("click", function(evt) {
                        evt.preventDefault();
                        primaryAction();
                        that.modalWins[elemRef].hide();
                    });
                }
            } else {
                this.modalWins[elemRef].show();
            }
        },

        events: {
            "click #add-items-tbl-check-all": "selectAllAssets",
            "click #add-items-del-actions-btn": "showConfirmForDeleteSelectedAssets",
            "click #add-items-up-actions-btn": "moveSelectedAsset",
            "click #add-items-down-actions-btn": "moveSelectedAsset",
            "click .choose-this-row-chkbox": "selectAsset"
        }

    });

    AddAssetWizard.view = AddAssetWizardView;

})(document, $, Backbone, CQ.Communities.Enablement);
