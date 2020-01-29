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

  ==============================================================================
--%>
<%@page session="false"
            contentType="text/html; charset=utf-8"
            import="com.day.cq.commons.Doctype,
                    javax.jcr.Session,
                    com.adobe.cq.social.site.api.CommunitySiteService,
                    com.adobe.granite.i18n.LocaleUtil,
                    javax.servlet.http.HttpServletResponse,
                    com.day.cq.wcm.api.WCMMode,
                    com.day.cq.wcm.foundation.ELEvaluator" %><%
%><%@taglib prefix="cq" uri="http://www.day.com/taglibs/cq/1.0" %><%
%><cq:defineObjects/><%

    final Session session = slingRequest.getResourceResolver().adaptTo(Session.class);
    final CommunitySiteService  siteService = sling.getService(CommunitySiteService.class);
    // read the redirect target from the 'page properties' and perform the
    // redirect if WCM is disabled.
    String location = siteService != null?
        siteService.getRedirectTarget(slingRequest, session) : "";

    if (String.valueOf(HttpServletResponse.SC_FORBIDDEN).equals(location) ) {
        response.sendError(HttpServletResponse.SC_FORBIDDEN);
        return;
    }

    // -- from here to the end is copied from page.jsp 
    // resolve variables in path
    location = ELEvaluator.evaluate(location, slingRequest, pageContext);
    boolean wcmModeIsDisabled = WCMMode.fromRequest(request) == WCMMode.DISABLED;
    boolean wcmModeIsPreview = WCMMode.fromRequest(request) == WCMMode.PREVIEW;
    if ( (location.length() > 0) && ((wcmModeIsDisabled) || (wcmModeIsPreview)) ) {
        // check for recursion
        if (currentPage != null && !location.equals(currentPage.getPath()) && location.length() > 0) {
            // check for absolute path
            final int protocolIndex = location.indexOf(":/");
            final int queryIndex = location.indexOf('?');
            final String redirectPath;
            if ( protocolIndex > -1 && (queryIndex == -1 || queryIndex > protocolIndex) ) {
                redirectPath = location;
            } else {
                redirectPath = slingRequest.getResourceResolver().map(request, location) + ".html";
            }
            response.sendRedirect(redirectPath);
        } else {
            response.sendError(HttpServletResponse.SC_NOT_FOUND);
        }
        return;
    }
    // set doctype
    if (currentDesign != null) {
        currentDesign.getDoctype(currentStyle).toRequest(request);
    }

%><%= Doctype.fromRequest(request).getDeclaration() %>
<html lang="<%= xssAPI.encodeForHTMLAttr(LocaleUtil.toRFC4646(currentPage.getLanguage(false))) %>"  <%= wcmModeIsPreview ? "class=\"preview\"" : ""%>>
<cq:include script="head.jsp"/>
<cq:include script="body.jsp"/>
</html>
