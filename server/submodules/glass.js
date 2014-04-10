/*
 * @author: @hadi_michael
 * @date: April 2014
 */

module.exports = function (googleapis) {
    'use strict';

    /* @private */
    var performRequest = function (errorCallback, successCallback) {
        googleapis
            .discover('mirror', 'v1')
            .execute(function (err, client) {
                //console.log(client);
                /*** available API of interest ***
                mirror: {
                    ...
                    contacts: {
                        delete: [Function],
                        get: [Function],
                        insert: [Function],
                        list: [Function],
                        patch: [Function],
                        update: [Function]
                    },
                    locations: {
                        get: [Function],
                        list: [Function]
                    },
                    subscriptions: {
                        delete: [Function],
                        insert: [Function],
                        list: [Function],
                        update: [Function]
                    },
                    timeline: {
                        delete: [Function],
                        get: [Function],
                        insert: [Function],
                        list: [Function],
                        patch: [Function],
                        update: [Function],
                        attachments: {
                            delete: [Function],
                            get: [Function],
                            insert: [Function],
                            list: [Function],
                        }
                    }
                    ...
                }
                /*** available API ***/
                if (!!err) {
                    errorCallback(err);
                } else {
                    successCallback(client);
                }
            });
    },

    /* @public */
        insert = function (oauth2Client, timelineObj, errorCallback, successCallback) {
            performRequest(errorCallback, function (client) {
                client
                    .mirror.timeline.insert(timelineObj)
                    .withAuthClient(oauth2Client)
                    .execute(function (err, response) {
                        if (!!err) {
                            errorCallback(err);
                        } else {
                            successCallback(response);
                        }
                    });
            });
        },

    /* @public */
    // send a simple textual news story, a timeline card using an inbuilt delete option
        insertStory = function (oauth2Client, title, errorCallback, successCallback) {
            var timelineObj = {
                'text': title,
                'notification': {},
                'menuItems': [
                    {'action': 'DELETE'}
                ]
            };

            insert(oauth2Client, timelineObj, errorCallback, successCallback);
        },

    /* @public */
    // insert a location, that a user can delete, navigate or reply to
        insertLocation = function (oauth2Client, errorCallback, successCallback) {
            var timelineObj = {
                'text': 'I\'ll see you at decompress!',
                'callbackUrl': 'http://my.herokuapp.com/path/to/reply',
                'location': {
                    'kind': 'mirror#location',
                    'latitude': -37.799445,
                    'longitude': 144.963182,
                    'displayName': 'Melbourne University',
                    'address': '1888 Bldg Swanston St, Parkville VIC 3010'
                },
                'menuItems': [
                    {'action':'NAVIGATE'},
                    {'action': 'REPLY'},
                    {'action': 'DELETE'}
                ]
            };

            insert(oauth2Client, timelineObj, errorCallback, successCallback);
        },

    /* @public */
    // insert a contact
        insertContact = function (oauth2Client, errorCallback, successCallback) {
            var timelineObj = {
                'id': 'hadimichael',
                'displayName': 'Hadi Michael',
                'iconUrl': 'http://www.gravatar.com/avatar/40e2f5b90004bd7e913ae67a7180a9e4.png',
                'priority': 7,
                'acceptCommands': [
                    {'type': 'REPLY'},
                    {'type': 'POST_AN_UPDATE'},
                    {'type': 'TAKE_A_NOTE'}
                ]
            };

            insert(oauth2Client, timelineObj, errorCallback, successCallback);
        };

    return {
        insert: insert,
        insertStory: insertStory,
        insertLocation: insertLocation,
        insertContact: insertContact
    };
};