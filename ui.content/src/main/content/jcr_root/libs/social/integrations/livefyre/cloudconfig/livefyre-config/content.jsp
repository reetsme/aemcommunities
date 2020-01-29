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

--%>
<%@page session="false" contentType="text/html" pageEncoding="utf-8"
        import="com.day.cq.i18n.I18n,
                org.apache.sling.api.resource.ValueMap,
                org.apache.sling.api.resource.Resource,
                com.adobe.social.integrations.livefyre.config.api.LivefyreConfigProvider" %>

<%@include file="/libs/foundation/global.jsp"%><%
%><%@include file="/libs/social/security/social-security.jsp" %><%
  final I18n i18n = new I18n(slingRequest);
%><cq:includeClientLib css="cq.social.livefyre.cloudconfig"/>
<div class="when-config-successful" style="display: none">
<h1><%=i18n.get("Livefyre Configuration")%></h1>
  <form>
    <p><label><%=i18n.get("Network Domain: ")%></label><input type="text" value="<%=properties.get(LivefyreConfigProvider.PROPERTY_NETWORK_DOMAIN)%>" disabled/></p>
    <p><label><%=i18n.get("Network Key: ")%></label><input type="text" value="**********************" disabled/></p>
    <p><label><%=i18n.get("Site ID: ")%></label><input type="text" value="<%=properties.get(LivefyreConfigProvider.PROPERTY_SITE_ID)%>" disabled/></p>
    <p><label><%=i18n.get("Site Key: ")%></label><input type="text" value="**********************" disabled/></p>
  </form>
</div>
