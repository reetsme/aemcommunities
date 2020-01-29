<%--

 ADOBE CONFIDENTIAL
 __________________

  Copyright 2016 Adobe Systems Incorporated
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
%><%@include file="/libs/granite/ui/global.jsp" %><%
%><%@page session="false"
          import="com.adobe.granite.ui.components.rendercondition.RenderCondition,
                  com.adobe.granite.ui.components.rendercondition.SimpleRenderCondition,
                  javax.jcr.Node,
                  org.apache.sling.api.resource.ValueMap" %><%
    boolean render = false;
    String suffix = slingRequest.getRequestPathInfo().getSuffix();
    Resource resrc = resourceResolver.getResource(suffix+"/jcr:content");
    if(resrc!=null){
       ValueMap suffixVM = resrc.getValueMap();
       Boolean isCommunityGroup = (Boolean)suffixVM.get("cq:isCommunityGroup");
       if(isCommunityGroup!=null && isCommunityGroup == true){
          render = true;
        }
     }
    request.setAttribute(RenderCondition.class.getName(), new SimpleRenderCondition(render));
%>
