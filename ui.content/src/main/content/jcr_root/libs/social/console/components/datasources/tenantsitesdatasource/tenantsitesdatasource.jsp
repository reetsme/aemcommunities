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
%><%@page import="org.slf4j.Logger,org.slf4j.LoggerFactory,
                  java.util.Iterator,
                  java.util.HashMap,
                  java.util.List,
                  java.util.ArrayList,
                  java.util.Iterator,
                  org.apache.commons.collections.iterators.TransformIterator,
                  org.apache.commons.collections.Transformer,
                  org.apache.sling.api.resource.ResourceMetadata,
                  org.apache.sling.api.wrappers.ValueMapDecorator,
                  org.apache.sling.api.resource.ResourceResolver,
                  com.adobe.granite.ui.components.ds.DataSource,
                  com.adobe.granite.ui.components.ds.AbstractDataSource,
                  com.adobe.granite.ui.components.ds.EmptyDataSource,
                  com.adobe.granite.ui.components.ds.ValueMapResource,
                  com.adobe.cq.social.scf.SocialComponentFactoryManager,
                  com.adobe.cq.social.scf.SocialComponentFactory,
                  com.adobe.cq.social.site.api.CommunitySiteConstants,
                  com.adobe.cq.social.site.api.CommunitySiteCollection,
                  com.adobe.cq.social.site.api.CommunitySite"%><%

%><%@taglib prefix="sling" uri="http://sling.apache.org/taglibs/sling/1.0"%><%
%><%@taglib prefix="cq" uri="http://www.day.com/taglibs/cq/1.0"%><%
%><%@taglib prefix="ui" uri="http://www.adobe.com/taglibs/granite/ui/1.0"%><%
%><%@include file="/libs/foundation/global.jsp"%><%
%><cq:defineObjects /><%

    Logger LOG = LoggerFactory.getLogger("com.adobe.cq.social.graniteui.datasources");
    SocialComponentFactoryManager scfm = sling.getService(com.adobe.cq.social.scf.SocialComponentFactoryManager.class);
    if (scfm == null) {
        request.setAttribute(DataSource.class.getName(), EmptyDataSource.instance());
        LOG.warn("Could not get social component factory manager from sling.");
        return;
    }

    SocialComponentFactory scf = scfm.getSocialComponentFactory(CommunitySiteConstants.COLLECTION_RESOURCE_TYPE);
    if (scf == null) {
        request.setAttribute(DataSource.class.getName(), EmptyDataSource.instance());
        LOG.warn("Could not get social component factory from for {}", CommunitySiteConstants.COLLECTION_RESOURCE_TYPE);
        return;
    }

    final HashMap componentMap = new HashMap();
    final CommunitySiteCollection siteColl = (CommunitySiteCollection) scf.getSocialComponent(new ValueMapResource(resourceResolver,
          "/content/sites",
          CommunitySiteConstants.COLLECTION_RESOURCE_TYPE, new ValueMapDecorator(componentMap)));

    if (siteColl == null) {
        request.setAttribute(DataSource.class.getName(), EmptyDataSource.instance());
        LOG.warn("Could not get social component for resource.");
        return;
    }
    final ResourceResolver resolver = resourceResolver;

    List<Object> siteList = siteColl.getItems();
    ArrayList<CommunitySite> languageSiteList = new ArrayList<CommunitySite>();
    for(Object obj:siteList){
        if(obj instanceof CommunitySite){
            languageSiteList.add((CommunitySite)obj);
        }
    }
    final Iterator<CommunitySite> itr = languageSiteList.iterator();

    final DataSource ds = new AbstractDataSource() {
        public Iterator<Resource> iterator() {
            return new TransformIterator(itr, new Transformer() {
                public Object transform(Object input) {
                    Logger LOG = LoggerFactory.getLogger("com.adobe.cq.social.datasources.tenant");

                    CommunitySite site = (CommunitySite) input;
                    HashMap map = new HashMap();
                    map.put("text", site.getName() + " (" + site.getProperties().get("baseLanguage") + ")" );
                    map.put("value", site.getSiteId());
                    ValueMapResource res = new ValueMapResource(resolver, site.getId().getResourceIdentifier(), CommunitySiteConstants.RESOURCE_TYPE,
                            new ValueMapDecorator(map));
                    return res;
                }
            });
        }
    };

    request.setAttribute(DataSource.class.getName(), ds);

%>
