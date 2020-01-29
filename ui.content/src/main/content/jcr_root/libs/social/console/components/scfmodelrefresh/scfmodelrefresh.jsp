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
%><%@include file="/libs/granite/ui/global.jsp" %><%
%><%@page session="false"
          import="org.apache.sling.commons.json.io.JSONStringer,
                  com.adobe.granite.ui.components.AttrBuilder,
                  com.adobe.granite.ui.components.Config,
                  com.adobe.granite.ui.components.ExpressionHelper,
                  com.adobe.granite.ui.components.Tag" %><%--###
SCFModelRefresh
==========

.. granite:servercomponent:: /libs/social/console/components/datasources/scfmodelrefresh

   ``SCFModelRefresh`` is success response handler that reloads the SCF model for a particular resource.

   It has the following content structure:

   .. gnd:gnd::

      [scf:SCFModelRefresh] > granite:commonAttrs

      /**
       * The ID of the SCF component to target with the data from the Form submission
       */
       - scfcomponentid (StringEL)


   Example::

      + myform
        - sling:resourceType = "granite/ui/components/coral/foundation/form"
        - method = "post"
        - action = "/my/new/resource"
        - foundationForm = true
        + successresponse
          - sling:resourceType = "social/console/components/datasources/scfmodelrefresh"
          - scfcomponentid = "${requestPathInfo.suffix}"
        + items
          + field1
          + field2
###--%><%

Config cfg = cmp.getConfig();
ExpressionHelper ex = cmp.getExpressionHelper();

Tag tag = cmp.consumeTag();

AttrBuilder attrs = tag.getAttrs();
cmp.populateCommonAttrs(attrs);

JSONStringer json = new JSONStringer();
json.object();

json.key("name").value("scf.granite.ui.form.reloadmodel");
json.key("scfcomponentid").value(ex.getString(cfg.get("scfcomponentid", String.class)));

json.endObject();

attrs.addClass("foundation-form-response-ui-success");
attrs.add("data-foundation-form-response-ui-success", json.toString());

%><meta <%= attrs %>>
