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
    var URLResource = SCF.ResourcePlayer.extend({
        modelName: "URLResourceModel"
    });
    var URLResourceView = SCF.ResourcePlayerView.extend({
        viewName: "URLResource",
        className: "url-asset",
        playAsset: function() {
            window.open(this.$el.find(".scf-js-url-asset").data("external-url"));
        },
        showAsset: function() {
            /*
             * In the case of the URL, there's no asset to
             * show since we're opening the 'asset' in another
             * browser so we want to override the 'showAsset'
             * parent method so that it does nothing
             * (leaves the play button intact)
             */
        }
    });

    SCF.URLResource = URLResource;
    SCF.URLResourceView = URLResourceView;
    SCF.registerComponent("social/enablement/components/hbs/view/resource/detail/resourceplayer",
        SCF.URLResource, SCF.URLResourceView);

})(SCF);
