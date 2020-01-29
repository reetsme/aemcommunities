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
  Social Login Component - uses cloud service configs as 'providers'.
--%>

<%@include file="/libs/foundation/global.jsp" %><%
%><%@include file="/libs/social/security/social-security.jsp" %>
<%@page session="false" contentType="text/html; charset=utf-8" import="com.day.cq.i18n.I18n,
                                                         com.day.cq.personalization.ProfileUtil,
                                                         com.adobe.granite.security.user.UserManagementService,
                                                         com.day.cq.wcm.api.WCMMode,
                                                         com.day.cq.wcm.webservicesupport.ConfigurationManager,
                                                         com.day.cq.wcm.webservicesupport.Configuration,
                                                         org.apache.sling.commons.json.JSONObject,
                                                         org.apache.jackrabbit.api.security.user.Authorizable,
                                                         org.apache.sling.api.resource.Resource"%>

<cq:includeClientLib categories="cq.social.connect"/>

<%

    // getting the username of the logged-in user
    Authorizable au = resourceResolver.adaptTo(Authorizable.class);
    final String userId = au.getID().replace("\"", "\\\"").replace("\r","\\r").replace("\n","\\n");
    pageContext.setAttribute("userId",userId);

    ConfigurationManager cfgMgr = resourceResolver.adaptTo(ConfigurationManager.class);
    Configuration facebookConfiguration = null;
    Configuration twitterConfiguration = null;

    String[] services = pageProperties.getInherited("cq:cloudserviceconfigs", new String[]{});
    if(cfgMgr != null) {
        facebookConfiguration = cfgMgr.getConfiguration("facebookconnect", services);
        twitterConfiguration = cfgMgr.getConfiguration("twitterconnect", services);
    }

    I18n i18n = new I18n(slingRequest);
    final String uniqSuffix = resource.getPath().replaceAll("/","-").replaceAll(":","-");
    final String divID = "sociallogin" + uniqSuffix;

    final UserManagementService ums = sling.getService(UserManagementService.class);
    final boolean isAnonymous = ums.getAnonymousId().equals(slingRequest.getResourceResolver().getUserID());
    final boolean isDisabled = WCMMode.DISABLED.equals(WCMMode.fromRequest(request));
    final String loginSuffix = isDisabled && isAnonymous ? "/j_security_check" : "/connect";
    final String redirectTo = properties.get("redirectTo", "");
    final String contextPath = slingRequest.getContextPath();
    //transfer style properties to dialog config
    final JSONObject dialogConfig = new JSONObject();
    String dialogWidth = currentStyle.get("dialogWidth",String.class);
    String dialogHeight = currentStyle.get("dialogHeight",String.class);
    dialogConfig.putOpt("width", dialogWidth);
    dialogConfig.putOpt("height", dialogHeight);
%>

<script type="text/javascript">

    $CQ(document).ready(function () {
        //listening for this global event - triggered from SocialAuth.js - $CQ.SocialAuth.oauthCallbackComplete
        //any element can subscribe to this event to perform custom functionality post-oauth-callback completion
        //the social login component will listen for it here to perform the appropriate redirect as configured
        $CQ(document).bind('oauthCallbackComplete', function(ev,userId) {
            //oauthCallbackComplete happened
            CQ_Analytics.ProfileDataMgr.loadProfile(userId);
            <% if(redirectTo != null && redirectTo.length() > 0){ %>
                CQ.shared.Util.reload(null,'<%=xssJSWrap(xssAPI, redirectTo)%>');
            <% }else{ %>
                CQ.shared.Util.reload();
            <% } %>
        });

        $CQ('.sociallogin-signin-<%=xssJSWrap(xssAPI, divID)%>').on('click', function(ev){
            ev.preventDefault();
            var config = <%=dialogConfig.toString()%>;
            $CQ.SocialAuth.sociallogin.showDialog('<%=xssJSWrap(xssAPI, divID)%>', config);
        });
    });

</script>

<%
    if (isDisabled) {
        //only in publish mode, display 'Sign in' if anonymous
        if (isAnonymous) { %>
            <a href="#" class="sociallogin-signin-<%=xssAttrWrap(xssAPI, divID)%>">
                <%= i18n.get("Sign In") %>
            </a>
        <%}%>
    <% }else{
        //otherwise, in author mode let the css class names work it out
    %>
        <a class="cq-cc-profile-anonymous sociallogin-signin-<%=xssAttrWrap(xssAPI, divID)%>" href="#">
            <%= i18n.get("Sign In") %>
        </a>

    <% } %>

<div id="<%=xssAttrWrap(xssAPI, divID)%>" class="social-login-popup">
    <%
    if(facebookConfiguration != null || twitterConfiguration != null){
    %>
    <div class="socialloginbuttonscontainer">
        <div class="socialloginbuttons">
            <%
            if(facebookConfiguration != null){
                Resource configResource = facebookConfiguration.getResource();
                Page configPage = configResource.adaptTo(Page.class);
                final String configid = configPage.getProperties().get("oauth.config.id",String.class);
                %>
                    <button class="socialconnectbutton facebookconnectbutton" href="#" tabindex="9993" onclick="$CQ.SocialAuth.sociallogin.doOauth('<%=xssJSWrap(xssAPI, divID)%>','<%=xssJSWrap(xssAPI, configPage.getPath())%>','<%=xssJSWrap(xssAPI, configid)%>','<%=xssJSWrap(xssAPI, loginSuffix)%>','<%=xssJSWrap(xssAPI, contextPath)%>');return false;">
                    </button>
                <%
            }
            if(twitterConfiguration != null){
                Resource configResource = twitterConfiguration.getResource();
                Page configPage = configResource.adaptTo(Page.class);
                final String configid = configPage.getProperties().get("oauth.config.id",String.class);
                %>
                    <button class="socialconnectbutton twitterconnectbutton" href="#" tabindex="9994" onclick="$CQ.SocialAuth.sociallogin.doOauth('<%=xssJSWrap(xssAPI, divID)%>','<%=xssJSWrap(xssAPI, configPage.getPath())%>','<%=xssJSWrap(xssAPI, configid)%>','<%=xssJSWrap(xssAPI, loginSuffix)%>','<%=xssJSWrap(xssAPI, contextPath)%>');return false;">
                    </button>
                <%
            }
            %>
        </div>
    </div>
    <% } %>
    <div class="cqlogin">
        <cq:include script="cqlogin.jsp"/>
    </div>
</div>
