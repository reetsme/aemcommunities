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

  Handle form POST

--%><%@page session="false" %><%
%><%@page import="java.util.*,
                  org.apache.sling.api.resource.Resource,
                  org.apache.sling.api.request.RequestParameter,
                  com.day.cq.wcm.foundation.forms.FormResourceEdit"%><%
%><%@taglib prefix="sling" uri="http://sling.apache.org/taglibs/sling/1.0" %><%
%><sling:defineObjects/><%

    // handle multi resource posts
    List<Resource> resources = FormResourceEdit.getPostResources(slingRequest);
    FormResourceEdit.multiPost(resources, slingRequest, slingResponse);

%>
