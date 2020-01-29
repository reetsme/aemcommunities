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

(function(window, document, Enablement, EnablementUtils, Granite) {
    "use strict";
    var userSelectorBaseUrl = "/mnt/overlay/social/enablement/gui/components/ui" +
        "/searchabledropdownlist/userlist.social.0.10.json?type=simpleusers&fromPublisher=true&_charset_=utf-8";
    var assigneeSelectorBaseUrl = "/mnt/overlay/social/enablement/gui/components/ui" +
        "/searchabledropdownlist/userlist.social.0.10.json?type=allusersgroups&fromPublisher=true&_charset_=utf-8";
    var removedUsers = [];
    // Create the User value from JSON Object
    var getUserFromJSON = function(user) {
        return encodeURIComponent("{\"userId\":\"" + user.authId + "\", \"userName\":\"" +
            user.authName + "\", \"userEmail\":\"" + user.authEmail + "\", \"userPath\":\"" +
            user.authPath + "\", \"userAvatarUrl\":\"" + user.authAvatarUrl + "\"}");
    };
    var LearningPathModel = SCF.Model.extend({
        modelName: "LearningPathModel"
    });
    var LearningPathView = SCF.View.extend({
        viewName: "LearningPathView"
    });

    EnablementUtils.editLearningPath = EnablementUtils.editLearningPath || {};
    EnablementUtils.editLearningPath.JSON = EnablementUtils.editLearningPath.JSON || {};

    SCF.LearningPathModel = LearningPathModel;
    SCF.LearningPathView = LearningPathView;
    SCF.registerComponent("social/enablement/components/hbs/admin/admin/createlearningpath", SCF.LearningPathModel,
        SCF.LearningPathView);
    // DOM related functionalities
    $(document).ready(function() {
        if ($.isEmptyObject(EnablementUtils.editLearningPath.JSON)) {
            var componentId =
                $("div[data-scf-component=\"social/enablement/components/hbs/admin/createlearningpath\"]")
                .data("componentId");
            var editSiteModel = $("script[type=\"application/json\"][id=\"" + componentId + "\"]");
            var modelText = $(editSiteModel[0]).text();
            SCFConsole.editSite.JSON = JSON.parse(modelText);
        }
        // Get the siteId and construct the URL for users
        var siteId = $(".dataSiteId").data("siteid");
        var groupId = $(".dataCommunityGroupId").data("groupid");
        // Find the context path from window location
        var urlWithoutContext = window.location.pathname;
        var length = urlWithoutContext.length;
        var index = urlWithoutContext.indexOf(".html");
        urlWithoutContext = urlWithoutContext.substring(index + 5, length);
        var url = Granite.HTTP.getContextPath() + urlWithoutContext;
        // Update the form action
        var $form = $("#form-wizard-dataform");
        $form.attr("action", url);
        // Update the cancel URL
        var $cancel = $(".scf-js-cancelbtn");
        var cancelLink = $cancel.prop("href");
        cancelLink = cancelLink + urlWithoutContext;
        $(".scf-js-cancelbtn").attr("href", cancelLink);
        // Enable the Next Tab Button
        var enableTabButton = function(reqdFieldEmpty, btn) {
            if (!reqdFieldEmpty) {
                $(btn).prop("disabled", false);
            } else {
                $(btn).prop("disabled", true);
            }
        };
        // If the ResourceName field is Empty, disable the Next button
        enableTabButton((_.isEmpty($(".scf-js-social-enablement-resourcename").val())),
            ".scj-js-detailstab-next");
        // Enable Next button if a contact is added
        $("#scf-js-social-enablement-contact .coral-TagList").on("itemadded", function() {
            enableTabButton(false, ".scj-js-settingstab-next");
        });
        // If user removes all Resource Contacts, disable the Next Button
        $("#scf-js-social-enablement-contact .coral-TagList").on("itemremoved", function() {
            var tagList = $("#scf-js-social-enablement-contact .js-coral-Autocomplete-tagList li");
            if (tagList.length === 0) {
                enableTabButton(true, ".scj-js-settingstab-next");
            } else {
                enableTabButton(false, ".scj-js-settingstab-next");
            }
        });
        // Edit Scenario - If the contact is already added, Enable the 'Next' Button
        enableTabButton((_.isEmpty($("#scf-js-social-enablement-contact").data("resource-contact"))),
            ".scj-js-settingstab-next");
        // Enabling the Next Button based on mandatory fields
        $(".scf-js-social-enablement-resourcename").on("input", function() {
            var resourceName = $(".scf-js-social-enablement-resourcename").val();
            enableTabButton(_.isEmpty(resourceName), ".scj-js-detailstab-next");
            // Add the Resource Name label beow the Image Upload
            $("#scf-js-rsc-label").text(resourceName);
        });
        // Show in Catalog
        $(".scf-js-show-in-catalog input[type=checkbox]").on("click", function() {
            if (this.checked) {
                // Warn about implications of catalog visibility
                var dialog = $("#scf-js-lp-catalog-dialog-warn")[0];
                if (dialog) {
                    dialog.show();
                }
            }
            $(".scf-js-show-in-catalog input[name='show-in-catalog']").val(this.checked);
        });
        // Enforce Order
        $(".scf-js-enforce-order").on("change", function() {
            var checkboxVal = this.checked;
            $(".scf-js-enforce-order input[name='enforce-order']").val(checkboxVal);
        });
        // Throbber
        var showWaitingBar = function(flag) {
            if (!flag) {
                $(".coral-Modal-backdrop").remove();
                $(".coral-Wait.coral-Wait--center.coral-Wait--large").remove();
            } else {
                var waitingBarModalBackDrop =
                    $(
                        "<div class='coral-Modal-backdrop' style='display: block;' aria-hidden='true'></div>"
                    );
                var waitingBar = $(
                    "<div class='coral-Wait coral-Wait--center coral-Wait--large'></div>"
                );
                $("body").append(waitingBarModalBackDrop);
                $("body").append(waitingBar);
            }
        };
        // Set a selector for each of the USer Selector (to be used in UI testcases)
        $("#scf-js-social-enablement-author .js-coral-Autocomplete-textfield")
            .addClass("scf-js-enablement-author-input");
        $("#scf-js-social-enablement-contact .js-coral-Autocomplete-textfield")
            .addClass("scf-js-enablement-contact-input");
        $("#scf-js-social-enablement-expert .js-coral-Autocomplete-textfield")
            .addClass("scf-js-enablement-expert-input");
        $("#scf-js-social-enablement-assignments .js-coral-Autocomplete-textfield")
            .addClass("scf-js-enablement-assignments-input");

        // Create the User value from User List
        var getUserVal = function(user) {
            return encodeURIComponent("{\"userId\":\"" + user.authorizableId + "\", \"userName\":\"" +
                user.name + "\", \"userEmail\":\"" + (user.emailId !== undefined ? user.emailId : "") +
                "\", \"userPath\":\"" + user.path + "\", \"userAvatarUrl\":\"" + user.avatarUrl + "\"}");
        };

        var scopeKey = "siteId";
        var scopeValue = siteId;

        /*
         * Async. populate user list :
         *  - when user types in the selector get users matching the query and populate user list
         */
        var populateUserSelector = function(e, currentNode, baseURL, nextBtnClassName) {
            if (e) {
                e.preventDefault();
            }
            var userSelector = currentNode + " .scf-js-userselector";
            var $userInput = $(userSelector + " input");
            var $selectListEl = $(userSelector + " .js-coral-Autocomplete-selectList");
            var selectList = $selectListEl.data("selectList");
            $selectListEl.html("");
            var query = $userInput.val();
            $.get(baseURL + "&" + scopeKey + "=" + scopeValue +
                "&filter=[{%22operation%22:%22CONTAINS%22,%22./@rep:principalName%22:%22" + query + "%22}," +
                "{%22operation%22:%22like%22,%22./@rep:principalName%22:%22" + query + "%22}," +
                "{%22operation%22:%22like%22,%22profile/@givenName%22:%22" + query + "%22}," +
                "{%22operation%22:%22like%22,%22profile/@familyName%22:%22" + query + "%22}]",
                function(response) {
                    $(response.items).each(function() {
                        var listObj = "<li class=\"js-userselector-item coral-SelectList-item " +
                            "coral-SelectList-item--option foundation-layout-flexmedia " +
                            "foundation-layout-flexmedia-middle\" data-value=\"" + getUserVal(this) +
                            "\" data-display=\"" + this.name +
                            "\"><div class=\"foundation-layout-flexmedia-bd\"><div " +
                            "class=\"foundation-layout-flexmedia-bd-singleline\">" + this.name +
                            "</div><div class=\"foundation-layout-flexmedia-bd-singleline " +
                            "foundation-layout-util-subtletext\">" + this.path + "</div></div></li>";
                        selectList.addOption($(listObj));
                    });
                    if (nextBtnClassName) {
                        $(currentNode + " ul.js-coral-Autocomplete-selectList li.js-userselector-item").
                        on("click", function() {
                            var tagList = $(currentNode + " .js-coral-Autocomplete-tagList");
                            if (tagList.length > 0) {
                                $(nextBtnClassName).prop("disabled", false);
                            }
                        });
                    }
                });
        };

        var populateUserSelectorTags = function(id, attrValue) {
            if (SCFConsole.editSite.JSON.authors) {
                var data;
                switch (attrValue) {
                    case "resource-author":
                        data = SCFConsole.editSite.JSON.authors.authorizables;
                        break;
                    case "resource-contact":
                        data = SCFConsole.editSite.JSON.contacts.authorizables;
                        break;
                    case "resource-expert":
                        data = SCFConsole.editSite.JSON.experts.authorizables;
                        break;
                    case "resource-assignees":
                        data = SCFConsole.editSite.JSON.assignees.authorizables;
                        break;
                }
                var $tag = $(id + " ul.coral-TagList.js-coral-Autocomplete-tagList");
                var usertags = $tag.data("tagList");
                if (usertags !== undefined && data !== undefined && data) {
                    for (var i = 0; i < data.length; i++) {
                        usertags.addItem({
                            "value": getUserFromJSON(data[i]),
                            "display": data[i].authName
                        });
                    }
                }
                if ($(id + " .coral-TagList").has(".coral-TagList-tag")) {
                    $(id + " .coral-TagList .coral-TagList-tag input[type=\"hidden\"]").attr("name", attrValue);
                }
            }
        };
        // Populate User Tags for Edit Workflow
        populateUserSelectorTags("#scf-js-social-enablement-author", "resource-author");
        populateUserSelectorTags("#scf-js-social-enablement-contact", "resource-contact");
        populateUserSelectorTags("#scf-js-social-enablement-expert", "resource-expert");
        populateUserSelectorTags("#scf-js-social-enablement-assignments", "resource-assignees");
        // Populate User List
        // Resource Author
        $("#scf-js-social-enablement-author input").on("input", function(e) {
            scopeKey = "siteId";
            scopeValue = siteId;
            populateUserSelector(e, "#scf-js-social-enablement-author", userSelectorBaseUrl);
        });
        $("#scf-js-social-enablement-author .js-coral-Autocomplete-toggleButton").on("click", function(e) {
            scopeKey = "siteId";
            scopeValue = siteId;
            populateUserSelector(e, "#scf-js-social-enablement-author", userSelectorBaseUrl, null);
        });
        // Resource Contact
        $("#scf-js-social-enablement-contact input").on("input", function(e) {
            scopeKey = "siteId";
            scopeValue = siteId;
            populateUserSelector(e, "#scf-js-social-enablement-contact", userSelectorBaseUrl);
        });
        $("#scf-js-social-enablement-contact .js-coral-Autocomplete-toggleButton").on("click", function(e) {
            scopeKey = "siteId";
            scopeValue = siteId;
            populateUserSelector(e, "#scf-js-social-enablement-contact", userSelectorBaseUrl,
                ".scj-js-settingstab-next");
        });
        $("#scf-js-social-enablement-contact .coral-TagList-tag-removeButton").on("click", function() {
            // Disable the Next button if no Contacts added
            var tagList = $("#scf-js-social-enablement-contact .js-coral-Autocomplete-tagList");
            enableTabButton((tagList.length > 0), ".scj-js-settingstab-next");
        });
        // Resource Expert
        $("#scf-js-social-enablement-expert input").on("input", function(e) {
            scopeKey = "siteId";
            scopeValue = siteId;
            populateUserSelector(e, "#scf-js-social-enablement-expert", userSelectorBaseUrl);
        });
        $("#scf-js-social-enablement-expert .js-coral-Autocomplete-toggleButton").on("click", function(e) {
            scopeKey = "siteId";
            scopeValue = siteId;
            populateUserSelector(e, "#scf-js-social-enablement-expert", userSelectorBaseUrl, null);
        });
        // Enrollees
        $("#scf-js-social-enablement-assignments input").on("input", function(e) {
            scopeKey = "siteId";
            scopeValue = siteId;
            if (!_.isNull(groupId) && groupId !== "") {
                scopeKey = "groupId";
                scopeValue = groupId;
            }
            populateUserSelector(e, "#scf-js-social-enablement-assignments", assigneeSelectorBaseUrl);
        });
        $("#scf-js-social-enablement-assignments .js-coral-Autocomplete-toggleButton").on("click", function(e) {
            scopeKey = "siteId";
            scopeValue = siteId;
            if (!_.isNull(groupId) && groupId !== "") {
                scopeKey = "groupId";
                scopeValue = groupId;
            }
            populateUserSelector(e, "#scf-js-social-enablement-assignments", assigneeSelectorBaseUrl, null);
        });
        var addLearnersDelta = function(learnersInputList, selectedLearners, item, deltaList) {
            var addedLearners = {};
            for (var i = 0; i < learnersInputList.length; i++) {
                var inp = learnersInputList[i];
                var kvp = JSON.parse(window.unescape(inp.value));
                addedLearners[kvp.userId] = (JSON.stringify(kvp));
            }
            if (addedLearners !== undefined && selectedLearners !== undefined) {
                for (var key in addedLearners) {
                    if (addedLearners.hasOwnProperty(key)) {
                        if (!(_.contains(selectedLearners, key))) {
                            item[key] = "+";
                        }
                    }
                }
                deltaList.push(item);
            }
        };
        var deleteLearnersDelta = function(learnersInputList, selectedLearners, item, deltaList) {
            var removedLearners = {};
            for (var j = 0; j < removedUsers.length; j++) {
                var input = removedUsers[j];
                var inpObj = JSON.parse(input);
                removedLearners[inpObj.userId] = input;
            }
            if (removedLearners !== undefined && selectedLearners !== undefined) {
                for (var k in removedLearners) {
                    if (removedLearners.hasOwnProperty(k)) {
                        if (_.contains(selectedLearners, k)) {
                            item[k] = "-";
                        }
                    }
                }
                deltaList.push(item);
            }
        };

        // Calculate the Delta List for learners
        // Eg: deltaList:{"administrators":"+","aem-users":"+"}
        var calculateDelta = function() {
            var deltaList = [];
            var selectedLearners = $("#scf-js-social-enablement-assignments").data("resource-assignees");
            selectedLearners = _.pluck(selectedLearners, "userId");
            var learnersInputList = $(".coral-TagList-tag input[name=\"resource-assignees\"]");
            if (selectedLearners.length > 0) {
                var item = {};
                // Delta for Added Learners
                addLearnersDelta(learnersInputList, selectedLearners, item, deltaList);
                // Delta for Removed Learners
                deleteLearnersDelta(learnersInputList, selectedLearners, item, deltaList);
                $("<input>").attr({
                    type: "hidden",
                    id: "deltaList",
                    name: "deltaList",
                    value: JSON.stringify(deltaList[0])
                }).appendTo($form);
            }
        };
        // Create the LP resources param
        var createLearningPathParam = function() {
            var lpResources = $(".scf-js-resource-item");
            var lpHiddenParamValue = [];
            for (var i = 0; i < lpResources.length; i++) {
                var resource = lpResources[i];
                var path = resource.dataset.path;
                lpHiddenParamValue.push({
                    "type": "linked-resource",
                    "path": path
                });
            }
            $("<input>").attr({
                type: "hidden",
                id: "resourcelist",
                name: "resourcelist",
                value: JSON.stringify(lpHiddenParamValue)
            }).appendTo($form);
        };
        // Create prerequisites param
        var createPrerequisitesParam = function() {
            var prereqHiddenParamValue = $(".coral-TagList coral-tag[name=\"lp-prerequisites\"]").map(function() {
                return this.value;
            });
            if (prereqHiddenParamValue.length > 0) {
                for (var i = 0; i < prereqHiddenParamValue.length; i++) {
                    var inputPrerequisite = prereqHiddenParamValue[i].replace(/\"/g, "");
                    $("<input>").attr({
                        type: "hidden",
                        id: "prerequisites",
                        name: "prerequisites",
                        value: inputPrerequisite
                    }).appendTo($form);
                }
            } else {
                $("<input>").attr({
                    type: "hidden",
                    id: "prerequisites",
                    name: "prerequisites",
                    value: ""
                }).appendTo($form);
            }
        };
        // Resource Create Function
        var submitForm = function() {
            calculateDelta();
            createLearningPathParam();
            createPrerequisitesParam();
            var $form = $("#form-wizard-dataform");
            var formData = EnablementUtils.serializeForm($form);
            showWaitingBar(true);
            $.ajax({
                type: $form.prop("method"),
                url: $form.prop("action"),
                data: formData
            }).done(function(html) {
                showWaitingBar(false);
                var redirectUrl = EnablementUtils.parseSlingPostServletResponse(html).location;
                var contextPath = Granite.HTTP.getContextPath();
                var length = redirectUrl.length;
                var index = redirectUrl.indexOf(contextPath);
                redirectUrl = redirectUrl.substring(index + contextPath.length, length);
                window.location.href = Granite.HTTP.getContextPath() +
                "/communities/learningpath-info.html" + redirectUrl;
            }).fail(function(xhr) {
                showWaitingBar(false);
                var errorDetails = EnablementUtils.parseSlingPostServletResponse(xhr.responseText);
                var code = errorDetails.status;
                var message = errorDetails.message;

                if (_.isEmpty(code)) {
                    code = "";
                }

                if (_.isEmpty(message)) {
                    message = CQ.I18n.get("Server Error Please try again");
                }
                $(".scf-enablement-erroralert .coral-Alert-title").text(CQ.I18n.get("Error"));
                $(".scf-enablement-erroralert .coral-Alert-message").text(code + " " + message);
                $(".scf-enablement-erroralert").show().delay(10000).fadeOut();
            });
        };

        $("#scf-js-social-enablement-assignments .coral-TagList-tag-removeButton").on("click", function(e) {
            var listObj = e.currentTarget.parentElement;
            var hiddenEle = $("." + listObj.className + " input[name=\"resource-assignees\"]");
            removedUsers.push(window.unescape(hiddenEle[0].value));
        });
        $("#cq-social-create-resource-submit").on("click", function(e) {
            e.preventDefault();
            submitForm();
        });
        // Add the param names for user lists
        $("#scf-js-social-enablement-author .coral-TagList").on("itemadded", function() {
            $(this).find(".coral-TagList-tag input[type=\"hidden\"]").attr("name", "resource-author");
        });
        $("#scf-js-social-enablement-contact .coral-TagList").on("itemadded", function() {
            $(this).find(".coral-TagList-tag input[type=\"hidden\"]").attr("name", "resource-contact");
        });
        $("#scf-js-social-enablement-expert .coral-TagList").on("itemadded", function() {
            $(this).find(".coral-TagList-tag input[type=\"hidden\"]").attr("name", "resource-expert");
        });
        $("#scf-js-social-enablement-assignments .coral-TagList").on("itemadded", function() {
            $(this).find(".coral-TagList-tag input[type=\"hidden\"]").attr("name", "resource-assignees");
        });
        // Image Upload
        var wrappingDiv = $(".newresourcecard");
        var thumbWrappingDiv = wrappingDiv.find(".thumbnail-action-wrapper");
        var articleElem = wrappingDiv.find("article");
        var errElem = wrappingDiv.find(".err");
        var rscAddThumbBtn = thumbWrappingDiv.find("#rsc-add-thumb-btn");
        var rscDelThumbBtn = thumbWrappingDiv.find("#rsc-del-thumb-btn");
        var defImage =
            "/etc.clientlibs/settings/wcm/designs/default/resources/" +
                "social/enablement/default_learningPath_card_image.png";
        var fieldName = articleElem.find("#field-name");

        var updateView = function() {
            var $img = $(".rsc-img");
            var val = $img.data("cardimage");
            if (val === "" || val === undefined) {
                rscDelThumbBtn.addClass("hidden");
                $img.removeClass("hidden");
                $img.css("background-image", "url(" + Granite.HTTP.getContextPath() + defImage + ")");
                rscAddThumbBtn.find("label").html(CQ.I18n.get("Add Image", null, "Short translations required"));
            } else {
                rscAddThumbBtn.find("label").html(CQ.I18n.get("Update Image", null, "Short translations required"));
                rscDelThumbBtn.removeClass("hidden");
                $img.css("background-image", "url(" + Granite.HTTP.getContextPath() + val +
                 "?cur_time=" + new Date().getMilliseconds() +
                    ")");
            }
        };

        var fileUploadSuccess = function(item) {
            var response = $.parseJSON(item.originalEvent.detail.item.responseText);
            var status = response.status;
            if (status.toLowerCase() === "ok") {
                var uploadedFileUrl = response.result["uploaded-path"];
                uploadedFileUrl += "/image";
                $(".rsc-img").data("cardimage", uploadedFileUrl);
                fieldName.val(uploadedFileUrl);
                updateView();
            } else {
                errElem.alert({
                    heading: "",
                    content: "Error uploading cover image.",
                    closable: true
                });
            }
        };

        $(rscAddThumbBtn)
            .off("coral-fileupload:loadend")
            .on("coral-fileupload:loadend", function() {
                articleElem.removeClass("busy");
            })
            .off("coral-fileupload:fileadded")
            .on("coral-fileupload:fileadded", function() {
                articleElem.addClass("busy");
            })
            .off("coral-fileupload:load")
            .on("coral-fileupload:load", function(e) {
                if (e.originalEvent.detail) {
                    fileUploadSuccess(e);
                }
            })
            .off("coral-fileupload:error")
            .on("coral-fileupload:error", function() {
                errElem.alert({
                    heading: "",
                    content: "Error uploading cover image.",
                    closable: true
                });
            });

        rscDelThumbBtn.click(function(e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            $(".rsc-img").data("cardimage", "");
            fieldName.val("");
            updateView();
        });
        updateView();

        // Changes for Prerequisites

        // Create the Prerquisite Object
        var createPrerequisiteObject = function(guuid, name, path) {
            return encodeURIComponent("{\"guuId\":\"" + guuid + "\", \"name\":\"" + name +
                "\", \"path\":\"" + path + "\"}");
        };

        var populateLearningPathSelectorTags = function(id, attrValue) {
            var data = $(id).data(attrValue);
            var $tag = $(id + " ul.coral-TagList.js-coral-Autocomplete-tagList");
            var prerequisitetags = $tag.data("tagList");
            if (prerequisitetags !== undefined && data !== undefined && data) {
                for (var i = 0; i < data.length; i++) {
                    prerequisitetags.addItem({
                        "value": createPrerequisiteObject(data[i].guuId, data[i].name, data[i].path),
                        "display": data[i].name
                    });
                }
            }
            if ($(id + " .coral-TagList").has(".coral-TagList-tag")) {
                $(id + " .coral-TagList .coral-TagList-tag input[type=\"hidden\"]").attr("name", attrValue);
            }
        };

        // Populate Prerequisite Tags for Edit Workflow
        populateLearningPathSelectorTags("#scf-js-social-enablement-lp-prerequisites", "lp-prerequisites");

        var assetBrowseMode = "";
        var assetPickerTab1 = $("iframe#assetpicker-tab1");
        $(".scf-js-browse").on("click", function(event) {
            if ($(event.currentTarget).hasClass("small-asset")) {
                assetBrowseMode = "small-asset";
            } else if ($(event.currentTarget).hasClass("large-asset")) {
                assetBrowseMode = "large-asset";
            } else if ($(event.currentTarget).hasClass("content-fragment-asset")) {
                assetBrowseMode = "content-fragment-asset";
            }
            var iframeSuffix = "/content/dam";
            assetPickerTab1.attr("src", Granite.HTTP.getContextPath() + "/aem/assetpicker.html?root=" +
                iframeSuffix);
            assetPickerTab1.css("display", "block");
        });

        /*jshint maxdepth: 6 */
        var processAssetPickerSelection = function(event) {
            // Security concern: Confirm that the event was actually sent by the
            // assetPicker window opened by us and not by any other window.
            if (event.source === document.getElementById("assetpicker-tab1").contentWindow) {
                var fromDam = JSON.parse(event.data);
                for (var i in fromDam.data) {
                    if (typeof fromDam.data[i] === "object") {
                        for (var prop in fromDam.data[i]) {
                            if (typeof prop === "string") {
                                if (prop !== "path") {
                                    fromDam.data[i][prop] = window.unescape(fromDam.data[
                                        i][prop]);
                                } else {
                                    // Path is set from Assets where the name, folder are escaped
                                    // So we need to decode the value to form the path to the asset
                                    var pathArr = fromDam.data[i].path.split("/content/dam/");
                                    var decodedPath = decodeURIComponent(pathArr[1]);
                                    fromDam.data[i][prop] = "/content/dam/" + decodedPath;
                                }
                            }
                        }

                        $("input." + assetBrowseMode).val(fromDam.data[i].path);
                        assetBrowseMode = "";
                        break; // we are supporting only 1 asset per resource;issue CQ-32398.
                        // Ideally assetpicker should have parameter for number of files to be picked.
                    }
                }

                assetPickerTab1.css("display", "none");
                assetPickerTab1.attr("src", "");
            }

        };

        window.addEventListener("message", processAssetPickerSelection, false);
    });
})(window, document, CQ.Communities.Enablement, CQ.Communities.Enablement.Utils, Granite);
