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

--%>
<%@page session="false"
          contentType="text/html"
          import="java.util.ArrayList,
                  java.util.Calendar,
                  java.util.HashMap,
                  java.util.Iterator,
                  java.util.List,
                  org.apache.commons.collections.Transformer,
                  org.apache.commons.collections.iterators.TransformIterator,
                  org.apache.commons.lang.StringUtils,
                  org.apache.jackrabbit.util.Text,
                  org.apache.sling.api.resource.Resource,
                  org.apache.sling.api.resource.ResourceMetadata,
                  org.apache.sling.api.resource.ValueMap,
                  org.apache.sling.api.wrappers.ValueMapDecorator,
                  com.adobe.granite.ui.components.AttrBuilder,
                  com.adobe.granite.ui.components.Config,
                  com.adobe.granite.ui.components.ds.DataSource,
                  com.adobe.granite.ui.components.ds.SimpleDataSource,
                  com.adobe.granite.ui.components.ds.ValueMapResource,
                com.day.cq.commons.LanguageUtil,
            com.adobe.cq.social.community.api.CommunityContext,
          com.adobe.cq.social.site.api.CommunitySite,
          org.apache.sling.api.resource.ResourceResolver,
                  com.day.cq.wcm.api.Page"%>
<%@include file="/libs/granite/ui/global.jsp"%>
<%--###
Breadcrumbs
===========

.. granite:servercomponent:: /libs/wcm/commons/ui/shell/datasources/breadcrumbs
   :datasource:

   A datasource providing the list of resources for the purpose of breadcrumbs for :granite:servercomponent:`/libs/granite/ui/components/shell/collectionpage`.

   It has the following content structure:

   .. gnd:gnd::

      [wcm:ShellDatasourcesBreadcrumbs]

      /**
       * The path of the current resource.
       * The breadcrumbs are generated starting from this resource up to the root.
       */
      - path (StringEL)

      /**
       * The path of the root resource.
       * The breadcrumbs are generated up to this resource.
       */
      - rootPath (String) = '/content'

      /**
       * The title of the root resource.
       *
       * If not specified, the title is retrieved based on the following priorities:
       *
       * 1. ``./jcr:content/jcr:title``
       * 2. ``./jcr:title``
       * 3. ``Resource#getName()``
       */
      - rootTitle (String)

###--%>

<%! 

   public String getSiteResourcePath(String resourcePath) {
        String languageRoot = LanguageUtil.getLanguageRoot(resourcePath);
        if (languageRoot != null) {
            String prefix = languageRoot;
            String locale = languageRoot.substring(languageRoot.lastIndexOf("/") + 1);
            if (prefix.endsWith("/resources/" + locale)) {
                // This is normal site
                return resourcePath.replaceFirst("/resources/" + locale, "/" + locale);
            } else {
                // This is a deep site so "/resources/{locale} resides in suffix
                // Search for locale in second half.
                String suffix = resourcePath.substring(prefix.length());
                languageRoot = LanguageUtil.getLanguageRoot(suffix);
                if (languageRoot != null) {
                    locale = languageRoot.substring(languageRoot.lastIndexOf("/") + 1);
                    return resourcePath.replaceFirst("/resources/" + locale, "");
                }
            }
        }
        return resourcePath;
   }

%>
<%



final Config cfg = cmp.getConfig();
final String path = StringUtils.trimToNull(cmp.getExpressionHelper().getString(cfg.get("path", String.class)));
final String enablementGroupsPath = "/libs/social/enablement/content-shell3/enablement-sites/enablement-groups";

final String enrollmentReportPath = "/libs/social/enablement/content-shell3/enablement-sites/site-resources/learningpath-info/enrollment-report";
final String userdetailLearningpathReportPath = "/libs/social/enablement/content-shell3/enablement-sites/site-resources/learningpath-info/enrollment-report/userdetaillearningpathreport";
final String resourceReportPath = "/libs/social/enablement/content-shell3/enablement-sites/site-resources/resource-info/report";
final String learningpathReportPath = "/libs/social/enablement/content-shell3/enablement-sites/site-resources/learningpath-info/learningpath-report";

String siteResourcePath = "";
String actualSitePath = "";
boolean isEnablementGroup = false;
boolean isDeepSite = false;
String suffix = slingRequest.getRequestPathInfo().getSuffix();
String contextPath = slingRequest.getContextPath();

Resource contentResource = resourceResolver.getResource(path);
if (contentResource == null) {
    return;
}


Resource parentSuffixPage = null;
if(path.equals(enablementGroupsPath)){
    isEnablementGroup = true;
}
Resource suffixPage = resourceResolver.getResource(suffix);
while (suffixPage != null) {
    ValueMap pageVM = suffixPage.getValueMap();
    if(pageVM.containsKey("jcr:content/cq:isCommunitySite")){
        
        if(pageVM.containsKey("configuration/siteResourcesPath")){
            siteResourcePath = pageVM.get("configuration/siteResourcesPath","") ;
            actualSitePath = suffixPage.getPath();
            isDeepSite = true;
        }else {
            ValueMap parentSuffixPageVM = parentSuffixPage.getValueMap();
            siteResourcePath = parentSuffixPageVM.get("configuration/siteResourcesPath","") ;
            actualSitePath = parentSuffixPage.getPath();    
        }
        
        break;
    }else{
        parentSuffixPage = suffixPage;
        suffixPage = suffixPage.getParent();
    }
    
}  
String rootPath = cfg.get("rootPath", "/content");

final List<Resource> crumbs = new ArrayList<Resource>();

Resource current = contentResource;
int iteration = 0;
while (current != null) {
    iteration++;
    boolean isCommunityGroup = false;


    ValueMap currentVM = current.getValueMap();

    //
    // Get the title of the page to use in the breadcrumb
    //
    String title = i18n.getVar(currentVM.get("jcr:content/jcr:title", "Title"));

    //
    // Get the suffix that should be used for the parent pages.
    //     if the jcr:content of the page has a parentSuffix key then
    //     use the same suffix as this page for the parent page.
    //     Otherwise, it is assumed that the suffix for the parent page
    //     is one less directory then the suffix for the current page.
    //
    Boolean useParentSuffix = false;
    if (currentVM.containsKey("jcr:content/parentSuffix")) {
        useParentSuffix = currentVM.get("jcr:content/parentSuffix", Boolean.class);
    }

    //
    //
    Boolean useSuffix = false;
    if (currentVM.containsKey("jcr:content/useSuffix")) {
        useSuffix = currentVM.get("jcr:content/useSuffix", Boolean.class);
    }


    Boolean isBound = false;
    if (currentVM.containsKey("jcr:content/isBound")) {
        isBound = currentVM.get("jcr:content/isBound", Boolean.class);
    }
    String sitePath = getSiteResourcePath(suffix);
    Boolean isRoot = false;
    if (useSuffix) {
        //check if the rootPath is subString of 
        if (isBound && suffix != null && !suffix.isEmpty()) {
            Resource suffixResource = resourceResolver.getResource(sitePath);
            if (suffixResource != null) {
                ValueMap suffixVM = suffixResource.getValueMap();
                String suffixTitle = i18n.getVar(suffixVM.get("jcr:content/jcr:title", "Title"));
                String rootIdentifierPropertyName = currentVM.get("jcr:content/rootIdentifierPropertyName", "");
                isCommunityGroup = suffixVM.containsKey("jcr:content/cq:isCommunityGroup");
                if (!rootIdentifierPropertyName.isEmpty()) {
                    if (isDeepSite && suffixVM.containsKey("jcr:content/" + rootIdentifierPropertyName)) {
                        isRoot = true;
                    } else if (!isDeepSite && suffixResource.getParent().getValueMap().containsKey("jcr:content/" + rootIdentifierPropertyName)) {
                        isRoot = true;
                    }else {
                        title = suffixTitle;
                    }
                } else {
                    title = suffixTitle;
                }
            }
            if (!isRoot) {
                isRoot = suffix.equals(rootPath);
            }
        } else {
            if (suffix != null) {
                isRoot = suffix.equals(rootPath);
                if (!isRoot) {
                    Resource suffixResource = resourceResolver.getResource(suffix);
                    if (suffixResource != null) {
                        ValueMap suffixVM = suffixResource.getValueMap();
                        title = i18n.getVar(suffixVM.get("jcr:content/jcr:title", "Title"));
                    }
                }
            } else {
                isRoot = true;
            }
        }
    } else {
        if (isBound) {
            suffix = "";
        }
        isRoot = current.getPath().equals(rootPath);
    }

    if (isBound && useSuffix && isRoot) {
        Resource communitySiteResource = resourceResolver.getResource(sitePath);
        if (communitySiteResource != null) {
            ValueMap communitySiteVM = communitySiteResource.getValueMap();
            String communitySiteTitle = i18n.getVar(communitySiteVM.get("jcr:content/jcr:title", "Title"));
            String parentHref = contextPath + "/communities/site-resources.html" + suffix;
            
            if (!communitySiteTitle.isEmpty() && !parentHref.isEmpty()) {
                ValueMap communitySiteCrumbVM = new ValueMapDecorator(new HashMap<String, Object>());
                communitySiteCrumbVM.put("title", communitySiteTitle);
                communitySiteCrumbVM.put("href", parentHref);
                communitySiteCrumbVM.put("isFolder", false);
                crumbs.add(new ValueMapResource(resourceResolver,
                    new ResourceMetadata(), "nt:unstructured", communitySiteCrumbVM));
            }
        }
    }

    if (isRoot) {
        suffix = "";
    }

    //
    // Create the href for the breadcrumb.
    // This assumes all of our pages have a vanity path set on the page.
    //
    String basePath = currentVM.get("jcr:content/sling:vanityPath", "");
    String parentPath = currentVM.get("jcr:content/parentPath", basePath);
    if (isBound && useSuffix && isRoot && !basePath.equals(parentPath)) {
        Resource parentResource = resourceResolver.getResource(parentPath);
        if (parentResource != null) {
            ValueMap parentVM = parentResource.getValueMap();
            String parentVanityPath = parentVM.get("jcr:content/sling:vanityPath", "");
            if (!parentVanityPath.isEmpty()) {
                basePath = parentVanityPath;
                title = i18n.getVar(parentVM.get("jcr:content/jcr:title", "Title"));
            }
        }
    }

    if (isBound && useSuffix && isRoot && basePath.equals(parentPath)) {
        title = i18n.getVar(currentVM.get("jcr:content/jcr:title", "Title"));
    }

    String href = contextPath + "/communities/site-resources.html" + suffix;
    if(iteration == 2){
        //parent is either learning path info or resource-info
        if(path.equals(enrollmentReportPath) || path.equals(userdetailLearningpathReportPath) || path.equals(learningpathReportPath)){
          href = contextPath + "/communities/learningpath-info.html" + suffix;
        }else if (path.equals(resourceReportPath)) {
          href = contextPath + "/communities/resource-info.html" + suffix;
        }
    }else {

        if (isCommunityGroup) {
          href = contextPath + "/communities/resources/communities/communitygroups.html" + sitePath;
        } else {
          if (isEnablementGroup) {
              if(suffix.startsWith(actualSitePath)) {
                  href = contextPath + "/communities/site-resources.html" + siteResourcePath + suffix.substring(actualSitePath.length());
              }
          }
        }
    }

    if (suffix != null && !suffix.isEmpty() && !useParentSuffix) {
        suffix = suffix.substring(0, suffix.lastIndexOf("/"));
    }
    if (isRoot) {
        break;
    }else {
    // Create and add the crumb to the list of crumbs that get written to the request.
        ValueMap crumbVM = new ValueMapDecorator(new HashMap<String, Object>());
        crumbVM.put("title", title);
        crumbVM.put("href", href);
        crumbVM.put("isFolder", false);
        crumbs.add(new ValueMapResource(resourceResolver, new ResourceMetadata(), "nt:unstructured", crumbVM));
    }

    if (useSuffix) {
        //rootPath = suffix;
        if (suffix == null || suffix.isEmpty() || suffix.equals("/content")) {
            current = null;
        }
    } else {
        current = current.getParent();
    }
}

// add the enablement sites root crumb

    Resource rootResource = resourceResolver.getResource(rootPath);
    if (rootResource != null){
        ValueMap rootResourceVM = rootResource.getValueMap();
        ValueMap crumbVM = new ValueMapDecorator(new HashMap<String, Object>());
        crumbVM.put("title", i18n.getVar(rootResourceVM.get("jcr:content/jcr:title", "Title")));
        crumbVM.put("href", contextPath + rootResourceVM.get("jcr:content/sling:vanityPath", ""));
        crumbVM.put("isFolder", false);
        crumbs.add(new ValueMapResource(resourceResolver, new ResourceMetadata(), "nt:unstructured", crumbVM));
    }


// Write the crumbs to the request attributes.
//
request.setAttribute(DataSource.class.getName(), new SimpleDataSource(crumbs.iterator()));
%>
