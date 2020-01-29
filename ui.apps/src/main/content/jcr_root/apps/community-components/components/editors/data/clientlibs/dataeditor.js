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
(function($, CQ, CM, CG) {
    "use strict";
    CQ.soco = CQ.soco || {};
    CQ.soco.dataEditors = [];

    function makeEditor(index, editor) {
        var $textarea = $(editor).find("textarea").first();
        var $editor = $(editor);
        var $component = $('[data-scf-component]').first();
        if ($component.length <= 0) {
            return;
        }
        var componentType = $component.attr("data-scf-component");
        if (componentType == "") {
            return;
        }

        var componentObj =SCF.Components[componentType];
        if (componentObj == null) {
            return;
        }
        var ModelKlass = componentObj.Model;
        var model = ModelKlass.findLocal($component.attr("data-component-id"));
        var path = $component.attr("data-component-id") + ".social.json?tidy=true";
        var codeEditor = CM.fromTextArea($textarea.get(0), {lineNumbers: true});
        loadData(codeEditor,path);
        model.on("change",function(event){loadData(codeEditor,path);});
        CQ.soco.dataEditors.push(codeEditor);

        $editor.find("button.apply").click(function(event){
            event.preventDefault();
            codeEditor.save();
            var data = $.parseJSON($textarea.val());
            //SCF.Model.prototype._cachedModels
            for (var k in model.relationships) {
                if (data.hasOwnProperty(k)) {
                    var itemArray = data[k];
                    for (var index in itemArray) {
                        if (itemArray[index].hasOwnProperty("id")) {
                            var item = itemArray[index];
                            var childModel = SCF.Model.findLocal(item["id"]);
                            var editorValue = JSON.stringify(item, null, '');
                            var modelValue = JSON.stringify(childModel.toJSON(), null, '');
                            if (childModel && (editorValue != modelValue)) {
                                childModel.set(item);
                                childModel.trigger("model:loaded");
                            }
                        }
                    }
                }

            }
            model.set(data);
            model.trigger("model:loaded");
        });
        CG.addTabChangeHandler($editor, function(event){
            codeEditor.refresh();
        });
    }

    function loadData(codeEditor, path) {
        $.ajax({
            async: false,
            url: path
        }).done(function(data) {
            var prettyString = JSON.stringify(data, null, '\t');
            codeEditor.setValue(prettyString);
        });

    }

    $(function() {
        $("form.data-editor").each(makeEditor);
    });
})($CQ, CQ, CodeMirror, ComponentGuide);
