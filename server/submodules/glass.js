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
                if (!!err) {
                    errorCallback(err);
                } else {
                    successCallback(client);
                }
            });
    },

    /* @private */
    // send a simple textual news story, a timeline card using an inbuilt delete option
        insertStory = function (oauth2Client, title, errorCallback, successCallback) {
            console.log('Inserting story: ', title);
            performRequest(errorCallback, function (client) {
                client
                    .mirror.timeline.insert(
                        {
                            'text': title,
                            'notification': {},
                            'menuItems': [
                                {'action': 'DELETE'}
                            ]
                        }
                    )
                    .withAuthClient(oauth2Client)
                    .execute(function (err, response) {
                        if (!!err) {
                            errorCallback(err);
                        } else {
                            successCallback(response);
                        }
                    });
            });
        };

    return {
        insertStory: insertStory
    };
};