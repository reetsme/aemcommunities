/*
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2013 Adobe Systems Incorporated
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
CQ.Communities.Analytics = CQ.Communities.Analytics || {};
CQ.Communities.Analytics.VHL = CQ.Communities.Analytics.VHL || {};
CQ.Communities.Analytics.VHL.Configuration = CQ.Communities.Analytics
    .VHL.Configuration || {};

(function(SCF, Configuration) {
    "use strict";

    var VIDEO_TRACKING_INTERVAL_MILLISECONDS = 10000;

    function analyticsInitializeVideoHeartbeat(params) {
        Configuration.VISITOR_API.MARKETING_CLOUD_ORG_ID =
            params.macOrgId;
        Configuration.VISITOR_API.NAMESPACE = window.s.visitorNamespace;
        Configuration.VISITOR_API.TRACKING_SERVER = window.s.trackingServer;

        /*
         * We need to use a jshint directive here in order to assign the non-camelcase CQ variable to a variable with
         * a jshint compliant name. This should otherwise never be done.
         */

        /* jscs:disable requireCamelCaseOrUpperCaseIdentifiers */
        Configuration.APP_MEASUREMENT.RSID = window.s_account;

        /*
         * Make sure jshint catches any non-camelcase variables for the remainder of the code in this file.
         */

        /* jscs:enable requireCamelCaseOrUpperCaseIdentifiers */

        Configuration.APP_MEASUREMENT.TRACKING_SERVER =
            window.s.trackingServer;

        var visitor = new CQ.Communities.Analytics.VHL.Visitor(
            Configuration.VISITOR_API.MARKETING_CLOUD_ORG_ID,
            Configuration.VISITOR_API.NAMESPACE);
        visitor.trackingServer = Configuration.VISITOR_API.TRACKING_SERVER;

        var appMeasurement = CQ.Communities.Analytics.VHL.appMeasurement;
        appMeasurement.visitor = visitor;
        appMeasurement.visitorNamespace = Configuration.VISITOR_API
            .NAMESPACE;
        appMeasurement.trackingServer = Configuration.APP_MEASUREMENT
            .TRACKING_SERVER;
        appMeasurement.account = Configuration.APP_MEASUREMENT
            .RSID;

        // Set the resource path as the id by which video will be identified in Analytics
        Configuration.PLAYER.VIDEO_ID = params.resourcePath;

        // Create the VideoPlayer.
        var videoPlayer = new CQ.Communities.Analytics.VHL.VideoPlayer(
            "scf-asset-element");

        // Create the Analytics provider
        CQ.Communities.Analytics.VHL.analyticsProvider = new CQ
            .Communities.Analytics.VHL.VideoAnalyticsProvider(
                appMeasurement, videoPlayer);
    }

    function durationLoaded(event) {
        var that = event.data.that;
        var video = that.$el.find("#scf-asset-element")[0];
        that.model.duration = video.duration;
        that.model.trackingInit();
    }

    function handlePlay(event) {
        var that = event.data.that;
        if (that.model.trackingActive) {
            var video = that.$el.find("#scf-asset-element")[0];
            that.model.trackingSaveProgress(video.played,
                video.currentTime, video.duration);
            that.model.trackingTimer = window.setInterval(
                function() {
                    that.model.trackingSaveProgress(video
                        .played, video.currentTime,
                        video.duration);
                }, VIDEO_TRACKING_INTERVAL_MILLISECONDS);
            that.model.trackingCounter = -1;
            that.model.trackingOffset = -1;
        }
    }

    function handlePause(event) {
        var that = event.data.that;
        if (that.model.trackingActive) {
            var video = that.$el.find("#scf-asset-element")[0];
            window.clearInterval(that.model.trackingTimer);
            that.model.trackingSaveProgress(video.played,
                video.currentTime, video.duration);
        }
    }

    function handleSeekStart(event) {
        var that = event.data.that;
        if (that.model.trackingActive) {
            that.model.trackingOffset = -1;
            // while seeking, set counter to 1 in order to ignore any 'timeupdate' events
            if (that.model.trackingCounter === -1) {
                that.model.trackingCounter = 1;
                window.clearInterval(that.model.trackingTimer);
            }
        }
    }

    function handleSeekEnd(event) {
        var that = event.data.that;
        if (that.model.trackingActive) {
            if (that.model.trackingCounter === 1) {
                // once we hit a 'seeked' event that follows a 'seeking' event, set counter
                // to 0 in order to act on next 'timeupdate' event
                that.model.trackingCounter = 0;
            }
        }
    }

    function handleTimeUpdate(event) {
        var that = event.data.that;
        if (that.model.trackingActive) {
            var video = that.$el.find("#scf-asset-element")[0];
            if (that.model.trackingCounter === 0) {
                that.model.trackingOffset = video.currentTime;
                // take note of the time when the first 'timeupdate' event occurs after a seek
                // complete
                that.model.trackingCounter = -1;
            } else if (that.model.trackingOffset !== -1) {
                if (video.currentTime - that.model.trackingOffset >=
                    1) {
                    // if the time elapsed since the last 'timeupdate' event (after seek complete)
                    // is greater than or equal to 1 second and the video is not currently paused we
                    // want to send a tracking event to the server and reset the tracking timer
                    that.model.trackingOffset = -1;
                    if (!video.paused) {
                        that.model.trackingSaveProgress(video
                            .played, video.currentTime,
                            video.duration);
                        that.model.trackingTimer = window.setInterval(
                            function() {
                                that.model.trackingSaveProgress(
                                    video.played,
                                    video.currentTime,
                                    video.duration);
                            }, VIDEO_TRACKING_INTERVAL_MILLISECONDS);
                    }
                }
            }
        }
    }

    function handleComplete(event) {
        var that = event.data.that;
        if (that.model.trackingActive) {
            var video = that.$el.find("#scf-asset-element")[0];
            window.clearInterval(that.model.trackingTimer);
            that.model.trackingSaveProgress(video.played,
                video.currentTime, video.duration);
        }
    }

    var VideoResource = SCF.ResourcePlayer
        .extend({
            modelName: "VideoResourceModel",
            trackingInit: function() {
                this.trackingActive = true;
                /*
                 * When beginning a new video session, initialize the BitArray object for tracking to be the
                 * size of the video in seconds and set each entry to 0.
                 */
                this.courseProgress = new CQ.Communities
                    .Enablement.Utils.BitArray(
                        Math.floor(this.duration),
                        0);

                /*
                 * If the user hasn't watched any of the video yet, there's no state that we have to restore
                 * for video tracking so we don't need to do anything else.
                 */

                if (Number(this.get("userReport").videoProgress) !== 0) {

                    /*
                     * If the user has watched any amount of the video, we need to restore the state of the
                     * BitArray object to whatever it was at the end of the last video session for this user
                     * (as represented by what we got from the DB) in order to maintain cumulative tracking
                     * across all video sessions.
                     */

                    var arr = JSON.parse(this.get("userReport").videoState);
                    var segment;

                    /*
                     * Loop over the collection of [a,b] tuples we got back from the DB in order to add them
                     * to the BitArray object (courseProgress) that is maintaining the cumulative segments of
                     * the video that have been watched across video sessions for the logged in user
                     */

                    for (var i = 0; i < arr.length; i++) {
                        segment = arr[i];
                        var start = segment[0]; // 'a' = second the viewed segment began
                        var end = segment[1]; // 'b' = second the viewed segment ended
                        for (var j = start; j <=
                            end; j++) {
                            /*
                             * It's possible the viewed segment began and ended in the same segment, in which
                             * case we want to track the second as watched only because our logic when we took
                             * the floor and ceiling to calculate 'a' and 'b' is already discrediting
                             * partially watched seconds. For example, if a user watched from 1.5 to 1.8, a =
                             * 2 (ceiling of 1.5) and b = 1 (floor of 1.8), in which case the loop that turns
                             * bits on would never even begin since 'start' is greater than 'end'.
                             */
                            this.courseProgress
                                .turnOn(j);
                        }
                    }

                    this.trigger("video:updateResumePosition");
                }
            },
            trackingSaveProgress: function(segments,
                currentTime, duration) {
                /*
                 * The 'segments' parameter are the TimeRanges objects that the HTML5 video player provides as an
                 * array of one or more non-overlapping segments that the user has watched in the current video
                 * session for the logged in user
                 */

                // courseProgress is initialized when we receive progress data back from server
                if (this.courseProgress !== null) {
                    /*
                     * Loop over the collection of TimeRanges objects in order to add it to the BitArray object
                     * (courseProgress) that is maintaining the cumulative segments of the video that have been
                     * watched across video sessions for the logged in user
                     */
                    for (var i = 0; i < segments.length; i++) {

                        // Take the ceiling of the segment 'start' to make sure we ignore a partially watched
                        // second
                        var start = Math.ceil(segments.start(
                            i));

                        // Take the floor of the segment 'end' to make sure we ignore a partially watched second
                        var end = Math.floor(segments.end(
                            i));

                        for (var j = start; j < end; j++) {
                            /*
                             * For each full second that has been watched, turn the corresponding bit (second =
                             * index into the BitArray) on.
                             */
                            this.courseProgress.turnOn(j);
                        }
                    }

                    /*
                     * Get the cumulative ranges of segments that have been watched across video sessions for the
                     * logged in user in the form of a collection of [a,b] tuples where 'a' is the second the
                     * viewed segment began and 'b' is the second the viewed segment ended. Convert this to a
                     * string for storing in the DB.
                     */
                    var state = JSON.stringify(this.courseProgress
                        .getRanges());

                    // split window URL on extension resulting in two halves, second of which is suffix
                    var arr = CQ.shared.HTTP.getPath().split(
                        CQ.shared.HTTP.getExtension()
                    );
                    var suffix = arr[1];

                    var params = {};
                    params[":operation"] = "social:reportEnablementResourceModel";
                    params.state = state;
                    params.resume = (Math.floor(
                            currentTime) >= Math.floor(
                            duration) ? 0 : Math
                        .floor(currentTime) * 1000);
                    $.ajax({
                        url: SCF.config.urlRoot + suffix,
                        type: "POST",
                        data: params
                    });
                }
            },
            setResourceCompleted: function() {
                /*
                 * Override base class implementation and no-op.
                 * Status update will be handled when we save
                 * video progress
                 */
            },
            setResourceInProgress: function() {
                /*
                 * Override base class implementation and no-op.
                 * Status update will be handled when we save
                 * video progress
                 */
            }

        });
    var VideoResourceView = SCF.ResourcePlayerView.extend({
        viewName: "VideoResource",
        className: "video-asset",
        init: function() {
            SCF.ResourcePlayerView.prototype.init.apply(
                this);

            this.listenTo(this.model,
                "video:updateResumePosition",
                this.updateResumePosition);

            if (!_.isUndefined(window.s) && !_.isEmpty(this.model.get("marketingCloudOrgId"))) {
                /*
                 * If the 's' variable is undefined then the analytics component/framework has not been correctly
                 * configured and/or associated with the site and thus we don't want to instantiate video heartbeat
                 * because it won't work. We should also only instantiate video heartbeat if a MAC org id value has
                 * been specified in the site console otherwise it throws a JS exception that messes up the rest of
                 * the functionality on the page.
                 */
                var obj = {};
                obj.macOrgId = this.model.get("marketingCloudOrgId");
                obj.resourcePath = this.model.get("id");

                analyticsInitializeVideoHeartbeat(obj);
            }

            var video = this.$el.find(
                "#scf-asset-element")[0];
            $(video).on("play", null, {
                that: this
            }, handlePlay);
            $(video).on("pause", null, {
                that: this
            }, handlePause);
            $(video).on("seeking", null, {
                that: this
            }, handleSeekStart);
            $(video).on("seeked", null, {
                that: this
            }, handleSeekEnd);
            $(video).on("timeupdate", null, {
                that: this
            }, handleTimeUpdate);
            $(video).on("ended", null, {
                that: this
            }, handleComplete);

            if (isNaN(video.duration)) {
                /*
                 * Video meta data not yet loaded, so we need to wait until it's available to do so.
                 */
                $(video).on("loadedmetadata", null, {
                    that: this
                }, durationLoaded);

            } else {
                /*
                 * We can initialize the tracking immediately since we already have the duration.
                 */
                this.model.duration = video.duration;
                this.model.trackingInit();
            }
        },
        playAsset: function() {
            this.$el.find("#scf-asset-element")[0].play();
        },
        updateResumePosition: function() {
            var video = this.$el.find(
                "#scf-asset-element")[0];

            /*
             * Initialize the current video time to whatever resume position the user left off at in the last video
             * session.
             */
            video.currentTime = Number(this.model.get("userReport").videoResumePosition) /
                1000;
        }
    });

    SCF.VideoResource = VideoResource;
    SCF.VideoResourceView = VideoResourceView;
    SCF.registerComponent(
        "social/enablement/components/hbs/view/resource/detail/resourceplayer",
        SCF.VideoResource,
        SCF.VideoResourceView);

})(SCF, CQ.Communities.Analytics.VHL.Configuration);
