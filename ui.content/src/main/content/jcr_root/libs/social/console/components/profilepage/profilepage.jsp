<%--

 ADOBE CONFIDENTIAL
 __________________

  Copyright 2015 Adobe Systems Incorporated
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
--%>
<%@page session="false" 
     import="org.apache.commons.lang3.StringUtils, com.adobe.granite.security.user.UserProperties"%>
<%@ include file="/libs/foundation/global.jsp" %><%
final String suffix = slingRequest.getRequestPathInfo().getSuffix();
if (StringUtils.isEmpty(suffix)) {
  if (StringUtils.equals("anonymous", resource.getResourceResolver().getUserID())) {
      slingResponse.setStatus(404);
      return;
  }
  final UserProperties loggedInUserProperties = slingRequest.getResourceResolver().adaptTo(UserProperties.class);
    if (loggedInUserProperties == null) {
      slingResponse.setStatus(404);
      return;
    }
    final Node profileNode = loggedInUserProperties.getNode();
    if (profileNode == null) {
      slingResponse.setStatus(404);
      return;
    }
    String loggedInUserPath = profileNode.getPath();
    if (StringUtils.isEmpty(loggedInUserPath)) {
      slingResponse.setStatus(404);
      return;
    } else {
        response.setHeader("Location", slingRequest.getResourceResolver().map(request.getRequestURI()) + loggedInUserPath);
        slingResponse.setStatus(302);
        return;
    }
} else {
  final Resource checkResource = slingRequest.getResourceResolver().getResource(suffix);
    if ((checkResource != null) && (checkResource.isResourceType("cq/security/components/profile"))) {
        %><sling:include replaceSelectors="basepage"/><%

    } else {
      slingResponse.setStatus(404);
      return;
    }
}%>