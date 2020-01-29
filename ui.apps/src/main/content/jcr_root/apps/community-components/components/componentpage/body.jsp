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
%><%@page session="false"%><%
%><%@ include file="/libs/foundation/global.jsp" %><%
%><body class="scf-guide <%=currentPage.getName()%>"><sling:include path="./header"/>
<div class="cg container-fluid" style="margin-top: 50px">
  <div class="row">
        <div class="col-md-2">
            <sling:include path="./navigation" resourceType="/apps/community-components/components/navigation"/>
        </div>
        <div class="col-md-10">
          <sling:include path="./content"/>
            <%if (properties.get("scg:showIde", false)) {%>
            <sling:include path="./ide"/>
            <%}%>
        </div>
  </div>
</div>
<cq:include path="clientcontext" resourceType="cq/personalization/components/clientcontext"/>
</body>
