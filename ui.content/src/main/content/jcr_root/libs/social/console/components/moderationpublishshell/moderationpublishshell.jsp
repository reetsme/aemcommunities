<%--

 ADOBE CONFIDENTIAL
 __________________

  Copyright 2016 Adobe Systems Incorporated
  All Rights Reserved.

 NOTICE:  All information contained herein is, and remains
 the property of Adobe Systems Incorporated and its suppliers,
 if any.  The intellectual and technical concepts contained
 herein are proprietary to Adobe Systems Incorporated and its
 suppliers and are protected by trade secret or copyright law.
 Dissemination of this information or reproduction of this material
 is strictly forbidden unless prior written permission is obtained
 from Adobe Systems Incorporated.

--%>
<%@page session="false"
          contentType="text/html"
          import="org.apache.sling.api.resource.Resource,
                  org.slf4j.Logger,
                  org.slf4j.LoggerFactory"%>
<%@include file="/libs/granite/ui/global.jsp"%>
<%
    Logger LOG = LoggerFactory.getLogger(this.getClass().getName());

    Resource shell3CheckResource = resource.getParent().getChild("shell3/jcr:content");
    if (shell3CheckResource == null) { //check for backward compatibility here
        shell3CheckResource = resource.getChild("shell3/jcr:content");
    }
    if (shell3CheckResource != null) {
        LOG.trace("Getting Shell 3 resource");
        %><sling:include resource="<%=shell3CheckResource.getParent()%>"/><%
    } else {
        LOG.trace("Getting Shell 2 resource");
        Resource shell2Resource = resource.getParent().getChild("shell2");
        if (shell2Resource == null) { //check for backward compatibility here
            shell2Resource = resource.getChild("shell2");
        }
        %><sling:include resource="<%=shell2Resource%>"/><%
    }
%>
