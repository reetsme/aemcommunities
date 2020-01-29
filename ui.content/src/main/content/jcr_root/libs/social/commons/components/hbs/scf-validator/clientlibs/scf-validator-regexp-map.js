/*
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2012 Adobe Systems Incorporated
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
var baseRules = {
    "default": {
        "text": CQ.I18n.getMessage("Default match. Matches everything."),
        "regexp": "[\s\S]*"
    },
    "integer": {
        "text": CQ.I18n.getMessage("Integer only"),
        "regexp": /^\s*(\+|-)?\d+\s*$/
    },
    "text": {
        "text": CQ.I18n.getMessage("Text only. No digits"),
        "regexp": "^[a-zA-Z ]*$"
    },
    "numbers": {
        "text": CQ.I18n.getMessage("Numbers only. No special chars, or letters"),
        "regexp": "^[0-9]*$"
    },
    "messagesubject": {
        "text": CQ.I18n.getMessage("Please enter min 2, max 10, numbers, letters and/or some characters"),
        "regexp": "^([a-zA-Z0-9 \"~&|'!@#$%*()-_=+;?/{}]{2,10})$"
    },
    "email": {
        "text": CQ.I18n.getMessage("Please enter valid email address"),
        "regexp": /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
    },
    "noempty": {
        "text": CQ.I18n.getMessage("Cannot be empty"),
        "regexp": /\S/
    }
};
