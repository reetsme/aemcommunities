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
    var SWFResource = SCF.ResourcePlayer.extend({
        modelName: "SWFResourceModel"
    });
    var SWFResourceView = SCF.ResourcePlayerView.extend({
        viewName: "SWFResource",
        className: "swf-asset"
    });

    SCF.SWFResource = SWFResource;
    SCF.SWFResourceView = SWFResourceView;
    SCF.registerComponent("social/enablement/components/hbs/view/resource/detail/resourceplayer",
        SCF.SWFResource, SCF.SWFResourceView);

})(SCF);
