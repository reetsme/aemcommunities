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

2447US01 - Patent Application - US - 13/648,825
2448US01 - Patent Application - US - 13/648,856

--%>
<%@page session="false"
        contentType="text/html; charset=utf-8"
        import="java.lang.StringBuilder,
                java.util.Hashtable,
                javax.jcr.Node,
                javax.jcr.NodeIterator,
                javax.jcr.Session,
                com.day.cq.commons.jcr.JcrUtil,
                com.adobe.granite.auth.oauth.ProviderConfigProperties,
                java.nio.charset.Charset,
                org.apache.commons.codec.binary.Hex,
                javax.servlet.RequestDispatcher,
                javax.servlet.http.HttpServletResponse,
                java.security.MessageDigest,
                com.adobe.granite.auth.oauth.Provider,
                com.adobe.granite.auth.oauth.ProviderType,
                org.apache.sling.api.resource.Resource,
                org.apache.sling.api.resource.ModifiableValueMap,
                org.slf4j.Logger,
                org.slf4j.LoggerFactory,
                java.util.Arrays"%>

<%@taglib prefix="cq" uri="http://www.day.com/taglibs/cq/1.0" %>

<cq:defineObjects/>

<%
    final MessageDigest md = MessageDigest.getInstance("MD5");
    md.reset();
    md.update(currentNode.getPath().getBytes(Charset.forName("UTF8")));
    final byte[] res = md.digest();
    final String configIdResult = new String(Hex.encodeHex(res));

    //create or update a sling:OsgiConfig node to hold the config
    Session session = resource.getResourceResolver().adaptTo(Session.class);
    String configIdNodePath = ProviderConfigProperties.FACTORY_PID+"-"+currentPage.getName()+".config";

    //***********NOTE
    //the config node we create won't do anything till its copied to /apps - there is an eventlister for that
    //***********NOTE

    Node configNode = null;
    if (currentNode.hasNode(configIdNodePath)){
        //delete the old one
        configNode = currentNode.getNode(configIdNodePath);
        session.removeItem(configNode.getPath());
        //Force save to trigger aforementioned eventlistener
        session.save();
    }
    //recreate the config node
    configNode = currentNode.addNode(configIdNodePath, "sling:OsgiConfig");;

    log.info("config node:" + configNode.getPath());
                                    
    Resource configResource = resource.getResourceResolver().getResource(configNode.getPath());
    ModifiableValueMap props = configResource.adaptTo(ModifiableValueMap.class);

    props.put("oauth.config.id", configIdResult);
    props.put("oauth.config.provider.id",request.getParameter("oauth.config.provider.id"));
    props.put("oauth.client.id",request.getParameter("oauth.client.id"));
    props.put("oauth.client.secret",request.getParameter("oauth.client.secret"));
    props.put("oauth.create.users",request.getParameter("oauth.create.users"));
    props.put("oauth.encode.userids",request.getParameter("oauth.encode.userids"));
    //do NOT include a callback url
    //always store the acceess token
    props.put("oauth.access.token.persist", true);

    //user groups (multiple possible)
    final String[] groups = request.getParameterValues("oauth.create.users.groups");
    props.put("oauth.create.users.groups",groups);

    //permission scopes (multiple possible)
    //Check the provider type of current provider
    Provider[] providers = sling.getServices(com.adobe.granite.auth.oauth.Provider.class,null);
    if(providers != null){
        for(int i=0;i<providers.length;i++){
            Provider provider = providers[i];
            if(provider.getId().equals(request.getParameter("oauth.config.provider.id"))){
                if(provider.getType() == ProviderType.OAUTH2) {
                    // This Provider is  of type Oauth2. So input scopes.
                    StringBuilder scopesSb = new StringBuilder();
                    final String[] scopes = request.getParameterValues("oauth.scope");
                    props.put("oauth.scope",scopes);
                }
            }
        }
    }

    currentNode.setProperty("oauth.config.id",configIdResult);
    if(request.getParameterValues("urlParams") != null) {
        currentNode.setProperty("urlParams",request.getParameterValues("urlParams"));
    }
    configResource.getResourceResolver().commit();
    session.save();
    
    response.setStatus(HttpServletResponse.SC_OK);
    response.setIntHeader("status",HttpServletResponse.SC_OK);

%>
