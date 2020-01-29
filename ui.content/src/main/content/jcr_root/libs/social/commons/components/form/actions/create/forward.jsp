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

  Form 'action' component

  Return the action path for the new comment form handling

--%><%@page session="false" %><%
%><%@include file="/libs/foundation/global.jsp" %>
<%@page import="com.day.cq.wcm.foundation.forms.FormsHelper,
                com.day.cq.wcm.foundation.forms.FormsConstants,
                java.util.ResourceBundle,
                org.apache.sling.api.resource.ResourceUtil,
                org.apache.sling.api.resource.ValueMap,
                org.apache.commons.lang.StringUtils,
                java.util.Iterator,
                javax.jcr.query.Query,
                org.apache.sling.api.resource.Resource,
                com.day.cq.commons.jcr.JcrConstants"%><%
%>
<%@taglib prefix="sling" uri="http://sling.apache.org/taglibs/sling/1.0" %><%
%><%@taglib prefix="cq" uri="http://www.day.com/taglibs/cq/1.0" %><%
%><cq:defineObjects/><sling:defineObjects/><%

    final ValueMap props = ResourceUtil.getValueMap(resource);
    final String PAGE_SUFFIX = ".html";
    String type= props.get("contentType", "");
    String renderWith= props.get("renderOption", "");
    String createSelector= props.get("endpoint", "");
    String parentResourceType = props.get("parentResourceType", "");
    String redirectUrl = props.get("redirect", "");
    if(StringUtils.isNotBlank(redirectUrl) && !StringUtils.endsWith(redirectUrl, PAGE_SUFFIX)){
        redirectUrl = redirectUrl + PAGE_SUFFIX;
    }

    if(StringUtils.equals(type, "other")){
        //store user generated content
%><cq:include script="/libs/foundation/components/form/actions/store/forward.jsp"/><%

        String url="";
        String payloadpath = (String) request.getAttribute(FormsConstants.REQUEST_ATTR_WORKFLOW_PAYLOAD_PATH);
        if(StringUtils.equals(renderWith, "component")){
            //set selector and redirect url
            String selector = props.get("selector", "");
            url = payloadpath + "." + selector + PAGE_SUFFIX;


        }else if(StringUtils.equals(renderWith, "form")){
            String formurl= props.get("formurl", "");
            url = payloadpath +".form.html"+formurl;
        }else{
            url = redirectUrl;
        }

        FormsHelper.setForwardRedirect(slingRequest, url);
    }

    //create content for Forum, Q&A, Idea
    else{

        String title = request.getParameter(JcrConstants.JCR_TITLE);
        String actionPath = props.get(FormsConstants.START_PROPERTY_ACTION_PATH, "");
        if(actionPath.charAt(actionPath.length()-1) == '/')    {
            actionPath = actionPath.substring(0, actionPath.length()-1);
        }
        String path = "";
        if(StringUtils.isNotBlank(actionPath) && StringUtils.isNotBlank(parentResourceType)) {
            //search for forum under actionPath
            final String queryString = "/jcr:root" + actionPath + "//element(*)[@sling:resourceType=\""+ parentResourceType +"\"]";
            Iterator<Resource> children = currentPage.getParent().getContentResource().getResourceResolver().findResources(queryString, "xpath");
            Resource child = null;
            while(children.hasNext()){
                child = children.next();
                break;
            }
            path=(null != child)?child.getPath():actionPath;
        } else   {
            path = actionPath;
        }

        if(StringUtils.equals(renderWith, "component")){
            //set selector and redirect url
            String selector = props.get("selector", "");
            request.setAttribute("selector",selector);
            //if path contains a selector, replace it
            int m = StringUtils.indexOf(path, PAGE_SUFFIX);
            String sub = StringUtils.substring(path, 0, m);
            int n = StringUtils.lastIndexOf(sub, ".");
            if(n>StringUtils.lastIndexOf(sub, "/")){
                redirectUrl = StringUtils.substring(path, 0, n)+"."+selector+StringUtils.substring(path, m);
            }else{
                redirectUrl = path.replace(PAGE_SUFFIX, "." + selector + PAGE_SUFFIX);
            }

        }else if(StringUtils.equals(renderWith, "form")){
            String formurl= props.get("formurl", "");
            request.setAttribute("formurl",formurl);
        }

        if(StringUtils.isNotBlank(redirectUrl) && !PAGE_SUFFIX.equals(redirectUrl)){
            FormsHelper.setForwardRedirect(slingRequest, redirectUrl );
        }
        FormsHelper.setForwardPath(slingRequest, path + "." + createSelector + PAGE_SUFFIX);
        FormsHelper.setRedirectToReferrer(request, true);
        }
%>
