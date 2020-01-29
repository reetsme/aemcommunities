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

    $(document).ready(function() {

        var deleteModal = null;
        var publishModal = null;
        var withdrawModal = null;
        var contextPath = SCF.Util.getContextPath();

        // publish button
        $(".publish-button").click(function() {
            if (publishModal === null) {
                publishModal = new CUI.Modal({
                    element: $(".coral-Modal#confirm-publish-modal")
                });
            }
            publishModal.show();
        });

        // delete button
        $(".delete-button").click(function() {
            if (deleteModal === null) {
                deleteModal = new CUI.Modal({
                    element: $(".coral-Modal#confirm-delete-modal")
                });
            }
            deleteModal.show();
        });

        // withdraw button
        $(".withdraw-button").click(function() {
            if (withdrawModal === null) {
                withdrawModal = new CUI.Modal({
                    element: $(".coral-Modal#confirm-withdraw-modal")
                });
            }
            withdrawModal.show();
        });

        var showModal = function(modalId) {
            var modal = new CUI.Modal({
                element: $(modalId)
            });
            if (modal) {
                modal.show();
            }
        };

        // submit delete
        var submitDeleteForm = function(oper) {
            $.ajax({
                type: "POST",
                url: contextPath,
                data: oper
            }).done(function() {

                deleteModal.hide();
                var curPage = "/communities/site-resources.html";
                var postLocation = curPage + contextPath.substring(0, contextPath.lastIndexOf("/"));
                document.location.href = postLocation;

            }).fail(function() {
                deleteModal.hide();
                showModal("#deactivation-failure-modal");
            });
        };

        // submit withdraw
        var submitWithdrawForm = function(oper) {
            $.ajax({
                type: "POST",
                url: contextPath,
                data: oper
            }).done(function() {
                withdrawModal.hide();
                showModal("#deactivation-success-modal");

            }).fail(function() {
                withdrawModal.hide();
                showModal("#deactivation-failure-modal");
            });
        };

        // submit publish
        var submitPublishForm = function(oper) {
            $.ajax({
                type: "POST",
                url: contextPath,
                data: oper
            }).done(function() {
                publishModal.hide();
                showModal("#activation-success-modal");

            }).fail(function() {
                publishModal.hide();
                showModal("#activation-failure-modal");
            });
        };

        $(".coral-Modal#confirm-publish-modal").on("click",
            ".coral-Button--primary[type='submit']",
            function(e) {
                var kind = $(e.target).data("kind");
                var operation = ":operation=social:publishEnablementResourceModel&replication-action=activate";
                if (kind === "learningpath") {
                    operation = ":operation=social:publishEnablementLearningPathModel&replication-action=activate";
                }
                e.preventDefault();
                submitPublishForm(operation);
            });

        $(".coral-Modal#confirm-withdraw-modal").on("click",
            ".coral-Button--primary[type='submit']",
            function(e) {
                var kind = $(e.target).data("kind");
                var operation = ":operation=social:publishEnablementResourceModel&replication-action=deactivate";
                if (kind === "learningpath") {
                    operation = ":operation=social:publishEnablementLearningPathModel&replication-action=deactivate";
                }
                e.preventDefault();
                submitWithdrawForm(operation);
            });

        $(".coral-Modal#confirm-delete-modal").on("click",
            ".coral-Button--primary[type='submit']",
            function(e) {
                var operation = ":operation=social:deleteEnablementResourceModel";
                e.preventDefault();
                submitDeleteForm(operation);
            });

    });

})(window, document, Granite, Granite.$);
