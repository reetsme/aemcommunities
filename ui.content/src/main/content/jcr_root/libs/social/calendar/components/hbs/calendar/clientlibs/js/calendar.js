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
(function($CQ, _, Backbone, SCF) {
    "use strict";

    var groupNavbarSel = ".scf-js-group-navbar";
    var coverImageFileTypes = ["image/jpeg", "image/gif", "image/png", "image/x-bmp"];
    var localesWithYearBeforeMonth = ["ja", "zh-TW", "zh-CN", "ko-KR"];

    // analytics code
    window.CQ_Analytics = window.CQ_Analytics || {};
    var cqAnalytics = CQ_Analytics;

    var tagLabels = {};

    function checkCookies() {
        if (!navigator.cookieEnabled) {
            return false;
        }
        return Granite.OptOutUtil.maySetCookie("timezone");
    }

    function getCookie(name) {
        var cname = encodeURIComponent(name) + "=";
        var dc = document.cookie;
        if (dc.length > 0) {
            var begin = dc.indexOf(cname);
            if (begin != -1) {
                begin += cname.length;
                var end = dc.indexOf(";", begin);
                if (end == -1) end = dc.length;
                return decodeURIComponent(dc.substring(begin, end));
            }
        }
        return null;
    }

    function setCookie(name, value, path, days, domain, secure) {
        if (typeof(days) != "number") days = 7;
        var date;
        if (days > 0) {
            date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        } else {
            date = new Date(0);
        }
        document.cookie = encodeURIComponent(name) + "=" +
            encodeURIComponent(value) + "; " +
            (days != 0 ? "expires=" + date.toGMTString() + "; " : "") +
            (domain ? "domain=" + domain + "; " : "") +
            (path ? "path=" + path : "") +
            (secure ? "; secure" : "");
        return value;
    }

    function checkTimeZone(model) {
        checkLocale(model);
        if (model && !model.get("timezone")) {
            var tz = moment.tz.guess();
            if (checkCookies()) {
                if (!getCookie("timezone")) {
                    setCookie("timezone", tz);
                }
                tz = getCookie("timezone");
            } else {
                var res = /[\?&]timezone=([^&#]*)/.exec(window.location.href);
                if (res && res[1]) {
                    tz = window.decodeURIComponent(res[1]);
                }
            }

            model.set("timezone", tz, {
                silent: true
            });
            return true;
        }
        return false;
    }

    function checkLocale(model) {
        if (model && !model.get("locale")) {
            var defaultLocale = CQ.I18n.getLocale();
            var res = /[\?&]locale=([^&#]*)/.exec(window.location.href);
            var locale = res && res[1] ? window.decodeURIComponent(res[1]) : defaultLocale;
            model.set("locale", locale, {
                silent: true
            });
            if (moment.locale() !== locale) {
                moment.locale(locale);
            }
            locale = moment.locale();
            model.set("localeDateFormat", moment.localeData().longDateFormat("L"), {
                silent: true
            });
            model.set("localeLongDateFormat", moment.localeData().longDateFormat("LL"), {
                silent: true
            });
            model.set("localeTimeFormat", moment.localeData().longDateFormat("LT"), {
                silent: true
            });
            if (!$CQ.datepicker.regional[moment.locale()]) {
                CQ.soco.calendar.eventbasics.initDatePickerLocale(true);
            }
        }
    }
    
    function checkIfLocaleRequiresYearBeforeMonth(defaultLocale){
        var localeIndex;
        for(localeIndex in localesWithYearBeforeMonth){
            if(localesWithYearBeforeMonth[localeIndex] == defaultLocale)
                return true;
        }
        return false;
    }

    var CalendarEvent = SCF.Topic.extend({
        modelName: "CalendarEventModel",
        CREATE_OPERATION: "social:createEvent",
        DELETE_OPERATION: "social:deleteEvent",
        UPDATE_OPERATION: "social:updateEvent",
        events: {
            ADDED: "calendarEventComment:added",
            UPDATED: "calendarEvent:updated",
            DELETED: "calendarEvent:deleted",
            ADD_ERROR: "calendarEventComment:addError",
            UPDATE_ERROR: "calendarEvent:updateError",
            DELETE_ERROR: "calendarEvent:deleteError",
            TRANSLATED: "calendarEvent:translated",
            TRANSLATE_ERROR: "calendarEvent:translateError"
        },
        relationships: {
            "items": {
                collection: "CalendarEventList",
                model: "CalendarEventModel"
            },
            "votes": {
                model: "VotingModel"
            }
        },
        getCustomProperties: function() {
            var subject = this.get("subject");
            var location = this.get("location");
            var address = this.get("address");
            var start = this.get("start");
            var end = this.get("end");
            var isdate = this.get("isDate");
            var coverimage = this.get("coverimage");
            var timezone = this.get("timezone");
            if (this.get("subject") !== undefined) {
                return {
                    "subject": subject,
                    "location": location,
                    "address": address,
                    "start": start,
                    "end": end,
                    "isDate": isdate,
                    "coverimage": coverimage,
                    "timezone": timezone
                };
            } else {
                return {
                    "timezone": timezone
                };
            }
        },
        _fixCachedProperties: function() {
            checkTimeZone(this);
            if (!this._isReady) {
                this.on("model:loaded", _.bind(this._fixCachedProperties, this));
                return;
            }
            this.off("model:loaded", _.bind(this._fixCachedProperties, this));
            if (SCF.hasOwnProperty("Session") && (SCF.Session !== null)) {
                this.fixCachedProperties();
                this.cacheFixed = true;
                this.trigger("model:cacheFixed", this);
            }
        },
        translateAll: function(e) {
            SCF.Topic.prototype.translateAll.call(this, e);
        }
    });

    var CalendarEventComment = SCF.Post.extend({
        modelName: "CalendarEventCommentModel",
        CREATE_OPERATION: "social:createEvent",
        events: {
            ADDED: "calendarEventComment:added",
            UPDATED: "calendarEventComment:updated",
            DELETED: "calendarEventComment:deleted",
            ADD_ERROR: "calendarEventComment:addError",
            UPDATE_ERROR: "calendarEventComment:updateError",
            DELETE_ERROR: "calendarEventComment:deleteError",
            TRANSLATED: "calendarEventComment:translated",
            TRANSLATE_ERROR: "calendarEventComment:translateError"
        },
        relationships: {
            "items": {
                collection: "CalendarEventCommentList",
                model: "CalendarEventCommentModel"
            },
            "votes": {
                model: "VotingModel"
            }
        },
        fixCachedProperties: function() {
            checkTimeZone(this);
            if (!SCF.Session.attributes.loggedIn) {
                this.attributes.canReply = false;
            }
        },
        isTranslationPresent: function() {
            var translatedText = this.get('translationDescription');
            return (translatedText != null && translatedText.length > 0);
        },
        getCustomProperties: function() {
            var timezone = this.get("timezone");
            if (timezone !== undefined) {
                return {
                    "timezone": timezone
                };
            } else {
                return {};
            }
        }
    });

    var Calendar = SCF.Forum.extend({
        modelName: "CalendarModel",
        CREATE_OPERATION: "social:createEvent",
        relationships: {
            "items": {
                collection: "CalendarEventList",
                model: "CalendarEventModel"
            }
        },
        createOperation: "social:createEvent",
        events: {
            ADD: "calendar:added",
            ADD_ERROR: "calendar:adderror"
        },
        isTranslationPresent: function() {
            var translatedText = this.get('translationDescription');
            return (translatedText != null && translatedText.length > 0);
        },
        _fixCachedProperties: function() {
            checkTimeZone(this);
            if (SCF.hasOwnProperty("Session") && (SCF.Session !== null)) {
                this.fixCachedProperties();
                this.cacheFixed = true;
                this.trigger("model:cacheFixed", this);
            }
        }
    });

    var CalendarEventView = SCF.TopicView.extend({
        viewName: "CalendarEventView",
        modelName: "CalendarEventModel",
        tagName: "li",
        className: "calendarevent post",
        createOperation: "social:createEvent",
        requiresSession: true,
        COMMUNITY_FUNCTION: "Calendar",

        init: function() {
            SCF.TopicView.prototype.init.apply(this);
            SCF.Router.route(/^(.*?)event\.([0-9]*)\.(-?[0-9]*)\.htm.*?$/, "pageEvents");
            SCF.Router.route(/^(.*?)event\.index\.(.*)\.(-?[0-9]*)\.([0-9])*\.htm.*?$/, "pageEvents");
            this.listenTo(SCF.Router, "route:pageEvents", this.paginate);
            this.listenTo(this.model, this.model.events.UPDATE_ERROR, this.showError);
            this.listenTo(this.model, this.model.events.DELETE_ERROR, this.showError);
            this.listenTo(this.model, this.model.events.ADDED, this.viewUpdate);
            this.listenTo(this.model, this.model.events.UPDATED, this.viewUpdate);


        },
        viewUpdate: function() {
            this.render();
        },
        afterRender: function() {
            this.updateCrumbs();
        },
        updateCrumbs: function() {
            if (this.$el.attr("data-scf-template")) {
                return;
            }
            var crumbs = [];
            crumbs.push({
                "title": CQ.I18n.get("Calendar"),
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
            if (window.location.hash.indexOf("comment") != -1) {
                if ($CQ(".scf-composer-msg.scf-rte-placeholder").length > 0) {
                    $CQ(".scf-composer-msg.scf-rte-placeholder").closest(".scf-js-composer-block")
                        .toggleClass("scf-is-collapsed");
                } else {
                    $CQ(".scf-composer-msg").closest(".scf-js-composer-block").toggleClass("scf-is-collapsed");
                }

                this.toggleComposerCollapse();
            }
        },
        edittranslation: function(e) {
            SCF.TopicView.prototype.edittranslation.call(this, e);
            this.$el.find(".scf-js-comment-action-toolbar").hide();
            this.$el.find(".scf-js-edit-hidden").hide();
            this.$el.find(".scf-js-topic-details").hide();
        },
        edit: function(e) {
            this.hideError();
            SCF.PostView.prototype.edit.call(this, e);
            this.$el.find(".scf-js-comment-action-toolbar").hide();
            this.$el.find(".scf-js-edit-hidden").hide();
            this.$el.find(".scf-js-topic-details").hide();
            var subject = this.model.get("subject");
            var location = this.model.get("properties").location_t;
            var address = this.model.get("properties").address_s;
            this.setField("editSubject", subject);
            this.setField("editLocation", location);
            this.setField("editAddress", address);
            CQ.soco.calendar.eventbasics.startValue = moment.tz(this.model.get("start"), this.model.get("timezone"))
                .toDate();
            CQ.soco.calendar.eventbasics.endValue = moment.tz(this.model.get("end"), this.model.get("timezone"))
                .toDate();
            CQ.soco.calendar.hbs.eventbasics.init(this.$el, this.model);
            $CQ(".scf-composer-block .scf-calendar-smart-tags input").attr("placeholder", CQ.I18n.get("Add a tag"));
            $CQ(".scf-js-composer-att").empty();
            this.coverFile = undefined;
            this.focus("editSubject");
        },
        save: function(e) {
            var self = this;
            this.hideError();
            e.stopPropagation();
            this.model.once(this.model.events.UPDATED, function() {
                var editBox = self.$el.find(".scf-js-comment-edit-box:first");
                editBox.hide();
            });
            SCF.PostView.prototype.save.call(this, e);
            e.preventDefault();
        },
        addReply: function(e) {
            this.hideError();
            e.stopPropagation();
            if (!this.getField("replyMessage") && this.getField("message")) {
                this.setField("replyMessage", this.getField("message"));
            }
            if (!this.getField("replyMessage") && !this.getField("message") &&
                (this.$el.find("textarea[data-attrib='replyMessage']:visible").val() ||
                    this.$el.find("textarea[data-attrib='message']:visible").val())) {
                this.setField("replyMessage", this.$el.find("textarea[data-attrib='replyMessage']:visible").val() ||
                    this.$el.find("textarea[data-attrib='message']:visible").val());
            }
            this.setField("timezone", this.model.get("timezone"));
            SCF.PostView.prototype.addReply.call(this, e);
            e.preventDefault();
        },
        cancel: function(e) {
            SCF.PostView.prototype.cancel.call(this, e);
            this.$el.find(".scf-js-comment-action-toolbar").show();
            this.$el.find(".scf-js-edit-hidden").show();
            this.files = void 0;
            this.coverFile = undefined;
            var p = this.model.get("properties");
            if (p && p.coverimage) {
                this.$el.find(".scf-event-cover-image").attr("src", p.coverimage + ".thumb.120.80.png");
            }
            this.$el.find(".scf-js-topic-details").show();
        },
        getOtherProperties: function() {
            var timezone = this.model.get("timezone");
            var subject = this.getField("editSubject");
            var location = this.getField("editLocation");
            var address = this.getField("editAddress");
            var start = CQ.soco.calendar.eventbasics.getDateTime(
                this.$el.find(".scf-js-event-basics-start-input").val(),
                this.$el.find(".scf-js-event-basics-start-time").val(),
                this.$el.find(".scf-js-event-basics-start-time-timezone").val(),
                true);
            var end = CQ.soco.calendar.eventbasics.getDateTime(
                this.$el.find(".scf-js-event-basics-end-input").val(),
                this.$el.find(".scf-js-event-basics-end-time").val(),
                this.$el.find(".scf-js-event-basics-start-time-timezone").val(),
                true);
            var isdate = CQ.soco.calendar.eventbasics.isDate();
            return {
                "subject": subject,
                "location": location,
                "address": address,
                "start": start,
                "end": end,
                "isDate": isdate,
                "coverimage": this.coverFile,
                "timezone": timezone
            };
        },
        toggleComposerCollapse: function(e) {
            this.hideError();
            if (e) $CQ(e.currentTarget).closest(".scf-js-composer-block").toggleClass("scf-is-collapsed");
            this.focus("message");
            // In IE10 the RTE doesn't get cleared out when the composer opens it retains the
            // placeholder text.
            this.setField("message", "");
        },
        showError: function(error) {
            var targetArea = null;
            if (!error || !error.details || !error.details.status || !error.details.status.message) {
                error = error || {};
                error.details = error.details || {};
                error.details.status = error.details.status || {};
                error.details.status.message = CQ.I18n.get("Unknown Error.");
            }
            if (error.details.status.code == "401") {
                var siteLink = $($(".scf-js-site-title")[0]).attr("href");
                window.location.href = "http://" + location.host + siteLink.replace(".html", "/signin.html");
            } else {
                if (error && error.details && error.details.status && error.details.status.message ===
                    "Comment value is empty") {
                    targetArea = this.$el.find(".scf-composer textarea:visible, .scf-composer div.cke:visible");
                } else if (error && error.details && error.details.status && error.details.status.message ===
                    "Topic Subject may not be empty") {
                    targetArea = this.$el.find(".scf-composer input.scf-composer-msg:visible, " +
                        ".scf-composer input.scf-composer-msg:visible");
                } else {
                    targetArea = this.$el.find(".scf-js-comment-edit-box:first:visible, .scf-js-topic-details:visible");
                }
                this.$el.find(targetArea).addClass("scf-error");
                this.addErrorMessage(targetArea, error);
                this.log.error(error);
            }
        },
        showErrorOnAdd: function(error) {
            var targetArea = null;
            if (!error || !error.details || !error.details.status || !error.details.status.message) {
                error = error || {};
                error.details = error.details || {};
                error.details.status = error.details.status || {};
                error.details.status.message = CQ.I18n.get("Unknown Error.");
            }
            if (error && error.details && error.details.status && error.details.status.message ===
                "Comment value is empty") {
                targetArea = this.$el.find(".scf-composer textarea:visible, .scf-composer div.cke:visible");
            } else if (error && error.details && error.details.status && error.details.status.message ===
                "Topic Subject may not be empty") {
                targetArea = this.$el.find(".scf-composer input.scf-composer-msg:visible, " +
                    ".scf-composer input.scf-composer-msg:visible");
            } else if (this.isExceptionOnUGCLimit(error)) {
                this.showUGCLimitDialog(error.details.error.message);
            } else {
                targetArea = this.$el.find(".scf-js-comment-edit-box:first:visible, .scf-js-topic-details:visible, " +
                    ".scf-composer:visible");
            }
            this.$el.find(targetArea).addClass("scf-error");
            this.addErrorMessage(targetArea, error);
            this.log.error(error);
        },
        hideError: function() {
            this.clearErrorMessages();
            this.$el.removeClass("scf-error");
            this.$el.parent().find(".scf-js-error-message").remove();
        },
        fixCoverRatio: function(e) {
            $CQ(e.target).css("width", "auto");
            $CQ(e.target).css("height", "auto");
            var coverWidth = $CQ(e.target).width();
            var coverHeight = $CQ(e.target).height();
            var thumbWidth = $CQ(e.target).parent().width();
            var thumbHeight = $CQ(e.target).parent().height();
            if (coverWidth / coverHeight < thumbWidth / thumbHeight) {
                $CQ(e.target).css("width", thumbWidth);
                $CQ(e.target).css("minHeight", "auto");
            } else {
                $CQ(e.target).css("height", thumbHeight);
                $CQ(e.target).css("minWidth", "auto");
            }
        },
        renderCover: function(e) {
            if (e) {
                e.preventDefault();
                if (!this.files) { // Simulate hasAttachment for CommentSystem model
                    this.files = []; // to switch to 'multipart/form-data'
                }
                this.coverFile = e.target.files && e.target.files[0];
                var coverImageEl = $CQ(".scf-event .scf-event-cover-image");
                if (coverImageEl.length) {
                    coverImageEl.bind("load", _.bind(this.fixCoverRatio, this));
                    coverImageEl[0].src = URL.createObjectURL(this.coverFile);
                }
            }
            var attachments = $CQ(".scf-js-composer-att");
            attachments.find(".scf-is-attached-cover").remove();
            var coverFile;
            var fileIsImage = false;
            var self = this;
            $CQ.each(coverImageFileTypes, function(key, value) {
                if (self.coverFile.type === value) {
                    fileIsImage = true;
                }
            });
            if (fileIsImage) {
                coverFile = $CQ("<li class=\"scf-is-attached scf-is-attached-cover\"> <b>" + CQ.I18n.get("Cover:") +
                    "</b> " + _.escape(this.coverFile.name) + " - " + this.coverFile.size + " " +
                    CQ.I18n.get("bytes") + "</li>");
            } else {
                coverFile = $CQ("<li class=\"scf-is-attached scf-is-attached-cover scf-js-error-message\"> <b>" +
                    CQ.I18n.get("Error:") + "</b> " + _.escape(this.coverFile.name) +
                    CQ.I18n.get(" has unsupported file type ") + " - " + this.coverFile.type + "</li>");
                this.coverFile = undefined;
            }
            attachments.prepend(coverFile);
        },
        openCoverDialog: function(e) {
            if (SCF.Util.mayCall(e, "preventDefault")) {
                e.preventDefault();
            }
            this.$el.find(".scf-js-calendar-cover-input").first().click();
        },
        openAttachmentDialog: function(e) {
            if (SCF.Util.mayCall(e, "preventDefault")) {
                e.preventDefault();
            }
            this.$el.find(".scf-comment-attachment-input").first().click();
        },
        renderAttachmentList: function(e) {
            e.preventDefault();
            SCF.CommentView.prototype.renderAttachmentList.apply(this, [e]);
            if (this.coverFile) {
                this.renderCover();
            }
        }
    });

    var CalendarEventCommentView = SCF.PostView.extend({
        viewName: "CalendarEventCommentView",
        modelName: "CalendarEventCommentModel",
        tagName: "li",
        className: "calendarEventComment",
        createOperation: "social:createEvent",
        requiresSession: true,
        init: function() {
            this.listenTo(this.model, this.model.events.UPDATE_ERROR, this.showError);
            this.listenTo(this.model, this.model.events.DELETE_ERROR, this.showDeleteError);
            this.listenTo(this.model, this.model.events.ADDED, this.viewUpdate);
            this.listenTo(this.model, this.model.events.UPDATED, this.viewUpdate);
            this.listenTo(this.model, this.model.events.DELETED, this.removeView);
            SCF.PostView.prototype.init.apply(this);
        },
        viewUpdate: function() {
            this.render();
        },
        showDeleteError: function(error) {
            var targetArea = this.$el.find(".scf-comment-content");
            this.$el.find(targetArea).addClass("scf-error");
            if (!error || !error.details || !error.details.status || !error.details.status.message) {
                error = error || {};
                error.details = error.details || {};
                error.details.status = error.details.status || {};
                error.details.status.message = CQ.I18n.get("Unknown Error.");
            }
            this.addErrorMessage(targetArea, error);
            this.log.error(error);
        },
        showError: function(error) {
            var targetTextArea = this.$el.find(".scf-js-comment-reply-box textarea:visible, " +
                ".scf-js-comment-reply-box div.cke:visible, .scf-js-comment-edit-box textarea:visible, " +
                ".scf-js-comment-edit-box div.cke:visible");
            this.$el.find(targetTextArea).addClass("scf-error");
            if (!error || !error.details || !error.details.status || !error.details.status.message) {
                error = error || {};
                error.details = error.details || {};
                error.details.status = error.details.status || {};
                error.details.status.message = CQ.I18n.get("Unknown Error.");
            }
            this.addErrorMessage(targetTextArea, error);
            this.log.error(error);
        },
        hideError: function() {
            this.clearErrorMessages();
        },
        addReply: function(e) {
            this.hideError();
            e.stopPropagation();
            if (!this.getField("replyMessage") && this.getField("message")) {
                this.setField("replyMessage", this.getField("message"));
            }
            if (!this.getField("replyMessage") && !this.getField("message") &&
                (this.$el.find("textarea[data-attrib='replyMessage']:visible").val() ||
                    this.$el.find("textarea[data-attrib='message']:visible").val())) {
                this.setField("replyMessage", this.$el.find("textarea[data-attrib='replyMessage']:visible").val() ||
                    this.$el.find("textarea[data-attrib='message']:visible").val());
            }
            this.setField("timezone", this.model.get("timezone"));
            SCF.PostView.prototype.addReply.call(this, e);
            e.preventDefault();
        },
        removeView: function() {
            return Backbone.View.prototype.remove.apply(this, arguments);
        },
        getOtherProperties: function() {
            var timezone = this.model.get("timezone");
            return {
                "timezone": timezone
            };
        }
    });

    var CalendarView = SCF.ForumView.extend({
        viewName: "CalendarView",
        modelName: "CalendarModel",
        className: "calendar",
        COMMUNITY_FUNCTION: "Calendar",
        PAGE_EVENT: "pageEvents",
        PAGE_URL_PREFIX: "events",
        DATE_FROM_FLT: null,
        DATE_TO_FLT: null,
        TXT_FLT: null,
        TAGS_FLT: null,
        DEFAULT_DATE: false,
        init: function() {
            this.listenTo(this.model, 'event:deleted', this.reload);
            this.listenTo(this.model, 'event:updated', this.reload);
            this.listenTo(this.model, this.model.events.ADD_ERROR, this.showError);
            this.listenTo(this.model, this.model.events.ADD_UPDATE, this.showError);
            this.listenTo(this.model, this.model.events.ADD_DELETE, this.showError);
            this.listenTo(this.model, 'calendar:deleted', function(context) {
                this.model.set({
                    'totalSize': this.model.get('totalSize') - 1
                });
                this.updateTotal();
            });
            this.listenTo(this.model, 'model:loaded', function() {
                this._modelReady = true;
                this.update();
            });

            SCF.ForumView.prototype.init.apply(this);
            SCF.Router.route(/^(.*?)\.index\.(.*)\.(-?[0-9]*)\.([0-9])*\.htm.*?$/, "pageEvents");
            this.DEFAULT_DATE = true;
            var that = this;
            that.loadTags(function() {
                that.parseFilter(location.href);
                if (that.TAGS_FLT && that.TAGS_FLT.length) {
                    that.DEFAULT_DATE = true;
                    that.render();
                }
            });
        },
        afterRender: function() {
            this.addFilterDatePickers();
            CQ.soco.calendar.eventbasics.startValue = moment.tz(this.model.get("start"), this.model.get("timezone"))
                .toDate();
            CQ.soco.calendar.eventbasics.endValue = moment.tz(this.model.get("end"), this.model.get("timezone"))
                .toDate();
            CQ.soco.calendar.hbs.eventbasics.init(this.$el, this.model);
            $CQ(".scf-composer-block .scf-calendar-smart-tags input").attr("placeholder", CQ.I18n.get("Add a tag"));
            $CQ(".scf-calendar-toolbar .scf-calendar-smart-tags input").attr("placeholder", CQ.I18n.get("Tags..."));
            var defaultLocale = CQ.I18n.getLocale();
            // Checking if locale is japanese,chinese or korean - if yes-show year before month in datepicker
            if(checkIfLocaleRequiresYearBeforeMonth(defaultLocale)){
                $CQ(".scf-calendar-filter-by-date-from").datepicker("option", "showMonthAfterYear", true);
                $CQ(".scf-calendar-filter-by-date-to").datepicker("option", "showMonthAfterYear", true);
            }
            if (this.DATE_FROM_FLT) $CQ(".scf-calendar-filter-by-date-from").datepicker("setDate", this.DATE_FROM_FLT);
            if (this.DATE_TO_FLT) $CQ(".scf-calendar-filter-by-date-to").datepicker("setDate", this.DATE_TO_FLT);
            if (this.TXT_FLT) $CQ(".scf-calendar-filter-by-text").val(this.TXT_FLT);
            if (checkTimeZone(this.model) && !checkCookies()) {
                this.reload(true);
            }
        },
        updateTotal: function() {
            this.$el.find(".event-stats span").html(this.model.get('totalSize') + " Events");
        },
        loadTags: function(cb) {
            var that = this;
            if (tagLabels._loading) {
                setTimeout(function() {
                    that.loadTags(cb);
                }, 500);
                return false;
            }
            if (tagLabels._loaded) {
                if (cb && typeof(cb) == "function") {
                    cb(tagLabels);
                }
                return true;
            }
            tagLabels._loading = true;
            $CQ.ajax({
                url: SCF.config.urlRoot + "/services/tagfilter",
                dataType: "json",
                success: function(data) {
                    tagLabels._loading = false;
                    tagLabels._loaded = true;
                    for (var i = 0; i < data.length; i++) {
                        var item = data[i];
                        if (item && item.tagid) {
                            tagLabels[item.tagid] = {
                                title: item.label,
                                value: item.value,
                                tagId: item.tagid
                            };
                        }
                    }
                    if (cb && typeof(cb) == "function") {
                        cb(tagLabels);
                    }
                }
            });
            return false;
        },
        checkFilterDatePickers: function(start) {
            var dateFrom = $CQ(".scf-calendar-filter-by-date-from").val() ? $CQ(".scf-calendar-filter-by-date-from")
                .datepicker("getDate") : "";
            var dateTo = $CQ(".scf-calendar-filter-by-date-to").val() ? $CQ(".scf-calendar-filter-by-date-to")
                .datepicker("getDate") : "";
            if (dateFrom != "" && dateTo != "" && dateFrom.getTime() > dateTo.getTime()) {
                if (start) {
                    $CQ(".scf-calendar-filter-by-date-to").datepicker("setDate", dateFrom);
                } else {
                    $CQ(".scf-calendar-filter-by-date-from").datepicker("setDate", dateTo);
                }
            }
        },
        addFilterDatePickers: function() {
            var self = this;
            var appendCalendarQuickButtons = function() {
                if (self.toQuickButtons) {
                    clearTimeout(self.toQuickButtons);
                }
                self.toQuickButtons = setTimeout(function() {
                    var btns = $CQ(".scf-calendar-datepicker-buttons").clone();
                    $CQ("#ui-datepicker-div").append(btns);
                    btns.find("a").click(function(e) {
                        $CQ(".scf-calendar-filter-by-date-from,.scf-calendar-filter-by-date-to").datepicker("hide");
                        var shift = 0;
                        var period = 0;
                        if ($CQ(e.target).hasClass("scf-calendar-datepicker-tomorrow-button")) {
                            shift = 1;
                        } else if ($CQ(e.target).hasClass("scf-calendar-datepicker-next7-button")) {
                            period = 6;
                        } else if ($CQ(e.target).hasClass("scf-calendar-datepicker-next30-button")) {
                            period = 29;
                        }
                        var today = new Date();
                        var dateFrom = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                        if (shift) {
                            dateFrom = new Date(dateFrom.getTime() + shift * 24 * 60 * 60 * 1000);
                        }
                        var dateTo = new Date(dateFrom.getTime() + period * 24 * 60 * 60 * 1000);
                        $CQ(".scf-calendar-filter-by-date-from").datepicker("setDate", dateFrom);
                        $CQ(".scf-calendar-filter-by-date-to").datepicker("setDate", dateTo);
                        self.reload(true);
                    });
                    self.toQuickButtons = 0;
                }, 200);
            };
            $CQ(".scf-calendar-filter-by-date-from").datepicker({
                dateFormat: CQ.soco.calendar.hbs.eventbasics.convertMomentToDatePickerFormat(
                    self.model.get("localeDateFormat")),
                changeMonth: true,
                changeYear: true,
                appendQuickLinks: appendCalendarQuickButtons,
                beforeShow: function(input, inst) {
                    appendCalendarQuickButtons();
                },
                onChangeMonthYear: function(input, inst) {
                    appendCalendarQuickButtons();
                },
                onSelect: function(event) {
                    self.checkFilterDatePickers(true);
                }
            });
            $CQ(".scf-calendar-filter-by-date-from").datepicker(CQ.soco.calendar.eventbasics.initDatePickerLocale());
            $CQ(".scf-calendar-filter-by-date-to").datepicker({
                dateFormat: CQ.soco.calendar.hbs.eventbasics.convertMomentToDatePickerFormat(
                    self.model.get("localeDateFormat")),
                changeMonth: true,
                changeYear: true,
                appendQuickLinks: appendCalendarQuickButtons,
                beforeShow: function(input, inst) {
                    appendCalendarQuickButtons();
                },
                onChangeMonthYear: function(input, inst) {
                    appendCalendarQuickButtons();
                },
                onSelect: function(event) {
                    self.checkFilterDatePickers();
                }
            });
            $CQ(".scf-calendar-filter-by-date-to").datepicker(CQ.soco.calendar.eventbasics.initDatePickerLocale());
            if ($CQ.datepicker && !$CQ.datepicker._updateDatepicker_initial) {
                $CQ.datepicker._updateDatepicker_initial = $CQ.datepicker._updateDatepicker;
                $CQ.datepicker._updateDatepicker = function(inst) {
                    $CQ.datepicker._updateDatepicker_initial(inst);
                    if (inst && inst.settings && inst.settings.appendQuickLinks &&
                        typeof(inst.settings.appendQuickLinks) === "function") {
                        inst.settings.appendQuickLinks();
                    }
                };
            }
            if (!$CQ(".scf-calendar-filter-by-date-from").val() && !$CQ(".scf-calendar-filter-by-date-to").val() &&
                this.DEFAULT_DATE) {
                var today = new Date();
                var dateFrom;
                var dateTo;
                if (this.model.get("defaultDateRangeFilterStart")) {
                    dateFrom = moment(new Date(this.model.get("defaultDateRangeFilterStart"))).toDate();
                } else {
                    dateFrom = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                }
                if (this.model.get("defaultDateRangeFilterEnd")) {
                    dateTo = moment(new Date(this.model.get("defaultDateRangeFilterEnd"))).toDate();
                } else {
                    dateTo = new Date(dateFrom.getTime() + 30 * 24 * 60 * 60 * 1000);
                }
                $CQ(".scf-calendar-filter-by-date-from").datepicker("setDate", dateFrom);
                $CQ(".scf-calendar-filter-by-date-to").datepicker("setDate", dateTo);
                this.DEFAULT_DATE = false;
            }
        },
        getOtherProperties: function() {
            var subject = this.getField("subject");
            var location = this.getField("location");
            var address = this.getField("address");
            var start = CQ.soco.calendar.eventbasics.getDateTime(
                this.$el.find(".scf-js-event-basics-start-input").val(),
                this.$el.find(".scf-js-event-basics-start-time").val(),
                this.$el.find(".scf-js-event-basics-start-time-timezone").val(),
                true);
            var end = CQ.soco.calendar.eventbasics.getDateTime(
                this.$el.find(".scf-js-event-basics-end-input").val(),
                this.$el.find(".scf-js-event-basics-end-time").val(),
                this.$el.find(".scf-js-event-basics-start-time-timezone").val(),
                true);
            var isdate = CQ.soco.calendar.eventbasics.isDate();
            var timezone = this.model.get("timezone");
            return {
                "subject": subject,
                "location": location,
                "address": address,
                "start": start,
                "end": end,
                "isDate": isdate,
                "coverimage": this.coverFile,
                "timezone": timezone
            };
        },
        toggleComposer: function(e) {
            var composer = this.$el.find(".scf-js-composer-block");
            composer.toggleClass("scf-is-collapsed");
            this.$el.find(".scf-js-newevent").toggleClass("scf-is-collapsed");
            // Checking if locale is japanese,chinese or korean - if yes-show year before month in datepicker
            var defaultLocale = CQ.I18n.getLocale();
            if(checkIfLocaleRequiresYearBeforeMonth(defaultLocale)){
                $CQ(".scf-js-event-basics-start-input").datepicker("option", "showMonthAfterYear", true);
                $CQ(".scf-js-event-basics-end-input").datepicker("option", "showMonthAfterYear", true);
            }
            if (composer.is(":visible")) {
                $CQ(".scf-calendar-toolbar, .scf-event-list, .scf-calendar .scf-pages").hide();
                this.focus("subject");
                // In IE10 the RTE doesn't get cleared out when the composer opens it retains the
                // placeholder text.
                this.setField("message", "");
                var pageInfo = this.model.get("pageInfo");
                var pageToGoTo = pageInfo.basePageURL + "." + pageInfo.currentIndex + "." + pageInfo.pageSize +
                    ".html?" + this.filterSetter();
                SCF.Router.navigate(pageToGoTo, {
                    trigger: false
                });
            } else {
                this.files = void 0;
                this.coverFile = undefined;
                this.$el.find(".scf-attachment-list").first().empty();
                $CQ(".scf-calendar-toolbar, .scf-event-list, .scf-calendar .scf-pages").show();
                this.hideError();
            }
            SCF.CommentSystemView.prototype.toggleComposer.apply(this, [e]);
        },
        filterSetter: function() {
            var today = moment.tz(new Date(), this.model.get("timezone")).toDate();
            var filterString = "filter=true&_charset_=utf-8&timestamp=" + today.getTime();

            this.checkFilterDatePickers(true);
            this.DATE_FROM_FLT = $CQ(".scf-calendar-filter-by-date-from").val() ?
                $CQ(".scf-calendar-filter-by-date-from").datepicker("getDate") : "";
            this.DATE_TO_FLT = $CQ(".scf-calendar-filter-by-date-to").val() ?
                $CQ(".scf-calendar-filter-by-date-to").datepicker("getDate") : "";
            var dateRangeFilter = this.DATE_FROM_FLT && this.DATE_TO_FLT ?
                $CQ.datepicker.formatDate("yy-mm-dd", this.DATE_FROM_FLT) + "_" +
                $CQ.datepicker.formatDate("yy-mm-dd", this.DATE_TO_FLT) : undefined;
            this.TXT_FLT = $CQ(".scf-calendar-filter-by-text").val();
            var tags = this.getField("tag");
            this.TAGS_FLT = (tags.length ? tags : this.TAGS_FLT);

            if (dateRangeFilter) {
                filterString += "&dates=" + dateRangeFilter;
            }
            if (this.TXT_FLT) {
                filterString += "&keyword=" + window.encodeURIComponent(this.TXT_FLT);
            }
            var tags = [];
            if (this.TAGS_FLT && this.TAGS_FLT.length) {
                filterString += "&tags="
                for (var i = 0; i < this.TAGS_FLT.length; i++) {
                    filterString += window.encodeURIComponent(this.TAGS_FLT[i]) +
                        (i != this.TAGS_FLT.length - 1 ? "," : "");
                    tags.push(tagLabels[this.TAGS_FLT[i]] ? tagLabels[this.TAGS_FLT[i]] : {
                        title: this.TAGS_FLT[i],
                        tagId: this.TAGS_FLT[i],
                        value: this.TAGS_FLT[i]
                    });
                }
            }
            this.model.set("tags", tags);

            checkTimeZone(this.model);
            filterString += "&timezone=" + window.encodeURIComponent(this.model.get("timezone"));

            return filterString;
        },
        parseFilter: function(url) {
            var reDates = /dates=([0-9]*)-([0-9]*)-([0-9]*)_([0-9-]*)-([0-9]*)-([0-9]*)/;
            var reKeyword = /keyword=([^&]*)/;
            var reTags = /tags=([^&]*)/;
            var dt = reDates.exec(url);
            if (dt && dt.length > 6) {
                this.DATE_FROM_FLT = new Date(parseInt(dt[1]), parseInt(dt[2]) - 1, parseInt(dt[3]));
                this.DATE_TO_FLT = new Date(parseInt(dt[4]), parseInt(dt[5]) - 1, parseInt(dt[6]));;
            }
            var kwd = reKeyword.exec(url);
            if (kwd && kwd.length > 1) {
                this.TXT_FLT = window.decodeURIComponent(kwd[1]);
            }
            var tgs = reTags.exec(url);
            var tags = [];
            if (tgs && tgs.length > 1) {
                this.TAGS_FLT = String(window.decodeURIComponent(tgs[1])).split(",");
                for (var i = 0; i < this.TAGS_FLT.length; i++) {
                    tags.push(tagLabels[this.TAGS_FLT[i]] ? tagLabels[this.TAGS_FLT[i]] : {
                        title: this.TAGS_FLT[i],
                        tagId: this.TAGS_FLT[i],
                        value: this.TAGS_FLT[i]
                    });
                }
            }
            this.model.set("tags", tags);
        },
        reload: function(nav) {
            this.hideError();
            var path = SCF.config.urlRoot + this.model.get("id") + SCF.constants.SOCIAL_SELECTOR + ".json?" +
                this.filterSetter();

            var that = this;

            var error = _.bind(function(jqxhr, text, error) {
                this.log.error("error filter calendar events " + error);
            }, this);
            var success = _.bind(function(response) {
                var collection = new CalendarEventList();
                collection.model = CalendarEvent;
                collection.parent = that;
                collection.set(response.items, {
                    "silent": true
                });
                that.model.set("pageInfo", response.pageInfo, {
                    "silent": true
                });
                that.model.set("items", collection, {
                    "silent": true
                });
                that.render();
            }, this);
            if (nav) {
                var pageInfo = this.model.get("pageInfo");
                var pageToGoTo = pageInfo.basePageURL + ".0." + pageInfo.pageSize + ".html?" + this.filterSetter();
                SCF.Router.navigate(pageToGoTo, {
                    trigger: false
                });
            }
            that.loadTags(function() {
                $CQ.ajax(path, {
                    "success": success,
                    "error": error
                });
            });
        },
        showErrorOnAdd: function(error) {
            if (error.details.status.code == "401") {
                var siteLink = $($(".scf-js-site-title")[0]).attr("href");
                window.location.href = "http://" + location.host + siteLink.replace(".html", "/signin.html");
            } else {
                var highlightForm = false;
                var targetArea = null;
                if (!error || !error.details || !error.details.status || !error.details.status.message) {
                    error = error || {};
                    error.details = error.details || {};
                    error.details.status = error.details.status || {};
                    error.details.status.message = CQ.I18n.get("Unknown Error.");
                }
                if (error && error.details && error.details.status && error.details.status.message ===
                    "Comment value is empty") {
                    targetArea = this.$el.find(".scf-composer textarea:visible, .scf-composer div.cke:visible");
                } else if (error && error.details && error.details.status && error.details.status.message ===
                    "Topic Subject may not be empty") {
                    targetArea = this.$el.find(".scf-composer input.scf-composer-msg:visible, " +
                        ".scf-composer input.scf-composer-msg:visible");
                } else if (this.isExceptionOnUGCLimit(error)) {
                    this.showUGCLimitDialog(error.details.error.message);
                } else {
                    highlightForm = true;
                    targetArea = this.$el.find(".scf-js-comment-edit-box:first:visible, .scf-js-topic-details:visible, " +
                        ".scf-composer:visible");
                }
                this.$el.find(targetArea).addClass("scf-error");
                this.addErrorMessage(targetArea, error);
                if (highlightForm) {
                    this.$el.find(".scf-js-error-message").addClass("scf-composer");
                }
                this.log.error(error);
            }
        },
        hideError: function() {
            this.clearErrorMessages();
        },
        renderCover: function(e) {
            if (e) {
                e.preventDefault();
                if (!this.files) { // Simulate hasAttachment for CommentSystem model
                    this.files = []; // to switch to 'multipart/form-data'
                }
                this.coverFile = e.target.files && e.target.files[0];
            }
            var attachments = $CQ(".scf-js-composer-att");
            attachments.find(".scf-is-attached-cover").remove();
            var coverFile;
            var fileIsImage = false;
            var self = this;
            $CQ.each(coverImageFileTypes, function(key, value) {
                if (self.coverFile.type === value) {
                    fileIsImage = true;
                }
            });
            if (fileIsImage) {
                coverFile = $CQ("<li class=\"scf-is-attached scf-is-attached-cover\"> <b>" + CQ.I18n.get("Cover:") +
                    "</b> " + _.escape(this.coverFile.name) + " - " + this.coverFile.size + " " +
                    CQ.I18n.get("bytes") + "</li>");
            } else {
                coverFile = $CQ("<li class=\"scf-is-attached scf-is-attached-cover scf-js-error-message\"> <b>" +
                    CQ.I18n.get("Error:") + "</b> " + _.escape(this.coverFile.name) +
                    CQ.I18n.get(" has unsupported file type ") + " - " + this.coverFile.type + "</li>");
                this.coverFile = undefined;
            }
            attachments.prepend(coverFile);
        },
        openCoverDialog: function(e) {
            if (SCF.Util.mayCall(e, "preventDefault")) {
                e.preventDefault();
            }
            this.$el.find(".scf-js-calendar-cover-input").first().click();
        },
        openAttachmentDialog: function(e) {
            if (SCF.Util.mayCall(e, "preventDefault")) {
                e.preventDefault();
            }
            this.$el.find(".scf-comment-attachment-input").first().click();
        },
        filter: function(e) {
            e.preventDefault();
            $CQ(".scf-calendar-filter-button, .scf-calendar-clear-button").attr("disabled", true).addClass("disabled");
            this.TAGS_FLT = $CQ(".scf-calendar-toolbar .scf-calendar-smart-tags").tagit('assignedTags');
            this.reload(true);
            return false;
        },
        events: {
            "click .scf-calendar-clear-button": function(e) {
                e.preventDefault();
                $CQ(".scf-calendar-filter-by-date-from,.scf-calendar-filter-by-date-to," +
                    ".scf-calendar-filter-by-text").val("");
                $CQ(".scf-calendar-smart-tags").tagit('removeAll');
                this.DATE_FROM_FLT = null;
                this.DATE_TO_FLT = null;
                this.TXT_FLT = null;
                this.TAGS_FLT = null;
                this.model.set("tags", []);
                $CQ(".scf-calendar-filter-button, .scf-calendar-clear-button").attr("disabled", true)
                    .addClass("disabled");
                this.reload(true);
            }
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
            this.model.url = url + "?" + this.filterSetter();
            this.model.reload();
        },
        navigatecalendar: function(e) {
            var windowHost = window.location.protocol + "//" + window.location.host;
            var suffix = $CQ(e.currentTarget).data("page-suffix");
            var pageInfo = this.model.get("pageInfo");
            if (windowHost.indexOf(SCF.config.urlRoot) !== -1) {
                var pageToGoTo = pageInfo.basePageURL + "." + suffix + ".html";
                SCF.Router.navigate(pageToGoTo, {
                    trigger: true
                });
            } else {
                suffix = $CQ(e.currentTarget).data("pageSuffix");
                var suffixInfo = suffix.split(".");
                if (pageInfo.sortIndex !== null) {
                    this.paginate(pageInfo.basePageURL, suffixInfo[0], suffixInfo[1], pageInfo.sortIndex);
                } else {
                    this.paginate(pageInfo.basePageURL, suffixInfo[0], suffixInfo[1]);
                }
            }
        },
        renderAttachmentList: function(e) {
            e.preventDefault();
            SCF.CommentSystemView.prototype.renderAttachmentList.apply(this, [e]);
            if (this.coverFile) {
                this.renderCover();
            }
        }
    });

    var CalendarEventList = Backbone.Collection.extend({
        collectionName: "CalendarEventList",
        model: CalendarEvent
    });
    var CalendarEventCommentList = Backbone.Collection.extend({
        collectionName: "CalendarEventCommentList",
        model: CalendarEventComment
    });

    SCF.CalendarEvent = CalendarEvent;
    SCF.CalendarEventComment = CalendarEventComment;
    SCF.Calendar = Calendar;
    SCF.CalendarEventList = CalendarEventList;
    SCF.CalendarEventCommentList = CalendarEventCommentList;
    SCF.CalendarEventView = CalendarEventView;
    SCF.CalendarEventCommentView = CalendarEventCommentView;
    SCF.CalendarView = CalendarView;

    SCF.registerComponent('social/calendar/components/hbs/calendar', SCF.Calendar, SCF.CalendarView);
    SCF.registerComponent('social/calendar/components/hbs/event', SCF.CalendarEvent, SCF.CalendarEventView);
    SCF.registerComponent('social/calendar/components/hbs/event_comment', SCF.CalendarEventComment,
        SCF.CalendarEventCommentView);

})($CQ, _, Backbone, SCF);
