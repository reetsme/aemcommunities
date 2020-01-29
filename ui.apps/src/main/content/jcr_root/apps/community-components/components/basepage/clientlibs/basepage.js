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

(function(root, $, CQ) {
    "use strict";
    var impersonateURL = "/libs/granite/ui/content/userproperties/self/form/items/wrapper/field.userlist.html?impersonatesOnly=true&start=0&end=25&query=";
    root.ComponentGuide = {};
    root.ComponentGuide.addTabChangeHandler = function(interestedParty, handler) {
        var $tabbable = interestedParty.closest(".tabbable");
        var $tabcontent = interestedParty.closest(".tab-content");
        var targetPane = interestedParty.closest(".tab-pane").get(0);
        var idx;
        $tabcontent.find(".tab-pane").each(function(i, obj){
            if(obj == targetPane) {
                idx = i;
                return false;
            }
        });
        $($tabbable.find("a[data-toggle='tab']").get(idx)).on('shown', handler);
    };

    function redirectTopicNav(event) {
        event.preventDefault();
        var href = this.href;
        href = href.substring(href.search(".topic.html") + ".topic.html".length);
        href = "forum/topic.topic.html" + href;
        window.location.href = href;
    }

    function showLogin() {
        $(".login").removeClass("hidden");
        $(".logout").addClass("hidden");
    }

    function showLogout() {
        $(".login").addClass("hidden");
        $(".logout").removeClass("hidden");
    }

    function handleUserImpersonate(event) {
        event.preventDefault();
        var dataPayload = "originalURI=" + encodeURIComponent(window.location.pathname);
        dataPayload += "&action=impersonate";
        if (window.Granite && window.Granite.csrf) {
            var promise = window.Granite.csrf.refreshToken();
            promise.then(function(token) {
                dataPayload += "&:cq_csrf_token=" + token;
                dataPayload += "&userId=";
                if ($(event.target).hasClass("login")) {
                    if (event.target.form) {
                        dataPayload += encodeURIComponent($(event.target.form).find("input").val());
                        $CQ.ajax("/libs/granite/ui/content/userproperties.impersonate.html", {
                            type: 'POST',
                            xhrFields: {
                                withCredentials: true
                            },
                            data: dataPayload,
                            'success': showLogout,
                            'error': showLogin
                        });
                    }
                } else {
                    dataPayload += encodeURIComponent("-");
                    event.stopImmediatePropagation();
                    $CQ.ajax("/libs/granite/ui/content/userproperties.impersonate.html", {
                        type: 'POST',
                        xhrFields: {
                            withCredentials: true
                        },
                        data: dataPayload,
                        'success': showLogin,
                        'error': showLogout
                    });
                }
            });
        }
    }




    // Attach to the impersonation UI.
    $(function(){
        if (CQ != void(0) && (CQ.WCM != void(0) || window.Granite.author != void(0))) {
            $(".btn.login").click(handleUserImpersonate);
            $(".btn.logout").click(handleUserImpersonate);
        }

        $(".login .search-query").keyup(function(event) {
            var searchPath = impersonateURL;
            searchPath += encodeURIComponent($(event.target).val());
            var $targetForm = $(event.target.form);
            $.get(searchPath).done(function(data) {
                var $ul = $(data);
                var $menu = $targetForm.find(".dropdown-menu");
                $menu.empty();
                $menu.append($ul);
                $menu.find("li").click(function(event){
                    $targetForm.find("input").first().val($(event.target).closest("li").attr("data-value"));
                    $menu.hide();
                });
                $menu.show();
                $targetForm.find(".dropdown-toggle").trigger("click");
            });
        });
    });

    $(function() {
        $(".login-ui .dropdown-menu input, .login-ui .dropdown-menu label").click(function(event) {
            event.stopPropagation();
        });
        $(".login-ui .dropdown-menu form").submit(function(event) {
            event.preventDefault();
            var $form = $(event.target);
            $.post("/crx/de/j_security_check", $form.serialize()).done(function() {
                window.location.reload(true);
            });
        });
        if (CQ != void(0) && CQ.WCM == void(0)) {
            $(".login-ui .logout").click(function(event) {
                SCF.Session.on(SCF.Session.events.LOGGED_OUT, function() {
                    showLogin();
                });
                SCF.Session.logout();
            });
        }
    });

    $(function() {
        if (!root.ComponentGuide.isAuthor) {
            var userId = "";
            var CURRENT_USER_URL = CQ.shared.HTTP.externalize("/libs/granite/security/currentuser.json");
            var that = this;
            $CQ.ajax({
                url: CURRENT_USER_URL,
                type: "GET",
                success: function(result) {
                   userId = result.authorizableId;
                },
                async:false
            })
            if (userId != "anonymous") {
                $(".navbar .login").addClass("hidden");
                $(".navbar .logout").removeClass("hidden");
            } else {
                $(".navbar .login").removeClass("hidden");
                $(".navbar .logout").addClass("hidden");
            }
        }
        if (SCF.Session != null) {
            SCF.Session.on(SCF.Session.events.LOGGED_IN_SUCCESS, function() {
                showLogin();
            });
        }
    });

    $(function() {
        // attach handlers to the tabs to resize the cq placeholders for authoring.
        $("a[data-toggle='tab']").on('shown', function (event) {
            var $targetPanel = $("#" + event.currentTarget.href.split("#")[1]);
            $targetPanel.find("[class^=cq-placeholder-]").width($targetPanel.width());
        });
    });
})(window, $CQ, CQ);
