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
<%@page session="false" contentType="text/html; charset=utf-8"
        import="org.apache.sling.api.resource.ValueMap,
                org.apache.sling.api.resource.Resource,
                com.day.cq.i18n.I18n,
                com.adobe.granite.auth.oauth.ProviderConfigProperties"%>
<%@ include file="/libs/foundation/global.jsp" %><%
%><%@include file="/libs/social/security/social-security.jsp" %>
<%
    //TODO: this page should be served from the application hosting the connect components!

    String providerId = null;
    if(currentNode.hasProperty("oauth.config.id")){

        final String configId = currentNode.getProperty("oauth.config.id").getString();

        if(configId != null && configId.length() > 0){

            final String configResourceName = ProviderConfigProperties.FACTORY_PID+"-"+currentPage.getName()+".config";
            final Resource configResource = resource.getChild(configResourceName);
            if(configResource != null){
                ValueMap props = configResource.adaptTo(ValueMap.class);
                providerId = (String)props.get("oauth.config.provider.id");
            }
        }
    }

    //set the default image
    String errorimageUrl = "/etc.clientlibs/clientlibs/social/connect/themes/default/resources/disconnect.png";
    //if we have an image for this provider, use it
    final Session session = slingRequest.getResourceResolver().adaptTo(Session.class);
    final String providerErrorImagePath = "/etc.clientlibs/clientlibs/social/connect/themes/default/resources/disconnect-"+providerId+".png";
    if (session.nodeExists(providerErrorImagePath)){
        errorimageUrl = providerErrorImagePath;
    }

    I18n i18n = new I18n(slingRequest);
    String providerName = "OAuth Provider"; //replace with the value interpreted from the config
    if ("soco-facebook".equals(providerId)){
        providerName = "Facebook";
    } else if ("soco-twitter".equals(providerId)){
        providerName = "Twitter";
    }
    final String errorMsg = i18n.get("This {0} account is already in use.", null, providerName);
    final String errorDetails = i18n.get("If this is your {0} account, sign in using the &quot;Sign in with {0}&quot;, option and <strong>disconnect</strong> the {0} account from the &quot;My Profile&quot; page. Then sign in again using the other account, and <strong>connect</strong> to {0} from the &quot;My Profile&quot; page.", null, providerName);

%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<title><%= i18n.get("Connect Error") %></title>

<body class="errorbody">
<div>
    <div class="error">
        <div class="errormsg">
            <img src="/etc.clientlibs/clientlibs/social/connect/themes/default/resources/warning_icon.png"/>
            <span class="msg"><%=xssFilterWrap(xssAPI, errorMsg)%></span>
        </div>

        <div class="errordetails">
            <%=xssFilterWrap(xssAPI, errorDetails)%>
        </div>
    </div>
    <div class="errorimage">
        <img src="<%=xssAttrWrap(xssAPI, errorimageUrl)%>"/>
    </div>
</div>
<div class="footer">
    <button class="closebtn" onclick="window.close();"><%= i18n.get("Close") %></button>
</div>
</body>

</html>
