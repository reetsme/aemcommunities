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

--%><%
%><%@page session="false" import="java.text.SimpleDateFormat,
                    java.util.Locale,
                    java.util.ResourceBundle,
                    org.apache.commons.lang3.ArrayUtils,
                    org.apache.commons.lang3.StringEscapeUtils,
                    org.apache.commons.lang3.StringUtils,
                    org.apache.sling.api.request.RequestParameter,
                    org.apache.jackrabbit.api.JackrabbitSession,
                    org.apache.jackrabbit.api.security.user.UserManager,
                    org.apache.jackrabbit.api.security.user.Authorizable,
                    org.apache.jackrabbit.api.security.user.User,
                    com.adobe.cq.social.commons.CollabUser,
                    com.adobe.cq.social.commons.CollabUtil,
                    com.adobe.cq.social.commons.Comment,
                    com.adobe.cq.social.commons.CommentSystem,
                    com.adobe.cq.social.commons.SaferSlingPostValidator,
                    com.adobe.cq.social.ugcbase.SocialUtils,
                    com.adobe.granite.security.user.UserProperties,
                    com.adobe.granite.xss.XSSFilter,
                    com.day.cq.commons.Externalizer,
                    com.day.cq.commons.date.RelativeTimeFormat,
                    com.day.cq.commons.jcr.JcrUtil,
                    com.day.cq.i18n.I18n,
                    com.day.cq.wcm.api.WCMMode"%><%
%><%@include file="/libs/foundation/global.jsp"%><%
%><%@include file="/libs/social/security/social-security.jsp"%><%
    if(currentPage == null || currentPage.getPath().contains(CommentSystem.PATH_UGC)) {
        final Comment comment = resource.adaptTo(Comment.class);
        if(null != comment) {
            currentPage = pageManager.getContainingPage(resourceResolver.getResource(comment.getCommentSystem().getPath()));
        }
    }


    final Locale pageLocale = currentPage.getLanguage(false);
    final ResourceBundle resourceBundle = slingRequest.getResourceBundle(pageLocale);
    final I18n i18n = new I18n(slingRequest);
    final SimpleDateFormat localizedDateFormatter = new SimpleDateFormat(i18n.get("EEE MMM dd hh:mm:ss z yyyy","Java date format, full elaborate date"), pageLocale);
    final SaferSlingPostValidator slingPostValidator =
            sling.getService(SaferSlingPostValidator.class);
    final Externalizer externalizer = sling.getService(Externalizer.class);
    final String defaultAvatar = externalizer.absoluteLink(slingRequest,
                                                           slingRequest.getScheme(),
                                                           CollabUtil.DEFAULT_AVATAR);
    final RelativeTimeFormat fmt = new RelativeTimeFormat("r", resourceBundle);
    final WCMMode wcmMode = WCMMode.fromRequest(slingRequest);
    final String absoluteDefaultAvatar = externalizer.absoluteLink(slingRequest, slingRequest.getScheme(), CollabUtil.DEFAULT_AVATAR);
    final RequestParameter fromParam = slingRequest.getRequestParameter("from");
    final RequestParameter countParam = slingRequest.getRequestParameter("count");
    final Boolean isPageRequest = (null != fromParam);
    final String localURL = externalizer.externalLink(slingRequest.getResourceResolver(), (wcmMode == WCMMode.DISABLED)?Externalizer.PUBLISH:Externalizer.AUTHOR,"");
    Boolean isCORS = false;
    if(!(StringUtils.isEmpty(request.getHeader("Origin"))) && !(localURL.equals(request.getHeader("Origin")))){
        isCORS = true;
        response.setHeader("Access-Control-Allow-Credentials", "true");
        response.setHeader("Access-Control-Allow-Origin", request.getHeader("Origin"));
        response.setHeader("Access-Control-Allow-Headers", "CONTENT-TYPE, LOCATION, *");
    }
    // Sometimes this can be run even when including JSON endpoints, so we need to be cautious about writing this out.
    if (wcmMode == WCMMode.EDIT && "html".equals(slingRequest.getRequestPathInfo().getExtension())) {
        %><cq:includeClientLib categories="cq.social.author" /><%
    }

    String resourceAuthorName = null;
    String resourceAuthorID = null;
    String resourceAuthorAvatar = null;
    String resourceAuthorPath = null;
    boolean resourceAuthorIsAnonymous = true;
    final SocialUtils socialUtils = resourceResolver.adaptTo(SocialUtils.class);
    if (resource.adaptTo(Comment.class) != null) {
        final Comment comment = resource.adaptTo(Comment.class);
        final CollabUser author = resource.adaptTo(Comment.class).getAuthor();
        final ValueMap map = resource.adaptTo(ValueMap.class);
        resourceAuthorID = map.get("userIdentifier", String.class);
        UserProperties userProperties = null;
        if (socialUtils != null) {
            userProperties = socialUtils.getUserProperties(resourceResolver,
                resourceAuthorID);
            if(userProperties != null){
                resourceAuthorName = userProperties.getDisplayName();
                if(StringUtils.isBlank(resourceAuthorName)){
                    resourceAuthorName = resourceAuthorID;
                }
                resourceAuthorPath = userProperties.getNode().getPath();
                //TODO: use a centralized place to determine anonymous, to avoid hardcoded "anonymous",
                //cannot use it yet due to soco jspc config issues with snapshot dependencies :(
                //resourceAuthorIsAnonymous = UserPropertiesUtil.isAnonymous(userProperties);
                resourceAuthorIsAnonymous = resourceAuthorID.equals("anonymous");
            }
            else{
                resourceAuthorName = author.getName();
            }
        } else {
            resourceAuthorName = author.getName();
        }
        resourceAuthorAvatar = CollabUtil.getAvatar(userProperties, author.getEmail(), absoluteDefaultAvatar);

    }
    final String loggedInUserID = slingRequest.getResourceResolver().getUserID();
    final UserProperties loggedInUserProperties = socialUtils == null ? null: socialUtils.getUserProperties(resourceResolver, loggedInUserID);
    final String loggedInUserName = (loggedInUserProperties == null) ? null : (loggedInUserProperties.getDisplayName() == null)? loggedInUserID : loggedInUserProperties.getDisplayName();
    final Boolean isAnonymous = slingRequest.getAuthType() == null || slingRequest.getRemoteUser() == null;
    final UserManager localUserManager = (isAnonymous ? null : slingRequest.getResourceResolver().adaptTo(UserManager.class));
    final Authorizable localAuthorizable = (localUserManager == null ? null : localUserManager.getAuthorizable(slingRequest.getRemoteUser()));
    final Boolean isAdmin = (localAuthorizable instanceof User) && ((User)localAuthorizable).isAdmin();
    String socialProfilePage;
    if (request.getAttribute(CollabUtil.REQ_ATTR_SOCIAL_PROFILE_PAGE) != null) {
        // legacy method: deprecated in 5.6.1
        socialProfilePage = (String)request.getAttribute(CollabUtil.REQ_ATTR_SOCIAL_PROFILE_PAGE);
    } else {
        socialProfilePage = WCMUtils.getInheritedProperty(currentPage, resourceResolver, "cq:socialProfilePage");
    }
    final String socialProfileUrl = socialProfilePage != null && resourceAuthorPath != null && !resourceAuthorIsAnonymous ? resourceAuthorPath  + ".form.html" + socialProfilePage : "##";
%>
