<%--

 ADOBE CONFIDENTIAL
 __________________

  Copyright 2013 Adobe Systems Incorporated
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
%><%@page session="false"
              import="java.util.List,
                      java.util.HashMap,
                    java.util.ArrayList,
                    java.util.Map"%><%
%><%@ include file="/libs/foundation/global.jsp" %><%
    final String PATH_KEY = "path";
    final String TABNAME_KEY = "tabname";
    final String INDEX_KEY = "index";
    final String PN_TabName = "scg:tabName";
    List<Map<String, Object>> tabs = new ArrayList<Map<String,Object>>();
    Iterable<Resource> children = resource.getChildren();
    int i = 0;
    for (Resource res : children) {
        Map<String, Object> map = new HashMap<String, Object>();
        map.put(PATH_KEY, res.getPath());
        map.put(TABNAME_KEY, res.adaptTo(ValueMap.class).get(PN_TabName, "tab"));
        map.put(INDEX_KEY, i);
        i++;
        tabs.add(map);
    }
%><div class="tabbable">
    <ul class="nav nav-tabs">
        <%for (Map<String, Object> map : tabs) {
            int idx = (Integer) map.get(INDEX_KEY);
            String tabName = (String) map.get(TABNAME_KEY);%>
            <li class="<%=(idx== 0)?"active":""%>"><a href="#tab<%=idx%>" data-toggle="tab"><%=tabName%></a></li>
        <%}%>
    </ul>
    <div class="tab-content">
        <%for (Map<String, Object> map : tabs) {
            int idx = (Integer) map.get(INDEX_KEY);
            String path = (String) map.get(PATH_KEY);%>
            <div class="tab-pane <%=(idx== 0)?"active":""%>" id="tab<%=idx%>">
                <sling:include path="<%=path%>"/>
            </div>
        <%}%>
    </div>
</div>
