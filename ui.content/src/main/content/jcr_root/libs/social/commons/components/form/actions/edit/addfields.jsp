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

  Form 'action' component

  Called after the form start to add action-specific fields

--%><%
%><%@ page session="false" %><%
%><%@ page import="java.util.List,
                   org.apache.commons.lang3.StringEscapeUtils,
                   org.apache.sling.api.resource.Resource,
                   com.day.cq.wcm.foundation.forms.FormsConstants,
                   com.day.cq.wcm.foundation.forms.FormResourceEdit" %><%
%><%@ taglib prefix="sling" uri="http://sling.apache.org/taglibs/sling/1.0" %><%
%><sling:defineObjects/><%

    List<Resource> resources = FormResourceEdit.getResources(slingRequest);
    if (resources != null) {
        for (Resource r : resources) { %>
<input type="hidden" name="<%= FormResourceEdit.RESOURCES_PARAM %>" value="<%= StringEscapeUtils.escapeHtml4(r.getPath()) %>"><%
        }
    }

    String redirectTo = slingRequest.getParameter("redirectTo");
    if (redirectTo != null) { %>
<input type="hidden" name="<%= FormsConstants.REQUEST_PROPERTY_REDIRECT %>" value="<%= StringEscapeUtils.escapeHtml4(redirectTo) %>">
<%
    }
%>
