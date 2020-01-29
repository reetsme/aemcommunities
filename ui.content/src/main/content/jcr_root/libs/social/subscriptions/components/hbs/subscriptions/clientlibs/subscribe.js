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
    window.CQ_Analytics = window.CQ_Analytics || {};
    var cqAnalytics = window.CQ_Analytics;

    var Subscription = SCF.Model.extend({
        modelName: "SubscriptionModel",

        events: {
            UPDATED: "subscribe:update",
            UPDATE_ERROR: "subscribe:updateError"
        },

        doToggle: function(selection) {
            var success = _.bind(function(response) {
                var _response = response.response;
                if (typeof(_response) != "object") {
                    _response = JSON.parse(_response);
                }
                this.set("states", _response.states);
                this.set("subscribed", _response.subscribed);
                this.trigger(this.events.UPDATED, {
                    model: this
                });

                /*
                 * Following Activities is what used to be follow.
                 * This logic is to pick the "follow activities" event
                 * from multitude of potential success responses
                 */
                var states = this.get("states");
                var isSubscribed = this.get("subscribed");
                if (selection === "following" && isSubscribed && states.following.selected) {
                    if (!_.isUndefined(window._satellite)) {
                        window._satellite.track("communities-scf-follow");
                    } else if (cqAnalytics.Sitecatalyst) {
                        cqAnalytics.record({
                            event: "SCFFollow",
                            values: {
                                "functionType": SCF.Context.communityFunction,
                                "path": SCF.Context.path,
                                "type": SCF.Context.type,
                                "ugcTitle": SCF.Context.ugcTitle,
                                "siteTitle": SCF.Context.siteTitle,
                                "sitePath": SCF.Context.sitePath,
                                "groupTitle": SCF.Context.groupTitle,
                                "groupPath": SCF.Context.groupPath,
                                "user": SCF.Context.user
                            },
                            collect: false,
                            componentPath: SCF.constants.ANALYTICS_BASE_RESOURCE_TYPE
                        });
                    }
                }
            }, this);

            var error = _.bind(function(jqxhr, text, error) {
                SCF.log.error("error toggle follow state %o", error);
            }, this);

            var url = this.get("url");
            var _types = [];
            var _states = [];

            $CQ.each(this.get("states"), function(key, value) {
                var currentState = value.selected;
                if (selection == "unfollow-all") {
                    currentState = false;
                } else {
                    if (key == selection) {
                        currentState = !currentState;
                    }
                }
                _types.push(key);
                _states.push(currentState.toString());

            });

            $CQ.ajax(url, {
                dataType: "json",
                type: "POST",
                xhrFields: {
                    withCredentials: true
                },
                data: {
                    ":operation": "social:updatesubscriptions",
                    "types": _types,
                    "states": _states,
                    "subscribedId": this.get("subscribedId")
                },
                "success": success,
                "error": error
            });
        }
    });
    var SubscriptionView = SCF.View.extend({
        viewName: "SubscriptionView",
        init: function() {
            this.listenTo(this.model, this.model.events.UPDATED, this.update);
            this.listenTo(this.model, this.model.events.UPDATE_ERROR, this.showError);
        },
        handleClick: function(el) {
            var _target = el.currentTarget;
            var _key = _target.getAttribute('data_type');
            this.model.doToggle(_key);
        },
        update: function() {
            this.render();
        }

    });
    SCF.Subscription = Subscription;
    SCF.SubscriptionView = SubscriptionView;

    SCF.registerComponent("social/subscriptions/components/hbs/subscriptions", SCF.Subscription, SCF.SubscriptionView);

})(SCF);
