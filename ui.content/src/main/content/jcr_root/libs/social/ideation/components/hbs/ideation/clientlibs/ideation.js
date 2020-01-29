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
    var Ideation = SCF.Journal.extend({
        modelName: "IdeationModel",
        relationships: {
            "items": {
                collection: "IdeaList",
                model: "IdeationTopicModel"
            }
        },
        createOperation: "social:createIdeationComment",
        shouldCommentBeAddedToList: function() {
            return true;
        }
    });
    var IdeationView = SCF.JournalView.extend({
        viewName: "Ideation",
        COMMUNITY_FUNCTION: "Ideation",
        eventBinded: false,
        filterURLParam: {
            DRAFT_URL_FILTER: "?filter=isDraft%20eq%20%27true%27&filter=publishDate%20eq%20null"
        },
        listTypes: {
            DRAFTS: "drafts"
        },
        update: function(data) {
            SCF.ForumView.prototype.update.apply(this);
            if (data.newItem.get("draft")) {
                this.fetchDrafts();
            } else {
                this.fetchAllPosts();
            }
        },
        init: function() {
            SCF.ForumView.prototype.init.apply(this);
            var resourceType = this.model.get("resourceType");
            var templateName = "ideationlists";
            this.listenTo(this.model, "change:composedForValid", this.composedForChanged);
            this.listTemplateC = SCF.findTemplate(this.model.id, templateName, resourceType);
            SCF.Router.route(/^(.*?)\.([0-9]*)\.(-?[0-9]*)\.htm.*?$/, this.PAGE_EVENT);

            /* i18n strings
            CQ.I18n.get("Draft");
            CQ.I18n.get("Submitted");
            CQ.I18n.get("Under Review");
            CQ.I18n.get("Accepted");
            CQ.I18n.get("Under Construction");
            CQ.I18n.get("Completed");
            CQ.I18n.get("Duplicate");
            CQ.I18n.get("Rejected");
            */
        },
        toggleComposer: function(e) {
            this.$el.find(".scf-js-error-message").remove();
            this.$el.find(".scf-js-ideation-tab").toggleClass("scf-is-hidden");
            this.$el.find(".scf-topic-list").toggleClass("scf-is-hidden");
            this.$el.find(".scf-pages").toggleClass("scf-is-hidden");
            var composer = this.$el.find(".scf-js-composer-block");
            if (composer.hasClass("scf-is-collapsed")) {
                this.eventBinded = false;
                this.$el.find(".scf-sort-btngrp").hide();
                this.$el.find(".scf-component-pages-container").hide();
            } else {
                this.$el.find(".scf-sort-btngrp").show();
                this.$el.find(".scf-component-pages-container").show();
            }

            if (!this.eventBinded) {
                this.bindDatePicker(e);
                this.eventBinded = true;
            }

            SCF.ForumView.prototype.toggleComposer.apply(this, [e]);
        },
        addComment: function(e) {
            SCF.CommentSystemView.prototype.addComment.apply(this, e.currentTarget.form);
        },
        addCommentDraft: function(e) {
            SCF.CommentSystemView.prototype.addCommentDraft.apply(this, e.currentTarget.form);
        },
        renderWithTemplate: function(ignoreAfterRender) {
            this.$el.find(".tab-pane").empty();
            var element = $CQ(this.listTemplateC(this.getContextForTemplate(), {
                data: {
                    parentView: this
                }
            }));
            this.$el.find("#scf-js-draftPosts").empty().append(element);
            var that = this;
            _.each(this._childViews, function(child) {
                that.renderChildView(child);
            });

            var finishRendering = _.bind(function() {
                this.bindView();
                this._rendered = true;
                if (this.afterRender && !ignoreAfterRender) {
                    this.afterRender();
                }
                this.trigger("view:rendered", {
                    view: this
                });

            }, this);
            $CQ.when(this._renderedChildren).done(finishRendering);
            this.$el.find("li.scf-ideation-tab").removeClass("active");
            this.$el.find(".tab-pane").removeClass("active");
            this.activateTabs(".scf-js-draftPosts", "#scf-js-draftPosts");
            return this;
        },
        afterRender: function() {
            SCF.JournalView.prototype.afterRender.apply(this);
            if (this.isDraftView === true) {
                this.$el.find(".scf-sort-btngrp").hide();
            } else {
                this.$el.find(".scf-sort-btngrp").show();
            }

        },
        fetchDrafts: function() {
            this.isDraftView = true;
            this.switchView(this.filterURLParam.DRAFT_URL_FILTER, ".scf-js-draftPosts",
                "#scf-js-draftPosts");
        },
        fetchAllPosts: function() {
            this.isDraftView = false;
            this.switchView("", ".scf-js-allPosts", "#scf-js-allPosts");
        }
    });

    var IdeaComment = SCF.Comment.extend({
        modelName: "IdeaComment",
        DELETE_OPERATION: "social:deleteIdeationComment",
        UPDATE_OPERATION: "social:updateIdeationComment",
        CREATE_OPERATION: "social:createIdeationComment",
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
                collection: "IdeationPostList",
                model: "IdeaComment"
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

    var IdeaCommentView = SCF.PostView.extend({
        viewName: "IdeaCommentView"
    });

    var Idea = SCF.Topic.extend({
        modelName: "IdeationTopicModel",
        DELETE_OPERATION: "social:deleteIdeationComment",
        UPDATE_OPERATION: "social:updateIdeationComment",
        CREATE_OPERATION: "social:createIdeationComment",
        CHANGESTATE_OPERATION: "social:changeStateIdeation",
        relationships: {
            "items": {
                collection: "IdeationPostList",
                model: "IdeaComment"
            },
            "votes": {
                model: "LikingModel"
            }
        },
        getCustomProperties: function() {
            var customData = {
                subject: this.get("subject")
            };
            if (this.has("isDraft")) {
                customData.isDraft = this.get("isDraft");
            }
            if (this.getConfigValue("usingPrivilegedUsers")) {
                var composedFor = this.get("composedFor");
                if (!_.isEmpty(composedFor)) {
                    customData.composedFor = composedFor;
                }
            }
            return customData;
        },
        getStatus: function() {
            var _state = this.get("state");
            if (_.isUndefined(_state) || _.isNull(_state)) {
                _state = "Submitted";
            }
            return _state;
        },
        fixCachedProperties: function(userIsModerator) {
            SCF.Topic.prototype.fixCachedProperties.call(this, userIsModerator);
            if (userIsModerator) {
                return;
            }
            var loggedInUserId = _.isUndefined(SCF.Session.attributes.id) ? "" :
                SCF.Session.attributes.id.substr(SCF.Session.attributes.id.lastIndexOf("/") +
                    1);
            var userIsOwner = (this.attributes.author || false) &&
                SCF.Session.attributes.loggedIn && ((this.attributes.author.id === SCF.Session
                        .attributes.id) ||
                    ((this.attributes.properties || false) && this.attributes.properties.composedBy ===
                        loggedInUserId));
            if (userIsOwner && !(_.isEmpty(this.get("state")) || this.get("state") ===
                    "Submitted" || this.get("state") === "Draft")) {
                this.attributes.canEdit = false;
                this.attributes.canDelete = false;
            }
        }
    });

    var IdeaView = SCF.BlogTopicView.extend({
        viewName: "Idea",
        COMMUNITY_FUNCTION: "Ideation",

        afterRender: function() {
            SCF.TopicView.prototype.afterRender.call(this);
            this.reviewStatus = this.model.getStatus();

            this.renderDropdown(this.reviewStatus);

            var _self = this;
            this.$el.find(".scf-js-review-status .dropdown-menu li a").click(function() {
                _self.reviewStatus = $(this).attr("data-review-state");
                _self.renderDropdown($(this).text());
            });
        },
        renderDropdown: function(status) {
            $(".scf-js-review-status .btn:first-child").html(
                "<span id=\"button_label\">" + CQ.I18n.get(status) +
                "</span> <span class=\"caret\"></span>");
            $(".scf-js-review-status .btn:first-child").val(status);
        },
        saveDraft: function(e) {
            this.draftFlag = "true";
            SCF.BlogTopicView.prototype.saveDraft.call(this, e);
        },
        publishDraft: function(e) {
            this.draftFlag = "false";
            SCF.BlogTopicView.prototype.publishDraft.call(this, e);
        },
        getOtherProperties: function(isReply) {
            var subject = this.getField("editSubject").trim();
            var tags = this.getField("editTags");
            var props = {
                "tags": tags
            };
            if (!isReply) {
                props.subject = subject;
            }
            props.isDraft = this.draftFlag;
            if (this.model.getConfigValue("usingPrivilegedUsers")) {
                var composedFor = this.getField("composedFor");
                if (!_.isEmpty(composedFor)) {
                    props.composedFor = composedFor;
                }
            }
            var state = this.reviewStatus;
            if (state) {
                props.toState = state;
                props.stateOperation = "Review Idea";
                props.addReply = true;
            }
            this.eventBinded = false;
            return props;
        },
        toggleReviewComposer: function() {
            var composer = this.$el.find(".scf-js-review-composer");
            composer.toggle();
            if (composer.is(":visible")) {
                this.focus("message");
                // In IE10 the RTE doesn't get cleared out when the composer opens it retains the
                // placeholder text.
                this.setField("message", "");
            }
        },
        navigateCancel: function() {
            window.location.href = this.model.get("pageInfo").basePageURL + ".html";
        }

    });

    var IdeaList = Backbone.Collection.extend({
        collectionName: "IdeaList"
    });
    var IdeationPostList = Backbone.Collection.extend({
        collectionName: "IdeationPostList"
    });

    SCF.IdeaComment = IdeaComment;
    SCF.Idea = Idea;
    SCF.Ideation = Ideation;
    SCF.IdeaView = IdeaView;
    SCF.IdeaCommentView = IdeaCommentView;
    SCF.IdeationView = IdeationView;
    SCF.IdeaList = IdeaList;
    SCF.IdeationPostList = IdeationPostList;
    SCF.registerComponent("social/ideation/components/hbs/comment", SCF.IdeaComment, SCF.IdeaCommentView);
    SCF.registerComponent("social/ideation/components/hbs/idea", SCF.Idea, SCF.IdeaView);
    SCF.registerComponent("social/ideation/components/hbs/ideation", SCF.Ideation, SCF.IdeationView);
})($CQ, _, Backbone, SCF);
