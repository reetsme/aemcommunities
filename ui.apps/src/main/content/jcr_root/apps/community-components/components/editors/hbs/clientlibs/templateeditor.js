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

(function($, CQ, H, CM, SCF, CG) {
    "use strict";
    CQ.soco = CQ.soco || {};
    CQ.soco.templateEditors = [];

    function makeEditor(index, editor) {
        var textarea = $(editor).find("textarea")[0];
        var codeEditor = CM.fromTextArea(textarea, {
            lineNumbers: true
        });
        var $editor = $(editor);
        CQ.soco.templateEditors.push(codeEditor);
        $editor.find("button.compile").click(function(event) {
            event.preventDefault();
            codeEditor.save();
            codeEditor.eachLine(function(lineHandle) {
                codeEditor.removeLineClass(lineHandle, "background", "compileError");
            });
            var txt = $(editor).find("textarea").val();
            try {
                var f = H.precompile(txt);
            } catch (e) {
                setErrors(e, codeEditor);
            }
        });
        $editor.find("button.apply").click(function(event) {
            event.preventDefault();
            codeEditor.save();
            var txt = $(editor).find("textarea").val();
            try {
                var f = H.compile(txt);
                var templateId = $(editor).find("textarea")[0].id;
                var resourceType = templateId.substr(1, templateId.lastIndexOf('/') - 1);
                resourceType = resourceType.substr(resourceType.indexOf('/') + 1);
                templateId = templateId.substr(templateId.lastIndexOf('/'));
                templateId = templateId.substr(0, templateId.lastIndexOf('.'));
                var viewKlass = SCF.Components[resourceType].View;
                SCF.templates[resourceType + templateId] = f;
                var defaultTemplate = resourceType.substr(resourceType.lastIndexOf('/') + 1);
                if (defaultTemplate === templateId.substr(1)) {
                    viewKlass.prototype.template = f;
                }
                var components = SCF.loadedComponents[resourceType];
                for (var cmp in components) {
                    var view = components[cmp].view;
                    if (view.hasOwnProperty("template")) {
                        view.template = f;
                    }
                    view.render();
                }

            } catch (e) {
                setErrors(e, codeEditor);
            }
        });

        CG.addTabChangeHandler($editor, function(event) {
            codeEditor.refresh();
        });
        $editor.find("button.save").click(function(event) {

        });
    }

    $(function() {
        $("form.hbs-editor").each(makeEditor);
    });

    function setErrors(e, cmEditor) {
        var message = e.message;
        var lineNumberMatcher = /\d+/;
        var firstMessageLine = message.split("\n")[0];
        var lineNumber = firstMessageLine.match(lineNumberMatcher);
        cmEditor.addLineClass(+lineNumber[0] - 1, "background", "compileError");
    }
})($CQ, CQ, Handlebars, CodeMirror, SCF, ComponentGuide);
