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

    var ComposeMessage = SCF.Model.extend({
        modelName: "ComposeMessageModel"
    });

    var ComposeMessageView = SCF.View.extend({
        view: "ComposeMessage",

        init: function() {
            this.render();
        },

        render: function() {
            this.initForMessage();
            this.initDateFormatPatterns();
            this.initAvatar();
        },

        events: {
            "click input#sendMail.sendButton": function(e) {
                var that = this;
                e.preventDefault();
                var error = _.bind(function(err) {
                    that.showError(err);
                }, this);
                var success = _.bind(function() {
                    var properties = that.model.get("properties");
                    window.location.href = properties.redirectURL;
                }, this);

                this.hideError();
                if (this.prepareMessage(e)) {
                    this.doPost(success, error);
                }
            },
            "click input#cancelMail.cancelNewMessage": function() {
                window.location = this.model.get("properties").cancelURL;
            }
        },

        initForMessage: function() {
            /*jshint maxcomplexity:false */
            var properties = this.model.get("properties");
            var formData = this.model.get("formData");
            var replyAll = this.model.get("replyAll");
            var toBeForwarded = this.model.get("toBeForwarded");
            var message = this.model.get("message");
            var fwdString = CQ.I18n.get("Fwd") + ": ";
            var forwardMessageString = CQ.I18n.get("Forwarded Message ");
            var onString = CQ.I18n.get("On ");
            var wroteString = CQ.I18n.get(" wrote");
            var reString = CQ.I18n.get("Re") + ": ";
            var allRecipientNames = "";
            var allRecipientIds = "";
            var subjectString = "";
            var bodyString = "";
            var toNames = "";
            var to = "";
            var attachmentPaths = "";
            var i;
            var recipient;
            var recipients = {};
            var attachment;
            var formEntry;
            var urlParams;
            var match;
            var pl;
            var search;
            var decode;
            var query;
            var topath;
            var toName;

            $CQ(".composemessage").parent().attr("enctype", "multipart/form-data")
                .attr("action", $CQ("#redirectURL").val());

            if (message) {
                if (toBeForwarded) {
                    subjectString = fwdString + message.subject;
                    bodyString = "<br><br>-------- " + forwardMessageString + " --------- <br><br>" + onString +
                        moment(new Date(message.timestamp)).format(
                            "DD MMM YYYY hh:mm a") + ", " + message.sender.name + " " + wroteString +
                        ":<br>------------<br>";
                } else {
                    subjectString = reString + message.subject;
                    bodyString = "<br><br>" + onString + moment(
                            new Date(message.timestamp)).format("DD MMM YYYY hh:mm a") + ", " + message.sender.name +
                        " " + wroteString + ":<br>------------<br>";
                }

                if (!properties.withRTE || String(properties.withRTE) === "false") {
                    bodyString = bodyString.replace(/<br>/g, "\n");
                }

                bodyString += message.message;
                for (i = 0; i < message.recipients.length; i++) {
                    recipient = message.recipients[i];
                    allRecipientNames += recipient.name + "; ";
                    allRecipientIds += recipient.id + ";";
                    recipients[recipient.id] = recipient;
                }

                if (allRecipientIds.length > 1) {
                    allRecipientIds = allRecipientIds.substring(
                        0, allRecipientIds.length - 1);
                }
                if (!toBeForwarded) {
                    if (replyAll) {
                        toNames = message.sender.name + "; " + allRecipientNames;
                        to = message.sender.id + ";" + allRecipientIds.replace(this.model.get("loggedInUser").id, "");
                    } else {
                        toNames = message.sender.name;
                        to = message.sender.id;
                    }
                    recipients[message.sender.id] = message.sender;
                }

                if (toBeForwarded && message.attachmentsList) {
                    for (i = 0; i < message.attachmentsList.length; i++) {
                        attachment = message.attachmentsList[i];
                        attachmentPaths += attachment.path + ";";
                    }
                }

                this.model.set({
                    "subjectString": subjectString,
                    "bodyString": bodyString,
                    "toNames": toNames,
                    "to": to,
                    "attachmentPaths": attachmentPaths,
                    "recipients": recipients
                });

                for (i = 0; i < formData.length; i++) {
                    formEntry = formData[i];
                    if (formEntry.elementID.indexOf(":") === -1 && $CQ("#" + formEntry.elementID) !== null) {
                        this.prefillComponents(formEntry.propertyName, formEntry.elementID, formEntry.value);
                    }
                    this.prefillComplexComponents(formEntry.propertyName, false);
                }
            } else {
                if (window.location.search) {
                    urlParams = {};
                    pl = /\+/g; // Regex for replacing addition symbol with a space
                    search = /([^&=]+)=?([^&]*)/g;
                    decode = function(s) {
                        return decodeURIComponent(s.replace(pl, " "));
                    };
                    query = window.location.search.substring(1);

                    while ((match = search.exec(query)) !== null) {
                        urlParams[decode(match[1])] = decode(match[2]);
                    }

                    topath = urlParams.topath;
                    toName = urlParams.toname;

                    this.model.set({
                        "to": topath,
                        "toNames": toName
                    });
                    this.prefillComplexComponents("recipientNames_ts", false);
                }
            }
        },

        initDateFormatPatterns: function() {
            var properties = this.model.get("properties");
            var dateFormatPatterns = properties.dateFormatPatterns;
            var locale;
            var regex;
            var localeTimestamp;

            if (dateFormatPatterns) {
                locale = CQ.I18n.getLocale();
                moment.locale(CQ.shared.I18n.getLocale());
                var regex = new RegExp(locale + "=([^,]+)");
                var localeTimestamp = dateFormatPatterns.toString().match(regex);
                localeTimestamp = localeTimestamp && localeTimestamp.length >= 2 ? localeTimestamp[1] :
                    "MMM-DD hh:mm a";
                this.$el.find(".newMessageContentContainer .newMessageSendDate").html(moment(new Date())
                    .format(localeTimestamp));
            }
        },

        initAvatar: function() {
            this.$el.find(".newMessageSenderAvatar").css("background-image", "url('" +
                this.model.get("loggedInUser").avatarUrl + "')");
        },

        isValidMessage: function(showAlert) {
            /*jshint maxcomplexity:false */
            var properties = this.model.get("properties");
            var subjectLengthExceeded = CQ.I18n.get("Message subject character limit exceeded");
            var bodyLengthExceeded = CQ.I18n.get("Message body character limit exceeded");
            var noRecipientSelected = CQ.I18n.get("No recipient selected. Please select a recipient");
            var messageSubjectElement = $CQ("[name=subject]");
            var messageBodyElement = $CQ("[name=content]");
            var messageSubject;
            var messageBody;

            if (properties && properties.withRTE) {
                $("[name=content]").val(this.getField("message"));
            }

            if (messageSubjectElement === null || messageSubjectElement === undefined ||
                messageBodyElement === null || messageBodyElement === undefined) {
                return true;
            }
            messageSubject = messageSubjectElement.val();
            messageBody = messageBodyElement.val();
            if ($CQ("#toValue").children().length === 0) {
                if (showAlert) {
                    this.showError({
                        details: {
                            status: {
                                message: noRecipientSelected
                            }
                        }
                    });
                }
                return false;
            }
            if (this.model.get("properties").maximumSubjectLength < messageSubject.length) {
                if (showAlert) {
                    this.showError({
                        details: {
                            status: {
                                message: subjectLengthExceeded
                            }
                        }
                    });
                }
                return false;
            }
            if (this.model.get("properties").maximumBodyLength < messageBody.length) {
                if (showAlert) {
                    this.showError({
                        details: {
                            status: {
                                message: bodyLengthExceeded
                            }
                        }
                    });
                }
                return false;
            }
            return true;
        },

        prepareMessage: function(e) {
            var sendingMsg = CQ.I18n.get("Sending") + "...";
            if (!this.isValidMessage(true)) {
                e.preventDefault();
                return false;
            }

            this.$el.find("input#sendMail.sendButton").val(sendingMsg);
            this.$el.find("input#attachmentPaths").val(this.model.get("attachmentPaths"));
            $(".scf-composer-toolbar").hide();
            return true;
        },

        prefillComponents: function(propName, propId, propValue) {
            var properties = this.model.get("properties");
            var listElement = document.getElementById(propId);
            var selections;
            var i;
            if (!listElement) {
                listElement = document.getElementsByName(propName)[0];
            }
            if (listElement) {
                if (listElement.type === "radio" || listElement.type === "checkbox") {
                    selections = document.getElementsByName(propName);
                    for (i = 0; i < selections.length; i++) {
                        if (selections[i].value === propValue) {
                            selections[i].checked = true;
                        } else {
                            selections[i].checked = false;
                        }
                    }
                } else {
                    if (listElement.type === "textarea") {
                        if (properties && properties.withRTE) {
                            listElement.value = $CQ("<div/>").html(propValue).html();
                        } else {
                            listElement.value = $CQ("<div/>").html(this.replaceAll("\\\\n", "\n", propValue)).text();
                        }
                    } else {
                        listElement.value = propValue;
                    }
                }
            }
        },

        prefillComplexComponents: function(propName, isReadOnly) {
            var properties = this.model.get("properties");
            var retVal = false;
            var i;
            var ids;
            var names;
            var recipients;

            if (propName === "jcr:title" && $CQ("[name=subject]")) {
                $CQ("[name=subject]").val($CQ("<div/>")
                    .html(this.replaceAll("\\\\n", "\n", this.model.get("subjectString"))).text());
                retVal = !retVal;
            } else if (propName === "jcr:description" && $CQ("[name=content]")) {
                if (properties && properties.withRTE) {
                    $CQ("[name=content]").val($CQ("<div/>").html(this.model.get("bodyString")).html());
                } else {
                    $CQ("[name=content]").val($CQ("<div/>").html(this.replaceAll("\\\\n", "\n", this.model.get("bodyString"))).text());
                }
                retVal = !retVal;
            }
            if (propName === "recipientNames_ts") {
                if (document.getElementsByName("to")) {
                    ids = this.model.get("to").split(";");
                    names = this.model.get("toNames").replace("[", "").replace("]", "").split("; ");
                    recipients = this.model.get("recipients");

                    for (i = 0; i < ids.length; i++) {
                        if (ids[i].trim().length > 0) {
                            Backbone.trigger("selectThisUser", {
                                componentName: "to",
                                dispObject: null,
                                id: ids[i].trim(),
                                name: names[i].trim(),
                                avatarUrl: recipients[ids[i].trim()].avatarUrl,
                                profileURL: recipients[ids[i].trim()].profileUrl,
                                readOnly: !isReadOnly
                            });
                        }
                    }
                }
                retVal = !retVal;

            } else if (propName === "sender_t") {
                if (document.getElementsByName("from").length > 0) {
                    Backbone.trigger("selectThisUser", {
                        componentName: "from",
                        dispObject: null,
                        id: this.model.senderId,
                        name: this.model.senderName,
                        avatarUrl: "",
                        profileURL: "",
                        readOnly: !isReadOnly
                    });
                }
                retVal = !retVal;
            }
            return retVal;
        },

        replaceAll: function(find, replace, str) {
            return str.replace(new RegExp(find, "g"), replace);
        },

        openAttachmentDialog: function(e) {
            if (SCF.Util.mayCall(e, "preventDefault")) {
                e.preventDefault();
            }
            this.$el.find("input[type='file']").first().click();
        },

        renderAttachmentList: function(e) {
            var attachments = $CQ(".scf-js-composer-att");
            var attachment;
            var i;
            var f;
            e.preventDefault();
            this.files = e.target.files;
            attachments.empty();
            // files is a FileList of File objects. List some properties.
            for (i = 0; i < this.files.length; i++) {
                f = this.files[i];
                attachment = $CQ("<li class=\"scf-is-attached scf-message-attachment\">" + _.escape(f.name) +
                    " - " + f.size + " bytes</li>");
                attachments.append(attachment);
            }
        },

        doPost: function(success, error) {

            var postData,
                formData;
            if (window.FormData) {
                //postData = new window.FormData($CQ(".scf-messaging-compose form")[0]);
                var postData = new FormData();
                var inputParams = $CQ(".scf-messaging-compose :input");

                $CQ(".scf-messaging-compose :input").each(function(e) {
                    var inputElName = $CQ(this).attr("name");
                    var inputElVal;
                    if (inputElName) {
                        if (!this.files) {
                            inputElVal = $CQ(this).val();
                            if (inputElVal) {
                                postData.append(inputElName, inputElVal);
                            }
                        } else {
                            inputElVal = this.files;
                            for (var i = 0; i < inputElVal.length; i++) {
                                postData.append(inputElName, inputElVal[i]);
                            }
                        }
                    }
                });
            }
            if (postData) {
                postData.append("to", $CQ("#toName").val());

                $CQ.ajax(SCF.config.urlRoot + this.model.get("id") + SCF.constants.URL_EXT, {
                    dataType: "json",
                    type: "POST",
                    processData: false,
                    contentType: false,
                    xhrFields: {
                        withCredentials: true
                    },
                    data: this.model.addEncoding(postData),
                    "success": success,
                    "error": error
                });
            }
        },
        showError: function(error) {
            var targetArea = null;
            if (error.status == 401) {
                var siteLink = $($(".scf-js-site-title")[0]).attr("href");
                window.location.href = "http://" + location.host + siteLink.replace(".html", "/signin.html");
            } else {
                if (!error || !error.details || !error.details.status || !error.details.status.message) {
                    error = error || {};
                    error.details = error.details || {};
                    error.details.status = error.details.status || {};
                    error.details.status.message = CQ.I18n.get("Unknown Error.");
                }
                targetArea = this.$el.parent().parent();
                targetArea.addClass("scf-error");
                this.addErrorMessage(targetArea, error);
                this.log.error(error);
            }
        },
        hideError: function() {
            this.clearErrorMessages();
            this.$el.parent().parent().removeClass("scf-error");
            this.$el.parent().parent().parent().find(".scf-js-error-message").remove();
        }
    });

    SCF.ComposeMessageView = ComposeMessageView;
    SCF.ComposeMessage = ComposeMessage;
    SCF.registerComponent("social/messaging/components/hbs/composemessage", SCF.ComposeMessage,
        SCF.ComposeMessageView);

})($CQ, _, Backbone, SCF);
