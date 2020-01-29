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
%><%@include file="/libs/granite/ui/global.jsp" %><%
%><%@page session="false" contentType="text/html" pageEncoding="utf-8"
          import="com.adobe.granite.ui.components.Config,
                  com.adobe.granite.ui.components.ds.ValueMapResource,
                  org.apache.sling.api.resource.ValueMap,
                  org.apache.sling.api.wrappers.ValueMapDecorator,
                  java.util.HashMap" %><%
%><%@taglib prefix="ui" uri="http://www.adobe.com/taglibs/granite/ui/1.0"%><%
%><%

    Config cfg = new Config(resource);
    long predicateIndex = cfg.get("listOrder", 4000L);
    String predicateName = cfg.get("predicateName", "property");
    String propertyPath = cfg.get("name", "");
    String operation = cfg.get("operation", String.class);

    predicateName = predicateIndex + "_" + predicateName;

    ValueMap autocompleteProperties = new ValueMapDecorator(new HashMap<String, Object>());
    autocompleteProperties.put("emptyText", cfg.get("emptyText", i18n.get("Select Group")));
    autocompleteProperties.put("multiple", true);
    autocompleteProperties.put("forceSelection", true);
    autocompleteProperties.put("name", "oauth.create.users.groups");
    autocompleteProperties.put("id", "oauth.create.users.groups");
    autocompleteProperties.put("selector", "group");
    autocompleteProperties.put("rel", "coral-authorizable--cqSocialPanel");
    ValueMapResource valueMapResource = new ValueMapResource(resourceResolver, resource.getPath(), "granite/ui/components/coral/foundation/authorizable/autocomplete", autocompleteProperties);
%>
<div id="scf-js-groupselector" class="coral-Form-fieldwrapper">

    <label class="coral-Form-fieldlabel"><%= i18n.get("Add User To Groups")%></label>
    <sling:include  resource="<%= valueMapResource %>"/>
</div>