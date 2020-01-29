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
(function($CQ, _, Backbone, SCF) {
    "use strict";
    var windowHost = window.location.protocol + "//" + window.location.host;
    var ShareView = SCF.View.extend({
        afterRender: function() {
            var sub = this.model.get("subject");
            var messageBody = this.model.get("message");
            var removeHTMLTag = document.createElement("div");
            removeHTMLTag.innerHTML = messageBody;
            var bodyText = removeHTMLTag.innerText || "";
            var windowUrl = windowHost + this.model.get("friendlyUrl");
            var emailUrl = "mailto:?Subject=" + sub + "&Body=" + bodyText + " " + windowUrl + "";
            this.$el.find(".scf-js-email-share").attr("href", emailUrl);
        },
        share: function(evt) {
            var shareURL = $(evt.target).data("href");
            var locationUrl = shareURL + windowHost + this.model.get("friendlyUrl");
            window.open(locationUrl, '_BLANK');
        }
    });
    SCF.ShareView = ShareView;
    SCF.registerComponent('social/commons/components/hbs/socialshare', SCF.Model, SCF.ShareView);
})($CQ, _, Backbone, SCF);
