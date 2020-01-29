/*
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2012 Adobe Systems Incorporated
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

    // analytics code
    window.CQ_Analytics = window.CQ_Analytics || {};
    var cqAnalytics = CQ_Analytics;

    var Forum = SCF.CommentSystem.extend({
        modelName: "ForumModel",
        relationships: {
            "items": {
                collection: "TopicList",
                model: "TopicModel"
            }
        },
        fixCachedProperties: function() {
            var userIsModerator = SCF.Session.checkIfModeratorFor(this.get("id"));
            this.loadClipboard(userIsModerator);
        },
        loadClipboard: function(userIsModerator) {
            var clipboard = localStorage.getItem(Topic.prototype.FORUM_CLIPBOARD);
            if (clipboard == null || _.isUndefined(clipboard)) {
                this.attributes.canPaste = false;
                return;
            }
            clipboard = JSON.parse(clipboard);
            this.attributes.canPaste = userIsModerator && clipboard.count > 0;
            this.attributes.pasteCount = clipboard.count;
        },
        clearClipboard: function() {
            localStorage.removeItem(Topic.prototype.FORUM_CLIPBOARD);
            this.attributes.canPaste = false;
            this.attributes.pasteCount = 0;
            this.trigger(this.events.UPDATED, {
                model: this
            });
        },
        createOperation: "social:createForumPost",
        events: {
            ADD: "topic:added",
            ADD_ERROR: "topic:adderror",
            UPDATED: "topic:updated"
        }
    });
    var ForumView = SCF.CommentSystemView.extend({
        viewName: "Forum",
        tagName: "div",
        className: "forum",
        FOLLOW_EVENT: "SCFFollow",
        VIEW_EVENT: "SCFView",
        COMMUNITY_FUNCTION: "Forum",
        init: function() {
            SCF.CommentSystemView.prototype.init.apply(this);
            this.listenTo(this.model, this.model.events.UPDATED, this.update);
            SCF.Router.route(/^(.*?)\.index\.(.*)\.(-?[0-9]*)\.([0-9])*\.htm.*?$/, "pageTopics");
        },
        render: function() {
            SCF.CommentSystemView.prototype.render.apply(this);

            if (cqAnalytics.Sitecatalyst) {
                if (_.contains(cqAnalytics.Sitecatalyst.frameworkComponents,
                        SCF.constants.ANALYTICS_BASE_RESOURCE_TYPE)) {
                    this.$el.find(".scf-js-analytics-view-metrics").show();
                }
            }
        },
        getOtherProperties: function() {
            var subject = this.getField("subject");
            return {
                "subject": subject
            };
        },
        PAGE_EVENT: "pageTopics",
        PAGE_URL_PREFIX: "topics",
        toggleComposer: function(e) {
            var composer = this.$el.find(".scf-js-composer-block");
            composer.toggleClass("scf-is-collapsed");
            this.$el.find(".scf-js-newtopic").toggleClass("scf-is-collapsed");
            if (composer.is(":visible")) {
                this.focus("subject");
                // In IE10 the RTE doesn't get cleared out when the composer opens it retains the
                // placeholder text.
                this.setField("message", "");
            } else {
                this.files = void 0;
                this.$el.find(".scf-attachment-list").first().empty();
            }
            // call proto:
            SCF.CommentSystemView.prototype.toggleComposer.apply(this, [e]);
        },
        paste: function() {
            SCF.log.debug("pasting");
            var clipBoard = localStorage.getItem("scf:forum:clipboard");
            if (_.isUndefined(clipBoard) || clipBoard == null || clipBoard.count <= 0) {
                // emit an error message
                SCF.log.error("There are no clipboard items to paste");
            } else {
                var parentPath = this.model.get("id");
                clipBoard = JSON.parse(clipBoard);
                _.each(clipBoard.itemsToMove, function(item) {
                    this.model.move({
                        "resourcePath": item.id,
                        "parentPath": parentPath
                    });
                }, this);
                this.model.clearClipboard();
            }
        },
        clearClipboard: function() {
            SCF.log.debug("clear board");
            this.model.clearClipboard();
        },
        initAnalytics: function() {
            SCF.Context.communityFunction = this.COMMUNITY_FUNCTION;
            SCF.Context.path = this.model.id;
            SCF.Context.type = this.model.get("resourceType");
            // checking if title (subject) exists - usually it does not at forum level
            SCF.Context.ugcTitle = this.model.get("subject") ? this.model.get("subject") : "";
            if (!_.isUndefined(window._satellite)) {
                window._satellite.track("communities-scf-view");
            } else if (cqAnalytics.Sitecatalyst) {
                /*
                 * Suppress the next Analytics tracking call so that the default page call and this call
                 * don't result in a double call.
                 */
                window.s.abort = true;

                cqAnalytics.record({
                    event: this.VIEW_EVENT,
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
        }
    });

    var Post = SCF.Comment.extend({
        modelName: "PostModel",
        DELETE_OPERATION: "social:deleteForumPost",
        UPDATE_OPERATION: "social:updateForumPost",
        CREATE_OPERATION: "social:createForumPost",
        events: {
            ADDED: "post:added",
            UPDATED: "post:updated",
            DELETED: "post:deleted",
            ADD_ERROR: "post:addError",
            UPDATE_ERROR: "post:updateError",
            DELETE_ERROR: "post:deleteError",
            TRANSLATED: "post:translated",
            TRANSLATE_ERROR: "post:translateError"
        },
        relationships: {
            "items": {
                collection: "PostList",
                model: "PostModel"
            },
            "votes": {
                model: "VotingModel"
            }
        },
        fixCachedProperties: function() {
            if (!SCF.Session.attributes.loggedIn) {
                this.attributes.canReply = false;
            }
        }
    });
    var PostView = SCF.CommentView.extend({
        viewName: "Post",
        tagName: "li",
        className: "post",
        requiresSession: true
    });

    var Topic = SCF.Comment.extend({
        modelName: "TopicModel",
        DELETE_OPERATION: "social:deleteForumPost",
        UPDATE_OPERATION: "social:updateForumPost",
        CREATE_OPERATION: "social:createForumPost",
        FORUM_CLIPBOARD: "scf:forum:clipboard",
        events: {
            ADDED: "post:added",
            UPDATED: "topic:updated",
            DELETED: "topic:deleted",
            ADD_ERROR: "post:addError",
            UPDATE_ERROR: "topic:updateError",
            DELETE_ERROR: "topic:deleteError",
            TRANSLATED: "topic:translated",
            TRANSLATE_ERROR: "topic:translateError"
        },
        relationships: {
            "items": {
                collection: "TopicList",
                model: "TopicModel"
            },
            "votes": {
                model: "VotingModel"
            }
        },
        addToClipBoard: function() {
            if (typeof Storage == "undefined") {
                SCF.log.error("Unable to move topic, please use a supported browser");
            }
            var clipBoard = localStorage.getItem(this.FORUM_CLIPBOARD);
            if (_.isUndefined(clipBoard) || clipBoard == null) {
                clipBoard = {
                    count: 0,
                    itemsToMove: {}
                };
            } else {
                clipBoard = JSON.parse(clipBoard);
            }
            var item = {
                id: this.id,
                title: this.get("title"),
                url: this.get("friendlyURL")
            };
            clipBoard.itemsToMove[this.id] = item;
            clipBoard.count++;
            this.attributes.hasBeenCut = true;
            localStorage.setItem(this.FORUM_CLIPBOARD, JSON.stringify(clipBoard));
            this.trigger(this.events.UPDATED, {
                model: this
            });
        },
        removeFromClipboard: function() {
            if (typeof Storage == "undefined") {
                SCF.log.error("Unable to move topic, please use a supported browser");
            }
            var clipBoard = localStorage.getItem(this.FORUM_CLIPBOARD);
            clipBoard = JSON.parse(clipBoard);
            clipBoard.count--;
            clipBoard.itemsToMove[this.id] = undefined;
            this.attributes.hasBeenCut = false;
            localStorage.setItem(this.FORUM_CLIPBOARD, JSON.stringify(clipBoard));
            this.trigger(this.events.UPDATED, {
                model: this
            });
        },
        getCustomProperties: function() {
            if (this.get("subject") !== undefined) {
                return {
                    subject: this.get("subject")
                };
            } else {
                return {};
            }
        },
        fixCachedProperties: function(userIsModerator) {
            this.attributes.canReply = SCF.Session.attributes.loggedIn && SCF.Session.attributes.mayReply &&
                !this.attributes.isClosed;
            this.attributes.moderatorActions.canMove = userIsModerator && !this.attributes.isClosed &&
                this.attributes.topLevel && this.attributes.configuration.moveAllowed;
            var hasBeenCut = this.hasBeenCut();
            this.attributes.hasBeenCut = hasBeenCut;
        },
        hasBeenCut: function() {
            var clipboard = localStorage.getItem(this.FORUM_CLIPBOARD);
            if (clipboard == null || _.isUndefined(clipboard)) {
                return false;
            }
            clipboard = JSON.parse(clipboard);
            var item = clipboard.itemsToMove[this.id];
            if (_.isUndefined(item)) {
                return false;
            } else {
                return true;
            }
        },
        translateAll: function(e) {
            SCF.CommentSystem.prototype.translateAll.call(this, e);
        }
    });

    var TopicView = SCF.CommentView.extend({
        viewName: "Topic",
        tagName: "li",
        className: "topic",
        requiresSession: true,
        FOLLOW_EVENT: "SCFFollow",
        VIEW_EVENT: "SCFView",
        COMMUNITY_FUNCTION: "Forum",

        init: function() {

            SCF.CommentView.prototype.init.apply(this);
            SCF.Router.route(/^(.*?)topic\.([0-9]*)\.(-?[0-9]*)\.htm.*?$/, "pagePosts");
            SCF.Router.route(/^(.*?)topic\.index\.(.*)\.(-?[0-9]*)\.([0-9])*\.htm.*?$/, "pagePosts");
            this.listenTo(SCF.Router, "route:pagePosts", this.paginate);

        },

        initAnalytics: function() {
            SCF.Context.communityFunction = this.COMMUNITY_FUNCTION;
            SCF.Context.path = this.model.id;
            SCF.Context.type = this.model.get("resourceType");
            // checking if title (subject) exists - unlike forum it often does at topic level
            SCF.Context.ugcTitle = this.model.get("subject") ? this.model.get("subject") : "";
            if (!_.isUndefined(window._satellite)) {
                window._satellite.track("communities-scf-view");
            } else if (cqAnalytics.Sitecatalyst) {
                /*
                 * Suppress the next Analytics tracking call so that the default page call and this call
                 * don't result in a double call.
                 */
                window.s.abort = true;

                cqAnalytics.record({
                    event: this.VIEW_EVENT,
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

        afterRender: function() {
            SCF.CommentView.prototype.afterRender.apply(this);
            this.updateCrumbs();
        },
        updateCrumbs: function() {
            if (this.$el.attr("data-scf-template")) {
                return;
            }
            var crumbs = [];
            crumbs.push({
                "title": CQ.I18n.get("Forum"),
                "url": this.model.get("pageInfo").basePageURL + ".html"
            });
            crumbs.push({
                "title": this.model.get("subject"),
                "url": "",
                "active": true
            });
            SCF.Util.announce("crumbs", {
                "crumbs": crumbs
            });
        },
        paginate: function() {
            var baseURL = SCF.config.urlRoot + this.model.get("id") + SCF.constants.SOCIAL_SELECTOR + ".";
            var parsedOffset = arguments[1];
            var parsedSize = arguments[2];
            var parsedIndexName = (arguments.length <= 3) ? null : arguments[3];
            var url;
            if (arguments.length <= 3) {
                // There must not be an index requested.
                url = baseURL + parsedOffset + "." + parsedSize + SCF.constants.JSON_EXT;
            } else {
                // Must be an index:
                url = baseURL + "index." + parsedOffset + "." + parsedSize + "." + parsedIndexName +
                    SCF.constants.JSON_EXT;
            }
            this.model.url = url;
            this.model.reload();
        },
        navigate: function(e) {
            var windowHost = window.location.protocol + "//" + window.location.host;
            var suffix = $CQ(e.currentTarget).data("page-suffix");
            var pageInfo = this.model.get("pageInfo");
            if (windowHost.indexOf(SCF.config.urlRoot) !== -1) {
                var truncatedId = this.model.get("id");
                truncatedId = truncatedId.substring(truncatedId.lastIndexOf("/"));
                var pageToGoTo = pageInfo.basePageURL + ".topic." + suffix + ".html" + truncatedId;
                SCF.Router.navigate(pageToGoTo, {
                    trigger: true
                });
            } else {
                suffix = $(e.currentTarget).data("pageSuffix");
                var suffixInfo = suffix.split(".");
                if (pageInfo.sortIndex !== null) {
                    this.paginate(pageInfo.basePageURL, suffixInfo[0], suffixInfo[1], pageInfo.sortIndex);
                } else {
                    this.paginate(pageInfo.basePageURL, suffixInfo[0], suffixInfo[1]);
                }
            }
        },
        edittranslation: function(e) {
            SCF.CommentView.prototype.edittranslation.call(this, e);
            this.$el.find(".scf-js-topic-details").hide();
            var subject = this.model.get("translationTitle");
            this.setField("editSubject", subject);
            this.focus("editSubject");
        },
        edit: function(e) {
            SCF.CommentView.prototype.edit.call(this, e);
            this.$el.find(".scf-js-topic-details").hide();
            var subject = this.model.get("subject");
            this.setField("editSubject", subject);
            this.focus("editSubject");
        },
        cancel: function(e) {
            SCF.CommentView.prototype.cancel.call(this, e);
            this.$el.find(".scf-js-topic-details").show();
        },
        cut: function(e) {
            SCF.log.debug("cutting " + this.model.get("id"));
            this.model.addToClipBoard();
        },
        putBack: function(e) {
            SCF.log.debug("putting back " + this.model.get("id"));
            this.model.removeFromClipboard();
        },
        getOtherProperties: function() {
            var subject = this.getField("editSubject");
            return {
                "subject": subject
            };
        },
        toggleComposerCollapse: function(e) {
            $(e.currentTarget).closest(".scf-js-composer-block").toggleClass("scf-is-collapsed");
            this.focus("replyMessage");
            // In IE10 the RTE doesn't get cleared out when the composer opens it retains the
            // placeholder text.
            this.setField("replyMessage", "");
        },
        translateAll: function() {
            this.model.translateAll();
        }
    });

    var TopicList = Backbone.Collection.extend({
        collectionName: "TopicList"
    });
    var PostList = Backbone.Collection.extend({
        collectionName: "PostList"
    });

    SCF.Post = Post;
    SCF.Topic = Topic;
    SCF.Forum = Forum;
    SCF.TopicView = TopicView;
    SCF.PostView = PostView;
    SCF.ForumView = ForumView;
    SCF.TopicList = TopicList;
    SCF.PostList = PostList;
    SCF.registerComponent("social/forum/components/hbs/post", SCF.Post, SCF.PostView);
    SCF.registerComponent("social/forum/components/hbs/topic", SCF.Topic, SCF.TopicView);
    SCF.registerComponent("social/forum/components/hbs/forum", SCF.Forum, SCF.ForumView);
})($CQ, _, Backbone, SCF);
