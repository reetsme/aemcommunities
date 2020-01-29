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

/* jshint maxparams: 6 */
(function(document, $, Backbone, _, Enablement, Granite) {
    /* jshint maxparams: 5 */
    "use strict";
    var AddAssetWizard = Enablement.AddAssetWizard = Enablement.AddAssetWizard || {};
    var DAMUtils = Enablement.DAMUtils;
    var EnablementUtils = Enablement.Utils;
    var fileUploadResponse = {};

    var AddAssetActionsView = Backbone.View.extend({

        initialize: function(options) {
            this.parentView = options.parentView;
            this.initializeFileUploadComponent();
            this.initializeAssetPicker();
            this.initializeExternalUrlPicker();
            this.initializeExternalResourcePicker();
            this.initializeConnectUrlPicker();
            this.$modalDiv = null;
            var that = this;
            $(".endor-List", this.$el).on("click", function() {
                that.$el.click();
            });
        },

        initializeFileUploadComponent: function() {
            var that = this;
            $("#add-items-add-actions-btn", this.$el)
                .off("coral-fileupload:fileadded")
                .on("coral-fileupload:fileadded", function(event) {
                    if (event.originalEvent.target.uploadQueue.length > 0) {
                        that.showWaitingDiv(true);
                    }
                })
                .off("coral-fileupload:filesizeexceeded")
                .on("coral-fileupload:filesizeexceeded", function(event) {
                    that.fileUploadFileSizeExceeded(event);
                })
                .off("coral-fileupload:progress")
                .on("coral-fileupload:progress", function(event) {
                    that.fileuploadprogress(event);
                })
                .off("coral-fileupload:load")
                .on("coral-fileupload:load", function() {
                    that.showWaitingDiv(false);
                })
                .off("coral-fileupload:loadend")
                .on("coral-fileupload:loadend", function(event) {
                    that.fileUploadSuccessCallback(event);
                })
                .off("coral-fileupload:error")
                .on("coral-fileupload:error", function(event) {
                    that.fileUploadFailureCallback(event);
                });
        },

        /*jshint maxdepth: 6 */
        initializeAssetPicker: function() {
            var assetCategory = "enablementAsset:dam";
            var that = this;
            var assetPikcerIFrame = this.parentView.getAssetPickerIFrame();
            $("#add-from-my-assets", this.$el).on("click", function() {
                var iframeSuffix = $(".dataSiteAssetsPath").data("siteassetspath");
                assetPikcerIFrame.attr("src", Granite.HTTP.getContextPath() +
                "/aem/assetpicker.html?wcmmode=disabled&amp;root=" +
                    iframeSuffix);
                assetPikcerIFrame.css("display", "block");
            });

            var assetPickerTab1 = $("iframe#assetpicker-tab1", this.$resourceSettings);
            $(".scf-js-browse", this.$resourceSettings).on("click", function(event) {
                if ($(event.currentTarget).hasClass("small-asset")) {
                    that.assetBrowseMode = "small-asset";
                } else if ($(event.currentTarget).hasClass("large-asset")) {
                    that.assetBrowseMode = "large-asset";
                } else if ($(event.currentTarget).hasClass("content-fragment-asset")) {
                    that.assetBrowseMode = "content-fragment-asset";
                }
                var iframeSuffix = "/content/dam";
                assetPickerTab1.attr("src", Granite.HTTP.getContextPath() + "/aem/assetpicker.html?root=" +
                    iframeSuffix);
                assetPickerTab1.css("display", "block");
            });

            window.addEventListener("message", function(event) {
                // Security concern: Confirm that the event was actually sent by the
                // assetPicker window opened by us and not by any other window.
                if (event.source === document.getElementById("assetpicker").contentWindow ||
                    event.source === document.getElementById("assetpicker-tab1").contentWindow) {
                    var fromDam = JSON.parse(event.data);
                    for (var i in fromDam.data) {
                        if (typeof fromDam.data[i] === "object") {
                            for (var prop in fromDam.data[i]) {
                                if (typeof prop === "string") {
                                    if (prop !== "path") {
                                        fromDam.data[i][prop] = window.unescape(fromDam.data[
                                            i][prop]);
                                    } else {
                                        // Path is set from Assets where the name, folder are escaped
                                        // So we need to decode the value to form the path to the asset
                                        var pathArr = fromDam.data[i].path.split("/content/dam/");
                                        var decodedPath = decodeURIComponent(pathArr[1]);
                                        fromDam.data[i][prop] = "/content/dam/" + decodedPath;
                                    }
                                }
                            }

                            if (event.source === document.getElementById("assetpicker-tab1").contentWindow) {
                                $("input." + that.assetBrowseMode, that.$resourceSettings).val(fromDam.data[i].path);
                                that.assetBrowseMode = "";
                                break;
                            }

                            that.parentView.model.addNewAsset({
                                asset: fromDam.data[i],
                                assetDefCoverImg: that.parentView.model.get(
                                    "assetDefCoverImg"),
                                assetCategory: assetCategory,
                                "resource-asset-name": null
                            });
                            break; // we are supporting only 1 asset per resource;issue CQ-32398.
                            // Ideally assetpicker should have parameter for number of files to be picked.
                        }
                    }

                    if (event.source === document.getElementById("assetpicker-tab1").contentWindow) {
                        assetPickerTab1.css("display", "none");
                        assetPickerTab1.attr("src", "");
                    } else {
                        assetPikcerIFrame.css("display", "none");
                        assetPikcerIFrame.attr("src", "");
                    }
                }

            }, false);
        },

        initializeExternalUrlPicker: function() {
            var that = this;
            var assetCategory = "enablementAsset:url";
            var $externalResourceForm = this.parentView.getExternalUrlResourceForm();
            var $titleInp = $externalResourceForm.find("input[name='external-url-title']");
            var $urlInp = $externalResourceForm.find("input[name='external-url']");
            var defCoverImg = $externalResourceForm.data("assetdefcoverimg");
            $externalResourceForm.off("submit");
            $externalResourceForm.on("submit", function(e) {
                e.preventDefault();
                e.stopPropagation();
                var title = $titleInp.val().trim();
                var url = $urlInp.val().trim();
                var assetInfo = {
                    "title": title,
                    "url": url,
                    "type": CQ.I18n.get("URL"),
                    "size": ""
                };
                that.parentView.model.addNewAsset({
                    asset: assetInfo,
                    assetDefCoverImg: defCoverImg,
                    assetCategory: assetCategory,
                    "resource-asset-name": title
                });
                $externalResourceForm.modal("hide");
                return false;
            });
        },
        initializeExternalResourcePicker: function() {
            var that = this;
            var assetCategory = "enablementAsset:externalResource";
            var $externalResourceForm = this.parentView.getExternalResourceForm();
            var $titleInp = $externalResourceForm.find("input[name='external-url-title']");
            var $locationInp = $externalResourceForm.find("input[name='location']");
            var defCoverImg = $externalResourceForm.data("assetdefcoverimg");
            $externalResourceForm.off("submit");
            $externalResourceForm.on("submit", function(e) {
                e.preventDefault();
                e.stopPropagation();
                var title = $titleInp.val().trim();
                var location = $locationInp.val().trim();
                var assetInfo = {
                    "title": title,
                    "location": location,
                    "type": CQ.I18n.get("Location"),
                    "size": ""
                };
                that.parentView.model.addNewAsset({
                    asset: assetInfo,
                    assetDefCoverImg: defCoverImg,
                    assetCategory: assetCategory,
                    "resource-asset-name": title
                });
                $externalResourceForm.modal("hide");
                return false;
            });
        },
        initializeConnectUrlPicker: function() {
            var that = this;
            var assetCategory = "enablementAsset:url";
            var assetSubCategory = "adobe-connect";
            var $connectResourceForm = this.parentView.getConnectUrlResourceForm();
            var $titleInp = $connectResourceForm.find("input[name='external-url-title']");
            var $urlInp = $connectResourceForm.find("input[name='external-url']");
            var defCoverImg = $connectResourceForm.data("assetdefcoverimg");
            $connectResourceForm.off("submit");
            $connectResourceForm.on("submit", function(e) {
                e.preventDefault();
                e.stopPropagation();
                var title = $titleInp.val().trim();
                var url = $urlInp.val().trim();
                var assetInfo = {
                    "title": title,
                    "url": url,
                    "type": CQ.I18n.get("Adobe Connect URL"),
                    "size": ""
                };
                that.parentView.model.addNewAsset({
                    asset: assetInfo,
                    assetDefCoverImg: defCoverImg,
                    assetCategory: assetCategory,
                    assetSubCategory: assetSubCategory,
                    "resource-asset-name": title
                });
                $connectResourceForm.modal("hide");
                return false;
            });
        },

        loadInitialAssets: function(assetList) {
            for (var i = 0; i < assetList.length; i++) {
                var defCoverImg = "";
                var type = "";
                var assetCategory = assetList[i]["asset-category"];
                if (assetCategory === "enablementAsset:url") {
                    var $externalResourceForm = this.parentView.getExternalUrlResourceForm();
                    defCoverImg = $externalResourceForm.data("assetdefcoverimg");
                    type = CQ.I18n.get("URL");
                    if (assetList[i]["asset-sub-category"] === "adobe-connect") {
                        type = CQ.I18n.get("Adobe Connect URL");
                    }
                } else if (assetCategory === "enablementAsset:dam") {
                    defCoverImg = this.parentView.model.get("assetDefCoverImg");
                    type = assetList[i].type;
                } else if (assetCategory === "enablementAsset:externalResource") {
                    defCoverImg = this.parentView.model.get("assetDefCoverImg");
                    type = CQ.I18n.get("Location");
                }
                var assetInfo = {
                    "asset": {
                        "title": assetList[i].title,
                        "type": type,
                        "size": assetList[i].size,
                        "path": assetList[i].path
                    },
                    "coverImg": assetList[i].coverImg,
                    "assetCategory": assetCategory,
                    "resource-asset-name": assetList[i]["resource-asset-name"],
                    "assetDefCoverImg": defCoverImg,
                    "thumbnailSource": assetList[i]["thumbnail-source"]
                };

                if (assetList[i].url) {
                    assetInfo.asset.url = assetList[i].url;
                }

                if (assetList[i].location) {
                    assetInfo.asset.location = assetList[i].location;
                }
                this.parentView.model.addNewAsset(assetInfo, Enablement.AddAssetWizard.States
                    .INITIAL);
            }
        },

        fileUploadSuccessCallback: function(event) {
            var assetCategory = "enablementAsset:dam";
            try {
                if (event.type === "fileuploadsuccess" || event.type === "fileuploadload") { // for 6.1
                    fileUploadResponse = DAMUtils.parseDAMUploadResponse(event.originalEvent.target.responseText);
                } else if (event.type === "coral-fileupload:loadend") { // for 6.2 & 6.3
                    fileUploadResponse = DAMUtils.parseDAMUploadResponse(
                        event.originalEvent.detail.item.responseText);
                }
            } catch (ex) {
                fileUploadResponse = DAMUtils.parseDAMUploadResponse("<body>" + event.content +
                    "</body>");
            }
            var statusCode = fileUploadResponse.statusCode;
            if (statusCode.toLowerCase() === "ok") {
                var that = this;
                DAMUtils.getAssetInfo(fileUploadResponse.path, function(assetInfo) {
                    assetInfo.path = fileUploadResponse.path;
                    that.parentView.model.addNewAsset({
                        asset: assetInfo,
                        assetDefCoverImg: that.parentView.model.get(
                            "assetDefCoverImg"),
                        assetCategory: assetCategory,
                        "resource-asset-name": null
                    });
                });
            } else {
                this.showErrorMsg(CQ.I18n.get("Error while uploading asset. " +
                    "Please ensure the filename does not contain characters " +
                    "% ? < > \" * /  : [ ] | are not in the file name."));
            }
            this.showWaitingDiv(false);
        },

        fileuploadprogress: function(event) {
            var $waitingDiv = this.parentView.getWaitingDiv();
            var progress = Math.round(event.originalEvent.detail.loaded / event.originalEvent.detail.total *
                100);

            $("coral-Progress", $waitingDiv).attr("value", progress);
        },

        fileUploadFailureCallback: function() {
            this.parentView.refreshView();
            this.showErrorMsg(CQ.I18n.get("Error while uploading asset. " +
                "Please ensure the filename does not contain characters " +
                "% ? < > \" * /  : [ ] | are not in the file name."));
        },

        fileUploadFileSizeExceeded: function() {
            this.parentView.refreshView();
            this.showErrorMsg(CQ.I18n.get("Error while uploading asset as the file size exceeded."));
        },

        fileSelected: function(event) {
            event.fileUpload.list = event.fileUpload.list || [];
            event.fileUpload.rejectedFiles = event.fileUpload.rejectedFiles || {};
            // List of invalid characters in filename.
            var ILLEGAL_FILENAME_CHARS = ["%", "?", "<", ">", "\"", "*", "/", ":", "[", "]",
                "|", "'", ";"
            ];
            var isFilenameValid = true;

            // Just in case we allow multiple assets to be uploaded. As of now this loops runs only once.
            for (var i = 0; i < event.fileUpload.uploadQueue.length; i++) {
                var fileName = event.fileUpload.uploadQueue[i].fileName;
                if (EnablementUtils.contains(fileName, ILLEGAL_FILENAME_CHARS)) {
                    isFilenameValid = false;
                }
            }

            if (isFilenameValid) {
                event.fileUpload.list.push(event.item);
            } else {
                event.fileUpload.rejectedFiles[DAMUtils.INVALID_FILENAME] =
                    event.fileUpload.rejectedFiles[DAMUtils.INVALID_FILENAME] || [];
                event.fileUpload.rejectedFiles[DAMUtils.INVALID_FILENAME].push(event.item);
                return;
            }
        },

        fileListProcessed: function(event) {

            if (event.fileUpload.rejectedFiles[DAMUtils.TOO_MUCH_SIZE] ||
                event.fileUpload.rejectedFiles[DAMUtils.INVALID_FILENAME]) {
                var fileList = function(fileArr) {
                    var fileList = "<br />";
                    for (var i = 0; i < fileArr.length; i++) {
                        fileList += "<b>" + fileArr[i].fileName + "</b>&nbsp;<br />";
                    }
                    return fileList;
                };
                var errMsg = "<br />";
                if (event.fileUpload.rejectedFiles[DAMUtils.INVALID_FILENAME]) {
                    errMsg += CQ.I18n.get(
                        "Please ensure the following filename(s) do not contain characters " +
                        "% ? < > \" * /  : [ ] | ' ;", [fileList(
                            event.fileUpload.rejectedFiles[DAMUtils.INVALID_FILENAME]
                        )]
                    ) + "<br />&nbsp;<br />";
                }
                if (event.fileUpload.rejectedFiles[DAMUtils.TOO_MUCH_SIZE]) {
                    errMsg += CQ.I18n.get(
                        "The following file(s) exceeed the allowed maximum size of {0}: <br /> {1}", [
                            EnablementUtils.getNormalizedFileSize(event.fileUpload.options
                                .sizeLimit),
                            fileList(event.fileUpload.rejectedFiles[DAMUtils.TOO_MUCH_SIZE])
                        ]) + "<br />&nbsp;<br />";
                }

                this.parentView.refreshView();
                this.showErrorMsg(errMsg, true);
                event.fileUpload.list = [];
                event.fileUpload.uploadQueue = [];
                event.fileUpload.rejectedFiles = {};
                return;
            }

            if (event.fileUpload.list.length) {
                this.showWaitingDiv(true);
            }
            var dirJson = this.getDirectoryJson(event);
            var uploadFiles = event.fileUpload.list;
            var i;
            for (i = 0; i < uploadFiles.length; i++) {
                var fileName = uploadFiles[i].fileName;
                while (dirJson[fileName]) {
                    fileName = this.resolveFileName(fileName, dirJson);
                }
                event.fileUpload.uploadQueue[i].fileName = fileName;
            }
            // Upload here.
            for (i = 0; i < event.fileUpload.list.length; i++) {
                event.fileUpload.uploadFile(event.fileUpload.list[i]);
            }
            event.fileUpload.list = [];
        },

        fileRejected: function(event) {
            event.fileUpload.rejectedFiles = event.fileUpload.rejectedFiles || {};
            event.fileUpload.rejectedFiles[DAMUtils.TOO_MUCH_SIZE] =
                event.fileUpload.rejectedFiles[DAMUtils.TOO_MUCH_SIZE] || [];
            event.fileUpload.rejectedFiles[DAMUtils.TOO_MUCH_SIZE].push(event.item);
        },

        getDirectoryJson: function() {
            var jsonPath = $(".dataSiteAssetsPath").data("siteassetspath") + ".1.json?" + new Date();
            var result = $.ajax({
                type: "GET",
                async: false,
                url: jsonPath
            });
            if (result.status === 200) {
                return JSON.parse(result.responseText);
            }
        },

        resolveFileName: function(fileName, directoryJson) {
            var fn = fileName;
            var fileExtn = "";
            if (fileName.indexOf(".") !== -1) {
                fn = fileName.substr(0, fileName.lastIndexOf("."));
                fileExtn = fileName.substr(fileName.lastIndexOf(".") + 1);
            }
            var counter = 1;
            var tempFn;
            do {
                tempFn = fn + counter;
                counter++;
            } while (directoryJson[tempFn + "." + fileExtn]);
            return tempFn + "." + fileExtn;
        },

        showErrorMsg: function(errMsg, ommitI18n) {
            var btnArr = [{
                label: CQ.I18n.get("Close"),
                click: "hide"
            }];
            if (ommitI18n) {
                this.showModal("error", CQ.I18n.get("Error"), errMsg, btnArr);
            } else {
                this.showModal("error", CQ.I18n.get("Error"), CQ.I18n.get(errMsg), btnArr);
            }
        },

        showModal: function(type, headerHtml, bodyHtml, buttonArr) {
            this.showWaitingDiv(false);
            if (this.$modalDiv) {
                var modal = this.$modalDiv.data("modal");
                modal.options.buttons = buttonArr;
                modal.options.header = headerHtml;
                modal.options.content = bodyHtml;
                modal.options.type = type;
                modal.applyOptions();
                modal.show();
            } else {
                this.$modalDiv = this.parentView.getModalDiv().modal({
                    type: type,
                    header: headerHtml,
                    content: bodyHtml,
                    buttons: buttonArr
                });
            }
        },

        showWaitingDiv: function(flag) {
            this.enable(!flag);
            this.parentView.showWaitingDiv(flag);
        },

        enable: function(flag) {
            if (!flag) {
                $("#add-asset-wizard-popover-link", this.$el).off("click");
                $("a[data-toggle]", this.$el).on("click", function() {
                    return false;
                });
            } else {
                $("#add-asset-wizard-popover-link", this.$el).on("click");
                $("a[data-toggle]", this.$el).off("click");
            }
        }

    });

    AddAssetWizard.AddAssetActionsView = AddAssetActionsView;

})(document, $, Backbone, _, CQ.Communities.Enablement, Granite);
