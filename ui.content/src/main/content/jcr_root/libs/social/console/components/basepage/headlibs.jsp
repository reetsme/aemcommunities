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
--%><%@page session="false"
        import="com.adobe.cq.social.site.api.SitePage,
                java.util.Arrays,
                java.util.List"%>
<%@include file="/libs/foundation/global.jsp" %><%
%><%
%><cq:include script="/libs/wcm/mobile/components/simulator/simulator.jsp"/>
  <cq:include script="/libs/cq/cloudserviceconfigs/components/servicelibs/servicelibs.jsp"/><%
    currentDesign.writeCssIncludes(pageContext); %>

<cq:includeClientLib categories="cq.shared, cq.foundation-main" />
<cq:includeClientLib js="cq.social.bootstrap.3" />
<%
    final SitePage sitePage = slingRequest.adaptTo(SitePage.class);
    final String theme = sitePage.getTheme();
    final Resource clientLibsList = resource.getChild("clientlibslist");
    final ValueMap props = clientLibsList.getValueMap();
    final String propertyName = "scg:requiredClientLibs";
    final List<String> clientLibs = Arrays.asList(props.get(propertyName, new String[0]));
    for (String category : clientLibs) {%>
        <cq:includeClientLib categories="<%=category%>" />
    <%}%>
<cq:includeClientLib categories="cq.social.console.theme.scfskin" />
<cq:includeClientLib categories="<%= theme %>"/>
<cq:includeClientLib categories="cq.social.hbs.sitepage" />
<meta name="viewport" content="width=device-width, initial-scale=1">
