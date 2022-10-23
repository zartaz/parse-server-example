require('dotenv').config();
const rateLimit = require('express-rate-limit');
const express = require('express');
const ParseServer = require('parse-server').ParseServer;
const ParseDashboard = require('parse-dashboard');
const path = require('path');
const args = process.argv || [];
const test = args.some(arg => arg.includes('jasmine'));
const databaseUri = process.env.DB_URI;
if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}
const config = {
  databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'myAppId',
  masterKey: process.env.MASTER_KEY || '', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse', // Don't forget to change to https if needed
  liveQuery: {
    classNames: ['Posts', 'Comments'], // List of classes to support for query subscriptions
  }
};
const options = {
  allowInsecureHTTP: true,
};
const parseConfig = {
  "apps": [
    {
      "serverURL": process.env.SERVER_URL,
      "appId": process.env.APP_ID,
      "masterKey": process.env.MASTER_KEY,
      "appName": process.env.APP_NAME
    }
  ],
  "users": [
    {
      "user": process.env.APP_USER,
      "pass": process.env.APP_PASS
    }
  ]

};
const app = express();
const sendMessageRateLimiterMiddleware = rateLimit({
  windowsMs: 60 * 1000 * 15,
  max: 5,
  message: 'You have exceeded 5 false password attempts, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});


app.use('/public', express.static(path.join(__dirname, '/public')));
app.use('/parse/functions/login', sendMessageRateLimiterMiddleware);


const mountPath = process.env.PARSE_MOUNT || '/parse';
if (!test) {
  const api = new ParseServer(config);
  const dashboard = new ParseDashboard(parseConfig, options);
  app.use(mountPath, api);
  app.use('/dashboard', dashboard);
}


app.get('/', function (req, res) {
  res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
});


app.get('/test', function (req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

const port = process.env.SERVER_PORT || 1337;
if (!test) {
  const httpServer = require('http').createServer(app);
  httpServer.listen(port, function () {
    console.log('parse-server-example running on port ' + port + '.');
  });
  // This will enable the Live Query real-time server
  ParseServer.createLiveQueryServer(httpServer);
}

module.exports = {
  app,
  config,
};
