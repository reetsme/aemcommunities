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
<%@ page session="false" import="com.day.cq.i18n.I18n,
                 com.day.cq.wcm.api.WCMMode,
                 com.day.text.Text,
                 com.day.cq.wcm.foundation.forms.FormsHelper" %>

<%@include file="/libs/foundation/global.jsp"%><%
%><%@include file="/libs/social/security/social-security.jsp" %>

<cq:includeClientLib categories="cq.social.connect"/>

<%
    final String id = Text.getName(resource.getPath());
    I18n i18n = new I18n(slingRequest);
    final String action = currentPage.getPath() + "/j_security_check";
    final String validationFunctionName = "cq5forms_validate_" + id;
    String safeValidationFunctionName = "XSS_" + java.util.UUID.randomUUID().toString().replace("-","_");
    String defaultRedirect = currentPage.getPath();
    if(!defaultRedirect.endsWith(".html")) {
        defaultRedirect += ".html";
    }
    boolean isDisabled = WCMMode.fromRequest(request).equals(WCMMode.DISABLED);
%>

<script type="text/javascript">
    function <%=xssAPI.getValidJSToken(validationFunctionName, safeValidationFunctionName)%>() {
        if (CQ_Analytics) {
            var u = document.forms['<%=xssJSWrap(xssAPI, id)%>']['j_username'].value;
            if (CQ_Analytics.Sitecatalyst) {
                CQ_Analytics.record({ event: "loginAttempt", values: {
                    username:u,
                    loginPage:"<%= xssAPI.encodeForJSString(currentPage.getPath()) %>.html",
                    destinationPage:"<%= xssAPI.encodeForJSString(defaultRedirect) %>"
                },  componentPath: '<%=xssAPI.encodeForJSString(resource.getResourceType())%>'});
                if (CQ_Analytics.ClickstreamcloudUI && CQ_Analytics.ClickstreamcloudUI.isVisible()) {
                    return false;
                }
            }
        <% if ( !isDisabled ) {
            final String contextPath = slingRequest.getContextPath();
            final String authorRedirect = contextPath + defaultRedirect; %>
            if (CQ_Analytics.ProfileDataMgr) {
                if (u) {
                    /*
                     * AdobePatentID="B1393"
                     */
                    var loaded = CQ_Analytics.ProfileDataMgr.loadProfile(u);
                    if (loaded) {
                        var url = CQ.shared.HTTP.noCaching("<%= xssAPI.encodeForJSString(authorRedirect) %>");
                        CQ.shared.Util.load(url);
                    } else {
                        alert("<%=i18n.get("The user could not be found.")%>");
                    }
                    return false;
                }
            }
            return true;
        <% } else { %>
            if (CQ_Analytics.ProfileDataMgr) {
                CQ_Analytics.ProfileDataMgr.clear();
            }
            return true;
        <% } %>
        }
    }
</script>

<%
    final String jReason = request.getParameter("j_reason");
    if (null != jReason) {
%><div class="loginerror"><%=xssAPI.encodeForHTML(i18n.getVar(jReason))%></div>
<%
    }
%>

<form method="POST"
      action="<%= xssAPI.getValidHref(action) %>"
      id="<%= xssAPI.encodeForHTMLAttr(id) %>"
      name="<%= xssAPI.encodeForHTMLAttr(id) %>"
      enctype="multipart/form-data"
      onsubmit="return <%=xssAPI.getValidJSToken(validationFunctionName, safeValidationFunctionName)%>();">

    <input type="hidden" name="resource" value="<%= xssAPI.encodeForHTMLAttr(defaultRedirect) %>">
    <input type="hidden" name="_charset_" value="UTF-8"/>

    <div class="cq-login-form-header">
        <%=i18n.get("Login:")%>
    </div>
    <table class="cq-login-form">
        <tr>
            <td class="cq-login-form-item-label-td">
                <label class="cq-login-form-item-label" for="<%= xssAPI.encodeForHTMLAttr(id + "_username")%>"><%= xssAPI.encodeForHTML(i18n.get("Username")) %></label>
            </td>
            <td>
                <input id="<%= xssAPI.encodeForHTMLAttr(id + "_username")%>"
                       tabindex="9990"
                       class="cqusername"
                       name="j_username"/>
            </td>
        </tr>
        <tr>
            <td class="cq-login-form-item-label-td">
                <label class="cq-login-form-item-label" for="<%= xssAPI.encodeForHTMLAttr(id + "_password")%>"><%= xssAPI.encodeForHTML(i18n.get("Password")) %></label>
            </td>
            <td>
                <input id="<%= xssAPI.encodeForHTMLAttr(id + "_password")%>"
                       tabindex="9991"
                       class="cqpassword"
                       type="password" autocomplete="off"
                       name="j_password"/>
            </td>
        </tr>
    </table>
    <div class="cq-login-form-item-right">
        <button class="primary" tabindex="9992" onclick="$CQ('#<%=xssJSWrap(xssAPI, id)%>').submit()">
            <%=i18n.get("Sign in")%>
        </button>
    </div>
</form>
