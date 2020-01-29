/*
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2016 Adobe Systems Incorporated
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

(function() {
    function logError(msg) {
        if (typeof console === "undefined") {
            return;
        }
        if (typeof console.error === "function") {
            return console.error(msg);
        }
        if (typeof console.log === "function") {
            return console.log(msg);
        }
    }

    // SCF.Session is undefined until document.onready
    function awaitSCFSession(withSession) {
        if (typeof SCF.Session !== "undefined") {
            return withSession(SCF.Session);
        }
        $(function() {
            withSession(SCF.Session);
        });
    }

    function useOrFetchLivefyre(withLivefyre) {
        if (typeof Livefyre !== "undefined") {
            return withLivefyre(Livefyre);
        }
        var livefyreJsScript = document.createElement("script");
        livefyreJsScript.setAttribute(
            "src", "https://cdn.livefyre.com/Livefyre.js");
        livefyreJsScript.onload = function() {
            withLivefyre(Livefyre);
        };
        document.head.appendChild(livefyreJsScript);
    }

    useOrFetchLivefyre(function(Livefyre) {
        var delegate = {
            "viewProfile": function(user) {
                window.location.href = user.profileUrl;
            },
            "editProfile": function(user) {
                window.location.href = user.profileUrl;
            },
            "logout": function(errback) {
                if ((SCF.Session !== null) && (SCF.Session.attributes.loggedIn)) {
                    SCF.Session.logout();
                }
                errback(null);
            },
            "login": function(errback) {
                var lftoken;
                var message;
                try {
                    lftoken = SCF.Session.get("lftoken");
                    if (lftoken) {
                        return errback(null, {
                            livefyre: lftoken
                        });
                    }
                } catch (e) {
                    return errback(e);
                }
                if (SCF.Session === null) {
                    message = "Livefyre authDelegate.login invoked, but there is no SCF.Session to use to trigger " +
                        "login";
                    logError(message);
                    errback(new Error(message));
                    return;
                }
                message = "Livefyre for AEM's login functionality hasn't been fully configured. See the " +
                    "documentation for more information: http://answers.livefyre.com/developers/cms-plugins/" +
                    "adobe-experience-manager/#CustomizingSSOIntegration";
                logError(message);
                errback(new Error(message));
                return;
            }
        };
        Livefyre.require(["auth"], function(auth) {
            awaitSCFSession(function(Session) {
                if (Session.attributes.loggedIn) {
                    auth.authenticate({
                        livefyre: Session.attributes.lftoken
                    });
                } else {
                    Session.on("model:loaded", function() {
                        if (Session.attributes.loggedIn) {
                            auth.authenticate({
                                livefyre: Session.attributes.lftoken
                            });
                        }
                    });
                }

                Session.on("logout:success", function() {
                    auth.logout();
                });

                auth.delegate(delegate);
            });
        });
    });
}());
