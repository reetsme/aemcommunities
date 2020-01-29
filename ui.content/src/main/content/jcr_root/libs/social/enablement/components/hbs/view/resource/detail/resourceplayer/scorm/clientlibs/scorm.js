/*
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2013 Adobe Systems Incorporated
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

    var ScormResource = SCF.ResourcePlayer.extend({
        modelName: "ScormResourceModel"
    });
    var ScormResourceView = SCF.ResourcePlayerView.extend({
        viewName: "ScormResource",
        className: "scorm-asset",
        playAsset: function() {
            var iFrame = this.$el.find("#scf-asset-element")[0];
            var scormEndPoint = this.model.get("primaryAsset").properties.scormendpoint;
            var userInSession = SCF.Session.id;
            userInSession = userInSession.substring(userInSession.lastIndexOf("/") + 1,
                userInSession.length);
            scormEndPoint = scormEndPoint.replace("$(userId)", userInSession);
            iFrame.src = scormEndPoint;
        },
        playAssetInWindow: function() {
            var scormEndPoint = this.model.get("primaryAsset").properties.scormendpoint;
            var userInSession = SCF.Session.id;
            userInSession = userInSession.substring(userInSession.lastIndexOf("/") + 1,
                userInSession.length);
            scormEndPoint = scormEndPoint.replace("$(userId)", userInSession);
            window.open(scormEndPoint, "_blank");
        }
    });

    SCF.ScormResource = ScormResource;
    SCF.ScormResourceView = ScormResourceView;
    SCF.registerComponent("social/enablement/components/hbs/view/resource/detail/resourceplayer", SCF.ScormResource,
        SCF.ScormResourceView);

})(SCF);
