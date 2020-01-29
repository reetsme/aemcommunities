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

(function($, SCF) {
    window.LivefyreAuthoringComponents = window.LivefyreAuthoringComponents || {};

    function createCollectionURN(network, site, article) {
        var template = "urn:livefyre:{network}:site={siteId}:article={articleId}:collection";
        var urn = template
            .replace("{network}", network)
            .replace("{siteId}", site)
            .replace("{articleId}", encodeURIComponent(article));
        return urn;
    }

    function getCollectionURLFromData(network, site, article) {
        var template = "https://{host}/api/v4/resolver/?rel=studio&amp;urn={urn}";
        var host = network.replace(".fyre.co", ".admin.fyre.co");
        var urn = createCollectionURN(network, site, article);
        var url = template
            .replace("{host}", host)
            .replace("{urn}", encodeURIComponent(urn));
        return url;
    }

    function setCollectionLink($link, url) {
        $link.attr("href", url);
        $link.text(CQ.I18n.get("Go to this app in Livefyre Studio"));
    }

    var shared = {
        "updateCollectionLink": function(componentPath, $target) {
            $.get(componentPath + SCF.constants.URL_EXT)
                .done(function(data) {
                    var network = data.networkname;
                    var site = data.siteid;
                    var article = data.articleId;
                    if (!network || !site || !article) {
                        $target.text(CQ.I18n.get("Failed to determine Collection Link"));
                        return;
                    }
                    // Ask Livefyre for the collection location for linking.
                    var lfUrl = getCollectionURLFromData(network, site, article);
                    setCollectionLink($target, lfUrl);
                })
                .fail(function() {
                    $target.text(CQ.I18n.get("Failed to determine Collection Link"));
                });
        },

        "getCollectionMetaData": function(componentPath, proposedUrl) {
            var $deferred = $.Deferred();
            var metadataAPI = "/api/v3.0/collection";
            var componentDataPromise = $.get(componentPath + SCF.constants.URL_EXT);
            try {
                var newURL = new URL(proposedUrl);
            } catch (e) {
                $deferred.reject("Invalid URL format: " + e.toString());
                return $deferred.promise();
            }
            componentDataPromise.done(function(data) {
                newURL.host = data.networkname.replace("fyre.co", "bootstrap.fyre.co");
                newURL.pathname = metadataAPI + newURL.pathname.substring(newURL.pathname.lastIndexOf("/"));
                $.get(newURL.toString()).done(function(lfData) {
                    var returnObj = {};
                    returnObj["./customArticleId"] = lfData.data.articleId;
                    returnObj["./customSiteId"] = lfData.data.siteId;
                    $deferred.resolve(returnObj);
                }).fail(function(e) {
                    $deferred.reject("Could not contact Livefyre endpoint: " + e.toString());
                });
            }).fail(function(e) {
                var err = new Error("Error fetching AEM Component data");
                err.innerError = err;
                $deferred.reject(err);
            });
            return $deferred.promise();
        }
    };

    window.LivefyreAuthoringComponents.shared = shared;
})(Granite.$, SCF);
