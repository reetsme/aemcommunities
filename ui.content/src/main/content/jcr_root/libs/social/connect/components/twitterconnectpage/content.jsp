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

2447US01 - Patent Application - US - 13/648,825
2448US01 - Patent Application - US - 13/648,856

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
    <h3><%= i18n.get("Twitter Connect Configuration Settings") %></h3>

    <img src="<%=xssAttrWrap(xssAPI, currentNode.getProperty("thumbnailPath").getString())%>"
         alt="<%=i18n.get("Twitter Connect")%>"
         title="<%=i18n.get("Twitter Connect")%>"
         class="twconnect-thumbnail" />

<% if (editable) {%>
    <ul class="twconnect-content">

<%
    String configId = (String)currentPage.getProperties().get("oauth.config.id");
    String params[] = (String[])currentPage.getProperties().get("urlParams",String[].class);

    if(configId != null && configId.length() > 0){

        String configResourceName = ProviderConfigProperties.FACTORY_PID+"-"+currentPage.getName()+".config";
        Resource configResource = resource.getChild(configResourceName);
        if(configResource != null){
            ValueMap props = configResource.adaptTo(ValueMap.class);

%>

        <li><div class="li-bullet"><strong><%= i18n.get("App ID/API Key:") %></strong><%=xssAPI.encodeForHTML(String.valueOf(props.get("oauth.client.id")))%></div></li>

        <li><div class="li-bullet"><strong><%= i18n.get("App Secret:") %></strong><%=xssAPI.encodeForHTML(String.valueOf(props.get("oauth.client.secret")))%></div></li>

        <li>
            <div class="li-bullet"><strong><%= i18n.get("Create Users:") %></strong>
               <%=xssAPI.encodeForHTML(String.valueOf(props.get("oauth.create.users")))%>
            </div>
        </li>

        <li>
            <div class="li-bullet"><strong><%= i18n.get("Mask User Ids:") %></strong>
                <%=xssAPI.encodeForHTML(String.valueOf(props.get("oauth.encode.userids")))%>
            </div>
        </li>

        <li>
            <div class="li-bullet">
                <div class="twconnect-div-comma-sep-list">
                <strong><%= i18n.get("Add to User Groups:") %></strong>
                <%
                    String[] groups = (String[])props.get("oauth.create.users.groups",String[].class);
                    StringBuilder groupsSb = new StringBuilder();
                    for(int i=0;i<groups.length;i++){
                        if(i>0){
                            groupsSb.append(", ");
                        }
                        groupsSb.append(groups[i]);
                    }
                %>
                <%=xssAPI.encodeForHTML(groupsSb.toString())%>
                </div>
            </div>
        </li>

        <%  StringBuilder urlparams = new StringBuilder();
            if(params!= null && params.length > 0) {
                for(int i=0;i<params.length;i++){
                    if(i>0){
                        urlparams.append(", ");
                    }
                    urlparams.append(params[i]);
                }
            }
        %>
        <% if(urlparams.toString().length() > 0){ %>
        <li>
            <div class="li-bullet">
                <div class="twconnect-div-comma-sep-list">
                <strong><%= i18n.get("URL Parameters:") %></strong><%=xssAPI.encodeForHTML(urlparams.toString())%>
                </div>
            </div>
        </li>
        <% } %>
        <li class="when-config-successful" style="display:none;"><%= i18n.get("Twitter Connect Configuration is successful. You can now use this with your <a href='{0}'>website</a>.", null, "/siteadmin")%></li>
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
