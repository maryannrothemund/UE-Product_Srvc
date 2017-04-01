/**
 * Created by borzou on 9/27/16.
 */
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var swagger = require('tbe-swagger2-express');
var fs = require('fs');
var app = express();
var moment = require('moment');
var routes = require('./routes/index');
var api = require('./routes/api');
var config = require('./config');
var hDomain = (process.env.HOST_DOMAIN) ? process.env.HOST_DOMAIN : config.swaggerDomain;
console.log("Informing Swagger client of host domain: "+hDomain);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
if(process.env.NODE_ENV==='production')app.use(logger('tiny'));
else app.use(logger('dev'));
app.use(bodyParser.json({limit: '1mb'}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('views'));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, HEAD, POST, DELETE, PUT, PATCH, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, api_key, Authorization");
    next();
});

app.use(swagger.init(app, {
    apiVersion: '1.0',
    swaggerVersion: '2.0',
    host: hDomain,
    basePath: '/api',
    swaggerURL: '/docs',
    swaggerJSON: '/api-docs',
    swaggerUI: './public/swagger',
    schemes: ['http'],
    info: {
        version: '1.0.0',
        title: 'United Effects Product Authorization',
        description: 'UE Product registers products to have licenses and users registered against. All endpoints require ADMIN access.'
    },
    tags: [
        {
            name: "Health",
            description: "Logs and Health"
        },
        {
            name: "Product Management",
            description: "New Products"
        },
        {
            name: "Validate",
            description: "Validate a Access"
        }
    ],
    securityDefinitions: {
        "api_key": {
            "type": "apiKey",
            "name": "api_key",
            "in": "header"
        }
    },
    paths: ['./services/yaml/api.yml']
}));

app.use('/', routes);
app.use('/api', api);


 // catch 404 and forward to error handler
app.use(function(req, res, next) {
 var err = new Error('Not Found');
 err.status = 404;
 next(err);
});

// error handlers
// will print stacktrace
if (process.env.NODE_ENV != 'production') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var uncaught = 0;

process.on('uncaughtException', function(err) {
    uncaught++;
    if(uncaught < 20) {
        console.log(" UNCAUGHT EXCEPTION - Uncaught #: "+uncaught+". Notifications will stop after 20 exceptions. Restart this container after that.");
        console.log("[Inside 'uncaughtException' event] " + err.stack || err.message);
    }else process.exit(1);
});

module.exports = app;