<%--

 ADOBE CONFIDENTIAL
 __________________

  Copyright 2012 Adobe Systems Incorporated
  All Rights Reserved.

 NOTICE:  All information contained herein is, and remains
 the property of Adobe Systems Incorporated and its suppliers,
 if any.  The intellectual and technical concepts contained
 herein are proprietary to Adobe Systems Incorporated and its
 suppliers and are protected by trade secret or copyright law.
 Dissemination of this information or reproduction of this material
 is strictly forbidden unless prior written permission is obtained
 from Adobe Systems Incorporated.

  ==============================================================================

  Head script for form template

  ==============================================================================

--%><%@ include file="/libs/foundation/global.jsp" %><%
%><%@include file="/libs/social/security/social-security.jsp"%><%@page session="false" import="org.apache.commons.lang3.StringEscapeUtils"%><%
%><head>
    <meta http-equiv="content-type" content="text/html; charset=UTF-8">
    <% currentDesign.writeCssIncludes(out); %>
    <cq:include script="/libs/wcm/core/components/init/init.jsp"/>
<%
    // when this form is rendered in an iframe, wcm mode is typically disabled,
    // but we always need the core widget libs for the Ext-based form elements

    // TODO: no form used on publish must use cq.widgets!

    %><cq:includeClientLib categories="cq.wcm.edit,cq.tagging,cq.security"/><%

    // don't let the current design break our fragile form layout css
    //currentDesign.writeCssIncludes(out);
%>
    <title><%=xssPass(currentPage.getTitle() == null ? StringEscapeUtils.escapeHtml4(currentPage.getName()) : StringEscapeUtils.escapeHtml4(currentPage.getTitle()))%></title>

    <%-- global wrapper for contained form (identified by fixed form id/name) --%>
    <script type="text/javascript">
        window.FORMPAGE_FORM_ID = "formpage_form_DO_NOT_CHANGE";

        CQ.Ext.onLoad(function() {
            window.formpage_form = new CQ.form.FormWrapper({
                "form": window.FORMPAGE_FORM_ID
            });
        });
    </script>

<%-- Styling for forms  --%>
<style type="text/css">
body, img, a, div, td, th, input, textarea {
    font-family:Tahoma;
    font-size-adjust:none;
    font-style:normal;
    font-variant:normal;
    font-weight:normal;
    line-height:normal;
}

body, img, a, div, td, th, input, textarea, .x-form-field, .x-combo-list-item {
    font-size: 11px !important;
}

.form_leftcol label {
    line-height: 18px;
}

.input input, .ta{
    height:18px;
    padding:2px 0 0 0;
    margin:0 0 0 0;
    border:none;
    background:#8EBFD3;
    color:#373737;
}
.ta {
    height:111px;
    overflow:auto;
    padding:5px 0 0 0;
    margin:0 0 20px 0;
}
.eq_height {
    height:31px;
}

div.element {
    margin-bottom: 2px;
}

.form_1 {
    border-top:1px solid #D9D9D9;
    background:#F0F0F0;
    padding:17px 34px 16px 8px;
}
.form_1 .link_1 {
    background:url(images/bullet1.gif) 0 0 no-repeat;
    padding:0 0 0 10px;
    color:#14729E;
    font:normal 10px Tahoma;
}
.form_1 input {
    border:1px solid #A1A1A1;
    width:180px;
    height:17px;
    margin:0 0 13px 0;
}
.form_row {
    clear: both;
    width: 100%;
    padding-top: 10px;
}

.form_leftcol {
    padding-left: 9px;
    float: left;
    width: 95px;
}

.form_leftcollabel {
    float: left;
    width: 85px;
}
.form_leftcolmark {
    float: right;
    width: 10px;
}

.form_rightcol {
    margin-left: 109px;
}

.form_rightcol_left {
    float: left;
    width: 105px;
}

.form_rightcol_middle {
    float: left;
    width:23px;
}

.form_rightcol_right {
    float: left;
    width: 105px;
}

.form_rightcol .form-readonly {
    line-height: 18px;
}

div.form_captchatimer {
    float: left;
    border: 1px solid #CCCCCC;
}

div.form_captchatimer_bar {
    float: left;
    background-color:#CCCCCC;
    height: 8px;
}

div.form_captcha_input {
    float: left;
    vertical-align: baseline;
    padding-top: 4px;
}

div.form_captcha_img {
    float: left;
    vertical-align: baseline;
    padding-left: 4px;
    padding-right: 4px;
}

div.form_captcha_refresh {
    float: left;
    padding-top: 4px;
}
</style>
</head>
