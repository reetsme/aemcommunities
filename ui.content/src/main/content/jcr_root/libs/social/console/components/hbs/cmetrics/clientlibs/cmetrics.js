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

(function(window, document, Granite, $) {
    "use strict";
    $(document).ready(function() {
        var _metricsData = {
            "items": [{
                "id": 0,
                "label": "Blah0",
                "activities": "9804",
                "members": 10,
                "lastWeek": 90,
                "lastMonth": 1,
                "lastActivity": "2104-06-20, 9:30AM EST"
            }, {
                "id": 1,
                "label": "Blah1",
                "activities": "9804",
                "members": 9,
                "lastWeek": 80,
                "lastMonth": 2,
                "lastActivity": "2104-06-20, 9:30AM EST"
            }, {
                "id": 2,
                "label": "Blah2",
                "activities": "9804",
                "members": 8,
                "lastWeek": 70,
                "lastMonth": 3,
                "lastActivity": "2104-06-20, 9:30AM EST"
            }, {
                "id": 3,
                "label": "Blah3",
                "activities": "9804",
                "members": 7,
                "lastWeek": 60,
                "lastMonth": 4,
                "lastActivity": "2104-06-20, 9:30AM EST"
            }, {
                "id": 4,
                "label": "Blah4",
                "activities": "9804",
                "members": 6,
                "lastWeek": 50,
                "lastMonth": 5,
                "lastActivity": "2104-06-20, 9:30AM EST"
            }, {
                "id": 5,
                "label": "Blah5",
                "activities": "9804",
                "members": 5,
                "lastWeek": 40,
                "lastMonth": 6,
                "lastActivity": "2104-06-20, 9:30AM EST"
            }, {
                "id": 0,
                "label": "Blah0",
                "activities": "9804",
                "members": 10,
                "lastWeek": 90,
                "lastMonth": 1,
                "lastActivity": "2104-06-20, 9:30AM EST"
            }, {
                "id": 1,
                "label": "Blah1",
                "activities": "9804",
                "members": 9,
                "lastWeek": 80,
                "lastMonth": 2,
                "lastActivity": "2104-06-20, 9:30AM EST"
            }, {
                "id": 2,
                "label": "Blah2",
                "activities": "9804",
                "members": 8,
                "lastWeek": 70,
                "lastMonth": 3,
                "lastActivity": "2104-06-20, 9:30AM EST"
            }, {
                "id": 3,
                "label": "Blah3",
                "activities": "9804",
                "members": 7,
                "lastWeek": 60,
                "lastMonth": 4,
                "lastActivity": "2104-06-20, 9:30AM EST"
            }, {
                "id": 4,
                "label": "Blah4",
                "activities": "9804",
                "members": 6,
                "lastWeek": 50,
                "lastMonth": 5,
                "lastActivity": "2104-06-20, 9:30AM EST"
            }, {
                "id": 5,
                "label": "Blah5",
                "activities": "9804",
                "members": 5,
                "lastWeek": 40,
                "lastMonth": 6,
                "lastActivity": "2104-06-20, 9:30AM EST"
            }, {
                "id": 0,
                "label": "Blah0",
                "activities": "9804",
                "members": 10,
                "lastWeek": 90,
                "lastMonth": 1,
                "lastActivity": "2104-06-20, 9:30AM EST"
            }, {
                "id": 1,
                "label": "Blah1",
                "activities": "9804",
                "members": 9,
                "lastWeek": 80,
                "lastMonth": 2,
                "lastActivity": "2104-06-20, 9:30AM EST"
            }, {
                "id": 2,
                "label": "Blah2",
                "activities": "9804",
                "members": 8,
                "lastWeek": 70,
                "lastMonth": 3,
                "lastActivity": "2104-06-20, 9:30AM EST"
            }, {
                "id": 3,
                "label": "Blah3",
                "activities": "9804",
                "members": 7,
                "lastWeek": 60,
                "lastMonth": 4,
                "lastActivity": "2104-06-20, 9:30AM EST"
            }, {
                "id": 4,
                "label": "Blah4",
                "activities": "9804",
                "members": 6,
                "lastWeek": 50,
                "lastMonth": 5,
                "lastActivity": "2104-06-20, 9:30AM EST"
            }, {
                "id": 5,
                "label": "Blah5",
                "activities": "9804",
                "members": 5,
                "lastWeek": 40,
                "lastMonth": 6,
                "lastActivity": "2104-06-20, 9:30AM EST"
            }, {
                "id": 0,
                "label": "Blah0",
                "activities": "9804",
                "members": 10,
                "lastWeek": 90,
                "lastMonth": 1,
                "lastActivity": "2104-06-20, 9:30AM EST"
            }, {
                "id": 1,
                "label": "Blah1",
                "activities": "9804",
                "members": 9,
                "lastWeek": 80,
                "lastMonth": 2,
                "lastActivity": "2104-06-20, 9:30AM EST"
            }, {
                "id": 2,
                "label": "Blah2",
                "activities": "9804",
                "members": 8,
                "lastWeek": 70,
                "lastMonth": 3,
                "lastActivity": "2104-06-20, 9:30AM EST"
            }, {
                "id": 3,
                "label": "Blah3",
                "activities": "9804",
                "members": 7,
                "lastWeek": 60,
                "lastMonth": 4,
                "lastActivity": "2104-06-20, 9:30AM EST"
            }, {
                "id": 4,
                "label": "Blah4",
                "activities": "9804",
                "members": 6,
                "lastWeek": 50,
                "lastMonth": 5,
                "lastActivity": "2104-06-20, 9:30AM EST"
            }, {
                "id": 5,
                "label": "Blah5",
                "activities": "9804",
                "members": 5,
                "lastWeek": 40,
                "lastMonth": 6,
                "lastActivity": "2104-06-20, 9:30AM EST"
            }]
        };
        $.each(_metricsData.items, function(key, value) {

            var _metricsGroupName = value.label;
            var _metricsGroupMembers = value.members;
            var _metricsActivities = value.activities;
            var _metricsLastWeek = value.lastWeek;
            var _metricsLastMonth = value.lastMonth;
            var _metricsLastActivity = value.lastActivity;

            var _markup = "<div style=\"display: inline-block; float: left;\">";
            _markup += "<article class=\"card-page card-collection foundation-collection-item\">";
            _markup += "<table id=\"tableMainContainer\" class=\"coral-Table--bordered\" " +
                "style=\"width:220px;box-shadow:0px 2px 2px #888888;\">";
            _markup += "<thead><tr class=\"coral-Table-row\">" +
                "<th class=\"metrics-table-header coral-Table-headerCell\">";
            _markup += "<span id=\"metrics-group-name\" style=\"font-color:#3287d2;margin-left:10px;\">" +
                _metricsGroupName + "</span>";
            _markup += "<span id=\"metrics-group-members\" style=\"color:#3287d2;\"> (" + _metricsGroupMembers +
                ")</span></th></tr></thead>";
            _markup += "<tfoot><tr class=\"coral-Table-row\">" +
                "<td class=\"metrics-table-header coral-Table-headerCell\">" +
                "<p style=\"margin-top:4px;\">" + Granite.I18n.get("Last activity") + "</p>";
            _markup += "<p id=\"metrics-last-activity\" style=\"font-weight:normal;\">" +
                _metricsLastActivity + "</p></td></tr></tfoot>";
            _markup += "<tbody><tr class=\"coral-Table-row\"><td class=\"metrics-table-body coral-Table-cell\">" +
                "<p style=\"margin:10px;\">";
            _markup += "<i class=\"coral-Icon coral-Icon--sizeL coral-Icon--users\"></i></p>";
            _markup += "<p class=\"metrics-table-body-content\">" + Granite.I18n.get("Activities: ") + "<span id=\"metrics-activities\">" +
                _metricsActivities + "</span></p>";
            _markup += "<p class=\"metrics-table-body-content\">" + Granite.I18n.get("Last week: ") + "<span id=\"metrics-last-week\">" +
                _metricsLastWeek + "</span></p>";
            _markup += "<p class=\"metrics-table-body-content\">" + Granite.I18n.get("Last month: ") + "<span id=\"metrics-last-month\">" +
                _metricsLastMonth + "</span></p>";
            _markup += "</td></tr></tbody></table></article></div>";

            $(_markup).appendTo($("#div-metrics-dummy"));
        });
    });

})(window, document, Granite, Granite.$);
