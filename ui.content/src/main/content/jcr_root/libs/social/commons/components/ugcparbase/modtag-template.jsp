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

--%><%@include file="/libs/social/commons/commons.jsp"%><%
%><%@ page session="false" import="com.adobe.cq.social.commons.Comment" %>
<%
    Comment post = resource.adaptTo(Comment.class);

    if (null != post) {
        if (wcmMode == WCMMode.EDIT) {
            if (post.isSpam()) {
                %><div class="system spam"><%=i18n.get("This post was classified as spam.")%></div><%
            }
            if (post.getCommentSystem().isModerated() && !post.isApproved()) {
                %><div class="system moderate"><%=i18n.get("This post needs to be moderated.")%></div><%
            }
        }
    }
%>
