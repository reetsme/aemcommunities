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

    var EnablementUtils = Enablement.Utils;
    Enablement.AddAssetWizard.Asset = Enablement.AddAssetWizard.Asset || {};

    var AssetModel = Backbone.Model.extend({

        defaults: {
            asset: null,
            coverImg: null,
            assetCoverImgUploadUrl: null,
            thumbnailSource: "dam",
            "asset-category": "enablementAsset:dam",
            "resource-asset-name": "",
            "state": "",
            "is-selected": false
        },

        deleteAsset: function() {
            this.attributes.state = Enablement.AddAssetWizard.States.DELETED;
            this.trigger("deleteAsset");
        },

        getType: function() {
            var assetInfo = this.get("asset");
            if (assetInfo) {
                return assetInfo.type;
            }
            return null;
        },

        initialize: function() {
            var that = this;
            var errHandler = function() {
                that.set("coverImg", that.get("assetDefCoverImg"));
                that.set("thumbnailSource", "default");
            };

            if (this.get("coverImg")) {
                $.ajax({
                    type: "HEAD",
                    async: false,
                    url: EnablementUtils.encoderPathForUrl(this.get("coverImg")),
                    success: function() {},
                    error: function() {
                        errHandler();
                    }
                });
            } else {
                errHandler();
            }
        },

        setAssetState: function(state) {
            var currentState = this.get("state");
            if (currentState === Enablement.AddAssetWizard.States.DELETED ||
                (currentState === Enablement.AddAssetWizard.States.ADDED &&
                    state === Enablement.AddAssetWizard.States.EDITED)
            ) {
                return;
            }
            this.set("state", state);
        },

        selectAsset: function(selectFlag) {
            this.attributes["is-selected"] = selectFlag;
            this.trigger("select-asset", selectFlag);
        },

        isSelected: function() {
            return this.get("is-selected") && this.get("state") !== Enablement.AddAssetWizard
                .States.DELETED;
        },

        stringify: function() {
            var jsonObj = {
                "cover-img-path": this.get("coverImg"),
                "thumbnail-source": this.get("thumbnailSource"),
                "asset-category": this.get("asset-category"),
                "resource-asset-name": this.get("resource-asset-name"),
                "state": this.get("state"),
                "asset-path": this.get("asset").path
            };

            if (jsonObj["asset-category"] === "enablementAsset:url") {
                jsonObj.url = this.get("asset").url;
            }

            if (jsonObj["asset-category"] === "enablementAsset:externalResource") {
                jsonObj.location = this.get("asset").location;
            }

            var assetSubCategory = this.get("asset-sub-category");
            if (assetSubCategory) {
                jsonObj["asset-sub-category"] = assetSubCategory;
            }

            return jsonObj;
        }
    });

    Enablement.AddAssetWizard.Asset.model = AssetModel;

})(document, $, Backbone, CQ.Communities.Enablement);
