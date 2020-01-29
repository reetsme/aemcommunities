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
    var UserProfile = SCF.Model.extend({
        modelName: "UserProfileModel",
        UPDATE_OPERATION: "social:updateUserProfile",
        CHANGE_PASSWORD_OPERATION: "social:changePassword",
        CHANGE_AVATAR_OPERATION: "social:changeAvatar",
        events: {
            UPDATED: "userprofile:updated",
            UPDATE_ERROR: "userprofile:updateError",
            PASSWORD_UPDATED: "password:updated",
            PASSWORD_UPDATE_ERROR: "password:updateError",
            AVATAR_UPDATED: "avatar:updated"
        },
        initialize: function() {
            var error = _.bind(function(jqxhr, text, error) {
                this.trigger(this.events.UPDATE_ERROR, {
                    "error": error
                });
            }, this);
            var success = _.bind(function(response) {
                this.set('languagelist', response.items);
            }, this);

            $CQ.ajax({
                type: "GET",
                url: SCF.config.urlRoot + "/libs/social/translation/languageOpts/languageMapping" + SCF.constants.URL_EXT + this.getSuffix(),
                dataType: "json",
                success: success,
                error: error
            });
        },
        saveEdits: function() {
            var error = _.bind(function(jqxhr, text, error) {
                this.trigger(this.events.UPDATE_ERROR, {
                    "error": error
                });
            }, this);
            var success = _.bind(function(response) {
                this.reload();
                /*
                this.set(response.response);
                this.trigger(this.events.UPDATED, {
                    model: this
                });
                */
            }, this);

            var postData = {
                "displayName": this.get("displayName"),
                "givenName": this.get("profileProperties").givenName,
                "familyName": this.get("profileProperties").familyName,
                "email": this.get("profileProperties").email,
                "gender": this.get("profileProperties").gender,
                "streetAddress": this.get("profileProperties").streetAddress,
                "city": this.get("profileProperties").city,
                "region": this.get("profileProperties").region,
                "language": this.get("profileProperties").language,
                "jobTitle": this.get("profileProperties").jobTitle,
                "url": this.get("profileProperties").url,
                "aboutMe": this.get("profileProperties").aboutMe,
                "smartRendering": this.get("profileProperties").smartRendering,
                ":operation": this.UPDATE_OPERATION
            };

            $CQ.ajax(SCF.config.urlRoot + this.get("id") + SCF.constants.URL_EXT + this.getSuffix(), {
                dataType: "json",
                type: "POST",
                xhrFields: {
                    withCredentials: true
                },
                data: this.addEncoding(postData),
                "success": success,
                "error": error
            });
        },
        changePassword: function(postData) {
            var error = _.bind(function(jqxhr, text, error) {
                this.trigger(this.events.PASSWORD_UPDATE_ERROR, this.parseServerError(jqxhr, text, error));
            }, this);
            var success = _.bind(function(response) {
                this.set(response.response);
                this.trigger(this.events.PASSWORD_UPDATED, {
                    model: this
                });
            }, this);

            postData[":operation"] = this.CHANGE_PASSWORD_OPERATION;

            $CQ.ajax(SCF.config.urlRoot + this.get("id") + SCF.constants.URL_EXT + this.getSuffix(), {
                dataType: "json",
                type: "POST",
                xhrFields: {
                    withCredentials: true
                },
                data: this.addEncoding(postData),
                "success": success,
                "error": error
            });
        },
        getSuffix: function() {
            //get suffix if any
            var suffix = "";
            var index = document.location.href.lastIndexOf(".html");
            if (index > 0) {
                suffix = document.location.href.substring(index + 5);
            }
            return suffix;
        },
        changeAvatar: function(file) {
            var error = _.bind(function(jqxhr, text, error) {
                this.trigger(this.events.UPDATE_ERROR, {
                    "error": error
                });
            }, this);
            var success = _.bind(function(response) {
                this.set(response.response);
                this.trigger(this.events.AVATAR_UPDATED, {
                    model: this
                });
            }, this);

            //Create a formdata object and add the files
            var postData;
            if (window.FormData) {
                postData = new window.FormData();
            }

            if (postData) {
                postData.append(":operation", this.CHANGE_AVATAR_OPERATION);
                postData.append("file", file, "profile.png");
            }

            $CQ.ajax(SCF.config.urlRoot + this.get("id") + SCF.constants.URL_EXT + this.getSuffix(), {
                dataType: "json",
                type: "POST",
                processData: false,
                contentType: false,
                xhrFields: {
                    withCredentials: true
                },
                data: this.addEncoding(postData),
                "success": success,
                "error": error
            });
        }
    });

    var UserProfileView = SCF.View.extend({
        viewName: "UserProfile",
        tagName: "div",
        className: "userProfile",
        profileProperties: {},
        avatarUploadModalSel: ".scf-js-avatar-box", // selector for upload dialog container
        maxAvatarSize: 5000000, // default max uploadeded image size in bytes if not configured
        emailVerificationMessage: CQ.I18n.get("Your new email address is being verified"),
        init: function() {
            this.listenTo(this.model, this.model.events.AVATAR_UPDATED, this.avatarUpdate);
            this.listenTo(this.model, this.model.events.PASSWORD_UPDATED, this.passwordUpdate);
            this.listenTo(this.model, this.model.events.PASSWORD_UPDATE_ERROR, this.showPasswordUpdateError);
            var url = SCF.config.urlRoot + this.model.get("id") + SCF.constants.URL_EXT + this.model.getSuffix();

            $("form[role=\"form\"]").each(function(idx, element) {
                $(element).attr("action", url);
                element.action = url;
            });

            this.profileProperties = this.model.get("properties");

            // max uploadeded image size in bytes
            if (this.profileProperties.maxAvatarUploadSize) {
                this.maxAvatarSize = this.profileProperties.maxAvatarUploadSize;
            }
            this.checkEmailVerification();
        },
        render: function() {
            SCF.CommentSystemView.prototype.render.apply(this);
            this.checkEmailVerification();
        },
        avatarUpdate: function() {
            var canvasSupported = !!window.HTMLCanvasElement;
            if (canvasSupported) {
                var image = this.$el.find(".scf-profile-avatar")[0];
                var base64String = window.btoa(String.fromCharCode.apply(null, this.model.blob));
                image.src = "data:image/png;base64," + base64String;
                delete this.model.blob;
            }
        },
        passwordUpdate: function() {
            this._closeModal();
            this._closeModal = undefined;
            var msgBox = this.$el.find(".scf-js-password-success")[0];
            msgBox.style.display = "";
            setTimeout(function() {
                var msgBox = $.find(".scf-js-password-success")[0];
                msgBox.style.display = "none";
            }, 3000);

        },
        showPasswordUpdateError: function(error) {
            var _parentEl = $CQ(".scf-password-form")[0];
            if (_parentEl === null) {
                _parentEl = $CQ(document.body);
            }
            $CQ("<div class=\"scf-password-error\"><h3 class=\"scf-js-error-message\">" + error.error + "</h3><div>").prependTo(_parentEl);
            this.log.error(error);
        },
        handleTab: function(e) {
            e.preventDefault();
            if ($(e.target.parentElement).hasClass("active")) {
                return;
            }
            var navTabs = this.$el.find(".nav-tabs");
            navTabs.find("li").removeClass("active");
            var tabContent = this.$el.find(".scf-tab-content");
            tabContent.find($(e.currentTarget).attr("href")).addClass("active");
        },
        // adds boostrap warning bg color and appends a container with warning text
        // which may need to be positioned or styled using selector ".scf-inline-warning-text"
        addInlineWarning: function(fieldSel, warningText) {
            $CQ(fieldSel).addClass("bg-warning").append("<div class=\"text-danger scf-inline-warning-text\">" + warningText + "</div>");
        },
        checkEmailVerification: function() {
            // presence of social:emailVerified means new email was entered at some point
            // its value is verification expiration timestamp if timestamp is not expired - add warning
            if (this.model.get("profileProperties")["social:emailVerified"]) {
                var date = new Date();
                date = date.getTime();
                if (this.model.get("profileProperties")["social:emailVerified"] > date) {
                    this.addInlineWarning(".scf-profile-email-label-container", this.emailVerificationMessage);
                }
            }
        },
        toggleComposer: function(e) {
            var composer = this.$el.find(".scf-js-composer-block");
            composer.toggleClass("scf-is-collapsed");
            this.$el.find(".scf-js-profile-edit").toggleClass("scf-is-collapsed");
            if (composer.is(":visible")) {
                composer.find("input[type=\"text\"]")[0].focus();
            }

            var selectComp = this.$el.find("#scf-gender-list")[0];
            if (this.model.get("profileProperties").gender) {
                selectComp.value = this.model.get("profileProperties").gender;
            } else {
                selectComp.value = "";
            }

            var selectRendering = this.$el.find("#scf-smartRendering-list")[0];
            if (this.model.get("profileProperties").smartRendering) {
                selectRendering.value = this.model.get("profileProperties").smartRendering;
            } else {
                selectRendering.value = "";
            }

            var languages = this.model.get('languagelist');
            var previousselection = this.model.get("profileProperties").language;
            for (var i = 0; i < languages.length; i++) {
                var newOption = $("<option />");
                $("#scf-userlanguage-list").append(newOption);
                newOption.val(languages[i].languageCode);
                newOption.html(CQ.I18n.get(languages[i].languageName));
                if (languages[i].languageCode === previousselection) {
                    $("#scf-userlanguage-list option:contains(" + CQ.I18n.get(languages[i].languageName) + ")").attr('selected', true);
                }
            }
            //call proto:
            SCF.CommentSystemView.prototype.toggleComposer.apply(this, [e]);
        },
        translate: function() {
            this.model.translate();
        },
        hideTranslation: function() {
            this.model.set({
                showingTranslation: false
            });
        },
        previewImages: function(e) {
            //remove previous error alert if any within upload dialog
            $CQ(this.avatarUploadModalSel).find(".alert-danger").remove();
            //validate file size and type
            var uploadEl = e.currentTarget;

            if (uploadEl.files[0].type.indexOf("image") === -1) {
                $CQ("<div class=\"alert alert-danger\" role=\"alert\">" +
                    CQ.I18n.get("Only image files are allowed.") +
                    "</div>").prependTo($CQ(this.avatarUploadModalSel));
                return false;
            }

            if (uploadEl.files[0].size > this.maxAvatarSize) {
                $CQ("<div class=\"alert alert-danger alert-dismissible\" role=\"alert\">" +
                    CQ.I18n.get("File size is over ") +
                    this.maxAvatarSize +
                    CQ.I18n.get(" bytes.") + "</div>").prependTo($CQ(this.avatarUploadModalSel));
                return false;
            }

            $("#change-avatar-submit").get(0).disabled = false;

            var canvasSupported = !!window.HTMLCanvasElement;
            if (!canvasSupported) {
                var _imageText = $("#imgUploadText").get(0);
                _imageText.innerHTML = $("#imgUploadImage").get(0).value;
                return;
            }

            function cropImage(image, scale, canvas) {
                var deltaX = 0;
                var deltaY = 0;
                var destHeight = canvas.clientHeight;
                var destWidth = canvas.clientWidth;
                canvas.width = destWidth;
                canvas.height = destHeight;

                var sourceWidth = image.width;
                var sourceHeight = image.height;
                var ratio = sourceWidth / sourceHeight;
                var cropWidth = image.width * (scale - 1);
                var cropHeight = image.height * (scale - 1);
                if (sourceWidth > sourceHeight) {
                    if (scale == 1) {
                        deltaX = 0;
                        deltaY = destHeight * (1 - 1 / ratio) / 2;
                        destHeight = destHeight - 2 * deltaY;
                        cropHeight = cropHeight / ratio;
                    } else {
                        var newW = sourceWidth - cropWidth * 2;
                        if (newW > sourceHeight) {
                            cropHeight = 0;
                            deltaY = destHeight * (1 - sourceHeight / newW) / 2;
                            destHeight = destHeight - 2 * deltaY;
                        } else {
                            cropHeight = (sourceHeight - newW) / 2;
                            deltaY = 0;
                        }
                        deltaX = 0;
                    }
                } else if (sourceWidth < sourceHeight) {
                    if (scale == 1) {
                        deltaX = destWidth * (1 - ratio) / 2;
                        deltaY = 0;
                        destWidth = destWidth - 2 * deltaX;
                        cropWidth = cropWidth * ratio;
                    } else {
                        var newH = sourceHeight - cropHeight * 2;
                        if (newH > sourceWidth) {
                            cropWidth = 0;
                            deltaX = destWidth * (1 - sourceWidth / newH) / 2;
                            destWidth = destWidth - 2 * deltaX;
                        } else {
                            cropWidth = (sourceWidth - newH) / 2;
                            deltaX = 0;
                        }
                        deltaY = 0;
                    }
                }
                sourceWidth = image.width - cropWidth * 2;
                sourceHeight = image.height - cropHeight * 2;

                canvas.getContext("2d").drawImage(image, cropWidth, cropHeight, sourceWidth, sourceHeight, deltaX, deltaY, destWidth, destHeight);
            }

            $("input:radio[name=\"cropOption\"]").get(0).checked = true;
            //preview #1
            var _fr = new FileReader();
            var _image = new Image();

            _fr.readAsDataURL($("#imgUploadImage").get(0).files[0]);

            _fr.onload = function(e) {
                var _targRes = e.target.result;
                _image.src = _targRes;
                _image.onload = function(evt) {
                    var canvas = $("#imgUploadPreview1").get(0);
                    var source = evt.target;
                    cropImage(source, 1, canvas);
                };
            };

            //preview #2
            var _fr2 = new FileReader();
            var _image2 = new Image();

            _fr2.readAsDataURL($("#imgUploadImage").get(0).files[0]);

            _fr2.onload = function(e) {
                var _targRes = e.target.result;
                _image2.src = _targRes;
                _image2.onload = function(evt) {
                    // draw cropped image
                    var canvas = $("#imgUploadPreview2").get(0);
                    var source = evt.target;
                    cropImage(source, 1.1, canvas);
                };
            };

            //preview #3
            var _fr3 = new FileReader();
            var _image3 = new Image();

            _fr3.readAsDataURL($("#imgUploadImage").get(0).files[0]);

            _fr3.onload = function(e) {
                var _targRes = e.target.result;
                _image3.src = _targRes;
                _image3.onload = function(evt) {
                    // draw cropped image
                    var canvas = $("#imgUploadPreview3").get(0);
                    var source = evt.target;
                    cropImage(source, 1.2, canvas);

                };
            };
        },
        showAvatarBox: function(e) {
            e.stopPropagation();
            var avatarBox = this.$el.find(this.avatarUploadModalSel);
            avatarBox.find("#change-avatar-submit")[0].disabled = true;
            var canvasSupported = !!window.HTMLCanvasElement;
            var canvas = null;
            if (canvasSupported) {
                //clear canvas
                canvas = $("#imgUploadPreview1").get(0);
                canvas.width = canvas.width;
                canvas = $("#imgUploadPreview2").get(0);
                canvas.width = canvas.width;
                canvas = $("#imgUploadPreview3").get(0);
                canvas.width = canvas.width;
            } else {
                if (avatarBox.find("#canvas-row").size() > 0) {
                    //replace canvas elements with image
                    canvas = avatarBox.find(".scf-form-row")[0];
                    var form = $(canvas).parent();
                    $(avatarBox.find("#canvas-row")).remove();
                    $CQ("<div class=\"row scf-form-row\"><span id=\"imgUploadText\"></span><div>").prependTo($CQ(form));
                }
            }
            var modalTitle = CQ.I18n.get("Edit Photo");
            this._closeModal = this.launchModal(avatarBox, modalTitle);
        },
        showPasswordBox: function(e) {
            e.stopPropagation();

            var passwordBox = this.$el.find(".scf-js-password-box");
            $(passwordBox).find("input[type=\"password\"]").val("");
            $(passwordBox).find(".scf-js-error-message").remove();
            $(passwordBox).find(".scf-error").removeClass("scf-error");
            var modalTitle = CQ.I18n.get("Change Password");
            this._closeModal = this.launchModal(passwordBox, modalTitle);
        },
        cancelAvatar: function(e) {
            e.stopPropagation();
            this._closeModal();
            this._closeModal = undefined;
        },
        update: function(e) {
            e.stopPropagation();
            var city_n_state = this.getField("city_n_state");
            var csArray = ["", ""];
            if (city_n_state !== "" && city_n_state.trim() != ",") {
                csArray = city_n_state.split(", ");
            }
            if (csArray.length == 1) {
                csArray[1] = "";
            }
            var data = {
                displayName: this.getField("displayName"),
                profileProperties: {
                    givenName: this.getField("fname"),
                    familyName: this.getField("lname"),
                    gender: this.getField("gender"),
                    email: (this.model.get("profileProperties").isSocialUser) ? this.model.get("profileProperties").email : this.getField("email"),
                    streetAddress: this.getField("address"),
                    city: csArray[0],
                    region: csArray[1],
                    language: this.getField("language"),
                    jobTitle: this.getField("jobTitle"),
                    url: this.getField("url"),
                    aboutMe: this.getField("aboutMe"),
                    smartRendering: this.getField("smartRendering")
                }
            };
            this.clearErrorMessages();
            this.model.set(data);
            this.model.saveEdits();
            return false;
        },
        changePassword: function(e) {
            e.stopPropagation();
            var passwordBox = $CQ.find(".scf-js-password-box")[0];
            $(passwordBox).find(".scf-js-error-message").remove();
            $(passwordBox).find(".scf-error").removeClass("scf-error");

            //validate new password
            var currentPwd = this.getField("currentPwd");
            var newPwd = this.getField("newPwd");
            var confirmPwd = this.getField("confirmPwd");
            var errorMsg = "";
            if (currentPwd === "") {
                errorMsg = CQ.I18n.get("You need to enter the Current Password.");
                $CQ("currentPwd").focus();

            } else if (newPwd === "") {
                errorMsg = CQ.I18n.get("You need to enter the New Password.");
                $CQ("newPwd").focus();

            } else if (confirmPwd === "") {
                errorMsg = CQ.I18n.get("You need to enter the Confirm New Password.");
                $CQ("confirmPwd").focus();

            } else if (newPwd != confirmPwd) {
                errorMsg = CQ.I18n.get("The Confirm New Password doesn't match.");
                $CQ("confirmPwd").focus();
            }

            if (errorMsg !== "") {
                //show error msg
                var _parentEl = $CQ(".scf-password-form")[0];
                if (_parentEl === null) {
                    _parentEl = $CQ(document.body);
                }
                $CQ("<div class=\"scf-password-error\"><h3 class=\"scf-js-error-message\">" + errorMsg + "</h3><div>").prependTo(_parentEl);
            } else {
                var data = {
                    currentPwd: this.getField("currentPwd"),
                    newPwd: this.getField("newPwd")
                };
                this.clearErrorMessages();
                this.model.changePassword(data);
            }
            return false;
        },
        changeAvatar: function(e) {
            e.stopPropagation();

            var file;
            var canvasSupported = !!window.HTMLCanvasElement;
            if (!canvasSupported) {
                file = $("#imgUploadImage").get(0).files[0];

            } else {

                var selected = $("input:radio[name=\"cropOption\"]:checked").val();
                var canvas;
                switch (selected) {
                    case "Crop b":
                        canvas = $("#imgUploadPreview2").get(0);
                        break;
                    case "Crop c":
                        canvas = $("#imgUploadPreview3").get(0);
                        break;
                    default:
                        canvas = $("#imgUploadPreview1").get(0);
                }

                var dataURL = canvas.toDataURL();
                var blobBin = atob(dataURL.split(",")[1]);
                var array = [];
                for (var i = 0; i < blobBin.length; i++) {
                    array.push(blobBin.charCodeAt(i));
                }
                var filetype = $("#imgUploadImage").get(0).files[0].type;
                var blob = new window.Uint8Array(array);
                file = new window.Blob([blob], {
                    type: filetype
                });

                this.model.blob = blob;
            }

            this.model.changeAvatar(file);
            this.clearErrorMessages();
            this._closeModal();
            this._closeModal = undefined;
            return false;
        }
    });

    SCF.UserProfile = UserProfile;
    SCF.UserProfileView = UserProfileView;
    SCF.registerComponent("social/console/components/hbs/userprofile", SCF.UserProfile, SCF.UserProfileView);

})($CQ, _, Backbone, SCF);
