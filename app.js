var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var helmet = require('helmet');
var morgan = require('morgan');

var indexRouter = require('./routes/index');

var app = express();

//CORS Middleware
app.use(function (req, res, next) {
    //Enabling CORS
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization');
    next();
});

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cors());
app.use(morgan('combined'));
app.use(express.static(__dirname + "/front"));
app.use(express.static(__dirname + '/images/profile'));
app.use(express.static(__dirname + '/images/gallery'));
app.use(express.static(__dirname + '/images/otherContacts'));
app.use('/api', indexRouter);

module.exports = app;
