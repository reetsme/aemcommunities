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
    if (!String.prototype.trim) {
        String.prototype.trim = function() {
            return this.replace(/^\s+|\s+$/g, '');
        };
    }

    /**
     * The following functions set the user search predicates in the form.
     */
    function getQueryParams(qs) {
        if (qs === "undefined" || qs === null)
            return "";
        qs = qs.split("+").join(" ");

        var params = {},
            tokens,
            re = /[?&]?([^=]+)=([^&]*)/g;

        tokens = re.exec(qs);
        while (tokens !== null) {
            params[decodeURIComponent(tokens[1]).trim()] = decodeURIComponent(tokens[2]);
            tokens = re.exec(qs);
        }

        return params;
    }

    function parseFilterPredicates(predicates) {
        if (predicates === "undefined" || predicates === null)
            return "";
        var result = [];
        var regexEscapeSingleQuote = /('.*?'|".*?"|\S+)/g;
        for (var i = 0; i < predicates.length; i++) {

            var tokens = predicates[i].trim().match(regexEscapeSingleQuote);
            if (tokens.length >= 3) { // a filter has the following syntax: "<property> <comparator> <value>"
                var value = tokens[2].trim();
                if (value.charAt(0) == '\'' && value.charAt(value.length - 1) == '\'') {
                    value = value.substring(1, value.length - 1);
                }
                var name = tokens[0].trim();
                result[name] = value;
            }
        }
        return result;
    }

    function getFilterPredicates(filterValue) {
        if (!_.isEmpty(filterValue)) {
            return filterValue.trim().split(",");
        } else {
            return "";
        }
    }

    var params = getQueryParams(document.location.search);
    var filterPredicates = getFilterPredicates(params.filter);
    var predicates = parseFilterPredicates(filterPredicates);
    var predicateNames;
    if (Object.keys) {
        predicateNames = (typeof predicates === 'undefined' || predicates === null) ? {} : Object.keys(predicates);
    } else {
        predicateNames = $CQ().map(function(value, key) {
            return key;
        });
    }
    if (params !== null && params !== undefined) {
        var expLanguage = params.expLanguage;
        if (expLanguage !== null && expLanguage !== undefined) {
            $CQ(".form-language-select").val(expLanguage);
        }
    }

    $CQ("input.scf-js-searchresult-value").val(function() {
        return (typeof predicates === 'undefined' || predicates === null) ? "" : predicates[predicateNames[0]];
    });

    $CQ("input.scf-js-searchresult-jcrtitle").prop("checked", function() {
        if (typeof predicates === 'undefined' || predicates === null)
            return false;
        else {
            return (predicates["jcr:title"] !== null && predicates["jcr:title"] !== undefined) ? true : false;
        }
    });

    $CQ("input.scf-js-searchresult-jcrdescription").prop("checked", function() {
        if (typeof predicates === 'undefined' || predicates === null)
            return false;
        else {
            return (predicates["jcr:description"] !== null && predicates["jcr:description"] !== undefined) ? true : false;
        }
    });

    $CQ("input.scf-js-searchresult-tag").prop("checked", function() {
        if (typeof predicates === 'undefined' || predicates === null)
            return false;
        else {
            return (predicates.tag !== null && predicates.tag !== undefined) ? true : false;
        }
    });

    $CQ("input.scf-js-searchresult-userIdentifier").prop("checked", function() {
        if (typeof predicates === 'undefined' || predicates === null)
            return false;
        else {
            return (predicates.userIdentifier !== null && predicates.userIdentifier !== undefined) ? true : false;
        }
    });
    if (params !== null && params !== undefined) {
        if (params.searchText !== null && params.searchText !== undefined) {
            $CQ("input.scf-js-searchresult-value").val(params.searchText);
        }
    }

    $CQ("form.scf-js-searchresultform").submit(function(event) {
        event.preventDefault();
        var value = "" + $CQ("input.scf-js-searchresult-value").val();
        /*
        var title = $CQ("input.scf-js-searchresult-jcrtitle").is(':checked');
        var description = $CQ("input.scf-js-searchresult-jcrdescription").is(':checked');
        var tag = $CQ("input.scf-js-searchresult-tag").is(':checked');
        var user = $CQ("input.scf-js-searchresult-userIdentifier").is(':checked');
        var expLanguage = $CQ(".form-language-select").val();
        */
        var title = true;
        var description = true;
        var tag = true;
        var user = true;
        var expLanguage = "default";
        var filter = "";
        value = value.trim();
        value = value.replace(/,/gi, '\\,');
        if ((value && value.length > 0) &&
            (title || description || tag || user)) {
            if (title) {
                filter = "filter=jcr:title like '" + value + "'";
            }
            if (description) {
                filter += (filter.length > 0) ? "," : "filter=";
                filter += "jcr:description like '" + value + "'";
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
                filter += "&searchText=" + value;
            } else {
                filter += "&expLanguage=" + "default";
                filter += "&searchText=" + value;
            }
        }
        var url = document.URL.substring(0, document.URL.indexOf("search.")) + "search.html?" + filter;
        var paths = $CQ(this).data("paths");
        var searchPaths;
        if (typeof(paths) != 'undefined' && paths !== null && paths.length > 0) {
            paths = paths.substring(1, paths.length - 1); // remove '[' and ']'
            searchPaths = paths.split(',');
        }

        if (typeof(searchPaths) != 'undefined') {
            for (i = 0; i < searchPaths.length; i++) {
                url += "&path=" + searchPaths[i].trim();
            }
        }
        url += "&_charset_=utf-8";
        if (filter.length > 0) {
            window.location.replace(url);
        }
    });



    /**
     * Support more and less of a comment
     **/
    var moretext = "more";
    var lesstext = "less";
    var showChar = 100;
    var ellipsestext = "...";

    $CQ('.scf-js-searchresult-comment').each(function() {

        var content = $CQ(this).html();

        if (content.length > showChar) {

            var c = content.substr(0, showChar);
            var h = content.substr(showChar - 1, content.length - showChar);
            // Add 2 spans under the div, one for the full text and the other for the less text.
            var html = c + '<span class="moreelipses">' + ellipsestext +
                '</span>&nbsp;<span class="scf-searchresult-morecontent"><span>' + h +
                '</span>&nbsp;&nbsp;<a href="" class="scf-searchresult-morelink">' + moretext + '</a></span>';

            $CQ(this).html(html);
        }

    });



    $CQ(".scf-searchresult-morelink").click(function() {
        if ($CQ(this).hasClass("less")) {
            $CQ(this).removeClass("less");
            $CQ(this).html(moretext);
        } else {
            $CQ(this).addClass("less");
            $CQ(this).html(lesstext);
        }
        $CQ(this).parent().prev().toggle();
        $CQ(this).prev().toggle();
        return false;
    });

    /**
     * Fix up detail link of comments
     */
    function endsWith(s, pattern) {
        var d = s.length - pattern.length;
        return d >= 0 && s.lastIndexOf(pattern) === d;
    }

    $CQ("a.scf-js-searchresult-detaillink").each(function() {
        var href = $CQ(this).attr("href");
        var jcrContent = "/_jcr_content";
        var jcrContentIndex = href.indexOf(jcrContent);
        if (jcrContentIndex === -1) {
            return;
        } else {
            var htmlIndex = href.indexOf(".html");
            if (htmlIndex > jcrContentIndex) {
                var url = href.substring(0, jcrContentIndex);
                var hashtag = href.substring(htmlIndex);
                url += hashtag;

                $CQ(this).attr("href", url);
            }
        }
    });


    $CQ(".scf-search-results a.scf-page").click(function(event) {
        event.preventDefault();
        var suffix = $(event.currentTarget).data("pageSuffix");
        suffix = suffix.toString();
        var suffixInfo = suffix.split(".");
        var aCurrentURL = window.location.href;
        var baseURL = $(event.currentTarget).data("baseUrl");
        var hostName = aCurrentURL.substring(0, aCurrentURL.indexOf(baseURL));
        var offset = aCurrentURL.indexOf(".html") + 5; /* 5= ".html".length */
        var parameters = aCurrentURL.substring(offset);
        var url = hostName + baseURL + "." + suffixInfo[0] + "." + suffixInfo[1] + ".html" + parameters;
        window.location.href = url;

    });
});
