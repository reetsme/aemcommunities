<%--

 ADOBE CONFIDENTIAL
 __________________

  Copyright 2014 Adobe Systems Incorporated
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
%><%@page session="false" contentType="text/html; charset=utf-8"%><%
%><%@page import="java.util.Collection,
                  java.util.Iterator,
                  java.util.List,
                  java.util.ArrayList,
                  java.util.HashMap,
                  org.apache.sling.api.resource.Resource,
                  org.apache.sling.api.resource.ResourceMetadata,
                  org.apache.sling.api.resource.ResourceUtil,
                  org.apache.sling.api.resource.ResourceResolver,
                  org.apache.sling.api.resource.ValueMap,
                  org.apache.sling.api.wrappers.ValueMapDecorator,
                  com.adobe.granite.ui.components.ds.AbstractDataSource,
                  com.adobe.granite.ui.components.ds.DataSource,
                  com.adobe.granite.ui.components.ds.EmptyDataSource,
                  org.apache.commons.collections.iterators.TransformIterator,
                  org.apache.commons.collections.Transformer,
                  org.apache.sling.api.resource.ResourceWrapper,
                  com.adobe.granite.ui.components.Config,
                  com.adobe.granite.ui.components.ExpressionResolver,
                  com.adobe.granite.ui.components.ds.SimpleDataSource,
                  com.adobe.granite.ui.components.ds.ValueMapResource,
                  com.adobe.granite.ui.components.ExpressionHelper,
                  com.day.cq.wcm.api.Page,
                  com.day.cq.wcm.api.Template,
                  com.day.cq.wcm.api.PageManager"%><%

%><%@taglib prefix="sling" uri="http://sling.apache.org/taglibs/sling/1.0"%><%
%><%@taglib prefix="cq" uri="http://www.day.com/taglibs/cq/1.0"%><%
%><%@taglib prefix="ui" uri="http://www.adobe.com/taglibs/granite/ui/1.0"%><%
%><%@include file="/libs/foundation/global.jsp"%><%
%><cq:defineObjects /><%
    final ResourceResolver resolver = resourceResolver;
    ExpressionHelper ex = new ExpressionHelper(sling.getService(ExpressionResolver.class), pageContext);
    Config cfg = new Config(resource.getChild(Config.DATASOURCE));
    final String itemRT = cfg.get("itemResourceType", String.class);

    String contentPath = ex.getString(cfg.get("path", String.class));
    if (contentPath == null) {
        contentPath = "/content/communities/templates/functions";
    }
    Resource contentPage = slingRequest.getResourceResolver().resolve(contentPath);
    if (ResourceUtil.isNonExistingResource(contentPage)) {
        contentPath = "/content/communities/templates/functions";
        contentPage = slingRequest.getResourceResolver().resolve(contentPath);
    }
    Iterator<Resource> it = contentPage.listChildren();
    final ArrayList rv = new ArrayList();
    boolean hasmore = false;
    long count  = 0;
    long rows   = 0;
    long offset = 0;

//offset parameter
    if (request.getParameter ("offset") != null) {
        long skip = Long.parseLong(request.getParameter("offset"));
        offset = skip;
        while (skip > 0 && it.hasNext()) {
            Resource r = it.next ();
            if (r.getName().equals("jcr:content")) {
                continue;
            }
            skip--;
        }
    }

//count of rows to get
    if (request.getAttribute("com.adobe.cq.datasource.fetchSize") != null) {
        rows = ((Long)request.getAttribute("com.adobe.cq.datasource.fetchSize")).longValue();
    }
    
    List<Resource> plist = new ArrayList<Resource>();
    populatePages(plist, contentPage);
    it = plist.iterator();
    
//populate the rv with Page objects
    for (;it.hasNext ();) {
        Resource r = it.next ();
        if (rows <= 0) {
            rv.add(r);
            count++;
        } else if (count < rows) {
            rv.add(r);
            count++;
        } else {
            hasmore = true;
            break;
        }
    }

    String nextpage = "";
    if (hasmore) {
        String q = request.getQueryString();
        if (q != null) {
            q = q.replaceAll ("offset=\\d+", "offset="+(offset + rows));
        } else {
            q = "offset=" + (offset + rows);
        }


        // FIXME constructing next page URL this way doesn't work well for some scenarios, as the query string is completely replaced
        nextpage = request.getRequestURI () + "?" + q;
    }
    request.setAttribute("com.adobe.cq.datasource.iterator", rv.iterator());
    request.setAttribute("com.adobe.cq.datasource.size", count);
    request.setAttribute("com.adobe.cq.datasource.nextPagePath", nextpage);

    DataSource ds;
    if (rv.isEmpty()) {
        log.error("DS is empty");
        ds = EmptyDataSource.instance();
    } else {
        ds = new SimpleDataSource(new TransformIterator(rv.iterator(), new Transformer() {
            public Object transform(Object input) {
                try {
                    Resource rc = (Resource) input;
                    Page tmpPage = rc.adaptTo(Page.class);
                    ValueMap vm = new ValueMapDecorator(new HashMap<String, Object>());
                    vm.put("value", tmpPage.getPath());
                    vm.put("text", tmpPage.getTitle());

                    return new ValueMapResource(resolver, new ResourceMetadata(), "nt:unstructured", vm);
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
            }
        }));
    }

    request.setAttribute(DataSource.class.getName(), ds);

%>
<%!
    private void populatePages(List<Resource> results, Resource currentNode) {
        Iterator<Resource> children = currentNode.listChildren();
        while (children.hasNext()) {
            Resource child = children.next();
            Page tmpPage = child.adaptTo(Page.class);
            if (tmpPage != null) {
                results.add(child);
            } else {
                populatePages(results, child);
            }
        }
    }
%>
