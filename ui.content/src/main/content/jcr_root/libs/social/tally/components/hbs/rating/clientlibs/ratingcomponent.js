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

    // analytics code
    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    window.CQ_Analytics = window.CQ_Analytics || {};
    var cqAnalytics = CQ_Analytics;
    // jscs:enable requireCamelCaseOrUpperCaseIdentifiers

    var Rating = SCF.Model.extend({
        modelName: "RatingModel",
        createRating: function(rating) {
            var success = _.bind(function(response) {
                var isNew = _.isUndefined(this.get("currentUserResponse"));
                this.set(response.response);
                var totalResponses = this.get("totalNumberOfResponses");
                var avg = this.get("formattedAverageRating");
                this.set("formattedAverageRating", avg);
                this.trigger("rating:added", {
                    model: this
                });

            }, this);
            var error = _.bind(function(jqxhr, text, error) {
                SCF.log.error("error creating rating %o", error);
                this.trigger("rating:adderror", {
                    "error": error
                });
            }, this);
            var reqData = {
                "response": rating,
                "tallyType": "Rating",
                ":operation": "social:postTallyResponse"
            };
            var properties = this.get("properties");
            if (properties && typeof properties.useReferrer != "undefined" && properties.useReferrer) {
                reqData.referer = window.location.href;
            }
            $.ajax(SCF.config.urlRoot + this.get("id") + SCF.constants.URL_EXT, {
                dataType: "json",
                type: "POST",
                xhrFields: {
                    withCredentials: true
                },
                data: reqData,
                "success": success,
                "error": error
            });
        }
    });
    var RatingView = SCF.View.extend({
        viewName: "Rating",
        tagName: "div",
        className: "ratings",
        RATE_EVENT: "SCFRate",
        tempRatingBarWidth: null,
        messageContainer: null,
        init: function() {
            this.listenTo(this.model, "rating:added", this.update);
            this.listenTo(this.model, "rating:adderror", this.showError);
        },
        update: function() {
            this.analyticsTrack();
            this.model.reload();
        },
        analyticsTrack: function() {
            if (!_.isUndefined(window._satellite)) {
                window._satellite.track("communities-scf-rate");
            } else if (cqAnalytics.Sitecatalyst) {
                cqAnalytics.record({
                    event: this.RATE_EVENT,
                    values: {
                        "functionType": SCF.Context.communityFunction ?
                            SCF.Context.communityFunction : this.COMMUNITY_FUNCTION,
                        "path": SCF.Context.path ? SCF.Context.path : this.model.get("id"),
                        "type": SCF.Context.type ? SCF.Context.type : this.model.get("resourceType"),
                        "ugcTitle": SCF.Context.ugcTitle,
                        "siteTitle": SCF.Context.siteTitle ?
                            SCF.Context.siteTitle : $(".scf-js-site-title").text(),
                        "sitePath": SCF.Context.sitePath ? SCF.Context.sitePath : this.sitePath,
                        "groupTitle": SCF.Context.groupTitle,
                        "groupPath": SCF.Context.groupPath,
                        "user": SCF.Context.user ? SCF.Context.user : SCF.Session.get("authorizableId")
                    },
                    collect: false,
                    componentPath: SCF.constants.ANALYTICS_BASE_RESOURCE_TYPE
                });
            }
        },
        showError: function(error) {
            SCF.log.error(error);
        },
        rate: function(e) {
            e.preventDefault();
            this.tempRatingBarWidth = null;
            var el = e.target;
            var ratingResponseData = $(el).data("rating-value");
            this.model.createRating(ratingResponseData);
            var _parent = $(el).closest("div.scf-ratings");
            if (_parent !== null) {
                if (this.messageContainer !== null) {
                    $(this.messageContainer).remove();
                }

                this.messageContainer = $("<div class='scf-rating-onrate-text'>" + CQ.I18n.getMessage("Thank you!") +
                    "</div>");
                $(_parent).before(this.messageContainer);
            }
            return false;
        },
        highlight: function(e) {
            var el = e.target;
            var doneHighlight = false;
            if (this.tempRatingBarWidth === null) {
                this.tempRatingBarWidth = this.$el.find(".scf-js-ratings-bar").width();
            }
            this.$el.find(".scf-js-ratings-bar").width("0px");
            this.$el.find(".scf-rating-trigger-bar [data-rating-value]").each(function() {
                if (!doneHighlight) {
                    $(this).addClass("scf-is-rating-star-select");
                    $(this).removeClass("scf-is-rating-star-deselect");
                } else {
                    $(this).removeClass("scf-is-rating-star-select");
                    $(this).addClass("scf-is-rating-star-deselect");
                }
                if (this === el) {
                    doneHighlight = true;
                }
            });
        },
        resetHighlights: function() {
            if (this.tempRatingBarWidth !== null) {
                this.$el.find(".scf-js-ratings-bar").width(this.tempRatingBarWidth);
                this.tempRatingBarWidth = null;
            }
            this.$el.find(".scf-rating-trigger-bar [data-rating-value]").each(function() {
                $(this).removeClass("scf-is-rating-star-deselect");
                $(this).removeClass("scf-is-rating-star-select");
            });
        },
        toggleHistogram: function() {
            this.$el.find(".scf-rating-histogram").slideToggle("fast");
        }
    });
    SCF.Rating = Rating;
    SCF.RatingView = RatingView;

    SCF.registerComponent("social/tally/components/hbs/rating", SCF.Rating, SCF.RatingView);

})(SCF);
