<%--

 ADOBE CONFIDENTIAL
 __________________

  Copyright 2017 Adobe Systems Incorporated
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
                                  java.util.HashMap,java.util.List,
                                  java.util.Collection,
                                  java.util.Iterator,
                                  org.apache.commons.collections.Transformer,
                                  org.apache.commons.collections.iterators.TransformIterator,
                                  org.apache.commons.lang.ArrayUtils,
                                  org.apache.sling.api.resource.ResourceMetadata,
                                  org.apache.sling.api.resource.ValueMap,
                                  org.apache.sling.api.wrappers.ValueMapDecorator,
                                  com.adobe.granite.ui.components.ds.DataSource,
                                  com.adobe.granite.ui.components.Config,
                                  com.adobe.granite.confmgr.Conf,
                                  com.adobe.granite.ui.components.ds.EmptyDataSource,
                                  com.adobe.granite.ui.components.ds.SimpleDataSource,
                                  com.adobe.granite.ui.components.ds.ValueMapResource,
                                  org.apache.sling.api.resource.ResourceResolver"%><%
%><%@include file="/libs/granite/ui/global.jsp" %><%

    Config cfg = cmp.getConfig();

    String path = cmp.getExpressionHelper().getString(cfg.get("path", ""));
    if ("".equals(path)) {

        return;
    }
    final ResourceResolver resolver = resourceResolver;
    List<Resource> result = new ArrayList<Resource>();
    List<String> resultNames = new ArrayList<String>();

    // load context rules
    Resource contentResourceContext = resourceResolver.getResource(path);
    if(contentResourceContext != null) {
        Conf confMgrContext = contentResourceContext.adaptTo(Conf.class);
        List<Resource> configResourcesContext = confMgrContext.getListResources("community/scoring/rules");
        if (configResourcesContext != null) {
            for (final Resource rsrc : configResourcesContext) {
                if (!resultNames.contains(rsrc.getName()) && ! rsrc.getResourceType().equalsIgnoreCase("sling:folder")) {
                    result.add(rsrc);
                    resultNames.add(rsrc.getName());
                }
            }
        }
    }
    // load global rules
    Resource contentResourceGlobal = resourceResolver.getResource("/conf");
    if(contentResourceGlobal !=  null) {
        Conf confMgrGlobal = contentResourceGlobal.adaptTo(Conf.class);
        List<Resource> configResourcesGlobal = confMgrGlobal.getListResources("community/scoring/rules");
        if (configResourcesGlobal != null) {
            for (final Resource rsrc : configResourcesGlobal) {
                if (!resultNames.contains(rsrc.getName()) && ! rsrc.getResourceType().equalsIgnoreCase("sling:folder")) {
                    result.add(rsrc);
                    resultNames.add(rsrc.getName());
                }
            }
        }
    }

    // load custom rules : deploy time form /apps
    final Resource contentResourceApps = resourceResolver.getResource("/apps/settings/community/scoring/rules");
    if(contentResourceApps != null){
        Iterator<Resource> configResourcesApps = contentResourceApps.listChildren();
        while (configResourcesApps.hasNext()) {
            Resource rsrc = configResourcesApps.next();
            if(!resultNames.contains(rsrc.getName()) && ! rsrc.getResourceType().equalsIgnoreCase("sling:folder")){
                result.add(rsrc);
                resultNames.add(rsrc.getName());
            }
        }
    }

    // load ootb rules :  form /libs
    final Resource contentResourceLibs = resourceResolver.getResource("/libs/settings/community/scoring/rules");
    if(contentResourceLibs != null){
        Iterator<Resource> configResourcesLibss = contentResourceLibs.listChildren();
        while (configResourcesLibss.hasNext()) {
            Resource rsrc = configResourcesLibss.next();
            if(!resultNames.contains(rsrc.getName()) && ! rsrc.getResourceType().equalsIgnoreCase("sling:folder")){
                result.add(rsrc);
                resultNames.add(rsrc.getName());
            }
        }
    }

    // load ootb rules :  from /etc - pre 6.4 rules
    final Resource contentResourceEtc = resourceResolver.getResource("/etc/community/scoring/rules");
    if(contentResourceEtc != null){
        Iterator<Resource> configResourcesEtcs = contentResourceEtc.listChildren();
        while (configResourcesEtcs.hasNext()) {
            Resource rsrc = configResourcesEtcs.next();
            if(! rsrc.getResourceType().equalsIgnoreCase("sling:folder")){
                result.add(rsrc);
                resultNames.add(rsrc.getName());
            }
        }
    }

    if(result == null) {
        return;
    }

    String[] selected = resource.getValueMap().get("selectedValue", String[].class);
    if (selected == null) {
        String value = resource.getValueMap().get("selectedValue", String.class);
        if (value != null) {
            selected = new String[] { value };
        }
    }
    final String[] selectedValues = selected;


    DataSource ds;
    if (result.isEmpty()) {
        ds = EmptyDataSource.instance();
    } else {

        ds = new SimpleDataSource(new TransformIterator(result.iterator(), new Transformer() {
            public Object transform(Object input) {
                try {
                    Resource rc = (Resource) input;
                    ValueMap vm = new ValueMapDecorator(new HashMap<String, Object>());
                    vm.put("value", rc.getPath());
                    vm.put("text", rc.getPath());

                    if (selectedValues != null && ArrayUtils.contains(selectedValues, rc.getPath())) {
                        vm.put("selected", true);
                    }

                    return new ValueMapResource(resolver, new ResourceMetadata(), "nt:unstructured", vm);
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
            }
        }));
    }

    request.setAttribute(DataSource.class.getName(), ds);

%>
