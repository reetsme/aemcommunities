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

(function(window, document, EnablementUtils, Granite) {
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
    var ResourceModel = SCF.Model.extend({
        modelName: "ResourceModel"
    });
    var ResourceView = SCF.View.extend({
        viewName: "ResourceView"
    });

    EnablementUtils.editResource = EnablementUtils.editResource || {};
    EnablementUtils.editResource.JSON = EnablementUtils.editResource.JSON || {};

    SCF.ResourceModel = ResourceModel;
    SCF.ResourceView = ResourceView;
    SCF.registerComponent("social/enablement/components/hbs/admin/createresources", SCF.ResourceModel,
        SCF.ResourceView);
    // DOM related functionalities
    $(document).ready(function() {
        // Get the siteId and construct the URL for users
        var siteId = $(".dataSiteId").data("siteid");
        var groupId = $(".dataCommunityGroupId").data("groupid");
        var AddAssetWizard = CQ.Communities.Enablement.AddAssetWizard;
        var addAssetWizModel = new AddAssetWizard.model({
            "assetDefCoverImg":
        "/libs/settings/wcm/designs/default/resources/" +
            "social/enablement/default_asset_cover_img.png",
            "assetCoverImgUploadUrl":
                "/tmp/social-enablement.uploadfile.html"
        });

        CQ.Communities.Enablement.addAssetWizView = new AddAssetWizard.view({
            "el": $(".add-asset-wizard-wrapper"),
            "model": addAssetWizModel,
            "externalUrlResourceForm": $("#external-url-resource-creation-form"),
            "externalResourceForm": $("#external-resource-creation-form"),
            "adobeConnectUrlForm": $("#external-url-connect-resource-creation-form"),
            "resourceSettings": $(".collectionresourcesettings")
        });

        if ($.isEmptyObject(EnablementUtils.editResource.JSON)) {
            var componentId = $("div[data-scf-component=\"social/enablement/components/hbs/admin/createresources\"]")
                .data("componentId");
            var editSiteModel = $("script[type=\"application/json\"][id=\"" + componentId + "\"]");
            var modelText = $(editSiteModel[0]).text();
            SCFConsole.editSite.JSON = JSON.parse(modelText);
        }

        var assetslist = [];
        if (SCFConsole.editSite.JSON.primaryAsset) {
            assetslist.push(SCFConsole.editSite.JSON.primaryAsset);
        }
        CQ.Communities.Enablement.addAssetWizView.loadInitialAssets(assetslist);
        $(".scf-enablement-site-selector").on("site-selector-mode.changed", function(e, site) {
            if (site !== undefined) {
                CQ.Communities.Enablement.addAssetWizView.updateFileUploadUrl();
            }
        });

        // On create resoources, ratings and comments have undefined value by default.
        if (SCFConsole.editSite.JSON.allowComments === undefined) {
            $(".scf-js-comments input[name='allow-comments']").val(true);
            $(".scf-js-comments").find(".allow-comments").attr("checked", true);
        }

        if (SCFConsole.editSite.JSON.allowRatings === undefined) {
            $(".scf-js-ratings input[name='allow-ratings']").val(true);
            $(".scf-js-ratings").find(".allow-ratings").attr("checked", true);
        }

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

        // If asset table is Empty, disable the Next button
        enableTabButton($("#course-contents-tbl").find("tbody").children().length === 0, ".scj-js-contenttab-next");

        // Enable Next button if an asset is added
        $("#course-contents-tbl").on("enablement-assetTable-rowcountchanged", function() {
            enableTabButton($("#course-contents-tbl").find("tbody").children().length === 0,
            ".scj-js-contenttab-next");
        });

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

        // Handle show in catalog hidden field
        $("coral-checkbox.show-in-catalog").on("click", function() {
            var isChecked = $(this).prop("checked");
            $("div.scf-js-show-in-catalog input[name='show-in-catalog']").val(!isChecked);
        });

        // Handle Comments hidden field
        $("coral-checkbox.allow-comments").on("click", function() {
            var isChecked = $(this).prop("checked");
            $("div.scf-js-comments input[name='allow-comments']").val(!isChecked);
        });

        // Handle Ratings hidden field
        $("coral-checkbox.allow-ratings").on("click", function() {
            var isChecked = $(this).prop("checked");
            $("div.scf-js-ratings input[name='allow-ratings']").val(!isChecked);
        });

        // Handle Anonymous access hidden field
        $("coral-checkbox.allow-anonymous-access").on("click", function() {
            var isChecked = $(this).prop("checked");
            $("div.scf-js-anonymous-access input[name='anonymous-access']").val(!isChecked);
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
            var selectedLearners = $("#scf-js-social-enablement-assignments").data("add-learners");
            selectedLearners = _.pluck(selectedLearners, "userId");
            var learnersInputList = $(".coral-TagList-tag input[name=\"add-learners\"]");
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
        // Resource Create Function
        var submitForm = function() {
            calculateDelta();
            var $form = $("#form-wizard-dataform");
            var formData = EnablementUtils.serializeForm($form);
            showWaitingBar(true);
            $.ajax({
                type: $form.prop("method"),
                url: $form.prop("action"),
                data: formData
            }).done(function(html) {
                showWaitingBar(false);
                var resourceLocation = EnablementUtils.parseSlingPostServletResponse(html).location;
                var contextPath = Granite.HTTP.getContextPath();
                var length = resourceLocation.length;
                var index = resourceLocation.indexOf(contextPath);
                resourceLocation = resourceLocation.substring(index + contextPath.length, length);
                window.location.href = Granite.HTTP.getContextPath() +
                "/communities/resource-info.html" + resourceLocation;
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
        $("#scf-js-social-enablement-assignments .coral-TagList-tag-removeButton").on("click", function(e) {
            var listObj = e.currentTarget.parentElement;
            var hiddenEle = $(listObj).find("input[name=\"resource-assignees\"]");
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
            "/libs/settings/wcm/designs/default/resources/social/enablement/defaultCardImage.png";
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
                $img.css("background-image", "url(" + Granite.HTTP.getContextPath() +
                 val + "?cur_time=" + new Date().getMilliseconds() +
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
    });
})(window, document, CQ.Communities.Enablement.Utils, Granite);
