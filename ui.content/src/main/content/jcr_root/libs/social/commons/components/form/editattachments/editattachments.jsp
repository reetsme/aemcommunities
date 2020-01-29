<%--

 ADOBE CONFIDENTIAL
 __________________

  Copyright 2011 Adobe Systems Incorporated
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

  Form 'element' component

  Draws the basic input fields for an event form

--%><%@include file="/libs/foundation/global.jsp"%><%
%><%@ page session="false" import="org.apache.jackrabbit.util.Text,
                   java.util.HashMap,
                   java.util.Calendar,
                   java.util.Locale,
                   java.util.TimeZone,
                   java.util.ResourceBundle,
                   java.text.DateFormat,
                   org.apache.sling.api.resource.Resource,
                   org.apache.sling.api.resource.ResourceResolver,
                   org.apache.sling.api.resource.ValueMap,
                   org.apache.sling.api.wrappers.ValueMapDecorator,
                   com.day.cq.commons.jcr.JcrConstants,
                   com.day.cq.commons.jcr.JcrUtil,
                   com.day.cq.wcm.api.WCMMode,
                   com.day.cq.wcm.foundation.forms.FieldDescription,
                   com.day.cq.wcm.foundation.forms.FieldHelper,
                   com.day.cq.wcm.foundation.forms.FormsHelper,
                   com.day.cq.wcm.foundation.forms.FormsConstants,
                   com.day.cq.wcm.foundation.forms.LayoutHelper,
                   com.day.cq.wcm.foundation.forms.ValidationInfo,
                   com.day.cq.i18n.I18n,
                   com.adobe.cq.social.commons.Comment,
                   com.adobe.cq.social.commons.CollabUtil,
                   java.util.Iterator,
                   java.util.Map,
                   java.util.List,
                   com.day.cq.wcm.foundation.Placeholder" %><%
%><%@include file="/libs/social/commons/commons.jsp"%>
<cq:includeClientLib categories="cq.social.edit_comments"/><%
    List<Resource> editRes = FormsHelper.getFormEditResources(slingRequest);
    ValueMap values = FormsHelper.getGlobalFormValues(slingRequest);

    final Session session = slingRequest.getResourceResolver().adaptTo(Session.class);
    if (values == null) {
        values = new ValueMapDecorator(new HashMap<String, Object>());
    }

    final String resourceType = properties.get("resourceType", String.class);
    String ugcPath = CollabUtil.resourceToUGCPath(resource);
    if (editRes != null && !editRes.isEmpty()) {
      ugcPath = editRes.get(0).getPath();
    }
    if (ugcPath.length() > 0 && ugcPath.charAt(ugcPath.length()-1)=='/') {
      ugcPath = ugcPath.substring(0, ugcPath.length()-1);
    }

    Resource ugcCalResource = resourceResolver.getResource(ugcPath);
    Comment comment;
    Node node;
    String path;
    //HashMap<String, Resource> attachments;
    Iterator attachmentsIterator = null;
    if (ugcCalResource != null) {
        comment = ugcCalResource.adaptTo(Comment.class);
        if (comment != null) {
          path = comment.getPath();
          attachmentsIterator = comment.getAttachmentMap().entrySet().iterator();
        }
    }

    if (attachmentsIterator != null) {
      while(attachmentsIterator.hasNext()) {
          Map.Entry<String, Resource> entry = (Map.Entry<String, Resource>)attachmentsIterator.next();
          Node att = entry.getValue().adaptTo(Node.class);
          String divID = "comment-attachment" + CollabUtil.generateRandomString(6);
          String attachmentPath = "/etc/clientlibs/foundation/comments/images/documenticon.png";
          if (att.getNode("jcr:content").getProperty("jcr:mimeType").getValue().getString().contains("image")) {
              attachmentPath = slingRequest.getContextPath() + att.getPath()  + ".thumb.100.140.png";
          } %>
          <div id='<%=xssAttrWrap(xssAPI, divID)%>' class='comment-attachment'>
              <img src='<%=xssAttrWrap(xssAPI, attachmentPath)%>'/>
              <label><%=xssFilterWrap(xssAPI, entry.getKey())%></label><br/>
              <a href='<%=xssAttrWrap(xssAPI, slingRequest.getContextPath() + att.getPath())%>' id="<%=xssAttrWrap(xssAPI, divID)%>-download"><%=i18n.get("download")%></a>
              <a href="#" id="<%=xssAttrWrap(xssAPI, divID)%>-delete" onclick="CQ.soco.commons.comments.editAttachments.deleteAttachments('#<%=xssJSWrap(xssAPI, divID)%>', '<%=Comment.PROP_DELETE_ATTACHMENTS%>', '<%=xssJSWrap(xssAPI, slingRequest.getContextPath() + att.getPath())%>')"><%=i18n.get("delete")%></a>
              <a href="#" id="<%=xssAttrWrap(xssAPI, divID)%>-cancel" onclick="CQ.soco.commons.comments.editAttachments.deleteAttachments('#<%=xssJSWrap(xssAPI, divID)%>')" style='display: none'><%=i18n.get("cancel")%></a>
        </div> <%
        }
    } else { %>
        <%= Placeholder.getDefaultPlaceholder(slingRequest, i18n.get("No attachments found."), "", "cq-attachments-placeholder") %>
    <% }

%>
