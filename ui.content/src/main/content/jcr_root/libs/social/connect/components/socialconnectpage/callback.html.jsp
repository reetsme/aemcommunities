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
<%@ page session="false" import="com.day.cq.i18n.I18n,org.apache.jackrabbit.api.security.user.Authorizable,
com.adobe.granite.auth.oauth.OAuthManager,
    com.day.cq.wcm.api.WCMMode,
    org.apache.jackrabbit.api.security.user.User" pageEncoding="utf-8" %>

<%@ include file="/libs/foundation/global.jsp" %>

<%
    response.setContentType("text/html");
    response.setCharacterEncoding("UTF-8");
    boolean isDisabled = WCMMode.fromRequest(request).equals(WCMMode.DISABLED);

    String userId = resourceResolver.adaptTo(Authorizable.class).getID().replace("\"", "\\\"").replace("\r","\\r").replace("\n","\\n");
    if (!isDisabled){
        //get userid from token in cookie, and use that to reload the profile
        String configId = (String)currentPage.getProperties().get("oauth.config.id");
        OAuthManager mgr = sling.getService(com.adobe.granite.auth.oauth.OAuthManager.class);
        userId = mgr.getAuthorizedId(request, configId);
    }
    pageContext.setAttribute("userId",userId);

    Boolean sessionError = false;
    String jReason = request.getParameter("j_reason");
    if (jReason != null && jReason.indexOf("Session timed out") != -1 ) {
        sessionError = true;
    }
    pageContext.setAttribute("sessionError", sessionError);
    I18n i18n = new I18n(slingRequest);
%>

<html>

<head>

    <cq:includeClientLib js="cq.personalization,cq.social.connect"/>

    <script type="text/javascript">

    $CQ.SocialAuth.callback = {
            init: function() {
               var userId = "<%= xssAPI.encodeForJSString(userId) %>";
                if (userId != "anonymous" && CQ_Analytics  ) {
                    if(CQ_Analytics.ProfileDataMgr) {
                        //This method can be found in SocialAuth.js
                        //This triggers a global event that any element can subscribe to
                        //for taking care of any custom business after the work here is complete
                        window.opener.$CQ.SocialAuth.oauthCallbackComplete(userId);
                    }
                }
                this.handlerPopup();
            },

    <c:if test="${sessionError == false}">
            handlerPopup: function (event) {
                var userId = "<%= xssAPI.encodeForJSString(userId) %>";
                if (userId != "anonymous" ) {
                    if (window.opener.progressWindow) {
                        window.opener.progressWindow.close();
                    }
                }
                window.close();
            }
    </c:if>

    <c:if test="${sessionError == true}">
        handlerPopup: function (event) {
           window.location = "/e/";
        }
    </c:if>

    }

    $CQ(document).ready(function () {
        $CQ.SocialAuth.callback.init();
    });

    </script>
</head>

<body>
    <%= i18n.get("Processing Request...") %>
</body>

</html>
