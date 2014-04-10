/*
 * @author: @hadi_michael
 * @date: April 2014
 */

module.exports = function () {
    'use strict';

    return {
        freq: [
            {
                id: 0,
                label: 'Often',
                rule: {'second': 10},
                selected: false
            },
            {
                id: 1,
                label: 'Hourly',
                rule: {'minute': 0},
                selected: false
            },
            {
                id: 2,
                label: 'Daily',
                rule: {'hour': 8},
                selected: false
            },
            {
                id: 3,
                label: 'Never',
                rule: {},
                selected: false
            },
        ],
        topics: [
            {
                id: 0,
                name: 'Technology',
                provider: 'The Verge',
                url: 'http://ajax.googleapis.com/ajax/services/feed/load?v=2.0&q=http://www.theverge.com/rss/frontpage&num=1',
                selected: true
            }
        ]
    };
};