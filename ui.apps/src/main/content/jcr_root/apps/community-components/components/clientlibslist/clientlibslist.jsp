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
%><%@page session="false"
        import="java.util.Arrays,
            java.util.List"%><%
%><%@ include file="/libs/foundation/global.jsp" %><%
    final String propertyName = "scg:requiredClientLibs";
    final List<String> clientLibs = Arrays.asList(properties.get(propertyName, new String[0]));
    if ( clientLibs.size() > 0) {%>
<ul><%for (String category : clientLibs) {%>
    <li><%=category%></li>
    <cq:includeClientLib categories="<%=category%>" />
    <%}%>
</ul>
<%} else {
        %><div class="alert alert-info">No client libraries are required for this component.</div><%
}%>
