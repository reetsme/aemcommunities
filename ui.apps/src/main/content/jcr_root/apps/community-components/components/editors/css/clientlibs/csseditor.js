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
    CQ.soco.cssEditors = [];

    function makeEditor(index, editor) {
        var textarea = $(editor).find("textarea")[0];
        var findBlock = function(cm, line) {
            var linesSearched = 0;
            var found = false;
            var match;
            while (!found && linesSearched < 100) {
                var text = cm.getLine(line);
                var openIndex = text.indexOf('{');
                var closeIndex = text.indexOf('}');
                if (openIndex !== -1 || closeIndex !== -1) {
                    console.log();
                    var ch = openIndex !== -1 ? openIndex : closeIndex;
                    match = cm.findMatchingBracket({
                        'line': line,
                        'ch': ch
                    });
                    found = true;
                    return match;
                }
                linesSearched++;
                line--;

            }
            return match;
        };
        var findStart = function(cm, line) {
            var found = false;
            var linesSearched = 0;
            while (!found && linesSearched < 100) {
                var closeIndex = cm.getLine(line).indexOf("}");
                if (closeIndex != -1) {
                    if (closeIndex == cm.getLine(line).length) {
                        return {
                            'line': line++,
                            ch: 0
                        };
                    } else {
                        return {
                            'line': line,
                            ch: closeIndex + 1
                        };
                    }
                }
                if (line == 0) {
                    return {
                        'line': 0,
                        ch: 0
                    };
                }
                line--;
                linesSearched++;
            }
        };
        var gutterClick = function(cm, line) {
            console.log(line);
            var block = findBlock(cm, line);
            console.log(block);
            var openLine = block.from.line < block.to.line ? block.from : block.to;
            var endLine = block.from.line < block.to.line ? block.to : block.from;
            var start = findStart(cm, openLine.line);
            console.log(start);
            var classes = "";
            for (var l = start.line; l <= openLine.line; l++) {
                var text = cm.getLine(l);
                if (l == openLine.line) {
                    text = text.substr(0, openLine.ch - 1);
                }
                if (l == start.line) {
                    text = text.substr(start.ch);
                }
                classes = classes + text;

            }
            console.log(classes.split(","));

            var info = cm.lineInfo(openLine.line);
            cm.setGutterMarker(openLine.line, "css-selects", info.gutterMarkers ? null : makeMarker());
            if (!info.gutterMarkers) {
                var mark = cm.markText(start, {
                    line: endLine.line,
                    ch: endLine.ch + 1
                }, {
                    className: 'csseditor-selectBlock'
                });
                cm.marks = cm.marks || {};
                cm.marks[start.line] = mark;
                cm.selectedClasses = cm.selectedClasses || "";
                cm.selectedClasses += "###" + classes;
            } else {
                var mark = cm.marks[start.line];
                mark.clear();
                delete cm.marks[start.line];
                cm.selectedClasses = cm.selectedClasses.replace("###" + classes, "");
            }
            var highlightsBlock = $("#css-editor-highlights");
            if (highlightsBlock.length == 0) {
                highlightsBlock = $("<style  id='css-editor-highlights' type='text/css'></style>").appendTo("head");
            }
            var selectors = cm.selectedClasses.split("###");
            selectors.shift();
            if (selectors.length > 0) {
                highlightsBlock.html(selectors.join() + " {outline :1px dashed blue;}");
            } else {
                highlightsBlock.html(" ");
            }
        };

        function makeMarker() {
            var marker = document.createElement("div");
            marker.style.color = "#822";
            marker.innerHTML = "●";
            return marker;
        }
        var codeEditor = CM.fromTextArea(textarea, {
            lineNumbers: true,
            matchBrackets: true,
            gutters: ["css-selects", "CodeMirror-lint-markers"],
            mode: "css",
            lint: true
        });
        codeEditor.on("gutterClick", gutterClick);
        CQ.soco.cssEditors.push(codeEditor);

        $(editor).find("button.apply").click(function(event) {
            event.preventDefault();
            codeEditor.save();
            var txt = $(editor).find("textarea").val();
            console.debug("compiling");
            try {

                var cssfile = $(editor).find("textarea")[0].id;
                cssfile = cssfile.replace(/[/\\\.]/g, "-");
                var highlightsBlock = $("#css-" + cssfile);
                if (highlightsBlock.length == 0) {
                    highlightsBlock = $("<style  id='css-" + cssfile + "' type='text/css'></style>").appendTo("body");
                }
                highlightsBlock.html(txt);

            } catch (e) {
                console.log(e);
            }
            console.debug("applying");
        });

        CG.addTabChangeHandler($(editor), function(event){
            codeEditor.refresh();
        });
    }

    $(function() {
        $("form.css-editor").each(makeEditor);
    });


})($CQ, CQ, Handlebars, CodeMirror, SCF, ComponentGuide);
