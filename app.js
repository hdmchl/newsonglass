/*
 * @author: @hadi_michael
 * @date: April 2014
 */

/* include and setup required packages */
var appName         = 'NewsOnGlass',
    express         = require('express'),
    app             = express(),
    http            = require('http'),
    googleapis      = require('googleapis'),
    appCreds        = require('./server/appCredentials'), //see appCredentials__template.js
    LocalStorage    = require('node-localstorage').LocalStorage,
    localStorage    = new LocalStorage('./scratch'),
    glass           = require('./server/submodules/glass')(googleapis);

/***** CLEAR OUT ANY EXISTING LOCAL STORAGE *****/
/* localStorage API: https://www.npmjs.org/package/node-localstorage
    length
    setItem(key, value)
    getItem(key)
    removeItem(key)
    key(n)
    clear()
*/
localStorage.clear(); //you wouldn't do this if you wanted to preserve data on server restart
/***** /CLEAR OUT ANY EXISTING LOCAL STORAGE *****/

/***** HANDLE Uncaught Exceptions *****/
process.on('uncaughtException', function (err) {
    console.error(err.stack);
});

//default success/failure callbacks - useful for Dev
var success = function (data) {
    console.log('success', data);
};

var failure = function (data) {
    console.error('failure', data);
};
/***** /HANDLE Uncaught Exceptions *****/

/***** SETUP OAuth2.0 AUTHENTICATION *****/
var oauth2Creds     = appCreds.OAuth2,
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

// get the Google Account User - we need this to store/retrieve user preferences
var getUser = function (oauth2Client, errorCallback, successCallback) {
    googleapis
        .discover('oauth2', 'v2')
        .execute(function (err, client) {
            if (!!err) {
                errorCallback(err);
                return;
            }

            client
                .oauth2.userinfo.get()
                .withAuthClient(oauth2Client)
                .execute(function (err, results) {
                    if (!!err) {
                        errorCallback(err);
                    } else {
                        successCallback(results);
                    }
                });
        });
};

var authenticated = function(req) {
    return req.session.hasOwnProperty('credentials') && req.session.credentials && req.session.hasOwnProperty('user') && req.session.user.id === req.params.id;
};
/***** /SETUP OAuth2.0 AUTHENTICATION *****/

/***** SETUP AND START SERVER *****/
// configure the server
app.configure(function () {
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session(appCreds.sessionParams));
    app.use(express.static(__dirname + '/public'));
    app.use(express.errorHandler({
        dumpExceptions: true,
        showStack: true
    }));
    app.use(app.router);
});

// ROUTES: define manual route overrides
app.get('/login', function (req, res) {
    if (req.session.hasOwnProperty('credentials') && req.session.credentials) {
        res.redirect('/#/mynews');
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
        res.redirect('/#/mynews');
    });
});

app.get('/logout', function (req, res) {
    req.session.destroy();
    res.redirect('/');
});

// API: define accessible API
app.get('/user', function (req, res) {
    //return the user's profile
    if (req.session.hasOwnProperty('user') && req.session.user) {
        res.json({
            user: req.session.user
        });
        return;
    }

    if (req.session.hasOwnProperty('credentials') && req.session.credentials) {
        oauth2Client.credentials = req.session.credentials; //apply credentials to session

        getUser(oauth2Client, failure, function (user) {
            req.session.user = user; //store the user in the current session

            res.json({
                user: user
            });
        });
    } else {
        res.send(401, 'Authorization needed');
    }
});

app.get('/user/:id/preferences', function (req, res) {
    //return saved preferences for req.params.id
    if (authenticated(req)) {
        try {
            //TODO: temporarily create the model manually, ideally we would build this using the model
            var prefsModel = require('./server/models/preferences')(),
                prefs = JSON.parse(localStorage.getItem(req.params.id));
            res.json(prefs || prefsModel);
        } catch (err) {
            res.send(500, 'JSON parsing error:', err);
        }
    } else {
        res.send(401, 'Authorization needed');
    }
});

app.post('/user/:id/preferences', function (req, res) {
    //update saved preferences for req.params.id
    if (authenticated(req)) {
        if (!req.body.hasOwnProperty('freq')) { //TODO: extend to accept 'topics'
            res.send(400, 'Need preferences in POST');
            return;
        }

        //TODO: temporarily create the model manually, ideally we would build this using the model
        var prefs = {
            id: req.params.id,
            freq: req.body.freq,
            topics: req.body.topics
        };

        try {
            localStorage.setItem(req.params.id, JSON.stringify(prefs)); //store prefs

            oauth2Client.credentials = req.session.credentials; //apply credentials to object

            // CREATE SCHEDULER to insert news stories to Google Glass timeline
            var scheduler = require('./server/submodules/scheduler')(http, glass, oauth2Client);
            scheduler.scheduleNewsWithPrefs(prefs, failure, function () {
                res.json(prefs);
            });
        } catch (err) {
            res.send(500, 'Saving error:', err);
        }
    } else {
        res.send(401, 'Authorization needed');
    }
});

app.get('/user/:id/insert/:preset', function (req, res) {
    if (authenticated(req)) {
        oauth2Client.credentials = req.session.credentials; //apply credentials to session

        if (req.params.preset === 'location') {
            glass.insertLocation(oauth2Client,failure,success);
            res.send(200, 'Trying to insert location');
            return;
        }

        if (req.params.preset === 'contact') {
            glass.insertContact(oauth2Client,failure,success);
            res.send(200, 'Trying to insert contact');
            return;
        }

        if (!!req.query.timelineObj) {
            glass.insert(oauth2Client,req.query.timelineObj,failure,success);
            res.send(200, 'Trying to insert timeline object: ' + JSON.stringify(req.query.timelineObj));
            return;
        }

        res.send(400, 'Need text');
    } else {
        res.send(401, 'Authorization needed');
    }
});

app.get('/user/:id/listTimeline', function (req, res) {
    if (authenticated(req)) {
        oauth2Client.credentials = req.session.credentials; //apply credentials to session

        glass.listTimeline(oauth2Client,failure, function(timeline) {
            console.log(timeline);
            res.send(200, 'Timeline: ' + JSON.stringify(timeline));
        });
    } else {
        res.send(401, 'Authorization needed');
    }
});

// start the server
try {
    app.set('port', (process.env.PORT || 8080));
    app.listen(app.get('port'), function() {
        console.log('Server is listening on port: ' + app.get('port'));
    });
} catch (err) {
    console.error('Server didn\'t start: \n' + err);
}
/***** /SETUP AND START SERVER ****/
