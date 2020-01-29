/*
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2012 Adobe Systems Incorporated
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

/**
 * @class CQ.wcm.WorkflowModelThumbnail
 * @extends CQ.Ext.BoxComponent
 * The WorkflowModelSelector combines a WorkflowModelCombo with a
 * thumbnail image of the workflow, and buttons to create and
 * edit workflow models.
 *
 * @constructor
 * Creates a new CQ.wcm.WorkflowModelSelector.
 * @param {Object} config The config object
 */

/**
 * @class CQ.wcm.WorkflowModelSelector
 * @extends CQ.form.CompositeField
 * The WorkflowModelSelector combines a WorkflowModelCombo with a
 * thumbnail image of the workflow, and buttons to create and
 * edit workflow models.
 *
 * @constructor
 * Creates a new CQ.wcm.WorkflowModelSelector.
 * @param {Object} config The config object
 */

CQ.social = CQ.social || {};
CQ.social.commons = CQ.social.commons || {};
CQ.social.commons.SocialWorkflowModelSelector = CQ.Ext.extend(CQ.wcm.WorkflowModelSelector, {

    /**
     * @cfg {Boolean} hideThumbnail
     * True to hide selected workflow model thumbnail (defaults to false)
     */
    hideThumbnail: false,

    constructor: function(config) {
        config = (!config ? {} : config);
        var selector = this;

        if (!config.hideThumbnail) {
            // Image widget for workflow thumbnail
            this.thumbnailImage = new CQ.wcm.WorkflowModelThumbnail({
                "listeners": {
                    "click": this.editCurrentWorkflow,
                    "scope": this
                }
            });
        }

        // Use our allowBlank setting for the workflow model combo as well
        config = CQ.Util.applyDefaults(config, {
            "allowBlank": false,
            "border": false,
            "name": "workflowModel"
        });

        this.workflowModelCombo = new CQ.social.commons.SocialWorkflowModelCombo({
            "xtype": "cq.workflow.model.combo",
            "name": config.name,
            "hiddenName": selector.getHiddenName(config.name),
            "title": "",
            "allowBlank": config.allowBlank,
            "listeners": {
                "select": function() {
                    selector.updateThumbnail();
                },
                "clear": function() {
                    selector.updateThumbnail();
                },
                "load": function() {
                    selector.updateThumbnail();
                }
            }
        });

        var selCls = "cq-wcm-workflow-model-selector-compact";
        var selItems = [
            this.workflowModelCombo, {
                "xtype": "spacer",
                "height": 10
            }
        ];
        if (this.thumbnailImage) {
            selCls = "cq-wcm-workflow-model-selector";
            selItems.push({
                "xtype": "panel",
                "layout": "hbox",
                "layoutConfig": {
                    "pack": "center"
                },
                "border": false,
                "items": [
                    this.thumbnailImage
                ]
            });
        }

        config = CQ.Util.applyDefaults(config, {
            "cls": selCls,
            "layout": "vbox",
            "layoutConfig": {
                "align": "stretch"
            },
            "border": false,
            "items": selItems
        });

        CQ.wcm.WorkflowModelSelector.superclass.constructor.call(this, config);
    }
});

CQ.Ext.reg("cq.social.workflow.model.selector", CQ.social.commons.SocialWorkflowModelSelector);
