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
%><%@page session="false" import="com.adobe.granite.xss.XSSAPI"%>
<%!
/* Functions used by automation to wrap output in XSS protection.
 * The version parameter notes the version of the automation
 * which applied protection to a given instance.
 */
    public String xssPass(Object o) {
       return String.valueOf(o);
    }
    public String xssPass(XSSAPI xssAPI, Object o) {
       return String.valueOf(o);
    }

    public String xssAttrWrap(XSSAPI xssAPI, Object o) {
       return xssAPI.encodeForHTMLAttr(String.valueOf(o));
   }

    public String xssAttrWrap(XSSAPI xssAPI, int n) {
        return String.valueOf(n);
   }
    public String xssFilterWrap(XSSAPI xssAPI, Object o) {
        return xssAPI.filterHTML(String.valueOf(o));
   }

    public String xssFilterWrap(XSSAPI xssAPI, int n) {
        return String.valueOf(n);
   }


    public String xssJSWrap(XSSAPI xssAPI, Object o) {
        return xssAPI.encodeForJSString(String.valueOf(o));
   }
%>
