/*
 * @author: @hadi_michael
 * @date: April 2014
 */

module.exports = (function () {
    'use strict';

    var sessionParams = {
        secret: process.env.SESSION_SECRET,
        cookie: {
            secure: false, // only set this to 'true' if you are using HTTPS
            maxAge: 60000
        }
    };

    var OAuth2 = {
        CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
        REDIRECT_URL: process.env.GOOGLE_REDIRECT_URL
    };

    return {
        OAuth2: OAuth2,
        sessionParams: sessionParams
    };
}());