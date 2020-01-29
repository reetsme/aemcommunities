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

    var UserPreference = SCF.Model.extend({
        modelName: "UserPreferenceModel",
        UPDATE_OPERATION: "social:updateUserPreference",
        postData: {},
        events: {
            UPDATED: "userpreference:updated",
            UPDATE_ERROR: "userpreference:updateError"
        },
        updateData: function(dataId, val) {
            this.postData[dataId] = val;
        },

        saveEdits: function() {
            var error = _.bind(function(jqxhr, text, error) {
                this.trigger(this.events.UPDATE_ERROR, {
                    "error": error
                });
            }, this);
            var success = _.bind(function(response) {
                this.set(response.response);
                this.trigger(this.events.UPDATED, {
                    model: this
                });
            }, this);
            this.postData[":operation"] = this.UPDATE_OPERATION;
            $CQ.ajax(SCF.config.urlRoot + this.get("id") + SCF.constants.URL_EXT, {
                dataType: "json",
                type: "POST",
                xhrFields: {
                    withCredentials: true
                },
                data: this.addEncoding(this.postData),
                "success": success,
                "error": error
            });

        }
    });

    var UserPreferenceView = SCF.View.extend({
        viewName: "UserPreference",
        tagName: "div",
        handlePreferenceSelection: function(evt) {
            this.closePopup(evt);
            var targetEl = $CQ(evt.target);
            var dataId = targetEl.data("id");
            var val = targetEl.val();
            this.model.updateData(dataId, val);
            if (($CQ('#scf-toggleswitch').is(':checked')) && (targetEl.attr("name").indexOf("web") == 0)) {
                var newDataId = dataId.replace("web", "email");
                var sameaswebstr = "scf-" + newDataId + "-" + val;
                document.getElementById("" + sameaswebstr).checked = true;
                this.model.updateData(newDataId, val);
            }
        },
        requiresSession: true,
        afterRender: function() {
            $CQ('#scf-toggleswitch').bootstrapToggle()
            var emailSettings = null;
            var webSettings = null;
            if (this.model.get("notificationCategorySettings") != null) {
                emailSettings = this.model.get("notificationCategorySettings")["email"];
                webSettings = this.model.get("notificationCategorySettings")["web"];
            }
            if (emailSettings != null && webSettings != null) {
                if ((emailSettings.privatemessaging.enable == webSettings.privatemessaging.enable) &&
                    (emailSettings.usercontents.votes == webSettings.usercontents.votes) &&
                    (emailSettings.usercontents.comments == webSettings.usercontents.comments) &&
                    (emailSettings.followcontents.enable == webSettings.followcontents.enable) &&
                    (emailSettings.followusers.enable == webSettings.followusers.enable)) {
                    $('#scf-toggleswitch').bootstrapToggle('on');
                    $CQ('#scf-email :input').attr('disabled', true);
                } else {
                    $('#scf-toggleswitch').bootstrapToggle('off');
                    $CQ('#scf-email :input').attr('disabled', false);
                }
            }
        },
        sameAsWeb: function(evt) {
            if ($CQ('#scf-toggleswitch').is(':checked')) {
                var PRIVATE_MESSAGING = "privatemessaging";
                var ENABLE = "enable";
                var USERCONTENTS = "usercontents";
                var VOTES = "votes";
                var COMMENTS = "comments";
                var FOLLOWUSERS = "followusers";
                var FOLLOWCONTENTS = "followcontents";
                var NOTIFICATION_CATEGORY_SETTING = "notificationCategorySettings";
                var WEB = "web";
                var EMAIL = "email";
                //copy web settings to email settings
                var map = {};
                map[PRIVATE_MESSAGING] = ENABLE;
                map[USERCONTENTS] = [VOTES, COMMENTS];
                map[FOLLOWCONTENTS] = ENABLE;
                map[FOLLOWUSERS] = ENABLE;
                var webSettings = this.model.get(NOTIFICATION_CATEGORY_SETTING)[WEB];
                for (var key in map) {
                    var val = map[key];
                    var webSettingVal, str, emailDataId;
                    if (_.isArray(val)) {
                        var arrLength = val.length;
                        for (var i = 0; i < arrLength; i++) {
                            val = map[key][i];
                            webSettingVal = webSettings[key][val];
                            str = "scf-notificationCategorySettings.email." + [key] + "." + [val] + "-" + webSettingVal;
                            if (!document.getElementById(str).checked) {
                                document.getElementById(str).checked = true;
                                emailDataId = NOTIFICATION_CATEGORY_SETTING + "." + EMAIL + "." + key + "." + val;
                                this.model.updateData(emailDataId, webSettingVal);
                            }
                        }
                    } else {
                        webSettingVal = webSettings[key][val];
                        str = "scf-notificationCategorySettings.email." + [key] + "." + [val] + "-" + webSettingVal;
                        if (!document.getElementById(str).checked) {
                            document.getElementById(str).checked = true;
                            emailDataId = NOTIFICATION_CATEGORY_SETTING + "." + EMAIL + "." + key + "." + val;
                            this.model.updateData(emailDataId, webSettingVal);
                        }
                    }
                }
                $CQ('#scf-email :input').attr('disabled', true);
                this.model.saveEdits();
            } else {
                $CQ('#scf-email :input').attr('disabled', false);
            }
        },
        updatePrefs: function(e) {
            $('.scf-alert').show();
            e.stopPropagation();
            this.model.saveEdits();
            return false;
        },
        closePopup: function(e) {
            $('.scf-alert').hide();
        }
    });
    SCF.UserPreference = UserPreference;
    SCF.UserPreferenceView = UserPreferenceView;
    SCF.registerComponent("social/subscriptions/components/hbs/subscriptionpreferences", SCF.UserPreference, SCF.UserPreferenceView);
})($CQ, _, Backbone, SCF);
