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

--%><%@page session="false"
            import="com.day.cq.i18n.I18n,
                    java.util.ResourceBundle,
                    java.util.Locale,
                    javax.jcr.Node,
                    javax.jcr.PathNotFoundException,
                    com.adobe.granite.xss.XSSAPI,
                    com.adobe.granite.ui.components.ComponentHelper,
                    org.apache.sling.api.SlingHttpServletRequest,
                    org.apache.sling.api.resource.Resource,    
                    org.apache.sling.api.resource.ResourceResolver,
                    com.adobe.cq.social.enablement.user.api.EnablementUser,
                    org.apache.commons.lang3.StringUtils" %><%
%><%@taglib prefix="sling" uri="http://sling.apache.org/taglibs/sling/1.0" %><%
%><%@taglib prefix="cq" uri="http://www.day.com/taglibs/cq/1.0" %><%
%><%@taglib prefix="ui" uri="http://www.adobe.com/taglibs/granite/ui/1.0"%><%
%><cq:defineObjects /><%
%><%@include file="/libs/foundation/global.jsp" %><%

EnablementUser user = slingRequest.adaptTo(EnablementUser.class);

final ComponentHelper cmp = new ComponentHelper(pageContext);
final Locale locale = currentPage.getLanguage(true);

final ResourceBundle resourceBundle = slingRequest.getResourceBundle(locale);
final String tempFolderPath = "/tmp/social-enablement";
final I18n i18n = new I18n(resourceBundle);

String resourceTitle = "";

%><%
%>
<%!
String outVar(XSSAPI xssAPI, I18n i18n, String text) {
    return xssAPI.encodeForHTML(i18n.getVar(text));
}

String outAttrVar(XSSAPI xssAPI, I18n i18n, String text) {
    return xssAPI.encodeForHTMLAttr(i18n.getVar(text));
}
%>
