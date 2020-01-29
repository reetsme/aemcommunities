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

  Image Upload JSP

--%><%
%>
<%@ page session="false"%>
<%@include file="/libs/granite/ui/global.jsp" %><%

/**
 * FileUpload creates a file upload widget.
 *
 * Warning: The author SHOULD NOT depends on the details of underlying implementation. The output markup MAY change.
 *
 * @component
 * @name ImageUpload
 * @location /libs/granite/ui/components/foundation/form/imageupload
 *
 */

%>

<script>
    function previewImage() {
        var _fr = new FileReader();
        var _image = new Image();

        _fr.readAsDataURL($("#imgUploadImage").get(0).files[0]);

        _fr.onload = function (e) {
            var _targRes = e.target.result;
            $("#imgUploadPreview").attr("src", _targRes);
            _image.src = _targRes;
            _image.onload = function(evt){
                $("#pImgUploadPreviewFdim").text(this.width + " x " + this.height);

                $('#divImageUpload').hide();
                $('#divImagePreview').show();
                $('#divChangeBranding').show();
                $('#divInfoOverlay').show();
        
                var _filename = $('#imgUploadImage').val().replace(/^.*\\/, "");
                $('#pImgUploadPreviewFname').text(_filename);
        
                var _div = $("#divImagePreview").height();
                var _overlayH = $('#divInfoOverlay').height();
                var _offset = (_div/2) - (_overlayH/2);
        
                if(_offset>0){
                    $('#divInfoOverlay').css("margin-top", _offset+"px");
                }
            };
        };
    };

    function openFileDialog(){
        $('#imgUploadImage').click();

    }
</script>

<style>
    #divInfoOverlay{
        display:none;
        z-index:9001;
        opacity:0.8;
        position:absolute;
        margin-top:30px;
        background-color:#ffffff;
        height:70px;
        width: 234px;
        margin-left:-8px;
        border: 1px solid #e2e2e2;
    }
    #divImagePreview{
        display:none;
        z-index:9000;
    }
    #divChangeBranding{
        display:none;
        margin-bottom:10px;
        margin-top:8px;
    }
    #pImgUploadPreviewFname{
        font-weight:bold;
    }
    .truncFname {
        width: 220px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    #divChangeBranding:hover{
        cursor:pointer;
    }
</style>

<div style="padding-left:20px;">
    <h3>Community Site Branding</h3>
    <article>
        <table class="coral-Table--bordered" style="width:220px;">
            <thead>
                <tr class="coral-Table-row">
                    <th class="coral-Table-headerCell">
                        <h4>Site Header Image</h4>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr class="coral-Table-row">
                    <td class="coral-Table-cell" style="text-align:center;padding:0px;">
                        <div id="divImageUpload" style="height:140px;padding-top:40px;">    
                        <span class="coral-FileUpload" data-init="fileupload">
                            <span class="coral-FileUpload-trigger coral-Button coral-Button--secondary coral-Button--quiet" style="height:auto;">
                        <i class="coral-Icon coral-Icon--sizeL coral-Icon--image">
                            <input id="imgUploadImage" class="coral-FileUpload-input" name="file" data-upload-url="dummy" data-file-name-parameter="fileName" type="file" onchange="previewImage();">
                        </i>
                        </span>
                        </span>
                        <p class="type">Add an image</p>
                    </div>
                    <div id="divInfoOverlay">
                        <p id="pImgUploadPreviewFname" class="truncFname"></p>
                        <p id="pImgUploadPreviewFdim"></p>
                    </div>    
                    <div id="divImagePreview"> 
                        <img id="imgUploadPreview" style="width: 220px; height: auto;"/>

                    </div>
                        <div id="divChangeBranding" onclick="openFileDialog();">
                            <i class="coral-Icon coral-Icon--sizeS coral-Icon--add"></i>
                            <span style="margin-left:4px;display:block-inline;">Change branding</span>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </article>
</div>
<%

%>
