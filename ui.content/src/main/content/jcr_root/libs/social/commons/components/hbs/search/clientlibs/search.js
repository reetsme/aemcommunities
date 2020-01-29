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

$CQ(document).ready(function() {
    $CQ("form.scf-js-searchform").submit(function(event) {
        event.preventDefault();
        var form = $(event.target);
        var value = "" + form.find("input.scf-js-search-value").val();
        var title = form.find("input.scf-js-search-jcrtitle").is(':checked');
        var description = form.find("input.scf-js-search-jcrdescription").is(':checked');
        var tag = form.find("input.scf-js-search-tag").is(':checked');
        var user = form.find("input.scf-js-search-userIdentifier").is(':checked');
        var expLanguage = form.find(".form-language-select").val();
        var params;
        value = value.trim();
        value = value.replace(/,/gi, '\\,');
        var filter = "";
        // Create an "OR" filter for all 3 predicates
        if ((value && value.length > 0) &&
            (title || description || tag || user)) {
            if (title) {
                filter = "filter=jcr:title like '" + value + "'";
            }
            if (description) {
                filter += (filter.length > 0) ? "," : "filter=";
                var decodedValue = $CQ("<div/>").text(value).html();
                filter += "jcr:description like '" + encodeURIComponent(decodedValue) + "'";
            }
            if (tag) {
                filter += (filter.length > 0) ? ", " : "filter=";
                filter += "tag like '" + value + "'";
            }
            if (user) {
                filter += (filter.length > 0) ? ", " : "filter=";
                filter += "author_display_name like '" + value + "'";
            }
            if (expLanguage) {
                filter += "&expLanguage=" + expLanguage;
                filter += "&searchText=" + encodeURIComponent(value);
            } else {
                filter += "&expLanguage=" + "default";
                filter += "&searchText=" + encodeURIComponent(value);
            }
        }
        var resultPage = form.find(".scf-js-seach-resultPage").val();
        var paths = form.data("paths");
        var searchPaths;
        if (typeof(paths) !== 'undefined' && paths !== null && paths.length > 0) {
            paths = paths.substring(1, paths.length - 1); // remove '[' and ']'
            searchPaths = paths.split(',');
        }
        if (filter.length > 0 && typeof(resultPage) != 'undefined' && resultPage.length > 0) {
            if (typeof(searchPaths) != 'undefined') {
                for (i = 0; i < searchPaths.length; i++) {
                    filter += "&path=" + searchPaths[i].trim();
                }
            }
            var contextPath = CQ.shared.HTTP.getContextPath();
            filter += "&_charset_=utf-8";
            var url = (contextPath !== null && contextPath.length > 0) ? contextPath + "/" + resultPage + ".html?" + filter :
                resultPage + ".html?" + filter;
            window.location.replace(url); // redirect to the result page
        }

    });

    function getLanguageLabel(langCode, langCodes) {
        for (var i in langCodes) {
            if (langCodes[i] == langCode) {
                return i;
            }
        }
    }

    function getJsonFromUrl() {
        var query = location.search.substr(1);
        var data = query.split("&");
        var result = {};
        for (var i = 0; i < data.length; i++) {
            var item = data[i].split("=");
            result[item[0]] = item[1];
        }
        return result;
    }

});
