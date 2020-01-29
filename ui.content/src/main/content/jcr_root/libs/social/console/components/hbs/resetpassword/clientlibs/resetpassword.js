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

(function(window, document, $CQ, SCF) {
    "use strict";
    $CQ(document).ready(function() {
        $(".scf-js-resetpassword-form").submit(function(event) {
            if ($CQ(".scf-js-confirmpassword").val() != $CQ(".scf-js-password").val()) {
                $CQ(".scf-js-resetpassword-alert").removeClass("scf-is-hidden");
                event.preventDefault();
            }
        });
    });
})(window, document, $CQ, SCF);
