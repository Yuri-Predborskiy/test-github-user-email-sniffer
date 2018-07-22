const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const config = require('./config/config'); // get our config file
const routes = require('./src/routes');

const app = express();

const port = config.port;

mongoose.connect(config.database, { useNewUrlParser: true }); // connect to database
app.set('superSecret', config.JWTSecret); // secret variable

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));

app.use('/', routes);

app.listen(port);
console.log(`App Runs on ${port}`);
