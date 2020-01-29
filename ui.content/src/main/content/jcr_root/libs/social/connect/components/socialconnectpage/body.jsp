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
<%@page session="false" contentType="text/html"
            pageEncoding="utf-8"
            import="javax.jcr.Node,
                    java.util.Iterator,
                    com.day.cq.wcm.webservicesupport.Configuration,
                    com.day.cq.wcm.webservicesupport.Service,
                    org.apache.commons.lang.StringEscapeUtils,
                    org.apache.sling.api.resource.Resource"%>


<%@include file="/libs/foundation/global.jsp"%>
<%@include file="/libs/cq/cloudserviceconfigs/components/configpage/init.jsp"%><%
%><%@include file="/libs/social/security/social-security.jsp" %>

<cq:includeClientLib categories="cq.social.connect"/>

<%
    final String id = currentPage.getName();
    final String title = xssAPI.encodeForHTML(properties.get("jcr:title", id));
    final String description = xssAPI.encodeForHTML(properties.get("jcr:description", ""));
    final String path = resource.getPath();
    final String resourceType = resource.getResourceType();
    final String dialogPath = (!resourceType.startsWith("/libs") ? "/libs/" : "") + resourceType + "/dialog";
%>

<body>

    <script type="text/javascript">
        var dialog = CQ.WCM.getDialog("<%=xssJSWrap(xssAPI, dialogPath)%>");
        dialog.loadContent(CQ.WCM.getPagePath() + "/jcr:content.configvalues.json");
        dialog.on('beforesubmit', $CQ.SocialAuth.osgi.updateOAuthProviderConfig);
    </script>

    <h1><%=xssPass(xssAPI, title)%></h1>

    <p><%=xssPass(xssAPI, description)%></p>

    <cq:include script="content.jsp" />

    <%@include file="opendialog.jsp"%>
</body>
