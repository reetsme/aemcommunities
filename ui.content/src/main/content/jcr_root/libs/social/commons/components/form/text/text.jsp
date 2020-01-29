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

  ==============================================================================

  Form 'element' component

  Draws an element of a form

--%><%@include file="/libs/foundation/global.jsp"%><%
%><%@include file="/libs/social/security/social-security.jsp"%><%
%><%@ page session="false" import="com.day.cq.wcm.foundation.TextFormat,
                   com.day.cq.wcm.foundation.forms.FormsHelper,
                   com.day.cq.wcm.foundation.forms.LayoutHelper,
                   com.day.cq.wcm.foundation.forms.FormResourceEdit,
                   org.apache.commons.lang3.StringEscapeUtils,
                   java.util.ResourceBundle,
                   com.day.cq.i18n.I18n" %><%

    final ResourceBundle resourceBundle = slingRequest.getResourceBundle(null);
    I18n i18n = new I18n(resourceBundle);

    final String name = FormsHelper.getParameterName(resource);
    final String id = FormsHelper.getFieldId(slingRequest, resource);
    final boolean required = FormsHelper.isRequired(resource);
    final boolean readOnly = FormsHelper.isReadOnly(slingRequest, resource);
    final boolean multiValued = properties.get("multivalue", false);
    final boolean hideTitle = properties.get("hideTitle", false);
    final String width = properties.get("width", String.class);
    final int rows = xssAPI.getValidInteger(properties.get("rows", String.class), 1);
    final int cols = xssAPI.getValidInteger(properties.get("cols", String.class), 35);
    String[] values = FormsHelper.getValues(slingRequest, resource);
    if (values == null) {
        values = new String[]{""};
    }

    final boolean isEmptytext = properties.get("emptytext", false);
    final String emptyText = (!multiValued  && isEmptytext )? values[0] : "";

    String title = i18n.getVar(FormsHelper.getTitle(resource, "Text"));

    if (multiValued && !readOnly) {
        %><cq:include script="multivalue.jsp"/><%
    }

    boolean multiRes = FormResourceEdit.isMultiResource(slingRequest);
    String mrName = name + FormResourceEdit.WRITE_SUFFIX;
    /* Note these assignments leave mrChangeHandler and forceMrChangeHandler safe for use as
     * an js event attribute in html as encodeForJSString leaves nothing unencoded which could end
     * an html attribute value.
     */
    String mrChangeHandler = multiRes ? "cq5forms_multiResourceChange(event, '" + xssAPI.encodeForJSString(mrName) + "');" : "";
    String forceMrChangeHandler = multiRes ? "cq5forms_multiResourceChange(event, '" + xssAPI.encodeForJSString(mrName) + "', true);" : "";

    %><div class="form_row">
        <% LayoutHelper.printTitle(id, title, required, hideTitle, out); %>
        <div class="form_rightcol" id="<%= xssAPI.encodeForHTMLAttr(name) %>_rightcol"><%

            int i = 0;
            for (String value : values) {
                %><div id="<%= xssAPI.encodeForHTMLAttr(name) %>_<%=xssAttrWrap(xssAPI, i)%>_wrapper" class="form_rightcol_wrapper"><%
                if (readOnly) {
                    if (value.length() == 0) {
                        // at least display a space otherwise layout may break
                        value = " ";
                    }
                    %><%=xssFilterWrap(xssAPI, new TextFormat().format(value))%><%
                } else {
                    String currentId = i == 0 ? id : id + "-" + i;

                    if (rows == 1) {
                        %><input class="<%=xssAttrWrap(xssAPI, FormsHelper.getCss(properties, "form_field form_field_text" + (multiValued ? " form_field_multivalued" : "" )))%>" <%
                            %>id="<%= xssAPI.encodeForHTMLAttr(currentId) %>" <%
                            %>name="<%= xssAPI.encodeForHTMLAttr(name) %>" <%
                            %>value="<%= xssAPI.encodeForHTMLAttr(value) %>" <%
                            %>size="<%=xssAttrWrap(xssAPI, cols)%>" <%
                            if (width != null) {
                                %>style="width:<%= xssAPI.getValidInteger(width, 100) %>px;" <%
                            }
                            %>onkeydown="<%=xssPass(mrChangeHandler)%>" <%
                            %>onfocus="if(event.target.value == '<%=xssAPI.encodeForJSString(emptyText)%>') event.target.value = '';"<%
                            %>onblur="if(event.target.value == '') event.target.value = '<%=xssAPI.encodeForJSString(emptyText)%>';"><%
                    } else {
                        %><textarea class="<%=xssAttrWrap(xssAPI, FormsHelper.getCss(properties, "form_field form_field_textarea"))%>" <%
                            %>id="<%= xssAPI.encodeForHTMLAttr(currentId) %>" <%
                            %>name="<%= xssAPI.encodeForHTMLAttr(name) %>" <%
                            %>rows="<%=xssAttrWrap(xssAPI, rows)%>" cols="<%=xssAttrWrap(xssAPI, cols)%>" <%
                            if (width != null) {
                                %>style="width:<%= xssAPI.getValidInteger(width, 100) %>px;" <%
                            }
                            %>onkeydown="<%=xssPass(mrChangeHandler)%>" <%
                            %>onfocus="if(event.target.value == '<%=xssAPI.encodeForJSString(emptyText)%>') event.target.value = '';"<%
                            %>onblur="if(event.target.value == '') event.target.value = '<%=xssAPI.encodeForJSString(emptyText)%>';"><%
                            %><%= xssAPI.encodeForHTML(value) %></textarea><%
                    }

                    %>

        <script type="text/javascript">
            function getUrlParam( paramName )
            {
                var oRegex = new RegExp( '[\?&]' + paramName + '=([^&]+)', 'i' ) ;
                var oMatch = oRegex.exec( window.top.location ) ;
                if ( oMatch && oMatch.length > 1 )
                    return decodeURIComponent( oMatch[1].replace(/\+/g, '%20') ) ;
                else
                    return '' ;
            }

            $CQ(document).ready(function () {
                //if found query parameter that matchs this text's name,
                //set it to be the text value
                var presetVal = getUrlParam(escape("<%=xssJSWrap(xssAPI, name)%>"));
                if(presetVal != null && presetVal != ''){
                    document.getElementById("<%=xssJSWrap(xssAPI, currentId)%>").value = presetVal;
                }
            });

        </script><%

                    if (values.length > 1) {
                        %><span class="form_mv_remove" onclick="CQ_form_removeMultivalue('<%= xssAPI.encodeForJSString(name) %>', <%=xssJSWrap(xssAPI, i)%>);<%=xssPass(forceMrChangeHandler)%>">&nbsp;[&ndash;]</span><%
                    }
                    if (i == 0 && multiRes) {
                        %><span class="mr_write"><input type="checkbox" <%
                                                    %>name="<%= xssAPI.encodeForHTMLAttr(mrName) %>" <%
                                                    %>id="<%= xssAPI.encodeForHTMLAttr(mrName) %>" <%
                                                    %>value="true" <%
                                                    if (request.getParameter(mrName) != null) {
                                                        %>checked="checked" <%
                                                    }
                                                    %>></span><%
                    }
                }
                i++;
                %></div><%
            }
        %></div><%
        if (multiValued && !readOnly) {
            %><span class="form_mv_add" onclick="CQ_form_addMultivalue('<%= xssAPI.encodeForJSString(name) %>', <%=xssJSWrap(xssAPI, rows)%>, <%=xssJSWrap(xssAPI, width == null ? "null" : "'" + xssAPI.getValidInteger(width, 100) + "'")%>);<%=xssPass(forceMrChangeHandler)%>">[+]</span><%
        }
    %></div><%

    LayoutHelper.printDescription(FormsHelper.getDescription(resource, ""), out);
    boolean errorPrinted = false;
    for (int j = 0; j < values.length; j++) {
        // constraints (e.g. "number") are checked per field (multiple fields when multi value)
        errorPrinted = LayoutHelper.printErrors(slingRequest, name, out, j);
        if (errorPrinted) break;
    }
    if (!errorPrinted) {
        // check mandatory and single values constraints
        LayoutHelper.printErrors(slingRequest, name, out);
    }
%>
