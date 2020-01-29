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
/*
 * location: libs/social/commons/components/ugcparbase/clientlibs/commons.js
 * category: [cq.collab.comments,cq.social.commons]
 */
(function(CQ, $CQ) {
    "use strict";
    CQ.soco = CQ.soco || {};
    CQ.soco.commons = CQ.soco.commons || {};
    CQ.soco.TEMPLATE_PARAMNAME = ":templatename";
    CQ.soco.filterHTMLFragment = CQ.soco.filterHTMLFragment || function(fragment, targetFunction) {
        try {
            targetFunction.call(null, $CQ(fragment));
        } catch (e) {
            throw e;
        }
    };
    var localEvents = {};
    localEvents.CLEAR = "lcl.cq.soco.events.clear";
    CQ.soco.commons.handleOnBlur = function(el, message) {
        //Apparently the RTE reports a <br/> as it's empty text
        if (($CQ(el).val() === "") || ($CQ(el).val() === "<br/>")) {
            $CQ(el).val(message);
        }
    };
    CQ.soco.commons.handleOnFocus = function(el, message) {
        if ($CQ(el).val() === message) {
            $CQ(el).val("");
        }
    };

    CQ.soco.commons.getMessage = function(targetTextArea) {
        var message = $CQ(targetTextArea).first().val();
        if (typeof CKEDITOR !== 'undefined') {
            var editor = CKEDITOR.instances[$CQ(targetTextArea).attr('id')];
            if (editor) {
                message = editor.getData();
            }
        }
        return message;
    };
    CQ.soco.commons.validateFieldNotEmptyOrDefaultMessage = function(field, defaultMessage) {
        //ensure the RTE and textarea are in sync prior to validating
        CQ.soco.commons.syncRTE(field);

        var textValue = $CQ(field).val();
        if (!defaultMessage) {
            defaultMessage = '';
        }
        var tempDivID = 'tempRTEValidate_' + Math.floor(Math.random() * 1001);
        $CQ(field).after("<div id='" + tempDivID + "' height='0px' style='visibility:hidden;' width='0px'></div>");
        textValue = CQ.soco.commons.stripNonText(textValue);
        defaultMessage = CQ.soco.commons.stripNonText(defaultMessage);
        //Hack to Remove empty DIV tags
        //Removing empty div's using Browser/JQuery DOM processing was easier and cleaner than using Regex
        $CQ('#' + tempDivID).append(textValue);
        $CQ('#' + tempDivID + ' div:empty').filter(function() {
            //console.log($CQ(this));
            return $CQ(this);
        }).remove();

        $CQ('#' + tempDivID + ' p:empty').filter(function() {
            //console.log($CQ(this));
            return $CQ(this);
        }).remove();

        textValue = $CQ('#' + tempDivID).html();
        $CQ('#' + tempDivID).remove();
        if ($CQ.trim(textValue).length === 0 || $CQ.trim(textValue) === defaultMessage) {
            alert(CQ.I18n.getMessage("Comment field cannot be empty or default message."));
            return false;
        } else {
            return true;
        }
    };

    CQ.soco.commons.stripNonText = function(textValue) {
        //Remove spaces
        textValue = textValue.replace(/\s|&nbsp;/g, '');
        //Remove new lines
        textValue = textValue.replace(/\r?\n|\r/g, '');
        //Remove <br>
        textValue = textValue.replace(/(<|&lt;)br\s*\/*(>|&gt;)/g, '');
        return textValue;
    };

    CQ.soco.commons.syncRTE = function(targetTextArea) {
        // Validate that CKEditor was loaded
        if (typeof CKEDITOR !== 'undefined') {
            var editor = CKEDITOR.instances[$CQ(targetTextArea).attr('name')];
            if (!editor) {
                editor = CKEDITOR.instances[$CQ(targetTextArea).attr('id')];
            }
            if (editor && editor.checkDirty()) {
                editor.updateElement();
                editor.resetDirty();
            }
        }
    };

    CQ.soco.commons.clientSideComposer = function(targetForm, templateName, success, failure, addedData, action, verb) {
        var formAction = action || targetForm.attr('action'),
            formVerb = verb || targetForm.attr('method') || "POST";
        targetForm.find(":submit").click(function(event) {
            // If the frm has a file upload field then we can't do client side rendering, without using a jquery ui
            //  plugin or HTML5 to handle the upload.

            var hasFileAttachments = $.map(targetForm.find(":input[type='file']"), function(item) {
                var jqItem = $(item);
                if (jqItem.val() === "" || jqItem.val() === undefined) {
                    return null;
                }
                return true;
            }).length > 0;

            if (hasFileAttachments) {
                return;
            }

            event.preventDefault();
            // A submit button should only submit it's closest parent form and there is only one of those.
            var form = $CQ(event.target).closest("form")[0],
                formData;
            // Check if the form has an onsubmit function, which is used for validation
            if ($CQ.isFunction(form.onsubmit)) {
                // If it returns false, then do not make the request because that signifies
                // validation failed.
                if (!form.onsubmit.call(form, event)) {
                    // Need to figure out a way to communicate this failure back to the caller,
                    // invoking "failure" breaks some of the symmetry.
                    return;

                }
            }

            //This was added because the listener on 'key' attached to the RTE is key down, not up.  So the final
            //character typed doesn't get synced prior to a submit.  Hence doing it here to make sure the data
            //being submitted is up to date.
            var targetTextArea = targetForm.find("textarea");
            CQ.soco.commons.syncRTE(targetTextArea);
            //CKEditor is supposed to update the value for the textarea as well
            //$CQ(targetTextArea).first().val(CQ.soco.commons.getMessage(targetTextArea));
            formData = $CQ(form).serialize();
            //formData[$CQ(targetTextArea).attr("name")] = CQ.soco.commons.getMessage(targetTextArea);
            if (templateName) {
                formData += "&" + encodeURIComponent(CQ.soco.TEMPLATE_PARAMNAME) + "=" + encodeURIComponent(templateName);
            }
            for (var key in addedData) {
                formData += "&" + encodeURIComponent(key) + "=" + encodeURIComponent(addedData[key]);
            }

            $CQ(form).find(":input:visible").each(function() {
                $CQ(this).attr('disabled', 'disabled');
            });

            var localSuccess = function(data, status, jqxhr) {
                if ((jqxhr.status === 201) || (jqxhr.status === 200)) {
                    $CQ(form).find(":input:visible").each(function() {
                        switch (this.type) {
                            case "password":
                            case "select-multiple":
                            case "select-one":
                            case "text":
                            case "textarea":
                                $CQ(this).val("");
                                break;
                            case "checkbox":
                            case "radio":
                                this.checked = false;
                        }
                        $CQ(this).removeAttr('disabled');
                    });
                    // This like the RTE hide form elements that are still
                    // used so notify them to clear.
                    $CQ(form).find(":input:hidden").each(function() {
                        $CQ(this).trigger(localEvents.CLEAR);
                    });
                    success.call(null, data, status, jqxhr);
                } else {
                    $CQ(form).find(":input:visible").each(function() {
                        $CQ(this).removeAttr('disabled');
                    });
                    failure.call(null, jqxhr, status);
                }
            };
            var localFail = function(jqxhr, status) {
                $CQ(form).find(":input:visible").each(function() {
                    $CQ(this).removeAttr('disabled');
                });
                failure.call(null, jqxhr, status);
            };
            $CQ.ajax(formAction, {
                data: formData,
                success: localSuccess,
                fail: localFail,
                type: formVerb
            });
        });
    };
    CQ.soco.commons.fillInputFromClientContext = function(jqFields, clientcontextProperty) {
        if (window.CQ_Analytics && CQ_Analytics.CCM) {
            $CQ(function() {
                var store = CQ_Analytics.CCM.getRegisteredStore(CQ_Analytics.ProfileDataMgr.STORENAME);
                if (store) {
                    var name = store.getProperty(clientcontextProperty, true) || '';
                    jqFields.val(name);
                }

                CQ_Analytics.CCM.addListener('storesloaded', function() {
                    var store = CQ_Analytics.CCM.getRegisteredStore(CQ_Analytics.ProfileDataMgr.STORENAME);
                    if (store && store.addListener) {
                        var name = store.getProperty(clientcontextProperty, true) || '';
                        jqFields.val(name);
                        store.addListener('update', function() {
                            var name = store.getProperty(clientcontextProperty, true) || '';
                            jqFields.val(name);
                        });
                    }
                });
            });
        }
    };

    CQ.soco.commons.activateRTE = function(targetForm, handlers) {
        var targetTextArea = targetForm.find("textarea");
        CQ.soco.commons.convertTextAreaToRTE(targetTextArea, handlers, true);
    };

    CQ.soco.commons.convertTextAreaToRTE = function(targetTextArea, handlers, offset) {
        var width = targetTextArea.width(),
            height = targetTextArea.height(),
            controls = [{
                name: 'basicstyles',
                items: ['Bold', 'Italic', 'Underline']
            }],
            listeners = {},
            targetElement = targetTextArea[0],
            key, i;
        var _handlers = handlers || ["onfocus", "onblur"];
        // For some reason the RTE jquery plugin doesn't remap
        // handlers that are attached to the editor, so map the
        // handlers we are using.
        if (targetElement !== null && typeof targetElement !== 'undefined') {
            for (i = 0; i < _handlers.length; i++) {
                key = _handlers[i];
                if (null !== targetElement[key]) {
                    listeners[key.substring(2)] = targetElement[key];
                }
            }
        }

        key = null;
        $CQ(targetTextArea).height(targetTextArea.height() + 60);
        var config = {
            width: width,
            height: height,
            toolbar: controls
        };
        if (!offset) {
            config.width = targetTextArea.width() === 0 ? '100%' : width;
            config.height = targetTextArea.height() === 0 ? '100%' : height;
            config.toolbarLocation = 'bottom';
            config.resize_enabled = false;
            config.removePlugins = 'elementspath';
        } else {
            config.width = width + 4;
            config.height = height + 60;
        }
        var editor = CKEDITOR.replace($CQ(targetTextArea).attr("name"), config);

        editor.on('key', function(evt) {
            CQ.soco.commons.syncRTE(targetTextArea);
        });

        targetTextArea.on(localEvents.CLEAR, function(event) {
            $CQ(targetElement).val("");
            editor.setData("", function() {
                $CQ(editor).blur();
                editor.resetDirty();
            });
        });
        return editor;
    };

    CQ.soco.commons.openModeration = function() {
        var pagePath = "";
        if (CQ.WCM !== undefined && CQ.WCM.getPagePath !== undefined) {
            //classic UI
            pagePath = CQ.WCM.getPagePath();
        } else if (Granite.author !== undefined && Granite.author.page !== undefined &&
            Granite.author.page.path !== undefined) {
            //touch UI
            pagePath = Granite.author.page.path;
        }

        CQ.shared.Util.open(CQ.shared.HTTP.externalize('/communities/moderation.html'));
    };

    CQ.soco.commons.showUGCFormAsDialog = function(formURL, targetDiv) {
        var $CQtargetDivId = $CQ(targetDiv);
        var targetDivId = $CQtargetDivId.attr('id');
        var divId = 'modalIframeParent' + Math.random().toString(36).substring(2, 4);
        if (!targetDivId) {
            $CQtargetDivId.attr('id', divId);
            targetDivId = divId;
        }
        $CQtargetDivId.dialog({
            modal: true,
            height: 500,
            width: 750,
            buttons: {
                Submit: function() {
                    var modal_form = $CQ('iframe.modalIframeClass', $CQtargetDivId).contents().find("form");
                    modal_form.submit();
                    $CQ(this).dialog("close");
                },
                Cancel: function() {
                    $CQ(this).dialog("close");
                }
            }
        });

        $CQtargetDivId.html("<iframe class='modalIframeClass' width='100%' height='100%' " +
            "marginWidth='0' marginHeight='0' frameBorder='0' />").dialog("open");
        $CQ('#' + targetDivId + " .modalIframeClass").attr("src", formURL);
        return false;
    };

})(CQ, $CQ);
