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
        import="javax.jcr.query.Query,
                java.util.Iterator"%><%
%><%@ include file="/libs/foundation/global.jsp" %><%
    final String descendantsQuery = "/jcr:root" + currentPage.getPath() + "jcr:content//*";
    final Iterator<Resource> descendants = resourceResolver.findResources(Query.XPATH, descendantsQuery);
    Resource descendant;
    String componentPath = "";
    while (descendants.hasNext()) {
        descendant = descendants.next();
        if (resourceResolver.isResourceType(descendant, "/libs/social/commons/components/comments") ||
                resourceResolver.isResourceType(descendant, "/libs/social/forum/components/forum") ||
                resourceResolver.isResourceType(descendant, "/libs/social/tally/components/tally") ) {
            componentPath = descendant.getPath();
            break;
        }
    }
    final Boolean foundComponent = resourceResolver.getResource(componentPath) != null;
    if (foundComponent) {%>
    <form class="data-editor" data-editor-content="<%=componentPath%>">
        <textarea id="dataeditor" class="editor-data" style="height:100%; width:600px"></textarea>
        <button class="apply">Apply</button>
    </form>
<%} else {
        %><div class="alert alert-error">Could not find a Social Component on the page.</div><%
  }
%><cq:includeClientLib categories="cq.social.author.dataeditor" />
