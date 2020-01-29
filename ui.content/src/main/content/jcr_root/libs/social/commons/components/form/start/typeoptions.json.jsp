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

        Resource options = resourceResolver.getResource("social/commons/content/form/typeOptions");
        Iterator<Resource> types= resourceResolver.listChildren(options);

        TidyJSONWriter w = new TidyJSONWriter(response.getWriter());
        w.setTidy(true);

        w.array();

        while(types.hasNext()){
            Node type = types.next().adaptTo(Node.class);
            w.object();

            w.key("value").value(type.getProperty("value").getString());
            w.key("text").value(type.getProperty("text").getString());
            w.key("endpoint").value(type.getProperty("endpoint").getString());
            w.key("editEndpoint").value(type.getProperty("editEndpoint").getString());
            w.key("deleteEndpoint").value(type.getProperty("deleteEndpoint").getString());
            w.key("parentResourceType").value(type.getProperty("parentResourceType").getString());
            w.endObject();
        }

        w.endArray();

        response.setContentType("application/json");
        response.setCharacterEncoding("utf-8");
        response.setStatus(HttpServletResponse.SC_OK);
        response.setIntHeader("status",HttpServletResponse.SC_OK);
%>
