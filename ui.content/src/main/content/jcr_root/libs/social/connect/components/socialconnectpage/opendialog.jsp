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
<%--
    Open configuration dialog if the property designated by "connectedWhen" is filled in..
    if oauth.config.id has been created then this is not our first entry.
--%><%@ page session="false" %>
<%@include file="/libs/foundation/global.jsp" %>

<script type="text/javascript">
<% if (properties.get("oauth.config.id", "").trim().equals("")) { %>
        dialog.show();
<% } else {%>
       $CQ(".when-config-successful").show();
<% } %>
</script>
