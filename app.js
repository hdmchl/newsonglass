/*
 * @author: @hadi_michael
 * @date: April 2014
 */

/* include and setup required packages */
var appName         = 'NewsOnGlass',
    express         = require('express'),
    app             = express(),
    http            = require('http'),
    server          = http.createServer(app),
    googleapis      = require('googleapis'),
    OAuth2Client    = googleapis.OAuth2Client,
    app_creds       = require('./server/app_credentials'); //see app_credentials__template.js

/***** HANDLE Uncaught Exceptions *****/
process.on('uncaughtException', function(err) {
    console.error(err.stack);
});
/***** /HANDLE Uncaught Exceptions *****/

/***** SETUP AND START SERVER *****/
// configure the server
app.configure(function(){
    app.use(express.bodyParser());
    app.use(express.static(__dirname + '/public'));
    app.use(express.errorHandler({
        dumpExceptions: true,
        showStack: true
    }));
});

// start the server
try {
    app.set('port', 8081);
    server.listen(app.get('port'));
    console.log('Server is listening on port: ' + app.get('port'));
} catch (err) {
    console.error('Server didn\'t start: \n' + err);
}
/***** /SETUP AND START SERVER *****/