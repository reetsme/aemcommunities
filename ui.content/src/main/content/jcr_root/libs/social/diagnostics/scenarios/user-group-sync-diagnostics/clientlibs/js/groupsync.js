/*************************************************************************
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
 *
 *************************************************************************/

(function($CQ, _, Backbone, SCF) {
    "use strict";
    var SyncDiagnosticsModel = SCF.Model.extend({
        modelName: "SyncDiagnosticsModel"
    });

    var SyncDiagnosticsView = SCF.View.extend({
        viewName: "SyncDiagnosticsView",

        init: function() {
            this.listenTo(this.model, "model:loaded", this.render);
        },
        requiresSession: true,

        render: function() {
            var infoSource = $("#infoTemplate").html();
            var topRow$ = $("#diagnostics-rows");
            topRow$.prepend(infoSource);
            return this;
        }
    });

    SCF.registerComponent(
        "social/diagnostics/scenarios/user-group-sync-diagnostics/components/group-sync-diagnostics",
        SyncDiagnosticsModel, SyncDiagnosticsView);

})($CQ, _, Backbone, SCF);
