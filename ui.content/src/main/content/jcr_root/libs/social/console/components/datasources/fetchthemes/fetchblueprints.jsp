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
%><%@page session="false" import="java.util.ArrayList,
                                  java.util.HashMap,
                                  java.util.List,
                                  org.apache.commons.collections.Transformer,
                                  org.apache.commons.collections.iterators.TransformIterator,
                                  org.apache.sling.api.resource.ResourceMetadata,
                                  org.apache.sling.api.resource.ValueMap,
                                  org.apache.sling.api.wrappers.ValueMapDecorator,
                                  com.day.cq.wcm.api.WCMException,
                                  com.day.cq.wcm.msm.api.RolloutConfig,
                                  com.day.cq.wcm.msm.api.RolloutConfigManager,
                                  com.adobe.granite.ui.components.ds.DataSource,
                                  com.adobe.granite.ui.components.ds.EmptyDataSource,
                                  com.adobe.granite.ui.components.ds.SimpleDataSource,
                                  com.adobe.granite.ui.components.ds.ValueMapResource, org.apache.sling.api.resource.ResourceResolver"%><%
%><%@include file="/libs/granite/ui/global.jsp" %><%

    final ResourceResolver resolver = resourceResolver;
    RolloutConfigManager rcm = resolver.adaptTo(RolloutConfigManager.class);
    List<RolloutConfig> rolloutConfigs = new ArrayList<RolloutConfig>();
    try {
        for (String key : rcm.getRolloutConfigs()) {
            RolloutConfig rc = rcm.getRolloutConfig(key);
            if (rc != null) {
                rolloutConfigs.add(rc);
            }
        }
    } catch (WCMException e) {
        log.warn("Unable to get rollout configurations");
    }

    DataSource ds;
    if (rolloutConfigs.isEmpty()) {
        ds = EmptyDataSource.instance();
    } else {
        ds = new SimpleDataSource(new TransformIterator(rolloutConfigs.iterator(), new Transformer() {
            public Object transform(Object input) {
                try {
                    RolloutConfig rc = (RolloutConfig) input;

                    ValueMap vm = new ValueMapDecorator(new HashMap<String, Object>());
                    vm.put("value", rc.getPath());
                    vm.put("text", rc.getTitle());

                    return new ValueMapResource(resolver, new ResourceMetadata(), "nt:unstructured", vm);
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
            }
        }));
    }

    request.setAttribute(DataSource.class.getName(), ds);

%>
