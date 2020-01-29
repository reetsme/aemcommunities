/*************************************************************************
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
 **************************************************************************/
(function($CQ, _, Backbone, SCF) {
    "use strict";

    moment.locale(CQ.shared.I18n.getLocale());

    var MessageBox = SCF.Model.extend({
        modelName: "MessageBoxModel",

        relationships: {
            "items": {
                collection: "MessageList",
                model: "MessageModel"
            }
        },

        fetchMessageDetails: function() {
            var self = this;
            var pathName = this.get("messageResourceURL") + ".detail-view-box.html";
            var postData = {
                ":operation": "social:updateMessage",
                "read": "true"
            };
            var url = pathName;
            var messageBoxRelativePath = this.get("messageBoxRelativePath");
            var messageId = this.get("messageId");
            var msgNum = this.get("msgNum");
            var getData = messageBoxRelativePath !== null && messageBoxRelativePath !== undefined &&
                messageId !== null && messageId !== undefined ? {
                    "folder": messageBoxRelativePath,
                    "messageId": messageId
                } : {
                    "msgNum": msgNum
                };

            postData.serviceSelector = this.get("properties").serviceSelector;
            if (!postData.serviceSelector) {
                postData.serviceSelector = "";
            }

            $CQ.ajax({
                url: url,
                type: "GET",
                data: getData,
                success: function(html) {
                    var msgPath;
                    self.set({
                        "detailViewBox": html
                    });
                    self.trigger("openDetailView");
                    msgPath = self.get("messagePath");
                    $CQ.ajax({
                        url: msgPath + SCF.constants.URL_EXT,
                        type: "POST",
                        data: postData,
                        async: false
                    });
                },
                async: false
            });
        },

        updateMessage: function(postURL, data) {
            $CQ.ajax({
                url: postURL + SCF.constants.URL_EXT,
                type: "POST",
                data: data,
                async: false,
                error: function(response){
                    if (response.status == 401) {
                        var siteLink = $($(".scf-js-site-title")[0]).attr("href");
                        window.location.href = "http://" + location.host + siteLink.replace(".html", "/signin.html");
                    }
                }
            });
        }
    });

    var MessageBoxView = SCF.View.extend({
        viewName: "MessageBox",

        init: function() {
            this.listenTo(this.model, "openDetailView", this.renderDetailView);
            this.render();
        },

        updateCrumbs: function() {
            var crumbsContainerEl = $CQ(".scf-js-site-breadcrumbs");
            var activeCrumb = $CQ(crumbsContainerEl).find("li:last");
            var crumbs = [];
            var messageId = this.model.get("messageId");
            var messageSubject = "";
            var messages = this.model.get("items");
            var i;

            crumbs.push({
                "title": CQ.I18n.get(activeCrumb.text()),
                "url": window.location.href
            });
            for (i = 0; i < messages.models.length; i++) {
                if (messages.models[i].get("messageID") === messageId) {
                    messageSubject = messages.models[i].get("subject");
                    break;
                }
            }
            crumbs.push({
                "title": messageSubject,
                "url": "",
                "active": true
            });
            SCF.Util.announce("crumbs", {
                "crumbs": crumbs
            });
        },

        render: function() {

            var selector = ".fullsize-status-template";
            var profileFormPath = this.model.get("properties").profileFormPath;
            if (!profileFormPath || profileFormPath.trim() === "") {
                this.$el.find(".messaging-user-link").addClass("disabled-messaging-user-link");
            }
            this.displayUsageStatistics();

            // message send status
            if (window.location.href.indexOf(selector) > -1) {
                this.showNotification();
                this.removeStatusSelector();
            }
            Backbone.on("messageClick", this.handleMessageClick, this);
        },

        events: {

            "click .quickActionButton": function(e) {
                var targetName = e.target.name;
                var className = e.target.className;
                this.model.set({
                    "buttonClicked": targetName
                });
                if (className.indexOf(" read ") !== -1 || className.indexOf(" read") + 5 === className.length ||
                    className.indexOf("read ") === 0) {
                    this.model.set({
                        "isReadButton": true
                    });
                } else if (className.indexOf(" unread ") !== -1 ||
                    className.indexOf(" unread") + 7 === className.length || className.indexOf("unread ") === 0) {
                    this.model.set({
                        "isUnreadButton": true
                    });
                } else if (className.indexOf(" delete ") !== -1 ||
                    className.indexOf(" delete") + 7 === className.length || className.indexOf("delete ") === 0) {
                    this.model.set({
                        "isDeleteButton": true
                    });
                }
            },

            "submit": function(e) {
                var self = this;
                var property = null;
                var value = null;
                var selectedMessagePaths = [];
                var buttonClicked = self.model.get("buttonClicked");
                var undo = "undo+";
                var permDeleteProperty = "permdelete";
                var messagePath = "messagepaths";
                var data = {};
                var checkedElements = this.getCheckedElements();
                var undoIndex;
                var pathIndex;
                var postURL;
                var serviceSelector;

                e.preventDefault();

                if (buttonClicked !== null && buttonClicked !== undefined) {
                    undoIndex = buttonClicked.indexOf(undo);
                    if (buttonClicked === permDeleteProperty) {
                        property = permDeleteProperty;
                        value = "true";
                    } else if (undoIndex === -1) {
                        property = buttonClicked;
                        value = "true";
                    } else {
                        property = buttonClicked.substring(undo.length);
                        value = "false";
                    }
                }

                $CQ(checkedElements).each(function() {
                    var path = this.val();
                    var trMessage = this.closest(".messagecontainingrow")[0];
                    var row;
                    selectedMessagePaths.push(path);
                    if (self.model.get("isReadButton")) {
                        row = $CQ(trMessage);
                        row.removeClass("unreadMessageContainingRow");
                        $CQ(row.find(".unreadCircle")[0]).removeClass("circleBackgroundImage");
                    } else if (self.model.get("isUnreadButton")) {
                        row = $CQ(trMessage);
                        row.addClass("unreadMessageContainingRow");
                        $CQ(row.find(".unreadCircle")[0]).addClass("circleBackgroundImage");
                    } else if (self.model.get("isDeleteButton")) {
                        trMessage.style.display = "none";
                    }
                });
                for (pathIndex = 0; pathIndex < selectedMessagePaths.length; pathIndex++) {
                    postURL = selectedMessagePaths[pathIndex];
                    serviceSelector = self.model.get("properties").serviceSelector;
                    if (serviceSelector) {
                        data.serviceSelector = serviceSelector;
                    }
                    data[messagePath] = selectedMessagePaths[pathIndex];
                    if (property === permDeleteProperty) {
                        data[":operation"] = "social:deleteMessage";
                    } else {
                        data[":operation"] = "social:updateMessage";
                    }
                    data[property] = value;

                    self.model.updateMessage(postURL, data);
                }
                if (self.model.get("isDeleteButton")) {
                    self.toggleSelect(false);
                }
                self.model.set({
                    "isReadButton": false
                });
                self.model.set({
                    "isUnreadButton": false
                });
                return true;
            },

            "change .messagecheckbox": function(e) {
                var $target = this.$el.find(e.target);
                if ($target.is(":checked")) {
                    this.checkBoxListener(true);
                } else {
                    this.checkBoxListener(false);
                }
            },

            "click #newMessageButton": function() {
                window.location.href = this.model.get("properties").replyURL;
            },

            "click .allSelector": function() {
                this.toggleSelectAll("all");
            },

            "click .readSelector": function() {
                this.toggleSelectAll("read");
            },

            "click .unreadSelector": function() {
                this.toggleSelectAll("unread");
            },

            "click .noneSelector": function() {
                this.toggleSelectAll("none");
            },

            "click .pagination .scf-page": function(e) {
                var pathName = window.location.pathname;
                var slashIndex = pathName.lastIndexOf("/");
                var dotIndex = pathName.indexOf(".", slashIndex === -1 ? 0 : slashIndex);
                var $target = this.$el.find(e.currentTarget);
                var selector1 = $target.attr("data-page-suffix").match(/[^\.]+/)[0];
                var selector2 = $target.attr("data-page-suffix").match(/\.([^\.]+)/)[1];
                pathName = pathName.substring(0, dotIndex);
                window.location.pathname = pathName + "." + selector1 + "." + selector2 + ".html";
            },

            "click .messagecontainingrow .messageDetailRow": function(e) {
                var $showContent = this.$el.find(e.currentTarget).find("[name='showcontent']");
                $showContent.click();
            },

            "click .disabled-messaging-user-link": function(e) {
                e.preventDefault();
            },

            "click .restoreMessageTrashAction": function(e) {
                var $target = this.$el.find(e.currentTarget);
                var $actionButtonHolder = $target.closest(".message-action-button-holder");
                var messagePath = $actionButtonHolder.find("[name=resourcePath]").val();
                this.messageDelete(messagePath, "deleted", "false");
            },

            "click .deleteMessageTrashAction": function(e) {
                var $target = this.$el.find(e.currentTarget);
                var $actionButtonHolder = $target.closest(".message-action-button-holder");
                var messagePath = $actionButtonHolder.find("[name=resourcePath]").val();
                return this.messagePermDelete(CQ.I18n.get(
                    "This will permanently delete the message(s). Do you really want to proceed?"), messagePath);
            },

            "click .messageAction.reply": function(e) {
                this.prepareComposeMessageURL(e.currentTarget, true);
            },

            "click .messageAction.replyAll": function(e) {
                this.prepareComposeMessageURL(e.currentTarget, true);
            },

            "click .messageAction.forward": function(e) {
                this.prepareComposeMessageURL(e.currentTarget, true);
            },

            "click .messageAction.delete": function(e) {
                var $target = this.$el.find(e.currentTarget);
                var $actionButtonHolder = $target.closest(".message-action-button-holder");
                var messagePath = $actionButtonHolder.find("[name=resourcePath]").val();
                this.messageDelete(messagePath, "deleted", "true");
            },

            "click .detailMessageViewNavigator .detailMessageBackLink": function() {
                this.openDetailView({
                    msgPath: null,
                    messageBoxRelativePath: null,
                    id: null,
                    target: this,
                    resourceURL: this.model.get("messageResourceURL"),
                    msgNum: this.model.get("msgNum") - 1
                });
            },

            "click .detailMessageViewNavigator .detailMessageForwardLink": function() {
                this.openDetailView({
                    msgPath: null,
                    messageBoxRelativePath: null,
                    id: null,
                    target: this,
                    resourceURL: this.model.get("messageResourceURL"),
                    msgNum: this.model.get("msgNum") + 1
                });
            }
        },

        renderDetailView: function() {
            var checkHTML = function(textOrHTML) {
                var elements = $CQ.parseHTML(textOrHTML),
                    result = false;
                $CQ.each(elements, function(i, el) {
                    if (el.nodeType === 1) {
                        result = true;
                        return false;
                    }
                });
                return result;
            };
            var self = this;
            this.$el.html(this.model.get("detailViewBox"));
            var $hiddenContent = this.$el.find(".message-detailed-content [name=hidden-content]");
            if ($hiddenContent.length > 0) {
                var source = "";
                if (checkHTML($hiddenContent.val())) {
                    source = $hiddenContent.val();
                } else {
                    source = $hiddenContent.val().replace(/\r\n/g, "<br>")
                        .replace(/\n/g, "<br>").replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
                }
                this.$el.find(".message-detailed-content").html(source);
            }

            var msgPath = this.model.get("messagePath");
            if (!msgPath) {
                msgPath = this.$el.find("[data-scf-component='social/messaging/components/hbs/message']")
                    .attr("data-component-id");
                this.model.set({
                    "messagePath": msgPath
                });
            }
            this.updateCrumbs();

        },

        openDetailView: function(params) {
            // params: msgPath, messageBoxRelativePath, id, target, resourceURL, msgNum
            var $target = $CQ(params.target);
            var totalMsgCount = this.model.get("totalSize");
            var currentOffset = this.model.get("pageInfo").currentIndex;
            var num;
            if (params.msgNum === null || params.msgNum === undefined) {
                num = $target.closest(".messagecontainingrow").attr("class").match(/messageNumber([^\s]+)/);
                if (num && num.length > 1) {
                    params.msgNum = parseInt(num[1], 10);
                }
            }
            if (params.msgNum === null || params.msgNum === undefined || params.msgNum < 0 ||
                params.msgNum >= parseInt(totalMsgCount, 10)) {
                return;
            }
            if (currentOffset) {
                params.msgNum += parseInt(currentOffset, 10);
            }

            this.model.set({
                "messageBoxRelativePath": params.messageBoxRelativePath,
                "messageId": params.id,
                "messageTarget": params.target,
                "messageResourceURL": params.resourceURL,
                "msgNum": params.msgNum,
                "messagePath": params.msgPath
            });
            this.model.fetchMessageDetails();
        },

        getCheckedElements: function() {
            var checkedElements = [];
            this.$el.find("#messages").find("input:checked").each(function() {
                checkedElements.push($CQ(this));
            });
            return checkedElements;
        },

        openListView: function() {
            window.location.reload();
        },

        prepareComposeMessageURL: function(linkContainer, modifyURL) {
            /*jshint maxcomplexity:false */
            var $linkContainer = this.$el.find(linkContainer);
            var composeURL = $linkContainer.attr("name");
            var htmlSuffix = ".html";
            var $actionButtonHolder;
            var replyAsResource;
            var $replyLink;
            var replyURL;
            var $folderPathContainer;
            var folderPathFromURL;
            var folderPath;
            var messageID;
            var resourcePath;
            if (modifyURL) {
                $actionButtonHolder = $linkContainer.closest(".message-action-button-holder");
                replyAsResource = $actionButtonHolder.find("[name=replyTypeValue]").val();
                $replyLink = $actionButtonHolder.find(".reply");
                replyURL = $replyLink.attr("name");
                if (replyURL.indexOf(htmlSuffix, replyURL.length - htmlSuffix.length) === -1) {
                    replyURL += htmlSuffix;
                }
                $folderPathContainer = $actionButtonHolder.find("[name=folderPath]");
                folderPathFromURL = window.location.search.match(/folder=[^&]+/);
                if (folderPathFromURL && folderPathFromURL.length > 0) {
                    folderPathFromURL = folderPathFromURL[0].match(/=(.+)/)[1];
                }
                folderPath = $folderPathContainer.length > 0 ? $folderPathContainer.val() : folderPathFromURL;
                messageID = $actionButtonHolder.find("[name=messageID]").val();
                resourcePath = $actionButtonHolder.find("[name=resourcePath]").val();
                if (replyAsResource) {
                    replyURL = resourcePath + ".form.html" + replyURL;
                } else {
                    replyURL = replyURL + "?messageId=" + messageID + "&folder=" + folderPath;
                }
                if ($linkContainer.hasClass("reply")) {
                    composeURL = replyURL;
                } else if ($linkContainer.hasClass("replyAll")) {
                    composeURL = replyURL + (replyURL.indexOf("?") < 0 ? "?" : "&") + "replyTo=all";
                } else if ($linkContainer.hasClass("forward")) {
                    composeURL = replyURL + (replyURL.indexOf("?") < 0 ? "?" : "&") + "fwd=true";
                }
            }
            window.location.href = composeURL;
        },

        messageDelete: function(path, property, value) {
            var data = {};
            var postURL = path + SCF.constants.URL_EXT;
            data.serviceSelector = this.model.get("properties").serviceSelector;
            data[":operation"] = "social:updateMessage";
            data[property] = value;
            data.messagePath = path;
            this.model.updateMessage(postURL, data);
            this.openListView();
        },

        messagePermDelete: function(mesg, path) {
            var confirmation = window.confirm(mesg);
            var property = "permdelete";
            var value = "true";

            if (confirmation === true) {
                var postURL = path + SCF.constants.URL_EXT;
                var data = {};
                data.serviceSelector = this.model.get("properties").serviceSelector;
                data[":operation"] = "social:deleteMessage";
                data[property] = value;
                data.messagePath = path;
                this.model.updateMessage(postURL, data);
                this.openListView();
            }
        },

        displayUsageStatistics: function() {
            var $usageStatistics = this.$el.find(".paginateAndDisplayUsage .usageStatistics");
            var userStatistics = this.model.get("userStatistics");
            var maxSize = userStatistics.maxSize;
            var size = userStatistics.size;
            var GB_DIVISOR = 1073741824;
            var MB_DIVISOR = 1048576;
            var KB_DIVISOR = 1024;
            var GB_LIMIT = GB_DIVISOR / 2;
            var MB_LIMIT = MB_DIVISOR / 2;
            var KB_LIMIT = KB_DIVISOR / 2;
            var sizeDisplayUnit = CQ.I18n.get("Bytes");
            var sizeDivisor = 1;
            var maxSizeDisplayUnit = CQ.I18n.get("Bytes");
            var maxSizeDivisor = 1;
            var percent;
            var html;
            if (maxSize > 0) {
                if (size > GB_LIMIT) {
                    sizeDivisor = GB_DIVISOR;
                    sizeDisplayUnit = CQ.I18n.get("GB");
                } else if (size > MB_LIMIT) {
                    sizeDivisor = MB_DIVISOR;
                    sizeDisplayUnit = CQ.I18n.get("MB");
                } else if (size > KB_LIMIT) {
                    sizeDivisor = KB_DIVISOR;
                    sizeDisplayUnit = CQ.I18n.get("KB");
                }
                if (maxSize > GB_LIMIT) {
                    maxSizeDivisor = GB_DIVISOR;
                    maxSizeDisplayUnit = CQ.I18n.get("GB");
                } else if (maxSize > MB_LIMIT) {
                    maxSizeDivisor = MB_DIVISOR;
                    maxSizeDisplayUnit = CQ.I18n.get("MB");
                } else if (maxSize > KB_LIMIT) {
                    maxSizeDivisor = KB_DIVISOR;
                    maxSizeDisplayUnit = CQ.I18n.get("KB");
                }
                percent = (size / maxSize).toFixed(2);
                html = "<div class='usageStatistics inlineDiv'>";
                html += (size / sizeDivisor).toFixed(2) + " " + sizeDisplayUnit + " (" + percent + "%) " +
                    CQ.I18n.get("of ");
                html += (maxSize / maxSizeDivisor).toFixed(2) + " " + maxSizeDisplayUnit +
                    CQ.I18n.get(" used") + "</div>";
                $usageStatistics.html(html);
            }
        },

        checkBoxListener: function() {
            var quickActionButtons = this.$el.find(".quickActionButton");
            var selectedMessages = this.$el.find(".messagecheckbox:checked");
            var selectedMessagesCount = selectedMessages ? selectedMessages.length : 0;

            if (selectedMessagesCount === 1) {
                quickActionButtons.removeAttr("disabled");
                quickActionButtons.each(function() {
                    var button = $CQ(this);
                    button.removeClass("disabled");
                });
            } else if (selectedMessagesCount === 0) {
                quickActionButtons.attr("disabled", "disabled");
                quickActionButtons.each(function() {
                    var button = $CQ(this);
                    button.addClass("disabled");
                });
            }
        },

        handleMessageClick: function(event) {
            var targetMessageBoxPath = this.model.get("id");
            this.openDetailView({
                msgPath: event.messagePath,
                messageBoxRelativePath: event.messageBoxRelativePath,
                id: event.messageID,
                target: event.target,
                resourceURL: targetMessageBoxPath
            });
        },

        toggleSelect: function(doSelect, whom) {
            var self = this;
            var messageCheckbox = self.$el.find("[name = 'mailCheckbox']");
            var rows = null;
            if (whom === "") {
                messageCheckbox.each(function() {
                    var $this = $CQ(this);
                    if (this.checked !== doSelect) {
                        this.checked = doSelect;
                        $this.change();
                    }
                });
            }
            if (whom === "read") {
                rows = self.$el.find(".messagecontainingrow:not(.unreadMessageContainingRow)");
            }
            if (whom === "unread") {
                rows = self.$el.find(".unreadMessageContainingRow.messagecontainingrow");
            }
            if (rows !== null && rows !== undefined) {
                rows.each(function() {
                    var $checkbox = $CQ(this).find("[name = 'mailCheckbox']");
                    if ($checkbox[0].checked !== doSelect) {
                        $checkbox[0].checked = doSelect;
                        $checkbox.change();
                    }
                });
            }
        },

        toggleSelectAll: function(whom) {
            var self = this;
            if (whom === "all") {
                self.toggleSelect(true, "");
            } else if (whom === "none") {
                self.toggleSelect(false, "");
            } else if (whom === "read") {
                self.toggleSelect(false, "");
                self.toggleSelect(true, whom);
            } else if (whom === "unread") {
                self.toggleSelect(false, "");
                self.toggleSelect(true, whom);
            }
            return false;
        },

        removeStatusParam: function() {
            if (window.location.href.indexOf("messageSent") > -1) {
                window.history.pushState("", document.title,
                    window.location.href.replace(/([\&]*messageSent=)[^\&]+/, ""));
            }
        },

        showNotification: function() {
            var $crossLink = this.$el.find(".hideAlert");
            var $notificationContainer;
            var $image;
            if ($crossLink.size() <= 0) {
                return;
            }
            $notificationContainer = $crossLink.closest(".notificationContainer");
            $crossLink.click(function() {
                $notificationContainer.hide();
            });
            $image = $notificationContainer.find(".notificationImage");
            if ($image.hasClass("check")) {
                $image.attr("src", "/etc.clientlibs/clientlibs/social/hbs/messaging/resources/check.png");
            } else if ($image.hasClass("exclamation")) {
                $image.attr("src", "/etc.clientlibs/clientlibs/social/hbs/messaging/resources/exclamation.png");
            }
            window.setTimeout(function() {
                var selector = ".fullsize-status-template";
                $notificationContainer.hide();
                if ($CQ.browser.msie && $CQ.browser.version <= 9) {
                    window.location.href = window.location.href.replace(selector, "");
                }
            }, 5000);
        },

        removeStatusSelector: function() {
            var selector = ".fullsize-status-template";
            if (window.location.href.indexOf(selector) > -1) {
                window.history.pushState("", document.title, window.location.href.replace(selector, ""));
            }
        }
    });

    var Message = SCF.Model.extend({
        modelName: "MessageModel",

        relationships: {
            "items": {
                collection: "MessageList",
                model: "MessageModel"
            }
        }
    });

    var MessageView = SCF.View.extend({
        viewName: "MessageView",

        init: function() {
            this.render();
        },

        render: function() {
            this.initSubject();
            this.initSender();
            this.initTimestampAndUnreadCircle();
            this.initUnreadMessage();
        },

        events: {
            "click .showdetailview": function(e) {
                var target = e.currentTarget;
                var messageID = this.model.get("messageID");
                var messagePath = this.model.get("id");
                var messageBoxRelativePath = this.model.get("messageBoxRelativePath");
                e.stopPropagation();

                Backbone.trigger("messageClick", {
                    messagePath: messagePath,
                    messageBoxRelativePath: messageBoxRelativePath,
                    messageID: messageID,
                    target: target
                });
            }
        },

        initSubject: function() {
            var $subMessagesSubject = this.$el.find(".subMessagesSubject");
            var maxLength = 87;
            var remainingLength = maxLength;
            var content = this.model.get("message");
            var subject = this.model.get("subject");
            var extension = "";
            subject = subject ? subject : CQ.I18n.get("No Subject");
            content = content ? content : CQ.I18n.get("No Content");
            extension = (subject + content).length > maxLength + 3 ? "..." : "";
            subject = subject.length > maxLength ? subject.substring(0, maxLength) : subject;
            remainingLength = maxLength - subject.length;
            content = (content.length > remainingLength ? content.substring(0, remainingLength) : content) +
                extension;
            $subMessagesSubject.find(".subjectString").html(subject);
            $subMessagesSubject.find(".contentString").html(content);
        },

        initSender: function() {
            var $displayUserType = $CQ(".parentmessagediv [name=displayUserType]");
            var $subMessageSender = this.$el.find(".subMessagesDiv .subMessagesSender");
            var $recipients;
            var displayString = "";

            if ($displayUserType && $displayUserType.val() === "Sender") {
                $subMessageSender.html(this.model.get("sender").name);
            } else if ($displayUserType && $displayUserType.val() === "Recipients") {
                $recipients = this.model.get("recipients");
                if ($recipients.length > 0) {
                    displayString = $recipients[0].name;
                }
                if ($recipients.length > 1) {
                    displayString += "; ...";
                }
                $subMessageSender.html(displayString);
            }
        },

        initTimestampAndUnreadCircle: function() {
            var dateFormatPatterns = $CQ(".parentmessagediv [name=dateFormatPatterns]").val();
            var $timestampAndUnreadCircle = this.$el.find(".timestampAndUnreadCircle");
            var $timestampHolder = $timestampAndUnreadCircle.find(".timestamp");
            var calendar = this.model.get("timestamp");
            var locale;
            var regex;
            var localeTimestamp;
            if (calendar && dateFormatPatterns) {
                locale = CQ.I18n.getLocale();
                regex = new RegExp(locale + "=([^,]+)");
                localeTimestamp = dateFormatPatterns.match(regex);
                localeTimestamp = localeTimestamp && localeTimestamp.length >= 2 ?
                    localeTimestamp[1] : "MMM-DD hh:mm a";
                if (localeTimestamp) {
                    $timestampHolder.html(moment(new Date(parseInt(calendar, 10))).format(localeTimestamp));
                }
            }
        },

        initUnreadMessage: function() {
            var $subMessageColumn = this.$el.find(".subMessageColumn");
            var row = $CQ($subMessageColumn[0]).closest(".messagecontainingrow")[0];
            var containingRow = $CQ(row);
            var isMessageRead = this.model.get("read");
            if (isMessageRead) {
                $subMessageColumn.removeClass("unreadmessage");
                containingRow.removeClass("unreadMessageContainingRow");
                $CQ(containingRow.find(".unreadCircle")[0]).removeClass("circleBackgroundImage");
            } else {
                $subMessageColumn.addClass("unreadmessage");
                containingRow.addClass("unreadMessageContainingRow");
                $CQ(containingRow.find(".unreadCircle")[0]).addClass("circleBackgroundImage");
            }
        }
    });

    var MessageList = SCF.Collection.extend({
        collectioName: "MessageList",
        model: "Message"
    });

    SCF.MessageBoxView = MessageBoxView;
    SCF.MessageView = MessageView;
    SCF.MessageBox = MessageBox;
    SCF.Message = Message;
    SCF.MessageList = MessageList;

    SCF.registerComponent("social/messaging/components/hbs/messagebox", SCF.MessageBox, SCF.MessageBoxView);
    SCF.registerComponent("social/messaging/components/hbs/message", SCF.Message, SCF.MessageView);

})($CQ, _, Backbone, SCF);
