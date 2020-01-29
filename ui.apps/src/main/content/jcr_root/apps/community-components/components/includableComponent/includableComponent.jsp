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
          import="java.util.Iterator,
                    com.day.cq.commons.jcr.JcrConstants,
          org.apache.sling.api.resource.ValueMap,
          org.apache.sling.api.resource.NonExistingResource,
          org.apache.sling.api.resource.ResourceWrapper"%><%
    final boolean slingInclude = properties.get("scg:dynamicInclude", false);
    if (!slingInclude) {
        %><p>This component is included via its par node.</p><%
        %><sling:include path="." replaceSelectors="parsys"/><%
    } else {
        final Resource childResource = resource.listChildren().next();
        if (childResource == null) {
            %><h3>Error: Includable Component needs to be first child.</h3><%
        } else {
            String pathToInclude = (slingRequest.getRequestPathInfo().getSuffix() == null)?"./slingIncluded":slingRequest.getRequestPathInfo().getSuffix();
            %><p>This component is included dynamically.</p><%
            %><sling:include path="<%=pathToInclude%>" resourceType="<%=childResource.getResourceType()%>"/><%
        }
    }
%>
