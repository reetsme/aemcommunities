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
%><%@include file="/libs/foundation/global.jsp"%><%
%><%@taglib prefix="personalization" uri="http://www.day.com/taglibs/cq/personalization/1.0" %><%
%><%@page session="false"
      import="javax.jcr.Session,
          org.apache.sling.api.resource.ResourceResolver,
        com.day.cq.wcm.api.WCMMode,
        com.day.cq.personalization.UserPropertiesUtil"%><%
  final Page rootGuidePage = currentPage.getAbsoluteParent(2);
  Session session = resourceResolver.adaptTo(Session.class);
  boolean isImpersonated = (session != null && session.getAttribute(ResourceResolver.USER_IMPERSONATOR) != null);
  boolean isAuthor = (WCMMode.fromRequest(request) != WCMMode.DISABLED);
%><script>(function(cg) { "use strict"; cg.isAuthor = <%=isAuthor%>;})(window.ComponentGuide);</script>
<div class="navbar navbar-fixed-top navbar-inverse" role="navigation">
  <div class="navbar-header">
      <a class="navbar-brand" href="#">Community Components</a>
  </div>
  <ul class="nav navbar-nav">
      <li class="active"><a href="<%=rootGuidePage.getPath()%>.html">Home</a></li>
        <li><a href="http://www.adobe.com/go/aem6_4_docs_comp_guide_en">Docs</a></li>
  </ul>
  <ul class="nav navbar-nav navbar-right login-ui">
        <%if(isAuthor) {%>
      <li class="navbar-form logout <%=isImpersonated?"":"hidden"%>"><div class="form-group"><button class="logout btn" type="submit">Revert</button></div></li>
        <form class="btn-group navbar-form login dropdown <%=isImpersonated?"hidden":""%>">
          <div class="form-group">
              <input type="text" class="search-query" placeholder="Search">
              <a class="dropdown-toggle" data-toggle="dropdown" href="#"></a>
              <ul class="dropdown-menu">
        </ul>
              <button class="btn login" type="submit">Impersonate</button>
            </div>
        </form>
        <%} else {%>
        <li><a class="logout hidden" href="#">Logout</a></li>
        <li class="dropdown"><a class="btn dropdown-toggle login" data-toggle="dropdown" href="#">Login<span class="caret"></span></a>
        <div class="dropdown-menu" role="menu">
          <form>
            <label for="j_username">Username:</label>
            <input name="j_username"></input>
            <label for="j_password">Password:</label>
            <input name="j_password" type="password" autocomplete="off"></input>
            <input name="j_validate" value="true" class="hidden"/>
            <button type="submit" class="btn">Submit</button>
          </form>
    </div>
      </li>
        <%}%>
  </ul>
</div>
