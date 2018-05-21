const express = require('express'),
    path = require('path'),
    ParseServer = require('parse-server').ParseServer,
    ParseDashboard = require('parse-dashboard');

const config = {
    appName: process.env.APP_ID,
    databaseURI: process.env.MONGODB_URI,
    appId: process.env.APP_ID,
    masterKey: process.env.MASTER_KEY,
    serverURL: process.env.SERVER_URL,
    publicServerURL: process.env.SERVER_URL,
    liveQuery: {
        classNames: ['Banner']
    },
    // logLevel: 'verbose',
    // enableAnonymousUsers: false,
    // classLevelPermissions: {
    //     find: {
    //         requiresAuthentication: false
    //     }
    // },
    // schemas: {
    //     Banner: {
    //         classLevelPermissions: {
    //             find: {
    //                 requiresAuthentication: false
    //             }
    //         }
    //     }
    // },
    apps: [
        {
            appName: process.env.APP_ID,
            appId: process.env.APP_ID,
            masterKey: process.env.MASTER_KEY,
            serverURL: process.env.SERVER_URL
        }
    ],
    users: [
        {
            user: process.env.DASHBOARD_USER || 'demo',
            pass: process.env.DASHBOARD_PASSWORD || 'demo'
        }
    ]
};

const app = express(),
    api = new ParseServer(config),
    dashboard = new ParseDashboard(config);

app.use('/api', api);
app.use('/parse-dashboard', dashboard);
app.use(express.static(__dirname + '/www'));
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname + '/www/index.html'));
});

const httpServer = require('http').createServer(app);
httpServer.listen(process.env.PORT || 8080, function () {
    console.log('System running on port ' + process.env.PORT || 8080 + '.');
});

ParseServer.createLiveQueryServer(httpServer);
