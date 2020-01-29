/*************************************************************************
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
 *
 *************************************************************************/
(function(window, document, Granite, $) {
    "use strict";

    $(document).on("foundation-contentloaded", function() {

        var messageSuccess = "";
        var messageError = "";

        var showAlert = function(selector, msg) {

            $(selector).find("coral-alert-content").html(msg);

            $(selector).fadeIn().animate({
                top: "0rem"
            }).delay(2000).animate({
                top: "-3rem"
            }).fadeOut();
            $("#alert-info").fadeOut(200).delay(1000).animate({
                top: "-3rem"
            });
        };

        // Submit Publish
        var submitOperation = function(operation, postLocation) {

            var contextPath = SCF.Util.getContextPath();
            $.ajax({
                type: "POST",
                url: contextPath,
                data: operation
            }).success(function() {

                if (postLocation) {
                    document.location.href = postLocation;
                } else {
                    showAlert("#alert-success", messageSuccess);
                }

            }).fail(function() {
                showAlert("#alert-error", messageError);
            });
        };

        $("#publish-resource").click(function() {

            messageSuccess = Granite.I18n.get("The resource successfully published.");
            messageError = Granite.I18n.get("There was an error publishing the resource.");
            submitOperation(":operation=social:publishEnablementResourceModel&replication-action=activate");
        });

        $("#unpublish-resource").click(function() {

            messageSuccess = Granite.I18n.get("The resource was successfully unpublished.");
            messageError = Granite.I18n.get("There was an error unpublishing the resource.");
            submitOperation(":operation=social:publishEnablementResourceModel&replication-action=deactivate");
            var dialog = document.querySelector("#unpublish-dialog");
            dialog.hide();
        });

        $("#publish-learningpath").click(function() {

            messageSuccess = Granite.I18n.get("The learningpath successfully published.");
            messageError = Granite.I18n.get("There was an error publishing the learningpath.");
            submitOperation(":operation=social:publishEnablementLearningPathModel&replication-action=activate");
        });

        $("#unpublish-learningpath").click(function() {

            messageSuccess = Granite.I18n.get("The learningpath was successfully unpublished.");
            messageError = Granite.I18n.get("There was an error unpublishing the learningpath.");
            submitOperation(":operation=social:publishEnablementLearningPathModel&replication-action=deactivate");
            var dialog = document.querySelector("#unpublish-dialog");
            dialog.hide();
        });

        $("#delete-resource").click(function() {

            var curPage = "/communities/site-resources.html";
            var contextPath = SCF.Util.getContextPath();
            var postLocation = curPage + contextPath.substring(0, contextPath.lastIndexOf("/"));

            messageSuccess = Granite.I18n.get("The resource was successfully deleted.");
            messageError = Granite.I18n.get("There was an error deleting the resource.");

            submitOperation(":operation=social:deleteEnablementResourceModel", postLocation);

            var dialog = document.querySelector("#delete-dialog");
            dialog.hide();
        });

    });

})(window, document, Granite, Granite.$);
