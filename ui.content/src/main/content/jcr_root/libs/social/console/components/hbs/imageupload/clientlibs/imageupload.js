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

(function(Granite, $, SCFConsole) {
    "use strict";
    SCFConsole.IMGUPLOAD = SCFConsole.IMGUPLOAD || {};

    SCFConsole.IMGUPLOAD.previewImage = function(e) {
        var $this = e.closest('.scf-js-social-console-imageupload');
        var $imgUploadImage = $this.find("input[type=\"file\"]");
        $imgUploadImage.attr("data-file-added", "true");
        var _fr = new window.FileReader();
        var _image = new window.Image();
        _fr.readAsDataURL($imgUploadImage.get(0).files[0]);

        _fr.onload = function(e) {
            var _targRes = e.target.result;
            $this.find(".scf-js-social-console-imgUploadPreview").attr("src", _targRes);
            _image.src = _targRes;
            _image.onload = function() {
                $this.find(".scf-js-social-console-pImgUploadPreviewFdim").text(this.width + " x " + this.height);
                $this.find(".scf-js-social-console-divImageUpload").hide();
                $this.find(".scf-js-social-console-divImagePreview").show();
                $this.find(".scf-js-social-console-divChangeBranding").show();
                $this.find(".scf-js-social-console-divInfoOverlay").show();

                var _filename = $this.find(".scf-js-social-console-imgUploadImage").val().replace(/^.*\\/, "");
                $this.find(".scf-js-social-console-pImgUploadPreviewFname").text(_filename);

                var _div = $this.find(".scf-js-social-console-divImagePreview").height();
                var _overlayH = $this.find(".scf-js-social-console-divInfoOverlay").height();
                var _offset = (_div / 2) - (_overlayH / 2);

                if (_offset > 0) {
                    $this.find(".scf-js-social-console-divInfoOverlay").css("margin-top", _offset + "px");
                }
            };
        };
    };

    SCFConsole.IMGUPLOAD.openFileDialog = function(e) {
        var $this = e.closest(".scf-js-social-console-imageupload").find("input[type='file']");
        $this.removeAttr("disabled");
        $this.click();
    };

    var onImageLoad = function(imgPath, $this) {
        var myImage = new Image();
        myImage.name = imgPath;
        myImage.onload = function() {
            $this.find(".scf-js-social-console-pImgUploadPreviewFdim").text(this.width + " x " + this.height);
        };
        myImage.src = imgPath;
    };

    $(document).ready(function() {

        $(".scf-js-social-console-imageupload").each(function(key, value) {
            var imgSrc = $(this).find(".scf-js-social-console-imgUploadPreview").attr('src');
            if (imgSrc) {
                onImageLoad(imgSrc, $(this));
                $(this).find(".scf-js-social-console-divImageUpload").hide();
                $(this).find(".scf-js-social-console-divImagePreview").show();
                $(this).find(".scf-js-social-console-divChangeBranding").show();
                $(this).find(".scf-js-social-console-divInfoOverlay").show();
                //$(this).find(".scf-js-social-console-pImgUploadPreviewFdim").hide();
                var _div = $(this).find(".scf-js-social-console-divImagePreview").height();
                var _overlayH = $(this).find(".scf-js-social-console-divInfoOverlay").height();
                var _offset = (_div / 2) - (_overlayH / 2);

                if (_offset > 0) {
                    $(this).find(".scf-js-social-console-divInfoOverlay").css("margin-top", _offset + "px");
                }
            }

            $(this).closest("form").on("submit", function() {
                $(this).find("input[type=\"file\"]").each(function() {
                    var fileParent = $(this).closest(".scf-js-social-console-imageupload").parent();
                    var inputType = fileParent.data("assettype");
                    if (inputType == "pageThumbnail") {
                        $(this).attr("name", "pagethumbnail");
                        $(this).attr("data-file-name-parameter", "pagethumbnail");
                    }
                    if ($(this).attr("data-file-added")) {
                        $(this).removeAttr("disabled");
                    } else {
                        $(this).attr("disabled", "true");
                    }
                });
            });
        });

        $(".scf-js-social-console-divChangeBranding").click(function(event) {
            SCFConsole.IMGUPLOAD.openFileDialog($(this));
        });
        $(".scf-js-social-console-imgUploadPreview").click(function(event) {
            SCFConsole.IMGUPLOAD.openFileDialog($(this));
        });
        $(".scf-js-social-console-imgUploadImage").change(function(event) {
            SCFConsole.IMGUPLOAD.previewImage($(this));
        });
    });
})(Granite, Granite.$, SCFConsole);
