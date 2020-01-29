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

  Initializes the resource(s) to be edited by the form

--%><%
%><%@ page session="false" %><%
%><%@ page import="java.util.List,
                   java.util.Map,
                   java.util.HashMap,
                   org.apache.commons.lang.StringUtils,
                   org.apache.sling.api.resource.Resource,
                   org.apache.sling.api.resource.ResourceUtil,
                   org.apache.sling.api.resource.ValueMap,
                   org.apache.sling.api.wrappers.ValueMapDecorator,
                   com.day.cq.wcm.foundation.forms.FormResourceEdit,
                   com.day.cq.wcm.foundation.forms.FormsHelper,
                   com.day.cq.wcm.foundation.forms.FormsConstants" %><%
%><%@ taglib prefix="sling" uri="http://sling.apache.org/taglibs/sling/1.0" %><%@include file="/libs/foundation/global.jsp" %><%
%><sling:defineObjects/><%

    final String REQ_ATTR_GLOBAL_LOAD_MAP = "cq.form.loadmap";
    ValueMap map =  (ValueMap) slingRequest.getAttribute(REQ_ATTR_GLOBAL_LOAD_MAP);
    List<Resource> resources = FormResourceEdit.getResources(slingRequest);
    if (resources != null) {
        if (resources.size() == 1) {
            // single resource
            FormsHelper.setFormLoadResource(slingRequest, resources.get(0));
        } else if (resources.size() > 1) {
            // multiple resources
            FormsHelper.setFormLoadResource(slingRequest, FormResourceEdit.getMergedResource(resources));
        }
        if (null != map) {
            slingRequest.setAttribute(REQ_ATTR_GLOBAL_LOAD_MAP, map);
          }
    }
%>
