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

--%>
<%@include file="/libs/foundation/global.jsp"%><%
%><%@page session="false"
          import="java.util.ArrayList,
                  java.util.Collections,
                  java.util.Comparator,
                  java.util.HashMap,
                  java.util.Iterator,
                  java.util.List,
                  java.util.LinkedList,
                  javax.jcr.Node,
                  org.apache.commons.lang3.StringUtils,
                  com.day.cq.commons.jcr.JcrConstants,
                  org.apache.sling.api.resource.Resource,
                  org.apache.sling.api.resource.ResourceResolver,
                  org.apache.sling.api.resource.ValueMap,
                  org.apache.sling.api.wrappers.ValueMapDecorator,
                  com.adobe.granite.ui.components.ds.ValueMapResource,
                  com.adobe.granite.confmgr.Conf,
                  com.adobe.granite.xss.XSSAPI,
                  com.day.cq.i18n.I18n,
                  com.day.cq.wcm.api.Template,
                  com.day.cq.wcm.webservicesupport.ConfigurationManager,
                  com.day.cq.wcm.webservicesupport.Configuration,
                  com.day.cq.wcm.webservicesupport.Service,
                  java.util.Set,
                  java.util.HashSet,
                  java.util.LinkedHashMap,
                  java.util.Map" %>
<%@taglib prefix="ui" uri="http://www.adobe.com/taglibs/granite/ui/1.0"%>
<ui:includeClientLib categories="cq.livefyreconfigs.properties" />
<%

    //Get the configuration value
    //Build selector for anything UNDER that config value


    final I18n i18n = new I18n(slingRequest);
    String contentPath = (String) request.getAttribute("granite.ui.form.contentpath");
    String resourcePath = "";

    if (null == request.getQueryString()) {
        String suffix = slingRequest.getRequestPathInfo().getSuffix();
        Resource res = slingRequest.getResourceResolver().getResource(suffix);
        if (suffix == null || res == null) {
            return;
        }
        contentPath = res.getPath();
    }
    resourcePath = contentPath;
    if (!StringUtils.endsWith(contentPath, JcrConstants.JCR_CONTENT)) {
        contentPath += "/" + JcrConstants.JCR_CONTENT;
    }
    Resource contentRes = resourceResolver.getResource(contentPath);
    // contentRes is null for folders (sling:folder, sling:OrderedFolder) without JCR_CONTENT node, Fix for them, creating a JCR_CONTENT node
    if (null == contentRes) {
        contentRes = resourceResolver.getResource(contentPath.substring(0, contentPath.lastIndexOf('/')));
        Node resNode = contentRes.adaptTo(Node.class);
        try {
            if (!resNode.hasNode(JcrConstants.JCR_CONTENT)) {
                resNode.addNode(JcrConstants.JCR_CONTENT, JcrConstants.NT_UNSTRUCTURED);
            }
        } catch (Exception e) {
            // do nothing
        }
        contentRes = resourceResolver.getResource(contentPath);
    }
    Resource pageRes = contentRes.getParent();
    Conf conf = pageRes.adaptTo(Conf.class);

    ValueMap vm = contentRes.getValueMap();
    String confPath = vm.get("cq:conf", String.class);

%>
<section class="coral-Form-fieldset livefyreCloudServices-container" data-path="<%=resourcePath%>">
    <h3 class="coral-Form-fieldset-legend">
        <%= i18n.get("Livefyre Cloud Service Configurations")%>
    </h3>
    <%
        if (confPath != null) {
            %><label class="coral-Form-fieldlabel">Configuration Folder:</label><h4><%= i18n.get(confPath)%></h4><%
        }
    %>
    <label class="coral-Form-fieldlabel">Livefyre Service:</label>
    <div class="foundation-field-editable">
        <div class="foundation-field-edit coral-Form-fieldwrapper">
            <coral-select placeholder="<%= i18n.get("Select Configuration")%>"
                          class="livefyreCloudServices-serviceSelect livefyreCloudServices-serviceSelect" name="./livefyreCloudserviceconfigs">
                <%
                List<Resource> configLists = conf.getListResources("cloudconfigs");
                final List<Service> services = new ArrayList<Service>();
                for (Iterator<Service> servicesIt = getServices(configLists); servicesIt.hasNext(); ) {
                    Service service = servicesIt.next();
                    services.add(service);
                }
                for (Service service : services) {
                    %>
                    <coral-select-item value="<%= xssAPI.encodeForHTML(i18n.getVar(service.getPath())) %>"
                            <%= isSelected(service, pageRes) ? "selected" : "" %>>
                        <span class="livefyreCloudServices-serviceTitle">
                            <%= xssAPI.encodeForHTML(i18n.getVar(service.getTitle())) %>
                        </span>
                    </coral-select-item>
                    <%
                }
                %>
        </div>
    </div>
</section>

<%!
    private Iterator<Service> getServices(List<Resource> configLists) {
        List<Service> entries = new LinkedList<Service>();
        Iterator<Resource> iter = configLists.iterator();
        while(iter.hasNext()) {
            Resource resource = iter.next();
            Service srvc = resource.adaptTo(Service.class);
            if (srvc != null) {
                entries.add(srvc);
            }
        }
        return entries.iterator();
    }

    private boolean isSelected(Service service, Resource pageRes) {

        Resource jcrContent = pageRes.getChild(JcrConstants.JCR_CONTENT);
        ValueMap vm = jcrContent.getValueMap();
        String path = vm.get("livefyreCloudserviceconfigs", "");
        if (path == null) {
            return false;
        }
        return path.equals(service.getPath());
    }
%>