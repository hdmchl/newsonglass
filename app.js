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
    appCreds        = require('./server/appCredentials'), //see appCredentials__template.js
    schedule        = require('node-schedule');

if (typeof localStorage === 'undefined' || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
    /* localStorage API: https://www.npmjs.org/package/node-localstorage
        length
        setItem(key, value)
        getItem(key)
        removeItem(key)
        key(n)
        clear()
    */
    localStorage.clear();
}

/***** HANDLE Uncaught Exceptions *****/
process.on('uncaughtException', function(err) {
    console.error(err.stack);
});

//default success/failure callbacks - useful for Dev
var success = function (data) {
    console.error('success', data);
};

var failure = function (data) {
    console.error('failure', data);
    res.send(500, 'Uh, oh. Something broke on the server!');
};
/***** /HANDLE Uncaught Exceptions *****/

/***** SETUP OAuth2.0 *****/
var oauth2Creds     = appCreds.get().OAuth2,
    oauth2Client    = new googleapis.OAuth2Client(oauth2Creds.CLIENT_ID, oauth2Creds.CLIENT_SECRET, oauth2Creds.REDIRECT_URL);

var grabToken = function (code, errorCallback, successCallback) {
    oauth2Client.getToken(code, function (err, tokens) {
        if (!!err) {
            errorCallback(err);
        } else {
            successCallback(tokens);
        }
    });
};

var getUser = function (_oauth2Client, errorCallback, successCallback) {
    googleapis
        .discover('oauth2', 'v2')
        .execute(function (err, client) {
            if (!!err) {
                errorCallback(err);
                return;
            }

            client
                .oauth2.userinfo.get()
                .withAuthClient(_oauth2Client)
                .execute(function(err, results){
                    if (!!err) {
                        errorCallback(err);
                    } else {
                        successCallback(results);
                    }
                });
        });
}
/***** /SETUP OAuth2.0 *****/

/***** SETUP AND START SERVER *****/
// configure the server
app.configure(function() {
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session(appCreds.get().sessionParams));
    app.use(express.static(__dirname + '/public'));
    app.use(express.errorHandler({
        dumpExceptions: true,
        showStack: true
    }));
    app.use(app.router);
});

// define manual route overrides
app.get('/login', function (req, res) {
    if ('credentials' in req.session && req.session.credentials != null) {
        res.redirect('/');
    } else {
        //if we don't have session credentials, go fetch them from Google
        var url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/glass.timeline'
        });
        res.redirect(url);
    }
});

app.get('/oauth2callback', function (req, res) {
    grabToken(req.query.code, failure, function (tokens) {
        req.session.credentials = tokens; //this will get store in a server-side session - http://stackoverflow.com/questions/14524774/expressjs-how-does-req-session-work
        res.redirect('/');
    });
});

app.get('/logout', function (req, res) {
    req.session.destroy();
    res.redirect('/');
});

app.get('/insertHello', function (req, res) {


    insertHello(failure, success);
    res.end();
});

//define API
app.get('/user', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    //return the user's profile
    if ('user' in req.session && req.session.user != null) {
        res.json({
            user: req.session.user
        });
    } else if ('credentials' in req.session && req.session.credentials != null) {
        oauth2Client.credentials = req.session.credentials; //apply credentials

        getUser(oauth2Client, failure, function (user) {
            req.session.user = user; //store the user in the current session

            //*** RETURN user's id ***//
            res.json({
                user: user
            });
        });
    } else {
        res.send(500, 'Authentication needed');
    }
});

app.get('/user/:id/preferences', function (req, res) {
    //return saved preferences for req.params.id
    if ('credentials' in req.session && req.session.credentials != null && 'user' in req.session && req.session.user.id === req.params.id) {
        try {
            var prefs = JSON.parse(localStorage.getItem(req.params.id));
            res.send(prefs || {});
        } catch (e) {
            res.send('Parsing error:', e);
        }
    } else {
        res.send(500, 'Authentication needed');
    }
});

app.post('/user/:id/preferences', function (req, res) {
    //update saved preferences for req.params.id
    if ('credentials' in req.session && req.session.credentials != null && 'user' in req.session && req.session.user.id === req.params.id) {
        var prefs = {
          id: req.params.id,
          freq: req.body.freq
        };

        try {
            localStorage.setItem(req.params.id, JSON.stringify(prefs));

            //**** CREATE SCHEDULER to insert news stories to Google Glass timeline ****//
                //TODO: move this code into a separate file...
                var perform = function (errorCallback, successCallback) {
                    googleapis
                        .discover('mirror', 'v1')
                        .execute(function (err, client) {
                            if (!!err)
                                errorCallback(err);
                            else
                                successCallback(client);
                        });
                };

                // send a simple news story timeline card with a delete option
                var insertStory = function (title, errorCallback, successCallback) {
                    oauth2Client.credentials = req.session.credentials; //apply credentials

                    perform(errorCallback, function(client) {
                        client
                            .mirror.timeline.insert(
                                {
                                    'text': title,
                                    'menuItems': [
                                        {'action': 'DELETE'}
                                    ]
                                }
                            )
                            .withAuthClient(oauth2Client)
                            .execute(function (err, data) {
                                if (!!err)
                                    errorCallback(err);
                                else
                                    successCallback(data);
                            });
                    });
                };

                //scheduler docs: https://github.com/mattpat/node-schedule
                var j = schedule.scheduleJob(prefs.freq, function() {
                    var url = 'http://ajax.googleapis.com/ajax/services/feed/load?v=2.0&q=http://www.theverge.com/rss/frontpage&num=1';

                    http.get(url, function(res) {
                        var response = '';
                        res.on('data', function (chunk) {
                            //another chunk of data has been recieved, so append it to `response`
                            response += chunk;
                        });
                        res.on('end', function () {
                            //the whole response has been recieved
                            try {
                                response = JSON.parse(response);
                                console.log('story', response.responseData.feed.entries[0].title);
                                insertHello(response.responseData.feed.entries[0].title,failure,success);
                            } catch(e) {
                                failure(e);
                            }
                        });
                    }).on('error', function(e) {
                        failure(e);
                    });
                });
            //**** /CREATE SCHEDULER to insert news stories to Google Glass timeline ****//

            res.send(prefs || {});
        } catch (e) {
            res.send('Saving error:', e);
        }
    } else {
        res.send(500, 'Authentication needed');
    }
});

// start the server
try {
    app.set('port', 8080);
    server.listen(app.get('port'));
    console.log('Server is listening on port: ' + app.get('port'));
} catch (err) {
    console.error('Server didn\'t start: \n' + err);
}
/***** /SETUP AND START SERVER ****/