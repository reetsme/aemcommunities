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
(function(SCF) {
    "use strict";

    SCF.LOG_LEVEL = 1;

    var LearningPathCardViewDetail = SCF.View.extend({
        viewName: "LearningPathCardViewDetail",

        init: function() {
            this.model.set("localeDateFormat", moment.localeData().longDateFormat("L"), {
                silent: true
            });
        },

        sendPreReqMessage: function() {
            if (!this.model.get("allPrerequisitesCompleted")) {
                var prerequisites = [];
                _.each(this.model.get("prerequisites"), function(prerequisite) {
                    prerequisites.push(prerequisite);
                });
                SCF.Util.announce("showPreReqMessage", {
                    list: prerequisites
                });
            }
        }
    });

    SCF.LearningPathCardViewDetail = LearningPathCardViewDetail;

    SCF.registerComponent("social/enablement/components/hbs/view/learningpath/card",
        SCF.ResourceCardListModel, SCF.LearningPathCardViewDetail);
})(SCF);
