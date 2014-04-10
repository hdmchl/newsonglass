/*
 * @author: @hadi_michael
 * @date: April 2014
 */

module.exports = function (http, glass, oauth2Client) {
    'use strict';

    /* @private */
    var schedule = require('node-schedule'); //docs: https://github.com/mattpat/node-schedule

    /* @public */
    var scheduleNewsWithPrefs = function (prefs, errorCallback, successCallback) {
        var freq, topic;

        //get frequency rule
        for (var i in prefs.freq) {
            if (prefs.freq[i].selected){
                freq = prefs.freq[i];
            }
        }

        //get topic url
        for (var j in prefs.topics) {
            if (prefs.topics[j].selected){
                topic = prefs.topics[j];
            }
        }

        if (!freq.rule || !topic.name) {
            errorCallback('freq or topic is undefined');
            return;
        }

        console.log('Creating scheduled job for ' + topic.name + ', with rule: ', freq.rule);

        schedule.scheduleJob(freq.rule, function() {
            http.get(topic.url, function(res) {
                var response = '';
                res.on('data', function (chunk) {
                    //a chunk of data has been recieved, so append it to 'response'
                    response += chunk;
                });
                res.on('end', function () {
                    //the whole response has been recieved
                    try {
                        response = JSON.parse(response);
                        var storyTitle = response.responseData.feed.entries[0].title;
                        glass.insertStory(oauth2Client, storyTitle, errorCallback, function(response) {
                            console.log('Inserted story:\n', response);
                        });
                    } catch (err) {
                        errorCallback(err);
                    }
                });
            }).on('error', function(err) {
                errorCallback(err);
            });
        });

        successCallback();
    };

    return {
        scheduleNewsWithPrefs: scheduleNewsWithPrefs
    };
};