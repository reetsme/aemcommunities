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

(function($CQ, _, Backbone, SCF) {
    "use strict";
    // analytics code
    window.CQ_Analytics = window.CQ_Analytics || {};
    var cqAnalytics = CQ_Analytics;

    var Filelibrary = SCF.CommentSystem.extend({
        modelName: "FilelibraryModel",
        MOVE_OPERATION: "social:moveFile",
        fixCachedProperties: function() {
            this.loadClipboard();
        },
        loadClipboard: function(userIsModerator) {
            if (userIsModerator == null || _.isUndefined(userIsModerator)) {
                var id = this.get("sourceComponentId") ? this.get("sourceComponentId") : this.get("id");
                userIsModerator = SCF.Session.checkIfModeratorFor(id);
            }
            var moveAllowed = this.attributes.configuration.moveAllowed;
            var clipboard = localStorage.getItem(Document.prototype.FILELIBRARY_CLIPBOARD);
            if (clipboard == null || _.isUndefined(clipboard)) {
                this.attributes.canPaste = false;
                return;
            }
            clipboard = JSON.parse(clipboard);
            this.attributes.canPaste = userIsModerator && moveAllowed && clipboard.count > 0;
            this.attributes.pasteCount = clipboard.count;
        },
        clearClipboard: function() {
            localStorage.removeItem(Document.prototype.FILELIBRARY_CLIPBOARD);
            this.attributes.canPaste = false;
            this.attributes.pasteCount = 0;
            this.trigger(this.events.UPDATED, {
                model: this
            });
        },
        moveFiles: function(data) {
            var error = _.bind(function(jqxhr, text, error) {
                this.trigger(this.events.MOVE_ERROR, {
                    'error': error
                });
            }, this);
            var success = _.bind(this.addCommentSuccess, this);
            $CQ.ajax(SCF.config.urlRoot + this.get('id') + SCF.constants.URL_EXT, {
                dataType: 'json',
                type: 'POST',
                xhrFields: {
                    withCredentials: true
                },
                data: {
                    ':operation': this.MOVE_OPERATION,
                    'resourcePath': data.resourcePath,
                    'parentPath': data.parentPath
                },
                'success': success,
                'error': error
            });
        },
        events: {
            ADD: "filelibrary:added",
            UPDATED: "filelibrary:updated"
        },
        addComment: function(data, scb, fcb) {
            $CQ('.scf-attachment-error').remove();

            var success = _.bind(function(response) {
                var comment = response.response;
                var CommentKlass = SCF.Models[this.constructor.prototype.relationships.items.model];
                var newComment = new CommentKlass(comment);

                if (!newComment.get("isVisible")) {
                    this.view.showUGCLimitDialog(null, true);
                }

                newComment.set("_isNew", true);
                newComment._isReady = true;
                var comments = this.get("items");
                var isCollectionNew = false;
                if (!comments) {
                    var CollectionKlass = SCF.Collections[this.constructor.prototype.relationships.items.collection] || Backbone.Collection;
                    comments = new CollectionKlass();
                    comments.model = CommentKlass;
                    comments.parent = this;
                    isCollectionNew = true;
                }
                comments.unshift(newComment);
                var totalComments = this.get("totalSize");
                if (isCollectionNew) {
                    this.set("items", comments);
                }
                this.set("totalSize", totalComments + 1);
                newComment.constructor.prototype._cachedModels[comment.id] = newComment;
                this.trigger(this.events.ADD, {
                    model: this
                });
                if (null != scb) {
                    scb;
                }

            }, this);
            var error = _.bind(function(jqxhr, text, error) {
                //Handles Server errror in case of bad attachments, etc.
                if (500 == jqxhr.status) {
                    var _parentEl = $CQ('.scf-composer-block')[0];
                    if (null == _parentEl) {
                        _parentEl = $CQ(document.body);
                    }
                    $CQ('<div class="scf-attachment-error"><h3 class="scf-js-error-message">' + CQ.I18n.getMessage("Server error. Please try again.") + '</h3><div>').appendTo(_parentEl);
                    return false;
                }

                this.trigger(this.events.ADD_ERROR, this.parseServerError(jqxhr, text, error));
            }, this);

            var postData;
            var hasAttachment = (typeof data.files !== "undefined");

            if (hasAttachment) {
                if (window.FormData) {
                    postData = new FormData();
                }

                if (postData) {
                    postData.append("file", data.files);
                    postData.append("id", "nobot");
                    delete data.files;
                    $CQ.each(data, function(key, value) {
                        postData.append(key, value);
                    });
                }
            } else {
                postData = {
                    "id": "nobot"
                };
                _.extend(postData, data);
                postData = this.getCustomProperties(postData, data);
            }

            $CQ.ajax(SCF.config.urlRoot + this.get("id") + SCF.constants.URL_EXT, {
                dataType: "json",
                type: "POST",
                processData: !hasAttachment,
                contentType: (hasAttachment) ? false : "application/x-www-form-urlencoded; charset=UTF-8",
                xhrFields: {
                    withCredentials: true
                },
                data: this.addEncoding(postData),
                "success": success,
                "error": error
            });
        }
    });

    var FilelibraryView = SCF.CommentSystemView.extend({
        viewName: "FilelibraryView",
        FOLLOW_EVENT: "SCFFollow",
        VIEW_EVENT: "SCFView",
        COMMUNITY_FUNCTION: "File Library",
        onDragEnter: function(e) {
            e.stopPropagation();
            e.preventDefault();
            $(e.currentTarget).css('border', '2px dotted #0B85A1');
        },
        onDragLeave: function(e) {
            e.stopPropagation();
            e.preventDefault();
            $(e.currentTarget).css('border', '2px solid #e2e2e2');
        },
        onDragOver: function(e) {
            e.stopPropagation();
            e.preventDefault();
        },
        onDrop: function(e) {
            $(e.currentTarget).css('border', '2px solid #0B85A1');
            e.preventDefault();
            var files = e.originalEvent.dataTransfer.files;
            this.handleFileUpload(files, e);
        },
        clearClipboard: function() {
            this.model.clearClipboard();
        },
        paste: function() {
            var clipBoard = localStorage.getItem(Document.prototype.FILELIBRARY_CLIPBOARD);
            if (_.isUndefined(clipBoard) || clipBoard == null || clipBoard.count <= 0) {
                // emit an error message
                SCF.log.error("There are no clipboard items to paste");
            } else {
                var parentPath = this.model.get("id");
                clipBoard = JSON.parse(clipBoard);
                _.each(clipBoard.itemsToMove, function(item) {
                    if (this.model.moveFiles) {
                        this.model.moveFiles({
                            "resourcePath": item.id,
                            "parentPath": parentPath
                        });
                    } else {
                        SCF.Filelibrary.prototype.moveFiles.apply(this.model, [{
                            "resourcePath": item.id,
                            "parentPath": parentPath
                        }]);
                    }
                }, this);
                if (this.model.clearClipboard) {
                    this.model.clearClipboard();
                } else {
                    SCF.Filelibrary.prototype.clearClipboard.apply(this.model);
                }

            }
        },
        init: function() {
            this.lastSelection = null;
            this.dragtargetEl = $("#scf-filelibrary-dragtarget");

            this.modalFolder = null;
            this.modalDocument = null;

            var _self = this;

            this.listenTo(this.model.get("items"), "comment:deleted", function(removedModel) {
                location.reload();
            });

            this.listenTo(this.model, this.model.events.UPDATED, this.update);

            this.maxFileSize = this.model.get("configuration").maxFileSize;
            this.fileTypes = this.model.get("configuration").allowedFileTypes ? this.model.get("configuration").allowedFileTypes : [];

            SCF.CommentSystemView.prototype.init.apply(this);
        },
        initAnalytics: function() {
            SCF.Context.communityFunction = this.COMMUNITY_FUNCTION;
            SCF.Context.path = this.model.id;
            SCF.Context.type = this.model.get("resourceType");
            SCF.Context.ugcTitle = this.model.get("subject");
            if (!_.isUndefined(window._satellite)) {
                window._satellite.track("communities-scf-view");
            } else if (cqAnalytics.Sitecatalyst) {
                /*
                 * Suppress the next Analytics tracking call so that the default page call and this call
                 * don't result in a double call.
                 */
                window.s.abort = true;

                cqAnalytics.record({
                    event: this.VIEW_EVENT,
                    values: {
                        "functionType": SCF.Context.communityFunction ?
                            SCF.Context.communityFunction : this.COMMUNITY_FUNCTION,
                        "path": SCF.Context.path ? SCF.Context.path : this.model.get("id"),
                        "type": SCF.Context.type ? SCF.Context.type : this.model.get("resourceType"),
                        "ugcTitle": SCF.Context.ugcTitle,
                        "siteTitle": SCF.Context.siteTitle ?
                            SCF.Context.siteTitle : $(".scf-js-site-title").text(),
                        "sitePath": SCF.Context.sitePath ? SCF.Context.sitePath : this.sitePath,
                        "groupTitle": SCF.Context.groupTitle,
                        "groupPath": SCF.Context.groupPath,
                        "user": SCF.Context.user ? SCF.Context.user : SCF.Session.get("authorizableId")
                    },
                    collect: false,
                    componentPath: SCF.constants.ANALYTICS_BASE_RESOURCE_TYPE
                });
            }
        },
        onRowSelect: function(e) {
            if (this.lastSelection == e.currentTarget) {
                $(this.lastSelection).removeClass("scf-fl-selected-tag");
                $("#scf-filelibrary-actions-toolbars-container").addClass("scf-filelibrary-actions-toolbars-hidden");
                this.lastSelection = null;
                return;
            } else {
                $("#scf-filelibrary-actions-toolbars-container").removeClass("scf-filelibrary-actions-toolbars-hidden");
            }
            if (null != this.lastSelection) {
                $(this.lastSelection).removeClass("scf-fl-selected-tag");
            }
            $(e.currentTarget).addClass("scf-fl-selected-tag");
            this.lastSelection = e.currentTarget;
        },
        openModalCreateFolder: function(e) {
            var _parent = $("#scf-filelibrary-modal-new-folder");
            this.modalFolder = this.launchModal(_parent, CQ.I18n.getMessage("New Folder"));
        },
        createFolder: function(e) {
            var _name = $('#scf-folder-create').val();
            var _message = $('#scf-folder-edit-message').val();
            var data = _.extend(this.getOtherProperties(), {
                "message": _message,
                "name": _name,
                "messageEncoded": false,
                ":operation": "social:createFileLibraryFolder"
            });

            this.model.addComment(data);

            this.modalFolder();
            this.modalFolder = undefined;
        },
        createFolderCancel: function() {
            this.modalFolder();
            this.modalFolder = undefined;
        },
        openModalAddDocument: function(e) {
            var _parent = $("#scf-filelibrary-modal-new-document");
            this.modalDocument = this.launchModal(_parent, CQ.I18n.getMessage("Add Document"));
        },
        isFileNameOk: function(fname) {
            var _isFileNameOk = true;
            var _tempArr = (fname).toLowerCase().split(".");
            var _fileName = _tempArr[0];
            for(var i = 1; i < _tempArr.length-1; i++){
                _fileName = _fileName + _tempArr[i];
            }
            if(_fileName.indexOf("[")!=-1 || _fileName.indexOf("]")!=-1
            || _fileName.indexOf("/")!=-1 || _fileName.indexOf(":")!=-1
            || _fileName.indexOf("|")!=-1 || _fileName.indexOf("*")!=-1){
               _isFileNameOk = false;
            }
            return _isFileNameOk;
        },
        isFileTypeOk: function(fname) {
            var _isFileTypeOk = false;
            var _tempArr = (fname).toLowerCase().split(".");
            var _fileExt = "." + _tempArr[_tempArr.length - 1];

            if (null == this.fileTypes || 0 == this.fileTypes.length) {
                _isFileTypeOk = true;
            } else {
                for (var j = 0; j < this.fileTypes.length; j++) {
                    if (_fileExt == this.fileTypes[j]) {
                        _isFileTypeOk = true;
                    }
                }
            }
            return _isFileTypeOk;
        },
        addDocument: function(e) {
            var _files = $("#scf-file-upload-form-fileupload").get(0).files;
            if (_files.length < 1) {
                return;
            }
            
            if (false == this.isFileNameOk(_files[0].name)) {
                alert(CQ.I18n.getMessage("Filename containing characters [ , ] , / , : , | , * is not supported"));
                return;
            }

            if (false == this.isFileTypeOk(_files[0].name)) {
                alert(CQ.I18n.getMessage("Filetype is not supported"));
                return;
            }

            var _message = $('#scf-document-create-message').val();
            var _tags = this.getField("tags");

            var data = _.extend(this.getOtherProperties(), {
                "message": _message,
                "name": _files[0].name,
                "tags": _tags,
                ":operation": "social:createFileLibraryDocument",
                "messageEncoded": false
            });
            data.files = _files[0];

            this.model.addComment(data);
            this.modalDocument();
            this.modalDocument = undefined;
        },
        addDocumentCancel: function(e) {
            $("#scf-file-upload-form-fileupload").val("");
            this.modalDocument();
            this.modalDocument = undefined;
        },
        handleFileUpload: function(files, evt) {
            for (var i = 0; i < files.length; i++) {
                var _isFileTypeOk = this.isFileTypeOk(files[i].name);
                var _isFileNameOk = this.isFileNameOk(files[i].name);
                if (files[i].size <= this.maxFileSize) {
                    if(true == _isFileNameOk){
                    if (true == _isFileTypeOk) {
                        var data = _.extend(this.getOtherProperties(), {
                            "message": "",
                            "name": files[i].name,
                            ":operation": "social:createFileLibraryDocument",
                            "messageEncoded": false
                        });
                        data.files = files[i];
                        this.model.addComment(data, this.updateProgressStatus(i, files.length));
                    } else {
                        alert(CQ.I18n.getMessage("Filetype is not supported"));
                    }
                } else {
                    alert(CQ.I18n.getMessage("Filename containing characters [ , ] , / , : , | , * is not supported"));
                }
                } else {
                    alert(CQ.I18n.getMessage("The file size exeeds max file size limit"));
                }
            }
            this.onDragLeave(evt);
        },
        updateProgressStatus: function(i, total) {
            $('#scf-upload-progress-bar-container').removeClass("scf-filelibrary-actions-toolbars-hidden");
            $('#scf-upload-progress-text').text(CQ.I18n.getMessage("Uploading") + " " + (i + 1) + " " + CQ.I18n.getMessage("of") + " " + total);
            var current = ((i + 1) / total * 100);
            $('#scf-upload-progress-bar').attr("aria-valuenow", current);
            $('#scf-upload-progress-bar').css("width", current + "%");
            if (i == total) {
                $('#scf-upload-progress-bar-container').addClass("scf-filelibrary-actions-toolbars-hidden");
            }
        },
        afterRender: function() {
            var pageInfo = this.model.get("pageInfo"),
                pageConfig = this.model.get("configuration"),
                sortField,
                sortIndex,
                isOrderReversed,
                srtIcon = "",
                srtLabel = "";

            if (pageInfo && pageInfo.sortIndex) {
                sortIndex = sortField = pageInfo.sortIndex;
            } else {
                sortField = pageConfig.sortFields[0].key;
            }
            if (!sortField) {
                sortField = "";
            }
            isOrderReversed = pageInfo.orderReversed;

            if (sortField) {
                switch (true) {
                    case (sortField === "latestActivityDate_dt"):
                        srtLabel = (!isOrderReversed ? CQ.I18n.get("Last updated") : CQ.I18n.get("Oldest"));
                        break;
                    case (sortField === "jcr:title"):
                        srtLabel = CQ.I18n.get("File name " + (!isOrderReversed ? "(descending)" : "(ascending)"));
                        break;
                    default:
                        srtLabel = CQ.I18n.get("Sort By");
                }
                this.$el.find(".scf-sort-btngrp-btnlabel").text(srtLabel);
            }
        }
    });

    SCF.Filelibrary = Filelibrary;
    SCF.FilelibraryView = FilelibraryView;

    var Folder = SCF.CommentSystem.extend({
        modelName: "FolderModel",
        createOperation: "social:createFileLibraryFolder",
        getParent: function() {
            return SCF.Models[this.constructor.prototype.relationships.items.model];
        },
        fixCachedProperties: function() {
            SCF.Filelibrary.prototype.loadClipboard.apply(this);
        },
        events: {
            ADD: "filelibrary-folder:added",
            UPDATED: "filelibrary-folder:updated"
        },
        addComment: function(data, scb, fcb) {
            $CQ('.scf-attachment-error').remove();

            var success = _.bind(function(response) {
                var comment = response.response;
                var CommentKlass = SCF.Models[this.constructor.prototype.relationships.items.model];
                var newComment = new CommentKlass(comment);

                if (!newComment.get("isVisible")) {
                    this.view.showUGCLimitDialog(null, true);
                }

                newComment.set("_isNew", true);
                newComment._isReady = true;
                var comments = this.get("items");
                var isCollectionNew = false;
                if (!comments) {
                    var CollectionKlass = SCF.Collections[this.constructor.prototype.relationships.items.collection] || Backbone.Collection;
                    comments = new CollectionKlass();
                    comments.model = CommentKlass;
                    comments.parent = this;
                    isCollectionNew = true;
                }
                comments.unshift(newComment);
                var totalComments = this.get("totalSize");
                if (isCollectionNew) {
                    this.set("items", comments);
                }
                this.set("totalSize", totalComments + 1);
                newComment.constructor.prototype._cachedModels[comment.id] = newComment;
                this.trigger(this.events.ADD, {
                    model: this
                });
                if (null != scb) {
                    scb;
                }
            }, this);
            var error = _.bind(function(jqxhr, text, error) {
                if (500 == jqxhr.status) {
                    var _parentEl = $CQ('.scf-composer-block')[0];
                    if (null == _parentEl) {
                        _parentEl = $CQ(document.body);
                    }
                    $CQ('<div class="scf-attachment-error"><h3 class="scf-js-error-message">' + CQ.I18n.getMessage("Server error. Please try again.") + '</h3><div>').appendTo(_parentEl);

                    return false;
                }

                this.trigger(this.events.ADD_ERROR, this.parseServerError(jqxhr, text, error));
            }, this);

            var postData;
            var hasAttachment = (typeof data.files !== "undefined");

            if (hasAttachment) {
                if (window.FormData) {
                    postData = new FormData();
                }

                if (postData) {
                    postData.append("file", data.files);
                    postData.append("id", "nobot");
                    delete data.files;
                    $CQ.each(data, function(key, value) {
                        postData.append(key, value);
                    });
                }
            } else {
                postData = {
                    "id": "nobot"
                };
                _.extend(postData, data);
                postData = this.getCustomProperties(postData, data);
            }

            $CQ.ajax(SCF.config.urlRoot + this.get("id") + SCF.constants.URL_EXT, {
                dataType: "json",
                type: "POST",
                processData: !hasAttachment,
                contentType: (hasAttachment) ? false : "application/x-www-form-urlencoded; charset=UTF-8",
                xhrFields: {
                    withCredentials: true
                },
                data: this.addEncoding(postData),
                "success": success,
                "error": error
            });

        },
        allow: function() {
            var error = _.bind(function(jqxhr, text, error) {
                this.log.error("error allowing comment " + error);
                this.trigger('comment:allowerror', {
                    'error': error
                });
            }, this);
            var success = _.bind(function(response) {
                this.reset(response.response);
                this.trigger('comment:allowed', {
                    model: this
                });
                this.trigger(this.events.UPDATED, {
                    model: this
                });
            }, this);
            var postData = {
                'id': 'nobot',
                ':operation': 'social:allow'
            };
            $CQ.ajax(SCF.config.urlRoot + this.get('id') + SCF.constants.URL_EXT, {
                dataType: 'json',
                type: 'POST',
                xhrFields: {
                    withCredentials: true
                },
                data: this.addEncoding(postData),
                'success': success,
                'error': error
            });
        },
        deny: function() {
            var error = _.bind(function(jqxhr, text, error) {
                this.log.error("error denying comment " + error);
                this.trigger('comment:denyerror', {
                    'error': error
                });
            }, this);
            var success = _.bind(function(response) {
                this.reset(response.response);
                this.trigger('comment:denied', {
                    model: this
                });
                this.trigger(this.events.UPDATED, {
                    model: this
                });
            }, this);
            var postData = {
                'id': 'nobot',
                ':operation': 'social:deny'
            };
            $CQ.ajax(SCF.config.urlRoot + this.get('id') + SCF.constants.URL_EXT, {
                dataType: 'json',
                type: 'POST',
                xhrFields: {
                    withCredentials: true
                },
                data: this.addEncoding(postData),
                'success': success,
                'error': error
            });
        }
    });
    var FolderView = SCF.CommentSystemView.extend({
        viewName: "FolderView",
        FOLLOW_EVENT: "SCFFollow",
        VIEW_EVENT: "SCFView",
        COMMUNITY_FUNCTION: "File Library",
        init: function() {
            this.lastSelection = null;
            this.dragtargetEl = $("#scf-filelibrary-dragtarget");

            this.modalEditFolder = null;
            this.modalFolder = null;
            this.modalDocument = null;
            this.modalDeleteItem = null;

            this.currentName = "";

            this.maxFileSize = this.model.get("configuration").maxFileSize;

            this.listenTo(this.model, this.model.events.UPDATED, this.update);

            this.fileTypes = this.model.get("configuration").allowedFileTypes ? this.model.get("configuration").allowedFileTypes : [];

            SCF.CommentSystemView.prototype.init.apply(this);
        },
        initAnalytics: function() {
            /*
             * If the suffix is the same as the object id we are on our own page
             * as opposed to being part of list of topics. Only in the former case we
             * want to track an analytics view event.
             */
            if (this.model.id === SCF.Util.getContextPath()) {
                SCF.Context.communityFunction = this.COMMUNITY_FUNCTION;
                SCF.Context.path = this.model.id;
                SCF.Context.type = this.model.get("resourceType");
                SCF.Context.ugcTitle = this.model.get("subject");
                if (!_.isUndefined(window._satellite)) {
                    window._satellite.track("communities-scf-view");
                } else if (cqAnalytics.Sitecatalyst) {
                    /*
                     * Suppress the next Analytics tracking call so that the default page call and this call
                     * don't result in a double call.
                     */
                    window.s.abort = true;
                    // record topic view event
                    cqAnalytics.record({
                        event: this.VIEW_EVENT,
                        values: {
                            "functionType": SCF.Context.communityFunction ?
                                SCF.Context.communityFunction : this.COMMUNITY_FUNCTION,
                            "path": SCF.Context.path ? SCF.Context.path : this.model.get("id"),
                            "type": SCF.Context.type ? SCF.Context.type : this.model.get("resourceType"),
                            "ugcTitle": SCF.Context.ugcTitle,
                            "siteTitle": SCF.Context.siteTitle ?
                                SCF.Context.siteTitle : $(".scf-js-site-title").text(),
                            "sitePath": SCF.Context.sitePath ? SCF.Context.sitePath : this.sitePath,
                            "groupTitle": SCF.Context.groupTitle,
                            "groupPath": SCF.Context.groupPath,
                            "user": SCF.Context.user ? SCF.Context.user : SCF.Session.get("authorizableId")
                        },
                        collect: false,
                        componentPath: SCF.constants.ANALYTICS_BASE_RESOURCE_TYPE
                    });
                }
            }
        },
        onDragEnter: function(e) {
            e.stopPropagation();
            e.preventDefault();
            $(e.currentTarget).css('border', '2px dotted #0B85A1');
        },
        onDragLeave: function(e) {
            e.stopPropagation();
            e.preventDefault();
            $(e.currentTarget).css('border', '2px solid #e2e2e2');
        },
        onDragOver: function(e) {
            e.stopPropagation();
            e.preventDefault();
        },
        onDrop: function(e) {
            $(e.currentTarget).css('border', '2px solid #0B85A1');
            e.preventDefault();
            var files = e.originalEvent.dataTransfer.files;
            this.handleFileUpload(files, e);
        },
        clearClipboard: function() {
            SCF.Filelibrary.prototype.clearClipboard.apply(this.model);
        },
        paste: function() {
            SCF.FilelibraryView.prototype.paste.apply(this);
        },
        onRowSelect: function(e) {
            if (this.lastSelection == e.currentTarget) {
                $(this.lastSelection).removeClass("scf-fl-selected-tag");
                $("#scf-filelibrary-actions-toolbars-container").addClass("scf-filelibrary-actions-toolbars-hidden");
                this.lastSelection = null;
                return;
            } else {
                $("#scf-filelibrary-actions-toolbars-container").removeClass("scf-filelibrary-actions-toolbars-hidden");
            }
            if (null != this.lastSelection) {
                $(this.lastSelection).removeClass("scf-fl-selected-tag");
            }
            $(e.currentTarget).addClass("scf-fl-selected-tag");
            this.lastSelection = e.currentTarget;

        },
        openModalAddDocument: function(e) {
            var _parent = $("#scf-filelibrary-modal-new-document");
            this.modalDocument = this.launchModal(_parent, CQ.I18n.getMessage("Add Document"));
        },
        openModalCreateFolder: function(e) {
            var _parent = $("#scf-filelibrary-modal-new-folder");
            this.modalFolder = this.launchModal(_parent, CQ.I18n.getMessage("New Folder"));
        },
        createFolder: function(e) {
            var _name = $('#scf-folder-create').val();
            var _message = $('#scf-folder-edit-message').val();

            var data = _.extend(this.getOtherProperties(), {
                "message": _message,
                "name": _name,
                ":operation": "social:createFileLibraryFolder",
                "messageEncoded": false
            });

            this.model.addComment(data);

            this.modalFolder();
            this.modalFolder = undefined;
        },
        createFolderCancel: function() {
            this.modalFolder();
            this.modalFolder = undefined;

        },

        openFolderEdit: function(el) {
            var _parent = $('<div class="scf-filelibrary-modal-container"></div>');
            var _div_inputs = $('<div></div>');
            _div_inputs.appendTo(_parent);
            $('<p>' + CQ.I18n.getMessage("Folder Name") + '</p>').appendTo(_div_inputs);
            this.folder_name = $('<input type="text" class="scf-filelibrary-item-name">');
            this.folder_name.appendTo(_div_inputs);
            this.folder_name.val(this.model.get("name"));

            $('<span class="scf-filelibrary-spacer"></span>').appendTo(_div_inputs);
            $('<p>' + CQ.I18n.getMessage("Folder Description") + '</p>').appendTo(_div_inputs);
            this.folder_desc = $('<textarea class="scf-filelibrary-item-description"></textarea>');
            this.folder_desc.appendTo(_div_inputs);
            var msg = this.model.get("message");
            msg = $CQ("<div/>").html(msg).text();
            this.folder_desc.val(msg);

            $('<span class="scf-filelibrary-spacer"></span>').appendTo(_parent);

            var _div_controls = $('<div></div>');
            _div_controls.appendTo(_parent);

            var _self = this;

            var _b_close = $('<button type="button" class="btn btn-default" style="margin-right:4px;">' + CQ.I18n.getMessage("Close") + '</button>');
            _b_close.appendTo(_div_controls);

            $(_b_close).on("click", function(e) {
                _self.editFolderCancel();
            });

            var _b_ok = $('<button type="button" class="btn btn-primary">' + CQ.I18n.getMessage("OK") + '</button>');
            _b_ok.appendTo(_div_controls);
            $(_b_ok).on("click", function(e) {
                _self.editFolder();
            });

            this.modalEditFolder = this.launchModal(_parent, CQ.I18n.getMessage("Edit Folder"));

        },

        editFolder: function(e) {
            var _name = this.folder_name.val();
            var _message = this.folder_desc.val();

            var data = _.extend(this.getOtherProperties(), {
                "message": _message,
                "name": _name,
                ":operation": "social:updateFileLibrary",
                "messageEncoded": false,
                "id": "nobot",
                "_charset_": "UTF-8"
            });

            if (null == _name && "" == _name) {
                alert(CQ.I18n.getMessage("New name cannot be empty"));
                return;
            }
            this.saveFolderUpdate(data);
            this.modalEditFolder();
            this.modalEditFolder = undefined;
        },
        editFolderCancel: function() {
            this.modalEditFolder();
            this.modalEditFolder = undefined;
        },
        deleteFolder: function() {
            this.model.remove();
            this.modalDeleteItem();
            this.modalDeleteItem = undefined;
        },
        deleteFolderCancel: function() {
            this.modalDeleteItem();
            this.modalDeleteItem = undefined;
        },
        saveFolderUpdate: function(data) {
            var _self = this;
            var _model = this.model;
            var error = _.bind(function(jqxhr, text, error) {
                this.trigger(this.events.UPDATE_ERROR, {
                    'error': error
                });
            }, this);

            var success = _.bind(function(response) {

                _model.reset(response.response, {
                    silent: true
                });
                _self.render();
                if (_model.get('isVisible')) {
                    _model.trigger(_model.events.UPDATED, {
                        model: _model
                    });
                } else {
                    _model.trigger(_model.events.DELETED, {
                        model: _model
                    });
                    _model.trigger('destroy', this);
                };
            }, this);

            var postData = data;
            var hasAttachment = (typeof data.files !== "undefined");

            $CQ.ajax(SCF.config.urlRoot + this.model.get('id') + SCF.constants.URL_EXT, {
                dataType: 'json',
                processData: !hasAttachment,
                contentType: (hasAttachment) ? false : 'application/x-www-form-urlencoded; charset=UTF-8',
                type: 'POST',
                xhrFields: {
                    withCredentials: true
                },
                data: postData,
                'success': success,
                'error': error
            });

        },
        isFileNameOk: function(fname) {
            var _isFileNameOk = true;
            var _tempArr = (fname).toLowerCase().split(".");
            var _fileName = _tempArr[0];
            for(var i = 1; i < _tempArr.length-1; i++){
                _fileName = _fileName + _tempArr[i];
            }
            if(_fileName.indexOf("[")!=-1 || _fileName.indexOf("]")!=-1
            || _fileName.indexOf("/")!=-1 || _fileName.indexOf(":")!=-1
            || _fileName.indexOf("|")!=-1 || _fileName.indexOf("*")!=-1){
               _isFileNameOk = false;
            }
            return _isFileNameOk;
        },
        isFileTypeOk: function(fname) {
            var _isFileTypeOk = false;
            var _tempArr = (fname).toLowerCase().split(".");
            var _fileExt = "." + _tempArr[_tempArr.length - 1];

            if (null == this.fileTypes || 0 == this.fileTypes.length) {
                _isFileTypeOk = true;
            } else {
                for (var j = 0; j < this.fileTypes.length; j++) {
                    if (_fileExt == this.fileTypes[j]) {
                        _isFileTypeOk = true;
                    }
                }
            }
            return _isFileTypeOk;
        },
        handleFileUpload: function(files, evt) {
            for (var i = 0; i < files.length; i++) {
                var _isFileTypeOk = this.isFileTypeOk(files[i].name);
                var _isFileNameOk = this.isFileNameOk(files[i].name);
                if (files[i].size <= this.maxFileSize) {
                    if(true == _isFileNameOk){
                    if (true == _isFileTypeOk) {
                        var data = _.extend(this.getOtherProperties(), {
                            "message": "",
                            "name": files[i].name,
                            "messageEncoded": false,
                            ":operation": "social:createFileLibraryDocument"
                        });
                        data.files = files[i];
                        this.model.addComment(data, this.updateProgressStatus(i, files.length));
                    } else {
                        alert(CQ.I18n.getMessage("Filetype is not supported"));
                    }
                    } else {
                        alert(CQ.I18n.getMessage("Filename containing characters [ , ] , / , : , | , * is not supported"));
                    }
                } else {
                    alert(CQ.I18n.getMessage("The file size exeeds max file size limit"));
                }
            }
            this.onDragLeave(evt);
        },
        updateProgressStatus: function(i, total) {
            $('#scf-upload-progress-bar-container').removeClass("scf-filelibrary-actions-toolbars-hidden");
            $('#scf-upload-progress-text').text(CQ.I18n.getMessage("Uploading") + " " + (i + 1) + " " + CQ.I18n.getMessage("of") + " " + total);
            var current = ((i + 1) / total * 100);
            $('#scf-upload-progress-bar').attr("aria-valuenow", current);
            $('#scf-upload-progress-bar').css("width", current + "%");
            if (i == total) {
                $('#scf-upload-progress-bar-container').addClass("scf-filelibrary-actions-toolbars-hidden");
            }
        },

        addDocument: function(e) {
            var _files = $("#scf-file-upload-form-fileupload").get(0).files;
            if (_files.length < 1) {
                return;
            }
            
            if (false == this.isFileNameOk(_files[0].name)) {
                alert(CQ.I18n.getMessage("Filename containing characters [ , ] , / , : , | , * is not supported"));
                return;
            }

            if (false == this.isFileTypeOk(_files[0].name)) {
                alert(CQ.I18n.getMessage("Filetype is not supported"));
                return;
            }

            //var _tags = this.getField("tags");
            var _message = $('#scf-document-create-message').val();
            var data = _.extend(this.getOtherProperties(), {
                "message": _message,
                "name": _files[0].name,
                "messageEncoded": false,
                //"tags": _tags,
                ":operation": "social:createFileLibraryDocument"
            });
            data.files = _files[0];

            this.model.addComment(data);

            this.modalDocument();
            this.modalDocument = undefined;
        },
        addDocumentCancel: function(e) {
            $("#scf-file-upload-form-fileupload").val("");
            this.modalDocument();
            this.modalDocument = undefined;
        },
        onFolderRowClick: function(e) {
            var _self = this;
            $('#scf-filelibrary-actions-toolbars-container').empty();
            var _tb = $('<div class="panel-heading">');
            $(_tb).appendTo($('#scf-filelibrary-actions-toolbars-container'));

            if (this.model.get("canDelete")) {
                var _button_d = $('<button class="btn btn-default">' + CQ.I18n.getMessage("Delete") + '</button>');
                _button_d.appendTo($(_tb));
                $(_button_d).on("click", function(e) {
                    _self.onFolderDelete();
                });
            }

            var _button_deny = $('<button class="btn btn-default">' + CQ.I18n.getMessage("Deny") + '</button>');
            _button_deny.appendTo($(_tb));
            if (!this.model.get("moderatorActions").canDeny) {
                _button_deny.hide();
            }
            var _button_allow = $('<button class="btn btn-default">' + CQ.I18n.getMessage("Allow") + '</button>');
            _button_allow.appendTo($(_tb));
            if (!this.model.get("moderatorActions").canAllow) {
                _button_allow.hide();
            }

            $(_button_deny).on("click", function(e) {
                _self.model.deny(e);
                _button_deny.hide();
                _button_allow.show();
            });
            $(_button_allow).on("click", function(e) {
                _self.model.allow(e);
                _button_allow.hide();
                _button_deny.show();
            });

            if (this.model.get("canEdit")) {
                var _button_e = $('<button class="btn btn-default">' + CQ.I18n.getMessage("Edit") + '</button>');
                _button_e.appendTo($(_tb));
                var _target = e.currentTarget;
                $(_button_e).on("click", function(e) {
                    _self.openFolderEdit(_target);
                });
            }

            if (!this.model.get("canEdit") && !this.model.get("canDelete")) {
                var _button_e = $('<button style="visibility:hidden;" class="btn btn-default">&nbsp;</button>');
                _button_e.appendTo($(_tb));
            }
        },
        onFolderDelete: function() {
            var _parent = $('<div class="scf-filelibrary-modal-container-delete"></div>');
            _parent.empty();
            $('<p>' + CQ.I18n.getMessage("Are you sure?") + '</p>').appendTo(_parent);
            $('<span class="scf-filelibrary-spacer"></span>').appendTo(_parent);

            var _div_controls = $('<div></div>');
            _div_controls.appendTo(_parent);

            var _self = this;

            var _b_close = $('<button type="button" class="btn btn-default" style="margin-right:4px;">' + CQ.I18n.getMessage("Cancel") + '</button>');
            _b_close.appendTo(_div_controls);

            $(_b_close).on("click", function(e) {
                _self.deleteFolderCancel();
            });

            var _b_ok = $('<button type="button" class="btn btn-primary">' + CQ.I18n.getMessage("OK") + '</button>');
            _b_ok.appendTo(_div_controls);
            $(_b_ok).on("click", function(e) {
                _self.deleteFolder();
            });

            this.modalDeleteItem = this.launchModal(_parent, CQ.I18n.getMessage("Delete"));
        },
        afterRender: function() {
            this.updateCrumbs();
        },
        updateCrumbs: function() {
            if (this.$el.attr("data-scf-template")) {
                return;
            }
            var crumbs = [];
            crumbs.push({
                "title": CQ.I18n.get("File Library"),
                "url": this.model.get("pageInfo").basePageURL + ".html"
            });
            if (this.model.get("parentId") === this.model.get("sourceComponentId")) {
                crumbs.push({
                    "title": this.model.get("name"),
                    "url": "",
                    "active": true
                });
            } else {
                var endOfSource = this.model.get("parentId").indexOf(this.model.get("sourceComponentId"));
                endOfSource += this.model.get("sourceComponentId").length;
                var superParentId = this.model.get("parentId").substr(endOfSource);
                if (superParentId.substr(0, _.lastIndexOf(superParentId, "/")).length > 0) {
                    var superParentUrl = this.model.get("parentFriendlyUrl").substr(0,
                        _.lastIndexOf(this.model.get("parentFriendlyUrl"), "/"));
                    crumbs.push({
                        "title": "... ",
                        "url": superParentUrl + ".html",
                        "active": false
                    });
                }
                crumbs.push({
                    "title": this.model.get("parentName"),
                    "url": this.model.get("parentFriendlyUrl"),
                    "active": false
                });
                crumbs.push({
                    "title": this.model.get("name"),
                    "url": "",
                    "active": true
                });
            }
            SCF.Util.announce("crumbs", {
                "crumbs": crumbs
            });
        }
    });
    var Document = SCF.Comment.extend({
        modelName: "DocumentModel",
        createOperation: "social:createFileLibraryDocument",
        FILELIBRARY_CLIPBOARD: "scf:filelibrary:clipboard",
        remove: function() {
            SCF.Comment.prototype.remove.apply(this);
        },
        addToClipBoard: function() {
            if (typeof(Storage) == "undefined") {
                SCF.log.error("Unable to move document, please use a supported browser");
            }
            var clipBoard = localStorage.getItem(this.FILELIBRARY_CLIPBOARD);
            if (_.isUndefined(clipBoard) || clipBoard == null) {
                clipBoard = {
                    count: 0,
                    itemsToMove: {}
                };
            } else {
                clipBoard = JSON.parse(clipBoard);
            }
            var item = {
                id: this.id,
                title: this.get("title"),
                url: this.get("friendlyURL")
            };
            clipBoard.itemsToMove[this.id] = item;
            clipBoard.count++;
            this.attributes.hasBeenCut = true;
            localStorage.setItem(this.FILELIBRARY_CLIPBOARD, JSON.stringify(clipBoard));
            this.trigger(this.events.UPDATED, {
                model: this
            });
        },
        removeFromClipboard: function() {
            if (typeof(Storage) == "undefined") {
                SCF.log.error("Unable to move document, please use a supported browser");
            }
            var clipBoard = localStorage.getItem(this.FILELIBRARY_CLIPBOARD);
            clipBoard = JSON.parse(clipBoard);
            clipBoard.count--;
            clipBoard.itemsToMove[this.id] = undefined;
            this.attributes.hasBeenCut = false;
            localStorage.setItem(this.FILELIBRARY_CLIPBOARD, JSON.stringify(clipBoard));
            this.trigger(this.events.UPDATED, {
                model: this
            });
        },
        fixCachedProperties: function() {
            var id = this.get("sourceComponentId") ? this.get("sourceComponentId") : this.get("id");
            var userIsModerator = SCF.Session.checkIfModeratorFor(id);
            this.attributes.moderatorActions.canMove = userIsModerator && !this.attributes.isClosed &&
                this.attributes.configuration.moveAllowed;
            var hasBeenCut = this.hasBeenCut();
            this.attributes.hasBeenCut = hasBeenCut;
        },
        hasBeenCut: function() {
            var clipboard = localStorage.getItem(this.FILELIBRARY_CLIPBOARD);
            if (clipboard == null || _.isUndefined(clipboard)) {
                return false;
            }
            clipboard = JSON.parse(clipboard);
            var item = clipboard.itemsToMove[this.id];
            if (_.isUndefined(item)) {
                return false;
            } else {
                return true;
            }
        },
        relationships: _.extend({
            "rating": {
                model: "RatingModel"
            }
        }, SCF.Comment.prototype.relationships)
    });

    var DocumentView = SCF.CommentView.extend({
        viewName: "DocumentView",
        FOLLOW_EVENT: "SCFFollow",
        VIEW_EVENT: "SCFView",
        COMMUNITY_FUNCTION: "File Library",
        init: function() {
            this.modalEditDocument = null;
            this.modalUpdateDocument = null;
            this.modalDelete = null;
            SCF.CommentView.prototype.init.apply(this);
        },
        initAnalytics: function() {
            /*
             * If the suffix is the same as the object id we are on our own page
             * as opposed to being part of list of topics. Only in the former case we
             * want to track an analytics view event.
             */
            if (this.model.id === SCF.Util.getContextPath()) {
                SCF.Context.communityFunction = this.COMMUNITY_FUNCTION;
                SCF.Context.path = this.model.id;
                SCF.Context.type = this.model.get("resourceType");
                SCF.Context.ugcTitle = this.model.get("subject");
                if (!_.isUndefined(window._satellite)) {
                    window._satellite.track("communities-scf-view");
                } else if (cqAnalytics.Sitecatalyst) {
                    /*
                     * Suppress the next Analytics tracking call so that the default page call and this call
                     * don't result in a double call.
                     */
                    window.s.abort = true;
                    // record topic view event
                    cqAnalytics.record({
                        event: this.VIEW_EVENT,
                        values: {
                            "functionType": SCF.Context.communityFunction ?
                                SCF.Context.communityFunction : this.COMMUNITY_FUNCTION,
                            "path": SCF.Context.path ? SCF.Context.path : this.model.get("id"),
                            "type": SCF.Context.type ? SCF.Context.type : this.model.get("resourceType"),
                            "ugcTitle": SCF.Context.ugcTitle,
                            "siteTitle": SCF.Context.siteTitle ?
                                SCF.Context.siteTitle : $(".scf-js-site-title").text(),
                            "sitePath": SCF.Context.sitePath ? SCF.Context.sitePath : this.sitePath,
                            "groupTitle": SCF.Context.groupTitle,
                            "groupPath": SCF.Context.groupPath,
                            "user": SCF.Context.user ? SCF.Context.user : SCF.Session.get("authorizableId")
                        },
                        collect: false,
                        componentPath: SCF.constants.ANALYTICS_BASE_RESOURCE_TYPE
                    });
                }
            }
        },
        afterRender: function() {
            this.updateCrumbs();
        },
        updateCrumbs: function() {
            return SCF.FolderView.prototype.updateCrumbs.call(this);
        },
        expandComposer: SCF.CommentSystemView.prototype.expandComposer,
        cancelComposer: SCF.CommentSystemView.prototype.cancelComposer,
        paginate: function() {
            var baseURL = SCF.config.urlRoot + this.model.get("id") + SCF.constants.SOCIAL_SELECTOR + ".";
            var parsedBasePath = arguments[0];
            var parsedOffset = arguments[1];
            var parsedSize = arguments[2];
            var parsedIndexName = (arguments.length <= 3) ? null : arguments[3];
            var url = null;
            if (arguments.length <= 3) {
                // There must not be an index requested.
                url = baseURL + parsedOffset + "." + parsedSize + SCF.constants.JSON_EXT;
            } else {
                // Must be an index:
                url = baseURL + "index." + parsedOffset + "." + parsedSize + "." + parsedIndexName + SCF.constants.JSON_EXT;
            }
            this.model.url = url;
            this.model.reload();
        },
        navigate: function(e) {
            var windowHost = window.location.protocol + "//" + window.location.host
            var suffix = $CQ(e.currentTarget).data("page-suffix");
            var pageInfo = this.model.get("pageInfo");
            var hostInfo = SCF.config.urlRoot;

            var suffix = $(e.currentTarget).data("pageSuffix") + "";
            var suffixInfo = suffix.split(".");

            if (pageInfo.sortIndex != null) {
                this.paginate(pageInfo.basePageURL, suffixInfo[0], suffixInfo[1], pageInfo.sortIndex);
            } else {
                this.paginate(pageInfo.basePageURL, suffixInfo[0], suffixInfo[1]);
            }

        },
        onDocumentRowClick: function(e) {
            $('#scf-filelibrary-actions-toolbars-container').empty();
            var _tb = $('<div class="panel-heading">');
            $(_tb).appendTo($('#scf-filelibrary-actions-toolbars-container'));

            if (this.model.get("canDelete")) {
                var _button_d = $('<button class="btn btn-default">' + CQ.I18n.getMessage("Delete") + '</button>');
                _button_d.appendTo($(_tb));
            }

            var _button_allow = $('<button class="btn btn-default">' + CQ.I18n.getMessage("Allow") + '</button>');
            _button_allow.appendTo($(_tb));
            if (!this.model.get("moderatorActions").canAllow) {
                _button_allow.hide();
            }

            var _button_deny = $('<button class="btn btn-default">' + CQ.I18n.getMessage("Deny") + '</button>');
            _button_deny.appendTo($(_tb));
            if (!this.model.get("moderatorActions").canDeny) {
                _button_deny.hide();
            }

            var _button_e = $('<button class="btn btn-default">' + CQ.I18n.getMessage("Details") + '</button>');
            _button_e.appendTo($(_tb));

            var _button_view = $('<button class="btn btn-default">' + CQ.I18n.getMessage("View") + '</button>');
            _button_view.appendTo($(_tb));

            var _button_download = $('<button class="btn btn-default">' + CQ.I18n.getMessage("Download") + '</button>');
            _button_download.appendTo($(_tb));

            var _self = this;

            $(_button_allow).on("click", function(e) {
                _self.allow(e);
                $(_button_allow).hide();
                $(_button_deny).show();
            });
            $(_button_deny).on("click", function(e) {
                _self.deny(e);
                $(_button_deny).hide();
                $(_button_allow).show();
            });
            $(_button_d).on("click", function(e) {
                _self.onDocumentDelete(_self);
            });
            $(_button_e).on("click", function(e) {
                _self.onDocumentEdit();
            });
            $(_button_view).on("click", function(e) {
                _self.onDocumentView();
            });
            $(_button_download).on("click", function(e) {
                _self.onDocumentDownload();
            });
        },
        onDocumentRowDoubleClick: function(e) {
            this.onDocumentView();
        },
        onDocumentRename: function(e) {
            var _parent = $("#scf-filelibrary-modal-edit-document");
            this.modalEditDocument = this.launchModal(_parent, CQ.I18n.getMessage("Edit Document"));
            var msg = this.model.get("message");
            msg = $CQ("<div/>").html(msg).text();
            $("#scf-filelibrary-document-new-message").val(msg);
        },
        doEditDocumentCancel: function() {
            this.modalEditDocument();
            this.modalEditDocument = undefined;
        },
        doEditDocument: function() {
            var _message = $('#scf-filelibrary-document-new-message').val();
            var _yyy = 0;
            var _tags = this.getField("tags_edit");

            var data = _.extend(this.getOtherProperties(), {
                "message": _message,
                "tags": _tags,
                "messageEncoded": false,
                ":operation": "social:updateFile",
                "id": "nobot"
            });
            var _files = $("#scf-file-upload-form-fileupload").get(0).files;
            data.files = _files;
            this.saveMyUpdates(data);

            this.modalEditDocument();
            this.modalEditDocument = undefined;
        },
        saveDocumentUpdate: function(data) {
            var _self = this;
            var _model = this.model;
            var error = _.bind(function(jqxhr, text, error) {
                this.trigger(this.events.UPDATE_ERROR, {
                    'error': error
                });
            }, this);

            var success = _.bind(function(response) {
                _model.reset(response.response, {
                    silent: true
                });
                if (_model.get('isVisible')) {
                    _model.trigger(_model.events.UPDATED, {
                        model: _model
                    });
                } else {
                    _model.trigger(_model.events.DELETED, {
                        model: _model
                    });
                    _model.trigger('destroy', this);
                };

                $("#scf-filelibrary-document-new-name-label").text(response.response.name);
                var _time = new Date(response.response.created);
                $("#scf-filelibrary-document-new-time-label").text(new Handlebars.SafeString(moment(_time).format("MMM DD YYYY, h:mm A")));

            }, this);

            var postData = data;
            var hasAttachment = (typeof data.files !== "undefined");


            $CQ.ajax(SCF.config.urlRoot + this.model.get('id') + SCF.constants.URL_EXT, {
                dataType: 'json',
                processData: !hasAttachment,
                contentType: (hasAttachment) ? false : 'application/x-www-form-urlencoded; charset=UTF-8',
                type: 'POST',
                xhrFields: {
                    withCredentials: true
                },
                data: postData,
                'success': success,
                'error': error
            });
        },
        onDocumentDelete: function() {
            var _parent = $('<div class="scf-filelibrary-modal-container-delete"></div>');
            _parent.empty();
            $('<p>' + CQ.I18n.getMessage("Are you sure?") + '</p>').appendTo(_parent);
            $('<span class="scf-filelibrary-spacer"></span>').appendTo(_parent);

            var _div_controls = $('<div></div>');
            _div_controls.appendTo(_parent);

            var _self = this;

            var _b_close = $('<button type="button" class="btn btn-default" style="margin-right:4px;">' + CQ.I18n.getMessage("Cancel") + '</button>');
            _b_close.appendTo(_div_controls);

            $(_b_close).on("click", function(e) {
                _self.deleteDocumentCancel();
            });

            var _b_ok = $('<button type="button" class="btn btn-primary">' + CQ.I18n.getMessage("OK") + '</button>');
            _b_ok.appendTo(_div_controls);
            $(_b_ok).on("click", function(e) {
                _self.deleteDocument();
            });

            this.modalDelete = this.launchModal(_parent, CQ.I18n.getMessage("Delete"));
        },
        deleteDocument: function() {
            this.model.remove();
            this.modalDelete();
            this.modalDelete = undefined;
        },
        deleteDocumentCancel: function() {
            this.modalDelete();
            this.modalDelete = undefined;
        },
        onDocumentView: function() {
            if (!_.isUndefined(window._satellite)) {
                window._satellite.track("communities-scf-view");
            } else if (cqAnalytics.Sitecatalyst) {
                cqAnalytics.record({
                    event: this.VIEW_EVENT,
                    values: {
                        "functionType": SCF.Context.communityFunction ?
                            SCF.Context.communityFunction : this.COMMUNITY_FUNCTION,
                        /* It's important that we do not get path and type from context when
                         * viewing or downloading a file because it will be the path or type
                         * of current page level component which will be incorrect
                         * when file is accessed from the page that is a list (folder page).
                         * This is currently unique to filelibrary and we always have to
                         * send the file resource path and resource type
                         */
                        "path": this.model.get("id"),
                        "type": this.model.get("resourceType"),
                        "ugcTitle": SCF.Context.ugcTitle,
                        "siteTitle": SCF.Context.siteTitle ?
                            SCF.Context.siteTitle : $(".scf-js-site-title").text(),
                        "sitePath": SCF.Context.sitePath ? SCF.Context.sitePath : this.sitePath,
                        "groupTitle": SCF.Context.groupTitle,
                        "groupPath": SCF.Context.groupPath,
                        "user": SCF.Context.user ? SCF.Context.user : SCF.Session.get("authorizableId")
                    },
                    collect: false,
                    componentPath: SCF.constants.ANALYTICS_BASE_RESOURCE_TYPE
                });
            }
            var _img =SCF.config.urlRoot + this.model.get("path");
            if (this.model.get("type").indexOf("image") !== -1) {
                var _newWindow = window.open("", "");
                _newWindow.document.write("<img src=" + _img + ">");
            } else {
                var _newWindow = window.open(_img);
            }

        },
        onDocumentDownload: function() {
            if (!_.isUndefined(window._satellite)) {
                window._satellite.track("communities-scf-view");
            } else if (cqAnalytics.Sitecatalyst) {
                cqAnalytics.record({
                    event: this.VIEW_EVENT,
                    values: {
                        "functionType": SCF.Context.communityFunction ?
                            SCF.Context.communityFunction : this.COMMUNITY_FUNCTION,
                        // Similarly to file view we should not get this value from context
                        "path": this.model.get("id"),
                        "type": this.model.get("resourceType"),
                        "ugcTitle": SCF.Context.ugcTitle,
                        "siteTitle": SCF.Context.siteTitle ?
                            SCF.Context.siteTitle : $(".scf-js-site-title").text(),
                        "sitePath": SCF.Context.sitePath ? SCF.Context.sitePath : this.sitePath,
                        "groupTitle": SCF.Context.groupTitle,
                        "groupPath": SCF.Context.groupPath,
                        "user": SCF.Context.user ? SCF.Context.user : SCF.Session.get("authorizableId")
                    },
                    collect: false,
                    componentPath: SCF.constants.ANALYTICS_BASE_RESOURCE_TYPE
                });
            }
            window.open(SCF.config.urlRoot + this.model.get("path") + ".download.json");
        },
        onDocumentEdit: function(e) {
            var _id_str = this.model.attributes.id;
            var _fUrl = this.model.attributes.friendlyUrl;

            var _pos1 = _id_str.search("jcr:content");
            var _pos1_substr = _id_str.substring(_pos1, _id_str.length);

            var _pos2 = _fUrl.search("jcr:content");
            var _pos2_substr = _fUrl.substring(0, _pos2);

            location.href = _pos2_substr + _pos1_substr;
        },
        addCommentToDocument: function(e) {
            var _msg = $('#scf-document-comment-message').val();
            var data = _.extend(this.getOtherProperties(), {
                "id": "nobot",
                "message": _msg,
                "messageEncoded": true,
                ":operation": "social:createComment"
            });
            this.addReplyFromData(e, data);
        },
        openModalUpdateFile: function(e) {
            var _parent = $("#scf-filelibrary-modal-update-document");
            $('#scf-document-update-message').val(this.model.get("message"));
            this.modalEditDocument = this.launchModal(_parent, CQ.I18n.getMessage("Update File"));
        },
        ifNameExists: function(name) {
            if (name == this.model.get("name")) {
                return true;
            } else {
                return false;
            }
        },

        doUpdateDocument: function(e) {
            var _files = $("#scf-file-upload-form-fileupload").get(0).files;
            if (_files.length < 1) {
                return;
            }

            var _message = $('#scf-document-update-message').val();
            var _tags = this.getField("tags_update");

            if (false == this.ifNameExists(_files[0].name)) {
                alert(CQ.I18n.getMessage("The name of the file is different"));
                return;
            }
            var data = _.extend(this.getOtherProperties(), {
                "message": _message,
                "name": _files[0].name,
                "tags": _tags,
                "messageEncoded": false,
                ":operation": "social:updateFile",
                "id": "nobot"
            });
            data.files = _files;
            this.saveMyUpdates(data);

            this.modalEditDocument();
            this.modalEditDocument = undefined;
        },
        doUpdateDocumentCancel: function() {
            this.modalEditDocument();
            this.modalEditDocument = undefined;
        },
        getOtherProperties: function() {
            var props = _.extend(SCF.CommentView.prototype.getOtherProperties.apply(this), {
                'messageEncoded': true
            });
            return props;
        },
        saveMyUpdates: function(data) {
            var _self = this;
            var _model = this.model;
            var error = _.bind(function(jqxhr, text, error) {
                this.trigger(this.events.UPDATE_ERROR, {
                    'error': error
                });
            }, this);

            var success = _.bind(function(response) {
                _model.reset(response.response, {
                    silent: true
                });
                if (_model.get('isVisible')) {
                    _model.trigger(_model.events.UPDATED, {
                        model: _model
                    });
                } else {
                    _model.trigger(_model.events.DELETED, {
                        model: _model
                    });
                    _model.trigger('destroy', this);
                };
            }, this);

            var postData;
            var hasAttachment = (typeof data.files !== "undefined");
            data["_charset_"] = "UTF-8";
            if (hasAttachment) {
                if (window.FormData) {
                    postData = new FormData();
                }

                if (postData) {
                    postData.append("file", data.files[0]);

                    delete data.files;
                    $CQ.each(data, function(key, value) {
                        postData.append(key, value);
                    });
                }
            }


            $CQ.ajax(SCF.config.urlRoot + this.model.get('id') + SCF.constants.URL_EXT, {
                dataType: 'json',
                processData: !hasAttachment,
                contentType: (hasAttachment) ? false : 'application/x-www-form-urlencoded; charset=UTF-8',
                type: 'POST',
                xhrFields: {
                    withCredentials: true
                },
                "data": !(hasAttachment) ? data : postData,
                'success': success,
                'error': error
            });

        },
        cut: function(e) {
            this.model.addToClipBoard();
        },
        putBack: function(e) {
            this.model.removeFromClipboard();
        }
    });

    SCF.Filelibrary = Filelibrary;
    SCF.Document = Document;
    SCF.DocumentView = DocumentView;
    SCF.Folder = Folder;
    SCF.FolderView = FolderView;
    SCF.registerComponent('social/filelibrary/components/hbs/filelibrary', SCF.Filelibrary, SCF.FilelibraryView);
    SCF.registerComponent('social/filelibrary/components/hbs/document', SCF.Document, DocumentView);
    SCF.registerComponent('social/filelibrary/components/hbs/folder', SCF.Folder, FolderView);

})($CQ, _, Backbone, SCF);
