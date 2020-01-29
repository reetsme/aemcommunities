<%--

 ADOBE CONFIDENTIAL
 __________________

  Copyright 2017 Adobe Systems Incorporated
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
%><%@include file="/libs/granite/ui/global.jsp"%><%
%><%@page session="false"%><%
%><%@page import="java.util.ArrayList,
                  java.util.List,
                  java.util.Collection,
                  org.apache.sling.api.resource.Resource,
                  org.apache.sling.api.resource.ValueMap,
                  com.adobe.granite.ui.components.Config,
                  com.adobe.granite.ui.components.ValueMapResourceWrapper"%><%


    Config cfg = cmp.getConfig();
    String path = cmp.getExpressionHelper().getString(cfg.get("path", ""));;

    if ("".equals(path)) {
        return;
    }

    Resource contentResource = resourceResolver.getResource(path);
    ValueMap properties = contentResource.adaptTo(ValueMap.class);
    Resource wrapper = new ValueMapResourceWrapper(resource, "granite/ui/components/coral/foundation/form/select");
    ValueMap vm = wrapper.adaptTo(ValueMap.class);

    vm.put("name", cfg.get("name", ""));
    vm.put("fieldLabel", cfg.get("fieldLabel", "Badging Rule"));
    vm.put("path", path);
    vm.put("multiple", cfg.get("multiple", false));
    vm.put("emptyText", cfg.get("emptyText", ""));
    vm.put("renderReadOnly", cfg.get("renderReadOnly", true));
    String rel = cfg.get("rel", ""); // legacy (Coral 2 components config) support
    vm.put("granite:class", cfg.get("granite:class", rel));
    vm.put("ignoreData", cfg.get("ignoreData", true));
    //fetch existing value
    String rule = properties.get("badgingRule", "");

    if(rule !=null)
        vm.put("selectedValue", rule);

%><sling:include resource="<%= wrapper %>" /><%


%>