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
<%@page session="false" contentType="text/html" pageEncoding="utf-8"
        import="com.day.cq.i18n.I18n,java.lang.StringBuilder,
                org.apache.sling.api.resource.ValueMap,
                org.apache.sling.api.resource.Resource,
                com.adobe.granite.auth.oauth.ProviderConfigProperties" %>

<%@include file="/libs/foundation/global.jsp"%><%
%><%@include file="/libs/social/security/social-security.jsp" %>

<%
    I18n i18n = new I18n(slingRequest);
    final Session session = slingRequest.getResourceResolver().adaptTo(Session.class);
    final boolean editable = session.hasPermission(resource.getPath(), Session.ACTION_SET_PROPERTY);

%>

<cq:includeClientLib categories="cq.social.connect"/>

<div class="connect-content">
    <h3><%= i18n.get("Pinterest Connect Configuration Settings") %></h3>

    <img src="<%=xssAttrWrap(xssAPI, currentNode.getProperty("thumbnailPath").getString())%>"
         alt="<%=i18n.get("Pinterest Connect")%>"
         title="<%=i18n.get("Pinterest Connect")%>"
         class="twconnect-thumbnail" />

<% if (editable) {%>
    <ul class="twconnect-content">

<%
    String configId = (String)currentPage.getProperties().get("oauth.config.id");

    if(configId != null && configId.length() > 0){

        String configResourceName = ProviderConfigProperties.FACTORY_PID+"-"+currentPage.getName()+".config";
        Resource configResource = resource.getChild(configResourceName);
        if(configResource != null){
            ValueMap props = configResource.adaptTo(ValueMap.class);

%>

        <li><div class="li-bullet"><strong><%= i18n.get("App ID/API Key:") %></strong><%=xssAPI.encodeForHTML(String.valueOf(props.get("oauth.client.id")))%></div></li>

        <li><div class="li-bullet"><strong><%= i18n.get("App Secret:") %></strong><%=xssAPI.encodeForHTML(String.valueOf(props.get("oauth.client.secret")))%></div></li>

        <li class="when-config-successful" style="display:none;"><%= i18n.get("Pinterest Connect Configuration is successful.")%></li>
        <% }else{ %>
            <li><div class="li-bullet">
            <%= i18n.get("No matching configuration for this cloud service could be found...setup is not complete.<br/>Edit this Configuration to complete the setup process.") %>
            </li>
        <% } %>
    <% }else{ %>
            <li><div class="li-bullet">
            <%= i18n.get("No configuration for this cloud service has been found...setup is not complete.<br/>Edit this Configuration to complete the setup process.") %>
            </li>
    <% } %>
        <li><div class="li-bullet"><button onclick="dialog.show()"><%= i18n.get("Edit Configuration") %></button></div></li>
    </ul>
<% } %>
</div>
