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
    CQ.soco.templateEditors = [];

    function makeEditor(index, editor) {
        var textarea = $(editor).find("textarea")[0];
        var codeEditor = CM.fromTextArea(textarea, {lineNumbers: true});
        var $editor = $(editor);
        CQ.soco.templateEditors.push(codeEditor);
        CG.addTabChangeHandler($editor, function(event){
            codeEditor.refresh();
        });
    }

    $(function() {
        $("form.htl-editor").each(makeEditor);
    });

})($CQ, CQ, CodeMirror, ComponentGuide);
