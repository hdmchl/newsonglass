/*
 * @author: @hadi_michael
 * @date: April 2014
 */

module.exports = (function () {
    'use strict';

    var sessionParams = {
        secret: process.ENV.SESSION_SECRET,
        cookie: {
            secure: false, // only set this to 'true' if you are using HTTPS
            maxAge: 60000
        }
    };

    var OAuth2 = {
        CLIENT_ID: process.ENV.GOOGLE_CLIENT_ID,
        CLIENT_SECRET: process.ENV.GOOGLE_CLIENT_SECRET,
        REDIRECT_URL: process.ENV.GOOGLE_REDIRECT_URL
    };

    return {
        OAuth2: OAuth2,
        sessionParams: sessionParams
    };
}());