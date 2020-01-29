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
(function(document, $, Backbone, _, Enablement) {
    "use strict";

    var AddAssetWizard = Enablement.AddAssetWizard = Enablement.AddAssetWizard || {};

    var AddAssetWizardModel = Backbone.Model.extend({

        defaults: {
            "uploadUrl": "",
            "userAssetsFolderNode": ""
        },

        initialize: function() {
            this.deletedAssetList = [];
            this.assetList = [];
        },

        iterateOverAssetList: function(iterator) {
            _.all(this.assetList, function(assetModel, index) {
                return iterator(assetModel, index);
            });
        },

        addNewAsset: function(assetInfo, state) {
            var asset = assetInfo.asset;
            var defCoverImg = assetInfo.assetDefCoverImg;
            var assetCategory = assetInfo.assetCategory;
            var resourceAssetName = assetInfo["resource-asset-name"];
            var thumbSrc = assetInfo.thumbnailSource;
            var coverImg = assetInfo.coverImg ||
                (thumbSrc !== "dam" &&
                    asset.path && asset.type.toLowerCase().indexOf("image") >= 0 ?
                    asset.path + "/jcr:content/renditions/cq5dam.thumbnail.319.319.png" :
                    null
                );
            var assetModelParam = {
                "asset": asset,
                "assetCoverImgUploadUrl": this.get("assetCoverImgUploadUrl"),
                "coverImg": coverImg,
                "asset-category": assetCategory,
                "resource-asset-name": resourceAssetName,
                "assetDefCoverImg": defCoverImg,
                "thumbnailSource": thumbSrc
            };
            if (assetInfo.assetSubCategory) {
                assetModelParam["asset-sub-category"] = assetInfo.assetSubCategory;
            }
            var assetModel = new Enablement.AddAssetWizard.Asset.model(assetModelParam);
            assetModel.setAssetState(state ? state : Enablement.AddAssetWizard.States.ADDED);
            this.assetList.push(assetModel);
            this.trigger("addassetwizard:assetadded", assetModel);
        },

        undoLast: function() {
            this.assetList.pop();
        },

        deleteSelectedAssets: function() {
            this.assetList = _.filter(this.assetList, function(assetModel) {
                if (assetModel.isSelected()) {
                    assetModel.deleteAsset();
                    this.deletedAssetList.push(assetModel);
                    return false;
                }
                return true;
            }, this);
        },

        getSelectedAssets: function() {
            var selectedAssets = _.filter(this.assetList, function(assetModel) {
                if (assetModel.isSelected() === false) {
                    return false;
                }
                return true;
            });
            return selectedAssets;
        },

        isSelectedClean: function() {
            return _.all(this.assetList, function(assetModel) {
                if (Enablement.AddAssetWizard.States.ADDED !== assetModel.get("state")) {
                    return false;
                }
                return true;
            });
        },

        totalAssets: function() {
            return this.assetList.length;
        },

        assetEdited: function(idx) {
            this.setAssetState(idx, Enablement.AddAssetWizard.States.EDITED);
        },

        setAssetState: function(idx, state) {
            this.assetList[idx].setState(state);
        },

        moveAsset: function(index, step) {
            var totalAssetsSize = this.totalAssets();
            if (index + step >= 0 && index + step < totalAssetsSize) {
                this.assetList[index].trigger("move-asset", index, step, totalAssetsSize);
                var temp = this.assetList[index];
                this.assetList[index] = this.assetList[index + step];
                this.assetList[index + step] = temp;
            }
        },

        stringify: function() {
            var jsonObj = [];
            var i;
            for (i = 0; i < this.deletedAssetList.length; i++) {
                jsonObj.push(this.deletedAssetList[i].stringify());
            }

            for (i = 0; i < this.assetList.length; i++) {
                jsonObj.push(this.assetList[i].stringify());
            }
            return JSON.stringify(jsonObj);
        }
    });

    AddAssetWizard.model = AddAssetWizardModel;

})(document, $, Backbone, _, CQ.Communities.Enablement);
