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
<%@ page session="false" import="javax.jcr.Session,
                 java.util.Iterator,
                 org.apache.jackrabbit.api.JackrabbitSession,
                 org.apache.jackrabbit.api.security.user.UserManager,
                 org.apache.jackrabbit.api.security.user.Authorizable,
                 org.apache.jackrabbit.commons.jackrabbit.user.AuthorizableQueryManager,
                 org.apache.sling.jcr.api.SlingRepository,
                 com.day.cq.commons.TidyJSONWriter" %>

<%@include file="/libs/foundation/global.jsp" %>

<%
    SlingRepository repos = sling.getService(SlingRepository.class);
    Session session = slingRequest.getResourceResolver().adaptTo(Session.class);
    UserManager um = ((JackrabbitSession) session).getUserManager();
    AuthorizableQueryManager queryManager = new AuthorizableQueryManager(um, session.getValueFactory());
    final String query = "{\"selector\":\"group\", \"order\": { \"property\":  \"@rep:principalName\"}}";
    Iterator<? extends Authorizable> authorizables = queryManager.execute(query);

    TidyJSONWriter w = new TidyJSONWriter(response.getWriter());
    w.setTidy(true);

    w.array();

    while (authorizables.hasNext()) {
        Authorizable groupy = authorizables.next();
        w.object();
        w.key("value").value(groupy.getID());
        w.key("text").value(groupy.getID());
        w.key("qtip").value(groupy.getID());
        w.endObject();
    }

    w.endArray();

    response.setContentType("application/json");
    response.setCharacterEncoding("utf-8");
    response.setStatus(HttpServletResponse.SC_OK);
    response.setIntHeader("status", HttpServletResponse.SC_OK);
%>
