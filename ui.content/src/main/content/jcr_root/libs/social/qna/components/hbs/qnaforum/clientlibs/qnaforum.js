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
    var QnAForum = SCF.Forum.extend({
        modelName: "QnaForumModel",
        relationships: {
            "items": {
                collection: "QuestionList",
                model: "QuestionModel"
            }
        },
        createOperation: "social:createQnaPost",
        deleteOperation: "social:deleteQnaPost",
        events: {
            ADD: "question:added",
            ADD_ERROR: "question:adderror",
            DELETE: "question:deleted",
            DELETE_ERROR: "question:deleteerror"
        }
    });
    var QnAForumView = SCF.ForumView.extend({
        viewName: "QnaForum",
        COMMUNITY_FUNCTION: "QNA"
    });

    var Answer = SCF.Post.extend({
        modelName: "AnswerModel",
        DELETE_OPERATION: "social:deleteQnaPost",
        UPDATE_OPERATION: "social:updateQnaPost",
        CREATE_OPERATION: "social:createQnaPost",
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
                collection: "AnswerList",
                model: "AnswerModel"
            },
            "votes": {
                model: "VotingModel"
            }
        },
        selectAnswer: function() {
            var success = _.bind(function(response) {
                this.set({
                    answered: true,
                    isChosenAnswer: true
                });
                this.collection.each(function(answer) {
                    answer.set("isAnswered", true);
                });
                this.collection.parent.set("isAnswered", true);
                this.collection.parent.trigger("question:isAnswered", {
                    model: this.collection.parent
                });
                this.trigger(this.events.UPDATED, {
                    model: this
                });
            }, this);

            var postData = {
                ':operation': 'social:selectAnswer',
                id: 'nobot'
            };
            $CQ.ajax(SCF.config.urlRoot + this.attributes.id + '.social.json', {
                dataType: "json",
                type: "POST",
                processData: true,
                contentType: "application/x-www-form-urlencoded; charset=UTF-8",
                xhrFields: {
                    withCredentials: true
                },
                data: postData,
                success: success
            });
        },
        unselectAnswer: function() {
            var success = _.bind(function(response) {
                this.set({
                    answered: false,
                    isChosenAnswer: false
                });
                this.collection.each(function(answer) {
                    answer.set("isAnswered", false);
                });
                this.collection.parent.set("isAnswered", false);
                this.collection.parent.trigger("question:isAnswered", {
                    model: this.collection.parent
                });
                this.trigger(this.events.UPDATED, {
                    model: this
                });
            }, this);

            var postData = {
                ':operation': 'social:unselectAnswer',
                id: 'nobot'
            };
            $CQ.ajax(SCF.config.urlRoot + this.attributes.id + '.social.json', {
                dataType: "json",
                type: "POST",
                processData: true,
                contentType: "application/x-www-form-urlencoded; charset=UTF-8",
                xhrFields: {
                    withCredentials: true
                },
                data: postData,
                success: success
            });
        }
    });
    var AnswerView = SCF.PostView.extend({
        viewName: "Answer",
        selectAnswer: function() {
            this.model.selectAnswer();
        },
        unselectAnswer: function() {
            this.model.unselectAnswer();
        }
    });

    var Question = SCF.Topic.extend({
        modelName: "QuestionModel",
        DELETE_OPERATION: "social:deleteQnaPost",
        UPDATE_OPERATION: "social:updateQnaPost",
        CREATE_OPERATION: "social:createQnaPost",
        events: {
            ADDED: "answer:added",
            UPDATED: "question:updated",
            DELETED: "question:deleted",
            ADD_ERROR: "answer:addError",
            UPDATE_ERROR: "question:updateError",
            DELETE_ERROR: "question:deleteError",
            TRANSLATED: "question:translated",
            TRANSLATE_ERROR: "question:translateError"
        },
        relationships: {
            "items": {
                collection: "QuestionList",
                model: "AnswerModel"
            },
            "votes": {
                model: "VotingModel"
            }
        }
    });

    var QuestionView = SCF.TopicView.extend({
        viewName: "Question",
        COMMUNITY_FUNCTION: "QNA",
        init: function() {
            SCF.TopicView.prototype.init.apply(this);
            this.listenTo(this.model, "question:isAnswered", this.update);
        }
    });

    var QuestionList = Backbone.Collection.extend({
        collectionName: "QuestionList"
    });
    var AnswerList = Backbone.Collection.extend({
        collectionName: "AnswerList"
    });

    SCF.Answer = Answer;
    SCF.Question = Question;
    SCF.QnAForum = QnAForum;
    SCF.QuestionView = QuestionView;
    SCF.AnswerView = AnswerView;
    SCF.QnAForumView = QnAForumView;
    SCF.QuestionList = QuestionList;
    SCF.AnswerList = AnswerList;
    SCF.registerComponent('social/qna/components/hbs/post', SCF.Answer, SCF.AnswerView);
    SCF.registerComponent('social/qna/components/hbs/topic', SCF.Question, SCF.QuestionView);
    SCF.registerComponent('social/qna/components/hbs/qnaforum', SCF.QnAForum, SCF.QnAForumView);
})($CQ, _, Backbone, SCF);
