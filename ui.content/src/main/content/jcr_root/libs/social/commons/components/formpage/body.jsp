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

  Form page component: body

  Simply includes a parsys that holds the form

  ==============================================================================

--%><%@page session="false" %><%
%><%@ include file="/libs/foundation/global.jsp" %><%
%><%@include file="/libs/social/security/social-security.jsp"%><%
%><%@ page import="com.day.cq.wcm.api.WCMMode" %><%

    String paddingStyle = "padding-top: 8px";
    if (WCMMode.fromRequest(request) == WCMMode.EDIT) {
        paddingStyle = "padding: 15px; width: 50%;";
    }
%>
<body>
    <div style="<%=xssPass(xssAPI, paddingStyle)%>">
        <cq:include path="par" resourceType="foundation/components/parsys" />
    </div>
</body>
