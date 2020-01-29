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
 * @class CQ.wcm.WorkflowModelCombo
 * @extends CQ.Ext.form.ComboBox
 * The WorkflowModelCombo is a customized {@link CQ.Ext.form.ComboBox}
 * that shows a list of available workflow models.
 *
 * @constructor
 * Creates a new WorkflowModelCombo.
 * @param {Object} config The config object
 */

CQ.social = CQ.social || {};
CQ.social.commons = CQ.social.commons || {};
CQ.social.commons.SocialWorkflowModelCombo = CQ.Ext.extend(CQ.wcm.WorkflowModelCombo, {

    constructor: function(config) {
        config = (!config ? {} : config);

        this.store = new CQ.Ext.data.Store({
            "autoLoad": {},
            "proxy": new CQ.Ext.data.HttpProxy({
                "url": CQ.shared.HTTP.externalize("/libs/cq/workflow/content/console/workflows.json"),
                "method": "GET"
            }),
            "baseParams": {
                tags: 'social'
            },
            "reader": new CQ.Ext.data.JsonReader({
                "totalProperty": "results",
                "root": "workflows",
                "id": "wid",
                "fields": ["wid", "label", CQ.shared.XSS.getXSSPropertyName("label"), "description", "thumbnail", "isCqPage"]
            }),
            "listeners": {
                "load": function(store) {
                    store.add(new store.recordType({
                        "wid": "",
                        "label": CQ.I18n.getMessage("Create new workflow model..."),
                        "description": "",
                        "thumbnail": ""
                    }, CQ.Ext.id()));
                }
            }
        });

        // If setValue is called before our store's data is loaded, we need
        // to set the value again so that labels are correctly displayed
        var thisCombo = this;
        this.initialValue = null;
        this.store.on("load", function() {
            if (thisCombo.initialValue) {
                thisCombo.setValue(thisCombo.initialValue);
            }
            thisCombo.fireEvent("load", this);
        });

        var defaultThumbnail = CQ.HTTP.externalize("/libs/cq/ui/widgets/themes/default/widgets/wcm/WorkflowModelCombo/workflow-model.png");
        config = CQ.Util.applyDefaults(config, {
            "name": "workflowModel",
            "hiddenName": "./workflowModel",
            "fieldLabel": "Workflow Model",
            "displayField": "label",
            "valueField": "wid",
            "title": CQ.I18n.getMessage("Available Workflow Models"),
            "selectOnFocus": true,
            "triggerAction": "all",
            "allowBlank": false,
            "editable": false,
            "lazyInit": false,
            "store": this.store,
            "tpl": new CQ.Ext.XTemplate(
                '<tpl for=".">',
                '<div class="workflow-model-item x-combo-list-item">',
                '<tpl if="thumbnail">',
                '<img class="workflow-model-thumbnail" src="{[CQ.shared.HTTP.getXhrHookedURL(values.thumbnail + \".thumb.48.48.png\")]}">',
                '<div class="workflow-model-title">{[CQ.shared.XSS.getXSSTablePropertyValue(values, \"label\")]}</div>',
                '<div class="workflow-model-description">{description}</div>',
                '</tpl>',
                '<tpl if="wid == \'\'">',
                '<div class="workflow-model-title workflow-model-no-thumbnail">{[CQ.shared.XSS.getXSSTablePropertyValue(values, \"label\")]}</div>',
                '<div class="workflow-model-description workflow-model-no-thumbnail">{description}</div>',
                '</tpl>',
                '<tpl if="thumbnail == \'\' && wid != \'\'">',
                '<img class="workflow-model-thumbnail" src="' + CQ.shared.HTTP.getXhrHookedURL(defaultThumbnail + ".thumb.48.48.png") + '">',
                '<div class="workflow-model-title">{[CQ.shared.XSS.getXSSTablePropertyValue(values, \"label\")]}</div>',
                '<div class="workflow-model-description">{description}</div>',
                '</tpl>',
                '<div style="clear:both"></div>',
                '</div>',
                '</tpl>',
                '<div style="height:5px;overflow:hidden"></div>')
        });

        CQ.wcm.WorkflowModelCombo.superclass.constructor.call(this, config);
    }
});

CQ.Ext.reg("cq.social.workflow.model.combo", CQ.social.commons.SocialWorkflowModelCombo);
