/*
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2013 Adobe Systems Incorporated
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
    var wordsMap = {};

    function addToMap(text) {
        var words = text.split(/\s+/);
        words.forEach(function(word) {
            word = word.replace(/[\'\"]+/g, '');
            wordsMap[word] = true;
        });
    }

    var target = $CQ('[name="related-question-list"]');
    var id = target.attr("related-question-list-id");
    target.empty();

    var href = window.location.href;

    var title = $CQ('[data-translate-prop="jcr:title"]').text();

    var body = $CQ('.scf-js-topic-details').text();
    if (title || body) {
        addToMap(title + ' ' + body);
    } else {
        // seems we are on index page, search for topic-list-component
        $CQ('.topic-list-component').each(function(idx, topic) {
            var title = $CQ(topic).find('.topic-title').find('a').text();
            var body = $CQ(topic)
                .find('.message')
                .text();
            addToMap(title + ' ' + body);
        });
    }

    ['read', 'more'].forEach(function(word) {
        delete wordsMap[word];
    });

    var query = '';
    for (var word in wordsMap) {
        if (!wordsMap.hasOwnProperty(word)) continue;
        query = query + word + ' ';
    }

    var query_quoted = escape(query);

    var maxLength = 1800;
    if (query_quoted.length > maxLength) {
        query_quoted = query_quoted.substring(0, maxLength);
        query_quoted = query_quoted.replace(/^(.*)%20.*$/, '$1'); // remove halfword
    }
    if (typeof(id) !== "undefined") {
        $CQ.ajax({
            url: CQ.shared.HTTP.getContextPath() + id + '.social.query.json?max-results=8&resource-type=topic&q=' + query_quoted,
            dataType: "json",
            async: true,
            type: 'GET',
            success: function(data, i) {
                target.empty();
                var mlt = data.items;

                $CQ.map(mlt, function(item) {
                    var url = item.friendlyUrl;

                    // prevent from showing own question in related
                    var idx = href.indexOf(url);
                    if (idx != -1 && (href.length - idx) == url.length) return;

                    var el = $CQ('<li class="matched-questions"><p class="subject"><a href="' + url + '">' + item.subject + '</a></p></li>');
                    target.append(el);
                });
            }
        });
    }
});
