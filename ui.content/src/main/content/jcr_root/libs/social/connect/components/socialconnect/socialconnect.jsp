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
<%--
  Social Connect Component - uses cloud service configs as 'providers'.
--%>

<%@include file="/libs/foundation/global.jsp" %><%
%><%@include file="/libs/social/security/social-security.jsp" %>
<%@page session="false" contentType="text/html; charset=utf-8" import="com.day.cq.i18n.I18n,
                                                         com.day.cq.personalization.ProfileUtil,
                                                         com.day.cq.wcm.api.WCMMode,
                                                         com.day.cq.wcm.webservicesupport.ConfigurationManager,
                                                         org.apache.sling.api.resource.Resource,
                                                         com.adobe.granite.security.user.UserManagementService,
                                                         com.adobe.granite.security.user.UserProperties,
                                                         com.adobe.granite.auth.oauth.ProviderConfigProperties,
                                                         org.osgi.service.cm.ConfigurationAdmin,
                                                         org.osgi.service.cm.Configuration"%>

<cq:includeClientLib categories="cq.social.connect"/>
<script type="text/javascript">
    $CQ(document).ready(function() {
        $CQ.SocialAuth.socialconnect.initSliders();
    });
</script>

<%
    final ConfigurationManager cfgMgr = resourceResolver.adaptTo(ConfigurationManager.class);

    com.day.cq.wcm.webservicesupport.Configuration facebookConfiguration = null;
    com.day.cq.wcm.webservicesupport.Configuration twitterConfiguration = null;

    final String[] services = pageProperties.getInherited("cq:cloudserviceconfigs", new String[]{});
    if(cfgMgr != null) {
        facebookConfiguration = cfgMgr.getConfiguration("facebookconnect", services);
        twitterConfiguration = cfgMgr.getConfiguration("twitterconnect", services);
    }
    final I18n i18n = new I18n(slingRequest);
    final String uniqSuffix = resource.getPath().replaceAll("/","-").replaceAll(":","-");
    final String divID = "socialconnect" + uniqSuffix;

    final UserManagementService ums = sling.getService(UserManagementService.class);
    final boolean isAnonymous = ums.getAnonymousId().equals(slingRequest.getResourceResolver().getUserID());
    final boolean isDisabled = WCMMode.DISABLED.equals(WCMMode.fromRequest(request));
    final String loginSuffix = isDisabled && isAnonymous ? "/j_security_check" : "/connect";
    final String profilePath = slingRequest.getResourceResolver().adaptTo(UserProperties.class).getResource(".").getPath();
%>
<script type="text/javascript">

    $CQ(document).ready(function () {
        //listening for this global event - triggered from SocialAuth.js - $CQ.SocialAuth.oauthCallbackComplete
        //any element can subscribe to this event to perform custom functionality post-oauth-callback completion
        //the social login component will listen for it here to perform the appropriate redirect as configured
        $CQ(document).bind('oauthCallbackComplete', function(ev,userId) {
            //oauthCallbackComplete happened
            CQ_Analytics.ProfileDataMgr.loadProfile(userId);
            CQ.shared.Util.reload();
            $CQ.SocialAuth.socialconnect.completeConnect();
       });
    });

</script>

<% if (!isAnonymous) { %>
        <div id="<%=xssAttrWrap(xssAPI, divID)%>">
        <%
        final Session session = slingRequest.getResourceResolver().adaptTo(Session.class);
        if(facebookConfiguration != null || twitterConfiguration != null){
            ConfigurationAdmin ca = sling.getService(org.osgi.service.cm.ConfigurationAdmin.class);
            Configuration[] matchingConfigs;
        %>
            <div class="socialconnectbuttons">
                <%
                if(facebookConfiguration != null){
                    final Resource configResource = facebookConfiguration.getResource();
                    final Page configPage = configResource.adaptTo(Page.class);
                    final String configid = configPage.getProperties().get("oauth.config.id",String.class);
                    matchingConfigs = ca.listConfigurations("(&(oauth.config.id="+configid+")(service.factoryPid="+ProviderConfigProperties.FACTORY_PID+"))");
                    final String clientid =  getClientId(matchingConfigs);

                    // Checking if already connected to facebook
                    final String FACEBOOK = "/facebook";
                    final String facebookProfilePath = profilePath + FACEBOOK;
                    boolean isFBConnected = false;
                    String isFacebookConnected = i18n.get("OFF","Disconnect from the current social provider.") ;
                    String isFacebookConnectedClassName = "off" ;
                    String facebookUserName= "";
                    String facebookUserURL= "";
                    if(session.itemExists(facebookProfilePath)) {
                        try {
                            Node n = session.getNode(facebookProfilePath);
                            String id = n.getProperty("id").getString();
                            if (n.hasProperty("username")){
                                facebookUserName = n.getProperty("username").getString();
                            } else if (n.hasProperty("first_name") && n.hasProperty("last_name")){
                                facebookUserName = n.getProperty("first_name").getString() + " " + n.getProperty("last_name").getString();
                            } else {
                                //just in case they are nameless
                                facebookUserName = id;
                            }
                            facebookUserURL= "http://facebook.com/"+id;
                            isFBConnected = true;
                            isFacebookConnected = i18n.get("ON","Connect to the current social provider.");
                            isFacebookConnectedClassName = "on";
                         } catch (PathNotFoundException pnfe) {
                             log.warn("Social connect - facebook path not found: " + facebookProfilePath, pnfe);
                         }
                    }
                    %>
                    <div class="channelcontainer">
                        <h2><%= i18n.get("Facebook") %></h2>
                        <div class="channeldetails">
                            <div class="channellinklabel"><%= i18n.get("Link to facebook","Connect to facebook provider.") %></div>
                            <div class="channelconnectbutton">
                                <div class="connect-slider-frame">
                                    <span data-resourcepath="<%=xssAPI.encodeForHTMLAttr(resource.getPath())%>" data-divid="<%=xssAttrWrap(xssAPI, divID)%>" data-clientid="<%=xssAPI.encodeForHTMLAttr(clientid)%>" data-configpagepath="<%=xssAPI.encodeForHTMLAttr(configPage.getPath())%>" data-configid="<%=xssAPI.encodeForHTMLAttr(configid)%>" data-socialprofilepath="<%=xssAPI.encodeForHTMLAttr(facebookProfilePath)%>"  data-loginSuffix="<%=xssAttrWrap(xssAPI, loginSuffix)%>" class="slider-button <%=xssAttrWrap(xssAPI, isFacebookConnectedClassName)%>"><%=xssFilterWrap(xssAPI, isFacebookConnected)%></span>
                                </div>
                            </div>
                            <%if(isFBConnected){%>
                                <a class="connectnamelink" target="_blank" href="<%=xssAPI.getValidHref(facebookUserURL)%>" ><%=xssAPI.encodeForHTML(facebookUserName)%></a>
                                <div class="connectchangelink" onclick="$CQ.Event(event).preventDefault();$CQ.SocialAuth.socialconnect.doChange('<%=xssJSWrap(xssAPI, xssAPI.getValidHref(facebookProfilePath))%>','<%=xssJSWrap(xssAPI, xssAPI.getValidHref(configPage.getPath()))%>','<%=xssAPI.encodeForJSString(configid)%>','<%=xssAPI.encodeForJSString(loginSuffix)%>','<%=xssAPI.encodeForJSString(clientid)%>');"><%= i18n.get("change") %></div>
                            <%}%>

                        </div>

                    </div>
                    <%
                }
                if(twitterConfiguration != null){
                    final Resource configResource = twitterConfiguration.getResource();
                    final Page configPage = configResource.adaptTo(Page.class);
                    final String configid = configPage.getProperties().get("oauth.config.id",String.class);
                    matchingConfigs = ca.listConfigurations("(&(oauth.config.id="+configid+")(service.factoryPid="+ProviderConfigProperties.FACTORY_PID+"))");
                    final String clientid =  getClientId(matchingConfigs);

                    // Checking if already connected to twitter
                    final String TWITTER = "/twitter";
                    final String twitterProfilePath = profilePath + TWITTER;
                    boolean isTWeetConnected = false;
                    String isTwitterConnected = i18n.get("OFF");
                    String isTwitterConnectedClassName = "off";
                    String twitterScreenName= "";
                    String twitterUserURL= "";
                    if(session.itemExists(twitterProfilePath)) {
                        try {
                            Node n = session.getNode(twitterProfilePath);
                            twitterScreenName = n.getProperty("screen_name").getString();
                            twitterUserURL= "http://twitter.com/"+twitterScreenName;
                            isTWeetConnected = true;
                            isTwitterConnected = i18n.get("ON");
                            isTwitterConnectedClassName="on";
                         } catch (PathNotFoundException pnfe) {
                             log.warn("Social connect - twitter profile path not found: " + twitterProfilePath, pnfe);
                         }
                    }
                    %>
                    <div class="channelcontainer">
                        <h2><%= i18n.get("Twitter") %></h2>
                        <div class="channeldetails">
                            <div class="channellinklabel"><%= i18n.get("Link to twitter","Connect to twitter provider.") %></div>
                            <div class="channelconnectbutton">
                                <div class="connect-slider-frame">
                                    <span data-divid="<%=xssAttrWrap(xssAPI, divID)%>" data-configpagepath="<%=xssAPI.encodeForHTMLAttr(configPage.getPath())%>" data-configid="<%=xssAPI.encodeForHTMLAttr(configid)%>" data-clientid="<%=xssAPI.encodeForHTMLAttr(clientid)%>" data-socialprofilepath="<%=xssAPI.encodeForHTMLAttr(twitterProfilePath)%>" data-loginSuffix="<%=xssAttrWrap(xssAPI, loginSuffix)%>" class="slider-button <%=xssAttrWrap(xssAPI, isTwitterConnectedClassName)%>"><%=xssFilterWrap(xssAPI, isTwitterConnected)%></span>
                                </div>
                            </div>
                             <%if(isTWeetConnected){%>
                                <a class="connectnamelink" target="_blank" href="<%=xssAPI.getValidHref(twitterUserURL)%>" >@<%=xssAPI.encodeForHTML(twitterScreenName)%></a>
                                <div class="connectchangelink" onclick="$CQ.Event(event).preventDefault();$CQ.SocialAuth.socialconnect.doChange('<%=xssJSWrap(xssAPI, xssAPI.getValidHref(twitterProfilePath))%>','<%=xssJSWrap(xssAPI, xssAPI.getValidHref(configPage.getPath()))%>','<%=xssAPI.encodeForJSString(configid)%>','<%=xssJSWrap(xssAPI, loginSuffix)%>','<%=xssAPI.encodeForJSString(clientid)%>');"><%= i18n.get("change") %></div>
                            <%}%>
                        </div>
                    </div>
                    <%
                }
                %>
            </div>
        <% } else if(WCMMode.fromRequest(request) == WCMMode.EDIT){%>
            <h3 class="cq-texthint-placeholder"><%= i18n.get("No cloud service is configured on this page for social connect.") %></h3>
        <% } %>
        </div>
  <% } else if(WCMMode.fromRequest(request) == WCMMode.EDIT) {%>
      <h3 class="cq-texthint-placeholder"><%= i18n.get("Social Connect features are only available to logged in users.") %></h3>
  <% } %>

  <%!
    String getClientId(Configuration[] matchingConfigs){
        Configuration providerConfig;
        String clientId ="";
        if(matchingConfigs != null && matchingConfigs.length == 1){
            providerConfig = matchingConfigs[0];
            clientId = (String)providerConfig.getProperties().get("oauth.client.id");
        }
        return clientId;
    }
  %>
