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
                org.osgi.service.cm.ConfigurationAdmin,
                org.osgi.service.cm.Configuration,
                java.util.Enumeration" %>

<%@include file="/libs/foundation/global.jsp"%><%
%><%@include file="/libs/social/security/social-security.jsp" %>

<%
    I18n i18n = new I18n(slingRequest);
%>

<cq:includeClientLib categories="cq.social.connect"/>

<div>
    <h3><%= i18n.get("Social Connect Configuration Settings") %></h3>

    <ul class="socialconnect-content">

<%
    String configId = (String)currentPage.getProperties().get("oauth.config.id");

    if(configId != null && configId.length() > 0){

        ConfigurationAdmin ca = sling.getService(org.osgi.service.cm.ConfigurationAdmin.class);

        Configuration[] matchingConfigs = ca.listConfigurations("(&(oauth.config.id="+configId+")(service.factoryPid=com.adobe.granite.auth.oauth.provider))");
        if(matchingConfigs != null && matchingConfigs.length == 1){

            Configuration providerConfig = matchingConfigs[0];
%>

        <li><div class="li-bullet"><strong><%= i18n.get("App ID/API Key:") %></strong><%=xssFilterWrap(xssAPI, providerConfig.getProperties().get("oauth.client.id"))%></div></li>

        <li><div class="li-bullet"><strong><%= i18n.get("App Secret:") %></strong><%=xssFilterWrap(xssAPI, providerConfig.getProperties().get("oauth.client.secret"))%></div></li>

        <li>
            <div class="li-bullet"><strong><%= i18n.get("Create Users:") %></strong>
               <%=xssFilterWrap(xssAPI, providerConfig.getProperties().get("oauth.create.users"))%>
            </div>
        </li>

        <li>
            <div class="li-bullet"><strong><%= i18n.get("Mask User Ids:") %></strong>
                <%=xssFilterWrap(xssAPI, providerConfig.getProperties().get("oauth.encode.userids"))%>
            </div>
        </li>

        <li>
            <div class="li-bullet">
                <div class="socialconnect-div-comma-sep-list">
                <strong><%= i18n.get("Add to User Groups:") %></strong>
                <%
                    String[] groups = (String[])providerConfig.getProperties().get("oauth.create.users.groups");
                    StringBuilder groupsSb = new StringBuilder();
                    for(int i=0;i<groups.length;i++){
                        if(i>0){
                            groupsSb.append(", ");
                        }
                        groupsSb.append(groups[i]);
                    }
                %>
                <%=xssFilterWrap(xssAPI, groupsSb.toString())%>
                </div>
            </div>
        </li>
        <li class="when-config-successful" style="display:none;"><%= i18n.get("Social Connect Configuration is successful. You can now use this with your <a href='{0}'>website</a>.", null, "/siteadmin")%></li>
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
</div>
