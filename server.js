const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const routes = require('./src/routes');

const app = express();

const port = process.env.PORT;

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true }); // connect to database

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static('public'));

// use morgan to log requests to the console
app.use(morgan('dev'));

app.use('/', routes);

app.listen(port);
console.log(`App Runs on ${port}`);
