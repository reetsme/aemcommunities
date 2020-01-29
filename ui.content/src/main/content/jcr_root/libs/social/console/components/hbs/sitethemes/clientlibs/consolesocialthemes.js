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
    SCFConsole.THEMES = SCFConsole.THEMES || {};
    SCFConsole.THEMES.previewCSS = function(e) {
        var $this = e.closest('.scf-js-social-console-cssupload');
        var $inputCSS = $this.find("input[type=\"file\"]");
        $inputCSS.attr("data-file-added", "true");
        //TODO: Add some indicator that CSS has been added
        $(".scf-js-social-css-title-custom").show();
        $(".scf-js-social-css-title").hide();
        $(".scf-js-addcsslabel").text(Granite.I18n.get("Custom CSS uploaded"));
        //TODO: Remove the selection
        SCFConsole.THEMES.cssSelectToggle($this.find("article"));
    };

    SCFConsole.THEMES.openFileDialog = function(e) {
        var $this = e.closest(".scf-js-social-console-cssupload").find("input[type='file']");
        $this.removeAttr("disabled");
        $this.click();
    };

    SCFConsole.THEMES.cssSelectToggle = function(el) {
        var $this = $(el);
        $(".scf-js-themes-container .card-asset").removeClass("selected");
        $this.toggleClass("selected");
        $this.closest(".coral-Masonry-item")[0].selected = true;
        $(".scf-js-themes-container").find(".selection-layer").hide();
        $this.parent().find(".selection-layer").show();
    };

    $(window).load(function() {

        $(".scf-js-social-console-cssupload").each(function() {
            //TODO: if there is CSS indicate about it

            $(this).closest("form").on("submit", function() {
                $(this).find("input[type=\"file\"]").each(function() {
                    if ($(this).attr("data-file-added")) {
                        $(this).removeAttr("disabled");
                    } else {
                        $(this).attr("disabled", "true");
                    }
                });
            });
        });

        $(".scf-js-social-console-divChangeCSSBranding").click(function() {
            SCFConsole.THEMES.openFileDialog($(this));
        });

        $(".scf-js-social-console-cssUploadCSS").change(function() {
            SCFConsole.THEMES.previewCSS($(this));
        });

        $('.scf-js-cq-social-themes-masonry coral-masonry-item').on('click', function(e) {
            if (e.currentTarget.parentElement) {
                e.currentTarget.parentElement.deselectAll();
            }
            if ($(this).find('.scf-social-console-cssarticle').length > 0) {
                var $inputCSS = $(this).find(".scf-js-social-console-cssUploadCSS");
                $inputCSS.removeAttr("data-file-added");
                //Reset input field without cloning it
                $inputCSS.wrap("<form>").closest("form").get(0).reset();
                $inputCSS.unwrap();
            } else {
                this.selected = true;
                var val = $(this).find('.js-social-console-theme-card-data').data('theme');
                $('.scf-js-cq-social-themes input[name=\'theme\']').val(val);
            }

        });

        $(".scf-js-themes-container .card-asset").click(function(event) {
            var $this = $(this).closest(".scf-js-social-console-cssupload");
            var isCustomCSS = ($this.length > 0);
            if (isCustomCSS) {
                var $inputCSS = $this.find("input[type=\"file\"]");
                $inputCSS.removeAttr("data-file-added");
                //Reset input field without cloning it
                $inputCSS.wrap("<form>").closest("form").get(0).reset();
                $inputCSS.unwrap();
            }
            if ($(this).hasClass("selected")) {
                $(this).toggleClass("selected");
                $(this).parent().find(".selection-layer").hide();
                if (isCustomCSS) {
                    event.preventDefault();
                } else {
                    $(this).parent().find(".card-asset input").prop("checked", false);
                }
            } else {
                if (!isCustomCSS) {
                    SCFConsole.THEMES.cssSelectToggle($(this));
                }
            }
        });
    });
})(Granite, Granite.$, SCFConsole);
