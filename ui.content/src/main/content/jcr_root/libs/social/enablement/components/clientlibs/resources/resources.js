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

(function(document, $, Enablement) {
    "use strict";

    $(document).one("coral-cardviewloaded", function() {
        var DeleteResourceForm = Backbone.View.extend({
            events: {
                "beforeshow": "onBeforeShow",
                "submit": "onSubmit"
            },

            initialize: function() {
                this.mainView = $(this.$el.data("elem")).data("mainView");
                this.cardView = this.mainView.cardView;
            },

            onBeforeShow: function() {
                var resources = this.getSelected("name");
                var len = resources.length;
                var resourceStr =
                    len > 10 ? resources.splice(0, 10).join("<br />") + "<br /> ..." :
                    resources.join("<br />");
                this.$(".coral-Modal-body")
                    .html((len === 1 ?
                            Granite.I18n.get("You are going to delete the following item: ") :
                            Granite.I18n.get("You are going to delete the following {0} items: ", len)) +
                        Granite.I18n.get("<br /><br /><b> {0} </b>", resourceStr) +
                        Granite.I18n.get("<br /><br />Activity records for deleted items will be lost."));
            },

            onSubmit: function(e) {
                e.preventDefault();

                var self = this;
                var paths = this.getSelected("path");
                $.ajax({
                    url: Enablement.currPageSuffix,
                    type: "post",
                    headers: {
                        Accept: "application/json; charset=utf-8"
                    },
                    data: {
                        "_charset_": "utf-8",
                        ":operation": "se:deleteEnablementContent",
                        ":applyTo": paths
                    }
                }).done(function(responseJson) {
                    self.removeFromView(responseJson);
                }).fail(function() {
                    self.$el.hide();
                    this.errorModal = this.errorModal || new CUI.Modal({
                        element: this.$el.data("error-modal"),
                        type: "error"
                    });
                    self.errorModal.show();
                });
            },

            getSelected: function(param) {
                var items = [];
                this.cardView.getSelection().toArray().forEach(function(item) {
                    items.push($(item).data(param));
                });
                return items;
            },

            getDeletedResources: function(jsonResp) {
                var deletedResources = [];

                var self = this;
                var changes = jsonResp.changes;
                _.each(changes, function(change) {
                    if (change.type === "deleted") {
                        deletedResources.push(self.mainView.$("[data-path='" +
                            change.argument + "']"));
                    }
                });

                return deletedResources;
            },

            removeFromView: function(responseJson) {
                var resources = this.getDeletedResources(responseJson);
                this.mainView.removeItems(resources);
            }
        });

        // TODO: Need to find how to pop view without jshint complaining
        /*jshint -W031*/ // avoid W031: "Do not use 'new' for side effects."
        new DeleteResourceForm({
            el: "#deleteResource"
        });
    });

})(document, $, CQ.Communities.Enablement);
