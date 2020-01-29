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
(function($, author, channel, window, undefined) {

    var actionDef = {
        text: Granite.I18n.get("Livefyre Studio"),
        condition: function(editable) {
            var isLivefyre;
            try {
                // #TODO: Use more intentional heuristic or maybe
                // path whitelist
                isLivefyre = editable.type.indexOf("livefyre") != -1;
            } catch (e) {
                if (console && console.error) {
                    console.error("Error checking if component isLivefyre", e);
                }
                return false;
            }
            return isLivefyre;
        },
        handler: function(editable, param, target) { // will be called on click
            var el = editable.dom.get(0);
            var doc = el.ownerDocument;
            var win = doc.defaultView || doc.parentWindow;
            var SCF = win.SCF;
            var componentDataUrl = this.path + SCF.constants.URL_EXT;

            var studioWindow = window.open();

            $.get(componentDataUrl).promise()
                .then(function(componentData) {
                    var collection = collectionFromComponentData(componentData);
                    var url = createStudioUrlForCollection(collection);
                    studioWindow.location.replace(url);
                })
                .then(null, function(err) {
                    console.error(err);
                });
        },
        isNonMulti: true
    };

    // we listen to the messaging channel
    // to figure out when a layer got activated
    channel.on("cq-layer-activated", function(ev) {
        // we continue if the user switched to the Edit layer
        if (ev.layer === "Edit") {
            // we use the editable toolbar and register an additional action
            author.EditorFrame.editableToolbar.registerAction("LIVEFYRE_STUDIO", actionDef);
        }
    });

    function collectionFromComponentData(componentData) {
        var collection = {
            network: componentData.networkname,
            siteId: componentData.siteid,
            articleId: componentData.articleId
        };
        return collection;
    }

    function createStudioUrlForCollection(collection) {
        var template = "https://{host}/api/v4/resolver/?rel=studio&amp;urn={urn}";
        var host = collection.network.replace(".fyre.co", ".admin.fyre.co");
        var urn = createCollectionURN(collection);
        var url = template
            .replace("{host}", host)
            .replace("{urn}", encodeURIComponent(urn));
        return url;
    }

    function createCollectionURN(collection) {
        var template = "urn:livefyre:{network}:site={siteId}:article={articleId}:collection";
        var urn = template
            .replace("{network}", collection.network)
            .replace("{siteId}", collection.siteId)
            .replace("{articleId}", encodeURIComponent(collection.articleId));
        return urn;
    }

}(jQuery, Granite.author, jQuery(document), this));
