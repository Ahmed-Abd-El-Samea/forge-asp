﻿/////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Forge Partner Development
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////

$(document).ready(function () {
    //prepareLists();

    //$('#clearAccount').click(clearAccount);
    //$('#defineActivityShow').click(defineActivityModal);
    //$('#createAppBundleActivity').click(createAppBundleActivity);
    //$('#startWorkitem').click(startWorkitem);

    startConnection();

    

    document.addEventListener('keydown', logKey);
    //console.log("HWHAAT!");
    getAllData();

});

function getAllData() {
    jQuery.ajax({
        url: 'api/forge/appdata/all',
        method: 'GET',
        //dataType: "json",
        //multiple: false,
        //data: function () {
        //    return { "style": "FarmHouse" };
        //},
        success: function (result) {

            //console.log(Object.keys(result[0]));
            var i = 1;
            var styles = Object.keys(result[0]);
            styles.splice(0, 1);
            $('#popularityList').empty();
            styles.forEach(function (item) {
                // img source should be the same as the text of the model
                // onClick here will load the corresponding 3d model
                if (i <= 9) {
                    $('#popularityList').append(`<div id="${item}" class="col-sm-4 inner-img" data-toggle="tooltip" data-placement="right" title="${item}">
                    <img class="img-responsive" src ="images/facades/${i}.jpg" alt ="${item}" />
                                    </div >`);
                    i++;
                }
            });
            
        }
    });
}

function logKey(e) {
    if (e.code == 'KeyA') {
        console.log("Clicked!");
        getAllData();
    }
}

function prepareLists() {
    list('activity', '/api/forge/designautomation/activities');
    list('engines', '/api/forge/designautomation/engines');
    list('localBundles', '/api/appbundles');
}

function list(control, endpoint) {
    $('#' + control).find('option').remove().end();
    jQuery.ajax({
        url: endpoint,
        success: function (list) {
            if (list.length === 0)
                $('#' + control).append($('<option>', { disabled: true, text: 'Nothing found' }));
            else
                list.forEach(function (item) { $('#' + control).append($('<option>', { value: item, text: item })); })
        }
    });
}


function fillCount( result ) {

    for (var elem in result) {
        if (elem === 'total')
            continue;
        $('#' + elem)[0].innerText = result[elem];
    }
}

function clearAccount() {
    if (!confirm('Clear existing activities & appbundles before start. ' +
        'This is useful if you believe there are wrong settings on your account.' +
        '\n\nYou cannot undo this operation. Proceed?')) return;

    jQuery.ajax({
        url: 'api/forge/designautomation/account',
        method: 'DELETE',
        success: function () {
            prepareLists();
            writeLog('Account cleared, all appbundles & activities deleted');
        }
    });
}

function defineActivityModal() {
    $("#defineActivityModal").modal();
}

function createAppBundleActivity() {
    startConnection(function () {
        writeLog("Defining appbundle and activity for " + $('#engines').val());
        $("#defineActivityModal").modal('toggle');
        createAppBundle(function () {
            createActivity(function () {
                prepareLists();
            })
        });
    });
}

function createAppBundle(cb) {
    jQuery.ajax({
        url: 'api/forge/designautomation/appbundles',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            zipFileName: $('#localBundles').val(),
            engine: $('#engines').val()
        }),
        success: function (res) {
            writeLog('AppBundle: ' + res.appBundle + ', v' + res.version);
            if (cb) cb();
        }
    });
}

function createActivity(cb) {
    jQuery.ajax({
        url: 'api/forge/designautomation/activities',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            zipFileName: $('#localBundles').val(),
            engine: $('#engines').val()
        }),
        success: function (res) {
            writeLog('Activity: ' + res.activity);
            if (cb) cb();
        }
    });
}


function startWorkitem() {
    let sourceNode = $('#appBuckets').jstree(true).get_selected(true)[0];
    // use == here because sourceNode may be undefined or null
    if (sourceNode == null || sourceNode.type !== 'object' ) {
        alert('Can not get the selected file, please make sure you select a file as input');
        return;
    }

    let activityId = $('#activity').val();
    if (activityId == null) { alert('Please select an activity'); return };

    if (activityId.toLowerCase() === "countitactivity+dev"
        || activityId.toLowerCase() === "deleteelementsactivity+dev" ) {
        startConnection(function () {
            var formData = new FormData();
            formData.append('objectId', sourceNode.text);
            formData.append('bucketId', sourceNode.parent);
            formData.append('activityId', activityId);
            formData.append('browerConnectionId', connectionId);
            formData.append('data', JSON.stringify({
                //walls: $('#selectWalls')[0].checked,
                //floors: $('#selectFloors')[0].checked,
                //doors: $('#selectDoors')[0].checked,
                //windows: $('#selectWindows')[0].checked
                //console.log($('#Facade-Style').val());
                //console.log($('#Exterior-Material').val());
                //console.log($('#Material-Color').val());
                //console.log($('#Roofing-Material').val());
                //console.log($('#Fenestration').val());
                //console.log($('#Column-Style').val());
                extMaterials: $('#Exterior-Material').val(),
                materialColor: $('#Material-Color').val(),
                roofMaterial: $('#Roofing-Material').val(),
                fenestrationTrim: $('#Fenestration').val(),
                columnStyle: $('#Column-Style').val()
            }));
            writeLog('Start checking input file...');
            $.ajax({
                url: 'api/forge/designautomation/startworkitem',
                data: formData,
                processData: false,
                contentType: false,
                type: 'POST',
                success: function (res) {
                    writeLog('Workitem started: ' + res.workItemId);
                }
            });
        });

    }
}

function writeLog(text) {
    console.log(text);
    //$('#outputlog').append('<div style="border-top: 1px dashed #C0C0C0">' + text + '</div>');
    //var elem = document.getElementById('outputlog');
    //elem.scrollTop = elem.scrollHeight;
}

var connection;
var connectionId;

function startConnection(onReady) {
    if (connection && connection.connectionState) { if (onReady) onReady(); return; }
    connection = new signalR.HubConnectionBuilder().withUrl("/api/signalr/forgecommunication").build();
    connection.start()
        .then(function () {
            connection.invoke('getConnectionId')
                .then(function (id) {
                    connectionId = id; // we'll need this...
                    if (onReady) onReady();
                });
        });

    connection.on("downloadResult", function (url) {
        writeLog('<a href="' + url + '">Download result file here</a>');
    });

    connection.on("countItResult", function (result) {
        //fillCount(JSON.parse(result));
        writeLog(result);
    });
    connection.on("onComplete", function (message) {
        writeLog(message);
        let instance = $('#appBuckets').jstree(true);
        selectNode = instance.get_selected(true)[0];
        parentNode = instance.get_parent(selectNode);
        instance.refresh_node(parentNode);
    });
    connection.on("extractionFinished", function (data) {
        launchViewer(data.resourceUrn);
    });

}
