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

2447US01 - Patent Application - US - 13/648,825
2448US01 - Patent Application - US - 13/648,856

--%>
<%@page session="false" contentType="text/html; charset=utf-8" %>
<%@include file="/libs/foundation/global.jsp" %>

<%

if (request.getParameter("configid") != null ||
    request.getParameter("code") != null ||
    request.getParameter("oauth_verifier") != null){
%>
    <cq:include path="servlet" resourceType="social/oauth/connect" />
<%
} else {
%>
    <%@include file="callback.html.jsp" %>
<%
}
%>
