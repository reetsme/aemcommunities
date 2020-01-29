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

(function(document, $, Enablement) {
    "use strict";

    var EnablementUtils = Enablement.Utils;
    var DAMUtils = {

        INVALID_FILENAME: "invalid-filename",

        TOO_MUCH_SIZE: "too-much-size",

        parseDAMUploadResponse: function(responseText) {
            var output = {};
            try {
                var regEx = {
                    "status": /<div id=['"][sS]tatus['"]>(.*)<\/div>/,
                    "path": /<div id=['"][pP]ath['"]>(.*)<\/div>/,
                    "statusCode": /<title>(.*)<\/title>/,
                    "parentlocation": /<a href=['"].*['"] id="[pP]arentLocation">(.*)<\/a>/
                };

                for (var field in regEx) {
                    if (typeof field === "string") {
                        var result = regEx[field].exec(responseText);
                        if (result && result.length > 0) {
                            var text = $("<div />").html(result[1]).text();
                            output[field] = text;
                        }
                    }
                }
            } catch (ex) {}
            return output;
        },

        getAssetInfo: function(assetPath, callback) {
            var encodedAssetPath = EnablementUtils.encoderPathForUrl(assetPath);

            /* No need for below call. We will actively update thumbnails now when asset is processed.
            var parentFolderUrl = "/assets.html" + encodedAssetPath.substring(0, encodedAssetPath.lastIndexOf("/"));
            Granite.$.ajax({
                type : "GET",
                async : false,
                url : parentFolderUrl
            });
             End of Hack */

            var url = encodedAssetPath + ".infinity.json?ch_ck=" + Date.now();
            url = CQ.shared.HTTP.externalize(url);

            var result = $.ajax({
                type: "GET",
                async: false,
                url: url
            });
            if (result.status === 200) {
                var jsonResult = JSON.parse(result.responseText);
                callback(
                    this.normalizeAssetInfo(jsonResult, {
                        title: assetPath.substring(assetPath.lastIndexOf("/") + 1)
                    })
                );
            }
        },

        normalizeAssetInfo: function(assetJsonInfo, defaults) {
            return $.extend(defaults, {
                title: assetJsonInfo["jcr:content"]["cq:name"] || assetJsonInfo[
                    "jcr:content"].metadata["jcr:title"],
                size: EnablementUtils.getNormalizedFileSize(assetJsonInfo["jcr:content"].metadata[
                    "dam:size"]),
                path: "", // To be filled later since json response doesn't have asset pth.
                // It is actually the path which is requested in JSON call.
                type: assetJsonInfo["jcr:content"].renditions.original["jcr:content"][
                    "jcr:mimeType"
                ]
            });
        },

        replaceFileName: function(path, fileName) {
            return path.substring(0, path.lastIndexOf("/") + 1) + fileName;
        }
    };

    Enablement.DAMUtils = DAMUtils;

})(document, $, CQ.Communities.Enablement);
