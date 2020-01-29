/*
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
 */
(function(SCF) {
    "use strict";

    var SiteSelectorModel = SCF.Model.extend({
        modelName: "SiteSelectorModel"
    });

    var SiteSelectorView = SCF.View.extend({
        viewName: "SiteSelectorView",
        init: function() {
            this.listenTo(this.model, "change:currentSite", this.handleModeChange);

            var currentSite = this.model.attributes.site;

            this.model.set("currentSite", currentSite);
        },

        handleModeChange: function(model, site) {
            if (site !== null) {
                this.$(".site-selector-select-btn").attr("disabled", "disabled");
                this.$(".site-selector-set-btn").attr("disabled", "disabled");
            }
            this.$el.trigger("site-selector-mode.changed", site);
            this.$(".dataSite").data("site", site);
        }
    });

    SCF.SiteSelectorModel = SiteSelectorModel;
    SCF.SiteSelectorView = SiteSelectorView;
    SCF.registerComponent("social/enablement/components/hbs/admin/selectedsite", SCF.SiteSelectorModel,
        SCF.SiteSelectorView);

})(SCF);
