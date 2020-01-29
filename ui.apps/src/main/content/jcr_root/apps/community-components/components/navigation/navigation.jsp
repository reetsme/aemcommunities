<%--

 ADOBE CONFIDENTIAL
 __________________

  Copyright 2013 Adobe Systems Incorporated
  All Rights Reserved.

 NOTICE:  All information contained herein is, and remains
 the property of Adobe Systems Incorporated and its suppliers,
 if any.  The intellectual and technical concepts contained
 herein are proprietary to Adobe Systems Incorporated and its
 suppliers and are protected by trade secret or copyright law.
 Dissemination of this information or reproduction of this material
 is strictly forbidden unless prior written permission is obtained
 from Adobe Systems Incorporated.

--%><%
%><%@include file="/libs/foundation/global.jsp"%><%
%><%@page session="false"
              import="java.util.Iterator"%><%
%><%
    final Page rootGuidePage = currentPage.getAbsoluteParent(2);
    final Iterator<Page> iterChildPages = rootGuidePage.listChildren(null, true);
    Page childPage;
    int previousDepth = rootGuidePage.getDepth() + 1;
%><ul class="nav nav-pills nav-stacked"><%
    while(iterChildPages.hasNext()) {
        childPage = iterChildPages.next();
        if (childPage.getDepth() > previousDepth) {
            %><ul class="nav nav-list"><%
        } else if (childPage.getDepth() < previousDepth) {
            %></ul><%
        }
        previousDepth = childPage.getDepth();%>
        <li class="<%=(currentPage.getPath().equals(childPage.getPath()))?"active":""%>"><a href="<%=childPage.getPath()%>.html"><%=xssAPI.encodeForHTML(childPage.getTitle())%></a></li><%
    }%>
