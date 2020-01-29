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
<%@ page session="false" import="org.apache.sling.api.resource.ValueMap,
                org.apache.sling.api.resource.Resource,
                com.adobe.granite.auth.oauth.ProviderConfigProperties,
                java.util.Dictionary,
                org.json.JSONArray,
                org.json.JSONObject,
                com.day.cq.commons.TidyJSONWriter" %>

<%@include file="/libs/foundation/global.jsp" %>

<%
    if(currentNode.hasProperty("oauth.config.id")){
        final String configId = currentNode.getProperty("oauth.config.id").getString();
        Value[] parameters = null;
        if(currentNode.hasProperty("urlParams")){
                parameters = (Value[])currentNode.getProperty("urlParams").getValues();
        }

        if(configId != null && configId.length() > 0){

            final String configResourceName = ProviderConfigProperties.FACTORY_PID+"-"+currentPage.getName()+".config";
            final Resource configResource = resource.getChild(configResourceName);
            if(configResource != null){
                ValueMap props = configResource.adaptTo(ValueMap.class);

                TidyJSONWriter w = new TidyJSONWriter(response.getWriter());
                w.setTidy(true);

                w.object();

                w.key("oauth.callBackUrl").value(props.get("oauth.callBackUrl"));
                w.key("oauth.client.secret").value(props.get("oauth.client.secret"));
                w.key("oauth.config.id").value(props.get("oauth.config.id"));
                w.key("oauth.client.id").value(props.get("oauth.client.id"));
                w.key("oauth.create.users").value(props.get("oauth.create.users"));
                w.key("oauth.encode.userids").value(props.get("oauth.encode.userids"));
                w.key("oauth.config.provider.id").value(props.get("oauth.config.provider.id"));

                String[] userGroups = (String[])props.get("oauth.create.users.groups", String[].class);
                w.key("oauth.create.users.groups").array();
                for(int i=0;i<userGroups.length;i++){
                    w.value(userGroups[i]);
                }
                w.endArray();

                String[] scopes = (String[])props.get("oauth.scope", String[].class);
                if(scopes != null){
                    for(int i=0;i<scopes.length;i++){
                        w.key(scopes[i]).value("on");
                    }
                }
                if(parameters != null) {
                    w.key("urlParams").array();
                    for(int i=0;i<parameters.length;i++){
                        w.value(parameters[i].getString());
                    }
                    w.endArray();
                }

                w.endObject();
            }
        }
    }

    response.setContentType("application/json");
    response.setCharacterEncoding("utf-8");
    response.setStatus(HttpServletResponse.SC_OK);
    response.setIntHeader("status",HttpServletResponse.SC_OK);

%>
