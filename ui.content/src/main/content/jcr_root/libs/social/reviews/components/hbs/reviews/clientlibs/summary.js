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
(function($CQ, _, Backbone, SCF) {
    "use strict";
    var ReviewSummaryView = SCF.View.extend({
        viewName: "ReviewSummary",
        tagName: "div",
        className: "social ratings",
        init: function() {
            this.listenTo(this.model, this.model.events.ADD, this.update);
            this.listenTo(this.model, this.model.events.ADD_ERROR, this.showError);
            this.listenTo(this.model, this.model.events.UPDATED, this.update);
            this.listenTo(this.model, this.model.events.DELETE, this.update);
            this.listenTo(SCF.Router, 'route:pageReviews', this.paginate);
        },
        update: function() {
            this.render();
        }
    });

    SCF.ReviewSummaryView = ReviewSummaryView;

    SCF.registerComponent('social/reviews/components/hbs/summary', SCF.ReviewSystem, SCF.ReviewSummaryView);

})($CQ, _, Backbone, SCF);
