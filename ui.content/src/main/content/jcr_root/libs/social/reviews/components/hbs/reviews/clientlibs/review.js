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
    var scf_review_response_data = {};
    var scf_review_response_delta = {};
    var ReviewSystem = SCF.CommentSystem.extend({
        modelName: "ReviewSystemModel",
        relationships: {
            "items": {
                collection: "ReviewList",
                model: "ReviewModel"
            }
        },
        createOperation: "social:createReview",
        events: {
            ADD: "review:added",
            ADD_ERROR: "review:adderror",
            UPDATED: "review:updated",
            DELETE: "review:deleted"
        },
        addReview: function(data, scb, fcb) {
            var success = _.bind(function(response) {
                var review = response.response;
                var ReviewKlass = SCF.Models[this.constructor.prototype.relationships.items.model];
                var newReview = new ReviewKlass(review);
                newReview.set("_isNew", true);
                newReview._isReady = true;
                var reviews = this.get('items');
                var isCollectionNew = false;
                if (!reviews) {
                    var CollectionKlass = SCF.Collections[this.constructor.prototype.relationships.items.collection] || Backbone.Collection;
                    reviews = new CollectionKlass();
                    reviews.model = ReviewKlass;
                    reviews.parent = this;
                    isCollectionNew = true;
                }
                reviews.unshift(newReview);
                if (isCollectionNew) {
                    this.set('items', reviews);
                }
                var totalReviews = this.get('totalSize');
                this.set('totalSize', totalReviews + 1);
                var averages = this.get('ratingAverages');
                var ratings = this.get('ratings');
                var overall = this.get('overallRating');
                if (!averages) {
                    averages = {};
                    this.set('ratingAverages', averages);
                }
                if (!overall) {
                    overall = {};
                    this.set('overallRating', overall);
                }
                var allowed_ratings = this.get('allowedRatings');
                for (var i = 0; i < allowed_ratings.length; i++) {
                    var name = allowed_ratings[i].name;
                    var avg = averages[name];
                    var ratingValue = $(scf_review_response_data[name]).data("rating-value");
                    if (ratingValue > 0) {
                        var totalResponses = 0;
                        if (_.isUndefined(ratings)) {
                            ratings = {};
                            this.set('ratings', ratings);
                            ratings[name] = {};
                        } else if (!ratings[name]) {
                            ratings[name] = {};
                        } else {
                            totalResponses = ratings[name].totalNumberOfResponses;
                        }
                        avg = (avg * totalResponses + ratingValue) / (totalResponses + 1);
                        averages[name] = avg.toFixed(2);
                        if (ratings) {
                            ratings[name].totalNumberOfResponses = totalResponses + 1;
                            ratings[name].averageRating = avg.toFixed(2);
                        }
                        if (i == 0) {
                            overall.averageRating = averages[name];
                        }
                    }
                }
                newReview.constructor.prototype._cachedModels[review.id] = newReview;
                this.trigger(this.events.ADD, {
                    model: this
                });
                scf_review_response_data = {};
            }, this);
            var error = _.bind(function(jqxhr, text, error) {
                this.trigger(this.events.ADD_ERROR, this.parseServerError(jqxhr, text, error));
            }, this);
            var postData;
            var hasAttachment = (typeof data.files != 'undefined');

            if (hasAttachment) {
                var reader, file;

                // Create a formdata object and add the files
                if (window.FormData) {
                    postData = new FormData();
                }

                if (postData) {
                    $.each(data.files, function(key, value) {
                        postData.append("file", value);
                    });
                    postData.append('id', 'nobot');
                    postData.append(':operation', this.createOperation);
                    delete data.files;
                    $.each(data, function(key, value) {
                        postData.append(key, value);
                    });
                }
            } else {
                postData = {
                    'id': 'nobot',
                    ':operation': this.createOperation
                };
                _.extend(postData, data);
                postData = this.getCustomProperties(postData, data);
            }
            this.addIncludeHint(postData);

            $CQ.ajax(SCF.config.urlRoot + this.get('id') + SCF.constants.URL_EXT, {
                dataType: 'json',
                type: 'POST',
                processData: !hasAttachment,
                contentType: (hasAttachment) ? false : 'application/x-www-form-urlencoded; charset=UTF-8',
                xhrFields: {
                    withCredentials: true
                },
                data: this.addEncoding(postData),
                'success': success,
                'error': error
            });

        },
        updateReview: function() {
            var averages = this.get('ratingAverages');
            var ratings = this.get('ratings');
            var overall = this.get('overallRating');
            var allowed_ratings = this.get('allowedRatings');
            for (var i = 0; i < allowed_ratings.length; i++) {
                var name = allowed_ratings[i].name;
                var avg = averages[name];
                if (!_.isUndefined(scf_review_response_delta[name]) && scf_review_response_delta[name] !== 0) {
                    var totalResponses = 0;
                    if (_.isUndefined(ratings[name])) {
                        ratings[name] = {};
                    } else {
                        totalResponses = ratings[name].totalNumberOfResponses;
                    }
                    if (("" + scf_review_response_delta[name]).indexOf("*") > 0) {
                        //new response
                        scf_review_response_delta[name] = parseInt(scf_review_response_delta[name]);
                        avg = (avg * totalResponses + scf_review_response_delta[name]) / (totalResponses + 1);
                        ratings[name].totalNumberOfResponses = totalResponses + 1;
                    } else {
                        avg = (avg * totalResponses + scf_review_response_delta[name]) / totalResponses;
                    }
                    averages[name] = parseFloat(avg).toFixed(2);
                    if (i == 0) {
                        overall.averageRating = averages[name];
                    }
                }
            }

            this.trigger(this.events.UPDATED, {
                model: this
            });

        },
        deleteReview: function(context) {
            var totalReviews = this.get('totalSize');
            this.set('totalSize', totalReviews - 1);

            var deleted = context.get("ratingResponses");
            var averages = this.get('ratingAverages');
            var ratings = this.get('ratings');
            var overall = this.get('overallRating');
            var allowed_ratings = this.get('allowedRatings');
            for (var i = 0; i < allowed_ratings.length; i++) {
                var name = allowed_ratings[i].name;
                var avg = averages[name];
                var totalResponses = ratings[name].totalNumberOfResponses;
                if (deleted[name] !== null && deleted[name] !== 0) {
                    if (totalResponses > 1) {
                        avg = (avg * totalResponses - deleted[name]) / (totalResponses - 1);
                        averages[name] = avg.toFixed(2);
                    } else {
                        averages[name] = 0;
                    }
                    if (i == 0) {
                        overall.averageRating = averages[name];
                    }
                }
            }

            this.trigger(this.events.DELETE, {
                model: this
            });

        }
    });

    var ReviewSystemView = SCF.CommentSystemView.extend({
        viewName: "ReviewSystem",
        className: "comment-system",
        init: function() {
            this.listenTo(this.model, this.model.events.ADD, this.add);
            this.listenTo(this.model, this.model.events.ADD_ERROR, this.showErrorOnAdd);
            this.listenTo(this.model, this.model.events.DELETE, this.remove);
            this.listenTo(this.model.get('items'), 'remove', function(context) {
                this.model.deleteReview(context);
            });
            this.listenTo(this.model.get('items'), 'review:updated', function(context) {
                this.model.updateReview();
            });
            this.listenTo(SCF.Router, 'route:' + this.PAGE_EVENT, this.paginate);
        },
        add: function() {
            this.render();
            this.$el.find('.scf-create-review-button')[0].disabled = true;
        },
        remove: function() {
            this.$el.find('.scf-create-review-button')[0].disabled = false;
        },
        showErrorOnAdd: function(error) {
            this.addErrorMessage(this.$el.find(".scf-review-form-label-bold").first(), error);
            console.log(error);
        },
        addReview: function(e) {
            var msg = this.getField('message');
            var tags = this.getField('tags');
            var data = _.extend(this.getOtherProperties(), {
                'message': msg,
                'tags': tags
            });
            if (!SCF.Session.get("loggedIn")) {
                data.userIdentifier = this.getField("anon-name");
                data.email = this.getField("anon-email");
                data.url = this.getField("anon-web");
            }
            if (typeof this.files != 'undefined') {
                data.files = this.files;
            }
            var ratings = "";
            for (var key in scf_review_response_data) {
                if (scf_review_response_data.hasOwnProperty(key)) {
                    ratings = ratings + key + ";";
                    ratings = ratings + $(scf_review_response_data[key]).data("rating-value") + ";";
                }
            }
            data.ratings = ratings;
            this.clearErrorMessages();
            this.model.addReview(data);
            e.preventDefault();
            return false;
        },
        rate: function(e) {
            var star = e.target;
            $(star).parent().parent().attr("data-rating-shown", "0-0");
            scf_review_response_data[$(star).data("type")] = star;
            e.preventDefault();
            return false;
        },
        highlight: function(e) {
            var el = e.target;
            var doneHighlight = false;
            $(el).parent().find('.scf-ratings-star[data-rating-value]').each(function(index) {
                if (!doneHighlight) {
                    $(this).addClass('scf-is-rating-star-select');
                    $(this).removeClass('scf-is-rating-star-deselect');
                } else {
                    $(this).removeClass('scf-is-rating-star-select');
                    $(this).addClass('scf-is-rating-star-deselect');
                }
                if (this === el) {
                    doneHighlight = true;
                }
            });
        },
        resetHighlights: function(e) {
            var doResetHighlight = false;
            var el = e.target;
            $(el).parent().find('.scf-ratings-star[data-rating-value]').each(function(index) {
                var selectedStar = scf_review_response_data[$(this).data("type")];
                if (_.isUndefined(selectedStar)) {
                    $(this).removeClass('scf-is-rating-star-deselect');
                    $(this).removeClass('scf-is-rating-star-select');
                    return;
                }

                if (doResetHighlight) {
                    $(this).removeClass('scf-is-rating-star-deselect');
                    $(this).removeClass('scf-is-rating-star-select');
                } else {
                    $(this).addClass('scf-is-rating-star-select');
                    $(this).removeClass('scf-is-rating-star-deselect');
                }

                if (this === selectedStar) {
                    doResetHighlight = true;
                }
            });
        },
        toggleCreateReviewForm: function(e) {
            this.$el.find('.scf-review-form').show('fast');
            this.$el.find('.scf-create-review-button').hide('fast');
            this.$el.find(".scf-js-composer-block:last").removeClass("scf-is-collapsed");
        },
        cancelComposer: function() {
            this.$el.find('.scf-review-form').hide('fast');
            this.$el.find('.scf-create-review-button').show('fast');
            this.$el.find(".scf-js-composer-block:last").addClass("scf-is-collapsed");
            this.files = undefined;
            $CQ(".scf-js-composer-att").empty();
        }
    });

    var Review = SCF.Comment.extend({
        modelName: "ReviewModel",
        DELETE_OPERATION: "social:deleteReview",
        UPDATE_OPERATION: "social:updateReview",
        CREATE_OPERATION: "social:createComment",
        events: {
            ADDED: "review:added",
            UPDATED: "review:updated",
            DELETED: "review:deleted",
            ADD_ERROR: "review:addError",
            UPDATE_ERROR: "review:updateError",
            DELETE_ERROR: "review:deleteError",
            TRANSLATED: "comment:translated",
            TRANSLATE_ERROR: "comment:translateError"
        },
        saveEdits: function() {
            var error = _.bind(function(jqxhr, text, error) {
                this.trigger(this.events.UPDATE_ERROR, {
                    'error': error
                });
            }, this);
            var success = _.bind(function(response) {
                this.set(response.response);
                this.trigger(this.events.UPDATED, {
                    model: this
                });
            }, this);

            var postData = {
                'message': this.get('message'),
                'ratings': this.get('ratings'),
                'id': 'nobot',
                ':operation': this.UPDATE_OPERATION
            };
            postData = _.extend(this.getCustomProperties(), postData);
            this.addIncludeHint(postData);

            $CQ.ajax(SCF.config.urlRoot + this.get('id') + SCF.constants.URL_EXT, {
                dataType: 'json',
                type: 'POST',
                xhrFields: {
                    withCredentials: true
                },
                data: this.addEncoding(postData),
                'success': success,
                'error': error
            });
        },
        relationships: {
            "items": {
                collection: "ReviewList",
                model: "ReviewModel"
            },
            "votes": {
                model: "VotingModel"
            }
        }
    });

    var ReviewView = SCF.CommentView.extend({
        viewName: "Review",
        highlight: ReviewSystemView.prototype.highlight,
        resetHighlights: ReviewSystemView.prototype.resetHighlights,
        rate: ReviewSystemView.prototype.rate,
        edit: function(e) {
            e.stopPropagation();
            var editBox = this.$el.find(".scf-js-comment-edit-box:first");
            editBox.toggle();
            var ratingbars = editBox.find('.scf-ratings-bar-selected');
            for (var i = 0; i < ratingbars.length; i++) {
                var value = $(ratingbars[i]).data("rating-shown");
                var ratingtype = $($(ratingbars[i]).find('.scf-ratings-star')[0]).data("type");
                scf_review_response_data[ratingtype] = $(ratingbars[i]).find('.scf-ratings-star')[value - 1];
            }
            this.$el.find(".scf-js-comment-msg:first").hide();
            this.$el.find(".scf-ratings-block:first").hide();
            var text = this.model.get('message');
            this.setField("editMessage", text);
            this.focus("editMessage");
        },
        save: function(e) {
            e.stopPropagation();
            var bEditTranslationInProgress = this.model.get('editTranslationInProgress');
            var msg = this.getField("editMessage");
            var ratings = "";
            scf_review_response_delta = {};
            for (var key in scf_review_response_data) {
                if (scf_review_response_data.hasOwnProperty(key)) {
                    ratings = ratings + key + ";";
                    ratings = ratings + $(scf_review_response_data[key]).data("rating-value") + ";";
                    scf_review_response_delta[key] = $(scf_review_response_data[key]).data("rating-value") - this.model.attributes.ratingResponses[key];
                    if (this.model.attributes.ratingResponses[key] === null && scf_review_response_delta[key] !== 0) {
                        scf_review_response_delta[key] += "*";
                    }
                }
            }
            var data = _.extend(this.getOtherProperties(), {
                message: msg,
                ratings: ratings
            });
            this.clearErrorMessages();
            this.model.set(data);
            if (bEditTranslationInProgress) {
                this.model.saveEditTranslation();
            } else {
                this.model.saveEdits();
            }
            scf_review_response_data = {};
            return false;
        },
        cancel: function(e) {
            e.stopPropagation();
            this.clearErrorMessages();
            var editBox = this.$el.find(".scf-js-comment-edit-box:first");
            editBox.hide();
            this.$el.find(".scf-js-comment-msg:first").show();
            this.$el.find(".scf-ratings-block:first").show();
        }
    });

    var ReviewList = Backbone.Collection.extend({
        collectionName: "ReviewList"
    });


    SCF.Review = Review;
    SCF.ReviewSystem = ReviewSystem;
    SCF.ReviewView = ReviewView;
    SCF.ReviewSystemView = ReviewSystemView;
    SCF.ReviewList = ReviewList;

    SCF.registerComponent('social/reviews/components/hbs/reviews/review', SCF.Review, SCF.ReviewView);
    SCF.registerComponent('social/reviews/components/hbs/reviews', SCF.ReviewSystem, SCF.ReviewSystemView);

})($CQ, _, Backbone, SCF);
