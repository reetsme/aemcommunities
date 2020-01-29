/*
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2012 Adobe Systems Incorporated
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
(function(CQ, $CQ) {
    "use strict";
    CQ.soco = CQ.soco || {};
    CQ.soco.filterHTMLFragment = function(fragment, targetFunction) {
        // Begin ugly.
        // This is here to to get authoring to work.
        // This is needed because the server assumes that the WCM.edit methods
        // it sends are interpreted at a certain point in the page.
        // this approach is fine, IFF the edit configs are part of the
        // page load process.  Seeing as our components vary the page
        // at runtime this is not acceptable.  To fix this we extract
        // the Script blocks that are location dependent adding back
        // placeholder divs.  The invoker can then add things to the
        // page and when they are done we call Edit for the added divs.
        try {
            var configsToCall = [],
                i,
                placeHolder,
                scriptBlockMatcher = /<script type="text\/javascript">\sCQ.WCM.edit(.*)\s<\/script>/g,
                divsToInsert = $CQ(fragment.replace(scriptBlockMatcher, function() {
                    var args = $CQ.makeArray(arguments);
                    var id = CQ.Util.createId('editPosition');
                    placeHolder = $CQ("<div/>").attr("id", id).hide();
                    var configToRun = args[0].match(/{.*}/)[0];
                    /* jshint ignore:start */
                    // you can't fix this ugly
                    var config = eval("(" + args[0].match(/{.*}/)[0] + ")");
                    /* jshint ignore:end */
                    config.editConfig = config.editConfig || {};
                    config.editConfig.element = id;
                    configsToCall.push(config);
                    return placeHolder.prop("outerHTML");
                }));
            targetFunction.call(null, divsToInsert);
            for (i = 0; i < configsToCall.length; i++) {
                configsToCall[i].editConfig.element = $CQ("#" + configsToCall[i].editConfig.element).prev().get(0);
                CQ.WCM.edit(configsToCall[i]);
            }
            // End ugly.
        } catch (e) {
            throw e;
        }
    };

    CQ.soco.isA = function(path, resourceType) {
        var flag = false;
        var search = function(search, path, resourceType) {
            var appsPath = "",
                libsPath = "";
            if (path === resourceType) {
                flag = true;
                return;
            }
            if (path[0] !== "/") {
                appsPath = "/apps/" + path;
                libsPath = "/libs/" + path;
                path = appsPath;
            }
            $CQ.ajax({
                url: path + ".json",
                success: function(data) {
                    var typeToCrawl = data["sling:resourceType"] || data["sling:resourceSuperType"] || "";
                    if (typeToCrawl !== "") {
                        search.call(null, search, typeToCrawl, resourceType);
                    }
                },
                error: function(data) {
                    if (libsPath === "") {
                        return;
                    }
                    search.call(null, search, libsPath, resourceType);
                },
                async: false
            });
        };
        search.call(null, search, path, resourceType);
        return flag;
    };
})(CQ, $CQ);
