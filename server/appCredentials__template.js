/*
 * @author: @hadi_michael
 * @date: April 2014
 */

//TODO: 1. Define a session secret
//      2. Plug in your Google API credentials: client id, client secret, redirect url
//      3. Rename this file to: appCredentials.js

exports.get = function () {
    var sessionParams = {
        secret: 'YOUR_SESSION_SECRET', //session secret
        cookie: {
            secure: false, //set this to 'true' if you are using HTTPS
            maxAge: 60000
        }
    };

    var OAuth2 = {
        CLIENT_ID: 'YOUR_CLIENT_ID', // TODO: YOUR CLIENT ID AS A STRING */
        CLIENT_SECRET: 'YOUR_CLIENT_SECRET', // TODO: YOUR CLIENT SECRET AS A STRING */
        REDIRECT_URL: 'YOUR_REDIRECT_URL' // TODO: YOUR REDIRECT URL AS A STRING */
    };

    return {
        OAuth2: OAuth2,
        sessionParams: sessionParams
    };
}