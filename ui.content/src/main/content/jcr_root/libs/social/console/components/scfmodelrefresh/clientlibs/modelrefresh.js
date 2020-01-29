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

(function(window, $) {
    "use strict";

    $(window).adaptTo("foundation-registry").register("foundation.form.response.ui.success", {
        name: "scf.granite.ui.form.reloadmodel",
        handler: function(form, config, data) { // form, config, data, textStatus, xhr) {
            var found = false;
            _.each(SCF.loadedComponents, function(o) {
                _.each(o, function(o) {
                    // Some reason this whole thing is mounted on an overlay.
                    var mntOption = "/mnt/overlay" + config.scfcomponentid.substring(5);
                    if ((mntOption === o.model.get("id")) || (config.scfcomponentid === o.model.get("id"))) {
                        o.model.set(o.model.parse(data));
                        o.model.set("id", config.scfcomponentid);
                        o.model.trigger("model:loaded");
                        found = true;
                    }
                });
            });
            if (!found) {
                console.warn("Could not find component with ID %s to refresh", config.scfcomponentid);
            }
        }
    });
})(window, Granite.$, SCF);
