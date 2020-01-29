/*
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2014 Adobe Systems Incorporated
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

    //select user
    var initUserSelector = function(el_selector, path) {
        var $el = $(el_selector);
        //userlist node needs to be next to ugc node
        var base_url = path;
        $el.autocomplete({
            source: function(request, response) {
                var searchString = $(el_selector).val();
                var filterObject = {
                    "operation": "CONTAINS",
                    "./@rep:principalName": searchString
                };
                filterObject = [filterObject];
                var filterGivenName = {
                    "operation": "like",
                    "profile/@givenName": searchString
                };
                filterObject.push(filterGivenName);
                var filterFamilyName = {
                    "operation": "like",
                    "profile/@familyName": searchString
                };
                filterObject.push(filterFamilyName);
                filterObject = JSON.stringify(filterObject);

                var userListURL = base_url + ".social.0.20.json";
                userListURL = CQ.shared.HTTP.addParameter(userListURL, "filter", filterObject);
                userListURL = CQ.shared.HTTP.addParameter(userListURL, "type", "users");
                userListURL = CQ.shared.HTTP.addParameter(userListURL, "fromPublisher", "true");
                userListURL = CQ.shared.HTTP.addParameter(userListURL, "_charset_", "utf-8");
                userListURL = CQ.shared.HTTP.addParameter(userListURL, "groupId", "community-members");
                $.get(userListURL, function(data) {
                    var users = data.items;
                    response(users);
                });
            },
            minLength: 3,
            select: function(event, ui) {
                var $el = $(this).parent(),
                    $selected_items = $el.find(".selected-item-label"),
                    isNewSelection = true; // prevent duplicate selections
                if ($selected_items.length > 0) {
                    var selected_ids = $selected_items.map(function() {
                        return $(this).attr("data-id");
                    }).get();

                    isNewSelection = $.inArray(ui.item.authorizableId, selected_ids) == -1;
                }

                if (isNewSelection) {
                    $el.append('<span data-id="' + ui.item.authorizableId + '" class="selected-item-label"><span class="remove-selection" onclick="$(this).parent().remove()">x</span>' + ui.item.name + '</span>');
                }
            }
        }).data("uiAutocomplete")._renderItem = function(ul, item) {
            if (item.avatarUrl) {
                return $("<li></li>")
                    .append("<a><img src='" + item.avatarUrl + "' width='30' height='30'/>&nbsp;" + item.name + "</a>")
                    .data("item.autocomplete", item)
                    .appendTo(ul);
            } else {
                return $("<li></li>")
                    .append("<a>" + item.name + "</a>")
                    .data("item.autocomplete", item)
                    .appendTo(ul);
            }
        };
    };

    var memberListModel = SCF.Model.extend({
        modelName: "MemberListModel",
        relationships: {
            "items": {
                collection: "MemberList",
                model: "MemberModel"
            }
        },
        constructor: function(attributes, options) {
            SCF.Model.prototype.constructor.apply(this, [attributes, options]);
            this.search = "";
            if (SCF.Session.isReady()) {
                this.trigger("model:loaded");
            } else {
                SCF.Session.on("model:loaded", _.bind(function() {
                    this.trigger("model:loaded");
                }, this));
            }
        },
        events: {
            ADD: "groupmember:added"
        },
        inviteOperation: "social:inviteToCommunityGroup",
        inviteToGroup: function(data, scb, fcb) {
            $CQ('.scf-attachment-error').remove(); //remove previous error messages (if any)

            var success = _.bind(function(response) {
                this.reset(response.response, {
                    silent: true
                });
                this.trigger(this.events.ADD, {
                    model: this
                });
            }, this);
            var error = _.bind(function(jqxhr, text, error) {
                var msgBox = $CQ(".scf-js-group-success");
                msgBox.hide();
                //Handles Server errror in case of bad attachments, etc.
                if (500 == jqxhr.status) { //vs bugfix
                    var _parentEl = $CQ('.scf-composer-block')[0];
                    if (null == _parentEl) {
                        _parentEl = $CQ(document.body);
                    }
                    $CQ('<div class="scf-attachment-error"><h3 class="scf-js-error-message">Server error. Please try again.</h3><div>').appendTo(_parentEl);

                    return false;
                }

                this.trigger(this.events.ADD_ERROR, this.parseServerError(jqxhr, text, error));
            }, this);


            var postData = {
                "id": "nobot",
                ":operation": this.inviteOperation
            };
            _.extend(postData, data);

            $CQ.ajax(SCF.config.urlRoot + this.get("id") + SCF.constants.URL_EXT, {
                dataType: "json",
                type: "POST",
                xhrFields: {
                    withCredentials: true
                },
                data: this.addEncoding(postData),
                "success": success
            });

        }

    });

    var memberListView = SCF.View.extend({
        viewName: "MemberListView",
        init: function() {
            this.listenTo(this.model, this.model.events.ADD, this.update);
        },
        showInviteBox: function(e) {
            e.stopPropagation();

            this.files = undefined;
            var newWizard = this.$el.find(".scf-js-invite-group-box");
            $(newWizard).find("input.form-control").val("");
            this._closeModal = this.launchModal(newWizard, "Invite To Community Group");
        },
        cancelInvite: function(e) {
            e.stopPropagation();
            this._closeModal();
            this._closeModal = undefined;
            this.files = undefined;
        },
        invite: function(e) {
            var invite = $("#invitemember").siblings(".selected-item-label").map(function() {
                return $(this).attr("data-id");
            }).get();
            var data = {
                "users": invite
            };
            this.model.inviteToGroup(data);
            e.preventDefault();
            this._closeModal();
            this._closeModal = undefined;
            return false;
        },
        navigateNext: function(e) {
            var url = this.model.get('pageInfo').nextPageURL;
            url = url.indexOf(SCF.config.urlRoot) == 0 ? url : SCF.config.urlRoot + url;
            if (url.endsWith(".html")) {
                url = url.replace(".html", ".json");
            }
            this.model.url = url + this.getSearchParameter();
            this.model.reload();
        },
        navigatePrevious: function(e) {
            var url = this.model.get('pageInfo').previousPageURL;
            url = url.indexOf(SCF.config.urlRoot) == 0 ? url : SCF.config.urlRoot + url;
            if (url.endsWith(".html")) {
                url = url.replace(".html", ".json");
            }
            this.model.url = url + this.getSearchParameter();
            this.model.reload();
        },
        search: function(e) {
            var url = SCF.config.urlRoot + this.model.get('pageInfo').nextPageURL;
            //reset the next page url to first page url by replace xx.10 with 0.10
            url = url.replace(/social.[0-9]*./, "social.0.");
            if (url.endsWith(".html")) {
                url = url.replace(".html", ".json");
            }
            url += this.getSearchParameter();
            this.model.url = url;
            this.model.reload();
        },
        getSearchParameter: function() {
            //form the search query
            var searchValue = $("#search").val();
            var parameter = "?type=simpleusers";
            //set the search property of model for maintianing search during pagination
            this.model.search = searchValue;
            if (searchValue != "") {
                var searchValueArray = searchValue.split(/\s+/);
                var filter = "";
                var length = searchValueArray.length;
                for (var i in searchValueArray) {
                    filter += '{"operation":"CONTAINS","profile/@givenName":"' + searchValueArray[i] + '"},';
                    filter += '{"operation":"LIKE","profile/@givenName":"' + searchValueArray[i] + '"},';
                    filter += '{"operation":"CONTAINS","profile/@familyName":"' + searchValueArray[i] + '"},';
                    filter += '{"operation":"LIKE","profile/@familyName":"' + searchValueArray[i] + '"}';
                    if (i < length - 1) {
                        filter += ",";
                    }
                }
                parameter += '&filter=[' + filter + ']';
            }
            return parameter;
        },
        afterRender: function() {
            // assign the value of search from model to the text box
            $("#search").val(this.model.search);
            if (this.model.get('pageInfo').selectedPage >= this.model.get('pageInfo').totalPages) {
                $("li#next").addClass('disabled');
            } else if (this.model.get('pageInfo').selectedPage === 1) {
                $("li#previous").addClass('disabled');
            }
            if ($("#invitemember").length > 0) {
                var searchUrl = this.model.id.replace("memberlist", "communitygroups");
                var memberStr = "/members/";
                var i = searchUrl.indexOf(memberStr);
                var part = searchUrl.substring(0, i);
                part = part.substring(0, part.lastIndexOf("/"));
                searchUrl = part + searchUrl.substring(i + memberStr.length - 1) + "/userlist";
                initUserSelector("#invitemember", searchUrl);
            }
        },
        update: function() {
            this.render();
        }
    });

    var member = SCF.Model.extend({
        modelName: "MemberModel",
        uninviteOperation: "social:uninviteCommunityGroupMember",
        promoteOperation: "social:promoteGroupMember",
        demoteOperation: "social:demoteGroupMember",
        events: {
            REMOVE: "groupmember:removed",
            UPDATED: "groupmember:updated"
        },
        uninviteGroupMember: function(data, scb, fcb) {
            var success = _.bind(function(response) {
                this.trigger(this.events.REMOVE, {
                    model: this
                });
                this.trigger('destroy', this);
            }, this);

            var postData = {
                "id": "nobot",
                ":operation": this.uninviteOperation
            };
            _.extend(postData, data);

            $CQ.ajax(SCF.config.urlRoot + this.collection.parent.get("id") + SCF.constants.URL_EXT, {
                dataType: "json",
                type: "POST",
                xhrFields: {
                    withCredentials: true
                },
                data: this.addEncoding(postData),
                "success": success
            });
        },
        promoteGroupMember: function(data, scb, fcb) {
            var success = _.bind(function(response) {
                this.set("admin", true);
                this.trigger(this.events.UPDATED, {
                    model: this
                });
            }, this);

            var postData = {
                "id": "nobot",
                ":operation": this.promoteOperation
            };
            _.extend(postData, data);

            $CQ.ajax(SCF.config.urlRoot + this.collection.parent.get("id") + SCF.constants.URL_EXT, {
                dataType: "json",
                type: "POST",
                xhrFields: {
                    withCredentials: true
                },
                data: this.addEncoding(postData),
                "success": success
            });
        },
        demoteGroupMember: function(data, scb, fcb) {
            var success = _.bind(function(response) {
                this.set("admin", false);
                this.trigger(this.events.UPDATED, {
                    model: this
                });
            }, this);

            var postData = {
                "id": "nobot",
                ":operation": this.demoteOperation
            };
            _.extend(postData, data);

            $CQ.ajax(SCF.config.urlRoot + this.collection.parent.get("id") + SCF.constants.URL_EXT, {
                dataType: "json",
                type: "POST",
                xhrFields: {
                    withCredentials: true
                },
                data: this.addEncoding(postData),
                "success": success
            });
        }
    });

    var memberView = SCF.View.extend({
        viewName: "MemberView",
        init: function() {
            this.listenTo(this.model, this.model.events.UPDATED, this.update);
            this.listenTo(this.model, this.model.events.REMOVE, this.removeView);

        },
        getUserUrl: function(e) {
            var node = $(e.target).closest('tr').find(".scf-group-member-avatar");
            if (node != null) {
                var userUrl = node.parent().attr("href");
                if (userUrl.indexOf("profile.html") > 0) {
                    userUrl = userUrl.substring(userUrl.indexOf("profile.html") + "profile.html".length );
                }
                if (userUrl.indexOf("/profile") > 0) {
                    userUrl = userUrl.substring(0, userUrl.indexOf("/profile"));
                }
                return userUrl;
            }
            return null;
        },
        uninvite: function(e) {
            var userUrl = this.getUserUrl(e);
            if (userUrl != null) {
                var data = {
                    "users": userUrl
                };
                this.model.uninviteGroupMember(data);
            }
            e.preventDefault();
            return false;
        },
        promote: function(e) {
            var userUrl = this.getUserUrl(e);
            if (userUrl != null) {
                var data = {
                    "users": userUrl
                };
                this.model.promoteGroupMember(data);
            }
            e.preventDefault();
            return false;
        },
        demote: function(e) {
            var userUrl = this.getUserUrl(e);
            if (userUrl != null) {
                var data = {
                    "users": userUrl
                };
                this.model.demoteGroupMember(data);
            }
            e.preventDefault();
            return false;
        },
        removeView: function() {
            return Backbone.View.prototype.remove.apply(this, arguments);
        },
        update: function() {
            this.render();
        }
    });

    var MemberList = SCF.Collection.extend({
        collectioName: "MemberList",
        parse: function(response, options) {
            SCF.log.debug("collection parse");
            return response.items;
        }
    });


    SCF.member = member;
    SCF.memberView = memberView;
    SCF.MemberList = MemberList;
    SCF.memberListModel = memberListModel;
    SCF.memberListView = memberListView;
    SCF.registerComponent("social/group/components/hbs/communitygroupmember", SCF.member, SCF.memberView);
    SCF.registerComponent("social/group/components/hbs/communitygroupmemberlist", SCF.memberListModel, SCF.memberListView);
    if (typeof String.prototype.endsWith !== 'function') {
        String.prototype.endsWith = function(suffix) {
            return this.indexOf(suffix, this.length - suffix.length) !== -1;
        };
    }
})($CQ, _, Backbone, SCF);
