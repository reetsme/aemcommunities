<%--

 ADOBE CONFIDENTIAL
 __________________

  Copyright 2013 Adobe Systems Incorporated
  All Rights Reserved.

 NOTICE:  All information contained herein is, and remains
 the property of Adobe Systems Incorporated and its suppliers,
 if any.  The intellectual and technical concepts contained
 herein are proprietary to Adobe Systems Incorporated and its
 suppliers and are protected by trade secret or copyright law.
 Dissemination of this information or reproduction of this material
 is strictly forbidden unless prior written permission is obtained
 from Adobe Systems Incorporated.

--%><%
%><%@page session="false"
        import="java.util.Arrays,
        java.util.List,
        org.apache.commons.io.IOUtils,
        org.apache.commons.lang3.StringUtils,
        java.io.InputStream,
        java.util.Collections,
        java.util.ArrayList"%><%
%><%@ include file="/libs/foundation/global.jsp" %><%
    final String propertyName = "scg:targets";
    final String cssPropertyName = "scg:cssclass";

    List<String> targets = Arrays.asList(properties.get(propertyName, new String[0]));
    String cssName = component.getProperties().get(cssPropertyName, "");
    List<String> notAuthorizedTemplates = new ArrayList<String>();
    Resource templateResource;
    if (targets.size() == 0) {
        targets = new ArrayList<String>();
        final String suffix = slingRequest.getRequestPathInfo().getSuffix();
        if(!StringUtils.isEmpty(suffix)) {
            targets.add(suffix);
        }
    }
    if ( targets.size() > 0) {
    %><ul><%
        for (String templatePath : targets) {
            templateResource = resourceResolver.getResource(templatePath);
            if (templateResource == null ) {
              notAuthorizedTemplates.add(templatePath);
                continue;
            }
            InputStream templateInputStream = templateResource.adaptTo(InputStream.class);
            String templateString = xssAPI.encodeForHTML(IOUtils.toString(templateInputStream));
            %><h3>Source file: <%=xssAPI.encodeForHTML(templatePath)%></h3>
            <form class="<%=xssAPI.encodeForHTMLAttr(cssName)%>">
                <textarea id="<%=xssAPI.encodeForHTMLAttr(templatePath)%>" class="editor-templatetext" style="height:200px; width:100%"><%=templateString%></textarea>
                <sling:include path="." replaceSelectors="toolbar"/>
            </form>
            <%}
    %></ul><%
    if (!notAuthorizedTemplates.isEmpty()) {
        %><div class="alert alert-info">You are not allowed to view some of the content for this editor.</div><%
      }
    } else {
        %><div class="alert alert-error">Please select some content to edit.</div><%
    }
%>
