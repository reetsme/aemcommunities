<%--

 ADOBE CONFIDENTIAL
 __________________

  Copyright 2014 Adobe Systems Incorporated
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
%><%@page session="false"
          import="com.adobe.granite.ui.components.AttrBuilder,
          com.adobe.granite.ui.components.Config,
          com.adobe.granite.ui.components.Tag,
          com.adobe.granite.ui.components.ds.DataSource"%><%
%><%@include file="/libs/granite/ui/global.jsp"%><%
Config cfg = new Config(resource, null, null);
String resourceType = cfg.get("resourceType", "granite/ui/components/foundation/container");
AttrBuilder containerAttrs = new AttrBuilder(request, xssAPI);
containerAttrs.addClass("foundation-collection-container foundation-layout-util-maximized card");

AttrBuilder childAttrs = new AttrBuilder(request, xssAPI);
childAttrs.add("data-foundation-collection-quickactions", "{}");
childAttrs.addClass("js-endor-scrollarea");

Tag tag = cmp.consumeTag();
tag.setAttrs(childAttrs);
%>

<div <%=containerAttrs.build()%>>
    <% cmp.include(resource, resourceType, tag); %>
</div>