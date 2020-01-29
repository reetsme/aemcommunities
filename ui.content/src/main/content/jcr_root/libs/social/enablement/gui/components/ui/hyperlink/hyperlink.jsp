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
%><%@include file="/libs/social/enablement/common.jsp" %><%
%><%@page session="false"
          import="org.apache.sling.api.SlingHttpServletRequest,
                  com.adobe.granite.ui.components.AttrBuilder,
                  com.adobe.granite.ui.components.Config,
                  com.adobe.granite.ui.components.ExpressionResolver,
                  com.adobe.granite.ui.components.ExpressionHelper,
                com.adobe.granite.ui.components.ComponentHelper,
                  com.adobe.granite.ui.components.Tag" %><%


ExpressionHelper ex = new ExpressionHelper(sling.getService(ExpressionResolver.class), pageContext);

Config cfg = cmp.getConfig();
String icon = cfg.get("icon", String.class);
Boolean hideText = cfg.get("hideText", false);

Tag tag = cmp.consumeTag();

AttrBuilder attrs = tag.getAttrs();

attrs.add("id", cfg.get("id", String.class));
attrs.addRel(cfg.get("rel", String.class));
attrs.addClass(cfg.get("class", String.class));
attrs.add("title", i18n.getVar(request, cfg.get("title", String.class)));
attrs.add("target", cfg.get("target", String.class));

attrs.addClass(cfg.get("icon", String.class));

if (!hideText) {
    attrs.addClass("withLabel");
}
if (cfg.get("endorActionBarIcon", false)) {
    attrs.addClass("button coral-Button coral-Button--secondary coral-Button--quiet");
}

attrs.add("x-cq-linkchecker", cfg.get("x-cq-linkchecker", String.class));

handleHref(cfg, attrs, ex, slingRequest);



attrs.addOthers(cfg.getProperties(), "id", "rel", "class", "title", "href", "target", "text", "icon", "hideText", "allowEmptySuffix", "appendSuffix", "suffixMinLevel", "x-cq-linkchecker");

%><a <%= attrs.build() %>><%
    if (icon != null) {
      %><i class="endor-ActionButton-icon coral-Icon <%= xssAPI.encodeForHTMLAttr(cmp.getIconClass(icon)) %>"></i><%
    }
%><%if(!hideText){%><%= xssAPI.encodeForHTML(getReplacedText(slingRequest, cfg, i18n)) %><%}%></a><%!

void handleHref(Config cfg, AttrBuilder attrs, ExpressionHelper ex, SlingHttpServletRequest req) {
    // FIXME this is a wrong solution
    if (Boolean.TRUE.equals(req.getAttribute("pulldown_disabled"))) {
        attrs.addClass("disabled");
        return;
    }

    String href = ex.getString(cfg.get("href", ""));

    if(href != null && href.trim().length() > 0)
    {


        String suffix = null;

        if (cfg.get("useResourceVanityPath", false))
        {
            Resource resource = req.getRequestPathInfo().getSuffixResource();
            if ( resource != null )
            {
                href = href.replaceAll("__resourceVanityPath__", resource.getPath());
            }
        }
        else if (cfg.get("appendSuffix", false))
        {
            suffix = req.getRequestPathInfo().getSuffix();
        }

        if (suffix != null)
        {
             href += suffix;
        }
    }


    attrs.addHref("href", href);
}


String getReplacedText(SlingHttpServletRequest request, Config cfg, I18n i18n) {
    String serverName = getServerUrlStr(request);
    String text = cfg.get("text", "").replaceAll("__serverPrefix__", serverName);
    if ( cfg.get("useResourceVanityPath", false) )
    {
        Resource resource = request.getRequestPathInfo().getSuffixResource();
        if ( resource != null )
        {
           text = text.replaceAll("__resourceVanityPath__", resource.getPath());
        }
    } else if ( cfg.get("appendSuffix", false) ) {
        text += request.getRequestPathInfo().getSuffix();
    }
    return i18n.getVar(request, text);
}

String getServerUrlStr(SlingHttpServletRequest request) {
    StringBuffer serverStr = new StringBuffer();
    serverStr.append(request.getScheme() + "://" + request.getServerName());
    return serverStr.toString();
}
%><%-- No extra whitespace after this as <a> is inline element --%>